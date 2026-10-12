/**
 * Contract DTOs & API Specifications for Authentication
 * Matches 100% with Spring Boot Backend DTOs & Responses
 */

// Định dạng chuẩn BaseResponse thành công từ Backend
export interface ApiResponse<T> {
  type: string;
  title: string;
  status: number;
  code: string;
  message: string;
  data: T;
  path?: string;
  traceId?: string;
  timestamp?: string;
}

// Định dạng chuẩn ErrorResponse khi thất bại từ Backend
export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  code: string;
  message: string;
  detail?: Record<string, unknown>;
  path?: string;
  traceId?: string;
  timestamp?: string;
}

// User & Login Types
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roleIds: string[];
  roles: string[]; // Ví dụ: ["ROLE_USER"] hoặc ["ROLE_ADMIN", "ROLE_STAFF"]
  name?: string;  // Tùy chọn hiển thị tên thân thiện cho UI (fallback username)
}

export interface LoginResponse extends UserProfile {
  accessToken: string;
}

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  requiresOtp: boolean;
}

// Request Types
export interface LoginReq {
  email: string;
  password: string;
}

export interface RegisterReq {
  username: string;
  email: string;
  password: string;
}

export interface VerifyOtpReq {
  email: string;
  otp: string;
}

export interface ForgotPasswordReq {
  email: string;
}

export interface VerifyForgotPasswordOtpReq {
  email: string;
  otp: string;
}

export interface VerifyForgotPasswordOtpResponse {
  resetToken: string;
}

export interface ResetPasswordReq {
  email: string;
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordReq {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface OAuth2ExchangeRequest {
  code: string;
}

// Danh sách Error Codes chuẩn từ Backend
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH.INVALID_CREDENTIALS',
  USER_NOT_ACTIVE: 'AUTH.USER_NOT_ACTIVE',
  EMAIL_NOT_VERIFIED: 'AUTH.EMAIL_NOT_VERIFIED',
  LOGIN_LOCKED: 'AUTH.LOGIN_LOCKED',
  RATE_LIMIT_EXCEEDED: 'AUTH.RATE_LIMIT_EXCEEDED',
  INVALID_OTP: 'AUTH.INVALID_OTP',
  GOOGLE_ACCOUNT_LOGIN_REQUIRED: 'AUTH.GOOGLE_ACCOUNT_LOGIN_REQUIRED',
} as const;

export type AuthErrorCodeType = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
