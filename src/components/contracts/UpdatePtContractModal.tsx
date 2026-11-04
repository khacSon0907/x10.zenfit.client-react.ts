import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Save,
  Loader2,
  FileSignature,
  Dumbbell,
  Coins,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Calculator,
} from 'lucide-react';
import { toast } from 'sonner';
import { contractApi } from '../../api/contractApi';
import type {
  PtContractResponse,
  UpdatePtContractRequest,
  ContractStatus,
  PaymentContractStatus,
} from '../../types/contract.types';
import {
  CONTRACT_STATUS_LABELS,
  PAYMENT_CONTRACT_STATUS_CONFIG,
  resolvePaymentStatus,
} from '../../types/contract.types';

interface UpdatePtContractModalProps {
  contract: PtContractResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const UpdatePtContractModal: React.FC<UpdatePtContractModalProps> = ({
  contract,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [totalSessions, setTotalSessions] = useState<number>(24);
  const [bonusSessions, setBonusSessions] = useState<number>(0);
  const [usedSessions, setUsedSessions] = useState<number>(0);

  const [price, setPrice] = useState<number>(0);
  const [pricePerSession, setPricePerSession] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentContractStatus, setPaymentContractStatus] =
    useState<PaymentContractStatus>('UNPAID');

  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [status, setStatus] = useState<ContractStatus>('ACTIVE');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Điền dữ liệu từ contract khi mở modal
  useEffect(() => {
    if (contract && isOpen) {
      setErrorMsg(null);
      const total = contract.totalSessions || 0;
      const bonus = contract.bonusSessions || 0;
      const used = contract.usedSessions || 0;
      const pr = contract.price || 0;
      const perSession = contract.pricePerSession || (total > 0 ? Math.round(pr / total) : 0);
      const paid = contract.paidAmount || 0;
      const paymentSt = resolvePaymentStatus(contract);

      setTotalSessions(total);
      setBonusSessions(bonus);
      setUsedSessions(used);
      setPrice(pr);
      setPricePerSession(perSession);
      setPaidAmount(paid);
      setPaymentContractStatus(paymentSt);
      setStartDate(contract.startDate || '');
      setEndDate(contract.endDate || '');
      setStatus(contract.status || 'ACTIVE');
      setNotes(contract.notes || '');
    }
  }, [contract, isOpen]);

  // Format tiền tệ VNĐ chuẩn (phân tách hàng nghìn + VNĐ)
  const formatVND = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(val) + ' VNĐ';
  };

  // Tính toán số liệu thống kê trực tiếp
  const totalAllSessions = totalSessions + bonusSessions;
  const remainingSessions = Math.max(0, totalAllSessions - usedSessions);
  const percentUsed =
    totalAllSessions > 0 ? Math.min(100, Math.round((usedSessions / totalAllSessions) * 100)) : 0;
  const debt = Math.max(0, price - paidAmount);

  // Tự động gợi ý đơn giá 1 buổi khi đổi price hoặc totalSessions
  const autoPricePerSession = useMemo(() => {
    if (totalSessions > 0 && price > 0) {
      return Math.round(price / totalSessions);
    }
    return 0;
  }, [price, totalSessions]);

  // Đổi đơn giá 1 buổi -> tự động tính tổng giá gói = đơn giá * số buổi mua
  const handlePricePerSessionChange = (newPricePerSession: number) => {
    setPricePerSession(newPricePerSession);
    const calculatedPrice = (totalSessions > 0 ? totalSessions : 1) * newPricePerSession;
    setPrice(calculatedPrice);
    if (paymentContractStatus !== 'REFUNDED') {
      if (paidAmount >= price && calculatedPrice > 0) {
        setPaidAmount(calculatedPrice);
        setPaymentContractStatus('PAID');
      } else if (paidAmount > calculatedPrice) {
        setPaidAmount(calculatedPrice);
        setPaymentContractStatus('PAID');
      }
    }
  };

  // Đổi số buổi mua -> tự động tính lại tổng giá gói
  const handleTotalSessionsChange = (newTotal: number) => {
    setTotalSessions(newTotal);
    if (pricePerSession > 0) {
      const calculatedPrice = newTotal * pricePerSession;
      setPrice(calculatedPrice);
      if (paymentContractStatus !== 'REFUNDED' && (paidAmount >= price || paymentContractStatus === 'PAID')) {
        setPaidAmount(calculatedPrice);
      }
    }
  };

  // Đổi tổng giá gói -> cập nhật ngược lại đơn giá 1 buổi
  const handlePriceChange = (newPr: number) => {
    setPrice(newPr);
    if (totalSessions > 0) {
      setPricePerSession(Math.round(newPr / totalSessions));
    }
    if (paymentContractStatus !== 'REFUNDED') {
      if (paidAmount >= newPr && newPr > 0) {
        setPaidAmount(newPr);
        setPaymentContractStatus('PAID');
      } else if (paidAmount > 0 && paidAmount < newPr) {
        setPaymentContractStatus('PARTIALLY_PAID');
      }
    }
  };

  // Xử lý thay đổi số tiền đã đóng -> gợi ý trạng thái thanh toán tương ứng
  const handlePaidAmountChange = (newPaid: number) => {
    setPaidAmount(newPaid);
    if (paymentContractStatus !== 'REFUNDED') {
      if (newPaid >= price && price > 0) {
        setPaymentContractStatus('PAID');
      } else if (newPaid > 0 && newPaid < price) {
        setPaymentContractStatus('PARTIALLY_PAID');
      } else if (newPaid <= 0) {
        setPaymentContractStatus('UNPAID');
      }
    }
  };

  // Submit cập nhật
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contract) return;
    setErrorMsg(null);

    // Validation cơ bản
    if (totalSessions < 1) {
      const err = 'Tổng số buổi tập phải từ 1 buổi trở lên';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (usedSessions < 0) {
      const err = 'Số buổi đã tập không được âm';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (usedSessions > totalAllSessions) {
      const err = `Số buổi đã tập (${usedSessions}) không được vượt quá tổng số buổi (${totalAllSessions} buổi)`;
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (price < 0) {
      const err = 'Tổng giá trị hợp đồng không hợp lệ';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    if (paidAmount < 0) {
      const err = 'Số tiền thanh toán không được là số âm';
      setErrorMsg(err);
      toast.error(err);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdatePtContractRequest = {
        totalSessions,
        bonusSessions,
        usedSessions,
        price,
        pricePerSession: pricePerSession > 0 ? pricePerSession : autoPricePerSession,
        paidAmount,
        paymentContractStatus,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status,
        notes: notes.trim() || undefined,
      };

      await contractApi.updatePtContract(contract.id, payload);
      toast.success('Cập nhật hợp đồng PT thành công!');
      onSuccess();
      onClose();
    } catch (err: unknown) {
      let msg = 'Cập nhật hợp đồng thất bại. Vui lòng thử lại sau.';
      if (err && typeof err === 'object' && 'response' in err) {
        const res = (err as { response?: { data?: { message?: string } } }).response;
        if (res?.data?.message) msg = res.data.message;
      }
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !contract) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-[#0c1626] rounded-3xl border border-slate-200 dark:border-[#162338] shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FileSignature className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Cập nhật Hợp đồng PT</span>
                <code className="text-[11px] font-mono px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold">
                  #{contract.id.slice(-6).toUpperCase()}
                </code>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Học viên: <strong className="text-slate-700 dark:text-slate-300">{contract.clientName || contract.clientId}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert nếu có */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* ========================================================
              PHẦN 1: TIẾN ĐỘ BUỔI TẬP (TOTAL, BONUS, USED)
             ======================================================== */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Dumbbell className="h-3.5 w-3.5 text-emerald-500" />
                <span>Tiến độ & Số buổi tập</span>
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">
                Còn lại: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{remainingSessions}</strong> / {totalAllSessions} buổi
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="space-y-1">
              <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Đã tập: {usedSessions} buổi ({percentUsed}%)</span>
                <span>Tổng gói: {totalAllSessions} buổi</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Số buổi mua */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Số buổi mua <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={totalSessions || ''}
                  onChange={(e) => handleTotalSessionsChange(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Buổi tặng */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Buổi tặng (Bonus)
                </label>
                <input
                  type="number"
                  min={0}
                  value={bonusSessions || 0}
                  onChange={(e) => setBonusSessions(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              {/* Số buổi đã tập */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Đã tập (usedSessions) <span className="text-emerald-500 font-bold">*</span>
                </label>
                <input
                  type="number"
                  min={0}
                  max={totalAllSessions}
                  value={usedSessions}
                  onChange={(e) => setUsedSessions(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/40 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-bold"
                />
              </div>
            </div>
          </div>

          {/* ========================================================
              PHẦN 2: THÔNG TIN TÀI CHÍNH & THANH TOÁN (PRICE, PRICE_PER_SESSION, PAID)
             ======================================================== */}
          <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span>Học phí & Thanh toán hợp đồng</span>
              </h3>
              {debt > 0 ? (
                <span className="text-[11px] text-rose-500 font-semibold">
                  Còn nợ: {formatVND(debt)}
                </span>
              ) : (
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Đã thanh toán đủ</span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Đơn giá 1 buổi tập - Đặt trước tổng giá gói */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Đơn giá / buổi (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {formatVND(pricePerSession)} / buổi
                  </span>
                </div>
                <input
                  type="number"
                  step={10000}
                  min={0}
                  value={pricePerSession || ''}
                  onChange={(e) => handlePricePerSessionChange(parseFloat(e.target.value) || 0)}
                  placeholder={`Gợi ý: ${autoPricePerSession}`}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
                {/* Gợi ý mức giá theo buổi */}
                <div className="flex items-center gap-1 pt-1 overflow-x-auto custom-scrollbar">
                  <span className="text-[10px] text-slate-400 shrink-0">Mức giá:</span>
                  {[250000, 300000, 350000, 400000, 500000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handlePricePerSessionChange(preset)}
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-semibold transition-colors cursor-pointer shrink-0 ${
                        pricePerSession === preset
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {preset / 1000}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Tổng giá trị hợp đồng - Tự động tính = Đơn giá * Số buổi */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Tổng giá trị gói (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-500/20">
                    {formatVND(price)}
                  </span>
                </div>
                <input
                  type="number"
                  step={50000}
                  min={0}
                  value={price || ''}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-emerald-50/50 dark:bg-emerald-950/20 px-2.5 py-1 rounded-lg border border-emerald-500/20 mt-1">
                  <Calculator className="h-3 w-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    = <strong>{totalSessions}</strong> buổi × <strong>{formatVND(pricePerSession)}</strong> = <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatVND(price)}</strong>
                  </span>
                </div>
              </div>

              {/* Số tiền đã thanh toán */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Số tiền đã đóng (VNĐ)
                  </label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handlePaidAmountChange(0)}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
                    >
                      0 VNĐ
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaidAmountChange(Math.round(price / 2))}
                      className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 cursor-pointer"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaidAmountChange(price)}
                      className="px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 cursor-pointer font-semibold"
                    >
                      100%
                    </button>
                  </div>
                </div>
                <input
                  type="number"
                  step={50000}
                  min={0}
                  max={price}
                  value={paidAmount}
                  onChange={(e) => handlePaidAmountChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
                <div className="flex items-center justify-between text-[11px] font-medium pt-1">
                  <span className="text-slate-500 dark:text-slate-400">
                    Đã đóng: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{formatVND(paidAmount)}</strong>
                  </span>
                  {debt > 0 ? (
                    <span className="text-rose-500 font-semibold">Còn nợ: {formatVND(debt)}</span>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <CheckCircle2 className="h-3 w-3" /> Đã đóng đủ
                    </span>
                  )}
                </div>
              </div>

              {/* Trạng thái thanh toán (PaymentContractStatus) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái thanh toán <span className="text-rose-500">*</span>
                </label>
                <select
                  value={paymentContractStatus}
                  onChange={(e) => setPaymentContractStatus(e.target.value as PaymentContractStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  {(
                    Object.keys(
                      PAYMENT_CONTRACT_STATUS_CONFIG
                    ) as PaymentContractStatus[]
                  ).map((st) => (
                    <option key={st} value={st}>
                      {PAYMENT_CONTRACT_STATUS_CONFIG[st].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================
              PHẦN 3: THỜI HẠN & TRẠNG THÁI HIỆU LỰC (DATES & STATUS)
             ======================================================== */}
          <div className="space-y-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-blue-500" />
              <span>Thời hạn & Trạng thái hiệu lực</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trạng thái hiệu lực <span className="text-rose-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ContractStatus)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 font-semibold cursor-pointer"
                >
                  {(Object.keys(CONTRACT_STATUS_LABELS) as ContractStatus[]).map((st) => (
                    <option key={st} value={st}>
                      {CONTRACT_STATUS_LABELS[st].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* ========================================================
              PHẦN 4: GHI CHÚ
             ======================================================== */}
          <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ghi chú hợp đồng
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú điều khoản thanh toán, bảo lưu, dặn dò học viên..."
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-850/60 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white outline-none focus:border-emerald-500 resize-none font-medium"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5" />
                  <span>Lưu cập nhật</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePtContractModal;

