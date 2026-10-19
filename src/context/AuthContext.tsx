import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import authApi, { getGoogleOAuth2Url } from '../api/authApi';
import {
  getAccessToken,
  setAccessToken,
  setAuthInterceptorListeners,
} from '../api/axiosClient';
import type {
  ApiResponse,
  AuthState,
  ChangePasswordReq,
  CreateUserReq,
  ForgotPasswordReq,
  LoginRequest,
  RegisterResponse,
  ResetPasswordReq,
  UserProfile,
  VerifyForgotPasswordOtpReq,
  VerifyForgotPasswordOtpResponse,
  VerifyOtpReq,
} from '../types/auth';
import SplashLoader from '../shared/components/ui/SplashLoader';
import { isAdminUser } from '../shared/utils/roleUtils';

/**
 * Interface đầy đủ cho AuthContext
 */
export interface AuthContextType extends AuthState {
  isInitializing: boolean; // Alias cho isLoading để tương thích với các Route Guards
  login: (data: LoginRequest) => Promise<UserProfile>;
  loginWithGoogle: () => void;
  handleOAuth2Callback: (code: string) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<UserProfile | null>;
  // Các hàm tiện ích hỗ trợ xác thực mở rộng
  register: (data: CreateUserReq) => Promise<ApiResponse<RegisterResponse>>;
  verifyOtp: (data: VerifyOtpReq) => Promise<ApiResponse<null | void>>;
  forgotPassword: (data: ForgotPasswordReq) => Promise<ApiResponse<void>>;
  verifyForgotPasswordOtp: (
    data: VerifyForgotPasswordOtpReq
  ) => Promise<VerifyForgotPasswordOtpResponse>;
  resetPassword: (data: ResetPasswordReq) => Promise<ApiResponse<void>>;
  changePassword: (data: ChangePasswordReq) => Promise<ApiResponse<void>>;
}

// oxlint-disable-next-line react/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('zenfit_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [accessToken, setAccessTokenState] = useState<string | null>(() => {
    return getAccessToken();
  });
  const isOAuthCallback =
    typeof window !== 'undefined' &&
    (window.location.pathname.startsWith('/oauth2/success') ||
      window.location.pathname.startsWith('/oauth2/callback'));

  const [isLoading, setIsLoading] = useState<boolean>(() => !isOAuthCallback);

  // Helper cập nhật auth state và gán token vào RAM & localStorage
  const handleAuthSuccess = useCallback((profile: UserProfile) => {
    const userWithFallbackName: UserProfile = {
      ...profile,
      name: profile.name || profile.username,
    };
    setAccessToken(profile.accessToken);
    setAccessTokenState(profile.accessToken);
    setUser(userWithFallbackName);

    try {
      localStorage.setItem('zenfit_user', JSON.stringify(userWithFallbackName));
      if (profile.accessToken) {
        localStorage.setItem('zenfit_access_token', profile.accessToken);
      }
    } catch {
      // Ignore quota errors
    }

    // Đồng bộ role vào localStorage để tương thích với các view PT/Admin
    if (isAdminUser(profile)) {
      localStorage.setItem('zenfit_role', 'ROLE_ADMIN');
    } else {
      localStorage.setItem('zenfit_role', 'ROLE_PT');
    }

    return userWithFallbackName;
  }, []);

  // Helper dọn dẹp sạch sẽ phiên đăng nhập
  const handleAuthCleanup = useCallback(() => {
    setAccessToken(null);
    setAccessTokenState(null);
    setUser(null);
    try {
      localStorage.removeItem('zenfit_user');
      localStorage.removeItem('zenfit_access_token');
      localStorage.removeItem('zenfit_role');
    } catch {
      // Ignore
    }
  }, []);

  /**
   * Action: Làm mới phiên làm việc (Silent Refresh)
   * Gửi HTTP-only Cookie refreshToken tự động thông qua withCredentials: true
   */
  const refreshSession = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const response = await authApi.refreshToken();
      const profile = response.data;
      return handleAuthSuccess(profile);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401 || status === 403) {
        handleAuthCleanup();
      }
      return null;
    }
  }, [handleAuthSuccess, handleAuthCleanup]);

  // Đăng ký listener để Axios Interceptor đồng bộ trạng thái khi có refresh ngầm
  useEffect(() => {
    setAuthInterceptorListeners({
      onSessionRefreshed: (_newToken: string, profile: UserProfile) => {
        handleAuthSuccess(profile);
      },
      onSessionExpired: () => {
        handleAuthCleanup();
      },
    });
  }, [handleAuthSuccess, handleAuthCleanup]);

  // Cờ chặn React Strict Mode chạy 2 lần trong môi trường Development
  const hasInitializedRef = useRef(false);

  /**
   * Khởi tạo App: Tự động refresh 1 lần lúc init để duy trì trạng thái đăng nhập khi F5 / mở lại trình duyệt
   */
  useEffect(() => {
    // Nếu đang ở trang tiếp nhận mã callback OAuth2 thì bỏ qua refresh ban đầu
    if (isOAuthCallback) {
      return;
    }

    if (hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    const bootstrapAuth = async () => {
      try {
        const refreshedUser = await refreshSession();
        // Nếu không refresh được qua cookie và trong localStorage cũng không có session
        if (!refreshedUser) {
          const savedToken = localStorage.getItem('zenfit_access_token');
          const savedUser = localStorage.getItem('zenfit_user');
          if (!savedToken && !savedUser) {
            handleAuthCleanup();
          }
        }
      } catch {
        const savedToken = localStorage.getItem('zenfit_access_token');
        const savedUser = localStorage.getItem('zenfit_user');
        if (!savedToken && !savedUser) {
          handleAuthCleanup();
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();
  }, [refreshSession, handleAuthCleanup, isOAuthCallback]);

  /**
   * 1. Action Đăng nhập Email / Password: POST /api/auth/login
   */
  const login = async (data: LoginRequest): Promise<UserProfile> => {
    const response = await authApi.login(data);
    const profile = response.data;
    return handleAuthSuccess(profile);
  };

  /**
   * 2. Action Đăng nhập Google: Chuyển hướng sang Backend OAuth2 Authorization URL
   */
  const loginWithGoogle = () => {
    window.location.href = getGoogleOAuth2Url();
  };

  /**
   * 3. Action Xử lý OAuth2 Callback: Đổi mã code lấy token và thông tin User
   * POST /api/auth/oauth2/exchange
   */
  const handleOAuth2Callback = async (code: string): Promise<UserProfile> => {
    const response = await authApi.exchangeOAuth2Code(code);
    const profile = response.data;
    return handleAuthSuccess(profile);
  };

  /**
   * 4. Action Đăng xuất: POST /api/auth/logout
   */
  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Vẫn xóa sạch state FE nếu API có lỗi mạng
    } finally {
      handleAuthCleanup();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  };

  /**
   * Các action bổ trợ (Register, OTP, Password Reset)
   */
  const register = async (data: CreateUserReq) => {
    return authApi.register(data);
  };

  const verifyOtp = async (data: VerifyOtpReq) => {
    return authApi.verifyOtp(data);
  };

  const forgotPassword = async (data: ForgotPasswordReq) => {
    return authApi.forgotPassword(data);
  };

  const verifyForgotPasswordOtp = async (data: VerifyForgotPasswordOtpReq) => {
    const res = await authApi.verifyForgotPasswordOtp(data);
    return res.data;
  };

  const resetPassword = async (data: ResetPasswordReq) => {
    return authApi.resetPassword(data);
  };

  const changePassword = async (data: ChangePasswordReq) => {
    return authApi.changePassword(data);
  };

  const contextValue: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: Boolean(user && accessToken),
    isLoading,
    isInitializing: isLoading,
    login,
    loginWithGoogle,
    handleOAuth2Callback,
    logout,
    refreshSession,
    register,
    verifyOtp,
    forgotPassword,
    verifyForgotPasswordOtp,
    resetPassword,
    changePassword,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {isLoading ? <SplashLoader message="Đang tải thông tin đăng nhập..." /> : children}
    </AuthContext.Provider>
  );
};

/**
 * Custom Hook sử dụng AuthContext
 */
// oxlint-disable-next-line react/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
