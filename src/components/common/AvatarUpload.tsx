import React, { useRef, useState, useId } from 'react';
import { Camera, Loader2, Trash2, UploadCloud, AlertCircle } from 'lucide-react';
import { useImageUpload } from '../../hooks/useImageUpload';
import type {
  CloudinaryUploadResponse,
  ImageTargetType,
} from '../../types/image.types';

export type AvatarUploadSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface AvatarUploadProps {
  /** URL ảnh hiện tại (từ backend hoặc state form) */
  value?: string | null;
  /** Tên hiển thị của người dùng (dùng để sinh ảnh chữ cái fallback và màu nền) */
  name?: string;
  /** Callback kích hoạt khi ảnh tải lên Cloudinary thành công */
  onChange?: (secureUrl: string, uploadData?: CloudinaryUploadResponse) => void;
  /** Callback kích hoạt khi người dùng muốn xóa ảnh hiện tại */
  onRemove?: () => void;
  /** Mục đích upload ảnh (mặc định USER_AVATAR) */
  targetType?: ImageTargetType;
  /** Kích thước avatar (sm: 40px, md: 56px, lg: 80px, xl: 112px, 2xl: 144px) */
  size?: AvatarUploadSize;
  /** Khóa thao tác upload */
  disabled?: boolean;
  /** Cho phép nút xoá ảnh khi đã có ảnh (mặc định true) */
  showRemoveButton?: boolean;
  /** Dòng text hướng dẫn dưới avatar (ví dụ: 'PNG, JPG tối đa 5MB') */
  helperText?: string;
  /** Tuỳ biến thêm CSS container ngoài */
  className?: string;
  /** Kích thước file tối đa tính theo bytes (mặc định 5MB) */
  maxSizeBytes?: number;
}

/**
 * Bảng màu avatar đồng bộ với Zenfit Design System
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

function getStableBgColor(str: string): string {
  if (!str) return AVATAR_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[index];
}

function extractInitials(name: string): string {
  if (!name) return 'U';
  const clean = name.trim();
  const tokens = clean.split(/[\s_-]+/).filter(Boolean);
  if (tokens.length === 0) return clean.slice(0, 2).toUpperCase();
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return (tokens[0][0] + tokens[1][0]).toUpperCase();
}

/**
 * Bảng kích thước Avatar
 */
const SIZE_MAP: Record<
  AvatarUploadSize,
  {
    container: string;
    text: string;
    badgeBtn: string;
    badgeIcon: string;
    overlayIcon: string;
    overlayText: string;
    removeBtn: string;
    removeIcon: string;
  }
> = {
  sm: {
    container: 'h-10 w-10',
    text: 'text-sm font-semibold',
    badgeBtn: 'p-1',
    badgeIcon: 'h-2.5 w-2.5',
    overlayIcon: 'h-3.5 w-3.5',
    overlayText: 'hidden',
    removeBtn: 'p-0.5 -top-1 -right-1',
    removeIcon: 'h-2.5 w-2.5',
  },
  md: {
    container: 'h-14 w-14',
    text: 'text-base font-bold',
    badgeBtn: 'p-1.5',
    badgeIcon: 'h-3.5 w-3.5',
    overlayIcon: 'h-4 w-4',
    overlayText: 'hidden',
    removeBtn: 'p-1 -top-1 -right-1',
    removeIcon: 'h-3 w-3',
  },
  lg: {
    container: 'h-20 w-20',
    text: 'text-xl font-bold',
    badgeBtn: 'p-2',
    badgeIcon: 'h-4 w-4',
    overlayIcon: 'h-5 w-5',
    overlayText: 'text-[10px] font-medium mt-0.5',
    removeBtn: 'p-1.5 -top-1.5 -right-1.5',
    removeIcon: 'h-3.5 w-3.5',
  },
  xl: {
    container: 'h-28 w-28',
    text: 'text-3xl font-extrabold',
    badgeBtn: 'p-2.5',
    badgeIcon: 'h-5 w-5',
    overlayIcon: 'h-6 w-6',
    overlayText: 'text-xs font-medium mt-1',
    removeBtn: 'p-1.5 -top-2 -right-2',
    removeIcon: 'h-4 w-4',
  },
  '2xl': {
    container: 'h-36 w-36',
    text: 'text-4xl font-extrabold',
    badgeBtn: 'p-3',
    badgeIcon: 'h-6 w-6',
    overlayIcon: 'h-7 w-7',
    overlayText: 'text-xs font-semibold mt-1.5',
    removeBtn: 'p-2 -top-2.5 -right-2.5',
    removeIcon: 'h-4.5 w-4.5',
  },
};

/**
 * Component AvatarUpload
 * Cho phép xem preview, kéo thả ảnh, chọn ảnh và tải trực tiếp lên Cloudinary qua Backend Signature
 */
export function AvatarUpload({
  value,
  name = 'User',
  onChange,
  onRemove,
  targetType = 'USER_AVATAR',
  size = 'xl',
  disabled = false,
  showRemoveButton = true,
  helperText,
  className = '',
  maxSizeBytes,
}: AvatarUploadProps) {
  const inputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  // Hook upload ảnh độc lập
  const {
    isUploading,
    progress,
    error,
    previewUrl,
    upload,
    reset,
  } = useImageUpload({
    defaultTargetType: targetType,
    validation: maxSizeBytes ? { maxSizeBytes } : undefined,
    showToast: true,
    onSuccess: (secureUrl, uploadData) => {
      setImgLoadError(false);
      onChange?.(secureUrl, uploadData);
    },
  });

  const cfg = SIZE_MAP[size];
  const initials = extractInitials(name);
  const bgColor = getStableBgColor(name);

  // Ảnh hiển thị ưu tiên preview cục bộ, sau đó đến prop value
  const displayImageUrl = previewUrl || value;
  const hasDisplayImage = Boolean(displayImageUrl && !imgLoadError);

  // Mở file picker khi click
  const handleTriggerClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  // Xử lý chọn file từ input
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await upload(file, targetType);
    }
    // Reset value để có thể chọn lại cùng 1 file nếu vừa bị lỗi
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Kéo thả file ảnh
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || isUploading) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await upload(file, targetType);
    }
  };

  // Xóa ảnh đại diện
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUploading) return;
    reset();
    setImgLoadError(false);
    onRemove?.();
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      {/* Hidden File Input */}
      <input
        id={inputId}
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label="Tải lên ảnh đại diện"
      />

      {/* Avatar Container Box */}
      <div
        className="relative group focus-within:ring-2 focus-within:ring-emerald-500 focus-within:ring-offset-2 rounded-full"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div
          role="button"
          tabIndex={disabled || isUploading ? -1 : 0}
          onClick={handleTriggerClick}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled && !isUploading) {
              e.preventDefault();
              handleTriggerClick();
            }
          }}
          className={`relative rounded-full overflow-hidden flex items-center justify-center transition-all duration-200 cursor-pointer shadow-sm
            ${cfg.container}
            ${
              isDragOver
                ? 'ring-4 ring-emerald-500 scale-105 shadow-emerald-500/20'
                : 'ring-2 ring-slate-200 dark:ring-slate-700/80 hover:ring-emerald-500/50 dark:hover:ring-emerald-400/50'
            }
            ${disabled ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}
          `}
          title={isUploading ? 'Đang tải ảnh...' : 'Nhấp hoặc kéo thả để đổi ảnh'}
        >
          {/* Ảnh đại diện hiển thị */}
          {hasDisplayImage ? (
            <img
              src={displayImageUrl as string}
              alt={`Ảnh đại diện của ${name}`}
              onError={() => setImgLoadError(true)}
              className={`w-full h-full object-cover transition-transform duration-300 ${
                isUploading ? 'blur-xs scale-95' : 'group-hover:scale-105'
              }`}
            />
          ) : (
            <div
              className={`w-full h-full rounded-full flex items-center justify-center text-white ${bgColor} ${cfg.text}`}
              aria-hidden="true"
            >
              {initials}
            </div>
          )}

          {/* Lớp phủ Hover (Khi không trong quá trình upload) */}
          {!isUploading && !disabled && (
            <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white backdrop-blur-[2px]">
              <UploadCloud className={`${cfg.overlayIcon} text-emerald-400`} />
              <span className={cfg.overlayText}>Đổi ảnh</span>
            </div>
          )}

          {/* Overlay hiển thị Tiến trình Upload */}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2 z-20">
              <Loader2 className={`${cfg.overlayIcon} animate-spin text-emerald-400`} />
              {size !== 'sm' && (
                <div className="mt-1 flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-emerald-300">
                    {progress}%
                  </span>
                  {/* Thanh Progress nhỏ ở đáy nếu avatar kích thước từ lg trở lên */}
                  {(size === 'lg' || size === 'xl' || size === '2xl') && (
                    <div className="w-12 h-1 bg-white/20 rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nút Camera Badge ở góc dưới bên phải */}
        {!disabled && (
          <button
            type="button"
            onClick={handleTriggerClick}
            disabled={isUploading}
            aria-label="Chọn ảnh từ thiết bị"
            className={`absolute bottom-0 right-0 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md border-2 border-white dark:border-[#0c1626] transition-transform duration-200 hover:scale-110 active:scale-95 ${cfg.badgeBtn}`}
            title="Tải ảnh mới"
          >
            {isUploading ? (
              <Loader2 className={`${cfg.badgeIcon} animate-spin`} />
            ) : (
              <Camera className={cfg.badgeIcon} />
            )}
          </button>
        )}

        {/* Nút Xoá ảnh ở góc trên bên phải */}
        {showRemoveButton && hasDisplayImage && !isUploading && !disabled && onRemove && (
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Xoá ảnh đại diện"
            className={`absolute rounded-full bg-rose-500 hover:bg-rose-600 text-white shadow-md border-2 border-white dark:border-[#0c1626] transition-transform duration-200 hover:scale-110 active:scale-95 z-10 ${cfg.removeBtn}`}
            title="Xoá ảnh đại diện"
          >
            <Trash2 className={cfg.removeIcon} />
          </button>
        )}
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-rose-500 text-xs max-w-xs text-center font-medium animate-in fade-in">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Helper text chú thích định dạng & kích thước */}
      {helperText && !error && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center">
          {helperText}
        </p>
      )}
    </div>
  );
}

export default AvatarUpload;
