import React from 'react';
import {
  User,
  Plus,
  Clock,
  Sparkles,
  Camera,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import type { TrainingSessionCalendarItem, TrainerTask } from '../../types/session.types';
import { SESSION_STATUS_CONFIG } from '../../types/session.types';
import { formatDisplayDate, formatTimeRange, isPastDateTime } from '../../utils/calendarUtils';
import { HOURLY_TIME_SLOTS } from './PtCalendarWeekView';

interface PtCalendarDayViewProps {
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

const SLOT_HEIGHT = 60;
const START_OF_DAY_MINUTES = 6 * 60; // 06:00 = 360 phút

function parseTimeToMinutes(timeStr?: string | null): number {
  if (!timeStr) return 0;
  const timeOnly = timeStr.includes('T') ? timeStr.split('T')[1] : timeStr;
  const parts = timeOnly.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export const PtCalendarDayView: React.FC<PtCalendarDayViewProps> = ({
  activeDate,
  sessions,
  tasks = [],
  onSelectSession,
  onSelectTask,
  onAddSession,
  clientsMap = new Map(),
  isLoading = false,
}) => {
  const getDisplayName = (session: TrainingSessionCalendarItem): string => {
    if (session.clientName) return session.clientName;
    if (clientsMap.has(session.clientId)) {
      return clientsMap.get(session.clientId)!;
    }
    return session.sessionName || 'Học viên';
  };

  const dayDateStr = React.useMemo(() => {
    const year = activeDate.getFullYear();
    const month = String(activeDate.getMonth() + 1).padStart(2, '0');
    const day = String(activeDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, [activeDate]);

  const dayTasks = React.useMemo(() => {
    return tasks.filter((t) => t.taskDate === dayDateStr);
  }, [tasks, dayDateStr]);

  const completedCount = sessions.filter((s) => s.status === 'COMPLETED').length;

  const computeSessionPosition = (session: TrainingSessionCalendarItem) => {
    const startMinutes = parseTimeToMinutes(session.startTime);
    let endMinutes = session.endTime ? parseTimeToMinutes(session.endTime) : 0;

    if (!endMinutes || endMinutes <= startMinutes) {
      endMinutes = startMinutes + 60;
    }

    const topOffsetMinutes = Math.max(0, startMinutes - START_OF_DAY_MINUTES);
    const top = (topOffsetMinutes / 60) * SLOT_HEIGHT;

    const durationMinutes = Math.max(30, endMinutes - startMinutes);
    const height = Math.max(36, (durationMinutes / 60) * SLOT_HEIGHT - 4);

    return { top, height };
  };

  const computeTaskPosition = (task: TrainerTask) => {
    if (task.allDay || !task.startTime) {
      return { top: 2, height: 36, isAllDay: true };
    }
    const startMinutes = parseTimeToMinutes(task.startTime);
    let endMinutes = task.endTime ? parseTimeToMinutes(task.endTime) : 0;
    if (!endMinutes || endMinutes <= startMinutes) {
      endMinutes = startMinutes + 60;
    }
    const topOffsetMinutes = Math.max(0, startMinutes - START_OF_DAY_MINUTES);
    const top = (topOffsetMinutes / 60) * SLOT_HEIGHT;
    const durationMinutes = Math.max(30, endMinutes - startMinutes);
    const height = Math.max(36, (durationMinutes / 60) * SLOT_HEIGHT - 4);
    return { top, height, isAllDay: false };
  };

  return (
    <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] shadow-xs overflow-hidden">
      {/* Day Overview Header */}
      <div className="p-4 border-b border-slate-200 dark:border-[#162338] bg-slate-50/80 dark:bg-[#070e17] flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Lịch chi tiết: {formatDisplayDate(activeDate)}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tổng cộng: <strong className="text-slate-800 dark:text-slate-200">{sessions.length}</strong> ca tập
            {dayTasks.length > 0 && (
              <span>, <strong className="text-emerald-600 dark:text-emerald-400">{dayTasks.length}</strong> hoạt động cá nhân</span>
            )}
            {' '}({completedCount} ca đã hoàn thành)
          </p>
        </div>

        {sessions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <Sparkles className="h-3 w-3" /> {completedCount}/{sessions.length} hoàn thành
            </span>
          </div>
        )}
      </div>

      {/* Hourly Timetable from 06:00 to 24:00 with stretched sessions */}
      <div className="overflow-x-auto max-h-[700px] overflow-y-auto">
        <div className="min-w-[600px]">
          <div className="flex relative">
            {/* Cột thời gian bên trái */}
            <div className="w-20 shrink-0 border-r border-slate-200 dark:border-[#162338] select-none bg-slate-50/60 dark:bg-[#070e17]/90">
              {HOURLY_TIME_SLOTS.slice(0, -1).map((slot) => (
                <div
                  key={slot}
                  style={{ height: `${SLOT_HEIGHT}px` }}
                  className="text-xs font-semibold text-slate-400 dark:text-slate-500 text-center flex items-start justify-center pt-1 border-b border-slate-200/60 dark:border-[#162338]/80"
                >
                  {slot}
                </div>
              ))}
              <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 text-center py-1">
                24:00
              </div>
            </div>

            {/* Cột hiển thị ca tập trong ngày */}
            <div className="flex-1 relative">
              {/* Nền ô giờ click để tạo mới */}
              {HOURLY_TIME_SLOTS.slice(0, -1).map((slot) => {
                const isPast = isPastDateTime(dayDateStr, slot);

                return (
                  <div
                    key={slot}
                    style={{ height: `${SLOT_HEIGHT}px` }}
                    onClick={() => {
                      if (isPast) {
                        toast.warning('Không thể tạo lịch tập cho thời gian trong quá khứ!');
                        return;
                      }
                      onAddSession && onAddSession(dayDateStr, slot);
                    }}
                    className={`border-b border-slate-200/60 dark:border-[#162338]/80 transition-all duration-150 relative group/daycell ${
                      isPast
                        ? 'cursor-not-allowed bg-slate-100/30 dark:bg-slate-900/30 opacity-60'
                        : 'hover:bg-emerald-50/40 dark:hover:bg-emerald-950/25 cursor-pointer'
                    }`}
                    title={
                      isPast
                        ? 'Đã qua thời gian đặt lịch'
                        : `Bấm để lên lịch ca ${slot}`
                    }
                  >
                    {!isPast ? (
                      <div className="h-full w-full flex items-center justify-between px-4 opacity-0 group-hover/daycell:opacity-100 transition-all duration-150">
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
                          Khung giờ trống (Bấm để lên lịch ca {slot})
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 transition">
                          <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                          <span>Lên lịch tập</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full w-full flex items-center px-4 opacity-0 group-hover/daycell:opacity-60 transition-opacity">
                        <span className="text-xs text-slate-400 italic">
                          Đã qua thời gian đặt lịch ca {slot}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Các thẻ buổi tập & hoạt động cá nhân kéo dài tương ứng */}
              <div className="absolute inset-0 pointer-events-none">
                {/* 1. Hoạt động cá nhân của PT */}
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
                        left: '8px',
                        right: '8px',
                        borderLeft: `5px solid ${baseColor}`,
                      }}
                      title={`[Hoạt động cá nhân] ${task.title} (${timeStr}) - ${
                        isDone ? 'Đã hoàn thành' : isSkipped ? 'Đã bỏ qua' : 'Cần làm'
                      }`}
                      className={`absolute pointer-events-auto rounded-xl px-4 py-2.5 flex flex-col justify-between shadow-xs transition-all duration-150 hover:scale-[1.008] hover:shadow-md cursor-pointer z-20 border border-slate-200/90 dark:border-slate-700/80 bg-white/95 dark:bg-[#111e30]/95 backdrop-blur-xs ${
                        isDone ? 'opacity-80' : isSkipped ? 'opacity-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <ClipboardList
                            style={{ color: baseColor }}
                            className="h-4 w-4 shrink-0"
                          />
                          <span
                            className={`text-sm font-bold truncate ${
                              isDone
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.title}
                          </span>
                          <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                            • Hoạt động cá nhân
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isDone && (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                          )}
                          {isAllDay && (
                            <span
                              style={{ color: baseColor, backgroundColor: `${baseColor}20` }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                            >
                              Cả ngày
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {!isAllDay && (
                          <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                            <Clock className="h-3.5 w-3.5" />
                            <span>{timeStr}</span>
                          </span>
                        )}
                        {task.description && (
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 italic truncate max-w-[260px]">
                            {task.description}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* 2. Buổi tập học viên */}
                {sessions.map((session) => {
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
                        left: '8px',
                        right: '8px',
                      }}
                      className={`absolute pointer-events-auto rounded-xl px-4 py-2.5 flex flex-col justify-between shadow-sm transition-all duration-150 hover:scale-[1.008] hover:shadow-md cursor-pointer z-10 ${statusConfig.cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <User className="h-4 w-4 text-white/90 shrink-0" />
                          <span className="text-sm font-bold text-white truncate">
                            {displayName}
                          </span>
                          {session.sessionName && (
                            <span className="text-xs text-white/80 font-normal hidden sm:inline">
                              • {session.sessionName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {session.evidenceImageUrls && session.evidenceImageUrls.length > 0 && (
                            <span
                              title={`${session.evidenceImageUrls.length} ảnh minh chứng`}
                              className="px-1.5 py-0.5 rounded-md bg-white/20 text-white flex items-center gap-1 text-[11px]"
                            >
                              <Camera className="h-3 w-3" />
                              <span>{session.evidenceImageUrls.length}</span>
                            </span>
                          )}
                          <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${statusConfig.dotClass}`} />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-white/90 mt-1">
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{timeRangeStr}</span>
                        </span>
                        {session.note && (
                          <span className="text-[11px] text-white/80 italic truncate max-w-[200px]">
                            {session.note}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="p-3 text-center text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
          Đang tải dữ liệu ca tập...
        </div>
      )}
    </div>
  );
};

export default PtCalendarDayView;
