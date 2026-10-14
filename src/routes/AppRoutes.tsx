import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';
import ForbiddenPage from '../pages/ForbiddenPage';

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

import { useApp } from '../context/AppContext';

// Điều hướng thông minh tại trang gốc "/"
function RootRedirect() {
  const { role } = useApp();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'ROLE_ADMIN') {
    return <Navigate to="/admin/overview" replace />;
  }
  return <Navigate to="/pt/today" replace />;
}

// Bảo vệ route PT
function PTRouteGuard({ children }: { children: React.ReactNode }) {
  const { role } = useApp();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

// Bảo vệ route Admin: PT không thể vào, chỉ Admin mới có quyền
function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  const { role } = useApp();
  if (!role) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'ROLE_ADMIN') {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang gốc tự động điều hướng sang Đăng nhập hoặc Dashboard tương ứng */}
      <Route path="/" element={<RootRedirect />} />

      {/* Xác thực tài khoản */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Phân hệ PT Workspace (Có Sidebar desktop + Mobile bottom nav) */}
      <Route
        path="/pt"
        element={
          <PTRouteGuard>
            <PTLayout />
          </PTRouteGuard>
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

      {/* Phân hệ Quản trị Admin (Cách ly hoàn toàn dữ liệu khách của PT) */}
      <Route
        path="/admin"
        element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<AdminOverviewPage />} />
        <Route path="pts" element={<AdminPTManagementPage />} />
        <Route path="plans" element={<AdminSubscriptionPlansPage />} />
        <Route path="payments" element={<AdminFeePaymentsPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Fallback 404 về trang chủ */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
