import { useState, useEffect, useCallback } from 'react';
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
  Clock,
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
import type { ClientResponse, Gender, ClientStatus } from '../../types/client.types';
import {
  CLIENT_STATUS_LABELS,
  GENDER_LABELS,
  FITNESS_GOAL_LABELS,
  EXPERIENCE_LEVEL_LABELS,
} from '../../types/client.types';

export default function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<ClientResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopiedPhone, setIsCopiedPhone] = useState(false);

  // Lightbox xem ảnh lớn
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  // Modal chỉnh sửa nhanh thông tin
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    fullName: string;
    phone: string;
    email: string;
    gender: Gender;
    dateOfBirth: string;
    address: string;
    status: ClientStatus;
    height: string;
    initialWeight: string;
    targetWeight: string;
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
    height: '',
    initialWeight: '',
    targetWeight: '',
    medicalConditions: '',
    injuries: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    notes: '',
  });

  // Modal xác nhận xoá
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        height: data.height ? String(data.height) : '',
        initialWeight: data.initialWeight ? String(data.initialWeight) : '',
        targetWeight: data.targetWeight ? String(data.targetWeight) : '',
        medicalConditions: data.medicalConditions || '',
        injuries: data.injuries || '',
        emergencyContactName: data.emergencyContactName || '',
        emergencyContactPhone: data.emergencyContactPhone || '',
        notes: data.notes || '',
      });
    } catch (err: unknown) {
      console.error('Lỗi khi tải chi tiết khách hàng:', err);
      const message =
        err instanceof Error ? err.message : 'Không thể tải thông tin hồ sơ khách hàng';
      setError(message);
      toast.error('Không tìm thấy hoặc có lỗi khi tải hồ sơ khách hàng');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchClientDetail();
  }, [fetchClientDetail]);

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

  // Submit cập nhật hồ sơ
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !client) return;

    if (!editForm.fullName.trim()) {
      toast.error('Họ và tên không được để trống');
      return;
    }
    if (!editForm.phone.trim()) {
      toast.error('Số điện thoại không được để trống');
      return;
    }

    setIsSavingEdit(true);
    try {
      const updated = await clientApi.updateClient(id, {
        fullName: editForm.fullName.trim(),
        phone: editForm.phone.trim(),
        email: editForm.email.trim() || undefined,
        gender: editForm.gender,
        dateOfBirth: editForm.dateOfBirth || undefined,
        address: editForm.address.trim() || undefined,
        status: editForm.status,
        height: editForm.height ? parseFloat(editForm.height) : undefined,
        initialWeight: editForm.initialWeight ? parseFloat(editForm.initialWeight) : undefined,
        targetWeight: editForm.targetWeight ? parseFloat(editForm.targetWeight) : undefined,
        medicalConditions: editForm.medicalConditions.trim() || undefined,
        injuries: editForm.injuries.trim() || undefined,
        emergencyContactName: editForm.emergencyContactName.trim() || undefined,
        emergencyContactPhone: editForm.emergencyContactPhone.trim() || undefined,
        notes: editForm.notes.trim() || undefined,
      });

      setClient(updated);
      setIsEditModalOpen(false);
      toast.success('Cập nhật hồ sơ học viên thành công!');
    } catch (err: unknown) {
      console.error('Lỗi cập nhật học viên:', err);
      toast.error('Không thể cập nhật hồ sơ, vui lòng kiểm tra lại');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Xoá học viên
  const handleDeleteClient = async () => {
    if (!id) return;
    setIsDeleting(true);
    try {
      await clientApi.deleteClient(id);
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

  const bmiInfo = calculateBmi(client.height, client.initialWeight);
  const clientAge = calculateAge(client.dateOfBirth);
  const statusMeta = CLIENT_STATUS_LABELS[client.status] || {
    label: client.status,
    color: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
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
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={fetchClientDetail}
            title="Làm mới dữ liệu từ server"
            className="p-2.5 rounded-xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:border-emerald-500/40 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <Link
            to="/pt/contracts/new"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold shadow-sm hover:shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <FileSignature className="h-4 w-4" />
            <span>Tạo hợp đồng PT</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] hover:border-emerald-500/40 text-slate-700 dark:text-slate-200 text-xs font-semibold shadow-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Edit className="h-4 w-4 text-emerald-500" />
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
        </div>
      </div>

      {/* ====================================================================
          HERO PROFILE CARD
         ==================================================================== */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-sm overflow-hidden">
        {/* Banner decorative top */}
        <div className="h-28 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-transparent border-b border-slate-100 dark:border-slate-800/80 relative">
          <div className="absolute top-4 right-5 flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusMeta.color}`}
            >
              <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
              {statusMeta.label}
            </span>
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/80 dark:bg-[#091322]/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800">
              ID: {client.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* Profile info main container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 -mt-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
            {/* Avatar with click to zoom */}
            <div
              onClick={() => {
                if (client.avatarUrl) {
                  setPreviewImage({ url: client.avatarUrl, title: `Ảnh đại diện - ${client.fullName}` });
                }
              }}
              className={`relative h-28 w-28 rounded-3xl overflow-hidden border-4 border-white dark:border-[#0c1626] bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-xl shrink-0 group ${
                client.avatarUrl ? 'cursor-pointer' : ''
              }`}
            >
              {client.avatarUrl ? (
                <>
                  <img
                    src={client.avatarUrl}
                    alt={client.fullName}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="h-5 w-5" />
                  </div>
                </>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-3xl font-bold">
                  {client.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Name, Gender, Age & Joined Date */}
            <div className="space-y-1.5 min-w-0">
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

              {/* Sub contact inline */}
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
            </div>
          </div>

          {/* Quick PT status pill */}
          <div className="flex items-center justify-center sm:justify-end gap-3 text-xs">
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
          4 QUICK METRIC STAT CARDS
         ==================================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Chiều cao */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Chiều cao</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {client.height ? client.height : '--'}
            </span>
            <span className="text-xs text-slate-400 font-medium">cm</span>
          </div>
          <p className="text-[11px] text-slate-400">Chỉ số thể trạng ban đầu</p>
        </div>

        {/* Cân nặng */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Cân nặng ban đầu</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-500">
              <Activity className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {client.initialWeight ? client.initialWeight : '--'}
            </span>
            <span className="text-xs text-slate-400 font-medium">kg</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {client.targetWeight ? `Mục tiêu: ${client.targetWeight} kg` : 'Chưa đặt cân nặng đích'}
          </p>
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
            {bmiInfo ? 'Tính theo chiều cao & cân nặng' : 'Cần đủ chiều cao & cân nặng'}
          </p>
        </div>

        {/* Mục tiêu tập luyện */}
        <div className="p-5 rounded-2xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Mục tiêu chính</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Target className="h-4 w-4" />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {client.fitnessGoal
              ? FITNESS_GOAL_LABELS[client.fitnessGoal] || client.fitnessGoal
              : 'Duy trì thể lực'}
          </div>
          <p className="text-[11px] text-slate-400 truncate">
            {client.experienceLevel
              ? EXPERIENCE_LEVEL_LABELS[client.experienceLevel] || client.experienceLevel
              : 'Chưa cập nhật cấp độ'}
          </p>
        </div>
      </div>

      {/* ====================================================================
          BODY PROGRESS PHOTOS (3 GÓC ĐỘ DÁNG NGƯỜI CLOUDINARY)
         ==================================================================== */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Camera className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Hình Ảnh Vóc Dáng & Thể Hình (3 Góc Độ)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Hình ảnh lưu trữ trên Cloudinary phục vụ đối chiếu tiến trình trước - sau của học viên.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 1. Ảnh trực diện (Front) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Góc Trực Diện (Front)
            </span>
            <div
              onClick={() => {
                if (client.frontPhotoUrl) {
                  setPreviewImage({
                    url: client.frontPhotoUrl,
                    title: `Ảnh trực diện - ${client.fullName}`,
                  });
                }
              }}
              className={`h-64 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group bg-slate-50 dark:bg-[#091322] flex items-center justify-center ${
                client.frontPhotoUrl ? 'cursor-pointer' : ''
              }`}
            >
              {client.frontPhotoUrl ? (
                <>
                  <img
                    src={client.frontPhotoUrl}
                    alt="Front View"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                    <Maximize2 className="h-6 w-6" />
                    <span className="text-xs font-medium">Bấm để phóng to</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-slate-400">
                  <Camera className="h-8 w-8 mx-auto stroke-1" />
                  <p className="text-xs font-medium">Chưa có ảnh trực diện</p>
                </div>
              )}
            </div>
          </div>

          {/* 2. Ảnh nghiêng (Side) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Góc Nghiêng (Side)
            </span>
            <div
              onClick={() => {
                if (client.sidePhotoUrl) {
                  setPreviewImage({
                    url: client.sidePhotoUrl,
                    title: `Ảnh góc nghiêng - ${client.fullName}`,
                  });
                }
              }}
              className={`h-64 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group bg-slate-50 dark:bg-[#091322] flex items-center justify-center ${
                client.sidePhotoUrl ? 'cursor-pointer' : ''
              }`}
            >
              {client.sidePhotoUrl ? (
                <>
                  <img
                    src={client.sidePhotoUrl}
                    alt="Side View"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                    <Maximize2 className="h-6 w-6" />
                    <span className="text-xs font-medium">Bấm để phóng to</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-slate-400">
                  <Camera className="h-8 w-8 mx-auto stroke-1" />
                  <p className="text-xs font-medium">Chưa có ảnh góc nghiêng</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Ảnh phía sau (Back) */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Góc Phía Sau (Back)
            </span>
            <div
              onClick={() => {
                if (client.backPhotoUrl) {
                  setPreviewImage({
                    url: client.backPhotoUrl,
                    title: `Ảnh phía sau - ${client.fullName}`,
                  });
                }
              }}
              className={`h-64 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group bg-slate-50 dark:bg-[#091322] flex items-center justify-center ${
                client.backPhotoUrl ? 'cursor-pointer' : ''
              }`}
            >
              {client.backPhotoUrl ? (
                <>
                  <img
                    src={client.backPhotoUrl}
                    alt="Back View"
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                    <Maximize2 className="h-6 w-6" />
                    <span className="text-xs font-medium">Bấm để phóng to</span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 space-y-2 text-slate-400">
                  <Camera className="h-8 w-8 mx-auto stroke-1" />
                  <p className="text-xs font-medium">Chưa có ảnh phía sau</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================
          TWO-COLUMN DETAILED INFORMATION
         ==================================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CỘT TRÁI: THÔNG TIN CÁ NHÂN & SỨC KHỎE */}
        <div className="space-y-6">
          {/* Card: Thông tin cá nhân & Liên hệ */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <User className="h-4 w-4 text-emerald-500" />
              <span>Hồ Sơ Cá Nhân & Liên Hệ</span>
            </h3>

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
                  {client.dateOfBirth ? `${client.dateOfBirth} (${clientAge} tuổi)` : 'Chưa cập nhật'}
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
          </div>

          {/* Card: Sức khỏe & An toàn tập luyện */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <Activity className="h-4 w-4 text-rose-500" />
              <span>Sức Khỏe & An Toàn Tập Luyện</span>
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#091322] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Bệnh lý nền cần lưu ý:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {client.medicalConditions || 'Không có bệnh lý nền được ghi nhận'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#091322] border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block font-medium">Tiền sử chấn thương & cơ xương khớp:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-1">
                  {client.injuries || 'Không có tiền sử chấn thương'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091322] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">Người liên hệ khẩn cấp:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {client.emergencyContactName || 'Chưa cung cấp'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#091322] border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block font-medium">SĐT liên hệ khẩn cấp:</span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {client.emergencyContactPhone || 'Chưa cung cấp'}
                  </p>
                </div>
              </div>
            </div>
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
                    {client.targetWeight ? `${client.targetWeight} kg` : 'Chưa đặt'}
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
          </div>

          {/* Card: Ghi chú của Huấn Luyện Viên */}
          <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-500" />
                <span>Ghi Chú Của Huấn Luyện Viên</span>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium cursor-pointer"
              >
                Cập nhật ghi chú
              </button>
            </h3>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#091322] border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed min-h-[100px]">
              {client.notes ? (
                client.notes
              ) : (
                <span className="text-slate-400 italic">
                  Chưa có ghi chú đặc biệt cho học viên này. Bạn có thể bấm "Sửa hồ sơ" để bổ sung lưu ý tập luyện, chế độ dinh dưỡng hoặc dặn dò riêng.
                </span>
              )}
            </div>
          </div>

          {/* Card: Hành động nhanh (Quick Actions) */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span>Hành Động Huấn Luyện</span>
            </h3>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Bạn có thể ký hợp đồng huấn luyện mới hoặc lên lịch tập luyện cho học viên này trực tiếp trên hệ thống ZenFit.
            </p>

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <Link
                to="/pt/contracts/new"
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <FileSignature className="h-4 w-4" />
                <span>Lập Hợp Đồng PT Mới</span>
              </Link>
              <Link
                to="/pt/schedule"
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Calendar className="h-4 w-4" />
                <span>Lên lịch tập</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
          MODAL CHỈNH SỬA HỒ SƠ HỌC VIÊN
         ==================================================================== */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-[#0f1d32]/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Edit className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chỉnh Sửa Hồ Sơ Học Viên
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 overflow-y-auto space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Số điện thoại <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Giới tính</label>
                  <select
                    value={editForm.gender}
                    onChange={(e) => setEditForm((p) => ({ ...p, gender: e.target.value as Gender }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Ngày sinh</label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái học viên
                  </label>
                  <select
                    value={editForm.status}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, status: e.target.value as ClientStatus }))
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  >
                    <option value="ACTIVE">Đang tập (ACTIVE)</option>
                    <option value="POTENTIAL">Tiềm năng (POTENTIAL)</option>
                    <option value="FROZEN">Bảo lưu (FROZEN)</option>
                    <option value="INACTIVE">Tạm ngưng (INACTIVE)</option>
                    <option value="EXPIRED">Hết hạn (EXPIRED)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.height}
                    onChange={(e) => setEditForm((p) => ({ ...p, height: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Cân nặng ban đầu (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.initialWeight}
                    onChange={(e) => setEditForm((p) => ({ ...p, initialWeight: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Địa chỉ cư trú
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Bệnh lý nền cần lưu ý
                  </label>
                  <input
                    type="text"
                    value={editForm.medicalConditions}
                    onChange={(e) => setEditForm((p) => ({ ...p, medicalConditions: e.target.value }))}
                    placeholder="Ví dụ: Tim mạch nhẹ, huyết áp, thoái hóa..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Tiền sử chấn thương
                  </label>
                  <input
                    type="text"
                    value={editForm.injuries}
                    onChange={(e) => setEditForm((p) => ({ ...p, injuries: e.target.value }))}
                    placeholder="Ví dụ: Đau khớp gối khi squat nặng..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú của PT
                  </label>
                  <textarea
                    rows={3}
                    value={editForm.notes}
                    onChange={(e) => setEditForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#091322] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-60"
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
              </div>
            </form>
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
