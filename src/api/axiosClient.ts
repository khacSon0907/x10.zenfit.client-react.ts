import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, UserProfile } from '../types/auth';

/**
 * ============================================================================
 * CẤU HÌNH AXIOS CLIENT & CƠ CHẾ REFRESH TOKEN TỰ ĐỘNG (QUEUE PATTERN)
 * ============================================================================
 * - Base URL: Đọc từ biến môi trường VITE_API_BASE_URL (mặc định http://localhost:8080)
 * - withCredentials: true (BẮT BUỘC để browser tự động gửi và nhận HTTP-only Cookie refreshToken)
 * - Quản lý Access Token trong bộ nhớ RAM (In-Memory) để triệt tiêu lỗ hổng XSS
 * - Refresh Token Queue: Chống race condition khi nhiều request 401 xảy ra đồng thời
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ============================================================================
// 1. QUẢN LÝ ACCESS TOKEN TRONG BỘ NHỚ RAM (IN-MEMORY TOKEN)
// ============================================================================
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null; // Tùy chọn fallback nếu cần

export const getAccessToken = (): string | null => memoryAccessToken;
export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
};

export const getRefreshToken = (): string | null => memoryRefreshToken;
export const setRefreshToken = (token: string | null): void => {
  memoryRefreshToken = token;
};

/**
 * Event Listeners giúp Axios Interceptor giao tiếp 2 chiều với AuthContext
 */
export interface AuthInterceptorListeners {
  onSessionRefreshed?: (newToken: string, user: UserProfile) => void;
  onSessionExpired?: () => void;
}

let authListeners: AuthInterceptorListeners = {};

export const setAuthInterceptorListeners = (listeners: AuthInterceptorListeners): void => {
  authListeners = listeners;
};

// ============================================================================
// 2. RAW AUTH CLIENT (DÙNG RIÊNG ĐỂ GỌI REFRESH TOKEN)
// Tách biệt hoàn toàn để không đi qua Response Interceptor, tránh nguy cơ Loop 401 vô hạn
// ============================================================================
export const rawAuthClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Gửi kèm HTTP-only cookie refreshToken
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// 3. MAIN AXIOS CLIENT CHO TOÀN BỘ ỨNG DỤNG
// ============================================================================
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // BẮT BUỘC: Gửi cookie refreshToken xuyên suốt mọi request
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================================
// 4. REQUEST INTERCEPTOR: Tự động đính kèm Bearer Token
// ============================================================================
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Nếu trong bộ nhớ RAM đang có accessToken -> gắn vào header Authorization
    if (memoryAccessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ============================================================================
// 5. CƠ CHẾ REFRESH TOKEN VỚI HÀNG ĐỢI FAILED QUEUE
// ============================================================================
interface QueuedPromise {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: QueuedPromise[] = [];

/**
 * Xử lý hàng đợi: Khi refresh thành công hoặc thất bại, giải phóng toàn bộ request chờ
 */
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Thực hiện gọi API Refresh Token tới Backend
 * Backend ưu tiên đọc từ HTTP-only Cookie 'refreshToken'
 */
export const executeRefreshToken = async (): Promise<string> => {
  try {
    // Body gửi kèm rỗng hoặc fallback token (nếu có), cookie đã được withCredentials gửi tự động
    const body = memoryRefreshToken ? { refreshToken: memoryRefreshToken } : {};
    const response = await rawAuthClient.post<ApiResponse<UserProfile>>('/api/auth/refresh', body);
    
    const userProfile = response.data.data;
    const newAccessToken = userProfile.accessToken;

    // Cập nhật accessToken mới vào RAM
    setAccessToken(newAccessToken);

    // Đồng bộ lại AuthContext
    if (authListeners.onSessionRefreshed) {
      authListeners.onSessionRefreshed(newAccessToken, userProfile);
    }

    return newAccessToken;
  } catch (error) {
    // Refresh thất bại: xóa sạch session
    setAccessToken(null);
    setRefreshToken(null);

    if (authListeners.onSessionExpired) {
      authListeners.onSessionExpired();
    }

    return Promise.reject(error);
  }
};

// ============================================================================
// 6. RESPONSE INTERCEPTOR: Tự động bắt mã HTTP 401 & Refresh Token
// ============================================================================
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Nếu không có response hoặc config hợp lệ -> reject ngay
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const { status, config } = error.response;
    const requestUrl = config.url || '';

    // Danh sách các API không bao giờ kích hoạt refresh khi bị 401 (để tránh lặp vô tận)
    const bypassRefreshUrls = [
      '/api/auth/login',
      '/api/auth/refresh',
      '/api/auth/oauth2/exchange',
      '/api/auth/register',
      '/api/auth/logout',
    ];
    const isBypassUrl = bypassRefreshUrls.some((url) => requestUrl.includes(url));

    // Bắt mã 401 Unauthorized
    if (status === 401 && !originalRequest._retry && !isBypassUrl) {
      // Nếu đang trong quá trình refresh token -> đưa request này vào hàng đợi chờ
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Đánh dấu đã retry 1 lần để ngăn lặp vô tận
      originalRequest._retry = true;
      isRefreshing = true;

      return new Promise((resolve, reject) => {
        executeRefreshToken()
          .then((newAccessToken) => {
            // Giải phóng hàng đợi với token mới
            processQueue(null, newAccessToken);

            // Gán token mới vào request ban đầu và thực hiện lại
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(axiosClient(originalRequest));
          })
          .catch((refreshError) => {
            // Refresh thất bại -> giải phóng hàng đợi với lỗi
            processQueue(refreshError, null);

            // Điều hướng người dùng về trang đăng nhập nếu chưa ở /login
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
              window.location.href = '/login';
            }
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
