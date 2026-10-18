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

// Điều hướng thông minh tại trang gốc "/"
function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  if (user.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin/overview" replace />;
  }
  return <Navigate to="/pt/today" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Trang gốc */}
      <Route path="/" element={<HomePage />} />

      {/* Xác thực tài khoản */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
      
      {/* Google OAuth2 Callback Routes */}
      <Route path="/oauth2/success" element={<OAuth2SuccessPage />} />
      <Route path="/oauth2/callback" element={<OAuth2SuccessPage />} />
      
      {/* Trang 403 Forbidden */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Phân hệ PT Workspace (Yêu cầu đăng nhập tài khoản) */}
      <Route
        path="/pt"
        element={
          <ProtectedRoute>
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

      {/* Phân hệ Quản trị Admin (Chỉ tài khoản có ROLE_ADMIN) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
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
