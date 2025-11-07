import { Menu, Settings, ChevronDown, FileText } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRef, useState, useEffect } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [navDropdownOpen, setNavDropdownOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);
  const closeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setNavDropdownOpen(false);
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setNavDropdownOpen(false);
    }
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKey);
      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
    };
  }, []);

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

              {/* Templates nav item with hover/click dropdown */}
              <div
                className="relative"
                ref={navRef}
                onMouseEnter={() => {
                  if (closeTimeoutRef.current) { window.clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
                  setNavDropdownOpen(true);
                }}
                onMouseLeave={() => {
                  if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = window.setTimeout(() => setNavDropdownOpen(false), 180);
                }}
              >
                <button
                  onClick={() => setNavDropdownOpen(o => !o)}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') setNavDropdownOpen(false);
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setNavDropdownOpen(o => !o); }
                  }}
                  aria-haspopup="menu"
                  aria-expanded={navDropdownOpen}
                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${isActive('/templates') ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  <span className="font-medium">Templates</span>
                  <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${navDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {navDropdownOpen && (
                  <div
                    className="absolute left-0 mt-3 w-56 z-50"
                    onMouseEnter={() => {
                      if (closeTimeoutRef.current) { window.clearTimeout(closeTimeoutRef.current); closeTimeoutRef.current = null; }
                      setNavDropdownOpen(true);
                    }}
                    onMouseLeave={() => {
                      if (closeTimeoutRef.current) window.clearTimeout(closeTimeoutRef.current);
                      closeTimeoutRef.current = window.setTimeout(() => setNavDropdownOpen(false), 180);
                    }}
                  >
                    {/* caret */}
                    <div className="absolute -top-2 left-4">
                      <svg width="20" height="10" viewBox="0 0 20 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 10L10 0L20 10H0Z" fill="white" stroke="rgba(0,0,0,0.06)"/>
                      </svg>
                    </div>

                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-xl ring-1 ring-black/5 overflow-hidden transform transition-all duration-150 scale-100">
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3"
                        onClick={() => { navigate('/templates?type=document'); setNavDropdownOpen(false); }}
                      >
                        <FileText className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Document Templates</div>
                          <div className="text-xs text-gray-400">Agreements, invoices & more</div>
                        </div>
                      </button>
                      <div className="border-t border-gray-100" />
                      <button
                        className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-3"
                        onClick={() => { navigate('/templates?type=message'); setNavDropdownOpen(false); }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        <div>
                          <div className="font-medium">Message Templates</div>
                          <div className="text-xs text-gray-400">Pre-written messages</div>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
