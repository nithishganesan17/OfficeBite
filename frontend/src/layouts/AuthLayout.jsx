import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import { Toast } from '../components/common/Toast';

/**
 * Dedicated Authentication Layout.
 * Styled with OfficeBite's signature dark theme from the homepage:
 * - Matte dark charcoal background: #121212 / #161616 with soft amber radial glow
 * - Brand typography: Dancing Script warm gold logo
 * - Top header with exactly TWO options: Customer and Staff (No Admin portal)
 */
export const AuthLayout = () => {
  const location = useLocation();
  const isCustomer =
    location.pathname === '/customer/login' ||
    location.pathname === '/login' ||
    location.pathname === '/register';
  const isStaff = location.pathname === '/staff/login';

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F4F6] flex flex-col justify-between selection:bg-[#F59E0B]/30 selection:text-[#F59E0B] relative overflow-hidden">
      {/* Soft Ambient Warm Amber Glow behind the presentation */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-r from-[#F59E0B]/10 via-[#D97706]/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Auth Navigation Header */}
      <header className="w-full bg-[#121212]/95 backdrop-blur-md border-b border-white/10 py-3.5 px-4 sm:px-6 relative z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-3 group cursor-pointer"
            title="Return to OfficeBite Canteen"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B] flex items-center justify-center shadow-xs group-hover:scale-105 transition-all">
              <ChefHat className="w-6 h-6 stroke-[2.2] text-[#F59E0B]" />
            </div>
            <span className="font-['Dancing_Script',cursive] font-bold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] tracking-wide select-none">
              OfficeBite
            </span>
          </Link>

          {/* Role Navigation: ONLY TWO TABS (Customer and Staff) */}
          <div className="flex items-center gap-1.5 sm:gap-2 bg-[#1A1A1A] p-1 rounded-2xl border border-white/10">
            <Link
              to="/customer/login"
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isCustomer
                  ? 'bg-[#F59E0B] text-[#121212] font-black shadow-md shadow-[#F59E0B]/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Customer
            </Link>
            <Link
              to="/staff/login"
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                isStaff
                  ? 'bg-[#F59E0B] text-[#121212] font-black shadow-md shadow-[#F59E0B]/20'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              Staff
            </Link>
          </div>
        </div>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-white/40 border-t border-white/10 bg-[#121212]/80 relative z-20">
        <p>OfficeBite Canteen System • Secure Role-Based Authentication</p>
      </footer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default AuthLayout;
