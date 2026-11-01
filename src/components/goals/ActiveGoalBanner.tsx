import React, { useState } from 'react';
import {
  Target,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Edit3,
  TrendingDown,
  TrendingUp,
  Minus,
  Plus,
  Scale,
  Loader2,
  X,
  FileText,
  Award,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientGoalService } from '../../services/clientGoalService';
import type { ClientGoal, CreateClientGoalRequest, UpdateClientGoalRequest } from '../../types/clientGoal';
import {
  GOAL_PHASE_STATUS_CONFIG,
  GOAL_TYPE_SUGGESTIONS,
} from '../../types/clientGoal';

interface ActiveGoalBannerProps {
  goal: ClientGoal | null;
  clientId: string;
  trainerId: string;
  currentWeight?: number;
  isLoading?: boolean;
  onRefreshGoals: () => void;
}

export default function ActiveGoalBanner({
  goal,
  clientId,
  trainerId,
  currentWeight,
  isLoading = false,
  onRefreshGoals,
}: ActiveGoalBannerProps) {
  // Trạng thái thao tác TRỰC TIẾP TRÊN TRANG (INLINE - KHÔNG DÙNG POPUP)
  const [inlineMode, setInlineMode] = useState<'NONE' | 'CREATE' | 'EDIT' | 'COMPLETE'>('NONE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states cho Create / Edit inline
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndDateStr = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  };

  const [goalName, setGoalName] = useState('');
  const [goalType, setGoalType] = useState('Giảm mỡ');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEndDateStr());
  const [startWeight, setStartWeight] = useState<number>(currentWeight || 70);
  const [targetWeight, setTargetWeight] = useState<number>((currentWeight || 70) - 5);
  const [note, setNote] = useState('');

  // Form states cho Complete inline
  const [endWeight, setEndWeight] = useState<number>(65);
  const [actualEndDate, setActualEndDate] = useState<string>(todayStr);
  const [completeNote, setCompleteNote] = useState<string>('');

  // Khởi tạo giá trị khi chuyển chế độ
  const startCreateMode = () => {
    setErrorMsg(null);
    const baseW = currentWeight && currentWeight > 0 ? currentWeight : 70;
    setGoalName('Giai đoạn giảm mỡ & siết cơ');
    setGoalType('Giảm mỡ');
    setStartDate(todayStr);
    setEndDate(defaultEndDateStr());
    setStartWeight(baseW);
    setTargetWeight(Math.max(40, baseW - 5));
    setNote('');
    setInlineMode('CREATE');
  };

  const startEditMode = () => {
    if (!goal) return;
    setErrorMsg(null);
    setGoalName(goal.goalName || '');
    setGoalType(goal.goalType || 'Giảm mỡ');
    setStartDate(goal.startDate || todayStr);
    setEndDate(goal.endDate || defaultEndDateStr());
    setStartWeight(goal.startWeight || 70);
    setTargetWeight(goal.targetWeight || 65);
    setNote(goal.note || '');
    setInlineMode('EDIT');
  };

  const startCompleteMode = () => {
    if (!goal) return;
    setErrorMsg(null);
    setEndWeight(goal.targetWeight || 65);
    setActualEndDate(todayStr);
    setCompleteNote(goal.note ? `${goal.note} (Hoàn thành mục tiêu)` : '');
    setInlineMode('COMPLETE');
  };

  const cancelInlineMode = () => {
    setInlineMode('NONE');
    setErrorMsg(null);
  };

  // Submit tạo mới mục tiêu inline
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!goalName.trim()) {
      const err = 'Vui lòng nhập tên mục tiêu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }
    if (!goalType.trim()) {
      const err = 'Vui lòng chọn hoặc nhập loại mục tiêu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }
    if (!startWeight || startWeight <= 0 || !targetWeight || targetWeight <= 0) {
      const err = 'Cân nặng bắt đầu và mục tiêu phải lớn hơn 0 kg';
      setErrorMsg(err);
      toast.error(err);
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      const err = 'Ngày kết thúc dự kiến phải sau ngày bắt đầu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateClientGoalRequest = {
        clientId,
        trainerId: trainerId || 'PT',
        goalName: goalName.trim(),
        goalType: goalType.trim(),
        startDate,
        endDate,
        startWeight,
        targetWeight,
        status: 'ACTIVE',
        note: note.trim() || undefined,
      };

      await clientGoalService.createGoal(payload);
      toast.success('Thiết lập mục tiêu mới thành công!');
      setInlineMode('NONE');
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Thiết lập mục tiêu thất bại. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit chỉnh sửa mục tiêu inline
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    setErrorMsg(null);

    if (!goalName.trim() || !goalType.trim()) {
      const err = 'Vui lòng điền đầy đủ tên và loại mục tiêu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }
    if (!startWeight || startWeight <= 0 || !targetWeight || targetWeight <= 0) {
      const err = 'Cân nặng phải lớn hơn 0 kg';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateClientGoalRequest = {
        goalName: goalName.trim(),
        goalType: goalType.trim(),
        startDate,
        endDate,
        startWeight,
        targetWeight,
        note: note.trim() || undefined,
      };

      await clientGoalService.updateGoal(goal.id, payload);
      toast.success('Cập nhật mục tiêu thành công!');
      setInlineMode('NONE');
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Cập nhật mục tiêu thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit hoàn thành mục tiêu inline
  const handleSaveComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;
    setErrorMsg(null);

    if (!endWeight || endWeight <= 0) {
      const err = 'Vui lòng nhập cân nặng thực tế đạt được (> 0 kg)';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateClientGoalRequest = {
        status: 'COMPLETED',
        endWeight,
        actualEndDate,
        note: completeNote.trim() || undefined,
      };

      await clientGoalService.updateGoal(goal.id, payload);
      const totalChange = endWeight - goal.startWeight;
      const isLoss = totalChange < 0;
      toast.success('Đã hoàn thành mục tiêu xuất sắc!', {
        description: `Cân nặng đạt: ${endWeight} kg (${isLoss ? 'Giảm' : 'Tăng'} ${Math.abs(totalChange).toFixed(1)} kg)`,
      });
      setInlineMode('NONE');
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Ghi nhận hoàn thành thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trạng thái đang tải
  if (isLoading) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
        <div className="h-10 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
      </div>
    );
  }

  // ============================================================================
  // VIEW 1: FORM THIẾT LẬP MỤC TIÊU TRỰC TIẾP TRÊN TRANG (INLINE CREATE / EDIT)
  // ============================================================================
  if (inlineMode === 'CREATE' || inlineMode === 'EDIT') {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border-2 border-emerald-500/40 shadow-md p-6 sm:p-7 space-y-5 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {inlineMode === 'CREATE' ? 'Thiết lập mục tiêu mới trực tiếp' : 'Chỉnh sửa mục tiêu đang thực hiện'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xác định lộ trình cân nặng và giai đoạn tập luyện cho học viên ngay trong hồ sơ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cancelInlineMode}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={inlineMode === 'CREATE' ? handleSaveCreate : handleSaveEdit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên mục tiêu */}
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

            {/* Loại mục tiêu */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Loại mục tiêu <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                placeholder="VD: Giảm mỡ, Tăng cơ, Duy trì..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {GOAL_TYPE_SUGGESTIONS.slice(0, 5).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setGoalType(tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-lg transition-colors cursor-pointer ${
                      goalType === tag
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Cân bắt đầu vs Cân mục tiêu */}
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

            {/* Ngày bắt đầu & kết thúc */}
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

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú dinh dưỡng & lịch tập
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú chế độ calo, lưu ý tập luyện..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={cancelInlineMode}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{inlineMode === 'CREATE' ? 'Lưu mục tiêu mới' : 'Cập nhật mục tiêu'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // VIEW 2: PANEL HOÀN THÀNH MỤC TIÊU TRỰC TIẾP TRÊN TRANG (INLINE COMPLETE)
  // ============================================================================
  if (inlineMode === 'COMPLETE' && goal) {
    const totalChange = endWeight - goal.startWeight;
    const isLoss = totalChange < 0;

    return (
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border-2 border-blue-500/40 shadow-md p-6 sm:p-7 space-y-4 animate-in fade-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Ghi nhận hoàn thành mục tiêu: {goal.goalName}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Mục tiêu đề ra: <strong>{goal.startWeight} kg ➔ {goal.targetWeight} kg</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={cancelInlineMode}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSaveComplete} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cân nặng thực tế đạt được (kg) <span className="text-rose-500">*</span>
                </label>
                {endWeight > 0 && (
                  <span
                    className={`text-[11px] font-bold flex items-center gap-0.5 ${
                      isLoss ? 'text-emerald-600' : 'text-blue-600'
                    }`}
                  >
                    {isLoss ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                    {isLoss ? 'Giảm' : 'Tăng'} {Math.abs(totalChange).toFixed(1)} kg
                  </span>
                )}
              </div>
              <div className="relative">
                <Scale className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  step={0.1}
                  min={1}
                  value={endWeight || ''}
                  onChange={(e) => setEndWeight(parseFloat(e.target.value) || 0)}
                  placeholder="VD: 64.5"
                  autoFocus
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 font-semibold"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ngày hoàn thành thực tế <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={actualEndDate}
                  onChange={(e) => setActualEndDate(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú nhận xét của PT
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                rows={2}
                value={completeNote}
                onChange={(e) => setCompleteNote(e.target.value)}
                placeholder="Nhận xét của PT về kết quả đạt được..."
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={cancelInlineMode}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Xác nhận hoàn thành mục tiêu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ============================================================================
  // VIEW 3: EMPTY STATE KHI CHƯA CÓ MỤC TIÊU ACTIVE
  // ============================================================================
  if (!goal) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-50 dark:to-[#0c1626] border border-emerald-500/20 dark:border-[#162338] p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Mục tiêu thể hình đang thực hiện
                </h3>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                  Chưa thiết lập
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
                Học viên hiện chưa có mục tiêu nào ở trạng thái đang diễn ra. Hãy thiết lập mục tiêu giai đoạn mới để theo dõi tiến độ cân nặng và vóc dáng rõ ràng hơn!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={startCreateMode}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>Thiết lập mục tiêu mới</span>
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // VIEW 4: THẺ HIỂN THỊ MỤC TIÊU ACTIVE ĐANG DIỄN RA
  // ============================================================================
  const end = new Date(goal.endDate);
  const now = new Date();
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  const isLosingWeight = goal.targetWeight < goal.startWeight;
  const isGainingWeight = goal.targetWeight > goal.startWeight;
  const totalWeightChange = Math.abs(goal.targetWeight - goal.startWeight);

  let progressPercent = 0;
  if (currentWeight !== undefined && totalWeightChange > 0) {
    if (isLosingWeight) {
      const lost = goal.startWeight - currentWeight;
      progressPercent = Math.max(0, Math.min(100, Math.round((lost / totalWeightChange) * 100)));
    } else if (isGainingWeight) {
      const gained = currentWeight - goal.startWeight;
      progressPercent = Math.max(0, Math.min(100, Math.round((gained / totalWeightChange) * 100)));
    } else {
      progressPercent = 100;
    }
  }

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

  const statusConfig = GOAL_PHASE_STATUS_CONFIG[goal.status];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-white dark:to-[#0c1626] border border-emerald-500/30 dark:border-[#162338] p-6 shadow-sm space-y-5">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.badgeClass}`}
            >
              <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
              <span>{statusConfig.label}</span>
            </span>

            <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
              {goal.goalType}
            </span>

            <span className="text-[11px] text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 font-medium">
              <Clock className="h-3 w-3 text-slate-400" />
              {diffDays < 0 ? (
                <span className="text-rose-500 font-bold">Đã quá hạn {Math.abs(diffDays)} ngày</span>
              ) : diffDays === 0 ? (
                <span className="text-amber-500 font-bold">Hôm nay là ngày kết thúc</span>
              ) : (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Còn {diffDays} ngày nữa
                </span>
              )}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="h-5 w-5 text-emerald-500 shrink-0" />
            <span>{goal.goalName}</span>
          </h3>
        </div>

        {/* Nút thao tác trực tiếp (INLINE ACTIONS) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={startCompleteMode}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Hoàn thành mục tiêu</span>
          </button>

          <button
            type="button"
            onClick={startEditMode}
            title="Chỉnh sửa trực tiếp"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-xs cursor-pointer"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Progress Bar & Stats */}
      <div className="space-y-2.5 relative z-10 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xs p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Scale className="h-4 w-4 text-emerald-500" />
            <span className="font-semibold text-slate-900 dark:text-white">Tiến trình cân nặng:</span>
            {currentWeight !== undefined && (
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                (Hiện tại: <strong className="text-emerald-600 dark:text-emerald-400">{currentWeight} kg</strong>)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-bold">
            {isLosingWeight ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingDown className="h-3.5 w-3.5" />
                Giảm {totalWeightChange.toFixed(1)} kg
              </span>
            ) : isGainingWeight ? (
              <span className="text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Tăng {totalWeightChange.toFixed(1)} kg
              </span>
            ) : (
              <span className="text-slate-500 flex items-center gap-0.5">
                <Minus className="h-3.5 w-3.5" />
                Duy trì cân nặng
              </span>
            )}
          </div>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 rounded-full"
            style={{ width: `${currentWeight !== undefined ? progressPercent : 50}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div>
            <span className="text-[10px] text-slate-400 block font-medium">Bắt đầu</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {goal.startWeight} kg
            </span>
          </div>

          {currentWeight !== undefined && totalWeightChange > 0 && (
            <div className="text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Tiến độ ước tính</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {progressPercent}%
              </span>
            </div>
          )}

          <div className="text-right">
            <span className="text-[10px] text-slate-400 block font-medium">Mục tiêu</span>
            <span className="font-bold text-teal-600 dark:text-teal-400">
              {goal.targetWeight} kg
            </span>
          </div>
        </div>
      </div>

      {/* Dates & Notes */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-500/10 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 font-medium">
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          <span>Giai đoạn:</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {formatDateDisplay(goal.startDate)} → {formatDateDisplay(goal.endDate)}
          </span>
        </div>

        {goal.note && (
          <div className="truncate max-w-md text-[11px] italic text-slate-500 dark:text-slate-400">
            “{goal.note}”
          </div>
        )}
      </div>
    </div>
  );
}
