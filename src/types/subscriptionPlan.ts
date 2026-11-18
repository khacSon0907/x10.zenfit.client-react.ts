export type SubscriptionPlanStatus = 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxStudents: number;
  maxTrainingSessions?: number;
  status: SubscriptionPlanStatus;
  isDefault: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanRequest {
  code: string;
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxStudents: number;
  maxTrainingSessions?: number;
  status?: SubscriptionPlanStatus;
  isDefault?: boolean;
  displayOrder?: number;
}

export interface UpdateSubscriptionPlanRequest {
  name: string;
  description?: string;
  price: number;
  durationDays: number;
  maxStudents: number;
  maxTrainingSessions?: number;
  isDefault?: boolean;
  displayOrder?: number;
}

export interface UpdateSubscriptionPlanStatusRequest {
  status: SubscriptionPlanStatus;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface SubscriptionPlanFilterQuery {
  keyword?: string;
  status?: SubscriptionPlanStatus;
  page?: number;
  size?: number;
}

export interface ApiResponse<T> {
  status: 'SUCCESS' | 'ERROR';
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface SelectPlanRequest {
  planId: string;
  autoRenew?: boolean;
}

export interface UserSubscriptionResponse {
  id: string;
  userId: string;
  planId: string;
  planName?: string;
  planCode?: string;
  status: 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startAt?: string;
  endAt?: string;
  price?: number;
  maxStudents?: number;
  currentStudents?: number;
  autoRenew?: boolean;
  paidAt?: string;
  transactionId?: string;
  payosOrderCode?: number;
  checkoutUrl?: string;
  qrCode?: string; // Chuỗi VietQR do PayOS trả về
  isExpired?: boolean;
  daysRemaining?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentSocketMessage {
  orderId?: string;
  orderCode?: number;
  paymentStatus: 'PAID' | 'FAILED' | 'PENDING';
  success: boolean;
  message: string;
  amount?: number;
}

