import { useState } from 'react';
import {
  CreditCard,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  DollarSign,
  User,
  Calendar,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';

interface FeeTransaction {
  id: string;
  ptName: string;
  ptEmail: string;
  planName: string;
  amount: number;
  paymentMethod: string;
  status: 'COMPLETED' | 'PENDING' | 'OVERDUE';
  date: string;
  notes?: string;
}

const INITIAL_TRANSACTIONS: FeeTransaction[] = [
  {
    id: 'TXN-202611-001',
    ptName: 'Hoàng Anh Quân',
    ptEmail: 'pt@zenfit.vn',
    planName: 'Gói Miễn phí',
    amount: 0,
    paymentMethod: 'Mặc định hệ thống',
    status: 'COMPLETED',
    date: '15/11/2026',
    notes: 'Kích hoạt tài khoản mới',
  },
  {
    id: 'TXN-202611-002',
    ptName: 'Đặng Hải Đăng',
    ptEmail: 'haidang.pt@gmail.com',
    planName: 'Gói Nâng cao (Plus)',
    amount: 499000,
    paymentMethod: 'Chuyển khoản Vietcombank',
    status: 'COMPLETED',
    date: '14/11/2026',
    notes: 'Gia hạn 30 ngày',
  },
  {
    id: 'TXN-202611-003',
    ptName: 'Nguyễn Bích Ngọc',
    ptEmail: 'bichngoc.fitness@gmail.com',
    planName: 'Gói Chuyên nghiệp (Pro)',
    amount: 999000,
    paymentMethod: 'Chuyển khoản Vietcombank',
    status: 'COMPLETED',
    date: '10/11/2026',
    notes: 'Nâng cấp từ Plus lên Pro',
  },
  {
    id: 'TXN-202611-004',
    ptName: 'Lê Quốc Việt',
    ptEmail: 'vietquoc.pt@gmail.com',
    planName: 'Gói Nâng cao (Plus)',
    amount: 499000,
    paymentMethod: 'Chờ chuyển khoản',
    status: 'PENDING',
    date: '16/11/2026',
    notes: 'Học viên đăng ký thêm vượt quá hạn mức Free',
  },
];

export default function AdminFeePaymentsPage() {
  const [transactions, setTransactions] = useState<FeeTransaction[]>(INITIAL_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'OVERDUE'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [selectedPt, setSelectedPt] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Gói Nâng cao (Plus)');
  const [amount, setAmount] = useState(499000);
  const [paymentMethod, setPaymentMethod] = useState('Chuyển khoản Vietcombank');
  const [reason, setReason] = useState('');

  const formatCurrency = (val: number) => {
    if (val === 0) return 'Miễn phí';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchSearch =
      t.ptName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ptEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = transactions
    .filter((t) => t.status === 'COMPLETED')
    .reduce((sum, item) => sum + item.amount, 0);

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPt.trim()) {
      toast.error('Vui lòng nhập tên huấn luyện viên!');
      return;
    }
    if (!reason.trim()) {
      toast.error('Vui lòng nhập lý do / nội dung ghi nhận!');
      return;
    }

    const newTxn: FeeTransaction = {
      id: `TXN-202611-${String(transactions.length + 1).padStart(3, '0')}`,
      ptName: selectedPt.trim(),
      ptEmail: `${selectedPt.toLowerCase().replace(/\s+/g, '')}@zenfit.vn`,
      planName: selectedPlan,
      amount: Number(amount),
      paymentMethod,
      status: 'COMPLETED',
      date: new Date().toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      notes: reason.trim(),
    };

    setTransactions([newTxn, ...transactions]);
    toast.success(`Đã ghi nhận thanh toán thành công cho PT "${newTxn.ptName}"!`);
    setIsModalOpen(false);
    setSelectedPt('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-purple-400 mb-1">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">
              Quản trị tài chính nền tảng
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Quản lý Thanh toán Phí dịch vụ PT
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Theo dõi dòng tiền thuê bao, duyệt các giao dịch chuyển khoản và ghi nhận thanh toán thủ công.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTransactions([...INITIAL_TRANSACTIONS]);
              toast.success('Đã làm mới dữ liệu thanh toán!');
            }}
            className="p-2.5 rounded-xl bg-[#170a32] border border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors shadow-xs"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-purple-900/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ghi nhận thanh toán thủ công</span>
          </button>
        </div>
      </div>

      {/* Thẻ thống kê 4 cột */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Tổng doanh thu thuê bao</p>
              <h3 className="text-2xl font-extrabold text-emerald-400 mt-1">
                {formatCurrency(totalRevenue)}
              </h3>
              <p className="text-[11px] text-emerald-400/80 mt-1">Giao dịch đã xác nhận</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Giao dịch thành công</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">
                {transactions.filter((t) => t.status === 'COMPLETED').length}
              </h3>
              <p className="text-[11px] text-purple-400/80 mt-1">Đã cấp hạn mức học viên</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">Chờ xác nhận chuyển khoản</p>
              <h3 className="text-2xl font-extrabold text-amber-300 mt-1">
                {transactions.filter((t) => t.status === 'PENDING').length}
              </h3>
              <p className="text-[11px] text-amber-300/80 mt-1">Cần duyệt giao dịch</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/15 border border-amber-500/25 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-purple-300/70">PT cần gia hạn tháng này</p>
              <h3 className="text-2xl font-extrabold text-white mt-1">2 PT</h3>
              <p className="text-[11px] text-purple-400/80 mt-1">Đang trong thời gian ân hạn</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar: Tìm kiếm & Lọc */}
      <div className="p-4 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo Mã GD, tên PT, email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a0c36] border border-purple-500/20 text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-purple-300/60 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc trạng thái:
          </span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'COMPLETED', label: '🟢 Hoàn thành' },
            { id: 'PENDING', label: '🟡 Chờ xác nhận' },
            { id: 'OVERDUE', label: '🔴 Quá hạn' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
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

      {/* Bảng danh sách giao dịch */}
      <div className="rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-xl backdrop-blur-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-purple-500/15 bg-purple-950/20 text-[11px] font-semibold text-purple-300/80 uppercase tracking-wider">
                <th className="py-3.5 px-4">Mã giao dịch</th>
                <th className="py-3.5 px-4">Huấn luyện viên (PT)</th>
                <th className="py-3.5 px-4">Gói đăng ký</th>
                <th className="py-3.5 px-4">Số tiền</th>
                <th className="py-3.5 px-4">Phương thức</th>
                <th className="py-3.5 px-4">Ngày giao dịch</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-white">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-purple-300/60">
                    <AlertCircle className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
                    <p className="font-semibold text-white">Không có giao dịch thanh toán nào</p>
                    <p className="text-[11px] text-purple-300/60 mt-1">
                      Thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-purple-950/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-purple-300 font-semibold">
                      {txn.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-white">{txn.ptName}</p>
                        <p className="text-[11px] text-purple-300/60">{txn.ptEmail}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-900/40 border border-purple-500/30 text-purple-200 font-medium">
                        {txn.planName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      {formatCurrency(txn.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-purple-200">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-3.5 px-4 text-purple-300/70 flex items-center gap-1.5 pt-4.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-400" />
                      <span>{txn.date}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {txn.status === 'COMPLETED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" /> Thành công
                        </span>
                      )}
                      {txn.status === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Clock className="w-3 h-3" /> Chờ xác nhận
                        </span>
                      )}
                      {txn.status === 'OVERDUE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
                          <AlertCircle className="w-3 h-3" /> Quá hạn
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {txn.status === 'PENDING' ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTransactions((prev) =>
                              prev.map((t) =>
                                t.id === txn.id ? { ...t, status: 'COMPLETED' } : t
                              )
                            );
                            toast.success(`Đã xác nhận thanh toán mã ${txn.id}!`);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors cursor-pointer"
                        >
                          Duyệt
                        </button>
                      ) : (
                        <span className="text-[11px] text-purple-300/50">Đã đối soát</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal ghi nhận thanh toán thủ công */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#120826] border border-purple-500/25 rounded-2xl shadow-2xl text-white overflow-hidden p-6">
            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <h3 className="text-base font-bold text-white">Ghi nhận thanh toán thủ công</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-white/5 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Huấn luyện viên (PT) <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập họ tên PT (VD: Trần Quốc Tuấn)"
                  value={selectedPt}
                  onChange={(e) => setSelectedPt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0d38] border border-purple-500/25 text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Gói dịch vụ kích hoạt
                </label>
                <select
                  value={selectedPlan}
                  onChange={(e) => {
                    setSelectedPlan(e.target.value);
                    if (e.target.value.includes('Plus')) setAmount(499000);
                    else if (e.target.value.includes('Pro')) setAmount(999000);
                    else setAmount(0);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0d38] border border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Gói Miễn phí">Gói Miễn phí (0 đ)</option>
                  <option value="Gói Nâng cao (Plus)">Gói Nâng cao (499.000 đ / 30 ngày)</option>
                  <option value="Gói Chuyên nghiệp (Pro)">Gói Chuyên nghiệp (999.000 đ / 30 ngày)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Số tiền thu (VND)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0d38] border border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Phương thức thanh toán
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0d38] border border-purple-500/25 text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Chuyển khoản Vietcombank">Chuyển khoản Vietcombank</option>
                  <option value="Ví điện tử MoMo">Ví điện tử MoMo</option>
                  <option value="Quét mã VietQR">Quét mã VietQR</option>
                  <option value="Tiền mặt trực tiếp">Tiền mặt trực tiếp</option>
                  <option value="Tặng ngày sử dụng (Khuyến mãi)">Tặng ngày sử dụng (Khuyến mãi)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-purple-200 mb-1">
                  Lý do / Ghi chú <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="VD: Gia hạn thuê bao tháng 11/2026, quà tặng bảo trì..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1b0d38] border border-purple-500/25 text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-purple-300 hover:text-white rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-lg shadow-purple-900/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Xác nhận ghi nhận</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
