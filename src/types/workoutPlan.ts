export type WorkoutPlanStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface WorkoutExercise {
  id: string;
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
  tempo: string; // Ví dụ: "3-0-1-0", "2-1-1-0"
  note?: string;
}

export interface WorkoutDay {
  id: string;
  dayNumber: number;
  dayName: string; // Ví dụ: "Buổi 1: Ngực & Tay sau", "Thứ 2: Thân trên"
  description?: string;
  exercises: WorkoutExercise[];
}

export interface WorkoutPlan {
  id: string;
  trainerId: string;
  clientId: string;
  clientName?: string;
  name: string;
  description?: string;
  startDate: string; // ISO date "YYYY-MM-DD"
  endDate: string; // ISO date "YYYY-MM-DD"
  status: WorkoutPlanStatus;
  trainingDays: WorkoutDay[];
  totalDays?: number;
  totalExercises?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutExerciseRequest {
  exerciseName: string;
  sets: number;
  reps: number;
  restSeconds: number;
  tempo: string;
  note?: string;
}

export interface UpdateWorkoutExerciseRequest {
  exerciseName?: string;
  sets?: number;
  reps?: number;
  restSeconds?: number;
  tempo?: string;
  note?: string;
}

export interface WorkoutDayRequest {
  dayNumber: number;
  dayName: string;
  description?: string;
  exercises?: WorkoutExerciseRequest[];
}

export interface UpdateWorkoutDayRequest {
  dayNumber?: number;
  dayName?: string;
  description?: string;
}

export interface CreateWorkoutPlanRequest {
  clientId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status?: WorkoutPlanStatus;
  trainingDays?: WorkoutDayRequest[];
}

export interface UpdateWorkoutPlanRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status?: WorkoutPlanStatus;
}

export interface ApiResponse<T> {
  success?: boolean;
  code: string;
  message: string;
  data: T;
  timestamp?: string;
}

export const WORKOUT_PLAN_STATUS_CONFIG: Record<
  WorkoutPlanStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  ACTIVE: {
    label: 'Đang áp dụng',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dotClass: 'bg-emerald-400',
  },
  DRAFT: {
    label: 'Bản nháp',
    badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dotClass: 'bg-amber-400',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    badgeClass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    dotClass: 'bg-blue-400',
  },
  CANCELLED: {
    label: 'Đã hủy',
    badgeClass: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    dotClass: 'bg-rose-400',
  },
};

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  trainingDays: WorkoutDayRequest[];
}

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    id: 'push_pull_legs',
    name: '3 Buổi/tuần (Push - Pull - Legs)',
    description: 'Chia nhóm cơ đẩy, kéo và chân. Phù hợp cho đa số học viên.',
    trainingDays: [
      {
        dayNumber: 1,
        dayName: 'Buổi 1: Đẩy (Ngực - Vai - Tay sau)',
        description: 'Tập trung các chuyển động đẩy thân trên',
        exercises: [
          { exerciseName: 'Barbell Bench Press', sets: 4, reps: 8, restSeconds: 90, tempo: '3-0-1-0', note: 'Hạ thanh đòn ngực dưới' },
          { exerciseName: 'Incline Dumbbell Press', sets: 3, reps: 10, restSeconds: 60, tempo: '2-0-1-0', note: 'Ghế nghiêng 30 độ' },
          { exerciseName: 'Overhead Dumbbell Press', sets: 3, reps: 10, restSeconds: 60, tempo: '2-0-1-0', note: 'Giữ thân thẳng' },
          { exerciseName: 'Triceps Pushdown', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Khóa chặt cùi chỏ' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Buổi 2: Kéo (Lưng - Xô - Tay trước)',
        description: 'Tập trung nhóm cơ lưng và bắp tay trước',
        exercises: [
          { exerciseName: 'Lat Pulldown', sets: 4, reps: 10, restSeconds: 60, tempo: '2-0-1-1', note: 'Kéo về xương quai xanh' },
          { exerciseName: 'Seated Cable Row', sets: 3, reps: 10, restSeconds: 60, tempo: '2-0-1-1', note: 'Ép xương bả vai' },
          { exerciseName: 'Barbell Biceps Curl', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Không đung đưa người' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Buổi 3: Thân dưới & Bụng (Chân - Đùi - Core)',
        description: 'Tập trung cơ đùi trước, đùi sau, bắp chuối và cơ bụng',
        exercises: [
          { exerciseName: 'Barbell Back Squat', sets: 4, reps: 8, restSeconds: 120, tempo: '3-1-1-0', note: 'Gối hướng theo mũi chân' },
          { exerciseName: 'Romanian Deadlift', sets: 3, reps: 10, restSeconds: 90, tempo: '3-0-1-0', note: 'Đẩy hông ra sau, lưng thẳng' },
          { exerciseName: 'Leg Extension', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-1', note: 'Siết cơ tứ đầu đùi 1s' },
          { exerciseName: 'Plank', sets: 3, reps: 60, restSeconds: 45, tempo: 'Static', note: 'Giữ thẳng thân người' },
        ],
      },
    ],
  },
  {
    id: 'upper_lower_4days',
    name: '4 Buổi/tuần (Upper - Lower)',
    description: 'Tối ưu hóa tần suất kích thích cơ bắp 2 lần/tuần.',
    trainingDays: [
      {
        dayNumber: 1,
        dayName: 'Buổi 1: Thân trên A (Heavy Upper)',
        description: 'Tập trung sức mạnh thân trên',
        exercises: [
          { exerciseName: 'Barbell Bench Press', sets: 4, reps: 6, restSeconds: 120, tempo: '3-0-1-0', note: 'Tập trung mức tạ nặng' },
          { exerciseName: 'Bent-Over Barbell Row', sets: 4, reps: 6, restSeconds: 90, tempo: '2-0-1-1', note: 'Lưng thẳng song song sàn' },
          { exerciseName: 'Standing Military Press', sets: 3, reps: 8, restSeconds: 90, tempo: '2-0-1-0', note: 'Gồng chặt cơ mông và bụng' },
          { exerciseName: 'Chin-ups / Pull-ups', sets: 3, reps: 8, restSeconds: 60, tempo: '2-0-1-1', note: 'Cằm vượt qua xà' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Buổi 2: Thân dưới A (Heavy Lower)',
        description: 'Tập trung sức mạnh thân dưới',
        exercises: [
          { exerciseName: 'Barbell Back Squat', sets: 4, reps: 6, restSeconds: 120, tempo: '3-1-1-0', note: 'Hạ sâu đùi song song' },
          { exerciseName: 'Conventional Deadlift', sets: 3, reps: 5, restSeconds: 150, tempo: '2-1-1-0', note: 'Khởi động kỹ cột sống' },
          { exerciseName: 'Walking Lunges', sets: 3, reps: 12, restSeconds: 60, tempo: '2-0-1-0', note: 'Mỗi chân 12 bước' },
          { exerciseName: 'Standing Calf Raise', sets: 4, reps: 15, restSeconds: 45, tempo: '2-1-1-1', note: 'Dừng đỉnh 1s' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Buổi 3: Thân trên B (Hypertrophy Upper)',
        description: 'Tăng thể tích và cô lập nhóm cơ thân trên',
        exercises: [
          { exerciseName: 'Incline Dumbbell Press', sets: 4, reps: 10, restSeconds: 60, tempo: '2-0-1-0', note: 'Ghế 30 độ' },
          { exerciseName: 'Lat Pulldown', sets: 4, reps: 10, restSeconds: 60, tempo: '2-0-1-1', note: 'Kéo căng cơ xô' },
          { exerciseName: 'Dumbbell Lateral Raise', sets: 4, reps: 12, restSeconds: 45, tempo: '2-0-1-1', note: 'Khủy tay hơi gập nhẹ' },
          { exerciseName: 'Cable Biceps Curl', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Siết đỉnh bắp tay' },
          { exerciseName: 'Overhead Triceps Extension', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Giữ bắp tay cố định' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Buổi 4: Thân dưới B (Hypertrophy Lower)',
        description: 'Tăng cơ và độ nét cho chân đùi',
        exercises: [
          { exerciseName: 'Front Squat / Leg Press', sets: 4, reps: 10, restSeconds: 90, tempo: '3-0-1-0', note: 'Lưng thẳng đứng' },
          { exerciseName: 'Romanian Deadlift (Dumbbell)', sets: 4, reps: 10, restSeconds: 60, tempo: '3-0-1-0', note: 'Căng cơ đùi sau' },
          { exerciseName: 'Leg Curl', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-1', note: 'Gập gối dứt khoát' },
          { exerciseName: 'Hanging Leg Raise', sets: 3, reps: 15, restSeconds: 45, tempo: '2-0-1-0', note: 'Nâng chân không đung đưa' },
        ],
      },
    ],
  },
  {
    id: 'weekly_split',
    name: 'Theo tuần (Thứ 2 đến Chủ nhật)',
    description: 'Khung lịch theo từng ngày trong tuần.',
    trainingDays: [
      {
        dayNumber: 1,
        dayName: 'Thứ 2: Ngực & Tay sau',
        description: 'Khởi động tuần mới với nhóm cơ ngực và tay sau',
        exercises: [
          { exerciseName: 'Barbell Bench Press', sets: 4, reps: 10, restSeconds: 90, tempo: '3-0-1-0', note: 'Hạ chuẩn form' },
          { exerciseName: 'Incline Dumbbell Flyes', sets: 3, reps: 12, restSeconds: 60, tempo: '2-0-1-0', note: 'Căng cơ ngực' },
          { exerciseName: 'Dips (Xà kép)', sets: 3, reps: 10, restSeconds: 60, tempo: '2-0-1-0', note: 'Nghiêng người về trước' },
          { exerciseName: 'Rope Pushdown', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Tách dây ở đáy' },
        ],
      },
      {
        dayNumber: 2,
        dayName: 'Thứ 3: Lưng & Tay trước',
        description: 'Kéo lưng dày và bắp tay trước',
        exercises: [
          { exerciseName: 'Deadlift', sets: 3, reps: 6, restSeconds: 120, tempo: '2-1-1-0', note: 'Khóa hông ở đỉnh' },
          { exerciseName: 'Lat Pulldown', sets: 4, reps: 10, restSeconds: 60, tempo: '2-0-1-1', note: 'Kéo chạm ngực' },
          { exerciseName: 'Dumbbell Hammer Curl', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Tập trung cơ cẳng tay' },
        ],
      },
      {
        dayNumber: 3,
        dayName: 'Thứ 4: Nghỉ / Cardio nhẹ',
        description: 'Hồi phục tích cực và đi bộ nhẹ nhàng',
        exercises: [
          { exerciseName: 'Cardio Đi bộ dốc', sets: 1, reps: 30, restSeconds: 0, tempo: 'Moderate', note: '30 phút nhịp tim Zone 2' },
          { exerciseName: 'Giãn cơ toàn thân', sets: 1, reps: 15, restSeconds: 0, tempo: 'Static', note: '15 phút foam roller & giãn cơ' },
        ],
      },
      {
        dayNumber: 4,
        dayName: 'Thứ 5: Vai & Bụng',
        description: 'Định hình bờ vai chữ V và cơ bụng săn chắc',
        exercises: [
          { exerciseName: 'Dumbbell Shoulder Press', sets: 4, reps: 10, restSeconds: 60, tempo: '2-0-1-0', note: 'Không khóa cùi chỏ đỉnh' },
          { exerciseName: 'Cable Lateral Raise', sets: 4, reps: 12, restSeconds: 45, tempo: '2-0-1-1', note: 'Kéo góc 45 độ' },
          { exerciseName: 'Face Pulls', sets: 3, reps: 15, restSeconds: 45, tempo: '2-0-1-1', note: 'Tập vai sau và khớp vai' },
          { exerciseName: 'Cable Crunch', sets: 3, reps: 15, restSeconds: 45, tempo: '2-0-1-1', note: 'Cuộn tròn cột sống' },
        ],
      },
      {
        dayNumber: 5,
        dayName: 'Thứ 6: Chân & Mông',
        description: 'Tập trung phần đùi, mông và bắp chân',
        exercises: [
          { exerciseName: 'Barbell Back Squat', sets: 4, reps: 8, restSeconds: 90, tempo: '3-0-1-0', note: 'Đứng vững gót chân' },
          { exerciseName: 'Hip Thrust', sets: 4, reps: 10, restSeconds: 90, tempo: '2-1-1-1', note: 'Giữ đỉnh 1 giây siết mông' },
          { exerciseName: 'Leg Extension', sets: 3, reps: 12, restSeconds: 45, tempo: '2-0-1-0', note: 'Siết đùi trước' },
        ],
      },
      {
        dayNumber: 6,
        dayName: 'Thứ 7: Full Body / Thể lực',
        description: 'Rèn luyện sức bền và tim mạch',
        exercises: [
          { exerciseName: 'Kettlebell Swings', sets: 4, reps: 15, restSeconds: 45, tempo: 'Explosive', note: 'Bật hông dứt khoát' },
          { exerciseName: 'Burpees', sets: 3, reps: 12, restSeconds: 60, tempo: 'Continuous', note: 'Nhảy cao chạm tay' },
          { exerciseName: 'Battle Rope', sets: 4, reps: 30, restSeconds: 45, tempo: 'Hiit', note: '30 giây cường độ cao' },
        ],
      },
      {
        dayNumber: 7,
        dayName: 'Chủ nhật: Nghỉ ngơi',
        description: 'Nghỉ ngơi hoàn toàn, bổ sung dinh dưỡng và ngủ đủ giấc',
        exercises: [],
      },
    ],
  },
];

