import React from 'react';
import type { PaymentContractStatus } from '../../types/contract.types';
import {
  PAYMENT_CONTRACT_STATUS_CONFIG,
  resolvePaymentStatus,
} from '../../types/contract.types';
import { CheckCircle2, AlertCircle, Clock, RotateCcw } from 'lucide-react';

interface PaymentStatusBadgeProps {
  status?: PaymentContractStatus;
  paidAmount?: number;
  price?: number;
  className?: string;
  showIcon?: boolean;
}

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  paidAmount,
  price,
  className = '',
  showIcon = true,
}) => {
  const resolvedStatus = status || resolvePaymentStatus({ paymentContractStatus: status, paidAmount, price });
  const config = PAYMENT_CONTRACT_STATUS_CONFIG[resolvedStatus];

  const renderIcon = () => {
    if (!showIcon) return null;
    switch (resolvedStatus) {
      case 'PAID':
        return <CheckCircle2 className="h-3 w-3 shrink-0" />;
      case 'UNPAID':
        return <AlertCircle className="h-3 w-3 shrink-0" />;
      case 'PARTIALLY_PAID':
        return <Clock className="h-3 w-3 shrink-0" />;
      case 'REFUNDED':
        return <RotateCcw className="h-3 w-3 shrink-0" />;
      default:
        return null;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-colors ${config.badgeClass} ${className}`}
    >
      {renderIcon()}
      <span>{config.label}</span>
    </span>
  );
};

export default PaymentStatusBadge;

