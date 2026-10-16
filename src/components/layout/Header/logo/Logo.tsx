import { Link } from 'react-router-dom';
import logoImg from '../../../../assets/logo/logo-zenfit.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-3 group focus:outline-hidden ${className}`}
    >
      {/* Icon Badge */}
      <div className="h-9 w-9 rounded-xl bg-white dark:bg-white p-1.5 flex items-center justify-center shadow-xs border border-gray-100 dark:border-white/10 transition-transform group-hover:scale-105">
        <img
          src={logoImg}
          alt="ZenFit"
          className="h-full w-full object-contain select-none"
        />
      </div>

      {/* Brand Text */}
      {showText && (
        <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
          Zen<span className="text-[#00d68f]">Fit</span>
        </span>
      )}
    </Link>
  );
}
