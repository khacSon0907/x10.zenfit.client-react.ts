import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo/logo-zenfit.png';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex font-poppins">
      {/* Left side - Branding/Image */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-emerald-900 overflow-hidden items-center justify-center">
        {/* Background Decorative Elements */}
        <div className="absolute inset-0 opacity-20">
           <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-400 blur-3xl"></div>
           <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500 blur-3xl"></div>
        </div>
        
        {/* Image - using a high-quality fitness Unsplash image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        
        <div className="relative z-10 p-12 text-center text-white max-w-lg">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 cursor-pointer group">
            <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md p-2 shadow-sm transition-all duration-300 group-hover:scale-110">
              <img src={logo} alt="Zenfit Logo" className="h-12 w-12 object-contain" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Zen<span className="text-emerald-400">fit</span>
            </h1>
          </Link>
          <h2 className="text-3xl font-bold mb-4 leading-tight">Elevate Your Fitness Journey</h2>
          <p className="text-emerald-50 text-lg">
            Join our community to track your progress, get personalized workout plans, and achieve the best version of yourself.
          </p>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white relative">
        <div className="absolute top-4 left-4 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
                <img src={logo} alt="Zenfit" className="h-8 w-8" />
                <span className="text-xl font-bold text-gray-800">Zen<span className="text-emerald-500">fit</span></span>
            </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
