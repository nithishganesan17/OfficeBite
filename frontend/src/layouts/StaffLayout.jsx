import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { ChefHat, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/common/Toast';

/**
 * Dedicated Kitchen Staff Portal Layout.
 * Dark theme matching OfficeBite customer and admin portals (#121212, #1A1A1A, #F59E0B).
 */
export const StaffLayout = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const staffUser = (() => {
    try {
      const raw = localStorage.getItem('officebite_staff_user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })() || { name: 'Kitchen Staff', role: 'STAFF', employeeId: 'STAFF-01' };

  const handleSignOut = () => {
    localStorage.removeItem('officebite_staff_token');
    localStorage.removeItem('officebite_staff_user');
    navigate('/staff/login', { replace: true });
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-[#F3F4F6] selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]">
      {/* Kitchen Terminal Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1A1A1A]/95 backdrop-blur-md border-b border-white/10 text-white shadow-md">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Terminal Branding - Clean OfficeBite branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#D97706] flex items-center justify-center text-[#121212] font-black shadow-sm">
                <ChefHat className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">OfficeBite</span>
            </div>

            {/* Staff Controls */}
            <div className="flex items-center gap-3">
              {/* Admin return jump if admin logged in */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 text-xs font-bold transition-colors border border-white/10"
                  title="Return to Admin Management"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Admin Console</span>
                </Link>
              )}

              {/* Staff Profile Capsule */}
              {staffUser && (
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-[#262626] border border-white/10 shadow-xs">
                  <div className="w-7 h-7 rounded-xl bg-[#F59E0B] text-[#121212] flex items-center justify-center font-black text-xs">
                    {getInitials(staffUser.name)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-white leading-tight truncate max-w-[120px]">
                      {staffUser.name}
                    </p>
                    <p className="text-[10px] font-bold text-[#F59E0B] tracking-wide uppercase">
                      {staffUser.role}
                    </p>
                  </div>
                </div>
              )}

              {/* Staff Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                id="staff-logout-btn"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-950/40 border border-red-800/60 text-red-400 hover:bg-red-900/40 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                title="Sign out of Kitchen Staff Terminal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Kitchen Viewport */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default StaffLayout;
