import { Link } from 'react-router-dom';
import { Mail, Headphones, ChevronRight, Zap } from 'lucide-react';
import logoImg from '../../../assets/logo/logo-zenfit.png';

export default function Footer() {
  return (
    <footer className="w-full bg-[#070f15] text-white border-t border-[#142330] relative overflow-hidden font-sans">
      {/* Top CTA Pill Banner (như hình mẫu) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 flex justify-center">
        <Link
          to="/register"
          className="inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-full bg-[#0c221b] border border-[#00d68f]/30 hover:border-[#00d68f]/60 text-[#00d68f] text-xs sm:text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-[#00d68f]/10 hover:scale-[1.02] group"
        >
          <Zap className="h-4 w-4 text-[#00d68f] fill-[#00d68f]" />
          <span>Đồng hành cùng hàng ngàn PT trên hành trình phát triển sự nghiệp</span>
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </Link>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-t border-[#142330]/80">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Cột 1: Thông tin thương hiệu (Chiếm 4 cột trên desktop) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              {/* Logo Badge & Brand Name */}
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="h-9 w-9 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
                  <img
                    src={logoImg}
                    alt="ZenFit Logo"
                    className="h-full w-full object-contain select-none"
                  />
                </div>
                <span className="text-2xl font-extrabold tracking-tight text-white">
                  Zen<span className="text-[#00d68f]">Fit</span>
                </span>
              </Link>

              {/* Tagline */}
              <p className="text-xs sm:text-sm text-gray-300 mt-3 font-medium">
                Nền tảng quản lý dành cho huấn luyện viên cá nhân
              </p>

              {/* Đường kẻ xanh thương hiệu */}
              <div className="w-10 h-0.5 bg-[#00d68f] rounded-full my-3.5" />

              {/* Đoạn mô tả */}
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Quản lý hội viên, lịch huấn luyện, giáo án và hiệu quả kinh doanh trên một nền tảng duy nhất.
              </p>
            </div>

            {/* Mạng xã hội */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="h-9 w-9 rounded-full bg-[#111e2b] border border-[#1b2f42] flex items-center justify-center text-gray-300 hover:text-[#00d68f] hover:border-[#00d68f]/50 hover:bg-[#00d68f]/10 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="h-9 w-9 rounded-full bg-[#111e2b] border border-[#1b2f42] flex items-center justify-center text-gray-300 hover:text-[#00d68f] hover:border-[#00d68f]/50 hover:bg-[#00d68f]/10 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>

              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
                className="h-9 w-9 rounded-full bg-[#111e2b] border border-[#1b2f42] flex items-center justify-center text-gray-300 hover:text-[#00d68f] hover:border-[#00d68f]/50 hover:bg-[#00d68f]/10 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Cột 2: SẢN PHẨM (2 cột) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              SẢN PHẨM
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="#features"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Tính năng</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#solutions"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Giải pháp cho PT</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#pricing"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Bảng giá</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#updates"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Cập nhật mới</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: TÀI KHOẢN (2 cột) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              TÀI KHOẢN
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="/login"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Đăng nhập</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Tạo tài khoản</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#help"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Trung tâm trợ giúp</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 4: KIẾN THỨC (2 cột) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              KIẾN THỨC
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="#handbook"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Cẩm nang dành cho PT</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#client-management"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Quản lý hội viên hiệu quả</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#branding"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Xây dựng thương hiệu cá nhân</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 5: PHÁP LÝ (2 cột) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              PHÁP LÝ
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  to="#terms"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Điều khoản sử dụng</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#privacy"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Chính sách bảo mật</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
              <li>
                <Link
                  to="#cookies"
                  className="text-gray-400 hover:text-[#00d68f] transition-colors flex items-center justify-between group"
                >
                  <span>Chính sách cookie</span>
                  <ChevronRight className="h-3 w-3 text-gray-600 group-hover:text-[#00d68f] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Contacts Bar */}
      <div className="border-t border-[#142330] py-6 bg-[#050b10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          {/* Bản quyền */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span>© 2026 ZenFit. Bảo lưu mọi quyền.</span>
            <span className="hidden sm:inline text-gray-600">|</span>
            <span className="inline-flex items-center gap-1.5 text-gray-300">
              Phát triển tại Việt Nam 🇻🇳
            </span>
          </div>

          {/* Email & Hỗ trợ */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="mailto:support@zenfit.vn"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-[#00d68f] transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-[#00d68f]" />
              <span>support@zenfit.vn</span>
            </a>

            <span className="text-gray-600">|</span>

            <a
              href="#support"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-[#00d68f] transition-colors"
            >
              <Headphones className="h-3.5 w-3.5 text-[#00d68f]" />
              <span>Hỗ trợ PT</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
