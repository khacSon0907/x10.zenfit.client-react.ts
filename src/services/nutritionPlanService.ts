import axiosClient from '../api/axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  NutritionPlan,
  NutritionFood,
  DailyMacroTarget,
  NutritionMacroSummary,
  CreateNutritionPlanRequest,
  UpdateNutritionPlanRequest,
  NutritionFoodRequest,
  UpdateNutritionFoodRequest,
  UpdateMacroTargetRequest,
} from '../types/nutrition';
import type { ClientResponse } from '../types/client.types';

const BASE_URL = '/api/v1/nutrition-plans';

export const nutritionPlanService = {
  /**
   * 1. Lấy danh sách kế hoạch dinh dưỡng của PT hiện tại
   * GET /api/v1/nutrition-plans
   */
  getMyPlans: async (): Promise<NutritionPlan[]> => {
    const res = await axiosClient.get<ApiResponse<NutritionPlan[]>>(BASE_URL);
    return res.data.data ?? [];
  },

  /**
   * 2. Lấy chi tiết kế hoạch dinh dưỡng (kèm danh sách món ăn & thống kê macro)
   * GET /api/v1/nutrition-plans/:planId
   */
  getPlanDetail: async (planId: string): Promise<NutritionPlan> => {
    const res = await axiosClient.get<ApiResponse<NutritionPlan>>(`${BASE_URL}/${planId}`);
    return res.data.data;
  },

  /**
   * 3. Lấy danh sách kế hoạch dinh dưỡng theo học viên
   * GET /api/v1/nutrition-plans/clients/:clientId
   */
  getClientPlans: async (clientId: string): Promise<NutritionPlan[]> => {
    const res = await axiosClient.get<ApiResponse<NutritionPlan[]>>(`${BASE_URL}/clients/${clientId}`);
    return res.data.data ?? [];
  },

  /**
   * 4. Tạo kế hoạch dinh dưỡng mới
   * POST /api/v1/nutrition-plans
   */
  createPlan: async (payload: CreateNutritionPlanRequest): Promise<NutritionPlan> => {
    const sanitized = {
      ...payload,
      startDate: payload.startDate?.trim() ? payload.startDate.trim() : undefined,
      endDate: payload.endDate?.trim() ? payload.endDate.trim() : undefined,
      dailyMacroTarget: payload.dailyMacroTarget
        ? {
            calories: Number(payload.dailyMacroTarget.calories),
            protein: Number(payload.dailyMacroTarget.protein),
            carbs: Number(payload.dailyMacroTarget.carbs),
            fat: Number(payload.dailyMacroTarget.fat),
          }
        : undefined,
    };
    const res = await axiosClient.post<ApiResponse<NutritionPlan>>(BASE_URL, sanitized);
    return res.data.data;
  },

  /**
   * 5. Cập nhật thông tin kế hoạch dinh dưỡng
   * PUT /api/v1/nutrition-plans/:planId
   */
  updatePlan: async (
    planId: string,
    payload: UpdateNutritionPlanRequest
  ): Promise<NutritionPlan> => {
    const sanitized = {
      ...payload,
      startDate: payload.startDate?.trim() ? payload.startDate.trim() : undefined,
      endDate: payload.endDate?.trim() ? payload.endDate.trim() : undefined,
    };
    const res = await axiosClient.put<ApiResponse<NutritionPlan>>(`${BASE_URL}/${planId}`, sanitized);
    return res.data.data;
  },

  /**
   * 6. Xóa kế hoạch dinh dưỡng
   * DELETE /api/v1/nutrition-plans/:planId
   */
  deletePlan: async (planId: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${planId}`);
  },

  /**
   * 7. Thêm món ăn vào kế hoạch
   * POST /api/v1/nutrition-plans/:planId/foods
   */
  addFood: async (planId: string, payload: NutritionFoodRequest): Promise<NutritionFood> => {
    const sanitized: NutritionFoodRequest = {
      mealType: payload.mealType,
      foodName: payload.foodName?.trim(),
      quantity: Number(payload.quantity),
      unit: payload.unit?.trim() || undefined,
      calories: Number(payload.calories || 0),
      protein: Number(payload.protein || 0),
      carbs: Number(payload.carbs || 0),
      fat: Number(payload.fat || 0),
      note: payload.note?.trim() || undefined,
    };
    const res = await axiosClient.post<ApiResponse<NutritionFood>>(
      `${BASE_URL}/${planId}/foods`,
      sanitized
    );
    return res.data.data;
  },

  /**
   * 8. Cập nhật món ăn trong kế hoạch
   * PUT /api/v1/nutrition-plans/:planId/foods/:foodId
   */
  updateFood: async (
    planId: string,
    foodId: string,
    payload: UpdateNutritionFoodRequest
  ): Promise<NutritionFood> => {
    const sanitized: UpdateNutritionFoodRequest = {
      mealType: payload.mealType,
      foodName: payload.foodName !== undefined ? payload.foodName.trim() : undefined,
      quantity: payload.quantity !== undefined ? Number(payload.quantity) : undefined,
      unit: payload.unit !== undefined ? payload.unit.trim() : undefined,
      calories: payload.calories !== undefined ? Number(payload.calories) : undefined,
      protein: payload.protein !== undefined ? Number(payload.protein) : undefined,
      carbs: payload.carbs !== undefined ? Number(payload.carbs) : undefined,
      fat: payload.fat !== undefined ? Number(payload.fat) : undefined,
      note: payload.note !== undefined ? payload.note.trim() : undefined,
    };
    const res = await axiosClient.put<ApiResponse<NutritionFood>>(
      `${BASE_URL}/${planId}/foods/${foodId}`,
      sanitized
    );
    return res.data.data;
  },

  /**
   * 9. Xóa món ăn khỏi kế hoạch
   * DELETE /api/v1/nutrition-plans/:planId/foods/:foodId
   */
  deleteFood: async (planId: string, foodId: string): Promise<void> => {
    await axiosClient.delete<ApiResponse<void>>(`${BASE_URL}/${planId}/foods/${foodId}`);
  },

  /**
   * 10. Cập nhật Macro mục tiêu trong ngày
   * PUT /api/v1/nutrition-plans/:planId/macro-target
   */
  updateMacroTarget: async (
    planId: string,
    payload: UpdateMacroTargetRequest
  ): Promise<DailyMacroTarget> => {
    const sanitized: UpdateMacroTargetRequest = {
      calories: Number(payload.calories),
      protein: Number(payload.protein),
      carbs: Number(payload.carbs),
      fat: Number(payload.fat),
    };
    const res = await axiosClient.put<ApiResponse<DailyMacroTarget>>(
      `${BASE_URL}/${planId}/macro-target`,
      sanitized
    );
    return res.data.data;
  },

  /**
   * 11. Lấy thống kê Macro & % hoàn thành
   * GET /api/v1/nutrition-plans/:planId/macro-summary
   */
  getMacroSummary: async (planId: string): Promise<NutritionMacroSummary> => {
    const res = await axiosClient.get<ApiResponse<NutritionMacroSummary>>(
      `${BASE_URL}/${planId}/macro-summary`
    );
    return res.data.data;
  },

  /**
   * 12. Lấy danh sách học viên của PT (hỗ trợ dropdown chọn Client khi tạo kế hoạch)
   * GET /api/clients (tự động phân quyền và cách ly dữ liệu theo PT đăng nhập)
   */
  getMyClients: async (trainerId?: string): Promise<ClientResponse[]> => {
    try {
      const res = await axiosClient.get<ApiResponse<ClientResponse[]>>('/api/clients', {
        params: trainerId ? { trainerId } : undefined,
      });
      return res.data.data ?? [];
    } catch {
      return [];
    }
  },
};

export default nutritionPlanService;

