import logo from '../../../assets/logo/logo-zenfit.png';

interface SplashLoaderProps {
  message?: string;
}

export default function SplashLoader({ message = 'Đang khởi tạo phiên làm việc...' }: SplashLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-50/95 dark:bg-gray-900/95 backdrop-blur-sm transition-all duration-300">
      <div className="relative flex flex-col items-center animate-fade-in">
        {/* Animated glowing background */}
        <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/20 blur-xl animate-pulse" />

        {/* Logo Container */}
        <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 p-4 shadow-xl border border-gray-100 dark:border-gray-700/60">
          <img
            src={logo}
            alt="Zenfit Logo"
            className="h-16 w-16 object-contain animate-bounce"
            style={{ animationDuration: '2s' }}
          />
        </div>

        {/* App Title */}
        <div className="mt-5 text-center">
          <h2 className="text-2xl font-bold font-poppins tracking-tight text-gray-800 dark:text-gray-100">
            Zen<span className="text-emerald-500">fit</span>
          </h2>
          <p className="mt-1 text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-semibold">
            Health & Fitness Platform
          </p>
        </div>

        {/* Spinner & Message */}
        <div className="mt-6 flex items-center gap-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}
