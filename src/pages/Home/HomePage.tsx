import { Link } from 'react-router-dom';
import { ArrowUpRight, Users, Calendar, TrendingUp } from 'lucide-react';
import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-[#070f15] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex-1">
        {/* Header điều hướng chính */}
        <Header activeNavId="overview" />

        {/* Nội dung trang chủ: cách xa header, căn giữa đẹp mắt */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
          <div className="relative max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Hiệu ứng ánh sáng nền mờ nhẹ */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-[#00d68f]/5 dark:bg-[#00d68f]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 w-full flex flex-col items-center">
              {/* Badge Tiêu đề phụ có border radius & justify-center ở giữa */}
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

                {/* Nút Khám phá giải pháp */}
                <a
                  href="#solutions"
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
      </div>

      {/* Footer chân trang */}
      <Footer />
    </div>
  );
}
