import { type ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';
import OAuth2SuccessPage from '../pages/OAuth2SuccessPage';
import SelectSubscriptionPage from '../pages/auth/SelectSubscriptionPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import ProtectedRoute from './ProtectedRoute';

import PTLayout from '../components/layout/PTLayout';
import TodayPage from '../pages/pt/TodayPage';
import ClientsPage from '../pages/pt/ClientsPage';
import CreateClientPage from '../pages/pt/CreateClientPage';
import ContractsPage from '../pages/pt/ContractsPage';
import CreatePtContractPage from '../pages/pt/CreatePtContractPage';
import ContractDetailPage from '../pages/pt/ContractDetailPage';
import ClientDetailPage from '../pages/pt/ClientDetailPage';
import SchedulePage from '../pages/pt/SchedulePage';
import TrialsRenewalsPage from '../pages/pt/TrialsRenewalsPage';
import PTSubscriptionPricingPage from '../pages/pt/PTSubscriptionPricingPage';
import ProgressPage from '../pages/pt/ProgressPage';
import PlansPage from '../pages/pt/PlansPage';
import NutritionPlanListPage from '../pages/nutrition/NutritionPlanListPage';
import NutritionPlanDetailPage from '../pages/nutrition/NutritionPlanDetailPage';
import RevenuePage from '../pages/pt/RevenuePage';
import MyAccountPage from '../pages/pt/MyAccountPage';
import ProfilePage from '../pages/ProfilePage';

import AdminLayout from '../components/layout/AdminLayout';
import AdminOverviewPage from '../pages/admin/AdminOverviewPage';
import AdminPTManagementPage from '../pages/admin/AdminPTManagementPage';
import AdminSubscriptionPlansPage from '../pages/admin/AdminSubscriptionPlansPage';
import AdminFeePaymentsPage from '../pages/admin/AdminFeePaymentsPage';
import AdminAuditLogsPage from '../pages/admin/AdminAuditLogsPage';
import HomePage from '../pages/Home/HomePage';

import { useAuth } from '../context/AuthContext';
import SplashLoader from '../shared/components/ui/SplashLoader';
import { getDefaultRedirectRoute, PT_WORKSPACE_ROLES } from '../shared/utils/roleUtils';

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

      {/* Màn hình bắt buộc chọn gói dịch vụ (Subscription Confirmed) */}
      <Route
        path="/select-subscription"
        element={
          <ProtectedRoute>
            <SelectSubscriptionPage />
          </ProtectedRoute>
        }
      />
      
      {/* Trang 403 Forbidden */}
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Trang Profile người dùng: Yêu cầu đăng nhập */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <PTLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Phân hệ PT Workspace: Dành cho tất cả vai trò không phải ADMIN (PT, HEAD_OF_TRAINING, TEAM_MANAGER, USER) */}
      <Route
        path="/pt"
        element={
          <ProtectedRoute allowedRoles={PT_WORKSPACE_ROLES}>
            <PTLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="today" replace />} />
        <Route path="today" element={<TodayPage />} />
        <Route path="clients" element={<ClientsPage />} />
        <Route path="clients/new" element={<CreateClientPage />} />
        <Route path="clients/:id" element={<ClientDetailPage />} />
        <Route path="contracts" element={<ContractsPage />} />
        <Route path="contracts/new" element={<CreatePtContractPage />} />
        <Route path="contracts/:id" element={<ContractDetailPage />} />
        <Route path="schedule" element={<SchedulePage />} />
        <Route path="renewals" element={<TrialsRenewalsPage />} />
        <Route path="packages" element={<PTSubscriptionPricingPage />} />
        <Route path="subscription" element={<PTSubscriptionPricingPage />} />
        <Route path="pricing" element={<PTSubscriptionPricingPage />} />
        <Route path="progress" element={<ProgressPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="nutrition-plans" element={<NutritionPlanListPage />} />
        <Route path="nutrition-plans/:planId" element={<NutritionPlanDetailPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        <Route path="account" element={<MyAccountPage />} />
        <Route path="profile" element={<ProfilePage />} />
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
        <Route path="users" element={<Navigate to="/admin/pts" replace />} />
        <Route path="clients" element={<Navigate to="/admin/pts" replace />} />
        <Route path="plans" element={<AdminSubscriptionPlansPage />} />
        <Route path="packages" element={<AdminSubscriptionPlansPage />} />
        <Route path="subscription-plans" element={<AdminSubscriptionPlansPage />} />
        <Route path="schedule" element={<Navigate to="/admin/overview" replace />} />
        <Route path="payments" element={<AdminFeePaymentsPage />} />
        <Route path="settings" element={<AdminOverviewPage />} />
        <Route path="reports" element={<AdminOverviewPage />} />
        <Route path="audit-logs" element={<AdminAuditLogsPage />} />
      </Route>

      {/* Fallback 404 về RootRedirect */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}
