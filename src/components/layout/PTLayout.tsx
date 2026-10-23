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
import ChangePasswordModal from '../../features/auth/components/ChangePasswordModal';
import logo from '../../assets/logo/logo-zenfit.png';
import type { UserProfile } from '../../types/auth';
import { getUserRoleLabel, isAdminUser } from '../../shared/utils/roleUtils';
import Avatar from '../Avatar';
import { useMe } from '../../hooks/useMe';

export default function PTLayout() {
  const { theme, toggleTheme, isSidebarCollapsed, toggleSidebarCollapse } = useSettings();
  const { user, loginAsAdmin, logoutApp } = useApp();
  const { user: authUser } = useAuth();
  const { data: meUser } = useMe();
  const navigate = useNavigate();

  const currentDisplayName =
    meUser?.username || authUser?.name || authUser?.username || user?.name || 'Huấn Luyện Viên';
  const currentEmail = meUser?.email || authUser?.email || user?.email || 'pt@zenfit.vn';
  const currentAvatarUrl = meUser?.avatarUrl || authUser?.avatarUrl || null;

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
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
    id: user?.id || 'pt-user',
    username: 'user',
    name: user?.name || 'Huấn Luyện Viên',
    email: user?.email || 'pt@zenfit.vn',
    roleIds: ['role-1'],
    roles: [user?.role || 'ROLE_PT'],
    accessToken: '',
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e17] text-slate-800 dark:text-slate-100 font-poppins flex transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex shrink-0 h-screen sticky top-0 z-40 transition-all duration-300">
        <PTSidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-xs"
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
        <header className="h-18 bg-white/90 dark:bg-[#070e17]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-[#162338] sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
              aria-label="Mở menu"
              title="Mở menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Desktop Sidebar Toggle */}
            <button
              onClick={toggleSidebarCollapse}
              className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
              title={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
              aria-label={isSidebarCollapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Logo Branding */}
            <div className="flex items-center gap-2 md:hidden">
              <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
              <span className="font-bold text-slate-900 dark:text-white text-base">
                Zen<span className="text-[#00d68f]">Fit</span>
              </span>
            </div>

            {/* Search Input Bar */}
            <div className="relative w-full hidden sm:block">
              <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Tìm kiếm học viên, lịch tập, tên gói tập..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/50 transition-all"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
                <kbd className="text-[10px] font-mono bg-white dark:bg-[#162438] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700/60 rounded px-1.5 py-0.5 shadow-xs">
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
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#132238] transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-600 hover:text-emerald-500 transition-colors" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              className="h-9 w-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#132238] transition-colors relative cursor-pointer"
              title="Thông báo hệ thống"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#070e17]" />
            </button>

            {/* User Profile Container & Dropdown Trigger */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-3 p-1 sm:px-2 sm:py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0e1828] border border-transparent hover:border-slate-200 dark:hover:border-[#1b2b42] transition-all cursor-pointer select-none"
              >
                {/* Coach Avatar */}
                <div className="relative">
                  <Avatar
                    src={currentAvatarUrl}
                    name={currentDisplayName}
                    size="md"
                    showCameraBadge={false}
                  />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#070e17]" />
                </div>

                {/* Name & Title */}
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                    {currentDisplayName}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight mt-0.5">
                    {getUserRoleLabel(authUser || user)}
                  </div>
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 hidden sm:block ${
                    isUserMenuOpen ? 'rotate-180 text-emerald-500' : ''
                  }`}
                />
              </button>

              {/* User Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#1b2b42] shadow-xl dark:shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
                  {/* User Header Summary */}
                  <div
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      navigate('/pt/profile');
                    }}
                    className="p-3 pb-3 border-b border-slate-100 dark:border-[#1b2b42]/80 flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0e1828] rounded-xl transition-colors"
                    title="Xem trang cá nhân"
                  >
                    <Avatar
                      src={currentAvatarUrl}
                      name={currentDisplayName}
                      size="md"
                      showCameraBadge={false}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {currentDisplayName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {currentEmail}
                      </p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                        {getUserRoleLabel(authUser || user)}
                      </span>
                    </div>
                  </div>

                  {/* Actions List */}
                  <div className="py-1.5 space-y-1">
                    {/* 1. Thông tin cá nhân */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/pt/profile');
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132238] transition-colors cursor-pointer text-left"
                    >
                      <User className="h-4 w-4 text-emerald-500 shrink-0" />
                      <span>Thông tin cá nhân</span>
                    </button>

                    {/* 2. Mật khẩu / Đổi mật khẩu */}
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        setIsPasswordModalOpen(true);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#132238] transition-colors cursor-pointer text-left"
                    >
                      <KeyRound className="h-4 w-4 text-amber-500 shrink-0" />
                      <span>Mật khẩu</span>
                    </button>

                    {/* 3. Chuyển sang Admin (Dành cho tài khoản có quyền ADMIN) */}
                    {isAdminUser(profileUserData) && (
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          loginAsAdmin();
                          navigate('/admin/overview');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-[#132238] transition-colors cursor-pointer text-left"
                      >
                        <Shield className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                        <span>Chuyển sang vai trò Admin</span>
                      </button>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100 dark:border-[#1b2b42]/80 my-1" />

                  {/* 4. Đăng xuất */}
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logoutApp();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer text-left"
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
