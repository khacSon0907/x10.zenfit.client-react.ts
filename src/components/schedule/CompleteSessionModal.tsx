import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  FileText,
  User,
  Clock,
  Calendar,
} from 'lucide-react';
import { toast } from 'sonner';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import { uploadEvidenceImages, validateImageFile } from '../../services/imageService';
import type { TrainingSessionCalendarItem, TrainingSession } from '../../types/session.types';
import { formatDisplayDate, formatTimeRange } from '../../utils/calendarUtils';

interface CompleteSessionModalProps {
  session: TrainingSessionCalendarItem | TrainingSession | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientName?: string;
}

interface SelectedImagePreview {
  file: File;
  previewUrl: string;
}

export const CompleteSessionModal: React.FC<CompleteSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onSuccess,
  clientName,
}) => {
  const [note, setNote] = useState<string>('');
  const [selectedImages, setSelectedImages] = useState<SelectedImagePreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state khi mở modal
  useEffect(() => {
    if (isOpen && session) {
      setNote(session.note || '');
      setSelectedImages([]);
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }, [isOpen, session]);

  // Thu hồi ObjectURL khi unmount hoặc xóa ảnh để tránh memory leak
  useEffect(() => {
    return () => {
      selectedImages.forEach((img) => URL.revokeObjectURL(img.previewUrl));
    };
  }, [selectedImages]);

  if (!isOpen || !session) return null;

  const displayName =
    clientName ||
    session.clientName ||
    session.sessionName ||
    'Học viên';

  // Xử lý khi chọn file ảnh
  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImages: SelectedImagePreview[] = [];
    const currentTotal = selectedImages.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate ảnh: kích thước max 5MB, đúng định dạng
      const check = validateImageFile(file);
      if (!check.valid) {
        toast.error(check.error || `File ${file.name} không hợp lệ.`);
        continue;
      }

      // Giới hạn tối đa 6 ảnh mỗi lần hoàn thành
      if (currentTotal + newImages.length >= 6) {
        toast.warning('Tối đa 6 ảnh minh chứng cho mỗi buổi tập.');
        break;
      }

      newImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (newImages.length > 0) {
      setSelectedImages((prev) => [...prev, ...newImages]);
    }
  };

  // Xóa 1 ảnh đã chọn
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => {
      const target = prev[index];
      if (target) {
        URL.revokeObjectURL(target.previewUrl);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFilesSelect(e.dataTransfer.files);
  };

  // Submit hoàn thành buổi tập
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let evidenceImageUrls: string[] = [];

      // Bước 1: Upload các file ảnh đã chọn lên Cloudinary nếu có
      if (selectedImages.length > 0) {
        const filesToUpload = selectedImages.map((img) => img.file);
        evidenceImageUrls = await uploadEvidenceImages(
          filesToUpload,
          (percent) => {
            setUploadProgress(percent);
          }
        );
      }

      // Bước 2: Gọi API xác nhận hoàn thành buổi tập
      await trainingSessionApi.complete(session.id, {
        evidenceImageUrls: evidenceImageUrls.length > 0 ? evidenceImageUrls : undefined,
        note: note.trim() || undefined,
      });

      toast.success('Xác nhận hoàn thành buổi tập thành công!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Lỗi khi hoàn thành buổi tập:', err);
      const apiErr = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        apiErr.response?.data?.message ||
        apiErr.message ||
        'Đã xảy ra lỗi khi hoàn thành buổi tập. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Xác nhận hoàn thành buổi tập
              </h3>
              <p className="text-xs text-slate-400">
                Ghi nhận kết quả tập luyện và lưu trữ ảnh minh chứng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Thông tin nhanh buổi tập */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white">
                {displayName}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-300 font-medium">
                {session.sessionName}
              </span>
            </div>

            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-blue-500" />
                <span>{formatDisplayDate(session.trainingDate)}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-emerald-500" />
                <span>{formatTimeRange(session.startTime, session.endTime)}</span>
              </span>
            </div>
          </div>

          {/* 1. Bộ tải ảnh minh chứng lên Cloudinary */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="h-4 w-4 text-emerald-600" />
                <span>Ảnh minh chứng buổi tập (Check-in / Kết quả)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {selectedImages.length}/6 ảnh (Tối đa 5MB/ảnh)
              </span>
            </div>

            {/* Vùng Dropzone tải ảnh */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-slate-200 dark:border-[#162338] hover:border-emerald-400 bg-slate-50/40 dark:bg-[#070e17]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                className="hidden"
                onChange={(e) => {
                  handleFilesSelect(e.target.files);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              />

              <div className="h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2 shadow-xs">
                <Upload className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Nhấn để chọn ảnh hoặc kéo thả vào đây
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hỗ trợ PNG, JPG, JPEG, WEBP (tối đa 5MB mỗi ảnh)
              </p>
            </div>

            {/* Danh sách ảnh Preview đã chọn */}
            {selectedImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 pt-1">
                {selectedImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs"
                  >
                    <img
                      src={img.previewUrl}
                      alt={`Minh chứng ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Nút Xóa ảnh */}
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(idx);
                      }}
                      title="Xóa ảnh này"
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Ghi chú nhận xét buổi tập */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Ghi chú đánh giá / Tiến độ học viên</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="VD: Học viên hoàn thành đủ bài tập, mức tạ tốt, cần chú ý giãn cơ..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500 disabled:opacity-60 transition"
            />
          </div>

          {/* Spinner Animation Xoay Vòng Tròn khi đang Upload / Submit */}
          {isSubmitting && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-3">
              {/* Spinner animation xoay vòng tròn thanh lịch không chớp nháy text */}
              <div className="relative h-6 w-6">
                <div className="h-6 w-6 rounded-full border-2 border-emerald-200 dark:border-emerald-800"></div>
                <div className="absolute top-0 left-0 h-6 w-6 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
              </div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Đang xử lý dữ liệu và lưu buổi tập...
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <span className="ml-1 font-mono text-[11px] text-emerald-600">
                    ({uploadProgress}%)
                  </span>
                )}
              </span>
            </div>
          )}

          {/* Action Buttons Footer */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Xác nhận hoàn thành</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteSessionModal;
