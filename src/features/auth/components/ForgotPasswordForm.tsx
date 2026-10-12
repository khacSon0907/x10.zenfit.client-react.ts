import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, ShieldCheck, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';

type ForgotPasswordStep = 'EMAIL' | 'OTP' | 'RESET';

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<ForgotPasswordStep>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { forgotPassword, verifyForgotPasswordOtp, resetPassword } = useAuth();
  const navigate = useNavigate();

  // BƯỚC 1: Gửi yêu cầu OTP qua Email
  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword({ email });
      toast.success(`Đã gửi mã OTP khôi phục mật khẩu đến ${email}.`);
      setStep('OTP');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Không thể gửi yêu cầu đặt lại mật khẩu.'));
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 2: Xác thực OTP để lấy resetToken
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await verifyForgotPasswordOtp({ email, otp });
      setResetToken(response.resetToken);
      toast.success('Xác thực OTP thành công! Vui lòng đặt mật khẩu mới.');
      setStep('RESET');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Mã OTP không chính xác hoặc đã hết hạn.'));
    } finally {
      setIsLoading(false);
    }
  };

  // BƯỚC 3: Đặt mật khẩu mới với resetToken
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Mật khẩu mới phải có tối thiểu 6 ký tự.');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ email, resetToken, newPassword });
      toast.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.');
      navigate('/login');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Đặt lại mật khẩu thất bại. Vui lòng thử lại.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Steps indicator */}
      <div className="flex items-center justify-between px-2 text-xs font-semibold text-gray-500">
        <span className={step === 'EMAIL' ? 'text-emerald-600 font-bold' : ''}>1. Nhập email</span>
        <span>→</span>
        <span className={step === 'OTP' ? 'text-emerald-600 font-bold' : ''}>2. Nhập OTP</span>
        <span>→</span>
        <span className={step === 'RESET' ? 'text-emerald-600 font-bold' : ''}>3. Mật khẩu mới</span>
      </div>

      {/* BƯỚC 1: NHẬP EMAIL */}
      {step === 'EMAIL' && (
        <form onSubmit={handleSendEmail} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Địa chỉ Email tài khoản
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

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isLoading ? 'Đang gửi mã...' : 'Nhận mã xác thực OTP'}
            {!isLoading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
      )}

      {/* BƯỚC 2: NHẬP OTP */}
      {step === 'OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Mã OTP đã được gửi đến: <strong className="text-gray-700 dark:text-gray-200">{email}</strong>
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mã xác thực (OTP 6 số)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <ShieldCheck className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.trim())}
                maxLength={6}
                className="block w-full pl-11 pr-4 py-3 text-center tracking-[0.3em] sm:tracking-[0.5em] text-lg sm:text-xl font-bold font-mono border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="000000"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep('EMAIL')}
              className="w-1/3 py-3 px-3 rounded-xl border border-gray-300 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Gửi lại email
            </button>
            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? 'Đang xác thực...' : 'Xác thực OTP'}
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>
        </form>
      )}

      {/* BƯỚC 3: ĐẶT MẬT KHẨU MỚI */}
      {step === 'RESET' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full pl-11 pr-11 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Tối thiểu 6 ký tự"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Xác nhận mật khẩu mới
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-800 outline-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                placeholder="Nhập lại mật khẩu mới"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !newPassword || !confirmPassword}
            className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
            {!isLoading && <CheckCircle2 className="h-4 w-4" />}
          </button>
        </form>
      )}

      <div className="pt-2 text-center text-sm">
        <Link
          to="/login"
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
        >
          Quay lại Đăng nhập
        </Link>
      </div>
    </div>
  );
}
