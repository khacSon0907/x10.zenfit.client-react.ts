import { useApp } from '../../context/AppContext';
import ProgressBar from '../../components/common/ProgressBar';
import { Zap } from 'lucide-react';

export default function MyAccountPage() {
  const { ptPlan } = useApp();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Tài khoản & Gói của tôi
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Quản lý gói dịch vụ, hạn mức số lượng học viên và thông tin cá nhân.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Gói hiện tại: {ptPlan.tier}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Đang hoạt động
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Thời hạn sử dụng đến: <strong>{ptPlan.expiresAt}</strong> (Gia hạn tự động)
            </p>
          </div>

          <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer">
            <Zap className="h-4 w-4" />
            Nâng cấp gói (Plus / Pro)
          </button>
        </div>

        <div>
          <ProgressBar
            value={ptPlan.currentClients}
            max={ptPlan.maxClients}
            label={`Đã dùng ${ptPlan.currentClients}/${ptPlan.maxClients} học viên`}
            showPercentage
            color="emerald"
            size="md"
          />
        </div>
      </div>
    </div>
  );
}
