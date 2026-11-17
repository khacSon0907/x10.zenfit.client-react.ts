import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Search,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  AlertCircle,
  Filter,
  CheckCircle2,
  Lock,
  Unlock,
  Eye,
  X,
  Award,
} from 'lucide-react';
import { toast } from 'sonner';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../types/user.types';
import Avatar from '../../components/Avatar';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [providerFilter, setProviderFilter] = useState<string>('ALL');

  // Selected User for Detail Modal
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  // Load users from backend /api/users/all
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
        'Không thể kết nối đến máy chủ để lấy danh sách người dùng.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Statistics
  const totalUsers = users.length;
  const activeUsers = useMemo(
    () => users.filter((u) => u.status === 'ACTIVE').length,
    [users]
  );
  const googleUsers = useMemo(
    () => users.filter((u) => u.providerType === 'GOOGLE').length,
    [users]
  );
  const emailUsers = useMemo(
    () => users.filter((u) => u.providerType === 'LOCAL').length,
    [users]
  );

  // Filtered Users List
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phoneNumber?.toLowerCase().includes(q) ||
        u.name?.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'ALL' || u.status === statusFilter;

      const matchProvider =
        providerFilter === 'ALL' || u.providerType === providerFilter;

      return matchSearch && matchStatus && matchProvider;
    });
  }, [users, searchQuery, statusFilter, providerFilter]);

  // Toggle user lock/unlock (Client-side simulation with toast)
  const handleToggleLock = (user: UserProfile) => {
    const isLocked = user.status === 'BANNED';
    const nextStatus = isLocked ? 'ACTIVE' : 'BANNED';

    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
    );

    if (isLocked) {
      toast.success(`Đã mở khóa tài khoản người dùng "${user.name || user.username}"!`);
    } else {
      toast.warning(`Đã tạm khóa tài khoản người dùng "${user.name || user.username}"!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-purple-400 mb-1">
            <Users className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">
              Quản trị người dùng ứng dụng
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Danh sách Người dùng Ứng dụng (App Users)
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Kiểm tra số lượng người dùng đang sử dụng ứng dụng ZenFit, theo dõi tài khoản trực tiếp từ hệ thống.
          </p>
        </div>

        <button
          onClick={loadUsers}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#170a32] border border-purple-500/25 text-purple-200 hover:text-white hover:bg-purple-900/40 transition-colors shadow-xs cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* 2. Thẻ thống kê số lượng người dùng đang sử dụng app */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng người dùng đang dùng app */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/20 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Tổng người dùng đang dùng app</p>
              <h3 className="text-3xl font-extrabold text-white mt-1">
                {isLoading ? '...' : totalUsers}
              </h3>
              <p className="text-[11px] text-purple-400/80 mt-1">
                Tài khoản đã đăng ký trên hệ thống
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Đang hoạt động */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/20 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Đang hoạt động</p>
              <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                {isLoading ? '...' : activeUsers}
              </h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">
                {totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}% tổng số tài khoản` : 'Chưa có dữ liệu'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Đăng nhập bằng Google */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/20 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Tài khoản Google</p>
              <h3 className="text-3xl font-extrabold text-rose-400 mt-1">
                {isLoading ? '...' : googleUsers}
              </h3>
              <p className="text-[11px] text-rose-400/80 mt-1">
                Đăng nhập qua Google OAuth2
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0 font-bold text-lg">
              G
            </div>
          </div>
        </div>

        {/* Card 4: Đăng ký Email & Mật khẩu */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/20 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Email & Mật khẩu</p>
              <h3 className="text-3xl font-extrabold text-blue-400 mt-1">
                {isLoading ? '...' : emailUsers}
              </h3>
              <p className="text-[11px] text-blue-400/80 mt-1">
                Tài khoản đăng ký trực tiếp
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
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

      {/* 3. Toolbar: Tìm kiếm & Lọc */}
      <div className="p-4 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Tên, Username, Email, Số điện thoại..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a0c36] border border-purple-500/20 text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-purple-300/60 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
          </span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ACTIVE', label: '🟢 Hoạt động' },
            { id: 'BANNED', label: '🔴 Đã khóa' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-[#1a0c36] text-purple-300/70 hover:text-white hover:bg-purple-900/30 border border-purple-500/15'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="h-4 w-px bg-purple-500/30 mx-1 hidden sm:block" />
          <span className="text-xs text-purple-300/60 mr-1 hidden sm:inline">Phương thức:</span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'GOOGLE', label: 'Google' },
            { id: 'LOCAL', label: 'Email' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setProviderFilter(tab.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                providerFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-[#1a0c36] text-purple-300/70 hover:text-white hover:bg-purple-900/30 border border-purple-500/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Bảng danh sách người dùng */}
      <div className="rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-xl backdrop-blur-md overflow-hidden">
        {/* Header bảng */}
        <div className="px-5 py-4 border-b border-purple-500/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white">Danh sách tài khoản</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-950/80 text-purple-300 border border-purple-500/30">
              {filteredUsers.length} người dùng
            </span>
          </div>
          <span className="text-xs text-purple-300/60">
            Dữ liệu đồng bộ trực tiếp từ máy chủ
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-purple-300/60">Đang tải danh sách người dùng...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="h-10 w-10 text-purple-500/40 mx-auto" />
            <p className="text-sm font-semibold text-white">
              {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
            </p>
            <p className="text-xs text-purple-300/60 max-w-sm mx-auto">
              {searchQuery
                ? 'Thử thay đổi từ khóa tìm kiếm bằng tên, email hoặc số điện thoại khác.'
                : 'Hiện tại chưa ghi nhận người dùng nào trên hệ thống.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-purple-500/15 bg-purple-950/20 text-purple-300/70 font-medium text-[11px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Người dùng</th>
                  <th className="py-3.5 px-4">Thông tin liên hệ</th>
                  <th className="py-3.5 px-4">Phương thức</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Ngày tham gia</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-white">
                {filteredUsers.map((u) => {
                  const displayName = u.name || u.username || 'Người dùng';
                  const isGoogle = u.providerType === 'GOOGLE';
                  const isActive = u.status === 'ACTIVE';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-purple-950/30 transition-colors group"
                    >
                      {/* Cột 1: Avatar + Tên + Username */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={u.avatarUrl}
                            name={displayName}
                            size="sm"
                            showCameraBadge={false}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-white truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-purple-400 font-mono truncate">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Email & Số điện thoại */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-purple-200">
                            <Mail className="h-3 w-3 text-purple-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          {u.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-[11px] text-purple-300/70">
                              <Phone className="h-3 w-3 text-purple-400 shrink-0" />
                              <span>{u.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cột 3: Phương thức đăng nhập */}
                      <td className="py-3.5 px-4">
                        {isGoogle ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                            Tài khoản Google
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                            Email & Mật khẩu
                          </span>
                        )}
                      </td>

                      {/* Cột 4: Trạng thái tài khoản */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                            isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                            }`}
                          />
                          {isActive ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>

                      {/* Cột 5: Ngày tham gia */}
                      <td className="py-3.5 px-4 text-purple-300/80 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-purple-400" />
                          <span>
                            {u.createdAt
                              ? new Date(u.createdAt).toLocaleDateString('vi-VN', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })
                              : '---'}
                          </span>
                        </div>
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-900/40 transition-colors cursor-pointer"
                            title="Xem chi tiết người dùng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleLock(u)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? 'text-rose-400 hover:text-rose-300 hover:bg-rose-950/40'
                                : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/40'
                            }`}
                            title={isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {isActive ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Unlock className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. Modal Chi tiết Người dùng */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#120826] border border-purple-500/25 rounded-2xl shadow-2xl text-white overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                Hồ sơ Người dùng Ứng dụng
              </h3>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4 text-xs">
              {/* Header profile info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-purple-950/40 border border-purple-500/20">
                <Avatar
                  src={selectedUser.avatarUrl}
                  name={selectedUser.name || selectedUser.username}
                  size="md"
                  showCameraBadge={false}
                />
                <div className="min-w-0">
                  <p className="text-base font-bold text-white">
                    {selectedUser.name || selectedUser.username || 'Người dùng'}
                  </p>
                  <p className="text-purple-300 font-mono text-xs">
                    @{selectedUser.username}
                  </p>
                  <p className="text-[11px] text-purple-400/80 mt-0.5">
                    ID: {selectedUser.id}
                  </p>
                </div>
              </div>

              {/* Grid 2 cột chi tiết */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[#1b0d38] border border-purple-500/15">
                  <span className="text-[11px] text-purple-300/70 block">Email:</span>
                  <span className="font-semibold text-white break-all">{selectedUser.email}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1b0d38] border border-purple-500/15">
                  <span className="text-[11px] text-purple-300/70 block">Số điện thoại:</span>
                  <span className="font-semibold text-white">{selectedUser.phoneNumber || 'Chưa cập nhật'}</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1b0d38] border border-purple-500/15">
                  <span className="text-[11px] text-purple-300/70 block">Phương thức đăng nhập:</span>
                  <span className="font-semibold text-white">
                    {selectedUser.providerType === 'GOOGLE' ? 'Google OAuth2' : 'Email & Mật khẩu'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#1b0d38] border border-purple-500/15">
                  <span className="text-[11px] text-purple-300/70 block">Trạng thái tài khoản:</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedUser.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#1b0d38] border border-purple-500/15">
                  <span className="text-[11px] text-purple-300/70 block">Ngày tham gia:</span>
                  <span className="font-semibold text-white">
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString('vi-VN')
                      : '---'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#1b0d38] border border-purple-500/15 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-purple-300/70 block">Điểm thưởng ZenPoints:</span>
                    <span className="font-bold text-amber-300 text-sm">{selectedUser.points || 0} điểm</span>
                  </div>
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="px-5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
