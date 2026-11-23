import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Dumbbell,
  Plus,
  Search,
  Calendar,
  User,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { workoutPlanService } from '../../../services/workoutPlanService';
import { clientApi } from '../../../api/clientApi';
import { useAuth } from '../../../context/AuthContext';
import type { WorkoutPlan, WorkoutPlanStatus } from '../../../types/workoutPlan';
import { WORKOUT_PLAN_STATUS_CONFIG } from '../../../types/workoutPlan';
import CreateWorkoutPlanModal from '../../../components/workout/CreateWorkoutPlanModal';

export default function WorkoutPlanListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState<WorkoutPlan | null>(null);
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState<WorkoutPlan | null>(null);

  // Fetch plans query
  const {
    data: plans = [],
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery<WorkoutPlan[]>({
    queryKey: ['workoutPlans', authUser?.id],
    queryFn: async () => {
      const res = await workoutPlanService.getMyPlans();
      return res.data ?? [];
    },
  });

  // Fetch clients for dropdown filter
  const { data: clients = [] } = useQuery({
    queryKey: ['myClients', authUser?.id],
    queryFn: async () => {
      return await clientApi.getAllClients(authUser?.id);
    },
  });

  // Delete plan mutation
  const deleteMutation = useMutation({
    mutationFn: async (planId: string) => {
      await workoutPlanService.deletePlan(planId);
    },
    onSuccess: () => {
      toast.success(`Đã xóa giáo án "${deleteConfirmPlan?.name}"`);
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      setDeleteConfirmPlan(null);
    },
    onError: (err: unknown) => {
      console.error('Delete workout plan error:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa giáo án. Vui lòng thử lại!';
      toast.error(msg);
    },
  });

  // Filtered plans
  const filteredPlans = useMemo(() => {
    return plans.filter((plan) => {
      // Status filter
      if (statusFilter !== 'ALL' && plan.status !== statusFilter) {
        return false;
      }
      // Client filter
      if (clientFilter !== 'ALL' && plan.clientId !== clientFilter) {
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
  }, [plans, statusFilter, clientFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/5">
            <Dumbbell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Giáo án Tập luyện
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Quản lý kế hoạch chia buổi (Split), các bài tập và thông số Sets/Reps/Tempo cho từng học viên
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={loading || isRefetching}
            className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedPlanToEdit(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo giáo án mới</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1 max-w-2xl">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo tên giáo án, học viên..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#111827] border border-slate-800 focus:border-emerald-500 text-sm text-white placeholder:text-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Client filter dropdown */}
          <div className="w-full sm:w-56">
            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-slate-800 focus:border-emerald-500 text-xs text-white focus:outline-none transition-colors"
            >
              <option value="ALL">Tất cả học viên ({clients.length})</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.fullName || c.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
            }`}
          >
            Tất cả ({plans.length})
          </button>
          {(Object.keys(WORKOUT_PLAN_STATUS_CONFIG) as WorkoutPlanStatus[]).map((statusKey) => {
            const config = WORKOUT_PLAN_STATUS_CONFIG[statusKey];
            const count = plans.filter((p) => p.status === statusKey).length;
            const isSelected = statusFilter === statusKey;
            return (
              <button
                key={statusKey}
                type="button"
                onClick={() => setStatusFilter(statusKey)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  isSelected
                    ? `${config.badgeClass} border`
                    : 'bg-[#111827] text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-[#111827]/40 border border-slate-800/80 animate-pulse p-6 space-y-4"
            >
              <div className="h-5 bg-slate-800 rounded-md w-3/4" />
              <div className="h-4 bg-slate-800/60 rounded-md w-1/2" />
              <div className="h-20 bg-slate-800/40 rounded-2xl" />
              <div className="h-8 bg-slate-800/50 rounded-xl w-full mt-4" />
            </div>
          ))}
        </div>
      ) : filteredPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 bg-[#111827]/30 border border-dashed border-slate-800 rounded-3xl text-center">
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-4">
            <Dumbbell className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-1">
            {searchQuery || statusFilter !== 'ALL' || clientFilter !== 'ALL'
              ? 'Không tìm thấy giáo án phù hợp'
              : 'Chưa có giáo án tập luyện nào'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            {searchQuery || statusFilter !== 'ALL' || clientFilter !== 'ALL'
              ? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các bộ lọc trạng thái và học viên.'
              : 'Tạo giáo án đầu tiên với các mẫu lịch tập 3 buổi, 4 buổi hoặc theo tuần sẵn có.'}
          </p>
          <button
            type="button"
            onClick={() => {
              if (searchQuery || statusFilter !== 'ALL' || clientFilter !== 'ALL') {
                setSearchQuery('');
                setStatusFilter('ALL');
                setClientFilter('ALL');
              } else {
                setSelectedPlanToEdit(null);
                setIsCreateModalOpen(true);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            {searchQuery || statusFilter !== 'ALL' || clientFilter !== 'ALL' ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Xóa bộ lọc</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>Tạo giáo án đầu tiên</span>
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPlans.map((plan) => {
            const statusConfig = WORKOUT_PLAN_STATUS_CONFIG[plan.status] || {
              label: plan.status,
              badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
              dotClass: 'bg-slate-400',
            };

            const daysCount = plan.totalDays ?? plan.trainingDays?.length ?? 0;
            const exercisesCount =
              plan.totalExercises ??
              plan.trainingDays?.reduce((acc, d) => acc + (d.exercises?.length || 0), 0) ??
              0;

            return (
              <div
                key={plan.id}
                className="group relative flex flex-col justify-between rounded-3xl bg-gradient-to-b from-[#111827] to-[#0D1525] border border-slate-800/90 hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 overflow-hidden"
              >
                {/* Card Top */}
                <div className="p-6 space-y-4">
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
                      onClick={() => navigate(`/pt/workout-plans/${plan.id}`)}
                      className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 cursor-pointer"
                      title={plan.name}
                    >
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 min-h-[32px]">
                      {plan.description || 'Chưa có ghi chú mô tả cho giáo án này.'}
                    </p>
                  </div>

                  {/* Date range */}
                  {(plan.startDate || plan.endDate) && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800/60">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {plan.startDate ? new Date(plan.startDate).toLocaleDateString('vi-VN') : '---'}{' '}
                        đến{' '}
                        {plan.endDate ? new Date(plan.endDate).toLocaleDateString('vi-VN') : '---'}
                      </span>
                    </div>
                  )}

                  {/* Stats pills */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <span className="block text-[10px] text-slate-400 font-medium">Buổi tập/tuần</span>
                      <span className="text-sm font-bold text-emerald-400">
                        {daysCount} buổi
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80">
                      <span className="block text-[10px] text-slate-400 font-medium">Tổng bài tập</span>
                      <span className="text-sm font-bold text-blue-400">
                        {exercisesCount} bài
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3.5 border-t border-slate-800/80 bg-[#0e1626]/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Lộ trình tập luyện</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit button */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanToEdit(plan);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                      title="Chỉnh sửa giáo án"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmPlan(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                      title="Xóa giáo án"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* View Details button */}
                    <button
                      type="button"
                      onClick={() => navigate(`/pt/workout-plans/${plan.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition cursor-pointer"
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

      {/* Modal Tạo/Sửa giáo án */}
      <CreateWorkoutPlanModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedPlanToEdit(null);
        }}
        planToEdit={selectedPlanToEdit}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
        }}
      />

      {/* Modal xác nhận xóa */}
      {deleteConfirmPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa giáo án</h3>
                <p className="text-xs text-slate-400">Hành động này không thể hoàn tác</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa giáo án{' '}
              <strong className="text-white">"{deleteConfirmPlan.name}"</strong> của học viên{' '}
              <strong className="text-white">{deleteConfirmPlan.clientName}</strong>? Toàn bộ danh
              sách các buổi tập và bài tập liên quan sẽ bị xóa vĩnh viễn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlan(null)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(deleteConfirmPlan.id)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleteMutation.isPending ? (
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

