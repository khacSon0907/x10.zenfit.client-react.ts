import { ShieldCheck } from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useApp } from '../../context/AppContext';

export default function AdminOverviewPage() {
  const { adminPTs } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Tổng quan Quản trị Hệ thống
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Theo dõi số lượng PT, gói thuê bao và doanh thu vận hành nền tảng ZenFit.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Tổng số HLV (PT)"
          value={adminPTs.length}
          subtitle="4 PT đang trên hệ thống"
          highlightColor="indigo"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
        <StatCard
          title="Doanh thu thuê bao tháng"
          value="4.500.000 đ"
          subtitle="Tăng 12% so với tháng trước"
          highlightColor="emerald"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
        <StatCard
          title="Tỉ lệ nâng cấp trả phí"
          value="50%"
          subtitle="2/4 PT dùng Plus hoặc Pro"
          highlightColor="sky"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
        <StatCard
          title="PT sắp hết hạn gói"
          value="1"
          subtitle="Đặng Hải Đăng (còn 6 ngày)"
          highlightColor="amber"
          className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-3 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Quy chuẩn phân quyền dữ liệu nội bộ
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Khu vực Admin chỉ quản lý tài khoản huấn luyện viên, gói đăng ký (Free/Plus/Pro), tình trạng thanh toán và log hệ thống. Admin hoàn toàn không có quyền truy cập hoặc hiển thị thông tin học viên cá nhân của các PT theo đúng cam kết bảo mật.
        </p>
      </div>
    </div>
  );
}
