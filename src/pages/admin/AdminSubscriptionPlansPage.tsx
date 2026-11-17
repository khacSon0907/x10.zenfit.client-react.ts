import { useState, useEffect, useCallback } from 'react';
import {
  Crown,
  Plus,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  Star,
  Users,
  CheckCircle2,
  Layers,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import subscriptionPlanApi from '../../api/subscriptionPlanApi';
import type {
  SubscriptionPlan,
  SubscriptionPlanStatus,
} from '../../types/subscriptionPlan';
import PlanFormModal from '../../components/admin/plans/PlanFormModal';
import DeletePlanConfirmModal from '../../components/admin/plans/DeletePlanConfirmModal';

export default function AdminSubscriptionPlansPage() {
  // Query States
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  // Data States
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [defaultPlan, setDefaultPlan] = useState<SubscriptionPlan | null>(null);

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<SubscriptionPlan | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null);

  // Fetch admin plans with pagination
  const fetchPlans = useCallback(async () => {
    setIsLoading(true);
    try {
      const statusParam =
        statusFilter === 'ALL' ? undefined : (statusFilter as SubscriptionPlanStatus);

      const result = await subscriptionPlanApi.getAdminPlans({
        keyword: keyword.trim() || undefined,
        status: statusParam,
        page,
        size,
      });

      setPlans(result.items || []);
      setTotalElements(result.totalElements || 0);
      setTotalPages(result.totalPages || 1);

      // Find or fetch default plan
      try {
        const def = await subscriptionPlanApi.getDefaultPlan();
        setDefaultPlan(def);
      } catch {
        // Fallback find in list
        const found = result.items.find((p) => p.isDefault);
        if (found) setDefaultPlan(found);
      }
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = errRes?.message || 'Không thể tải danh sách gói dịch vụ. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [keyword, statusFilter, page, size]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Handle Quick Status Change
  const handleQuickStatusChange = async (plan: SubscriptionPlan, newStatus: SubscriptionPlanStatus) => {
    if (plan.status === newStatus) return;

    try {
      await subscriptionPlanApi.updatePlanStatus(plan.id, { status: newStatus });
      const statusLabels: Record<SubscriptionPlanStatus, string> = {
        ACTIVE: 'Hoạt động',
        INACTIVE: 'Tạm ẩn',
        ARCHIVED: 'Lưu trữ',
      };
      toast.success(`Đã đổi trạng thái gói "${plan.name}" sang "${statusLabels[newStatus]}"`);
      fetchPlans();
    } catch (err: unknown) {
      const errRes = (err as { response?: { data?: { message?: string } } })?.response?.data;
      const msg = errRes?.message || 'Không thể cập nhật trạng thái gói!';
      toast.error(msg);
    }
  };

  // Helper format currency
  const formatCurrency = (amount: number) => {
    if (amount === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Open Create Modal
  const handleOpenCreate = () => {
    setPlanToEdit(null);
    setIsFormModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setPlanToEdit(plan);
    setIsFormModalOpen(true);
  };

  // Open Delete Modal
  const handleOpenDelete = (plan: SubscriptionPlan) => {
    if (plan.isDefault) {
      toast.error('Không thể xóa gói mặc định của hệ thống!');
      return;
    }
    setPlanToDelete(plan);
    setIsDeleteModalOpen(true);
  };

  // Status Badge Component
  const renderStatusBadge = (status: SubscriptionPlanStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Đang hoạt động
          </span>
        );
      case 'INACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-500/15 text-gray-400 border border-gray-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Tạm ẩn
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Đã lưu trữ
          </span>
        );
      default:
        return null;
    }
  };

  // Calculate active count
  const activeCount = plans.filter((p) => p.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-purple-400 mb-1">
            <Crown className="w-6 h-6 text-purple-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">
              Quản trị nền tảng ZenFit
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Quản lý Gói dịch vụ & Hạn mức Học viên
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Thiết lập các gói dịch vụ, giá cước, chu kỳ gia hạn và số lượng học viên tối đa cho mỗi PT.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchPlans}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#170a32] border border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors shadow-sm disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            + Thêm gói mới
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Plans */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Tổng số gói</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">{totalElements}</h3>
              <p className="text-[11px] text-purple-400/80 mt-1">Tất cả cấu hình trong hệ thống</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Active Plans */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Gói đang hoạt động</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">{activeCount}</h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">Hiển thị trên bảng giá PT</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Default Plan */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Gói mặc định hiện tại</p>
              <h3 className="text-base font-extrabold text-amber-300 mt-1 line-clamp-1">
                {defaultPlan?.name || 'Chưa thiết lập'}
              </h3>
              <p className="text-[11px] text-purple-300/60 mt-1">
                Mã: <code className="text-amber-300">{defaultPlan?.code || 'Chưa thiết lập'}</code>
              </p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center">
              <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Card 4: Default Student Limit */}
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Hạn mức học viên miễn phí</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {defaultPlan?.maxStudents ?? 5}{' '}
                <span className="text-xs font-normal text-purple-300/60">học viên</span>
              </h3>
              <p className="text-[11px] text-purple-400/80 mt-1">Áp dụng tự động cho PT mới</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Search & Filter */}
      <div className="p-4 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm theo Mã gói hoặc Tên gói..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a0c36] border border-purple-500/20 text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-purple-300/60 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc:
          </span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ACTIVE', label: '🟢 Hoạt động' },
            { id: 'INACTIVE', label: '⚪ Tạm ẩn' },
            { id: 'ARCHIVED', label: '🔴 Lưu trữ' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-[#1a0c36] text-purple-300/70 hover:text-white hover:bg-purple-900/30 border border-purple-500/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table Card */}
      <div className="rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/15 bg-purple-950/20 text-[11px] font-semibold text-purple-300/80 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã & Tên gói</th>
                <th className="py-3.5 px-4">Giá cước (VND)</th>
                <th className="py-3.5 px-4">Chu kỳ</th>
                <th className="py-3.5 px-4">Học viên tối đa</th>
                <th className="py-3.5 px-4">Buổi tập tối đa</th>
                <th className="py-3.5 px-4 text-center">Thứ tự</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-xs text-white">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-purple-300/60">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                      <span>Đang tải danh sách gói dịch vụ...</span>
                    </div>
                  </td>
                </tr>
              ) : plans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-purple-300/60">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="w-8 h-8 text-purple-400/50" />
                      <p className="font-semibold text-white">Không tìm thấy gói dịch vụ nào</p>
                      <p className="text-[11px] text-purple-300/60">
                        Thử thay đổi bộ lọc tìm kiếm hoặc tạo một gói dịch vụ mới.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className="hover:bg-purple-950/30 transition-colors group"
                  >
                    {/* Mã & Tên gói */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-purple-900/30 border border-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Crown className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {plan.name}
                            </span>
                            {plan.isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <Star className="w-3 h-3 fill-amber-300" /> Mặc định
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <code className="text-[11px] font-mono text-purple-300 bg-purple-950/60 px-1.5 py-0.5 rounded border border-purple-500/20">
                              {plan.code}
                            </code>
                            {plan.description && (
                              <span className="text-[11px] text-purple-300/60 line-clamp-1 max-w-xs">
                                {plan.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Giá cước */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          plan.price === 0 ? 'text-emerald-400' : 'text-white'
                        }`}
                      >
                        {formatCurrency(plan.price)}
                      </span>
                    </td>

                    {/* Chu kỳ */}
                    <td className="py-3.5 px-4">
                      <span className="text-purple-200">
                        {plan.durationDays} ngày
                      </span>
                    </td>

                    {/* Học viên tối đa */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-purple-300">
                        <Users className="w-3.5 h-3.5 text-purple-400" />
                        <span>{plan.maxStudents} học viên</span>
                      </div>
                    </td>

                    {/* Buổi tập tối đa */}
                    <td className="py-3.5 px-4">
                      <span className="text-purple-300/80">
                        {plan.maxTrainingSessions && plan.maxTrainingSessions > 0
                          ? `${plan.maxTrainingSessions} buổi`
                          : 'Không giới hạn'}
                      </span>
                    </td>

                    {/* Thứ tự */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-md bg-purple-900/30 border border-purple-500/20 text-purple-300 font-mono text-xs">
                        #{plan.displayOrder}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {renderStatusBadge(plan.status)}
                        {/* Quick switch status select */}
                        <select
                          value={plan.status}
                          onChange={(e) =>
                            handleQuickStatusChange(
                              plan,
                              e.target.value as SubscriptionPlanStatus
                            )
                          }
                          className="mt-1 text-[10px] bg-[#1a0c36] border border-purple-500/20 text-purple-300/80 rounded-md px-1.5 py-0.5 focus:outline-none hover:text-white"
                        >
                          <option value="ACTIVE">Chuyển: Hoạt động</option>
                          <option value="INACTIVE">Chuyển: Tạm ẩn</option>
                          <option value="ARCHIVED">Chuyển: Lưu trữ</option>
                        </select>
                      </div>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(plan)}
                          className="p-1.5 rounded-lg text-purple-300/70 hover:text-white hover:bg-purple-900/40 border border-transparent hover:border-purple-500/20 transition-colors"
                          title="Chỉnh sửa gói"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(plan)}
                          disabled={plan.isDefault}
                          className={`p-1.5 rounded-lg transition-colors border ${
                            plan.isDefault
                              ? 'text-gray-600 border-transparent cursor-not-allowed opacity-40'
                              : 'text-red-400/80 hover:text-red-300 hover:bg-red-950/40 border-transparent hover:border-red-500/20'
                          }`}
                          title={
                            plan.isDefault
                              ? 'Không thể xóa gói mặc định của hệ thống'
                              : 'Xóa gói dịch vụ'
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-purple-500/15 bg-purple-950/10 text-xs text-purple-300/70">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select
              value={size}
              onChange={(e) => {
                setSize(Number(e.target.value));
                setPage(0);
              }}
              className="px-2 py-1 rounded-lg bg-[#1a0c36] border border-purple-500/20 text-white focus:outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>bản ghi / trang (Tổng cộng {totalElements} gói)</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={page === 0 || isLoading}
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              className="px-3 py-1.5 rounded-lg bg-[#1a0c36] border border-purple-500/20 text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-white font-semibold">
              Trang {page + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page + 1 >= totalPages || isLoading}
              onClick={() => setPage((prev) => prev + 1)}
              className="px-3 py-1.5 rounded-lg bg-[#1a0c36] border border-purple-500/20 text-purple-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Thêm / Sửa Gói */}
      <PlanFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchPlans}
        planToEdit={planToEdit}
      />

      {/* Modal Xác nhận Xóa Gói */}
      <DeletePlanConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={fetchPlans}
        plan={planToDelete}
      />
    </div>
  );
}
