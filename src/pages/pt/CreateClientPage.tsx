import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Camera,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Activity,
  Target,
  HeartPulse,
  PhoneCall,
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Dumbbell,
  CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadClientAvatar } from '../../api/imageApi';
import { clientApi } from '../../api/clientApi';
import { formatUploadErrorMessage } from '../../services/imageService';
import { useApp } from '../../context/AppContext';
import type {
  ClientStatus,
  CreateClientRequest,
  ExperienceLevel,
  FitnessGoal,
  Gender,
} from '../../types/client.types';
import {
  CLIENT_STATUS_LABELS,
  EXPERIENCE_LEVEL_LABELS,
  FITNESS_GOAL_LABELS,
  GENDER_LABELS,
} from '../../types/client.types';

export default function CreateClientPage() {
  const navigate = useNavigate();
  const { addClient } = useApp();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'MALE' as Gender,
    dateOfBirth: '',
    address: '',
    height: '',
    initialWeight: '',
    targetWeight: '',
    fitnessGoal: 'LOSE_FAT' as FitnessGoal,
    experienceLevel: 'BEGINNER' as ExperienceLevel,
    medicalConditions: '',
    injuries: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    status: 'ACTIVE' as ClientStatus,
    joinedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => cleanupObjectUrl();
  }, []);

  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh đại diện không được vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh hợp lệ (PNG, JPG, WEBP)');
      return;
    }

    cleanupObjectUrl();
    const localUrl = URL.createObjectURL(file);
    objectUrlRef.current = localUrl;
    setSelectedFile(file);
    setPreviewUrl(localUrl);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleRemoveAvatar = () => {
    cleanupObjectUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else {
      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phoneRegex.test(form.phone.replace(/\s+/g, ''))) {
        errors.phone = 'Số điện thoại không đúng định dạng (Ví dụ: 0912345678)';
      }
    }

    if (form.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        errors.email = 'Email không hợp lệ (Ví dụ: name@example.com)';
      }
    }

    if (form.height && (isNaN(Number(form.height)) || Number(form.height) <= 0)) {
      errors.height = 'Chiều cao phải là số dương';
    }
    if (form.initialWeight && (isNaN(Number(form.initialWeight)) || Number(form.initialWeight) <= 0)) {
      errors.initialWeight = 'Cân nặng phải là số dương';
    }
    if (form.targetWeight && (isNaN(Number(form.targetWeight)) || Number(form.targetWeight) <= 0)) {
      errors.targetWeight = 'Cân nặng mục tiêu phải là số dương';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast.error('Vui lòng kiểm tra lại các trường thông tin bắt buộc');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    let uploadedAvatarUrl: string | undefined = undefined;

    try {
      if (selectedFile) {
        setSubmitStep('Đang tải ảnh lên Cloudinary...');
        try {
          uploadedAvatarUrl = await uploadClientAvatar(selectedFile);
        } catch (uploadErr) {
          const errMsg = formatUploadErrorMessage(uploadErr);
          toast.error(`Lỗi tải ảnh đại diện: ${errMsg}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      setSubmitStep('Đang lưu thông tin khách hàng vào hệ thống...');
      const payload: CreateClientRequest = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth || undefined,
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
        avatarUrl: uploadedAvatarUrl,
        status: form.status,
        height: form.height ? parseFloat(form.height) : undefined,
        initialWeight: form.initialWeight ? parseFloat(form.initialWeight) : undefined,
        targetWeight: form.targetWeight ? parseFloat(form.targetWeight) : undefined,
        fitnessGoal: form.fitnessGoal,
        experienceLevel: form.experienceLevel,
        medicalConditions: form.medicalConditions.trim() || undefined,
        injuries: form.injuries.trim() || undefined,
        emergencyContactName: form.emergencyContactName.trim() || undefined,
        emergencyContactPhone: form.emergencyContactPhone.trim() || undefined,
        notes: form.notes.trim() || undefined,
        joinedDate: form.joinedDate || undefined,
      };

      const newClient = await clientApi.createClient(payload);

      // Cập nhật state qua AppContext
      await addClient(newClient);

      toast.success('Tạo hồ sơ khách hàng thành công!');
      navigate('/pt/clients');
    } catch (err) {
      const errorMsg = formatUploadErrorMessage(err);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Breadcrumbs & Nút quay lại */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/pt/clients" className="hover:text-emerald-500 transition-colors">
            Khách hàng
          </Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-white font-medium">Tạo hồ sơ mới</span>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/pt/clients')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách</span>
        </button>
      </div>

      {/* Main Form Container */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 sm:px-8 py-6 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0f1d32]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Dumbbell className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tạo Mới Hồ Sơ Khách Hàng</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" />
                  ZenFit Client
                </span>
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Lưu trữ hồ sơ học viên, chỉ số sức khoẻ ban đầu và ảnh đại diện Cloudinary.
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-8">
          {/* ========================================================
              PHẦN 1: UPLOAD AVATAR CLOUDINARY
             ======================================================== */}
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-[#091322]/40">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
            />

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileSelect(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative h-28 w-28 rounded-full overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 group shadow-md
                  ${
                    isDragOver
                      ? 'ring-4 ring-emerald-500 scale-105'
                      : 'ring-2 ring-emerald-500/30 hover:ring-emerald-500/70'
                  }
                  ${previewUrl ? 'bg-slate-900' : 'bg-emerald-500/10 text-emerald-500'}
                `}
                title="Nhấp hoặc kéo thả để chọn ảnh đại diện"
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-2">
                    <Camera className="h-8 w-8 text-emerald-500" />
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Chọn ảnh
                    </span>
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
                  <UploadCloud className="h-6 w-6 text-emerald-400" />
                  <span className="text-[11px] font-medium mt-1">
                    {previewUrl ? 'Đổi ảnh' : 'Tải lên'}
                  </span>
                </div>
              </div>

              <div className="flex-1 text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Ảnh đại diện khách hàng (Avatar)
                  </h3>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-600 transition-colors font-medium self-center sm:self-auto cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Xoá ảnh</span>
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedFile
                    ? `Đã chọn: ${selectedFile.name} (${(selectedFile.size / 1024 / 1024).toFixed(2)}MB)`
                    : 'Kéo thả hoặc nhấp để chọn ảnh học viên. Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB).'}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5 text-emerald-500" />
                    <span>{previewUrl ? 'Đổi ảnh khác' : 'Chọn ảnh từ máy tính'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 1: THÔNG TIN CƠ BẢN
             ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <User className="h-4 w-4" />
              <span>1. Thông tin cơ bản</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.fullName ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700/80'
                    }`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{fieldErrors.fullName}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.phone ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700/80'
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="nguyenvana@example.com"
                    className={`w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.email ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700/80'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[11px] text-rose-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Giới tính</label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                    <option key={g} value={g}>
                      {GENDER_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày sinh</label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Địa chỉ</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 2: CHỈ SỐ BAN ĐẦU & MỤC TIÊU
             ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
              <span>2. Chỉ số ban đầu & Mục tiêu tập luyện</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="height"
                  value={form.height}
                  onChange={handleInputChange}
                  placeholder="175.0"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cân nặng hiện tại (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="initialWeight"
                  value={form.initialWeight}
                  onChange={handleInputChange}
                  placeholder="78.5"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cân nặng mục tiêu (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="targetWeight"
                  value={form.targetWeight}
                  onChange={handleInputChange}
                  placeholder="70.0"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Mục tiêu thể hình</span>
                </label>
                <select
                  name="fitnessGoal"
                  value={form.fitnessGoal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(FITNESS_GOAL_LABELS) as FitnessGoal[]).map((goal) => (
                    <option key={goal} value={goal}>
                      {FITNESS_GOAL_LABELS[goal]}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Trình độ kinh nghiệm
                </label>
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(EXPERIENCE_LEVEL_LABELS) as ExperienceLevel[]).map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {EXPERIENCE_LEVEL_LABELS[lvl]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 3: SỨC KHỎE & TIỀN SỬ CHẤN THƯƠNG
             ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <HeartPulse className="h-4 w-4" />
              <span>3. Sức khỏe & Tiền sử chấn thương</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Bệnh lý nền (nếu có)
                </label>
                <input
                  type="text"
                  name="medicalConditions"
                  value={form.medicalConditions}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Đau lưng nhẹ, huyết áp thấp..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tiền sử chấn thương (nếu có)
                </label>
                <input
                  type="text"
                  name="injuries"
                  value={form.injuries}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Từng chấn thương khớp gối, cổ chân..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 4: NGƯỜI LIÊN HỆ KHẨN CẤP
             ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <PhoneCall className="h-4 w-4" />
              <span>4. Người liên hệ khẩn cấp</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Họ tên người liên hệ
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={form.emergencyContactName}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Nguyễn Văn B (Người thân)"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại khẩn cấp
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={form.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="0987654321"
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 5: QUẢN LÝ & GHI CHÚ
             ======================================================== */}
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
              <span>5. Quản lý & Ghi chú</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Trạng thái học viên
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {CLIENT_STATUS_LABELS[st].label} ({st})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ngày tham gia
                </label>
                <input
                  type="date"
                  name="joinedDate"
                  value={form.joinedDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú ban đầu
                </label>
                <textarea
                  rows={3}
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  placeholder="Ghi chú về thói quen sinh hoạt, chế độ ăn, mục tiêu giảm mỡ..."
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            {submitStep ? (
              <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{submitStep}</span>
              </div>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                <span className="text-rose-500">*</span> Vui lòng điền đầy đủ các thông tin bắt buộc
              </p>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => navigate('/pt/clients')}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Huỷ bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Lưu hồ sơ khách hàng</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
