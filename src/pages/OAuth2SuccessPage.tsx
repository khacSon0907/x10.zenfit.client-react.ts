import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { getFriendlyErrorMessage } from '../shared/utils/authErrorHandler';
import { isAdminUser } from '../shared/utils/roleUtils';
import logo from '../assets/logo/logo-zenfit.png';

/**
 * ============================================================================
 * TRANG XỬ LÝ OAUTH2 CALLBACK: /oauth2/success?code={UUID}
 * ============================================================================
 * 1. Đón nhận mã xác thực tạm thời từ Google/Backend: ?code=...
 * 2. Gọi POST /api/auth/oauth2/exchange kèm withCredentials: true
 * 3. Nhận accessToken + thông tin User, lưu vào memory, chuyển tiếp về Dashboard
 */
export default function OAuth2SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuth2Callback } = useAuth();
  const [statusMessage, setStatusMessage] = useState('Đang kết nối và xác thực tài khoản Google...');

  // Cờ ref chống React Strict Mode chạy useEffect 2 lần làm hỏng mã code dùng 1 lần (one-time code)
  const isExchangedRef = useRef<boolean>(false);

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    // 1. Trường hợp Google hoặc Backend trả về lỗi trực tiếp trên query params
    if (errorParam) {
      toast.error(`Đăng nhập Google thất bại: ${errorParam}`);
      navigate('/login?error=oauth2', { replace: true });
      return;
    }

    // 2. Trường hợp thiếu mã code trên URL
    if (!code) {
      toast.error('Không tìm thấy mã xác thực Google. Vui lòng thử lại.');
      navigate('/login?error=oauth2', { replace: true });
      return;
    }

    // 3. Ngăn ngừa chạy duplicate
    if (isExchangedRef.current) return;
    isExchangedRef.current = true;

    // 4. Tiến hành trao đổi mã code lấy accessToken và UserProfile
    const exchangeCode = async () => {
      try {
        setStatusMessage('Đang trao đổi mã xác thực và cấp phiên đăng nhập...');
        const user = await handleOAuth2Callback(code);

        toast.success(`Đăng nhập thành công! Chào mừng ${user.name || user.username}.`);

        // Lấy redirect path đã lưu trước đó nếu có, còn không mặc định chuyển vào màn hình PT /pt/today
        const savedRedirect = sessionStorage.getItem('zenfit_redirect_after_login');
        sessionStorage.removeItem('zenfit_redirect_after_login');

        const targetPath =
          savedRedirect && savedRedirect !== '/' && savedRedirect !== '/login'
            ? savedRedirect
            : isAdminUser(user)
              ? '/admin/overview'
              : '/pt/today';

        navigate(targetPath, { replace: true });
      } catch (error) {
        const message = getFriendlyErrorMessage(error, 'Xác thực Google thất bại. Vui lòng thử lại.');
        toast.error(message);
        navigate('/login?error=oauth2', { replace: true });
      }
    };

    exchangeCode();
  }, [searchParams, handleOAuth2Callback, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070f15] px-4 selection:bg-[#00d68f] selection:text-black">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 dark:bg-[#00d68f]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/95 dark:bg-[#0c1620]/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/90 dark:border-[#1a2c3d] text-center flex flex-col items-center">
        {/* Logo Container */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 dark:from-emerald-500/20 dark:to-emerald-950/40 p-3.5 shadow-sm border border-emerald-500/20 mb-5">
          <img
            src={logo}
            alt="ZenFit Logo"
            className="h-14 w-14 object-contain animate-bounce"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
          Đang xử lý đăng nhập Google...
        </h2>

        {/* Subtitle / Status */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-xs leading-relaxed">
          {statusMessage}
        </p>

        {/* Spinner Loader */}
        <div className="flex items-center justify-center gap-3 py-2 px-5 rounded-full bg-emerald-50 dark:bg-[#132230] border border-emerald-500/20">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#00d68f] border-t-transparent" />
          <span className="text-sm font-semibold text-[#00d68f]">
            Vui lòng chờ trong giây lát...
          </span>
        </div>
      </div>
    </div>
  );
}
