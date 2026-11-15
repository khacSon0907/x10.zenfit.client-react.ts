import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Users,
  Calendar,
  AlertCircle,
  RefreshCw,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { isAdminUser } from '../../shared/utils/roleUtils';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import type {
  CalendarViewType,
  TrainingSession,
  TrainingSessionCalendarItem,
  TrainingSessionStatus,
} from '../../types/session.types';
import {
  formatIsoDate,
  formatPeriodHeaderTitle,
  isPastDateTime,
} from '../../utils/calendarUtils';
import { PtCalendarHeader } from '../../components/schedule/PtCalendarHeader';
import { PtCalendarWeekView } from '../../components/schedule/PtCalendarWeekView';
import { PtCalendarDayView } from '../../components/schedule/PtCalendarDayView';
import { PtCalendarMonthView } from '../../components/schedule/PtCalendarMonthView';
import { PtSessionTableListView } from '../../components/schedule/PtSessionTableListView';
import { CreateSessionModal } from '../../components/schedule/CreateSessionModal';
import { SessionDetailModal } from '../../components/schedule/SessionDetailModal';
import { CompleteSessionModal } from '../../components/schedule/CompleteSessionModal';
import { TrainerTaskDetailModal } from '../../components/schedule/TrainerTaskDetailModal';
import type { TrainerTask } from '../../types/session.types';

export default function SchedulePage() {
  const { user: authUser } = useAuth();
  const { clients, fetchClients } = useApp();
  const isAdmin = useMemo(() => isAdminUser(authUser), [authUser]);

  // Calendar View & Navigation state
  const [view, setView] = useState<CalendarViewType>('WEEK');
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<TrainingSessionStatus | 'ALL'>('ALL');
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>(authUser?.id || '');

  // Session Data & Loading
  const [sessions, setSessions] = useState<TrainingSessionCalendarItem[]>([]);
  const [tasks, setTasks] = useState<TrainerTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state & pre-filled defaults
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [createDefaultDate, setCreateDefaultDate] = useState<string | undefined>(undefined);
  const [createDefaultTime, setCreateDefaultTime] = useState<string | undefined>(undefined);
  const [selectedSession, setSelectedSession] = useState<TrainingSessionCalendarItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [sessionToComplete, setSessionToComplete] = useState<TrainingSessionCalendarItem | null>(null);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState<boolean>(false);

  // Task Detail Modal state
  const [selectedTask, setSelectedTask] = useState<TrainerTask | null>(null);
  const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState<boolean>(false);

  // Tự động tải danh sách khách hàng nếu chưa có
  useEffect(() => {
    if (clients.length === 0) {
      fetchClients();
    }
  }, [clients.length, fetchClients]);

  // Map Client ID -> Tên học viên
  const clientsMap = useMemo(() => {
    const map = new Map<string, string>();
    clients.forEach((c) => {
      map.set(c.id, c.fullName);
    });
    return map;
  }, [clients]);

  // Tính số lượng buổi tập & hoạt động hôm nay
  const todayStr = useMemo(() => formatIsoDate(new Date()), []);
  const todaySessionsCount = useMemo(() => {
    return sessions.filter((s) => s.trainingDate === todayStr).length;
  }, [sessions, todayStr]);
  const todayTasksCount = useMemo(() => {
    return tasks.filter((t) => t.taskDate === todayStr).length;
  }, [tasks, todayStr]);

  // Trainer list for Admin dropdown
  const trainersList = useMemo(() => {
    if (!authUser) return [];
    return [
      {
        id: authUser.id,
        fullName: authUser.username || 'Huấn luyện viên của tôi',
      },
    ];
  }, [authUser]);

  // Calculate formatted period title
  const periodTitle = useMemo(() => {
    return formatPeriodHeaderTitle(view, activeDate);
  }, [view, activeDate]);

  // Fetch Calendar Sessions
  const fetchCalendarSessions = useCallback(async () => {
    if (view === 'TABLE') return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await trainingSessionApi.getCalendar({
        view: view as 'DAY' | 'WEEK' | 'MONTH',
        date: formatIsoDate(activeDate),
        trainerId: selectedTrainerId || authUser?.id || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setSessions(data.sessions || []);
      setTasks(data.tasks || []);
    } catch (err: unknown) {
      console.error('Error fetching calendar sessions:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const message =
        apiErr.response?.data?.message || 'Không thể tải lịch tập từ máy chủ. Vui lòng thử lại!';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [view, activeDate, selectedTrainerId, authUser?.id, statusFilter]);

  // Trigger fetch when parameters change
  useEffect(() => {
    fetchCalendarSessions();
  }, [fetchCalendarSessions]);

  // Stepper Handlers
  const handlePrev = useCallback(() => {
    setActiveDate((prev) => {
      const d = new Date(prev);
      if (view === 'DAY') {
        d.setDate(d.getDate() - 1);
      } else if (view === 'WEEK') {
        d.setDate(d.getDate() - 7);
      } else if (view === 'MONTH') {
        d.setMonth(d.getMonth() - 1);
      }
      return d;
    });
  }, [view]);

  const handleNext = useCallback(() => {
    setActiveDate((prev) => {
      const d = new Date(prev);
      if (view === 'DAY') {
        d.setDate(d.getDate() + 1);
      } else if (view === 'WEEK') {
        d.setDate(d.getDate() + 7);
      } else if (view === 'MONTH') {
        d.setMonth(d.getMonth() + 1);
      }
      return d;
    });
  }, [view]);

  const handleToday = useCallback(() => {
    setActiveDate(new Date());
  }, []);

  // Quick Add from Grid cell click
  const handleQuickAddSession = useCallback((dateStr: string, timeSlot: string) => {
    if (isPastDateTime(dateStr, timeSlot)) {
      toast.warning('Không thể tạo lịch tập cho thời gian trong quá khứ!');
      return;
    }
    setCreateDefaultDate(dateStr);
    setCreateDefaultTime(timeSlot);
    setIsCreateModalOpen(true);
  }, []);

  // Standard Open Create Modal from button
  const handleOpenStandardCreate = useCallback(() => {
    const todayStr = formatIsoDate(new Date());
    const targetDateStr = formatIsoDate(activeDate);
    const selectedDate = targetDateStr < todayStr ? todayStr : targetDateStr;

    // Tính toán mốc giờ an toàn tiếp theo từ thời điểm hiện tại
    const now = new Date();
    const nextHour = (now.getHours() + 1) % 24;
    const safeDefaultHour = `${String(nextHour).padStart(2, '0')}:00`;

    setCreateDefaultDate(selectedDate);
    setCreateDefaultTime(selectedDate === todayStr ? safeDefaultHour : '08:00');
    setIsCreateModalOpen(true);
  }, [activeDate]);

  // Session Detail Selection
  const handleOpenDetail = useCallback((session: TrainingSessionCalendarItem | TrainingSession) => {
    setSelectedSession(session as TrainingSessionCalendarItem);
    setIsDetailModalOpen(true);
  }, []);

  // Trainer Task Detail Selection
  const handleOpenTaskDetail = useCallback((task: TrainerTask) => {
    setSelectedTask(task);
    setIsTaskDetailModalOpen(true);
  }, []);

  const handleOpenCompleteModal = useCallback(
    (session: TrainingSessionCalendarItem | TrainingSession) => {
      setSelectedSession(null);
      setIsDetailModalOpen(false);
      setSessionToComplete(session as TrainingSessionCalendarItem);
      setIsCompleteModalOpen(true);
    },
    []
  );

  const handleComplete = useCallback(
    (sessionId: string) => {
      const target = sessions.find((s) => s.id === sessionId);
      if (target) {
        handleOpenCompleteModal(target);
      } else {
        trainingSessionApi
          .complete(sessionId)
          .then(() => {
            toast.success('Xác nhận hoàn thành buổi tập!');
            fetchCalendarSessions();
          })
          .catch((err) => {
            const apiErr = err as { response?: { data?: { message?: string } } };
            toast.error(apiErr.response?.data?.message || 'Không thể hoàn thành buổi tập');
          });
      }
    },
    [sessions, handleOpenCompleteModal, fetchCalendarSessions]
  );

  const handleNoShow = useCallback(
    async (sessionId: string) => {
      try {
        await trainingSessionApi.noShow(sessionId);
        toast.info('Đã ghi nhận học viên vắng mặt');
        fetchCalendarSessions();
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || 'Không thể cập nhật vắng mặt');
      }
    },
    [fetchCalendarSessions]
  );

  const handleCancel = useCallback(
    async (sessionId: string) => {
      try {
        await trainingSessionApi.cancel(sessionId);
        toast.warning('Đã hủy buổi tập thành công');
        fetchCalendarSessions();
      } catch (err: unknown) {
        const apiErr = err as { response?: { data?: { message?: string } } };
        toast.error(apiErr.response?.data?.message || 'Không thể hủy buổi tập');
      }
    },
    [fetchCalendarSessions]
  );

  return (
    <div className="space-y-5">
      {/* 1. Thẻ thống kê (Học viên, Buổi dạy hôm nay, Hoạt động cá nhân) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Thẻ: Tổng số học viên */}
        <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] p-5 shadow-xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/30">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tổng số học viên</p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {clients.length || 16}
            </h3>
          </div>
        </div>

        {/* Thẻ: Buổi dạy hôm nay */}
        <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] p-5 shadow-xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800/30">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Buổi dạy hôm nay</p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {todaySessionsCount}
            </h3>
          </div>
        </div>

        {/* Thẻ: Hoạt động cá nhân hôm nay */}
        <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] p-5 shadow-xs flex items-center gap-4 transition hover:shadow-sm">
          <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Hoạt động cá nhân</p>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-0.5">
              {todayTasksCount}
            </h3>
          </div>
        </div>
      </div>

      {/* 2. Main Calendar Section */}
      <div className="space-y-4">
        {/* In-Person Sessions Header + Sub-controls */}
        <PtCalendarHeader
          view={view}
          onViewChange={setView}
          periodTitle={periodTitle}
          onPrev={handlePrev}
          onNext={handleNext}
          onToday={handleToday}
          onRefresh={fetchCalendarSessions}
          onOpenCreateModal={handleOpenStandardCreate}
          isLoading={isLoading}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          todayCount={todaySessionsCount}
          isAdmin={isAdmin}
          trainers={trainersList}
          selectedTrainerId={selectedTrainerId}
          onTrainerChange={setSelectedTrainerId}
        />

        {/* Error Alert if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start justify-between gap-3 text-rose-800 dark:text-rose-300">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <p className="text-sm font-semibold">Lỗi tải dữ liệu lịch tập</p>
                <p className="text-xs mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchCalendarSessions}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Thử lại
            </button>
          </div>
        )}

        {/* 3. Timetable Grid from 06:00 to 24:00 (Yêu cầu chính) */}
        <div>
          {view === 'WEEK' && (
            <PtCalendarWeekView
              activeDate={activeDate}
              sessions={sessions}
              tasks={tasks}
              onSelectSession={handleOpenDetail}
              onSelectTask={handleOpenTaskDetail}
              onComplete={handleComplete}
              onNoShow={handleNoShow}
              onCancel={handleCancel}
              onAddSession={handleQuickAddSession}
              clientsMap={clientsMap}
              isLoading={isLoading}
            />
          )}

          {view === 'DAY' && (
            <PtCalendarDayView
              activeDate={activeDate}
              sessions={sessions}
              tasks={tasks}
              onSelectSession={handleOpenDetail}
              onSelectTask={handleOpenTaskDetail}
              onComplete={handleComplete}
              onNoShow={handleNoShow}
              onCancel={handleCancel}
              onAddSession={handleQuickAddSession}
              clientsMap={clientsMap}
              isLoading={isLoading}
            />
          )}

          {view === 'MONTH' && (
            <PtCalendarMonthView
              activeDate={activeDate}
              sessions={sessions}
              tasks={tasks}
              onSelectSession={handleOpenDetail}
              onSelectTask={handleOpenTaskDetail}
              onSelectDate={(d) => {
                setActiveDate(d);
                setView('DAY');
              }}
              isLoading={isLoading}
            />
          )}

          {view === 'TABLE' && (
            <PtSessionTableListView
              trainerId={selectedTrainerId || authUser?.id}
              onSelectSession={handleOpenDetail}
              onComplete={handleComplete}
              onNoShow={handleNoShow}
              onCancel={handleCancel}
            />
          )}
        </div>
      </div>

      {/* Modal Lên lịch tập mới & Hoạt động cá nhân */}
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateDefaultDate(undefined);
          setCreateDefaultTime(undefined);
        }}
        onSuccess={() => {
          fetchCalendarSessions();
        }}
        defaultDate={createDefaultDate || formatIsoDate(activeDate)}
        defaultTime={createDefaultTime || '08:00'}
      />

      {/* Modal Chi tiết & Đổi lịch buổi tập */}
      <SessionDetailModal
        session={selectedSession}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedSession(null);
        }}
        onSuccess={() => {
          fetchCalendarSessions();
        }}
        onComplete={handleComplete}
        onOpenCompleteModal={handleOpenCompleteModal}
        onNoShow={handleNoShow}
        onCancel={handleCancel}
        clientsMap={clientsMap}
      />

      {/* Modal Chi tiết & Thao tác Hoạt động cá nhân PT */}
      <TrainerTaskDetailModal
        task={selectedTask}
        isOpen={isTaskDetailModalOpen}
        onClose={() => {
          setIsTaskDetailModalOpen(false);
          setSelectedTask(null);
        }}
        onSuccess={() => {
          fetchCalendarSessions();
        }}
      />

      {/* Modal Xác nhận Hoàn thành buổi tập & Upload ảnh minh chứng lên Cloudinary */}
      <CompleteSessionModal
        session={sessionToComplete}
        isOpen={isCompleteModalOpen}
        onClose={() => {
          setIsCompleteModalOpen(false);
          setSessionToComplete(null);
        }}
        onSuccess={() => {
          fetchCalendarSessions();
        }}
        clientName={
          sessionToComplete
            ? clientsMap.get(sessionToComplete.clientId) || sessionToComplete.clientName
            : undefined
        }
      />
    </div>
  );
}
