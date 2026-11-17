import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Plus,
  Lock,
  Unlock,
  Mail,
  Phone,
  Clock,
  Settings,
  X,
  Check,
  RefreshCw,
  Search,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../types/user.types';

// Default Avatars matching the design
const DEFAULT_AVATARS: string[] = [
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
];

export default function AdminPTManagementPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating new PT
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planName, setPlanName] = useState<'Free' | 'Plus' | 'Pro'>('Free');

  // Gọi API GET /api/users/all
  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await userApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách người dùng từ /api/users/all:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        'Không thể kết nối đến máy chủ để tải danh sách người dùng.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle Lock / Unlock user
  const handleToggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const isCurrentlyActive = u.status === 'ACTIVE';
          const nextStatus = isCurrentlyActive ? 'BANNED' : 'ACTIVE';
          if (nextStatus === 'BANNED') {
            toast.warning(`Đã khóa tài khoản "${u.name || u.username}"`);
          } else {
            toast.success(`Đã mở khóa tài khoản "${u.name || u.username}"`);
          }
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  // Handle Create PT
  const handleCreatePT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Vui lòng điền đầy đủ họ tên và email!');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      username: email.trim().split('@')[0],
      name: fullName.trim(),
      email: email.trim(),
      phoneNumber: phone.trim() || '0901234567',
      status: 'ACTIVE',
      providerType: 'LOCAL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailVerified: true,
      verifiedAt: new Date().toISOString(),
      avatarUrl: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      birthday: null,
      birthdayUpdateCount: 0,
      points: 0,
      birthdayLastUpdatedAt: null,
      nextBirthdayUpdateAt: null,
      canUpdateBirthday: true,
      roleIds: ['ROLE_PT'],
    };

    setUsers((prev) => [newUser, ...prev]);
    toast.success(`Tạo thành công tài khoản PT "${newUser.name}"!`);
    setIsCreateModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  // Lọc người dùng theo từ khóa tìm kiếm
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase().trim();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================
          1. PAGE HEADER
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shrink-0 shadow-lg shadow-purple-600/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Quản lý Huấn luyện viên (PT)</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-300/60 mt-0.5">
              Danh sách tài khoản PT, gói thuê bao và trạng thái hoạt động hiện tại.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Làm mới dữ liệu */}
          <button
            type="button"
            onClick={loadUsers}
            disabled={isLoading}
            className="p-2.5 rounded-xl border border-purple-500/25 bg-[#170c33]/80 text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer disabled:opacity-50"
            title="Làm mới dữ liệu từ server"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          </button>

          {/* Nút Tạo tài khoản PT (Purple Gradient) */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo tài khoản PT</span>
          </button>

          {/* Settings / Widget Icon */}
          <button
            type="button"
            title="Cài đặt phân hệ"
            className="p-2.5 rounded-xl border border-purple-500/25 bg-[#170c33]/80 text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Toolbar Tìm kiếm */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm theo tên, username, email, số điện thoại..."
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#170c33]/80 border border-purple-500/20 text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
        />
      </div>

      {/* Lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 flex items-start justify-between gap-3 text-rose-300">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
            <div>
              <p className="text-sm font-semibold">Lỗi tải danh sách người dùng</p>
              <p className="text-xs mt-0.5 opacity-90">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </button>
        </div>
      )}

      {/* ========================================================
          2. USER / PT LIST CARD (Loaded from /api/users/all)
         ======================================================== */}
      <div className="bg-[#120826]/90 rounded-3xl border border-purple-500/15 backdrop-blur-md shadow-2xl overflow-hidden divide-y divide-purple-500/15">
        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-purple-400 mx-auto mb-3" />
            <p className="text-sm text-purple-200">Đang đồng bộ danh sách tài khoản từ hệ thống...</p>
            <p className="text-xs text-purple-300/60 mt-1">GET /api/users/all</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="h-10 w-10 text-purple-500/40 mx-auto" />
            <p className="text-base font-semibold text-white">
              {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có tài khoản nào'}
            </p>
            <p className="text-xs text-purple-300/60 max-w-sm mx-auto">
              {searchQuery
                ? 'Thử thay đổi từ khóa tìm kiếm bằng tên, email hoặc số điện thoại khác.'
                : 'Hiện tại hệ thống chưa ghi nhận tài khoản người dùng nào.'}
            </p>
          </div>
        ) : (
          filteredUsers.map((u, idx) => {
            const displayName = u.name || u.username || 'Người dùng';
            const avatarUrl =
              u.avatarUrl ||
              DEFAULT_AVATARS[idx % DEFAULT_AVATARS.length];
            const isActive = u.status === 'ACTIVE';
            const isGoogle = u.providerType === 'GOOGLE';

            return (
              <div
                key={u.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-purple-950/20 transition-colors"
              >
                {/* Left Info: Avatar + Details */}
                <div className="flex items-center gap-4 min-w-0">
                  {/* Round Avatar Photo */}
                  <div className="relative shrink-0">
                    <img
                      src={avatarUrl}
                      alt={displayName}
                      className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/30 shadow-md"
                    />
                    {isActive ? (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#120826]" />
                    ) : (
                      <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#120826]" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="min-w-0">
                    {/* Name + Badges row */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                        {displayName}
                      </span>

                      {/* Username tag */}
                      <span className="text-[11px] font-mono text-purple-400 bg-purple-950/70 px-2 py-0.5 rounded-md border border-purple-500/25">
                        @{u.username}
                      </span>

                      {/* Provider Badge */}
                      {isGoogle ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                          Google OAuth
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2a1352] text-purple-300 border border-purple-500/40">
                          Email & Mật khẩu
                        </span>
                      )}

                      {/* Status Badge */}
                      {isActive ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0c3624] text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                          Đang hoạt động
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3b0d18] text-rose-400 border border-rose-500/50 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                          Đã khóa
                        </span>
                      )}
                    </div>

                    {/* Contact Row */}
                    <div className="text-xs text-purple-300/60 mt-1.5 flex items-center gap-3 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 opacity-70" />
                        {u.email}
                      </span>
                      {u.phoneNumber && (
                        <>
                          <span className="opacity-40">•</span>
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 opacity-70" />
                            {u.phoneNumber}
                          </span>
                        </>
                      )}
                      <span className="opacity-40">•</span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 opacity-70" />
                        Ngày tham gia:{' '}
                        {u.createdAt
                          ? new Date(u.createdAt).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })
                          : 'Mới đăng ký'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Button (Khóa / Mở khóa) */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {isActive ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/50 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 hover:border-rose-400 transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <Lock className="h-3.5 w-3.5" />
                      <span>Khóa tài khoản</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u.id)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold border border-emerald-500/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 hover:border-emerald-400 transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <Unlock className="h-3.5 w-3.5" />
                      <span>Mở khóa</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ========================================================
          3. MODAL: TẠO TÀI KHOẢN PT
         ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#140b2b] border border-purple-500/25 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Tạo tài khoản Huấn luyện viên (PT)</h3>
                <p className="text-xs text-purple-300/60 mt-0.5">
                  Cấp quyền truy cập hệ thống và kích hoạt gói thuê bao
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePT} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn Nam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Email đăng nhập <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nam.pt@zenfit.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Gói thuê bao ban đầu
                </label>
                <select
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value as 'Free' | 'Plus' | 'Pro')}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Free">Gói Miễn phí (Tối đa 5 học viên)</option>
                  <option value="Plus">Gói Nâng cao (Tối đa 25 học viên)</option>
                  <option value="Pro">Gói Chuyên nghiệp (Tối đa 50 học viên)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-900/30 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Tạo tài khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
