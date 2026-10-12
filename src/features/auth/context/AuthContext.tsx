import {
  createContext,
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import authApi from '../api/auth.api';
import {
  setAccessToken,
  setAuthInterceptorListeners,
} from '../../../shared/api/axiosClient';
import type {
  ChangePasswordReq,
  ForgotPasswordReq,
  LoginReq,
  RegisterReq,
  RegisterResponse,
  ResetPasswordReq,
  UserProfile,
  VerifyForgotPasswordOtpReq,
  VerifyForgotPasswordOtpResponse,
  VerifyOtpReq,
} from '../types/auth.types';
import SplashLoader from '../../../shared/components/ui/SplashLoader';

export interface AuthContextType {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // Cờ quan trọng chặn ProtectedRoute redirect sớm khi F5
  isLoading: boolean;      // Alias cho isInitializing
  login: (
    credentialsOrUser: LoginReq | UserProfile,
    maybeToken?: string
  ) => Promise<UserProfile>;
  register: (data: RegisterReq) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  verifyOtp: (data: VerifyOtpReq) => Promise<void>;
  forgotPassword: (data: ForgotPasswordReq) => Promise<void>;
  verifyForgotPasswordOtp: (
    data: VerifyForgotPasswordOtpReq
  ) => Promise<VerifyForgotPasswordOtpResponse>;
  resetPassword: (data: ResetPasswordReq) => Promise<void>;
  changePassword: (data: ChangePasswordReq) => Promise<void>;
  loginWithOAuth2: (code: string) => Promise<UserProfile>;
  refreshSession: () => Promise<UserProfile | null>;
}

// oxlint-disable-next-line react/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [accessTokenState, setAccessTokenState] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  // Helper gán thông tin đăng nhập thành công vào memory & state
  const handleAuthSuccess = useCallback((accessToken: string, profile: UserProfile) => {
    // Đảm bảo có trường name thân thiện cho giao diện người dùng
    const userWithFallbackName: UserProfile = {
      ...profile,
      name: profile.name || profile.username,
    };
    setAccessToken(accessToken);
    setAccessTokenState(accessToken);
    setUser(userWithFallbackName);
    return userWithFallbackName;
  }, []);

  // Helper xóa sạch session khi logout hoặc hết hạn
  const handleAuthCleanup = useCallback(() => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
  }, []);

  /**
   * Action: Làm mới phiên làm việc (Silent Refresh)
   * Sử dụng HttpOnly cookie refreshToken để lấy accessToken mới
   */
  const refreshSession = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await authApi.refresh();
      const loginData = response.data;
      return handleAuthSuccess(loginData.accessToken, loginData);
    } catch {
      handleAuthCleanup();
      return null;
    }
  }, [handleAuthSuccess, handleAuthCleanup]);

  // Đăng ký listener để Axios Interceptor đồng bộ trạng thái khi có refresh ngầm
  useEffect(() => {
    setAuthInterceptorListeners({
      onSessionRefreshed: (token: string, profile: UserProfile) => {
        handleAuthSuccess(token, profile);
      },
      onSessionExpired: () => {
        handleAuthCleanup();
      },
    });
  }, [handleAuthSuccess, handleAuthCleanup]);

  /**
   * Silent Refresh khi App khởi động hoặc khi người dùng F5
   * withCredentials: true tự động đính kèm Cookie HttpOnly refreshToken
   */
  useEffect(() => {
    let isMounted = true;

    const bootstrapAuth = async () => {
      try {
        await refreshSession();
      } catch {
        // Lỗi 401 khi chưa login hoặc cookie hết hạn -> bỏ qua, coi như chưa đăng nhập
        handleAuthCleanup();
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [refreshSession, handleAuthCleanup]);

  /**
   * Action: Đăng nhập (Hỗ trợ cả Email/Password hoặc UserProfile + token)
   */
  const login = async (
    credentialsOrUser: LoginReq | UserProfile,
    maybeToken?: string
  ): Promise<UserProfile> => {
    if (maybeToken && typeof maybeToken === 'string') {
      return handleAuthSuccess(maybeToken, credentialsOrUser as UserProfile);
    }
    const response = await authApi.login(credentialsOrUser as LoginReq);
    const loginData = response.data;
    return handleAuthSuccess(loginData.accessToken, loginData);
  };

  /**
   * Action: Đăng ký tài khoản
   */
  const register = async (data: RegisterReq): Promise<RegisterResponse> => {
    const response = await authApi.register(data);
    return response.data;
  };

  /**
   * Action: Đăng xuất
   */
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Dù API logout có lỗi mạng, vẫn dọn dẹp state ở Frontend
    } finally {
      handleAuthCleanup();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  };

  /**
   * Action: Xác thực mã OTP
   */
  const verifyOtp = async (data: VerifyOtpReq): Promise<void> => {
    await authApi.verifyOtp(data);
  };

  /**
   * Action: Quên mật khẩu - gửi OTP
   */
  const forgotPassword = async (data: ForgotPasswordReq): Promise<void> => {
    await authApi.forgotPassword(data);
  };

  /**
   * Action: Xác thực OTP quên mật khẩu để lấy resetToken
   */
  const verifyForgotPasswordOtp = async (
    data: VerifyForgotPasswordOtpReq
  ): Promise<VerifyForgotPasswordOtpResponse> => {
    const response = await authApi.verifyForgotPasswordOtp(data);
    return response.data;
  };

  /**
   * Action: Đặt lại mật khẩu với resetToken
   */
  const resetPassword = async (data: ResetPasswordReq): Promise<void> => {
    await authApi.resetPassword(data);
  };

  /**
   * Action: Đổi mật khẩu
   */
  const changePassword = async (data: ChangePasswordReq): Promise<void> => {
    await authApi.changePassword(data);
  };

  /**
   * Action: Đổi mã Google OAuth2 lấy token và thông tin User
   */
  const loginWithOAuth2 = async (code: string): Promise<UserProfile> => {
    const response = await authApi.exchangeOAuth2Code({ code });
    const loginData = response.data;
    return handleAuthSuccess(loginData.accessToken, loginData);
  };

  const contextValue: AuthContextType = {
    user,
    accessToken: accessTokenState,
    isAuthenticated: Boolean(user && accessTokenState),
    isInitializing,
    isLoading: isInitializing,
    login,
    register,
    logout,
    verifyOtp,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    changePassword,
    loginWithOAuth2,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {isInitializing ? <SplashLoader /> : children}
    </AuthContext.Provider>
  );
};
