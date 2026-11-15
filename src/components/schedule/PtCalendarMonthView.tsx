import React from 'react';
import { ClipboardList } from 'lucide-react';
import type { TrainingSessionCalendarItem, TrainerTask } from '../../types/session.types';
import { getMonthDaysGrid, formatDisplayTime } from '../../utils/calendarUtils';
import { SESSION_STATUS_CONFIG } from '../../types/session.types';

interface PtCalendarMonthViewProps {
  activeDate: Date;
  sessions: TrainingSessionCalendarItem[];
  tasks?: TrainerTask[];
  onSelectSession: (session: TrainingSessionCalendarItem) => void;
  onSelectTask?: (task: TrainerTask) => void;
  onSelectDate?: (date: Date) => void;
  isLoading?: boolean;
}

export const PtCalendarMonthView: React.FC<PtCalendarMonthViewProps> = ({
  activeDate,
  sessions,
  tasks = [],
  onSelectSession,
  onSelectTask,
  onSelectDate,
  isLoading = false,
}) => {
  const monthCells = getMonthDaysGrid(activeDate);

  // Nhóm sessions theo ngày YYYY-MM-DD
  const sessionsByDate = React.useMemo(() => {
    const map = new Map<string, TrainingSessionCalendarItem[]>();
    sessions.forEach((s) => {
      const list = map.get(s.trainingDate) || [];
      list.push(s);
      map.set(s.trainingDate, list);
    });
    return map;
  }, [sessions]);

  // Nhóm tasks theo ngày YYYY-MM-DD
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, TrainerTask[]>();
    (tasks || []).forEach((t) => {
      const list = map.get(t.taskDate) || [];
      list.push(t);
      map.set(t.taskDate, list);
    });
    return map;
  }, [tasks]);

  const DAY_HEADER_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

  return (
    <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] shadow-xs overflow-hidden">
      {/* 7 Header Columns */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-[#162338] bg-slate-50/70 dark:bg-[#070e17]">
        {DAY_HEADER_NAMES.map((name) => (
          <div
            key={name}
            className="py-3 px-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-r last:border-r-0 border-slate-200/70 dark:border-[#162338]"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-[#162338]">
        {monthCells.map((cell) => {
          const daySessions = sessionsByDate.get(cell.dateStr) || [];
          const dayTasks = tasksByDate.get(cell.dateStr) || [];
          const totalItems = daySessions.length + dayTasks.length;

          const maxVisible = 2;
          const overflowCount = Math.max(0, totalItems - maxVisible);

          return (
            <div
              key={cell.dateStr}
              onClick={() => onSelectDate?.(cell.date)}
              className={`min-h-[110px] p-2 flex flex-col justify-between transition-colors cursor-pointer ${
                cell.isCurrentMonth
                  ? 'bg-white dark:bg-[#0c1626] hover:bg-slate-50/80 dark:hover:bg-[#111e30]'
                  : 'bg-slate-50/50 dark:bg-[#070e17]/60 opacity-40 hover:opacity-80'
              } ${cell.isToday ? 'ring-1 ring-inset ring-emerald-500/50' : ''}`}
            >
              {/* Day header */}
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    cell.isToday
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {cell.dayOfMonth}
                </span>

                {totalItems > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {totalItems}
                  </span>
                )}
              </div>

              {/* Sessions & Tasks preview pills */}
              <div className="space-y-1 flex-1">
                {isLoading ? (
                  <div className="h-4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                  <>
                    {/* Render Tasks first */}
                    {dayTasks.slice(0, 1).map((task) => (
                      <div
                        key={`month-task-${task.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectTask?.(task);
                        }}
                        style={{ borderLeft: `3px solid ${task.color || '#10B981'}` }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1 truncate transition-all hover:scale-[1.02] cursor-pointer border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#111e30] ${
                          task.status === 'DONE' ? 'line-through opacity-70 text-slate-400' : 'text-slate-700 dark:text-slate-200'
                        }`}
                        title={`[Hoạt động cá nhân] ${task.title}`}
                      >
                        <ClipboardList
                          style={{ color: task.color || '#10B981' }}
                          className="h-2.5 w-2.5 shrink-0"
                        />
                        <span className="truncate">{task.title}</span>
                      </div>
                    ))}

                    {/* Render Sessions */}
                    {daySessions
                      .slice(0, dayTasks.length > 0 ? 1 : maxVisible)
                      .map((session) => {
                        const meta =
                          SESSION_STATUS_CONFIG[session.status] ||
                          SESSION_STATUS_CONFIG.SCHEDULED;

                        return (
                          <div
                            key={session.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSession(session);
                            }}
                            className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-medium flex items-center gap-1 truncate transition-all hover:scale-[1.02] cursor-pointer ${meta.badgeClass}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${meta.dotClass}`} />
                            <span className="font-bold shrink-0">
                              {formatDisplayTime(session.startTime)}
                            </span>
                            <span className="truncate">{session.sessionName}</span>
                          </div>
                        );
                      })}

                    {overflowCount > 0 && (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-1">
                        +{overflowCount} lịch trình nữa...
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PtCalendarMonthView;
