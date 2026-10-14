import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  History,
  LogOut,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useApp } from '../../../context/AppContext';

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export default function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const { user, logoutApp, loginAsPT } = useApp();
  const navigate = useNavigate();

  const navItems = [
    { to: '/admin/overview', label: 'Tổng quan hệ thống', icon: LayoutDashboard },
    { to: '/admin/pts', label: 'Quản lý HLV (PT)', icon: Users },
    { to: '/admin/plans', label: 'Cấu hình gói thuê bao', icon: Layers },
    { to: '/admin/payments', label: 'Thanh toán phí dịch vụ', icon: CreditCard },
    { to: '/admin/audit-logs', label: 'Nhật ký thao tác', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 gap-3 border-b border-slate-800 shrink-0">
        <div className="h-9 w-9 rounded-xl bg-indigo-500/20 p-1 flex items-center justify-center border border-indigo-500/30">
          <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
        </div>
        <div>
          <span className="text-lg font-bold tracking-tight text-white">
            Zen<span className="text-indigo-400">Fit</span>
          </span>
          <span className="block text-[10px] font-semibold tracking-wider text-indigo-400 uppercase">
            Hệ Thống Quản Trị
          </span>
        </div>
      </div>

      {/* Security Disclaimer Banner */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 leading-relaxed">
        <div className="flex items-center gap-1.5 font-semibold text-indigo-400 mb-1">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Bảo mật dữ liệu học viên</span>
        </div>
        Admin quản lý tài khoản & gói dịch vụ của PT. Dữ liệu khách hàng riêng tư của PT được mã hóa cách ly 100%.
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Switch to PT */}
      <div className="p-3 border-t border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between px-2">
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">
              {user?.name || 'Trần Quản Trị'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logoutApp}
            title="Đăng xuất"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

        {/* Nút quay lại PT Workspace */}
        <button
          onClick={() => {
            loginAsPT();
            if (onCloseMobile) onCloseMobile();
            navigate('/pt/today');
          }}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 rounded-xl transition-colors cursor-pointer"
        >
          <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
          Chuyển sang màn hình PT
        </button>
      </div>
    </aside>
  );
}
