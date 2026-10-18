import { type ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashLoader from '../shared/components/ui/SplashLoader';

/**
 * ============================================================================
 * COMPONENT BẢO VỆ ROUTE (PROTECTED ROUTE)
 * ============================================================================
 * 1. Kiểm tra trạng thái khởi tạo (isLoading): Hiển thị SplashLoader nếu đang refresh
 * 2. Kiểm tra xác thực (isAuthenticated): Nếu chưa login, chuyển hướng về /login và lưu lại url ban đầu
 * 3. Kiểm tra phân quyền (allowedRoles): Nếu người dùng không có role phù hợp -> chuyển sang /403
 */

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // 1. Đang khởi tạo hoặc đang làm mới phiên đăng nhập lúc F5
  if (isLoading) {
    return <SplashLoader message="Đang kiểm tra quyền truy cập..." />;
  }

  // 2. Chưa đăng nhập -> Chuyển về /login kèm vị trí trang hiện tại
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Kiểm tra quyền hạn theo danh sách Role được chỉ định
  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles = user.roles || [];
    const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role));

    if (!hasRequiredRole) {
      return <Navigate to="/403" replace />;
    }
  }

  // 4. Hợp lệ -> Render Component con hoặc Outlet cho lồng route
  return children ? <>{children}</> : <Outlet />;
}
