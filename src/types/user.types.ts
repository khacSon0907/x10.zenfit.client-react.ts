/**
 * ============================================================================
 * USER TYPES DEFINITIONS
 * Phù hợp chuẩn 100% với Backend GET /api/user/me
 * ============================================================================
 */

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED';
export type ProviderType = 'LOCAL' | 'GOOGLE';

export interface ApiResponse<T> {
  type: string;
  title: string;
  status: number;
  code: string;
  message: string;
  data: T;
  timestamp?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  phoneNumber: string | null;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  verifiedAt: string | null;
  avatarUrl: string | null;
  birthday: string | null;
  birthdayUpdateCount: number;
  points: number;
  birthdayLastUpdatedAt: string | null;
  nextBirthdayUpdateAt: string | null;
  canUpdateBirthday: boolean;
  providerType: ProviderType;
  roleIds: string[];
  // Tương thích ngược với các module khác nếu có
  name?: string;
  roles?: string[];
  accessToken?: string;
}
