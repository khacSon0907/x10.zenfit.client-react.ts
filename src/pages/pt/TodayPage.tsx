import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CircleDollarSign,
  Bell,
  ChevronRight,
  Plus,
  Clock,
  Check,
  CreditCard,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  ChevronLeft,
  CalendarDays,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import { trainerTaskApi } from '../../api/trainerTaskApi';
import { clientApi } from '../../api/clientApi';
import { contractApi } from '../../api/contractApi';
import subscriptionPlanApi from '../../api/subscriptionPlanApi';
import type {
  TrainingSessionCalendarItem,
  TrainerTask,
  TrainerTaskStatus,
} from '../../types/session.types';
import type { ClientResponse } from '../../types/client.types';
import type { PtContractResponse } from '../../types/contract.types';
import type { UserSubscriptionResponse } from '../../types/subscription';
import {
  formatIsoDate,
  parseIsoDate,
  formatDisplayDate,
  formatTimeRange,
  formatDisplayTime,
  getWeekDays,
} from '../../utils/calendarUtils';
import { SessionStatusBadge } from '../../components/schedule/SessionStatusBadge';
import { CreateSessionModal } from '../../components/schedule/CreateSessionModal';
import { SessionDetailModal } from '../../components/schedule/SessionDetailModal';
import { CompleteSessionModal } from '../../components/schedule/CompleteSessionModal';
import { TrainerTaskDetailModal } from '../../components/schedule/TrainerTaskDetailModal';

// Type hoạt động thực tế
interface DashboardActivity {
  id: string;
  type: 'session' | 'client' | 'contract' | 'task';
  timestamp: string;
  timeDisplay: string;
  title: string;
  subtitle?: string;
  badge: string;
  badgeType: 'success' | 'info' | 'emerald' | 'warning';
}

export default function TodayPage() {
  const { user: authUser } = useAuth();

  // State Ngày làm việc được chọn (mặc định: Ngày hôm nay)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Filter tab cho danh sách công việc hôm nay ('ALL' | 'SESSIONS' | 'TASKS')
  const [scheduleTab, setScheduleTab] = useState<'ALL' | 'SESSIONS' | 'TASKS'>('ALL');

  // Loading states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Dữ liệu thời gian thực từ Backend
  const [daySessions, setDaySessions] = useState<TrainingSessionCalendarItem[]>([]);
  const [dayTasks, setDayTasks] = useState<TrainerTask[]>([]);
  const [weekSessions, setWeekSessions] = useState<TrainingSessionCalendarItem[]>([]);
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [contracts, setContracts] = useState<PtContractResponse[]>([]);
  const [subscription, setSubscription] = useState<UserSubscriptionResponse | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedSessionForDetail, setSelectedSessionForDetail] = useState<TrainingSessionCalendarItem | null>(null);
  const [sessionToComplete, setSessionToComplete] = useState<TrainingSessionCalendarItem | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<TrainerTask | null>(null);

  // Chuỗi ISO của ngày được chọn và hôm nay
  const selectedDateStr = useMemo(() => formatIsoDate(selectedDate), [selectedDate]);
  const todayStr = useMemo(() => formatIsoDate(new Date()), []);
  const isSelectedDateToday = selectedDateStr === todayStr;

  // Map tra cứu Client nhanh (Id -> Client)
  const clientMap = useMemo(() => {
    const map = new Map<string, ClientResponse>();
    clients.forEach((c) => map.set(c.id, c));
    return map;
  }, [clients]);

  // Map tra cứu Contract nhanh (Id -> Contract)
  const contractMap = useMemo(() => {
    const map = new Map<string, PtContractResponse>();
    contracts.forEach((c) => map.set(c.id, c));
    return map;
  }, [contracts]);

  // Map ClientId -> Tên học viên
  const clientsNameMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => map.set(c.id, c.fullName));
    return map;
  }, [clients]);

  // Format hiển thị tiêu đề ngày dạng Tiếng Việt
  const formatHeaderDate = (d: Date) => {
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
  };

  // Format tiền tệ VND
  const formatCurrency = (amount: number | string | undefined | null) => {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  // 1. Tải toàn bộ dữ liệu Dashboard từ Backend API
  const loadDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setIsRefreshing(true);

    try {
      // Gọi song song 5 API dữ liệu thực tế
      const [dayCalRes, weekCalRes, clientsRes, contractsRes, subRes] = await Promise.allSettled([
        // 1. Lịch & nhiệm vụ trong ngày được chọn
        trainingSessionApi.getCalendar({
          view: 'DAY',
          date: selectedDateStr,
          trainerId: authUser?.id,
        }),
        // 2. Lịch tuần để vẽ biểu đồ điểm danh
        trainingSessionApi.getCalendar({
          view: 'WEEK',
          date: selectedDateStr,
          trainerId: authUser?.id,
        }),
        // 3. Danh sách học viên của PT
        clientApi.getAllClients(authUser?.id),
        // 4. Danh sách hợp đồng PT
        authUser?.id ? contractApi.getContractsByTrainerId(authUser.id) : Promise.resolve([]),
        // 5. Gói dịch vụ & Hạn mức của PT
        subscriptionPlanApi.getMySubscription().catch(() => null),
      ]);

      // Xử lý kết quả Lịch ngày
      if (dayCalRes.status === 'fulfilled' && dayCalRes.value) {
        setDaySessions(dayCalRes.value.sessions || []);
        setDayTasks(dayCalRes.value.tasks || []);
      } else {
        setDaySessions([]);
        setDayTasks([]);
      }

      // Xử lý kết quả Lịch tuần
      if (weekCalRes.status === 'fulfilled' && weekCalRes.value) {
        setWeekSessions(weekCalRes.value.sessions || []);
      } else {
        setWeekSessions([]);
      }

      // Xử lý Học viên
      if (clientsRes.status === 'fulfilled' && Array.isArray(clientsRes.value)) {
        setClients(clientsRes.value);
      }

      // Xử lý Hợp đồng
      if (contractsRes.status === 'fulfilled' && Array.isArray(contractsRes.value)) {
        setContracts(contractsRes.value);
      }

      // Xử lý Gói dịch vụ
      if (subRes.status === 'fulfilled') {
        setSubscription(subRes.value);
      }
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu dashboard:', err);
      toast.error('Không thể đồng bộ dữ liệu tổng quan. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [authUser?.id, selectedDateStr]);

  // Load ban đầu và khi đổi ngày
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Điều hướng ngày: Hôm nay, Ngày trước, Ngày sau
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 1);
    setSelectedDate(next);
  };

  const handleGoToday = () => {
    setSelectedDate(new Date());
  };

  // Toggle nhanh trạng thái nhiệm vụ cá nhân (TODO -> DONE)
  const handleToggleTaskStatus = async (task: TrainerTask) => {
    const newStatus: TrainerTaskStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    try {
      await trainerTaskApi.updateStatus(task.id, newStatus);
      toast.success(
        newStatus === 'DONE' ? 'Đã hoàn thành nhiệm vụ!' : 'Đã đưa nhiệm vụ về cần làm'
      );
      // Cập nhật state trực tiếp
      setDayTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
      );
    } catch {
      toast.error('Không thể cập nhật trạng thái nhiệm vụ');
    }
  };

  // =========================================================================
  // TÍNH TOÁN CÁC CHỈ SỐ KPI THỜI GIAN THỰC (REAL METRICS)
  // =========================================================================

  // 1. Chỉ số Lịch hôm nay
  const totalDaySessions = daySessions.length;
  const completedDaySessions = daySessions.filter((s) => s.status === 'COMPLETED').length;
  const scheduledDaySessions = daySessions.filter((s) => s.status === 'SCHEDULED').length;
  const noShowDaySessions = daySessions.filter((s) => s.status === 'NO_SHOW').length;

  // 2. Chỉ số Học viên & Hạn mức gói
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === 'ACTIVE').length;
  const maxStudents = subscription?.maxStudents ?? 5;
  const currentStudents = subscription?.currentStudents ?? totalClients;

  // 3. Doanh thu đã thanh toán thực tế (Paid Amount)
  const totalRevenue = useMemo(() => {
    return contracts.reduce((acc, c) => acc + (Number(c.paidAmount) || 0), 0);
  }, [contracts]);

  const activeContractsCount = useMemo(() => {
    return contracts.filter((c) => c.status === 'ACTIVE').length;
  }, [contracts]);

  // 4. Danh sách Công nợ cần thu (price > paidAmount)
  const debtContracts = useMemo(() => {
    return contracts
      .filter((c) => {
        const price = Number(c.price) || 0;
        const paid = Number(c.paidAmount) || 0;
        return price > paid;
      })
      .map((c) => {
        const client = clientMap.get(c.clientId);
        const price = Number(c.price) || 0;
        const paid = Number(c.paidAmount) || 0;
        const remainingDebt = price - paid;
        return {
          contractId: c.id,
          clientId: c.clientId,
          clientName: client?.fullName || 'Học viên',
          clientPhone: client?.phone,
          debtAmount: remainingDebt,
          totalSessions: c.totalSessions,
        };
      })
      .sort((a, b) => b.debtAmount - a.debtAmount);
  }, [contracts, clientMap]);

  const totalDebtAmount = useMemo(() => {
    return debtContracts.reduce((sum, item) => sum + item.debtAmount, 0);
  }, [debtContracts]);

  // 5. Danh sách Gói tập sắp hết buổi (remainingSessions <= 3)
  const expiringContracts = useMemo(() => {
    return contracts
      .filter((c) => {
        if (c.status !== 'ACTIVE') return false;
        const total = (c.totalSessions || 0) + (c.bonusSessions || 0);
        const used = c.usedSessions || 0;
        const remaining = total - used;
        return remaining <= 3 && remaining >= 0;
      })
      .map((c) => {
        const client = clientMap.get(c.clientId);
        const total = (c.totalSessions || 0) + (c.bonusSessions || 0);
        const used = c.usedSessions || 0;
        const remaining = Math.max(0, total - used);
        return {
          contractId: c.id,
          clientId: c.clientId,
          clientName: client?.fullName || 'Học viên',
          clientPhone: client?.phone,
          remainingSessions: remaining,
          totalSessions: total,
          usedSessions: used,
        };
      })
      .sort((a, b) => a.remainingSessions - b.remainingSessions);
  }, [contracts, clientMap]);

  // 6. Tính toán biểu đồ điểm danh tuần (Weekly Attendance Chart)
  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);

  const weeklyChartData = useMemo(() => {
    return weekDays.map((wd) => {
      // Lọc các buổi tập của ngày này
      const dayMatches = weekSessions.filter((s) => s.trainingDate === wd.dateStr);
      const completedCount = dayMatches.filter((s) => s.status === 'COMPLETED').length;
      const totalCount = dayMatches.length;

      return {
        day: wd.shortDayName,
        date: formatDisplayDate(wd.dateStr).slice(0, 5),
        dateStr: wd.dateStr,
        completedCount,
        totalCount,
        isCurrent: wd.dateStr === selectedDateStr,
      };
    });
  }, [weekDays, weekSessions, selectedDateStr]);

  const maxWeeklySessions = useMemo(() => {
    const maxVal = Math.max(...weeklyChartData.map((d) => d.totalCount), 4);
    return maxVal;
  }, [weeklyChartData]);

  // 7. Hoạt động gần đây thực tế (Recent Activities) tổng hợp từ các entity
  const recentActivities: DashboardActivity[] = useMemo(() => {
    const list: DashboardActivity[] = [];

    // Các buổi tập đã hoàn thành
    weekSessions
      .filter((s) => s.status === 'COMPLETED')
      .slice(0, 4)
      .forEach((s) => {
        const client = clientMap.get(s.clientId);
        list.push({
          id: `session-${s.id}`,
          type: 'session',
          timestamp: s.endTime || `${s.trainingDate}T${s.startTime || '12:00:00'}`,
          timeDisplay: formatDisplayTime(s.startTime),
          title: `${client?.fullName || 'Học viên'} hoàn thành buổi tập`,
          subtitle: s.sessionName,
          badge: 'Hoàn thành',
          badgeType: 'success',
        });
      });

    // Các hợp đồng mới
    contracts.slice(0, 3).forEach((c) => {
      const client = clientMap.get(c.clientId);
      list.push({
        id: `contract-${c.id}`,
        type: 'contract',
        timestamp: c.createdAt || c.startDate || todayStr,
        timeDisplay: c.createdAt ? new Date(c.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Hôm nay',
        title: `${client?.fullName || 'Học viên'} đăng ký gói ${c.totalSessions} buổi`,
        subtitle: formatCurrency(c.price),
        badge: c.paymentContractStatus === 'PAID' ? 'Đã thanh toán' : 'Hợp đồng mới',
        badgeType: c.paymentContractStatus === 'PAID' ? 'emerald' : 'info',
      });
    });

    // Các học viên mới
    clients.slice(0, 2).forEach((cl) => {
      list.push({
        id: `client-${cl.id}`,
        type: 'client',
        timestamp: cl.createdAt || todayStr,
        timeDisplay: 'Gần đây',
        title: `Hồ sơ học viên mới: ${cl.fullName}`,
        subtitle: cl.fitnessGoal || cl.phone || undefined,
        badge: 'Học viên mới',
        badgeType: 'info',
      });
    });

    // Sắp xếp giảm dần theo thời gian
    return list.slice(0, 5);
  }, [weekSessions, contracts, clients, clientMap, todayStr]);

  return (
    <div className="space-y-6 select-none transition-colors duration-200">
      {/* =================================================================== */}
      {/* 1. HEADER CHÀO MỪNG, BỘ CHỌN NGÀY & NÚT HÀNH ĐỘNG                   */}
      {/* =================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            Tổng Quan Huấn Luyện
            {isSelectedDateToday && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Hôm nay
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Chào mừng {authUser?.username || 'Huấn luyện viên'}, hãy sẵn sàng cho các buổi tập hiệu quả!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Nút Về Hôm nay nếu đang xem ngày khác */}
          {!isSelectedDateToday && (
            <button
              onClick={handleGoToday}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#132238] dark:hover:bg-[#1a2d47] text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1b2b42] transition-colors cursor-pointer"
            >
              Về hôm nay
            </button>
          )}

          {/* Bộ điều khiển ngày: Trước / Chọn Ngày / Sau */}
          <div className="flex items-center bg-white dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] rounded-xl shadow-xs overflow-hidden">
            <button
              onClick={handlePrevDay}
              title="Ngày trước"
              className="p-2 hover:bg-slate-100 dark:hover:bg-[#132238] text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => dateInputRef.current?.showPicker()}
              className="px-3 py-2 flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#132238] transition-colors cursor-pointer border-x border-slate-200 dark:border-[#1b2b42]"
            >
              <Calendar className="h-3.5 w-3.5 text-emerald-500" />
              <span>{formatHeaderDate(selectedDate)}</span>
            </button>

            <button
              onClick={handleNextDay}
              title="Ngày sau"
              className="p-2 hover:bg-slate-100 dark:hover:bg-[#132238] text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Input date ẩn để dùng native datepicker */}
            <input
              type="date"
              ref={dateInputRef}
              value={selectedDateStr}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(parseIsoDate(e.target.value));
                }
              }}
              className="sr-only"
            />
          </div>

          {/* Nút Làm mới dữ liệu */}
          <button
            onClick={() => loadDashboardData(true)}
            disabled={isRefreshing}
            title="Làm mới dữ liệu từ máy chủ"
            className="p-2.5 rounded-xl bg-white dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] text-slate-600 dark:text-slate-300 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-50 dark:hover:bg-[#132238] transition-colors cursor-pointer shadow-xs disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Nút Tạo lịch tập mới */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tạo lịch tập</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. BỐN THẺ KPI CHÍNH (REAL METRIC CARDS)                            */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lịch hôm nay */}
        <Link
          to="/pt/schedule"
          className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-xs transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {isSelectedDateToday ? 'Lịch hôm nay' : `Lịch ngày ${formatDisplayDate(selectedDateStr).slice(0, 5)}`}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              ) : (
                totalDaySessions
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
              {completedDaySessions} đã hoàn thành • {scheduledDaySessions} sắp tới{noShowDaySessions > 0 ? ` • ${noShowDaySessions} vắng` : ''}
            </div>
          </div>
        </Link>

        {/* Card 2: Học viên đang huấn luyện */}
        <Link
          to="/pt/clients"
          className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-xs transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
              <Users className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Học viên quản lý</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              ) : (
                totalClients
              )}
            </div>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <span>{activeClients} đang hoạt động</span>
              <span className="text-slate-400 font-normal">
                • Hạn mức: {currentStudents}/{maxStudents}
              </span>
            </div>
          </div>
        </Link>

        {/* Card 3: Doanh thu thực tế */}
        <Link
          to="/pt/contracts"
          className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] hover:border-emerald-500/50 dark:hover:border-emerald-500/40 shadow-xs transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Doanh thu đã thu</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              ) : (
                formatCurrency(totalRevenue)
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
              {activeContractsCount} hợp đồng đang có hiệu lực
            </div>
          </div>
        </Link>

        {/* Card 4: Cần theo dõi (Công nợ & Gói sắp hết) */}
        <Link
          to="/pt/contracts"
          className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] hover:border-amber-500/50 dark:hover:border-amber-500/40 shadow-xs transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 dark:text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 dark:group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Cần theo dõi</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {isLoading ? (
                <div className="h-8 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              ) : (
                debtContracts.length + expiringContracts.length
              )}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 truncate">
              {expiringContracts.length} gói sắp hết • {debtContracts.length} công nợ
            </div>
          </div>
        </Link>
      </div>

      {/* =================================================================== */}
      {/* 3. BỐ CỤC 2 CỘT CHÍNH (MAIN DASHBOARD GRID)                          */}
      {/* =================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ================================================================= */}
        {/* CỘT TRÁI (7 CỘT): LỊCH LÀM VIỆC NGÀY & HOẠT ĐỘNG GẦN ĐÂY          */}
        {/* ================================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Lịch làm việc & Buổi tập trong ngày */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Lịch ngày {formatDisplayDate(selectedDateStr)}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-[#132238] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1b2b42]">
                  {totalDaySessions + dayTasks.length} mục
                </span>
              </div>

              {/* Tab phân loại: Tất cả | Buổi tập | Nhiệm vụ */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#09111e] p-1 rounded-xl border border-slate-200 dark:border-[#162338]">
                <button
                  onClick={() => setScheduleTab('ALL')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    scheduleTab === 'ALL'
                      ? 'bg-white dark:bg-[#152338] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Tất cả ({totalDaySessions + dayTasks.length})
                </button>
                <button
                  onClick={() => setScheduleTab('SESSIONS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    scheduleTab === 'SESSIONS'
                      ? 'bg-white dark:bg-[#152338] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Buổi tập ({totalDaySessions})
                </button>
                <button
                  onClick={() => setScheduleTab('TASKS')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    scheduleTab === 'TASKS'
                      ? 'bg-white dark:bg-[#152338] text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  Nhiệm vụ ({dayTasks.length})
                </button>
              </div>
            </div>

            {/* Danh sách các buổi tập & hoạt động */}
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((idx) => (
                  <div
                    key={idx}
                    className="h-20 rounded-xl bg-slate-100 dark:bg-[#09111e] border border-slate-200 dark:border-[#162338] animate-pulse"
                  />
                ))}
              </div>
            ) : totalDaySessions === 0 && dayTasks.length === 0 ? (
              /* Empty state khi không có lịch */
              <div className="py-12 text-center rounded-xl bg-slate-50/50 dark:bg-[#09111e]/40 border border-dashed border-slate-200 dark:border-[#1b2b42] space-y-3">
                <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Không có lịch làm việc trong ngày này
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    Bạn chưa xếp lịch tập hoặc công việc cá nhân nào cho ngày {formatDisplayDate(selectedDateStr)}.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>Lên lịch ngay</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* 1. Render Buổi tập (Sessions) */}
                {(scheduleTab === 'ALL' || scheduleTab === 'SESSIONS') &&
                  daySessions.map((session) => {
                    const client = clientMap.get(session.clientId);
                    const contract = contractMap.get(session.contractId);
                    const clientName = client?.fullName || session.clientName || 'Học viên';
                    const timeRange = formatTimeRange(session.startTime, session.endTime);

                    return (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl bg-slate-50 dark:bg-[#09111e] border border-slate-200 dark:border-[#162338] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-[#1e3250] ${
                          session.status === 'COMPLETED'
                            ? 'border-l-4 border-l-emerald-500'
                            : session.status === 'NO_SHOW'
                            ? 'border-l-4 border-l-amber-500'
                            : session.status === 'CANCELLED'
                            ? 'border-l-4 border-l-rose-500 opacity-70'
                            : 'border-l-4 border-l-blue-500'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Khung giờ */}
                          <div className="text-xs font-bold text-slate-900 dark:text-white shrink-0 w-24 leading-tight">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              <span>{timeRange.split('-')[0]?.trim()}</span>
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 font-medium pl-4 text-[11px]">
                              - {timeRange.split('-')[1]?.trim() || '--:--'}
                            </div>
                          </div>

                          {/* Avatar học viên */}
                          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 font-bold text-sm shrink-0">
                            {clientName.charAt(0).toUpperCase()}
                          </div>

                          {/* Thông tin học viên & Buổi tập */}
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                              {clientName}
                            </h3>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {session.sessionName}
                              {contract?.totalSessions ? ` • Gói ${contract.totalSessions} buổi` : ''}
                            </p>
                            {session.note && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1 italic">
                                &ldquo;{session.note}&rdquo;
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Phía phải: Trạng thái & Nút thao tác */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <SessionStatusBadge status={session.status} size="sm" showIcon />

                          {session.status === 'SCHEDULED' && (
                            <button
                              onClick={() => setSessionToComplete(session)}
                              className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer transition-colors"
                            >
                              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                              <span>Check-in</span>
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedSessionForDetail(session)}
                            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1b2b42] hover:bg-slate-100 dark:hover:bg-[#132238] text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition-colors cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {/* 2. Render Nhiệm vụ cá nhân (Trainer Tasks) */}
                {(scheduleTab === 'ALL' || scheduleTab === 'TASKS') &&
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl bg-slate-50/70 dark:bg-[#09111e]/70 border border-slate-200/80 dark:border-[#162338]/80 flex items-center justify-between gap-3 transition-colors ${
                        task.status === 'DONE' ? 'opacity-60 line-through' : ''
                      }`}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: task.color || '#10B981',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTaskStatus(task)}
                          className={`h-6 w-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                            task.status === 'DONE'
                              ? 'bg-emerald-500 text-white'
                              : 'border border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-transparent'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                        </button>

                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {task.title}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {task.allDay
                              ? 'Cả ngày'
                              : `${formatDisplayTime(task.startTime)} - ${formatDisplayTime(task.endTime)}`}
                            {task.description ? ` • ${task.description}` : ''}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedTaskForDetail(task)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-[#132238] transition-colors"
                      >
                        Sửa
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Card: Hoạt động gần đây (Derived from real entities) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <Activity className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Hoạt động gần đây</h2>
              </div>
              <Link
                to="/pt/schedule"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Xem lịch tập</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentActivities.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                Chưa có hoạt động gần đây được ghi nhận.
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-[#09111e] border border-slate-200 dark:border-[#152338] flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-[#0c1728] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        {act.type === 'session' ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : act.type === 'contract' ? (
                          <CreditCard className="h-3.5 w-3.5" />
                        ) : (
                          <UserPlus className="h-3.5 w-3.5" />
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                        {act.timeDisplay}
                      </span>
                      <div className="min-w-0">
                        <span className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate block">
                          {act.title}
                        </span>
                        {act.subtitle && (
                          <span className="text-[10px] text-slate-400 truncate block">
                            {act.subtitle}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                        act.badgeType === 'success'
                          ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                          : act.badgeType === 'emerald'
                          ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50'
                          : 'bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/50'
                      }`}
                    >
                      {act.badge}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ================================================================= */}
        {/* CỘT PHẢI (5 CỘT): CẦN XỬ LÝ (CÔNG NỢ & GIA HẠN) & BIỂU ĐỒ TUẦN   */}
        {/* ================================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Cần xử lý */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Cần xử lý</h2>
              </div>
              <Link
                to="/pt/contracts"
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Xem hợp đồng</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Sub-section 1: Công nợ cần thu */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#09111e] border border-slate-200 dark:border-[#162338] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Công nợ cần thu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-rose-500 dark:text-rose-400">
                    {formatCurrency(totalDebtAmount)}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {debtContracts.length} học viên
                  </span>
                </div>
              </div>

              {debtContracts.length === 0 ? (
                <div className="py-2 text-center text-xs text-slate-400">
                  Tuyệt vời! Không có công nợ nào chưa thu.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-[#162338] pt-1">
                  {debtContracts.slice(0, 3).map((debt) => (
                    <div
                      key={debt.contractId}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {debt.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                          {formatCurrency(debt.debtAmount)}
                        </span>
                        <button
                          onClick={() => {
                            if (debt.clientPhone) {
                              navigator.clipboard?.writeText(debt.clientPhone);
                              toast.success(`Đã sao chép SĐT ${debt.clientPhone} của ${debt.clientName}!`);
                            } else {
                              toast.info(`Nhắc nhở học viên ${debt.clientName} thanh toán số dư`);
                            }
                          }}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Nhắc nợ</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sub-section 2: Gói tập sắp hết buổi */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#09111e] border border-slate-200 dark:border-[#162338] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-amber-500/10 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Gói tập sắp hết buổi</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {expiringContracts.length} gói
                </span>
              </div>

              {expiringContracts.length === 0 ? (
                <div className="py-2 text-center text-xs text-slate-400">
                  Tất cả học viên đều còn đủ số buổi tập.
                </div>
              ) : (
                <div className="divide-y divide-slate-200 dark:divide-[#162338] pt-1">
                  {expiringContracts.slice(0, 3).map((pkg) => (
                    <div
                      key={pkg.contractId}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                          {pkg.clientName}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-amber-600 dark:text-amber-400 font-semibold">
                          còn {pkg.remainingSessions} buổi
                        </span>
                        <Link
                          to={`/pt/contracts/new?clientId=${pkg.clientId}`}
                          className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Gia hạn</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Card: Tình hình điểm danh tuần (Weekly Attendance Bar Chart) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#17263c] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Tình hình điểm danh tuần</h2>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 dark:bg-[#132238] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1b2b42]">
                7 ngày
              </span>
            </div>

            {/* Attendance Bar Chart Container */}
            <div className="pt-4">
              <div className="h-44 flex items-end justify-between gap-2 px-2 relative">
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-0 border-b border-slate-100 dark:border-slate-800/40" />
                <div className="absolute inset-x-0 top-1/4 border-b border-slate-100 dark:border-slate-800/40" />
                <div className="absolute inset-x-0 top-2/4 border-b border-slate-100 dark:border-slate-800/40" />
                <div className="absolute inset-x-0 top-3/4 border-b border-slate-100 dark:border-slate-800/40" />

                {/* Y-Axis Label */}
                <div className="absolute left-0 top-0 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {maxWeeklySessions}
                </div>
                <div className="absolute left-0 top-2/4 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {Math.round(maxWeeklySessions / 2)}
                </div>
                <div className="absolute left-0 bottom-0 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  0
                </div>

                {/* Bars */}
                {weeklyChartData.map((item) => {
                  const heightPercent =
                    maxWeeklySessions > 0
                      ? Math.min(100, (item.totalCount / maxWeeklySessions) * 100)
                      : 0;

                  return (
                    <div
                      key={item.day}
                      onClick={() => setSelectedDate(parseIsoDate(item.dateStr))}
                      title={`${item.day} (${item.date}): ${item.completedCount} hoàn thành / ${item.totalCount} buổi`}
                      className="flex-1 flex flex-col items-center h-full justify-end group z-10 cursor-pointer"
                    >
                      {/* Bar Value */}
                      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
                        {item.totalCount}
                      </span>

                      {/* Bar Column */}
                      <div className="w-full max-w-[28px] h-32 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            item.totalCount > 0
                              ? item.isCurrent
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30'
                                : 'bg-gradient-to-t from-emerald-500/60 to-emerald-400/80 dark:from-emerald-800/80 dark:to-emerald-500/80 group-hover:to-emerald-400'
                              : 'bg-transparent border border-dashed border-slate-300/40 dark:border-slate-700/40'
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="mt-2 text-center">
                        <span
                          className={`text-xs font-bold block ${
                            item.isCurrent
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {item.day}
                        </span>
                        <span className="text-[9px] text-slate-400 dark:text-slate-500 block">
                          {item.date}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="mt-5 pt-3 border-t border-slate-200 dark:border-[#162338] flex items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Buổi tập trong tuần</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span>Chưa có lịch</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 4. TÍCH HỢP CÁC MODALS THỰC TẾ (REAL INTEGRATED MODALS)              */}
      {/* =================================================================== */}

      {/* Modal: Tạo lịch tập mới (Real Client & Contract selector) */}
      {isCreateModalOpen && (
        <CreateSessionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultDate={selectedDateStr}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            loadDashboardData(true);
            toast.success('Đã lên lịch tập thành công!');
          }}
        />
      )}

      {/* Modal: Xem chi tiết & Quản lý buổi tập */}
      {selectedSessionForDetail && (
        <SessionDetailModal
          isOpen={Boolean(selectedSessionForDetail)}
          session={selectedSessionForDetail}
          clientsMap={clientsNameMap}
          onClose={() => setSelectedSessionForDetail(null)}
          onSuccess={() => {
            setSelectedSessionForDetail(null);
            loadDashboardData(true);
          }}
          onOpenCompleteModal={(sess) => {
            setSelectedSessionForDetail(null);
            setSessionToComplete(sess);
          }}
          onNoShow={async (sessionId) => {
            try {
              await trainingSessionApi.noShow(sessionId);
              toast.success('Đã đánh dấu học viên vắng mặt');
              setSelectedSessionForDetail(null);
              loadDashboardData(true);
            } catch {
              toast.error('Không thể đánh dấu vắng mặt');
            }
          }}
          onCancel={async (sessionId) => {
            try {
              await trainingSessionApi.cancel(sessionId);
              toast.success('Đã hủy buổi tập');
              setSelectedSessionForDetail(null);
              loadDashboardData(true);
            } catch {
              toast.error('Không thể hủy buổi tập');
            }
          }}
        />
      )}

      {/* Modal: Check-in / Hoàn thành buổi tập (Kèm upload ảnh minh chứng) */}
      {sessionToComplete && (
        <CompleteSessionModal
          isOpen={Boolean(sessionToComplete)}
          session={sessionToComplete}
          clientName={
            clientMap.get(sessionToComplete.clientId)?.fullName ||
            sessionToComplete.clientName ||
            'Học viên'
          }
          onClose={() => setSessionToComplete(null)}
          onSuccess={() => {
            setSessionToComplete(null);
            loadDashboardData(true);
            toast.success('Đã check-in & hoàn thành buổi tập thành công!');
          }}
        />
      )}

      {/* Modal: Chi tiết nhiệm vụ cá nhân PT */}
      {selectedTaskForDetail && (
        <TrainerTaskDetailModal
          isOpen={Boolean(selectedTaskForDetail)}
          task={selectedTaskForDetail}
          onClose={() => setSelectedTaskForDetail(null)}
          onSuccess={() => {
            setSelectedTaskForDetail(null);
            loadDashboardData(true);
          }}
        />
      )}
    </div>
  );
}
