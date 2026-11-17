import {
  UserCheck,
  CircleDollarSign,
  TrendingUp,
  ShieldCheck,
  Activity,
  Server,
  Zap,
  Lock,
  History,
  CheckCircle2,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import { useApp } from '../../context/AppContext';

export default function AdminOverviewPage() {
  const { adminPTs, auditLogs } = useApp();

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Tổng quan Quản trị Hệ thống
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/60 mt-1">
            Theo dõi tổng quan tài nguyên nền tảng, tình trạng hệ thống và doanh thu ZenFit.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a2318] border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
          <span>Hệ thống vận hành ổn định</span>
        </div>
      </div>

      {/* Grid thẻ số liệu thống kê (4 Thẻ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Thẻ 1: Tình trạng máy chủ */}
        <StatCard
          title="Tình trạng máy chủ"
          value="99.9%"
          subtitle="Tất cả dịch vụ API đang trực tuyến"
          icon={<Server className="h-5 w-5" />}
          highlightColor="indigo"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />

        {/* Thẻ 2: Tổng số HLV (PT) */}
        <StatCard
          title="Tổng số HLV (PT)"
          value={adminPTs.length}
          subtitle={`${adminPTs.length} PT đang hợp tác`}
          icon={<UserCheck className="h-5 w-5" />}
          highlightColor="emerald"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />

        {/* Thẻ 3: Doanh thu thuê bao tháng */}
        <StatCard
          title="Doanh thu thuê bao tháng"
          value="4.500.000 đ"
          subtitle="Tăng 12% so với tháng trước"
          icon={<CircleDollarSign className="h-5 w-5" />}
          highlightColor="sky"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />

        {/* Thẻ 4: Tỉ lệ nâng cấp trả phí */}
        <StatCard
          title="Tỉ lệ nâng cấp trả phí"
          value="50%"
          subtitle="2/4 PT dùng gói Nâng cao hoặc Chuyên nghiệp"
          icon={<TrendingUp className="h-5 w-5" />}
          highlightColor="amber"
          className="bg-white dark:bg-[#120826]/90 border-slate-200 dark:border-purple-500/15 shadow-xs"
        />
      </div>

      {/* Khối Trạng thái Vi dịch vụ Nền tảng (Platform Services Status) */}
      <div className="bg-white dark:bg-[#120826]/90 rounded-2xl border border-slate-200 dark:border-purple-500/15 p-6 shadow-xs">
        <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <Activity className="h-5 w-5 text-purple-400" />
          Tình trạng Dịch vụ Nền tảng ZenFit
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#1b0e36] border border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Xác thực OAuth2 & JWT</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-purple-300/70">Google Sign-In & Đăng nhập trực tiếp</p>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Hoạt động tốt
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#1b0e36] border border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Cơ sở dữ liệu PostgreSQL</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-[11px] text-purple-300/70">Render Cloud Database</p>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Đang kết nối (Độ trễ thấp)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#1b0e36] border border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Quản lý Gói & Hạn mức</span>
              <Zap className="h-4 w-4 text-amber-400" />
            </div>
            <p className="text-[11px] text-purple-300/70">Hạn mức học viên & Phân quyền PT</p>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Sẵn sàng
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#1b0e36] border border-purple-500/20 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white">Bảo mật & Phân quyền</span>
              <Lock className="h-4 w-4 text-purple-400" />
            </div>
            <p className="text-[11px] text-purple-300/70">Spring Security & CORS Gateway</p>
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Bảo vệ 100%
            </span>
          </div>
        </div>
      </div>

      {/* Nhật ký hoạt động gần đây */}
      <div className="bg-white dark:bg-[#120826]/90 rounded-2xl border border-slate-200 dark:border-purple-500/15 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="h-5 w-5 text-purple-400" />
            Hoạt động Quản trị Gần đây
          </h2>
          <span className="text-xs text-purple-300/60">Ghi nhận từ hệ thống</span>
        </div>

        <div className="divide-y divide-purple-500/10">
          {auditLogs.slice(0, 3).map((log) => (
            <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
              <div>
                <p className="font-semibold text-white">{log.action}</p>
                <p className="text-purple-300/70 mt-0.5">{log.details}</p>
                <p className="text-[11px] text-purple-400/80 mt-1">
                  Người thực hiện: <span className="text-white">{log.actor}</span> • Đối tượng: <span className="text-white">{log.target}</span>
                </p>
              </div>
              <span className="text-[11px] text-purple-300/50 whitespace-nowrap">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Cam kết bảo mật dữ liệu phân quyền nội bộ */}
      <div className="bg-white dark:bg-[#120826]/90 rounded-2xl border border-slate-200 dark:border-purple-500/15 p-6 space-y-3 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-purple-400" />
          Quy chuẩn phân quyền dữ liệu nội bộ
        </h2>
        <p className="text-xs text-slate-600 dark:text-purple-300/70 leading-relaxed">
          Khu vực Admin quản lý số lượng người dùng nền tảng, tài khoản huấn luyện viên, gói đăng ký (Miễn phí / Nâng cao / Chuyên nghiệp), tình trạng thanh toán và nhật ký hệ thống. Admin hoàn toàn không can thiệp vào dữ liệu tập luyện cá nhân bí mật của các PT theo đúng cam kết bảo mật.
        </p>
      </div>
    </div>
  );
}
