import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sun, Moon, Menu, UserCheck, Shield } from 'lucide-react';
import AdminSidebar from './Sidebar/AdminSidebar';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import logo from '../../assets/logo/logo-zenfit.png';

export default function AdminLayout() {
  const { theme, toggleTheme } = useSettings();
  const { user, loginAsPT } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-poppins flex">
      {/* Desktop Admin Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0">
        <AdminSidebar />
      </div>

      {/* Mobile Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <AdminSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-900/50">
        {/* Topbar Admin */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-800"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
              <span className="font-bold text-white text-base">
                Zen<span className="text-indigo-400">Admin</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/60 border border-indigo-800/60 text-xs text-indigo-300 font-medium">
              <Shield className="h-3.5 w-3.5 text-indigo-400" />
              <span>Phân hệ Quản trị Nền tảng (Platform Administration)</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loginAsPT();
                navigate('/pt/today');
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Xem giao diện PT</span>
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Đổi sáng/tối"
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                AD
              </div>
              <span className="hidden md:inline-block text-xs font-semibold text-slate-200">
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
