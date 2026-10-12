import { Routes, Route } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';
import OAuth2CallbackPage from '../features/auth/pages/OAuth2CallbackPage';
import ForbiddenPage from '../pages/ForbiddenPage';
import PublicOnlyRoute from '../shared/components/guards/PublicOnlyRoute';
import ProtectedRoute from '../shared/components/guards/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/403" element={<ForbiddenPage />} />

      {/* Google OAuth2 Callback Landing Page */}
      <Route path="/oauth2/success" element={<OAuth2CallbackPage />} />

      {/* Guest-only Pages (Đã login sẽ được chuyển hướng về trang chủ) */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicOnlyRoute>
            <RegisterPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/verify-otp"
        element={
          <PublicOnlyRoute>
            <VerifyOtpPage />
          </PublicOnlyRoute>
        }
      />

      {/* Protected Routes Example (Bảo vệ theo phân quyền RBAC nếu cần) */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <div className="p-8 text-center text-lg font-bold">Trang Quản Trị Hệ Thống (ADMIN Only)</div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
