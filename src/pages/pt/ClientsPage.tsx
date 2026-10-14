import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';

export default function ClientsPage() {
  const { clients } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Danh sách Khách hàng
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Quản lý học viên, hạn mức gói và theo dõi chuyên cần.
          </p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Thêm khách mới</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên học viên, số điện thoại hoặc mục tiêu..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {clients.map((c) => (
            <div key={c.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{c.fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.phone} • Mục tiêu: {c.goal}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge
                  label={c.status === 'active' ? 'Đang tập' : c.status === 'trial' ? 'Trial' : c.status}
                  variant={c.status === 'active' ? 'success' : 'warning'}
                />
                <span className="text-xs text-gray-600 dark:text-gray-300">
                  Còn: <strong>{c.currentPackage?.remainingSessions || 0}</strong> buổi
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
