import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  TrendingUp,
  Calendar,
  Shield,
  Sun,
  Moon,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useSettings } from '../../../context/SettingsContext';
import CreateUserForm from '../components/CreateUserForm';
import OtpForm from '../components/OtpForm';

export default function RegisterPage() {
  const { theme, toggleTheme } = useSettings();
  const navigate = useNavigate();

  // Quản lý 2 bước: 1 - Đăng ký thông tin, 2 - Xác thực mã OTP
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [registeredEmail, setRegisteredEmail] = useState<string>('');

  const handleRegisterSuccess = (email: string) => {
    setRegisteredEmail(email);
    setCurrentStep(2);
  };

  const handleBackToRegister = () => {
    setCurrentStep(1);
  };

  const handleOtpSuccess = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070f15] text-gray-900 dark:text-white relative overflow-x-hidden font-poppins selection:bg-[#00d68f] selection:text-black transition-colors duration-300">
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
                radial-gradient(circle at 15% 25%, rgba(0, 214, 143, 0.08) 0%, transparent 45%),
                radial-gradient(circle at 85% 65%, rgba(0, 180, 216, 0.05) 0%, transparent 45%),
                linear-gradient(to right, rgba(248, 250, 252, 0.94) 0%, rgba(248, 250, 252, 0.88) 100%)
              `
              : `
                radial-gradient(circle at 15% 25%, rgba(0, 214, 143, 0.15) 0%, transparent 45%),
                radial-gradient(circle at 85% 65%, rgba(0, 180, 216, 0.08) 0%, transparent 45%),
                linear-gradient(to right, rgba(7, 15, 21, 0.94) 0%, rgba(7, 15, 21, 0.88) 100%)
              `,
        }}
      />

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="w-full border-b border-gray-200/80 dark:border-[#142330]/80 bg-white/85 dark:bg-[#070f15]/80 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-300">
          {/* Logo & Brand Slogan */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 bg-white rounded-xl p-1.5 flex items-center justify-center shadow-xs border border-gray-100 dark:border-transparent transition-transform group-hover:scale-105">
                <img src={logo} alt="ZenFit" className="h-full w-full object-contain" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Zen<span className="text-[#00d68f]">Fit</span>
              </span>
            </Link>

            <span className="hidden sm:inline-block h-4 w-px bg-gray-300 dark:bg-gray-700/60 mx-1" />
            <span className="hidden sm:inline-block text-xs text-gray-500 dark:text-gray-400 font-medium">
              Nền tảng quản lý huấn luyện cá nhân
            </span>
          </div>

          {/* Right Actions: Theme Toggle, Trang chủ, Đăng nhập */}
          <div className="flex items-center gap-2.5 sm:gap-6">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Đổi giao diện sáng/tối"
              className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-[#111e2b] border border-gray-200 dark:border-[#1b2f42] text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:border-[#00d68f]/50 transition-colors cursor-pointer"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-gray-700" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>

            <Link
              to="/"
              className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors outline-hidden focus:outline-hidden"
            >
              Trang chủ
            </Link>

            <Link
              to="/login"
              className="px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all hover:shadow-emerald-500/30 outline-hidden focus:outline-hidden"
            >
              ĐĂNG NHẬP
            </Link>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 flex items-center">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
            {/* Cột trái: Thông điệp & 4 thẻ tính năng (Ẩn trên mobile/tablet < 1024px để tối ưu UX tiếp cận form) */}
            <div className="hidden lg:flex lg:col-span-7 flex-col justify-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 self-start px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-[#0c221b]/80 border border-emerald-200 dark:border-[#00d68f]/30 text-emerald-700 dark:text-[#00d68f] text-[11px] sm:text-xs font-semibold uppercase tracking-wider mb-6 shadow-xs backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" />
                <span>THAM GIA CÙNG 100+ HUẤN LUYỆN VIÊN & PT</span>
              </div>

              {/* Logo khối thương hiệu */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-11 w-11 bg-white rounded-2xl p-2 flex items-center justify-center shadow-md border border-gray-100 dark:border-transparent">
                  <img src={logo} alt="ZenFit" className="h-full w-full object-contain" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                  Zen<span className="text-[#00d68f]">Fit</span>
                </span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-gray-900 dark:text-white leading-[1.2] tracking-tight mb-4">
                Bứt phá giới hạn.
                <br />
                Làm chủ hành trình <span className="text-[#00d68f]">thể chất.</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8">
                Số hóa quy trình huấn luyện, tối ưu quản lý hội viên và phát triển sự nghiệp PT trên một nền tảng duy nhất.
              </p>

              {/* 4 Feature Cards (2x2) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/85 dark:bg-[#09141c]/80 backdrop-blur-md border border-gray-200/90 dark:border-[#162736] hover:border-[#00d68f]/40 shadow-sm shadow-gray-200/50 dark:shadow-none rounded-2xl p-5 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-[#0c221b] border border-emerald-200/80 dark:border-[#00d68f]/20 flex items-center justify-center mb-3 text-emerald-600 dark:text-[#00d68f]">
                    <Users className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#00d68f] flex items-center gap-1.5 transition-colors">
                    <span>Quản lý hội viên</span>
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">
                    Theo dõi thông tin, lịch tập và tiến độ của từng hội viên.
                  </p>
                </div>

                <div className="bg-white/85 dark:bg-[#09141c]/80 backdrop-blur-md border border-gray-200/90 dark:border-[#162736] hover:border-[#00d68f]/40 shadow-sm shadow-gray-200/50 dark:shadow-none rounded-2xl p-5 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-[#0c221b] border border-emerald-200/80 dark:border-[#00d68f]/20 flex items-center justify-center mb-3 text-emerald-600 dark:text-[#00d68f]">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#00d68f] flex items-center gap-1.5 transition-colors">
                    <span>Kiểm soát tài chính</span>
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">
                    Quản lý doanh thu, chi phí và báo cáo hiệu quả kinh doanh.
                  </p>
                </div>

                <div className="bg-white/85 dark:bg-[#09141c]/80 backdrop-blur-md border border-gray-200/90 dark:border-[#162736] hover:border-[#00d68f]/40 shadow-sm shadow-gray-200/50 dark:shadow-none rounded-2xl p-5 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-[#0c221b] border border-emerald-200/80 dark:border-[#00d68f]/20 flex items-center justify-center mb-3 text-emerald-600 dark:text-[#00d68f]">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#00d68f] flex items-center gap-1.5 transition-colors">
                    <span>Số hóa giáo án</span>
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">
                    Lên lịch và theo dõi giáo án tập luyện một cách khoa học.
                  </p>
                </div>

                <div className="bg-white/85 dark:bg-[#09141c]/80 backdrop-blur-md border border-gray-200/90 dark:border-[#162736] hover:border-[#00d68f]/40 shadow-sm shadow-gray-200/50 dark:shadow-none rounded-2xl p-5 transition-all duration-300 group">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 dark:bg-[#0c221b] border border-emerald-200/80 dark:border-[#00d68f]/20 flex items-center justify-center mb-3 text-emerald-600 dark:text-[#00d68f]">
                    <Shield className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#00d68f] flex items-center gap-1.5 transition-colors">
                    <span>Hồ sơ chuyên gia</span>
                    <span className="text-xs transition-transform group-hover:translate-x-1">→</span>
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mt-1.5">
                    Xây dựng thương hiệu cá nhân và thu hút học viên tiềm năng.
                  </p>
                </div>
              </div>
            </div>

            {/* Cột phải: Form Đăng ký nổi (Card) */}
            <div className="w-full lg:col-span-5 flex justify-center py-4">
              <div className="w-full max-w-md bg-white/95 dark:bg-[#0c1620]/90 backdrop-blur-xl border border-gray-200/90 dark:border-[#1a2c3d] rounded-3xl p-6 sm:p-8 md:p-9 shadow-xl shadow-gray-200/60 dark:shadow-2xl dark:shadow-black/80 transition-all duration-300">
                {/* Stepper Wizard Indicator */}
                <div className="mb-6 pb-5 border-b border-gray-100 dark:border-[#1a2c3d]">
                  <div className="flex items-center justify-between">
                    {/* Bước 1 */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          currentStep === 1
                            ? 'bg-[#00d68f] text-white ring-4 ring-emerald-500/20 shadow-xs'
                            : 'bg-emerald-500/20 text-[#00d68f]'
                        }`}
                      >
                        {currentStep === 2 ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          '1'
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          currentStep === 1
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        Thông tin
                      </span>
                    </div>

                    {/* Đường nối giữa 2 bước */}
                    <div
                      className={`flex-1 h-0.5 mx-3 rounded-full transition-all duration-500 ${
                        currentStep === 2
                          ? 'bg-[#00d68f]'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />

                    {/* Bước 2 */}
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                          currentStep === 2
                            ? 'bg-[#00d68f] text-white ring-4 ring-emerald-500/20 shadow-xs'
                            : 'bg-gray-100 dark:bg-[#142330] text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        {currentStep === 2 ? (
                          <ShieldCheck className="h-4 w-4" />
                        ) : (
                          '2'
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold ${
                          currentStep === 2
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      >
                        Xác thực OTP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Render theo từng bước */}
                {currentStep === 1 ? (
                  <CreateUserForm onSuccess={handleRegisterSuccess} />
                ) : (
                  <OtpForm
                    initialEmail={registeredEmail}
                    onBackToRegister={handleBackToRegister}
                    onSuccess={handleOtpSuccess}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
