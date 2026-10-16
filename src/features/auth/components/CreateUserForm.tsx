import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, Phone, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

import { createUserSchema, type CreateUserForm as CreateUserFormValues } from '../../../schemas/createUser.schema';
import { useAuth } from '../hooks/useAuth';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';

interface BackendValidationError {
  errors?: Array<{ field: string; message: string }>;
  code?: string;
  message?: string;
}

export interface CreateUserFormProps {
  onSuccess?: () => void;
}

/**
 * Đánh giá độ mạnh mật khẩu hiển thị thanh chỉ báo
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
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  // Khởi tạo React Hook Form validate onBlur và revalidate onChange
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      username: '',
      phone: '',
      email: '',
      password: '',
    },
  });

  const watchedPassword = watch('password') || '';
  const pwdStrength = evaluatePasswordStrength(watchedPassword);

  /**
   * Xử lý gửi form đăng ký lên Backend
   */
  const onSubmit = async (data: CreateUserFormValues) => {
    const cleanedPhone = data.phone.trim().replace(/\s+/g, '');
    const payload = {
      username: data.username.trim(),
      phone: cleanedPhone,
      phoneNumber: cleanedPhone,
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    try {
      const response = await registerAuth(payload);

      toast.success('Khởi tạo hồ sơ chuyên gia thành công!');
      reset();

      if (onSuccess) {
        onSuccess();
      } else if (response.requiresOtp) {
        navigate(`/verify-otp?email=${encodeURIComponent(payload.email)}`);
      } else {
        navigate('/login');
      }
    } catch (err: unknown) {
      const axiosError = err as AxiosError<BackendValidationError>;
      const status = axiosError.response?.status;
      const resData = axiosError.response?.data;

      // 1. Validation từ Backend
      if (status === 400 && Array.isArray(resData?.errors)) {
        resData.errors.forEach(({ field, message }) => {
          if (field === 'username' || field === 'email' || field === 'password' || field === 'phone' || field === 'phoneNumber') {
            setError(field === 'phoneNumber' ? 'phone' : (field as 'username' | 'email' | 'password' | 'phone'), {
              type: 'server',
              message,
            });
          }
        });
        return;
      }

      // 2. Conflict username, phone hoặc email (409)
      if (status === 409) {
        const errorMsg = (resData?.message || '').toLowerCase();
        const errorCode = resData?.code || '';

        const isUsernameConflict =
          errorCode.includes('USERNAME') ||
          errorMsg.includes('username') ||
          errorMsg.includes('tên người dùng');

        const isPhoneConflict =
          errorCode.includes('PHONE') ||
          errorMsg.includes('phone') ||
          errorMsg.includes('số điện thoại') ||
          errorMsg.includes('sđt');

        const isEmailConflict =
          errorCode.includes('EMAIL') ||
          errorMsg.includes('email');

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
        if (isEmailConflict) {
          setError('email', {
            type: 'server',
            message: 'Email này đã được đăng ký',
          });
          toast.error('Email này đã được đăng ký');
        }
        if (!isUsernameConflict && !isPhoneConflict && !isEmailConflict) {
          toast.error(resData?.message || 'Tài khoản, số điện thoại hoặc email đã tồn tại');
        }
        return;
      }

      // 3. Lỗi mạng / máy chủ
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
        {/* Field 1: Tên người dùng */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Tên người dùng <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="text"
              autoComplete="username"
              placeholder="VD: zenfit_user"
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
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">{errors.username.message}</p>
          )}
        </div>

        {/* Field 2: Số điện thoại */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Số điện thoại <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type="tel"
              autoComplete="tel"
              placeholder="VD: 0912345678"
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
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">{errors.phone.message}</p>
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
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">{errors.email.message}</p>
          )}
        </div>

        {/* Field 4: Mật khẩu */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1.5">
            Mật khẩu <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
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
            <p className="text-xs text-red-500 dark:text-red-400 mt-1 animate-fadeIn">{errors.password.message}</p>
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

        {/* Nút Submit: Tạo tài khoản */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Tạo tài khoản</span>
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
