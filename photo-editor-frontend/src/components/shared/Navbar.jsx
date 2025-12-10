import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and nav links */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <span className="text-2xl">📸</span>
              <span className="text-xl font-bold text-primary-600">
                Photo Editor
              </span>
            </Link>

            <div className="hidden md:flex gap-6">
              <Link
                to="/dashboard"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/albums"
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Albums
              </Link>
            </div>
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center gap-4">
            {/* User dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center">
                    <span className="text-white font-medium">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <span className="hidden md:block text-gray-700 font-medium">
                  {user?.name || 'User'}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}