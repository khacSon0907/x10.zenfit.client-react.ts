import { X, User, Mail, Shield, Hash, CheckCircle2 } from 'lucide-react';
import type { UserProfile } from '../types/auth.types';

interface UserProfileModalProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {
  if (!isOpen || !user) return null;

  const initials = (user.name || user.username || 'U')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-gray-100 dark:border-gray-700">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header Profile */}
        <div className="flex items-center gap-4 pb-5 border-b border-gray-100 dark:border-gray-750">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-xl flex items-center justify-center shadow-md">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold font-poppins text-gray-900 dark:text-gray-100">
              {user.name || user.username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {user.roles?.map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                >
                  <Shield className="h-2.5 w-2.5" />
                  {role.replace('ROLE_', '')}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="mt-5 space-y-3.5">
          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Tên đăng nhập
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {user.username}
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Địa chỉ Email
              </p>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                {user.email}
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <Hash className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Mã định danh (User ID)
              </p>
              <p className="text-xs font-mono text-gray-600 dark:text-gray-300 truncate">
                {user.id}
              </p>
            </div>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-2xl flex items-center gap-3">
            <div className="p-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-xs">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                Trạng thái tài khoản
              </p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Đang hoạt động (Active)
              </p>
            </div>
          </div>
        </div>

        {/* Nút đóng phía dưới */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
