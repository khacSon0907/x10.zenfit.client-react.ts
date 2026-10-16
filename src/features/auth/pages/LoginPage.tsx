import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../../../context/SettingsContext';
import LoginForm from '../components/LoginForm';

export default function LoginPage() {
  const { theme, toggleTheme } = useSettings();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070f15] text-gray-900 dark:text-white relative overflow-x-hidden font-sans selection:bg-[#00d68f] selection:text-black transition-colors duration-300 flex items-center justify-center p-4 sm:p-6">
      {/* Background Image Gym với opacity thích ứng theo sáng/tối */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center z-0 opacity-15 dark:opacity-40 mix-blend-luminosity transition-opacity duration-300"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop')`,
        }}
      />

      {/* Lớp phủ Radial Gradient tạo ánh sáng xanh ngọc neon */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-300"
        style={{
          background:
            theme === 'light'
              ? `
                radial-gradient(circle at 50% 30%, rgba(0, 214, 143, 0.08) 0%, transparent 55%),
                radial-gradient(circle at 85% 85%, rgba(0, 180, 216, 0.05) 0%, transparent 45%),
                linear-gradient(to bottom right, rgba(248, 250, 252, 0.94) 0%, rgba(248, 250, 252, 0.88) 100%)
              `
              : `
                radial-gradient(circle at 50% 30%, rgba(0, 214, 143, 0.16) 0%, transparent 55%),
                radial-gradient(circle at 85% 85%, rgba(0, 180, 216, 0.08) 0%, transparent 45%),
                linear-gradient(to bottom right, rgba(7, 15, 21, 0.94) 0%, rgba(7, 15, 21, 0.88) 100%)
              `,
        }}
      />

      {/* Nút chuyển đổi Dark/Light tinh tế ở góc phải màn hình */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-20">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Đổi giao diện sáng/tối"
          title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          className="h-10 w-10 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#111e2b]/90 backdrop-blur-md border border-gray-200 dark:border-[#1b2f42] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-[#00d68f]/50 shadow-md shadow-gray-200/50 dark:shadow-black/50 transition-all cursor-pointer active:scale-95"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4 text-gray-700" />
          ) : (
            <Sun className="h-4 w-4 text-amber-400" />
          )}
        </button>
      </div>

      {/* Duy nhất 1 Card Login nằm chính giữa màn hình */}
      <div className="relative z-10 w-full max-w-md my-auto">
        <div className="w-full bg-white/95 dark:bg-[#0c1620]/90 backdrop-blur-xl border border-gray-200/90 dark:border-[#1a2c3d] rounded-3xl p-6 sm:p-8 md:p-9 shadow-xl shadow-gray-200/60 dark:shadow-2xl dark:shadow-black/80 transition-colors duration-300">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
