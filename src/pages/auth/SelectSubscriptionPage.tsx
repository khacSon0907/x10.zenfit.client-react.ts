import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Crown,
  Check,
  Zap,
  Sparkles,
  LogOut,
  AlertCircle,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { toast } from 'sonner';
import logo from '../../assets/logo/logo-zenfit.png';
import { useAuth } from '../../context/AuthContext';
import subscriptionPlanApi from '../../api/subscriptionPlanApi';
import type { SubscriptionPlan, UserSubscriptionResponse } from '../../types/subscription';
import PaymentQRModal from '../../components/subscription/PaymentQRModal';

export default function SelectSubscriptionPage() {
  const { user, logout, setSubscriptionConfirmed } = useAuth();
  const navigate = useNavigate();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submittingPlanId, setSubmittingPlanId] = useState<string | null>(null);

  // State cho Modal thanh toán QR PayOS
  const [selectedSubscription, setSelectedSubscription] = useState<UserSubscriptionResponse | null>(null);
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);

  // Fetch danh sách các gói ACTIVE
  const fetchPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const activePlans = await subscriptionPlanApi.getActivePlans();
      // Sắp xếp theo displayOrder
      const sorted = (activePlans || []).sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
      );
      setPlans(sorted);
    } catch (err: unknown) {
      console.error('Lỗi khi tải danh sách gói dịch vụ:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        'Không thể tải danh sách gói dịch vụ. Vui lòng kiểm tra kết nối mạng.';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Format tiền tệ VND
  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Format chu kỳ
  const formatDuration = (days: number) => {
    if (days >= 3650) return 'Dài hạn';
    if (days >= 365) return `${Math.round(days / 365)} năm`;
    if (days >= 30) return `${Math.round(days / 30)} tháng`;
    return `${days} ngày`;
  };

  // Xử lý chọn và kích hoạt gói
  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (submittingPlanId) return;

    setSubmittingPlanId(plan.id);
    try {
      const data = await subscriptionPlanApi.selectSubscription({
        planId: plan.id,
        autoRenew: false,
      });

      // 1. Gói Miễn Phí (status === 'ACTIVE' hoặc price === 0): Kích hoạt ngay
      if (data.status === 'ACTIVE' || !data.price || data.price === 0) {
        setSubscriptionConfirmed(true);
        toast.success(
          `Kích hoạt gói "${plan.name}" thành công! Chào mừng bạn gia nhập ZenFit.`
        );
        navigate('/pt/today', { replace: true });
        return;
      }

      // 2. Gói Trả Phí (status === 'PENDING'): Mở Modal quét mã QR PayOS
      setSelectedSubscription(data);
      setIsQRModalOpen(true);
    } catch (err: unknown) {
      console.error('Lỗi khi chọn gói dịch vụ:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        'Không thể kích hoạt gói dịch vụ. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setSubmittingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* 1. Header tối giản: Không có Sidebar để tránh user bấm thoát ra ngoài */}
      <header className="h-18 border-b border-[#162338] bg-[#0c1626]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 flex items-center justify-center p-1.5 shadow-lg shadow-emerald-500/20">
            <img src={logo} alt="ZenFit Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white block leading-none">
              Zen<span className="text-emerald-400">Fit</span>
            </span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block mt-0.5">
              Khởi đầu huấn luyện
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-white">
              {user?.name || user?.username || 'Huấn luyện viên'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 hover:border-rose-400 text-xs font-semibold transition-colors cursor-pointer"
            title="Đăng xuất khỏi tài khoản"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content: Lựa chọn gói dịch vụ */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {/* Tiêu đề & Lời chào */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Bước kích hoạt tài khoản ban đầu</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Chào mừng bạn đến với ZenFit!
          </h1>

          <p className="text-xs sm:text-base text-slate-400 leading-relaxed">
            Vui lòng chọn một gói dịch vụ phù hợp để bắt đầu sử dụng. Bạn có thể thay đổi hoặc nâng cấp hạn mức bất kỳ lúc nào sau này.
          </p>
        </div>

        {/* Lỗi tải gói nếu có */}
        {error && (
          <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800/60 max-w-lg mx-auto flex items-start justify-between gap-3 text-rose-300 mb-8">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-rose-400" />
              <div>
                <p className="text-sm font-semibold">Không thể tải danh sách gói</p>
                <p className="text-xs mt-0.5 opacity-90">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchPlans}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Thử lại
            </button>
          </div>
        )}

        {/* 3. Lưới Pricing Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-[#0c1626]/60 border border-[#162338] animate-pulse space-y-4"
              >
                <div className="h-6 w-32 bg-slate-800 rounded-lg" />
                <div className="h-10 w-24 bg-slate-800 rounded-lg" />
                <div className="space-y-2 pt-4">
                  <div className="h-4 w-full bg-slate-800/60 rounded" />
                  <div className="h-4 w-3/4 bg-slate-800/60 rounded" />
                </div>
                <div className="h-11 w-full bg-slate-800 rounded-xl mt-6" />
              </div>
            ))}
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center p-12 rounded-3xl bg-[#0c1626]/60 border border-[#162338] max-w-md mx-auto space-y-4">
            <Crown className="w-12 h-12 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">Chưa có gói dịch vụ nào khả dụng</h3>
            <p className="text-xs text-slate-400">
              Vui lòng liên hệ Quản trị viên để kích hoạt các gói dịch vụ trên hệ thống.
            </p>
            <button
              type="button"
              onClick={fetchPlans}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition cursor-pointer"
            >
              Làm mới
            </button>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 ${
              plans.length === 2
                ? 'md:grid-cols-2 max-w-3xl mx-auto'
                : plans.length >= 3
                ? 'md:grid-cols-3'
                : 'max-w-md mx-auto'
            } gap-6`}
          >
            {plans.map((plan) => {
              const isDefaultPlan = Boolean(plan.isDefault || plan.price === 0);
              const isSubmitting = submittingPlanId === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-7 transition-all duration-300 ${
                    isDefaultPlan
                      ? 'bg-gradient-to-b from-[#0f2420] via-[#0c1c1a] to-[#091515] border-2 border-emerald-500/50 shadow-2xl shadow-emerald-950/50 transform md:-translate-y-2'
                      : 'bg-[#0c1626]/80 hover:bg-[#0c1626] border border-[#162338] hover:border-slate-700 shadow-xl'
                  }`}
                >
                  {/* Badge Đề xuất nếu là Gói mặc định / Free */}
                  {isDefaultPlan && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-black font-extrabold text-[11px] uppercase tracking-wider shadow-md shadow-emerald-500/20 flex items-center gap-1.5 whitespace-nowrap">
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Được đề xuất cho bạn</span>
                    </div>
                  )}

                  <div>
                    {/* Header gói: Tên + Mã */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {plan.description || 'Gói dịch vụ chuyên nghiệp dành cho Huấn luyện viên ZenFit.'}
                        </p>
                      </div>
                      <div
                        className={`p-2.5 rounded-2xl shrink-0 ${
                          isDefaultPlan
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                        }`}
                      >
                        <Crown className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Giá cước */}
                    <div className="my-5 pb-5 border-b border-slate-700/40">
                      <div className="flex items-baseline gap-1.5">
                        <span
                          className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                            isDefaultPlan ? 'text-emerald-400' : 'text-white'
                          }`}
                        >
                          {formatCurrency(plan.price)}
                        </span>
                        {plan.price > 0 && (
                          <span className="text-xs text-slate-400 font-medium">
                            / {formatDuration(plan.durationDays)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Chu kỳ dịch vụ: {plan.durationDays} ngày
                      </p>
                    </div>

                    {/* Danh sách quyền lợi */}
                    <div className="space-y-3 mb-6 text-xs text-slate-300">
                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          Quản lý tối đa{' '}
                          <strong className="text-white font-semibold">{plan.maxStudents}</strong>{' '}
                          học viên cùng lúc
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>
                          {plan.maxTrainingSessions && plan.maxTrainingSessions > 0 ? (
                            <>
                              Tối đa{' '}
                              <strong className="text-white font-semibold">
                                {plan.maxTrainingSessions}
                              </strong>{' '}
                              buổi tập / chu kỳ
                            </>
                          ) : (
                            'Không giới hạn số buổi tập'
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Giáo án tập luyện & theo dõi tiến độ chi tiết</span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>Lịch tập thông minh & đồng bộ tức thì</span>
                      </div>
                    </div>
                  </div>

                  {/* Nút Kích hoạt / Chọn gói */}
                  <button
                    type="button"
                    disabled={Boolean(submittingPlanId)}
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 px-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDefaultPlan
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:from-emerald-400 hover:to-teal-300 shadow-emerald-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-900 shadow-slate-900/30'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Đang kích hoạt...</span>
                      </>
                    ) : isDefaultPlan ? (
                      <>
                        <span>Bắt đầu Miễn phí</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span>Chọn gói này</span>
                        <Zap className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Cam kết chân trang */}
        <div className="text-center mt-12 text-xs text-slate-500">
          <p>
            Cần hỗ trợ tư vấn gói doanh nghiệp lớn hoặc phòng tập?{' '}
            <span className="text-emerald-400 font-semibold cursor-pointer hover:underline">
              Liên hệ đội ngũ hỗ trợ ZenFit
            </span>
          </p>
        </div>
      </main>

      {/* Modal Quét Mã QR Thanh toán PayOS & Lắng nghe WebSocket */}
      <PaymentQRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        subscriptionData={selectedSubscription}
        userId={user?.id || ''}
        onSuccess={() => {
          setIsQRModalOpen(false);
          setSubscriptionConfirmed(true);
          toast.success('Thanh toán thành công! Chào mừng bạn đến với ZenFit.');
          navigate('/pt/today', { replace: true });
        }}
      />
    </div>
  );
}
