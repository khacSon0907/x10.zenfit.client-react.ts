import { useState } from 'react';
import { Link } from 'react-router-dom';

export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Tổng quan', href: '#overview' },
  { id: 'solutions', label: 'Giải pháp', href: '#solutions' },
  { id: 'for-pt', label: 'Dành cho PT', href: '#for-pt' },
  { id: 'pricing', label: 'Bảng giá', href: '#pricing' },
  { id: 'docs', label: 'Tài liệu', href: '#docs' },
];

interface NavMenuProps {
  items?: NavItem[];
  activeId?: string;
  onItemClick?: (id: string) => void;
  isMobile?: boolean;
}

export default function NavMenu({
  items = DEFAULT_NAV_ITEMS,
  activeId: externalActiveId,
  onItemClick,
  isMobile = false,
}: NavMenuProps) {
  const [internalActiveId, setInternalActiveId] = useState<string>('overview');
  const activeId = externalActiveId ?? internalActiveId;

  const handleClick = (id: string) => {
    setInternalActiveId(id);
    if (onItemClick) {
      onItemClick(id);
    }
  };

  if (isMobile) {
    return (
      <nav className="flex flex-col space-y-1 w-full py-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <Link
              key={item.id}
              to={item.href}
              onClick={() => handleClick(item.id)}
              className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors flex items-center justify-between ${
                isActive
                  ? 'text-[#00d68f] bg-emerald-500/10 dark:bg-[#00d68f]/10 font-semibold'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5'
              }`}
            >
              <span>{item.label}</span>
              {isActive && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#00d68f]" />
              )}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-7 lg:gap-9">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <Link
            key={item.id}
            to={item.href}
            onClick={() => handleClick(item.id)}
            className={`relative py-2 text-sm font-medium transition-colors duration-200 outline-hidden focus:outline-hidden ${
              isActive
                ? 'text-[#00d68f] font-semibold'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <span>{item.label}</span>

            {/* Thanh gạch chân indicator xanh ngọc phát sáng khi Active */}
            {isActive && (
              <span className="absolute left-0 right-0 -bottom-1 h-[2.5px] rounded-full bg-[#00d68f] shadow-xs shadow-emerald-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
