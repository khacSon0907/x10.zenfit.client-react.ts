import axiosClient, { API_BASE_URL, rawAuthClient } from './axiosClient';
import type {
  ApiResponse,
  ChangePasswordReq,
  CreateUserReq,
  ForgotPasswordReq,
  LoginRequest,
  OAuth2ExchangeRequest,
  RegisterResponse,
  ResetPasswordReq,
  UserProfile,
  VerifyForgotPasswordOtpReq,
  VerifyForgotPasswordOtpResponse,
  VerifyOtpReq,
} from '../types/auth';

/**
 * Đường dẫn kích hoạt luồng đăng nhập Google OAuth2 qua Backend
 * Backend chuyển tiếp người dùng đến Google Consent Screen
 */
export const getGoogleOAuth2Url = (): string => {
  return `${API_BASE_URL}/oauth2/authorization/google`;
};

/**
 * ============================================================================
 * AUTH API SERVICE
 * Tích hợp toàn bộ endpoint xác thực theo chuẩn Spring Boot Backend
 * ============================================================================
 */
export const authApi = {
  /**
   * 1. Đăng nhập Email/Password
   * POST /api/auth/login
   * @param data { email, password }
   * @returns ApiResponse<UserProfile> (chứa accessToken và thông tin tài khoản, refreshToken nằm trong Cookie HttpOnly)
   */
  login: async (data: LoginRequest): Promise<ApiResponse<UserProfile>> => {
    const res = await axiosClient.post<ApiResponse<UserProfile>>('/api/auth/login', data);
    return res.data;
  },

  /**
   * 2. Đổi mã tạm thời Google OAuth2 (Temporary Code Exchange)
   * POST /api/auth/oauth2/exchange
   * @param code Mã tạm thời nhận từ query param của URL callback: /oauth2/success?code=...
   * @returns ApiResponse<UserProfile>
   */
  exchangeOAuth2Code: async (code: string | OAuth2ExchangeRequest): Promise<ApiResponse<UserProfile>> => {
    const payload = typeof code === 'string' ? { code } : code;
    const res = await axiosClient.post<ApiResponse<UserProfile>>('/api/auth/oauth2/exchange', payload);
    return res.data;
  },

  /**
   * 3. Làm mới Access Token (Refresh Token)
   * POST /api/auth/refresh
   * Backend đọc refreshToken từ Cookie HttpOnly (với withCredentials: true)
   * Sử dụng rawAuthClient để tránh loop 401
   * @returns ApiResponse<UserProfile> (cấp accessToken mới)
   */
  refreshToken: async (): Promise<ApiResponse<UserProfile>> => {
    const res = await rawAuthClient.post<ApiResponse<UserProfile>>('/api/auth/refresh', {});
    return res.data;
  },

  /**
   * 4. Đăng xuất tài khoản
   * POST /api/auth/logout
   * Xóa cookie refreshToken và thu hồi phiên trên Backend
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/logout');
    return res.data;
  },

  /**
   * 5. Đăng ký tài khoản người dùng mới: POST /api/auth/register
   */
  register: async (data: CreateUserReq): Promise<ApiResponse<RegisterResponse>> => {
    const res = await axiosClient.post<ApiResponse<RegisterResponse>>('/api/auth/register', data);
    return res.data;
  },

  /**
   * 6. Xác thực mã OTP kích hoạt tài khoản: POST /api/auth/verify-otp
   */
  verifyOtp: async (data: VerifyOtpReq): Promise<ApiResponse<null | void>> => {
    const res = await axiosClient.post<ApiResponse<null | void>>('/api/auth/verify-otp', data);
    return res.data;
  },

  /**
   * 7. Quên mật khẩu - gửi yêu cầu: POST /api/auth/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/forgot-password', data);
    return res.data;
  },

  /**
   * 8. Xác thực OTP quên mật khẩu: POST /api/auth/verify-forgot-password-otp
   */
  verifyForgotPasswordOtp: async (
    data: VerifyForgotPasswordOtpReq
  ): Promise<ApiResponse<VerifyForgotPasswordOtpResponse>> => {
    const res = await axiosClient.post<ApiResponse<VerifyForgotPasswordOtpResponse>>(
      '/api/auth/verify-forgot-password-otp',
      data
    );
    return res.data;
  },

  /**
   * 9. Đặt lại mật khẩu mới: POST /api/auth/reset-password
   */
  resetPassword: async (data: ResetPasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/reset-password', data);
    return res.data;
  },

  /**
   * 10. Đổi mật khẩu: POST /api/auth/change-password
   */
  changePassword: async (data: ChangePasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/change-password', data);
    return res.data;
  },
};

export default authApi;
