import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  FileSignature,
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle2,
  UserX,
  XCircle,
  Edit3,
  Save,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { trainingSessionApi } from '../../api/trainingSessionApi';
import type {
  TrainingSessionCalendarItem,
  UpdateTrainingSessionRequest,
} from '../../types/session.types';
import { formatDisplayDate, formatTimeRange } from '../../utils/calendarUtils';
import SessionStatusBadge from './SessionStatusBadge';

interface SessionDetailModalProps {
  session: TrainingSessionCalendarItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onComplete?: (sessionId: string) => void;
  onOpenCompleteModal?: (session: TrainingSessionCalendarItem) => void;
  onNoShow?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  clientsMap?: Map<string, string>;
}

export const SessionDetailModal: React.FC<SessionDetailModalProps> = ({
  session,
  isOpen,
  onClose,
  onSuccess,
  onComplete,
  onOpenCompleteModal,
  onNoShow,
  onCancel,
  clientsMap,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [sessionName, setSessionName] = useState<string>('');
  const [trainingDate, setTrainingDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session && isOpen) {
      setIsEditing(false);
      setErrorMessage(null);
      setSessionName(session.sessionName || '');
      setTrainingDate(session.trainingDate || '');
      setStartTime(
        session.startTime ? session.startTime.slice(0, 5) : '09:00'
      );
      if (session.endTime) {
        const timePart = session.endTime.includes('T') ? session.endTime.split('T')[1] : session.endTime;
        setEndTime(timePart.slice(0, 5));
      } else {
        setEndTime('');
      }
      setNote(session.note || '');
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  const isTerminal =
    session.status === 'COMPLETED' ||
    session.status === 'CANCELLED' ||
    session.status === 'NO_SHOW';

  // Lưu chỉnh sửa / dời lịch
  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!sessionName.trim()) {
      const err = 'Tên buổi tập không được để trống';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!trainingDate) {
      const err = 'Ngày tập không được để trống';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (!startTime) {
      const err = 'Giờ bắt đầu không được để trống';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    if (endTime && startTime && endTime <= startTime) {
      const err = 'Giờ kết thúc phải diễn ra sau giờ bắt đầu';
      setErrorMessage(err);
      toast.error(err);
      return;
    }

    const formattedStartTime =
      startTime.length === 5 ? `${startTime}:00` : startTime;

    let formattedEndTime: string | null | undefined = undefined;
    if (endTime) {
      const timePart = endTime.length === 5 ? `${endTime}:00` : endTime;
      formattedEndTime = `${trainingDate}T${timePart}`;
    }

    setIsSaving(true);
    try {
      const payload: UpdateTrainingSessionRequest = {
        sessionName: sessionName.trim(),
        trainingDate,
        startTime: formattedStartTime,
        endTime: formattedEndTime,
        note: note.trim() || undefined,
      };

      await trainingSessionApi.update(session.id, payload);
      toast.success('Cập nhật thông tin buổi tập thành công!');
      setIsEditing(false);
      onSuccess();
    } catch (err: unknown) {
      let msg = 'Không thể cập nhật buổi tập. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (
          err as {
            response?: {
              status?: number;
              data?: { message?: string };
            };
          }
        ).response;

        if (res?.status === 409) {
          msg =
            res.data?.message ||
            'Thời điểm này Huấn luyện viên hoặc học viên đã có lịch tập khác, vui lòng chọn giờ khác!';
        } else if (res?.data?.message) {
          msg = res.data.message;
        }
      }
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Chi tiết buổi tập
                </h3>
                <SessionStatusBadge status={session.status} size="xs" showIcon />
              </div>
              <p className="text-xs text-slate-400">
                Mã buổi tập: <code className="font-mono">#{session.id.slice(-6).toUpperCase()}</code>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-600 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isEditing ? (
            /* ========================================================
               EDIT MODE FORM
               ======================================================== */
            <form onSubmit={handleSaveUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Tên buổi tập / Giáo án <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ngày tập <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={trainingDate}
                    onChange={(e) => setTrainingDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Bắt đầu <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kết thúc
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú dặn dò
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs sm:text-sm text-slate-900 dark:text-white font-medium outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Hủy sửa
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          ) : (
            /* ========================================================
               VIEW MODE DETAILS
               ======================================================== */
            <div className="space-y-4">
              {/* Workout Name Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/20">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Tên buổi tập / Giáo án:
                </p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  {session.sessionName}
                </h4>
              </div>

              {/* Grid 2 Columns: Client & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Client info */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Học viên tham gia:</span>
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {session.clientName || (clientsMap && clientsMap.get(session.clientId)) || 'Học viên'}
                  </p>
                  {session.clientPhone && (
                    <p className="text-slate-500">{session.clientPhone}</p>
                  )}
                </div>

                {/* Date & Time */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] space-y-1">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-blue-500" />
                    <span>Thời gian tập:</span>
                  </span>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {formatDisplayDate(session.trainingDate)}
                  </p>
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTimeRange(session.startTime, session.endTime)}</span>
                  </p>
                </div>
              </div>

              {/* Contract Info */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <FileSignature className="h-3.5 w-3.5 text-purple-500" />
                  <span>Hợp đồng liên kết:</span>
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  #{session.contractId ? session.contractId.slice(-8).toUpperCase() : '—'}
                </span>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ghi chú dặn dò:
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/80 dark:border-[#162338] text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                  {session.note || 'Không có ghi chú cho buổi tập này.'}
                </div>
              </div>

              {/* Thư viện ảnh minh chứng (evidenceImageUrls) */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ImageIcon className="h-4 w-4 text-emerald-600" />
                    <span>Ảnh minh chứng buổi tập ({session.evidenceImageUrls?.length || 0})</span>
                  </span>
                </div>

                {session.evidenceImageUrls && session.evidenceImageUrls.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {session.evidenceImageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        onClick={() => setPreviewImageUrl(url)}
                        className="relative group rounded-xl overflow-hidden aspect-square border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 shadow-xs cursor-pointer hover:opacity-95 transition"
                        title="Bấm để phóng to xem chi tiết"
                      >
                        <img
                          src={url}
                          alt={`Minh chứng ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Eye className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#070e17] border border-slate-200/60 dark:border-[#162338] text-center text-xs text-slate-400">
                    Chưa có ảnh minh chứng cho buổi tập này.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons Toolbar */}
          {!isEditing && (
            <div className="pt-4 border-t border-slate-100 dark:border-[#162338] flex items-center justify-between gap-2 flex-wrap">
              {/* Left: Edit button if not terminal */}
              {!isTerminal ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-slate-500" />
                  <span>Dời lịch / Sửa</span>
                </button>
              ) : (
                <span className="text-xs text-slate-400 italic">
                  Buổi tập đã kết thúc, không thể chỉnh sửa.
                </span>
              )}

              {/* Right: Lifecycle action buttons */}
              <div className="flex items-center gap-2 flex-wrap ml-auto">
                {!isTerminal && (
                  <>
                    {(onOpenCompleteModal || onComplete) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (onOpenCompleteModal) {
                            onOpenCompleteModal(session);
                          } else if (onComplete) {
                            onComplete(session.id);
                          }
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Hoàn thành</span>
                      </button>
                    )}

                    {onNoShow && (
                      <button
                        type="button"
                        onClick={() => {
                          onNoShow(session.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        <span>Vắng</span>
                      </button>
                    )}

                    {onCancel && (
                      <button
                        type="button"
                        onClick={() => {
                          onCancel(session.id);
                          onClose();
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-500/30 hover:bg-rose-100 text-xs font-semibold transition-colors cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        <span>Hủy lịch</span>
                      </button>
                    )}
                  </>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Phóng to ảnh minh chứng */}
      {previewImageUrl && (
        <div
          onClick={() => setPreviewImageUrl(null)}
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl max-h-[90vh]"
          >
            <img
              src={previewImageUrl}
              alt="Minh chứng phóng to"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
            <button
              type="button"
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-3 -right-3 h-9 w-9 rounded-full bg-white dark:bg-slate-800 text-slate-800 dark:text-white flex items-center justify-center shadow-lg hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionDetailModal;
