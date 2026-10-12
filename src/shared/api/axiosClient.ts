import axios, {
  type AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import type { ApiResponse, LoginResponse, RefreshTokenReq, UserProfile } from '../../features/auth/types/auth.types';

// ==========================================
// 1. CẤU HÌNH CƠ BẢN & QUẢN LÝ TOKEN TRONG BỘ NHỚ
// ==========================================
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// In-memory token để chống XSS (không lưu token nhạy cảm trong localStorage)
let memoryAccessToken: string | null = null;
let memoryRefreshToken: string | null = null;

export const getAccessToken = (): string | null => memoryAccessToken;
export const setAccessToken = (token: string | null): void => {
  memoryAccessToken = token;
};

export const getRefreshToken = (): string | null => memoryRefreshToken;
export const setRefreshToken = (token: string | null): void => {
  memoryRefreshToken = token;
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

// ==========================================
// 2. RAW AUTH CLIENT (DÀNH RIÊNG CHO REFRESH & AUTH KHỞI TẠO)
// Không gắn interceptor response để tránh nguy cơ loop vô hạn
// ==========================================
export const rawAuthClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // BẮT BUỘC: Đính kèm Cookie HttpOnly (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 3. MAIN AXIOS CLIENT CHO TOÀN ỨNG DỤNG
// ==========================================
export const axiosClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  withCredentials: true, // Gửi cookie xuyên suốt phiên làm việc
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// 4. REQUEST INTERCEPTOR: Tự động đính kèm Access Token
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

let refreshPromise: Promise<string> | null = null;

export const executeRefreshToken = (): Promise<string> => {
  // Nếu đang có một tiến trình refresh chạy dở -> Tái sử dụng cùng một Promise
  if (refreshPromise) {
    return refreshPromise;
  }

  // Ưu tiên gửi refresh token qua body nếu có trong memory, kèm HttpOnly cookie tự động
  const body: RefreshTokenReq = memoryRefreshToken ? { refreshToken: memoryRefreshToken } : {};

  // Luôn gọi refresh bằng POST và đính kèm withCredentials: true
  refreshPromise = rawAuthClient
    .post<ApiResponse<LoginResponse>>('/api/auth/refresh', body)
    .then((response) => {
      const loginData = response.data.data;
      const newAccessToken = loginData.accessToken;

      // Lưu access token và refresh token mới (nếu backend cấp token mới trong body)
      setAccessToken(newAccessToken);
      if (loginData.refreshToken) {
        setRefreshToken(loginData.refreshToken);
      }

      // Thông báo cho AuthContext đồng bộ state User
      if (authListeners.onSessionRefreshed) {
        authListeners.onSessionRefreshed(newAccessToken, loginData);
      }

      return newAccessToken;
    })
    .catch((error: unknown) => {
      // Refresh thất bại (AUTH.INVALID_REFRESH_TOKEN hoặc 401/403)
      setAccessToken(null);
      setRefreshToken(null);

      // Thông báo AuthContext dọn dẹp phiên và chuyển hướng về /login
      if (authListeners.onSessionExpired) {
        authListeners.onSessionExpired();
      } else if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }

      return Promise.reject(error);
    })
    .finally(() => {
      // Giải phóng Promise sau khi hoàn tất để các lượt 401 tương lai có thể tạo refresh mới
      refreshPromise = null;
    });

  return refreshPromise;
};

// ==========================================
// 6. RESPONSE INTERCEPTOR: Tự động bắt lỗi 401 & Retry
// ==========================================
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as CustomAxiosRequestConfig | undefined;

    // Không có response hoặc config hợp lệ -> reject ngay
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const { status, config } = error.response;
    const requestUrl = config.url || '';

    // Danh sách URL ngoại lệ: Không kích hoạt refresh nếu chính các API xác thực bị 401
    const bypassRefreshUrls = [
      '/api/auth/login',
      '/api/auth/refresh',
      '/api/auth/oauth2/exchange',
      '/api/auth/register',
    ];
    const isBypassUrl = bypassRefreshUrls.some((url) => requestUrl.includes(url));

    // Xử lý 401: Chỉ can thiệp nếu chưa retry lần nào và không thuộc bypass list
    if (status === 401 && !originalRequest._retry && !isBypassUrl) {
      originalRequest._retry = true; // Đánh dấu đã retry để chống loop vô hạn

      try {
        // Chờ kết quả từ Shared Promise (tất cả các request 401 đồng thời đều đợi chung promise này)
        const newAccessToken = await executeRefreshToken();

        // Gán Bearer Token mới vào request ban đầu và gửi lại
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;

