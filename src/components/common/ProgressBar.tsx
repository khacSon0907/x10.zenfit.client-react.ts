
interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  subLabel?: string;
  color?: 'emerald' | 'amber' | 'rose' | 'sky';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showPercentage?: boolean;
}

export default function ProgressBar({
  value,
  max,
  label,
  subLabel,
  color = 'emerald',
  size = 'md',
  className = '',
  showPercentage = false,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / (max || 1)) * 100)));

  const colorStyles = {
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500',
  };

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  // Tự động đổi màu cảnh báo nếu thanh vượt 80% (với hạn mức)
  const activeColor =
    color === 'emerald' && percentage >= 90
      ? 'bg-rose-500'
      : color === 'emerald' && percentage >= 80
      ? 'bg-amber-500'
      : colorStyles[color];

  return (
    <div className={`w-full ${className}`}>
      {(label || subLabel || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          <div className="flex items-center gap-1.5">
            {label && <span>{label}</span>}
            {subLabel && <span className="text-gray-400 font-normal">{subLabel}</span>}
          </div>
          {showPercentage && <span className="font-semibold text-gray-900 dark:text-gray-100">{percentage}%</span>}
        </div>
      )}
      <div className={`w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`${heightStyles[size]} ${activeColor} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
