import { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SubscriptionPlan, UserSubscriptionResponse } from '../../../types/subscription';
import subscriptionPlanApi from '../../../api/subscriptionPlanApi';
import { useAuth } from '../../../context/AuthContext';
import PaymentQRModal from '../../subscription/PaymentQRModal';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  currentStudentCount: number;
  onPlanActivated?: () => void;
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  plan,
  currentStudentCount,
  onPlanActivated,
}: UpgradePlanModalProps) {
  const { user, setSubscriptionConfirmed } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<UserSubscriptionResponse | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  if (!isOpen || !plan) return null;

  const formatVnd = (val: number) => {
    if (val === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleConfirmUpgrade = async () => {
    setIsSubmitting(true);
    try {
      const data = await subscriptionPlanApi.selectSubscription({
        planId: plan.id,
        autoRenew: false,
      });

      // 1. Nếu là gói miễn phí / kích hoạt trực tiếp
      if (data.status === 'ACTIVE' || !data.price || data.price === 0) {
        setSubscriptionConfirmed(true);
        toast.success(`Kích hoạt gói "${plan.name}" thành công!`);
        onPlanActivated?.();
        onClose();
        return;
      }

      // 2. Gói trả phí: Mở Modal quét mã QR PayOS
      setSubscriptionData(data);
      setIsQRModalOpen(true);
    } catch (err: unknown) {
      console.error('Lỗi khi nâng cấp gói:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        'Không thể xử lý yêu cầu nâng cấp gói. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1620] border border-gray-200 dark:border-[#1a2c3d] rounded-3xl shadow-2xl overflow-hidden text-gray-900 dark:text-white">
          {/* Header with gradient banner */}
          <div className="relative p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md">
                Nâng cấp tài nguyên PT
              </span>
              {plan.isDefault && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-400 text-black">
                  Gói mặc định
                </span>
              )}
            </div>

            <h2 className="text-2xl font-black tracking-tight">{plan.name}</h2>
            <p className="text-xs text-white/80 mt-1 line-clamp-2">
              {plan.description ||
                'Mở rộng quy mô học viên và bứt phá hiệu suất huấn luyện cùng ZenFit.'}
            </p>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{formatVnd(plan.price)}</span>
              <span className="text-xs text-white/80">/ {plan.durationDays} ngày</span>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 space-y-5 text-xs sm:text-sm">
            {/* Plan Highlights */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-[#132230] border border-gray-100 dark:border-[#1c3247] space-y-2.5">
              <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5 text-xs uppercase tracking-wider text-emerald-600 dark:text-[#00d68f]">
                <Sparkles className="w-4 h-4" /> Quyền lợi gói dịch vụ
              </h4>
              <div className="space-y-2 pt-1 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Quản lý tối đa{' '}
                    <strong className="text-gray-900 dark:text-white">
                      {plan.maxStudents} học viên
                    </strong>{' '}
                    (Hiện có: {currentStudentCount} học viên)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    {plan.maxTrainingSessions && plan.maxTrainingSessions > 0
                      ? `Tối đa ${plan.maxTrainingSessions} buổi tập / chu kỳ`
                      : 'Không giới hạn số buổi tập lên lịch'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Đo lường tiến độ học viên, biểu đồ số đo & thể hình chuyên sâu</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Cổng thanh toán tự động PayOS và kích hoạt tức thì qua mã QR VietQR</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>
                Kích hoạt tự động ngay sau khi xác nhận thanh toán. Có thể nâng cấp gói bất kỳ lúc nào.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 dark:border-[#1a2c3d] bg-gray-50/50 dark:bg-[#081017]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors cursor-pointer"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleConfirmUpgrade}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs font-bold text-black bg-[#00d68f] hover:bg-[#00c080] rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-current" />
                  {plan.price === 0 ? 'Xác nhận chọn gói' : 'Thanh toán qua PayOS QR'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* PayOS QR Modal */}
      <PaymentQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        subscriptionData={subscriptionData}
        userId={user?.id || ''}
        onSuccess={() => {
          setIsQRModalOpen(false);
          setSubscriptionConfirmed(true);
          toast.success('Nâng cấp gói dịch vụ thành công! Tài nguyên mới đã sẵn sàng.');
          onPlanActivated?.();
          onClose();
        }}
      />
    </>
  );
}
