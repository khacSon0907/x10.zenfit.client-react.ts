import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  History,
  LogOut,
  UserCheck,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useApp } from '../../../context/AppContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function AdminSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const { user, logoutApp, loginAsPT } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/overview', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { to: '/admin/pts', label: 'Quản lý HLV (PT)', icon: Users },
    { to: '/admin/plans', label: 'Cấu hình gói thuê bao', icon: Layers },
    { to: '/admin/payments', label: 'Thanh toán phí dịch vụ', icon: CreditCard },
    { to: '/admin/audit-logs', label: 'Nhật ký thao tác', icon: History },
  ];

  return (
    <aside
      className={`bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-16 flex items-center border-b border-slate-200 dark:border-slate-800 shrink-0 transition-all ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            onClick={isCollapsed && onToggleCollapse ? onToggleCollapse : undefined}
            title={isCollapsed ? 'Mở rộng menu' : undefined}
            className={`h-9 w-9 rounded-xl bg-indigo-500/20 p-1 flex items-center justify-center border border-indigo-500/30 shrink-0 ${
              isCollapsed && onToggleCollapse ? 'cursor-pointer hover:scale-105 transition-transform' : ''
            }`}
          >
            <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white block leading-none">
                Zen<span className="text-indigo-600 dark:text-indigo-400">Fit</span>
              </span>
              <span className="block text-[10px] font-semibold tracking-wider text-indigo-600 dark:text-indigo-400 uppercase mt-1 truncate">
                Hệ Thống Quản Trị
              </span>
            </div>
          )}
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng menu"
            title="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          !isCollapsed &&
          onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Thu gọn thanh điều hướng"
              title="Thu gọn thanh điều hướng"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* Security Disclaimer Banner */}
      {!isCollapsed ? (
        <div className="mx-3 my-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span>Bảo mật dữ liệu học viên</span>
          </div>
          Admin quản lý tài khoản & gói dịch vụ của PT. Dữ liệu khách hàng riêng tư của PT được mã hóa cách ly 100%.
        </div>
      ) : (
        <div className="my-3 flex justify-center shrink-0">
          <div
            className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group relative cursor-help"
          >
            <ShieldCheck className="h-4 w-4" />
            <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700/50">
              Bảo mật: Dữ liệu học viên cách ly 100%
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group relative flex items-center ${
                  isCollapsed ? 'justify-center p-2.5 rounded-xl' : 'gap-3 px-3.5 py-2.5 rounded-xl'
                } text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
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

      {/* User Info & Switch to PT */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            {/* Nút quay lại PT Workspace */}
            <button
              onClick={() => {
                loginAsPT();
                if (onCloseMobile) onCloseMobile();
                navigate('/pt/today');
              }}
              title="Chuyển sang màn hình PT"
              aria-label="Chuyển sang màn hình PT"
              className="h-10 w-10 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 transition-colors cursor-pointer group relative"
            >
              <UserCheck className="h-4 w-4" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700/50">
                Chuyển sang màn hình PT
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={logoutApp}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer group relative"
            >
              <LogOut className="h-4 w-4" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-slate-700/50">
                Đăng xuất
              </div>
            </button>

            {/* Expand button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Mở rộng menu"
                aria-label="Mở rộng menu"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-2">
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Trần Quản Trị'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logoutApp}
                title="Đăng xuất"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            {/* Nút quay lại PT Workspace */}
            <button
              onClick={() => {
                loginAsPT();
                if (onCloseMobile) onCloseMobile();
                navigate('/pt/today');
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Chuyển sang màn hình PT
            </button>

            {/* Collapse toggle button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
