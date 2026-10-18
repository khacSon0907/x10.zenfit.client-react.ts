import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  Users,
  Calendar,
  TrendingUp,
  CalendarCheck,
  Dumbbell,
  Apple,
  ReceiptText,
  CheckCircle2,
} from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';

const FEATURE_LIST = [
  {
    number: '01',
    title: 'Quản lý học viên & CRM',
    description: 'Theo dõi hồ sơ, gói tập, số buổi còn lại và trạng thái chăm sóc khách hàng.',
    icon: Users,
  },
  {
    number: '02',
    title: 'Lịch tập & Check-in',
    description: 'Sắp xếp lịch dạy, ghi nhận buổi tập và cập nhật số buổi tự động theo quy tắc gói.',
    icon: CalendarCheck,
  },
  {
    number: '03',
    title: 'Giáo án tập luyện',
    description: 'Thiết kế chương trình theo mục tiêu, nhóm cơ, set, reps và mức tạ; tái sử dụng mẫu.',
    icon: Dumbbell,
  },
  {
    number: '04',
    title: 'Kế hoạch dinh dưỡng',
    description: 'Lập thực đơn, calories và macro theo ngày; quản lý kế hoạch cho từng học viên.',
    icon: Apple,
  },
  {
    number: '05',
    title: 'Theo dõi tiến độ',
    description: 'Lưu cân nặng, số đo, thành tích và biểu đồ thay đổi theo thời gian.',
    icon: TrendingUp,
  },
  {
    number: '06',
    title: 'Doanh thu & Báo giá',
    description: 'Theo dõi thanh toán, công nợ, gói PT và xuất báo giá chuyên nghiệp.',
    icon: ReceiptText,
  },
];

export default function HomePage() {
  const location = useLocation();
  const [activeSection, setActiveSection] = useState<string>('overview');

  // Tự động scroll đến hash nếu người dùng vào từ URL có #features, #overview...
  useEffect(() => {
    if (location.hash) {
      const targetId = location.hash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      }
      setActiveSection(targetId);
    }
  }, [location.hash]);

  // Scrollspy: Theo dõi vị trí cuộn trang để tự động chuyển tab active giữa 'overview' và 'features'
  useEffect(() => {
    const handleScroll = () => {
      const featuresEl = document.getElementById('features');
      if (!featuresEl) return;

      const rect = featuresEl.getBoundingClientRect();
      // Khi phần tính năng cuộn đến gần đỉnh màn hình (<= 250px)
      if (rect.top <= 250) {
        setActiveSection('features');
      } else {
        setActiveSection('overview');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToFeatures = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSection('features');
    const el = document.getElementById('features');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      window.history.pushState(null, '', '#features');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#070f15] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex-1">
        {/* Header điều hướng chính với trạng thái activeSection đồng bộ theo scroll/click */}
        <Header activeNavId={activeSection} onNavChange={(id) => setActiveSection(id)} />

        {/* HERO SECTION */}
        <main id="overview" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Hiệu ứng ánh sáng nền mờ nhẹ */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-[#00d68f]/5 dark:bg-[#00d68f]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Badge Tiêu đề phụ */}
              <div className="flex justify-center mb-6 sm:mb-8">
                <div className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2 rounded-full bg-emerald-50 dark:bg-[#0c221b] border border-emerald-300/80 dark:border-[#00d68f]/40 text-emerald-700 dark:text-[#00d68f] text-xs sm:text-sm font-bold uppercase tracking-wider shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-[#00d68f] animate-pulse" />
                  <span>NỀN TẢNG HUẤN LUYỆN THÔNG MINH DÀNH CHO PT</span>
                </div>
              </div>

              {/* Tiêu đề chính 2 dòng */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.18] mb-6">
                <span className="text-gray-900 dark:text-white block">
                  Tối ưu cách bạn huấn luyện.
                </span>
                <span className="text-emerald-500 dark:text-[#00d68f] block mt-1 sm:mt-2">
                  Nâng tầm kết quả học viên.
                </span>
              </h1>

              {/* Đoạn mô tả chi tiết */}
              <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto">
                ZenFit giúp bạn kết nối lịch tập, giáo án, hồ sơ học viên và tiến độ huấn luyện trong một không gian làm việc thống nhất — để mỗi buổi tập đều có định hướng, mỗi học viên đều được theo sát.
              </p>

              {/* Nhóm nút CTA căn giữa */}
              <div className="flex flex-wrap items-center justify-center gap-4 mb-14 sm:mb-20">
                {/* Nút Bắt đầu cùng ZenFit -> chuyển hướng vào trang Đăng ký */}
                <Link
                  to="/register"
                  className="px-6 py-3.5 rounded-xl bg-[#00d68f] hover:bg-[#00be7f] active:bg-[#00a870] text-[#070f15] font-bold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5 active:translate-y-0 group cursor-pointer"
                >
                  <span>Bắt đầu cùng ZenFit</span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black/10 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    <ArrowUpRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </span>
                </Link>

                {/* Nút Khám phá giải pháp -> trượt mượt mà đến phần Tính năng */}
                <a
                  href="#features"
                  onClick={scrollToFeatures}
                  className="px-6 py-3.5 rounded-xl border border-gray-300 dark:border-gray-800 hover:border-gray-400 dark:hover:border-gray-700 bg-gray-50/50 dark:bg-white/[0.02] hover:bg-gray-100 dark:hover:bg-white/5 text-gray-800 dark:text-gray-200 font-semibold text-sm sm:text-base inline-flex items-center justify-center transition-all cursor-pointer"
                >
                  Khám phá giải pháp
                </a>
              </div>

              {/* 3 Trụ cột tính năng */}
              <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 pt-8 sm:pt-10 border-t border-gray-200/80 dark:border-[#142330]">
                {/* Cột 1 */}
                <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex items-center gap-2.5">
                    <Users className="h-5 w-5 text-emerald-500 dark:text-[#00d68f]" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Quản lý tập trung
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Hồ sơ và thông tin học viên
                  </p>
                </div>

                {/* Cột 2 */}
                <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="h-5 w-5 text-emerald-500 dark:text-[#00d68f]" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Huấn luyện khoa học
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Lịch tập và giáo án rõ ràng
                  </p>
                </div>

                {/* Cột 3 */}
                <div className="space-y-1.5 flex flex-col items-center sm:items-start text-center sm:text-left">
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="h-5 w-5 text-emerald-500 dark:text-[#00d68f]" />
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                      Theo dõi tiến bộ
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Tiến độ và hiệu quả huấn luyện
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* PHẦN TÍNH NĂNG: Font & form được tinh chỉnh nhỏ gọn, thanh thoát */}
        <section
          id="features"
          className="scroll-mt-24 sm:scroll-mt-28 border-t border-gray-100 dark:border-[#142330]/80 py-12 sm:py-16"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header phần Tính năng */}
            <div className="relative flex flex-col items-center text-center max-w-2xl mx-auto mb-8 sm:mb-10">
              {/* Badge Tiêu đề phụ nhỏ gọn */}
              <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 dark:bg-[#0c221b] border border-emerald-300/80 dark:border-[#00d68f]/40 text-emerald-700 dark:text-[#00d68f] text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-xs mb-3.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-[#00d68f] animate-pulse" />
                <span>HỆ SINH THÁI VẬN HÀNH DÀNH CHO PT</span>
              </div>

              {/* Tiêu đề chính 2 dòng vừa vặn, không quá to */}
              <h2 className="text-2xl sm:text-3xl lg:text-[2.25rem] font-extrabold tracking-tight leading-[1.2] mb-3">
                <span className="text-gray-900 dark:text-white block">
                  Mọi hoạt động huấn luyện.
                </span>
                <span className="text-emerald-500 dark:text-[#00d68f] block mt-1">
                  Một nền tảng duy nhất.
                </span>
              </h2>

              {/* Đoạn mô tả ngắn gọn */}
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto">
                Từ quản lý học viên đến giáo án, lịch tập và doanh thu — ZenFit giúp bạn vận hành khoa học, theo sát từng khách hàng.
              </p>
            </div>

            {/* Lưới 6 thẻ tính năng nhỏ gọn, tinh tế */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {FEATURE_LIST.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.number}
                    className="group rounded-xl border border-gray-200/80 dark:border-[#142636] bg-white dark:bg-[#08131c] p-4 sm:p-5 flex items-start gap-3.5 sm:gap-4 hover:border-emerald-500/40 dark:hover:border-[#00d68f]/40 hover:shadow-md hover:shadow-emerald-500/5 dark:hover:shadow-[#00d68f]/5 transition-all duration-300"
                  >
                    {/* Vòng tròn biểu tượng vừa phải */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-50 dark:bg-[#0c2227] border border-emerald-200/80 dark:border-[#00d68f]/30 flex items-center justify-center shrink-0 text-emerald-600 dark:text-[#00d68f] group-hover:scale-105 group-hover:border-[#00d68f] transition-all">
                      <Icon className="h-5 w-5 stroke-[1.8]" />
                    </div>

                    {/* Nội dung tính năng font size nhỏ gọn hơn */}
                    <div className="flex-1 min-w-0">
                      <span className="block text-[11px] font-mono font-bold text-emerald-600 dark:text-[#00d68f] tracking-widest mb-0.5">
                        {feat.number}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white tracking-tight mb-1">
                        {feat.title}
                      </h3>
                      <p className="text-xs sm:text-[13px] text-gray-500 dark:text-gray-400 leading-normal">
                        {feat.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dải thông tin bổ trợ phía dưới thanh mảnh */}
            <div className="mt-6 sm:mt-8 rounded-xl border border-gray-200/80 dark:border-[#142636] bg-gray-50/70 dark:bg-[#08131c]/70 px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs font-medium text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#00d68f] shrink-0" />
                <span>Cảnh báo khách sắp hết buổi / renew</span>
              </div>

              <span className="hidden md:inline-block w-px h-3.5 bg-gray-300 dark:bg-[#1a2f42]" />

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#00d68f] shrink-0" />
                <span>Nhận diện khách vắng tập</span>
              </div>

              <span className="hidden md:inline-block w-px h-3.5 bg-gray-300 dark:bg-[#1a2f42]" />

              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-[#00d68f] shrink-0" />
                <span>Xuất giáo án, dinh dưỡng & báo giá ra Excel/PDF</span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer chân trang */}
      <Footer />
    </div>
  );
}
