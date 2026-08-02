import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Menu, X, User, BookOpen, Users, Trophy, Image as ImageIcon } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Primary visible links in main navigation
  const primaryLinks = [
    { name: 'Home', path: '/' },
    { name: 'Campus Mantri', path: '/campus-mantri' },
    { name: 'Teams', path: '/teams' },
    { name: 'Events', path: '/events' },
    { name: 'Community', path: '/community', badge: 'Feed' }
  ];

  // Secondary links inside More dropdown
  const moreLinks = [
    { name: 'Gallery', path: '/gallery', desc: 'Photo & video highlights', icon: ImageIcon },
    { name: 'Resources', path: '/resources', desc: 'Study notes & roadmaps', icon: BookOpen },
    { name: 'Leaderboard', path: '/leaderboard', desc: 'Top contributors', icon: Trophy }
  ];

  const isActive = (path) =>
    location.pathname === path || (path === '/campus-mantri' && location.pathname === '/mantri-history');

  const isMoreActive = moreLinks.some((link) => location.pathname === link.path);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMoreOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-[#30363d]/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          
          {/* 1. Unified Brand Lockup */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 bg-white px-2.5 py-1 rounded-xl flex items-center justify-center border border-[#2f9e44]/40 shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
              <img
                src="/assets/gfg-official-logo.png"
                alt="GeeksforGeeks Campus Body Jamia Hamdard"
                style={{ height: '28px', width: 'auto' }}
                className="h-7 max-h-7 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white group-hover:text-[#2f9e44] transition-colors leading-snug">
                GeeksforGeeks <span className="text-[#2f9e44]">Campus Body</span>
              </span>
              <span className="text-xs text-gray-400 font-medium tracking-wide">
                Jamia Hamdard
              </span>
            </div>
          </Link>

          {/* 2. Desktop Primary Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {primaryLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                    active
                      ? 'text-white bg-[#21262d] font-bold border-b-2 border-[#2f9e44]'
                      : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <span>{link.name}</span>
                  {link.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2f9e44] text-white font-bold tracking-wider uppercase">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            {/* 3. More Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                  isMoreActive || isMoreOpen
                    ? 'text-white bg-[#21262d] font-bold border-b-2 border-[#2f9e44]'
                    : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <span>More</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180 text-[#2f9e44]' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-60 glass-panel bg-[#161b22] border border-[#30363d] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {moreLinks.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.path;
                    return (
                      <Link
                        key={item.name + item.path}
                        to={item.path}
                        onClick={() => setIsMoreOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          active
                            ? 'bg-[#21262d] text-white border border-[#2f9e44]/40'
                            : 'text-gray-300 hover:text-white hover:bg-[#21262d]/60'
                        }`}
                      >
                        <div className="p-2 rounded-lg bg-[#0d1117] text-[#2f9e44] border border-[#30363d] flex-shrink-0 mt-0.5">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{item.name}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* 4. Desktop Profile Control */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                isActive('/profile')
                  ? 'bg-[#21262d] text-white border-[#2f9e44]'
                  : 'bg-[#161b22] text-gray-300 hover:text-white border-[#30363d] hover:border-[#2f9e44]/50'
              }`}
            >
              <User className="w-4 h-4 text-[#2f9e44]" />
              <span>Profile</span>
            </Link>
          </div>

          {/* 5. Mobile Toggle */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-[#21262d] focus:outline-none transition-colors border border-[#30363d]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 6. Mobile Drawer */}
      {isOpen && (
        <div className="lg:hidden glass-panel border-b border-[#30363d] px-4 pt-3 pb-6 space-y-4 animate-in fade-in duration-150">
          
          {/* Main Pages */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-2">Navigation</span>
            {primaryLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'text-white bg-[#21262d] font-bold border-l-4 border-[#2f9e44]'
                    : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#2f9e44] text-white font-bold uppercase">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* More Links */}
          <div className="space-y-1 pt-2 border-t border-[#30363d]">
            <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-2">More Options</span>
            {moreLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.name + link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    location.pathname === link.path
                      ? 'text-white bg-[#21262d] font-bold border-l-4 border-[#2f9e44]'
                      : 'text-gray-300 hover:text-white hover:bg-[#161b22]'
                  }`}
                >
                  <Icon className="w-4 h-4 text-[#2f9e44]" />
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Profile */}
          <div className="pt-2 border-t border-[#30363d]">
            <Link
              to="/profile"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl bg-[#21262d] text-white border border-[#30363d] hover:border-[#2f9e44]"
            >
              <User className="w-4 h-4 text-[#2f9e44]" />
              <span>My Profile</span>
            </Link>
          </div>

        </div>
      )}
    </header>
  );
}
