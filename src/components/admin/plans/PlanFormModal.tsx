import { useState, useEffect, type FormEvent } from 'react';
import {
  X,
  Sparkles,
  Check,
  Star,
  Users,
  Calendar,
  Layers,
  FileText,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import subscriptionPlanApi from '../../../api/subscriptionPlanApi';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  SubscriptionPlanStatus,
} from '../../../types/subscriptionPlan';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  planToEdit?: SubscriptionPlan | null;
}

export default function PlanFormModal({
  isOpen,
  onClose,
  onSuccess,
  planToEdit,
}: PlanFormModalProps) {
  const isEdit = !!planToEdit;

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [maxStudents, setMaxStudents] = useState<number>(5);
  const [maxTrainingSessions, setMaxTrainingSessions] = useState<number>(0);
  const [status, setStatus] = useState<SubscriptionPlanStatus>('ACTIVE');
  const [isDefault, setIsDefault] = useState<boolean>(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset or populate form when modal opens or planToEdit changes
  useEffect(() => {
    if (planToEdit) {
      setCode(planToEdit.code);
      setName(planToEdit.name);
      setDescription(planToEdit.description || '');
      setPrice(planToEdit.price);
      setDurationDays(planToEdit.durationDays);
      setMaxStudents(planToEdit.maxStudents);
      setMaxTrainingSessions(planToEdit.maxTrainingSessions || 0);
      setStatus(planToEdit.status);
      setIsDefault(planToEdit.isDefault);
      setDisplayOrder(planToEdit.displayOrder);
    } else {
      setCode('');
      setName('');
      setDescription('');
      setPrice(0);
      setDurationDays(30);
      setMaxStudents(5);
      setMaxTrainingSessions(0);
      setStatus('ACTIVE');
      setIsDefault(false);
      setDisplayOrder(1);
    }
    setErrors({});
  }, [planToEdit, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!isEdit) {
      const codeRegex = /^[A-Z0-9_-]{2,30}$/;
      if (!code.trim()) {
        errs.code = 'Mã gói không được để trống';
      } else if (!codeRegex.test(code.trim().toUpperCase())) {
        errs.code = 'Mã gói chỉ gồm 2-30 ký tự chữ in hoa, số, gạch ngang (-) hoặc gạch dưới (_)';
      }
    }

    if (!name.trim()) {
      errs.name = 'Tên gói không được để trống';
    } else if (name.trim().length > 100) {
      errs.name = 'Tên gói tối đa 100 ký tự';
    }

    if (price < 0) {
      errs.price = 'Giá gói không được nhỏ hơn 0';
    }

    if (durationDays < 1) {
      errs.durationDays = 'Chu kỳ sử dụng tối thiểu 1 ngày';
    }

    if (maxStudents < 0) {
      errs.maxStudents = 'Giới hạn học viên không được nhỏ hơn 0';
    }

    if (maxTrainingSessions < 0) {
      errs.maxTrainingSessions = 'Giới hạn buổi tập không được nhỏ hơn 0';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      if (isEdit && planToEdit) {
        const updateData: UpdateSubscriptionPlanRequest = {
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          durationDays: Number(durationDays),
          maxStudents: Number(maxStudents),
          maxTrainingSessions: Number(maxTrainingSessions),
          isDefault,
          displayOrder: Number(displayOrder),
        };
        await subscriptionPlanApi.updatePlan(planToEdit.id, updateData);

        // Nếu trạng thái thay đổi, cập nhật thêm status
        if (status !== planToEdit.status) {
          await subscriptionPlanApi.updatePlanStatus(planToEdit.id, { status });
        }

        toast.success(`Cập nhật gói "${name}" thành công!`);
      } else {
        const createData: CreateSubscriptionPlanRequest = {
          code: code.trim().toUpperCase(),
          name: name.trim(),
          description: description.trim() || undefined,
          price: Number(price),
          durationDays: Number(durationDays),
          maxStudents: Number(maxStudents),
          maxTrainingSessions: Number(maxTrainingSessions),
          status,
          isDefault,
          displayOrder: Number(displayOrder),
        };
        await subscriptionPlanApi.createPlan(createData);
        toast.success(`Tạo mới gói "${name}" thành công!`);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = errRes?.message || 'Có lỗi xảy ra khi lưu gói dịch vụ. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper format VND
  const formatVnd = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-[#120826] border border-purple-500/20 rounded-2xl shadow-2xl text-white overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/15 bg-gradient-to-r from-purple-900/30 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? 'Chỉnh sửa Gói dịch vụ' : 'Thêm mới Gói dịch vụ PT'}
              </h2>
              <p className="text-xs text-purple-300/70">
                {isEdit
                  ? `Cập nhật thông số và hạn mức cho gói ${planToEdit?.code}`
                  : 'Thiết lập mã gói, hạn mức học viên và chu kỳ dịch vụ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-purple-300/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
          {/* Row 1: Code & Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Mã gói dịch vụ (Code) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled={isEdit}
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="VD: FREE_TIER, PLUS_MONTHLY"
                  className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border ${
                    errors.code ? 'border-red-500' : 'border-purple-500/20'
                  } focus:outline-none focus:border-purple-400 text-white placeholder-purple-300/30 uppercase ${
                    isEdit ? 'opacity-60 cursor-not-allowed bg-purple-950/30' : ''
                  }`}
                />
              </div>
              {errors.code ? (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.code}
                </p>
              ) : (
                <p className="text-[11px] text-purple-300/50 mt-1">
                  {isEdit ? 'Mã gói cố định không được thay đổi' : '2-30 ký tự: chữ hoa, số, _, -'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Tên gói hiển thị <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Gói Khởi Nghiệp (Free), Gói Pro"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border ${
                  errors.name ? 'border-red-500' : 'border-purple-500/20'
                } focus:outline-none focus:border-purple-400 text-white placeholder-purple-300/30`}
              />
              {errors.name && (
                <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-purple-400" /> Mô tả gói dịch vụ
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Dành cho PT mới bắt đầu hoặc quản lý số lượng học viên nhỏ..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border border-purple-500/20 focus:outline-none focus:border-purple-400 text-white placeholder-purple-300/30 resize-none"
            />
          </div>

          {/* Row 2: Price & DurationDays */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#170a32] border border-purple-500/15">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Giá cước (VND) <span className="text-red-400">*</span>
                </span>
                <span className="text-[11px] text-emerald-400 font-semibold">
                  {price === 0 ? 'Miễn phí' : formatVnd(price)}
                </span>
              </label>
              <input
                type="number"
                min={0}
                step={1000}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border ${
                  errors.price ? 'border-red-500' : 'border-purple-500/20'
                } focus:outline-none focus:border-purple-400 text-white`}
              />
              {errors.price && (
                <p className="text-xs text-red-400 mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" /> Chu kỳ dịch vụ (Ngày) <span className="text-red-400">*</span>
                </span>
                <span className="text-[11px] text-purple-300/60">
                  {durationDays >= 365
                    ? `${(durationDays / 365).toFixed(1)} năm`
                    : `${durationDays} ngày`}
                </span>
              </label>
              <input
                type="number"
                min={1}
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border ${
                  errors.durationDays ? 'border-red-500' : 'border-purple-500/20'
                } focus:outline-none focus:border-purple-400 text-white`}
              />
              {errors.durationDays && (
                <p className="text-xs text-red-400 mt-1">{errors.durationDays}</p>
              )}
            </div>
          </div>

          {/* Row 3: MaxStudents & MaxTrainingSessions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[#170a32] border border-purple-500/15">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-purple-400" /> Giới hạn học viên (Max) <span className="text-red-400">*</span>
                </span>
                <span className="text-[11px] font-semibold text-purple-300">
                  {maxStudents} học viên
                </span>
              </label>
              <input
                type="number"
                min={0}
                value={maxStudents}
                onChange={(e) => setMaxStudents(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border ${
                  errors.maxStudents ? 'border-red-500' : 'border-purple-500/20'
                } focus:outline-none focus:border-purple-400 text-white`}
              />
              <p className="text-[11px] text-purple-300/50 mt-1">
                Số học viên tối đa PT được quản lý trong gói này
              </p>
              {errors.maxStudents && (
                <p className="text-xs text-red-400 mt-1">{errors.maxStudents}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Buổi tập tối đa / chu kỳ
                </span>
                <span className="text-[11px] text-purple-300/60">
                  {maxTrainingSessions === 0 ? 'Không giới hạn' : `${maxTrainingSessions} buổi`}
                </span>
              </label>
              <input
                type="number"
                min={0}
                value={maxTrainingSessions}
                onChange={(e) => setMaxTrainingSessions(Number(e.target.value))}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border ${
                  errors.maxTrainingSessions ? 'border-red-500' : 'border-purple-500/20'
                } focus:outline-none focus:border-purple-400 text-white`}
              />
              <p className="text-[11px] text-purple-300/50 mt-1">
                Điền 0 nếu không giới hạn số buổi tập
              </p>
            </div>
          </div>

          {/* Row 4: Status & Display Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Trạng thái hiển thị
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as SubscriptionPlanStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border border-purple-500/20 focus:outline-none focus:border-purple-400 text-white"
              >
                <option value="ACTIVE">🟢 Đang hoạt động (ACTIVE)</option>
                <option value="INACTIVE">⚪ Tạm ẩn / Ngừng kinh doanh (INACTIVE)</option>
                <option value="ARCHIVED">🔴 Lưu trữ / Đóng gói (ARCHIVED)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-purple-200 mb-1.5">
                Thứ tự sắp xếp (Display Order)
              </label>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0d38] border border-purple-500/20 focus:outline-none focus:border-purple-400 text-white"
              />
              <p className="text-[11px] text-purple-300/50 mt-1">
                Số nhỏ hơn sẽ hiển thị trước trên bảng giá
              </p>
            </div>
          </div>

          {/* Checkbox: Gói mặc định miễn phí */}
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/25 flex items-start gap-3">
            <input
              type="checkbox"
              id="isDefaultPlan"
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-purple-500/30 text-purple-600 focus:ring-purple-500 bg-[#1b0d38] cursor-pointer"
            />
            <label htmlFor="isDefaultPlan" className="text-xs text-purple-200 cursor-pointer select-none">
              <span className="font-semibold text-amber-300 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
                Đặt làm gói mặc định miễn phí cho PT mới
              </span>
              <p className="text-[11px] text-purple-300/70 mt-1 leading-relaxed">
                Khi kích hoạt, hệ thống sẽ tự động gán gói này cho mọi Huấn luyện viên mới đăng ký. Gói mặc định cũ sẽ tự động được gỡ cờ mặc định.
              </p>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-purple-500/15 bg-[#0e0620]">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                {isEdit ? 'Lưu thay đổi' : 'Tạo gói dịch vụ'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
