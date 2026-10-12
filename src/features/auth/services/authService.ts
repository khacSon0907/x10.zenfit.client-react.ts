import authApi, { getGoogleOAuth2Url } from '../api/auth.api';
import type {
  ChangePasswordReq,
  ForgotPasswordReq,
  LoginReq,
  RegisterReq,
  ResetPasswordReq,
  VerifyForgotPasswordOtpReq,
  VerifyOtpReq,
} from '../types/auth.types';

/**
 * Service adapter kết nối trực tiếp với authApi
 * Duy trì tính tương thích ngược cho các component hiện có
 */
export const authService = {
  login: async (credentials: LoginReq) => {
    return authApi.login(credentials);
  },

  register: async (userData: RegisterReq) => {
    return authApi.register(userData);
  },

  verifyOtp: async (email: string, otp: string) => {
    const req: VerifyOtpReq = { email, otp };
    return authApi.verifyOtp(req);
  },

  forgotPassword: async (email: string) => {
    const req: ForgotPasswordReq = { email };
    return authApi.forgotPassword(req);
  },

  verifyForgotPasswordOtp: async (email: string, otp: string) => {
    const req: VerifyForgotPasswordOtpReq = { email, otp };
    return authApi.verifyForgotPasswordOtp(req);
  },

  resetPassword: async (data: ResetPasswordReq) => {
    return authApi.resetPassword(data);
  },

  changePassword: async (data: ChangePasswordReq) => {
    return authApi.changePassword(data);
  },

  getGoogleLoginUrl: () => {
    return getGoogleOAuth2Url();
  },
};

export default authService;
