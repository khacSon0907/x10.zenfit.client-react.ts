import React from 'react';
import {
  Clock,
  CheckCircle2,
  UserX,
  XCircle,
} from 'lucide-react';
import type { TrainingSessionStatus } from '../../types/session.types';
import { SESSION_STATUS_CONFIG } from '../../types/session.types';

interface SessionStatusBadgeProps {
  status?: TrainingSessionStatus;
  size?: 'xs' | 'sm' | 'md';
  showDot?: boolean;
  showIcon?: boolean;
  className?: string;
}

export const SessionStatusBadge: React.FC<SessionStatusBadgeProps> = ({
  status = 'SCHEDULED',
  size = 'sm',
  showDot = true,
  showIcon = false,
  className = '',
}) => {
  const meta = SESSION_STATUS_CONFIG[status] || SESSION_STATUS_CONFIG.SCHEDULED;

  const getIcon = () => {
    const iconClass = size === 'xs' ? 'h-2.5 w-2.5' : size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5';
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className={`${iconClass} shrink-0`} />;
      case 'NO_SHOW':
        return <UserX className={`${iconClass} shrink-0`} />;
      case 'CANCELLED':
        return <XCircle className={`${iconClass} shrink-0`} />;
      case 'SCHEDULED':
      default:
        return <Clock className={`${iconClass} shrink-0`} />;
    }
  };

  const sizeClasses = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-semibold',
  };

  const statusClass = `status-${status.toLowerCase().replace('_', '-')}`;

  return (
    <span
      title={meta.description}
      className={`inline-flex items-center rounded-full font-semibold border transition-colors shrink-0 ${sizeClasses[size]} ${meta.badgeClass} ${statusClass} ${className}`}
    >
      {showDot && (
        <span
          className={`h-1.5 w-1.5 rounded-full shrink-0 ${meta.dotClass} ${
            status === 'SCHEDULED' ? 'animate-pulse' : ''
          }`}
        />
      )}
      {showIcon && getIcon()}
      <span>{meta.label}</span>
    </span>
  );
};

export default SessionStatusBadge;

