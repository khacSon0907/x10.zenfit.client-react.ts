import { useState, useEffect } from 'react';
import {
  X,
  Target,
  Calendar,
  Scale,
  Sparkles,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientGoalService } from '../../services/clientGoalService';
import type {
  ClientGoal,
  CreateClientGoalRequest,
  UpdateClientGoalRequest,
  GoalPhaseStatus,
} from '../../types/clientGoal';
import {
  GOAL_TYPE_SUGGESTIONS,
  GOAL_PHASE_STATUS_CONFIG,
} from '../../types/clientGoal';

interface GoalModalProps {
  isOpen: boolean;
  mode: 'CREATE' | 'EDIT';
  clientId: string;
  trainerId: string;
  initialGoal?: ClientGoal | null;
  defaultWeight?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GoalModal({
  isOpen,
  mode,
  clientId,
  trainerId,
  initialGoal,
  defaultWeight,
  onClose,
  onSuccess,
}: GoalModalProps) {
  // Ngày mặc định
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndDateStr = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  };

  // Form states
  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState('Giảm mỡ');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndDateStr());
  const [startWeight, setStartWeight] = useState<number>(defaultWeight || 70);
  const [targetWeight, setTargetWeight] = useState<number>((defaultWeight || 70) - 5);
  const [status, setStatus] = useState<GoalPhaseStatus>('ACTIVE');
  const [note, setNote] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Điền dữ liệu khi mở form Edit hoặc reset khi Create
  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg(null);
    if (mode === 'EDIT' && initialGoal) {
      setGoalName(initialGoal.goalName || '');
      setGoalType(initialGoal.goalType || 'Giảm mỡ');
      setStartDate(initialGoal.startDate || todayStr);
      setEndDate(initialGoal.endDate || defaultEndDateStr());
      setStartWeight(initialGoal.startWeight || 70);
      setTargetWeight(initialGoal.targetWeight || 65);
      setStatus(initialGoal.status || 'ACTIVE');
      setNote(initialGoal.note || '');
    } else {
      // Create mode
      const baseW = defaultWeight && defaultWeight > 0 ? defaultWeight : 70;
      setGoalName('Giai đoạn giảm mỡ & siết cơ');
      setGoalType('Giảm mỡ');
      setStartDate(todayStr);
      setEndDate(defaultEndDateStr());
      setStartWeight(baseW);
      setTargetWeight(Math.max(40, baseW - 5));
      setStatus('ACTIVE');
      setNote('');
    }
  }, [isOpen, mode, initialGoal, defaultWeight, todayStr]);

  if (!isOpen) return null;

  // Xử lý gửi biểu mẫu
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // 1. Kiểm tra tên mục tiêu
    if (!goalName.trim()) {
      const err = 'Vui lòng nhập tên mục tiêu (VD: Giai đoạn siết cơ đón Tết)';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    // 2. Kiểm tra loại mục tiêu
    if (!goalType.trim()) {
      const err = 'Vui lòng chọn hoặc nhập loại mục tiêu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    // 3. Kiểm tra cân nặng
    if (!startWeight || startWeight <= 0) {
      const err = 'Cân nặng bắt đầu phải lớn hơn 0 kg';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (!targetWeight || targetWeight <= 0) {
      const err = 'Cân nặng mục tiêu phải lớn hơn 0 kg';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    // 4. Kiểm tra ngày
    if (!startDate || !endDate) {
      const err = 'Vui lòng chọn ngày bắt đầu và ngày kết thúc dự kiến';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    const startD = new Date(startDate);
    const endD = new Date(endDate);
    if (endD <= startD) {
      const err = 'Ngày kết thúc dự kiến phải sau ngày bắt đầu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'CREATE') {
        const payload: CreateClientGoalRequest = {
          clientId,
          trainerId: trainerId || 'PT',
          goalName: goalName.trim(),
          goalType: goalType.trim(),
          startDate,
          endDate,
          startWeight,
          targetWeight,
          status,
          note: note.trim() || undefined,
        };

        await clientGoalService.createGoal(payload);
        toast.success('Thiết lập mục tiêu mới cho học viên thành công!');
      } else if (mode === 'EDIT' && initialGoal) {
        const payload: UpdateClientGoalRequest = {
          trainerId: trainerId || initialGoal.trainerId,
          goalName: goalName.trim(),
          goalType: goalType.trim(),
          startDate,
          endDate,
          startWeight,
          targetWeight,
          status,
          note: note.trim() || undefined,
        };

        await clientGoalService.updateGoal(initialGoal.id, payload);
        toast.success('Cập nhật mục tiêu học viên thành công!');
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      let message = 'Lưu mục tiêu thất bại. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) message = res.data.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setErrorMsg(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {mode === 'CREATE' ? 'Thiết lập mục tiêu mới' : 'Chỉnh sửa mục tiêu'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xác định lộ trình cân nặng và giai đoạn tập luyện cho học viên
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Thông báo lỗi nếu có */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. Tên mục tiêu */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tên mục tiêu <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Sparkles className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
                placeholder="VD: Giai đoạn siết cơ đón Tết, Giảm 5kg mỡ bụng..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              />
            </div>
          </div>

          {/* 2. Loại mục tiêu (Input text + Thẻ gợi ý nhanh) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Loại mục tiêu <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              placeholder="VD: Giảm mỡ, Tăng cơ, Duy trì, Phục hồi..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
            />

            {/* Quick chips suggestions */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {GOAL_TYPE_SUGGESTIONS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setGoalType(tag)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    goalType === tag
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Cân nặng bắt đầu vs Cân nặng mục tiêu */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cân nặng bắt đầu (kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Scale className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step={0.1}
                  min={1}
                  value={startWeight || ''}
                  onChange={(e) => setStartWeight(parseFloat(e.target.value) || 0)}
                  placeholder="VD: 70"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Cân nặng mục tiêu (kg) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Target className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step={0.1}
                  min={1}
                  value={targetWeight || ''}
                  onChange={(e) => setTargetWeight(parseFloat(e.target.value) || 0)}
                  placeholder="VD: 65"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 4. Ngày bắt đầu & Ngày kết thúc dự kiến */}
          <div className="grid grid-cols-2 gap-3">
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ngày dự kiến kết thúc <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* 5. Trạng thái giai đoạn */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Trạng thái giai đoạn
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as GoalPhaseStatus)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium cursor-pointer"
            >
              <option value="ACTIVE">{GOAL_PHASE_STATUS_CONFIG.ACTIVE.label} (ACTIVE)</option>
              <option value="PLANNED">{GOAL_PHASE_STATUS_CONFIG.PLANNED.label} (PLANNED)</option>
              <option value="COMPLETED">{GOAL_PHASE_STATUS_CONFIG.COMPLETED.label} (COMPLETED)</option>
              <option value="CANCELLED">{GOAL_PHASE_STATUS_CONFIG.CANCELLED.label} (CANCELLED)</option>
            </select>
          </div>

          {/* 6. Ghi chú dinh dưỡng / lịch tập */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú dinh dưỡng & lịch tập
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ghi chú chế độ thâm hụt calo, số buổi cardio/tuần, lưu ý chấn thương..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Huỷ bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{mode === 'CREATE' ? 'Tạo mục tiêu' : 'Lưu thay đổi'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
