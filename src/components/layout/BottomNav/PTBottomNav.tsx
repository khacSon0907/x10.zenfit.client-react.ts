import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CalendarCheck2,
  Users,
  Calendar,
  RotateCcw,
  MoreHorizontal,
  CreditCard,
  TrendingUp,
  ClipboardList,
  Wallet,
  UserCheck,
  X,
  LogOut,
  Shield,
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';

export default function PTBottomNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const { logoutApp, loginAsAdmin } = useApp();

  const mainNavItems = [
    { to: '/pt/today', label: 'Hôm nay', icon: CalendarCheck2 },
    { to: '/pt/clients', label: 'Khách hàng', icon: Users },
    { to: '/pt/schedule', label: 'Lịch tập', icon: Calendar },
    { to: '/pt/renewals', label: 'Gia hạn', icon: RotateCcw },
  ];

  const extraNavItems = [
    { to: '/pt/packages', label: 'Gói & Thanh toán', icon: CreditCard },
    { to: '/pt/progress', label: 'Tiến độ & Số đo', icon: TrendingUp },
    { to: '/pt/plans', label: 'Kế hoạch & Giáo án', icon: ClipboardList },
    { to: '/pt/revenue', label: 'Doanh thu & Công nợ', icon: Wallet },
    { to: '/pt/account', label: 'Gói của tôi & Tài khoản', icon: UserCheck },
  ];

  return (
    <>
      {/* Bottom Sheet Menu for Extra Items */}
      {isMoreOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col justify-end">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 rounded-t-3xl p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
              <span className="font-bold text-gray-900 dark:text-white text-base">
                Tính năng bổ sung
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {extraNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 p-3 rounded-2xl text-xs font-semibold border transition-all ${
                        isActive
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-xs'
                          : 'bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border-gray-100 dark:border-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  loginAsAdmin();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl"
              >
                <Shield className="h-4 w-4" />
                Chuyển sang vai trò Admin
              </button>
              <button
                onClick={() => {
                  setIsMoreOpen(false);
                  logoutApp();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                Đăng xuất tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200/80 dark:border-gray-800 px-2 py-1.5 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-150 min-w-[60px] ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold scale-105'
                      : 'text-gray-500 dark:text-gray-400 font-medium'
                  }`
                }
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </NavLink>
            );
          })}

          {/* Nút "Thêm" thứ 5 */}
          <button
            onClick={() => setIsMoreOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all duration-150 min-w-[60px] cursor-pointer ${
              isMoreOpen
                ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 font-medium'
            }`}
          >
            <MoreHorizontal className="h-5 w-5 mb-1" />
            <span className="text-[10px] tracking-tight">Thêm</span>
          </button>
        </div>
      </nav>
    </>
  );
}
