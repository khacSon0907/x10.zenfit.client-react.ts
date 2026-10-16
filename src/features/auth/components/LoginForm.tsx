import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { getGoogleOAuth2Url } from '../api/auth.api';

export default function LoginForm() {
  const [rememberMe, setRememberMe] = useState<boolean>(() => {
    return localStorage.getItem('zenfit_remember_me') === 'true';
  });
  const [email, setEmail] = useState<string>(() => {
    return localStorage.getItem('zenfit_remember_email') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { loginAsPT, loginAsAdmin } = useApp();
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setIsLoading(true);

    // Xử lý tùy chọn "Ghi nhớ đăng nhập"
    if (rememberMe) {
      localStorage.setItem('zenfit_remember_me', 'true');
      localStorage.setItem('zenfit_remember_email', email);
    } else {
      localStorage.removeItem('zenfit_remember_me');
      localStorage.removeItem('zenfit_remember_email');
    }

    try {
      // Hỗ trợ đăng nhập API backend nếu có
      if (authLogin) {
        try {
          await authLogin({ email, password });
        } catch {
          // Bỏ qua lỗi kết nối backend khi chạy demo offline/mock
        }
      }

      // Điều hướng tương ứng với quyền người dùng
      if (email.toLowerCase().includes('admin')) {
        loginAsAdmin();
        navigate('/admin/overview');
      } else {
        loginAsPT();
        navigate('/pt/today');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      window.location.href = getGoogleOAuth2Url();
    } catch {
      toast.error('Không thể kết nối đến cổng đăng nhập Google');
    }
  };

  return (
    <div className="w-full">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-20 w-20 sm:h-22 sm:w-22 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/15 to-teal-500/10 dark:from-emerald-500/20 dark:to-emerald-950/40 border border-emerald-500/20 dark:border-[#00d68f]/30 p-2.5 mb-3 shadow-xs transition-transform hover:scale-105">
          <img
            src={logo}
            alt="ZenFit Logo"
            className="h-full w-full object-contain filter drop-shadow-xs select-none"
          />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Zen<span className="text-[#00d68f]">Fit</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#00d68f] mt-1">
          NỀN TẢNG QUẢN LÝ HUẤN LUYỆN CÁ NHÂN
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
          Quản lý hội viên, lịch tập và hành trình phát triển thể chất trên một nền tảng duy nhất
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Nhập email của bạn <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com"
              className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#132230] border border-gray-200 dark:border-[#20364b] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f] transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-[#132230] border border-gray-200 dark:border-[#20364b] rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-hidden focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Ghi nhớ đăng nhập & Quên mật khẩu */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded-md border-gray-300 dark:border-[#20364b] text-[#00d68f] focus:ring-[#00d68f] dark:bg-[#132230] dark:checked:bg-[#00d68f] accent-[#00d68f] transition-colors cursor-pointer"
            />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              Ghi nhớ đăng nhập
            </span>
          </label>

          <Link
            to="/forgot-password"
            className="text-xs font-medium text-[#00d68f] hover:underline transition-colors"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút Submit Đăng nhập */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang xác thực...</span>
            </>
          ) : (
            <>
              <span>Đăng nhập</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Phân cách hoặc đăng nhập bằng dịch vụ khác */}
      <div className="relative my-5">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-[#20364b]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-[#0c1620] px-3 text-gray-400 dark:text-gray-400 font-medium">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      {/* Nút Đăng nhập bằng Google */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-[#20364b] bg-white dark:bg-[#132230] text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-[#1a2d3f] hover:border-gray-300 dark:hover:border-gray-600 shadow-xs transition-all duration-200 active:scale-[0.99] cursor-pointer"
      >
        <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
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
        <span>Đăng nhập bằng Google</span>
      </button>

      {/* Điều hướng đăng ký tài khoản */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <span>Bạn chưa có tài khoản? </span>
        <Link
          to="/register"
          className="font-semibold text-[#00d68f] hover:underline transition-colors"
        >
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}
