import { type ReactNode } from 'react';

export interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Component FormField tái sử dụng
 * Tự động gắn nhãn (Label), vùng hiển thị lỗi (Error message) có aria-live,
 * và chú thích (Hint) đảm bảo chuẩn Accessibility (a11y).
 */
export default function FormField({
  id,
  label,
  error,
  required = false,
  hint,
  children,
  className = '',
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Nhãn trường nhập liệu */}
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
        {required && <span className="text-red-500 ml-1" aria-hidden="true">*</span>}
      </label>

      {/* Vùng Input / Custom Input */}
      <div>{children}</div>

      {/* Thông báo lỗi hiển thị dưới field (chữ đỏ nhỏ) */}
      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="polite"
          className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1 animate-fadeIn"
        >
          <span>{error}</span>
        </p>
      )}

      {/* Gợi ý nếu không có lỗi */}
      {!error && hint && (
        <p id={hintId} className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {hint}
        </p>
      )}
    </div>
  );
}
