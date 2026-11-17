import { useState } from 'react';
import {
  X,
  Check,
  ShieldCheck,
  Zap,
  QrCode,
  Copy,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import type { SubscriptionPlan } from '../../../types/subscriptionPlan';

interface UpgradePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: SubscriptionPlan | null;
  currentStudentCount: number;
}

export default function UpgradePlanModal({
  isOpen,
  onClose,
  plan,
  currentStudentCount,
}: UpgradePlanModalProps) {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !plan) return null;

  const formatVnd = (val: number) => {
    if (val === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText('0901234567 - Techcombank - NGUYEN KHAC SON');
    setCopied(true);
    toast.success('Đã sao chép thông tin tài khoản thanh toán!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmUpgrade = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        `Yêu cầu nâng cấp lên gói "${plan.name}" đã được ghi nhận! Quản trị viên sẽ kích hoạt trong 5-15 phút.`
      );
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#0c1620] border border-gray-200 dark:border-[#1a2c3d] rounded-3xl shadow-2xl overflow-hidden text-gray-900 dark:text-white">
        {/* Header with gradient banner */}
        <div className="relative p-6 bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
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
            {plan.description || 'Mở rộng quy mô học viên và bứt phá hiệu suất huấn luyện cùng ZenFit.'}
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
                <span>Hỗ trợ kỹ thuật ưu tiên 24/7 từ đội ngũ ZenFit</span>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {plan.price > 0 && (
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs uppercase">
                  <QrCode className="w-4 h-4" /> Thanh toán chuyển khoản nhanh
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  <Copy className="w-3 h-3" /> {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>

              <div className="text-xs space-y-1 text-gray-700 dark:text-gray-300">
                <p>
                  <strong>Ngân hàng:</strong> Techcombank (Chi nhánh Hà Nội)
                </p>
                <p>
                  <strong>Số tài khoản:</strong>{' '}
                  <code className="px-1.5 py-0.5 rounded bg-white dark:bg-black/30 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    19038291029011
                  </code>
                </p>
                <p>
                  <strong>Chủ tài khoản:</strong> ZENFIT PLATFORM CO.
                </p>
                <p>
                  <strong>Nội dung:</strong>{' '}
                  <code className="px-1.5 py-0.5 rounded bg-white dark:bg-black/30 font-mono text-purple-600 dark:text-purple-400 font-semibold">
                    ZENFIT {plan.code}
                  </code>
                </p>
              </div>
            </div>
          )}

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
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl transition-colors"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handleConfirmUpgrade}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-xs font-bold text-black bg-[#00d68f] hover:bg-[#00c080] rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-current" />
                {plan.price === 0 ? 'Xác nhận chọn gói' : 'Xác nhận & Nâng cấp'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
