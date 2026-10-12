import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="relative">
        <div className="h-24 w-24 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400 mx-auto shadow-inner">
          <ShieldAlert className="h-12 w-12" />
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-bold font-poppins text-gray-900 dark:text-gray-100 sm:text-4xl">
        403 - Truy cập bị từ chối
      </h1>
      <p className="mt-3 max-w-md text-sm text-gray-600 dark:text-gray-400">
        Bạn không có quyền hạn cần thiết để truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là sự nhầm lẫn.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors shadow-sm"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại</span>
        </button>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-sm font-medium text-white transition-colors shadow-sm hover:shadow-md"
        >
          <Home className="h-4 w-4" />
          <span>Trang chủ</span>
        </Link>
      </div>
    </div>
  );
}
