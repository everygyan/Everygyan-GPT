import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, User, Menu, X, ArrowRight, ChevronDown } from 'lucide-react';
import { NavigationMenuItem } from '../../types';
import { fetchNavigationMenu, DEFAULT_NAVIGATION } from '../../services/navigationService';

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
  const [navItems, setNavItems] = useState<NavigationMenuItem[]>(DEFAULT_NAVIGATION);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<Record<string, boolean>>({});
  const location = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  // Load navigation dynamically from Supabase (falls back to DEFAULT_NAVIGATION)
  useEffect(() => {
    let isMounted = true;
    fetchNavigationMenu().then((items) => {
      if (isMounted && items && items.length > 0) {
        setNavItems(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Close dropdown on outside click or escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close dropdown and drawer when location changes
  useEffect(() => {
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileGroup = (name: string) => {
    setMobileExpanded((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const visibleNav = navItems.filter((item) => item.visible);

  return (
    <header className="sticky top-0 z-40 bg-[#0b1120] text-white border-b border-slate-800/80 backdrop-blur-md bg-opacity-95 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo & Tagline */}
          <div className="flex-shrink-0">
            <Link
              to="/"
              className="group flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-sm"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white group-hover:text-slate-100 transition-colors">
                  Every<span className="text-red-500">Gyan</span>
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wide">
                Knowledge for Everyone, Everywhere
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links & Dropdowns */}
          <nav
            ref={navRef}
            className="hidden lg:flex items-center space-x-1 xl:space-x-2"
            aria-label="Main Navigation"
          >
            {visibleNav.map((item) => {
              const isDirectActive = location.pathname === item.path;
              const visibleChildren = (item.children || []).filter((sub) => sub.visible);
              const hasDropdown = item.type === 'dropdown' && visibleChildren.length > 0;
              const isChildActive = visibleChildren.some((sub) => location.pathname === sub.path);
              const isOpen = activeDropdown === item.name;

              if (!hasDropdown) {
                return (
                  <Link
                    key={item.id || item.name}
                    to={item.path}
                    className={`px-3 py-1.5 text-xs xl:text-sm font-semibold rounded-md transition-colors relative flex items-center gap-1.5 ${
                      isDirectActive
                        ? 'text-white bg-slate-800'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.2 bg-red-600 text-[10px] font-black uppercase tracking-wider rounded text-white animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              return (
                <div
                  key={item.id || item.name}
                  className="relative"
                  onMouseEnter={() => setActiveDropdown(item.name)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <div className="flex items-center">
                    <Link
                      to={item.path}
                      className={`pl-3 pr-1 py-1.5 text-xs xl:text-sm font-semibold rounded-l-md transition-colors ${
                        isDirectActive || isChildActive
                          ? 'text-white bg-slate-800'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setActiveDropdown(isOpen ? null : item.name)}
                      className={`pr-2.5 pl-1 py-2 text-xs xl:text-sm rounded-r-md transition-colors focus:outline-none ${
                        isDirectActive || isChildActive
                          ? 'text-white bg-slate-800'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                      aria-expanded={isOpen}
                      aria-haspopup="true"
                      aria-label={`${item.name} menu`}
                    >
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          isOpen ? 'rotate-180 text-red-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {/* Desktop Dropdown Panel */}
                  {isOpen && (
                    <div className="absolute top-full left-0 pt-1 w-64 z-50">
                      <div className="bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl py-2 px-1 backdrop-blur-xl">
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1 flex items-center justify-between">
                          <span>{item.name} Topics</span>
                          <Link
                            to={item.path}
                            onClick={() => setActiveDropdown(null)}
                            className="text-red-400 hover:text-red-300 text-[10px] font-bold lowercase"
                          >
                            view all →
                          </Link>
                        </div>
                        {visibleChildren.map((sub) => {
                          const isSubActive = location.pathname === sub.path;
                          return (
                            <Link
                              key={sub.id || sub.name}
                              to={sub.path}
                              onClick={() => setActiveDropdown(null)}
                              className={`flex flex-col px-3 py-2 rounded-xl text-xs transition-colors ${
                                isSubActive
                                  ? 'bg-slate-800 text-white font-bold'
                                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                              }`}
                            >
                              <span className="font-semibold text-slate-100 flex items-center justify-between">
                                <span>{sub.name}</span>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                )}
                              </span>
                              {sub.description && (
                                <span className="text-[11px] text-slate-400 font-normal truncate mt-0.5">
                                  {sub.description}
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
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
              <div className="flex items-center gap-2">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 px-3 py-1.5 text-xs sm:text-sm text-slate-200 hover:text-white hover:bg-slate-800 rounded-md font-medium transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-red-400 border border-slate-700">
                    {currentUser.role}
                  </span>
                </Link>
              </div>
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

          {/* Mobile Menu Button with Accessible 44x44px Touch Target */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={onOpenSearch}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
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
        <div className="sm:hidden bg-[#0f172a] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto">
          <div className="space-y-1 pt-1">
            {visibleNav.map((item) => {
              const visibleChildren = (item.children || []).filter((sub) => sub.visible);
              const hasDropdown = item.type === 'dropdown' && visibleChildren.length > 0;

              if (!hasDropdown) {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.id || item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-xl ${
                      isActive ? 'bg-red-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="px-2 py-0.5 bg-red-600 text-[10px] font-bold uppercase rounded text-white">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              }

              const isExpanded = Boolean(mobileExpanded[item.name]);
              return (
                <div key={item.id || item.name} className="border-b border-slate-800/80 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-2.5 text-sm font-semibold text-slate-200 hover:text-white flex-1"
                    >
                      {item.name}
                    </Link>
                    <button
                      type="button"
                      onClick={() => toggleMobileGroup(item.name)}
                      className="p-2 text-slate-400 hover:text-white"
                      aria-label={`Toggle ${item.name} subcategories`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-red-400' : ''
                        }`}
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="pl-4 pr-2 pb-2 space-y-1">
                      {visibleChildren.map((sub) => (
                        <Link
                          key={sub.id || sub.name}
                          to={sub.path}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`block px-3 py-2 text-xs rounded-lg ${
                            location.pathname === sub.path
                              ? 'bg-slate-800 text-red-400 font-bold'
                              : 'text-slate-300 hover:bg-slate-800/60'
                          }`}
                        >
                          {sub.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
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
