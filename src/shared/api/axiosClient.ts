import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, LoginResponse, UserProfile } from '../../features/auth/types/auth.types';

// ==========================================
// 1. CẤU HÌNH CƠ BẢN
// ==========================================
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// In-memory access token để chống XSS (không lưu token nhạy cảm trong localStorage)
let memoryAccessToken: string | null = null;

export const getAccessToken = (): string | null => memoryAccessToken;
export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
};

// Interface cho hàng đợi request bị 401 khi đang refresh token
interface FailedQueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

// Xử lý xả hàng đợi khi refresh token hoàn tất hoặc thất bại
const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else if (token) {
      item.resolve(token);
    }
  });
  failedQueue = [];
};

// Event listeners kết nối giữa Axios Interceptor và React AuthContext
export interface AuthInterceptorListeners {
  onSessionRefreshed?: (newToken: string, user: UserProfile) => void;
  onSessionExpired?: () => void;
}

let authListeners: AuthInterceptorListeners = {};

export const setAuthInterceptorListeners = (listeners: AuthInterceptorListeners): void => {
  authListeners = listeners;
};

// Instance axios riêng biệt để gọi refresh, tránh kích hoạt interceptor vô hạn
export const rawAuthClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // BẮT BUỘC để trình duyệt tự gửi/nhận cookie refreshToken
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 2. MAIN AXIOS CLIENT CHO TOÀN ỨNG DỤNG
// ==========================================
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // BẮT BUỘC: Mọi request đều gửi kèm cookie HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 3. REQUEST INTERCEPTOR: Gắn Bearer Token
// ==========================================
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (memoryAccessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${memoryAccessToken}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error)
);

// ==========================================
// 4. RESPONSE INTERCEPTOR: Mutex Refresh Queue
// ==========================================
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Nếu không có response hoặc không phải request hợp lệ thì reject ngay
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const { status, config } = error.response;
    const requestUrl = config.url || '';

    // KHÔNG refresh nếu lỗi 401 đến từ các API xác thực khởi tạo/đổi mật khẩu/refresh
    const bypassRefreshUrls = [
      '/api/auth/login',
      '/api/auth/refresh',
      '/api/auth/oauth2/exchange',
      '/api/auth/register',
    ];
    const isBypassUrl = bypassRefreshUrls.some((url) => requestUrl.includes(url));

    // Xử lý lỗi 401 Unauthorized
    if (status === 401 && !originalRequest._retry && !isBypassUrl) {
      // Trường hợp 1: Đang có một request khác thực hiện refresh -> Xếp vào hàng đợi
      if (isRefreshing) {
        return new Promise<unknown>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers || {};
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      // Trường hợp 2: Là request đầu tiên bị 401 -> Giữ cờ Mutex và gọi API Refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await rawAuthClient.post<ApiResponse<LoginResponse>>(
          '/api/auth/refresh'
        );

        const newLoginData = refreshResponse.data.data;
        const newAccessToken = newLoginData.accessToken;

        // Lưu accessToken mới vào memory
        setAccessToken(newAccessToken);

        // Báo cho AuthContext đồng bộ state user
        if (authListeners.onSessionRefreshed) {
          authListeners.onSessionRefreshed(newAccessToken, newLoginData);
        }

        // Xả hàng đợi: Retry tất cả các request đang chờ với token mới
        processQueue(null, newAccessToken);

        // Gán token mới cho chính request ban đầu và retry
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        // Refresh thất bại (Refresh token trong cookie đã hết hạn hoặc bị thu hồi)
        processQueue(refreshError, null);
        setAccessToken(null);

        // Báo cho AuthContext xóa state và điều hướng về trang Login
        if (authListeners.onSessionExpired) {
          authListeners.onSessionExpired();
        } else {
          // Fallback nếu listener chưa kịp mount
          if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
