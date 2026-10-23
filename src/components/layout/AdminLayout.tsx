import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, UserCheck, Shield } from 'lucide-react';
import AdminSidebar from './Sidebar/AdminSidebar';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/logo/logo-zenfit.png';

export default function AdminLayout() {
  const { theme, toggleTheme, isSidebarCollapsed, toggleSidebarCollapse } = useSettings();
  const { user, loginAsPT } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-poppins flex transition-colors duration-200">
      {/* Desktop Admin Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0 transition-all duration-300">
        <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <AdminSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50/70 dark:bg-slate-900/50">
        {/* Topbar Admin */}
        <header className="h-16 bg-white/90 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Mở menu"
              title="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
              title={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
              aria-label={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Zen<span className="text-indigo-600 dark:text-indigo-400">Admin</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-xs text-indigo-700 dark:text-indigo-300 font-medium">
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Phân hệ Quản trị Nền tảng (Platform Administration)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loginAsPT();
                navigate('/pt/today');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer shadow-xs"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Xem giao diện PT</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Đổi sáng/tối"
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-600 hover:text-indigo-600 transition-colors" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200">
                {user?.name || 'Admin'}
              </span>
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
