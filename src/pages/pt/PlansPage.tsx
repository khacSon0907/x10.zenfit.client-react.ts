import { useState, useMemo } from 'react';
import {
  Plus,
  Upload,
  Utensils,
  Dumbbell,
  Edit3,
  Trash2,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import CreatePlanModal from '../../components/plans/CreatePlanModal';
import type {
  NutritionPlan,
  NutritionTemplate,
  WorkoutPlan,
  WorkoutTemplate,
} from '../../types/plan.types';

// ==========================================
// DỮ LIỆU MẪU BAN ĐẦU
// ==========================================
const INITIAL_NUTRITION_TEMPLATES: NutritionTemplate[] = [
  {
    id: 'tmpl-1',
    title: 'Giảm mỡ - Thâm hụt calo',
    calorieEstimate: '2200 kcal/macros có ước tính',
    targetCalories: 2200,
    macros: { carb: 40, protein: 30, fat: 30 },
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80',
    defaultMeals: [
      { id: 'm1', mealName: 'Bữa sáng', foods: 'Bún bò, 1 quả trứng', calories: 450, protein: 25.0, carb: 50.0, fat: 15.0 },
      { id: 'm2', mealName: 'Bữa phụ sáng', foods: 'Chuối, Sữa hạt', calories: 150, protein: 1.6, carb: 0.0, fat: 0.3 },
      { id: 'm3', mealName: 'Bữa trưa', foods: 'Cơm lút, Ức gà, Bông cải', calories: 600, protein: 32.6, carb: 40.4, fat: 15.9 },
      { id: 'm4', mealName: 'Bữa phụ chiều', foods: 'Whey protein', calories: 150, protein: 1.5, carb: 0.0, fat: 0.2 },
      { id: 'm5', mealName: 'Bữa tối', foods: 'Cá hồi, Khoai lang, Rau luộc', calories: 500, protein: 20.2, carb: 10.3, fat: 12.8 },
    ],
  },
  {
    id: 'tmpl-2',
    title: 'Tăng cơ - High Protein',
    calorieEstimate: '2200 kcal/macros có ước tính',
    targetCalories: 2200,
    macros: { carb: 45, protein: 35, fat: 20 },
    imageUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80',
    defaultMeals: [
      { id: 'm1', mealName: 'Bữa sáng', foods: 'Yến mạch, 3 quả trứng, Sữa tươi không đường', calories: 550, protein: 35.0, carb: 65.0, fat: 16.0 },
      { id: 'm2', mealName: 'Bữa phụ sáng', foods: 'Whey Protein + 1 quả chuối', calories: 220, protein: 26.0, carb: 28.0, fat: 2.0 },
      { id: 'm3', mealName: 'Bữa trưa', foods: 'Thịt bò xào ớt chuông, Cơm trắng, Canh cải', calories: 700, protein: 48.0, carb: 80.0, fat: 18.0 },
      { id: 'm4', mealName: 'Bữa phụ chiều', foods: 'Sữa chua Hy Lạp + Hạt hạnh nhân', calories: 200, protein: 15.0, carb: 12.0, fat: 9.0 },
      { id: 'm5', mealName: 'Bữa tối', foods: 'Ức gà áp chảo, Khoai tây, Măng tây luộc', calories: 530, protein: 42.0, carb: 55.0, fat: 12.0 },
    ],
  },
  {
    id: 'tmpl-3',
    title: 'Eat Clean cơ bản',
    calorieEstimate: '1200 kcal/macros có ước tính',
    targetCalories: 1200,
    macros: { carb: 40, protein: 30, fat: 30 },
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80',
    defaultMeals: [
      { id: 'm1', mealName: 'Bữa sáng', foods: 'Trứng ốp la 2 quả, Bánh mì nguyên cám', calories: 300, protein: 15.0, carb: 25.0, fat: 11.0 },
      { id: 'm2', mealName: 'Bữa phụ sáng', foods: 'Táo xanh 1 quả', calories: 80, protein: 0.5, carb: 20.0, fat: 0.2 },
      { id: 'm3', mealName: 'Bữa trưa', foods: 'Tôm hấp, Gạo lứt, Salad dầu dấm', calories: 420, protein: 28.0, carb: 45.0, fat: 8.0 },
      { id: 'm4', mealName: 'Bữa phụ chiều', foods: 'Sữa hạt không đường', calories: 100, protein: 4.0, carb: 12.0, fat: 3.5 },
      { id: 'm5', mealName: 'Bữa tối', foods: 'Salad cá ngừ, Dưa leo, Cà chua bi', calories: 300, protein: 25.0, carb: 15.0, fat: 9.0 },
    ],
  },
];

const INITIAL_NUTRITION_PLANS: NutritionPlan[] = [
  {
    id: 'np-1',
    title: 'Kế hoạch siết cơ 4 tuần - Nguyễn Văn A',
    clientName: 'Nguyễn Văn A',
    status: 'ACTIVE',
    targetCalories: 2200,
    macros: { carb: 40, protein: 30, fat: 30 },
    createdAt: '10/11/2026',
    meals: [
      { id: 'm1', mealName: 'Bữa sáng', foods: 'Bún bò, 1 quả trứng', calories: 450, protein: 25.0, carb: 50.0, fat: 15.0 },
      { id: 'm2', mealName: 'Bữa phụ sáng', foods: 'Chuối, Sữa hạt', calories: 150, protein: 1.6, carb: 0.0, fat: 0.3 },
      { id: 'm3', mealName: 'Bữa trưa', foods: 'Cơm lút, Ức gà, Bông cải', calories: 600, protein: 32.6, carb: 40.4, fat: 15.9 },
      { id: 'm4', mealName: 'Bữa phụ chiều', foods: 'Whey protein', calories: 150, protein: 1.5, carb: 0.0, fat: 0.2 },
      { id: 'm5', mealName: 'Bữa tối', foods: 'Cá hồi, Khoai lang, Rau luộc', calories: 500, protein: 20.2, carb: 10.3, fat: 12.8 },
    ],
  },
];

const INITIAL_WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'wt-1',
    title: 'Push - Pull - Legs (PPL)',
    description: '6 buổi/tuần - Tối ưu kích thích phát triển cơ bắp',
    sessionsPerWeek: 6,
    imageUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=300&q=80',
    days: [
      {
        id: 'd1',
        dayName: 'Buổi 1: Push (Ngực, Vai trước, Tay sau)',
        targetMuscle: 'Ngực, Vai, Tay sau',
        exercises: [
          { id: 'e1', exerciseName: 'Barbell Flat Bench Press', setsReps: '4 sets x 8 reps', rpeRest: 'RPE 8 • Nghỉ 2p' },
          { id: 'e2', exerciseName: 'Incline Dumbbell Press', setsReps: '3 sets x 10 reps', rpeRest: 'RPE 8.5 • Nghỉ 90s' },
          { id: 'e3', exerciseName: 'Dumbbell Lateral Raise', setsReps: '4 sets x 12 reps', rpeRest: 'RPE 9 • Nghỉ 60s' },
          { id: 'e4', exerciseName: 'Rope Tricep Extension', setsReps: '3 sets x 12 reps', rpeRest: 'RPE 8.5 • Nghỉ 60s' },
        ],
      },
      {
        id: 'd2',
        dayName: 'Buổi 2: Pull (Lưng xô, Tay trước)',
        targetMuscle: 'Lưng xô, Cầu vai, Tay trước',
        exercises: [
          { id: 'e5', exerciseName: 'Lat Pulldown', setsReps: '4 sets x 10 reps', rpeRest: 'RPE 8 • Nghỉ 90s' },
          { id: 'e6', exerciseName: 'Seated Cable Row', setsReps: '4 sets x 10 reps', rpeRest: 'RPE 8 • Nghỉ 90s' },
          { id: 'e7', exerciseName: 'Incline Dumbbell Curl', setsReps: '3 sets x 12 reps', rpeRest: 'RPE 8.5 • Nghỉ 60s' },
        ],
      },
    ],
  },
  {
    id: 'wt-2',
    title: 'Upper - Lower 4 buổi',
    description: '4 buổi/tuần - Phù hợp học viên bận rộn, tăng sức mạnh',
    sessionsPerWeek: 4,
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80',
    days: [
      {
        id: 'd1',
        dayName: 'Buổi 1: Upper Strength (Thân trên)',
        targetMuscle: 'Toàn bộ thân trên',
        exercises: [
          { id: 'e1', exerciseName: 'Bench Press', setsReps: '4 sets x 6 reps', rpeRest: 'RPE 8.5 • Nghỉ 2p' },
          { id: 'e2', exerciseName: 'Barbell Row', setsReps: '4 sets x 6 reps', rpeRest: 'RPE 8.5 • Nghỉ 2p' },
          { id: 'e3', exerciseName: 'Overhead Press', setsReps: '3 sets x 8 reps', rpeRest: 'RPE 8 • Nghỉ 90s' },
        ],
      },
    ],
  },
  {
    id: 'wt-3',
    title: 'Full Body Beginner',
    description: '3 buổi/tuần - Xây dựng nền tảng chuyển động & thể lực',
    sessionsPerWeek: 3,
    imageUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?auto=format&fit=crop&w=300&q=80',
    days: [
      {
        id: 'd1',
        dayName: 'Buổi 1: Full Body Nền tảng A',
        targetMuscle: 'Toàn thân',
        exercises: [
          { id: 'e1', exerciseName: 'Goblet Squat', setsReps: '3 sets x 10 reps', rpeRest: 'RPE 7.5 • Nghỉ 90s' },
          { id: 'e2', exerciseName: 'Push Up / Dumbbell Press', setsReps: '3 sets x 10 reps', rpeRest: 'RPE 7.5 • Nghỉ 90s' },
          { id: 'e3', exerciseName: 'Dumbbell Romanian Deadlift', setsReps: '3 sets x 10 reps', rpeRest: 'RPE 7.5 • Nghỉ 90s' },
        ],
      },
    ],
  },
];

const INITIAL_WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 'wp-1',
    title: 'Giáo án Tăng cơ 8 tuần - Nguyễn Văn A',
    clientName: 'Nguyễn Văn A',
    status: 'ACTIVE',
    sessionsPerWeek: 4,
    durationMinutes: 60,
    createdAt: '10/11/2026',
    days: INITIAL_WORKOUT_TEMPLATES[0].days,
  },
];

export default function PlansPage() {
  const { clients } = useApp();

  // Active Tab: 'WORKOUT' | 'NUTRITION'
  // Screenshot shows 'Kế hoạch Dinh dưỡng' active by default
  const [activeTab, setActiveTab] = useState<'WORKOUT' | 'NUTRITION'>('NUTRITION');

  // Nutrition State
  const [nutritionPlans, setNutritionPlans] = useState<NutritionPlan[]>(INITIAL_NUTRITION_PLANS);
  const [selectedNutritionPlanId, setSelectedNutritionPlanId] = useState<string>('np-1');

  // Workout State
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>(INITIAL_WORKOUT_PLANS);
  const [selectedWorkoutPlanId, setSelectedWorkoutPlanId] = useState<string>('wp-1');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Active Selected Nutrition Plan
  const activeNutritionPlan = useMemo(() => {
    return (
      nutritionPlans.find((p) => p.id === selectedNutritionPlanId) ||
      nutritionPlans[0] ||
      INITIAL_NUTRITION_PLANS[0]
    );
  }, [nutritionPlans, selectedNutritionPlanId]);

  // Active Selected Workout Plan
  const activeWorkoutPlan = useMemo(() => {
    return (
      workoutPlans.find((p) => p.id === selectedWorkoutPlanId) ||
      workoutPlans[0] ||
      INITIAL_WORKOUT_PLANS[0]
    );
  }, [workoutPlans, selectedWorkoutPlanId]);

  // Handler: Áp dụng Mẫu dinh dưỡng
  const handleApplyNutritionTemplate = (template: NutritionTemplate) => {
    const newPlan: NutritionPlan = {
      id: `np-${Date.now()}`,
      title: `${template.title} (Bản sao)`,
      status: 'ACTIVE',
      targetCalories: template.targetCalories,
      macros: { ...template.macros },
      createdAt: new Date().toLocaleDateString('vi-VN'),
      meals: JSON.parse(JSON.stringify(template.defaultMeals)),
    };

    setNutritionPlans((prev) => [newPlan, ...prev]);
    setSelectedNutritionPlanId(newPlan.id);
    toast.success(`Đã áp dụng mẫu "${template.title}" vào danh sách kế hoạch!`);
  };

  // Handler: Áp dụng Mẫu giáo án tập luyện
  const handleApplyWorkoutTemplate = (template: WorkoutTemplate) => {
    const newPlan: WorkoutPlan = {
      id: `wp-${Date.now()}`,
      title: `${template.title} (Bản sao)`,
      status: 'ACTIVE',
      sessionsPerWeek: template.sessionsPerWeek,
      durationMinutes: 60,
      createdAt: new Date().toLocaleDateString('vi-VN'),
      days: JSON.parse(JSON.stringify(template.days)),
    };

    setWorkoutPlans((prev) => [newPlan, ...prev]);
    setSelectedWorkoutPlanId(newPlan.id);
    toast.success(`Đã áp dụng mẫu giáo án "${template.title}"!`);
  };

  // Handler: Xóa kế hoạch dinh dưỡng
  const handleDeleteNutritionPlan = (id: string, title: string) => {
    if (nutritionPlans.length <= 1) {
      toast.error('Cần giữ lại ít nhất 1 kế hoạch mẫu!');
      return;
    }
    setNutritionPlans((prev) => prev.filter((p) => p.id !== id));
    if (selectedNutritionPlanId === id) {
      const remaining = nutritionPlans.filter((p) => p.id !== id);
      if (remaining.length > 0) setSelectedNutritionPlanId(remaining[0].id);
    }
    toast.success(`Đã xóa kế hoạch "${title}"`);
  };

  // Handler: Xóa giáo án tập luyện
  const handleDeleteWorkoutPlan = (id: string, title: string) => {
    if (workoutPlans.length <= 1) {
      toast.error('Cần giữ lại ít nhất 1 giáo án mẫu!');
      return;
    }
    setWorkoutPlans((prev) => prev.filter((p) => p.id !== id));
    if (selectedWorkoutPlanId === id) {
      const remaining = workoutPlans.filter((p) => p.id !== id);
      if (remaining.length > 0) setSelectedWorkoutPlanId(remaining[0].id);
    }
    toast.success(`Đã xóa giáo án "${title}"`);
  };

  // Handler: Xuất Excel (UTF-8 BOM CSV compatible with Excel)
  const handleExportExcel = () => {
    if (activeTab === 'NUTRITION') {
      const plan = activeNutritionPlan;
      const bom = '\uFEFF';
      let csvContent = bom + 'KẾ HOẠCH DINH DƯỠNG - ZENFIT\r\n';
      csvContent += `Tên kế hoạch:;${plan.title}\r\n`;
      csvContent += `Trạng thái:;Đang áp dụng\r\n`;
      csvContent += `Mục tiêu Calo:;${plan.targetCalories} kcal\r\n`;
      csvContent += `Tỷ lệ Macros:;Carb ${plan.macros.carb}% - Protein ${plan.macros.protein}% - Fat ${plan.macros.fat}%\r\n`;
      csvContent += `Ngày tạo:;${plan.createdAt}\r\n\r\n`;
      csvContent += 'Bữa ăn;Món ăn;Calo (kcal);Protein (g);Carb (g);Fat (g)\r\n';

      plan.meals.forEach((m) => {
        csvContent += `"${m.mealName}";"${m.foods}";${m.calories};${m.protein};${m.carb};${m.fat}\r\n`;
      });

      // Sum
      const totalCal = plan.meals.reduce((sum, m) => sum + m.calories, 0);
      const totalPro = plan.meals.reduce((sum, m) => sum + m.protein, 0);
      const totalCarb = plan.meals.reduce((sum, m) => sum + m.carb, 0);
      const totalFat = plan.meals.reduce((sum, m) => sum + m.fat, 0);
      csvContent += `"Tổng";"";${totalCal};${totalPro.toFixed(1)};${totalCarb.toFixed(1)};${totalFat.toFixed(1)}\r\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ZenFit_${plan.title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Đã xuất file Excel kế hoạch dinh dưỡng thành công!');
    } else {
      const plan = activeWorkoutPlan;
      const bom = '\uFEFF';
      let csvContent = bom + 'GIÁO ÁN TẬP LUYỆN - ZENFIT\r\n';
      csvContent += `Tên giáo án:;${plan.title}\r\n`;
      csvContent += `Số buổi:;${plan.sessionsPerWeek} buổi / tuần\r\n`;
      csvContent += `Thời lượng:;${plan.durationMinutes} phút / buổi\r\n\r\n`;
      csvContent += 'Buổi tập;Tên bài tập;Số hiệp (Sets x Reps);Cường độ & Nghỉ\r\n';

      plan.days.forEach((day) => {
        day.exercises.forEach((ex) => {
          csvContent += `"${day.dayName}";"${ex.exerciseName}";"${ex.setsReps}";"${ex.rpeRest}"\r\n`;
        });
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ZenFit_${plan.title.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Đã xuất file Excel giáo án tập luyện thành công!');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* ========================================================
          1. HEADER & TOP ACTIONS
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Kế hoạch & Giáo án
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Soạn giáo án tập luyện, dinh dưỡng, tái sử dụng mẫu và xuất Excel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Thêm kế hoạch mới (Emerald) */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-medium text-sm rounded-xl transition-all shadow-sm shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm kế hoạch mới</span>
          </button>

          {/* Nút Xuất Excel (Outline) */}
          <button
            type="button"
            onClick={handleExportExcel}
            title="Tải bảng kế hoạch dạng file Excel"
            className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:scale-[0.98] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-medium text-sm rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. NAVIGATION TABS (Giáo án Tập luyện | Kế hoạch Dinh dưỡng)
         ======================================================== */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-8 -mb-2">
        <button
          type="button"
          onClick={() => setActiveTab('WORKOUT')}
          className={`pb-2.5 text-sm transition-colors relative font-medium cursor-pointer ${
            activeTab === 'WORKOUT'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Giáo án Tập luyện</span>
          {activeTab === 'WORKOUT' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('NUTRITION')}
          className={`pb-2.5 text-sm transition-colors relative font-medium cursor-pointer ${
            activeTab === 'NUTRITION'
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <span>Kế hoạch Dinh dưỡng</span>
          {activeTab === 'NUTRITION' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
      </div>

      {/* ========================================================
          3. TAB CONTENT: KẾ HOẠCH DINH DƯỠNG (MATCHING SCREENSHOT)
         ======================================================== */}
      {activeTab === 'NUTRITION' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* SECTION: THƯ VIỆN MẪU */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Thư viện mẫu
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_NUTRITION_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-white dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#162338] rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all"
                >
                  {/* Thumbnail Image */}
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <img
                      src={tmpl.imageUrl}
                      alt={tmpl.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>

                  {/* Card Info & Action */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {tmpl.calorieEstimate}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleApplyNutritionTemplate(tmpl)}
                      className="mt-2.5 w-full py-1.5 px-3 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 transition-colors text-center cursor-pointer"
                    >
                      Sử dụng mẫu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: KẾ HOẠCH DINH DƯỠNG HIỆN TẠI */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Kế hoạch dinh dưỡng hiện tại
            </h2>

            <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200/80 dark:border-[#162338] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#162338] text-xs font-medium text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-5">Tên kế hoạch</th>
                      <th className="py-3.5 px-4 text-center">Trạng thái</th>
                      <th className="py-3.5 px-4 text-center">Mục tiêu Calo</th>
                      <th className="py-3.5 px-4">Tỷ lệ Macros</th>
                      <th className="py-3.5 px-4 text-center">Ngày tạo</th>
                      <th className="py-3.5 px-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#162338] text-sm">
                    {nutritionPlans.map((plan) => {
                      const isSelected = plan.id === selectedNutritionPlanId;
                      return (
                        <tr
                          key={plan.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          {/* Tên kế hoạch */}
                          <td className="py-4 px-5">
                            <div className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              <span>{plan.title}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                          </td>

                          {/* Trạng thái */}
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                              Đang áp dụng
                            </span>
                          </td>

                          {/* Mục tiêu Calo */}
                          <td className="py-4 px-4 text-center font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                            {plan.targetCalories} kcal
                          </td>

                          {/* Tỷ lệ Macros (3-Segmented Capsule matching screenshot) */}
                          <td className="py-4 px-4">
                            <div className="inline-flex items-center h-6 rounded-md overflow-hidden text-[11px] font-medium text-white shadow-2xs whitespace-nowrap">
                              <span className="bg-teal-500 dark:bg-teal-600 px-2 py-0.5 flex items-center h-full">
                                Carb {plan.macros.carb}%
                              </span>
                              <span className="bg-blue-600 dark:bg-blue-600 px-2 py-0.5 flex items-center h-full">
                                Protein {plan.macros.protein}%
                              </span>
                              <span className="bg-rose-400 dark:bg-rose-500 px-2 py-0.5 flex items-center h-full">
                                Fat {plan.macros.fat}%
                              </span>
                            </div>
                          </td>

                          {/* Ngày tạo */}
                          <td className="py-4 px-4 text-center text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {plan.createdAt}
                          </td>

                          {/* Thao tác */}
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5 text-slate-400">
                              {/* Sửa */}
                              <button
                                type="button"
                                title="Chỉnh sửa kế hoạch"
                                onClick={() => {
                                  setSelectedNutritionPlanId(plan.id);
                                  toast.info(`Chế độ xem kế hoạch: "${plan.title}"`);
                                }}
                                className="p-1 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Thực đơn */}
                              <button
                                type="button"
                                title="Xem và sửa thực đơn chi tiết"
                                onClick={() => {
                                  setSelectedNutritionPlanId(plan.id);
                                  toast.success(`Đang mở chi tiết thực đơn: "${plan.title}"`);
                                }}
                                className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                              >
                                <Utensils className="w-4 h-4" />
                              </button>

                              {/* Xóa */}
                              <button
                                type="button"
                                title="Xóa kế hoạch"
                                onClick={() => handleDeleteNutritionPlan(plan.id, plan.title)}
                                className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>

                              {/* Chi tiết */}
                              <button
                                type="button"
                                title="Xem chi tiết"
                                onClick={() => {
                                  setSelectedNutritionPlanId(plan.id);
                                  toast.success(`Hiển thị thực đơn: ${plan.title}`);
                                }}
                                className="p-1 hover:text-blue-500 transition-colors cursor-pointer"
                              >
                                <Search className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION: CHI TIẾT THỰC ĐƠN NGÀY */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Chi tiết thực đơn ngày (Demo bên dưới hoặc dạng popup/phân khu)
            </h2>

            <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200/80 dark:border-[#162338] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#162338] text-xs font-medium text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-6 w-[180px]">Bữa ăn</th>
                      <th className="py-3.5 px-4">Món ăn</th>
                      <th className="py-3.5 px-4 text-center w-[140px]">Calo</th>
                      <th className="py-3.5 px-4 text-center w-[100px]">Protein</th>
                      <th className="py-3.5 px-4 text-center w-[100px]">Carb</th>
                      <th className="py-3.5 px-6 text-center w-[100px]">Fat</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#162338] text-sm">
                    {/* Hàng 1: Bữa sáng */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        Bữa sáng
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        Bún bò, 1 quả trứng
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        450kcal
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        25.0
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        50.0
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-300 font-medium">
                        15.0
                      </td>
                    </tr>

                    {/* Hàng 2: Bữa phụ sáng */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        Bữa phụ sáng
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        Chuối, Sữa hạt
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        150kcal
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        1.6
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        0.0
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-300 font-medium">
                        0.3
                      </td>
                    </tr>

                    {/* Hàng 3: Bữa trưa */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        Bữa trưa
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        Cơm lút, Ức gà, Bông cải
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        600kcal
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        32.6
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        40.4
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-300 font-medium">
                        15.9
                      </td>
                    </tr>

                    {/* Hàng 4: Bữa phụ chiều */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        Bữa phụ chiều
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        Whey protein
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        150kcal
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        1.5
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        0.0
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-300 font-medium">
                        0.2
                      </td>
                    </tr>

                    {/* Hàng 5: Bữa tối */}
                    <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-6 font-medium text-slate-900 dark:text-white">
                        Bữa tối
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        Cá hồi, Khoai lang, Rau luộc
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-700 dark:text-slate-300 font-medium">
                        500kcal
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        20.2
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-600 dark:text-slate-300 font-medium">
                        10.3
                      </td>
                      <td className="py-3.5 px-6 text-center text-slate-600 dark:text-slate-300 font-medium">
                        12.8
                      </td>
                    </tr>

                    {/* Hàng 6: Tổng (Matching Screenshot values) */}
                    <tr className="font-semibold text-slate-900 dark:text-white bg-slate-50/60 dark:bg-slate-800/30">
                      <td className="py-4 px-6">Tổng</td>
                      <td className="py-4 px-4 text-slate-400"></td>
                      <td className="py-4 px-4 text-center text-slate-800 dark:text-slate-100">
                        450kcal
                      </td>
                      <td className="py-4 px-4 text-center text-slate-800 dark:text-slate-100">
                        39.1
                      </td>
                      <td className="py-4 px-4 text-center text-slate-800 dark:text-slate-100">
                        26.3
                      </td>
                      <td className="py-4 px-6 text-center text-slate-800 dark:text-slate-100">
                        52
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. TAB CONTENT: GIÁO ÁN TẬP LUYỆN
         ======================================================== */}
      {activeTab === 'WORKOUT' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* SECTION: THƯ VIỆN MẪU GIÁO ÁN */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Thư viện mẫu giáo án
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {INITIAL_WORKOUT_TEMPLATES.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="bg-white dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#162338] rounded-2xl p-3.5 flex items-center gap-3.5 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/60 transition-all"
                >
                  <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                    <img
                      src={tmpl.imageUrl}
                      alt={tmpl.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm truncate">
                      {tmpl.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {tmpl.description}
                    </p>
                    <button
                      type="button"
                      onClick={() => handleApplyWorkoutTemplate(tmpl)}
                      className="mt-2.5 w-full py-1.5 px-3 text-xs font-medium rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700 transition-colors text-center cursor-pointer"
                    >
                      Sử dụng mẫu
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION: GIÁO ÁN TẬP LUYỆN HIỆN TẠI */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Giáo án tập luyện hiện tại
            </h2>

            <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200/80 dark:border-[#162338] shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[#162338] text-xs font-medium text-slate-500 dark:text-slate-400">
                      <th className="py-3.5 px-5">Tên giáo án</th>
                      <th className="py-3.5 px-4 text-center">Trạng thái</th>
                      <th className="py-3.5 px-4 text-center">Tần suất</th>
                      <th className="py-3.5 px-4 text-center">Thời lượng</th>
                      <th className="py-3.5 px-4 text-center">Ngày tạo</th>
                      <th className="py-3.5 px-5 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#162338] text-sm">
                    {workoutPlans.map((plan) => {
                      const isSelected = plan.id === selectedWorkoutPlanId;
                      return (
                        <tr
                          key={plan.id}
                          className={`transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/30 dark:bg-emerald-950/20'
                              : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="py-4 px-5">
                            <div className="font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                              <span>{plan.title}</span>
                              {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/50">
                              Đang áp dụng
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-200">
                            {plan.sessionsPerWeek} buổi / tuần
                          </td>
                          <td className="py-4 px-4 text-center text-slate-700 dark:text-slate-200">
                            {plan.durationMinutes} phút
                          </td>
                          <td className="py-4 px-4 text-center text-xs text-slate-600 dark:text-slate-400">
                            {plan.createdAt}
                          </td>
                          <td className="py-4 px-5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5 text-slate-400">
                              <button
                                type="button"
                                title="Xem chi tiết giáo án"
                                onClick={() => {
                                  setSelectedWorkoutPlanId(plan.id);
                                  toast.info(`Xem chi tiết giáo án: "${plan.title}"`);
                                }}
                                className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                              >
                                <Dumbbell className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                title="Xóa giáo án"
                                onClick={() => handleDeleteWorkoutPlan(plan.id, plan.title)}
                                className="p-1 hover:text-rose-500 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION: CHI TIẾT CÁC BÀI TẬP TRONG TUẦN */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Chi tiết các buổi tập & bài tập trong giáo án
            </h2>

            <div className="space-y-4">
              {activeWorkoutPlan.days.map((day) => (
                <div
                  key={day.id}
                  className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200/80 dark:border-[#162338] shadow-xs overflow-hidden"
                >
                  <div className="px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900/40 border-b border-slate-100 dark:border-[#162338] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                        {day.dayName}
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Nhóm cơ: {day.targetMuscle}
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-[#162338] text-xs font-medium text-slate-500 dark:text-slate-400">
                          <th className="py-3 px-5">Tên bài tập</th>
                          <th className="py-3 px-4 text-center">Khối lượng & Số hiệp</th>
                          <th className="py-3 px-4 text-center">Cường độ & Nghỉ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-[#162338]">
                        {day.exercises.map((ex) => (
                          <tr
                            key={ex.id}
                            className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                          >
                            <td className="py-3 px-5 font-medium text-slate-800 dark:text-slate-200">
                              {ex.exerciseName}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                              {ex.setsReps}
                            </td>
                            <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-300">
                              {ex.rpeRest}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. MODAL TẠO KẾ HOẠCH MỚI
         ======================================================== */}
      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultTab={activeTab}
        clients={clients.map((c) => ({ id: c.id, fullName: c.fullName }))}
        onCreateNutritionPlan={(newPlan) => {
          const created: NutritionPlan = {
            ...newPlan,
            id: `np-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('vi-VN'),
          };
          setNutritionPlans((prev) => [created, ...prev]);
          setSelectedNutritionPlanId(created.id);
          setActiveTab('NUTRITION');
        }}
        onCreateWorkoutPlan={(newPlan) => {
          const created: WorkoutPlan = {
            ...newPlan,
            id: `wp-${Date.now()}`,
            createdAt: new Date().toLocaleDateString('vi-VN'),
          };
          setWorkoutPlans((prev) => [created, ...prev]);
          setSelectedWorkoutPlanId(created.id);
          setActiveTab('WORKOUT');
        }}
      />
    </div>
  );
}
