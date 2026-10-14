import { Play, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

export default function TodayPage() {
  const { todaySessions, checkInSession, checkOutSession, cancelSession, markAbsentSession } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Hôm nay
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Theo dõi lịch tập và thao tác check-in/check-out trực tiếp cho từng học viên.
        </p>
      </div>

      {/* KPI Cards Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Buổi tập hôm nay"
          value={`${todaySessions.filter((s) => s.status === 'completed').length}/${todaySessions.length}`}
          subtitle="Đã hoàn thành / Tổng số buổi"
          highlightColor="emerald"
        />
        <StatCard
          title="Doanh thu dự kiến tháng này"
          value="24.500.000 đ"
          subtitle="Đã thu thực tế: 18.000.000 đ"
          highlightColor="sky"
        />
        <StatCard
          title="Tổng công nợ khách"
          value="3.900.000 đ"
          subtitle="2 học viên cần thu đợt 2"
          highlightColor="amber"
        />
      </div>

      {/* Danh sách buổi tập hôm nay */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white">
          Danh sách buổi tập theo giờ
        </h2>

        <div className="space-y-3">
          {todaySessions.map((session) => (
            <div
              key={session.id}
              className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-850/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 dark:text-white text-base">
                    {session.clientName}
                  </span>
                  <StatusBadge
                    label={
                      session.status === 'completed'
                        ? 'Đã hoàn thành'
                        : session.status === 'in_progress'
                        ? 'Đang tập'
                        : session.status === 'absent'
                        ? 'Vắng'
                        : session.status === 'cancelled'
                        ? 'Đã hủy'
                        : 'Sắp tới'
                    }
                    variant={
                      session.status === 'completed'
                        ? 'success'
                        : session.status === 'in_progress'
                        ? 'info'
                        : session.status === 'absent' || session.status === 'cancelled'
                        ? 'danger'
                        : 'warning'
                    }
                  />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-3.5 w-3.5" />
                    {session.timeSlot}
                  </span>
                  <span>•</span>
                  <span>Gói còn: <strong className="text-gray-800 dark:text-gray-200">{session.packageRemainingSessions}/{session.packageTotalSessions}</strong> buổi</span>
                </div>
                {session.notes && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 italic pt-1">
                    Ghi chú: {session.notes}
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                {session.status === 'upcoming' && (
                  <>
                    <button
                      onClick={() => checkInSession(session.id)}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Play className="h-3.5 w-3.5" />
                      Check-in
                    </button>
                    <button
                      onClick={() => markAbsentSession(session.id)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Vắng
                    </button>
                    <button
                      onClick={() => cancelSession(session.id)}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 text-gray-700 dark:text-gray-300 rounded-xl text-xs font-medium cursor-pointer"
                    >
                      Hủy
                    </button>
                  </>
                )}

                {session.status === 'in_progress' && (
                  <button
                    onClick={() => checkOutSession(session.id)}
                    className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-md animate-pulse"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Check-out (Trừ 1 buổi)
                  </button>
                )}

                {session.status === 'completed' && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    Đã hoàn thành lúc {session.checkOutTime || '08:00'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
