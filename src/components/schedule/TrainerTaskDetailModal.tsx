import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  ClipboardList,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Ban,
  FileText,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { trainerTaskApi } from '../../api/trainerTaskApi';
import type { TrainerTask, TrainerTaskStatus } from '../../types/session.types';
import { formatDisplayDate, formatTimeRange } from '../../utils/calendarUtils';

interface TrainerTaskDetailModalProps {
  task: TrainerTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TrainerTaskDetailModal: React.FC<TrainerTaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen || !task) return null;

  const baseColor = task.color || '#10B981';

  // Đổi trạng thái (TODO, DONE, SKIPPED)
  const handleUpdateStatus = async (newStatus: TrainerTaskStatus) => {
    setIsUpdating(true);
    try {
      await trainerTaskApi.updateStatus(task.id, newStatus);
      if (newStatus === 'DONE') {
        toast.success('Đã đánh dấu hoàn thành hoạt động!');
      } else if (newStatus === 'SKIPPED') {
        toast.info('Đã ghi nhận bỏ qua hoạt động');
      } else {
        toast.info('Đã đặt lại hoạt động về trạng thái cần làm');
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error updating task status:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || 'Không thể cập nhật trạng thái hoạt động');
    } finally {
      setIsUpdating(false);
    }
  };

  // Xóa task
  const handleDelete = async () => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hoạt động "${task.title}" không?`)) {
      return;
    }
    setIsDeleting(true);
    try {
      await trainerTaskApi.delete(task.id);
      toast.success('Đã xóa hoạt động cá nhân!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error('Error deleting task:', err);
      const apiErr = err as { response?: { data?: { message?: string } } };
      toast.error(apiErr.response?.data?.message || 'Không thể xóa hoạt động');
    } finally {
      setIsDeleting(false);
    }
  };

  // Status configuration
  const statusConfig = {
    TODO: {
      label: 'Chưa hoàn thành',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      dotClass: 'bg-blue-500',
    },
    DONE: {
      label: 'Đã hoàn thành',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      dotClass: 'bg-emerald-500',
    },
    SKIPPED: {
      label: 'Đã bỏ qua',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      dotClass: 'bg-slate-400',
    },
  }[task.status];

  const timeDisplay = task.allDay
    ? 'Cả ngày'
    : formatTimeRange(task.startTime, task.endTime);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: `${baseColor}20`, color: baseColor }}
              className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 border border-current"
            >
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Hoạt động cá nhân
                </h3>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusConfig.badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotClass}`} />
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-xs text-slate-400">Lịch trình cá nhân của Huấn luyện viên</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Title with color indicator */}
          <div className="flex items-start gap-3">
            <span
              style={{ backgroundColor: baseColor }}
              className="w-1.5 h-6 rounded-full shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <h4
                className={`text-lg font-bold text-slate-900 dark:text-white break-words ${
                  task.status === 'DONE' ? 'line-through text-slate-400 dark:text-slate-500' : ''
                }`}
              >
                {task.title}
              </h4>
            </div>
          </div>

          {/* Time & Date Cards */}
          <div className="grid grid-cols-2 gap-3">
            {/* Ngày */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-100 dark:border-[#162338]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Ngày thực hiện</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {formatDisplayDate(new Date(task.taskDate))}
              </p>
            </div>

            {/* Giờ */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-100 dark:border-[#162338]">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Thời gian</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {timeDisplay}
              </p>
            </div>
          </div>

          {/* Description */}
          {task.description ? (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-100 dark:border-[#162338] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>Ghi chú công việc:</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">
                {task.description}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Không có ghi chú thêm.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-[#070e17]/60 flex items-center justify-between gap-2 flex-wrap">
          {/* Nút Xóa */}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting || isUpdating}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            <span>Xóa</span>
          </button>

          {/* Nhóm nút trạng thái */}
          <div className="flex items-center gap-2">
            {task.status !== 'DONE' && (
              <>
                {task.status !== 'SKIPPED' && (
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus('SKIPPED')}
                    disabled={isUpdating || isDeleting}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Ban className="h-3.5 w-3.5" />
                    <span>Bỏ qua</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleUpdateStatus('DONE')}
                  disabled={isUpdating || isDeleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  <span>Đánh dấu Hoàn thành</span>
                </button>
              </>
            )}

            {task.status === 'DONE' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('TODO')}
                disabled={isUpdating || isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                <span>Đánh dấu Chưa xong</span>
              </button>
            )}

            {task.status === 'SKIPPED' && (
              <button
                type="button"
                onClick={() => handleUpdateStatus('TODO')}
                disabled={isUpdating || isDeleting}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                <span>Làm lại</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainerTaskDetailModal;

