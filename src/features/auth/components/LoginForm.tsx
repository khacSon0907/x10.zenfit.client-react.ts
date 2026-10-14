import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Shield, UserCheck, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useApp } from '../../../context/AppContext';
import { useSettings } from '../../../context/SettingsContext';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { loginAsPT, loginAsAdmin } = useApp();
  const { theme, toggleTheme } = useSettings();
  const navigate = useNavigate();

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (email.toLowerCase().includes('admin')) {
        loginAsAdmin();
        navigate('/admin/overview');
      } else {
        loginAsPT();
        navigate('/pt/today');
      }
    }, 400);
  };

  const handleQuickPTLogin = () => {
    loginAsPT();
    navigate('/pt/today');
  };

  const handleQuickAdminLogin = () => {
    loginAsAdmin();
    navigate('/admin/overview');
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none transition-colors relative">
      {/* Dark/Light toggle on corner */}
      <div className="absolute top-6 right-6">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Đổi sáng/tối"
          className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4 text-amber-400" />}
        </button>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/80 p-2.5 mb-3 shadow-xs">
          <img src={logo} alt="ZenFit" className="h-full w-full object-contain" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Zen<span className="text-emerald-500">Fit</span>
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mt-1">
          Hệ thống Quản lý Huấn luyện viên Cá nhân
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
          Dành riêng cho PT và Quản trị viên nội bộ
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
            Email tài khoản
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pt.quan@zenfit.vn hoặc admin@zenfit.vn"
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Mật khẩu
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <span>Đang xác thực...</span>
          ) : (
            <>
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Quick Access */}
      <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider text-center mb-3">
          Hoặc chọn vai trò mẫu để trải nghiệm ngay
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleQuickPTLogin}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <UserCheck className="h-4 w-4 text-emerald-600" />
            <span>Vào vai PT</span>
          </button>
          <button
            type="button"
            onClick={handleQuickAdminLogin}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 text-xs font-semibold transition-all cursor-pointer"
          >
            <Shield className="h-4 w-4 text-indigo-600" />
            <span>Vào vai Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
}
