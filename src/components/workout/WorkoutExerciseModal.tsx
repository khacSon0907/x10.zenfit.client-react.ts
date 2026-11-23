import React, { useState, useEffect } from 'react';
import { X, Dumbbell, Clock, Activity, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { workoutPlanService } from '../../services/workoutPlanService';
import type { WorkoutExercise } from '../../types/workoutPlan';

interface WorkoutExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  dayId: string;
  exerciseToEdit?: WorkoutExercise | null;
  onSaved: () => void;
}

export default function WorkoutExerciseModal({
  isOpen,
  onClose,
  planId,
  dayId,
  exerciseToEdit,
  onSaved,
}: WorkoutExerciseModalProps) {
  const isEditing = Boolean(exerciseToEdit);

  const [exerciseName, setExerciseName] = useState('');
  const [sets, setSets] = useState<number>(4);
  const [reps, setReps] = useState<number>(10);
  const [restSeconds, setRestSeconds] = useState<number>(60);
  const [tempo, setTempo] = useState<string>('3-0-1-0');
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (exerciseToEdit) {
        setExerciseName(exerciseToEdit.exerciseName || '');
        setSets(exerciseToEdit.sets ?? 4);
        setReps(exerciseToEdit.reps ?? 10);
        setRestSeconds(exerciseToEdit.restSeconds ?? 60);
        setTempo(exerciseToEdit.tempo || '3-0-1-0');
        setNote(exerciseToEdit.note || '');
      } else {
        setExerciseName('');
        setSets(4);
        setReps(10);
        setRestSeconds(60);
        setTempo('3-0-1-0');
        setNote('');
      }
    }
  }, [isOpen, exerciseToEdit]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) {
      toast.error('Vui lòng nhập tên bài tập');
      return;
    }
    if (sets <= 0 || reps <= 0) {
      toast.error('Số hiệp và số lần lặp phải lớn hơn 0');
      return;
    }
    if (!tempo.trim()) {
      toast.error('Vui lòng nhập tempo nhịp thở/chuyển động (ví dụ: 3-0-1-0)');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && exerciseToEdit) {
        await workoutPlanService.updateExercise(planId, dayId, exerciseToEdit.id, {
          exerciseName: exerciseName.trim(),
          sets: Number(sets),
          reps: Number(reps),
          restSeconds: Number(restSeconds),
          tempo: tempo.trim(),
          note: note.trim() || undefined,
        });
        toast.success(`Đã cập nhật bài tập "${exerciseName}"`);
      } else {
        await workoutPlanService.addExercise(planId, dayId, {
          exerciseName: exerciseName.trim(),
          sets: Number(sets),
          reps: Number(reps),
          restSeconds: Number(restSeconds),
          tempo: tempo.trim(),
          note: note.trim() || undefined,
        });
        toast.success(`Đã thêm bài tập "${exerciseName}"`);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      console.error('Error saving exercise:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể lưu bài tập. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Chỉnh sửa bài tập' : 'Thêm bài tập mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Thiết lập thông số hiệp, số lần lặp, nhịp độ và thời gian nghỉ
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tên bài tập */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tên bài tập <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="VD: Barbell Bench Press, Dumbbell Squat..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm text-white focus:outline-none transition-colors"
            />
          </div>

          {/* Grid 3 cột: Sets, Reps, RestSeconds */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Số hiệp (Sets) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={sets}
                onChange={(e) => setSets(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm font-semibold text-white text-center focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Số lần (Reps) <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={200}
                required
                value={reps}
                onChange={(e) => setReps(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm font-semibold text-white text-center focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Nghỉ (giây)</span>
              </label>
              <input
                type="number"
                min={0}
                step={5}
                required
                value={restSeconds}
                onChange={(e) => setRestSeconds(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm font-semibold text-amber-400 text-center focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Tempo */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-teal-400" />
                <span>Nhịp độ chuyển động (Tempo)</span>
              </label>
              <span className="text-[11px] text-slate-400">VD: 3-0-1-0, 2-1-1-0</span>
            </div>
            <input
              type="text"
              required
              value={tempo}
              onChange={(e) => setTempo(e.target.value)}
              placeholder="3-0-1-0 (Hạ 3s - Dừng 0s - Lên 1s - Dừng 0s)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm text-white focus:outline-none transition-colors"
            />
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-slate-400">
              <Info className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Ý nghĩa: [Giây hạ tạ] - [Dừng ở đáy] - [Giây đẩy tạ] - [Dừng ở đỉnh]</span>
            </div>
          </div>

          {/* Ghi chú kỹ thuật */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Ghi chú kỹ thuật cho học viên
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Khóa chặt khớp vai, gồng core bụng, không bật cùi chỏ quá rộng..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm text-white focus:outline-none transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{isEditing ? 'Cập nhật bài tập' : 'Thêm bài tập'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

