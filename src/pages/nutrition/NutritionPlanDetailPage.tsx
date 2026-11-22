import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  User,
  Flame,
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  Sparkles,
  AlertTriangle,
  RefreshCw,
  Sliders,
  TrendingUp,
  FileSpreadsheet,
} from 'lucide-react';
import { toast } from 'sonner';
import { nutritionPlanService } from '../../services/nutritionPlanService';
import { exportNutritionPlanToExcel } from '../../utils/exportNutritionExcel';
import type {
  NutritionPlan,
  NutritionFood,
  MealType,
  NutritionMacroSummary,
} from '../../types/nutrition';
import {
  MEAL_TYPES,
  MEAL_TYPE_CONFIG,
  NUTRITION_PLAN_STATUS_CONFIG,
} from '../../types/nutrition';
import FoodModal from '../../components/nutrition/FoodModal';
import MacroTargetModal from '../../components/nutrition/MacroTargetModal';
import NutritionPlanModal from '../../components/nutrition/NutritionPlanModal';

export default function NutritionPlanDetailPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  // State
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [macroSummary, setMacroSummary] = useState<NutritionMacroSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState<boolean>(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState<boolean>(false);
  const [selectedMealTypeForFood, setSelectedMealTypeForFood] = useState<MealType>('BREAKFAST');
  const [selectedFoodToEdit, setSelectedFoodToEdit] = useState<NutritionFood | null>(null);

  // Delete states
  const [foodToDelete, setFoodToDelete] = useState<NutritionFood | null>(null);
  const [isDeletingFood, setIsDeletingFood] = useState<boolean>(false);
  const [isDeletePlanModalOpen, setIsDeletePlanModalOpen] = useState<boolean>(false);
  const [isDeletingPlan, setIsDeletingPlan] = useState<boolean>(false);

  // Load plan detail
  const loadPlanDetail = useCallback(async (showRefreshing = false) => {
    if (!planId) return;
    try {
      if (showRefreshing) setRefreshing(true);
      else setLoading(true);

      const data = await nutritionPlanService.getPlanDetail(planId);
      setPlan(data);

      // Try fetching fresh macro summary or use what's inside plan
      if (data.macroSummary) {
        setMacroSummary(data.macroSummary);
      } else {
        try {
          const summary = await nutritionPlanService.getMacroSummary(planId);
          setMacroSummary(summary);
        } catch {
          // If endpoint fails, will compute locally
        }
      }
    } catch (err) {
      console.error('Fetch plan detail error:', err);
      toast.error('Không thể tải chi tiết kế hoạch dinh dưỡng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [planId]);

  useEffect(() => {
    loadPlanDetail();
  }, [loadPlanDetail]);

  // Compute local macro summary as fallback or real-time sync
  const computedSummary = useMemo((): NutritionMacroSummary => {
    const target = plan?.dailyMacroTarget || {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 60,
    };

    const foods = plan?.foods || [];
    const totalCal = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
    const totalP = foods.reduce((acc, f) => acc + (f.protein || 0), 0);
    const totalC = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
    const totalF = foods.reduce((acc, f) => acc + (f.fat || 0), 0);

    return {
      targetCalories: target.calories,
      targetProtein: target.protein,
      targetCarbs: target.carbs,
      targetFat: target.fat,
      totalCalories: totalCal,
      totalProtein: Math.round(totalP * 10) / 10,
      totalCarbs: Math.round(totalC * 10) / 10,
      totalFat: Math.round(totalF * 10) / 10,
      caloriesPercentage: target.calories > 0 ? Math.round((totalCal / target.calories) * 100) : 0,
      proteinPercentage: target.protein > 0 ? Math.round((totalP / target.protein) * 100) : 0,
      carbsPercentage: target.carbs > 0 ? Math.round((totalC / target.carbs) * 100) : 0,
      fatPercentage: target.fat > 0 ? Math.round((totalF / target.fat) * 100) : 0,
    };
  }, [plan]);

  const activeSummary = macroSummary || computedSummary;

  // Handle open add food modal
  const handleOpenAddFood = (mealType: MealType) => {
    setSelectedMealTypeForFood(mealType);
    setSelectedFoodToEdit(null);
    setIsFoodModalOpen(true);
  };

  // Handle open edit food modal
  const handleOpenEditFood = (food: NutritionFood) => {
    setSelectedMealTypeForFood(food.mealType);
    setSelectedFoodToEdit(food);
    setIsFoodModalOpen(true);
  };

  // Handle food deletion
  const handleDeleteFood = async () => {
    if (!plan || !foodToDelete) return;
    try {
      setIsDeletingFood(true);
      await nutritionPlanService.deleteFood(plan.id, foodToDelete.id);
      toast.success(`Đã xóa món "${foodToDelete.foodName}" khỏi thực đơn`);
      setFoodToDelete(null);
      // Reload detail to keep macroSummary in sync with backend
      await loadPlanDetail(true);
    } catch (err: unknown) {
      console.error('Delete food error:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Không thể xóa món ăn. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsDeletingFood(false);
    }
  };

  // Handle plan deletion
  const handleDeletePlan = async () => {
    if (!plan) return;
    try {
      setIsDeletingPlan(true);
      await nutritionPlanService.deletePlan(plan.id);
      toast.success(`Đã xóa kế hoạch "${plan.name}"`);
      navigate('/pt/nutrition-plans');
    } catch (err: unknown) {
      console.error('Delete plan error:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Không thể xóa kế hoạch. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsDeletingPlan(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Đang tải thông tin kế hoạch dinh dưỡng...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#070e17] text-slate-100 p-6 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy kế hoạch dinh dưỡng</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Kế hoạch này có thể đã bị xóa hoặc bạn không có quyền truy cập.
        </p>
        <Link
          to="/pt/nutrition-plans"
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition-colors"
        >
          Quay lại danh sách kế hoạch
        </Link>
      </div>
    );
  }

  const statusConfig = NUTRITION_PLAN_STATUS_CONFIG[plan.status] || {
    label: plan.status,
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/pt/nutrition-plans')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Danh sách kế hoạch</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadPlanDetail(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              if (plan) {
                exportNutritionPlanToExcel(plan, plan.clientName);
                toast.success('Đã xuất file Excel kế hoạch dinh dưỡng thành công!');
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Xuất file Excel kế hoạch dinh dưỡng"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất file Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPlanModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa kế hoạch</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDeletePlanModalOpen(true)}
            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
            title="Xóa kế hoạch"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Plan Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-slate-900/90 via-[#0e192c] to-[#0a1526] border border-slate-800/90 p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.badgeClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                {statusConfig.label}
              </span>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <User className="w-3.5 h-3.5" />
                <span>Học viên: <b>{plan.clientName || 'Chưa gán'}</b></span>
              </div>

              {(plan.startDate || plan.endDate) && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800/60 border border-slate-700/60 text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    {plan.startDate ? new Date(plan.startDate).toLocaleDateString('vi-VN') : '---'}{' '}
                    đến{' '}
                    {plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : '---'}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {plan.name}
            </h1>

            {plan.description && (
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {plan.description}
              </p>
            )}
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            <div className="text-left md:text-right">
              <span className="text-xs text-slate-400 block">Tổng món ăn trong thực đơn</span>
              <span className="text-2xl sm:text-3xl font-black text-white">
                {plan.foods?.length || 0} <span className="text-xs text-slate-500 font-normal">món</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsMacroModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Chỉnh sửa Macro mục tiêu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 1: Dashboard Thống kê Macro trong ngày */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Thống kê Dinh dưỡng trong ngày (Macro Dashboard)
            </h2>
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Tổng hợp theo thời gian thực từ 6 bữa ăn
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Calories Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#121c2c] border border-amber-500/20 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Năng lượng (Calo)
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {activeSummary.totalCalories}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {activeSummary.targetCalories} kcal
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {activeSummary.totalCalories >= activeSummary.targetCalories
                  ? `Đạt ${activeSummary.caloriesPercentage}% mục tiêu calo`
                  : `Còn thiếu ${Math.max(0, activeSummary.targetCalories - activeSummary.totalCalories)} kcal`}
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeSummary.caloriesPercentage > 110
                      ? 'bg-rose-500'
                      : activeSummary.caloriesPercentage >= 90
                      ? 'bg-emerald-400'
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${Math.min(activeSummary.caloriesPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0 kcal</span>
                <span>{activeSummary.caloriesPercentage}%</span>
                <span>{activeSummary.targetCalories} kcal</span>
              </div>
            </div>
          </div>

          {/* 2. Protein Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#121c2c] border border-blue-500/20 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Chất Đạm (Protein)
              </span>
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {activeSummary.totalProtein}g
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {activeSummary.targetProtein}g
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cung cấp {Math.round(activeSummary.totalProtein * 4)} kcal năng lượng
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${Math.min(activeSummary.proteinPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0g</span>
                <span>{activeSummary.proteinPercentage}%</span>
                <span>{activeSummary.targetProtein}g</span>
              </div>
            </div>
          </div>

          {/* 3. Carbs Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#121c2c] border border-emerald-500/20 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Tinh Bột (Carbs)
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {activeSummary.totalCarbs}g
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {activeSummary.targetCarbs}g
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cung cấp {Math.round(activeSummary.totalCarbs * 4)} kcal năng lượng
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${Math.min(activeSummary.carbsPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0g</span>
                <span>{activeSummary.carbsPercentage}%</span>
                <span>{activeSummary.targetCarbs}g</span>
              </div>
            </div>
          </div>

          {/* 4. Fat Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900/90 to-[#121c2c] border border-rose-500/20 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Chất Béo (Fat)
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {activeSummary.totalFat}g
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  / {activeSummary.targetFat}g
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Cung cấp {Math.round(activeSummary.totalFat * 9)} kcal năng lượng
              </p>
            </div>

            <div className="space-y-1">
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-rose-400 transition-all duration-500"
                  style={{ width: `${Math.min(activeSummary.fatPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>0g</span>
                <span>{activeSummary.fatPercentage}%</span>
                <span>{activeSummary.targetFat}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Thực đơn 6 bữa ăn trong ngày */}
      <div className="space-y-6 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
              <span>Thực đơn 6 bữa ăn trong ngày</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Phân bổ dinh dưỡng theo từng thời điểm trong ngày giúp học viên hấp thụ tối ưu
            </p>
          </div>
        </div>

        {/* 6 Meals List */}
        <div className="space-y-5">
          {MEAL_TYPES.map((mealType) => {
            const config = MEAL_TYPE_CONFIG[mealType];
            const mealFoods = (plan.foods || []).filter((f) => f.mealType === mealType);

            // Calculate meal subtotals
            const mealCalories = mealFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
            const mealP = Math.round(mealFoods.reduce((acc, f) => acc + (f.protein || 0), 0) * 10) / 10;
            const mealC = Math.round(mealFoods.reduce((acc, f) => acc + (f.carbs || 0), 0) * 10) / 10;
            const mealF = Math.round(mealFoods.reduce((acc, f) => acc + (f.fat || 0), 0) * 10) / 10;

            return (
              <div
                key={mealType}
                className="rounded-2xl bg-gradient-to-b from-slate-900/80 to-[#0c1626] border border-slate-800/80 shadow-md overflow-hidden"
              >
                {/* Meal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 bg-slate-900/50 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" role="img" aria-label={config.label}>
                      {config.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">{config.label}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${config.badgeClass}`}
                        >
                          {mealFoods.length} món
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{config.desc}</p>
                    </div>
                  </div>

                  {/* Subtotal & Add Button */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {mealFoods.length > 0 && (
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                        <span className="font-bold text-amber-400">{mealCalories} kcal</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-blue-400">{mealP}g P</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-400">{mealC}g C</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-rose-400">{mealF}g F</span>
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenAddFood(mealType)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm món</span>
                    </button>
                  </div>
                </div>

                {/* Foods List / Table */}
                {mealFoods.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    <p>Chưa có món ăn nào trong bữa này.</p>
                    <button
                      type="button"
                      onClick={() => handleOpenAddFood(mealType)}
                      className="mt-2 text-emerald-400 hover:underline inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm món ăn đầu tiên</span>
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-950/40 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800/60">
                        <tr>
                          <th className="px-5 py-3 font-semibold">Tên món ăn & Ghi chú</th>
                          <th className="px-4 py-3 font-semibold">Định lượng</th>
                          <th className="px-4 py-3 font-semibold text-right">Calo</th>
                          <th className="px-4 py-3 font-semibold text-right">Đạm</th>
                          <th className="px-4 py-3 font-semibold text-right">Carbs</th>
                          <th className="px-4 py-3 font-semibold text-right">Chất béo</th>
                          <th className="px-5 py-3 font-semibold text-center w-20">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40">
                        {mealFoods.map((food) => (
                          <tr key={food.id} className="hover:bg-slate-800/20 transition-colors">
                            {/* Food name & note */}
                            <td className="px-5 py-3.5">
                              <span className="font-bold text-white text-sm block">
                                {food.foodName}
                              </span>
                              {food.note && (
                                <span className="text-[11px] text-slate-400 italic block mt-0.5">
                                  {food.note}
                                </span>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-slate-200 font-medium">
                              {food.quantity} {food.unit || ''}
                            </td>

                            {/* Calories */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right font-bold text-amber-400">
                              {food.calories} kcal
                            </td>

                            {/* Protein */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right text-blue-400 font-semibold">
                              {food.protein}g
                            </td>

                            {/* Carbs */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right text-emerald-400 font-semibold">
                              {food.carbs}g
                            </td>

                            {/* Fat */}
                            <td className="px-4 py-3.5 whitespace-nowrap text-right text-rose-400 font-semibold">
                              {food.fat}g
                            </td>

                            {/* Actions */}
                            <td className="px-5 py-3.5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditFood(food)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                                  title="Chỉnh sửa món"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFoodToDelete(food)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                  title="Xóa món"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal chỉnh sửa thông tin Kế hoạch */}
      <NutritionPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        planToEdit={plan}
        onSaved={(updated) => {
          setPlan(updated);
          loadPlanDetail(true);
        }}
      />

      {/* Modal chỉnh sửa Macro mục tiêu */}
      <MacroTargetModal
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        planId={plan.id}
        currentTarget={plan.dailyMacroTarget}
        onUpdated={(updatedTarget) => {
          setPlan((prev) => (prev ? { ...prev, dailyMacroTarget: updatedTarget } : null));
          loadPlanDetail(true);
        }}
      />

      {/* Modal Thêm / Sửa món ăn */}
      <FoodModal
        isOpen={isFoodModalOpen}
        onClose={() => {
          setIsFoodModalOpen(false);
          setSelectedFoodToEdit(null);
        }}
        planId={plan.id}
        defaultMealType={selectedMealTypeForFood}
        foodToEdit={selectedFoodToEdit}
        onSaved={() => {
          loadPlanDetail(true);
        }}
      />

      {/* Modal Xác nhận xóa món ăn */}
      {foodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c1523] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa món ăn</h3>
                <p className="text-xs text-slate-400">Món ăn sẽ bị loại khỏi bữa này</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Bạn có chắc chắn muốn xóa món{' '}
              <span className="font-semibold text-white">"{foodToDelete.foodName}"</span> khỏi thực
              đơn?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setFoodToDelete(null)}
                disabled={isDeletingFood}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteFood}
                disabled={isDeletingFood}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingFood ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa món</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xác nhận xóa Kế hoạch */}
      {isDeletePlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0c1523] border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa kế hoạch</h3>
                <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-sm text-slate-300">
              Bạn có chắc chắn muốn xóa kế hoạch{' '}
              <span className="font-semibold text-white">"{plan.name}"</span>? Mọi thực đơn và thống
              kê macro của kế hoạch này sẽ bị xóa hoàn toàn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsDeletePlanModalOpen(false)}
                disabled={isDeletingPlan}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                disabled={isDeletingPlan}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingPlan ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xóa...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xác nhận xóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
