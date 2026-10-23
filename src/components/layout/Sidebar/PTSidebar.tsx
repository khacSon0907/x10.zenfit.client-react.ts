import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  ClipboardList,
  Database,
  User,
  Settings,
  Dumbbell,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';

interface PTSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function PTSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: PTSidebarProps) {
  const navItems = [
    { to: '/pt/today', label: 'Tổng quan', icon: Home },
    { to: '/pt/schedule', label: 'Lịch tập', icon: Calendar },
    { to: '/pt/clients', label: 'Học viên', icon: Users },
    { to: '/pt/packages', label: 'Gói tập & thanh toán', icon: CreditCard },
    { to: '/pt/progress', label: 'Tiến độ & số đo', icon: TrendingUp },
    { to: '/pt/plans', label: 'Giáo án & dinh dưỡng', icon: ClipboardList },
    { to: '/pt/revenue', label: 'Doanh thu', icon: Database },
    { to: '/pt/profile', label: 'Hồ sơ PT', icon: User },
    { to: '/pt/account', label: 'Cài đặt', icon: Settings, searchParam: '?tab=settings' },
  ];

  return (
    <aside
      className={`bg-white dark:bg-[#070e17] text-slate-700 dark:text-slate-200 border-r border-slate-200/90 dark:border-[#162338] flex flex-col h-full select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-18 flex items-center border-b border-slate-200/90 dark:border-[#162338] shrink-0 transition-all ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={isCollapsed && onToggleCollapse ? onToggleCollapse : undefined}
            title={isCollapsed ? 'Mở rộng menu' : undefined}
            className={`h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-emerald-400/10 border border-emerald-500/30 flex items-center justify-center p-1.5 shadow-xs shrink-0 ${
              isCollapsed && onToggleCollapse ? 'cursor-pointer hover:scale-105 transition-transform' : ''
            }`}
          >
            <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                Zen<span className="text-[#00d68f]">Fit</span>
              </span>
              <span className="block text-[10px] font-bold tracking-widest text-[#00d68f] uppercase mt-1 truncate">
                PT WORKSPACE
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
            aria-label="Đóng menu"
            title="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          /* Desktop Collapse Button on Header (when expanded) */
          !isCollapsed &&
          onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
              aria-label="Thu gọn thanh điều hướng"
              title="Thu gọn thanh điều hướng"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onCloseMobile}
              end={item.to === '/pt/today'}
              className={({ isActive }) =>
                `group relative flex items-center ${
                  isCollapsed
                    ? 'justify-center p-3 rounded-xl'
                    : 'gap-3.5 px-4 py-3 rounded-xl'
                } text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/25 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#111e30]'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {/* Floating Tooltip when collapsed */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700/50">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-slate-200/90 dark:border-[#162338]/80 shrink-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 dark:from-[#0b2420] dark:to-[#07101b] border border-emerald-500/20 flex items-center justify-center text-emerald-500 group relative cursor-help"
            >
              <Dumbbell className="h-5 w-5" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700/50">
                ZenFit - Better You. Stronger Tomorrow.
              </div>
            </div>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
                title="Mở rộng menu"
                aria-label="Mở rộng menu"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Promo Card */}
            <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-100/30 dark:from-[#0b2420] dark:via-[#0b1728] dark:to-[#07101b] border border-emerald-200/70 dark:border-emerald-700/30 shadow-xs group">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute right-2 bottom-2 text-emerald-500/10 pointer-events-none">
                <Dumbbell className="w-20 h-20 rotate-[-25deg]" />
              </div>

              <div className="relative z-10 space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white tracking-wide leading-snug">
                    Kỷ luật hôm nay
                  </p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-snug">
                    Tạo nên kết quả ngày mai
                  </p>
                </div>

                <div className="pt-2.5 border-t border-emerald-500/20 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center p-1">
                    <img src={logo} alt="ZenFit" className="h-full w-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white leading-none">
                      Zen<span className="text-[#00d68f]">Fit</span>
                    </div>
                    <div className="text-[9px] text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      Better You. Stronger Tomorrow.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Collapse button on expanded state */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
                title="Thu gọn menu"
                aria-label="Thu gọn menu"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Thu gọn menu</span>
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
