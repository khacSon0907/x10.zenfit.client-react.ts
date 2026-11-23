import React, { useState, useEffect } from 'react';
import { X, Calendar, Check } from 'lucide-react';
import { toast } from 'sonner';
import { workoutPlanService } from '../../services/workoutPlanService';
import type { WorkoutDay } from '../../types/workoutPlan';

interface WorkoutDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  dayToEdit?: WorkoutDay | null;
  nextDayNumber?: number;
  onSaved: () => void;
}

export default function WorkoutDayModal({
  isOpen,
  onClose,
  planId,
  dayToEdit,
  nextDayNumber = 1,
  onSaved,
}: WorkoutDayModalProps) {
  const isEditing = Boolean(dayToEdit);

  const [dayNumber, setDayNumber] = useState<number>(nextDayNumber);
  const [dayName, setDayName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      if (dayToEdit) {
        setDayNumber(dayToEdit.dayNumber ?? 1);
        setDayName(dayToEdit.dayName || '');
        setDescription(dayToEdit.description || '');
      } else {
        setDayNumber(nextDayNumber);
        setDayName(`Buổi ${nextDayNumber}: `);
        setDescription('');
      }
    }
  }, [isOpen, dayToEdit, nextDayNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayName.trim()) {
      toast.error('Vui lòng nhập tên buổi tập (ví dụ: Buổi 1: Ngực & Tay sau)');
      return;
    }
    if (dayNumber <= 0) {
      toast.error('Thứ tự ngày tập phải lớn hơn 0');
      return;
    }

    try {
      setIsSubmitting(true);
      if (isEditing && dayToEdit) {
        await workoutPlanService.updateDay(planId, dayToEdit.id, {
          dayNumber: Number(dayNumber),
          dayName: dayName.trim(),
          description: description.trim() || undefined,
        });
        toast.success(`Đã cập nhật "${dayName}"`);
      } else {
        await workoutPlanService.addDay(planId, {
          dayNumber: Number(dayNumber),
          dayName: dayName.trim(),
          description: description.trim() || undefined,
          exercises: [],
        });
        toast.success(`Đã thêm "${dayName}" vào giáo án`);
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      console.error('Error saving workout day:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể lưu ngày tập. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Chỉnh sửa ngày tập' : 'Thêm ngày tập mới'}
              </h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Cập nhật tên và mô tả buổi tập' : 'Tạo thêm một buổi tập trong giáo án'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Thứ tự <span className="text-rose-400">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={30}
                required
                value={dayNumber}
                onChange={(e) => setDayNumber(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm font-semibold text-white text-center focus:outline-none transition-colors"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên buổi tập <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={dayName}
                onChange={(e) => setDayName(e.target.value)}
                placeholder="VD: Buổi 1: Đẩy (Ngực - Vai - Tay sau)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mục tiêu & Mô tả buổi tập
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Tập trung phát triển ngực trên và sức mạnh cơ vai, khởi động xoay khớp kỹ trước khi đẩy tạ..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-sm text-white focus:outline-none transition-colors placeholder:text-slate-600 resize-none"
            />
          </div>

          {/* Actions */}
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
                  <span>{isEditing ? 'Cập nhật' : 'Thêm buổi tập'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
