import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ChefHat,
  User,
  Search,
  Menu,
  X,
  LogIn,
  LogOut,
  FileText,
  Phone,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { BananaLeafCart } from './BananaLeafCart';

/**
 * Customer Portal Navbar — Dark Charcoal & Gold Theme.
 * - Matching the reference image: dark background (#121212) that transitions on scroll
 *   to a light black with glassmorphic blur (#181818/90 backdrop-blur-md).
 * - "OfficeBite" office name in BOLD, STYLISH HANDWRITING (Dancing Script cursive) with a warm golden gradient!
 * - Clean, bold navigation links and sleek dark pill search & cart controls.
 */
export const Navbar = () => {
  const { totalItemCount, setIsCartOpen, orders, activeOrdersCount: contextActiveOrdersCount } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('diet') || 'all'; // 'all' | 'veg' | 'non-veg'
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Monitor scroll and swipe/wheel state for center-to-right animation and frosted glass blur
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };

    // Touch swipe detection to trigger smooth transition immediately
    let touchStartY = 0;
    let touchStartX = 0;

    const handleTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const handleTouchMove = (e) => {
      if (!e.touches || !e.touches[0]) return;
      const deltaY = touchStartY - e.touches[0].clientY;
      const deltaX = touchStartX - e.touches[0].clientX;

      // Swiping up (moving page down) or swiping horizontally
      if (deltaY > 15 || Math.abs(deltaX) > 35) {
        setIsScrolled(true);
      } else if (deltaY < -15 && window.scrollY <= 10) {
        setIsScrolled(false);
      }
    };

    // Wheel detection for mouse / trackpad
    const handleWheel = (e) => {
      if (e.deltaY > 10) {
        setIsScrolled(true);
      } else if (e.deltaY < -10 && window.scrollY <= 10) {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Sync search input with URL params if on /menu
  useEffect(() => {
    if (location.pathname === '/menu') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q');
      if (q) {
        setNavSearchQuery(q);
      }
      const d = params.get('diet');
      setDietFilter(d || 'all');
    } else {
      setNavSearchQuery('');
      setDietFilter('all');
    }
  }, [location.pathname, location.search]);

  // Handle Diet Filter Toggle (Veg / Non-Veg) for Menu Page
  const handleDietFilterToggle = (type) => {
    const nextType = dietFilter === type ? 'all' : type;
    setDietFilter(nextType);

    const params = new URLSearchParams(location.search);
    if (nextType === 'all') {
      params.delete('diet');
    } else {
      params.set('diet', nextType);
    }
    const searchStr = params.toString();
    navigate(`/menu${searchStr ? `?${searchStr}` : ''}`, { replace: true });
    window.dispatchEvent(new CustomEvent('officebite:diet-filter', { detail: nextType }));
  };

  // Handle search input changes
  const handleNavSearchChange = (e) => {
    const val = e.target.value;
    setNavSearchQuery(val);
    window.dispatchEvent(new CustomEvent('officebite:search', { detail: val }));
  };

  const handleNavSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (location.pathname !== '/menu') {
        navigate(`/menu?q=${encodeURIComponent(navSearchQuery.trim())}`);
      }
    }
  };

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'R';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const activeOrdersCount =
    typeof contextActiveOrdersCount === 'number'
      ? contextActiveOrdersCount
      : orders.filter((o) =>
          o.status === 'PLACED' ||
          o.status === 'ACCEPTED' ||
          o.status === 'PREPARING' ||
          o.status === 'READY'
        ).length;

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="sticky top-0 z-40 transition-all duration-500 bg-transparent border-0 outline-none shadow-none relative"
      style={{
        border: 'none',
        borderBottom: 'none',
        boxShadow: 'none',
        outline: 'none',
      }}
    >
      {/* Progressive Frosted Glass Blur Background — Completely removes the line & blends downward organically like the reference image */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none -z-10 transition-all duration-500 ease-out"
        style={{
          height: '115px',
          background: isScrolled
            ? 'linear-gradient(to bottom, rgba(18, 18, 18, 0.95) 0%, rgba(18, 18, 18, 0.8) 50%, rgba(18, 18, 18, 0.35) 80%, rgba(18, 18, 18, 0) 100%)'
            : 'linear-gradient(to bottom, rgba(18, 18, 18, 0.85) 0%, rgba(18, 18, 18, 0.6) 45%, rgba(18, 18, 18, 0.2) 75%, rgba(18, 18, 18, 0) 100%)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          maskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0, 0, 0, 0.4) 80%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 50%, rgba(0, 0, 0, 0.4) 80%, transparent 100%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 relative">
        {/* Left: OfficeBite Logo in BOLD & STYLISH HANDWRITING (Dancing Script) */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group z-20">
          <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
            <ChefHat className="w-6 h-6 stroke-[2.2] text-[#F59E0B]" />
          </div>
          <div>
            <span className="font-['Dancing_Script',cursive] font-bold text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] tracking-wide drop-shadow-sm select-none">
              OfficeBite
            </span>
          </div>
        </Link>

        {/* Centered at Start & Smoothly Animates Completely to Right on Scroll / Swipe */}
        <div
          className={`absolute top-1/2 flex items-center gap-3 sm:gap-4 z-20 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-auto ${
            isScrolled
              ? 'right-14 sm:right-16 md:right-6 lg:right-8 translate-x-0 -translate-y-1/2'
              : 'right-1/2 translate-x-1/2 -translate-y-1/2'
          }`}
        >
          {/* Integrated Search Bar */}
          <div className="hidden sm:flex items-center relative bg-[#1E1E1E]/90 border border-white/10 rounded-full px-3.5 py-2 shadow-2xs focus-within:border-[#F59E0B] focus-within:ring-2 focus-within:ring-[#F59E0B]/20 transition-all w-48 md:w-60 lg:w-72">
            <Search className="w-4 h-4 text-white/50 mr-2 shrink-0" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={handleNavSearchChange}
              onKeyDown={handleNavSearchKeyDown}
              placeholder="Search dishes, biryanis, dosas..."
              className="w-full bg-transparent border-none text-xs text-white placeholder:text-white/40 focus:outline-none"
            />
            {navSearchQuery && (
              <button
                type="button"
                onClick={() => {
                  setNavSearchQuery('');
                  window.dispatchEvent(new CustomEvent('officebite:search', { detail: '' }));
                }}
                className="text-white/50 hover:text-white text-xs cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* =========================================================
              VEG & NON-VEG SELECTION BUTTONS (ONLY ON MENU PAGE, BEFORE THE LEAF)
              Same size buttons with small text below:
              - Veg button: Curry leaves image + "Veg"
              - Non-Veg button: Chicken image + "Nonveg"
             ========================================================= */}
          {location.pathname === '/menu' && (
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 animate-fade-in">
              {/* Veg Selection Unit */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleDietFilterToggle('veg')}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center p-1.5 transition-all duration-300 cursor-pointer active:scale-95 group relative ${
                    dietFilter === 'veg'
                      ? 'bg-emerald-500/25 border-2 border-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.55)] scale-105'
                      : dietFilter === 'non-veg'
                        ? 'bg-[#1E1E1E] border border-white/10 opacity-35 hover:opacity-90 hover:border-emerald-500/40'
                        : 'bg-[#1E1E1E] hover:bg-[#252525] border border-white/15 hover:border-emerald-400/60 shadow-xs'
                  }`}
                  title={dietFilter === 'veg' ? 'Active: Vegetarian only (Click to clear)' : 'Filter Vegetarian (Curry Leaves)'}
                  aria-label="Filter Vegetarian"
                >
                  <img
                    src="/assets/images/curry_leaves.svg"
                    alt="Curry Leaves (Vegetarian)"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform"
                  />
                  {dietFilter === 'veg' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#34D399]" />
                  )}
                </button>
                <span
                  onClick={() => handleDietFilterToggle('veg')}
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 cursor-pointer transition-colors select-none ${
                    dietFilter === 'veg'
                      ? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.6)] font-extrabold'
                      : dietFilter === 'non-veg'
                        ? 'text-white/30'
                        : 'text-white/70 hover:text-emerald-400'
                  }`}
                >
                  Veg
                </span>
              </div>

              {/* Non-Veg Selection Unit */}
              <div className="flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => handleDietFilterToggle('non-veg')}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center p-1.5 transition-all duration-300 cursor-pointer active:scale-95 group relative ${
                    dietFilter === 'non-veg'
                      ? 'bg-amber-500/25 border-2 border-[#F59E0B] shadow-[0_0_16px_rgba(245,158,11,0.55)] scale-105'
                      : dietFilter === 'veg'
                        ? 'bg-[#1E1E1E] border border-white/10 opacity-35 hover:opacity-90 hover:border-amber-500/40'
                        : 'bg-[#1E1E1E] hover:bg-[#252525] border border-white/15 hover:border-amber-400/60 shadow-xs'
                  }`}
                  title={dietFilter === 'non-veg' ? 'Active: Non-Vegetarian only (Click to clear)' : 'Filter Non-Vegetarian (Chicken)'}
                  aria-label="Filter Non-Vegetarian"
                >
                  <img
                    src="/assets/images/chicken_leg.svg"
                    alt="Chicken (Non-Vegetarian)"
                    className="w-full h-full object-contain pointer-events-none drop-shadow-xs group-hover:scale-110 transition-transform"
                  />
                  {dietFilter === 'non-veg' && (
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_6px_#F59E0B]" />
                  )}
                </button>
                <span
                  onClick={() => handleDietFilterToggle('non-veg')}
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-wider mt-0.5 cursor-pointer transition-colors select-none ${
                    dietFilter === 'non-veg'
                      ? 'text-[#F59E0B] drop-shadow-[0_0_6px_rgba(245,158,11,0.6)] font-extrabold'
                      : dietFilter === 'veg'
                        ? 'text-white/30'
                        : 'text-white/70 hover:text-[#F59E0B]'
                  }`}
                >
                  Nonveg
                </span>
              </div>
            </div>
          )}

          {/* Cart Trigger Button: Authentic Large South Indian Banana Leaf (NO CIRCLE) */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative p-1 text-white transition-transform hover:scale-110 active:scale-95 flex items-center justify-center cursor-pointer group bg-transparent border-none outline-none"
            title={
              totalItemCount > 0
                ? `Banana leaf food tray with hot white rice (${totalItemCount} items)`
                : 'Banana leaf food tray (Empty)'
            }
            aria-label="Open food tray"
          >
            <BananaLeafCart
              itemCount={totalItemCount}
              className="w-14 sm:w-16 md:w-18 lg:w-20 h-auto transition-transform group-hover:scale-105"
            />
            {totalItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-[#F59E0B] text-[#121212] text-[10px] font-black flex items-center justify-center ring-2 ring-[#121212] shadow-md animate-scale-up">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar / Sign In Button (Also centered at start & animates to right) */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="w-10 h-10 rounded-full bg-[#242424] hover:bg-[#2A2A2A] border border-white/10 hover:border-[#F59E0B] text-[#F59E0B] flex items-center justify-center font-bold text-sm shadow-xs transition-transform hover:scale-105 cursor-pointer"
                title={currentUser.name}
              >
                {getInitials(currentUser.name)}
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#1E1E1E] rounded-2xl shadow-2xl border border-white/10 p-2.5 z-50 text-xs animate-scale-up">
                  <div className="p-2.5 border-b border-white/10 bg-[#161616] rounded-xl mb-1.5">
                    <p className="font-extrabold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/25">
                        {currentUser.role}
                      </span>
                      {currentUser.employeeId && (
                        <span className="text-[10px] text-white/50">
                          ID: {currentUser.employeeId}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/90 hover:bg-white/5 font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>My Canteen Orders</span>
                  </Link>

                  <div className="pt-1.5 mt-1 border-t border-white/10">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/customer/login', { replace: true });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/customer/login"
              id="navbar-login-btn"
              className="w-10 h-10 rounded-full bg-[#1E1E1E] hover:bg-[#252525] border border-white/10 hover:border-[#F59E0B] text-white flex items-center justify-center font-bold text-xs shadow-xs transition-transform hover:scale-105 cursor-pointer"
              title="Customer Sign In"
            >
              <User className="w-4 h-4 text-[#F59E0B]" />
            </Link>
          )}
        </div>

        {/* Far Right Mobile Hamburger Menu (Only shown on small screens) */}
        <div className="md:hidden flex items-center gap-2 shrink-0 z-20 ml-auto">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#1E1E1E] border border-white/10 text-white cursor-pointer hover:border-[#F59E0B] transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#181818] border-b border-white/10 px-4 pt-3 pb-5 space-y-2">
          {/* Mobile Search input */}
          <div className="flex items-center relative bg-[#1E1E1E] border border-white/10 rounded-2xl px-3.5 py-2.5 mb-2">
            <Search className="w-4 h-4 text-white/50 mr-2 shrink-0" />
            <input
              type="text"
              value={navSearchQuery}
              onChange={handleNavSearchChange}
              placeholder="Search dishes..."
              className="w-full bg-transparent border-none text-xs text-white placeholder:text-white/40 focus:outline-none"
            />
          </div>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/') ? 'bg-[#F59E0B] text-[#121212]' : 'text-white hover:bg-white/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/menu') ? 'bg-[#F59E0B] text-[#121212]' : 'text-white hover:bg-white/5'
            }`}
          >
            Menu
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/cart') ? 'bg-[#F59E0B] text-[#121212]' : 'text-white hover:bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2">
              <BananaLeafCart itemCount={totalItemCount} className="w-8 h-auto" />
              <span>Food Tray</span>
            </div>
            {totalItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#121212] text-xs font-bold flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/orders') ? 'bg-[#F59E0B] text-[#121212]' : 'text-white hover:bg-white/5'
            }`}
          >
            <span>My Orders</span>
            {activeOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#F59E0B] text-[#121212] text-xs font-bold flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </Link>

          <a
            href="#footer"
            onClick={(e) => {
              e.preventDefault();
              setMobileMenuOpen(false);
              window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }}
            className="block px-4 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/5"
          >
            Contact & Helpdesk
          </a>

          <a
            href="tel:9363584566"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/20"
          >
            <Phone className="w-4 h-4" />
            <span>Call Helpdesk: 9363584566</span>
          </a>

          {/* Mobile Auth Status */}
          {isAuthenticated && currentUser ? (
            <div className="pt-3 border-t border-white/10 px-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#242424] text-[#F59E0B] flex items-center justify-center font-bold text-xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">{currentUser.name}</p>
                    <p className="text-[11px] text-white/50">{currentUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/customer/login', { replace: true });
                }}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-red-500/10 text-red-400 border border-white/10 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-white/10 px-2">
              <Link
                to="/customer/login"
                id="navbar-mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#F59E0B] text-[#121212] text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
              >
                <LogIn className="w-4 h-4" />
                <span>Customer Sign In</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
