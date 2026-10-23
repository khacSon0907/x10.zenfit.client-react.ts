import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import {
  uploadImageToCloudinary,
  formatUploadErrorMessage,
  validateImageFile,
} from '../services/imageService';
import type {
  CloudinaryUploadResponse,
  ImageTargetType,
  ImageValidationOptions,
} from '../types/image.types';

export interface UseImageUploadOptions {
  /** Mục đích upload ảnh mặc định (mặc định: USER_AVATAR) */
  defaultTargetType?: ImageTargetType;
  /** Cấu hình kiểm tra tính hợp lệ của file (kích thước tối đa, định dạng) */
  validation?: ImageValidationOptions;
  /** Tự động hiển thị toast thông báo qua sonner (mặc định: true) */
  showToast?: boolean;
  /** Callback được gọi khi tải ảnh thành công */
  onSuccess?: (secureUrl: string, data: CloudinaryUploadResponse) => void;
  /** Callback được gọi khi gặp lỗi */
  onError?: (error: Error, message: string) => void;
}

export interface UseImageUploadReturn {
  /** Trạng thái đang tải ảnh lên */
  isUploading: boolean;
  /** Tiến độ tải lên theo phần trăm (0 - 100) */
  progress: number;
  /** Lỗi gần nhất nếu có (dạng text dễ hiểu) */
  error: string | null;
  /** URL ảnh preview cục bộ (Blob/Object URL) */
  previewUrl: string | null;
  /** URL ảnh an toàn trên Cloudinary sau khi upload thành công */
  uploadedUrl: string | null;
  /** Metadata chi tiết từ Cloudinary */
  uploadData: CloudinaryUploadResponse | null;
  /**
   * Hàm thực hiện tải ảnh
   * @param file File ảnh được chọn
   * @param overrideTargetType Ghi đè loại mục đích upload nếu muốn
   */
  upload: (
    file: File,
    overrideTargetType?: ImageTargetType
  ) => Promise<CloudinaryUploadResponse | null>;
  /** Reset lại toàn bộ trạng thái về ban đầu */
  reset: () => void;
  /** Set thủ công URL preview (ví dụ truyền ảnh ban đầu từ user profile) */
  setPreviewUrl: (url: string | null) => void;
}

/**
 * Custom Hook quản lý toàn bộ vòng đời tải ảnh lên Cloudinary
 */
export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const {
    defaultTargetType = 'USER_AVATAR',
    validation,
    showToast = true,
    onSuccess,
    onError,
  } = options;

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrlState] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadData, setUploadData] = useState<CloudinaryUploadResponse | null>(null);

  // Ref lưu ObjectURL để giải phóng bộ nhớ khi unmount hoặc đổi ảnh
  const objectUrlRef = useRef<string | null>(null);
  // Ref lưu AbortController để huỷ request nếu người dùng chọn ảnh mới khi đang upload
  const abortControllerRef = useRef<AbortController | null>(null);

  // Dọn dẹp ObjectURL
  const cleanupObjectURL = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      cleanupObjectURL();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [cleanupObjectURL]);

  const setPreviewUrl = useCallback(
    (url: string | null) => {
      cleanupObjectURL();
      setPreviewUrlState(url);
    },
    [cleanupObjectURL]
  );

  const reset = useCallback(() => {
    cleanupObjectURL();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setPreviewUrlState(null);
    setUploadedUrl(null);
    setUploadData(null);
  }, [cleanupObjectURL]);

  const upload = useCallback(
    async (
      file: File,
      overrideTargetType?: ImageTargetType
    ): Promise<CloudinaryUploadResponse | null> => {
      // 1. Kiểm tra tính hợp lệ trước khi bắt đầu
      const validationResult = validateImageFile(file, validation);
      if (!validationResult.valid) {
        const errorMsg = validationResult.error || 'Ảnh không hợp lệ';
        setError(errorMsg);
        if (showToast) {
          toast.error(errorMsg);
        }
        onError?.(new Error(errorMsg), errorMsg);
        return null;
      }

      // 2. Tạo Preview ngay lập tức từ ObjectURL để trải nghiệm mượt mà
      cleanupObjectURL();
      const localBlobUrl = URL.createObjectURL(file);
      objectUrlRef.current = localBlobUrl;
      setPreviewUrlState(localBlobUrl);

      // Huỷ request cũ nếu đang chạy
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // 3. Khởi tạo trạng thái upload
      setIsUploading(true);
      setProgress(0);
      setError(null);

      try {
        const targetType = overrideTargetType || defaultTargetType;
        const result = await uploadImageToCloudinary(file, targetType, {
          validation,
          signal: controller.signal,
          onProgress: (percent) => {
            setProgress(percent);
          },
        });

        // Tải ảnh thành công
        setUploadedUrl(result.secure_url);
        setUploadData(result);
        setProgress(100);
        setIsUploading(false);

        if (showToast) {
          toast.success('Tải ảnh đại diện lên thành công!');
        }

        onSuccess?.(result.secure_url, result);
        return result;
      } catch (err: unknown) {
        // Nếu bị huỷ do người dùng chọn ảnh khác, không xem là lỗi
        if (controller.signal.aborted) {
          return null;
        }

        const friendlyMsg = formatUploadErrorMessage(err);
        setError(friendlyMsg);
        setIsUploading(false);
        setProgress(0);

        if (showToast) {
          toast.error(friendlyMsg);
        }

        onError?.(err instanceof Error ? err : new Error(friendlyMsg), friendlyMsg);
        return null;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [cleanupObjectURL, defaultTargetType, onError, onSuccess, showToast, validation]
  );

  return {
    isUploading,
    progress,
    error,
    previewUrl,
    uploadedUrl,
    uploadData,
    upload,
    reset,
    setPreviewUrl,
  };
}

export default useImageUpload;
