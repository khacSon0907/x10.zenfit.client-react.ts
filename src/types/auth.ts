/**
 * ============================================================================
 * AUTHENTICATION TYPES & DTO SPECIFICATIONS
 * Phù hợp 100% với Backend Spring Boot (ApiResponse<T>, UserProfile, LoginResponse)
 * ============================================================================
 */

/**
 * Cấu trúc ApiResponse chuẩn từ Backend Spring Boot
 */
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

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type ProviderType = 'LOCAL' | 'GOOGLE';

/**
 * Cấu trúc UserProfile chuẩn từ Backend
 * Backend trả về trong data của LoginResponse sau khi đăng nhập / đổi mã OAuth2 / refresh token / GET /api/user/me.
 * Lưu ý: refreshToken trong DTO Backend gắn @JsonIgnore, được lưu trong HTTP-only Cookie.
 */
export interface UserProfile {
  id: string;
  username: string;
  email: string;
  roleIds: string[];
  phoneNumber?: string | null;
  status?: UserStatus;
  createdAt?: string;
  updatedAt?: string;
  emailVerified?: boolean;
  verifiedAt?: string | null;
  avatarUrl?: string | null;
  birthday?: string | null;
  birthdayUpdateCount?: number;
  points?: number;
  birthdayLastUpdatedAt?: string | null;
  nextBirthdayUpdateAt?: string | null;
  canUpdateBirthday?: boolean;
  providerType?: ProviderType;
  roles: string[];
  accessToken: string;
  name?: string; // Tùy chọn hiển thị tên thân thiện cho UI (fallback = username)
}

/**
 * DTO gửi lên khi Đăng nhập thường: POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * DTO gửi lên khi Đổi mã Google OAuth2: POST /api/auth/oauth2/exchange
 */
export interface OAuth2ExchangeRequest {
  code: string;
}

/**
 * DTO gửi lên khi Refresh Token qua body (nếu có fallback): POST /api/auth/refresh
 */
export interface RefreshTokenRequest {
  refreshToken?: string;
}

/**
 * Trạng thái Auth State của Frontend
 */
export interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Định dạng chuẩn ErrorResponse khi Backend trả về lỗi
 */
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

/**
 * DTO Yêu cầu đăng ký tài khoản (Register / Create User)
 */
export interface CreateUserReq {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export type RegisterReq = CreateUserReq & {
  phoneNumber?: string;
};

export interface RegisterResponse {
  id: string;
  username: string;
  email: string;
  requiresOtp: boolean;
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

/**
 * Type Aliases để tương thích ngược với các file hiện hữu
 */
export type LoginReq = LoginRequest;
export type LoginResponse = UserProfile & { refreshToken?: string };
export type RefreshTokenReq = RefreshTokenRequest;

/**
 * Danh sách mã lỗi chuẩn từ Backend
 */
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
