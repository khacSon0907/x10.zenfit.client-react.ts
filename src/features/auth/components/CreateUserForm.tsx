import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

import { createUserSchema, type CreateUserForm as CreateUserFormValues } from '../../../schemas/createUser.schema';
import FormField from '../../../components/form/FormField';
import PasswordInput from '../../../components/form/PasswordInput';
import { useAuth } from '../hooks/useAuth';
import { getGoogleOAuth2Url } from '../api/auth.api';
import { getFriendlyErrorMessage } from '../../../shared/utils/authErrorHandler';

interface BackendValidationError {
  errors?: Array<{ field: string; message: string }>;
  code?: string;
  message?: string;
}

export interface CreateUserFormProps {
  onSuccess?: () => void;
}

export default function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  // Khởi tạo React Hook Form với chế độ validate onTouched và Zod schema
  const {
    register,
    handleSubmit,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitting, isValid },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserSchema),
    mode: 'onTouched', // Validate khi người dùng blur khỏi field, sau đó realtime khi gõ
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Watch password để truyền vào PasswordInput vẽ thanh đo độ mạnh mật khẩu
  const watchedPassword = watch('password');

  /**
   * Xử lý gửi form đăng ký lên Backend
   */
  const onSubmit = async (data: CreateUserFormValues) => {
    // Chuẩn hóa dữ liệu theo đúng yêu cầu:
    // - Trim username & email
    // - Chuyển email sang toLowerCase
    // - TUYỆT ĐỐI KHÔNG trim password
    const payload = {
      username: data.username.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    };

    try {
      const response = await registerAuth(payload);

      toast.success('Đăng ký tài khoản thành công!');
      reset(); // Reset form sau khi thành công

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

      // 1. Xử lý lỗi 400 (Validation từ Backend): dạng { errors: [{ field, message }] }
      if (status === 400 && Array.isArray(resData?.errors)) {
        resData.errors.forEach(({ field, message }) => {
          if (field === 'username' || field === 'email' || field === 'password') {
            setError(field, {
              type: 'server',
              message,
            });
          }
        });
        return;
      }

      // 2. Xử lý lỗi 409 (Conflict - Trùng lặp username hoặc email)
      if (status === 409) {
        const errorMsg = (resData?.message || '').toLowerCase();
        const errorCode = resData?.code || '';

        const isUsernameConflict =
          errorCode.includes('USERNAME') ||
          errorMsg.includes('username') ||
          errorMsg.includes('tên người dùng');

        const isEmailConflict =
          errorCode.includes('EMAIL') ||
          errorMsg.includes('email');

        if (isUsernameConflict) {
          setError('username', {
            type: 'server',
            message: 'Tên người dùng đã tồn tại',
          });
        }
        if (isEmailConflict) {
          setError('email', {
            type: 'server',
            message: 'Email đã được sử dụng',
          });
        }
        if (!isUsernameConflict && !isEmailConflict) {
          // Trường hợp thông báo chung không tách field
          toast.error(resData?.message || 'Tài khoản hoặc email đã tồn tại');
        }
        return;
      }

      // 3. Lỗi khác (500, Network error, timeout): Toast thông báo chung, giữ nguyên dữ liệu đã nhập
      const message = getFriendlyErrorMessage(
        axiosError,
        'Không thể kết nối đến máy chủ. Vui lòng kiểm tra mạng và thử lại.'
      );
      toast.error(message);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = getGoogleOAuth2Url();
  };

  return (
    <div className="space-y-6">
      {/* Nút đăng ký nhanh bằng Google */}
      <div>
        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600 shadow-sm transition-all duration-200 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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
          <span>Đăng ký với Google</span>
        </button>
      </div>

      {/* Đường phân cách */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-gray-900 px-3 text-gray-400 dark:text-gray-500 font-medium tracking-wider">
            hoặc đăng ký với thông tin
          </span>
        </div>
      </div>

      {/* Form đăng ký chính */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {/* Field 1: Username */}
        <FormField
          id="username"
          label="Tên người dùng"
          error={errors.username?.message}
          required
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <User className="h-5 w-5" />
            </div>
            <input
              id="username"
              type="text"
              autoComplete="username"
              placeholder="VD: zenfit_user"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? 'username-error' : undefined}
              {...register('username')}
              className={`block w-full pl-11 pr-4 py-3 border rounded-xl sm:text-sm transition-colors outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                errors.username
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800'
              }`}
            />
          </div>
        </FormField>

        {/* Field 2: Email */}
        <FormField
          id="email"
          label="Địa chỉ Email"
          error={errors.email?.message}
          required
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Mail className="h-5 w-5" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tenban@example.com"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              {...register('email')}
              className={`block w-full pl-11 pr-4 py-3 border rounded-xl sm:text-sm transition-colors outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
                errors.email
                  ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50/20 dark:bg-red-950/20'
                  : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800'
              }`}
            />
          </div>
        </FormField>

        {/* Field 3: Password */}
        <FormField
          id="password"
          label="Mật khẩu"
          error={errors.password?.message}
          required
        >
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Nhập mật khẩu (tối thiểu 8 ký tự, có chữ và số)"
            error={errors.password?.message}
            value={watchedPassword || ''}
            showStrengthBar={true}
            {...register('password')}
          />
        </FormField>

        {/* Nút Submit: Bị disable khi đang submit hoặc form chưa hợp lệ */}
        <button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 mt-4 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </>
          ) : (
            <>
              <span>Đăng ký tài khoản</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {/* Điều hướng đăng nhập */}
      <div className="pt-2 text-center text-sm">
        <span className="text-gray-500 dark:text-gray-400">Đã có tài khoản? </span>
        <Link
          to="/login"
          className="font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 hover:underline transition-colors"
        >
          Đăng nhập ngay
        </Link>
      </div>
    </div>
  );
}
