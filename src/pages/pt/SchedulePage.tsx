import { Plus } from 'lucide-react';

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Lịch làm việc</h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Theo dõi khung giờ rảnh, khung có khách và đặt lịch hẹn.
          </p>
        </div>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
          <Plus className="h-4 w-4" /> Đặt buổi tập
        </button>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 text-center text-gray-500">
        Tính năng Lịch làm việc chi tiết sẽ hoàn thiện ở Bước 4.
      </div>
    </div>
  );
}
