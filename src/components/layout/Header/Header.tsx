import logo from '../../../assets/logo/logo-zenfit.png';

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
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
            <h1 className="text-2xl font-poppins font-bold tracking-tight text-gray-800 transition-colors duration-300 group-hover:text-emerald-600">
              Zen<span className="text-emerald-500">fit</span>
            </h1>
          </div>

          {/* Navigation - Optional placeholder for dynamic feel */}
          <nav className="hidden md:flex gap-8">
            {['Home', 'Workouts', 'Nutrition', 'Community'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-gray-600 font-poppins font-medium text-sm hover:text-emerald-500 transition-colors duration-300 relative after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-0.5 after:bg-emerald-500 after:transition-all after:duration-300 hover:after:w-full"
              >
                {item}
              </a>
            ))}
          </nav>

          {/* Action Button */}
          <div className="flex items-center">
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-poppins font-semibold py-2 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0">
              Get Started
            </button>
          </div>

        </div>
      </div>
    </header>
  )
}

export default Header;