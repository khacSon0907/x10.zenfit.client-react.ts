import axiosClient from './axiosClient';
import type { ApiResponse } from '../types/auth';
import type {
  ImageSignatureRequest,
  ImageSignatureResponse,
  ImageTargetType,
} from '../types/image.types';
import { uploadImageToCloudinary } from '../services/imageService';

/**
 * ============================================================================
 * IMAGE API SERVICE
 * Quản lý các endpoint giao tiếp với Backend cho việc xử lý ảnh
 * ============================================================================
 */
export const imageApi = {
  /**
   * Xin cấp chữ ký số (Signature) từ Backend để upload trực tiếp lên Cloudinary
   * Endpoint: POST /api/images/signature
   * Header Authorization: Tự động gắn Bearer Token qua axiosClient request interceptor
   * 
   * @param targetType Loại ảnh cần upload (USER_AVATAR, CLIENT_AVATAR, PRODUCT, ...)
   * @returns Dữ liệu chữ ký, API key, timestamp và folder đích
   */
  getSignature: async (targetType: ImageTargetType = 'USER_AVATAR'): Promise<ImageSignatureResponse> => {
    const payload: ImageSignatureRequest = { targetType };
    const response = await axiosClient.post<ApiResponse<ImageSignatureResponse>>(
      '/api/images/signature',
      payload
    );
    return response.data.data;
  },

  /**
   * Upload ảnh đại diện khách hàng (CLIENT_AVATAR) lên Cloudinary:
   * 1. Kiểm tra dung lượng file (tối đa 5MB) và định dạng (image/*).
   * 2. Gọi POST /api/images/signature với { targetType: "CLIENT_AVATAR" }.
   * 3. Gửi file trực tiếp lên Cloudinary với chữ ký số nhận được.
   * 4. Trả về secure_url.
   * 
   * @param file File ảnh được chọn
   * @returns secure_url ảnh trên Cloudinary
   */
  uploadClientAvatar: async (file: File): Promise<string> => {
    const uploadRes = await uploadImageToCloudinary(file, 'CLIENT_AVATAR');
    return uploadRes.secure_url;
  },
};

export const getImageSignature = imageApi.getSignature;
export const uploadClientAvatar = imageApi.uploadClientAvatar;
export default imageApi;
