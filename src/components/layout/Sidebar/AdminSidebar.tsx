import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Dumbbell,
  Crown,
  CreditCard,
  Settings,
  BarChart2,
  History,
  LogOut,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  X,
  UserCheck,
} from 'lucide-react';
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
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  // Group 1: Standalone Overview
  const overviewItem = {
    to: '/admin/overview',
    label: 'Tổng quan hệ thống',
    icon: TrendingUp,
  };

  // Group 2: Quản lý nghiệp vụ
  const businessItems = [
    { to: '/admin/pts', label: 'Quản lý PT', icon: Dumbbell, hasArrow: true },
    { to: '/admin/plans', label: 'Quản lý gói đăng ký', icon: Crown },
    { to: '/admin/payments', label: 'Quản lý thanh toán', icon: CreditCard },
  ];

  // Group 3: Hệ thống
  const systemItems = [
    { to: '/admin/settings', label: 'Cài đặt hệ thống', icon: Settings },
    { to: '/admin/reports', label: 'Thống kê & Báo cáo', icon: BarChart2 },
    { to: '/admin/audit-logs', label: 'Nhật ký hoạt động', icon: History },
  ];

  return (
    <aside
      className={`bg-[#0c061a] text-slate-200 border-r border-purple-500/15 flex flex-col h-full select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`h-18 flex items-center border-b border-purple-500/15 shrink-0 transition-all ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Logo Icon with Purple Gradient Z */}
          <div
            onClick={isCollapsed && onToggleCollapse ? onToggleCollapse : undefined}
            title={isCollapsed ? 'Mở rộng menu' : undefined}
            className={`h-10 w-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-indigo-500 flex items-center justify-center p-1 shadow-lg shadow-purple-600/30 shrink-0 ${
              isCollapsed && onToggleCollapse ? 'cursor-pointer hover:scale-105 transition-transform' : ''
            }`}
          >
            <span className="text-white font-black text-xl italic tracking-tighter">Z</span>
          </div>

          {!isCollapsed && (
            <div className="min-w-0">
              <span className="text-xl font-bold tracking-tight text-white block leading-none">
                Zen<span className="text-purple-400">Fit</span>
              </span>
              <span className="block text-[9px] font-semibold tracking-wider text-purple-300/70 uppercase mt-1 truncate">
                Rèn luyện tốt hơn. Sống khỏe mạnh hơn.
              </span>
            </div>
          )}
        </div>

        {/* Close Button on Mobile / Collapse on Desktop */}
        {onCloseMobile ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
            aria-label="Đóng menu"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          !isCollapsed &&
          onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl text-purple-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              title="Thu gọn menu"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )
        )}
      </div>

      {/* Admin User Profile Card (Under Header) */}
      {!isCollapsed ? (
        <div className="mx-3 mt-3 mb-2 p-2.5 rounded-2xl bg-[#170c33]/80 border border-purple-500/20 relative shadow-xs">
          <div
            onClick={() => setIsAdminDropdownOpen(!isAdminDropdownOpen)}
            className="flex items-center justify-between cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-600/30 shrink-0">
                A
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight group-hover:text-purple-300 transition-colors">
                  {user?.name || 'Admin ZenFit'}
                </p>
                <p className="text-[10px] text-purple-300/60 truncate mt-0.5">Quản trị hệ thống</p>
              </div>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-purple-300/60 transition-transform ${isAdminDropdownOpen ? 'rotate-180' : ''}`} />
          </div>

          {/* User Quick Switch Dropdown */}
          {isAdminDropdownOpen && (
            <div className="mt-2 pt-2 border-t border-purple-500/20 space-y-1">
              <button
                type="button"
                onClick={() => {
                  loginAsPT();
                  navigate('/pt/today');
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-emerald-400 hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Xem giao diện PT</span>
              </button>
              <button
                type="button"
                onClick={logoutApp}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="my-3 flex justify-center shrink-0">
          <div
            onClick={onToggleCollapse}
            title="Admin ZenFit"
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-600/30 cursor-pointer hover:scale-105 transition-transform"
          >
            A
          </div>
        </div>
      )}

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-4 scrollbar-thin scrollbar-thumb-purple-900/40 scrollbar-track-transparent">
        {/* SECTION 1: TỔNG QUAN HỆ THỐNG */}
        <div>
          <NavLink
            to={overviewItem.to}
            onClick={onCloseMobile}
            className={({ isActive }) =>
              `group relative flex items-center ${
                isCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-3 px-3.5 py-2.5 rounded-xl'
              } text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-purple-600/30'
                  : 'text-purple-200/70 hover:text-white hover:bg-purple-900/20'
              }`
            }
          >
            <overviewItem.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="truncate">{overviewItem.label}</span>}

            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#160b2e] text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-purple-500/30">
                {overviewItem.label}
              </div>
            )}
          </NavLink>
        </div>

        {/* SECTION 2: QUẢN LÝ NGHIỆP VỤ */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-purple-300/40 uppercase tracking-wider mb-1.5">
              Quản lý nghiệp vụ
            </p>
          )}
          {businessItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group relative flex items-center ${
                    isCollapsed ? 'justify-center p-3 rounded-xl' : 'justify-between px-3.5 py-2.5 rounded-xl'
                  } text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30'
                      : 'text-purple-200/70 hover:text-white hover:bg-purple-900/20'
                  }`
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="h-4 w-4 shrink-0" />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.hasArrow && (
                  <ChevronRight className="h-3.5 w-3.5 opacity-60 shrink-0" />
                )}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#160b2e] text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-purple-500/30">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* SECTION 3: HỆ THỐNG */}
        <div className="space-y-1">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-purple-300/40 uppercase tracking-wider mb-1.5">
              Hệ thống
            </p>
          )}
          {systemItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `group relative flex items-center ${
                    isCollapsed ? 'justify-center p-3 rounded-xl' : 'gap-3 px-3.5 py-2.5 rounded-xl'
                  } text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold shadow-lg shadow-purple-600/30'
                      : 'text-purple-200/70 hover:text-white hover:bg-purple-900/20'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#160b2e] text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-purple-500/30">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Motivational Mini-Card */}
      {!isCollapsed && (
        <div className="mx-3 my-2 p-3 rounded-2xl bg-gradient-to-br from-purple-900/30 via-purple-800/20 to-indigo-950/40 border border-purple-500/20 relative overflow-hidden flex items-center justify-between shrink-0">
          <div>
            <span className="font-bold text-xs text-white block">ZenFit</span>
            <span className="text-[10px] text-purple-200/70 leading-tight block mt-0.5">
              Cùng nhau xây dựng cộng đồng vững mạnh.
            </span>
          </div>
          <div className="h-8 w-8 rounded-xl bg-purple-600/30 flex items-center justify-center text-purple-300 shrink-0">
            <Dumbbell className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Bottom Section: Logout / Expand */}
      <div className="p-3 border-t border-purple-500/15 shrink-0">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            {/* Logout button in collapsed mode */}
            <button
              onClick={logoutApp}
              title="Đăng xuất"
              aria-label="Đăng xuất"
              className="h-10 w-10 rounded-xl flex items-center justify-center text-purple-300/60 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer group relative"
            >
              <LogOut className="h-4 w-4" />
              <div className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg bg-[#160b2e] text-white text-xs font-semibold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 border border-purple-500/30">
                Đăng xuất
              </div>
            </button>

            {/* Expand button in collapsed mode */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
                title="Mở rộng menu"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <button
              onClick={logoutApp}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Đăng xuất</span>
            </button>

            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl text-xs font-medium text-purple-300/60 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
                title="Thu gọn menu"
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
