import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Dumbbell, Utensils, Users, CheckCircle2, Flame, Award, HeartPulse } from 'lucide-react';

export default function HomePage() {
  const highlights = [
    {
      icon: Dumbbell,
      title: 'Tập luyện thông minh',
      desc: 'Hàng trăm bài tập từ cơ bản đến nâng cao, thiết kế khoa học theo từng nhóm cơ và mục tiêu cá nhân.',
      tag: '500+ Bài tập',
    },
    {
      icon: Utensils,
      title: 'Dinh dưỡng cá nhân hóa',
      desc: 'Theo dõi calo, tỷ lệ macro (đạm, carb, chất béo) và gợi ý thực đơn phù hợp với thể trạng của bạn.',
      tag: 'Thực đơn chuẩn hóa',
    },
    {
      icon: Users,
      title: 'Cộng đồng năng động',
      desc: 'Giao lưu, chia sẻ kinh nghiệm luyện tập và cùng nhau tham gia các thử thách nâng cao thể lực.',
      tag: '10,000+ Thành viên',
    },
  ];

  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION (Phần giới thiệu) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-8 sm:p-14 lg:p-20 shadow-2xl">
        {/* Glow & background patterns */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-400/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-teal-400/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium tracking-wide text-emerald-100 shadow-sm">
            <Flame className="h-4 w-4 text-amber-300" />
            <span>Nền tảng rèn luyện & dinh dưỡng toàn diện</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight sm:leading-none">
            Khỏe mạnh hơn mỗi ngày cùng{' '}
            <span className="text-emerald-300 underline decoration-emerald-400/50 underline-offset-8">
              Zenfit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-emerald-50/90 leading-relaxed font-normal max-w-2xl mx-auto">
            Người bạn đồng hành thông minh giúp bạn tối ưu hóa lịch tập luyện, cân đối dinh dưỡng khoa học và vững bước đạt mục tiêu vóc dáng lý tưởng.
          </p>

          {/* Hai lựa chọn CTA theo yêu cầu: Nút chính (Bắt đầu ngay / Đăng nhập) & Nút phụ (Tạo tài khoản) */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* Nút chính */}
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-white text-emerald-800 font-bold text-base shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <span>Bắt đầu ngay</span>
              <ArrowRight className="h-5 w-5 text-emerald-700" />
            </Link>

            {/* Nút phụ: Tạo tài khoản */}
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-emerald-500/30 hover:bg-emerald-500/40 text-white font-semibold text-base border border-white/30 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              <UserPlus className="h-5 w-5" />
              <span>Tạo tài khoản</span>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-white/15 mt-8 text-center">
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">500+</div>
              <div className="text-xs sm:text-sm text-emerald-100/80">Bài tập chuẩn hóa</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">100%</div>
              <div className="text-xs sm:text-sm text-emerald-100/80">Lộ trình cá nhân</div>
            </div>
            <div>
              <div className="text-xl sm:text-3xl font-black text-white">10K+</div>
              <div className="text-xs sm:text-sm text-emerald-100/80">Hội viên tin chọn</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TẬP LUYỆN SECTION (#workouts) */}
      <section id="workouts" className="scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">
              Chương trình chuyên sâu
            </span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              Tập luyện hiệu quả & đúng kỹ thuật
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
            Từ bài tập tại nhà không cần dụng cụ đến giáo án gym bài bản cho từng nhóm cơ mục tiêu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="group relative p-8 rounded-3xl bg-white dark:bg-gray-800/80 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <div className="inline-flex p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="ml-3 inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-750 text-gray-600 dark:text-gray-300">
                    {item.tag}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 mt-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center text-sm font-semibold text-emerald-600 dark:text-emerald-400 group-hover:gap-2 transition-all">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. DINH DƯỠNG SECTION (#nutrition) */}
      <section
        id="nutrition"
        className="scroll-mt-28 rounded-3xl bg-emerald-50/50 dark:bg-gray-800/40 p-8 sm:p-12 border border-emerald-100/80 dark:border-gray-750"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <HeartPulse className="h-4 w-4" />
              <span>Chế độ dinh dưỡng khoa học</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              Ăn uống ngon miệng mà vẫn đạt mục tiêu thể hình
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-base leading-relaxed">
              Không cần kiêng khem khắc nghiệt. Zenfit giúp bạn tính toán chuẩn xác lượng calo nạp vào và đề xuất các món ăn bổ dưỡng, tiện lợi, dễ thực hiện.
            </p>

            <ul className="space-y-3 pt-2">
              {[
                'Tính toán chỉ số TDEE, BMR và Macro tự động theo cân nặng, chiều cao',
                'Thư viện món ăn Việt lành mạnh, rõ ràng thành phần dinh dưỡng',
                'Nhắc nhở uống nước và thời gian bổ sung năng lượng sau buổi tập',
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5"
              >
                <span>Nhận kế hoạch dinh dưỡng</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Visual Nutrition Card */}
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-4">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Mục tiêu hôm nay</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dinh dưỡng theo ngày</p>
              </div>
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold">
                Đang tối ưu
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <span>Protein (Đạm)</span>
                  <span className="font-bold text-gray-900 dark:text-gray-200">120g / 140g</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <span>Carbohydrate (Tinh bột)</span>
                  <span className="font-bold text-gray-900 dark:text-gray-200">180g / 220g</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '70%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                  <span>Chất béo tốt</span>
                  <span className="font-bold text-gray-900 dark:text-gray-200">45g / 50g</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-teal-500 h-full rounded-full" style={{ width: '90%' }} />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-gray-750/70 border border-emerald-100 dark:border-gray-700 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-3">
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Tuyệt vời! Bạn đã hoàn thành 85% chỉ tiêu dinh dưỡng cân bằng hôm nay.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CỘNG ĐỒNG SECTION (#community) */}
      <section id="community" className="scroll-mt-28 text-center space-y-8">
        <div className="max-w-2xl mx-auto space-y-3">
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm uppercase tracking-wider">
            Kết nối & Truyền cảm hứng
          </span>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Gia nhập cộng đồng Zenfit
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Hàng ngàn gymer, runner và những người yêu thể thao cùng chia sẻ tiến độ, cổ vũ tinh thần và chinh phục mục tiêu sức khỏe mỗi ngày.
          </p>
        </div>

        <div className="p-10 rounded-3xl bg-gradient-to-r from-emerald-700 to-teal-800 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Sẵn sàng thay đổi bản thân?</h3>
            <p className="text-emerald-100 text-sm max-w-lg">
              Tạo tài khoản miễn phí ngay hôm nay để nhận trọn bộ bài tập mẫu và công cụ theo dõi calo cá nhân hóa.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-white text-emerald-800 font-bold text-sm shadow-md hover:bg-emerald-50 transition-all duration-200 hover:-translate-y-0.5"
            >
              Đăng ký ngay
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl border border-white/40 text-white font-semibold text-sm hover:bg-white/10 transition-all duration-200"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
