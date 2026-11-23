import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Calendar,
  User,
  Dumbbell,
  Plus,
  Edit2,
  Trash2,
  Clock,
  Activity,
  Layers,
  AlertTriangle,
  RefreshCw,
  CalendarDays,
} from 'lucide-react';
import { toast } from 'sonner';
import { workoutPlanService } from '../../../services/workoutPlanService';
import type {
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
} from '../../../types/workoutPlan';
import { WORKOUT_PLAN_STATUS_CONFIG } from '../../../types/workoutPlan';
import CreateWorkoutPlanModal from '../../../components/workout/CreateWorkoutPlanModal';
import WorkoutDayModal from '../../../components/workout/WorkoutDayModal';
import WorkoutExerciseModal from '../../../components/workout/WorkoutExerciseModal';

export default function WorkoutPlanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Selected Day ID state
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  // Modals state
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);
  const [dayToEdit, setDayToEdit] = useState<WorkoutDay | null>(null);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [exerciseToEdit, setExerciseToEdit] = useState<WorkoutExercise | null>(null);

  // Delete confirmations
  const [deleteConfirmPlan, setDeleteConfirmPlan] = useState(false);
  const [deleteConfirmDay, setDeleteConfirmDay] = useState<WorkoutDay | null>(null);
  const [deleteConfirmExercise, setDeleteConfirmExercise] = useState<{
    dayId: string;
    exercise: WorkoutExercise;
  } | null>(null);

  // Fetch plan details query
  const {
    data: plan,
    isLoading: loading,
    isRefetching,
    refetch,
  } = useQuery<WorkoutPlan>({
    queryKey: ['workoutPlanDetail', id],
    queryFn: async () => {
      if (!id) throw new Error('Mã giáo án không hợp lệ');
      const res = await workoutPlanService.getPlanDetail(id);
      return res.data;
    },
    enabled: Boolean(id),
  });

  // Active training day
  const trainingDays = useMemo(() => plan?.trainingDays || [], [plan]);

  const activeDay = useMemo(() => {
    if (!trainingDays.length) return null;
    if (selectedDayId) {
      const found = trainingDays.find((d) => d.id === selectedDayId);
      if (found) return found;
    }
    return trainingDays[0];
  }, [trainingDays, selectedDayId]);

  // Mutations
  const deletePlanMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      await workoutPlanService.deletePlan(id);
    },
    onSuccess: () => {
      toast.success('Đã xóa giáo án thành công');
      queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
      navigate('/pt/workout-plans');
    },
    onError: (err: unknown) => {
      console.error('Delete plan error:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa giáo án. Vui lòng thử lại!';
      toast.error(msg);
    },
  });

  const deleteDayMutation = useMutation({
    mutationFn: async (dayId: string) => {
      if (!id) return;
      await workoutPlanService.deleteDay(id, dayId);
    },
    onSuccess: () => {
      toast.success('Đã xóa buổi tập');
      queryClient.invalidateQueries({ queryKey: ['workoutPlanDetail', id] });
      setDeleteConfirmDay(null);
      setSelectedDayId(null);
    },
    onError: (err: unknown) => {
      console.error('Delete day error:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa buổi tập. Vui lòng thử lại!';
      toast.error(msg);
    },
  });

  const deleteExerciseMutation = useMutation({
    mutationFn: async ({
      dayId,
      exerciseId,
    }: {
      dayId: string;
      exerciseId: string;
    }) => {
      if (!id) return;
      await workoutPlanService.deleteExercise(id, dayId, exerciseId);
    },
    onSuccess: () => {
      toast.success('Đã xóa bài tập');
      queryClient.invalidateQueries({ queryKey: ['workoutPlanDetail', id] });
      setDeleteConfirmExercise(null);
    },
    onError: (err: unknown) => {
      console.error('Delete exercise error:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể xóa bài tập. Vui lòng thử lại!';
      toast.error(msg);
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Đang tải thông tin giáo án tập luyện...</p>
        </div>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-6 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Không tìm thấy giáo án tập luyện</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Giáo án này có thể đã bị xóa hoặc bạn không có quyền truy cập.
        </p>
        <button
          type="button"
          onClick={() => navigate('/pt/workout-plans')}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold transition"
        >
          Quay lại danh sách giáo án
        </button>
      </div>
    );
  }

  const statusConfig = WORKOUT_PLAN_STATUS_CONFIG[plan.status] || {
    label: plan.status,
    badgeClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    dotClass: 'bg-slate-400',
  };

  const totalExercises = trainingDays.reduce(
    (sum, d) => sum + (d.exercises?.length || 0),
    0
  );

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/pt/workout-plans')}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition cursor-pointer group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Danh sách giáo án</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="p-2 rounded-xl border border-slate-800 bg-[#111827] hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => {
              setDayToEdit(null);
              setIsDayModalOpen(true);
            }}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm buổi tập</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditPlanModalOpen(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-800 bg-[#111827] hover:bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Sửa giáo án</span>
          </button>

          <button
            type="button"
            onClick={() => setDeleteConfirmPlan(true)}
            className="p-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
            title="Xóa giáo án"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Plan Header Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#111827] via-[#0E1729] to-[#0A1220] border border-slate-800/90 p-6 sm:p-8 shadow-xl overflow-hidden">
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

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {plan.name}
            </h1>

            {plan.description && (
              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {plan.description}
              </p>
            )}
          </div>

          {/* Quick Stats Right */}
          <div className="flex items-center gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 block font-medium">Buổi tập/tuần</span>
              <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
                {trainingDays.length}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center min-w-[100px]">
              <span className="text-[11px] text-slate-400 block font-medium">Tổng bài tập</span>
              <span className="text-2xl font-black text-blue-400 mt-0.5 block">
                {totalExercises}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Day Navigation Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white">
              Lộ trình các buổi tập trong tuần (Training Days)
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Chọn buổi tập để xem và cập nhật danh sách bài tập
          </span>
        </div>

        {trainingDays.length === 0 ? (
          <div className="p-8 rounded-3xl bg-[#111827]/40 border border-dashed border-slate-800 text-center space-y-3">
            <Layers className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-400">Chưa có buổi tập nào trong giáo án này.</p>
            <button
              type="button"
              onClick={() => {
                setDayToEdit(null);
                setIsDayModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm buổi tập đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {trainingDays.map((day) => {
              const isActive = activeDay?.id === day.id;
              const exCount = day.exercises?.length || 0;
              return (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => setSelectedDayId(day.id)}
                  className={`px-4 py-3 rounded-2xl border transition-all text-left shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    <span className="text-xs font-bold whitespace-nowrap">{day.dayName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 pl-7 text-[10px]">
                    <span className={isActive ? 'text-emerald-400 font-semibold' : 'text-slate-400'}>
                      {exCount} bài tập
                    </span>
                  </div>
                </button>
              );
            })}

            {/* Quick add day button */}
            <button
              type="button"
              onClick={() => {
                setDayToEdit(null);
                setIsDayModalOpen(true);
              }}
              className="px-3.5 py-3 rounded-2xl border border-dashed border-slate-700 hover:border-emerald-500 bg-[#111827]/40 hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm buổi</span>
            </button>
          </div>
        )}
      </div>

      {/* Selected Day Content */}
      {activeDay && (
        <div className="rounded-3xl bg-[#111827] border border-slate-800/90 shadow-xl overflow-hidden">
          {/* Day Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 bg-[#0E1626] border-b border-slate-800/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
                  Buổi {activeDay.dayNumber}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-white">{activeDay.dayName}</h3>
              </div>
              {activeDay.description && (
                <p className="text-xs text-slate-400 pl-0.5">{activeDay.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={() => {
                  setDayToEdit(activeDay);
                  setIsDayModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Sửa buổi</span>
              </button>

              <button
                type="button"
                onClick={() => setDeleteConfirmDay(activeDay)}
                className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition cursor-pointer"
                title="Xóa buổi tập này"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setExerciseToEdit(null);
                  setIsExerciseModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer ml-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm bài tập</span>
              </button>
            </div>
          </div>

          {/* Exercises Table / List */}
          {(!activeDay.exercises || activeDay.exercises.length === 0) ? (
            <div className="p-10 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto stroke-1" />
              <h4 className="text-sm font-bold text-white">Chưa có bài tập nào cho buổi này</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Bổ sung các bài tập chính, bài phụ và bài bổ trợ với các thông số Sets, Reps, Tempo
                và thời gian nghỉ.
              </p>
              <button
                type="button"
                onClick={() => {
                  setExerciseToEdit(null);
                  setIsExerciseModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm bài tập đầu tiên</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0A101D] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3 font-semibold w-12 text-center">#</th>
                    <th className="px-5 py-3 font-semibold">Tên bài tập & Ghi chú kỹ thuật</th>
                    <th className="px-4 py-3 font-semibold text-center">Số hiệp (Sets)</th>
                    <th className="px-4 py-3 font-semibold text-center">Số lần (Reps)</th>
                    <th className="px-4 py-3 font-semibold text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-teal-400" />
                        <span>Tempo</span>
                      </span>
                    </th>
                    <th className="px-4 py-3 font-semibold text-center">
                      <span className="flex items-center justify-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>Nghỉ giữa hiệp</span>
                      </span>
                    </th>
                    <th className="px-5 py-3 font-semibold text-center w-24">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {activeDay.exercises.map((exercise, idx) => (
                    <tr
                      key={exercise.id}
                      className="hover:bg-slate-800/30 transition-colors"
                    >
                      {/* Order */}
                      <td className="px-5 py-3.5 text-center font-bold text-slate-500">
                        {idx + 1}
                      </td>

                      {/* Name & Note */}
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-white text-sm block">
                          {exercise.exerciseName}
                        </span>
                        {exercise.note && (
                          <span className="text-[11px] text-slate-400 italic block mt-0.5">
                            {exercise.note}
                          </span>
                        )}
                      </td>

                      {/* Sets */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs">
                          {exercise.sets} hiệp
                        </span>
                      </td>

                      {/* Reps */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs">
                          {exercise.reps} lần
                        </span>
                      </td>

                      {/* Tempo */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 font-mono text-xs font-semibold"
                          title="Hạ - Nghỉ đáy - Lên - Nghỉ đỉnh"
                        >
                          {exercise.tempo}
                        </span>
                      </td>

                      {/* Rest Seconds */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 font-semibold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{exercise.restSeconds}s</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setExerciseToEdit(exercise);
                              setIsExerciseModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title="Chỉnh sửa bài tập"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmExercise({
                                dayId: activeDay.id,
                                exercise,
                              })
                            }
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition cursor-pointer"
                            title="Xóa bài tập"
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
      )}

      {/* Modal Chỉnh sửa thông tin Giáo án */}
      <CreateWorkoutPlanModal
        isOpen={isEditPlanModalOpen}
        onClose={() => setIsEditPlanModalOpen(false)}
        planToEdit={plan}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['workoutPlanDetail', id] });
          queryClient.invalidateQueries({ queryKey: ['workoutPlans'] });
        }}
      />

      {/* Modal Thêm / Sửa Buổi tập */}
      <WorkoutDayModal
        isOpen={isDayModalOpen}
        onClose={() => {
          setIsDayModalOpen(false);
          setDayToEdit(null);
        }}
        planId={plan.id}
        dayToEdit={dayToEdit}
        nextDayNumber={trainingDays.length + 1}
        onSaved={() => {
          queryClient.invalidateQueries({ queryKey: ['workoutPlanDetail', id] });
        }}
      />

      {/* Modal Thêm / Sửa Bài tập */}
      {activeDay && (
        <WorkoutExerciseModal
          isOpen={isExerciseModalOpen}
          onClose={() => {
            setIsExerciseModalOpen(false);
            setExerciseToEdit(null);
          }}
          planId={plan.id}
          dayId={activeDay.id}
          exerciseToEdit={exerciseToEdit}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['workoutPlanDetail', id] });
          }}
        />
      )}

      {/* Modal xác nhận xóa bài tập */}
      {deleteConfirmExercise && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl p-5 space-y-3 text-slate-100">
            <div className="flex items-center gap-2.5 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
              <h4 className="text-sm font-bold text-white">Xác nhận xóa bài tập</h4>
            </div>
            <p className="text-xs text-slate-300">
              Bạn có chắc chắn muốn xóa bài tập{' '}
              <strong className="text-white">
                "{deleteConfirmExercise.exercise.exerciseName}"
              </strong>{' '}
              khỏi buổi tập này?
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmExercise(null)}
                disabled={deleteExerciseMutation.isPending}
                className="px-3 py-1.5 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() =>
                  deleteExerciseMutation.mutate({
                    dayId: deleteConfirmExercise.dayId,
                    exerciseId: deleteConfirmExercise.exercise.id,
                  })
                }
                disabled={deleteExerciseMutation.isPending}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {deleteExerciseMutation.isPending ? 'Đang xóa...' : 'Xóa bài tập'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa buổi tập */}
      {deleteConfirmDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl p-6 space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Xác nhận xóa buổi tập</h3>
                <p className="text-xs text-slate-400">Mọi bài tập trong buổi này sẽ bị xóa theo</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xóa{' '}
              <strong className="text-white">"{deleteConfirmDay.dayName}"</strong>? Toàn bộ{' '}
              <strong className="text-emerald-400">
                {deleteConfirmDay.exercises?.length || 0} bài tập
              </strong>{' '}
              trong buổi tập này sẽ bị xóa khỏi giáo án.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDay(null)}
                disabled={deleteDayMutation.isPending}
                className="px-4 py-2 rounded-xl border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => deleteDayMutation.mutate(deleteConfirmDay.id)}
                disabled={deleteDayMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deleteDayMutation.isPending ? 'Đang xóa...' : 'Xóa buổi tập'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa giáo án */}
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
              <strong className="text-white">"{plan.name}"</strong>? Mọi buổi tập và bài tập của
              giáo án này sẽ bị xóa hoàn toàn.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmPlan(false)}
                disabled={deletePlanMutation.isPending}
                className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => deletePlanMutation.mutate()}
                disabled={deletePlanMutation.isPending}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {deletePlanMutation.isPending ? (
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
