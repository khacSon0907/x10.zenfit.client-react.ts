import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Mail, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';

export default function OtpForm() {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Vui lòng cung cấp địa chỉ email cần xác thực.');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp({ email, otp });
      toast.success('Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.');
      navigate('/login');
    } catch (error) {
      toast.error(getFriendlyErrorMessage(error, 'Mã OTP không hợp lệ hoặc đã hết hạn.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Email kích hoạt
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

      <button
        type="submit"
        disabled={isLoading || otp.length < 4}
        className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
      >
        {isLoading ? 'Đang xác thực...' : 'Xác thực tài khoản'}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </button>

      <div className="text-center text-sm">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors"
        >
          Quay lại Đăng nhập
        </button>
      </div>
    </form>
  );
}
