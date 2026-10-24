/**
 * ============================================================================
 * CLIENT TYPES & DTOS
 * Dành cho quản lý hồ sơ học viên / khách hàng ZenFit
 * ============================================================================
 */

export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'FROZEN' | 'EXPIRED';

export type FitnessGoal =
  | 'LOSE_FAT'
  | 'GAIN_MUSCLE'
  | 'GAIN_WEIGHT'
  | 'MAINTAIN'
  | 'HEALTH';

export type ExperienceLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

/**
 * Payload tạo mới hồ sơ khách hàng gửi lên Backend
 * Endpoint: POST /api/clients
 */
export interface CreateClientRequest {
  fullName: string; // Bắt buộc
  phone: string; // Bắt buộc
  gender?: Gender;
  dateOfBirth?: string; // YYYY-MM-DD
  email?: string;
  address?: string;
  avatarUrl?: string; // Lấy từ Cloudinary sau khi upload
  status?: ClientStatus;
  height?: number; // cm
  initialWeight?: number; // kg
  fitnessGoal?: FitnessGoal;
  experienceLevel?: ExperienceLevel;
  targetWeight?: number; // kg
  medicalConditions?: string;
  injuries?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  assignedTrainerId?: string;
  notes?: string;
  joinedDate?: string; // YYYY-MM-DD
}

/**
 * DTO dữ liệu hồ sơ khách hàng trả về từ Backend
 */
export interface ClientResponse extends CreateClientRequest {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  // Các trường bổ sung nếu có từ quan hệ gói tập / PT
  assignedTrainerName?: string;
  currentPackageName?: string;
  remainingSessions?: number;
}

export type Client = ClientResponse;

/**
 * Metadata & nhãn tiếng Việt phục vụ UI
 */
export const CLIENT_STATUS_LABELS: Record<ClientStatus, { label: string; color: string }> = {
  ACTIVE: { label: 'Đang tập', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' },
  INACTIVE: { label: 'Tạm ngưng', color: 'bg-slate-500/15 text-slate-600 border-slate-500/30' },
  FROZEN: { label: 'Bảo lưu', color: 'bg-amber-500/15 text-amber-600 border-amber-500/30' },
  EXPIRED: { label: 'Hết hạn', color: 'bg-rose-500/15 text-rose-600 border-rose-500/30' },
};

export const FITNESS_GOAL_LABELS: Record<FitnessGoal, string> = {
  LOSE_FAT: 'Giảm mỡ / Giảm cân',
  GAIN_MUSCLE: 'Tăng cơ bắp',
  GAIN_WEIGHT: 'Tăng cân',
  MAINTAIN: 'Duy trì vóc dáng',
  HEALTH: 'Cải thiện sức khỏe dẻo dai',
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
