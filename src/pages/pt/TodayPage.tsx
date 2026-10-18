import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  CircleDollarSign,
  Bell,
  ChevronRight,
  Plus,
  Clock,
  Check,
  X,
  CreditCard,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  CalendarCheck2,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkoutSessionItem {
  id: string;
  timeSlot: string;
  clientName: string;
  avatar: string;
  packageInfo: string;
  tags: string[];
  status: 'completed' | 'upcoming' | 'absent';
  accentColor: 'emerald' | 'amber' | 'rose';
}

export default function TodayPage() {
  const [sessions, setSessions] = useState<WorkoutSessionItem[]>([
    {
      id: 'session-1',
      timeSlot: '06:00 - 07:00',
      clientName: 'Nguyễn Văn A',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      packageInfo: 'Tập luyện cá nhân • 12 buổi',
      tags: ['Gym', 'Tăng cơ'],
      status: 'completed',
      accentColor: 'emerald',
    },
    {
      id: 'session-2',
      timeSlot: '08:30 - 09:30',
      clientName: 'Trần Thị Bão',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      packageInfo: 'Tập luyện cá nhân • 8 buổi',
      tags: ['Gym', 'Giảm mỡ'],
      status: 'upcoming',
      accentColor: 'amber',
    },
    {
      id: 'session-3',
      timeSlot: '17:00 - 18:00',
      clientName: 'Lê Minh Cường',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      packageInfo: 'Tập luyện cá nhân • 16 buổi',
      tags: ['Gym', 'Tăng cơ'],
      status: 'absent',
      accentColor: 'rose',
    },
  ]);

  const [selectedSession, setSelectedSession] = useState<WorkoutSessionItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newTimeSlot, setNewTimeSlot] = useState('14:00 - 15:00');
  const [newGoal, setNewGoal] = useState('Tăng cơ');

  // Handle Check-in button
  const handleCheckIn = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: 'completed', accentColor: 'emerald' } : s
      )
    );
    toast.success('Check-in thành công! Đã trừ 1 buổi tập vào gói.');
  };

  // Handle create session form submit
  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) {
      toast.error('Vui lòng nhập tên học viên');
      return;
    }
    const newSession: WorkoutSessionItem = {
      id: `s-${Date.now()}`,
      timeSlot: newTimeSlot,
      clientName: newClientName,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      packageInfo: 'Tập luyện cá nhân • 12 buổi',
      tags: ['Gym', newGoal],
      status: 'upcoming',
      accentColor: 'amber',
    };
    setSessions((prev) => [...prev, newSession]);
    setIsCreateModalOpen(false);
    setNewClientName('');
    toast.success(`Đã tạo lịch tập cho học viên ${newClientName}!`);
  };

  // Recent activities list matching the image
  const recentActivities = [
    {
      id: 'act-1',
      time: '19:45',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
      text: 'Nguyễn Văn A đã check-in buổi tập',
      badge: 'Hoàn thành',
      badgeType: 'success',
      icon: Check,
    },
    {
      id: 'act-2',
      time: '18:20',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      text: 'Trần Thị Bão thanh toán gói tập 12 buổi',
      badge: 'Đã thanh toán',
      badgeType: 'emerald',
      icon: CreditCard,
    },
    {
      id: 'act-3',
      time: '16:32',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
      text: 'Lê Minh Cường đăng ký gói tập mới',
      badge: 'Mới',
      badgeType: 'info',
      icon: UserPlus,
    },
    {
      id: 'act-4',
      time: '14:15',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
      text: 'Phạm Đức Huy gửi yêu cầu đổi lịch tập',
      badge: 'Chờ xử lý',
      badgeType: 'warning',
      icon: CalendarCheck2,
    },
    {
      id: 'act-5',
      time: '10:56',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      text: 'Nguyễn Thị Lan hoàn thành đo chỉ số cơ thể',
      badge: 'Hoàn thành',
      badgeType: 'success',
      icon: TrendingUp,
    },
  ];

  // Outstanding debts list matching the image
  const debts = [
    { name: 'Nguyễn Văn A', amount: '2.000.000đ' },
    { name: 'Trần Thị Bão', amount: '1.500.000đ' },
    { name: 'Lê Minh Cường', amount: '1.000.000đ' },
  ];

  // Expiring packages list matching the image
  const expiringPackages = [
    { name: 'Phạm Đức Huy', remaining: 'còn 3 buổi' },
    { name: 'Hoàng Thị Mai', remaining: 'còn 2 buổi' },
  ];

  // Weekly attendance chart data matching the image
  const attendanceData = [
    { day: 'T2', date: '13/10', count: 8 },
    { day: 'T3', date: '14/10', count: 10 },
    { day: 'T4', date: '15/10', count: 9 },
    { day: 'T5', date: '16/10', count: 11 },
    { day: 'T6', date: '17/10', count: 12, isCurrent: true },
    { day: 'T7', date: '18/10', count: 0 },
    { day: 'CN', date: '19/10', count: 0 },
  ];

  const maxVal = 12;

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header Greeting & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            Chào buổi tối, <span className="text-[#00d68f]">Quản Trị</span> 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tiếp tục hành trình giúp học viên đạt được phiên bản tốt hơn của chính họ!
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Date Picker Button */}
          <button
            onClick={() => toast.info('Bộ chọn ngày: Thứ 6, 17/10/2025')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#0e1828] border border-[#1b2b42] text-xs font-medium text-slate-200 hover:text-white hover:bg-[#132238] transition-colors cursor-pointer shadow-xs"
          >
            <Calendar className="h-4 w-4 text-slate-400" />
            <span>Thứ 6, 17/10/2025</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>

          {/* + Tạo lịch tập Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-98"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            <span>Tạo lịch tập</span>
          </button>
        </div>
      </div>

      {/* 2. Four KPI / Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lịch hôm nay */}
        <Link
          to="/pt/schedule"
          className="p-5 rounded-2xl bg-[#0c1626] border border-[#17263c] hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Calendar className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-400">Lịch hôm nay</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">4</div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              2 đã hoàn thành • 1 sắp tới • 1 vắng
            </div>
          </div>
        </Link>

        {/* Card 2: Học viên đang huấn luyện */}
        <Link
          to="/pt/clients"
          className="p-5 rounded-2xl bg-[#0c1626] border border-[#17263c] hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-400">Học viên đang huấn luyện</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">12</div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <span>↗ 2 so với tuần trước</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Doanh thu tháng */}
        <Link
          to="/pt/revenue"
          className="p-5 rounded-2xl bg-[#0c1626] border border-[#17263c] hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-400">Doanh thu tháng</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">18.000.000đ</div>
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <span>+12% so với tháng trước</span>
            </div>
          </div>
        </Link>

        {/* Card 4: Cần theo dõi */}
        <Link
          to="/pt/renewals"
          className="p-5 rounded-2xl bg-[#0c1626] border border-[#17263c] hover:border-rose-500/40 transition-all group"
        >
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Bell className="h-5 w-5" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-400">Cần theo dõi</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">3</div>
            <div className="text-[11px] text-slate-400 mt-2 truncate">
              1 gói sắp hết hạn • 2 công nợ
            </div>
          </div>
        </Link>
      </div>

      {/* 3. Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Lịch tập hôm nay & Hoạt động gần đây */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Lịch tập hôm nay */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1626] border border-[#17263c] space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-white">Lịch tập hôm nay</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#132238] text-slate-300 border border-[#1b2b42]">
                  4 buổi
                </span>
              </div>
              <Link
                to="/pt/schedule"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Workout session cards */}
            <div className="space-y-3">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-xl bg-[#09111e] border border-[#162338] flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#1e3250] ${
                    session.accentColor === 'emerald'
                      ? 'border-l-4 border-l-emerald-500'
                      : session.accentColor === 'amber'
                      ? 'border-l-4 border-l-amber-500'
                      : 'border-l-4 border-l-rose-500'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Time slot column */}
                    <div className="text-xs font-bold text-white shrink-0 w-20 leading-tight">
                      <div>{session.timeSlot.split('-')[0].trim()}</div>
                      <div className="text-slate-400 font-medium">
                        - {session.timeSlot.split('-')[1]?.trim()}
                      </div>
                    </div>

                    {/* Student Avatar */}
                    <img
                      src={session.avatar}
                      alt={session.clientName}
                      className="h-10 w-10 rounded-full object-cover shrink-0 ring-2 ring-[#17263c]"
                    />

                    {/* Student Info & Tags */}
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">
                        {session.clientName}
                      </h3>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {session.packageInfo}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {session.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#132238] text-slate-300 border border-[#1a2d47]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Status badge & Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {session.status === 'completed' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        <span>Hoàn thành</span>
                      </span>
                    )}

                    {session.status === 'upcoming' && (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-400 border border-amber-800/60 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Sắp tới</span>
                        </span>
                        <button
                          onClick={() => handleCheckIn(session.id)}
                          className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-emerald-500/20 cursor-pointer transition-colors"
                        >
                          <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Check-in</span>
                        </button>
                      </>
                    )}

                    {session.status === 'absent' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/70 text-rose-400 border border-rose-800/60 flex items-center gap-1">
                        <X className="h-3 w-3 stroke-[2.5]" />
                        <span>Vắng</span>
                      </span>
                    )}

                    <button
                      onClick={() => setSelectedSession(session)}
                      className="px-3 py-1.5 rounded-lg border border-[#1b2b42] hover:bg-[#132238] text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Hoạt động gần đây */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1626] border border-[#17263c] space-y-4">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Clock className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-white">Hoạt động gần đây</h2>
              </div>
              <Link
                to="/pt/schedule"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentActivities.map((act) => {
                const IconComp = act.icon;
                return (
                  <div
                    key={act.id}
                    className="p-3 rounded-xl bg-[#09111e] border border-[#152338] flex items-center justify-between gap-3 hover:bg-[#0c1728] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                        <IconComp className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400 shrink-0">
                        {act.time}
                      </span>
                      <img
                        src={act.avatar}
                        alt="User"
                        className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-[#1b2b42]"
                      />
                      <span className="text-xs text-slate-200 font-medium truncate">
                        {act.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          act.badgeType === 'success'
                            ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/50'
                            : act.badgeType === 'emerald'
                            ? 'bg-teal-950/70 text-teal-400 border border-teal-800/50'
                            : act.badgeType === 'info'
                            ? 'bg-sky-950/70 text-sky-400 border border-sky-800/50'
                            : 'bg-amber-950/70 text-amber-400 border border-amber-800/50'
                        }`}
                      >
                        {act.badge}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Cần xử lý & Tình hình điểm danh tuần */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Cần xử lý */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1626] border border-[#17263c] space-y-5">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-white">Cần xử lý</h2>
              </div>
              <Link
                to="/pt/renewals"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
              >
                <span>Xem tất cả</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Sub-section 1: Công nợ cần thu */}
            <div className="p-4 rounded-xl bg-[#09111e] border border-[#162338] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CircleDollarSign className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Công nợ cần thu</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-rose-400">4.500.000đ</span>
                  <span className="text-[11px] text-slate-400">3 học viên</span>
                </div>
              </div>

              <div className="divide-y divide-[#162338] pt-1">
                {debts.map((debt) => (
                  <div
                    key={debt.name}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-200">{debt.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-300">{debt.amount}</span>
                      <button
                        onClick={() =>
                          toast.success(`Đã gửi thông báo nhắc học phí đến ${debt.name}!`)
                        }
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Nhắc nhở</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sub-section 2: Gói tập sắp hết hạn */}
            <div className="p-4 rounded-xl bg-[#09111e] border border-[#162338] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-xs font-bold text-white">Gói tập sắp hết hạn</span>
                </div>
                <Link
                  to="/pt/renewals"
                  className="text-[11px] font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-0.5"
                >
                  <span>2 gói</span>
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>

              <div className="divide-y divide-[#162338] pt-1">
                {expiringPackages.map((pkg) => (
                  <div
                    key={pkg.name}
                    className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span className="font-semibold text-slate-200">{pkg.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400">{pkg.remaining}</span>
                      <button
                        onClick={() =>
                          toast.success(`Đã gửi ưu đãi gia hạn gói đến ${pkg.name}!`)
                        }
                        className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-0.5 cursor-pointer"
                      >
                        <span>Gia hạn</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Tình hình điểm danh tuần */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#0c1626] border border-[#17263c] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <h2 className="text-base font-bold text-white">Tình hình điểm danh tuần</h2>
              </div>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#132238] text-slate-300 border border-[#1b2b42]">
                T7
              </span>
            </div>

            {/* Attendance Bar Chart Container */}
            <div className="pt-4">
              <div className="h-44 flex items-end justify-between gap-2 px-2 relative">
                {/* Horizontal guide lines */}
                <div className="absolute inset-x-0 top-0 border-b border-slate-800/40" />
                <div className="absolute inset-x-0 top-1/4 border-b border-slate-800/40" />
                <div className="absolute inset-x-0 top-2/4 border-b border-slate-800/40" />
                <div className="absolute inset-x-0 top-3/4 border-b border-slate-800/40" />

                {/* Y-Axis Label */}
                <div className="absolute left-0 top-0 text-[10px] text-slate-500 font-mono">12</div>
                <div className="absolute left-0 top-1/4 text-[10px] text-slate-500 font-mono">9</div>
                <div className="absolute left-0 top-2/4 text-[10px] text-slate-500 font-mono">6</div>
                <div className="absolute left-0 top-3/4 text-[10px] text-slate-500 font-mono">3</div>
                <div className="absolute left-0 bottom-0 text-[10px] text-slate-500 font-mono">0</div>

                {/* Bars */}
                {attendanceData.map((item) => {
                  const heightPercent = item.count > 0 ? (item.count / maxVal) * 100 : 0;
                  return (
                    <div
                      key={item.day}
                      className="flex-1 flex flex-col items-center h-full justify-end group z-10"
                    >
                      {/* Bar Value Tooltip */}
                      <span className="text-[10px] font-bold text-slate-300 mb-1 group-hover:text-emerald-400 transition-colors">
                        {item.count}
                      </span>

                      {/* Bar Column */}
                      <div className="w-full max-w-[28px] h-32 flex items-end justify-center">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-t-md transition-all duration-300 ${
                            item.count > 0
                              ? item.isCurrent
                                ? 'bg-gradient-to-t from-emerald-600 to-emerald-400 shadow-lg shadow-emerald-500/30'
                                : 'bg-gradient-to-t from-emerald-800/80 to-emerald-500/80 group-hover:to-emerald-400'
                              : 'bg-transparent'
                          }`}
                        />
                      </div>

                      {/* Day Label */}
                      <div className="mt-2 text-center">
                        <span
                          className={`text-xs font-bold block ${
                            item.isCurrent ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {item.day}
                        </span>
                        <span className="text-[9px] text-slate-500 block">{item.date}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Chart Legend */}
              <div className="mt-5 pt-3 border-t border-[#162338] flex items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span>Có mặt</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-slate-700" />
                  <span>Vắng</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tạo lịch tập */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c1626] rounded-2xl p-6 border border-[#1b2b42] shadow-2xl space-y-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Tạo lịch tập mới</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Đặt lịch tập và phân bổ khung giờ cho học viên của bạn.
              </p>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tên học viên
                </label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  placeholder="Ví dụ: Hoàng Tuấn Kiệt"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#09111e] border border-[#17263c] text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Khung giờ
                  </label>
                  <select
                    value={newTimeSlot}
                    onChange={(e) => setNewTimeSlot(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#09111e] border border-[#17263c] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="06:00 - 07:00">06:00 - 07:00</option>
                    <option value="08:30 - 09:30">08:30 - 09:30</option>
                    <option value="14:00 - 15:00">14:00 - 15:00</option>
                    <option value="17:00 - 18:00">17:00 - 18:00</option>
                    <option value="18:30 - 19:30">18:30 - 19:30</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mục tiêu tập
                  </label>
                  <select
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#09111e] border border-[#17263c] text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Tăng cơ">Tăng cơ</option>
                    <option value="Giảm mỡ">Giảm mỡ</option>
                    <option value="Săn chắc">Săn chắc</option>
                    <option value="Cải thiện sức bền">Cải thiện sức bền</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl border border-[#17263c] text-xs font-semibold text-slate-300 hover:bg-[#132238] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Tạo lịch ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem chi tiết buổi tập */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-[#0c1626] rounded-2xl p-6 border border-[#1b2b42] shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedSession(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 pb-3 border-b border-[#162338]">
              <img
                src={selectedSession.avatar}
                alt={selectedSession.clientName}
                className="h-12 w-12 rounded-full object-cover ring-2 ring-emerald-500/40"
              />
              <div>
                <h3 className="text-base font-bold text-white">
                  {selectedSession.clientName}
                </h3>
                <p className="text-xs text-slate-400">{selectedSession.packageInfo}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#162338]/60">
                <span className="text-slate-400">Khung giờ:</span>
                <span className="font-bold text-white">{selectedSession.timeSlot}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#162338]/60">
                <span className="text-slate-400">Trạng thái:</span>
                <span
                  className={`font-semibold ${
                    selectedSession.status === 'completed'
                      ? 'text-emerald-400'
                      : selectedSession.status === 'upcoming'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {selectedSession.status === 'completed'
                    ? 'Đã hoàn thành'
                    : selectedSession.status === 'upcoming'
                    ? 'Sắp tới'
                    : 'Vắng'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#162338]/60">
                <span className="text-slate-400">Thẻ phân loại:</span>
                <div className="flex gap-1.5">
                  {selectedSession.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-[#132238] text-slate-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="py-1.5">
                <span className="text-slate-400 block mb-1">Ghi chú giáo án:</span>
                <p className="p-3 rounded-xl bg-[#09111e] text-slate-300 border border-[#162338] italic">
                  Khởi động khớp vai, tập bài Bench Press 4 hiệp x 10 rep, Incline Dumbbell Press 3 hiệp. Theo dõi nhịp tim ổn định.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedSession(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
