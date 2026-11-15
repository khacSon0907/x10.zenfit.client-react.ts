import axiosClient from './axiosClient';
import type { ApiResponse, UserProfile, UpdateUserRequest, UpdateUserResponse } from '../types/user.types';

/**
 * ============================================================================
 * USER API SERVICE
 * ============================================================================
 * Endpoint GET /api/user/me: Lấy thông tin người dùng đang đăng nhập
 * Endpoint PUT /api/user/me/update: Cập nhật thông tin cá nhân
 */
export const userApi = {
  /**
   * Lấy thông tin user đang đăng nhập hiện tại
   * @returns Promise<UserProfile>
   */
  getMe: async (): Promise<UserProfile> => {
    const response = await axiosClient.get<ApiResponse<UserProfile>>('/api/user/me');
    return response.data.data;
  },

  /**
   * Cập nhật thông tin cá nhân của người dùng hiện tại
   * Endpoint: PUT /api/user/me/update
   * @param request UpdateUserRequest (username, phoneNumber, avatarUrl, birthday)
   * @returns Promise<UpdateUserResponse>
   */
  updateMe: async (request: UpdateUserRequest): Promise<UpdateUserResponse> => {
    const response = await axiosClient.put<ApiResponse<UpdateUserResponse>>(
      '/api/user/me/update',
      request
    );
    return response.data.data;
  },

  /**
   * Lấy danh sách tất cả người dùng trong hệ thống (Dành cho Admin)
   * Endpoint: GET /api/users/all
   * @returns Promise<UserProfile[]>
   */
  getAllUsers: async (): Promise<UserProfile[]> => {
    try {
      const response = await axiosClient.get<ApiResponse<UserProfile[]> | UserProfile[]>('/api/users/all');
      if (response.data && typeof response.data === 'object' && 'data' in response.data) {
        return (response.data as ApiResponse<UserProfile[]>).data ?? [];
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 404) {
        const fallbackRes = await axiosClient.get<ApiResponse<UserProfile[]> | UserProfile[]>('/api/users');
        if (fallbackRes.data && typeof fallbackRes.data === 'object' && 'data' in fallbackRes.data) {
          return (fallbackRes.data as ApiResponse<UserProfile[]>).data ?? [];
        }
        if (Array.isArray(fallbackRes.data)) {
          return fallbackRes.data;
        }
      }
      throw err;
    }
  },
};

export const getMe = userApi.getMe;
export const updateMe = userApi.updateMe;
export const getAllUsers = userApi.getAllUsers;
export default userApi;

