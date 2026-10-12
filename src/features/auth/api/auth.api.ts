import axiosClient, { API_BASE_URL, rawAuthClient } from '../../../shared/api/axiosClient';
import type {
  ApiResponse,
  ChangePasswordReq,
  ForgotPasswordReq,
  LoginReq,
  LoginResponse,
  OAuth2ExchangeRequest,
  RegisterReq,
  RegisterResponse,
  ResetPasswordReq,
  VerifyForgotPasswordOtpReq,
  VerifyForgotPasswordOtpResponse,
  VerifyOtpReq,
} from '../types/auth.types';

/**
 * Endpoint điều hướng trực tiếp sang Google OAuth2 của Spring Boot Backend
 */
export const getGoogleOAuth2Url = (): string => {
  return `${API_BASE_URL}/oauth2/authorization/google`;
};

export const authApi = {
  /**
   * Đăng nhập thông thường (Email + Password)
   * Trả về accessToken trong body và cookie HttpOnly refreshToken tự động set bởi BE
   */
  login: async (data: LoginReq): Promise<ApiResponse<LoginResponse>> => {
    const res = await axiosClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
    return res.data;
  },

  /**
   * Đăng ký tài khoản mới
   * Nếu requiresOtp = true -> FE điều hướng sang màn hình /verify-otp
   */
  register: async (data: RegisterReq): Promise<ApiResponse<RegisterResponse>> => {
    const res = await axiosClient.post<ApiResponse<RegisterResponse>>('/api/auth/register', data);
    return res.data;
  },

  /**
   * Xác thực mã OTP sau khi đăng ký tài khoản
   */
  verifyOtp: async (data: VerifyOtpReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/verify-otp', data);
    return res.data;
  },

  /**
   * Làm mới Access Token (Silent Refresh) sử dụng HttpOnly Cookie refreshToken
   * Dùng rawAuthClient để tránh loop interceptor
   */
  refresh: async (): Promise<ApiResponse<LoginResponse>> => {
    const res = await rawAuthClient.post<ApiResponse<LoginResponse>>('/api/auth/refresh');
    return res.data;
  },

  /**
   * Đăng xuất: Blacklist accessToken trong Redis và xóa cookie refreshToken
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/logout');
    return res.data;
  },

  /**
   * Đổi mã tạm thời (one-time code) sau khi Google OAuth2 callback thành công
   */
  exchangeOAuth2Code: async (data: OAuth2ExchangeRequest): Promise<ApiResponse<LoginResponse>> => {
    const res = await axiosClient.post<ApiResponse<LoginResponse>>('/api/auth/oauth2/exchange', data);
    return res.data;
  },

  /**
   * Quên mật khẩu - Bước 1: Gửi yêu cầu OTP đến email
   */
  forgotPassword: async (data: ForgotPasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/forgot-password', data);
    return res.data;
  },

  /**
   * Quên mật khẩu - Bước 2: Xác thực OTP để nhận resetToken
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
   * Quên mật khẩu - Bước 3: Đặt lại mật khẩu mới với resetToken
   */
  resetPassword: async (data: ResetPasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/reset-password', data);
    return res.data;
  },

  /**
   * Đổi mật khẩu trong trang Profile (yêu cầu Authorization Bearer)
   */
  changePassword: async (data: ChangePasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/change-password', data);
    return res.data;
  },
};

export default authApi;
