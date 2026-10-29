import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCurrentUserProfile } from '../services/userService';
import { USER_ME_QUERY_KEY } from './useMe';
import type { UpdateUserRequest, UpdateUserResponse } from '../types/user.types';

export interface UpdateUserMutationVariables {
  data: UpdateUserRequest;
  newAvatarFile?: File | null;
}

/**
 * Custom hook thực hiện:
 * 1. Upload ảnh avatar mới lên Cloudinary qua signature Backend (nếu có chọn file)
 * 2. Gọi PUT /api/users/me/update cập nhật hồ sơ vào Backend
 * 3. Tự động đồng bộ và invalidate cache React Query ['me']
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation<UpdateUserResponse, Error, UpdateUserMutationVariables>({
    mutationFn: ({ data, newAvatarFile }) => updateCurrentUserProfile(data, newAvatarFile),
    onSuccess: (updatedUser) => {
      // Cập nhật ngay lập tức dữ liệu cache cho ['me']
      queryClient.setQueryData(USER_ME_QUERY_KEY, updatedUser);
      // Kích hoạt refetch ngầm để đảm bảo đồng bộ
      queryClient.invalidateQueries({ queryKey: USER_ME_QUERY_KEY });
    },
  });
}

export default useUpdateUser;
