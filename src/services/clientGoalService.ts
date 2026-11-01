import axiosClient from '../api/axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  ClientGoal,
  CreateClientGoalRequest,
  UpdateClientGoalRequest,
  GoalPhaseStatus,
} from '../types/clientGoal';

/**
 * ============================================================================
 * CLIENT GOAL SERVICE LAYER (services/clientGoalService.ts)
 * Giao tiếp với các endpoint Backend /api/client-goals
 * ============================================================================
 */
export const clientGoalService = {
  /**
   * 1. Tạo mục tiêu mới cho học viên
   * POST /api/client-goals
   */
  createGoal: async (data: CreateClientGoalRequest): Promise<ClientGoal> => {
    const res = await axiosClient.post<ApiResponse<ClientGoal>>('/api/client-goals', data);
    return res.data.data;
  },

  /**
   * 2. Lấy chi tiết mục tiêu theo ID
   * GET /api/client-goals/:id
   */
  getGoalById: async (id: string): Promise<ClientGoal> => {
    const res = await axiosClient.get<ApiResponse<ClientGoal>>(`/api/client-goals/${id}`);
    return res.data.data;
  },

  /**
   * 3. Lấy tất cả mục tiêu của một Client
   * GET /api/client-goals/client/:clientId
   */
  getGoalsByClientId: async (clientId: string): Promise<ClientGoal[]> => {
    const res = await axiosClient.get<ApiResponse<ClientGoal[]>>(
      `/api/client-goals/client/${clientId}`
    );
    return res.data.data ?? [];
  },

  /**
   * 4. Lấy mục tiêu ACTIVE hiện tại của Client (trả về null nếu chưa có)
   * GET /api/client-goals/client/:clientId/active
   */
  getActiveGoalByClientId: async (clientId: string): Promise<ClientGoal | null> => {
    try {
      const res = await axiosClient.get<ApiResponse<ClientGoal>>(
        `/api/client-goals/client/${clientId}/active`
      );
      return res.data.data ?? null;
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'response' in err &&
        (err as { response?: { status?: number } }).response?.status === 404
      ) {
        return null;
      }
      throw err;
    }
  },

  /**
   * 5. Lọc danh sách mục tiêu
   * GET /api/client-goals?clientId={clientId}&status={status}
   */
  getAllGoals: async (
    clientId?: string,
    status?: GoalPhaseStatus
  ): Promise<ClientGoal[]> => {
    const res = await axiosClient.get<ApiResponse<ClientGoal[]>>('/api/client-goals', {
      params: {
        ...(clientId ? { clientId } : {}),
        ...(status ? { status } : {}),
      },
    });
    return res.data.data ?? [];
  },

  /**
   * 6. Cập nhật mục tiêu
   * PUT /api/client-goals/:id
   */
  updateGoal: async (id: string, data: UpdateClientGoalRequest): Promise<ClientGoal> => {
    const res = await axiosClient.put<ApiResponse<ClientGoal>>(`/api/client-goals/${id}`, data);
    return res.data.data;
  },

  /**
   * 7. Xóa mục tiêu
   * DELETE /api/client-goals/:id
   */
  deleteGoal: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/api/client-goals/${id}`);
  },
};

export default clientGoalService;

