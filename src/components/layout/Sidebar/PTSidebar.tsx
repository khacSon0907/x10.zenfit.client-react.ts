import { NavLink } from 'react-router-dom';
import {
  Home,
  Calendar,
  Users,
  CreditCard,
  TrendingUp,
  ClipboardList,
  Database,
  User,
  Settings,
  Dumbbell,
} from 'lucide-react';
import logo from '../../../assets/logo/logo-zenfit.png';

interface PTSidebarProps {
  onCloseMobile?: () => void;
}

export default function PTSidebar({ onCloseMobile }: PTSidebarProps) {
  const navItems = [
    { to: '/pt/today', label: 'Tổng quan', icon: Home },
    { to: '/pt/schedule', label: 'Lịch tập', icon: Calendar },
    { to: '/pt/clients', label: 'Học viên', icon: Users },
    { to: '/pt/packages', label: 'Gói tập & thanh toán', icon: CreditCard },
    { to: '/pt/progress', label: 'Tiến độ & số đo', icon: TrendingUp },
    { to: '/pt/plans', label: 'Giáo án & dinh dưỡng', icon: ClipboardList },
    { to: '/pt/revenue', label: 'Doanh thu', icon: Database },
    { to: '/pt/account', label: 'Hồ sơ PT', icon: User },
    { to: '/pt/account', label: 'Cài đặt', icon: Settings, searchParam: '?tab=settings' },
  ];

  return (
    <aside className="w-64 bg-[#070e17] text-slate-200 border-r border-[#162338] flex flex-col h-full select-none transition-colors">
      {/* Brand Header */}
      <div className="h-18 flex items-center px-6 gap-3.5 border-b border-[#162338] shrink-0">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-emerald-400/10 border border-emerald-500/30 flex items-center justify-center p-1.5 shadow-sm">
          <img src={logo} alt="ZenFit" className="h-7 w-7 object-contain" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-white block leading-none">
            Zen<span className="text-[#00d68f]">Fit</span>
          </span>
          <span className="block text-[10px] font-bold tracking-widest text-[#00d68f] uppercase mt-1">
            PT WORKSPACE
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={onCloseMobile}
              end={item.to === '/pt/today'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[#10b981] text-white shadow-lg shadow-emerald-500/25 font-semibold'
                    : 'text-slate-400 hover:text-white hover:bg-[#111e30]'
                }`
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* Bottom Promo Card: "Kỷ luật hôm nay - Tạo nên kết quả ngày mai" */}
      <div className="p-3.5 mt-auto border-t border-[#162338]/80">
        <div className="relative rounded-2xl overflow-hidden p-4 bg-gradient-to-br from-[#0b2420] via-[#0b1728] to-[#07101b] border border-emerald-700/30 shadow-xl group">
          {/* Subtle green ambient lighting */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-2 bottom-2 text-emerald-500/10 pointer-events-none">
            <Dumbbell className="w-20 h-20 rotate-[-25deg]" />
          </div>

          <div className="relative z-10 space-y-3">
            <div>
              <p className="text-xs font-bold text-white tracking-wide leading-snug">
                Kỷ luật hôm nay
              </p>
              <p className="text-[11px] text-slate-300 font-medium leading-snug">
                Tạo nên kết quả ngày mai
              </p>
            </div>

            <div className="pt-2.5 border-t border-emerald-500/20 flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center p-1">
                <img src={logo} alt="ZenFit" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white leading-none">
                  Zen<span className="text-[#00d68f]">Fit</span>
                </div>
                <div className="text-[9px] text-slate-400 font-medium truncate mt-0.5">
                  Better You. Stronger Tomorrow.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
