import { useApp } from '../../context/AppContext';

export default function AdminAuditLogsPage() {
  const { auditLogs } = useApp();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Nhật ký Thao tác Quản trị</h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Lịch sử các hoạt động quan trọng: gia hạn, khóa tài khoản, tặng ngày sử dụng.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-3 shadow-xs">
        {auditLogs.map((log) => (
          <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 text-xs text-slate-700 dark:text-slate-300 space-y-1">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{log.action}</span>
              <span>{log.timestamp}</span>
            </div>
            <p><strong>Người thực hiện:</strong> {log.actor} • <strong>Đối tượng:</strong> {log.target}</p>
            <p className="text-slate-500 dark:text-slate-400">{log.details}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
