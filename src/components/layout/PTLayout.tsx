import { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Sun, Moon, Shield, Bell, Menu } from 'lucide-react';
import PTSidebar from './Sidebar/PTSidebar';
import PTBottomNav from './BottomNav/PTBottomNav';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/logo/logo-zenfit.png';

export default function PTLayout() {
  const { theme, toggleTheme } = useSettings();
  const { ptPlan, user, loginAsAdmin } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-poppins flex transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0">
        <PTSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <PTSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo Branding */}
            <div className="flex items-center gap-2 md:hidden">
              <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
              <span className="font-bold text-gray-900 dark:text-white text-base">
                Zen<span className="text-emerald-500">Fit</span>
              </span>
            </div>

            {/* Hạn mức gói badge (Hiển thị cả desktop và mobile) */}
            <Link
              to="/pt/account"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Học viên {ptPlan.currentClients}/{ptPlan.maxClients} ({ptPlan.tier})
              </span>
            </Link>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Switch Role Quick Button (Tiện test duyệt cả 2 vai trò) */}
            <button
              onClick={() => {
                loginAsAdmin();
                navigate('/admin/overview');
              }}
              className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-700 transition-colors cursor-pointer"
              title="Chuyển sang vai trò Admin"
            >
              <Shield className="h-3.5 w-3.5 text-indigo-500" />
              <span>Chế độ Admin</span>
            </button>

            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-gray-700 hover:text-emerald-600 transition-colors" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors relative"
              title="Thông báo"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-500" />
            </button>

            {/* User Avatar Mini */}
            <Link
              to="/pt/account"
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {(user?.name || 'PT').slice(0, 2).toUpperCase()}
              </div>
              <span className="hidden sm:inline-block text-xs font-semibold text-gray-800 dark:text-gray-200 max-w-[120px] truncate">
                {user?.name || 'HLV Hoàng Quân'}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <PTBottomNav />
    </div>
  );
}
