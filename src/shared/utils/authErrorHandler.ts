import type { AxiosError } from 'axios';
import { AUTH_ERROR_CODES, type ErrorResponse } from '../../types/auth.types';

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]: 'Email hoặc mật khẩu không chính xác.',
  [AUTH_ERROR_CODES.USER_NOT_ACTIVE]:
    'Tài khoản chưa được kích hoạt. Vui lòng xác thực mã OTP gửi về email.',
  [AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED]:
    'Tài khoản chưa được kích hoạt. Vui lòng xác thực mã OTP gửi về email.',
  [AUTH_ERROR_CODES.LOGIN_LOCKED]:
    'Tài khoản tạm thời bị khóa do sai quá 5 lần. Thử lại sau 5 phút.',
  [AUTH_ERROR_CODES.RATE_LIMIT_EXCEEDED]:
    'Bạn thao tác quá nhanh. Vui lòng thử lại sau giây lát.',
  [AUTH_ERROR_CODES.INVALID_OTP]: 'Mã OTP không hợp lệ hoặc đã hết hạn.',
  [AUTH_ERROR_CODES.USER_EMAIL_EXISTS]: 'Email này đã tồn tại trên hệ thống.',
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: 'Không tìm thấy người dùng.',
  [AUTH_ERROR_CODES.GOOGLE_ACCOUNT_LOGIN_REQUIRED]:
    'Tài khoản được tạo bằng Google, vui lòng chọn Đăng nhập bằng Google.',
};

/**
 * Trích xuất ErrorResponse từ AxiosError
 */
export function extractErrorResponse(error: unknown): ErrorResponse | null {
  if (!error || typeof error !== 'object') return null;
  const axiosError = error as AxiosError<ErrorResponse>;
  return axiosError.response?.data || null;
}

/**
 * Trả về thông báo lỗi thân thiện cho người dùng dựa trên Error Code từ Backend
 */
export function getFriendlyErrorMessage(
  error: unknown,
  fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'
): string {
  const errorData = extractErrorResponse(error);
  if (errorData?.code && AUTH_ERROR_MESSAGES[errorData.code]) {
    return AUTH_ERROR_MESSAGES[errorData.code];
  }
  if (errorData?.message) {
    return errorData.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallbackMessage;
}
