import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  KeyRound,
  Pencil,
  AlertCircle,
  RefreshCw,
  Award,
  Globe,
  Layers,
  Check,
  X,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';
import AvatarUpload from '../components/AvatarUpload';
import { useMe } from '../hooks/useMe';
import { useUpdateUser } from '../hooks/useUpdateUser';

/**
 * Format ngày giờ theo chuẩn vi-VN: dd/MM/yyyy HH:mm
 */
function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Chưa cập nhật';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Format ngày sinh theo chuẩn vi-VN: dd/MM/yyyy
 */
function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return 'Chưa cập nhật';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Chuyển ngày sinh về dạng YYYY-MM-DD để bind chuẩn vào input type="date"
 */
function toDateInputValue(dateStr?: string | null): string {
  if (!dateStr) return '';
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  } catch {
    return '';
  }
}

export default function ProfilePage() {
  const { data: user, isLoading, isError, error, refetch, isFetching } = useMe();
  const { mutateAsync: updateUserMutation, isPending: isUpdatingUser } = useUpdateUser();

  // State chế độ chỉnh sửa inline (KHÔNG DÙNG POP-UP)
  const [isEditing, setIsEditing] = useState(false);

  // Form input state
  const [formData, setFormData] = useState({
    username: '',
    phoneNumber: '',
    birthday: '',
  });
  const [formErrors, setFormErrors] = useState<{
    username?: string;
    phoneNumber?: string;
    birthday?: string;
  }>({});

  // State quản lý avatar chọn mới để preview trước khi lưu
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState<boolean>(false);

  // Dọn dẹp URL Blob preview khi unmount hoặc đổi ảnh
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  // Bắt đầu chỉnh sửa
  const handleStartEdit = () => {
    if (!user) return;
    setFormData({
      username: user.username || '',
      phoneNumber: user.phoneNumber || '',
      birthday: toDateInputValue(user.birthday),
    });
    setFormErrors({});
    setIsEditing(true);
  };

  // Hủy chỉnh sửa: dọn dẹp preview và khôi phục dữ liệu ban đầu
  const handleCancelEdit = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview(null);
    setSelectedAvatarFile(null);
    setIsAvatarRemoved(false);
    setFormErrors({});
    setIsEditing(false);
  };

  // Người dùng chọn file avatar mới: Validate & Hiển thị preview ngay lập tức
  const handleAvatarFileSelect = (file: File) => {
    // 1. Kiểm tra dung lượng < 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    // 2. Kiểm tra định dạng (jpg, jpeg, png, webp)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast.error('Định dạng ảnh không được hỗ trợ (chỉ chấp nhận JPG, PNG, WEBP).');
      return;
    }

    // Dọn dẹp preview cũ nếu có
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
    setSelectedAvatarFile(file);
    setIsAvatarRemoved(false);
    setIsEditing(true); // Tự động mở chế độ chỉnh sửa để hiển thị nút Lưu & Hủy
    toast.info('Đã chọn ảnh đại diện mới. Bấm "Lưu thay đổi" để hoàn tất cập nhật.');
  };

  // Người dùng gỡ ảnh đại diện
  const handleAvatarRemove = () => {
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarPreview('');
    setSelectedAvatarFile(null);
    setIsAvatarRemoved(true);
    setIsEditing(true);
    toast.info('Đã chọn gỡ ảnh đại diện. Bấm "Lưu thay đổi" để áp dụng.');
  };

  // Thay đổi input text/date
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Lưu thông tin cá nhân: Upload ảnh lên Cloudinary (nếu có) + Gọi PUT /api/users/me/update
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user) return;

    // Validate client-side
    const errors: typeof formErrors = {};
    if (!formData.username.trim()) {
      errors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.trim().length < 3) {
      errors.username = 'Tên đăng nhập tối thiểu 3 ký tự';
    }

    if (formData.phoneNumber.trim()) {
      const cleanPhone = formData.phoneNumber.replace(/[\s.-]/g, '');
      if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(cleanPhone)) {
        errors.phoneNumber = 'Số điện thoại không hợp lệ (cần 10 số, bắt đầu bằng 03, 05, 07, 08, 09)';
      }
    }

    if (formData.birthday) {
      const selected = new Date(formData.birthday);
      const today = new Date();
      if (selected > today) {
        errors.birthday = 'Ngày sinh không thể lớn hơn ngày hiện tại';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      // Xác định avatarUrl truyền lên backend:
      // - Nếu gỡ avatar -> ''
      // - Nếu có file mới -> để undefined để userService tự upload Cloudinary và điền secure_url
      // - Nếu không đổi -> giữ nguyên user.avatarUrl
      const finalAvatarUrl = isAvatarRemoved
        ? ''
        : selectedAvatarFile
        ? undefined
        : user.avatarUrl || undefined;

      await updateUserMutation({
        data: {
          username: formData.username.trim(),
          phoneNumber: formData.phoneNumber.trim() || undefined,
          avatarUrl: finalAvatarUrl,
          birthday: formData.birthday || null,
        },
        newAvatarFile: selectedAvatarFile,
      });

      toast.success('Cập nhật thông tin người dùng thành công!');

      // Dọn dẹp preview state
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      setAvatarPreview(null);
      setSelectedAvatarFile(null);
      setIsAvatarRemoved(false);
      setIsEditing(false);
    } catch (err: unknown) {
      const backendMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Cập nhật thất bại, vui lòng kiểm tra lại.');
      toast.error(backendMessage);
    }
  };

  // 1. TRẠNG THÁI LOADING (SKELETON)
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 animate-pulse" aria-busy="true">
        {/* Header Card Skeleton */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-3 w-full text-center sm:text-left">
            <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto sm:mx-0" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto sm:mx-0" />
            <div className="flex gap-2 justify-center sm:justify-start pt-2">
              <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full" />
              <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
          </div>
        </div>

        {/* 2 Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="space-y-3 pt-2">
              <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />
              <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />
              <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            </div>
          </div>

          <div className="rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4">
            <div className="h-5 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="space-y-3 pt-2">
              <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />
              <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />
              <div className="h-12 bg-slate-100 dark:bg-slate-850 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. TRẠNG THÁI ERROR (THÔNG BÁO LỖI + NÚT THỬ LẠI)
  if (isError || !user) {
    return (
      <div className="max-w-2xl mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1626] border border-rose-200 dark:border-rose-900/40 text-center shadow-lg space-y-4">
        <div className="h-14 w-14 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Không thể tải thông tin người dùng
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {error instanceof Error ? error.message : 'Đã có lỗi xảy ra khi kết nối máy chủ.'}
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-md disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            <span>{isFetching ? 'Đang thử lại...' : 'Thử lại'}</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. TRẠNG THÁI SUCCESS: HIỂN THỊ DỮ LIỆU
  const isActive = user.status === 'ACTIVE';

  // Xác định ảnh hiển thị trên avatar (ưu tiên preview khi chọn file mới)
  const displayAvatarUrl = isAvatarRemoved
    ? null
    : avatarPreview !== null
    ? avatarPreview
    : user.avatarUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HEADER CARD: Avatar lớn + Username + Email + Badges + Actions
         ======================================================== */}
      <div className="relative rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Upload Component: Hỗ trợ Preview ngay và Upload Cloudinary khi bấm Lưu */}
          <div className="flex flex-col items-center">
            <AvatarUpload
              value={displayAvatarUrl}
              name={formData.username || user.username || user.email}
              size="xl"
              targetType="USER_AVATAR"
              disabled={isUpdatingUser}
              onFileSelect={handleAvatarFileSelect}
              onRemove={handleAvatarRemove}
              helperText={
                selectedAvatarFile
                  ? 'Ảnh mới đang chờ lưu'
                  : 'Nhấp hoặc kéo thả để đổi ảnh (tối đa 5MB)'
              }
            />
            {selectedAvatarFile && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse mt-1.5">
                <Sparkles className="h-3 w-3" />
                Ảnh mới chưa lưu
              </span>
            )}
          </div>

          {/* User Meta Information */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white truncate">
                {user.username}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
              {user.email}
            </p>

            {/* Badges Container */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {/* Status Badge */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#00d68f] border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                  }`}
                />
                <span>{isActive ? 'Hoạt động (ACTIVE)' : user.status}</span>
              </span>

              {/* Email Verified Badge */}
              {user.emailVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Đã xác thực email</span>
                </span>
              )}

              {/* Provider Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#142338] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60">
                <Globe className="h-3.5 w-3.5" />
                <span>{user.providerType}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons: Chuyển đổi giữa Chế độ Xem và Chế độ Chỉnh sửa (KHÔNG DÙNG POP-UP) */}
          <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            ) : (
              <div className="flex sm:flex-col gap-2 w-full">
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isUpdatingUser}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60 active:scale-95"
                >
                  {isUpdatingUser ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Check className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {isUpdatingUser
                      ? selectedAvatarFile
                        ? 'Đang tải ảnh & lưu...'
                        : 'Đang lưu...'
                      : 'Lưu thay đổi'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdatingUser}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 active:scale-95"
                >
                  <X className="h-3.5 w-3.5" />
                  <span>Hủy</span>
                </button>
              </div>
            )}

            {/* Nút Đổi mật khẩu (ẩn nếu providerType !== 'LOCAL' hoặc đang chỉnh sửa) */}
            {user.providerType === 'LOCAL' && !isEditing && (
              <button
                type="button"
                onClick={() => toast.info('Tính năng đổi mật khẩu đang được cập nhật.')}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#162438] dark:hover:bg-[#1c304a] text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-200 dark:border-slate-700/60 transition-colors cursor-pointer"
              >
                <KeyRound className="h-3.5 w-3.5 text-amber-500" />
                <span>Đổi mật khẩu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================
          GRID: CARD THÔNG TIN CÁ NHÂN & CARD TÀI KHOẢN
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: THÔNG TIN CÁ NHÂN (CHỈNH SỬA TRỰC TIẾP TẠI ĐÂY) */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#162338]">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Thông tin cá nhân
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {isEditing
                    ? 'Chỉnh sửa trực tiếp trên giao diện (không dùng pop-up)'
                    : 'Thông tin danh tính và phương thức liên hệ cơ bản'}
                </p>
              </div>
            </div>
            {isEditing && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-[#00d68f] bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Đang chỉnh sửa
              </span>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-3">
            {/* Username */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Tên đăng nhập</p>
                  {!isEditing ? (
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      {user.username}
                    </p>
                  ) : (
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Nhập tên đăng nhập..."
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0e1828] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  )}
                </div>
              </div>
              {isEditing && formErrors.username && (
                <p className="text-[11px] text-rose-500 pl-11">{formErrors.username}</p>
              )}
            </div>

            {/* Email (Readonly) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Địa chỉ Email</p>
                  {isEditing && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Lock className="h-3 w-3" /> Cố định
                    </span>
                  )}
                </div>
                <p className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                  <Phone className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Số điện thoại</p>
                  {!isEditing ? (
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        user.phoneNumber ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {user.phoneNumber || 'Chưa cập nhật'}
                    </p>
                  ) : (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="VD: 0912345678"
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-white dark:bg-[#0e1828] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                    />
                  )}
                </div>
              </div>
              {isEditing && formErrors.phoneNumber && (
                <p className="text-[11px] text-rose-500 pl-11">{formErrors.phoneNumber}</p>
              )}
            </div>

            {/* Ngày sinh (Xử lý nghiệp vụ Backend: 1 lần/năm) */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] space-y-1.5">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                  <Calendar className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase font-semibold text-slate-400">Ngày sinh</p>
                    {isEditing && user.canUpdateBirthday === false && (
                      <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Lock className="h-3 w-3" /> Đã đổi trong năm
                      </span>
                    )}
                  </div>
                  {!isEditing ? (
                    <p
                      className={`text-xs font-bold mt-0.5 ${
                        user.birthday ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400'
                      }`}
                    >
                      {formatDateOnly(user.birthday)}
                    </p>
                  ) : user.canUpdateBirthday === false ? (
                    <div className="mt-1 space-y-1">
                      <input
                        type="text"
                        disabled
                        value={formatDateOnly(user.birthday)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-500 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 flex flex-wrap items-center gap-1">
                        <span>🔒 Bạn chỉ được thay đổi ngày sinh 1 lần mỗi năm.</span>
                        {user.nextBirthdayUpdateAt && (
                          <span className="text-[10px] text-slate-500">
                            (Mở lại sau: {formatDateTime(user.nextBirthdayUpdateAt)})
                          </span>
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="mt-1 space-y-1">
                      <input
                        type="date"
                        name="birthday"
                        value={formData.birthday}
                        onChange={handleInputChange}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#0e1828] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                      />
                      <p className="text-[10px] text-slate-400">
                        💡 Lưu ý: Hệ thống chỉ cho phép đổi ngày sinh 1 lần mỗi năm.
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {isEditing && formErrors.birthday && (
                <p className="text-[11px] text-rose-500 pl-11">{formErrors.birthday}</p>
              )}
            </div>

            {/* Loại tài khoản */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Loại tài khoản</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.providerType === 'LOCAL'
                    ? 'Tài khoản thường (LOCAL)'
                    : 'Tài khoản liên kết Google'}
                </p>
              </div>
            </div>

            {/* Action Bar cuối thẻ Thông tin cá nhân khi đang ở chế độ chỉnh sửa */}
            {isEditing && (
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-[#162338]">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isUpdatingUser}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-60 cursor-pointer active:scale-95"
                >
                  {isUpdatingUser ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>
                        {selectedAvatarFile ? 'Đang tải ảnh & lưu...' : 'Đang lưu...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Lưu thông tin</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* CARD 2: TÀI KHOẢN */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#162338]">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tài khoản</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Điểm tích lũy và mốc thời gian hệ thống
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Điểm tích lũy */}
            <div className="p-3.5 rounded-xl bg-gradient-to-tr from-amber-500/10 to-orange-500/5 dark:from-[#1b1c18] dark:to-[#0f1722] border border-amber-500/25 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Điểm tích lũy</p>
                  <p className="text-base font-extrabold text-amber-600 dark:text-amber-400">
                    {user.points.toLocaleString('vi-VN')} điểm
                  </p>
                </div>
              </div>
              <Sparkles className="h-4 w-4 text-amber-500/50" />
            </div>

            {/* Ngày tham gia */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Ngày tham gia</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDateTime(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Cập nhật lần cuối */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Clock className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">
                  Cập nhật lần cuối
                </p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDateTime(user.updatedAt)}
                </p>
              </div>
            </div>

            {/* Trạng thái xác thực email */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400">Xác minh Email</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.emailVerified ? 'Đã hoàn tất xác minh' : 'Chưa xác minh'}
                </p>
              </div>
              {user.emailVerified ? (
                <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Xác thực
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-amber-500 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  Chờ xác minh
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
