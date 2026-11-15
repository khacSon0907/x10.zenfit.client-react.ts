import React from 'react';
import {
  User,
  Plus,
  Clock,
  Camera,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type {
  TrainingSessionCalendarItem,
  TrainerTask,
} from '../../types/session.types';
import { SESSION_STATUS_CONFIG } from '../../types/session.types';
import { getWeekDays, formatTimeRange, isPastDateTime } from '../../utils/calendarUtils';

interface PtCalendarWeekViewProps {
  activeDate: Date;
  sessions: TrainingSessionCalendarItem[];
  tasks?: TrainerTask[];
  onSelectSession: (session: TrainingSessionCalendarItem) => void;
  onSelectTask?: (task: TrainerTask) => void;
  onCheckIn?: (sessionId: string) => void;
  onComplete?: (sessionId: string) => void;
  onNoShow?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onAddSession?: (dateStr: string, timeSlot: string) => void;
  clientsMap?: Map<string, string>;
  isLoading?: boolean;
}

// Khung giờ từ 6h sáng đến 24h đêm (18 khoảng giờ 60 phút)
export const HOURLY_TIME_SLOTS = [
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '24:00',
];

// Chiều cao mỗi ô 1 tiếng: 60px (tương đương 1 phút = 1px)
const SLOT_HEIGHT = 60;
const START_OF_DAY_MINUTES = 6 * 60; // 06:00 = 360 phút

// Helper parse thời gian sang tổng số phút trong ngày
function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const timeOnly = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
  const parts = timeOnly.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export const PtCalendarWeekView: React.FC<PtCalendarWeekViewProps> = ({
  activeDate,
  sessions,
  tasks = [],
  onSelectSession,
  onSelectTask,
  onAddSession,
  clientsMap = new Map(),
  isLoading = false,
}) => {
  const weekDays = getWeekDays(activeDate);

  // Nhóm danh sách buổi tập theo từng ngày (YYYY-MM-DD)
  const sessionsByDate = React.useMemo(() => {
    const map = new Map<string, TrainingSessionCalendarItem[]>();
    weekDays.forEach((day) => map.set(day.dateStr, []));

    sessions.forEach((s) => {
      const list = map.get(s.trainingDate);
      if (list) {
        list.push(s);
      }
    });

    return map;
  }, [sessions, weekDays]);

  // Nhóm danh sách hoạt động cá nhân của PT theo từng ngày
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, TrainerTask[]>();
    weekDays.forEach((day) => map.set(day.dateStr, []));

    (tasks || []).forEach((t) => {
      const list = map.get(t.taskDate);
      if (list) {
        list.push(t);
      }
    });

    return map;
  }, [tasks, weekDays]);

  // Lấy tên hiển thị học viên
  const getDisplayName = (session: TrainingSessionCalendarItem): string => {
    if (session.clientName) return session.clientName;
    if (clientsMap.has(session.clientId)) {
      return clientsMap.get(session.clientId)!;
    }
    return session.sessionName || 'Học viên';
  };

  // Tính vị trí top (px) và chiều cao (px) để thanh buổi tập kéo dài chuẩn từ startTime đến endTime
  const computeSessionPosition = (session: TrainingSessionCalendarItem) => {
    const startMinutes = parseTimeToMinutes(session.startTime);
    let endMinutes = session.endTime ? parseTimeToMinutes(session.endTime) : 0;

    // Nếu không có endTime hoặc endTime <= startTime, mặc định kéo dài 60 phút
    if (!endMinutes || endMinutes <= startMinutes) {
      endMinutes = startMinutes + 60;
    }

    // Vị trí top tính từ mốc 06:00
    const topOffsetMinutes = Math.max(0, startMinutes - START_OF_DAY_MINUTES);
    const top = (topOffsetMinutes / 60) * SLOT_HEIGHT;

    // Chiều cao kéo dài từ startTime đến endTime (trừ 4px margin để tạo khoảng cách đẹp mắt)
    const durationMinutes = Math.max(30, endMinutes - startMinutes);
    const height = Math.max(36, (durationMinutes / 60) * SLOT_HEIGHT - 4);

    return { top, height };
  };

  // Tính vị trí top và chiều cao cho hoạt động cá nhân PT
  const computeTaskPosition = (task: TrainerTask) => {
    if (task.allDay || !task.startTime) {
      return { top: 2, height: 32, isAllDay: true };
    }
    const startMinutes = parseTimeToMinutes(task.startTime);
    let endMinutes = task.endTime ? parseTimeToMinutes(task.endTime) : 0;
    if (!endMinutes || endMinutes <= startMinutes) {
      endMinutes = startMinutes + 60;
    }
    const topOffsetMinutes = Math.max(0, startMinutes - START_OF_DAY_MINUTES);
    const top = (topOffsetMinutes / 60) * SLOT_HEIGHT;
    const durationMinutes = Math.max(30, endMinutes - startMinutes);
    const height = Math.max(32, (durationMinutes / 60) * SLOT_HEIGHT - 4);
    return { top, height, isAllDay: false };
  };

  return (
    <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] shadow-xs overflow-hidden">
      {/* Scrollable Container with sticky header */}
      <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
        <div className="min-w-[800px]">
          {/* Header Row (Sticky Top): Cột Khung giờ + 7 Cột Ngày */}
          <div className="sticky top-0 z-30 flex bg-white dark:bg-[#0c1626] border-b border-slate-200 dark:border-[#162338] shadow-xs">
            {/* Cột tiêu đề giờ */}
            <div className="w-16 sm:w-20 shrink-0 p-3 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[#162338] bg-slate-100/60 dark:bg-[#070e17]">
              Khung giờ
            </div>

            {/* 7 Cột thứ trong tuần */}
            <div className="flex-1 grid grid-cols-7">
              {weekDays.map((day) => (
                <div
                  key={day.dateStr}
                  className={`p-3 text-center border-r last:border-r-0 border-slate-200 dark:border-[#162338] transition-colors ${
                    day.isToday
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-50/40 dark:bg-[#0c1626] text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-semibold">
                    {day.dayOfWeekName === 'Chủ Nhật' ? 'Chủ Nhật' : day.dayOfWeekName} ({day.dayOfMonth}/{day.date.getMonth() + 1})
                  </span>
                  {day.isToday && (
                    <div className="mt-0.5">
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        Hôm nay
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Body: Lưới thời gian từ 06:00 đến 24:00 */}
          <div className="flex relative">
            {/* Cột các mốc giờ bên trái (06:00 -> 23:00) */}
            <div className="w-16 sm:w-20 shrink-0 border-r border-slate-200 dark:border-[#162338] select-none bg-slate-50/60 dark:bg-[#070e17]/90">
              {HOURLY_TIME_SLOTS.slice(0, -1).map((slot) => (
                <div
                  key={slot}
                  style={{ height: `${SLOT_HEIGHT}px` }}
                  className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center flex items-start justify-center pt-1 border-b border-slate-200/60 dark:border-[#162338]/80"
                >
                  {slot}
                </div>
              ))}
              {/* Mốc 24:00 ở đáy */}
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-center py-1">
                24:00
              </div>
            </div>

            {/* 7 Cột Ngày - Nơi các buổi tập kéo dài tương ứng thời gian thực tế */}
            <div className="flex-1 grid grid-cols-7 relative">
              {weekDays.map((day) => {
                const daySessions = sessionsByDate.get(day.dateStr) || [];
                const dayTasks = tasksByDate.get(day.dateStr) || [];

                return (
                  <div
                    key={day.dateStr}
                    className={`relative border-r last:border-r-0 border-slate-200/80 dark:border-[#162338] ${
                      day.isToday ? 'bg-emerald-500/[0.03] dark:bg-emerald-500/[0.04]' : ''
                    }`}
                  >
                    {/* Các ô hàng giờ nền (Click để đặt lịch nhanh) */}
                    {HOURLY_TIME_SLOTS.slice(0, -1).map((slot) => {
                      const isPast = isPastDateTime(day.dateStr, slot);

                      return (
                        <div
                          key={slot}
                          style={{ height: `${SLOT_HEIGHT}px` }}
                          onClick={() => {
                            if (isPast) {
                              toast.warning('Không thể tạo lịch tập cho thời gian trong quá khứ!');
                              return;
                            }
                            onAddSession && onAddSession(day.dateStr, slot);
                          }}
                          className={`border-b border-slate-200/60 dark:border-[#162338]/80 transition-all duration-150 relative group/cell ${
                            isPast
                              ? 'cursor-not-allowed bg-slate-100/30 dark:bg-slate-900/30 opacity-60'
                              : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/25 cursor-pointer'
                          }`}
                          title={
                            isPast
                              ? 'Đã qua thời gian đặt lịch'
                              : `Bấm để lên lịch ca ${slot} ngày ${day.dayOfWeekName}`
                          }
                        >
                          {/* Dấu + nổi bật hiện lên khi di chuyển hover (chỉ hiện với các ca chưa diễn ra) */}
                          {!isPast && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all duration-150 transform scale-90 group-hover/cell:scale-100 pointer-events-none z-0">
                              <div className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-600 text-white font-semibold text-[10px] sm:text-[11px] shadow-md shadow-emerald-600/30">
                                <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
                                <span className="hidden sm:inline">Đặt lịch</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* VÙNG CHỨA CÁC THẺ BUỔI TẬP KÉO DÀI THEO THỜI LƯỢNG (startTime -> endTime) & HOẠT ĐỘNG CÁ NHÂN */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* 1. Hoạt động cá nhân của PT (Trainer Tasks) */}
                      {dayTasks.map((task) => {
                        const { top, height, isAllDay } = computeTaskPosition(task);
                        const baseColor = task.color || '#10B981';
                        const isDone = task.status === 'DONE';
                        const isSkipped = task.status === 'SKIPPED';
                        const timeStr = isAllDay ? 'Cả ngày' : formatTimeRange(task.startTime, task.endTime);

                        return (
                          <div
                            key={`task-${task.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTask && onSelectTask(task);
                            }}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: '3px',
                              right: '3px',
                              borderLeft: `4px solid ${baseColor}`,
                            }}
                            title={`[Hoạt động cá nhân] ${task.title} (${timeStr}) - ${
                              isDone ? 'Đã hoàn thành' : isSkipped ? 'Đã bỏ qua' : 'Cần làm'
                            }`}
                            className={`absolute pointer-events-auto rounded-xl px-2 py-1.5 flex flex-col justify-between shadow-xs transition-all duration-150 hover:scale-[1.01] hover:shadow-md cursor-pointer z-20 border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-[#111e30]/95 backdrop-blur-xs ${
                              isDone ? 'opacity-80' : isSkipped ? 'opacity-50' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 w-full min-w-0">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <ClipboardList
                                  style={{ color: baseColor }}
                                  className="h-3.5 w-3.5 shrink-0"
                                />
                                <span
                                  className={`text-xs font-semibold truncate leading-tight ${
                                    isDone
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-800 dark:text-slate-100'
                                  }`}
                                >
                                  {task.title}
                                </span>
                              </div>
                              <div className="shrink-0 flex items-center gap-1">
                                {isDone && (
                                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                                )}
                                {isAllDay && (
                                  <span
                                    style={{ color: baseColor, backgroundColor: `${baseColor}20` }}
                                    className="text-[9px] font-bold px-1.5 py-0.2 rounded"
                                  >
                                    Cả ngày
                                  </span>
                                )}
                              </div>
                            </div>

                            {height >= 45 && !isAllDay && (
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1 mt-0.5">
                                <Clock className="h-2.5 w-2.5 shrink-0" />
                                <span>{timeStr}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 2. Buổi tập học viên (Training Sessions) */}
                      {daySessions.map((session) => {
                        const { top, height } = computeSessionPosition(session);
                        const displayName = getDisplayName(session);
                        const timeRangeStr = formatTimeRange(session.startTime, session.endTime);
                        const statusConfig =
                          SESSION_STATUS_CONFIG[session.status] || SESSION_STATUS_CONFIG.SCHEDULED;

                        return (
                          <div
                            key={session.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSession(session);
                            }}
                            style={{
                              top: `${top}px`,
                              height: `${height}px`,
                              left: '3px',
                              right: '3px',
                            }}
                            title={`${displayName}: ${session.sessionName} (${timeRangeStr}) - ${statusConfig.label}`}
                            className={`absolute pointer-events-auto rounded-xl px-2.5 py-1.5 flex flex-col justify-between shadow-xs transition-all duration-150 hover:scale-[1.01] hover:shadow-md cursor-pointer z-10 ${statusConfig.cardClass}`}
                          >
                            {/* Dòng đầu: Biểu tượng User + Tên học viên + Huy hiệu ảnh (nếu có) + Chấm tròn trạng thái */}
                            <div className="flex items-center justify-between gap-1 w-full">
                              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                <User className="h-3.5 w-3.5 text-white/90 shrink-0" />
                                <span className="text-xs font-bold text-white truncate leading-tight">
                                  {displayName}
                                </span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {session.evidenceImageUrls && session.evidenceImageUrls.length > 0 && (
                                  <span
                                    title={`${session.evidenceImageUrls.length} ảnh minh chứng`}
                                    className="p-0.5 rounded bg-white/20 text-white"
                                  >
                                    <Camera className="h-2.5 w-2.5" />
                                  </span>
                                )}
                                <span className={`h-2 w-2 rounded-full shrink-0 ${statusConfig.dotClass}`} />
                              </div>
                            </div>

                            {/* Khoảng giờ tập (hiển thị khi thẻ đủ chiều cao) */}
                            {height >= 48 && (
                              <div className="text-[11px] text-white/90 font-medium leading-tight truncate flex items-center gap-1 my-0.5">
                                <Clock className="h-3 w-3 inline shrink-0" />
                                <span>{timeRangeStr}</span>
                              </div>
                            )}

                            {/* Tên bài tập / Giáo án (hiển thị khi kéo dài từ 1.5h - 2h trở lên) */}
                            {height >= 85 && session.sessionName && (
                              <div className="text-[10px] text-white/80 truncate font-normal border-t border-white/20 pt-1 mt-0.5">
                                {session.sessionName}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo đang tải */}
      {isLoading && (
        <div className="p-3 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#162338]">
          Đang cập nhật dữ liệu lịch làm việc...
        </div>
      )}
    </div>
  );
};

export default PtCalendarWeekView;
