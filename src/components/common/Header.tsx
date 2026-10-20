import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, ArrowRight } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenSubscribe: () => void;
  currentUser?: { name: string; role: string } | null;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAuth,
  onOpenSubscribe,
  currentUser,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Latest News', path: '/category/tech' },
    { name: 'Reviews', path: '/category/tech' },
    { name: 'Big Tech', path: '/category/tech' },
    { name: 'Entertainment', path: '/category/sports' },
    { name: 'Gadgets', path: '/category/tech' },
    { name: 'Learning', path: '/category/learning' },
    { name: 'Travel', path: '/category/travel' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0b1120] text-white border-b border-slate-800/80 backdrop-blur-md bg-opacity-95 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Tagline */}
          <div className="flex-shrink-0">
            <Link to="/" className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-slate-100 transition-colors">
                  every<span className="text-red-500">gyan</span>
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
                Knowledge for Everyone, Everywhere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'text-white bg-slate-800'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Header Actions */}
          <div className="hidden sm:flex items-center space-x-3 sm:space-x-4">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Search articles"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* User / Login Button */}
            {currentUser ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800 rounded-md font-medium transition-colors"
              >
                <User className="w-4 h-4 text-red-400" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800 rounded-md font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <User className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}

            {/* Subscribe CTA Button */}
            <button
              onClick={onOpenSubscribe}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 rounded-md shadow-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            >
              Subscribe
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex sm:hidden items-center gap-2">
            <button
              onClick={onOpenSearch}
              className="p-2 text-slate-300 hover:text-white rounded-md"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-md"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#0f172a] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 rounded-md font-medium"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 flex flex-col gap-2.5">
            {currentUser ? (
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 text-white rounded-md font-medium text-sm"
              >
                <User className="w-4 h-4 text-red-400" />
                <span>Go to Dashboard</span>
              </Link>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800 text-white rounded-md font-medium text-sm"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Register</span>
              </button>
            )}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenSubscribe();
              }}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-md font-semibold text-sm shadow-md"
            >
              <span>Subscribe to Newsletter</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
