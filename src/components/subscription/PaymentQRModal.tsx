import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import {
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  ShieldCheck,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { UserSubscriptionResponse } from '../../types/subscription';
import { useSubscriptionSocket } from '../../hooks/useSubscriptionSocket';

interface PaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionData: UserSubscriptionResponse | null;
  userId: string;
  onSuccess: () => void;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  onClose,
  subscriptionData,
  userId,
  onSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 phút
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPaidSuccess, setIsPaidSuccess] = useState<boolean>(false);

  // Reset timer và state mỗi khi mở modal mới
  useEffect(() => {
    if (isOpen) {
      setTimeLeft(15 * 60);
      setErrorMessage(null);
      setIsPaidSuccess(false);
    }
  }, [isOpen, subscriptionData?.id]);

  // Đếm ngược thời gian thanh toán
  useEffect(() => {
    if (!isOpen || isPaidSuccess) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setErrorMessage('Mã QR đã hết thời gian hiệu lực. Vui lòng tạo giao dịch mới.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isPaidSuccess]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = (text: string, field: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Lắng nghe kết quả xác thực thanh toán từ WebSocket
  useSubscriptionSocket({
    userId,
    enabled: isOpen && Boolean(userId) && !isPaidSuccess,
    onPaymentSuccess: () => {
      setIsPaidSuccess(true);
      setErrorMessage(null);
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      } catch {
        // Fallback if confetti fails
      }
      setTimeout(() => {
        onSuccess();
      }, 1500);
    },
    onPaymentFailed: (msg) => {
      setErrorMessage(
        msg.message || 'Thanh toán không thành công. Vui lòng kiểm tra lại số dư hoặc nội dung chuyển khoản.'
      );
    },
  });

  if (!isOpen || !subscriptionData) return null;

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(subscriptionData.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0f172a] text-slate-100 rounded-3xl border border-slate-700/80 shadow-2xl shadow-emerald-950/40 p-6 sm:p-7 overflow-hidden">
        {/* Nút đóng góc phải */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label="Đóng cửa sổ"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Màn hình thông báo thanh toán thành công */}
        {isPaidSuccess ? (
          <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-bounce">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-white">Thanh toán thành công!</h3>
              <p className="text-sm text-emerald-400 font-medium">
                Gói {subscriptionData.planName} đã được kích hoạt.
              </p>
              <p className="text-xs text-slate-400">Đang đưa bạn vào không gian làm việc...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Header thông tin thanh toán */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cổng thanh toán tự động PayOS</span>
              </div>
              <h3 className="text-xl font-extrabold text-white tracking-tight">
                Quét mã để thanh toán
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Gói dịch vụ:{' '}
                <span className="font-bold text-emerald-400">{subscriptionData.planName}</span>
              </p>
              <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-amber-500/15 text-amber-300 text-xs font-medium rounded-full border border-amber-500/30">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Hết hạn sau: {formatTime(timeLeft)}</span>
              </div>
            </div>

            {/* Thông báo lỗi nếu có */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-500/15 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs leading-relaxed animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Khung chứa mã QR */}
            <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-900 via-slate-900 to-[#071318] rounded-2xl border border-slate-700/60 shadow-inner relative">
              <div className="p-3 bg-white rounded-2xl shadow-xl shadow-black/40">
                {subscriptionData.qrCode ? (
                  <QRCodeSVG
                    value={subscriptionData.qrCode}
                    size={200}
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <div className="w-[200px] h-[200px] flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
                    <span className="text-xs text-slate-400">Đang khởi tạo mã QR...</span>
                  </div>
                )}
              </div>

              {/* Pulsing indicator */}
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-300 font-medium">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span>Đang chờ hệ thống xác nhận chuyển khoản...</span>
              </div>
            </div>

            {/* Chi tiết chuyển khoản & Nút Copy */}
            <div className="mt-5 space-y-2.5 bg-slate-800/60 border border-slate-700/50 p-4 rounded-2xl text-xs">
              {/* Số tiền */}
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tiền:</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm sm:text-base">
                    {formattedPrice}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(String(subscriptionData.price || 0), 'price')}
                    className="text-slate-400 hover:text-emerald-400 p-1 rounded-md hover:bg-slate-700/50 transition cursor-pointer"
                    title="Sao chép số tiền"
                  >
                    {copiedField === 'price' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Mã đơn hàng */}
              {subscriptionData.payosOrderCode && (
                <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Mã đơn hàng:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white text-xs sm:text-sm">
                      {subscriptionData.payosOrderCode}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(String(subscriptionData.payosOrderCode), 'orderCode')
                      }
                      className="text-slate-400 hover:text-emerald-400 p-1 rounded-md hover:bg-slate-700/50 transition cursor-pointer"
                      title="Sao chép mã đơn hàng"
                    >
                      {copiedField === 'orderCode' ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Các nút hành động */}
            <div className="mt-5 flex flex-col gap-2.5">
              {subscriptionData.checkoutUrl && (
                <a
                  href={subscriptionData.checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Mở trang thanh toán PayOS</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs sm:text-sm rounded-xl transition cursor-pointer"
              >
                Đóng / Chọn gói khác
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentQRModal;

