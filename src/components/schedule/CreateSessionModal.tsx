import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Calendar,
  Clock,
  User,
  FileSignature,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ClipboardList,
} from 'lucide-react';
import { toast } from 'sonner';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import { trainerTaskApi } from '../../api/trainerTaskApi';
import { clientApi } from '../../api/clientApi';
import { contractApi } from '../../api/contractApi';
import { useAuth } from '../../context/AuthContext';
import type { ClientResponse } from '../../types/client.types';
import type { PtContractResponse } from '../../types/contract.types';
import type { CreateTrainingSessionRequest } from '../../types/session.types';
import { formatIsoDate, isPastDateTime } from '../../utils/calendarUtils';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultDate?: string;
  defaultTime?: string;
}

const COMMON_WORKOUT_PRESETS = [
  'Ngực & Tay sau',
  'Lưng & Tay trước',
  'Chân & Mông',
  'Vai & Bụng',
  'Cardio & Giảm mỡ',
  'Toàn thân (Full Body)',
  'Phục hồi & Giãn cơ',
];

const COMMON_TIME_PRESETS = [
  '07:00',
  '08:30',
  '10:00',
  '14:00',
  '15:30',
  '17:00',
  '18:30',
  '20:00',
];

const TASK_COLOR_OPTIONS = [
  { label: 'Xanh lá', hex: '#10B981' },
  { label: 'Xanh dương', hex: '#3B82F6' },
  { label: 'Tím', hex: '#8B5CF6' },
  { label: 'Hồng', hex: '#EC4899' },
  { label: 'Cam', hex: '#F97316' },
  { label: 'Vàng', hex: '#F59E0B' },
  { label: 'Đỏ', hex: '#EF4444' },
  { label: 'Xám', hex: '#64748B' },
];

const COMMON_TASK_PRESETS = [
  'Thức dậy & Ăn sáng',
  'Họp chuyên môn PT',
  'Tự tập luyện (Workout)',
  'Lên giáo án & Báo cáo',
  'Nghỉ trưa & Hồi phục',
  'Tư vấn học viên mới',
];

export const CreateSessionModal: React.FC<CreateSessionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
  defaultTime = '09:00',
}) => {
  const { user: authUser } = useAuth();

  // Tab switcher: Lịch dạy học viên vs Hoạt động cá nhân
  const [activeTab, setActiveTab] = useState<'SESSION' | 'TASK'>('SESSION');

  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState<boolean>(false);

  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [contracts, setContracts] = useState<PtContractResponse[]>([]);
  const [isLoadingContracts, setIsLoadingContracts] = useState<boolean>(false);
  const [selectedContractId, setSelectedContractId] = useState<string>('');

  const [sessionName, setSessionName] = useState<string>('Ngực & Tay sau');
  const [trainingDate, setTrainingDate] = useState<string>(
    defaultDate || formatIsoDate(new Date())
  );

  // Helper tính giờ kết thúc tự động (mặc định sau 60 phút)
  const calculateDefaultEndTime = (start: string): string => {
    try {
      const parts = start.split(':');
      const hour = parseInt(parts[0], 10);
      const minute = parseInt(parts[1] || '0', 10);
      const endHour = (hour + 1) % 24;
      return `${String(endHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    } catch {
      return '10:00';
    }
  };

  const [startTime, setStartTime] = useState<string>(defaultTime);
  const [endTime, setEndTime] = useState<string>(calculateDefaultEndTime(defaultTime));
  const [note, setNote] = useState<string>('');

  // Form states cho Hoạt động cá nhân (Trainer Task)
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [taskDate, setTaskDate] = useState<string>(defaultDate || formatIsoDate(new Date()));
  const [taskAllDay, setTaskAllDay] = useState<boolean>(false);
  const [taskStartTime, setTaskStartTime] = useState<string>(defaultTime || '07:00');
  const [taskEndTime, setTaskEndTime] = useState<string>(calculateDefaultEndTime(defaultTime || '07:00'));
  const [taskColor, setTaskColor] = useState<string>('#10B981');
  const [taskDescription, setTaskDescription] = useState<string>('');

  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    setEndTime(calculateDefaultEndTime(newStartTime));
  };

  const handleSetDuration = (minutes: number) => {
    try {
      const parts = startTime.split(':');
      const startHour = parseInt(parts[0], 10);
      const startMinute = parseInt(parts[1] || '0', 10);
      const totalMinutes = startHour * 60 + startMinute + minutes;
      const endH = Math.floor(totalMinutes / 60) % 24;
      const endM = totalMinutes % 60;
      setEndTime(`${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`);
    } catch {
      // fallback
    }
  };

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Kiểm tra xem thời gian bắt đầu đã chọn có nằm trong quá khứ không
  const isPastTime = React.useMemo(() => {
    if (!trainingDate || !startTime) return false;
    return isPastDateTime(trainingDate, startTime);
  }, [trainingDate, startTime]);

  // Tải danh sách học viên khi mở modal
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (defaultDate) {
        setTrainingDate(defaultDate);
        setTaskDate(defaultDate);
      }
      if (defaultTime) {
        setStartTime(defaultTime);
        setTaskStartTime(defaultTime);
        setTaskEndTime(calculateDefaultEndTime(defaultTime));
      }

      const fetchClients = async () => {
        setIsLoadingClients(true);
        try {
          const list = await clientApi.getAllClients();
          setClients(list);
          if (list.length > 0 && !selectedClientId) {
            setSelectedClientId(list[0].id);
          }
        } catch {
          toast.error('Không thể tải danh sách học viên');
        } finally {
          setIsLoadingClients(false);
        }
      };

      fetchClients();
    }
  }, [isOpen, defaultDate, defaultTime]);

  // Tải danh sách hợp đồng ACTIVE của học viên được chọn
  useEffect(() => {
    if (selectedClientId && isOpen) {
      const fetchContracts = async () => {
        setIsLoadingContracts(true);
        setSelectedContractId('');
        try {
          // Lấy hợp đồng của học viên này
          const allContracts = await contractApi.getAllContracts({
            clientId: selectedClientId,
          });

          // Lọc hợp đồng ACTIVE và còn buổi tập
          const activeContracts = allContracts.filter(
            (c) => c.status === 'ACTIVE'
          );

          setContracts(activeContracts);
          if (activeContracts.length > 0) {
            setSelectedContractId(activeContracts[0].id);
          }
        } catch {
          toast.error('Không thể tải hợp đồng của học viên');
        } finally {
          setIsLoadingContracts(false);
        }
      };

      fetchContracts();
    } else {
      setContracts([]);
      setSelectedContractId('');
    }
  }, [selectedClientId, isOpen]);

  if (!isOpen) return null;

  // Submit tạo buổi tập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedClientId) {
      const err = 'Vui lòng chọn học viên';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!selectedContractId) {
      const err = 'Vui lòng chọn hợp đồng tập luyện đang hoạt động';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!sessionName.trim()) {
      const err = 'Vui lòng nhập tên buổi tập';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!trainingDate) {
      const err = 'Vui lòng chọn ngày tập';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!startTime) {
      const err = 'Vui lòng chọn giờ bắt đầu';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    // Validation: Thời gian bắt đầu buổi tập phải lớn hơn thời gian hiện tại
    if (isPastDateTime(trainingDate, startTime)) {
      const err = 'Thời gian bắt đầu buổi tập phải lớn hơn thời gian hiện tại!';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (endTime && startTime && endTime <= startTime) {
      const err = 'Giờ kết thúc phải diễn ra sau giờ bắt đầu';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    // Đảm bảo định dạng HH:mm:ss cho startTime
    const formattedStartTime =
      startTime.length === 5 ? `${startTime}:00` : startTime;

    // ISO LocalDateTime cho endTime (YYYY-MM-DDTHH:mm:ss)
    let formattedEndTime: string | undefined = undefined;
    if (endTime) {
      const timePart = endTime.length === 5 ? `${endTime}:00` : endTime;
      formattedEndTime = `${trainingDate}T${timePart}`;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateTrainingSessionRequest = {
        clientId: selectedClientId,
        trainerId: authUser?.id,
        contractId: selectedContractId,
        sessionName: sessionName.trim(),
        trainingDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        note: note.trim() || undefined,
      };

      await trainingSessionApi.create(payload);
      toast.success('Lên lịch buổi tập mới thành công!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      let msg = 'Không thể tạo buổi tập. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (
          err as {
            response?: {
              status?: number;
              data?: { message?: string; code?: string };
            };
          }
        ).response;

        if (res?.status === 409) {
          msg =
            res.data?.message ||
            'Thời điểm này Huấn luyện viên hoặc học viên đã có lịch tập khác, vui lòng chọn giờ khác!';
        } else if (res?.data?.message) {
          msg = res.data.message;
        }
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit tạo hoạt động cá nhân (Trainer Task)
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!taskTitle.trim()) {
      const err = 'Vui lòng nhập tiêu đề hoạt động';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!taskAllDay && taskEndTime && taskStartTime && taskEndTime <= taskStartTime) {
      const err = 'Giờ kết thúc phải diễn ra sau giờ bắt đầu';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedStartTime = taskStartTime.length === 5 ? `${taskStartTime}:00` : taskStartTime;
      const formattedEndTime = taskEndTime.length === 5 ? `${taskEndTime}:00` : taskEndTime;

      await trainerTaskApi.create({
        title: taskTitle.trim(),
        taskDate,
        startTime: taskAllDay ? null : formattedStartTime,
        endTime: taskAllDay ? null : formattedEndTime,
        allDay: taskAllDay,
        color: taskColor,
        description: taskDescription.trim() || null,
      });

      toast.success('Thêm hoạt động cá nhân thành công!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error creating trainer task:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg = apiErr.response?.data?.message || 'Không thể tạo hoạt động. Vui lòng thử lại sau.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              {activeTab === 'SESSION' ? <Plus className="h-5 w-5" /> : <ClipboardList className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {activeTab === 'SESSION' ? 'Lên lịch buổi tập mới' : 'Thêm hoạt động cá nhân'}
              </h3>
              <p className="text-xs text-slate-400">
                {activeTab === 'SESSION'
                  ? 'Đặt lịch tập riêng gắn với học viên và hợp đồng PT'
                  : 'Lên lịch công việc, sinh hoạt và lịch trình cá nhân của PT'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Segmented Control */}
        <div className="px-6 pt-4 pb-1">
          <div className="p-1 rounded-2xl bg-slate-100 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('SESSION');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'SESSION'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>🏋️ Lịch dạy học viên</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('TASK');
                setErrorMessage(null);
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'TASK'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>📝 Hoạt động cá nhân</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Task Form hoặc Session Form */}
        {activeTab === 'TASK' ? (
          <form onSubmit={handleSubmitTask} className="p-6 space-y-4">
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Tiêu đề hoạt động */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Tiêu đề hoạt động / công việc <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Ví dụ: Thức dậy & Ăn sáng, Họp chuyên môn, Tự tập gym..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 transition-all"
              />
              {/* Quick presets for tasks */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {COMMON_TASK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setTaskTitle(preset)}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400 transition cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Ngày thực hiện */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ngày thực hiện <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  required
                  value={taskDate}
                  onChange={(e) => setTaskDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* 3. Tùy chọn Cả ngày */}
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338]">
              <input
                type="checkbox"
                id="taskAllDayCheckbox"
                checked={taskAllDay}
                onChange={(e) => setTaskAllDay(e.target.checked)}
                className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <label htmlFor="taskAllDayCheckbox" className="text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Hoạt động cả ngày (không giới hạn khung giờ cụ thể)
              </label>
            </div>

            {/* 4. Giờ bắt đầu & Giờ kết thúc (chỉ hiện khi không tích Cả ngày) */}
            {!taskAllDay && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Giờ bắt đầu
                  </label>
                  <div className="relative">
                    <Clock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={taskStartTime}
                      onChange={(e) => {
                        setTaskStartTime(e.target.value);
                        setTaskEndTime(calculateDefaultEndTime(e.target.value));
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Giờ kết thúc
                  </label>
                  <div className="relative">
                    <Clock className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="time"
                      value={taskEndTime}
                      onChange={(e) => setTaskEndTime(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Chọn màu sắc */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Màu sắc thẻ hoạt động trên lịch
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {TASK_COLOR_OPTIONS.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setTaskColor(c.hex)}
                    title={c.label}
                    className={`h-7 w-7 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                      taskColor === c.hex ? 'ring-2 ring-offset-2 ring-emerald-500 scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {taskColor === c.hex && <CheckCircle2 className="h-4 w-4 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 6. Ghi chú */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ghi chú chi tiết (tùy chọn)
              </label>
              <textarea
                rows={2}
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                placeholder="Nội dung chi tiết hoặc dặn dò cho hoạt động này..."
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
              />
            </div>

            {/* Modal Footer Actions cho Task */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Lưu hoạt động</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Error Message Alert */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

          {/* 1. Chọn học viên */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Học viên <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <User className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                disabled={isLoadingClients}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.fullName} ({c.phone || 'Chưa có SĐT'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 2. Chọn hợp đồng PT tương ứng */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Hợp đồng áp dụng <span className="text-rose-500">*</span>
              </label>
              {contracts.length > 0 && (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {contracts.length} hợp đồng khả dụng
                </span>
              )}
            </div>

            {isLoadingContracts ? (
              <div className="py-2 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                <span>Đang tải hợp đồng của học viên...</span>
              </div>
            ) : contracts.length === 0 ? (
              <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Học viên này chưa có hợp đồng PT nào ở trạng thái <strong>ACTIVE</strong>.
                  Vui lòng tạo hoặc kích hoạt hợp đồng PT trước khi lên lịch tập.
                </span>
              </div>
            ) : (
              <div className="relative">
                <FileSignature className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={selectedContractId}
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {contracts.map((c) => {
                    const remaining =
                      c.remainingSessions ??
                      Math.max(
                        0,
                        (c.totalSessions || 0) +
                          (c.bonusSessions || 0) -
                          (c.usedSessions || 0)
                      );

                    return (
                      <option key={c.id} value={c.id}>
                        Gói {c.totalSessions} buổi (còn {remaining} buổi) • Hạn đến{' '}
                        {c.endDate || 'Vô thời hạn'}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
          </div>

          {/* 3. Tên buổi tập & Gợi ý nhanh */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tên buổi tập / Giáo án <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="VD: Ngực & Tay sau, Cardio giảm mỡ..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
              />
            </div>

            {/* Quick workout presets */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto custom-scrollbar">
              <span className="text-[10px] text-slate-400 shrink-0">Gợi ý:</span>
              {COMMON_WORKOUT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setSessionName(preset)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                    sessionName === preset
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Ngày tập, Giờ bắt đầu & Giờ kết thúc (3 cột) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Ngày tập */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ngày tập <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  min={formatIsoDate(new Date())}
                  value={trainingDate}
                  onChange={(e) => setTrainingDate(e.target.value)}
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Giờ bắt đầu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Bắt đầu <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Giờ kết thúc */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kết thúc
              </label>
              <div className="relative">
                <Clock className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-9 pr-2.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Cảnh báo khi thời gian bắt đầu đã qua trong quá khứ */}
          {isPastTime && (
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                Thời điểm bắt đầu buổi tập ({trainingDate} lúc {startTime}) đã qua. Vui lòng chọn thời gian lớn hơn thời điểm hiện tại để có thể lên lịch.
              </span>
            </div>
          )}

          {/* Quick duration presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] text-slate-400 shrink-0">Thời lượng:</span>
            <button
              type="button"
              onClick={() => handleSetDuration(45)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition font-medium cursor-pointer"
            >
              45 phút
            </button>
            <button
              type="button"
              onClick={() => handleSetDuration(60)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 font-bold transition cursor-pointer"
            >
              60 phút (chuẩn)
            </button>
            <button
              type="button"
              onClick={() => handleSetDuration(90)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition font-medium cursor-pointer"
            >
              90 phút
            </button>
            <button
              type="button"
              onClick={() => handleSetDuration(120)}
              className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition font-medium cursor-pointer"
            >
              120 phút
            </button>
          </div>

          {/* Quick time slot presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar">
            <span className="text-[10px] text-slate-400 shrink-0">Khung giờ:</span>
            {COMMON_TIME_PRESETS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setStartTime(t)}
                className={`text-[10px] px-2 py-0.5 rounded-lg font-medium transition-colors shrink-0 cursor-pointer ${
                  startTime === t
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* 5. Ghi chú */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú thêm (dặn dò trước buổi tập)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhắc học viên mang đồ tập, khởi động trước 10 phút, bổ sung nước..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
            />
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={isSubmitting || contracts.length === 0 || isPastTime}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lên lịch...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Tạo buổi tập</span>
                </>
              )}
            </button>
          </div>
        </form>
        )}
      </div>
    </div>
  );
};

export default CreateSessionModal;
