import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Activity,
  Target,
  Edit,
  Trash2,
  FileSignature,
  RefreshCw,
  Sparkles,
  Camera,
  X,
  Check,
  ChevronRight,
  Maximize2,
  Save,
  Loader2,
  Copy,
  CheckCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { clientApi } from '../../api/clientApi';
import { imageApi } from '../../api/imageApi';
import { clientGoalService } from '../../services/clientGoalService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type { ClientGoal } from '../../types/clientGoal';
import ActiveGoalBanner from '../../components/goals/ActiveGoalBanner';
import ClientGoalsTimeline from '../../components/goals/ClientGoalsTimeline';
import ClientNutritionSection from '../../components/nutrition/ClientNutritionSection';
import type {
  ClientResponse,
  Gender,
  ClientStatus,
  UpdateClientRequest,
} from '../../types/client.types';
import {
  CLIENT_STATUS_LABELS,
  GENDER_LABELS,
  FITNESS_GOAL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '../../types/client.types';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const { deleteClient: deleteClientApp, fetchMySubscription } = useApp();

  const [client, setClient] = useState<ClientResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);

  // ============================================================================
  // CLIENT GOALS MANAGEMENT (QUẢN LÝ MỤC TIÊU HỌC VIÊN)
  // ============================================================================
  const [clientGoals, setClientGoals] = useState<ClientGoal[]>([]);
  const [activeGoal, setActiveGoal] = useState<ClientGoal | null>(null);
  const [isLoadingGoals, setIsLoadingGoals] = useState<boolean>(false);

  // Lightbox xem ảnh lớn
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // CHẾ ĐỘ CHỈNH SỬA TRỰC TIẾP TẠI TRANG (INLINE EDIT - KHÔNG DÙNG POP-UP)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);

  // Form state
  const [editForm, setEditForm] = useState<{
    fullName: string;
    phone: string;
    email: string;
    gender: Gender;
    dateOfBirth: string;
    address: string;
    status: ClientStatus;
    joinedDate: string;
    height: string;
    initialWeight: string;
    targetWeight: string;
    fitnessGoal: string;
    experienceLevel: string;
    medicalConditions: string;
    injuries: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    notes: string;
  }>({
    fullName: '',
    phone: '',
    email: '',
    gender: 'MALE',
    dateOfBirth: '',
    address: '',
    status: 'ACTIVE',
    joinedDate: '',
    height: '',
    initialWeight: '',
    targetWeight: '',
    fitnessGoal: '',
    experienceLevel: '',
    medicalConditions: '',
    injuries: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // File refs & Staging states cho upload ảnh
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const frontInputRef = useRef<HTMLInputElement>(null);
  const sideInputRef = useRef<HTMLInputElement>(null);
  const backInputRef = useRef<HTMLInputElement>(null);

  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isAvatarRemoved, setIsAvatarRemoved] = useState<boolean>(false);

  const [newFrontPhotoFile, setNewFrontPhotoFile] = useState<File | null>(null);
  const [frontPhotoPreview, setFrontPhotoPreview] = useState<string | null>(null);
  const [isFrontPhotoRemoved, setIsFrontPhotoRemoved] = useState<boolean>(false);

  const [newSidePhotoFile, setNewSidePhotoFile] = useState<File | null>(null);
  const [sidePhotoPreview, setSidePhotoPreview] = useState<string | null>(null);
  const [isSidePhotoRemoved, setIsSidePhotoRemoved] = useState<boolean>(false);

  const [newBackPhotoFile, setNewBackPhotoFile] = useState<File | null>(null);
  const [backPhotoPreview, setBackPhotoPreview] = useState<string | null>(null);
  const [isBackPhotoRemoved, setIsBackPhotoRemoved] = useState<boolean>(false);

  // Modal xác nhận xoá học viên
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dọn dẹp object URLs preview khi unmount hoặc đổi ảnh
  const cleanupPreviews = useCallback(() => {
    [avatarPreview, frontPhotoPreview, sidePhotoPreview, backPhotoPreview].forEach((url) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });
  }, [avatarPreview, frontPhotoPreview, sidePhotoPreview, backPhotoPreview]);

  useEffect(() => {
    return () => {
      cleanupPreviews();
    };
  }, [cleanupPreviews]);

  // ============================================================================
  // LOAD DỮ LIỆU TỪ BACKEND: GET /api/clients/:id
  // ============================================================================
  const fetchClientDetail = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await clientApi.getClientById(id);
      setClient(data);
      setEditForm({
        fullName: data.fullName || '',
        phone: data.phone || '',
        email: data.email || '',
        gender: data.gender || 'MALE',
        dateOfBirth: data.dateOfBirth || '',
        address: data.address || '',
        status: data.status || 'ACTIVE',
        joinedDate: data.joinedDate || '',
        height: data.height ? String(data.height) : '',
        initialWeight: data.initialWeight ? String(data.initialWeight) : '',
        targetWeight: data.targetWeight ? String(data.targetWeight) : '',
        fitnessGoal: data.fitnessGoal || '',
        experienceLevel: data.experienceLevel || '',
        medicalConditions: data.medicalConditions || '',
        injuries: data.injuries || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        notes: data.notes || '',
      });
    } catch (err: unknown) {
      console.error('Lỗi khi tải chi tiết khách hàng:', err);
      const axiosErr = err as { response?: { status?: number; data?: { message?: string } } };
      if (axiosErr.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập học viên này (thuộc quyền quản lý của PT khác)');
        navigate('/pt/clients');
        return;
      }
      const message =
        axiosErr.response?.data?.message ||
        (err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ khách hàng');
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDetail();
  }, [fetchClientDetail]);

  // ============================================================================
  // LOAD MỤC TIÊU HỌC VIÊN: GET /api/client-goals/client/:clientId
  // ============================================================================
  const fetchClientGoals = useCallback(async () => {
    if (!id) return;
    setIsLoadingGoals(true);
    try {
      const [goalsList, currentActive] = await Promise.all([
        clientGoalService.getGoalsByClientId(id),
        clientGoalService.getActiveGoalByClientId(id),
      ]);
      setClientGoals(goalsList);
      setActiveGoal(currentActive);
    } catch (err) {
      console.error('Lỗi khi tải danh sách mục tiêu học viên:', err);
    } finally {
      setIsLoadingGoals(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientGoals();
  }, [fetchClientGoals]);

  // Copy số điện thoại
  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setIsCopiedPhone(true);
    toast.success('Đã sao chép số điện thoại!');
    setTimeout(() => setIsCopiedPhone(false), 2000);
  };

  // Tính BMI & phân loại
  const calculateBmi = (heightCm?: number, weightKg?: number) => {
    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    let category = 'Bình thường';
    let color = 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30';

    if (bmi < 18.5) {
      category = 'Gầy / Thiếu cân';
      color = 'text-blue-600 dark:text-blue-400 bg-blue-500/15 border-blue-500/30';
    } else if (bmi >= 25 && bmi < 29.9) {
      category = 'Thừa cân';
      color = 'text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30';
    } else if (bmi >= 30) {
      category = 'Béo phì';
      color = 'text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30';
    }

    return { value: bmi.toFixed(1), category, color };
  };

  // Tính tuổi từ ngày sinh
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return null;
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age > 0 ? age : null;
  };

  // Bắt đầu chỉnh sửa trực tiếp
  const handleStartEdit = () => {
    if (!client) return;
    setEditForm({
      fullName: client.fullName || '',
      phone: client.phone || '',
      email: client.email || '',
      gender: client.gender || 'MALE',
      dateOfBirth: client.dateOfBirth || '',
      address: client.address || '',
      status: client.status || 'ACTIVE',
      joinedDate: client.joinedDate || '',
      height: client.height ? String(client.height) : '',
      initialWeight: client.initialWeight ? String(client.initialWeight) : '',
      targetWeight: client.targetWeight ? String(client.targetWeight) : '',
      fitnessGoal: client.fitnessGoal || '',
      experienceLevel: client.experienceLevel || '',
      medicalConditions: client.medicalConditions || '',
      injuries: client.injuries || '',
      emergencyContactName: client.emergencyContactName || '',
      emergencyContactPhone: client.emergencyContactPhone || '',
      notes: client.notes || '',
    });
    setFormErrors({});
    setIsEditing(true);
  };

  // Hủy chỉnh sửa
  const handleCancelEdit = () => {
    cleanupPreviews();
    setNewAvatarFile(null);
    setAvatarPreview(null);
    setIsAvatarRemoved(false);
    setNewFrontPhotoFile(null);
    setFrontPhotoPreview(null);
    setIsFrontPhotoRemoved(false);
    setNewSidePhotoFile(null);
    setSidePhotoPreview(null);
    setIsSidePhotoRemoved(false);
    setNewBackPhotoFile(null);
    setBackPhotoPreview(null);
    setIsBackPhotoRemoved(false);
    setFormErrors({});
    setIsEditing(false);
  };

  // Xử lý chọn file ảnh mới
  const handleSelectImageFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'avatar' | 'front' | 'side' | 'back'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh tối đa là 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }
    const allowed = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!allowed.includes(file.type.toLowerCase())) {
      toast.error('Chỉ hỗ trợ file ảnh định dạng JPG, PNG hoặc WEBP.');
      return;
    }

    const preview = URL.createObjectURL(file);
    if (type === 'avatar') {
      if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
      setNewAvatarFile(file);
      setAvatarPreview(preview);
      setIsAvatarRemoved(false);
    } else if (type === 'front') {
      if (frontPhotoPreview?.startsWith('blob:')) URL.revokeObjectURL(frontPhotoPreview);
      setNewFrontPhotoFile(file);
      setFrontPhotoPreview(preview);
      setIsFrontPhotoRemoved(false);
    } else if (type === 'side') {
      if (sidePhotoPreview?.startsWith('blob:')) URL.revokeObjectURL(sidePhotoPreview);
      setNewSidePhotoFile(file);
      setSidePhotoPreview(preview);
      setIsSidePhotoRemoved(false);
    } else if (type === 'back') {
      if (backPhotoPreview?.startsWith('blob:')) URL.revokeObjectURL(backPhotoPreview);
      setNewBackPhotoFile(file);
      setBackPhotoPreview(preview);
      setIsBackPhotoRemoved(false);
    }

    setIsEditing(true);
    toast.info('Đã chọn ảnh mới. Bấm "Lưu thay đổi" để áp dụng.');
    e.target.value = '';
  };

  // Submit cập nhật hồ sơ trực tiếp qua PUT /api/clients/:id
  const handleSaveEdit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!id || !client) return;

    // Validate client-side
    const errors: Record<string, string> = {};
    if (!editForm.fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống';
    }
    if (!editForm.phone.trim()) {
      errors.phone = 'Số điện thoại không được để trống';
    } else {
      const cleanPhone = editForm.phone.replace(/[\s.-]/g, '');
      if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(cleanPhone)) {
        errors.phone = 'Số điện thoại không hợp lệ (cần 10 chữ số)';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Vui lòng kiểm tra lại các trường thông tin');
      return;
    }

    setIsSavingEdit(true);
    try {
      // 1. Upload ảnh đại diện nếu có
      let finalAvatarUrl: string | undefined = client.avatarUrl;
      if (isAvatarRemoved) {
        finalAvatarUrl = '';
      } else if (newAvatarFile) {
        finalAvatarUrl = await imageApi.uploadClientAvatar(newAvatarFile);
      }

      // 2. Upload các ảnh vóc dáng nếu có
      let finalFrontUrl: string | undefined = client.frontPhotoUrl;
      if (isFrontPhotoRemoved) {
        finalFrontUrl = '';
      } else if (newFrontPhotoFile) {
        finalFrontUrl = await imageApi.uploadClientBodyPhoto(newFrontPhotoFile);
      }

      let finalSideUrl: string | undefined = client.sidePhotoUrl;
      if (isSidePhotoRemoved) {
        finalSideUrl = '';
      } else if (newSidePhotoFile) {
        finalSideUrl = await imageApi.uploadClientBodyPhoto(newSidePhotoFile);
      }

      let finalBackUrl: string | undefined = client.backPhotoUrl;
      if (isBackPhotoRemoved) {
        finalBackUrl = '';
      } else if (newBackPhotoFile) {
        finalBackUrl = await imageApi.uploadClientBodyPhoto(newBackPhotoFile);
      }

      // 3. Gọi PUT /api/clients/:id
      const updatePayload: UpdateClientRequest = {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || undefined,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth || undefined,
        address: editForm.address.trim() || undefined,
        status: editForm.status,
        joinedDate: editForm.joinedDate || undefined,
        avatarUrl: finalAvatarUrl,
        frontPhotoUrl: finalFrontUrl,
        sidePhotoUrl: finalSideUrl,
        backPhotoUrl: finalBackUrl,
        height: editForm.height ? parseFloat(editForm.height) : undefined,
        initialWeight: editForm.initialWeight ? parseFloat(editForm.initialWeight) : undefined,
        targetWeight: editForm.targetWeight ? parseFloat(editForm.targetWeight) : undefined,
        fitnessGoal: editForm.fitnessGoal || undefined,
        experienceLevel: editForm.experienceLevel || undefined,
        medicalConditions: editForm.medicalConditions.trim() || undefined,
        injuries: editForm.injuries.trim() || undefined,
        emergencyContactName: editForm.emergencyContactName.trim() || undefined,
        emergencyContactPhone: editForm.emergencyContactPhone.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
      };

      const updated = await clientApi.updateClient(id, updatePayload);
      setClient(updated);

      // Reset các preview states
      cleanupPreviews();
      setNewAvatarFile(null);
      setAvatarPreview(null);
      setIsAvatarRemoved(false);
      setNewFrontPhotoFile(null);
      setFrontPhotoPreview(null);
      setIsFrontPhotoRemoved(false);
      setNewSidePhotoFile(null);
      setSidePhotoPreview(null);
      setIsSidePhotoRemoved(false);
      setNewBackPhotoFile(null);
      setBackPhotoPreview(null);
      setIsBackPhotoRemoved(false);
      setIsEditing(false);
      toast.success('Cập nhật hồ sơ học viên thành công!');
    } catch (err: unknown) {
      console.error('Lỗi cập nhật học viên:', err);
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ, vui lòng kiểm tra lại');
      toast.error(message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Xoá học viên
  const handleDeleteClient = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      if (deleteClientApp) {
        await deleteClientApp(id);
      } else {
        await clientApi.deleteClient(id);
      }
      if (fetchMySubscription) {
        await fetchMySubscription();
      }
      toast.success('Đã xoá hồ sơ học viên thành công');
      navigate('/pt/clients');
    } catch (err: unknown) {
      console.error('Lỗi xoá học viên:', err);
      toast.error('Không thể xoá hồ sơ học viên này');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  // ============================================================================
  // RENDER: LOADING STATE
  // ============================================================================
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-16 animate-pulse">
        {/* Navigation placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-9 w-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        </div>

        {/* Hero Card skeleton */}
        <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="h-24 w-24 rounded-3xl bg-slate-200 dark:bg-slate-800 shrink-0" />
            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div className="h-7 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto sm:mx-0" />
              <div className="h-4 w-40 bg-slate-200 dark:bg-slate-800 rounded mx-auto sm:mx-0" />
              <div className="h-4 w-72 bg-slate-200 dark:bg-slate-800 rounded mx-auto sm:mx-0" />
            </div>
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-5"
            />
          ))}
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: ERROR OR NOT FOUND
  // ============================================================================
  if (error || !client) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-5">
        <div className="inline-flex p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 border border-rose-200 dark:border-rose-900/50">
          <User className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Không tìm thấy hồ sơ học viên
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {error || 'Hồ sơ học viên này không tồn tại hoặc đã bị xoá khỏi hệ thống.'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={fetchClientDetail}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Tải lại trang</span>
          </button>
          <Link
            to="/pt/clients"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Về danh sách học viên</span>
          </Link>
        </div>
      </div>
    );
  }

  // Phân loại chỉ số và ảnh hiển thị
  const effectiveHeight = isEditing
    ? parseFloat(editForm.height) || undefined
    : client.height;
  const effectiveWeight = isEditing
    ? parseFloat(editForm.initialWeight) || undefined
    : client.initialWeight;
  const bmiInfo = calculateBmi(effectiveHeight, effectiveWeight);
  const clientAge = calculateAge(isEditing ? editForm.dateOfBirth : client.dateOfBirth);

  const displayAvatar = isAvatarRemoved
    ? null
    : avatarPreview !== null
    ? avatarPreview
    : client.avatarUrl;

  const displayFrontPhoto = isFrontPhotoRemoved
    ? null
    : frontPhotoPreview !== null
    ? frontPhotoPreview
    : client.frontPhotoUrl;

  const displaySidePhoto = isSidePhotoRemoved
    ? null
    : sidePhotoPreview !== null
    ? sidePhotoPreview
    : client.sidePhotoUrl;

  const displayBackPhoto = isBackPhotoRemoved
    ? null
    : backPhotoPreview !== null
    ? backPhotoPreview
    : client.backPhotoUrl;

  const statusMeta = CLIENT_STATUS_LABELS[isEditing ? editForm.status : client.status] || {
    label: isEditing ? editForm.status : client.status,
    color: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-28 animate-in fade-in duration-200">
      {/* Hidden inputs phục vụ upload ảnh */}
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/*"
        onChange={(e) => handleSelectImageFile(e, 'avatar')}
        className="hidden"
      />
      <input
        type="file"
        ref={frontInputRef}
        accept="image/*"
        onChange={(e) => handleSelectImageFile(e, 'front')}
        className="hidden"
      />
      <input
        type="file"
        ref={sideInputRef}
        accept="image/*"
        onChange={(e) => handleSelectImageFile(e, 'side')}
        className="hidden"
      />
      <input
        type="file"
        ref={backInputRef}
        accept="image/*"
        onChange={(e) => handleSelectImageFile(e, 'back')}
        className="hidden"
      />

      {/* ====================================================================
          TOP BREADCRUMB & ACTION BAR
         ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link
            to="/pt/clients"
            className="hover:text-emerald-500 transition-colors flex items-center gap-1"
          >
            Học viên
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[200px] sm:max-w-xs">
            {client.fullName}
          </span>
          {isEditing && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-[#00d68f] border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Đang chỉnh sửa
            </span>
          )}
        </nav>

        {/* Action Buttons: Chuyển đổi giữa Chế độ Xem và Chế độ Sửa trực tiếp (KHÔNG DÙNG POP-UP) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {!isEditing ? (
            <>
              <button
                type="button"
                onClick={() => {
                  fetchClientDetail();
                  fetchClientGoals();
                }}
                title="Làm mới dữ liệu từ server"
                className="p-2.5 rounded-xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
              </button>

              <Link
                to={`/pt/contracts/new?clientId=${client.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-sm hover:shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <FileSignature className="h-4 w-4" />
                <span>Tạo hợp đồng PT</span>
              </Link>

              <button
                type="button"
                onClick={handleStartEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm hover:shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Edit className="h-4 w-4" />
                <span>Sửa hồ sơ</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                title="Xoá học viên này"
                className="p-2.5 rounded-xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 dark:hover:border-rose-900 transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/pt/clients')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Quay lại</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleCancelEdit}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <X className="h-4 w-4" />
                <span>Hủy chỉnh sửa</span>
              </button>

              <button
                type="button"
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60 active:scale-95"
              >
                {isSavingEdit ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Lưu thay đổi</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ====================================================================
          HERO PROFILE CARD
         ==================================================================== */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-sm overflow-hidden">
        {/* Banner decorative top */}
        <div className="h-28 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border-b border-slate-100 dark:border-slate-800/80 relative">
          <div className="absolute top-4 right-5 flex items-center gap-2">
            {!isEditing ? (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}
              >
                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                {statusMeta.label}
              </span>
            ) : (
              <div className="flex items-center gap-1.5 bg-white/90 dark:bg-[#091322]/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 pl-2 font-medium">Trạng thái:</span>
                <select
                  value={editForm.status}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, status: e.target.value as ClientStatus }))
                  }
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-none outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Đang tập (ACTIVE)</option>
                  <option value="POTENTIAL">Tiềm năng (POTENTIAL)</option>
                  <option value="FROZEN">Bảo lưu (FROZEN)</option>
                  <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                  <option value="EXPIRED">Hết hạn (EXPIRED)</option>
                </select>
              </div>
            )}
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#091322]/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
              ID: {client.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Profile info main container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 -mt-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar Container: Chế độ xem phóng to, Chế độ sửa cho chọn ảnh mới */}
            <div className="relative group shrink-0">
              <div
                onClick={() => {
                  if (isEditing) {
                    avatarInputRef.current?.click();
                  } else if (displayAvatar) {
                    setPreviewImage({
                      url: displayAvatar,
                      title: `Ảnh đại diện - ${client.fullName}`,
                    });
                  }
                }}
                className={`relative h-28 w-28 rounded-3xl overflow-hidden border-4 border-white dark:border-[#0c1626] bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl flex items-center justify-center cursor-pointer transition-transform group-hover:scale-[1.02]`}
              >
                {displayAvatar ? (
                  <img
                    src={displayAvatar}
                    alt={client.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-white text-3xl font-bold">
                    {(editForm.fullName || client.fullName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Overlay khi hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 text-[11px] font-medium p-1 text-center">
                  {isEditing ? (
                    <>
                      <Camera className="h-6 w-6" />
                      <span>Đổi ảnh</span>
                    </>
                  ) : (
                    <>
                      <Maximize2 className="h-5 w-5" />
                      <span>Phóng to</span>
                    </>
                  )}
                </div>

                {/* Animation xoay vòng tròn khi đang tải ảnh */}
                {isSavingEdit && newAvatarFile && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20 animate-in fade-in duration-200">
                    <div className="w-10 h-10 rounded-full border-3 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Nút thao tác nhanh trên Avatar trong chế độ Sửa */}
              {isEditing && (
                <div className="absolute -bottom-2 -right-2 flex items-center gap-1">
                  <button
                    type="button"
                    title="Chọn ảnh đại diện mới"
                    onClick={() => avatarInputRef.current?.click()}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-md transition cursor-pointer"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  {displayAvatar && (
                    <button
                      type="button"
                      title="Gỡ ảnh đại diện"
                      onClick={() => {
                        if (avatarPreview?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview);
                        setNewAvatarFile(null);
                        setAvatarPreview('');
                        setIsAvatarRemoved(true);
                      }}
                      className="p-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Name, Gender, Age & Joined Date */}
            <div className="space-y-2 min-w-0 flex-1">
              {!isEditing ? (
                <>
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                      {client.fullName}
                    </h1>
                    {client.gender && (
                      <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {GENDER_LABELS[client.gender] || client.gender}
                      </span>
                    )}
                    {clientAge && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {clientAge} tuổi
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {client.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopyPhone(client.phone)}
                        className="inline-flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-pointer group"
                        title="Bấm để copy số điện thoại"
                      >
                        <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{client.phone}</span>
                        {isCopiedPhone ? (
                          <CheckCheck className="h-3 w-3 text-emerald-500" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    )}
                    {client.email && (
                      <a
                        href={`mailto:${client.email}`}
                        className="inline-flex items-center gap-1.5 hover:text-emerald-500 transition-colors"
                      >
                        <Mail className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="truncate max-w-[200px]">{client.email}</span>
                      </a>
                    )}
                    {client.joinedDate && (
                      <div className="inline-flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>Tham gia: {client.joinedDate}</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Họ và tên học viên <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Nhập họ và tên..."
                        className="w-full px-3 py-1.5 bg-white dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-base font-bold text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                      />
                      {formErrors.fullName && (
                        <p className="text-[11px] text-rose-500 mt-0.5">{formErrors.fullName}</p>
                      )}
                    </div>

                    <div className="w-full sm:w-32">
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                        Giới tính
                      </label>
                      <select
                        value={editForm.gender}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, gender: e.target.value as Gender }))
                        }
                        className="w-full px-3 py-2 bg-white dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="MALE">Nam</option>
                        <option value="FEMALE">Nữ</option>
                        <option value="OTHER">Khác</option>
                      </select>
                    </div>
                  </div>

                  {newAvatarFile && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                      <Sparkles className="h-3 w-3" />
                      Ảnh đại diện mới đã chọn (chưa lưu)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PT phụ trách */}
          <div className="flex items-center justify-center sm:justify-end gap-3 text-xs shrink-0">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#0f1d32] border border-slate-100 dark:border-slate-800/80 text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">
                Huấn Luyện Viên PT
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {client.assignedTrainerName || 'Đang phân bổ'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          ACTIVE GOAL BANNER (MỤC TIÊU THỂ HÌNH ĐANG DIỄN RA)
         ==================================================================== */}
      <ActiveGoalBanner
        goal={activeGoal}
        clientId={client.id}
        trainerId={authUser?.id || client.assignedTrainerId || 'PT'}
        currentWeight={client.initialWeight ? Number(client.initialWeight) : undefined}
        isLoading={isLoadingGoals}
        onRefreshGoals={fetchClientGoals}
      />

      {/* ====================================================================
          3 QUICK METRIC STAT CARDS
         ==================================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Chiều cao */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Chiều cao</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          {!isEditing ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {client.height ? client.height : '--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">cm</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                value={editForm.height}
                onChange={(e) => setEditForm((p) => ({ ...p, height: e.target.value }))}
                placeholder="170"
                className="w-full px-2.5 py-1 text-lg font-bold bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-400 font-medium">cm</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">Chỉ số thể trạng ban đầu</p>
        </div>

        {/* Cân nặng ban đầu */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Cân nặng ban đầu</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          {!isEditing ? (
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {client.initialWeight ? client.initialWeight : '--'}
              </span>
              <span className="text-xs text-slate-400 font-medium">kg</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                step="0.1"
                value={editForm.initialWeight}
                onChange={(e) => setEditForm((p) => ({ ...p, initialWeight: e.target.value }))}
                placeholder="65"
                className="w-full px-2.5 py-1 text-lg font-bold bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              />
              <span className="text-xs text-slate-400 font-medium">kg</span>
            </div>
          )}
          <p className="text-[11px] text-slate-400">Cân nặng lúc nhập học</p>
        </div>

        {/* Chỉ số BMI */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Chỉ số BMI</span>
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {bmiInfo ? bmiInfo.value : '--'}
            </span>
            {bmiInfo && (
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${bmiInfo.color}`}
              >
                {bmiInfo.category}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {bmiInfo ? 'Tính tự động theo chiều cao & cân nặng' : 'Cần nhập chiều cao & cân nặng'}
          </p>
        </div>
      </div>

      {/* ====================================================================
          BODY PROGRESS PHOTOS (3 GÓC ĐỘ DÁNG NGƯỜI CLOUDINARY)
         ==================================================================== */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hình Ảnh Vóc Dáng & Thể Hình (3 Góc Độ)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? 'Bấm trực tiếp vào từng ô để chọn ảnh mới từ thiết bị'
                  : 'Lưu trữ trên Cloudinary phục vụ đối chiếu tiến trình trước - sau của học viên.'}
              </p>
            </div>
          </div>
          {isEditing && (
            <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl self-start sm:self-auto font-medium">
              💡 Bấm vào ảnh để thay đổi góc chụp
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Ảnh trực diện (Front) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Góc Trực Diện (Front)
              </span>
              {isEditing && displayFrontPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    if (frontPhotoPreview?.startsWith('blob:')) URL.revokeObjectURL(frontPhotoPreview);
                    setNewFrontPhotoFile(null);
                    setFrontPhotoPreview('');
                    setIsFrontPhotoRemoved(true);
                  }}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>

            <div
              onClick={() => {
                if (isEditing) {
                  frontInputRef.current?.click();
                } else if (displayFrontPhoto) {
                  setPreviewImage({
                    url: displayFrontPhoto,
                    title: `Ảnh trực diện - ${client.fullName}`,
                  });
                }
              }}
              className={`h-64 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group bg-slate-50 dark:bg-[#091322] flex items-center justify-center cursor-pointer transition-all ${
                isEditing ? 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20' : ''
              }`}
            >
              {displayFrontPhoto ? (
                <>
                  <img
                    src={displayFrontPhoto}
                    alt="Front View"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                    {isEditing ? (
                      <>
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-semibold">Bấm để đổi ảnh</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-6 w-6" />
                        <span className="text-xs font-medium">Bấm để phóng to</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-slate-400">
                  <Camera className="h-8 w-8 mx-auto stroke-1 text-slate-400" />
                  <p className="text-xs font-medium">
                    {isEditing ? 'Bấm để chọn ảnh trực diện' : 'Chưa có ảnh trực diện'}
                  </p>
                </div>
              )}

              {newFrontPhotoFile && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-amber-500/90 text-white text-[10px] font-semibold rounded-lg text-center backdrop-blur-xs">
                  Ảnh mới chưa lưu
                </div>
              )}

              {/* Animation xoay vòng tròn khi đang tải ảnh */}
              {isSavingEdit && newFrontPhotoFile && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* 2. Ảnh nghiêng (Side) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Góc Nghiêng (Side)
              </span>
              {isEditing && displaySidePhoto && (
                <button
                  type="button"
                  onClick={() => {
                    if (sidePhotoPreview?.startsWith('blob:')) URL.revokeObjectURL(sidePhotoPreview);
                    setNewSidePhotoFile(null);
                    setSidePhotoPreview('');
                    setIsSidePhotoRemoved(true);
                  }}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>

            <div
              onClick={() => {
                if (isEditing) {
                  sideInputRef.current?.click();
                } else if (displaySidePhoto) {
                  setPreviewImage({
                    url: displaySidePhoto,
                    title: `Ảnh góc nghiêng - ${client.fullName}`,
                  });
                }
              }}
              className={`h-64 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group bg-slate-50 dark:bg-[#091322] flex items-center justify-center cursor-pointer transition-all ${
                isEditing ? 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20' : ''
              }`}
            >
              {displaySidePhoto ? (
                <>
                  <img
                    src={displaySidePhoto}
                    alt="Side View"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                    {isEditing ? (
                      <>
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-semibold">Bấm để đổi ảnh</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-6 w-6" />
                        <span className="text-xs font-medium">Bấm để phóng to</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-slate-400">
                  <Camera className="h-8 w-8 mx-auto stroke-1 text-slate-400" />
                  <p className="text-xs font-medium">
                    {isEditing ? 'Bấm để chọn ảnh góc nghiêng' : 'Chưa có ảnh góc nghiêng'}
                  </p>
                </div>
              )}

              {newSidePhotoFile && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-amber-500/90 text-white text-[10px] font-semibold rounded-lg text-center backdrop-blur-xs">
                  Ảnh mới chưa lưu
                </div>
              )}

              {/* Animation xoay vòng tròn khi đang tải ảnh */}
              {isSavingEdit && newSidePhotoFile && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* 3. Ảnh phía sau (Back) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Góc Phía Sau (Back)
              </span>
              {isEditing && displayBackPhoto && (
                <button
                  type="button"
                  onClick={() => {
                    if (backPhotoPreview?.startsWith('blob:')) URL.revokeObjectURL(backPhotoPreview);
                    setNewBackPhotoFile(null);
                    setBackPhotoPreview('');
                    setIsBackPhotoRemoved(true);
                  }}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Gỡ ảnh
                </button>
              )}
            </div>

            <div
              onClick={() => {
                if (isEditing) {
                  backInputRef.current?.click();
                } else if (displayBackPhoto) {
                  setPreviewImage({
                    url: displayBackPhoto,
                    title: `Ảnh phía sau - ${client.fullName}`,
                  });
                }
              }}
              className={`h-64 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group bg-slate-50 dark:bg-[#091322] flex items-center justify-center cursor-pointer transition-all ${
                isEditing ? 'hover:border-emerald-500 hover:ring-2 hover:ring-emerald-500/20' : ''
              }`}
            >
              {displayBackPhoto ? (
                <>
                  <img
                    src={displayBackPhoto}
                    alt="Back View"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                    {isEditing ? (
                      <>
                        <Camera className="h-6 w-6" />
                        <span className="text-xs font-semibold">Bấm để đổi ảnh</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="h-6 w-6" />
                        <span className="text-xs font-medium">Bấm để phóng to</span>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-slate-400">
                  <Camera className="h-8 w-8 mx-auto stroke-1 text-slate-400" />
                  <p className="text-xs font-medium">
                    {isEditing ? 'Bấm để chọn ảnh phía sau' : 'Chưa có ảnh phía sau'}
                  </p>
                </div>
              )}

              {newBackPhotoFile && (
                <div className="absolute bottom-2 left-2 right-2 px-2 py-1 bg-amber-500/90 text-white text-[10px] font-semibold rounded-lg text-center backdrop-blur-xs">
                  Ảnh mới chưa lưu
                </div>
              )}

              {/* Animation xoay vòng tròn khi đang tải ảnh */}
              {isSavingEdit && newBackPhotoFile && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-20 animate-in fade-in duration-200">
                  <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TWO-COLUMN DETAILED INFORMATION (INLINE FORM KHI SỬA)
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & LIÊN HỆ */}
        <div className="space-y-6">
          {/* Card: Thông tin cá nhân & Liên hệ */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-emerald-500" />
                <span>Hồ Sơ Cá Nhân & Liên Hệ</span>
              </div>
              {isEditing && (
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md">
                  Chỉnh sửa trực tiếp
                </span>
              )}
            </h3>

            {!isEditing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Họ và tên:</span>
                  <span className="text-slate-900 dark:text-white font-semibold text-sm mt-0.5 block">
                    {client.fullName}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Số điện thoại:</span>
                  <span className="text-slate-900 dark:text-white font-semibold text-sm mt-0.5 block">
                    {client.phone}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Email:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block truncate">
                    {client.email || 'Chưa cập nhật'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Giới tính:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">
                    {client.gender ? GENDER_LABELS[client.gender] : 'Chưa cập nhật'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Ngày sinh:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">
                    {client.dateOfBirth
                      ? `${client.dateOfBirth} (${clientAge ? `${clientAge} tuổi` : ''})`
                      : 'Chưa cập nhật'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Ngày tham gia ZenFit:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block">
                    {client.joinedDate || 'Chưa cập nhật'}
                  </span>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-medium">Địa chỉ cư trú:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 block flex items-start gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{client.address || 'Chưa cập nhật địa chỉ'}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                  {formErrors.fullName && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="VD: 0912345678"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-rose-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    placeholder="example@gmail.com"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Ngày tham gia
                  </label>
                  <input
                    type="date"
                    value={editForm.joinedDate}
                    onChange={(e) => setEditForm((p) => ({ ...p, joinedDate: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Trạng thái học viên
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, status: e.target.value as ClientStatus }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="ACTIVE">Đang tập (ACTIVE)</option>
                    <option value="POTENTIAL">Tiềm năng (POTENTIAL)</option>
                    <option value="FROZEN">Bảo lưu (FROZEN)</option>
                    <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                    <option value="EXPIRED">Hết hạn (EXPIRED)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Địa chỉ cư trú
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Nhập địa chỉ cư trú..."
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CỘT PHẢI: MỤC TIÊU, HỢP ĐỒNG & GHI CHÚ */}
        <div className="space-y-6">
          {/* Card: Mục tiêu thể hình */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Target className="h-4 w-4 text-emerald-500" />
              <span>Kế Hoạch & Mục Tiêu Thể Hình</span>
            </h3>

            {!isEditing ? (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                      Cân nặng ban đầu
                    </span>
                    <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                      {client.initialWeight ? `${client.initialWeight} kg` : 'Chưa đo'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-center">
                    <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-medium">
                      Cân nặng mục tiêu
                    </span>
                    <span className="text-xl font-bold text-teal-600 dark:text-teal-400 mt-1 block">
                      {activeGoal?.targetWeight
                        ? `${activeGoal.targetWeight} kg`
                        : client.targetWeight
                          ? `${client.targetWeight} kg`
                          : 'Chưa đặt'}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Định hướng mục tiêu chính:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold text-sm mt-0.5 block">
                    {client.fitnessGoal
                      ? FITNESS_GOAL_LABELS[client.fitnessGoal] || client.fitnessGoal
                      : 'Chưa cập nhật'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-medium">Cấp độ kinh nghiệm tập:</span>
                  <span className="text-slate-800 dark:text-slate-200 font-semibold mt-0.5 block">
                    {client.experienceLevel
                      ? EXPERIENCE_LEVEL_LABELS[client.experienceLevel] || client.experienceLevel
                      : 'Chưa cập nhật'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                      Cân nặng ban đầu (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.initialWeight}
                      onChange={(e) => setEditForm((p) => ({ ...p, initialWeight: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                      Cân nặng mục tiêu (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editForm.targetWeight}
                      onChange={(e) => setEditForm((p) => ({ ...p, targetWeight: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Định hướng mục tiêu chính
                  </label>
                  <select
                    value={editForm.fitnessGoal}
                    onChange={(e) => setEditForm((p) => ({ ...p, fitnessGoal: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">-- Chưa chọn --</option>
                    <option value="GIAM_CAN">Giảm mỡ / Giảm cân</option>
                    <option value="TANG_CO">Tăng cơ / Định hình vóc dáng</option>
                    <option value="BULKING">Bulking (Xả cơ / Tăng cân)</option>
                    <option value="CUTTING">Cutting (Siết cơ)</option>
                    <option value="HEALTH">Cải thiện sức khỏe chung</option>
                    <option value="MAINTAIN">Duy trì thể lực</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-500 dark:text-slate-400 block font-semibold mb-1">
                    Cấp độ kinh nghiệm tập
                  </label>
                  <select
                    value={editForm.experienceLevel}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, experienceLevel: e.target.value }))
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-[#091322] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                  >
                    <option value="">-- Chưa chọn --</option>
                    <option value="BEGINNER">Mới bắt đầu (Chưa từng tập gym)</option>
                    <option value="INTERMEDIATE">Đã có kinh nghiệm (Dưới 1 năm)</option>
                    <option value="ADVANCED">Nâng cao / Tập luyện lâu năm</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Card: Hành động nhanh (Quick Actions) */}
         
        </div>
      </div>

      {/* ====================================================================
          CLIENT GOALS TIMELINE & HISTORY (LỘ TRÌNH & MỤC TIÊU THEO GIAI ĐOẠN)
         ==================================================================== */}
      <ClientGoalsTimeline
        goals={clientGoals}
        clientId={client.id}
        trainerId={authUser?.id || client.assignedTrainerId || 'PT'}
        currentWeight={client.initialWeight ? Number(client.initialWeight) : undefined}
        isLoading={isLoadingGoals}
        onRefreshGoals={fetchClientGoals}
      />

      {/* ====================================================================
          CLIENT NUTRITION PLAN & MEALS (KẾ HOẠCH DINH DƯỠNG & THỰC ĐƠN HỌC VIÊN)
         ==================================================================== */}
      <ClientNutritionSection clientId={client.id} clientName={client.fullName} />

      {/* ====================================================================
          FLOATING STICKY ACTION BAR KHI ĐANG Ở CHẾ ĐỘ SỬA
         ==================================================================== */}
      {isEditing && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-[#0c1626]/95 backdrop-blur-md border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl px-6 py-3.5 flex items-center gap-4 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <div className="text-xs truncate">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                Chỉnh sửa hồ sơ {client.fullName}
              </p>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Nhấn Lưu để cập nhật thông tin và hình ảnh mới
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={handleCancelEdit}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              disabled={isSavingEdit}
              onClick={handleSaveEdit}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ====================================================================
          LIGHTBOX MODAL XEM ẢNH LỚN
         ==================================================================== */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] bg-[#0c1626] rounded-3xl border border-slate-700 overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-white truncate">
                {previewImage.title}
              </span>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-black/50 overflow-auto">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-[75vh] w-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL XÁC NHẬN XOÁ HỌC VIÊN
         ==================================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-500">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Xác nhận xoá học viên?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Bạn có chắc chắn muốn xoá học viên{' '}
              <strong className="text-slate-900 dark:text-white">"{client.fullName}"</strong>? Toàn
              bộ thông tin hồ sơ và ảnh dáng người sẽ bị xoá khỏi danh sách.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteClient}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Đang xoá...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    <span>Xoá ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
