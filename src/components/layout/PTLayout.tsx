import { useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Search,
  Bell,
  Menu,
  User,
  KeyRound,
  LogOut,
  Shield,
  Sun,
  Moon,
  ChevronDown,
} from 'lucide-react';
import PTSidebar from './Sidebar/PTSidebar';
import PTBottomNav from './BottomNav/PTBottomNav';
import { useSettings } from '../../context/SettingsContext';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import UserProfileModal from '../../features/auth/components/UserProfileModal';
import ChangePasswordModal from '../../features/auth/components/ChangePasswordModal';
import logo from '../../assets/logo/logo-zenfit.png';
import type { UserProfile } from '../../types/auth';

export default function PTLayout() {
  const { theme, toggleTheme } = useSettings();
  const { user, loginAsAdmin, logoutApp } = useApp();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Click outside to close user dropdown
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

  // Fallback profile object for UserProfileModal
  const profileUserData: UserProfile = authUser || {
    id: user?.id || 'pt-quantri',
    username: 'quantri',
    name: user?.name || 'Quản Trị',
    email: user?.email || 'quantri@zenfit.vn',
    roleIds: ['pt-role-1'],
    roles: ['ROLE_PT'],
    accessToken: '',
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 font-poppins flex transition-colors">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0 z-40">
        <PTSidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 animate-in slide-in-from-left duration-200">
            <PTSidebar onCloseMobile={() => setIsMobileSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar Header */}
        <header className="h-18 bg-[#070e17]/95 backdrop-blur-md border-b border-[#162338] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-300 hover:bg-[#111e30] transition-colors"
              aria-label="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo Branding */}
            <div className="flex items-center gap-2 md:hidden">
              <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
              <span className="font-bold text-white text-base">
                Zen<span className="text-[#00d68f]">Fit</span>
              </span>
            </div>

            {/* Search Input Bar (As in image: "Tìm kiếm học viên, lịch tập, tên gói tập...  Ctrl + K") */}
            <div className="relative w-full hidden sm:block">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm học viên, lịch tập, tên gói tập..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-[#0e1828] border border-[#1b2b42] text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                <kbd className="text-[10px] font-mono bg-[#162438] text-slate-400 border border-slate-700/60 rounded px-1.5 py-0.5 shadow-xs">
                  Ctrl + K
                </kbd>
              </div>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#0e1828] border border-[#1b2b42] text-slate-300 hover:text-white hover:bg-[#132238] transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-300 hover:text-emerald-400 transition-colors" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-[#0e1828] border border-[#1b2b42] text-slate-300 hover:text-white hover:bg-[#132238] transition-colors relative cursor-pointer"
              title="Thông báo hệ thống"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#070e17]" />
            </button>

            {/* User Profile Container & Dropdown Trigger */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-[#0e1828] border border-transparent hover:border-[#1b2b42] transition-all cursor-pointer select-none"
              >
                {/* Coach Avatar */}
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                    alt="Quản Trị"
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-emerald-500/40"
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-[#070e17]" />
                </div>

                {/* Name & Title (Matching Image) */}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-tight">
                    {user?.name || 'Quản Trị'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                    PT (Huấn luyện viên)
                  </div>
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                    isUserMenuOpen ? 'rotate-180 text-emerald-400' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#0c1626] border border-[#1b2b42] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {/* User Header Summary */}
                  <div className="p-3 pb-3 border-b border-[#1b2b42]/80 flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
                      alt="Quản Trị"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/50"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-white truncate">
                        {user?.name || 'Quản Trị'}
                      </p>
                      <p className="text-xs text-slate-400 truncate">
                        {user?.email || 'quantri@zenfit.vn'}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                        PT (Huấn luyện viên)
                      </span>
                    </div>
                  </div>

                  {/* Actions List */}
                  <div className="py-1.5 space-y-1">
                    {/* 1. Thông tin cá nhân */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsProfileModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#132238] transition-colors cursor-pointer text-left"
                    >
                      <User className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>Thông tin cá nhân</span>
                    </button>

                    {/* 2. Mật khẩu / Đổi mật khẩu */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-200 hover:text-white hover:bg-[#132238] transition-colors cursor-pointer text-left"
                    >
                      <KeyRound className="h-4 w-4 text-amber-400 shrink-0" />
                      <span>Mật khẩu</span>
                    </button>

                    {/* 3. Chuyển sang Admin (Tiện test) */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        loginAsAdmin();
                        navigate('/admin/overview');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-indigo-400 hover:bg-[#132238] transition-colors cursor-pointer text-left"
                    >
                      <Shield className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                      <span>Chuyển sang vai trò Admin</span>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#1b2b42]/80 my-1" />

                  {/* 4. Đăng xuất */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logoutApp();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal
        user={profileUserData}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Mobile Bottom Navigation */}
      <PTBottomNav />
    </div>
  );
}
