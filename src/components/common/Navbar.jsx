import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, Menu, X, User, BookOpen, Users, Trophy, Image as ImageIcon, LogOut, Shield, Bookmark, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const { user, member, isAuthenticated, loading, openAuthModal, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

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

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsMoreOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMoreOpen(false);
        setIsUserMenuOpen(false);
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
    setIsUserMenuOpen(false);
    setIsOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const displayName = member?.name || user?.username || 'Member Profile';
  const displayPhoto = member?.photo || user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=2f9e44&color=fff&bold=true`;
  const isSuperAdmin = user?.role === 'Super Admin' || user?.role === 'Admin';

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-[#30363d]/80 transition-all duration-200">
      
      {/* Universal Auth Modal */}
      <AuthModal />

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

            {/* More Dropdown */}
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

          {/* 3. Desktop Auth / Profile Control */}
          <div className="hidden lg:flex items-center gap-3">
            {loading ? (
              <div className="h-9 w-24 rounded-xl bg-[#21262d] animate-pulse"></div>
            ) : !isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white hover:bg-[#21262d] transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-xl gradient-button text-xs font-bold shadow-md hover:scale-[1.02] transition-transform"
                >
                  Join Community
                </button>
              </div>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#161b22] border border-[#30363d] hover:border-[#2f9e44]/60 transition-all text-xs font-semibold text-white shadow-sm"
                >
                  <img
                    src={displayPhoto}
                    alt={displayName}
                    className="w-7 h-7 rounded-full object-cover border border-[#2f9e44]"
                  />
                  <span className="max-w-[120px] truncate">{displayName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isUserMenuOpen ? 'rotate-180 text-[#2f9e44]' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-panel bg-[#161b22] border border-[#30363d] rounded-2xl p-2 shadow-2xl z-50 animate-in fade-in duration-150">
                    
                    {/* User Summary Header */}
                    <div className="p-3 border-b border-[#30363d] mb-1">
                      <p className="font-bold text-xs text-white truncate">{displayName}</p>
                      <p className="text-[10px] text-[#2f9e44] font-mono uppercase font-bold mt-0.5">
                        {member?.accountType || user?.role || 'Visitor'} Account
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#21262d] font-semibold transition-colors"
                    >
                      <User className="w-4 h-4 text-[#2f9e44]" /> My Profile
                    </Link>

                    <Link
                      to="/community"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#21262d] font-semibold transition-colors"
                    >
                      <Users className="w-4 h-4 text-[#2f9e44]" /> Community Feed
                    </Link>

                    <Link
                      to="/profile?tab=saved"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#21262d] font-semibold transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-[#2f9e44]" /> Saved Posts
                    </Link>

                    <Link
                      to="/profile?tab=card"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-300 hover:text-white hover:bg-[#21262d] font-semibold transition-colors"
                    >
                      <CreditCard className="w-4 h-4 text-[#2f9e44]" /> Membership Card
                    </Link>

                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 font-bold border border-emerald-500/30 my-1 transition-colors"
                      >
                        <Shield className="w-4 h-4" /> Admin Console
                      </Link>
                    )}

                    <div className="border-t border-[#30363d] pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-500/10 font-semibold transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>

                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. Mobile Toggle */}
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

      {/* 5. Mobile Drawer */}
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

          {/* Mobile Auth Actions */}
          <div className="pt-2 border-t border-[#30363d] space-y-2">
            {!isAuthenticated ? (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { setIsOpen(false); openAuthModal('login'); }}
                  className="py-2.5 text-center text-xs font-bold rounded-xl bg-[#21262d] text-white border border-[#30363d]"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setIsOpen(false); openAuthModal('signup'); }}
                  className="py-2.5 text-center text-xs font-bold rounded-xl gradient-button text-white shadow-md"
                >
                  Join Community
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/profile"
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-bold rounded-xl bg-[#21262d] text-white border border-[#30363d]"
                >
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-[#2f9e44]" />
                    <span>My Profile</span>
                  </div>
                  <span className="text-[10px] text-[#2f9e44] font-mono">{member?.accountType || 'Visitor'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 text-xs font-bold rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-center"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      )}
    </header>
  );
}
