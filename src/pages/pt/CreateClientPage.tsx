import { useState, useRef, useEffect, useId } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2,
  Search,
  Check,
  DollarSign,
  Clock,
  ChevronRight,
  ShieldCheck,
  UserPlus,
  FileSignature,
  Info,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadClientAvatar, uploadClientBodyPhoto } from '../../api/imageApi';
import { clientApi } from '../../api/clientApi';
import { contractApi } from '../../api/contractApi';
import { formatUploadErrorMessage } from '../../services/imageService';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import type {
  ClientResponse,
  ClientStatus,
  ContractStatus,
  CreateClientRequest,
  CreatePtContractRequest,
  Gender,
} from '../../types/client.types';
import {
  CLIENT_STATUS_LABELS,
  CONTRACT_STATUS_LABELS,
  GOAL_TYPE_LABELS,
  GENDER_LABELS,
} from '../../types/client.types';

// Tab chế độ tạo
type CreationMode = 'CLIENT_ONLY' | 'CONTRACT_WITH_CLIENT';
// Phương thức chọn khách trong Hợp đồng
type ClientSelectionType = 'EXISTING' | 'NEW';

export default function CreateClientPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const { addClient, mySubscription, fetchMySubscription } = useApp();

  // Tải thông tin gói đăng ký và hạn mức học viên
  useEffect(() => {
    fetchMySubscription();
  }, [fetchMySubscription]);

  const maxStudents = mySubscription?.maxStudents ?? 5;
  const currentStudents = mySubscription?.currentStudents ?? 0;
  const isQuotaFull = currentStudents >= maxStudents;

  // Phân biệt chế độ tạo theo route URL:
  // - Khi truy cập /pt/contracts/*: Chuyên biệt Tạo hợp đồng PT (CONTRACT_WITH_CLIENT)
  // - Khi truy cập /pt/clients/*: Chuyên biệt Thêm học viên mới (CLIENT_ONLY) - Tuyệt đối không có hợp đồng
  const isContractRoute = location.pathname.includes('/contracts');
  const creationMode: CreationMode = isContractRoute ? 'CONTRACT_WITH_CLIENT' : 'CLIENT_ONLY';

  // Trong tab hợp đồng: Chọn khách cũ HOẶC Tạo học viên mới đồng thời
  const [clientSelection, setClientSelection] = useState<ClientSelectionType>('NEW');

  // PT phụ trách: Lấy ID từ tài khoản đang đăng nhập
  const trainerId = authUser?.id || '';
  const trainerName = authUser?.name || authUser?.username || 'Huấn luyện viên PT';

  // ============================================================================
  // FORM STATE: THÔNG TIN KHÁCH HÀNG (ClientEntity)
  // ============================================================================
  const [clientForm, setClientForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    gender: 'MALE' as Gender,
    dateOfBirth: '',
    address: '',
    height: '',
    initialWeight: '',
    status: 'ACTIVE' as ClientStatus,
    notes: '',
    joinedDate: new Date().toISOString().split('T')[0],
  });

  // ============================================================================
  // FORM STATE: MỤC TIÊU TẬP LUYỆN (ClientGoalEntity)
  // ============================================================================
  const [goalForm, setGoalForm] = useState({
    goalType: 'GIAM_CAN',
    startWeight: '',
    targetWeight: '',
    goalNote: '',
  });

  // ============================================================================
  // FORM STATE: THÔNG TIN HỢP ĐỒNG (PtContractEntity)
  // ============================================================================
  const [contractForm, setContractForm] = useState({
    totalSessions: '12',
    bonusSessions: '0',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    price: '3600000',
    paidAmount: '3600000',
    status: 'ACTIVE' as ContractStatus,
    notes: '',
  });

  // ============================================================================
  // STATE: TÌM KIẾM KHÁCH HÀNG ĐÃ CÓ (Search Debounce)
  // ============================================================================
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<ClientResponse[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedExistingClient, setSelectedExistingClient] = useState<ClientResponse | null>(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // ============================================================================
  // STATE: QUẢN LÝ ẢNH UPLOAD LÊN CLOUDINARY (Avatar + 3 Góc Chụp Dáng Người)
  // ============================================================================
  interface ImageSlot {
    file: File | null;
    previewUrl: string | null;
  }

  const [avatarSlot, setAvatarSlot] = useState<ImageSlot>({ file: null, previewUrl: null });
  const [frontPhotoSlot, setFrontPhotoSlot] = useState<ImageSlot>({ file: null, previewUrl: null });
  const [backPhotoSlot, setBackPhotoSlot] = useState<ImageSlot>({ file: null, previewUrl: null });
  const [sidePhotoSlot, setSidePhotoSlot] = useState<ImageSlot>({ file: null, previewUrl: null });

  // Refs cho các input file ẩn
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const frontPhotoInputRef = useRef<HTMLInputElement>(null);
  const backPhotoInputRef = useRef<HTMLInputElement>(null);
  const sidePhotoInputRef = useRef<HTMLInputElement>(null);

  // Trạng thái Drag & Drop
  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);

  // Loading & Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // IDs hỗ trợ accessibility
  const searchInputId = useId();

  // Dọn dẹp URL Object khi unmount
  useEffect(() => {
    return () => {
      [avatarSlot, frontPhotoSlot, backPhotoSlot, sidePhotoSlot].forEach((slot) => {
        if (slot.previewUrl && slot.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(slot.previewUrl);
        }
      });
    };
  }, [avatarSlot, frontPhotoSlot, backPhotoSlot, sidePhotoSlot]);

  // Click bên ngoài đóng search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tự động tính ngày kết thúc dự kiến theo số buổi (ví dụ: 3 buổi/tuần)
  useEffect(() => {
    if (contractForm.startDate && contractForm.totalSessions && !contractForm.endDate) {
      const total = (parseInt(contractForm.totalSessions, 10) || 0) + (parseInt(contractForm.bonusSessions, 10) || 0);
      if (total > 0) {
        const weeks = Math.ceil(total / 3); // Giả định trung bình 3 buổi/tuần
        const start = new Date(contractForm.startDate);
        start.setDate(start.getDate() + weeks * 7);
        setContractForm((prev) => ({
          ...prev,
          endDate: start.toISOString().split('T')[0],
        }));
      }
    }
  }, [contractForm.startDate, contractForm.totalSessions, contractForm.bonusSessions, contractForm.endDate]);

  // Đồng bộ cân nặng khởi điểm vào cân nặng bắt đầu mục tiêu
  useEffect(() => {
    if (clientForm.initialWeight && !goalForm.startWeight) {
      setGoalForm((prev) => ({ ...prev, startWeight: clientForm.initialWeight }));
    }
  }, [clientForm.initialWeight, goalForm.startWeight]);

  // ============================================================================
  // SEARCH DEBOUNCE EFFECT: GET /api/clients/search?keyword=...
  // ============================================================================
  useEffect(() => {
    if (!searchKeyword.trim() || clientSelection !== 'EXISTING') {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const results = await clientApi.searchClients(searchKeyword.trim());
        setSearchResults(results);
        setShowSearchDropdown(true);
      } catch (err) {
        console.error('Lỗi tìm kiếm học viên:', err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchKeyword, clientSelection]);

  // ============================================================================
  // XỬ LÝ CHỌN VÀ THAY ĐỔI ẢNH (AVATAR & 3 GÓC DÁNG NGƯỜI)
  // ============================================================================
  const handleSlotFileChange = (
    file: File | undefined,
    setSlot: React.Dispatch<React.SetStateAction<ImageSlot>>,
    slotName: string
  ) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`Ảnh ${slotName} vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.`);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error(`Ảnh ${slotName} phải là file hình ảnh hợp lệ (PNG, JPG, WEBP).`);
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

  const handleRemoveSlot = (
    setSlot: React.Dispatch<React.SetStateAction<ImageSlot>>,
    inputRef: React.RefObject<HTMLInputElement | null>
  ) => {
    setSlot((prev) => {
      if (prev.previewUrl && prev.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return { file: null, previewUrl: null };
    });
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // ============================================================================
  // XỬ LÝ FORM INPUT CHANGE
  // ============================================================================
  const handleClientInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setClientForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleGoalInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setGoalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleContractInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setContractForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Chọn khách hàng từ kết quả tìm kiếm
  const handleSelectClient = (client: ClientResponse) => {
    setSelectedExistingClient(client);
    setShowSearchDropdown(false);
    setSearchKeyword('');
    if (fieldErrors.clientId) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.clientId;
        return next;
      });
    }
    toast.success(`Đã chọn học viên: ${client.fullName}`);
  };

  // Huỷ chọn khách hàng đã có
  const handleClearSelectedClient = () => {
    setSelectedExistingClient(null);
  };

  // ============================================================================
  // VALIDATION FORM
  // ============================================================================
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // 1. Nếu ở chế độ Tạo khách hàng độc lập HOẶC Tạo hợp đồng có "Tạo học viên mới":
    const isCreatingNewClient =
      creationMode === 'CLIENT_ONLY' ||
      (creationMode === 'CONTRACT_WITH_CLIENT' && clientSelection === 'NEW');

    if (isCreatingNewClient) {
      if (!clientForm.fullName.trim()) {
        errors.fullName = 'Họ và tên học viên là bắt buộc';
      }

      if (!clientForm.phone.trim()) {
        errors.phone = 'Số điện thoại là bắt buộc';
      } else {
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
        if (!phoneRegex.test(clientForm.phone.replace(/\s+/g, ''))) {
          errors.phone = 'Số điện thoại không đúng định dạng (Ví dụ: 0912345678)';
        }
      }

      if (clientForm.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(clientForm.email.trim())) {
          errors.email = 'Email không đúng định dạng (Ví dụ: hocvien@gmail.com)';
        }
      }

      if (clientForm.height && (isNaN(Number(clientForm.height)) || Number(clientForm.height) <= 0)) {
        errors.height = 'Chiều cao phải là số dương (cm)';
      }

      if (
        clientForm.initialWeight &&
        (isNaN(Number(clientForm.initialWeight)) || Number(clientForm.initialWeight) <= 0)
      ) {
        errors.initialWeight = 'Cân nặng khởi điểm phải là số dương (kg)';
      }
    }

    // 2. Nếu ở chế độ Tạo hợp đồng PT:
    if (creationMode === 'CONTRACT_WITH_CLIENT') {
      if (clientSelection === 'EXISTING' && !selectedExistingClient) {
        errors.clientId = 'Vui lòng tìm và chọn học viên đã có hoặc chuyển sang tạo mới';
      }

      const totalSessionsNum = parseInt(contractForm.totalSessions, 10);
      if (isNaN(totalSessionsNum) || totalSessionsNum <= 0) {
        errors.totalSessions = 'Số buổi tập chính phải lớn hơn 0';
      }

      const priceNum = parseFloat(contractForm.price);
      if (isNaN(priceNum) || priceNum < 0) {
        errors.price = 'Giá trị hợp đồng không hợp lệ';
      }

      if (!contractForm.startDate) {
        errors.startDate = 'Vui lòng chọn ngày bắt đầu hợp đồng';
      }
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      toast.error(firstError || 'Vui lòng kiểm tra lại các trường bắt buộc');
      return false;
    }
    return true;
  };

  // ============================================================================
  // SUBMIT FORM VỚI CLOUDINARY SIGNED UPLOAD & BACKEND INTEGRATION
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // ------------------------------------------------------------------------
      // BƯỚC 1: UPLOAD ẢNH LÊN CLOUDINARY QUA SIGNATURE NẾU CÓ CHỌN FILE
      // ------------------------------------------------------------------------
      let uploadedAvatarUrl: string | undefined = undefined;
      let uploadedFrontPhotoUrl: string | undefined = undefined;
      let uploadedBackPhotoUrl: string | undefined = undefined;
      let uploadedSidePhotoUrl: string | undefined = undefined;

      // 1.1 Upload Avatar
      if (avatarSlot.file) {
        setSubmitStep('Đang tải ảnh đại diện...');
        try {
          uploadedAvatarUrl = await uploadClientAvatar(avatarSlot.file);
        } catch (uploadErr) {
          const errMsg = formatUploadErrorMessage(uploadErr);
          toast.error(`Lỗi tải ảnh đại diện: ${errMsg}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      // 1.2 Upload Ảnh Mặt trước
      if (frontPhotoSlot.file) {
        setSubmitStep('Đang tải ảnh vóc dáng mặt trước...');
        try {
          uploadedFrontPhotoUrl = await uploadClientBodyPhoto(frontPhotoSlot.file);
        } catch (uploadErr) {
          const errMsg = formatUploadErrorMessage(uploadErr);
          toast.error(`Lỗi tải ảnh dáng mặt trước: ${errMsg}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      // 1.3 Upload Ảnh Mặt sau
      if (backPhotoSlot.file) {
        setSubmitStep('Đang tải ảnh vóc dáng mặt sau...');
        try {
          uploadedBackPhotoUrl = await uploadClientBodyPhoto(backPhotoSlot.file);
        } catch (uploadErr) {
          const errMsg = formatUploadErrorMessage(uploadErr);
          toast.error(`Lỗi tải ảnh dáng mặt sau: ${errMsg}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      // 1.4 Upload Ảnh Mặt nghiêng
      if (sidePhotoSlot.file) {
        setSubmitStep('Đang tải ảnh vóc dáng mặt nghiêng...');
        try {
          uploadedSidePhotoUrl = await uploadClientBodyPhoto(sidePhotoSlot.file);
        } catch (uploadErr) {
          const errMsg = formatUploadErrorMessage(uploadErr);
          toast.error(`Lỗi tải ảnh dáng mặt nghiêng: ${errMsg}`);
          setIsSubmitting(false);
          setSubmitStep('');
          return;
        }
      }

      // ------------------------------------------------------------------------
      // BƯỚC 2: GỌI BACKEND API TƯƠNG ỨNG VỚI TỪNG TRƯỜNG HỢP
      // ------------------------------------------------------------------------

      // === TRƯỜNG HỢP A: TẠO KHÁCH HÀNG ĐỘC LẬP (POST /api/clients) ===
      if (creationMode === 'CLIENT_ONLY') {
        setSubmitStep('Đang lưu thông tin khách hàng vào hệ thống ZenFit...');

        const clientPayload: CreateClientRequest = {
          fullName: clientForm.fullName.trim(),
          phone: clientForm.phone.trim(),
          gender: clientForm.gender,
          dateOfBirth: clientForm.dateOfBirth || undefined,
          email: clientForm.email.trim() || undefined,
          address: clientForm.address.trim() || undefined,
          avatarUrl: uploadedAvatarUrl,
          frontPhotoUrl: uploadedFrontPhotoUrl,
          backPhotoUrl: uploadedBackPhotoUrl,
          sidePhotoUrl: uploadedSidePhotoUrl,
          status: clientForm.status,
          height: clientForm.height ? parseFloat(clientForm.height) : undefined,
          initialWeight: clientForm.initialWeight ? parseFloat(clientForm.initialWeight) : undefined,
          assignedTrainerId: trainerId || undefined,
          notes: clientForm.notes.trim() || undefined,
          joinedDate: clientForm.joinedDate || undefined,
        };

        const createdClient = await clientApi.createClient(clientPayload);

        // Cập nhật AppContext
        if (addClient) {
          await addClient(createdClient);
        }

        toast.success(`Tạo mới học viên "${createdClient.fullName}" thành công!`);
        navigate('/pt/clients');
        return;
      }

      // === TRƯỜNG HỢP B: TẠO HỢP ĐỒNG PT KẾT HỢP KHÁCH HÀNG (POST /api/pt-contracts) ===
      if (creationMode === 'CONTRACT_WITH_CLIENT') {
        setSubmitStep('Đang khởi tạo hợp đồng PT và liên kết học viên...');

        const contractPayload: CreatePtContractRequest = {
          // PT phụ trách
          trainerId: trainerId,

          // Thông tin hợp đồng
          totalSessions: parseInt(contractForm.totalSessions, 10),
          bonusSessions: contractForm.bonusSessions ? parseInt(contractForm.bonusSessions, 10) : 0,
          startDate: contractForm.startDate || undefined,
          endDate: contractForm.endDate || undefined,
          price: parseFloat(contractForm.price) || 0,
          paidAmount: contractForm.paidAmount ? parseFloat(contractForm.paidAmount) : undefined,
          status: contractForm.status,
          notes: contractForm.notes.trim() || undefined,

          // Thông tin mục tiêu tập luyện (ClientGoalEntity)
          goalType: goalForm.goalType || undefined,
          startWeight: goalForm.startWeight ? parseFloat(goalForm.startWeight) : undefined,
          targetWeight: goalForm.targetWeight ? parseFloat(goalForm.targetWeight) : undefined,
          goalNote: goalForm.goalNote.trim() || undefined,

          // Nếu chọn khách hàng đã có:
          ...(clientSelection === 'EXISTING' && selectedExistingClient
            ? {
                clientId: selectedExistingClient.id,
              }
            : {
                // Nếu tạo khách hàng mới đồng thời:
                clientFullName: clientForm.fullName.trim(),
                clientPhone: clientForm.phone.trim(),
                clientEmail: clientForm.email.trim() || undefined,
                clientGender: clientForm.gender,
                clientDateOfBirth: clientForm.dateOfBirth || undefined,
                clientAddress: clientForm.address.trim() || undefined,
                clientAvatarUrl: uploadedAvatarUrl,
                clientFrontPhotoUrl: uploadedFrontPhotoUrl,
                clientBackPhotoUrl: uploadedBackPhotoUrl,
                clientSidePhotoUrl: uploadedSidePhotoUrl,
                height: clientForm.height ? parseFloat(clientForm.height) : undefined,
                initialWeight: clientForm.initialWeight ? parseFloat(clientForm.initialWeight) : undefined,
                clientNotes: clientForm.notes.trim() || undefined,
              }),
        };

        await contractApi.createPtContract(contractPayload);

        toast.success(
          clientSelection === 'NEW'
            ? `Tạo học viên mới và hợp đồng PT (${contractForm.totalSessions} buổi) thành công!`
            : `Đã kích hoạt hợp đồng PT cho học viên "${selectedExistingClient?.fullName}"!`
        );

        // Chuyển hướng sang danh sách học viên hoặc danh sách hợp đồng
        navigate('/pt/clients');
        return;
      }
    } catch (err: unknown) {
      console.error('Lỗi khi submit form:', err);

      // Kiểm tra lỗi vượt quá giới hạn học viên (CLIENT.STUDENT_LIMIT_EXCEEDED) hoặc chưa có gói (CLIENT.SUBSCRIPTION_REQUIRED)
      const apiErr = err as { response?: { data?: { code?: string; message?: string } } };
      const errCode = apiErr.response?.data?.code;
      const apiMsg = apiErr.response?.data?.message;

      if (
        errCode === 'CLIENT.STUDENT_LIMIT_EXCEEDED' ||
        (apiMsg && apiMsg.includes('giới hạn tối đa'))
      ) {
        toast.error(
          apiMsg ||
            'Số lượng học viên đã đạt giới hạn tối đa của gói dịch vụ. Vui lòng nâng cấp gói để tiếp tục thêm học viên!',
          {
            action: {
              label: 'Nâng cấp ngay',
              onClick: () => navigate('/pt/pricing'),
            },
            duration: 6000,
          }
        );
        fetchMySubscription();
        return;
      }

      if (
        errCode === 'CLIENT.SUBSCRIPTION_REQUIRED' ||
        (apiMsg && apiMsg.includes('chưa đăng ký gói'))
      ) {
        toast.error(
          apiMsg || 'Bạn chưa đăng ký gói dịch vụ hoặc gói dịch vụ đã hết hạn. Vui lòng chọn gói!',
          {
            action: {
              label: 'Chọn gói',
              onClick: () => navigate('/select-subscription'),
            },
            duration: 6000,
          }
        );
        return;
      }

      const errMsg = formatUploadErrorMessage(err);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
      setSubmitStep('');
    }
  };

  // Tính số buổi còn lại và chênh lệch thanh toán để hiển thị trực quan
  const totalContractSessions =
    (parseInt(contractForm.totalSessions, 10) || 0) + (parseInt(contractForm.bonusSessions, 10) || 0);
  const remainingPayment =
    (parseFloat(contractForm.price) || 0) - (parseFloat(contractForm.paidAmount) || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      {/* ====================================================================
          TOP NAVIGATION & HEADER
         ==================================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <nav className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Link to="/pt/clients" className="hover:text-emerald-500 transition-colors">
            {isContractRoute ? 'Hợp đồng PT' : 'Học viên'}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-900 dark:text-white font-medium">
            {isContractRoute ? 'Tạo hợp đồng PT' : 'Thêm học viên mới'}
          </span>
        </nav>
        <button
          type="button"
          onClick={() => navigate('/pt/clients')}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-500 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Quay lại danh sách học viên</span>
        </button>
      </div>

      {/* ====================================================================
          HERO CARD
         ==================================================================== */}
      <div className="rounded-3xl bg-white dark:bg-[#0c1626] border border-slate-200 dark:border-[#162338] shadow-sm overflow-hidden">
        {/* Banner Header */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              {isContractRoute ? (
                <FileSignature className="h-7 w-7" />
              ) : (
                <UserPlus className="h-7 w-7" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {isContractRoute ? 'Tạo Hợp Đồng Huấn Luyện PT' : 'Thêm Học Viên Mới'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <Sparkles className="h-3 w-3" />
                  ZenFit PT
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isContractRoute
                  ? 'Khởi tạo hợp đồng tập luyện mới, phân bổ số buổi, giá trị hợp đồng và liên kết học viên.'
                  : 'Thêm hồ sơ học viên vào danh sách quản lý, lưu trữ thông tin cá nhân và hình ảnh dáng người.'}
              </p>
            </div>
          </div>

          {/* PT phụ trách info badge */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#0f1d32] border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 self-start md:self-center">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium uppercase">
                PT Đang Đăng Nhập
              </p>
              <p className="font-semibold text-slate-900 dark:text-white">{trainerName}</p>
            </div>
          </div>
        </div>

        {/* Cảnh báo hạn mức học viên nếu đã đầy */}
        {isQuotaFull && (
          <div className="mx-6 sm:mx-8 mt-6 p-4 rounded-2xl bg-gradient-to-r from-rose-950/40 via-red-950/30 to-slate-900 border border-rose-500/40 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">Hạn mức học viên đã đạt tối đa!</p>
                <p className="text-slate-300 mt-0.5">
                  Bạn đang quản lý <strong className="text-rose-400 font-bold">{currentStudents}/{maxStudents}</strong> học viên theo gói <strong className="text-white">{mySubscription?.planName || 'dịch vụ hiện tại'}</strong>. Hãy nâng cấp gói để tiếp tục thêm học viên mới.
                </p>
              </div>
            </div>
            <Link
              to="/pt/pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shrink-0 shadow-md transition"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Nâng cấp gói ngay</span>
            </Link>
          </div>
        )}

        {/* ==================================================================
            MAIN FORM BODY
           ================================================================== */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">
          {/* ================================================================
              MỤC: CHỌN HỌC VIÊN CŨ HOẶC MỚI (CHỈ ÁP DỤNG TRONG TAB HỢP ĐỒNG)
             ================================================================ */}
          {creationMode === 'CONTRACT_WITH_CLIENT' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    1
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Đối Tượng Học Viên Của Hợp Đồng
                  </h2>
                </div>
              </div>

              {/* Segmented control: Khách đã có vs Tạo học viên mới */}
              <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-[#0f1d32] border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setClientSelection('NEW');
                    if (fieldErrors.clientId) {
                      setFieldErrors((p) => {
                        const next = { ...p };
                        delete next.clientId;
                        return next;
                      });
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    clientSelection === 'NEW'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Tạo Học Viên Mới Đồng Thời
                </button>
                <button
                  type="button"
                  onClick={() => setClientSelection('EXISTING')}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    clientSelection === 'EXISTING'
                      ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Chọn Học Viên Đã Có Trước Đó
                </button>
              </div>

              {/* ------------------------------------------------------------
                  KỊCH BẢN 1: CHỌN HỌC VIÊN ĐÃ CÓ (SEARCH DEBOUNCE)
                 ------------------------------------------------------------ */}
              {clientSelection === 'EXISTING' && (
                <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#091322]/50 space-y-4">
                  {!selectedExistingClient ? (
                    <div ref={searchContainerRef} className="relative space-y-2">
                      <label htmlFor={searchInputId} className="block text-xs font-medium text-slate-700 dark:text-slate-300">
                        Tìm kiếm học viên theo Tên hoặc Số điện thoại <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                          id={searchInputId}
                          type="text"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          onFocus={() => {
                            if (searchResults.length > 0) setShowSearchDropdown(true);
                          }}
                          placeholder="Nhập tên học viên hoặc số điện thoại (ví dụ: 0987...)"
                          className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                            fieldErrors.clientId
                              ? 'border-rose-500 ring-2 ring-rose-500/20'
                              : 'border-slate-200 dark:border-slate-800'
                          }`}
                        />
                        {isSearching && (
                          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500 animate-spin" />
                        )}
                      </div>

                      {fieldErrors.clientId && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="h-3.5 w-3.5" />
                          <span>{fieldErrors.clientId}</span>
                        </p>
                      )}

                      {/* Dropdown kết quả tìm kiếm */}
                      {showSearchDropdown && (
                        <div className="absolute z-20 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-white dark:bg-[#0f1d32] border border-slate-200 dark:border-slate-800 shadow-xl divide-y divide-slate-100 dark:divide-slate-800">
                          {searchResults.length > 0 ? (
                            searchResults.map((client) => (
                              <button
                                key={client.id}
                                type="button"
                                onClick={() => handleSelectClient(client)}
                                className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
                              >
                                <div className="flex items-center gap-3">
                                  {client.avatarUrl ? (
                                    <img
                                      src={client.avatarUrl}
                                      alt={client.fullName}
                                      className="h-10 w-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                                    />
                                  ) : (
                                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-sm">
                                      {client.fullName.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                      {client.fullName}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                      {client.phone} {client.email ? `• ${client.email}` : ''}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium">
                                  Chọn
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-xs text-slate-500">
                              Không tìm thấy học viên nào phù hợp với từ khóa &ldquo;{searchKeyword}&rdquo;.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Học viên đã được chọn */
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[#0c1626] border border-emerald-500/30 ring-1 ring-emerald-500/20">
                      <div className="flex items-center gap-4">
                        {selectedExistingClient.avatarUrl ? (
                          <img
                            src={selectedExistingClient.avatarUrl}
                            alt={selectedExistingClient.fullName}
                            className="h-12 w-12 rounded-full object-cover border border-emerald-500/40"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold text-base">
                            {selectedExistingClient.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                              {selectedExistingClient.fullName}
                            </p>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle2 className="h-3 w-3" />
                              Đã liên kết hợp đồng
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            SĐT: <span className="font-medium text-slate-700 dark:text-slate-300">{selectedExistingClient.phone}</span>
                            {selectedExistingClient.email ? ` • Email: ${selectedExistingClient.email}` : ''}
                            {selectedExistingClient.height ? ` • Chiều cao: ${selectedExistingClient.height}cm` : ''}
                            {selectedExistingClient.initialWeight ? ` • Cân nặng: ${selectedExistingClient.initialWeight}kg` : ''}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearSelectedClient}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        Đổi học viên khác
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================================================================
              MỤC: THÔNG TIN HỌC VIÊN (ClientEntity)
              Hiển thị khi:
              - Đang ở chế độ CLIENT_ONLY
              - HOẶC ở chế độ CONTRACT_WITH_CLIENT và chọn "Tạo Học Viên Mới Đồng Thời"
             ================================================================ */}
          {(creationMode === 'CLIENT_ONLY' ||
            (creationMode === 'CONTRACT_WITH_CLIENT' && clientSelection === 'NEW')) && (
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    {creationMode === 'CONTRACT_WITH_CLIENT' ? '2' : '1'}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Thông Tin Hồ Sơ Học Viên
                  </h2>
                </div>
                <span className="text-xs text-slate-400">
                  <span className="text-rose-500">*</span> Các trường bắt buộc
                </span>
              </div>

              {/* ------------------------------------------------------------
                  UPLOAD ẢNH ĐẠI DIỆN CLOUDINARY
                 ------------------------------------------------------------ */}
              <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6 bg-slate-50/50 dark:bg-[#091322]/40">
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    handleSlotFileChange(file, setAvatarSlot, 'đại diện');
                  }}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Avatar Preview Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsAvatarDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsAvatarDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsAvatarDragOver(false);
                      const file = e.dataTransfer.files?.[0];
                      handleSlotFileChange(file, setAvatarSlot, 'đại diện');
                    }}
                    onClick={() => avatarInputRef.current?.click()}
                    className={`relative group h-28 w-28 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-all ${
                      isAvatarDragOver
                        ? 'border-emerald-500 bg-emerald-500/10 scale-105'
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-white dark:bg-[#0c1626]'
                    }`}
                  >
                    {avatarSlot.previewUrl ? (
                      <>
                        <img
                          src={avatarSlot.previewUrl}
                          alt="Avatar Preview"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Camera className="h-6 w-6" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
                        <UploadCloud className="h-7 w-7" />
                        <span className="text-[10px] font-medium mt-1">Tải ảnh</span>
                      </div>
                    )}
                  </div>

                  {/* Avatar Actions & Instructions */}
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Ảnh Đại Diện Học Viên
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md">
                      Hỗ trợ định dạng PNG, JPG, WEBP dung lượng tối đa 5MB. Ảnh sẽ được đẩy trực tiếp lên Cloudinary với chữ ký số bảo mật.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => avatarInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm cursor-pointer"
                      >
                        Chọn ảnh từ máy
                      </button>
                      {avatarSlot.previewUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(setAvatarSlot, avatarInputRef)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>Gỡ ảnh</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------
                  CÁC TRƯỜNG THÔNG TIN CƠ BẢN
                 ------------------------------------------------------------ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Họ và tên */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Họ và tên học viên <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="fullName"
                      value={clientForm.fullName}
                      onChange={handleClientInputChange}
                      placeholder="Nguyễn Văn A"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.fullName
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.fullName}</span>
                    </p>
                  )}
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={clientForm.phone}
                      onChange={handleClientInputChange}
                      placeholder="0912345678"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.phone
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      name="email"
                      value={clientForm.email}
                      onChange={handleClientInputChange}
                      placeholder="nguyenvana@gmail.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.email
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                {/* Giới tính */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Giới tính
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(GENDER_LABELS) as Gender[]).map((genderKey) => (
                      <button
                        key={genderKey}
                        type="button"
                        onClick={() => setClientForm((prev) => ({ ...prev, gender: genderKey }))}
                        className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          clientForm.gender === genderKey
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                            : 'bg-white dark:bg-[#0c1626] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {GENDER_LABELS[genderKey]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ngày sinh */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày sinh
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={clientForm.dateOfBirth}
                      onChange={handleClientInputChange}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Địa chỉ */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Địa chỉ thường trú
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      name="address"
                      value={clientForm.address}
                      onChange={handleClientInputChange}
                      placeholder="Quận 1, TP. Hồ Chí Minh"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Chiều cao (cm) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Chiều cao (cm)
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.5"
                      name="height"
                      value={clientForm.height}
                      onChange={handleClientInputChange}
                      placeholder="175"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.height
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.height && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.height}</span>
                    </p>
                  )}
                </div>

                {/* Cân nặng khởi điểm (kg) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cân nặng khởi điểm (kg)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      name="initialWeight"
                      value={clientForm.initialWeight}
                      onChange={handleClientInputChange}
                      placeholder="72.5"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.initialWeight
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.initialWeight && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.initialWeight}</span>
                    </p>
                  )}
                </div>

                {/* Trạng thái khách hàng */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái hồ sơ ban đầu
                  </label>
                  <select
                    name="status"
                    value={clientForm.status}
                    onChange={handleClientInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {(Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {CLIENT_STATUS_LABELS[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngày tham gia */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày gia nhập hệ thống
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      name="joinedDate"
                      value={clientForm.joinedDate}
                      onChange={handleClientInputChange}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* ------------------------------------------------------------
                  ẢNH DÁNG NGƯỜI 3 GÓC CHỤP BAN ĐẦU (BODY ASSESSMENT)
                 ------------------------------------------------------------ */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Camera className="h-4 w-4 text-emerald-500" />
                      <span>Ảnh Dáng Người 3 Góc Chụp Ban Đầu (Theo Dõi Tiến Độ)</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Chụp ảnh mặt trước, mặt sau và mặt nghiêng để lưu trữ làm mốc so sánh sự biến đổi hình thể.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Slot 1: Mặt Trước (frontPhotoUrl) */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] space-y-3">
                    <input
                      ref={frontPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleSlotFileChange(file, setFrontPhotoSlot, 'mặt trước');
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        1. Mặt Trước (Front)
                      </span>
                      {frontPhotoSlot.previewUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(setFrontPhotoSlot, frontPhotoInputRef)}
                          className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => frontPhotoInputRef.current?.click()}
                      className="h-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all bg-slate-50 dark:bg-[#091322]"
                    >
                      {frontPhotoSlot.previewUrl ? (
                        <img
                          src={frontPhotoSlot.previewUrl}
                          alt="Front Body"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 hover:text-emerald-500 text-center p-3">
                          <Camera className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">Bấm chọn ảnh</span>
                          <span className="text-[10px] text-slate-400">Góc chụp chính diện</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slot 2: Mặt Sau (backPhotoUrl) */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] space-y-3">
                    <input
                      ref={backPhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleSlotFileChange(file, setBackPhotoSlot, 'mặt sau');
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        2. Mặt Sau (Back)
                      </span>
                      {backPhotoSlot.previewUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(setBackPhotoSlot, backPhotoInputRef)}
                          className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => backPhotoInputRef.current?.click()}
                      className="h-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all bg-slate-50 dark:bg-[#091322]"
                    >
                      {backPhotoSlot.previewUrl ? (
                        <img
                          src={backPhotoSlot.previewUrl}
                          alt="Back Body"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 hover:text-emerald-500 text-center p-3">
                          <Camera className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">Bấm chọn ảnh</span>
                          <span className="text-[10px] text-slate-400">Góc chụp sau lưng</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slot 3: Mặt Nghiêng (sidePhotoUrl) */}
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] space-y-3">
                    <input
                      ref={sidePhotoInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        handleSlotFileChange(file, setSidePhotoSlot, 'mặt nghiêng');
                      }}
                      className="hidden"
                    />
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        3. Mặt Nghiêng (Side)
                      </span>
                      {sidePhotoSlot.previewUrl && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSlot(setSidePhotoSlot, sidePhotoInputRef)}
                          className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                        >
                          Xóa
                        </button>
                      )}
                    </div>

                    <div
                      onClick={() => sidePhotoInputRef.current?.click()}
                      className="h-44 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 flex flex-col items-center justify-center overflow-hidden cursor-pointer transition-all bg-slate-50 dark:bg-[#091322]"
                    >
                      {sidePhotoSlot.previewUrl ? (
                        <img
                          src={sidePhotoSlot.previewUrl}
                          alt="Side Body"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 hover:text-emerald-500 text-center p-3">
                          <Camera className="h-6 w-6 mb-1" />
                          <span className="text-xs font-medium">Bấm chọn ảnh</span>
                          <span className="text-[10px] text-slate-400">Góc chụp nghiêng 90°</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ghi chú về học viên */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú hồ sơ học viên (Thói quen sinh hoạt, chấn thương, tiền sử bệnh)
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  value={clientForm.notes}
                  onChange={handleClientInputChange}
                  placeholder="Ghi chú về thói quen ăn uống, công việc văn phòng, đau thắt lưng nhẹ khi gập bụng..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                />
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC: MỤC TIÊU TẬP LUYỆN (ClientGoalEntity)
              (Chỉ hiển thị khi tạo Hợp đồng PT)
             ================================================================ */}
          {creationMode === 'CONTRACT_WITH_CLIENT' && (
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                  {clientSelection === 'NEW' ? '3' : '2'}
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Mục Tiêu Tập Luyện Của Khách Hàng (ClientGoalEntity)
                </h2>
              </div>

              {/* Chọn loại mục tiêu tập luyện */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Định hướng mục tiêu chính
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(GOAL_TYPE_LABELS).map(([key, item]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setGoalForm((prev) => ({ ...prev, goalType: key }))}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        goalForm.goalType === key
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500'
                          : 'bg-white dark:bg-[#0c1626] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chỉ số cân nặng mục tiêu */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cân nặng bắt đầu (kg)
                  </label>
                  <div className="relative">
                    <Activity className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      name="startWeight"
                      value={goalForm.startWeight}
                      onChange={handleGoalInputChange}
                      placeholder="Ví dụ: 75.0"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cân nặng kỳ vọng hướng tới (kg)
                  </label>
                  <div className="relative">
                    <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="0.1"
                      name="targetWeight"
                      value={goalForm.targetWeight}
                      onChange={handleGoalInputChange}
                      placeholder="Ví dụ: 68.0"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú mục tiêu */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Chi tiết lộ trình mục tiêu (Ghi chú mục tiêu)
                </label>
                <input
                  type="text"
                  name="goalNote"
                  value={goalForm.goalNote}
                  onChange={handleGoalInputChange}
                  placeholder="Giảm 7kg trong 12 tuần, siết vòng eo xuống dưới 75cm..."
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* ================================================================
              MỤC: THÔNG TIN HỢP ĐỒNG PT (PtContractEntity)
              (Chỉ hiển thị khi tạo Hợp đồng PT)
             ================================================================ */}
          {creationMode === 'CONTRACT_WITH_CLIENT' && (
            <div className="space-y-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-emerald-500 text-white text-xs font-bold">
                    {clientSelection === 'NEW' ? '4' : '3'}
                  </span>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Thông Tin Hợp Đồng Huấn Luyện (PtContractEntity)
                  </h2>
                </div>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  Tổng buổi thực tế: {totalContractSessions} buổi
                </span>
              </div>

              {/* Các trường số buổi, ngày, giá tiền */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {/* Số buổi tập chính */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Số buổi tập chính <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="1"
                      name="totalSessions"
                      value={contractForm.totalSessions}
                      onChange={handleContractInputChange}
                      placeholder="12"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.totalSessions
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.totalSessions && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.totalSessions}</span>
                    </p>
                  )}
                </div>

                {/* Số buổi tặng thêm */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Số buổi tặng kèm (Bonus)
                  </label>
                  <div className="relative">
                    <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      name="bonusSessions"
                      value={contractForm.bonusSessions}
                      onChange={handleContractInputChange}
                      placeholder="0"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Trạng thái hợp đồng */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Trạng thái hợp đồng
                  </label>
                  <select
                    name="status"
                    value={contractForm.status}
                    onChange={handleContractInputChange}
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    {(Object.keys(CONTRACT_STATUS_LABELS) as ContractStatus[]).map((st) => (
                      <option key={st} value={st}>
                        {CONTRACT_STATUS_LABELS[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Ngày bắt đầu */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      name="startDate"
                      value={contractForm.startDate}
                      onChange={handleContractInputChange}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.startDate
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                </div>

                {/* Ngày kết thúc dự kiến */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày kết thúc dự kiến
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      name="endDate"
                      value={contractForm.endDate}
                      onChange={handleContractInputChange}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>

                {/* Giá trị hợp đồng (VNĐ) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Giá trị hợp đồng (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="10000"
                      name="price"
                      value={contractForm.price}
                      onChange={handleContractInputChange}
                      placeholder="3600000"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all ${
                        fieldErrors.price
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {fieldErrors.price && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{fieldErrors.price}</span>
                    </p>
                  )}
                </div>

                {/* Số tiền đã thanh toán */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Đã thanh toán (VNĐ)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      step="10000"
                      name="paidAmount"
                      value={contractForm.paidAmount}
                      onChange={handleContractInputChange}
                      placeholder="3600000"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-slate-500">
                      Còn lại: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{remainingPayment.toLocaleString('vi-VN')} đ</span>
                    </span>
                    {remainingPayment === 0 ? (
                      <span className="text-emerald-500 font-medium">✓ Đã đủ 100%</span>
                    ) : (
                      <span className="text-amber-500 font-medium">Trả góp / Đặt cọc</span>
                    )}
                  </div>
                </div>

                {/* Ghi chú hợp đồng */}
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ghi chú hợp đồng / Điều khoản thỏa thuận
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={contractForm.notes}
                    onChange={handleContractInputChange}
                    placeholder="Tập vào thứ 2, 4, 6 lúc 18h00. Được bảo lưu tối đa 30 ngày..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1626] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              SUBMISSION FOOTER & BUTTONS
             ================================================================ */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 order-2 sm:order-1">
              <Info className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>
                Ảnh vóc dáng & avatar sẽ tải trực tiếp lên Cloudinary trước khi gửi dữ liệu sang máy chủ ZenFit.
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => navigate('/pt/clients')}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Hủy bỏ
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-7 py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{submitStep || 'Đang xử lý...'}</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>
                      {creationMode === 'CONTRACT_WITH_CLIENT'
                        ? 'Kích Hoạt Hợp Đồng & Lưu Hồ Sơ'
                        : 'Thêm Học Viên Mới'}
                    </span>
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
