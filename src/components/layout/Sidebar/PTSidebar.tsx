import { NavLink, useNavigate } from 'react-router-dom';
import {
  CalendarCheck2,
  Users,
  Calendar,
  RotateCcw,
  CreditCard,
  TrendingUp,
  ClipboardList,
  Wallet,
  UserCheck,
  Zap,
  LogOut,
  Shield,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useApp } from '../../../context/AppContext';
import ProgressBar from '../../common/ProgressBar';

interface PTSidebarProps {
  onCloseMobile?: () => void;
}

export default function PTSidebar({ onCloseMobile }: PTSidebarProps) {
  const { ptPlan, user, logoutApp, loginAsAdmin } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/pt/today', label: 'Hôm nay', icon: CalendarCheck2 },
    { to: '/pt/clients', label: 'Khách hàng', icon: Users },
    { to: '/pt/schedule', label: 'Lịch làm việc', icon: Calendar },
    { to: '/pt/renewals', label: 'Trial & Gia hạn', icon: RotateCcw },
    { to: '/pt/packages', label: 'Gói & Thanh toán', icon: CreditCard },
    { to: '/pt/progress', label: 'Tiến độ & Số đo', icon: TrendingUp },
    { to: '/pt/plans', label: 'Kế hoạch & Giáo án', icon: ClipboardList },
    { to: '/pt/revenue', label: 'Doanh thu & Nợ', icon: Wallet },
    { to: '/pt/account', label: 'Gói của tôi & Hồ sơ', icon: UserCheck },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col h-full select-none transition-colors">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-gray-100 dark:border-gray-800 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 p-1 flex items-center justify-center">
          <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
            Zen<span className="text-emerald-500">Fit</span>
          </span>
          <span className="block text-[10px] font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
            PT Workspace
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/20 font-semibold'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Quota Widget (Hạn mức gói) */}
      <div className="p-3 mx-3 mb-2 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-100 dark:border-gray-700/60">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-gray-800 dark:text-gray-200">
            Hạn mức ({ptPlan.tier})
          </span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            {ptPlan.currentClients}/{ptPlan.maxClients} học viên
          </span>
        </div>
        <ProgressBar
          value={ptPlan.currentClients}
          max={ptPlan.maxClients}
          size="sm"
          color="emerald"
        />
        <NavLink
          to="/pt/account"
          onClick={onCloseMobile}
          className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-gray-700 rounded-lg border border-emerald-200 dark:border-emerald-700/50 hover:bg-emerald-50 dark:hover:bg-gray-650 transition-colors cursor-pointer"
        >
          <Zap className="h-3 w-3" />
          Nâng cấp gói
        </NavLink>
      </div>

      {/* User Footer with Switch Role & Logout */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-2">
          <div className="truncate">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
              {user?.name || 'Huấn luyện viên'}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>

        {/* Nút Đăng xuất tài khoản nổi bật */}
        <button
          onClick={logoutApp}
          title="Đăng xuất khỏi hệ thống"
          className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl transition-all cursor-pointer border border-rose-200/50 dark:border-rose-900/30"
        >
          <LogOut className="h-4 w-4" />
          <span>Đăng xuất tài khoản</span>
        </button>

        {/* Nút chuyển nhanh sang Admin để tiện test */}
        <button
          onClick={() => {
            loginAsAdmin();
            if (onCloseMobile) onCloseMobile();
            navigate('/admin/overview');
          }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
        >
          <Shield className="h-3.5 w-3.5 text-indigo-500" />
          Chuyển sang vai trò Admin
        </button>
      </div>
    </aside>
  );
}
