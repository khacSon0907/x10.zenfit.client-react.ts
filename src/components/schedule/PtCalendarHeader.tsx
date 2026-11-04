import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Table as TableIcon,
  Filter,
  User,
  Users,
} from 'lucide-react';
import type { CalendarViewType, TrainingSessionStatus } from '../../types/session.types';
import { SESSION_STATUS_CONFIG } from '../../types/session.types';

interface PtCalendarHeaderProps {
  view: CalendarViewType;
  onViewChange: (newView: CalendarViewType) => void;
  periodTitle: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onRefresh: () => void;
  onOpenCreateModal: () => void;
  isLoading?: boolean;
  statusFilter?: TrainingSessionStatus | 'ALL';
  onStatusFilterChange?: (st: TrainingSessionStatus | 'ALL') => void;
  todayCount?: number;
  sessionType?: 'IN_PERSON' | 'SOLO';
  onSessionTypeChange?: (type: 'IN_PERSON' | 'SOLO') => void;
  isAdmin?: boolean;
  trainers?: Array<{ id: string; fullName: string }>;
  selectedTrainerId?: string;
  onTrainerChange?: (id: string) => void;
}

export const PtCalendarHeader: React.FC<PtCalendarHeaderProps> = ({
  view,
  onViewChange,
  periodTitle,
  onPrev,
  onNext,
  onToday,
  onRefresh,
  onOpenCreateModal,
  isLoading = false,
  statusFilter = 'ALL',
  onStatusFilterChange,
  todayCount = 0,
  sessionType = 'IN_PERSON',
  onSessionTypeChange,
  isAdmin = false,
  trainers = [],
  selectedTrainerId = '',
  onTrainerChange,
}) => {
  return (
    <div className="bg-white dark:bg-[#0c1626] rounded-2xl border border-slate-200 dark:border-[#162338] p-5 shadow-xs space-y-4">
      {/* Upper Row: Title & Subtitles on Left | Type toggles & + Lên lịch tập mới on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Left: Tiêu đề Tiếng Việt + Số ca hôm nay + Ngày tháng */}
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Lịch Huấn Luyện PT
          </h2>
          <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 flex flex-col sm:flex-row sm:items-center sm:gap-2">
            <span>
              Hôm nay: <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{todayCount} buổi tập</strong>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <span>{periodTitle}</span>
          </div>
        </div>

        {/* Right: Bộ chọn phân loại (Trực tiếp / Tập riêng) & Nút + Lên lịch tập mới */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Trực tiếp vs Tập riêng */}
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338]">
            <button
              type="button"
              onClick={() => onSessionTypeChange?.('IN_PERSON')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sessionType === 'IN_PERSON'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              <span>Trực tiếp</span>
            </button>
            <button
              type="button"
              onClick={() => onSessionTypeChange?.('SOLO')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                sessionType === 'SOLO'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              <span>Tập riêng</span>
            </button>
          </div>

          {/* Nút hành động chính: + Lên lịch tập mới */}
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Lên lịch tập mới</span>
          </button>
        </div>
      </div>

      {/* Lower Row: Điều hướng (< Hôm nay >) & Nút chế độ xem (Tháng Tuần Ngày Bảng) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#162338]">
        {/* Left: Lùi / Tiến / Hôm nay & Làm mới */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338]">
            <button
              type="button"
              onClick={onPrev}
              title="Kỳ trước"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#111e30] transition cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onToday}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#111e30] transition cursor-pointer"
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={onNext}
              title="Kỳ sau"
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#111e30] transition cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Nút Làm mới */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            title="Làm mới dữ liệu lịch"
            className="p-2 rounded-xl border border-slate-200/80 dark:border-[#162338] bg-slate-100 dark:bg-[#070e17] hover:bg-white dark:hover:bg-[#111e30] text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          {/* Bộ lọc Huấn luyện viên (Admin) */}
          {isAdmin && trainers.length > 0 && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-[#162338]">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden md:inline">PT:</span>
              <select
                value={selectedTrainerId}
                onChange={(e) => onTrainerChange?.(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer transition-colors"
              >
                <option value="" className="bg-white dark:bg-[#0c1626] text-slate-900 dark:text-slate-100">Tất cả Huấn luyện viên</option>
                {trainers.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white dark:bg-[#0c1626] text-slate-900 dark:text-slate-100">
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Dropdown Lọc trạng thái buổi tập */}
          {onStatusFilterChange && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-[#162338]">
              <Filter className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  onStatusFilterChange(e.target.value as TrainingSessionStatus | 'ALL')
                }
                className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-100 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer transition-colors"
              >
                <option value="ALL" className="bg-white dark:bg-[#0c1626] text-slate-900 dark:text-slate-100">Tất cả trạng thái</option>
                {Object.entries(SESSION_STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key} className="bg-white dark:bg-[#0c1626] text-slate-900 dark:text-slate-100">
                    {config.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right: Tab chọn chế độ xem (Tháng | Tuần | Ngày | Bảng) màu xanh lá */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onViewChange('MONTH')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              view === 'MONTH'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tháng
          </button>
          <button
            type="button"
            onClick={() => onViewChange('WEEK')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              view === 'WEEK'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Tuần
          </button>
          <button
            type="button"
            onClick={() => onViewChange('DAY')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              view === 'DAY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => onViewChange('TABLE')}
            title="Dạng bảng tra cứu danh sách"
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              view === 'TABLE'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TableIcon className="h-3 w-3" />
            <span>Bảng</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtCalendarHeader;
