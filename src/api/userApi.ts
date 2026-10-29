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
};

export const getMe = userApi.getMe;
export const updateMe = userApi.updateMe;
export default userApi;

