import { useState, useEffect } from 'react';
import { X, Flame, Dumbbell, Zap, Droplets, Sparkles, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import type { DailyMacroTarget } from '../../types/nutrition';
import nutritionPlanService from '../../services/nutritionPlanService';

interface MacroTargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  currentTarget?: DailyMacroTarget;
  onUpdated: (target: DailyMacroTarget) => void;
}

export default function MacroTargetModal({
  isOpen,
  onClose,
  planId,
  currentTarget,
  onUpdated,
}: MacroTargetModalProps) {
  const [calories, setCalories] = useState<number>(2000);
  const [protein, setProtein] = useState<number>(150);
  const [carbs, setCarbs] = useState<number>(200);
  const [fat, setFat] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && currentTarget) {
      setCalories(currentTarget.calories || 2000);
      setProtein(currentTarget.protein || 150);
      setCarbs(currentTarget.carbs || 200);
      setFat(currentTarget.fat || 60);
    }
  }, [isOpen, currentTarget]);

  if (!isOpen) return null;

  // Tính calo tự động: 1g Protein = 4 kcal, 1g Carb = 4 kcal, 1g Fat = 9 kcal
  const calculateCaloriesFromMacros = () => {
    const calculated = protein * 4 + carbs * 4 + fat * 9;
    setCalories(Math.round(calculated));
    toast.info(`Đã tính Calo từ Macro: ${calculated} kcal`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calories <= 0 || protein < 0 || carbs < 0 || fat < 0) {
      toast.error('Các chỉ số dinh dưỡng phải là số dương hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await nutritionPlanService.updateMacroTarget(planId, {
        calories: Number(calories),
        protein: Number(protein),
        carbs: Number(carbs),
        fat: Number(fat),
      });

      toast.success('Cập nhật Macro mục tiêu thành công!');
      onUpdated(updated);
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi cập nhật Macro target:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || 'Không thể cập nhật mục tiêu Macro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0c1626] border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mục tiêu dinh dưỡng</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">Thiết lập Macro trong ngày</h3>
          <p className="text-xs text-slate-400 mt-1">
            Quy định lượng Calo và các chất dinh dưỡng đa lượng mục tiêu cho học viên.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Calories Target */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>Năng lượng mục tiêu (Calories)</span>
              </label>
              <button
                type="button"
                onClick={calculateCaloriesFromMacros}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline cursor-pointer"
                title="Tính nhanh từ P*4 + C*4 + F*9"
              >
                <Calculator className="w-3 h-3" />
                <span>Tính tự động</span>
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                min="500"
                max="10000"
                value={calories}
                onChange={(e) => setCalories(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-emerald-500 pr-14"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                kcal
              </span>
            </div>
          </div>

          {/* 3 Macro Cards */}
          <div className="grid grid-cols-3 gap-3">
            {/* Protein */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-rose-500/20 space-y-1.5">
              <label className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Protein (Đạm)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={protein}
                  onChange={(e) => setProtein(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white pr-6 focus:outline-none focus:border-rose-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  g
                </span>
              </div>
            </div>

            {/* Carbs */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-amber-500/20 space-y-1.5">
              <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>Carbs (Tinh bột)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="1500"
                  value={carbs}
                  onChange={(e) => setCarbs(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white pr-6 focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  g
                </span>
              </div>
            </div>

            {/* Fat */}
            <div className="p-3 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-1.5">
              <label className="text-[11px] font-bold text-purple-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" />
                <span>Fat (Chất béo)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={fat}
                  onChange={(e) => setFat(Number(e.target.value))}
                  required
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold text-white pr-6 focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                  g
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-[11px] text-slate-400">
            💡 Tỉ lệ phân bổ năng lượng ước tính:{' '}
            <span className="text-rose-400 font-semibold">
              {Math.round(((protein * 4) / (calories || 1)) * 100)}% P
            </span>{' '}
            •{' '}
            <span className="text-amber-400 font-semibold">
              {Math.round(((carbs * 4) / (calories || 1)) * 100)}% C
            </span>{' '}
            •{' '}
            <span className="text-purple-400 font-semibold">
              {Math.round(((fat * 9) / (calories || 1)) * 100)}% F
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/60">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu mục tiêu</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

