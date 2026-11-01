import React, { useState, useMemo } from 'react';
import {
  Target,
  CheckCircle2,
  Edit3,
  Trash2,
  Play,
  Plus,
  Loader2,
  FileText,
  X,
  Sparkles,
  Award,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientGoalService } from '../../services/clientGoalService';
import type {
  ClientGoal,
  GoalPhaseStatus,
  CreateClientGoalRequest,
  UpdateClientGoalRequest,
} from '../../types/clientGoal';
import {
  GOAL_PHASE_STATUS_CONFIG,
  GOAL_TYPE_SUGGESTIONS,
} from '../../types/clientGoal';

interface ClientGoalsTimelineProps {
  goals: ClientGoal[];
  clientId: string;
  trainerId: string;
  currentWeight?: number;
  isLoading?: boolean;
  onRefreshGoals: () => void;
}

export default function ClientGoalsTimeline({
  goals,
  clientId,
  trainerId,
  currentWeight,
  isLoading = false,
  onRefreshGoals,
}: ClientGoalsTimelineProps) {
  const [filterStatus, setFilterStatus] = useState<'ALL' | GoalPhaseStatus>('ALL');

  // Trạng thái thao tác TRỰC TIẾP TRÊN TRANG (INLINE - HOÀN TOÀN KHÔNG DÙNG POPUP)
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [completingGoalId, setCompletingGoalId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states cho Create / Edit
  const todayStr = new Date().toISOString().split('T')[0];
  const defaultEndDateStr = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split('T')[0];
  };

  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Giảm mỡ');
  const [formStartDate, setFormStartDate] = useState(todayStr);
  const [formEndDate, setFormEndDate] = useState(defaultEndDateStr());
  const [formStartWeight, setFormStartWeight] = useState<number>(currentWeight || 70);
  const [formTargetWeight, setFormTargetWeight] = useState<number>((currentWeight || 70) - 5);
  const [formStatus, setFormStatus] = useState<GoalPhaseStatus>('ACTIVE');
  const [formNote, setFormNote] = useState('');

  // Form states cho Complete
  const [endWeight, setEndWeight] = useState<number>(65);
  const [actualEndDate, setActualEndDate] = useState<string>(todayStr);
  const [completeNote, setCompleteNote] = useState<string>('');

  // Bắt đầu tạo mới inline
  const startCreateInline = () => {
    setErrorMsg(null);
    setEditingGoalId(null);
    setCompletingGoalId(null);
    setConfirmDeleteId(null);
    const baseW = currentWeight && currentWeight > 0 ? currentWeight : 70;
    setFormName('Giai đoạn tập luyện mới');
    setFormType('Giảm mỡ');
    setFormStartDate(todayStr);
    setFormEndDate(defaultEndDateStr());
    setFormStartWeight(baseW);
    setFormTargetWeight(Math.max(40, baseW - 5));
    setFormStatus('PLANNED');
    setFormNote('');
    setIsCreatingInline(true);
  };

  // Bắt đầu sửa inline
  const startEditInline = (goal: ClientGoal) => {
    setErrorMsg(null);
    setIsCreatingInline(false);
    setCompletingGoalId(null);
    setConfirmDeleteId(null);
    setFormName(goal.goalName || '');
    setFormType(goal.goalType || 'Giảm mỡ');
    setFormStartDate(goal.startDate || todayStr);
    setFormEndDate(goal.endDate || defaultEndDateStr());
    setFormStartWeight(goal.startWeight || 70);
    setFormTargetWeight(goal.targetWeight || 65);
    setFormStatus(goal.status || 'ACTIVE');
    setFormNote(goal.note || '');
    setEditingGoalId(goal.id);
  };

  // Bắt đầu hoàn thành inline
  const startCompleteInline = (goal: ClientGoal) => {
    setErrorMsg(null);
    setIsCreatingInline(false);
    setEditingGoalId(null);
    setConfirmDeleteId(null);
    setEndWeight(goal.targetWeight || 65);
    setActualEndDate(todayStr);
    setCompleteNote(goal.note ? `${goal.note} (Hoàn thành)` : '');
    setCompletingGoalId(goal.id);
  };

  // Đóng mọi thao tác inline
  const cancelAllInline = () => {
    setIsCreatingInline(false);
    setEditingGoalId(null);
    setCompletingGoalId(null);
    setConfirmDeleteId(null);
    setErrorMsg(null);
  };

  // Submit tạo mới inline
  const handleSaveCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim() || !formType.trim()) {
      const err = 'Vui lòng nhập tên và loại mục tiêu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }
    if (!formStartWeight || formStartWeight <= 0 || !formTargetWeight || formTargetWeight <= 0) {
      const err = 'Cân nặng phải lớn hơn 0 kg';
      setErrorMsg(err);
      toast.error(err);
      return;
    }
    if (new Date(formEndDate) <= new Date(formStartDate)) {
      const err = 'Ngày kết thúc dự kiến phải sau ngày bắt đầu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateClientGoalRequest = {
        clientId,
        trainerId: trainerId || 'PT',
        goalName: formName.trim(),
        goalType: formType.trim(),
        startDate: formStartDate,
        endDate: formEndDate,
        startWeight: formStartWeight,
        targetWeight: formTargetWeight,
        status: formStatus,
        note: formNote.trim() || undefined,
      };

      await clientGoalService.createGoal(payload);
      toast.success('Thêm giai đoạn mục tiêu mới thành công!');
      cancelAllInline();
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Lưu mục tiêu thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit sửa inline
  const handleSaveEdit = async (goalId: string, e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim() || !formType.trim()) {
      const err = 'Vui lòng nhập tên và loại mục tiêu';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateClientGoalRequest = {
        goalName: formName.trim(),
        goalType: formType.trim(),
        startDate: formStartDate,
        endDate: formEndDate,
        startWeight: formStartWeight,
        targetWeight: formTargetWeight,
        status: formStatus,
        note: formNote.trim() || undefined,
      };

      await clientGoalService.updateGoal(goalId, payload);
      toast.success('Cập nhật mục tiêu thành công!');
      cancelAllInline();
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Cập nhật thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit hoàn thành inline
  const handleSaveComplete = async (goal: ClientGoal, e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!endWeight || endWeight <= 0) {
      const err = 'Vui lòng nhập cân nặng thực tế đạt được (> 0 kg)';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateClientGoalRequest = {
        status: 'COMPLETED',
        endWeight,
        actualEndDate,
        note: completeNote.trim() || undefined,
      };

      await clientGoalService.updateGoal(goal.id, payload);
      toast.success('Đã hoàn thành giai đoạn mục tiêu!');
      cancelAllInline();
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Cập nhật thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Kích hoạt mục tiêu thành ACTIVE
  const handleActivateGoal = async (goal: ClientGoal) => {
    try {
      await clientGoalService.updateGoal(goal.id, { status: 'ACTIVE' });
      toast.success(`Đã kích hoạt mục tiêu "${goal.goalName}" thành Đang diễn ra!`);
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Kích hoạt thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      toast.error(msg);
    }
  };

  // Xóa mục tiêu inline
  const handleConfirmDelete = async (goalId: string) => {
    setIsSubmitting(true);
    try {
      await clientGoalService.deleteGoal(goalId);
      toast.success('Đã xoá mục tiêu thành công!');
      cancelAllInline();
      onRefreshGoals();
    } catch (err: unknown) {
      let msg = 'Xoá mục tiêu thất bại.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sắp xếp mục tiêu
  const sortedGoals = useMemo(() => {
    return [...goals].sort((a, b) => {
      if (a.status === 'ACTIVE' && b.status !== 'ACTIVE') return -1;
      if (b.status === 'ACTIVE' && a.status !== 'ACTIVE') return 1;
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });
  }, [goals]);

  // Lọc mục tiêu
  const filteredGoals = useMemo(() => {
    if (filterStatus === 'ALL') return sortedGoals;
    return sortedGoals.filter((g) => g.status === filterStatus);
  }, [sortedGoals, filterStatus]);

  // Format ngày dd/mm/yyyy
  const formatDateDisplay = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    try {
      const [y, m, d] = dateStr.split('-');
      if (y && m && d) return `${d}/${m}/${y}`;
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200/90 dark:border-[#162338] p-6 shadow-xs space-y-6">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="h-5 w-5 text-emerald-500" />
              <span>Lộ trình & Mục tiêu tập luyện</span>
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              {goals.length} giai đoạn
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi các giai đoạn tăng cơ, giảm mỡ và phục hồi thể lực của học viên trực tiếp tại đây.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreateInline}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm mục tiêu mới</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs custom-scrollbar">
        <button
          type="button"
          onClick={() => setFilterStatus('ALL')}
          className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
            filterStatus === 'ALL'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Tất cả ({goals.length})
        </button>

        {(['ACTIVE', 'PLANNED', 'COMPLETED', 'CANCELLED'] as GoalPhaseStatus[]).map((st) => {
          const count = goals.filter((g) => g.status === st).length;
          const isSelected = filterStatus === st;
          return (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {GOAL_PHASE_STATUS_CONFIG[st].label} ({count})
            </button>
          );
        })}
      </div>

      {/* ========================================================
          INLINE CREATE FORM (THÊM MỤC TIÊU TRỰC TIẾP TRÊN TRANG)
         ======================================================== */}
      {isCreatingInline && (
        <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-500/40 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/40 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Thêm giai đoạn mục tiêu mới
              </h4>
            </div>
            <button
              type="button"
              onClick={cancelAllInline}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveCreate} className="space-y-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Tên mục tiêu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="VD: Giai đoạn tăng cơ xả cân..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Loại mục tiêu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formType}
                  onChange={(e) => setFormType(e.target.value)}
                  placeholder="VD: Giảm mỡ, Tăng cơ..."
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {GOAL_TYPE_SUGGESTIONS.slice(0, 4).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setFormType(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-md cursor-pointer ${
                        formType === tag
                          ? 'bg-emerald-600 text-white font-bold'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Cân nặng bắt đầu (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={formStartWeight || ''}
                  onChange={(e) => setFormStartWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Cân nặng mục tiêu (kg) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step={0.1}
                  value={formTargetWeight || ''}
                  onChange={(e) => setFormTargetWeight(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ngày bắt đầu <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={formStartDate}
                  onChange={(e) => setFormStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ngày kết thúc dự kiến <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  min={formStartDate}
                  value={formEndDate}
                  onChange={(e) => setFormEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Ghi chú dinh dưỡng & lịch tập
              </label>
              <textarea
                rows={2}
                value={formNote}
                onChange={(e) => setFormNote(e.target.value)}
                placeholder="Ghi chú thêm..."
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={cancelAllInline}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Lưu mục tiêu mới</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content: Goals List */}
      {isLoading ? (
        <div className="py-12 text-center space-y-2">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Đang tải dữ liệu mục tiêu học viên...
          </p>
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Target className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Chưa có mục tiêu nào trong danh mục này
            </p>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              Nhấp vào nút &quot;Thêm mục tiêu mới&quot; để lên lộ trình rèn luyện trực tiếp trên trang.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map((goal) => {
            const isEditingThis = editingGoalId === goal.id;
            const isCompletingThis = completingGoalId === goal.id;
            const isDeletingThis = confirmDeleteId === goal.id;

            const statusConfig = GOAL_PHASE_STATUS_CONFIG[goal.status];
            const weightDelta = goal.targetWeight - goal.startWeight;
            const isLoss = weightDelta < 0;

            // ========================================================
            // INLINE EDIT FORM FOR THIS GOAL
            // ========================================================
            if (isEditingThis) {
              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/30 border-2 border-emerald-500 shadow-sm space-y-3.5 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/40 pb-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Edit3 className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Chỉnh sửa mục tiêu: {goal.goalName}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={cancelAllInline}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <form onSubmit={(e) => handleSaveEdit(goal.id, e)} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Tên mục tiêu
                        </label>
                        <input
                          type="text"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Loại mục tiêu
                        </label>
                        <input
                          type="text"
                          value={formType}
                          onChange={(e) => setFormType(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Cân nặng bắt đầu (kg)
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={formStartWeight || ''}
                          onChange={(e) => setFormStartWeight(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Cân nặng mục tiêu (kg)
                        </label>
                        <input
                          type="number"
                          step={0.1}
                          value={formTargetWeight || ''}
                          onChange={(e) => setFormTargetWeight(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Ngày bắt đầu
                        </label>
                        <input
                          type="date"
                          value={formStartDate}
                          onChange={(e) => setFormStartDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Ngày kết thúc dự kiến
                        </label>
                        <input
                          type="date"
                          min={formStartDate}
                          value={formEndDate}
                          onChange={(e) => setFormEndDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Ghi chú
                      </label>
                      <textarea
                        rows={2}
                        value={formNote}
                        onChange={(e) => setFormNote(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelAllInline}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Cập nhật</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              );
            }

            // ========================================================
            // INLINE COMPLETE FORM FOR THIS GOAL
            // ========================================================
            if (isCompletingThis) {
              const diff = endWeight - goal.startWeight;
              return (
                <div
                  key={goal.id}
                  className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/30 border-2 border-blue-500 shadow-sm space-y-3.5 animate-in fade-in duration-200"
                >
                  <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-900/40 pb-2.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Award className="h-4 w-4 text-blue-600" />
                      <span>Ghi nhận hoàn thành: {goal.goalName}</span>
                    </h4>
                    <button
                      type="button"
                      onClick={cancelAllInline}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <form onSubmit={(e) => handleSaveComplete(goal, e)} className="space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-semibold text-slate-700 dark:text-slate-300">
                            Cân nặng thực tế đạt (kg) <span className="text-rose-500">*</span>
                          </label>
                          <span className="font-bold text-[11px] text-blue-600">
                            {diff < 0 ? `Giảm ${Math.abs(diff).toFixed(1)}kg` : `Tăng ${diff.toFixed(1)}kg`}
                          </span>
                        </div>
                        <input
                          type="number"
                          step={0.1}
                          value={endWeight || ''}
                          onChange={(e) => setEndWeight(parseFloat(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                          Ngày hoàn thành thực tế <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={actualEndDate}
                          onChange={(e) => setActualEndDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-medium outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                        Đánh giá của PT
                      </label>
                      <textarea
                        rows={2}
                        value={completeNote}
                        onChange={(e) => setCompleteNote(e.target.value)}
                        placeholder="Nhận xét kết quả đạt được..."
                        className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={cancelAllInline}
                        className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold cursor-pointer disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Xác nhận hoàn thành</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              );
            }

            // ========================================================
            // INLINE DELETE CONFIRMATION FOR THIS GOAL
            // ========================================================
            if (isDeletingThis) {
              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in duration-200"
                >
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-medium">
                    <Trash2 className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>Bạn có chắc chắn muốn xoá mục tiêu <strong>&quot;{goal.goalName}&quot;</strong>?</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={cancelAllInline}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => handleConfirmDelete(goal.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? 'Đang xoá...' : 'Xác nhận xoá'}
                    </button>
                  </div>
                </div>
              );
            }

            // ========================================================
            // DEFAULT VIEW OF GOAL CARD
            // ========================================================
            return (
              <div
                key={goal.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  goal.status === 'ACTIVE'
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/40 shadow-xs'
                    : 'bg-slate-50/50 dark:bg-slate-850/40 border-slate-200/80 dark:border-slate-800/80'
                } space-y-3.5`}
              >
                {/* Header: Title, Tags & Menu Actions */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${statusConfig.badgeClass}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${statusConfig.dotClass}`} />
                        <span>{statusConfig.label}</span>
                      </span>

                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {goal.goalType}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {goal.goalName}
                    </h4>
                  </div>

                  {/* Right Actions (INLINE) */}
                  <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                    {/* Nút Hoàn thành nếu chưa hoàn thành */}
                    {goal.status !== 'COMPLETED' && goal.status !== 'CANCELLED' && (
                      <button
                        type="button"
                        onClick={() => startCompleteInline(goal)}
                        title="Đánh dấu hoàn thành mục tiêu"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Hoàn thành</span>
                      </button>
                    )}

                    {/* Nút Kích hoạt nếu đang là PLANNED */}
                    {goal.status === 'PLANNED' && (
                      <button
                        type="button"
                        onClick={() => handleActivateGoal(goal)}
                        title="Kích hoạt mục tiêu này thành ACTIVE"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-600 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <Play className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500" />
                        <span>Kích hoạt</span>
                      </button>
                    )}

                    {/* Nút Chỉnh sửa trực tiếp */}
                    <button
                      type="button"
                      onClick={() => startEditInline(goal)}
                      title="Chỉnh sửa mục tiêu"
                      className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors cursor-pointer"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {/* Nút Xoá trực tiếp */}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(goal.id)}
                      title="Xóa mục tiêu này"
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Body: Metric Comparison Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Cân nặng bắt đầu
                    </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm mt-0.5 block">
                      {goal.startWeight} kg
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Cân nặng mục tiêu
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                        {goal.targetWeight} kg
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${
                          isLoss ? 'text-emerald-600' : 'text-blue-600'
                        }`}
                      >
                        ({isLoss ? '' : '+'}
                        {weightDelta.toFixed(1)}kg)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Cân nặng đạt được
                    </span>
                    <span
                      className={`font-bold text-sm mt-0.5 block ${
                        goal.endWeight
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400 italic font-normal'
                      }`}
                    >
                      {goal.endWeight ? `${goal.endWeight} kg` : 'Chưa ghi nhận'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-medium block">
                      Thời hạn giai đoạn
                    </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs mt-0.5 block">
                      {formatDateDisplay(goal.startDate)} → {formatDateDisplay(goal.endDate)}
                    </span>
                    {goal.actualEndDate && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block">
                        Đạt ngày: {formatDateDisplay(goal.actualEndDate)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Note if available */}
                {goal.note && (
                  <div className="p-2.5 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                    <FileText className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-[11px]">{goal.note}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
