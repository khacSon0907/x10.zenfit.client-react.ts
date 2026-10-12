import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import SplashLoader from '../ui/SplashLoader';
import type { ReactNode } from 'react';

interface PublicOnlyRouteProps {
  children?: ReactNode;
  redirectTo?: string;
}

export default function PublicOnlyRoute({
  children,
  redirectTo = '/',
}: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <SplashLoader message="Đang tải..." />;
  }

  // Nếu người dùng đã đăng nhập, điều hướng về trang trước đó hoặc trang chủ
  if (isAuthenticated) {
    const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || redirectTo;
    return <Navigate to={fromPath} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
