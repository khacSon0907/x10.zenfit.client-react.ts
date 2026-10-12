import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/useAuth';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';
import logo from '../../../assets/logo/logo-zenfit.png';

export default function OAuth2CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithOAuth2 } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Đang xác thực tài khoản Google...');
  
  // Guard chống React Strict Mode chạy useEffect 2 lần làm cháy mã code dùng 1 lần (one-time code)
  const isExchangingRef = useRef(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    // Trường hợp Google hoặc Backend trả về lỗi
    if (errorParam) {
      toast.error(`Đăng nhập Google không thành công: ${errorParam}`);
      navigate('/login', { replace: true });
      return;
    }

    // Trường hợp không có mã code trên URL
    if (!code) {
      toast.error('Không tìm thấy mã xác thực từ Google. Vui lòng thử lại.');
      navigate('/login', { replace: true });
      return;
    }

    // Ngăn chặn gọi API 2 lần với cùng một mã code
    if (isExchangingRef.current) return;
    isExchangingRef.current = true;

    const exchangeCode = async () => {
      try {
        setStatusMessage('Đang trao đổi mã xác thực và cấp phiên đăng nhập...');
        const user = await loginWithOAuth2(code);
        toast.success(`Đăng nhập Google thành công! Chào mừng ${user.name || user.username}.`);
        
        // Điều hướng về trang chủ
        navigate('/', { replace: true });
      } catch (error) {
        const message = getFriendlyErrorMessage(error, 'Xác thực Google thất bại. Vui lòng thử lại.');
        toast.error(message);
        navigate('/login', { replace: true });
      }
    };

    exchangeCode();
  }, [searchParams, loginWithOAuth2, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700/60 text-center flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-green-100 to-emerald-50 dark:from-emerald-950 dark:to-gray-800 p-3 shadow-sm mb-4">
          <img
            src={logo}
            alt="Zenfit Logo"
            className="h-12 w-12 object-contain"
          />
        </div>

        <h2 className="text-xl font-bold font-poppins text-gray-900 dark:text-gray-100 mb-2">
          Xác thực Google OAuth2
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          {statusMessage}
        </p>

        {/* Spinner */}
        <div className="flex items-center justify-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-3 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Vui lòng chờ trong giây lát...
          </span>
        </div>
      </div>
    </div>
  );
}
