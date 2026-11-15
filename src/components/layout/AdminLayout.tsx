import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  UserCheck,
  LogOut,
} from 'lucide-react';
import AdminSidebar from './Sidebar/AdminSidebar';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';

export default function AdminLayout() {
  const { isSidebarCollapsed, toggleSidebarCollapse } = useSettings();
  const { user, loginAsPT, logoutApp } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Close user dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <div className="min-h-screen bg-[#0a0416] text-slate-100 font-poppins flex transition-colors duration-200">
      {/* Desktop Admin Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0 z-40 transition-all duration-300">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <AdminSidebar
              isCollapsed={false}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Content Area with Atmospheric Violet Ambient Background */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#0a0416] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/15 via-[#0a0416] to-[#06020e]">
        {/* Topbar Admin Header */}
        <header className="h-18 bg-[#0c061a]/90 backdrop-blur-md border-b border-purple-500/15 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4 transition-colors duration-200">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Menu Trigger */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              type="button"
              onClick={toggleSidebarCollapse}
              className="hidden md:flex p-2 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
              aria-label={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search Input in Purple Pill shape matching screenshot */}
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="h-4 w-4 text-purple-400/60 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm nhanh... (VD: PT, học viên, gói đăng ký)"
                className="w-full pl-9 pr-4 py-2 rounded-full bg-[#180d33]/90 border border-purple-500/25 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Right Area: System Status Pill, Bell, Admin Profile */}
          <div className="flex items-center gap-3.5">
            {/* System Status Pill (Hệ thống hoạt động tốt) */}
            <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0a2318] border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-xs shadow-emerald-500/15">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
              <span>Hệ thống hoạt động tốt</span>
            </div>

            {/* Notification Bell with Badge '3' */}
            <div className="relative p-2 rounded-xl text-purple-300/80 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center shadow-xs">
                3
              </span>
            </div>

            {/* Admin Profile Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1 sm:px-2 py-1.5 rounded-xl hover:bg-purple-900/30 transition-colors cursor-pointer group"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-500 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-purple-600/30">
                  A
                </div>
                <div className="hidden sm:flex items-center gap-1.5 text-left">
                  <span className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors">
                    Admin
                  </span>
                  <ChevronDown className={`h-3.5 w-3.5 text-purple-300/60 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#140b2b] border border-purple-500/25 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 divide-y divide-purple-500/15">
                  <div className="px-3 py-2 text-left">
                    <p className="text-xs font-semibold text-white">{user?.name || 'Admin ZenFit'}</p>
                    <p className="text-[10px] text-purple-300/60 truncate mt-0.5">{user?.email || 'admin@zenfit.vn'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        loginAsPT();
                        setIsUserMenuOpen(false);
                        navigate('/pt/today');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Xem giao diện PT</span>
                    </button>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logoutApp();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
