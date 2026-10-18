import axiosClient, { API_BASE_URL, getRefreshToken, rawAuthClient } from '../shared/api/axiosClient';
import type {
  ApiResponse,
  ChangePasswordReq,
  CreateUserReq,
  ForgotPasswordReq,
  LoginReq,
  LoginResponse,
  OAuth2ExchangeRequest,
  RefreshTokenReq,
  RegisterResponse,
  ResetPasswordReq,
  VerifyForgotPasswordOtpReq,
  VerifyForgotPasswordOtpResponse,
  VerifyOtpReq,
} from '../types/auth.types';

/**
 * URL chuyển hướng sang Google OAuth2 Backend
 */
export const getGoogleOAuth2Url = (): string => {
  return `${API_BASE_URL}/oauth2/authorization/google`;
};

/**
 * Auth API Service Modules
 */
export const authApi = {
  /**
   * API Đăng ký tài khoản mới: POST /api/auth/register
   * @param data CreateUserReq { username, email, phone, password }
   * @returns ApiResponse<RegisterResponse>
   */
  register: async (data: CreateUserReq): Promise<ApiResponse<RegisterResponse>> => {
    const res = await axiosClient.post<ApiResponse<RegisterResponse>>('/api/auth/register', data);
    return res.data;
  },

  /**
   * API Xác thực mã OTP: POST /api/auth/verify-otp
   * @param data VerifyOtpReq { email, otp }
   * @returns ApiResponse<null | void>
   */
  verifyOtp: async (data: VerifyOtpReq): Promise<ApiResponse<null | void>> => {
    const res = await axiosClient.post<ApiResponse<null | void>>('/api/auth/verify-otp', data);
    return res.data;
  },

  /**
   * API Đăng nhập thông thường (Email + Password): POST /api/auth/login
   */
  login: async (data: LoginReq): Promise<ApiResponse<LoginResponse>> => {
    const res = await axiosClient.post<ApiResponse<LoginResponse>>('/api/auth/login', data);
    return res.data;
  },

  /**
   * Làm mới Access Token (Silent Refresh): POST /api/auth/refresh
   */
  refresh: async (refreshToken?: string): Promise<ApiResponse<LoginResponse>> => {
    const token = refreshToken || getRefreshToken() || undefined;
    const body: RefreshTokenReq = token ? { refreshToken: token } : {};
    const res = await rawAuthClient.post<ApiResponse<LoginResponse>>('/api/auth/refresh', body);
    return res.data;
  },

  /**
   * Đăng xuất: POST /api/auth/logout
   */
  logout: async (): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/logout');
    return res.data;
  },

  /**
   * Đổi mã Google OAuth2: POST /api/auth/oauth2/exchange
   */
  exchangeOAuth2Code: async (data: OAuth2ExchangeRequest): Promise<ApiResponse<LoginResponse>> => {
    const res = await axiosClient.post<ApiResponse<LoginResponse>>('/api/auth/oauth2/exchange', data);
    return res.data;
  },

  /**
   * Quên mật khẩu - gửi OTP: POST /api/auth/forgot-password
   */
  forgotPassword: async (data: ForgotPasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/forgot-password', data);
    return res.data;
  },

  /**
   * Quên mật khẩu - xác thực OTP: POST /api/auth/verify-forgot-password-otp
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
   * Đặt lại mật khẩu mới: POST /api/auth/reset-password
   */
  resetPassword: async (data: ResetPasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/reset-password', data);
    return res.data;
  },

  /**
   * Đổi mật khẩu: POST /api/auth/change-password
   */
  changePassword: async (data: ChangePasswordReq): Promise<ApiResponse<void>> => {
    const res = await axiosClient.post<ApiResponse<void>>('/api/auth/change-password', data);
    return res.data;
  },
};

export default authApi;
