import { Routes, Route, Link } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import VerifyOtpPage from '../features/auth/pages/VerifyOtpPage';

// A simple placeholder for Home page to test routing
const Home = () => (
  <div className="text-center py-20">
    <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Zenfit</h2>
    <p className="text-gray-600 mb-8">Your ultimate fitness tracking companion.</p>
    <div className="flex gap-4 justify-center">
        <Link to="/login" className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">Log In</Link>
        <Link to="/register" className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Register</Link>
    </div>
  </div>
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/verify-otp" element={<VerifyOtpPage />} />
    </Routes>
  );
}
