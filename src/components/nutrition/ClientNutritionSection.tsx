import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  UtensilsCrossed,
  Plus,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Sliders,
  ExternalLink,
  Flame,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { nutritionPlanService } from '../../services/nutritionPlanService';
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
import FoodModal from './FoodModal';
import MacroTargetModal from './MacroTargetModal';
import NutritionPlanModal from './NutritionPlanModal';
import { exportNutritionPlanToExcel } from '../../utils/exportNutritionExcel';

interface ClientNutritionSectionProps {
  clientId: string;
  clientName: string;
}

export default function ClientNutritionSection({
  clientId,
  clientName,
}: ClientNutritionSectionProps) {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState<boolean>(false);
  const [isMacroModalOpen, setIsMacroModalOpen] = useState<boolean>(false);
  const [isFoodModalOpen, setIsFoodModalOpen] = useState<boolean>(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>('BREAKFAST');
  const [selectedFoodToEdit, setSelectedFoodToEdit] = useState<NutritionFood | null>(null);

  // Delete state
  const [foodToDelete, setFoodToDelete] = useState<NutritionFood | null>(null);
  const [isDeletingFood, setIsDeletingFood] = useState<boolean>(false);

  // Fetch client's nutrition plan
  const fetchClientPlan = useCallback(
    async (showRefreshing = false) => {
      if (!clientId) return;
      try {
        if (showRefreshing) setRefreshing(true);
        else setLoading(true);

        const plans = await nutritionPlanService.getClientPlans(clientId);
        if (plans && plans.length > 0) {
          // Lấy kế hoạch active hoặc kế hoạch mới nhất
          const activePlan = plans.find((p) => p.status === 'ACTIVE') || plans[0];
          // Gọi lấy chi tiết kế hoạch để đảm bảo đầy đủ danh sách foods và macroSummary
          const fullDetail = await nutritionPlanService.getPlanDetail(activePlan.id);
          setPlan(fullDetail);
        } else {
          setPlan(null);
        }
      } catch (err) {
        console.error('Fetch client nutrition plan error:', err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [clientId]
  );

  useEffect(() => {
    fetchClientPlan();
  }, [fetchClientPlan]);

  // Real-time macro summary calculation
  const macroSummary = useMemo((): NutritionMacroSummary => {
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

  // Xử lý mở modal thêm món
  const handleOpenAddFood = (mealType: MealType) => {
    setSelectedMealType(mealType);
    setSelectedFoodToEdit(null);
    setIsFoodModalOpen(true);
  };

  // Xử lý mở modal sửa món
  const handleOpenEditFood = (food: NutritionFood) => {
    setSelectedMealType(food.mealType);
    setSelectedFoodToEdit(food);
    setIsFoodModalOpen(true);
  };

  // Xử lý xóa món ăn
  const handleDeleteFood = async () => {
    if (!plan || !foodToDelete) return;
    try {
      setIsDeletingFood(true);
      await nutritionPlanService.deleteFood(plan.id, foodToDelete.id);
      toast.success(`Đã xóa món "${foodToDelete.foodName}" khỏi thực đơn`);
      setFoodToDelete(null);
      await fetchClientPlan(true);
    } catch (err: unknown) {
      console.error('Delete food error:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa món ăn. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsDeletingFood(false);
    }
  };

  // Xuất Excel
  const handleExportExcel = () => {
    if (!plan) return;
    try {
      exportNutritionPlanToExcel(plan, clientName);
      toast.success('Đã xuất file Excel thực đơn dinh dưỡng thành công!');
    } catch (err) {
      console.error('Export Excel error:', err);
      toast.error('Có lỗi khi tạo file Excel. Vui lòng thử lại.');
    }
  };

  if (loading) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-8 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Đang tải thông tin dinh dưỡng của học viên...
        </p>
      </div>
    );
  }

  // TRƯỜNG HỢP 1: Học viên chưa có kế hoạch dinh dưỡng nào
  if (!plan) {
    return (
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
          <UtensilsCrossed className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Chưa có Kế hoạch Dinh dưỡng & Thực đơn
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Học viên <b>{clientName}</b> chưa được gán chế độ ăn. Hãy thiết lập mục tiêu Calo,
            Macro và thực đơn 6 bữa để học viên áp dụng.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thiết lập Kế hoạch Dinh dưỡng cho {clientName}</span>
        </button>

        <NutritionPlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          defaultClientId={clientId}
          onSaved={(newPlan) => {
            setPlan(newPlan);
            fetchClientPlan(true);
          }}
        />
      </div>
    );
  }

  const statusConfig = NUTRITION_PLAN_STATUS_CONFIG[plan.status] || {
    label: plan.status,
    badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 sm:p-7 space-y-6 shadow-sm">
      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Kế Hoạch Dinh Dưỡng & Thực Đơn
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusConfig.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
              {statusConfig.label}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kế hoạch: <span className="font-semibold text-slate-800 dark:text-slate-200">{plan.name}</span>
            {plan.startDate && (
              <>
                {' '}
                • Từ {new Date(plan.startDate).toLocaleDateString('vi-VN')} đến{' '}
                {plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : '---'}
              </>
            )}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => fetchClientPlan(true)}
            disabled={refreshing}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="Làm mới thực đơn"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleExportExcel}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition cursor-pointer"
            title="Xuất file Excel cho học viên"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsMacroModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sửa Macro</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditPlanModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa Kế hoạch</span>
          </button>

          <Link
            to={`/pt/nutrition-plans/${plan.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
            title="Mở toàn màn hình quản lý chuyên sâu"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Toàn màn hình</span>
          </Link>
        </div>
      </div>

      {/* Real-time Macro Dashboard (4 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Calories Card */}
        <div className="p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-2">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Calo ngày</span>
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {macroSummary.totalCalories}
              </span>
              <span className="text-[11px] text-slate-400">/ {macroSummary.targetCalories} kcal</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  macroSummary.caloriesPercentage > 110
                    ? 'bg-rose-500'
                    : macroSummary.caloriesPercentage >= 90
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(macroSummary.caloriesPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Đạt {macroSummary.caloriesPercentage}% mục tiêu
            </span>
          </div>
        </div>

        {/* Protein Card */}
        <div className="p-4 rounded-2xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-2">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Đạm (Protein)</span>
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {macroSummary.totalProtein}g
              </span>
              <span className="text-[11px] text-slate-400">/ {macroSummary.targetProtein}g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-blue-500 transition-all duration-500"
                style={{ width: `${Math.min(macroSummary.proteinPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Đạt {macroSummary.proteinPercentage}% ({Math.round(macroSummary.totalProtein * 4)} kcal)
            </span>
          </div>
        </div>

        {/* Carbs Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Carbs (Tinh bột)</span>
            <TrendingUp className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {macroSummary.totalCarbs}g
              </span>
              <span className="text-[11px] text-slate-400">/ {macroSummary.targetCarbs}g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${Math.min(macroSummary.carbsPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Đạt {macroSummary.carbsPercentage}% ({Math.round(macroSummary.totalCarbs * 4)} kcal)
            </span>
          </div>
        </div>

        {/* Fat Card */}
        <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-500/10 border border-rose-500/20 space-y-2">
          <div className="flex items-center justify-between text-rose-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Chất béo (Fat)</span>
            <UtensilsCrossed className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 dark:text-white">
                {macroSummary.totalFat}g
              </span>
              <span className="text-[11px] text-slate-400">/ {macroSummary.targetFat}g</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden mt-1.5">
              <div
                className="h-full rounded-full bg-rose-500 transition-all duration-500"
                style={{ width: `${Math.min(macroSummary.fatPercentage, 100)}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 block mt-1">
              Đạt {macroSummary.fatPercentage}% ({Math.round(macroSummary.totalFat * 9)} kcal)
            </span>
          </div>
        </div>
      </div>

      {/* 6 Meals Breakdown & Foods Table */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
          <span>Thực đơn chi tiết 6 bữa ăn:</span>
          <span className="text-xs font-normal text-slate-400">
            {plan.foods?.length || 0} món ăn đã lên lịch
          </span>
        </h4>

        <div className="space-y-3.5">
          {MEAL_TYPES.map((mealType) => {
            const config = MEAL_TYPE_CONFIG[mealType];
            const mealFoods = (plan.foods || []).filter((f) => f.mealType === mealType);

            const mealCal = mealFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
            const mealP = Math.round(mealFoods.reduce((acc, f) => acc + (f.protein || 0), 0) * 10) / 10;
            const mealC = Math.round(mealFoods.reduce((acc, f) => acc + (f.carbs || 0), 0) * 10) / 10;
            const mealF = Math.round(mealFoods.reduce((acc, f) => acc + (f.fat || 0), 0) * 10) / 10;

            return (
              <div
                key={mealType}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#07111e] overflow-hidden"
              >
                {/* Meal Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-slate-100/70 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{config.emoji}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {config.label}
                    </span>
                    <span className="text-[10px] text-slate-400 hidden sm:inline">
                      ({config.desc})
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {mealFoods.length > 0 && (
                      <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                        <span className="text-amber-500 font-bold">{mealCal} kcal</span> • {mealP}g P • {mealC}g C • {mealF}g F
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleOpenAddFood(mealType)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Thêm món</span>
                    </button>
                  </div>
                </div>

                {/* Foods Table */}
                {mealFoods.length === 0 ? (
                  <div className="p-3.5 text-center text-[11px] text-slate-400">
                    Chưa có món ăn trong bữa này.{' '}
                    <button
                      type="button"
                      onClick={() => handleOpenAddFood(mealType)}
                      className="text-emerald-500 hover:underline font-semibold cursor-pointer ml-1"
                    >
                      + Thêm món ngay
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
                      <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-100/50 dark:bg-slate-900/20 border-b border-slate-200 dark:border-slate-800/60">
                        <tr>
                          <th className="px-4 py-2 font-medium">Tên món ăn</th>
                          <th className="px-3 py-2 font-medium">Định lượng</th>
                          <th className="px-3 py-2 font-medium text-right">Calo</th>
                          <th className="px-3 py-2 font-medium text-right">Đạm</th>
                          <th className="px-3 py-2 font-medium text-right">Carb</th>
                          <th className="px-3 py-2 font-medium text-right">Béo</th>
                          <th className="px-3 py-2 font-medium text-center w-16">Thao tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/40">
                        {mealFoods.map((food) => (
                          <tr
                            key={food.id}
                            className="hover:bg-slate-100/50 dark:hover:bg-slate-800/20 transition-colors"
                          >
                            <td className="px-4 py-2.5">
                              <span className="font-semibold text-slate-900 dark:text-white block">
                                {food.foodName}
                              </span>
                              {food.note && (
                                <span className="text-[10px] text-slate-400 italic block">
                                  {food.note}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                              {food.quantity} {food.unit || 'g'}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-right font-bold text-amber-500">
                              {food.calories}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-right text-blue-500 font-medium">
                              {food.protein}g
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-right text-emerald-500 font-medium">
                              {food.carbs}g
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-right text-rose-500 font-medium">
                              {food.fat}g
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditFood(food)}
                                  className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                                  title="Sửa món"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setFoodToDelete(food)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 transition cursor-pointer"
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

      {/* Modal Chỉnh sửa thông tin Kế hoạch */}
      <NutritionPlanModal
        isOpen={isEditPlanModalOpen}
        onClose={() => setIsEditPlanModalOpen(false)}
        planToEdit={plan}
        onSaved={(updated) => {
          setPlan(updated);
          fetchClientPlan(true);
        }}
      />

      {/* Modal Chỉnh sửa Macro mục tiêu */}
      <MacroTargetModal
        isOpen={isMacroModalOpen}
        onClose={() => setIsMacroModalOpen(false)}
        planId={plan.id}
        currentTarget={plan.dailyMacroTarget}
        onUpdated={(updatedTarget) => {
          setPlan((prev) => (prev ? { ...prev, dailyMacroTarget: updatedTarget } : null));
          fetchClientPlan(true);
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
        defaultMealType={selectedMealType}
        foodToEdit={selectedFoodToEdit}
        onSaved={() => {
          fetchClientPlan(true);
        }}
      />

      {/* Modal xác nhận xóa món ăn */}
      {foodToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 space-y-3">
            <div className="flex items-center gap-2.5 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Xác nhận xóa món ăn
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Bạn có chắc chắn muốn xóa món{' '}
              <strong className="text-slate-900 dark:text-white">"{foodToDelete.foodName}"</strong>{' '}
              khỏi thực đơn của học viên {clientName}?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setFoodToDelete(null)}
                disabled={isDeletingFood}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDeleteFood}
                disabled={isDeletingFood}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {isDeletingFood ? 'Đang xóa...' : 'Xóa món'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

