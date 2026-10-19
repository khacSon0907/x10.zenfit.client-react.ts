import { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';
import OAuth2SuccessPage from '../pages/OAuth2SuccessPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import ProtectedRoute from './ProtectedRoute';

import PTLayout from '../components/layout/PTLayout';
import TodayPage from '../pages/pt/TodayPage';
import ClientsPage from '../pages/pt/ClientsPage';
import SchedulePage from '../pages/pt/SchedulePage';
import TrialsRenewalsPage from '../pages/pt/TrialsRenewalsPage';
import PackagesPaymentsPage from '../pages/pt/PackagesPaymentsPage';
import ProgressPage from '../pages/pt/ProgressPage';
import PlansPage from '../pages/pt/PlansPage';
import RevenuePage from '../pages/pt/RevenuePage';
import MyAccountPage from '../pages/pt/MyAccountPage';

import AdminLayout from '../components/layout/AdminLayout';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminPTManagementPage from '../pages/admin/AdminPTManagementPage';
import AdminSubscriptionPlansPage from '../pages/admin/AdminSubscriptionPlansPage';
import AdminFeePaymentsPage from '../pages/admin/AdminFeePaymentsPage';
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage';
import HomePage from '../pages/Home/HomePage';

import { useAuth } from '../context/AuthContext';
import SplashLoader from '../shared/components/ui/SplashLoader';
import { getDefaultRedirectRoute } from '../shared/utils/roleUtils';

// Điều hướng fallback cho các route không tồn tại (404 Fallback)
function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <SplashLoader message="Đang kiểm tra quyền truy cập..." />;
  }
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={getDefaultRedirectRoute(user)} replace />;
}

// Chặn truy cập vào các trang công khai (Home, Login, Register,...) nếu đã đăng nhập:
// Tự động chuyển hướng thẳng vào trang làm việc tương ứng (Admin -> /admin/overview, PT -> /pt/today)
function PublicAuthRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <SplashLoader message="Đang kiểm tra phiên đăng nhập..." />;
  }
  if (isAuthenticated && user) {
    return <Navigate to={getDefaultRedirectRoute(user)} replace />;
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang giới thiệu gốc: Nếu đã đăng nhập -> vào thẳng PT/Admin workspace; nếu chưa -> hiển thị HomePage */}
      <Route
        path="/"
        element={
          <PublicAuthRoute>
            <HomePage />
          </PublicAuthRoute>
        }
      />

      {/* Xác thực tài khoản */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicAuthRoute>
            <RegisterPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicAuthRoute>
            <ForgotPasswordPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicAuthRoute>
            <VerifyOtpPage />
          </PublicAuthRoute>
        }
      />
      
      {/* Google OAuth2 Callback Routes */}
      <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />
      <Route path="/oauth2/callback" element={<OAuth2SuccessPage />} />
      
      {/* Trang 403 Forbidden */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Phân hệ PT Workspace: Dành cho USER / PT (Nếu Admin vào -> tự chuyển về /admin/overview) */}
      <Route
        path="/pt"
        element={
          <ProtectedRoute allowedRoles={['USER', 'PT', 'ROLE_USER', 'ROLE_PT']}>
            <PTLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="renewals" element={<TrialsRenewalsPage />} />
        <Route path="packages" element={<PackagesPaymentsPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="account" element={<MyAccountPage />} />
      </Route>

      {/* Phân hệ Quản trị Admin: Yêu cầu quyền ADMIN (Nếu User/PT cố truy cập -> Chuyển về 403) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN', 'ROLE_ADMIN']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="pts" element={<AdminPTManagementPage />} />
        <Route path="plans" element={<AdminSubscriptionPlansPage />} />
        <Route path="payments" element={<AdminFeePaymentsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Fallback 404 về RootRedirect */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
