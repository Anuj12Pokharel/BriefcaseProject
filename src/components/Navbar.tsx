import { Menu, Settings } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              {/* Use a provided SVG fallback in public/our-suitcase.svg. To use your own JPEG/PNG, place it at public/our-suitcase.png */}
              <img src="/our-suitcase.svg" alt="Our Briefcase" className="h-10 object-contain" />
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/"
                className={`font-medium transition-colors ${isActive('/') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Documents
              </Link>
              <Link
                to="/templates"
                className={`font-medium transition-colors ${isActive('/templates') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Templates
              </Link>
              <Link
                to="/reports"
                className={`font-medium transition-colors ${isActive('/reports') ? 'text-blue-600' : 'text-gray-700 hover:text-gray-900'}`}
              >
                Reports
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="text-sm text-gray-700">{user.email}</div>
                <div className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">{user.role}</div>
                <button onClick={() => { logout(); navigate('/login'); }} className="px-3 py-1 bg-red-50 text-red-600 rounded-md text-sm">Logout</button>
              </div>
            ) : (
              <Link to="/login" className="text-sm text-gray-700 hover:text-gray-900">Sign in</Link>
            )}
            <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
