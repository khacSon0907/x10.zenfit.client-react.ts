import React from 'react'
import { BrowserRouter, useLocation } from 'react-router-dom';
import Header from './components/layout/Header/Header';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './features/auth/context/AuthContext';

function AppContent() {
  const location = useLocation();
  const authRoutes = ['/login', '/register', '/forgot-password', '/verify-otp'];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-gray-50 font-poppins flex flex-col">
      {!isAuthPage && <Header />}
      <main className={`flex-grow ${!isAuthPage ? 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full' : ''}`}>
        <AppRoutes />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  )
}
