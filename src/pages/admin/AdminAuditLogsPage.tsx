import { useState } from 'react';
import {
  History,
  Search,
  Filter,
  Shield,
  User,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const filteredLogs = auditLogs.filter((log) => {
    const matchSearch =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchAction =
      actionFilter === 'ALL' || log.action.includes(actionFilter);

    return matchSearch && matchAction;
  });

  return (
    <div className="space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 text-purple-400 mb-1">
            <History className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-semibold tracking-wider uppercase text-purple-400">
              Kiểm toán an toàn hệ thống
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Nhật ký Thao tác Quản trị
          </h1>
          <p className="text-xs sm:text-sm text-purple-300/70 mt-1">
            Ghi vết lịch sử mọi hoạt động nhạy cảm: khóa/mở khóa tài khoản PT, gia hạn thuê bao, thay đổi hạn mức học viên.
          </p>
        </div>

        <button
          type="button"
          onClick={() => toast.success('Đã đồng bộ nhật ký mới nhất!')}
          className="p-2.5 rounded-xl bg-[#170a32] border border-purple-500/20 text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors shadow-xs self-start sm:self-auto cursor-pointer"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Toolbar Tìm kiếm & Lọc */}
      <div className="p-4 rounded-2xl bg-[#120826]/90 border border-purple-500/15 shadow-lg backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo hành động, người thực hiện, đối tượng..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#1a0c36] border border-purple-500/20 text-white placeholder-purple-300/40 text-xs sm:text-sm focus:outline-none focus:border-purple-400"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-purple-300/60 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Lọc hành động:
          </span>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'Gia hạn', label: 'Gia hạn' },
            { id: 'Khóa', label: 'Khóa tài khoản' },
            { id: 'Tặng', label: 'Tặng ngày' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActionFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                actionFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                  : 'bg-[#1a0c36] text-purple-300/70 hover:text-white hover:bg-purple-900/30 border border-purple-500/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Danh sách nhật ký */}
      <div className="bg-[#120826]/90 rounded-2xl border border-purple-500/15 shadow-xl backdrop-blur-md overflow-hidden divide-y divide-purple-500/10">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-purple-300/60">
            <AlertCircle className="w-8 h-8 text-purple-400/50 mx-auto mb-2" />
            <p className="font-semibold text-white">Không có bản ghi nhật ký nào</p>
            <p className="text-[11px] text-purple-300/60 mt-1">
              Thử thay đổi từ khóa tìm kiếm hoặc bỏ bộ lọc.
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isLock = log.action.includes('Khóa');
            const isExtend = log.action.includes('Gia hạn');

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 hover:bg-purple-950/20 transition-colors flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      isLock
                        ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        : isExtend
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-purple-500/15 border-purple-500/30 text-purple-400'
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                  </div>

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-sm">
                        {log.action}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-purple-900/40 border border-purple-500/20 text-purple-300 font-mono text-[10px]">
                        ID: {log.id}
                      </span>
                    </div>

                    <p className="text-purple-200/80 leading-relaxed">
                      {log.details}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-purple-300/60 pt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-purple-400" />
                        <strong>Thực hiện:</strong> {log.actor}
                      </span>
                      <span>•</span>
                      <span>
                        <strong>Đối tượng:</strong>{' '}
                        <span className="text-purple-200 font-medium">{log.target}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-purple-300/60 shrink-0 sm:pt-1 text-[11px] self-end sm:self-auto">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
