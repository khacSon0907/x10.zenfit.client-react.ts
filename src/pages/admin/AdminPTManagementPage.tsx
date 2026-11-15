import { useState } from 'react';
import {
  Users,
  Plus,
  Lock,
  Unlock,
  Mail,
  Phone,
  Clock,
  Settings,
  X,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '../../context/AppContext';
import type { AdminPTUser } from '../../mock/mockData';

// Default Avatars matching the design
const DEFAULT_AVATARS: Record<string, string> = {
  'pt-1': 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=200&auto=format&fit=crop&q=80',
  'pt-2': 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'pt-3': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'pt-4': 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
};

export default function AdminPTManagementPage() {
  const { adminPTs, toggleAdminPTStatus } = useApp();
  const [ptsList, setPtsList] = useState<AdminPTUser[]>(adminPTs);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating new PT
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [planName, setPlanName] = useState<'Free' | 'Plus' | 'Pro'>('Free');

  // Handle Lock / Unlock
  const handleToggleStatus = (ptId: string) => {
    setPtsList((prev) =>
      prev.map((pt) => {
        if (pt.id === ptId) {
          const nextStatus = pt.status === 'locked' ? 'active' : 'locked';
          if (nextStatus === 'locked') {
            toast.warning(`Đã khóa tài khoản PT "${pt.fullName}"`);
          } else {
            toast.success(`Đã mở khóa tài khoản PT "${pt.fullName}"`);
          }
          return { ...pt, status: nextStatus };
        }
        return pt;
      })
    );
    toggleAdminPTStatus(ptId);
  };

  // Handle Create PT
  const handleCreatePT = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      toast.error('Vui lòng điền đầy đủ họ tên và email!');
      return;
    }

    const newPT: AdminPTUser = {
      id: `pt-${Date.now()}`,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim() || '0901234567',
      planName,
      activeClientsCount: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      expiresDate: '2027-12-31',
      lastLogin: 'Vừa đăng ký',
      status: 'active',
    };

    setPtsList((prev) => [newPT, ...prev]);
    toast.success(`Tạo thành công tài khoản PT "${newPT.fullName}"!`);
    setIsCreateModalOpen(false);
    setFullName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ========================================================
          1. PAGE HEADER
         ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-violet-600/20 border border-violet-500/30 text-violet-400 shrink-0 shadow-lg shadow-purple-600/20">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>Quản lý Huấn luyện viên (PT)</span>
            </h1>
            <p className="text-xs sm:text-sm text-purple-300/60 mt-0.5">
              Danh sách tài khoản PT, gói thuê bao và trạng thái hoạt động hiện tại.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Nút Tạo tài khoản PT (Purple Gradient) */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 active:scale-[0.98] text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Tạo tài khoản PT</span>
          </button>

          {/* Settings / Widget Icon */}
          <button
            type="button"
            title="Cài đặt phân hệ"
            className="p-2.5 rounded-xl border border-purple-500/25 bg-[#170c33]/80 text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. PT LIST CARD (Matching Screenshot exactly)
         ======================================================== */}
      <div className="bg-[#120826]/90 rounded-3xl border border-purple-500/15 backdrop-blur-md shadow-2xl overflow-hidden divide-y divide-purple-500/15">
        {ptsList.map((pt) => {
          const avatarUrl =
            DEFAULT_AVATARS[pt.id] ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

          return (
            <div
              key={pt.id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-purple-950/20 transition-colors"
            >
              {/* Left Info: Avatar + Details */}
              <div className="flex items-center gap-4 min-w-0">
                {/* Round Avatar Photo */}
                <div className="relative shrink-0">
                  <img
                    src={avatarUrl}
                    alt={pt.fullName}
                    className="w-14 h-14 rounded-full object-cover border-2 border-purple-500/30 shadow-md"
                  />
                  {pt.status === 'active' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#120826]" />
                  )}
                  {pt.status === 'locked' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-[#120826]" />
                  )}
                  {pt.status === 'expiring' && (
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#120826]" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0">
                  {/* Name + Badges row */}
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-white text-sm sm:text-base tracking-tight">
                      {pt.fullName}
                    </span>

                    {/* Gói Badge (Free / Plus / Pro with custom colors) */}
                    {pt.planName === 'Free' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#2a1352] text-purple-300 border border-purple-500/40">
                        Gói Free
                      </span>
                    )}
                    {pt.planName === 'Plus' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0c2e63] text-blue-300 border border-blue-500/40">
                        Gói Plus
                      </span>
                    )}
                    {pt.planName === 'Pro' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0a3826] text-emerald-300 border border-emerald-500/40">
                        Gói Pro
                      </span>
                    )}

                    {/* Status Badge */}
                    {pt.status === 'active' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#0c3624] text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                        Đang hoạt động
                      </span>
                    )}
                    {pt.status === 'expiring' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3b2308] text-amber-400 border border-amber-500/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                        Sắp hết hạn
                      </span>
                    )}
                    {pt.status === 'locked' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#3b0d18] text-rose-400 border border-rose-500/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 inline-block" />
                        Đã khóa
                      </span>
                    )}
                  </div>

                  {/* Contact Row */}
                  <div className="text-xs text-purple-300/60 mt-1.5 flex items-center gap-3 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 opacity-70" />
                      {pt.email}
                    </span>
                    <span className="opacity-40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 opacity-70" />
                      {pt.phone}
                    </span>
                    <span className="opacity-40">•</span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 opacity-70" />
                      Đăng nhập lần cuối: {pt.lastLogin}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Button (Khóa / Mở khóa) */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {pt.status !== 'locked' ? (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(pt.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-rose-500/50 bg-rose-950/20 text-rose-400 hover:bg-rose-900/30 hover:border-rose-400 transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Khóa tài khoản</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(pt.id)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-emerald-500/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 hover:border-emerald-400 transition-colors flex items-center gap-2 cursor-pointer shadow-xs active:scale-[0.98]"
                  >
                    <Unlock className="h-3.5 w-3.5" />
                    <span>Mở khóa</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================
          3. MODAL: TẠO TÀI KHOẢN PT
         ======================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#140b2b] border border-purple-500/25 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-purple-500/20 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Tạo tài khoản Huấn luyện viên (PT)</h3>
                <p className="text-xs text-purple-300/60 mt-0.5">
                  Cấp quyền truy cập hệ thống và kích hoạt gói thuê bao
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-purple-300 hover:text-white hover:bg-purple-900/30 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreatePT} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Trần Văn Nam"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Email đăng nhập <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="nam.pt@zenfit.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="0987654321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white placeholder-purple-300/40 focus:outline-none focus:border-purple-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200 mb-1">
                  Gói thuê bao ban đầu
                </label>
                <select
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value as 'Free' | 'Plus' | 'Pro')}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-purple-500/25 bg-[#1b0e36] text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="Free">Gói Free (Tối đa 5 học viên)</option>
                  <option value="Plus">Gói Plus (Tối đa 25 học viên)</option>
                  <option value="Pro">Gói Pro (Tối đa 50 học viên)</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-purple-500/20">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-purple-300 hover:text-white hover:bg-purple-900/30 rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl shadow-lg shadow-purple-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="h-4 w-4" />
                  <span>Tạo tài khoản</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
