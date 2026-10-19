/**
 * Tiện ích chuẩn hóa và kiểm tra vai trò (Role) người dùng
 * Hỗ trợ linh hoạt cả định dạng có tiền tố 'ROLE_' (Spring Security) hoặc không (ADMIN, USER, PT)
 */

export const isAdminUser = (
  user: { roles?: string[]; role?: string } | null | undefined
): boolean => {
  if (!user) return false;
  const rolesList: string[] = [];
  if (Array.isArray(user.roles)) {
    rolesList.push(...user.roles);
  }
  if (user.role && typeof user.role === 'string') {
    rolesList.push(user.role);
  }
  if (rolesList.length === 0 && typeof localStorage !== 'undefined') {
    const savedRole = localStorage.getItem('zenfit_role');
    if (savedRole) rolesList.push(savedRole);
  }
  return rolesList.some((r) => {
    const clean = String(r).toUpperCase().replace(/^ROLE_/, '');
    return clean === 'ADMIN';
  });
};

export const isPTUser = (
  user: { roles?: string[]; role?: string } | null | undefined
): boolean => {
  if (!user) return false;
  const rolesList: string[] = [];
  if (Array.isArray(user.roles)) {
    rolesList.push(...user.roles);
  }
  if (user.role && typeof user.role === 'string') {
    rolesList.push(user.role);
  }
  if (rolesList.length === 0 && typeof localStorage !== 'undefined') {
    const savedRole = localStorage.getItem('zenfit_role');
    if (savedRole) rolesList.push(savedRole);
  }
  return rolesList.some((r) => {
    const clean = String(r).toUpperCase().replace(/^ROLE_/, '');
    return clean === 'PT' || clean === 'USER';
  });
};

export const getDefaultRedirectRoute = (
  user: { roles?: string[]; role?: string } | null | undefined
): string => {
  if (isAdminUser(user)) {
    return '/admin/overview';
  }
  return '/pt/today';
};
