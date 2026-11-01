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
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  Dumbbell,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadClientAvatar, uploadClientBodyPhoto } from '../../api/imageApi';
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

interface BodyPhotoSlot {
  file: File | null;
  previewUrl: string | null;
}

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

  // 3 góc chụp dáng người
  const [frontPhoto, setFrontPhoto] = useState<BodyPhotoSlot>({ file: null, previewUrl: null });
  const [backPhoto, setBackPhoto] = useState<BodyPhotoSlot>({ file: null, previewUrl: null });
  const [sidePhoto, setSidePhoto] = useState<BodyPhotoSlot>({ file: null, previewUrl: null });

  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Dọn dẹp Blob URL khi unmount hoặc đổi ảnh
  const cleanupObjectUrl = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    [frontPhoto, backPhoto, sidePhoto].forEach((slot) => {
      if (slot.previewUrl && slot.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(slot.previewUrl);
      }
    });
  };

  useEffect(() => {
    return () => {
      cleanupObjectUrl();
    };
  }, []);

  // Xử lý chọn file ảnh avatar
  const handleFileSelect = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh đại diện không được vượt quá 5MB');
      return;
    }

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

  // Xử lý chọn ảnh góc chụp dáng người
  const handleBodyPhotoSelect = (
    file: File | undefined,
    setSlot: React.Dispatch<React.SetStateAction<BodyPhotoSlot>>,
    slotName: string
  ) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ảnh ${slotName} không được vượt quá 5MB`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(`Ảnh ${slotName} phải là định dạng hình ảnh hợp lệ`);
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setSlot((prev) => {
      if (prev.previewUrl && prev.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { file, previewUrl: localUrl };
    });
  };

  // Gỡ avatar đã chọn
  const handleRemoveAvatar = () => {
    cleanupObjectUrl();
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Xử lý thay đổi input text/number/select
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

  // Validation form trước khi submit
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
    let uploadedFrontPhotoUrl: string | undefined = undefined;
    let uploadedBackPhotoUrl: string | undefined = undefined;
    let uploadedSidePhotoUrl: string | undefined = undefined;

    try {
      // Bước 1: Upload avatar lên Cloudinary nếu người dùng có chọn ảnh
      if (selectedFile) {
        setSubmitStep('Đang tải ảnh đại diện...');
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

      // Bước 1.2: Upload các ảnh vóc dáng
      if (frontPhoto.file) {
        setSubmitStep('Đang tải ảnh dáng mặt trước...');
        try {
          uploadedFrontPhotoUrl = await uploadClientBodyPhoto(frontPhoto.file);
        } catch (uploadErr) {
          toast.error(`Lỗi tải ảnh mặt trước: ${formatUploadErrorMessage(uploadErr)}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      if (backPhoto.file) {
        setSubmitStep('Đang tải ảnh dáng mặt sau...');
        try {
          uploadedBackPhotoUrl = await uploadClientBodyPhoto(backPhoto.file);
        } catch (uploadErr) {
          toast.error(`Lỗi tải ảnh mặt sau: ${formatUploadErrorMessage(uploadErr)}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      if (sidePhoto.file) {
        setSubmitStep('Đang tải ảnh dáng mặt nghiêng...');
        try {
          uploadedSidePhotoUrl = await uploadClientBodyPhoto(sidePhoto.file);
        } catch (uploadErr) {
          toast.error(`Lỗi tải ảnh mặt nghiêng: ${formatUploadErrorMessage(uploadErr)}`);
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
        frontPhotoUrl: uploadedFrontPhotoUrl,
        backPhotoUrl: uploadedBackPhotoUrl,
        sidePhotoUrl: uploadedSidePhotoUrl,
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
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Tạo Mới Hồ Sơ Học Viên
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-2.5 w-2.5" />
                  ZenFit Client
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Điền đầy đủ thông tin khách hàng, tải ảnh lên Cloudinary và lưu trữ chỉ số ban đầu.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body Modal (Scrollable) */}
        <form onSubmit={handleSubmit} id="create-client-form" className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* ========================================================
              PHẦN 1: TẢI ẢNH ĐẠI DIỆN CLOUDINARY
             ======================================================== */}
          <div className="p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-[#091322]/50">
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
                className={`relative group h-24 w-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
                  isDragOver
                    ? 'border-emerald-500 bg-emerald-500/10 scale-105'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-slate-850'
                }`}
              >
                {previewUrl ? (
                  <>
                    <img
                      src={previewUrl}
                      alt="Avatar Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Camera className="h-5 w-5" />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                    <UploadCloud className="h-6 w-6" />
                    <span className="text-[10px] font-medium mt-0.5">Tải ảnh</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5 text-center sm:text-left flex-1">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ảnh Đại Diện Khách Hàng
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
                  Định dạng PNG, JPG hoặc WEBP. Kích thước tối đa 5MB. Ảnh sẽ được đẩy lên Cloudinary với chữ ký số bảo mật.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
                  >
                    Chọn ảnh
                  </button>
                  {previewUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Gỡ ảnh</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 1: THÔNG TIN CÁ NHÂN CƠ BẢN
             ======================================================== */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <User className="h-4 w-4" />
              <span>1. Thông tin cá nhân cơ bản</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Họ và tên */}
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Họ và tên</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleInputChange}
                    placeholder="Nguyễn Văn A"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <span>Số điện thoại</span>
                  <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    placeholder="hocvien@gmail.com"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.email
                        ? 'border-rose-500'
                        : 'border-slate-200 dark:border-slate-700/80'
                    }`}
                  />
                </div>
              </div>

              {/* Giới tính */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Giới tính
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(GENDER_LABELS) as Gender[]).map((genderKey) => (
                    <button
                      key={genderKey}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, gender: genderKey }))}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        form.gender === genderKey
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                          : 'bg-slate-50 dark:bg-slate-850/60 border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {GENDER_LABELS[genderKey]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ngày sinh */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ngày sinh
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
              <div className="space-y-1 sm:col-span-2">
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
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 2: CHỈ SỐ THỂ HÌNH BAN ĐẦU
             ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Activity className="h-4 w-4" />
              <span>2. Chỉ số thể hình ban đầu</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Chiều cao */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chiều cao (cm)
                </label>
                <input
                  type="number"
                  step="0.5"
                  name="height"
                  value={form.height}
                  onChange={handleInputChange}
                  placeholder="175"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.height
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                />
              </div>

              {/* Cân nặng ban đầu */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cân nặng khởi điểm (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="initialWeight"
                  value={form.initialWeight}
                  onChange={handleInputChange}
                  placeholder="70"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
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
                  placeholder="65"
                  className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-850/60 border rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.targetWeight
                      ? 'border-rose-500'
                      : 'border-slate-200 dark:border-slate-700/80'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 3: ẢNH DÁNG NGƯỜI 3 GÓC CHỤP BAN ĐẦU
             ======================================================== */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Camera className="h-4 w-4" />
              <span>3. Ảnh dáng người 3 góc chụp ban đầu (Theo dõi tiến độ)</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Mặt trước */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322]/50 text-center space-y-2">
                <input
                  ref={frontInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBodyPhotoSelect(e.target.files?.[0], setFrontPhoto, 'mặt trước')}
                  className="hidden"
                />
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Mặt trước</p>
                <div
                  onClick={() => frontInputRef.current?.click()}
                  className="h-28 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer overflow-hidden bg-white dark:bg-slate-900"
                >
                  {frontPhoto.previewUrl ? (
                    <img src={frontPhoto.previewUrl} alt="Front" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-[10px] flex flex-col items-center">
                      <Camera className="h-4 w-4 mb-1" />
                      <span>Chọn ảnh</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mặt sau */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322]/50 text-center space-y-2">
                <input
                  ref={backInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBodyPhotoSelect(e.target.files?.[0], setBackPhoto, 'mặt sau')}
                  className="hidden"
                />
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Mặt sau</p>
                <div
                  onClick={() => backInputRef.current?.click()}
                  className="h-28 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer overflow-hidden bg-white dark:bg-slate-900"
                >
                  {backPhoto.previewUrl ? (
                    <img src={backPhoto.previewUrl} alt="Back" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-[10px] flex flex-col items-center">
                      <Camera className="h-4 w-4 mb-1" />
                      <span>Chọn ảnh</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Mặt nghiêng */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322]/50 text-center space-y-2">
                <input
                  ref={sideInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleBodyPhotoSelect(e.target.files?.[0], setSidePhoto, 'mặt nghiêng')}
                  className="hidden"
                />
                <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Mặt nghiêng</p>
                <div
                  onClick={() => sideInputRef.current?.click()}
                  className="h-28 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-center cursor-pointer overflow-hidden bg-white dark:bg-slate-900"
                >
                  {sidePhoto.previewUrl ? (
                    <img src={sidePhoto.previewUrl} alt="Side" className="h-full w-full object-cover" />
                  ) : (
                    <div className="text-slate-400 text-[10px] flex flex-col items-center">
                      <Camera className="h-4 w-4 mb-1" />
                      <span>Chọn ảnh</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              NHÓM 4: QUẢN LÝ & GHI CHÚ
             ======================================================== */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <FileText className="h-4 w-4" />
              <span>4. Quản lý & Ghi chú ban đầu</span>
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

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              form="create-client-form"
              disabled={isSubmitting}
              className="flex-1 sm:flex-initial px-5 py-2 text-xs font-semibold rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>Tạo Học Viên</span>
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
