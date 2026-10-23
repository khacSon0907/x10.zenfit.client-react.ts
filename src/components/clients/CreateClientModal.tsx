import React, { useState, useRef, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadClientAvatar } from '../../api/imageApi';
import { clientApi } from '../../api/clientApi';
import { formatUploadErrorMessage } from '../../services/imageService';
import type {
  ClientResponse,
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

export interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newClient: ClientResponse) => void;
  defaultTrainerId?: string;
}

interface FormState {
  fullName: string;
  phone: string;
  email: string;
  gender: Gender;
  dateOfBirth: string;
  address: string;
  height: string;
  initialWeight: string;
  targetWeight: string;
  fitnessGoal: FitnessGoal;
  experienceLevel: ExperienceLevel;
  medicalConditions: string;
  injuries: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  status: ClientStatus;
  joinedDate: string;
  notes: string;
}

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  email: '',
  gender: 'MALE',
  dateOfBirth: '',
  address: '',
  height: '',
  initialWeight: '',
  targetWeight: '',
  fitnessGoal: 'LOSE_FAT',
  experienceLevel: 'BEGINNER',
  medicalConditions: '',
  injuries: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  status: 'ACTIVE',
  joinedDate: new Date().toISOString().split('T')[0],
  notes: '',
};

function CreateClientModalDialog({
  onClose,
  onSuccess,
  defaultTrainerId,
}: Omit<CreateClientModalProps, 'isOpen'>) {
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    joinedDate: new Date().toISOString().split('T')[0],
  }));
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Dọn dẹp Blob URL khi unmount hoặc đổi ảnh
  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrl();
    };
  }, []);

  // Xử lý chọn file ảnh
  const handleFileSelect = (file: File) => {
    // 1. Kiểm tra dung lượng (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh đại diện không được vượt quá 5MB');
      return;
    }

    // 2. Kiểm tra định dạng ảnh
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn định dạng ảnh hợp lệ (PNG, JPG, WEBP)');
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

  const handleRemoveAvatar = (e: React.MouseEvent) => {
    e.stopPropagation();
    cleanupObjectUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Validate form
  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!form.fullName.trim()) {
      errors.fullName = 'Họ và tên là bắt buộc';
    }

    if (!form.phone.trim()) {
      errors.phone = 'Số điện thoại là bắt buộc';
    } else {
      // Validate SĐT Việt Nam cơ bản: 10 chữ số bắt đầu bằng 0
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
      toast.error('Vui lòng kiểm tra lại các thông tin bắt buộc còn thiếu');
      return false;
    }
    return true;
  };

  // Submit tạo hồ sơ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    let uploadedAvatarUrl: string | undefined = undefined;

    try {
      // Bước 1: Upload avatar lên Cloudinary nếu người dùng có chọn ảnh
      if (selectedFile) {
        setSubmitStep('Đang tải ảnh đại diện lên Cloudinary...');
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

      // Bước 2: Tạo hồ sơ khách hàng tại Backend
      setSubmitStep('Đang khởi tạo hồ sơ khách hàng...');
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
        assignedTrainerId: defaultTrainerId || undefined,
        notes: form.notes.trim() || undefined,
        joinedDate: form.joinedDate || undefined,
      };

      const newClient = await clientApi.createClient(payload);

      toast.success('Tạo hồ sơ khách hàng mới thành công!');
      onSuccess?.(newClient);
      onClose();
    } catch (err: unknown) {
      const errorMsg = formatUploadErrorMessage(err);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-3xl my-auto bg-white dark:bg-[#0c1626] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#162338] overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="relative px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#0f1d32]/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <Dumbbell className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Tạo Hồ Sơ Khách Hàng Mới</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" />
                  ZenFit Client
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Điền thông tin học viên, chỉ số ban đầu và tải ảnh đại diện lên Cloudinary.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ========================================================
              PHẦN 1: UPLOAD AVATAR CLOUDINARY
             ======================================================== */}
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-5 bg-slate-50/50 dark:bg-[#091322]/40 transition-colors">
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

            <div className="flex flex-col sm:flex-row items-center gap-5">
              {/* Vùng Avatar Preview */}
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
                className={`relative h-24 w-24 rounded-full overflow-hidden shrink-0 flex items-center justify-center cursor-pointer transition-all duration-200 group shadow-md
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
                    <Camera className="h-7 w-7 text-emerald-500" />
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      Chọn ảnh
                    </span>
                  </div>
                )}

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white backdrop-blur-xs">
                  <UploadCloud className="h-5 w-5 text-emerald-400" />
                  <span className="text-[10px] font-medium mt-0.5">
                    {previewUrl ? 'Đổi ảnh' : 'Tải lên'}
                  </span>
                </div>
              </div>

              {/* Thông tin & nút thao tác */}
              <div className="flex-1 text-center sm:text-left space-y-1.5">
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
                    : 'Kéo thả hoặc nhấp vào khung ảnh để tải lên. Hỗ trợ PNG, JPG, JPEG, WEBP (Tối đa 5MB).'}
                </p>
                <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer"
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
              {/* Họ và tên */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Họ và tên <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      fieldErrors.fullName
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700/80'
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

              {/* Số điện thoại */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      fieldErrors.phone
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700/80'
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

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="nguyenvana@example.com"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                      fieldErrors.email
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700/80'
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

              {/* Giới tính */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((g) => (
                    <option key={g} value={g}>
                      {GENDER_LABELS[g]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày sinh */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Địa chỉ
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleInputChange}
                    placeholder="Quận 1, TP. Hồ Chí Minh"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 2: CHỈ SỐ BAN ĐẦU & MỤC TIÊU
             ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
              <span>2. Chỉ số ban đầu & Mục tiêu tập luyện</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Chiều cao */}
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
                  placeholder="Ví dụ: 175.0"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.height
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                />
              </div>

              {/* Cân nặng ban đầu */}
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
                  placeholder="Ví dụ: 78.5"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.initialWeight
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                />
              </div>

              {/* Cân nặng mục tiêu */}
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
                  placeholder="Ví dụ: 70.0"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.targetWeight
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                />
              </div>

              {/* Mục tiêu tập luyện */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Target className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Mục tiêu thể hình</span>
                </label>
                <select
                  name="fitnessGoal"
                  value={form.fitnessGoal}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(FITNESS_GOAL_LABELS) as FitnessGoal[]).map((goal) => (
                    <option key={goal} value={goal}>
                      {FITNESS_GOAL_LABELS[goal]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Trình độ */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Trình độ kinh nghiệm
                </label>
                <select
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  placeholder="Ví dụ: Từng chấn thương cổ chân, thoát vị đĩa đệm..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 4: NGƯỜI LIÊN HỆ KHẨN CẤP
             ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 5: QUẢN LÝ & GHI CHÚ
             ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
              <span>5. Quản lý & Ghi chú ban đầu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Trạng thái */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Trạng thái học viên
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {CLIENT_STATUS_LABELS[st].label} ({st})
                    </option>
                  ))}
                </select>
              </div>

              {/* Ngày tham gia */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ngày tham gia
                </label>
                <input
                  type="date"
                  name="joinedDate"
                  value={form.joinedDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Ghi chú ban đầu */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú ban đầu từ huấn luyện viên
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  value={form.notes}
                  onChange={handleInputChange}
                  placeholder="Ví dụ: Muốn giảm mỡ bụng trong 3 tháng, khung giờ tập phù hợp: 18:00 các ngày 2-4-6..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#0f1d32]/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          {submitStep ? (
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{submitStep}</span>
            </div>
          ) : (
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              <span className="text-rose-500">*</span> Các trường bắt buộc phải điền đầy đủ
            </p>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Huỷ bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Tạo hồ sơ khách hàng</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CreateClientModal(props: CreateClientModalProps) {
  if (!props.isOpen) return null;
  return <CreateClientModalDialog {...props} />;
}

export default CreateClientModal;
