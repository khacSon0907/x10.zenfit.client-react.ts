import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CheckCircle2,
  UserX,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import type {
  TrainingSession,
  TrainingSessionStatus,
  TrainingSessionFilterParams,
} from '../../types/session.types';
import { SESSION_STATUS_CONFIG } from '../../types/session.types';
import { formatDisplayDate, formatTimeRange } from '../../utils/calendarUtils';
import SessionStatusBadge from './SessionStatusBadge';

interface PtSessionTableListViewProps {
  trainerId?: string;
  onSelectSession: (session: TrainingSession) => void;
  onComplete?: (sessionId: string) => void;
  onNoShow?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
}

export const PtSessionTableListView: React.FC<PtSessionTableListViewProps> = ({
  trainerId,
  onSelectSession,
  onComplete,
  onNoShow,
  onCancel,
}) => {
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<TrainingSessionStatus | 'ALL'>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination state
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Load danh sách buổi tập
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: TrainingSessionFilterParams = {
        page,
        size: pageSize,
        trainerId: trainerId || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };

      const res = await trainingSessionApi.getAll(params);
      setSessions(res.items || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
    } catch {
      toast.error('Không thể tải danh sách buổi tập');
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, trainerId, statusFilter, startDate, endDate]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Lọc client search theo tên buổi tập hoặc học viên (nếu API chưa hỗ trợ text query)
  const filteredSessions = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return sessions;
    return sessions.filter(
      (s) =>
        s.sessionName.toLowerCase().includes(q) ||
        (s.clientName && s.clientName.toLowerCase().includes(q)) ||
        (s.clientPhone && s.clientPhone.includes(q))
    );
  }, [sessions, searchQuery]);

  return (
    <div className="bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200/90 dark:border-[#162338] shadow-xs overflow-hidden space-y-4 p-5">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 flex-wrap">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên buổi tập hoặc học viên..."
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
          />
        </div>

        {/* Date Range & Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as TrainingSessionStatus | 'ALL');
              setPage(0);
            }}
            className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL" className="bg-white dark:bg-[#0c1626]">Tất cả trạng thái</option>
            {(Object.keys(SESSION_STATUS_CONFIG) as TrainingSessionStatus[]).map((st) => (
              <option key={st} value={st} className="bg-white dark:bg-[#0c1626]">
                {SESSION_STATUS_CONFIG[st].label}
              </option>
            ))}
          </select>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(0);
              }}
              title="Từ ngày"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>

          <span className="text-slate-400 text-xs">-</span>

          {/* End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(0);
              }}
              title="Đến ngày"
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto custom-scrollbar rounded-2xl border border-slate-100 dark:border-[#162338]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-[#070e17] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-[#162338]">
            <tr>
              <th className="py-3 px-4">Thời gian</th>
              <th className="py-3 px-4">Buổi tập</th>
              <th className="py-3 px-4">Học viên</th>
              <th className="py-3 px-4">Hợp đồng</th>
              <th className="py-3 px-4">Trạng thái</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-[#162338]">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto text-emerald-500 mb-2" />
                  <span>Đang tải danh sách buổi tập...</span>
                </td>
              </tr>
            ) : filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <span>Không tìm thấy buổi tập nào phù hợp.</span>
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const isTerminal =
                  session.status === 'COMPLETED' ||
                  session.status === 'CANCELLED' ||
                  session.status === 'NO_SHOW';

                return (
                  <tr
                    key={session.id}
                    onClick={() => onSelectSession(session)}
                    className="hover:bg-slate-50/80 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
                  >
                    {/* Thời gian */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatDisplayDate(session.trainingDate)}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatTimeRange(session.startTime, session.endTime)}</span>
                      </div>
                    </td>

                    {/* Buổi tập */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
                        {session.sessionName}
                      </div>
                      {session.note && (
                        <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                          {session.note}
                        </div>
                      )}
                    </td>

                    {/* Học viên */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{session.clientName || 'Học viên'}</span>
                      </div>
                      {session.clientPhone && (
                        <div className="text-[11px] text-slate-400 pl-5">
                          {session.clientPhone}
                        </div>
                      )}
                    </td>

                    {/* Hợp đồng */}
                    <td className="py-3 px-4 whitespace-nowrap font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      #{session.contractId ? session.contractId.slice(-6).toUpperCase() : '—'}
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <SessionStatusBadge status={session.status} size="sm" showIcon />
                    </td>

                    {/* Thao tác */}
                    <td
                      onClick={(e) => e.stopPropagation()}
                      className="py-3 px-4 text-right whitespace-nowrap"
                    >
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectSession(session)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          Chi tiết
                        </button>

                        {!isTerminal && session.status === 'SCHEDULED' && onCheckIn && (
                          <button
                            type="button"
                            onClick={() => onCheckIn(session.id)}
                            title="Điểm danh"
                            className="p-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 hover:bg-cyan-100 transition-colors"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {!isTerminal && onComplete && (
                          <button
                            type="button"
                            onClick={() => onComplete(session.id)}
                            title="Hoàn thành"
                            className="p-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {!isTerminal && onNoShow && (
                          <button
                            type="button"
                            onClick={() => onNoShow(session.id)}
                            title="Báo vắng"
                            className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/30 hover:bg-amber-100 transition-colors"
                          >
                            <UserX className="h-3.5 w-3.5" />
                          </button>
                        )}

                        {!isTerminal && onCancel && (
                          <button
                            type="button"
                            onClick={() => onCancel(session.id)}
                            title="Hủy lịch"
                            className="p-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-500/30 hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400">
        <div>
          Hiển thị <strong>{filteredSessions.length}</strong> / <strong>{totalElements}</strong> buổi tập
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs font-semibold cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value={10} className="bg-white dark:bg-[#0c1626]">10 / trang</option>
            <option value={20} className="bg-white dark:bg-[#0c1626]">20 / trang</option>
            <option value={50} className="bg-white dark:bg-[#0c1626]">50 / trang</option>
          </select>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 0 || isLoading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#162338] hover:bg-slate-100 dark:hover:bg-[#111e30] text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
              Trang {page + 1} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={page >= totalPages - 1 || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-[#162338] hover:bg-slate-100 dark:hover:bg-[#111e30] text-slate-700 dark:text-slate-200 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PtSessionTableListView;
