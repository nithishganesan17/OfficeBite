import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/common/Toast';

/**
 * Dedicated Admin Portal Layout.
 * Dark theme matching OfficeBite standard aesthetic.
 * Clean header with signature OfficeBite cursive branding and single profile dropdown.
 */
export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    logout();
    navigate('/admin/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-[#F3F4F6] selection:bg-[#F59E0B] selection:text-black">
      {/* Executive Administrator Header */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-white/10 shadow-xl">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Admin Brand with Signature OfficeBite Cursive Font */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 flex items-center justify-center text-[#F59E0B] shadow-md shadow-[#F59E0B]/5">
                <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-2.5">
                <span className="font-['Dancing_Script',cursive] font-bold text-2xl sm:text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] tracking-wide drop-shadow-sm select-none">
                  OfficeBite
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30 text-[10px] font-extrabold uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
            </div>

            {/* Admin Single Round Logo Profile Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                id="admin-profile-btn"
                className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#D97706] text-black flex items-center justify-center font-black text-sm shadow-md hover:shadow-lg hover:ring-2 hover:ring-[#F59E0B]/50 transition-all cursor-pointer active:scale-95 shrink-0"
                title="Administrator Profile & Settings"
                aria-label="Administrator Profile & Settings"
              >
                {getInitials(currentUser?.name || 'System Administrator')}
              </button>

              {/* Profile Details Dropdown Menu */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 bg-[#1E1E1E] rounded-2xl shadow-2xl border border-white/10 p-3 z-50 text-xs">
                  <div className="p-3 border-b border-white/10 bg-[#161616] rounded-xl mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#F59E0B] to-[#D97706] text-black flex items-center justify-center font-black text-xs shadow-sm shrink-0">
                        {getInitials(currentUser?.name || 'System Administrator')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold text-white text-sm truncate">
                          {currentUser?.name || 'System Administrator'}
                        </p>
                        <p className="text-[11px] text-white/50 truncate">
                          {currentUser?.email || 'admin@officebite.com'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30">
                        ADMINISTRATOR
                      </span>
                      <span className="text-[10px] text-white/40 font-mono">
                        {currentUser?.employeeId || 'ADMIN-01'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleSignOut();
                      }}
                      id="admin-logout-btn"
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 font-bold transition-colors cursor-pointer text-xs"
                    >
                      <LogOut className="w-4 h-4 text-red-400" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Admin Viewport */}
      <main className="flex-1 bg-[#121212]">
        <Outlet />
      </main>

      {/* Admin Executive Footer */}
      <footer className="bg-[#1A1A1A] border-t border-white/10 py-4 text-center text-xs text-white/40">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-white/60">OfficeBite Enterprise Canteen Management System</span>
          </div>
          <span>OfficeBite Admin Workspace</span>
        </div>
      </footer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default AdminLayout;
