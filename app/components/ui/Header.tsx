export function Header() {
  return (
    <header className="hidden md:block bg-white border-b border-gray-200 sticky top-0 z-50 w-full">
      <div className="w-full px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg overflow-hidden">
              <img
                src="/icon/512.png"
                alt="Opennie Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">
              Opennie
            </h1>
          </div>

          {/* Search & Menu */}
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Search Icon */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* Menu Icon */}
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors touch-manipulation">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
