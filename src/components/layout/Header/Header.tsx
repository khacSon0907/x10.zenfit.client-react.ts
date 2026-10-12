import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, LogIn, LogOut, User, KeyRound } from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useSettings } from '../../../context/SettingsContext';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import ChangePasswordModal from '../../../features/auth/components/ChangePasswordModal';

function Header() {
  const { theme, toggleTheme } = useSettings();
  const { user, logout } = useAuth();
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Trang chủ', href: '/' },
    { id: 'workouts', label: 'Tập luyện', href: '#workouts' },
    { id: 'nutrition', label: 'Dinh dưỡng', href: '#nutrition' },
    { id: 'community', label: 'Cộng đồng', href: '#community' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 cursor-pointer group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-green-100 to-emerald-50 dark:from-emerald-950 dark:to-gray-800 p-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:-rotate-3">
              <img
                src={logo}
                alt="Zenfit Logo"
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h1 className="text-2xl font-poppins font-bold tracking-tight text-gray-800 dark:text-gray-100 transition-colors duration-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              Zen<span className="text-emerald-500">fit</span>
            </h1>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="text-gray-600 dark:text-gray-300 font-poppins font-medium text-sm hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: theme toggle, login only */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'light' ? 'Chuyển sang giao diện tối' : 'Chuyển sang giao diện sáng'}
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
              className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-5 w-5 text-gray-700 hover:text-emerald-600 transition-colors" />
              ) : (
                <Sun className="h-5 w-5 text-amber-400 hover:text-amber-300 transition-colors" />
              )}
            </button>

            {/* Chỉ giữ 1 nút Đăng nhập trên Navbar */}
            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
                  <User className="h-4 w-4 text-emerald-500" />
                  {user.name || user.username}
                </span>

                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  title="Đổi mật khẩu"
                  className="flex items-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <KeyRound className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="hidden md:inline">Đổi MK</span>
                </button>

                <button
                  onClick={() => logout()}
                  title="Đăng xuất"
                  className="flex items-center gap-1.5 py-2 px-4 rounded-full font-semibold text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Đăng xuất</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 py-2.5 px-5 rounded-full font-semibold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
              >
                <LogIn className="h-4 w-4" />
                <span>Đăng nhập</span>
              </Link>
            )}
          </div>

        </div>
      </div>

      {/* Modal Đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </header>
  );
}

export default Header;