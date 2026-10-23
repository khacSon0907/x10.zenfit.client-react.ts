import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Shield,
  SlidersHorizontal,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Camera,
  Pencil,
  Lock,
  ChevronRight,
  Zap,
  Image as ImageIcon,
  KeyRound,
  Bell,
  Globe,
  Palette,
  Users,
  Clock,
  Star,
  Activity,
  CheckCircle2,
  X,
  Sparkles,
  Save,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useSettings } from '../../context/SettingsContext';
import ChangePasswordModal from '../../features/auth/components/ChangePasswordModal';

interface ProfileData {
  name: string;
  username: string;
  email: string;
  phone: string;
  birthDate: string;
  gender: string;
  height: string;
  address: string;
  joinedDate: string;
  avatar: string;
  role: string;
}

const DEFAULT_PROFILE: ProfileData = {
  name: 'Nguyễn Minh Anh',
  username: 'creatine09072004',
  email: 'creatine09072004@gmail.com',
  phone: '0987 654 321',
  birthDate: '09/07/2004',
  gender: 'Nam',
  height: '175 cm',
  address: 'Hồ Chí Minh, Việt Nam',
  joinedDate: '17/10/2025',
  avatar:
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  role: 'Huấn luyện viên (PT)',
};

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const { user: appUser } = useApp();
  const { theme, toggleTheme } = useSettings();

  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'preferences'>('info');
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved profile or initialize from auth user / default
  const [profile, setProfile] = useState<ProfileData>(() => {
    const saved = localStorage.getItem('zenfit_profile_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {
      ...DEFAULT_PROFILE,
      name: authUser?.name || appUser?.name || DEFAULT_PROFILE.name,
      username: authUser?.username || DEFAULT_PROFILE.username,
      email: authUser?.email || appUser?.email || DEFAULT_PROFILE.email,
    };
  });

  // Edit form state
  const [formData, setFormData] = useState<ProfileData>(profile);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Handle avatar upload
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh tối đa là 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const newAvatar = reader.result as string;
        const updated = { ...profile, avatar: newAvatar };
        setProfile(updated);
        localStorage.setItem('zenfit_profile_data', JSON.stringify(updated));
        toast.success('Đã cập nhật ảnh đại diện thành công!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle save edited profile
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile(formData);
    localStorage.setItem('zenfit_profile_data', JSON.stringify(formData));
    setIsEditModalOpen(false);
    toast.success('Đã cập nhật thông tin cá nhân thành công!');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 animate-in fade-in duration-200">
      {/* Hidden File Input for Avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        <Link
          to="/pt/today"
          className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors"
        >
          Trang chủ
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-400" />
        <span className="text-slate-800 dark:text-slate-200 font-medium">Thông tin cá nhân</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500 dark:text-[#00d68f] shadow-xs">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Thông tin cá nhân
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Quản lý thông tin tài khoản và tùy chỉnh cài đặt cá nhân của bạn trên ZenFit.
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-[#162338]">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'info'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#00d68f] border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0c1626]'
          }`}
        >
          <User className="h-4 w-4" />
          <span>Thông tin cá nhân</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#00d68f] border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0c1626]'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>Bảo mật tài khoản</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-[#00d68f] border border-emerald-500/30 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0c1626]'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Tùy chọn cá nhân</span>
        </button>
      </div>

      {/* TAB 1: THÔNG TIN CÁ NHÂN (3-Column Layout from Screenshot) */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* =========================================
              LEFT COLUMN: Profile Card & Coach Banner
             ========================================= */}
          <div className="lg:col-span-4 space-y-5">
            {/* Main Profile Summary Card */}
            <div className="relative rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-6 shadow-sm overflow-hidden">
              {/* Subtle Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-4 right-4 text-emerald-500/30">
                <Sparkles className="h-4 w-4" />
              </div>

              {/* Avatar with Camera badge */}
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-emerald-500/30 shadow-md"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    title="Đổi ảnh đại diện"
                    aria-label="Đổi ảnh đại diện"
                    className="absolute bottom-0 right-0 p-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>

                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {profile.name}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  @{profile.username}
                </p>

                {/* Role Badge */}
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>{profile.role}</span>
                </div>

                {/* Status */}
                <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Đang hoạt động</span>
                </div>
              </div>

              {/* Completeness Bar */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#162338]/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600 dark:text-slate-400">
                    Hoàn thiện hồ sơ
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">80%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                    style={{ width: '80%' }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Bổ sung thêm thông tin để hồ sơ đầy đủ hơn
                </p>
              </div>

              {/* Contact List */}
              <div className="mt-5 space-y-3 pt-5 border-t border-slate-100 dark:border-[#162338]/80">
                {/* Email */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Email
                    </div>
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                      {profile.email}
                    </div>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Số điện thoại
                    </div>
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {profile.phone}
                    </div>
                  </div>
                </div>

                {/* Join Date */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Ngày tham gia
                    </div>
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {profile.joinedDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coach Career Promo Card */}
            <div className="rounded-2xl p-4 bg-gradient-to-br from-amber-500/10 via-slate-50 to-emerald-500/10 dark:from-[#1b1c18] dark:via-[#091322] dark:to-[#07171e] border border-amber-500/25 dark:border-amber-500/20 shadow-xs flex items-center gap-3.5 group cursor-pointer hover:border-amber-500/40 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Star className="h-5 w-5 fill-amber-500/30" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                  Trở thành PT chuyên nghiệp hơn
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">
                  Cập nhật đầy đủ thông tin hồ sơ và chứng chỉ để tăng độ tin cậy với học viên.
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          </div>

          {/* =========================================
              MIDDLE COLUMN: Personal Info & Account Info
             ========================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* Card 1: Thông tin cá nhân */}
            <div className="rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-5 sm:p-6 shadow-sm space-y-5">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#162338]/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-[#00d68f]">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      Thông tin cá nhân
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Cập nhật thông tin cơ bản để học viên và hệ thống dễ dàng liên hệ với bạn.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#0e1828] border border-slate-200 dark:border-[#1b2b42] text-slate-700 dark:text-slate-200 hover:text-emerald-500 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-[#132238] transition-colors cursor-pointer shrink-0"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Chỉnh sửa</span>
                </button>
              </div>

              {/* 2-Column Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Họ và tên */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#070e17] text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Họ và tên</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {profile.name}
                    </p>
                  </div>
                </div>

                {/* Ngày sinh */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#070e17] text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Ngày sinh</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {profile.birthDate}
                    </p>
                  </div>
                </div>

                {/* Giới tính */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#070e17] text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Giới tính</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {profile.gender}
                    </p>
                  </div>
                </div>

                {/* Số điện thoại */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#070e17] text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Số điện thoại</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {profile.phone}
                    </p>
                  </div>
                </div>

                {/* Chiều cao */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#070e17] text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Chiều cao</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {profile.height}
                    </p>
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-white dark:bg-[#070e17] text-emerald-500 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0 shadow-2xs">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Địa chỉ</p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                      {profile.address}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Thông tin tài khoản */}
            <div className="rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#162338]/80">
                <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                    Thông tin tài khoản
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Thông tin đăng nhập và liên kết tài khoản.
                  </p>
                </div>
              </div>

              {/* Email & Mật khẩu Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Email Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Email</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {profile.email}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-2.5 w-2.5" />
                      Đã xác minh
                    </span>
                  </div>
                </div>

                {/* Mật khẩu Box */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-amber-500/15 text-amber-500 flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Mật khẩu</span>
                  </div>
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-900 dark:text-white tracking-widest">
                      ••••••••
                    </p>
                    <button
                      onClick={() => setIsPasswordModalOpen(true)}
                      className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-[#162338] hover:bg-emerald-500/20 hover:text-emerald-500 text-[10px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>

              {/* Tài khoản liên kết (Google) */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338] flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white dark:bg-[#070e17] border border-slate-200 dark:border-slate-800 flex items-center justify-center p-1.5 shadow-2xs">
                    {/* Google G SVG */}
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Tài khoản liên kết
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Google <span className="text-emerald-500 font-semibold">• Đã liên kết</span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            </div>
          </div>

          {/* =========================================
              RIGHT COLUMN: Quick Actions & Activity Stats
             ========================================= */}
          <div className="lg:col-span-3 space-y-5">
            {/* Card 1: Tùy chọn nhanh */}
            <div className="rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-[#162338]/80">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">Tùy chọn nhanh</h3>
                  <p className="text-[10px] text-slate-400">Truy cập nhanh các chức năng</p>
                </div>
              </div>

              <div className="space-y-1">
                {/* 1. Đổi ảnh đại diện */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0c1626] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="h-4 w-4 text-emerald-500" />
                    <span>Đổi ảnh đại diện</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 2. Đổi mật khẩu */}
                <button
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0c1626] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <KeyRound className="h-4 w-4 text-amber-500" />
                    <span>Đổi mật khẩu</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 3. Cài đặt thông báo */}
                <button
                  onClick={() => setActiveTab('preferences')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0c1626] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Bell className="h-4 w-4 text-sky-500" />
                    <span>Cài đặt thông báo</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </button>

                {/* 4. Ngôn ngữ */}
                <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0c1626] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <Globe className="h-4 w-4 text-emerald-500" />
                    <span>Ngôn ngữ</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>Tiếng Việt</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </div>
                </div>

                {/* 5. Giao diện */}
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#0c1626] text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <Palette className="h-4 w-4 text-indigo-500" />
                    <span>Giao diện</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>{theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:text-slate-600 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              </div>
            </div>

            {/* Card 2: Thống kê hoạt động */}
            <div className="rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-5 shadow-sm space-y-3.5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-[#162338]/80">
                <div className="h-8 w-8 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center">
                  <Activity className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Thống kê hoạt động
                  </h3>
                  <p className="text-[10px] text-slate-400">Hoạt động gần đây của bạn</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Lịch tập hôm nay */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338]">
                  <Calendar className="h-4 w-4 text-emerald-500 mb-1.5" />
                  <p className="text-[10px] text-slate-400 font-medium">Lịch tập hôm nay</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">4 buổi</p>
                </div>

                {/* Tổng học viên */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338]">
                  <Users className="h-4 w-4 text-indigo-500 mb-1.5" />
                  <p className="text-[10px] text-slate-400 font-medium">Tổng học viên</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">12 người</p>
                </div>

                {/* Đánh giá trung bình */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338]">
                  <Star className="h-4 w-4 text-amber-500 mb-1.5 fill-amber-500/30" />
                  <p className="text-[10px] text-slate-400 font-medium">Đánh giá TB</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">4.9 / 5</p>
                </div>

                {/* Thời gian làm việc */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200/80 dark:border-[#142338]">
                  <Clock className="h-4 w-4 text-sky-500 mb-1.5" />
                  <p className="text-[10px] text-slate-400 font-medium">Thời gian</p>
                  <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">32 giờ/tuần</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BẢO MẬT TÀI KHOẢN */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Card Đổi mật khẩu */}
          <div className="rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#162338]">
              <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Mật khẩu đăng nhập
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nên dùng mật khẩu mạnh có chữ hoa, chữ thường, số và ký tự đặc biệt.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Lần đổi mật khẩu gần nhất:{' '}
                <span className="font-semibold text-emerald-500">12 ngày trước</span>
              </p>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                <KeyRound className="h-4 w-4" />
                <span>Thực hiện đổi mật khẩu</span>
              </button>
            </div>
          </div>

          {/* Card Xác thực 2 bước */}
          <div className="rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#162338]">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Xác thực 2 yếu tố (2FA)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tăng cường bảo mật với mã OTP qua Email / Authenticator.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-[#142338]">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  OTP qua Email xác minh
                </span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-500 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                Đang bật
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TÙY CHỌN CÁ NHÂN */}
      {activeTab === 'preferences' && (
        <div className="max-w-3xl rounded-2xl bg-white dark:bg-[#091322] border border-slate-200 dark:border-[#162338] p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-[#162338]">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Cài đặt & Tùy chọn hệ thống
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cấu hình thông báo, ngôn ngữ và giao diện làm việc của bạn.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-[#142338]">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Chế độ hiển thị</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Đang dùng: {theme === 'dark' ? 'Giao diện Tối (Dark Mode)' : 'Giao diện Sáng (Light Mode)'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-[#162338] hover:bg-emerald-500/20 hover:text-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                Chuyển sang {theme === 'dark' ? 'Sáng' : 'Tối'}
              </button>
            </div>

            {/* Email notifications */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#0c1626] border border-slate-200 dark:border-[#142338]">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Thông báo lịch tập & học viên
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Nhận thông báo khi học viên đặt lịch hoặc hủy buổi
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-500">Bật</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL: CHỈNH SỬA THÔNG TIN CÁ NHÂN
         ========================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0b1728] border border-slate-200 dark:border-[#1a2b42] rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#162338]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                  <Pencil className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chỉnh sửa thông tin cá nhân
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Họ và tên */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#162338] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Ngày sinh */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#162338] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Giới tính */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Giới tính
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#162338] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                {/* Số điện thoại */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#162338] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Chiều cao */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chiều cao
                  </label>
                  <input
                    type="text"
                    placeholder="175 cm"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#162338] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Địa chỉ */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#070e17] border border-slate-200 dark:border-[#162338] text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-[#162338]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#111e30] transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-colors cursor-pointer"
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi mật khẩu */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
