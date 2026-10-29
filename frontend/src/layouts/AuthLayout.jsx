import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { UtensilsCrossed, ChefHat, ShieldCheck, ArrowLeft } from 'lucide-react';
import { Toast } from '../components/common/Toast';

/**
 * Dedicated Authentication Layout.
 * Renders a clean, distraction-free environment for role selection and login pages.
 */
export const AuthLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col text-[#261C14] selection:bg-[#3D5A2B]/20 selection:text-[#3D5A2B]">
      {/* Auth Navigation Header */}
      <header className="w-full bg-white/90 backdrop-blur-md border-b border-[#EAE3D6] py-3.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2.5 group cursor-pointer"
            title="Return to OfficeBite Canteen"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3D5A2B] to-[#507538] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tight text-[#261C14] leading-none">
                OfficeBite
              </span>
              <span className="text-[10px] text-[#73675C] font-semibold tracking-wide">
                Corporate Dining Platform
              </span>
            </div>
          </Link>

          {/* Role Navigation Quick Badges */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/customer/login"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/customer/login'
                  ? 'bg-[#3D5A2B] text-white shadow-xs'
                  : 'text-[#73675C] hover:text-[#261C14] hover:bg-white'
              }`}
            >
              Customer
            </Link>
            <Link
              to="/staff/login"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/staff/login'
                  ? 'bg-[#0B192C] text-cyan-300 shadow-xs border border-cyan-800/80'
                  : 'text-[#73675C] hover:text-[#261C14] hover:bg-white'
              }`}
            >
              Staff
            </Link>
            <Link
              to="/admin/login"
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === '/admin/login'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-[#73675C] hover:text-[#261C14] hover:bg-white'
              }`}
            >
              Admin
            </Link>
          </div>
        </div>
      </header>

      {/* Main Auth Form Container */}
      <main className="flex-1 flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* Minimal Footer */}
      <footer className="py-4 text-center text-xs text-[#73675C] border-t border-[#EAE3D6] bg-white/60">
        <p>OfficeBite Canteen System • Secure Role-Based Authentication</p>
      </footer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default AuthLayout;
