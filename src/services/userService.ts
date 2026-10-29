import axiosClient from '../api/axiosClient';
import { uploadAvatarToCloudinary } from './imageService';
import type { ApiResponse, UpdateUserRequest, UpdateUserResponse } from '../types/user.types';

export { uploadAvatarToCloudinary };

/**
 * Cập nhật thông tin cá nhân của người dùng hiện tại
 * 1. Nếu có newAvatarFile: upload trực tiếp lên Cloudinary trước qua Backend Signature
 * 2. Gọi PUT /api/users/me/update (hoặc /api/users/me) để lưu dữ liệu
 * 
 * @param data Dữ liệu cập nhật (username, phoneNumber, avatarUrl, birthday)
 * @param newAvatarFile File ảnh đại diện mới nếu người dùng vừa chọn đổi
 * @returns Promise<UpdateUserResponse>
 */
export const updateCurrentUserProfile = async (
  data: UpdateUserRequest,
  newAvatarFile?: File | null
): Promise<UpdateUserResponse> => {
  let finalAvatarUrl = data.avatarUrl;

  // Bước 1 & 2: Nếu có chọn file mới -> Upload lên Cloudinary để lấy secure_url
  if (newAvatarFile) {
    finalAvatarUrl = await uploadAvatarToCloudinary(newAvatarFile);
  }

  // Bước 3: Gửi payload lên Backend cập nhật user
  const payload: UpdateUserRequest = {
    ...data,
    avatarUrl: finalAvatarUrl,
  };

  try {
    const response = await axiosClient.put<ApiResponse<UpdateUserResponse>>(
      '/api/users/me/update',
      payload
    );
    return response.data.data;
  } catch (err: unknown) {
    // Hỗ trợ fallback endpoint /api/users/me nếu backend cấu hình route không có /update
    const axiosErr = err as { response?: { status?: number } };
    if (axiosErr?.response?.status === 404) {
      const response = await axiosClient.put<ApiResponse<UpdateUserResponse>>(
        '/api/users/me',
        payload
      );
      return response.data.data;
    }
    throw err;
  }
};

export const userService = {
  uploadAvatarToCloudinary,
  updateCurrentUserProfile,
};

export default userService;

