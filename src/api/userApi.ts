import axiosClient from './axiosClient';
import type { ApiResponse, UserProfile } from '../types/user.types';

/**
 * ============================================================================
 * USER API SERVICE
 * ============================================================================
 * Endpoint GET /api/user/me: Lấy thông tin người dùng đang đăng nhập
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
};

export const getMe = userApi.getMe;
export default userApi;
