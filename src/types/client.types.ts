/**
 * ============================================================================
 * CLIENT & CONTRACT TYPES & DTOS
 * Chuẩn định dạng Backend Spring Boot cho phân hệ Huấn luyện viên (PT) ZenFit
 * ============================================================================
 */

// Enum trạng thái khách hàng & hợp đồng
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'POTENTIAL' | 'EXPIRED' | 'FROZEN';
export type ContractStatus = 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'FROZEN' | 'CANCELLED';
export type GoalPhaseStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type FitnessGoal =
  | 'LOSE_FAT'
  | 'GAIN_MUSCLE'
  | 'GAIN_WEIGHT'
  | 'MAINTAIN'
  | 'HEALTH'
  | 'GIAM_CAN'
  | 'TANG_CO'
  | 'BULKING'
  | 'CUTTING';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * DTO Khách hàng trả về từ Backend (ClientResponse / ClientEntity)
 * Endpoint: GET /api/clients, GET /api/clients/:id, GET /api/clients/search
 */
export interface ClientResponse {
  id: string;
  fullName: string;
  gender?: Gender;
  dateOfBirth?: string; // YYYY-MM-DD
  phone: string;
  email?: string;
  address?: string;
  avatarUrl?: string;
  status: ClientStatus;
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
  sidePhotoUrl?: string;
  height?: number; // cm
  initialWeight?: number; // kg
  assignedTrainerId?: string;
  notes?: string;
  joinedDate?: string;
  createdAt?: string;
  updatedAt?: string;

  // Các trường mở rộng / tính toán hiển thị (nếu có)
  targetWeight?: number;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  medicalConditions?: string;
  injuries?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedTrainerName?: string;
  currentPackageName?: string;
  remainingSessions?: number;
}

export type Client = ClientResponse;

/**
 * Request tạo mới khách hàng độc lập
 * Endpoint: POST /api/clients
 */
export interface CreateClientRequest {
  fullName: string; // Bắt buộc
  phone: string; // Bắt buộc
  gender?: Gender;
  dateOfBirth?: string; // YYYY-MM-DD
  email?: string;
  address?: string;
  avatarUrl?: string;
  status?: ClientStatus;
  frontPhotoUrl?: string;
  backPhotoUrl?: string;
  sidePhotoUrl?: string;
  height?: number; // cm
  initialWeight?: number; // kg
  assignedTrainerId?: string;
  notes?: string;
  joinedDate?: string;

  // Các trường mở rộng tùy chọn
  targetWeight?: number;
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  medicalConditions?: string;
  injuries?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

/**
 * Request tạo hợp đồng PT (hỗ trợ cả chọn khách cũ hoặc tạo mới trực tiếp)
 * Endpoint: POST /api/pt-contracts
 */
export interface CreatePtContractRequest {
  // Nếu đã có khách hàng:
  clientId?: string;

  // Nếu tạo khách hàng mới đồng thời:
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
  clientNotes?: string;

  // Thông tin mục tiêu tập luyện (ClientGoalEntity):
  goalType?: string; // e.g. 'GIAM_CAN', 'TANG_CO', 'BULKING', 'CUTTING'
  targetWeight?: number; // kg
  startWeight?: number; // kg
  goalNote?: string;

  // Thông tin hợp đồng (PtContractEntity):
  trainerId: string;
  totalSessions: number;
  bonusSessions?: number;
  startDate?: string;
  endDate?: string;
  price: number;
  paidAmount?: number;
  status?: ContractStatus;
  notes?: string;
}

/**
 * Phản hồi chi tiết hợp đồng PT từ Backend
 */
export interface PtContractResponse {
  id: string;
  contractCode?: string;
  clientId: string;
  clientName?: string;
  clientPhone?: string;
  clientAvatarUrl?: string;
  trainerId: string;
  trainerName?: string;
  totalSessions: number;
  bonusSessions?: number;
  completedSessions?: number;
  remainingSessions?: number;
  startDate?: string;
  endDate?: string;
  price: number;
  paidAmount?: number;
  status: ContractStatus;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Metadata & nhãn tiếng Việt phục vụ UI
 */
export const CLIENT_STATUS_LABELS: Record<ClientStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang tập', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  POTENTIAL: { label: 'Tiềm năng', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  INACTIVE: { label: 'Tạm ngưng', color: 'bg-slate-500/15 text-slate-600 border-slate-500/30' },
  FROZEN: { label: 'Bảo lưu', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
};

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang hiệu lực', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'bg-blue-500/15 text-blue-600 border-blue-500/30' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
  FROZEN: { label: 'Tạm bảo lưu', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-slate-500/15 text-slate-600 border-slate-500/30' },
};

export const GOAL_TYPE_LABELS: Record<string, { label: string; description: string }> = {
  GIAM_CAN: { label: 'Giảm mỡ / Giảm cân', description: 'Đốt mỡ toàn thân, thon gọn vóc dáng' },
  TANG_CO: { label: 'Tăng cơ bắp', description: 'Kích thích phát triển khối cơ săn chắc' },
  BULKING: { label: 'Xả cơ (Bulking)', description: 'Tăng trọng lượng và kích cỡ cơ tối đa' },
  CUTTING: { label: 'Siết cơ (Cutting)', description: 'Giảm mỡ giữ tối đa khối lượng cơ' },
  MAINTAIN: { label: 'Duy trì vóc dáng', description: 'Giữ cân nặng và thể lực hiện tại' },
  HEALTH: { label: 'Cải thiện thể lực', description: 'Tăng sức bền, độ dẻo dai và tim mạch' },
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  LOSE_FAT: 'Giảm mỡ / Giảm cân',
  GAIN_MUSCLE: 'Tăng cơ bắp',
  GAIN_WEIGHT: 'Tăng cân',
  MAINTAIN: 'Duy trì vóc dáng',
  HEALTH: 'Cải thiện sức khỏe dẻo dai',
  GIAM_CAN: 'Giảm mỡ / Giảm cân',
  TANG_CO: 'Tăng cơ bắp',
  BULKING: 'Xả cơ (Bulking)',
  CUTTING: 'Siết cơ (Cutting)',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  BEGINNER: 'Mới bắt đầu (Chưa có kinh nghiệm)',
  INTERMEDIATE: 'Trung cấp (Đã tập 6 tháng - 1 năm)',
  ADVANCED: 'Nâng cao (Tập trên 1 năm)',
};

export const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  OTHER: 'Khác',
};
