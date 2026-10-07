import logo from '../../../assets/logo/logo-zenfit.png';
import { useSettings } from '../../../context/SettingsContext';

function Footer() {
  const { t } = useSettings();

  const explore = [
    { id: 'home', label: t('home') },
    { id: 'workouts', label: t('workouts') },
    { id: 'nutrition', label: t('nutrition') },
    { id: 'community', label: t('community') },
  ];
  const support = [
    { href: '#help', label: t('helpCenter') },
    { href: '#privacy', label: t('privacy') },
    { href: '#terms', label: t('terms') },
    { href: '#contact', label: t('contact') },
  ];
  const socials = [
    { name: 'Facebook', path: 'M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z' },
    { name: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z' },
    { name: 'YouTube', path: 'M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z' },
  ];

  const linkCls =
    'text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors duration-300';

  return (
    <footer className="mt-auto bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-tr from-green-100 to-emerald-50 p-2 shadow-sm">
                <img src={logo} alt="Zenfit Logo" className="h-8 w-8 object-contain" />
              </div>
              <span className="text-2xl font-poppins font-bold tracking-tight text-gray-800 dark:text-gray-100">
                Zen<span className="text-emerald-500">fit</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {t('footerTagline')}
            </p>
            <div className="mt-5 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href="#"
                  aria-label={s.name}
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500 transition-all duration-300 hover:-translate-y-1"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-100">
              {t('explore')}
            </h3>
            <ul className="mt-4 space-y-3">
              {explore.map((i) => (
                <li key={i.id}>
                  <a href={`#${i.id}`} className={linkCls}>{i.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-800 dark:text-gray-100">
              {t('support')}
            </h3>
            <ul className="mt-4 space-y-3">
              {support.map((i) => (
                <li key={i.href}>
                  <a href={i.href} className={linkCls}>{i.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} Zenfit. {t('rights')}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">Made with 💚 for a healthier you</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
