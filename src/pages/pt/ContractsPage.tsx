import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSignature,
  Plus,
  RefreshCw,
  Search,
  Calendar,
  Dumbbell,
  Coins,
  AlertCircle,
  Loader2,
  Trash2,
  Phone,
  Eye,
  Edit3,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { contractApi } from '../../api/contractApi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import PaymentStatusBadge from '../../components/contracts/PaymentStatusBadge';
import UpdatePtContractModal from '../../components/contracts/UpdatePtContractModal';
import type {
  PtContractResponse,
  ContractStatus,
  PaymentContractStatus,
} from '../../types/contract.types';
import {
  CONTRACT_STATUS_LABELS,
  resolvePaymentStatus,
} from '../../types/contract.types';

// Các lựa chọn lọc thanh toán
type PaymentFilterType = 'ALL' | PaymentContractStatus;

export default function ContractsPage() {
  const { user: authUser } = useAuth();
  const { clients, fetchClients } = useApp();

  const [contracts, setContracts] = useState<PtContractResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Bộ lọc & Tìm kiếm
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContractStatus>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterType>('ALL');

  // Modal cập nhật hợp đồng PT
  const [editingContract, setEditingContract] = useState<PtContractResponse | null>(null);

  // Modal xác nhận xoá hợp đồng
  const [deletingContractId, setDeletingContractId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Map clientId -> ClientResponse để tra cứu thông tin học viên nhanh chóng
  const clientMap = useMemo(() => {
    const map = new Map<string, (typeof clients)[0]>();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  // Hàm tải danh sách hợp đồng theo trainerId
  const loadContracts = useCallback(async () => {
    if (!authUser?.id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await contractApi.getContractsByTrainerId(authUser.id);
      setContracts(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      let msg = 'Không thể tải danh sách hợp đồng PT từ máy chủ';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [authUser?.id]);

  // Load ban đầu
  useEffect(() => {
    loadContracts();
    if (clients.length === 0) {
      fetchClients();
    }
  }, [loadContracts, clients.length, fetchClients]);

  // Xoá hợp đồng
  const handleConfirmDelete = async () => {
    if (!deletingContractId) return;
    setIsDeleting(true);
    try {
      await contractApi.deleteContract(deletingContractId);
      setContracts((prev) => prev.filter((c) => c.id !== deletingContractId));
      toast.success('Đã xoá hợp đồng PT thành công!');
      setDeletingContractId(null);
    } catch (err: unknown) {
      let msg = 'Xoá hợp đồng thất bại. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Format tiền tệ VNĐ chuẩn
  const formatVND = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  // Format ngày dd/mm/yyyy
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Tính số ngày còn lại của hợp đồng
  const getDaysRemaining = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const end = new Date(endDateStr);
    const now = new Date();
    // Bỏ giờ phút giây để tính ngày chuẩn
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Thống kê tổng quan
  const stats = useMemo(() => {
    const total = contracts.length;
    const active = contracts.filter((c) => c.status === 'ACTIVE').length;
    const completed = contracts.filter((c) => c.status === 'COMPLETED').length;

    let totalSessionsPurchased = 0;
    let totalSessionsUsed = 0;
    let totalRevenue = 0;
    let totalPaid = 0;

    contracts.forEach((c) => {
      const totalAll = (c.totalSessions || 0) + (c.bonusSessions || 0);
      totalSessionsPurchased += totalAll;
      totalSessionsUsed += c.usedSessions || 0;
      totalRevenue += c.price || 0;
      totalPaid += c.paidAmount || 0;
    });

    const totalRemaining = totalSessionsPurchased - totalSessionsUsed;
    const totalDebt = Math.max(0, totalRevenue - totalPaid);

    return {
      total,
      active,
      completed,
      totalSessionsPurchased,
      totalSessionsUsed,
      totalRemaining,
      totalRevenue,
      totalPaid,
      totalDebt,
    };
  }, [contracts]);

  // Danh sách sau khi áp dụng tìm kiếm & lọc
  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      // 1. Lọc theo trạng thái
      if (statusFilter !== 'ALL' && contract.status !== statusFilter) {
        return false;
      }

      // 2. Lọc theo tình trạng thanh toán
      if (paymentFilter !== 'ALL') {
        const resolvedSt = resolvePaymentStatus(contract);
        if (resolvedSt !== paymentFilter) return false;
      }

      // 3. Tìm kiếm từ khóa (tên học viên, sđt, ghi chú, mã hợp đồng)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const client = clientMap.get(contract.clientId);
        const clientName = (client?.fullName || contract.clientName || '').toLowerCase();
        const clientPhone = client?.phone || contract.clientPhone || '';
        const notes = (contract.notes || '').toLowerCase();
        const contractId = contract.id.toLowerCase();

        return (
          clientName.includes(q) ||
          clientPhone.includes(q) ||
          notes.includes(q) ||
          contractId.includes(q)
        );
      }

      return true;
    });
  }, [contracts, statusFilter, paymentFilter, searchQuery, clientMap]);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ========================================================
          HEADER & TOP ACTIONS
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <FileSignature className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Hợp đồng PT
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý danh sách hợp đồng huấn luyện viên cá nhân, gói tập và thanh toán của học viên.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadContracts}
            disabled={isLoading}
            title="Làm mới danh sách"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#162338] bg-white dark:bg-[#0c1626] text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <Link
            to="/pt/contracts/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo hợp đồng mới</span>
          </Link>
        </div>
      </div>

      {/* ========================================================
          THỐNG KÊ TỔNG QUAN (4 STATS CARDS)
         ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {/* Card 1: Tổng hợp đồng */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Tổng hợp đồng</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <FileSignature className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.total}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {stats.active} hiệu lực
            </span>
          </div>
        </div>

        {/* Card 2: Tổng buổi tập đã bán */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Số buổi tập đã bán</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Dumbbell className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalSessionsPurchased}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              buổi
            </span>
          </div>
        </div>

        {/* Card 3: Buổi còn lại / Đã tập */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Số buổi còn lại</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {stats.totalRemaining}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / đã tập {stats.totalSessionsUsed}
            </span>
          </div>
        </div>

        {/* Card 4: Tổng doanh thu hợp đồng */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-medium">Tổng giá trị hợp đồng</span>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <Coins className="h-4 w-4" />
            </div>
          </div>
          <div className="space-y-0.5">
            <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white truncate">
              {formatVND(stats.totalRevenue)}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>Đã thu: <strong className="text-emerald-600 dark:text-emerald-400">{formatVND(stats.totalPaid)}</strong></span>
              {stats.totalDebt > 0 && (
                <span className="text-rose-500 font-semibold">Nợ: {formatVND(stats.totalDebt)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          BỘ LỌC & TÌM KIẾM HỢP ĐỒNG
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200/90 dark:border-[#162338] p-4 shadow-xs space-y-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Ô tìm kiếm */}
          <div className="relative flex-1">
            <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên học viên, số điện thoại, ghi chú hoặc mã hợp đồng..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
            />
          </div>

          {/* Lọc thanh toán */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mr-1 hidden sm:inline">
              Thanh toán:
            </span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as PaymentFilterType)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer font-medium"
            >
              <option value="ALL">Mọi trạng thái thanh toán</option>
              <option value="PAID">Đã thanh toán đủ (PAID)</option>
              <option value="PARTIALLY_PAID">Thanh toán 1 phần (PARTIALLY_PAID)</option>
              <option value="UNPAID">Chưa thanh toán (UNPAID)</option>
              <option value="REFUNDED">Đã hoàn tiền (REFUNDED)</option>
            </select>
          </div>
        </div>

        {/* Tabs trạng thái hợp đồng */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs">
          <span className="text-slate-400 font-medium shrink-0 mr-1 hidden md:inline">
            Trạng thái:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Tất cả ({contracts.length})
          </button>

          {(['ACTIVE', 'COMPLETED', 'FROZEN', 'EXPIRED', 'CANCELLED'] as ContractStatus[]).map(
            (st) => {
              const count = contracts.filter((c) => c.status === st).length;
              const isSelected = statusFilter === st;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {CONTRACT_STATUS_LABELS[st]?.label || st} ({count})
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={loadContracts}
            className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium shrink-0 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ========================================================
          DANH SÁCH HỢP ĐỒNG PT
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-emerald-500" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Đang tải danh sách hợp đồng PT từ máy chủ...
            </p>
          </div>
        ) : filteredContracts.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <FileSignature className="h-8 w-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {searchQuery || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                  ? 'Không tìm thấy hợp đồng phù hợp'
                  : 'Chưa có hợp đồng nào'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {searchQuery || statusFilter !== 'ALL' || paymentFilter !== 'ALL'
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh lại các bộ lọc trạng thái phía trên.'
                  : 'Hãy tạo hợp đồng đầu tiên để quản lý số buổi tập và theo dõi thanh toán cho học viên của bạn.'}
              </p>
            </div>
            <div>
              <Link
                to="/pt/contracts/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Tạo hợp đồng ngay</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredContracts.map((contract) => {
              const client = clientMap.get(contract.clientId);
              const clientName = client?.fullName || contract.clientName || 'Học viên';
              const clientPhone = client?.phone || contract.clientPhone || '—';
              const clientAvatar = client?.avatarUrl || contract.clientAvatarUrl;

              const totalPurchased = (contract.totalSessions || 0) + (contract.bonusSessions || 0);
              const used = contract.usedSessions || 0;
              const remaining = totalPurchased - used;
              const percentUsed = totalPurchased > 0 ? Math.min(100, Math.round((used / totalPurchased) * 100)) : 0;

              const price = contract.price || 0;
              const paid = contract.paidAmount || 0;
              const debt = Math.max(0, price - paid);

              const daysRemaining = getDaysRemaining(contract.endDate);
              const statusMeta = CONTRACT_STATUS_LABELS[contract.status] || {
                label: contract.status,
                color: 'bg-slate-100 text-slate-600 border-slate-300',
              };

              return (
                <div
                  key={contract.id}
                  className="p-5 sm:p-6 hover:bg-slate-50/60 dark:hover:bg-[#0e1b2f]/60 transition-colors space-y-4"
                >
                  {/* Top row: Client info & Status & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Client info */}
                    <div className="flex items-center gap-3.5">
                      <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-sm text-emerald-600 dark:text-emerald-400 shrink-0 overflow-hidden shadow-xs">
                        {clientAvatar ? (
                          <img
                            src={clientAvatar}
                            alt={clientName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span>{clientName.charAt(0) || 'H'}</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/pt/contracts/${contract.id}`}
                            className="font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-flex items-center gap-1 group"
                          >
                            <span>{clientName}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                          <a
                            href={`tel:${clientPhone}`}
                            className="inline-flex items-center gap-1 hover:text-emerald-600 transition-colors"
                          >
                            <Phone className="h-3 w-3" />
                            <span>{clientPhone}</span>
                          </a>
                          <span>•</span>
                          <span className="text-[11px] text-slate-400">
                            Mã: <code className="font-mono text-slate-600 dark:text-slate-300">#{contract.id.slice(-6).toUpperCase()}</code>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Link
                        to={`/pt/contracts/${contract.id}`}
                        title="Xem chi tiết hợp đồng"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>Xem chi tiết</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => setEditingContract(contract)}
                        title="Cập nhật hợp đồng này"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                        <span>Cập nhật</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingContractId(contract.id)}
                        title="Xoá hợp đồng này"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Middle row: Grid of sessions, dates, and financial info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                    {/* Col 1: Sessions progress */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Dumbbell className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Tiến độ buổi tập</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {used}/{totalPurchased} buổi
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                          style={{ width: `${percentUsed}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                        <span>Đã tập: {used}</span>
                        {contract.bonusSessions && contract.bonusSessions > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            (+{contract.bonusSessions} buổi tặng)
                          </span>
                        ) : null}
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Còn lại: {remaining}
                        </span>
                      </div>
                    </div>

                    {/* Col 2: Dates & Duration */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1 font-medium text-slate-500 dark:text-slate-400">
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        <span>Thời hạn hợp đồng</span>
                      </div>
                      <div className="text-slate-700 dark:text-slate-200 font-semibold">
                        {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {daysRemaining === null ? (
                          <span>—</span>
                        ) : daysRemaining < 0 ? (
                          <span className="text-rose-500 font-medium">
                            Đã hết hạn ({Math.abs(daysRemaining)} ngày trước)
                          </span>
                        ) : (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                            Còn {daysRemaining} ngày hiệu lực
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Col 3: Financials & Payment status */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Coins className="h-3.5 w-3.5 text-amber-500" />
                          <span>Học phí & Thanh toán</span>
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {formatVND(price)}
                        </span>
                      </div>

                      {/* Đơn giá / buổi */}
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span>Đơn giá / buổi:</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {formatVND(
                            contract.pricePerSession ||
                              (contract.totalSessions > 0
                                ? Math.round(price / contract.totalSessions)
                                : 0)
                          )}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                        <span>Đã thanh toán:</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatVND(paid)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-0.5">
                        <PaymentStatusBadge
                          status={contract.paymentContractStatus}
                          paidAmount={paid}
                          price={price}
                        />
                        {debt > 0 && (
                          <span className="text-[11px] font-semibold text-rose-500">
                            Nợ: {formatVND(debt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {contract.notes && (
                    <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/50 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                      <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                        Ghi chú:
                      </span>
                      <p className="leading-relaxed">{contract.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL XÁC NHẬN XOÁ HỢP ĐỒNG (POPUP NẾU CẦN XOÁ)
         ======================================================== */}
      {deletingContractId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Xác nhận xoá hợp đồng PT
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Hợp đồng này sẽ được xoá khỏi hệ thống. Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingContractId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang xoá...</span>
                  </>
                ) : (
                  <span>Xoá vĩnh viễn</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal cập nhật hợp đồng PT */}
      <UpdatePtContractModal
        contract={editingContract}
        isOpen={!!editingContract}
        onClose={() => setEditingContract(null)}
        onSuccess={loadContracts}
      />
    </div>
  );
}
