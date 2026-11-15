/**
 * ============================================================================
 * TRAINING SESSION & PT CALENDAR TYPES
 * Quản lý kiểu dữ liệu Buổi tập & Lịch làm việc Huấn luyện viên (PT Calendar)
 * Đồng bộ với Backend Spring Boot REST API (/api/training-sessions)
 * ============================================================================
 */

// Trạng thái buổi tập (Đồng bộ với Backend Java enum TrainingSessionStatus: 4 trạng thái)
export type TrainingSessionStatus =
  | 'SCHEDULED'   // Buổi tập đã lên lịch, chưa diễn ra
  | 'COMPLETED'   // Buổi tập đã hoàn thành tập luyện
  | 'CANCELLED'   // Buổi tập đã bị hủy bỏ
  | 'NO_SHOW';    // Học viên vắng mặt không lý do

// Chế độ xem Lịch
export type CalendarViewType = 'DAY' | 'WEEK' | 'MONTH' | 'TABLE';

// Entity Buổi tập đầy đủ
export interface TrainingSession {
  id: string;
  clientId: string;
  trainerId: string;
  contractId: string;
  sessionName: string;
  trainingDate: string;  // YYYY-MM-DD
  startTime: string;     // HH:mm:ss
  endTime?: string | null; // LocalDateTime (ISO: YYYY-MM-DDTHH:mm:ss) Thời gian kết thúc buổi tập
  status: TrainingSessionStatus;
  checkInAt?: string | null;
  completedAt?: string | null;
  evidenceImageUrls?: string[]; // Danh sách URL ảnh minh chứng (check-in / hoàn thành)
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;

  // Metadata bổ trợ hiển thị trên UI (nếu JOIN hoặc mapping từ frontend)
  clientName?: string;
  clientPhone?: string;
  clientAvatarUrl?: string;
  trainerName?: string;
}

// Item trả về trong Calendar
export interface TrainingSessionCalendarItem {
  id: string;
  clientId: string;
  trainerId: string;
  contractId: string;
  sessionName: string;
  trainingDate: string;  // YYYY-MM-DD
  startTime: string;     // HH:mm:ss
  endTime?: string | null; // LocalDateTime (ISO: YYYY-MM-DDTHH:mm:ss) Thời gian kết thúc buổi tập
  status: TrainingSessionStatus;
  evidenceImageUrls?: string[]; // Danh sách URL ảnh minh chứng
  note?: string | null;

  // Metadata bổ trợ nếu backend trả kèm hoặc client map
  clientName?: string;
  clientPhone?: string;
  clientAvatarUrl?: string;
}

// ============================================================================
// HOẠT ĐỘNG / CÔNG VIỆC CÁ NHÂN CỦA HUẤN LUYỆN VIÊN (TRAINER TASK)
// ============================================================================
export type TrainerTaskStatus = 'TODO' | 'DONE' | 'SKIPPED';

export interface TrainerTask {
  id: string;
  trainerId: string;
  title: string;              // "Thức dậy & Ăn sáng", "Họp chuyên môn"
  description?: string | null;
  color?: string;             // Mã màu hex: "#10B981", "#3B82F6",...
  taskDate: string;           // "yyyy-MM-dd"
  startTime?: string | null;  // "07:00:00"
  endTime?: string | null;    // "08:00:00"
  allDay: boolean;
  status: TrainerTaskStatus;
  completedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainerTaskRequest {
  title: string;
  taskDate: string;
  startTime?: string | null;
  endTime?: string | null;
  allDay: boolean;
  color?: string;
  description?: string | null;
}

export interface UpdateTrainerTaskRequest {
  title?: string;
  taskDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  allDay?: boolean;
  color?: string;
  description?: string | null;
}

export interface UpdateTrainerTaskStatusRequest {
  status: TrainerTaskStatus;
}

export interface TrainerTaskFilterParams {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: TrainerTaskStatus;
  trainerId?: string;
}

// Response Calendar API (/api/training-sessions/calendar)
export interface TrainingSessionCalendarResponse {
  view: CalendarViewType;
  startDate: string;
  endDate: string;
  totalSessions: number;
  sessions: TrainingSessionCalendarItem[];
  tasks?: TrainerTask[]; // MỚI: Danh sách hoạt động cá nhân của PT
}

// Request tạo buổi tập mới (POST /api/training-sessions)
export interface CreateTrainingSessionRequest {
  clientId: string;
  trainerId?: string;    // Tùy chọn nếu PT tự tạo
  contractId: string;
  sessionName: string;
  trainingDate: string;  // YYYY-MM-DD
  startTime: string;     // HH:mm:ss
  endTime?: string | null; // LocalDateTime (ISO: YYYY-MM-DDTHH:mm:ss)
  evidenceImageUrls?: string[]; // Danh sách URL ảnh minh chứng (tùy chọn)
  note?: string;
}

// Request cập nhật buổi tập (PATCH /api/training-sessions/{id})
export interface UpdateTrainingSessionRequest {
  clientId?: string;
  trainerId?: string;
  contractId?: string;
  sessionName?: string;
  trainingDate?: string;
  startTime?: string;
  endTime?: string | null;
  evidenceImageUrls?: string[]; // Danh sách URL ảnh minh chứng (tùy chọn)
  note?: string;
}

// Request xác nhận hoàn thành buổi tập (PATCH /api/training-sessions/{id}/complete)
export interface CompleteTrainingSessionRequest {
  evidenceImageUrls?: string[];
  note?: string;
}

// Request Check-in (PATCH /api/training-sessions/{id}/check-in)
export interface CheckInTrainingSessionRequest {
  evidenceImageUrls?: string[];
  note?: string;
}

// Alias tương thích TrainingSessionResponse
export type TrainingSessionResponse = TrainingSession;

// DTO Chữ ký Cloudinary
export interface ImageSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

// Query params Calendar
export interface PtCalendarQueryParams {
  view: 'DAY' | 'WEEK' | 'MONTH';
  date: string;          // YYYY-MM-DD
  trainerId?: string;
  clientId?: string;
  contractId?: string;
  status?: TrainingSessionStatus;
}

// Query params danh sách phân trang (GET /api/training-sessions)
export interface TrainingSessionFilterParams {
  page?: number;
  size?: number;
  trainerId?: string;
  clientId?: string;
  contractId?: string;
  status?: TrainingSessionStatus;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}

// Phân trang
export interface PaginatedTrainingSessionResponse {
  items: TrainingSession[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// Metadata cấu hình hiển thị trạng thái buổi tập
export const SESSION_STATUS_CONFIG: Record<
  TrainingSessionStatus,
  {
    label: string;
    color: string;
    badgeClass: string;
    borderClass: string;
    dotClass: string;
    cardClass: string;
    description: string;
  }
> = {
  SCHEDULED: {
    label: 'Đã lên lịch',
    color: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-[#1E3A5F] dark:text-[#60A5FA] dark:border-[#2563EB]',
    borderClass: 'border-l-[#2563EB]',
    dotClass: 'bg-[#2563EB] shadow-[0_0_6px_#60A5FA]',
    cardClass: 'bg-[#2563EB] dark:bg-[#1E3A5F] hover:bg-blue-700 dark:hover:bg-[#254B7A] text-white border border-blue-400/40 dark:border-[#2563EB]',
    description: 'Buổi tập đã được lên lịch, chưa diễn ra.',
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-[#064E3B] dark:text-[#34D399] dark:border-[#10B981]',
    borderClass: 'border-l-[#10B981]',
    dotClass: 'bg-[#10B981] shadow-[0_0_6px_#34D399]',
    cardClass: 'bg-[#10B981] dark:bg-[#064E3B] hover:bg-emerald-600 dark:hover:bg-[#065F46] text-white border border-emerald-400/40 dark:border-[#10B981]',
    description: 'Buổi tập đã hoàn thành.',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'red',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-[#7F1D1D] dark:text-[#F87171] dark:border-[#EF4444]',
    borderClass: 'border-l-[#EF4444]',
    dotClass: 'bg-[#EF4444] shadow-[0_0_6px_#F87171]',
    cardClass: 'bg-[#EF4444] dark:bg-[#7F1D1D] hover:bg-red-600 dark:hover:bg-[#991B1B] text-white border border-red-400/40 dark:border-[#EF4444] line-through opacity-80',
    description: 'Buổi tập đã bị hủy.',
  },
  NO_SHOW: {
    label: 'Vắng mặt',
    color: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-[#78350F] dark:text-[#FBBF24] dark:border-[#F59E0B]',
    borderClass: 'border-l-[#F59E0B]',
    dotClass: 'bg-[#F59E0B] shadow-[0_0_6px_#FBBF24]',
    cardClass: 'bg-[#F59E0B] dark:bg-[#78350F] hover:bg-amber-600 dark:hover:bg-[#92400E] text-white border border-amber-400/40 dark:border-[#F59E0B]',
    description: 'Học viên không đến tập.',
  },
};

