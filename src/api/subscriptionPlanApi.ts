import axiosClient from './axiosClient';
import type {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  UpdateSubscriptionPlanStatusRequest,
  SubscriptionPlanFilterQuery,
  PaginatedResult,
  SelectPlanRequest,
  UserSubscriptionResponse,
} from '../types/subscriptionPlan';
import type { ApiResponse } from '../types/auth';

/**
 * ============================================================================
 * SUBSCRIPTION PLAN API SERVICE
 * Quản lý các gói thuê bao & giới hạn học viên của Huấn luyện viên (PT)
 * ============================================================================
 */
export const subscriptionPlanApi = {
  /**
   * 1. Lấy danh sách các gói dịch vụ đang hoạt động (ACTIVE) cho PT / User xem
   * GET /api/subscription-plans
   */
  getActivePlans: async (): Promise<SubscriptionPlan[]> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionPlan[]>>('/api/subscription-plans');
    return res.data.data;
  },

  /**
   * 2. Lấy thông tin gói mặc định miễn phí hiện tại
   * GET /api/subscription-plans/default
   */
  getDefaultPlan: async (): Promise<SubscriptionPlan> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionPlan>>('/api/subscription-plans/default');
    return res.data.data;
  },

  /**
   * 3. Lấy danh sách phân trang và lọc cho Quản trị viên (Chỉ ADMIN)
   * GET /api/subscription-plans/admin?keyword=&status=&page=0&size=10
   */
  getAdminPlans: async (params?: SubscriptionPlanFilterQuery): Promise<PaginatedResult<SubscriptionPlan>> => {
    const cleanParams: Record<string, unknown> = {};
    if (params?.keyword) cleanParams.keyword = params.keyword.trim();
    if (params?.status) cleanParams.status = params.status;
    cleanParams.page = params?.page ?? 0;
    cleanParams.size = params?.size ?? 10;

    const res = await axiosClient.get<ApiResponse<PaginatedResult<SubscriptionPlan>>>(
      '/api/subscription-plans/admin',
      { params: cleanParams }
    );
    return res.data.data;
  },

  /**
   * 4. Xem chi tiết gói dịch vụ theo ID
   * GET /api/subscription-plans/:id
   */
  getPlanById: async (id: string): Promise<SubscriptionPlan> => {
    const res = await axiosClient.get<ApiResponse<SubscriptionPlan>>(`/api/subscription-plans/${id}`);
    return res.data.data;
  },

  /**
   * 5. Tạo mới gói dịch vụ (Chỉ ADMIN)
   * POST /api/subscription-plans
   */
  createPlan: async (data: CreateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    const res = await axiosClient.post<ApiResponse<SubscriptionPlan>>('/api/subscription-plans', data);
    return res.data.data;
  },

  /**
   * 6. Cập nhật thông tin gói dịch vụ (Chỉ ADMIN)
   * PUT /api/subscription-plans/:id
   */
  updatePlan: async (id: string, data: UpdateSubscriptionPlanRequest): Promise<SubscriptionPlan> => {
    const res = await axiosClient.put<ApiResponse<SubscriptionPlan>>(`/api/subscription-plans/${id}`, data);
    return res.data.data;
  },

  /**
   * 7. Cập nhật trạng thái gói dịch vụ (Chỉ ADMIN)
   * PATCH /api/subscription-plans/:id/status
   */
  updatePlanStatus: async (
    id: string,
    data: UpdateSubscriptionPlanStatusRequest
  ): Promise<SubscriptionPlan> => {
    const res = await axiosClient.patch<ApiResponse<SubscriptionPlan>>(
      `/api/subscription-plans/${id}/status`,
      data
    );
    return res.data.data;
  },

  /**
   * 8. Xóa gói dịch vụ (Chỉ ADMIN, không cho xóa gói mặc định)
   * DELETE /api/subscription-plans/:id
   */
  deletePlan: async (id: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`/api/subscription-plans/${id}`);
  },

  /**
   * 9. Người dùng chọn và kích hoạt gói thuê bao
   * POST /api/user-subscriptions/select
   */
  selectSubscription: async (data: SelectPlanRequest): Promise<UserSubscriptionResponse> => {
    const res = await axiosClient.post<ApiResponse<UserSubscriptionResponse>>(
      '/api/user-subscriptions/select',
      data
    );
    return res.data.data;
  },

  /**
   * 10. Lấy thông tin gói dịch vụ hiện tại của người dùng
   * GET /api/user-subscriptions/me
   */
  getMySubscription: async (): Promise<UserSubscriptionResponse> => {
    const res = await axiosClient.get<ApiResponse<UserSubscriptionResponse>>(
      '/api/user-subscriptions/me'
    );
    return res.data.data;
  },
};

export default subscriptionPlanApi;

