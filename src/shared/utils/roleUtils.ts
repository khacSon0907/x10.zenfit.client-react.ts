/**
 * ============================================================================
 * TIỆN ÍCH VAI TRÒ & PHÂN QUYỀN HỆ THỐNG ZENFIT
 * Hệ thống hỗ trợ 4 vai trò chính:
 * 1. ADMIN: Quản trị tài khoản, phân quyền và cấu hình hệ thống
 * 2. HEAD_OF_TRAINING: Quản lý huấn luyện (giám sát Team Manager & PT)
 * 3. TEAM_MANAGER: Quản lý đội ngũ PT (phân công và theo dõi hiệu suất)
 * 4. PT: Huấn luyện viên cá nhân (Personal Trainer - lịch tập, học viên)
 * ============================================================================
 */

export const SYSTEM_ROLES = {
  ADMIN: 'ADMIN',
  HEAD_OF_TRAINING: 'HEAD_OF_TRAINING',
  TEAM_MANAGER: 'TEAM_MANAGER',
  PT: 'PT',
} as const;

export type SystemRoleCode = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

/**
 * Nhãn hiển thị tiếng Việt thân thiện theo từng Role
 */
export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Quản trị viên (Admin)',
  HEAD_OF_TRAINING: 'Quản lý huấn luyện',
  TEAM_MANAGER: 'Quản lý đội ngũ PT',
  PT: 'Huấn luyện viên (PT)',
  USER: 'Người dùng',
};

/**
 * Danh sách vai trò được phép truy cập không gian làm việc PT Workspace.
 * Theo quy định: Chỉ ADMIN vào trang Quản trị, tất cả vai trò còn lại (HEAD_OF_TRAINING, TEAM_MANAGER, PT)
 * đều làm việc bình thường trong không gian PT.
 */
export const PT_WORKSPACE_ROLES = [
  SYSTEM_ROLES.PT,
  SYSTEM_ROLES.HEAD_OF_TRAINING,
  SYSTEM_ROLES.TEAM_MANAGER,
  'USER',
];

/**
 * Kiểm tra xem người dùng có phải Quản trị viên (Admin) hay không
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

/**
 * Kiểm tra xem người dùng có quyền vào không gian PT hay không
 * Bất kỳ vai trò nào không phải ADMIN (HEAD_OF_TRAINING, TEAM_MANAGER, PT, USER) đều được phép vào PT
 */
export const isPTUser = (
  user: { roles?: string[]; role?: string } | null | undefined
): boolean => {
  if (!user) return false;
  if (isAdminUser(user)) return false;

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

  // Nếu đã đăng nhập và không phải ADMIN, mặc định cho phép truy cập PT
  if (rolesList.length === 0) return true;

  return rolesList.some((r) => {
    const clean = String(r).toUpperCase().replace(/^ROLE_/, '');
    return clean !== 'ADMIN';
  });
};

/**
 * Lấy nhãn hiển thị vai trò người dùng (VD: 'Quản lý huấn luyện', 'Quản lý đội ngũ PT',...)
 */
export const getUserRoleLabel = (
  user: { roles?: string[]; role?: string } | null | undefined
): string => {
  if (!user) return 'Khách';
  if (isAdminUser(user)) return ROLE_LABELS.ADMIN;

  const rolesList: string[] = [];
  if (Array.isArray(user.roles)) rolesList.push(...user.roles);
  if (user.role) rolesList.push(user.role);
  if (rolesList.length === 0 && typeof localStorage !== 'undefined') {
    const savedRole = localStorage.getItem('zenfit_role');
    if (savedRole) rolesList.push(savedRole);
  }

  for (const r of rolesList) {
    const clean = String(r).toUpperCase().replace(/^ROLE_/, '');
    if (ROLE_LABELS[clean]) {
      return ROLE_LABELS[clean];
    }
  }

  return 'Huấn luyện viên (PT)';
};

/**
 * Điều hướng mặc định sau đăng nhập hoặc truy cập trang chủ:
 * - ADMIN -> /admin/overview
 * - Tất cả các vai trò còn lại (HEAD_OF_TRAINING, TEAM_MANAGER, PT) -> /pt/today
 */
export const getDefaultRedirectRoute = (
  user: { roles?: string[]; role?: string } | null | undefined
): string => {
  if (isAdminUser(user)) {
    return '/admin/overview';
  }
  return '/pt/today';
};

