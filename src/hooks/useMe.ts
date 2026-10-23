import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import { getMe } from '../api/userApi';
import type { UserProfile } from '../types/user.types';

export const USER_ME_QUERY_KEY = ['me'] as const;

/**
 * Custom hook lấy thông tin user đang đăng nhập qua React Query
 * - queryKey: ['me']
 * - staleTime: 5 phút
 * - Không retry khi gặp mã lỗi 401 Unauthorized
 */
export function useMe() {
  return useQuery<UserProfile, Error>({
    queryKey: USER_ME_QUERY_KEY,
    queryFn: getMe,
    staleTime: 5 * 60 * 1000, // 5 phút cache
    retry: (failureCount, error) => {
      // Dừng retry ngay lập tức nếu lỗi 401
      if (isAxiosError(error) && error.response?.status === 401) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export default useMe;
