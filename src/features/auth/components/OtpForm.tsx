import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
  type ClipboardEvent,
  type ChangeEvent,
} from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

import { authApi } from '../../../api/auth.api';
import type { CreateUserReq, ErrorResponse } from '../../../types/auth.types';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';

export interface OtpFormProps {
  initialEmail?: string;
  onBackToRegister?: () => void;
  onSuccess?: () => void;
}

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 300; // 5 phút (300 giây khớp với Redis TTL Backend)
const STORAGE_EMAIL_KEY = 'zenfit_registered_email';
const STORAGE_PENDING_REG_KEY = 'zenfit_pending_registration';
const STORAGE_EXPIRES_KEY = 'zenfit_otp_expires_at';

/**
 * Format giây thành chuỗi mm:ss (VD: 300s -> "05:00")
 */
function formatCountdown(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function OtpForm({
  initialEmail,
  onBackToRegister,
  onSuccess,
}: OtpFormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Xác định địa chỉ email
  const email =
    initialEmail ||
    searchParams.get('email') ||
    sessionStorage.getItem(STORAGE_EMAIL_KEY) ||
    '';

  const [otpValues, setOtpValues] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // Lưu trữ các refs của 6 ô input để điều hướng focus
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // 2. Quản lý bộ đếm thời gian (Countdown Timer) 300s
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const savedExpiry = sessionStorage.getItem(STORAGE_EXPIRES_KEY);
    if (savedExpiry) {
      const remaining = Math.floor((Number(savedExpiry) - Date.now()) / 1000);
      if (remaining > 0) return remaining;
    }
    const newExpiry = Date.now() + OTP_TTL_SECONDS * 1000;
    sessionStorage.setItem(STORAGE_EXPIRES_KEY, String(newExpiry));
    return OTP_TTL_SECONDS;
  });

  // Đồng bộ email vào storage khi có thay đổi
  useEffect(() => {
    if (email) {
      sessionStorage.setItem(STORAGE_EMAIL_KEY, email);
    }
  }, [email]);

  // Bộ đếm lùi từng giây
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Tự động focus ô đầu tiên khi mở trang
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /**
   * Gọi API xác thực OTP
   */
  const handleVerifyOtp = useCallback(
    async (codeToVerify: string) => {
      if (!email.trim()) {
        toast.error('Thiếu thông tin email cần xác thực. Vui lòng quay lại đăng ký.');
        return;
      }

      if (codeToVerify.length !== OTP_LENGTH) {
        toast.error(`Vui lòng nhập đủ ${OTP_LENGTH} chữ số mã OTP.`);
        return;
      }

      setIsSubmitting(true);
      setHasError(false);

      try {
        const response = await authApi.verifyOtp({
          email: email.trim().toLowerCase(),
          otp: codeToVerify,
        });

        // Backend trả về HTTP 200: AUTH.VERIFY_OTP_SUCCESS
        toast.success(response.message || 'Đăng ký và kích hoạt tài khoản thành công!');

        // Dọn dẹp cache sau khi kích hoạt thành công
        sessionStorage.removeItem(STORAGE_PENDING_REG_KEY);
        sessionStorage.removeItem(STORAGE_EXPIRES_KEY);

        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err: unknown) {
        setHasError(true);
        const axiosError = err as AxiosError<ErrorResponse>;
        const status = axiosError.response?.status;
        const resData = axiosError.response?.data;

        // Xử lý các mã lỗi Backend chuẩn:
        // 400 Bad Request: AUTH.INVALID_OTP
        if (status === 400 && resData?.code === 'AUTH.INVALID_OTP') {
          toast.error(resData.message || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
          return;
        }

        // 404 Not Found: USER.NOT_FOUND
        if (status === 404 && resData?.code === 'USER.NOT_FOUND') {
          toast.error(resData.message || 'Không tìm thấy thông tin tài khoản người dùng.');
          return;
        }

        // Lỗi mặc định thân thiện
        const msg = getFriendlyErrorMessage(
          axiosError,
          'Mã xác thực không chính xác hoặc đã hết hạn.'
        );
        toast.error(msg);
      } finally {
        setIsSubmitting(false);
      }
    },
    [email, onSuccess, navigate]
  );

  /**
   * Xử lý thay đổi ký tự trong từng ô input
   */
  const handleInputChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    setHasError(false);

    // Chỉ chấp nhận ký tự số
    const digit = rawValue.replace(/\D/g, '').slice(-1);

    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Khi đã nhập số và chưa phải ô cuối cùng -> Tự động nhảy focus sang ô tiếp theo
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Nếu đã điền đủ 6 số -> Tự động kích hoạt submit
    const combinedOtp = newOtp.join('');
    if (combinedOtp.length === OTP_LENGTH) {
      handleVerifyOtp(combinedOtp);
    }
  };

  /**
   * Xử lý các phím chức năng: Backspace, Mũi tên trái/phải
   */
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (otpValues[index]) {
        // Xóa ký tự ở ô hiện tại
        const newOtp = [...otpValues];
        newOtp[index] = '';
        setOtpValues(newOtp);
      } else if (index > 0) {
        // Ô hiện tại rỗng -> Lùi về ô trước và xóa luôn ký tự ô trước
        const newOtp = [...otpValues];
        newOtp[index - 1] = '';
        setOtpValues(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /**
   * Hỗ trợ sự kiện Paste: dán mã 6 số từ clipboard
   */
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    // Lọc chỉ lấy chữ số và giới hạn 6 số
    const digits = pastedData.replace(/\D/g, '').slice(0, OTP_LENGTH);

    if (!digits) return;

    const newOtp = [...otpValues];
    for (let i = 0; i < OTP_LENGTH; i++) {
      newOtp[i] = digits[i] || '';
    }
    setOtpValues(newOtp);

    // Focus vào ô kế tiếp hoặc ô cuối cùng
    const focusIndex = Math.min(digits.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();

    // Nếu paste đủ 6 số -> Kích hoạt xác thực ngay
    if (digits.length === OTP_LENGTH) {
      handleVerifyOtp(digits);
    }
  };

  /**
   * Submit form thủ công
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    handleVerifyOtp(fullOtp);
  };

  /**
   * Gửi lại mã OTP:
   * Khi hết giờ (timeLeft === 0), gọi lại API POST /api/auth/register với thông tin đã đăng ký
   * để backend cấp OTP mới, đồng thời reset đếm ngược về 5 phút (300s).
   */
  const handleResendOtp = async () => {
    if (timeLeft > 0 || isResending) return;

    setIsResending(true);
    try {
      const savedPayload = sessionStorage.getItem(STORAGE_PENDING_REG_KEY);
      if (savedPayload) {
        const payload: CreateUserReq = JSON.parse(savedPayload);
        await authApi.register(payload);
      } else {
        // Fallback: nếu không có payload đầy đủ, gọi lại xác thực hoặc thông báo
        toast.info('Đang gửi lại yêu cầu cấp mã OTP mới...');
      }

      // Reset lại bộ đếm 300 giây
      const newExpiry = Date.now() + OTP_TTL_SECONDS * 1000;
      sessionStorage.setItem(STORAGE_EXPIRES_KEY, String(newExpiry));
      setTimeLeft(OTP_TTL_SECONDS);

      // Xóa sạch các ô nhập cũ và focus lại ô đầu tiên
      setOtpValues(Array(OTP_LENGTH).fill(''));
      setHasError(false);
      inputRefs.current[0]?.focus();

      toast.success('Mã OTP mới đã được gửi tới email của bạn!');
    } catch (err: unknown) {
      const msg = getFriendlyErrorMessage(
        err,
        'Không thể gửi lại mã OTP lúc này. Vui lòng thử lại sau.'
      );
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  /**
   * Xử lý quay lại form Đăng ký để đổi email
   */
  const handleBack = () => {
    if (onBackToRegister) {
      onBackToRegister();
    } else {
      navigate('/register');
    }
  };

  const isOtpComplete = otpValues.every((val) => val !== '');

  return (
    <div className="w-full">
      {/* Khối thông báo và địa chỉ email đã đăng ký */}
      <div className="mb-6 p-4 rounded-2xl bg-emerald-50/70 dark:bg-[#0c221b]/80 border border-emerald-200/80 dark:border-[#00d68f]/30 backdrop-blur-xs">
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-100 dark:bg-[#00d68f]/15 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#00d68f] mt-0.5">
            <Mail className="h-4 w-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              Mã OTP gồm 6 chữ số đã được gửi tới email:
            </p>
            <p className="text-sm font-bold text-gray-900 dark:text-white truncate mt-0.5">
              {email || 'Chưa xác định'}
            </p>
            <button
              type="button"
              onClick={handleBack}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-[#00d68f] hover:text-emerald-700 dark:hover:text-[#00be7f] transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Thay đổi email / Quay lại</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Ô nhập OTP tách rời */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center sm:text-left">
            Nhập mã xác thực 6 chữ số <span className="text-red-500">*</span>
          </label>

          <div
            className="flex items-center justify-between gap-1.5 sm:gap-2.5"
            onPaste={handlePaste}
          >
            {otpValues.map((value, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                autoComplete="one-time-code"
                value={value}
                onChange={(e) => handleInputChange(idx, e)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-bold font-mono rounded-xl sm:rounded-2xl border transition-all duration-200 outline-hidden select-all ${
                  hasError
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 focus:ring-2 focus:ring-red-500'
                    : value
                      ? 'border-[#00d68f] bg-white dark:bg-[#132230] text-gray-900 dark:text-white ring-1 ring-[#00d68f]/50 shadow-xs'
                      : 'border-gray-200 dark:border-[#20364b] bg-gray-50 dark:bg-[#132230]/70 text-gray-900 dark:text-white focus:border-[#00d68f] focus:ring-2 focus:ring-[#00d68f]/30 focus:bg-white dark:focus:bg-[#132230]'
                }`}
                aria-label={`Chữ số thứ ${idx + 1}`}
              />
            ))}
          </div>

          {hasError && (
            <p className="text-xs text-red-500 dark:text-red-400 text-center mt-2.5 font-medium animate-fadeIn">
              Mã OTP không chính xác hoặc đã hết hạn. Vui lòng kiểm tra lại.
            </p>
          )}
        </div>

        {/* Khối Bộ đếm thời gian (Countdown Timer) & Nút Gửi lại mã */}
        <div className="flex items-center justify-between px-1 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
            <Clock className="h-4 w-4 text-emerald-500 dark:text-[#00d68f]" />
            <span>Hiệu lực:</span>
            <span
              className={`font-mono font-bold ${
                timeLeft <= 60
                  ? 'text-red-500 dark:text-red-400 animate-pulse'
                  : 'text-gray-900 dark:text-gray-200'
              }`}
            >
              {formatCountdown(timeLeft)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={timeLeft > 0 || isResending}
            className={`inline-flex items-center gap-1.5 font-semibold text-xs sm:text-sm transition-all duration-200 cursor-pointer ${
              timeLeft > 0 || isResending
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-60'
                : 'text-emerald-600 dark:text-[#00d68f] hover:text-emerald-700 dark:hover:text-[#00be7f] hover:underline'
            }`}
          >
            {isResending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang gửi lại...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                <span>
                  {timeLeft > 0 ? `Gửi lại mã (${formatCountdown(timeLeft)})` : 'Gửi lại mã OTP'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Nút bấm Submit Xác thực */}
        <button
          type="submit"
          disabled={isSubmitting || !isOtpComplete}
          className="w-full py-3.5 px-4 rounded-xl bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang kiểm tra mã...</span>
            </>
          ) : (
            <>
              <ShieldCheck className="h-5 w-5" />
              <span>Xác thực & Kích hoạt</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        {/* Chân trang điều hướng */}
        <div className="pt-2 text-center text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <span>Chưa nhận được email? Kiểm tra mục Spam hoặc</span>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={timeLeft > 0 || isResending}
            className={`font-semibold underline transition-colors cursor-pointer ${
              timeLeft > 0
                ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                : 'text-[#00d68f] hover:text-[#00be7f]'
            }`}
          >
            gửi lại
          </button>
        </div>
      </form>
    </div>
  );
}
