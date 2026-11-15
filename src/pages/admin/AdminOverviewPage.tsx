import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  UserCheck,
  CircleDollarSign,
  TrendingUp,
  RefreshCw,
  Search,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Phone,
  Mail,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useApp } from '../../context/AppContext';
import { userApi } from '../../api/userApi';
import type { UserProfile } from '../../types/user.types';
import Avatar from '../../components/Avatar';

export default function AdminOverviewPage() {
  const { adminPTs } = useApp();

  // Danh sách users lấy trực tiếp từ Backend GET /api/users/all
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Hàm gọi API /api/users/all
  const loadAllUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
    try {
      const data = await userApi.getAllUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách người dùng từ /api/users/all:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        'Không thể kết nối đến máy chủ để lấy danh sách người dùng.';
      setUsersError(msg);
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  // Thống kê phân loại users
  const activeUsersCount = useMemo(() => {
    return users.filter((u) => u.status === 'ACTIVE').length;
  }, [users]);

  // Lọc tìm kiếm người dùng theo username, email, phone
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
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tổng quan Quản trị Hệ thống
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Theo dõi số lượng người dùng đang sử dụng web, HLV (PT), gói thuê bao và doanh thu ZenFit.
          </p>
        </div>

        <button
          onClick={loadAllUsers}
          disabled={isLoadingUsers}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoadingUsers ? 'animate-spin text-indigo-600' : ''}`} />
          <span>Làm mới dữ liệu</span>
        </button>
      </div>

      {/* Grid thẻ số liệu thống kê (4 Thẻ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Người dùng đang sử dụng web (lấy từ /api/users/all) */}
        <StatCard
          title="Người dùng đang dùng web"
          value={isLoadingUsers ? '...' : users.length}
          subtitle={
            isLoadingUsers
              ? 'Đang đồng bộ /api/users/all...'
              : `${activeUsersCount} tài khoản đang hoạt động`
          }
          icon={<Users className="h-5 w-5" />}
          highlightColor="indigo"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />

        {/* Thẻ 2: Tổng số HLV (PT) */}
        <StatCard
          title="Tổng số HLV (PT)"
          value={adminPTs.length}
          subtitle={`${adminPTs.length} PT đang hợp tác`}
          icon={<UserCheck className="h-5 w-5" />}
          highlightColor="emerald"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />

        {/* Thẻ 3: Doanh thu thuê bao tháng */}
        <StatCard
          title="Doanh thu thuê bao tháng"
          value="4.500.000 đ"
          subtitle="Tăng 12% so với tháng trước"
          icon={<CircleDollarSign className="h-5 w-5" />}
          highlightColor="sky"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />

        {/* Thẻ 4: Tỉ lệ nâng cấp trả phí */}
        <StatCard
          title="Tỉ lệ nâng cấp trả phí"
          value="50%"
          subtitle="2/4 PT dùng Plus hoặc Pro"
          icon={<TrendingUp className="h-5 w-5" />}
          highlightColor="amber"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />
      </div>

      {/* Thông báo lỗi nếu gọi API thất bại */}
      {usersError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start justify-between gap-3 text-rose-800 dark:text-rose-300">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <div>
              <p className="text-sm font-semibold">Lỗi tải danh sách người dùng</p>
              <p className="text-xs mt-0.5 opacity-90">{usersError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadAllUsers}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Thử lại
          </button>
        </div>
      )}

      {/* Bảng chi tiết danh sách người dùng trên web (call /api/users/all) */}
      <div className="bg-white dark:bg-[#120826]/90 rounded-2xl border border-slate-200 dark:border-purple-500/15 shadow-xs overflow-hidden">
        {/* Header bảng */}
        <div className="p-5 border-b border-slate-100 dark:border-purple-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-purple-950/60 text-indigo-600 dark:text-purple-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Danh sách người dùng đang sử dụng web
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-purple-950/60 text-indigo-700 dark:text-purple-300 border border-indigo-200 dark:border-purple-800">
                  {users.length} tài khoản
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-purple-300/60 mt-0.5">
                Dữ liệu thời gian thực được đồng bộ trực tiếp từ endpoint <code className="font-mono text-indigo-600 dark:text-purple-400">GET /api/users/all</code>
              </p>
            </div>
          </div>

          {/* Ô tìm kiếm người dùng */}
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên, email, sđt..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#1b0e36] border border-slate-200 dark:border-purple-500/25 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
            />
          </div>
        </div>

        {/* Nội dung danh sách / bảng */}
        {isLoadingUsers ? (
          <div className="p-12 text-center">
            <RefreshCw className="h-6 w-6 animate-spin text-purple-400 mx-auto mb-2" />
            <p className="text-xs text-slate-500 dark:text-purple-300/60">Đang tải danh sách người dùng từ hệ thống...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="h-10 w-10 text-slate-300 dark:text-purple-500/40 mx-auto" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {searchQuery ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào'}
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery
                ? 'Thử thay đổi từ khóa tìm kiếm bằng tên, email hoặc số điện thoại khác.'
                : 'Hiện tại chưa ghi nhận người dùng nào trên hệ thống hoặc danh sách trống.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-purple-500/15 bg-slate-50/50 dark:bg-[#180d33]/50 text-slate-500 dark:text-purple-300/70 font-medium">
                  <th className="py-3 px-4">Người dùng</th>
                  <th className="py-3 px-4">Thông tin liên hệ</th>
                  <th className="py-3 px-4">Phương thức</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Ngày tham gia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-purple-500/10">
                {filteredUsers.map((u) => {
                  const displayName = u.name || u.username || 'Người dùng';
                  const isGoogle = u.providerType === 'GOOGLE';
                  const isActive = u.status === 'ACTIVE';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
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
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                              @{u.username}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Cột 2: Email & Số điện thoại */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                            <Mail className="h-3 w-3 text-slate-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                          {u.phoneNumber && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                              <span>{u.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Cột 3: Phương thức đăng nhập */}
                      <td className="py-3.5 px-4">
                        {isGoogle ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40">
                            Google OAuth
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            Email & Password
                          </span>
                        )}
                      </td>

                      {/* Cột 4: Trạng thái tài khoản */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40'
                              : u.status === 'BANNED'
                              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-800/40'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? 'bg-emerald-500' : u.status === 'BANNED' ? 'bg-rose-500' : 'bg-slate-400'
                            }`}
                          />
                          {isActive ? 'Đang hoạt động' : u.status === 'BANNED' ? 'Đã khóa' : 'Chưa kích hoạt'}
                        </span>
                      </td>

                      {/* Cột 5: Ngày tạo */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cam kết bảo mật dữ liệu phân quyền nội bộ */}
      <div className="bg-white dark:bg-[#120826]/90 rounded-2xl border border-slate-200 dark:border-purple-500/15 p-6 space-y-3 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          Quy chuẩn phân quyền dữ liệu nội bộ
        </h2>
        <p className="text-xs text-slate-600 dark:text-purple-300/70 leading-relaxed">
          Khu vực Admin quản lý số lượng người dùng nền tảng, tài khoản huấn luyện viên, gói đăng ký (Free/Plus/Pro), tình trạng thanh toán và log hệ thống. Admin hoàn toàn không can thiệp vào dữ liệu tập luyện cá nhân bí mật của các PT theo đúng cam kết bảo mật.
        </p>
      </div>
    </div>
  );
}
