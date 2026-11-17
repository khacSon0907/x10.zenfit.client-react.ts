import { type ReactNode } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SplashLoader from '../shared/components/ui/SplashLoader';
import { isAdminUser, getDefaultRedirectRoute } from '../shared/utils/roleUtils';

/**
 * ============================================================================
 * COMPONENT BẢO VỆ ROUTE (PROTECTED ROUTE)
 * ============================================================================
 * 1. Kiểm tra trạng thái khởi tạo (isLoading): Hiển thị SplashLoader nếu đang refresh
 * 2. Kiểm tra xác thực (isAuthenticated): Nếu chưa login, chuyển hướng về /login
 * 3. Kiểm tra emailVerified: Nếu chưa xác thực email, bắt buộc chuyển về /verify-otp
 * 4. Kiểm tra subscriptionConfirmed: Nếu chưa chọn gói, bắt buộc chuyển về /select-subscription
 * 5. Kiểm tra phân quyền (allowedRoles):
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

  // 3. Nếu chưa xác thực email -> Chuyển hướng sang màn xác thực OTP
  if (user.emailVerified === false && location.pathname !== '/verify-otp') {
    return <Navigate to="/verify-otp" replace />;
  }

  const isAdmin = isAdminUser(user);

  // 4. Nếu chưa chọn gói dịch vụ (subscriptionConfirmed === false) -> Bắt buộc chặn và chuyển sang /select-subscription
  if (!isAdmin && user.subscriptionConfirmed === false) {
    if (location.pathname !== '/select-subscription') {
      return <Navigate to="/select-subscription" replace />;
    }
  }

  // 5. Nếu đã chọn gói (hoặc là ADMIN) mà vẫn cố tình vào /select-subscription -> Chuyển về màn hình tương ứng
  if ((isAdmin || user.subscriptionConfirmed === true) && location.pathname === '/select-subscription') {
    return <Navigate to={getDefaultRedirectRoute(user)} replace />;
  }

  // 6. Kiểm tra quyền hạn theo danh sách Role được chỉ định
  if (allowedRoles && allowedRoles.length > 0) {
    const rawRoles: string[] = [];
    if (Array.isArray(user.roles)) rawRoles.push(...user.roles);
    if ((user as { role?: string }).role) rawRoles.push((user as { role?: string }).role!);
    if (rawRoles.length === 0 && typeof localStorage !== 'undefined') {
      const savedRole = localStorage.getItem('zenfit_role');
      if (savedRole) rawRoles.push(savedRole);
    }

    const userRolesNormalized = rawRoles.map((r) =>
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

  // 7. Hợp lệ -> Render Component con hoặc Outlet cho lồng route
  return children ? <>{children}</> : <Outlet />;
}
