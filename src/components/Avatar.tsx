import { useState } from 'react';
import { Camera } from 'lucide-react';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: AvatarSize;
  className?: string;
  showCameraBadge?: boolean;
}

/**
 * Bảng màu ổn định, có độ tương phản cao trên nền chữ trắng
 */
const AVATAR_PALETTE = [
  'bg-emerald-600',
  'bg-teal-600',
  'bg-cyan-700',
  'bg-blue-600',
  'bg-indigo-600',
  'bg-violet-600',
  'bg-purple-600',
  'bg-rose-600',
  'bg-amber-600',
];

/**
 * Tính mã hash từ chuỗi để chọn màu cố định theo tên user
 */
function getStableBgColor(str: string): string {
  if (!str) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

/**
 * Trích xuất tối đa 2 chữ cái đầu viết hoa từ name
 * Hỗ trợ tách theo khoảng trắng, dấu gạch dưới (_), hoặc gạch nối (-)
 * Ví dụ: "anh_ba" -> "AB", "nguyen-minh" -> "NM", "John Doe" -> "JD"
 */
function extractInitials(name: string): string {
  if (!name) return 'U';
  const clean = name.trim();
  const tokens = clean.split(/[\s_-]+/).filter(Boolean);

  if (tokens.length === 0) {
    return clean.slice(0, 2).toUpperCase();
  }
  if (tokens.length === 1) {
    return tokens[0].slice(0, 2).toUpperCase();
  }
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

/**
 * Mapping kích thước avatar
 */
const SIZE_CONFIG: Record<
  AvatarSize,
  {
    container: string;
    text: string;
    badgeBtn: string;
    badgeIcon: string;
  }
> = {
  sm: {
    container: 'h-8 w-8',
    text: 'text-xs',
    badgeBtn: 'p-0.5',
    badgeIcon: 'h-2 w-2',
  },
  md: {
    container: 'h-10 w-10',
    text: 'text-sm font-semibold',
    badgeBtn: 'p-1',
    badgeIcon: 'h-2.5 w-2.5',
  },
  lg: {
    container: 'h-16 w-16',
    text: 'text-xl font-bold',
    badgeBtn: 'p-1.5',
    badgeIcon: 'h-3.5 w-3.5',
  },
  xl: {
    container: 'h-24 w-24',
    text: 'text-2xl font-bold',
    badgeBtn: 'p-2',
    badgeIcon: 'h-4 w-4',
  },
};

export default function Avatar({
  src,
  name,
  size = 'md',
  className = '',
  showCameraBadge = true,
}: AvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initials = extractInitials(name);
  const bgColor = getStableBgColor(name);
  const cfg = SIZE_CONFIG[size];

  const hasValidImage = Boolean(src && !hasError);

  return (
    <div
      className={`relative inline-flex shrink-0 select-none ${cfg.container} ${className}`}
      aria-label={`Ảnh đại diện của ${name}`}
    >
      {/* Hình ảnh đại diện hoặc fallback chữ cái */}
      {hasValidImage ? (
        <img
          src={src as string}
          alt={`Ảnh đại diện của ${name}`}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full ring-2 ring-emerald-500/30 shadow-sm"
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center text-white ${bgColor} ${cfg.text} ring-2 ring-emerald-500/20 shadow-sm`}
          aria-hidden="true"
        >
          {initials}
        </div>
      )}

      {/* Nút camera nhỏ ở góc (disabled, tooltip 'Sắp ra mắt') */}
      {showCameraBadge && (
        <button
          type="button"
          disabled
          title="Sắp ra mắt"
          aria-label="Đổi ảnh đại diện (Tính năng sắp ra mắt)"
          className={`absolute bottom-0 right-0 rounded-full bg-slate-900/90 text-slate-300 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm opacity-90 cursor-not-allowed ${cfg.badgeBtn}`}
        >
          <Camera className={cfg.badgeIcon} />
        </button>
      )}
    </div>
  );
}
