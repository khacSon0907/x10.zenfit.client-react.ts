import axiosClient from '../api/axiosClient';
import type {
  ApiResponse,
  WorkoutPlan,
  WorkoutDay,
  WorkoutExercise,
  CreateWorkoutPlanRequest,
  UpdateWorkoutPlanRequest,
  WorkoutDayRequest,
  UpdateWorkoutDayRequest,
  WorkoutExerciseRequest,
  UpdateWorkoutExerciseRequest,
} from '../types/workoutPlan';

const BASE_URL = '/api/v1/workout-plans';

export const workoutPlanService = {
  /**
   * 1. Tạo giáo án mới
   * POST /api/v1/workout-plans
   */
  createPlan: async (payload: CreateWorkoutPlanRequest): Promise<ApiResponse<WorkoutPlan>> => {
    const sanitized: CreateWorkoutPlanRequest = {
      ...payload,
      startDate: payload.startDate?.trim() || undefined as unknown as string,
      endDate: payload.endDate?.trim() || undefined as unknown as string,
      trainingDays: payload.trainingDays?.map((d, index) => ({
        dayNumber: Number(d.dayNumber || index + 1),
        dayName: d.dayName?.trim(),
        description: d.description?.trim() || undefined,
        exercises: d.exercises?.map((e) => ({
          exerciseName: e.exerciseName.trim(),
          sets: Number(e.sets),
          reps: Number(e.reps),
          restSeconds: Number(e.restSeconds || 0),
          tempo: e.tempo?.trim() || '2-0-1-0',
          note: e.note?.trim() || undefined,
        })),
      })),
    };
    const res = await axiosClient.post<ApiResponse<WorkoutPlan>>(BASE_URL, sanitized);
    return res.data;
  },

  /**
   * 2. Lấy danh sách giáo án của PT đang đăng nhập
   * GET /api/v1/workout-plans
   */
  getMyPlans: async (): Promise<ApiResponse<WorkoutPlan[]>> => {
    const res = await axiosClient.get<ApiResponse<WorkoutPlan[]>>(BASE_URL);
    return res.data;
  },

  /**
   * 3. Lấy chi tiết giáo án (kèm ngày tập & bài tập)
   * GET /api/v1/workout-plans/:planId
   */
  getPlanDetail: async (planId: string): Promise<ApiResponse<WorkoutPlan>> => {
    const res = await axiosClient.get<ApiResponse<WorkoutPlan>>(`${BASE_URL}/${planId}`);
    return res.data;
  },

  /**
   * 4. Cập nhật thông tin chung giáo án
   * PUT /api/v1/workout-plans/:planId
   */
  updatePlan: async (
    planId: string,
    payload: UpdateWorkoutPlanRequest
  ): Promise<ApiResponse<WorkoutPlan>> => {
    const sanitized: UpdateWorkoutPlanRequest = {
      ...payload,
      startDate: payload.startDate?.trim() ? payload.startDate.trim() : undefined,
      endDate: payload.endDate?.trim() ? payload.endDate.trim() : undefined,
    };
    const res = await axiosClient.put<ApiResponse<WorkoutPlan>>(`${BASE_URL}/${planId}`, sanitized);
    return res.data;
  },

  /**
   * 5. Xóa giáo án
   * DELETE /api/v1/workout-plans/:planId
   */
  deletePlan: async (planId: string): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${planId}`);
    return res.data;
  },

  /**
   * 6. Lấy danh sách giáo án của một học viên
   * GET /api/v1/workout-plans/clients/:clientId
   */
  getClientPlans: async (clientId: string): Promise<ApiResponse<WorkoutPlan[]>> => {
    const res = await axiosClient.get<ApiResponse<WorkoutPlan[]>>(`${BASE_URL}/clients/${clientId}`);
    return res.data;
  },

  /**
   * 7. Thêm ngày tập vào giáo án
   * POST /api/v1/workout-plans/:planId/days
   */
  addDay: async (planId: string, payload: WorkoutDayRequest): Promise<ApiResponse<WorkoutDay>> => {
    const sanitized: WorkoutDayRequest = {
      dayNumber: Number(payload.dayNumber),
      dayName: payload.dayName.trim(),
      description: payload.description?.trim() || undefined,
      exercises: payload.exercises?.map((e) => ({
        exerciseName: e.exerciseName.trim(),
        sets: Number(e.sets),
        reps: Number(e.reps),
        restSeconds: Number(e.restSeconds || 0),
        tempo: e.tempo?.trim() || '2-0-1-0',
        note: e.note?.trim() || undefined,
      })),
    };
    const res = await axiosClient.post<ApiResponse<WorkoutDay>>(`${BASE_URL}/${planId}/days`, sanitized);
    return res.data;
  },

  /**
   * 8. Cập nhật ngày tập
   * PUT /api/v1/workout-plans/:planId/days/:dayId
   */
  updateDay: async (
    planId: string,
    dayId: string,
    payload: UpdateWorkoutDayRequest
  ): Promise<ApiResponse<WorkoutDay>> => {
    const sanitized: UpdateWorkoutDayRequest = {
      dayNumber: payload.dayNumber !== undefined ? Number(payload.dayNumber) : undefined,
      dayName: payload.dayName?.trim() || undefined,
      description: payload.description?.trim() || undefined,
    };
    const res = await axiosClient.put<ApiResponse<WorkoutDay>>(
      `${BASE_URL}/${planId}/days/${dayId}`,
      sanitized
    );
    return res.data;
  },

  /**
   * 9. Xóa ngày tập
   * DELETE /api/v1/workout-plans/:planId/days/:dayId
   */
  deleteDay: async (planId: string, dayId: string): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${planId}/days/${dayId}`);
    return res.data;
  },

  /**
   * 10. Thêm bài tập vào ngày tập
   * POST /api/v1/workout-plans/:planId/days/:dayId/exercises
   */
  addExercise: async (
    planId: string,
    dayId: string,
    payload: WorkoutExerciseRequest
  ): Promise<ApiResponse<WorkoutExercise>> => {
    const sanitized: WorkoutExerciseRequest = {
      exerciseName: payload.exerciseName.trim(),
      sets: Number(payload.sets),
      reps: Number(payload.reps),
      restSeconds: Number(payload.restSeconds || 0),
      tempo: payload.tempo.trim() || '2-0-1-0',
      note: payload.note?.trim() || undefined,
    };
    const res = await axiosClient.post<ApiResponse<WorkoutExercise>>(
      `${BASE_URL}/${planId}/days/${dayId}/exercises`,
      sanitized
    );
    return res.data;
  },

  /**
   * 11. Cập nhật bài tập
   * PUT /api/v1/workout-plans/:planId/days/:dayId/exercises/:exerciseId
   */
  updateExercise: async (
    planId: string,
    dayId: string,
    exerciseId: string,
    payload: UpdateWorkoutExerciseRequest
  ): Promise<ApiResponse<WorkoutExercise>> => {
    const sanitized: UpdateWorkoutExerciseRequest = {
      exerciseName: payload.exerciseName?.trim() || undefined,
      sets: payload.sets !== undefined ? Number(payload.sets) : undefined,
      reps: payload.reps !== undefined ? Number(payload.reps) : undefined,
      restSeconds: payload.restSeconds !== undefined ? Number(payload.restSeconds) : undefined,
      tempo: payload.tempo?.trim() || undefined,
      note: payload.note !== undefined ? payload.note.trim() : undefined,
    };
    const res = await axiosClient.put<ApiResponse<WorkoutExercise>>(
      `${BASE_URL}/${planId}/days/${dayId}/exercises/${exerciseId}`,
      sanitized
    );
    return res.data;
  },

  /**
   * 12. Xóa bài tập
   * DELETE /api/v1/workout-plans/:planId/days/:dayId/exercises/:exerciseId
   */
  deleteExercise: async (
    planId: string,
    dayId: string,
    exerciseId: string
  ): Promise<ApiResponse<void>> => {
    const res = await axiosClient.delete<ApiResponse<void>>(
      `${BASE_URL}/${planId}/days/${dayId}/exercises/${exerciseId}`
    );
    return res.data;
  },
};

export default workoutPlanService;

