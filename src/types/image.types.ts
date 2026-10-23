/**
 * ============================================================================
 * IMAGE & CLOUDINARY UPLOAD TYPES
 * Phù hợp với cơ chế Backend Signature upload trực tiếp lên Cloudinary
 * ============================================================================
 */

/**
 * Mục đích / Thực thể cần upload ảnh
 */
export const ImageTargetType = {
  USER_AVATAR: 'USER_AVATAR',
  CLIENT_AVATAR: 'CLIENT_AVATAR',
  PRODUCT: 'PRODUCT',
  CATEGORY: 'CATEGORY',
  BANNER: 'BANNER',
  REVIEW: 'REVIEW',
  REFUND: 'REFUND',
  CHAT: 'CHAT',
} as const;

export type ImageTargetType = (typeof ImageTargetType)[keyof typeof ImageTargetType];

/**
 * Request gửi lên Backend để xin chữ ký số (Signature)
 * Endpoint: POST /api/images/signature
 */
export interface ImageSignatureRequest {
  targetType: ImageTargetType;
}

/**
 * DTO dữ liệu chữ ký trả về từ Backend (nằm trong ApiResponse.data)
 */
export interface ImageSignatureResponse {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
}

/**
 * DTO phản hồi từ Cloudinary API sau khi tải ảnh thành công
 * Endpoint: POST https://api.cloudinary.com/v1_1/:cloudName/image/upload
 */
export interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  tags?: string[];
  bytes: number;
  type: string;
  etag: string;
  placeholder: boolean;
  url: string;
  secure_url: string;
  folder?: string;
  original_filename?: string;
  asset_id?: string;
}

/**
 * Cấu hình kiểm tra tính hợp lệ của file ảnh
 */
export interface ImageValidationOptions {
  /** Kích thước tối đa theo bytes, mặc định 5MB (5 * 1024 * 1024) */
  maxSizeBytes?: number;
  /** Danh sách MIME types được chấp nhận */
  allowedMimeTypes?: string[];
  /** Danh sách đuôi mở rộng được chấp nhận (ví dụ: ['.png', '.jpg', '.jpeg', '.webp']) */
  allowedExtensions?: string[];
}

/**
 * Kết quả kiểm tra file
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Cấu hình tùy chọn khi upload ảnh
 */
export interface UploadImageOptions {
  /** Mục đích upload ảnh, mặc định USER_AVATAR */
  targetType?: ImageTargetType;
  /** Cấu hình validation tùy chỉnh */
  validation?: ImageValidationOptions;
  /** Callback theo dõi tiến độ tải lên (0 - 100) */
  onProgress?: (percent: number) => void;
  /** Signal hủy request nếu cần */
  signal?: AbortSignal;
}
