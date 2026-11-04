import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileSignature,
  User,
  UserCheck,
  Dumbbell,
  Gift,
  Calendar,
  Coins,
  FileText,
  Activity,
  Target,
  Scale,
  CheckCircle2,
  RotateCcw,
  Loader2,
  ChevronDown,
  Search,
  Lightbulb,
  Check,
  Plus,
  AlertCircle,
  X,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { contractApi } from '../../api/contractApi';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import PaymentStatusBadge from '../../components/contracts/PaymentStatusBadge';
import type {
  CreatePtContractRequest,
  PaymentContractStatus,
} from '../../types/contract.types';
import {
  PAYMENT_CONTRACT_STATUS_CONFIG,
} from '../../types/contract.types';
import {
  CLIENT_STATUS_LABELS,
  FITNESS_GOAL_LABELS,
} from '../../types/client.types';

// Các lựa chọn lịch tập phổ biến
const SCHEDULE_OPTIONS = [
  { value: '2-4-6', label: 'Thứ 2 - 4 - 6 (3 buổi/tuần)' },
  { value: '3-5-7', label: 'Thứ 3 - 5 - 7 (3 buổi/tuần)' },
  { value: '2-4-6-CN', label: 'Thứ 2 - 4 - 6 - Chủ Nhật (4 buổi/tuần)' },
  { value: '3-5-7-CN', label: 'Thứ 3 - 5 - 7 - Chủ Nhật (4 buổi/tuần)' },
  { value: 'WEEKEND', label: 'Cuối tuần (Thứ 7 & Chủ Nhật)' },
  { value: 'FLEXIBLE', label: 'Linh hoạt / Tự do theo từng tuần' },
];

export default function CreatePtContractPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user: authUser } = useAuth();
  const { clients, isLoadingClients, fetchClients } = useApp();

  // Khởi tạo ngày hôm nay & ngày 3 tháng sau
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultEndDateStr = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  }, []);

  // Form states - Section 1: Thông tin cơ bản
  const [clientId, setClientId] = useState<string>(searchParams.get('clientId') || '');
  const [trainerId, setTrainerId] = useState<string>(authUser?.id || '');
  const [totalSessions, setTotalSessions] = useState<number>(24);
  const [bonusSessions, setBonusSessions] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>(todayStr);
  const [endDate, setEndDate] = useState<string>(defaultEndDateStr);
  const [price, setPrice] = useState<number>(12000000);
  const [pricePerSession, setPricePerSession] = useState<number>(500000);
  const [paidAmount, setPaidAmount] = useState<number>(12000000);
  const [paymentContractStatus, setPaymentContractStatus] =
    useState<PaymentContractStatus>('PAID');
  const [notes, setNotes] = useState<string>('');

  // Tự động tính đơn giá 1 buổi gợi ý nếu có price & totalSessions
  const autoPricePerSession = useMemo(() => {
    if (totalSessions > 0 && price > 0) {
      return Math.round(price / totalSessions);
    }
    return 0;
  }, [price, totalSessions]);

  // Xử lý khi đổi đơn giá 1 buổi tập -> tự động tính tổng giá gói = đơn giá * số buổi mua
  const handlePricePerSessionChange = (newPricePerSession: number) => {
    setPricePerSession(newPricePerSession);
    const calculatedPrice = (totalSessions > 0 ? totalSessions : 1) * newPricePerSession;
    setPrice(calculatedPrice);

    if (paidAmount === price || paymentContractStatus === 'PAID') {
      setPaidAmount(calculatedPrice);
      setPaymentContractStatus(calculatedPrice > 0 ? 'PAID' : 'UNPAID');
    } else if (paidAmount > calculatedPrice) {
      setPaidAmount(calculatedPrice);
      setPaymentContractStatus('PAID');
    } else if (paidAmount > 0) {
      setPaymentContractStatus('PARTIALLY_PAID');
    }
  };

  // Xử lý khi đổi tổng giá gói tập -> cập nhật ngược lại đơn giá 1 buổi
  const handlePriceChange = (newPrice: number) => {
    setPrice(newPrice);
    if (totalSessions > 0) {
      setPricePerSession(Math.round(newPrice / totalSessions));
    }
    if (paidAmount === price || paymentContractStatus === 'PAID') {
      setPaidAmount(newPrice);
      setPaymentContractStatus(newPrice > 0 ? 'PAID' : 'UNPAID');
    } else if (paidAmount > newPrice) {
      setPaidAmount(newPrice);
      setPaymentContractStatus('PAID');
    } else if (paidAmount > 0) {
      setPaymentContractStatus('PARTIALLY_PAID');
    }
  };

  // Xử lý tự động trạng thái thanh toán khi đổi paidAmount
  const handlePaidAmountChange = (newPaid: number) => {
    setPaidAmount(newPaid);
    if (newPaid >= price && price > 0) {
      setPaymentContractStatus('PAID');
    } else if (newPaid > 0 && newPaid < price) {
      setPaymentContractStatus('PARTIALLY_PAID');
    } else {
      setPaymentContractStatus('UNPAID');
    }
  };

  // Form states - Section 2: Thông tin bổ sung (đồng bộ từ học viên)
  const [height, setHeight] = useState<string>('');
  const [weight, setWeight] = useState<string>('');
  const [dateOfBirth, setDateOfBirth] = useState<string>('');
  const [fitnessGoal, setFitnessGoal] = useState<string>('LOSE_FAT');

  // Form states - Section 3: Lịch tập & Ghi chú thêm
  const [scheduleWeekly, setScheduleWeekly] = useState<string>('2-4-6');
  const [scheduleNotes, setScheduleNotes] = useState<string>('');

  // Dropdown tìm kiếm học viên
  const [isClientDropdownOpen, setIsClientDropdownOpen] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Trạng thái submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tải danh sách khách hàng nếu chưa có
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  // Cập nhật trainerId khi authUser sẵn sàng
  useEffect(() => {
    if (authUser?.id && !trainerId) {
      setTrainerId(authUser.id);
    }
  }, [authUser, trainerId]);

  // Tìm khách hàng đã chọn
  const selectedClient = useMemo(() => {
    return clients.find((c) => c.id === clientId) || null;
  }, [clients, clientId]);

  // Tự động điền thông tin bổ sung khi chọn khách hàng
  useEffect(() => {
    if (selectedClient) {
      if (selectedClient.height) setHeight(String(selectedClient.height));
      if (selectedClient.initialWeight) setWeight(String(selectedClient.initialWeight));
      if (selectedClient.dateOfBirth) setDateOfBirth(selectedClient.dateOfBirth);
      if (selectedClient.fitnessGoal) setFitnessGoal(selectedClient.fitnessGoal);
    }
  }, [selectedClient]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsClientDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Danh sách khách hàng đã lọc theo từ khóa tìm kiếm
  const filteredClients = useMemo(() => {
    const q = clientSearchQuery.toLowerCase().trim();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.fullName?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }, [clients, clientSearchQuery]);

  // Tự động tính ngày hết hạn và tổng giá gói khi số buổi mua thay đổi
  const handleSessionsChange = (val: number) => {
    setTotalSessions(val);
    if (startDate) {
      const d = new Date(startDate);
      // Gợi ý: <= 12 buổi (1.5 tháng), <= 24 buổi (3 tháng), <= 36 buổi (5 tháng), > 36 buổi (8 tháng)
      let monthsToAdd = 3;
      if (val <= 12) monthsToAdd = 2;
      else if (val <= 24) monthsToAdd = 3;
      else if (val <= 36) monthsToAdd = 5;
      else monthsToAdd = 8;
      d.setMonth(d.getMonth() + monthsToAdd);
      setEndDate(d.toISOString().split('T')[0]);
    }
    // Tự động tính lại tổng giá gói = số buổi mua * đơn giá 1 buổi
    if (pricePerSession > 0) {
      const calculatedPrice = val * pricePerSession;
      setPrice(calculatedPrice);
      if (paidAmount === price || paymentContractStatus === 'PAID') {
        setPaidAmount(calculatedPrice);
        setPaymentContractStatus(calculatedPrice > 0 ? 'PAID' : 'UNPAID');
      }
    }
  };

  // Format tiền tệ VND chuẩn (phân tách hàng nghìn bằng dấu chấm + VNĐ)
  const formatVND = (amount?: number) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VNĐ';
  };

  // Format ngày dd/mm/yyyy
  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  // Reset toàn bộ form
  const handleReset = () => {
    setClientId('');
    setTotalSessions(24);
    setBonusSessions(0);
    setStartDate(todayStr);
    setEndDate(defaultEndDateStr);
    setPrice(12000000);
    setPricePerSession(500000);
    setPaidAmount(12000000);
    setPaymentContractStatus('PAID');
    setNotes('');
    setHeight('');
    setWeight('');
    setDateOfBirth('');
    setFitnessGoal('LOSE_FAT');
    setScheduleWeekly('2-4-6');
    setScheduleNotes('');
    setErrorMessage(null);
    toast.info('Đã làm mới biểu mẫu tạo hợp đồng');
  };

  // Xử lý gửi biểu mẫu tạo hợp đồng
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage(null);

    // 1. Kiểm tra học viên
    if (!clientId.trim()) {
      const msg = 'Vui lòng chọn học viên trước khi tạo hợp đồng';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 2. Kiểm tra PT phụ trách
    const finalTrainerId = trainerId.trim() || authUser?.id || '';
    if (!finalTrainerId) {
      const msg = 'Vui lòng xác định huấn luyện viên (PT) phụ trách';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 3. Kiểm tra tổng số buổi
    if (!totalSessions || totalSessions < 1) {
      const msg = 'Tổng số buổi tập phải từ 1 buổi trở lên';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 4. Kiểm tra buổi tặng
    const safeBonus = bonusSessions || 0;
    if (safeBonus < 0) {
      const msg = 'Số buổi tặng không được là số âm';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 5. Kiểm tra ngày
    if (!startDate || !endDate) {
      const msg = 'Vui lòng nhập ngày bắt đầu và ngày hết hạn của hợp đồng';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const startD = new Date(startDate);
    const endD = new Date(endDate);
    if (endD <= startD) {
      const msg = 'Ngày hết hạn phải sau ngày bắt đầu hợp đồng';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 6. Kiểm tra giá gói tập
    if (!price || price <= 0) {
      const msg = 'Giá trị hợp đồng phải lớn hơn 0 VNĐ';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // 7. Kiểm tra số tiền đã thanh toán
    const safePaid = paidAmount || 0;
    if (safePaid < 0) {
      const msg = 'Số tiền thanh toán không được là số âm';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (safePaid > price) {
      const msg = 'Số tiền thanh toán không được vượt quá giá trị hợp đồng';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Tổng hợp ghi chú gửi sang Backend (bao gồm cả ghi chú hợp đồng và lịch tập)
    const notesParts: string[] = [];
    if (notes.trim()) notesParts.push(notes.trim());
    if (scheduleWeekly) {
      const label = SCHEDULE_OPTIONS.find((s) => s.value === scheduleWeekly)?.label || scheduleWeekly;
      notesParts.push(`Lịch tập: ${label}`);
    }
    if (scheduleNotes.trim()) notesParts.push(`Ghi chú lịch: ${scheduleNotes.trim()}`);
    const combinedNotes = notesParts.join(' | ');

    setIsSubmitting(true);
    try {
      const payload: CreatePtContractRequest = {
        clientId: clientId.trim(),
        trainerId: finalTrainerId,
        totalSessions,
        bonusSessions: safeBonus,
        startDate,
        endDate,
        price,
        pricePerSession: pricePerSession > 0 ? pricePerSession : autoPricePerSession,
        paidAmount: safePaid,
        paymentContractStatus,
        notes: combinedNotes || undefined,
      };

      const result = await contractApi.createPtContract(payload);

      toast.success('Tạo hợp đồng PT thành công!', {
        description: `Học viên: ${selectedClient?.fullName || 'Học viên'} • ${totalSessions} buổi`,
      });

      // Điều hướng về chi tiết học viên hoặc danh sách
      if (result && selectedClient?.id) {
        navigate(`/pt/clients/${selectedClient.id}`);
      } else {
        navigate('/pt/clients');
      }
    } catch (err: unknown) {
      let message = 'Tạo hợp đồng PT thất bại. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) {
          message = res.data.message;
        }
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const remainingDebt = Math.max(0, price - paidAmount);

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ========================================================
          HEADER & NAVIGATION BAR
         ======================================================== */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors cursor-pointer group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại</span>
        </button>

        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
            <FileSignature className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Tạo hợp đồng PT
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Thiết lập thông tin hợp đồng và gói tập cho học viên
            </p>
          </div>
        </div>
      </div>

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between gap-3 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-lg text-rose-500"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ========================================================
          MAIN TWO-COLUMN FORM LAYOUT
         ======================================================== */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ========================================================
              LEFT COLUMN: 3 SECTIONS OF INPUT FIELDS (col-span-8)
             ======================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* ----------------------------------------------------
                SECTION 1: THÔNG TIN CƠ BẢN
               ---------------------------------------------------- */}
            <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  1
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Thông tin cơ bản
                </h2>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Học viên * (Dropdown tìm kiếm) */}
                <div className="space-y-1.5" ref={dropdownRef}>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Học viên <span className="text-rose-500">*</span>
                  </label>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsClientDropdownOpen((prev) => !prev)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 border text-xs sm:text-sm transition-all cursor-pointer ${
                        selectedClient
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40 text-slate-900 dark:text-white font-medium'
                          : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <User className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
                        {selectedClient ? (
                          <div className="truncate flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {selectedClient.fullName}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              ({selectedClient.phone})
                            </span>
                          </div>
                        ) : (
                          <span>Tìm kiếm học viên...</span>
                        )}
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform ${
                          isClientDropdownOpen ? 'rotate-180 text-emerald-500' : ''
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isClientDropdownOpen && (
                      <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-2 space-y-2 animate-in fade-in zoom-in-95 duration-150">
                        {/* Search input in dropdown */}
                        <div className="relative">
                          <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            value={clientSearchQuery}
                            onChange={(e) => setClientSearchQuery(e.target.value)}
                            placeholder="Gõ tên hoặc số điện thoại..."
                            autoFocus
                            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Clients list */}
                        <div className="max-h-56 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                          {isLoadingClients ? (
                            <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                              <Loader2 className="h-4 w-4 animate-spin mx-auto text-emerald-500" />
                              <p>Đang tải danh sách học viên...</p>
                            </div>
                          ) : filteredClients.length === 0 ? (
                            <div className="py-5 text-center text-xs text-slate-500 space-y-2">
                              <p>Không tìm thấy học viên nào phù hợp.</p>
                              <Link
                                to="/pt/clients/new"
                                className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-semibold"
                              >
                                <Plus className="h-3 w-3" />
                                <span>Thêm mới học viên trước</span>
                              </Link>
                            </div>
                          ) : (
                            filteredClients.map((client) => {
                              const isSelected = client.id === clientId;
                              return (
                                <button
                                  key={client.id}
                                  type="button"
                                  onClick={() => {
                                    setClientId(client.id);
                                    setIsClientDropdownOpen(false);
                                  }}
                                  className={`w-full px-3 py-2 rounded-xl text-left flex items-center justify-between gap-2 text-xs transition-colors cursor-pointer ${
                                    isSelected
                                      ? 'bg-emerald-500 text-white font-medium'
                                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <div className="flex items-center gap-2.5 truncate">
                                    <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0 overflow-hidden">
                                      {client.avatarUrl ? (
                                        <img
                                          src={client.avatarUrl}
                                          alt={client.fullName}
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <span>{client.fullName?.charAt(0) || 'H'}</span>
                                      )}
                                    </div>
                                    <div className="truncate">
                                      <p className="font-semibold truncate">{client.fullName}</p>
                                      <p
                                        className={`text-[10px] ${
                                          isSelected ? 'text-emerald-100' : 'text-slate-400'
                                        }`}
                                      >
                                        {client.phone} •{' '}
                                        {CLIENT_STATUS_LABELS[client.status]?.label || client.status}
                                      </p>
                                    </div>
                                  </div>
                                  {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                                </button>
                              );
                            })
                          )}
                        </div>

                        {/* Helper Link */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] px-1 text-slate-500">
                          <span>Chưa có học viên?</span>
                          <Link
                            to="/pt/clients/new"
                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-semibold inline-flex items-center gap-0.5"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Tạo hồ sơ học viên mới</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. PT phụ trách * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    PT phụ trách <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <UserCheck className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={trainerId}
                      onChange={(e) => setTrainerId(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
                    >
                      <option value={authUser?.id || ''}>
                        {authUser?.username || 'Huấn luyện viên hiện tại'} (Bạn)
                      </option>
                    </select>
                  </div>
                </div>

                {/* 3. Tổng số buổi mua * */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tổng số buổi mua <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      {[12, 24, 36, 48].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleSessionsChange(s)}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            totalSessions === s
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <Dumbbell className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={1}
                      value={totalSessions || ''}
                      onChange={(e) => handleSessionsChange(parseInt(e.target.value) || 0)}
                      placeholder="Nhập số buổi mua"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* 4. Số buổi tặng */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Số buổi tặng
                    </label>
                    <div className="flex items-center gap-1">
                      {[0, 2, 3, 5].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBonusSessions(b)}
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                            bonusSessions === b
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          +{b}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <Gift className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min={0}
                      value={bonusSessions}
                      onChange={(e) => setBonusSessions(parseInt(e.target.value) || 0)}
                      placeholder="Nhập số buổi tặng (nếu có)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* 5. Ngày bắt đầu * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* 6. Ngày hết hạn * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày hết hạn <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* 7a. Đơn giá 1 buổi tập (VND) - Nằm trước Tổng giá gói tập */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Đơn giá / buổi (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {formatVND(pricePerSession)} / buổi
                    </span>
                  </div>
                  <div className="relative">
                    <Coins className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step={10000}
                      min={0}
                      value={pricePerSession || ''}
                      onChange={(e) => handlePricePerSessionChange(parseFloat(e.target.value) || 0)}
                      placeholder="Nhập giá 1 buổi (VD: 350000)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  {/* Gợi ý mức giá theo buổi phổ biến */}
                  <div className="flex items-center gap-1 pt-0.5 overflow-x-auto custom-scrollbar">
                    <span className="text-[10px] text-slate-400 shrink-0">Mức giá:</span>
                    {[250000, 300000, 350000, 400000, 500000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => handlePricePerSessionChange(preset)}
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                          pricePerSession === preset
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                      >
                        {preset / 1000}k
                      </button>
                    ))}
                  </div>
                </div>

                {/* 7b. Tổng giá gói tập (VND) - Tự động tính = Đơn giá * Số buổi mua */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Tổng giá gói tập (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      {formatVND(price)}
                    </span>
                  </div>
                  <div className="relative">
                    <Coins className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step={50000}
                      min={0}
                      value={price || ''}
                      onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                      placeholder="Tổng giá trị gói tập"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  {/* Hiển thị công thức nhân trực quan */}
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    <Calculator className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">
                      = <strong>{totalSessions}</strong> buổi × <strong>{formatVND(pricePerSession)}</strong> = <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatVND(price)}</strong>
                    </span>
                  </div>
                </div>

                {/* 8. Số tiền đã thanh toán (VND) * */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Số tiền đã thanh toán (VNĐ) <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handlePaidAmountChange(price)}
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        100%
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaidAmountChange(Math.round(price * 0.5))}
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                      >
                        50%
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePaidAmountChange(0)}
                        className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        0 VNĐ
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Coins className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step={100000}
                      min={0}
                      max={price}
                      value={paidAmount}
                      onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                      placeholder="Nhập số tiền đã thanh toán"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-medium pt-0.5">
                    <span className="text-slate-500 dark:text-slate-400">
                      Đã đóng: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatVND(paidAmount)}</strong>
                    </span>
                    {remainingDebt > 0 ? (
                      <span className="text-rose-500 font-semibold">Còn nợ: {formatVND(remainingDebt)}</span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                        <Check className="h-3 w-3" /> Đã đóng đủ
                      </span>
                    )}
                  </div>
                </div>

                {/* 8b. Trạng thái thanh toán (PaymentContractStatus) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Trạng thái thanh toán <span className="text-rose-500">*</span>
                    </label>
                    <PaymentStatusBadge status={paymentContractStatus} paidAmount={paidAmount} price={price} />
                  </div>
                  <select
                    value={paymentContractStatus}
                    onChange={(e) => setPaymentContractStatus(e.target.value as PaymentContractStatus)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-semibold outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {(Object.keys(PAYMENT_CONTRACT_STATUS_CONFIG) as PaymentContractStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {PAYMENT_CONTRACT_STATUS_CONFIG[st].label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
                    Tự động đồng bộ theo số tiền đã thanh toán hoặc tuỳ chỉnh thủ công.
                  </p>
                </div>

                {/* 9. Trạng thái hợp đồng * */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái hợp đồng <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm flex items-center gap-2 text-slate-900 dark:text-white font-medium">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Hoạt động</span>
                    </div>
                  </div>
                </div>

                {/* 10. Ghi chú */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú
                  </label>
                  <div className="relative">
                    <FileText className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Nhập ghi chú (nếu có)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                SECTION 2: THÔNG TIN BỔ SUNG (Xem lại / Điền chỉ số)
               ---------------------------------------------------- */}
            <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  2
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Thông tin bổ sung
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {selectedClient
                      ? `Đã đồng bộ tự động từ hồ sơ học viên: ${selectedClient.fullName}`
                      : 'Đồng bộ từ hồ sơ học viên khi được chọn'}
                  </p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chiều cao */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chiều cao (cm)
                  </label>
                  <div className="relative">
                    <Activity className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step={0.5}
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="Nhập chiều cao (cm)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Ngày sinh */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày sinh
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Cân nặng */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cân nặng (kg)
                  </label>
                  <div className="relative">
                    <Scale className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      step={0.1}
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      placeholder="Nhập cân nặng (kg)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>

                {/* Mục tiêu tập luyện */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Mục tiêu tập luyện
                  </label>
                  <div className="relative">
                    <Target className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={fitnessGoal}
                      onChange={(e) => setFitnessGoal(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
                    >
                      {Object.entries(FITNESS_GOAL_LABELS).map(([k, label]) => (
                        <option key={k} value={k}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ----------------------------------------------------
                SECTION 3: LỊCH TẬP & GHI CHÚ THÊM
               ---------------------------------------------------- */}
            <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-6">
              {/* Section Header */}
              <div className="flex items-center gap-3">
                <span className="h-7 w-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Lịch tập & Ghi chú thêm
                </h2>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Lịch tập tuần */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Lịch tập (tuần)
                  </label>
                  <div className="relative">
                    <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <select
                      value={scheduleWeekly}
                      onChange={(e) => setScheduleWeekly(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all cursor-pointer"
                    >
                      {SCHEDULE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ghi chú lịch tập */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú lịch tập
                  </label>
                  <div className="relative">
                    <FileText className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={scheduleNotes}
                      onChange={(e) => setScheduleNotes(e.target.value)}
                      placeholder="Nhập ghi chú lịch tập (nếu có)"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              RIGHT COLUMN: TÓM TẮT HỢP ĐỒNG (STICKY SUMMARY CARD)
             ======================================================== */}
          <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] shadow-xs overflow-hidden">
              {/* Header Banner */}
              <div className="bg-gradient-to-br from-emerald-500/15 via-teal-500/10 to-transparent p-5 border-b border-emerald-100 dark:border-emerald-950/40 flex items-center gap-3.5">
                <div className="h-10 w-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Tóm tắt hợp đồng
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Xem trước điều khoản trước khi xác nhận
                  </p>
                </div>
              </div>

              {/* Data Table */}
              <div className="p-5 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Học viên</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] text-right">
                    {selectedClient ? selectedClient.fullName : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">PT phụ trách</span>
                  <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[180px] text-right">
                    {authUser?.username || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Tổng số buổi mua</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {totalSessions ? `${totalSessions} buổi` : '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Buổi tặng</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {bonusSessions ? `+${bonusSessions} buổi` : '0 buổi'}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Ngày bắt đầu</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDateDisplay(startDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Ngày hết hạn</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDateDisplay(endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Đơn giá / buổi</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {formatVND(pricePerSession || autoPricePerSession)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Tổng giá gói tập</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVND(price)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Đã thanh toán</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatVND(paidAmount)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400">Tình trạng thu</span>
                  <PaymentStatusBadge status={paymentContractStatus} paidAmount={paidAmount} price={price} />
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-500 dark:text-slate-400">Trạng thái</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-500/30">
                    Hoạt động
                  </span>
                </div>
              </div>

              {/* Box Lưu ý */}
              <div className="mx-5 mb-5 p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <Lightbulb className="h-4 w-4 text-emerald-600" />
                  <span>Lưu ý</span>
                </div>
                <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5 leading-relaxed">
                  <li>• Hợp đồng sẽ được lưu vào hệ thống sau khi tạo.</li>
                  <li>• Bạn có thể chỉnh sửa thông tin bất kỳ lúc nào trước khi xác nhận.</li>
                  <li>• Sau khi xác nhận, học viên sẽ nhận được thông báo qua email/SMS.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="p-5 pt-0 space-y-2.5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang lưu hợp đồng...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Tạo hợp đồng</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
                  <span>Làm mới</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* ========================================================
          PAGE FOOTER BRANDING & QUOTE
         ======================================================== */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
        <div>
          <p className="italic">“Sức khỏe tốt hơn bắt đầu từ những lựa chọn hôm nay.”</p>
          <p className="mt-0.5">ZenFit © 2025 | PT Workspace</p>
        </div>
        <div className="font-medium tracking-wide">
          Better Training • Better You
        </div>
      </div>
    </div>
  );
}
