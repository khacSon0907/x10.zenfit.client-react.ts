import axios, { isAxiosError } from 'axios';
import { getImageSignature } from '../api/imageApi';
import type {
  CloudinaryUploadResponse,
  ImageTargetType,
  ImageValidationOptions,
  ImageValidationResult,
  UploadImageOptions,
} from '../types/image.types';

/**
 * ============================================================================
 * IMAGE SERVICE & CLOUDINARY UPLOADER
 * Xử lý kiểm tra file, xin chữ ký số từ Backend và upload trực tiếp lên Cloudinary
 * ============================================================================
 */

export const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
];
export const DEFAULT_ALLOWED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

/**
 * Kiểm tra tính hợp lệ của file ảnh (dung lượng, định dạng)
 */
export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): ImageValidationResult {
  const maxSizeBytes = options.maxSizeBytes ?? DEFAULT_MAX_FILE_SIZE;
  const allowedMimes = options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  const allowedExts = options.allowedExtensions ?? DEFAULT_ALLOWED_EXTENSIONS;

  // 1. Kiểm tra dung lượng
  if (file.size > maxSizeBytes) {
    const maxSizeMB = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Kích thước ảnh (${(file.size / (1024 * 1024)).toFixed(1)}MB) vượt quá giới hạn tối đa ${maxSizeMB}MB.`,
    };
  }

  // 2. Kiểm tra MIME type
  const isMimeValid = allowedMimes.includes(file.type.toLowerCase());

  // 3. Kiểm tra đuôi file phòng trường hợp browser không xác định đúng MIME
  const fileName = file.name.toLowerCase();
  const isExtensionValid = allowedExts.some((ext) => fileName.endsWith(ext));

  if (!isMimeValid && !isExtensionValid) {
    return {
      valid: false,
      error: 'Định dạng ảnh không được hỗ trợ. Vui lòng chọn ảnh định dạng PNG, JPG, JPEG hoặc WEBP.',
    };
  }

  return { valid: true };
}

/**
 * Chuyển đổi mã lỗi/object lỗi thành thông điệp thân thiện với người dùng
 */
export function formatUploadErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error;

  if (isAxiosError(error)) {
    // 1. Lỗi trả về từ Cloudinary API
    const cloudinaryError = error.response?.data?.error?.message;
    if (cloudinaryError) {
      return `Lỗi Cloudinary: ${cloudinaryError}`;
    }

    // 2. Lỗi trả về từ Backend Zenfit (ApiResponse error format)
    const backendMessage = error.response?.data?.message;
    if (backendMessage) {
      return backendMessage;
    }

    // 3. Lỗi theo mã trạng thái HTTP
    if (error.response?.status === 401) {
      return 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại để tiếp tục tải ảnh.';
    }
    if (error.response?.status === 403) {
      return 'Bạn không có quyền thực hiện thao tác tải ảnh này.';
    }
    if (error.code === 'ERR_NETWORK') {
      return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại kết nối mạng.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Đã xảy ra lỗi không xác định khi tải ảnh lên. Vui lòng thử lại.';
}

/**
 * Upload ảnh trực tiếp lên Cloudinary sử dụng Backend Signature
 * 
 * Quy trình:
 * 1. Validate file (size, format)
 * 2. Gọi Backend API POST /api/images/signature để lấy { cloudName, apiKey, timestamp, signature, folder }
 * 3. Tạo FormData chứa các tham số bảo mật
 * 4. POST trực tiếp lên Cloudinary API https://api.cloudinary.com/v1_1/:cloudName/image/upload
 * 5. Trả về kết quả đầy đủ (secure_url, public_id, ...)
 * 
 * @param file Đối tượng File ảnh được chọn
 * @param targetType Mục đích ảnh (USER_AVATAR, CLIENT_AVATAR, PRODUCT, ...)
 * @param options Cấu hình nâng cao (onProgress, signal, validation)
 * @returns CloudinaryUploadResponse chứa secure_url và metadata
 */
export async function uploadImageToCloudinary(
  file: File,
  targetType: ImageTargetType = 'USER_AVATAR',
  options?: UploadImageOptions
): Promise<CloudinaryUploadResponse> {
  // Bước 1: Validate file trước khi gửi request
  const validation = validateImageFile(file, options?.validation);
  if (!validation.valid) {
    throw new Error(validation.error || 'File không hợp lệ');
  }

  // Bước 2: Lấy thông tin chữ ký số từ Backend Zenfit
  const signatureData = await getImageSignature(targetType);
  const { cloudName, apiKey, timestamp, signature, folder } = signatureData;

  if (!cloudName || !apiKey || !signature) {
    throw new Error('Chữ ký tải ảnh trả về từ máy chủ không hợp lệ.');
  }

  // Bước 3: Đóng gói FormData theo chuẩn Cloudinary Signed Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  if (folder) {
    formData.append('folder', folder);
  }

  // Bước 4: Gửi trực tiếp lên Cloudinary bằng axios độc lập
  // (Lưu ý: KHÔNG dùng axiosClient vì axiosClient gắn Bearer token backend và baseURL localhost)
  const cloudinaryUploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const response = await axios.post<CloudinaryUploadResponse>(
    cloudinaryUploadUrl,
    formData,
    {
      signal: options?.signal,
      onUploadProgress: (progressEvent) => {
        if (options?.onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          options.onProgress(percentCompleted);
        }
      },
    }
  );

  return response.data;
}

/**
 * Helper tiện ích tải ảnh lên Cloudinary và trả về đường dẫn secure_url
 * 
 * @param file Đối tượng File ảnh được chọn
 * @param targetType Mục đích ảnh
 * @param options Cấu hình upload tùy chọn
 * @returns Đường dẫn HTTPS ảnh công khai (secure_url)
 */
export async function uploadImage(
  file: File,
  targetType: ImageTargetType = 'USER_AVATAR',
  options?: UploadImageOptions
): Promise<string> {
  const result = await uploadImageToCloudinary(file, targetType, options);
  return result.secure_url;
}

export const imageService = {
  validateFile: validateImageFile,
  formatErrorMessage: formatUploadErrorMessage,
  uploadToCloudinary: uploadImageToCloudinary,
  uploadImage,
};

export default imageService;
