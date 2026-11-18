import { useState, useEffect } from 'react';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Star,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import subscriptionPlanApi from '../../api/subscriptionPlanApi';
import clientApi from '../../api/clientApi';
import type { SubscriptionPlan } from '../../types/subscriptionPlan';
import UpgradePlanModal from '../../components/pt/subscription/UpgradePlanModal';
import { useAuth } from '../../context/AuthContext';

export default function PTSubscriptionPricingPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [defaultPlan, setDefaultPlan] = useState<SubscriptionPlan | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Selected Plan for Upgrade Modal
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<SubscriptionPlan | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);

  // Fetch plans & current client count
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [activePlans, defPlan, clients] = await Promise.all([
        subscriptionPlanApi.getActivePlans().catch(() => []),
        subscriptionPlanApi.getDefaultPlan().catch(() => null),
        clientApi.getAllClients().catch(() => []),
      ]);

      setPlans(activePlans);
      setDefaultPlan(defPlan);
      setStudentCount(clients.length);
    } catch {
      toast.error('Không thể tải thông tin bảng giá. Vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Determine current PT plan:
  // If user has a plan code/id stored or defaults to defaultPlan, or the first free plan
  const currentPlan = defaultPlan || plans.find((p) => p.isDefault) || plans[0] || null;
  const maxAllowedStudents = currentPlan?.maxStudents ?? 5;
  const usagePercentage = Math.min(
    100,
    Math.round((studentCount / (maxAllowedStudents || 1)) * 100)
  );
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = studentCount >= maxAllowedStudents;

  // Currency Formatter
  const formatVnd = (val: number) => {
    if (val === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const handleOpenUpgrade = (plan: SubscriptionPlan) => {
    setSelectedPlanForUpgrade(plan);
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in">
      {/* Page Title & Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00d68f] text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Bảng giá & Hạn mức Huấn luyện viên
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Nâng cấp quy mô, bứt phá thu nhập cùng ZenFit
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
          Tối ưu hóa quản lý học viên, lịch tập và bài tập với các gói đăng ký linh hoạt được thiết kế riêng cho Huấn luyện viên chuyên nghiệp.
        </p>
      </div>

      {/* PT Current Status Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-[#0e1f2b] to-[#0c1620] border border-emerald-500/30 p-6 sm:p-8 text-white shadow-2xl">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-[#00d68f] flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5" /> Gói hiện tại của bạn
              </span>
              <span className="text-xs text-gray-400">
                • {user?.name || user?.username || 'Huấn luyện viên'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              {currentPlan?.name || 'Gói Khởi Nghiệp (Free)'}
              {currentPlan?.isDefault && (
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 font-medium">
                  Mặc định hệ thống
                </span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              Bạn đang quản lý{' '}
              <strong className="text-white font-bold">{studentCount} học viên</strong> trong tổng số tối đa{' '}
              <strong className="text-[#00d68f] font-bold">{maxAllowedStudents} học viên</strong> được cấp phép.
            </p>

            {/* Warning Message if near/at limit */}
            {isAtLimit ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                Bạn đã đạt giới hạn học viên tối đa! Hãy nâng cấp gói để tiếp tục thêm học viên mới.
              </div>
            ) : isNearLimit ? (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                Bạn đã sử dụng {usagePercentage}% hạn mức học viên. Hãy sẵn sàng nâng cấp!
              </div>
            ) : null}
          </div>

          {/* Progress Bar & Quick Stats */}
          <div className="w-full lg:w-80 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-gray-300">Học viên đang quản lý</span>
              <span
                className={`font-mono text-sm ${
                  isAtLimit
                    ? 'text-red-400'
                    : isNearLimit
                      ? 'text-amber-400'
                      : 'text-[#00d68f]'
                }`}
              >
                {studentCount} / {maxAllowedStudents} ({usagePercentage}%)
              </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAtLimit
                    ? 'bg-gradient-to-r from-red-500 to-rose-600'
                    : isNearLimit
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                      : 'bg-gradient-to-r from-emerald-400 to-[#00d68f]'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>

            <p className="text-[11px] text-gray-400 text-center">
              Còn lại{' '}
              <strong className="text-white">
                {Math.max(0, maxAllowedStudents - studentCount)} chỗ trống
              </strong>{' '}
              cho học viên mới
            </p>
          </div>
        </div>
      </div>

      {/* Section Subtitle */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Danh sách các gói dịch vụ sẵn sàng nâng cấp
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Chọn gói cước phù hợp với mục tiêu phát triển học viên của bạn.
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={isLoading}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:text-black dark:hover:text-white transition-colors"
          title="Làm mới"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Grid of Pricing Cards */}
      {isLoading ? (
        <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-3 border-[#00d68f] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Đang tải danh sách gói cước...</span>
        </div>
      ) : plans.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-gray-50 dark:bg-[#0c1620] border border-gray-200 dark:border-gray-800 text-gray-500">
          Chưa có gói cước nào được kích hoạt trên hệ thống.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, index) => {
            const isCurrent =
              currentPlan?.id === plan.id ||
              (currentPlan?.code && currentPlan.code === plan.code);
            const isPopular =
              !plan.isDefault && (index === 1 || plan.code.includes('PLUS') || plan.code.includes('PRO'));

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl transition-all duration-300 backdrop-blur-xl ${
                  isPopular
                    ? 'bg-white dark:bg-[#0c1924] border-2 border-[#00d68f] shadow-2xl shadow-emerald-500/10 lg:-translate-y-2'
                    : 'bg-white dark:bg-[#0c1620] border border-gray-200 dark:border-[#1a2c3d] shadow-lg hover:border-emerald-500/40'
                }`}
              >
                {/* Popular or Default Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00d68f] text-black font-extrabold text-[11px] uppercase tracking-wider shadow-md">
                    🔥 Phổ biến nhất
                  </div>
                )}
                {plan.isDefault && !isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-400 text-black font-bold text-[11px] uppercase tracking-wider shadow-md flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Gói mặc định
                  </div>
                )}

                {/* Card Header */}
                <div className="p-6 sm:p-7 border-b border-gray-100 dark:border-[#172736]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xl font-black text-gray-900 dark:text-white">
                      {plan.name}
                    </h4>
                    <code className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-black/40 text-gray-600 dark:text-gray-400">
                      {plan.code}
                    </code>
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400 min-h-[36px] line-clamp-2">
                    {plan.description || 'Gói dịch vụ hỗ trợ đầy đủ công cụ quản lý học viên chuyên nghiệp.'}
                  </p>

                  <div className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                      {formatVnd(plan.price)}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      / {plan.durationDays} ngày
                    </span>
                  </div>
                </div>

                {/* Feature List */}
                <div className="flex-1 p-6 sm:p-7 space-y-3.5 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      Quản lý tối đa{' '}
                      <strong className="text-gray-900 dark:text-white font-bold text-sm">
                        {plan.maxStudents} học viên
                      </strong>{' '}
                      cùng lúc
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>
                      {plan.maxTrainingSessions && plan.maxTrainingSessions > 0
                        ? `${plan.maxTrainingSessions} buổi tập lên lịch / chu kỳ`
                        : 'Không giới hạn buổi tập lên lịch'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Theo dõi chỉ số số đo, cân nặng & tiến độ học viên</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Soạn giáo án tập luyện & thực đơn dinh dưỡng chuẩn</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 dark:text-[#00d68f] flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Báo cáo doanh thu & hợp đồng đào tạo PT</span>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="p-6 sm:p-7 pt-0">
                  {isCurrent ? (
                    <button
                      type="button"
                      disabled
                      className="w-full py-3 rounded-2xl bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 font-bold text-xs flex items-center justify-center gap-2 cursor-default border border-gray-200 dark:border-white/10"
                    >
                      <Check className="w-4 h-4 text-emerald-500" />
                      Gói đang sử dụng
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleOpenUpgrade(plan)}
                      className={`w-full py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 shadow-lg ${
                        isPopular
                          ? 'bg-[#00d68f] hover:bg-[#00c080] text-black shadow-emerald-500/25'
                          : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 dark:text-[#00d68f] border border-emerald-500/30'
                      }`}
                    >
                      <Zap className="w-4 h-4 fill-current" />
                      Nâng cấp ngay
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAQ / Assurance Section */}
      <div className="mt-12 rounded-3xl bg-gray-50 dark:bg-[#0c1620] border border-gray-200 dark:border-gray-800 p-8 space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-500" />
          Câu hỏi thường gặp về Gói dịch vụ & Hạn mức
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm text-gray-600 dark:text-gray-300">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#132230] border border-gray-100 dark:border-gray-800 space-y-1.5">
            <h5 className="font-bold text-gray-900 dark:text-white">
              1. Chuyện gì xảy ra khi tôi đạt đủ số học viên tối đa?
            </h5>
            <p className="leading-relaxed">
              Bạn vẫn tiếp tục quản lý, lên lịch và ghi nhận tiến độ cho các học viên hiện tại bình thường. Tuy nhiên, bạn sẽ cần nâng cấp lên gói cao hơn để thêm học viên mới.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#132230] border border-gray-100 dark:border-gray-800 space-y-1.5">
            <h5 className="font-bold text-gray-900 dark:text-white">
              2. Gói mặc định miễn phí có thời hạn bao lâu?
            </h5>
            <p className="leading-relaxed">
              Gói mặc định miễn phí được áp dụng tự động cho mọi PT mới và có chu kỳ dài hạn (thường là 365 hoặc 3650 ngày) để bạn có thể trải nghiệm toàn diện nền tảng ZenFit.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#132230] border border-gray-100 dark:border-gray-800 space-y-1.5">
            <h5 className="font-bold text-gray-900 dark:text-white">
              3. Tôi có thể nâng cấp giữa chu kỳ sử dụng không?
            </h5>
            <p className="leading-relaxed">
              Có! Bạn có thể nâng cấp bất kỳ lúc nào. Hạn mức học viên mới sẽ được áp dụng ngay lập tức sau khi xác nhận thanh toán.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#132230] border border-gray-100 dark:border-gray-800 space-y-1.5">
            <h5 className="font-bold text-gray-900 dark:text-white">
              4. Dữ liệu học viên cũ có bị mất khi đổi gói không?
            </h5>
            <p className="leading-relaxed">
              Hoàn toàn không. Toàn bộ lịch tập, hợp đồng, số đo và hồ sơ học viên của bạn đều được mã hóa và bảo toàn nguyên vẹn 100%.
            </p>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradePlanModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        plan={selectedPlanForUpgrade}
        currentStudentCount={studentCount}
        onPlanActivated={loadData}
      />
    </div>
  );
}
