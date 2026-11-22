import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  RefreshCw,
  User,
  Phone,
  Mail,
  Target,
  Eye,
  AlertCircle,
  Loader2,
  X,
  Crown,
  Zap,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import type {
  ClientStatus,
  // FitnessGoal
} from '../../types/client.types';
import {
  CLIENT_STATUS_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
} from '../../types/client.types';

export default function ClientsPage() {
  const { user: authUser } = useAuth();
  const {
    clients,
    isLoadingClients,
    clientsError,
    fetchClients,
    mySubscription,
    fetchMySubscription,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ClientStatus>('ALL');

  // Tính toán hạn mức học viên theo gói dịch vụ (UserSubscription)
  const maxStudents = mySubscription?.maxStudents ?? 5;
  const currentStudents = mySubscription?.currentStudents ?? clients.length;
  const isQuotaFull = currentStudents >= maxStudents;
  const quotaPercent = Math.min(100, Math.round((currentStudents / (maxStudents || 1)) * 100));
  const remainingSlots = Math.max(0, maxStudents - currentStudents);

  // Tự động tải lại dữ liệu khi trang mount nếu danh sách rỗng
  useEffect(() => {
    fetchClients(authUser?.id);
    fetchMySubscription();
  }, [authUser?.id, fetchClients, fetchMySubscription]);

  // Bộ lọc khách hàng
  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      // Lọc theo trạng thái
      if (statusFilter !== 'ALL' && c.status !== statusFilter) {
        return false;
      }
      // Lọc theo mục tiêu
      if (false) {
        return false;
      }
      // Lọc theo từ khóa tìm kiếm
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = c.fullName?.toLowerCase().includes(query);
        const matchPhone = c.phone?.toLowerCase().includes(query);
        const matchEmail = c.email?.toLowerCase().includes(query);
        const matchNotes = c.notes?.toLowerCase().includes(query);
        const matchAddress = c.address?.toLowerCase().includes(query);
        return matchName || matchPhone || matchEmail || matchNotes || matchAddress;
      }
      return true;
    });
  }, [clients, statusFilter, searchQuery]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = clients.length;
    const active = clients.filter((c) => c.status === 'ACTIVE').length;
    const frozen = clients.filter((c) => c.status === 'FROZEN').length;
    const inactive = clients.filter((c) => c.status === 'INACTIVE').length;
    const expired = clients.filter((c) => c.status === 'EXPIRED').length;
    return { total, active, frozen, inactive, expired };
  }, [clients]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          HEADER & NÚT THAO TÁC
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <span>Danh sách Khách hàng</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quản lý hồ sơ học viên, chỉ số thể chất ban đầu và thông tin mục tiêu từ Backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Refresh */}
          <button
            type="button"
            onClick={() => {
              fetchClients(authUser?.id);
              fetchMySubscription();
            }}
            disabled={isLoadingClients}
            title="Làm mới danh sách và hạn mức từ Backend"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingClients ? 'animate-spin text-emerald-500' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Nút Thêm mới khách hàng & Hợp đồng PT */}
          <Link
            to="/pt/clients/new"
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer ${
              isQuotaFull
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
            }`}
          >
            <Plus className="h-4 w-4" />
            <span>Thêm khách hàng mới</span>
            {isQuotaFull && (
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-800/80 text-amber-200 font-bold uppercase">
                Hết slot
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ========================================================
          BANNER HẠN MỨC GÓI DỊCH VỤ (STUDENT QUOTA BANNER)
         ======================================================== */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isQuotaFull
            ? 'bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border-rose-500/40 shadow-md shadow-rose-950/20'
            : quotaPercent >= 80
            ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900 border-amber-500/40 shadow-xs'
            : 'bg-gradient-to-r from-[#0c1626] via-[#0f2324] to-[#0c1626] border-emerald-500/30 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                <Crown className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-white">
                {mySubscription?.planName || 'Gói Dịch Vụ PT'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
              {isQuotaFull && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Đã đầy hạn mức
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300">Hạn mức học viên:</span>
                  <span className={isQuotaFull ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                    {currentStudents} / {maxStudents} học viên
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isQuotaFull
                        ? 'bg-gradient-to-r from-rose-500 to-red-400'
                        : quotaPercent >= 80
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${quotaPercent}%` }}
                  />
                </div>
              </div>

              <span className="text-xs text-slate-400">
                {isQuotaFull ? (
                  <span className="text-rose-400 font-medium">
                    ⚠️ Đã đạt giới hạn tối đa. Cần nâng cấp gói để tiếp tục thêm học viên.
                  </span>
                ) : (
                  <>
                    Còn trống <strong className="text-white font-bold">{remainingSlots}</strong> suất học viên
                  </>
                )}
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <Link
              to="/pt/pricing"
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-xs ${
                isQuotaFull
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Nâng cấp gói</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================
          THỐNG KÊ NHANH
         ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Tổng học viên</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.total}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Đang tập (ACTIVE)</p>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.active}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Bảo lưu (FROZEN)</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{stats.frozen}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs">
          <p className="text-[11px] font-medium text-rose-600 dark:text-rose-400">Tạm ngưng / Hết hạn</p>
          <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">{stats.inactive + stats.expired}</p>
        </div>
      </div>

      {/* ========================================================
          BỘ LỌC & TÌM KIẾM
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] p-4 space-y-3 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên, số điện thoại, email, địa chỉ..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          
        </div>

        {/* Tabs Lọc Trạng Thái */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 border-t border-slate-100 dark:border-slate-800/80">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 shrink-0">
            Trạng thái:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tất cả ({clients.length})
          </button>
          {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((st) => {
            const count = clients.filter((c) => c.status === st).length;
            const isSelected = statusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {CLIENT_STATUS_LABELS[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          THÔNG BÁO LỖI NẾU KHÔNG GỌI ĐƯỢC API
         ======================================================== */}
      {clientsError && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{clientsError}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchClients()}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shrink-0 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ========================================================
          DANH SÁCH KHÁCH HÀNG
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] shadow-xs overflow-hidden">
        {isLoadingClients && clients.length === 0 ? (
          // Skeleton loading
          <div className="p-12 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đang tải danh sách khách hàng từ máy chủ Backend...
            </p>
          </div>
        ) : filteredClients.length === 0 ? (
          // Empty State
          <div className="p-12 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {clients.length === 0
                  ? 'Chưa có hồ sơ khách hàng nào trong hệ thống'
                  : 'Không tìm thấy khách hàng phù hợp bộ lọc'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {clients.length === 0
                  ? 'Hãy thêm mới hồ sơ học viên đầu tiên để bắt đầu theo dõi sức khoẻ và lịch tập.'
                  : 'Thử thay đổi từ khoá tìm kiếm hoặc đặt lại các bộ lọc trạng thái.'}
              </p>
            </div>
            {clients.length === 0 && (
              <Link
                to="/pt/clients/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Thêm học viên mới ngay</span>
              </Link>
            )}
          </div>
        ) : (
          // List Clients Table / Cards
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredClients.map((client) => {
              const statusMeta = client.status
                ? CLIENT_STATUS_LABELS[client.status]
                : { label: 'Đang tập', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' };

              return (
                <div
                  key={client.id}
                  className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition-colors"
                >
                  {/* Left: Avatar & Info */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Avatar */}
                    <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {client.avatarUrl ? (
                        <img
                          src={client.avatarUrl}
                          alt={client.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {client.fullName
                            ? client.fullName
                                .split(' ')
                                .map((n) => n[0])
                                .slice(-2)
                                .join('')
                                .toUpperCase()
                            : 'KH'}
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/pt/clients/${client.id}`}
                          className="font-semibold text-slate-900 dark:text-white text-sm truncate hover:text-emerald-500 transition-colors"
                        >
                          {client.fullName}
                        </Link>
                        {client.gender && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                            {GENDER_LABELS[client.gender] || client.gender}
                          </span>
                        )}
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusMeta.color}`}
                        >
                          {statusMeta.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <a
                          href={`tel:${client.phone}`}
                          className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          <span>{client.phone}</span>
                        </a>

                        {client.email && (
                          <a
                            href={`mailto:${client.email}`}
                            className="hidden sm:flex items-center gap-1 hover:text-emerald-600 transition-colors truncate max-w-xs"
                          >
                            <Mail className="h-3 w-3" />
                            <span>{client.email}</span>
                          </a>
                        )}

                        {client.fitnessGoal && (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <Target className="h-3 w-3" />
                            <span>{FITNESS_GOAL_LABELS[client.fitnessGoal] || client.fitnessGoal}</span>
                          </span>
                        )}
                      </div>

                      {/* Additional Metrics */}
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 flex-wrap pt-0.5">
                        {client.height && <span>Cao: {client.height} cm</span>}
                        {client.initialWeight && <span>Nặng: {client.initialWeight} kg</span>}
                        {client.targetWeight && (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Mục tiêu: {client.targetWeight} kg
                          </span>
                        )}
                        {client.joinedDate && <span>Tham gia: {client.joinedDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Link
                      to={`/pt/clients/${client.id}`}
                      title="Xem chi tiết hồ sơ"
                      className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

