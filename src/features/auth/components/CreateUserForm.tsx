import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

import {
  registerSchema,
  type RegisterFormValues,
} from '../../../schemas/createUser.schema';
import { authApi } from '../../../api/auth.api';
import type { CreateUserReq, ErrorResponse } from '../../../types/auth.types';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';

export interface CreateUserFormProps {
  onSuccess?: (registeredEmail: string) => void;
}

const STORAGE_EMAIL_KEY = 'zenfit_registered_email';
const STORAGE_PENDING_REG_KEY = 'zenfit_pending_registration';
const STORAGE_EXPIRES_KEY = 'zenfit_otp_expires_at';

/**
 * Đánh giá độ mạnh mật khẩu và hiển thị thanh chỉ báo trực quan
 */
const evaluatePasswordStrength = (pwd: string) => {
  if (!pwd) return { level: 'empty', label: '', score: 0 };
  const hasLetters = /[a-zA-Z]/.test(pwd);
  const hasDigits = /\d/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

  const meetsBasic = pwd.length >= 8 && hasLetters && hasDigits;
  if (!meetsBasic) {
    return { level: 'weak', label: 'Yếu', score: 1 };
  }
  const isAdvanced = pwd.length >= 10 && ((hasUpper && hasLower) || hasSpecial);
  if (isAdvanced) {
    return { level: 'strong', label: 'Mạnh', score: 3 };
  }
  return { level: 'medium', label: 'Trung bình', score: 2 };
};

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Khởi tạo React Hook Form validate onBlur và revalidate onChange với Zod
  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password') || '';
  const pwdStrength = evaluatePasswordStrength(watchedPassword);

  /**
   * Xử lý gửi form đăng ký lên Backend
   */
  const onSubmit = async (data: RegisterFormValues) => {
    const cleanedPhone = data.phone.trim().replace(/\s+/g, '');
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanUsername = data.username.trim();

    // Payload chỉ chứa các trường backend yêu cầu (không gửi confirmPassword)
    const payload: CreateUserReq = {
      username: cleanUsername,
      phone: cleanedPhone,
      email: cleanEmail,
      password: data.password,
    };

    try {
      const response = await authApi.register(payload);

      // Lưu lại thông tin vào sessionStorage phục vụ xác thực OTP và gửi lại mã nếu cần
      sessionStorage.setItem(STORAGE_EMAIL_KEY, cleanEmail);
      sessionStorage.setItem(STORAGE_PENDING_REG_KEY, JSON.stringify(payload));
      sessionStorage.setItem(
        STORAGE_EXPIRES_KEY,
        String(Date.now() + 300 * 1000)
      );

      toast.success(response.message || 'Đăng ký tài khoản thành công! Vui lòng xác thực mã OTP.');

      if (onSuccess) {
        onSuccess(cleanEmail);
      } else {
        navigate(`/verify-otp?email=${encodeURIComponent(cleanEmail)}`);
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<ErrorResponse>;
      const status = axiosError.response?.status;
      const resData = axiosError.response?.data;

      // 1. Lỗi 422: Validation từ Backend
      // Backend trả về detail dạng { "email": ["Email không hợp lệ"], "username": ["..."] }
      if (status === 422) {
        const detail = resData?.detail;
        if (detail && typeof detail === 'object') {
          Object.entries(detail).forEach(([field, msg]) => {
            const message = Array.isArray(msg) ? msg[0] : String(msg);
            if (['username', 'email', 'phone', 'password'].includes(field)) {
              setError(field as 'username' | 'email' | 'phone' | 'password', {
                type: 'server',
                message,
              });
            }
          });
        }

        // Tương thích thêm trường errors mảng nếu backend trả dạng array
        if (Array.isArray(resData?.errors)) {
          resData.errors.forEach(({ field, message }) => {
            if (['username', 'email', 'phone', 'password'].includes(field)) {
              setError(field as 'username' | 'email' | 'phone' | 'password', {
                type: 'server',
                message,
              });
            }
          });
        }

        toast.error(resData?.message || 'Thông tin chưa hợp lệ. Vui lòng kiểm tra các ô nhập.');
        return;
      }

      // 2. Lỗi 409 Conflict: EMAIL_EXISTS hoặc trùng thông tin
      if (status === 409) {
        const errorCode = resData?.code || '';
        const errorMsg = (resData?.message || '').toLowerCase();

        const isEmailConflict =
          errorCode === 'USER.EMAIL_EXISTS' ||
          errorCode.includes('EMAIL') ||
          errorMsg.includes('email');

        const isUsernameConflict =
          errorCode.includes('USERNAME') ||
          errorMsg.includes('username') ||
          errorMsg.includes('tên người dùng');

        const isPhoneConflict =
          errorCode.includes('PHONE') ||
          errorMsg.includes('phone') ||
          errorMsg.includes('số điện thoại');

        if (isEmailConflict) {
          setError('email', {
            type: 'server',
            message: 'Email này đã tồn tại trên hệ thống',
          });
          toast.error('Email này đã tồn tại trên hệ thống');
        }

        if (isUsernameConflict) {
          setError('username', {
            type: 'server',
            message: 'Tên người dùng này đã tồn tại',
          });
          toast.error('Tên người dùng này đã tồn tại');
        }

        if (isPhoneConflict) {
          setError('phone', {
            type: 'server',
            message: 'Số điện thoại này đã được đăng ký',
          });
          toast.error('Số điện thoại này đã được đăng ký');
        }

        if (!isEmailConflict && !isUsernameConflict && !isPhoneConflict) {
          toast.error(resData?.message || 'Thông tin tài khoản đã tồn tại trên hệ thống');
        }
        return;
      }

      // 3. Lỗi chung / lỗi mạng
      const message = getFriendlyErrorMessage(
        axiosError,
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.'
      );
      toast.error(message);
    }
  };

  return (
    <div className="w-full">
      {/* Tiêu đề của Form Card */}
      <div className="mb-6">
        <h2 className="text-2xl sm:text-[26px] font-bold text-gray-900 dark:text-white tracking-tight leading-snug">
          Khởi tạo hồ sơ <span className="text-[#00d68f]">chuyên gia</span>
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
          Điền đầy đủ thông tin để bắt đầu hành trình cùng ZenFit
        </p>
      </div>

      {/* Form đăng ký chính */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Field 1: Tên người dùng (Username) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Tên người dùng <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              autoComplete="username"
              placeholder="VD: zenfit_user hoặc user.99"
              aria-invalid={Boolean(errors.username)}
              {...register('username')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#132230] border rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-hidden transition-all ${
                errors.username
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 dark:border-[#20364b] focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f]'
              }`}
            />
          </div>
          {errors.username?.message && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Field 2: Số điện thoại (Phone) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="tel"
              autoComplete="tel"
              placeholder="VD: 0912345678 hoặc +84912345678"
              aria-invalid={Boolean(errors.phone)}
              {...register('phone')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#132230] border rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-hidden transition-all ${
                errors.phone
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 dark:border-[#20364b] focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f]'
              }`}
            />
          </div>
          {errors.phone?.message && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">
              {errors.phone.message}
            </p>
          )}
        </div>

        {/* Field 3: Địa chỉ Email */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Địa chỉ Email <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="email"
              autoComplete="email"
              placeholder="tenban@example.com"
              aria-invalid={Boolean(errors.email)}
              {...register('email')}
              className={`w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-[#132230] border rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-hidden transition-all ${
                errors.email
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 dark:border-[#20364b] focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f]'
              }`}
            />
          </div>
          {errors.email?.message && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Field 4: Mật khẩu (Password) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="8-50 ký tự, gồm cả chữ và số"
              aria-invalid={Boolean(errors.password)}
              {...register('password')}
              className={`w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-[#132230] border rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-hidden transition-all ${
                errors.password
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 dark:border-[#20364b] focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f]'
              }`}
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

          {errors.password?.message && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">
              {errors.password.message}
            </p>
          )}

          {/* Thanh đo độ mạnh mật khẩu cập nhật lúc gõ */}
          {watchedPassword.length > 0 && (
            <div className="space-y-1.5 pt-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 h-1.5 w-full">
                <div
                  className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                    pwdStrength.score >= 1
                      ? pwdStrength.level === 'weak'
                        ? 'bg-red-500'
                        : pwdStrength.level === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-[#00d68f]'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
                <div
                  className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                    pwdStrength.score >= 2
                      ? pwdStrength.level === 'medium'
                        ? 'bg-amber-400'
                        : 'bg-[#00d68f]'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
                <div
                  className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                    pwdStrength.score >= 3 ? 'bg-[#00d68f]' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              </div>
              <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400">
                <span>Độ mạnh mật khẩu:</span>
                <span
                  className={`font-semibold ${
                    pwdStrength.level === 'weak'
                      ? 'text-red-500 dark:text-red-400'
                      : pwdStrength.level === 'medium'
                        ? 'text-amber-500 dark:text-amber-400'
                        : 'text-[#00d68f]'
                  }`}
                >
                  {pwdStrength.label}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Field 5: Xác nhận mật khẩu (Confirm Password) */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Xác nhận mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu để xác nhận"
              aria-invalid={Boolean(errors.confirmPassword)}
              {...register('confirmPassword')}
              className={`w-full pl-10 pr-11 py-3 bg-gray-50 dark:bg-[#132230] border rounded-xl text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 outline-hidden transition-all ${
                errors.confirmPassword
                  ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                  : 'border-gray-200 dark:border-[#20364b] focus:border-[#00d68f] focus:ring-1 focus:ring-[#00d68f]'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={showConfirmPassword ? 'Ẩn xác nhận mật khẩu' : 'Hiện xác nhận mật khẩu'}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword?.message && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {/* Nút Submit: Tiếp tục / Đăng ký */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang gửi thông tin đăng ký...</span>
            </>
          ) : (
            <>
              <span>Tiếp tục xác thực OTP</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Điều hướng đăng nhập */}
      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        <span>Đã có tài khoản? </span>
        <Link
          to="/login"
          className="font-semibold text-[#00d68f] hover:underline transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
