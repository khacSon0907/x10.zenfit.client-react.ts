import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  TrainerTask,
  CreateTrainerTaskRequest,
  UpdateTrainerTaskRequest,
  UpdateTrainerTaskStatusRequest,
  TrainerTaskFilterParams,
  TrainerTaskStatus,
} from '../types/session.types';

/**
 * ============================================================================
 * TRAINER TASK API SERVICE
 * Quản lý hoạt động cá nhân / công việc của Huấn luyện viên
 * Backend endpoint: /api/trainer-tasks
 * ============================================================================
 */
export const trainerTaskApi = {
  /**
   * 1. Tạo hoạt động / công việc mới
   * POST /api/trainer-tasks
   */
  create: async (data: CreateTrainerTaskRequest): Promise<TrainerTask> => {
    const response = await axiosClient.post<ApiResponse<TrainerTask>>(
      '/api/trainer-tasks',
      data
    );
    return response.data.data;
  },

  /**
   * 2. Lấy danh sách hoạt động / công việc
   * GET /api/trainer-tasks
   */
  getTasks: async (params?: TrainerTaskFilterParams): Promise<TrainerTask[]> => {
    const response = await axiosClient.get<ApiResponse<TrainerTask[]>>(
      '/api/trainer-tasks',
      { params }
    );
    return response.data.data || [];
  },

  /**
   * 3. Lấy chi tiết hoạt động theo ID
   * GET /api/trainer-tasks/{id}
   */
  getById: async (id: string): Promise<TrainerTask> => {
    const response = await axiosClient.get<ApiResponse<TrainerTask>>(
      `/api/trainer-tasks/${id}`
    );
    return response.data.data;
  },

  /**
   * 4. Cập nhật thông tin hoạt động
   * PATCH /api/trainer-tasks/{id}
   */
  update: async (
    id: string,
    data: UpdateTrainerTaskRequest
  ): Promise<TrainerTask> => {
    const response = await axiosClient.patch<ApiResponse<TrainerTask>>(
      `/api/trainer-tasks/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * 5. Cập nhật nhanh trạng thái (TODO, DONE, SKIPPED)
   * PATCH /api/trainer-tasks/{id}/status
   */
  updateStatus: async (
    id: string,
    status: TrainerTaskStatus
  ): Promise<TrainerTask> => {
    const payload: UpdateTrainerTaskStatusRequest = { status };
    const response = await axiosClient.patch<ApiResponse<TrainerTask>>(
      `/api/trainer-tasks/${id}/status`,
      payload
    );
    return response.data.data;
  },

  /**
   * 6. Xóa hoạt động
   * DELETE /api/trainer-tasks/{id}
   */
  delete: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/api/trainer-tasks/${id}`);
  },
};

export default trainerTaskApi;

