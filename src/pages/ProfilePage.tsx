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
} from 'lucide-react';
import { toast } from 'sonner';
import AvatarUpload from '../components/AvatarUpload';
import { useMe } from '../hooks/useMe';

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

export default function ProfilePage() {
  const { data: user, isLoading, isError, error, refetch, isFetching } = useMe();

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HEADER CARD: Avatar lớn + Username + Email + Badges + Actions
         ======================================================== */}
      <div className="relative rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-6 sm:p-8 shadow-sm overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
          {/* Avatar Upload Component */}
          <AvatarUpload
            value={user.avatarUrl}
            name={user.username || user.email}
            size="xl"
            targetType="USER_AVATAR"
            onChange={(_secureUrl) => {
              toast.success('Ảnh đại diện đã được cập nhật thành công!');
            }}
            helperText="Nhấp hoặc kéo thả để đổi ảnh (tối đa 5MB)"
          />

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

          {/* Action Buttons */}
          <div className="flex sm:flex-col gap-2.5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
            {/* Nút Chỉnh sửa hồ sơ (onClick TODO) */}
            <button
              type="button"
              onClick={() => toast.info('Tính năng chỉnh sửa hồ sơ đang được cập nhật.')}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span>Chỉnh sửa hồ sơ</span>
            </button>

            {/* Nút Đổi mật khẩu (ẩn nếu providerType !== 'LOCAL') */}
            {user.providerType === 'LOCAL' && (
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
        {/* CARD 1: THÔNG TIN CÁ NHÂN */}
        <div className="rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-[#162338]">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Thông tin cá nhân
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Thông tin danh tính và phương thức liên hệ cơ bản
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Username */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <User className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Tên đăng nhập</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {user.username}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Mail className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Địa chỉ Email</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Phone className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Số điện thoại</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {user.phoneNumber || 'Chưa cập nhật'}
                </p>
              </div>
            </div>

            {/* Ngày sinh */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#08101a] border border-slate-200/70 dark:border-[#142338] flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#0e1828] text-slate-500 dark:text-slate-400 flex items-center justify-center shrink-0 border border-slate-200/80 dark:border-slate-800">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] uppercase font-semibold text-slate-400">Ngày sinh</p>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {formatDateOnly(user.birthday)}
                </p>
              </div>
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
          </div>
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
