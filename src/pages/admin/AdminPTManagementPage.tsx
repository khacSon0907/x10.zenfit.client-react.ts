import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import { Lock, Unlock, Plus } from 'lucide-react';

export default function AdminPTManagementPage() {
  const { adminPTs, toggleAdminPTStatus } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Quản lý Huấn luyện viên (PT)</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Danh sách tài khoản PT, gói thuê bao, trạng thái hoạt động và quyền đăng nhập.
          </p>
        </div>
        <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
          <Plus className="h-4 w-4" /> Tạo tài khoản PT
        </button>
      </div>

      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-800">
          {adminPTs.map((pt) => (
            <div key={pt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white text-sm">{pt.fullName}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-400 border border-indigo-800">
                    Gói {pt.planName}
                  </span>
                  <StatusBadge
                    label={pt.status === 'active' ? 'Đang hoạt động' : pt.status === 'expiring' ? 'Sắp hết hạn' : 'Đã khóa'}
                    variant={pt.status === 'active' ? 'success' : pt.status === 'expiring' ? 'warning' : 'danger'}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {pt.email} • {pt.phone} • Đăng nhập lần cuối: {pt.lastLogin}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAdminPTStatus(pt.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                    pt.status === 'locked'
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800 hover:bg-emerald-900'
                      : 'bg-rose-950/60 text-rose-400 border border-rose-800 hover:bg-rose-900'
                  }`}
                >
                  {pt.status === 'locked' ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                  <span>{pt.status === 'locked' ? 'Mở khóa' : 'Khóa tài khoản'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
