import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Moon,
  LogIn,
  LogOut,
  User,
  KeyRound,
  ChevronDown,
  Shield,
  Menu,
  X,
  Dumbbell,
  Utensils,
  Users,
  Home,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import ChangePasswordModal from '../../../features/auth/components/ChangePasswordModal';
import UserProfileModal from '../../../features/auth/components/UserProfileModal';

function Header() {
  const { theme, toggleTheme } = useSettings();
  const { user, logout } = useAuth();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setIsDropdownOpen(false);
      }
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target) &&
        !(target as HTMLElement).closest('#mobile-menu-trigger')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);


  const navItems = [
    { id: 'home', label: 'Trang chủ', href: '/', icon: Home },
    { id: 'workouts', label: 'Tập luyện', href: '#workouts', icon: Dumbbell },
    { id: 'nutrition', label: 'Dinh dưỡng', href: '#nutrition', icon: Utensils },
    { id: 'community', label: 'Cộng đồng', href: '#community', icon: Users },
  ];

  const userDisplayName = user?.name || user?.username || 'Tài khoản';
  const userInitials = (userDisplayName || 'U').slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-xs border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group shrink-0">
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-tr from-green-100 to-emerald-50 dark:from-emerald-950 dark:to-gray-800 p-1.5 sm:p-2 shadow-xs transition-all duration-300 group-hover:scale-105 group-hover:shadow-md">
              <img
                src={logo}
                alt="Zenfit Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-poppins font-bold tracking-tight text-gray-800 dark:text-gray-100 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Zen<span className="text-emerald-500">fit</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 lg:gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 font-poppins font-medium text-sm hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-200 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: Theme toggle, Login / User Dropdown, Mobile menu button */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              className="h-9 w-9 sm:h-10 sm:w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700 hover:text-emerald-600 transition-colors" />
              ) : (
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>

            {/* User Dropdown hoặc Nút Đăng nhập */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 sm:gap-2 py-1.5 pl-1.5 pr-2.5 sm:pl-2 sm:pr-3 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer"
                >
                  {/* Avatar Mini */}
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                    {userInitials}
                  </div>

                  {/* Name (hidden on very small screens, visible on sm+) */}
                  <span className="hidden sm:inline-block text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-200 max-w-[100px] md:max-w-[140px] truncate">
                    {userDisplayName}
                  </span>

                  {/* Chevron Icon */}
                  <ChevronDown
                    className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400 transition-transform duration-200 ${
                      isDropdownOpen ? 'rotate-180 text-emerald-500' : ''
                    }`}
                  />
                </button>

                {/* Dropdown Menu Box (Responsive width and alignment) */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-64 max-w-xs rounded-2xl bg-white dark:bg-gray-850 shadow-2xl border border-gray-100 dark:border-gray-750 py-2 z-50 animate-fade-in divide-y divide-gray-100 dark:divide-gray-800">
                    {/* Header thông tin người dùng */}
                    <div className="px-4 py-3">
                      <p className="text-[11px] font-medium text-gray-400 dark:text-gray-400">
                        Đang đăng nhập với
                      </p>
                      <p className="text-sm font-bold text-gray-900 dark:text-gray-100 truncate mt-0.5">
                        {userDisplayName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>

                      {/* Role badge */}
                      {user.roles && user.roles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.roles.map((role) => (
                            <span
                              key={role}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                            >
                              <Shield className="h-2.5 w-2.5" />
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Menu Actions */}
                    <div className="py-1">
                      {/* 1. Thông tin cá nhân */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsProfileOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                      >
                        <User className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Thông tin cá nhân</span>
                      </button>

                      {/* 2. Đổi mật khẩu */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setIsChangePasswordOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                      >
                        <KeyRound className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span>Đổi mật khẩu</span>
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => {
                          setIsDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4 shrink-0" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 sm:gap-2 py-2 px-3.5 sm:py-2.5 sm:px-5 rounded-full font-semibold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer shrink-0"
              >
                <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Hamburger Button for Mobile (< md) */}
            <button
              id="mobile-menu-trigger"
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              className="md:hidden h-9 w-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors cursor-pointer shrink-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Navigation (Hiển thị khi mở Hamburger trên điện thoại/máy tính bảng) */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg px-4 pt-3 pb-6 animate-fade-in shadow-xl transition-all"
        >
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          {/* Thông tin nhanh hoặc nút đăng nhập trong Mobile Menu */}
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {userDisplayName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsProfileOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <User className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Hồ sơ</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsChangePasswordOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <KeyRound className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Đổi MK</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Đăng nhập</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-xs"
                >
                  <span>Đăng ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Thông tin cá nhân */}
      <UserProfileModal
        user={user}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Modal Đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
}

export default Header;