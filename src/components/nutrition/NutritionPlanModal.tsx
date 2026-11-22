import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Calendar,
  User,
  Flame,
  UtensilsCrossed,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { nutritionPlanService } from '../../services/nutritionPlanService';
import type {
  NutritionPlan,
  NutritionPlanStatus,
  CreateNutritionPlanRequest,
  UpdateNutritionPlanRequest,
} from '../../types/nutrition';
import { NUTRITION_PLAN_STATUS_CONFIG } from '../../types/nutrition';
import type { ClientResponse } from '../../types/client.types';
import { useAuth } from '../../context/AuthContext';

interface NutritionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: NutritionPlan | null;
  defaultClientId?: string;
  onSaved: (plan: NutritionPlan) => void;
}

export default function NutritionPlanModal({
  isOpen,
  onClose,
  planToEdit,
  defaultClientId,
  onSaved,
}: NutritionPlanModalProps) {
  const { user: authUser } = useAuth();
  const isEditing = Boolean(planToEdit);

  // Form states
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<NutritionPlanStatus>('ACTIVE');

  // Macro target states
  const [calories, setCalories] = useState<number>(2000);
  const [protein, setProtein] = useState<number>(150);
  const [carbs, setCarbs] = useState<number>(200);
  const [fat, setFat] = useState<number>(60);

  // UI states
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or fill data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    // Fetch clients
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        const data = await nutritionPlanService.getMyClients(authUser?.id);
        setClients(data);
      } catch (err) {
        console.error('Failed to load clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    loadClients();

    if (planToEdit) {
      setClientId(planToEdit.clientId || '');
      setName(planToEdit.name || '');
      setDescription(planToEdit.description || '');
      setStartDate(planToEdit.startDate ? planToEdit.startDate.split('T')[0] : '');
      setEndDate(planToEdit.endDate ? planToEdit.endDate.split('T')[0] : '');
      setStatus(planToEdit.status || 'ACTIVE');
      if (planToEdit.dailyMacroTarget) {
        setCalories(planToEdit.dailyMacroTarget.calories || 2000);
        setProtein(planToEdit.dailyMacroTarget.protein || 150);
        setCarbs(planToEdit.dailyMacroTarget.carbs || 200);
        setFat(planToEdit.dailyMacroTarget.fat || 60);
      }
    } else {
      const today = new Date();
      const in30Days = new Date();
      in30Days.setDate(today.getDate() + 30);

      setClientId(defaultClientId || '');
      setName('');
      setDescription('');
      setStartDate(today.toISOString().split('T')[0]);
      setEndDate(in30Days.toISOString().split('T')[0]);
      setStatus('ACTIVE');
      setCalories(2000);
      setProtein(150);
      setCarbs(200);
      setFat(60);
    }
    setErrors({});
  }, [isOpen, planToEdit, defaultClientId]);

  if (!isOpen) return null;

  // Auto calculate calories based on macros (4-4-9 rule)
  const handleAutoCalculateCalories = () => {
    const calc = Math.round(protein * 4 + carbs * 4 + fat * 9);
    setCalories(calc);
    toast.info(`Đã tính Calo mục tiêu: ${calc.toLocaleString('vi-VN')} kcal`, {
      description: 'Công thức: (Protein × 4) + (Carbs × 4) + (Fat × 9)',
    });
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Vui lòng nhập tên kế hoạch';
    }
    if (!isEditing && !clientId) {
      errs.clientId = 'Vui lòng chọn học viên';
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errs.endDate = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu';
    }
    if (calories < 0) {
      errs.calories = 'Calo không thể âm';
    }
    if (protein < 0 || carbs < 0 || fat < 0) {
      errs.macros = 'Chỉ số dinh dưỡng không thể âm';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      if (isEditing && planToEdit) {
        const updatePayload: UpdateNutritionPlanRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status,
        };
        const updated = await nutritionPlanService.updatePlan(planToEdit.id, updatePayload);

        // Also update macro target if changed
        try {
          await nutritionPlanService.updateMacroTarget(planToEdit.id, {
            calories: Number(calories),
            protein: Number(protein),
            carbs: Number(carbs),
            fat: Number(fat),
          });
          updated.dailyMacroTarget = {
            calories: Number(calories),
            protein: Number(protein),
            carbs: Number(carbs),
            fat: Number(fat),
          };
        } catch (mErr) {
          console.warn('Macro target update fallback:', mErr);
        }

        toast.success('Cập nhật kế hoạch dinh dưỡng thành công!');
        onSaved(updated);
      } else {
        const createPayload: CreateNutritionPlanRequest = {
          clientId,
          name: name.trim(),
          description: description.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status,
          dailyMacroTarget: {
            calories: Number(calories),
            protein: Number(protein),
            carbs: Number(carbs),
            fat: Number(fat),
          },
        };
        const created = await nutritionPlanService.createPlan(createPayload);
        toast.success('Tạo kế hoạch dinh dưỡng mới thành công!');
        onSaved(created);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Save nutrition plan error:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Không thể lưu kế hoạch dinh dưỡng. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0c1523] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Chỉnh sửa Kế hoạch Dinh dưỡng' : 'Tạo Kế hoạch Dinh dưỡng Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Cập nhật mục tiêu và thông tin kế hoạch ăn uống'
                  : 'Thiết lập mục tiêu calo, macro và thực đơn cho học viên'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Học viên */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Học viên áp dụng <span className="text-rose-400">*</span>
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-sm">
                <User className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-white">
                  {planToEdit?.clientName || 'Học viên'}
                </span>
                <span className="text-xs text-slate-500 ml-auto">Không thể đổi học viên khi sửa</span>
              </div>
            ) : (
              <div>
                <select
                  value={clientId}
                  onChange={(e) => {
                    setClientId(e.target.value);
                    if (errors.clientId) setErrors((prev) => ({ ...prev, clientId: '' }));
                  }}
                  disabled={loadingClients}
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border ${
                    errors.clientId ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  } text-white text-sm focus:outline-none transition-colors`}
                >
                  <option value="">-- Chọn học viên --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName || c.email} ({c.phone || c.email || 'Chưa có SĐT'})
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.clientId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Tên kế hoạch */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tên kế hoạch <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="VD: Giảm mỡ siết cơ 4 tuần - 2000 Kcal"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900/70 border ${
                errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
              } text-white text-sm focus:outline-none transition-colors placeholder:text-slate-500`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Mô tả / Lưu ý cho học viên
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Uống đủ 2.5L nước mỗi ngày, ăn tinh bột chậm trước buổi tập 90 phút..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-emerald-500 text-white text-sm focus:outline-none transition-colors placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Thời gian & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Ngày bắt đầu
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-emerald-500 text-white text-xs focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Ngày kết thúc
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/70 border ${
                    errors.endDate ? 'border-rose-500' : 'border-slate-800 focus:border-emerald-500'
                  } text-white text-xs focus:outline-none transition-colors`}
                />
              </div>
              {errors.endDate && (
                <p className="mt-1 text-[11px] text-rose-400">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Trạng thái
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NutritionPlanStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-900/70 border border-slate-800 focus:border-emerald-500 text-white text-xs focus:outline-none transition-colors"
              >
                {(Object.keys(NUTRITION_PLAN_STATUS_CONFIG) as NutritionPlanStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {NUTRITION_PLAN_STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section: Mục tiêu Macro mỗi ngày */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Mục tiêu Dinh dưỡng mỗi ngày (Macro)</h3>
              </div>
              <button
                type="button"
                onClick={handleAutoCalculateCalories}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 rounded-lg transition-colors cursor-pointer"
                title="Tính lại Calo tự động: (P × 4) + (C × 4) + (F × 9)"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Tự tính Calo theo Macro
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Calories */}
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <label className="block text-[11px] font-bold uppercase text-amber-400 mb-1">
                  Mục tiêu Calo
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={calories}
                    onChange={(e) => setCalories(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-xs text-slate-400">kcal</span>
                </div>
              </div>

              {/* Protein */}
              <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
                <label className="block text-[11px] font-bold uppercase text-blue-400 mb-1">
                  Đạm (Protein)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={protein}
                    onChange={(e) => setProtein(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>

              {/* Carbs */}
              <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <label className="block text-[11px] font-bold uppercase text-emerald-400 mb-1">
                  Carbs (Tinh bột)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={carbs}
                    onChange={(e) => setCarbs(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-none focus:border-emerald-500"
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>

              {/* Fat */}
              <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <label className="block text-[11px] font-bold uppercase text-rose-400 mb-1">
                  Chất béo (Fat)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={fat}
                    onChange={(e) => setFat(Number(e.target.value))}
                    className="w-full bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1 text-sm font-semibold text-white focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-xs text-slate-400">g</span>
                </div>
              </div>
            </div>

            {/* Note info */}
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                Tổng calo tương đương từ macro: <b>{protein * 4 + carbs * 4 + fat * 9} kcal</b>{' '}
                (1g Protein = 4 kcal, 1g Carbs = 4 kcal, 1g Fat = 9 kcal)
              </span>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800/60 text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Cập nhật kế hoạch' : 'Tạo kế hoạch'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
