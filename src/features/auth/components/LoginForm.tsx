import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getGoogleOAuth2Url } from '../api/auth.api';
import {
  extractErrorResponse,
  getFriendlyErrorMessage,
} from '../../../shared/utils/authErrorHandler';
import { AUTH_ERROR_CODES } from '../types/auth.types';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const user = await login({ email, password });
      toast.success(`Đăng nhập thành công! Chào mừng ${user.name || user.username}.`);

      // Điều hướng về trang trước đó nếu có trong state, hoặc trang chủ
      const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(fromPath, { replace: true });
    } catch (error) {
      const errorData = extractErrorResponse(error);

      // Nếu tài khoản chưa kích hoạt OTP -> điều hướng sang màn hình xác thực OTP
      if (
        errorData?.code === AUTH_ERROR_CODES.USER_NOT_ACTIVE ||
        errorData?.code === AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED
      ) {
        toast.info(
          'Tài khoản chưa được kích hoạt. Vui lòng xác thực mã OTP gửi về email của bạn.'
        );
        navigate(`/verify-otp?email=${encodeURIComponent(email)}`);
        return;
      }

      toast.error(getFriendlyErrorMessage(error, 'Đăng nhập không thành công.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true);
    // Chuyển hướng trình duyệt tới endpoint Google OAuth2 của Backend Spring Boot
    window.location.href = getGoogleOAuth2Url();
  };

  return (
    <div className="space-y-6">
      {/* Social Login Button */}
      <div>
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading || isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{isGoogleLoading ? 'Đang chuyển hướng sang Google...' : 'Đăng nhập với Google'}</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500 font-medium tracking-wider">
            hoặc đăng nhập với email
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Địa chỉ Email
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="tenban@example.com"
              required
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-11 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isGoogleLoading}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          {!isLoading && <ArrowRight className="h-4 w-4" />}
        </button>
      </form>

      <div className="pt-2 text-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Chưa có tài khoản? </span>
        <Link
          to="/register"
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
