import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import SplashLoader from '../ui/SplashLoader';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
  redirectTo?: string;
}

/**
 * Chuẩn hóa format role: tự động gán prefix "ROLE_" nếu chưa có
 * Ví dụ: 'ADMIN' -> 'ROLE_ADMIN'
 */
const normalizeRole = (role: string): string => {
  const upper = role.toUpperCase();
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
};

export default function ProtectedRoute({
  allowedRoles,
  children,
  redirectTo = '/login',
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isInitializing, isLoading } = useAuth();
  const location = useLocation();

  // 1. Khi đang trong quá trình Silent Refresh khởi động App (F5), hiển thị Splash Loader (TUYỆT ĐỐI KHÔNG REDIRECT)
  if (isInitializing || isLoading) {
    return <SplashLoader message="Đang kiểm tra quyền truy cập..." />;
  }

  // 2. Chỉ chuyển hướng về Login khi đã kiểm tra xong (isInitializing = false) mà không đăng nhập
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // 3. Nếu có ràng buộc phân quyền theo Role (RBAC)
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = (user.roles || []).map(normalizeRole);
    const requiredRoles = allowedRoles.map(normalizeRole);

    const hasPermission = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasPermission) {
      // Không đủ quyền -> chuyển hướng về trang 403 Forbidden
      return <Navigate to="/403" replace />;
    }
  }

  // 4. Đã xác thực và đủ quyền
  return children ? <>{children}</> : <Outlet />;
}
