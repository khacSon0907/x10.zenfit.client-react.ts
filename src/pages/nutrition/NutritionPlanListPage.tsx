import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  Plus,
  Search,
  Calendar,
  User,
  Flame,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { nutritionPlanService } from '../../services/nutritionPlanService';
import type { NutritionPlan, NutritionPlanStatus } from '../../types/nutrition';
import { NUTRITION_PLAN_STATUS_CONFIG } from '../../types/nutrition';
import NutritionPlanModal from '../../components/nutrition/NutritionPlanModal';

export default function NutritionPlanListPage() {
  const navigate = useNavigate();

  // State
  const [plans, setPlans] = useState<NutritionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<NutritionPlan | null>(null);

  // Delete dialog state
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<NutritionPlan | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await nutritionPlanService.getMyPlans();
      setPlans(data);
    } catch (err) {
      console.error('Fetch nutrition plans error:', err);
      toast.error('Không thể tải danh sách kế hoạch dinh dưỡng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Status filter
      if (statusFilter !== 'ALL' && plan.status !== statusFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchName = plan.name?.toLowerCase().includes(query);
        const matchClient = plan.clientName?.toLowerCase().includes(query);
        const matchDesc = plan.description?.toLowerCase().includes(query);
        return matchName || matchClient || matchDesc;
      }
      return true;
    });
  }, [plans, statusFilter, searchQuery]);

  // Handle delete
  const handleDeletePlan = async () => {
    if (!deleteConfirmPlan) return;
    try {
      setIsDeleting(true);
      await nutritionPlanService.deletePlan(deleteConfirmPlan.id);
      toast.success(`Đã xóa kế hoạch "${deleteConfirmPlan.name}"`);
      setPlans((prev) => prev.filter((p) => p.id !== deleteConfirmPlan.id));
      setDeleteConfirmPlan(null);
    } catch (err: unknown) {
      console.error('Delete plan error:', err);
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Không thể xóa kế hoạch. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSavedPlan = (savedPlan: NutritionPlan) => {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPlan.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedPlan;
        return updated;
      }
      return [savedPlan, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-md">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Kế hoạch Dinh dưỡng
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Quản lý mục tiêu Macro, thiết lập thực đơn 6 bữa ăn và theo dõi lượng calo nạp của học viên
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPlans}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPlanToEdit(null);
              setIsPlanModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo kế hoạch mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên kế hoạch, tên học viên..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Tất cả ({plans.length})
          </button>
          {(Object.keys(NUTRITION_PLAN_STATUS_CONFIG) as NutritionPlanStatus[]).map((statusKey) => {
            const config = NUTRITION_PLAN_STATUS_CONFIG[statusKey];
            const count = plans.filter((p) => p.status === statusKey).length;
            const isSelected = statusFilter === statusKey;
            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => setStatusFilter(statusKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isSelected
                    ? `${config.badgeClass} border`
                    : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-slate-900/40 border border-slate-800/80 animate-pulse p-6 space-y-4"
            >
              <div className="h-5 bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded-md w-1/2" />
              <div className="h-20 bg-slate-800/40 rounded-xl" />
              <div className="h-8 bg-slate-800/50 rounded-lg w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl text-center">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Không tìm thấy kế hoạch phù hợp'
              : 'Chưa có kế hoạch dinh dưỡng nào'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc trạng thái.'
              : 'Bắt đầu tạo kế hoạch dinh dưỡng đầu tiên để thiết lập chế độ ăn khoa học cho học viên.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (searchQuery || statusFilter !== 'ALL') {
                setSearchQuery('');
                setStatusFilter('ALL');
              } else {
                setSelectedPlanToEdit(null);
                setIsPlanModalOpen(true);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            {searchQuery || statusFilter !== 'ALL' ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Tạo kế hoạch đầu tiên</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const statusConfig = NUTRITION_PLAN_STATUS_CONFIG[plan.status] || {
              label: plan.status,
              badgeClass: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
              dotClass: 'bg-slate-400',
            };

            const targetCal = plan.dailyMacroTarget?.calories || plan.macroSummary?.targetCalories || 0;
            const totalCal = plan.macroSummary?.totalCalories || 0;
            const calPercent = targetCal > 0 ? Math.round((totalCal / targetCal) * 100) : 0;

            const foodsCount = plan.foods?.length || 0;

            return (
              <div
                key={plan.id}
                className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/80 to-[#0c1626] border border-slate-800/80 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-5 space-y-4">
                  {/* Client & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {plan.clientName || 'Học viên'}
                      </span>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${statusConfig.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Plan Name & Desc */}
                  <div>
                    <h3
                      onClick={() => navigate(`/pt/nutrition-plans/${plan.id}`)}
                      className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
                      title={plan.name}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                      {plan.description || 'Chưa có ghi chú mô tả cho kế hoạch này.'}
                    </p>
                  </div>

                  {/* Date range */}
                  {(plan.startDate || plan.endDate) && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-800/60">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString('vi-VN') : '---'}{' '}
                        đến{' '}
                        {plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                  )}

                  {/* Macro Target Pills */}
                  {plan.dailyMacroTarget && (
                    <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <span className="block text-[10px] text-amber-400 font-medium">Calo</span>
                        <span className="text-xs font-bold text-white">
                          {plan.dailyMacroTarget.calories}
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <span className="block text-[10px] text-blue-400 font-medium">Đạm</span>
                        <span className="text-xs font-bold text-white">
                          {plan.dailyMacroTarget.protein}g
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <span className="block text-[10px] text-emerald-400 font-medium">Carb</span>
                        <span className="text-xs font-bold text-white">
                          {plan.dailyMacroTarget.carbs}g
                        </span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
                        <span className="block text-[10px] text-rose-400 font-medium">Béo</span>
                        <span className="text-xs font-bold text-white">
                          {plan.dailyMacroTarget.fat}g
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Calorie Progress Bar */}
                  {targetCal > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-400" />
                          Tổng calo thực đơn:
                        </span>
                        <span className="font-semibold text-white">
                          <span className="text-emerald-400">{totalCal}</span> / {targetCal} kcal{' '}
                          <span className="text-slate-400 text-[10px]">({calPercent}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            calPercent > 110
                              ? 'bg-rose-500'
                              : calPercent >= 90
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(calPercent, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      <b>{foodsCount}</b> món ăn
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanToEdit(plan);
                        setIsPlanModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
                      title="Chỉnh sửa thông tin"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmPlan(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Xóa kế hoạch"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* View Details link */}
                    <button
                      type="button"
                      onClick={() => navigate(`/pt/nutrition-plans/${plan.id}`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Chi tiết</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal tạo/sửa kế hoạch */}
      <NutritionPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setSelectedPlanToEdit(null);
        }}
        planToEdit={selectedPlanToEdit}
        onSaved={handleSavedPlan}
      />

      {/* Modal xác nhận xóa */}
      {deleteConfirmPlan && (
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
              <span className="font-semibold text-white">"{deleteConfirmPlan.name}"</span> của học
              viên <span className="font-semibold text-white">{deleteConfirmPlan.clientName}</span>?
              Toàn bộ danh sách món ăn và thực đơn liên quan sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlan(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
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
