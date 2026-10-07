import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Lang = 'en' | 'vi';

const translations = {
  en: {
    home: 'Home',
    workouts: 'Workouts',
    nutrition: 'Nutrition',
    community: 'Community',
    getStarted: 'Get Started',
    login: 'Log in',
    register: 'Sign up',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    footerTagline: 'Your personal fitness companion. Train smarter, eat better, live healthier.',
    explore: 'Explore',
    support: 'Support',
    helpCenter: 'Help Center',
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    contact: 'Contact',
    rights: 'All rights reserved.',
  },
  vi: {
    home: 'Trang chủ',
    workouts: 'Tập luyện',
    nutrition: 'Dinh dưỡng',
    community: 'Cộng đồng',
    getStarted: 'Bắt đầu',
    login: 'Đăng nhập',
    register: 'Đăng ký',
    theme: 'Giao diện',
    light: 'Sáng',
    dark: 'Tối',
    language: 'Ngôn ngữ',
    footerTagline: 'Người bạn đồng hành thể hình của bạn. Tập thông minh hơn, ăn uống tốt hơn, sống khỏe hơn.',
    explore: 'Khám phá',
    support: 'Hỗ trợ',
    helpCenter: 'Trung tâm trợ giúp',
    privacy: 'Chính sách bảo mật',
    terms: 'Điều khoản dịch vụ',
    contact: 'Liên hệ',
    rights: 'Bảo lưu mọi quyền.',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];

interface SettingsContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'light');
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = (key: TranslationKey) => translations[lang][key];

  return (
    <SettingsContext.Provider value={{ theme, setTheme, lang, setLang, t }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
