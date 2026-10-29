import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed,
  ShoppingBag,
  Bell,
  User,
  Search,
  Menu,
  X,
  Clock,
  Sparkles,
  ChevronDown,
  LogIn,
  LogOut,
  FileText,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

/**
 * Customer Portal Navbar.
 * Elegantly themed in warm cream, olive green, saffron gold, and dark brown.
 * Exclusively provides customer-specific routes (Home, Menu, Cart, Orders, Sign In).
 */
export const Navbar = ({ onSearchClick }) => {
  const { totalItemCount, setIsCartOpen, orders, activeOrdersCount: contextActiveOrdersCount } = useCart();
  const { currentUser, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    if (!name) return 'U';
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
    <header className="sticky top-0 z-40 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#EAE3D6] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#3D5A2B] to-[#507538] text-white flex items-center justify-center shadow-md shadow-[#3D5A2B]/20 group-hover:scale-105 transition-all">
            <UtensilsCrossed className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#261C14]">
                Office<span className="text-[#3D5A2B]">Bite</span>
              </span>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FDF5E6] text-[#D48B18] border border-[#F8E3BA] tracking-wider">
                Royal Canteen
              </span>
            </div>
            <p className="text-[11px] text-[#73675C] font-medium leading-none mt-0.5">
              Tower A • Floor 3 Kitchen
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-white/80 p-1.5 rounded-2xl border border-[#EAE3D6] shadow-2xs">
          <Link
            to="/"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/')
                ? 'bg-[#3D5A2B] text-white shadow-xs'
                : 'text-[#73675C] hover:text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/menu"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              isActive('/menu')
                ? 'bg-[#3D5A2B] text-white shadow-xs'
                : 'text-[#73675C] hover:text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            Explore Menu
          </Link>
          <Link
            to="/cart"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive('/cart')
                ? 'bg-[#3D5A2B] text-white shadow-xs'
                : 'text-[#73675C] hover:text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            <span>Food Tray</span>
            {totalItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D48B18] text-white text-[10px] font-black flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isActive('/orders')
                ? 'bg-[#3D5A2B] text-white shadow-xs'
                : 'text-[#73675C] hover:text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            <span>My Orders</span>
            {activeOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D48B18] text-white text-[10px] font-black flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </Link>
        </nav>

        {/* Right Action Icons & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Trigger Button */}
          {onSearchClick && (
            <button
              onClick={onSearchClick}
              className="p-2.5 rounded-xl bg-white border border-[#EAE3D6] text-[#73675C] hover:text-[#261C14] hover:border-[#D4E0C9] transition-colors cursor-pointer shadow-2xs hidden sm:flex items-center gap-2"
              title="Search menu"
            >
              <Search className="w-4 h-4 text-[#73675C]" />
              <span className="text-xs text-[#73675C] pr-2">Search thali, dosa, biryani...</span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2.5 rounded-xl bg-white border border-[#EAE3D6] text-[#73675C] hover:text-[#261C14] hover:border-[#D4E0C9] transition-colors cursor-pointer shadow-2xs"
              title="Canteen alerts"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#D48B18] ring-2 ring-white"></span>
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-[#EAE3D6] p-4 z-50 animate-scale-up">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
                  <h4 className="text-xs font-black text-[#261C14] uppercase tracking-wide">
                    Canteen Announcements
                  </h4>
                  <span className="text-[10px] text-[#3D5A2B] font-bold bg-[#EEF3E8] px-2 py-0.5 rounded-full">
                    Live
                  </span>
                </div>
                <div className="space-y-3 mt-3 text-xs">
                  <div className="flex gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#3D5A2B] mt-1 shrink-0"></span>
                    <div>
                      <p className="font-bold text-[#261C14]">Live Royal Kitchen Active</p>
                      <p className="text-[#73675C] text-[11px] mt-0.5">
                        Fresh South Indian Dosas & Degree Filter Coffee now serving at Counter 2.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-[#D48B18] mt-1 shrink-0"></span>
                    <div>
                      <p className="font-bold text-[#261C14]">Lunch Specials</p>
                      <p className="text-[#73675C] text-[11px] mt-0.5">
                        Deluxe North Indian Royal Thali & Dum Biryani available until 3:30 PM.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cart Drawer Trigger Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-2.5 rounded-xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-bold text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
            title="Open cart tray"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Plate</span>
            {totalItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D48B18] text-white text-[11px] font-black flex items-center justify-center ring-2 ring-white">
                {totalItemCount}
              </span>
            )}
          </button>

          {/* User Profile or Sign In Capsule */}
          {isAuthenticated && currentUser ? (
            <div className="relative hidden lg:block" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-2xl border border-[#EAE3D6] hover:border-[#3D5A2B]/40 bg-white hover:bg-[#FAF6EE] transition-all cursor-pointer shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-[#EEF3E8] border border-[#D4E0C9] flex items-center justify-center text-[#3D5A2B] font-bold text-xs">
                  {getInitials(currentUser.name)}
                </div>
                <div className="text-left">
                  <span className="block text-xs font-bold text-[#261C14] leading-tight max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="block text-[10px] text-[#73675C] leading-none mt-0.5">
                    {currentUser.employeeId || currentUser.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#73675C]" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAE3D6] p-2.5 z-50 text-xs">
                  <div className="p-2.5 border-b border-[#EAE3D6] bg-[#FAF6EE]/60 rounded-xl mb-1.5">
                    <p className="font-extrabold text-[#261C14]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#73675C] truncate mt-0.5">{currentUser.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EEF3E8] text-[#3D5A2B] border border-[#D4E0C9]">
                        {currentUser.role}
                      </span>
                      {currentUser.employeeId && (
                        <span className="text-[10px] text-[#73675C]">
                          ID: {currentUser.employeeId}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    to="/orders"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[#261C14] hover:bg-[#FAF6EE] font-semibold transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#3D5A2B]" />
                    <span>My Canteen Orders</span>
                  </Link>

                  <div className="pt-1.5 mt-1 border-t border-[#EAE3D6]">
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        navigate('/customer/login', { replace: true });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
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
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#EAE3D6] hover:border-[#3D5A2B] text-[#3D5A2B] font-bold text-xs shadow-2xs hover:shadow-md transition-all cursor-pointer active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Customer Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-white border border-[#EAE3D6] text-[#261C14] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-[#EAE3D6] px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/') ? 'bg-[#3D5A2B] text-white' : 'text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            Home
          </Link>
          <Link
            to="/menu"
            onClick={() => setMobileMenuOpen(false)}
            className={`block px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/menu') ? 'bg-[#3D5A2B] text-white' : 'text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            Explore Menu
          </Link>
          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/cart') ? 'bg-[#3D5A2B] text-white' : 'text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            <span>Food Tray</span>
            {totalItemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D48B18] text-white text-xs font-bold flex items-center justify-center">
                {totalItemCount}
              </span>
            )}
          </Link>
          <Link
            to="/orders"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold ${
              isActive('/orders') ? 'bg-[#3D5A2B] text-white' : 'text-[#261C14] hover:bg-[#FAF6EE]'
            }`}
          >
            <span>My Orders</span>
            {activeOrdersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#D48B18] text-white text-xs font-bold flex items-center justify-center">
                {activeOrdersCount}
              </span>
            )}
          </Link>

          {/* Mobile Auth Status */}
          {isAuthenticated && currentUser ? (
            <div className="pt-3 border-t border-[#EAE3D6] px-2 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] border border-[#D4E0C9] flex items-center justify-center text-[#3D5A2B] font-bold text-xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#261C14]">{currentUser.name}</p>
                    <p className="text-[11px] text-[#73675C]">{currentUser.email}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF6EE] text-[#3D5A2B] border border-[#EAE3D6]">
                  {currentUser.role}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate('/customer/login', { replace: true });
                }}
                className="w-full py-2 px-3 rounded-xl bg-[#FAF6EE] hover:bg-red-50 text-red-600 border border-[#EAE3D6] hover:border-red-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="pt-3 border-t border-[#EAE3D6] px-2">
              <Link
                to="/customer/login"
                id="navbar-mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-[#3D5A2B] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-95"
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
