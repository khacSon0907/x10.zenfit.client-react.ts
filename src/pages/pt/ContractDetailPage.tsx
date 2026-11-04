import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileSignature,
  User,
  UserCheck,
  Dumbbell,
  Gift,
  Calendar,
  Coins,
  Clock,
  Edit3,
  RefreshCw,
  Copy,
  Check,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Calculator,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { contractApi } from '../../api/contractApi';
import { clientApi } from '../../api/clientApi';
import { useAuth } from '../../context/AuthContext';
import PaymentStatusBadge from '../../components/contracts/PaymentStatusBadge';
import { UpdatePtContractModal } from '../../components/contracts/UpdatePtContractModal';
import type { PtContractResponse } from '../../types/contract.types';
import {
  CONTRACT_STATUS_LABELS,
  resolvePaymentStatus,
} from '../../types/contract.types';
import type { ClientResponse } from '../../types/client.types';
import { CLIENT_STATUS_LABELS, GENDER_LABELS } from '../../types/client.types';

export default function ContractDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [contract, setContract] = useState<PtContractResponse | null>(null);
  const [client, setClient] = useState<ClientResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isCopiedId, setIsCopiedId] = useState<boolean>(false);
  const [isCopiedPhone, setIsCopiedPhone] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);

  // Format tiền tệ VNĐ chuẩn
  const formatVND = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  // Format ngày dd/mm/yyyy
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const clean = dateStr.split('T')[0];
      const [y, m, d] = clean.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Format ngày giờ đầy đủ
  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  // Tải thông tin hợp đồng và hồ sơ học viên tương ứng
  const loadContractDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const contractData = await contractApi.getContractById(id);
      setContract(contractData);

      // Nếu có clientId, tải thêm thông tin hồ sơ học viên
      if (contractData?.clientId) {
        try {
          const clientData = await clientApi.getClientById(contractData.clientId);
          setClient(clientData);
        } catch (clientErr) {
          console.warn('Không thể tải thông tin hồ sơ học viên:', clientErr);
        }
      }
    } catch (err: unknown) {
      let msg = 'Không thể tải chi tiết hợp đồng PT từ máy chủ';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadContractDetail();
  }, [loadContractDetail]);

  // Copy mã hợp đồng
  const handleCopyId = () => {
    if (!contract?.id) return;
    navigator.clipboard.writeText(contract.id);
    setIsCopiedId(true);
    toast.success('Đã sao chép mã hợp đồng vào clipboard');
    setTimeout(() => setIsCopiedId(false), 2000);
  };

  // Copy số điện thoại học viên
  const handleCopyPhone = () => {
    const phone = client?.phone || contract?.clientPhone;
    if (!phone) return;
    navigator.clipboard.writeText(phone);
    setIsCopiedPhone(true);
    toast.success('Đã sao chép số điện thoại học viên');
    setTimeout(() => setIsCopiedPhone(false), 2000);
  };

  // Tính toán số liệu thống kê
  const totalPurchased = contract?.totalSessions || 0;
  const bonus = contract?.bonusSessions || 0;
  const totalAvailable = totalPurchased + bonus;
  const used = contract?.usedSessions ?? contract?.completedSessions ?? 0;
  const remaining = contract?.remainingSessions ?? Math.max(0, totalAvailable - used);
  const percentUsed =
    totalAvailable > 0 ? Math.min(100, Math.round((used / totalAvailable) * 100)) : 0;

  const price = contract?.price || 0;
  const pricePerSession =
    contract?.pricePerSession || (totalPurchased > 0 ? Math.round(price / totalPurchased) : 0);
  const paidAmount = contract?.paidAmount || 0;
  const debt = Math.max(0, price - paidAmount);
  const paymentStatus = contract ? resolvePaymentStatus(contract) : 'UNPAID';

  // Tính số ngày còn lại
  const getDaysRemainingMeta = (endDateStr?: string) => {
    if (!endDateStr) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(endDateStr);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
      return {
        text: `Đã hết hạn ${Math.abs(diffDays)} ngày`,
        isExpired: true,
        badgeClass:
          'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40',
      };
    }
    if (diffDays === 0) {
      return {
        text: 'Hết hạn hôm nay',
        isExpired: true,
        badgeClass:
          'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/40',
      };
    }
    return {
      text: `Còn ${diffDays} ngày hiệu lực`,
      isExpired: false,
      badgeClass:
        'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40',
    };
  };

  const daysMeta = getDaysRemainingMeta(contract?.endDate);
  const statusMeta = CONTRACT_STATUS_LABELS[contract?.status || 'ACTIVE'];

  // 1. Loading state
  if (isLoading) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Đang tải thông tin chi tiết hợp đồng...
          </p>
          <p className="text-xs text-slate-400 mt-0.5">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  // 2. Error state
  if (error || !contract) {
    return (
      <div className="min-h-[500px] flex flex-col items-center justify-center p-6 text-center space-y-4 max-w-md mx-auto">
        <div className="h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/40 flex items-center justify-center text-rose-500 shadow-sm">
          <AlertCircle className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Không tìm thấy thông tin hợp đồng
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {error || 'Hợp đồng này có thể không tồn tại hoặc bạn không có quyền truy cập.'}
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/pt/contracts')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Danh sách hợp đồng</span>
          </button>
          <button
            type="button"
            onClick={loadContractDetail}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  const clientName = client?.fullName || contract.clientName || 'Học viên';
  const clientPhone = client?.phone || contract.clientPhone || '—';
  const clientAvatar = client?.avatarUrl || contract.clientAvatarUrl;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* ========================================================
          TOP BREADCRUMB & MAIN ACTION HEADER
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() => navigate('/pt/contracts')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại danh sách hợp đồng</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <span>Hợp đồng PT</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                #{contract.id.slice(-6).toUpperCase()}
              </span>
            </h1>

            {/* Trạng thái hợp đồng */}
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusMeta.color}`}
            >
              {statusMeta.label}
            </span>

            {/* Trạng thái thanh toán */}
            <PaymentStatusBadge status={paymentStatus} paidAmount={paidAmount} price={price} />

            {/* Trạng thái hạn dùng */}
            {daysMeta && (
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${daysMeta.badgeClass}`}
              >
                {daysMeta.text}
              </span>
            )}
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadContractDetail}
            title="Làm mới dữ liệu từ server"
            className="p-2.5 rounded-xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] text-slate-600 dark:text-slate-300 hover:text-emerald-600 hover:border-emerald-500/40 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* NÚT BẤM VÀO XEM HỒ SƠ CHI TIẾT HỌC VIÊN */}
          <Link
            to={`/pt/clients/${contract.clientId}`}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] hover:border-emerald-500/40 text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer group"
          >
            <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Xem hồ sơ học viên</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-emerald-500 transition-colors" />
          </Link>

          {/* CẬP NHẬT HỢP ĐỒNG */}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-sm hover:shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
            <span>Cập nhật hợp đồng</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          THÔNG TIN HỌC VIÊN & PT PHỤ TRÁCH (TWO COLUMN CARDS)
         ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Card 1: Học viên (col-span-7) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-emerald-500" />
                <span>Học viên tham gia hợp đồng</span>
              </span>
              {client && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${
                    CLIENT_STATUS_LABELS[client.status]?.color ||
                    'text-slate-600 bg-slate-50 border-slate-200'
                  }`}
                >
                  {CLIENT_STATUS_LABELS[client.status]?.label || client.status}
                </span>
              )}
            </div>

            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-xl text-emerald-600 dark:text-emerald-400 shrink-0 overflow-hidden shadow-xs">
                {clientAvatar ? (
                  <img src={clientAvatar} alt={clientName} className="h-full w-full object-cover" />
                ) : (
                  <span>{clientName.charAt(0) || 'H'}</span>
                )}
              </div>

              {/* Info */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                    {clientName}
                  </h2>
                  {client?.gender && (
                    <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {GENDER_LABELS[client.gender] || client.gender}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`tel:${clientPhone}`}
                      className="font-medium hover:text-emerald-600 transition-colors truncate"
                    >
                      {clientPhone}
                    </a>
                    {clientPhone !== '—' && (
                      <button
                        type="button"
                        onClick={handleCopyPhone}
                        title="Sao chép số điện thoại"
                        className="text-slate-400 hover:text-emerald-500 transition-colors p-0.5"
                      >
                        {isCopiedPhone ? (
                          <Check className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client?.email || 'Chưa cung cấp email'}</span>
                  </div>
                </div>

                {/* Additional Client Metrics if available */}
                {(client?.height || client?.initialWeight) && (
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    {client.height && (
                      <span>
                        Chiều cao: <strong className="text-slate-800 dark:text-slate-200">{client.height} cm</strong>
                      </span>
                    )}
                    {client.initialWeight && (
                      <span>
                        Cân nặng ban đầu: <strong className="text-slate-800 dark:text-slate-200">{client.initialWeight} kg</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prominent Button to View Client Full Profile */}
          <div className="pt-2">
            <Link
              to={`/pt/clients/${contract.clientId}`}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-950/50 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-semibold text-xs sm:text-sm flex items-center justify-between transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Xem chi tiết toàn bộ hồ sơ học viên {clientName}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Card 2: PT phụ trách & Thông tin hệ thống (col-span-5) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                <span>Huấn luyện viên phụ trách</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/20">
                PT Workspace
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">HLV đảm nhận:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {contract.trainerName || authUser?.username || 'Huấn luyện viên hiện tại (Bạn)'}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Mã hợp đồng:</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700 dark:text-slate-300">
                  <span className="truncate max-w-[160px] sm:max-w-[200px]">{contract.id}</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    title="Sao chép toàn bộ mã hợp đồng"
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-500 transition-colors"
                  >
                    {isCopiedId ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Ngày tạo:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDateTime(contract.createdAt) || formatDate(contract.startDate)}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Cập nhật gần nhất:</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">
                  {formatDateTime(contract.updatedAt) || 'Chưa cập nhật'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <Info className="h-4 w-4 text-emerald-500 shrink-0" />
            <span>Hợp đồng được lưu trữ và bảo mật trên hệ thống Zenfit Cloud.</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          TIẾN ĐỘ & SỐ BUỔI TẬP (TRAINING SESSIONS)
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Tiến độ & Số buổi tập
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Theo dõi số buổi đã tập, buổi tặng và số buổi còn lại của học viên
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 self-start sm:self-auto">
            Đã hoàn thành {percentUsed}% gói tập
          </div>
        </div>

        {/* 4 Stat Boxes for Sessions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* 1. Tổng số buổi mua */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Dumbbell className="h-3.5 w-3.5 text-blue-500" />
              <span>Số buổi mua</span>
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {totalPurchased} <span className="text-xs font-normal text-slate-400">buổi</span>
            </p>
            <p className="text-[10px] text-slate-400">Theo gói đăng ký</p>
          </div>

          {/* 2. Buổi tặng (Bonus) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Gift className="h-3.5 w-3.5 text-emerald-500" />
              <span>Buổi tặng</span>
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              +{bonus} <span className="text-xs font-normal text-slate-400">buổi</span>
            </p>
            <p className="text-[10px] text-slate-400">Ưu đãi kèm theo</p>
          </div>

          {/* 3. Đã tập */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-teal-500" />
              <span>Đã tập</span>
            </span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {used} <span className="text-xs font-normal text-slate-400">buổi</span>
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Đạt {percentUsed}% tổng số buổi
            </p>
          </div>

          {/* 4. Còn lại */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Còn lại</span>
            </span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {remaining} <span className="text-xs font-normal text-slate-400">buổi</span>
            </p>
            <p className="text-[10px] text-slate-400">Tổng khả dụng: {totalAvailable} buổi</p>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Tiến độ sử dụng gói tập:
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {used} / {totalAvailable} buổi ({percentUsed}%)
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>
        </div>
      </div>

      {/* ========================================================
          TÀI CHÍNH, ĐƠN GIÁ & THANH TOÁN (FINANCIAL OVERVIEW)
         ======================================================== */}
      <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Coins className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Học phí & Tình trạng thanh toán
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Đơn giá mỗi buổi tập, tổng giá trị hợp đồng và số tiền đã thu
              </p>
            </div>
          </div>

          <PaymentStatusBadge status={paymentStatus} paidAmount={paidAmount} price={price} />
        </div>

        {/* 4 Stat Boxes for Financials */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Đơn giá 1 buổi tập */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-emerald-500" />
              <span>Đơn giá / buổi</span>
            </span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatVND(pricePerSession)}
            </p>
            <p className="text-[10px] text-slate-400">Đơn giá 1 buổi huấn luyện</p>
          </div>

          {/* 2. Tổng giá trị gói tập */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Coins className="h-3.5 w-3.5 text-teal-500" />
              <span>Tổng giá gói tập</span>
            </span>
            <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatVND(price)}
            </p>
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              = {totalPurchased} buổi × {formatVND(pricePerSession)}
            </p>
          </div>

          {/* 3. Đã thanh toán */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Đã thanh toán</span>
            </span>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {formatVND(paidAmount)}
            </p>
            <p className="text-[10px] text-slate-400">
              {price > 0 ? `Đạt ${Math.round((paidAmount / price) * 100)}% giá trị gói` : '—'}
            </p>
          </div>

          {/* 4. Còn nợ */}
          <div
            className={`p-4 rounded-2xl border space-y-1 ${
              debt > 0
                ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500/20'
            }`}
          >
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <AlertCircle className={`h-3.5 w-3.5 ${debt > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
              <span>Số tiền còn nợ</span>
            </span>
            <p
              className={`text-xl font-bold ${
                debt > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {formatVND(debt)}
            </p>
            <p className={`text-[10px] font-medium ${debt > 0 ? 'text-rose-500' : 'text-emerald-600'}`}>
              {debt > 0 ? 'Cần thu thêm từ học viên' : 'Đã thanh toán đủ 100%'}
            </p>
          </div>
        </div>

        {/* Formula calculation badge */}
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
          <Calculator className="h-4 w-4 text-emerald-500 shrink-0" />
          <span>
            Quy tắc tính toán: <strong>{totalPurchased} buổi</strong> mua ×{' '}
            <strong>{formatVND(pricePerSession)}</strong> = Tổng hợp đồng{' '}
            <strong className="text-emerald-600 dark:text-emerald-400">{formatVND(price)}</strong>.
            (Đã đóng <strong>{formatVND(paidAmount)}</strong>
            {debt > 0 ? `, còn thiếu ${formatVND(debt)}` : ', hoàn thành thu phí'}).
          </span>
        </div>
      </div>

      {/* ========================================================
          THỜI HẠN & HIỆU LỰC GÓI TẬP (DATES & VALIDITY)
         ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Thời hạn */}
        <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
            <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Thời hạn hợp đồng
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hiệu lực kích hoạt và hạn chót hoàn thành các buổi tập
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Ngày bắt đầu:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatDate(contract.startDate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Ngày hết hạn:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatDate(contract.endDate)}
              </span>
            </div>

            <div className="flex items-center justify-between py-1.5">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Tình trạng thời hạn:</span>
              </span>
              {daysMeta ? (
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${daysMeta.badgeClass}`}>
                  {daysMeta.text}
                </span>
              ) : (
                <span className="text-slate-400">Không giới hạn</span>
              )}
            </div>
          </div>
        </div>

        {/* Ghi chú & dặn dò */}
        <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <FileSignature className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Ghi chú hợp đồng
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lưu ý lịch tập, dặn dò riêng hoặc cam kết huấn luyện
                </p>
              </div>
            </div>

            <div className="pt-3">
              {contract.notes ? (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800 text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
                  {contract.notes}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  Chưa có ghi chú đặc biệt cho hợp đồng này. Bạn có thể bấm “Cập nhật hợp đồng” để bổ sung.
                </p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Chỉnh sửa thông tin hoặc ghi chú</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          MODAL CẬP NHẬT HỢP ĐỒNG (UPDATE MODAL)
         ======================================================== */}
      {isEditModalOpen && (
        <UpdatePtContractModal
          contract={contract}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => {
            loadContractDetail();
          }}
        />
      )}
    </div>
  );
}
