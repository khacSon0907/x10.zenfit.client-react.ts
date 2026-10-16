import Header from '../../components/layout/Header/Header';
import Footer from '../../components/layout/Footer/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-[#070f15] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="flex-1">
        {/* Header điều hướng chính */}
        <Header activeNavId="overview" />

        {/* Nội dung trang chủ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-[#0c221b] border border-emerald-200 dark:border-[#00d68f]/30 text-emerald-700 dark:text-[#00d68f] text-xs font-semibold uppercase tracking-wider mb-6">
              NỀN TẢNG QUẢN LÝ DÀNH CHO HUẤN LUYỆN VIÊN (PT)
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">
              Nâng tầm chuyên nghiệp.
              <br />
              Tối ưu hóa hành trình <span className="text-[#00d68f]">ZenFit.</span>
            </h1>

            <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
              Giải pháp toàn diện giúp PT quản lý học viên, sắp xếp lịch tập, thiết kế giáo án và theo dõi doanh thu trên một nền tảng duy nhất.
            </p>
          </div>
        </main>
      </div>

      {/* Footer chân trang */}
      <Footer />
    </div>
  );
}
