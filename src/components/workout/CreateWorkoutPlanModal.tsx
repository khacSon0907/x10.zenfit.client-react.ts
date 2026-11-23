import React, { useState, useEffect } from 'react';
import {
  X,
  Dumbbell,
  Calendar,
  User,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { workoutPlanService } from '../../services/workoutPlanService';
import { clientApi } from '../../api/clientApi';
import { useAuth } from '../../context/AuthContext';
import type {
  WorkoutPlan,
  WorkoutPlanStatus,
  WorkoutDayRequest,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
} from '../../types/workoutPlan';
import {
  WORKOUT_PLAN_STATUS_CONFIG,
  WORKOUT_TEMPLATES,
} from '../../types/workoutPlan';
import type { ClientResponse } from '../../types/client.types';

interface CreateWorkoutPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  planToEdit?: WorkoutPlan | null;
  defaultClientId?: string;
  onSaved: (plan: WorkoutPlan) => void;
}

export default function CreateWorkoutPlanModal({
  isOpen,
  onClose,
  planToEdit,
  defaultClientId,
  onSaved,
}: CreateWorkoutPlanModalProps) {
  const { user: authUser } = useAuth();
  const isEditing = Boolean(planToEdit);

  // Form states
  const [clientId, setClientId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<WorkoutPlanStatus>('ACTIVE');

  // Template selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('push_pull_legs');
  const [trainingDays, setTrainingDays] = useState<WorkoutDayRequest[]>([]);

  // UI states
  const [clients, setClients] = useState<ClientResponse[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or fill data
  useEffect(() => {
    if (!isOpen) return;

    // Load clients
    const loadClients = async () => {
      try {
        setLoadingClients(true);
        const data = await clientApi.getAllClients(authUser?.id);
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
      setSelectedTemplateId('custom');
      setTrainingDays([]);
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

      // Default apply first template (Push - Pull - Legs)
      const defaultTmpl = WORKOUT_TEMPLATES[0];
      setSelectedTemplateId(defaultTmpl.id);
      setName(`Giáo án ${defaultTmpl.name}`);
      setDescription(defaultTmpl.description);
      setTrainingDays(JSON.parse(JSON.stringify(defaultTmpl.trainingDays)));
    }
    setErrors({});
  }, [isOpen, planToEdit, defaultClientId, authUser?.id]);

  if (!isOpen) return null;

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    if (templateId === 'custom') {
      setTrainingDays([]);
      return;
    }
    const tmpl = WORKOUT_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      if (!name || name.startsWith('Giáo án')) {
        setName(`Giáo án ${tmpl.name}`);
      }
      if (!description) {
        setDescription(tmpl.description);
      }
      setTrainingDays(JSON.parse(JSON.stringify(tmpl.trainingDays)));
      toast.info(`Đã áp dụng mẫu: ${tmpl.name}`, {
        description: `Bao gồm ${tmpl.trainingDays.length} ngày tập với các bài tập gợi ý chuẩn form.`,
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!name.trim()) {
      errs.name = 'Vui lòng nhập tên giáo án';
    }
    if (!isEditing && !clientId) {
      errs.clientId = 'Vui lòng chọn học viên';
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errs.endDate = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu';
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
        const updatePayload: UpdateWorkoutPlanRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          status,
        };
        const res = await workoutPlanService.updatePlan(planToEdit.id, updatePayload);
        toast.success('Cập nhật giáo án tập luyện thành công!');
        onSaved(res.data);
      } else {
        const createPayload: CreateWorkoutPlanRequest = {
          clientId,
          name: name.trim(),
          description: description.trim() || undefined,
          startDate,
          endDate,
          status,
          trainingDays: trainingDays.length > 0 ? trainingDays : undefined,
        };
        const res = await workoutPlanService.createPlan(createPayload);
        toast.success('Tạo giáo án tập luyện mới thành công!');
        onSaved(res.data);
      }
      onClose();
    } catch (err: unknown) {
      console.error('Save workout plan error:', err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Không thể lưu giáo án. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalExercisesCount = trainingDays.reduce(
    (sum, d) => sum + (d.exercises?.length || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-[#1E293B] rounded-3xl shadow-2xl overflow-hidden my-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#111827]/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                {isEditing ? 'Chỉnh sửa Giáo án Tập luyện' : 'Tạo Giáo án Tập luyện Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                {isEditing
                  ? 'Cập nhật tên, thời gian áp dụng và trạng thái giáo án'
                  : 'Thiết lập lộ trình phân chia buổi tập (Split) cho học viên'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Quick Split Templates (chỉ hiển thị khi tạo mới) */}
          {!isEditing && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Chọn nhanh Mẫu Lịch tập (Split Templates)</span>
                </span>
                <span className="text-[11px] text-slate-400 font-normal">
                  Tự động điền ngày & bài tập gợi ý
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WORKOUT_TEMPLATES.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  const exercisesCount = tmpl.trainingDays.reduce(
                    (acc, d) => acc + (d.exercises?.length || 0),
                    0
                  );
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                          : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-xs text-white">{tmpl.name}</div>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                        {tmpl.description}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium mt-2 pt-1 border-t border-slate-800/60">
                        <span className="text-emerald-400 font-semibold">
                          {tmpl.trainingDays.length} buổi tập
                        </span>
                        {exercisesCount > 0 && (
                          <>
                            <span>•</span>
                            <span className="text-blue-400">{exercisesCount} bài tập mẫu</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Tự thiết kế tùy biến */}
                <div
                  onClick={() => handleSelectTemplate('custom')}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTemplateId === 'custom'
                      ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md shadow-emerald-500/10'
                      : 'bg-[#111827] border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-xs text-white">Tự thiết kế tùy biến (Trống)</div>
                    {selectedTemplateId === 'custom' && (
                      <div className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Bắt đầu với giáo án trống, tự thêm các buổi tập và bài tập sau khi tạo.
                  </p>
                  <div className="text-[10px] text-slate-400 font-medium mt-2 pt-1 border-t border-slate-800/60">
                    <span className="text-slate-400">0 buổi tập mẫu</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chọn Học viên */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Học viên áp dụng <span className="text-rose-400">*</span>
            </label>
            {isEditing ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#111827] border border-slate-800 text-slate-300 text-sm">
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
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border ${
                    errors.clientId ? 'border-rose-500' : 'border-slate-700/80 focus:border-emerald-500'
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

          {/* Tên giáo án */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Tên giáo án <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              placeholder="VD: Giáo án Tăng cơ Giảm mỡ 8 tuần - Lịch 4 buổi"
              className={`w-full px-3.5 py-2.5 rounded-xl bg-[#111827] border ${
                errors.name ? 'border-rose-500' : 'border-slate-700/80 focus:border-emerald-500'
              } text-white text-sm focus:outline-none transition-colors placeholder:text-slate-600`}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Mô tả giáo án */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Mục tiêu & Hướng dẫn cho học viên
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Tập đúng kỹ thuật, khởi động 10 phút trước mỗi buổi tập, uống đủ 2.5L nước..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-white text-sm focus:outline-none transition-colors placeholder:text-slate-600 resize-none"
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
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-white text-xs focus:outline-none transition-colors"
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
                  className={`w-full pl-9 pr-3 py-2 rounded-xl bg-[#111827] border ${
                    errors.endDate ? 'border-rose-500' : 'border-slate-700/80 focus:border-emerald-500'
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
                onChange={(e) => setStatus(e.target.value as WorkoutPlanStatus)}
                className="w-full px-3 py-2 rounded-xl bg-[#111827] border border-slate-700/80 focus:border-emerald-500 text-white text-xs focus:outline-none transition-colors"
              >
                {(Object.keys(WORKOUT_PLAN_STATUS_CONFIG) as WorkoutPlanStatus[]).map((st) => (
                  <option key={st} value={st}>
                    {WORKOUT_PLAN_STATUS_CONFIG[st].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Template preview badge */}
          {!isEditing && trainingDays.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#111827] border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Cấu trúc ngày tập sẽ được tạo tự động:</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-bold">
                  {trainingDays.length} buổi • {totalExercisesCount} bài tập
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {trainingDays.map((d) => (
                  <span
                    key={d.dayNumber}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700/80 text-[11px] text-slate-200"
                  >
                    <span>{d.dayName}</span>
                    <span className="text-[10px] text-slate-400">
                      ({d.exercises?.length || 0} bài)
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isEditing ? 'Cập nhật giáo án' : 'Tạo giáo án'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
