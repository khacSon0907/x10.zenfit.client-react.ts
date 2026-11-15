import { useState, useEffect } from 'react';
import { X, Utensils, Dumbbell, User, Flame, Check } from 'lucide-react';
import { toast } from 'sonner';
import type { NutritionPlan, WorkoutPlan } from '../../types/plan.types';

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'NUTRITION' | 'WORKOUT';
  clients?: Array<{ id: string; fullName: string }>;
  onCreateNutritionPlan: (plan: Omit<NutritionPlan, 'id' | 'createdAt'>) => void;
  onCreateWorkoutPlan: (plan: Omit<WorkoutPlan, 'id' | 'createdAt'>) => void;
}

export default function CreatePlanModal({
  isOpen,
  onClose,
  defaultTab = 'NUTRITION',
  clients = [],
  onCreateNutritionPlan,
  onCreateWorkoutPlan,
}: CreatePlanModalProps) {
  const [planType, setPlanType] = useState<'NUTRITION' | 'WORKOUT'>(defaultTab);

  // Nutrition Plan Form State
  const [nutritionTitle, setNutritionTitle] = useState('');
  const [nutritionClient, setNutritionClient] = useState('');
  const [nutritionCalories, setNutritionCalories] = useState<number>(2200);
  const [carbPercent, setCarbPercent] = useState<number>(40);
  const [proteinPercent, setProteinPercent] = useState<number>(30);
  const [fatPercent, setFatPercent] = useState<number>(30);
  const [nutritionNote, setNutritionNote] = useState('');

  // Workout Plan Form State
  const [workoutTitle, setWorkoutTitle] = useState('');
  const [workoutClient, setWorkoutClient] = useState('');
  const [sessionsPerWeek, setSessionsPerWeek] = useState<number>(4);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [workoutNote, setWorkoutNote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPlanType(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  const totalMacro = carbPercent + proteinPercent + fatPercent;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (planType === 'NUTRITION') {
      if (!nutritionTitle.trim()) {
        toast.error('Vui lòng nhập tên kế hoạch dinh dưỡng!');
        return;
      }
      if (totalMacro !== 100) {
        toast.error(`Tổng tỷ lệ Macros hiện là ${totalMacro}%, cần bằng 100%!`);
        return;
      }

      onCreateNutritionPlan({
        title: nutritionTitle.trim(),
        clientName: nutritionClient.trim() || undefined,
        status: 'ACTIVE',
        targetCalories: Number(nutritionCalories) || 2000,
        macros: {
          carb: carbPercent,
          protein: proteinPercent,
          fat: fatPercent,
        },
        meals: [
          { id: 'm1', mealName: 'Bữa sáng', foods: 'Bún bò, 1 quả trứng', calories: 450, protein: 25.0, carb: 50.0, fat: 15.0 },
          { id: 'm2', mealName: 'Bữa phụ sáng', foods: 'Chuối, Sữa hạt', calories: 150, protein: 1.6, carb: 0.0, fat: 0.3 },
          { id: 'm3', mealName: 'Bữa trưa', foods: 'Cơm lứt, Ức gà, Bông cải', calories: 600, protein: 32.6, carb: 40.4, fat: 15.9 },
          { id: 'm4', mealName: 'Bữa phụ chiều', foods: 'Whey protein', calories: 150, protein: 1.5, carb: 0.0, fat: 0.2 },
          { id: 'm5', mealName: 'Bữa tối', foods: 'Cá hồi, Khoai lang, Rau luộc', calories: 500, protein: 20.2, carb: 10.3, fat: 12.8 },
        ],
        note: nutritionNote.trim() || undefined,
      });

      toast.success('Đã thêm kế hoạch dinh dưỡng mới!');
      onClose();
    } else {
      if (!workoutTitle.trim()) {
        toast.error('Vui lòng nhập tên giáo án tập luyện!');
        return;
      }

      onCreateWorkoutPlan({
        title: workoutTitle.trim(),
        clientName: workoutClient.trim() || undefined,
        status: 'ACTIVE',
        sessionsPerWeek: Number(sessionsPerWeek) || 4,
        durationMinutes: Number(durationMinutes) || 60,
        days: [
          {
            id: 'd1',
            dayName: 'Buổi 1: Ngực & Tay sau',
            targetMuscle: 'Ngực, Tay sau',
            exercises: [
              { id: 'e1', exerciseName: 'Barbell Bench Press', setsReps: '4 sets x 8-10 reps', rpeRest: 'RPE 8 • Nghỉ 90s' },
              { id: 'e2', exerciseName: 'Incline Dumbbell Press', setsReps: '3 sets x 10-12 reps', rpeRest: 'RPE 8 • Nghỉ 90s' },
              { id: 'e3', exerciseName: 'Cable Chest Fly', setsReps: '3 sets x 12-15 reps', rpeRest: 'RPE 9 • Nghỉ 60s' },
              { id: 'e4', exerciseName: 'Rope Tricep Pushdown', setsReps: '3 sets x 12-15 reps', rpeRest: 'RPE 8.5 • Nghỉ 60s' },
            ],
          },
          {
            id: 'd2',
            dayName: 'Buổi 2: Lưng & Tay trước',
            targetMuscle: 'Lưng xô, Tay trước',
            exercises: [
              { id: 'e5', exerciseName: 'Lat Pulldown', setsReps: '4 sets x 10 reps', rpeRest: 'RPE 8 • Nghỉ 90s' },
              { id: 'e6', exerciseName: 'Barbell Row', setsReps: '4 sets x 8 reps', rpeRest: 'RPE 8 • Nghỉ 2p' },
              { id: 'e7', exerciseName: 'Dumbbell Hammer Curl', setsReps: '3 sets x 12 reps', rpeRest: 'RPE 9 • Nghỉ 60s' },
            ],
          },
        ],
        note: workoutNote.trim() || undefined,
      });

      toast.success('Đã thêm giáo án tập luyện mới!');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thêm kế hoạch mới</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Thiết lập kế hoạch dinh dưỡng hoặc giáo án luyện tập cho học viên
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Type Selector */}
        <div className="p-4 bg-slate-50/80 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-800 flex gap-2">
          <button
            type="button"
            onClick={() => setPlanType('NUTRITION')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              planType === 'NUTRITION'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Kế hoạch Dinh dưỡng</span>
          </button>
          <button
            type="button"
            onClick={() => setPlanType('WORKOUT')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              planType === 'WORKOUT'
                ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Giáo án Tập luyện</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
          {planType === 'NUTRITION' ? (
            <>
              {/* Tên kế hoạch */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên kế hoạch dinh dưỡng <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kế hoạch siết cơ 4 tuần - Nguyễn Văn A"
                  value={nutritionTitle}
                  onChange={(e) => setNutritionTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Chọn học viên */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Áp dụng cho học viên</span>
                </label>
                {clients.length > 0 ? (
                  <select
                    value={nutritionClient}
                    onChange={(e) => setNutritionClient(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Chọn học viên áp dụng (Tùy chọn) --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.fullName}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Nhập tên học viên (ví dụ: Nguyễn Văn A)"
                    value={nutritionClient}
                    onChange={(e) => setNutritionClient(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Mục tiêu Calo */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>Mục tiêu Calo hàng ngày (kcal)</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="800"
                    max="5000"
                    step="50"
                    value={nutritionCalories}
                    onChange={(e) => setNutritionCalories(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs text-slate-400 font-medium">kcal</span>
                </div>
              </div>

              {/* Macros Ratio */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tỷ lệ Macros (%)
                  </label>
                  <span
                    className={`text-xs font-bold ${
                      totalMacro === 100 ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    Tổng: {totalMacro}% {totalMacro === 100 ? '✓' : '(Phải = 100%)'}
                  </span>
                </div>

                {/* Macro Preview Bar */}
                <div className="h-6 rounded-lg overflow-hidden flex text-[11px] font-bold text-white shadow-xs">
                  <div
                    style={{ width: `${Math.max(carbPercent, 5)}%` }}
                    className="bg-teal-500 flex items-center justify-center px-1 transition-all"
                  >
                    Carb {carbPercent}%
                  </div>
                  <div
                    style={{ width: `${Math.max(proteinPercent, 5)}%` }}
                    className="bg-blue-600 flex items-center justify-center px-1 transition-all"
                  >
                    Protein {proteinPercent}%
                  </div>
                  <div
                    style={{ width: `${Math.max(fatPercent, 5)}%` }}
                    className="bg-rose-400 flex items-center justify-center px-1 transition-all"
                  >
                    Fat {fatPercent}%
                  </div>
                </div>

                {/* 3 Macro Inputs */}
                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <span className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold block mb-1">
                      Carb (%)
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      value={carbPercent}
                      onChange={(e) => setCarbPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold block mb-1">
                      Protein (%)
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      value={proteinPercent}
                      onChange={(e) => setProteinPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold block mb-1">
                      Fat (%)
                    </span>
                    <input
                      type="number"
                      min="10"
                      max="80"
                      value={fatPercent}
                      onChange={(e) => setFatPercent(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú dặn dò
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú chế độ ăn, dị ứng thực phẩm, thời gian nạp calo..."
                  value={nutritionNote}
                  onChange={(e) => setNutritionNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          ) : (
            <>
              {/* Tên giáo án */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên giáo án tập luyện <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Giáo án Tăng cơ 8 tuần - Nguyễn Văn A"
                  value={workoutTitle}
                  onChange={(e) => setWorkoutTitle(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Học viên */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Áp dụng cho học viên</span>
                </label>
                {clients.length > 0 ? (
                  <select
                    value={workoutClient}
                    onChange={(e) => setWorkoutClient(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">-- Chọn học viên áp dụng (Tùy chọn) --</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.fullName}>
                        {c.fullName}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="Nhập tên học viên (ví dụ: Nguyễn Văn A)"
                    value={workoutClient}
                    onChange={(e) => setWorkoutClient(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                )}
              </div>

              {/* Số buổi & Thời lượng */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số buổi / tuần
                  </label>
                  <select
                    value={sessionsPerWeek}
                    onChange={(e) => setSessionsPerWeek(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                  >
                    <option value={2}>2 buổi / tuần</option>
                    <option value={3}>3 buổi / tuần</option>
                    <option value={4}>4 buổi / tuần</option>
                    <option value={5}>5 buổi / tuần</option>
                    <option value={6}>6 buổi / tuần</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời lượng mỗi buổi
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="30"
                      max="180"
                      step="15"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">phút</span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mục tiêu & Hướng dẫn tập
                </label>
                <textarea
                  rows={2}
                  placeholder="Mục tiêu tăng cơ, lưu ý khởi động, thời gian nghỉ..."
                  value={workoutNote}
                  onChange={(e) => setWorkoutNote(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-xl shadow-sm shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Tạo kế hoạch</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
