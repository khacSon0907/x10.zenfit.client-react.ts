import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Sun, Moon, Menu, X } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import Logo from './logo/Logo';
import NavMenu from './nav/NavMenu';

interface HeaderProps {
  className?: string;
  activeNavId?: string;
}

export default function Header({ className = '', activeNavId }: HeaderProps) {
  const { theme, toggleTheme } = useSettings();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header
      className={`w-full sticky top-0 z-50 border-b border-gray-200/80 dark:border-[#142330]/90 bg-white/85 dark:bg-[#070f15]/85 backdrop-blur-md transition-colors duration-300 ${className}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo */}
        <div className="flex items-center shrink-0">
          <Logo />
        </div>

        {/* Center: Navigation Menu (Desktop) */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <NavMenu activeId={activeNavId} />
        </div>

        {/* Right: Actions (Theme Toggle & Đăng nhập button) */}
        <div className="hidden sm:flex items-center gap-3 lg:gap-4 shrink-0">
          {/* Nút chuyển đổi Dark/Light */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Đổi giao diện sáng/tối"
            title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
            className="h-9 w-9 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#111e2b] border border-gray-200 dark:border-[#1b2f42] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-[#00d68f]/50 transition-colors cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="h-4 w-4 text-gray-700" />
            ) : (
              <Sun className="h-4 w-4 text-amber-400" />
            )}
          </button>

          {/* Nút Đăng nhập bo tròn chuẩn theo mẫu */}
          <Link
            to="/login"
            className="px-5 py-2.5 rounded-full bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-[#070f15] font-bold text-sm flex items-center gap-2 shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <User className="h-4 w-4 stroke-[2.5]" />
            <span>Đăng nhập</span>
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Đổi giao diện sáng/tối"
            className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#111e2b] border border-gray-200 dark:border-[#1b2f42] text-gray-700 dark:text-gray-300"
          >
            {theme === 'light' ? (
              <Moon className="h-3.5 w-3.5 text-gray-700" />
            ) : (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            className="h-9 w-9 rounded-xl flex items-center justify-center bg-gray-100 dark:bg-[#111e2b] text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-[#1b2f42]"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-[#142330] bg-white/95 dark:bg-[#070f15]/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl">
          <NavMenu
            isMobile
            activeId={activeNavId}
            onItemClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="pt-2 border-t border-gray-200 dark:border-[#142330]">
            <Link
              to="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 rounded-xl bg-[#00d68f] hover:bg-[#00be7f] text-[#070f15] font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
            >
              <User className="h-4 w-4 stroke-[2.5]" />
              <span>Đăng nhập</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
