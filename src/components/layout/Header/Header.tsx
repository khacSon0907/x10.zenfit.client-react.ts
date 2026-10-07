import { Link } from 'react-router-dom';
import logo from '../../../assets/logo/logo-zenfit.png';
import { useSettings, type Lang } from '../../../context/SettingsContext';

function Header() {
  const { theme, setTheme, lang, setLang, t } = useSettings();

  const navItems = [
    { id: 'home', label: t('home') },
    { id: 'workouts', label: t('workouts') },
    { id: 'nutrition', label: t('nutrition') },
    { id: 'community', label: t('community') },
  ];


  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo Section */}
          <div className="flex items-center gap-3 cursor-pointer group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-green-100 to-emerald-50 p-2 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:-rotate-3">
              <img
                src={logo}
                alt="Zenfit Logo"
                className="h-10 w-10 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <h1 className="text-2xl font-poppins font-bold tracking-tight text-gray-800 dark:text-gray-100 transition-colors duration-300 group-hover:text-emerald-600">
              Zen<span className="text-emerald-500">fit</span>
            </h1>
          </div>

          {/* Navigation - Optional placeholder for dynamic feel */}
          <nav className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="text-gray-600 dark:text-gray-300 font-poppins font-medium text-sm hover:text-emerald-500 transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Actions: language, theme, auth */}
          <div className="flex items-center gap-3">
            <div className="flex rounded-full bg-gray-100 dark:bg-gray-800 p-1">
              {(['en', 'vi'] as Lang[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setLang(v)}
                  aria-label={v === 'en' ? 'English' : 'Tiếng Việt'}
                  className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                    lang === v ? 'bg-emerald-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:text-emerald-500'
                  }`}
                >
                  {v.toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              aria-label={theme === 'light' ? t('dark') : t('light')}
              title={theme === 'light' ? t('dark') : t('light')}
              className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            <Link
              to="/login"
              className="hidden sm:block py-2 px-5 rounded-full font-semibold text-sm text-emerald-600 dark:text-emerald-400 border border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-800 transition-colors"
            >
              {t('login')}
            </Link>
            <Link
              to="/register"
              className="py-2 px-5 rounded-full font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
            >
              {t('register')}
            </Link>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header;