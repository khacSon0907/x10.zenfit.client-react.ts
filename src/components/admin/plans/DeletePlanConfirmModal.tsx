import { useState } from 'react';
import { AlertTriangle, Trash2, X, Star } from 'lucide-react';
import { toast } from 'sonner';
import subscriptionPlanApi from '../../../api/subscriptionPlanApi';
import type { SubscriptionPlan } from '../../../types/subscriptionPlan';

interface DeletePlanConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  plan: SubscriptionPlan | null;
}

export default function DeletePlanConfirmModal({
  isOpen,
  onClose,
  onSuccess,
  plan,
}: DeletePlanConfirmModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !plan) return null;

  const isDefault = plan.isDefault;

  const handleDelete = async () => {
    if (isDefault) {
      toast.error('Không thể xóa gói mặc định của hệ thống!');
      return;
    }

    setIsDeleting(true);
    try {
      await subscriptionPlanApi.deletePlan(plan.id);
      toast.success(`Đã xóa gói "${plan.name}" thành công!`);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = errRes?.message || 'Không thể xóa gói dịch vụ. Vui lòng thử lại sau!';
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-[#120826] border border-red-500/25 rounded-2xl shadow-2xl text-white overflow-hidden p-6">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-purple-300/60 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 text-red-400 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>

          <h3 className="text-lg font-bold text-white mb-2">
            Xác nhận xóa gói dịch vụ?
          </h3>

          <p className="text-xs text-purple-200/80 mb-4 leading-relaxed">
            Bạn có chắc chắn muốn xóa gói{' '}
            <span className="font-semibold text-white">"{plan.name}"</span> (Mã:{' '}
            <code className="text-purple-300 bg-purple-900/40 px-1.5 py-0.5 rounded">
              {plan.code}
            </code>
            )? Hành động này không thể hoàn tác.
          </p>

          {isDefault && (
            <div className="w-full p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs mb-5 flex items-center gap-2 text-left">
              <Star className="w-4 h-4 fill-amber-300 shrink-0" />
              <span>
                <strong>Gói mặc định:</strong> Gói này đang được thiết lập là gói miễn phí mặc định cho hệ thống. Bạn cần gán gói khác làm mặc định trước khi có thể xóa.
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 w-full mt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 text-xs font-medium text-purple-300 hover:text-white rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/20 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || isDefault}
              className={`flex-1 px-4 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all ${
                isDefault
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                  : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/50'
              }`}
            >
              {isDeleting ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDefault ? 'Đã khóa xóa' : 'Xác nhận xóa'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

