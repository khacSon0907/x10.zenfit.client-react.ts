import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  TrainingSession,
  TrainingSessionCalendarResponse,
  PaginatedTrainingSessionResponse,
  CreateTrainingSessionRequest,
  UpdateTrainingSessionRequest,
  CompleteTrainingSessionRequest,
  CheckInTrainingSessionRequest,
  PtCalendarQueryParams,
  TrainingSessionFilterParams,
} from '../types/session.types';

/**
 * ============================================================================
 * TRAINING SESSION API SERVICE
 * Quản lý các endpoint Buổi tập & Lịch làm việc PT
 * Backend endpoint: /api/training-sessions
 * ============================================================================
 */
export const trainingSessionApi = {
  /**
   * 1. Tạo buổi tập mới
   * POST /api/training-sessions
   */
  create: async (data: CreateTrainingSessionRequest): Promise<TrainingSession> => {
    const response = await axiosClient.post<ApiResponse<TrainingSession>>(
      '/api/training-sessions',
      data
    );
    return response.data.data;
  },

  /**
   * 2. Lấy dữ liệu Lịch làm việc (Ngày / Tuần / Tháng)
   * GET /api/training-sessions/calendar
   */
  getCalendar: async (
    params: PtCalendarQueryParams
  ): Promise<TrainingSessionCalendarResponse> => {
    const response = await axiosClient.get<ApiResponse<TrainingSessionCalendarResponse>>(
      '/api/training-sessions/calendar',
      { params }
    );
    return response.data.data;
  },

  /**
   * 3. Lấy chi tiết buổi tập theo ID
   * GET /api/training-sessions/{id}
   */
  getById: async (id: string): Promise<TrainingSession> => {
    const response = await axiosClient.get<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}`
    );
    return response.data.data;
  },

  /**
   * 4. Lấy danh sách phân trang và lọc đa tiêu chí
   * GET /api/training-sessions
   */
  getAll: async (
    params?: TrainingSessionFilterParams
  ): Promise<PaginatedTrainingSessionResponse> => {
    const response = await axiosClient.get<ApiResponse<PaginatedTrainingSessionResponse>>(
      '/api/training-sessions',
      { params }
    );
    return response.data.data;
  },

  /**
   * 5. Cập nhật thông tin buổi tập (dời ngày, đổi giờ, ghi chú)
   * PATCH /api/training-sessions/{id}
   */
  update: async (
    id: string,
    data: UpdateTrainingSessionRequest
  ): Promise<TrainingSession> => {
    const response = await axiosClient.patch<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * 6. Điểm danh Check-in buổi tập
   * PATCH /api/training-sessions/{id}/check-in
   */
  checkIn: async (
    id: string,
    payload?: CheckInTrainingSessionRequest
  ): Promise<TrainingSession> => {
    const response = await axiosClient.patch<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}/check-in`,
      payload || {}
    );
    return response.data.data;
  },

  /**
   * 7. Xác nhận Hoàn thành buổi tập (chuyển sang COMPLETED)
   * PATCH /api/training-sessions/{id}/complete
   */
  complete: async (
    id: string,
    payload?: CompleteTrainingSessionRequest
  ): Promise<TrainingSession> => {
    const response = await axiosClient.patch<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}/complete`,
      payload || {}
    );
    return response.data.data;
  },

  /**
   * 8. Đánh dấu học viên vắng mặt (chuyển sang NO_SHOW)
   * PATCH /api/training-sessions/{id}/no-show
   */
  noShow: async (id: string): Promise<TrainingSession> => {
    const response = await axiosClient.patch<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}/no-show`
    );
    return response.data.data;
  },

  /**
   * 9. Hủy buổi tập (chuyển sang CANCELLED)
   * PATCH /api/training-sessions/{id}/cancel
   */
  cancel: async (id: string): Promise<TrainingSession> => {
    const response = await axiosClient.patch<ApiResponse<TrainingSession>>(
      `/api/training-sessions/${id}/cancel`
    );
    return response.data.data;
  },
};

export default trainingSessionApi;

