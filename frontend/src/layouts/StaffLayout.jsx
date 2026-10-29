import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { ChefHat, LogOut, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/common/Toast';

/**
 * Dedicated Kitchen Staff Portal Layout.
 * Restored original warm culinary identity:
 * Crisp white/stone backdrop (#FAF8F5), warm amber/orange branding (#F28C45 / #DE752C), and emerald status cues (#197A50).
 * Strictly excludes customer shopping navbar, cart drawer, and admin controls.
 */
export const StaffLayout = () => {
  const { currentUser, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#292524] selection:bg-[#F28C45]/20 selection:text-[#DE752C]">
      {/* Kitchen Terminal Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#EDE8DC] text-[#292524] shadow-xs">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Terminal Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F28C45] to-[#DE752C] flex items-center justify-center text-white shadow-sm">
                <ChefHat className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-[#292524] tracking-tight">OfficeBite</span>
                  <span className="px-2 py-0.5 rounded-md bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC] text-[10px] font-black uppercase tracking-wider">
                    Kitchen Terminal
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C] hidden sm:block">
                  Live Preparation Queue & Counter Token Fulfillment
                </p>
              </div>
            </div>

            {/* Terminal Status Indicators & Staff User Controls */}
            <div className="flex items-center gap-3">
              {/* Station Live Badge */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EBF5F0] border border-[#C8E6D6] text-[#197A50] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#197A50] animate-pulse" />
                <span>Station 1 Operational</span>
              </div>

              {/* Admin return jump if admin logged in */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                  title="Return to Admin Management"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-800" />
                  <span>Admin Console</span>
                </Link>
              )}

              {/* Staff Profile Capsule */}
              {currentUser && (
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl bg-white border border-[#EDE8DC] shadow-2xs">
                  <div className="w-7 h-7 rounded-xl bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC] flex items-center justify-center font-bold text-xs shadow-2xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-[#292524] leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] font-extrabold text-[#DE752C] tracking-wide uppercase">
                      {currentUser.role} {currentUser.employeeId ? `• ${currentUser.employeeId}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Staff Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                id="staff-logout-btn"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
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

      {/* Terminal Footer */}
      <footer className="bg-white border-t border-[#EDE8DC] py-4 text-center text-xs text-[#78716C]">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#197A50] animate-pulse" />
            <span>Kitchen Display System • Station 1 (Floor 3) • Connected to Spring Boot & MySQL</span>
          </div>
          <span className="text-[#A8A29E]">OfficeBite Enterprise Kitchen Terminal</span>
        </div>
      </footer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default StaffLayout;
