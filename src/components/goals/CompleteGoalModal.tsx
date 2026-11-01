import { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  Calendar,
  Scale,
  Award,
  Loader2,
  AlertCircle,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientGoalService } from '../../services/clientGoalService';
import type { ClientGoal, UpdateClientGoalRequest } from '../../types/clientGoal';

interface CompleteGoalModalProps {
  isOpen: boolean;
  goal: ClientGoal | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteGoalModal({
  isOpen,
  goal,
  onClose,
  onSuccess,
}: CompleteGoalModalProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  const [endWeight, setEndWeight] = useState<number>(65);
  const [actualEndDate, setActualEndDate] = useState<string>(todayStr);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !goal) return;
    setErrorMsg(null);
    setEndWeight(goal.targetWeight || 65);
    setActualEndDate(todayStr);
    setNote(goal.note ? `${goal.note} (Hoàn thành mục tiêu)` : '');
  }, [isOpen, goal, todayStr]);

  if (!isOpen || !goal) return null;

  // Tính chênh lệch so với cân nặng ban đầu
  const totalChange = endWeight - goal.startWeight;
  const isLoss = totalChange < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!endWeight || endWeight <= 0) {
      const err = 'Vui lòng nhập cân nặng thực tế đạt được (> 0 kg)';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (!actualEndDate) {
      const err = 'Vui lòng chọn ngày hoàn thành thực tế';
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
        note: note.trim() || undefined,
      };

      await clientGoalService.updateGoal(goal.id, payload);
      toast.success('Chúc mừng! Đã hoàn thành giai đoạn mục tiêu thành công!', {
        description: `Cân nặng đạt được: ${endWeight} kg (${isLoss ? 'Giảm' : 'Tăng'} ${Math.abs(totalChange).toFixed(1)} kg)`,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      let message = 'Cập nhật hoàn thành thất bại. Vui lòng thử lại sau.';
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
      <div className="w-full max-w-md bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Hoàn thành mục tiêu
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ghi nhận kết quả đạt được của học viên
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

        {/* Goal Summary Card */}
        <div className="m-5 mb-0 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">
            {goal.goalType}
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {goal.goalName}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Mục tiêu đề ra: <strong>{goal.startWeight} kg ➔ {goal.targetWeight} kg</strong>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Cân nặng thực tế đạt được */}
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

          {/* Ngày kết thúc thực tế */}
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

          {/* Ghi chú / Đánh giá của PT */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú đánh giá kết quả
            </label>
            <div className="relative">
              <FileText className="h-4 w-4 absolute left-3.5 top-3 text-slate-400" />
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Nhận xét của PT về sự nỗ lực, thể lực và vóc dáng của học viên..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-blue-500 font-medium resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Xác nhận hoàn thành</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
