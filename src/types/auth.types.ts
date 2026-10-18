/**
 * Contract DTOs & API Specifications for Authentication
 * Matches 100% with Spring Boot Backend DTOs & Responses
 */

// Định dạng chuẩn ApiResponse từ Backend Spring Boot
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

// Định dạng chuẩn ErrorResponse khi Backend trả về lỗi
export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  code: string;
  message: string;
  detail?: Record<string, string[] | string>;
  errors?: Array<{ field: string; message: string }>;
  path?: string;
  traceId?: string;
  timestamp?: string;
}

// DTO Yêu cầu đăng ký tài khoản (Register / Create User)
export interface CreateUserReq {
  username: string; // 3-30 ký tự, regex: ^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$
  email: string;    // email hợp lệ, max 100 ký tự
  phone: string;    // SĐT VN: ^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-9]|9\d)\d{7}$
  password: string; // 8-50 ký tự, phải gồm cả chữ và số: ^(?=.*[A-Za-z])(?=.*\d).+$
}

// Alias tương thích cho RegisterReq
export type RegisterReq = CreateUserReq & {
  phoneNumber?: string; // Tương thích backend cũ nếu có map phoneNumber
};

// Response trả về khi Đăng ký thành công (HTTP 201)
export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  requiresOtp: boolean;
}

// DTO Yêu cầu xác thực OTP (Verify OTP)
export interface VerifyOtpReq {
  email: string;
  otp: string; // 6 chữ số
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
  refreshToken?: string;
}

export interface RefreshTokenReq {
  refreshToken?: string;
}

export interface LoginReq {
  email: string;
  password: string;
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
  VERIFY_OTP_SUCCESS: 'AUTH.VERIFY_OTP_SUCCESS',
  USER_EMAIL_EXISTS: 'USER.EMAIL_EXISTS',
  USER_NOT_FOUND: 'USER.NOT_FOUND',
  GOOGLE_ACCOUNT_LOGIN_REQUIRED: 'AUTH.GOOGLE_ACCOUNT_LOGIN_REQUIRED',
  REFRESH_SUCCESS: 'AUTH.REFRESH_SUCCESS',
  INVALID_REFRESH_TOKEN: 'AUTH.INVALID_REFRESH_TOKEN',
} as const;

export type AuthErrorCodeType = (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];
