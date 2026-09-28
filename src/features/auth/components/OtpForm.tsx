import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { authService } from '../services/authService';

export default function OtpForm() {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.verifyOtp('user@example.com', otp);
      navigate('/login');
    } catch (error) {
      console.error('OTP verification failed', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Password (OTP)</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <ShieldCheck className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            className="block w-full pl-10 pr-3 py-3 text-center tracking-widest text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-gray-50 focus:bg-white outline-none"
            placeholder="000000"
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || otp.length < 6}
        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Verifying...' : 'Verify Email'}
        {!isLoading && <ArrowRight className="h-4 w-4" />}
      </button>

      <div className="mt-6 text-center text-sm">
        <span className="text-gray-500">Didn't receive the code? </span>
        <button type="button" className="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">
          Click to resend
        </button>
      </div>
    </form>
  );
}
