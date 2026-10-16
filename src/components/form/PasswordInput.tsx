import { forwardRef, useState, type InputHTMLAttributes } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  error?: string;
  showStrengthBar?: boolean;
}

type StrengthLevel = 'empty' | 'weak' | 'medium' | 'strong';

/**
 * Đánh giá độ mạnh của mật khẩu
 * - Yếu: Dưới 8 ký tự hoặc chỉ có chữ / chỉ có số
 * - Trung bình: Từ 8 ký tự trở lên và có cả chữ lẫn số (đáp ứng điều kiện tối thiểu)
 * - Mạnh: Từ 10 ký tự trở lên, gồm chữ hoa, chữ thường, số hoặc ký tự đặc biệt
 */
const evaluatePasswordStrength = (pwd: string): { level: StrengthLevel; label: string; score: number } => {
  if (!pwd) return { level: 'empty', label: '', score: 0 };

  const hasLetters = /[a-zA-Z]/.test(pwd);
  const hasDigits = /\d/.test(pwd);
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pwd);

  // Điều kiện tối thiểu: có cả chữ và số, >= 8 ký tự
  const meetsBasicRequirements = pwd.length >= 8 && hasLetters && hasDigits;

  if (!meetsBasicRequirements) {
    return { level: 'weak', label: 'Yếu', score: 1 };
  }

  // Nếu đủ dài và có thêm chữ hoa, chữ thường hoặc ký tự đặc biệt
  const isAdvanced = pwd.length >= 10 && ((hasUpper && hasLower) || hasSpecial);

  if (isAdvanced) {
    return { level: 'strong', label: 'Mạnh', score: 3 };
  }

  return { level: 'medium', label: 'Trung bình', score: 2 };
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      id,
      error,
      showStrengthBar = true,
      className = '',
      value,
      onChange,
      ...restProps
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const currentValue = typeof value === 'string' ? value : '';
    const strength = evaluatePasswordStrength(currentValue);

    return (
      <div className="space-y-2">
        <div className="relative">
          {/* Icon khóa bên trái */}
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
            <Lock className="h-5 w-5" />
          </div>

          {/* Ô nhập Password */}
          <input
            {...restProps}
            id={id}
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            value={value}
            onChange={onChange}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${id}-error` : undefined}
            className={`block w-full pl-11 pr-11 py-3 min-h-[48px] border rounded-xl text-base sm:text-sm transition-colors outline-hidden bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 ${
              error
                ? 'border-red-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-red-50/20 dark:bg-red-950/20'
                : 'border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-800'
            } ${className}`}
          />

          {/* Nút bật/tắt ẩn hiện mật khẩu (Eye icon) */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer focus:outline-none"
            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>

        {/* Thanh gợi ý độ mạnh mật khẩu */}
        {showStrengthBar && currentValue.length > 0 && (
          <div className="space-y-1 pt-0.5 animate-fadeIn">
            <div className="flex items-center gap-1.5 h-1.5 w-full">
              {/* Vạch 1 */}
              <div
                className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                  strength.score >= 1
                    ? strength.level === 'weak'
                      ? 'bg-red-500'
                      : strength.level === 'medium'
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
              {/* Vạch 2 */}
              <div
                className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                  strength.score >= 2
                    ? strength.level === 'medium'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
              {/* Vạch 3 */}
              <div
                className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                  strength.score >= 3 ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-gray-500 dark:text-gray-400">
              <span>Độ mạnh mật khẩu:</span>
              <span
                className={`font-semibold ${
                  strength.level === 'weak'
                    ? 'text-red-500'
                    : strength.level === 'medium'
                      ? 'text-amber-500'
                      : 'text-emerald-500'
                }`}
              >
                {strength.label}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

export default PasswordInput;
