
export type BadgeVariant = 'success' | 'warning' | 'danger' | 'neutral' | 'info';

interface StatusBadgeProps {
  variant?: BadgeVariant;
  label: string;
  dot?: boolean;
  className?: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({
  variant = 'neutral',
  label,
  dot = true,
  className = '',
  size = 'md',
}: StatusBadgeProps) {
  const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
    // Xanh lá = tốt / đang tập / hoàn thành / đều đặn
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60',
      text: 'text-emerald-700 dark:text-emerald-300',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200 dark:border-emerald-800/60',
    },
    // Vàng = cần chú ý / tạm ổn / sắp hết buổi / đang cân nhắc
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/60',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      border: 'border-amber-200 dark:border-amber-800/60',
    },
    // Đỏ = khẩn cấp / quá hạn / nguy cơ bỏ / vắng mặt / hủy / khóa
    danger: {
      bg: 'bg-rose-50 dark:bg-rose-950/60',
      text: 'text-rose-700 dark:text-rose-300',
      dot: 'bg-rose-500',
      border: 'border-rose-200 dark:border-rose-800/60',
    },
    // Xám = không hoạt động / tạm nghỉ / kết thúc
    neutral: {
      bg: 'bg-gray-100 dark:bg-gray-800',
      text: 'text-gray-600 dark:text-gray-300',
      dot: 'bg-gray-400',
      border: 'border-gray-200 dark:border-gray-700',
    },
    // Xanh dương = tiềm năng / thông tin
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/60',
      text: 'text-sky-700 dark:text-sky-300',
      dot: 'bg-sky-500',
      border: 'border-sky-200 dark:border-sky-800/60',
    },
  };

  const style = variantStyles[variant];
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${style.bg} ${style.text} ${style.border} ${sizeCls} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${style.dot}`} />}
      <span className="truncate">{label}</span>
    </span>
  );
}
