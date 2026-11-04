/**
 * ============================================================================
 * PT CONTRACT TYPES & INTERFACES
 * Quản lý kiểu dữ liệu Hợp đồng huấn luyện viên cá nhân (PT Contract)
 * Đồng bộ với Backend Spring Boot Entity / DTOs
 * ============================================================================
 */
import type {
  Gender,
  FitnessGoal,
  ExperienceLevel,
} from './client.types';

// Trạng thái hiệu lực hợp đồng
export type ContractStatus =
  | 'ACTIVE'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'SUSPENDED'
  | 'FROZEN'
  | 'COMPLETED';

// Trạng thái thanh toán tiền của hợp đồng
export type PaymentContractStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'REFUNDED';

// Entity Hợp đồng PT
export interface PtContract {
  id: string;
  contractCode?: string;
  clientId: string;
  trainerId: string;

  // Thông tin liên kết hiển thị nhanh (từ Backend JOIN hoặc FE mapping)
  clientName?: string;
  clientPhone?: string;
  clientAvatarUrl?: string;
  trainerName?: string;

  // Thông tin buổi tập
  totalSessions: number;      // Số buổi mua
  bonusSessions?: number;     // Số buổi tặng
  usedSessions?: number;      // Số buổi đã tập
  completedSessions?: number; // Tương thích ngược nếu BE trả completedSessions
  remainingSessions?: number; // Số buổi còn lại (total + bonus - used)

  // Thông tin tài chính
  price: number;              // Tổng giá trị hợp đồng (VND)
  pricePerSession?: number;   // Đơn giá 1 buổi tập (VND)
  paidAmount?: number;        // Số tiền học viên đã thanh toán

  // Thời hạn
  startDate?: string;         // YYYY-MM-DD
  endDate?: string;           // YYYY-MM-DD

  // Trạng thái
  status: ContractStatus;
  paymentContractStatus?: PaymentContractStatus;

  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Alias tương thích ngược với mã nguồn đang dùng PtContractResponse
export type PtContractResponse = PtContract;

// Request tạo mới hợp đồng PT (hỗ trợ cả chọn học viên sẵn có hoặc tạo kèm học viên)
export interface CreatePtContractRequest {
  // Nếu đã có học viên:
  clientId?: string;

  // Nếu tạo kèm học viên mới đồng thời:
  clientFullName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientGender?: Gender;
  clientDateOfBirth?: string;
  clientAddress?: string;
  clientAvatarUrl?: string;
  clientFrontPhotoUrl?: string;
  clientBackPhotoUrl?: string;
  clientSidePhotoUrl?: string;
  height?: number;
  initialWeight?: number;
  targetWeight?: number;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  medicalConditions?: string;
  injuries?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  goalNote?: string;

  // Thông tin hợp đồng:
  trainerId: string;
  totalSessions: number;
  bonusSessions?: number;
  startDate?: string;
  endDate?: string;
  price: number;
  pricePerSession?: number;                      // Tùy chọn (BE tự tính = price / totalSessions)
  paidAmount?: number;                           // Tùy chọn (mặc định 0)
  paymentContractStatus?: PaymentContractStatus; // Tùy chọn (BE tự suy diễn theo paidAmount vs price)
  status?: ContractStatus;
  notes?: string;
}

// Request cập nhật hợp đồng PT (API PUT /api/pt-contracts/:id)
export interface UpdatePtContractRequest {
  totalSessions?: number;
  bonusSessions?: number;
  usedSessions?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  pricePerSession?: number;
  paidAmount?: number;
  status?: ContractStatus;
  paymentContractStatus?: PaymentContractStatus;
  notes?: string;
}

// Filter params khi lấy danh sách hợp đồng
export interface PtContractFilterParams {
  trainerId?: string;
  clientId?: string;
  status?: ContractStatus;
  paymentStatus?: PaymentContractStatus;
}

/**
 * Cấu hình hiển thị Badge trạng thái thanh toán (PaymentContractStatus)
 */
export const PAYMENT_CONTRACT_STATUS_CONFIG: Record<
  PaymentContractStatus,
  {
    label: string;
    badgeClass: string;
    dotClass: string;
    variant: 'destructive' | 'warning' | 'success' | 'secondary';
  }
> = {
  UNPAID: {
    label: 'Chưa thanh toán',
    badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-500',
    variant: 'destructive',
  },
  PARTIALLY_PAID: {
    label: 'Thanh toán 1 phần',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-500',
    variant: 'warning',
  },
  PAID: {
    label: 'Đã thanh toán đủ',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500',
    variant: 'success',
  },
  REFUNDED: {
    label: 'Đã hoàn tiền',
    badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
    dotClass: 'bg-slate-400',
    variant: 'secondary',
  },
};

/**
 * Cấu hình hiển thị nhãn trạng thái hợp đồng (ContractStatus)
 */
export const CONTRACT_STATUS_LABELS: Record<
  ContractStatus,
  { label: string; color: string }
> = {
  ACTIVE: {
    label: 'Đang hiệu lực',
    color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    color: 'bg-blue-500/15 text-blue-600 border-blue-500/30',
  },
  EXPIRED: {
    label: 'Hết hạn',
    color: 'bg-rose-500/15 text-rose-600 border-rose-500/30',
  },
  FROZEN: {
    label: 'Tạm bảo lưu',
    color: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
  },
  SUSPENDED: {
    label: 'Tạm đình chỉ',
    color: 'bg-orange-500/15 text-orange-600 border-orange-500/30',
  },
};

/**
 * Helper tự động suy luận trạng thái thanh toán nếu Backend trả về rỗng / dữ liệu cũ
 */
export function resolvePaymentStatus(contract: {
  paymentContractStatus?: PaymentContractStatus;
  paidAmount?: number;
  price?: number;
}): PaymentContractStatus {
  if (contract.paymentContractStatus) {
    return contract.paymentContractStatus;
  }
  const paid = contract.paidAmount ?? 0;
  const price = contract.price ?? 0;

  if (paid <= 0) return 'UNPAID';
  if (paid >= price) return 'PAID';
  return 'PARTIALLY_PAID';
}

// Re-export thêm các types client nếu cần
export * from './client.types';
