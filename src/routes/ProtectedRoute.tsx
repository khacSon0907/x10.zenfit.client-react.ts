import { type ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashLoader from '../shared/components/ui/SplashLoader';
import { isAdminUser } from '../shared/utils/roleUtils';

/**
 * ============================================================================
 * COMPONENT BẢO VỆ ROUTE (PROTECTED ROUTE)
 * ============================================================================
 * 1. Kiểm tra trạng thái khởi tạo (isLoading): Hiển thị SplashLoader nếu đang refresh
 * 2. Kiểm tra xác thực (isAuthenticated): Nếu chưa login, chuyển hướng về /login
 * 3. Kiểm tra phân quyền (allowedRoles):
 *    - Hỗ trợ linh hoạt cả định dạng 'ADMIN', 'ROLE_ADMIN', 'USER', 'PT',...
 *    - Nếu ADMIN vào nhầm trang không được phép -> tự chuyển về /admin/overview
 *    - Nếu USER cố vào trang ADMIN -> chuyển về /403
 */

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. Đang khởi tạo hoặc đang làm mới phiên đăng nhập lúc F5 / mở lại web
  if (isLoading) {
    return <SplashLoader message="Đang kiểm tra quyền truy cập..." />;
  }

  // 2. Chưa đăng nhập -> Chuyển về /login kèm vị trí trang hiện tại
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Kiểm tra quyền hạn theo danh sách Role được chỉ định
  if (allowedRoles && allowedRoles.length > 0) {
    const userRolesNormalized = (user.roles || []).map((r) =>
      String(r).toUpperCase().replace(/^ROLE_/, '')
    );
    const allowedRolesNormalized = allowedRoles.map((r) =>
      String(r).toUpperCase().replace(/^ROLE_/, '')
    );
    const hasRequiredRole = allowedRolesNormalized.some((role) =>
      userRolesNormalized.includes(role)
    );

    if (!hasRequiredRole) {
      if (isAdminUser(user)) {
        return <Navigate to="/admin/overview" replace />;
      }
      return <Navigate to="/403" replace />;
    }
  }

  // 4. Hợp lệ -> Render Component con hoặc Outlet cho lồng route
  return children ? <>{children}</> : <Outlet />;
}
