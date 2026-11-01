/**
 * ============================================================================
 * CLIENT GOAL TYPES & INTERFACES (types/clientGoal.ts)
 * Hệ thống Quản lý Mục tiêu học viên (Client Goals) theo từng giai đoạn
 * ============================================================================
 */

export type GoalPhaseStatus = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface ClientGoal {
  id: string;
  clientId: string;
  trainerId: string;
  goalName: string;
  goalType: string; // Kiểu string tự do: "Giảm cân", "Tăng cơ", "Duy trì", v.v.
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD" (Ngày kết thúc dự kiến)
  actualEndDate?: string | null; // "YYYY-MM-DD" (Ngày kết thúc thực tế)
  startWeight: number; // kg
  targetWeight: number; // kg
  endWeight?: number | null; // kg (khi hoàn thành)
  status: GoalPhaseStatus;
  note?: string | null;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface CreateClientGoalRequest {
  clientId: string;
  trainerId: string;
  goalName: string;
  goalType: string; // string tự do
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  startWeight: number;
  targetWeight: number;
  status?: GoalPhaseStatus;
  note?: string;
}

export interface UpdateClientGoalRequest {
  trainerId?: string;
  goalName?: string;
  goalType?: string;
  startDate?: string;
  endDate?: string;
  actualEndDate?: string;
  startWeight?: number;
  targetWeight?: number;
  endWeight?: number;
  status?: GoalPhaseStatus;
  note?: string;
}

/**
 * Metadata hiển thị nhãn tiếng Việt và màu sắc theo trạng thái mục tiêu
 */
export const GOAL_PHASE_STATUS_CONFIG: Record<
  GoalPhaseStatus,
  { label: string; color: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: 'Đang diễn ra',
    color: 'emerald',
    badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    dotClass: 'bg-emerald-500 animate-pulse',
  },
  PLANNED: {
    label: 'Dự kiến',
    color: 'amber',
    badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-500/30',
    dotClass: 'bg-amber-500',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    color: 'blue',
    badgeClass: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-500/30',
    dotClass: 'bg-blue-500',
  },
  CANCELLED: {
    label: 'Đã hủy',
    color: 'rose',
    badgeClass: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-500/30',
    dotClass: 'bg-rose-500',
  },
};

/**
 * Gợi ý nhanh các loại mục tiêu phổ biến (Goal Type Quick Suggestions)
 */
export const GOAL_TYPE_SUGGESTIONS = [
  'Giảm mỡ',
  'Tăng cơ (Bulking)',
  'Siết cơ (Cutting)',
  'Duy trì thể trạng',
  'Phục hồi sau chấn thương',
  'Tập thể lực thi đấu',
  'Tăng độ dẻo dai & linh hoạt',
  'Cải thiện tư thế & cột sống',
];

