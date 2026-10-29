import React, { useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  UtensilsCrossed,
  ChefHat,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * RoleSelectionPage (/login)
 * Visual role selection portal showing:
 * - Customer card in Olive & Cream
 * - Staff card in Deep Navy & Cyan
 * - Admin card in Executive Slate
 */
export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, currentUser } = useAuth();

  // If already authenticated, redirect to their role's respective dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (currentUser.role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else {
        navigate('/menu', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate]);

  return (
    <div className="min-h-[calc(100vh-5rem)] py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto flex flex-col justify-center text-[#261C14]">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-[#EEF3E8] text-[#3D5A2B] border border-[#D4E0C9] mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D48B18]" />
          <span>OfficeBite Portal Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#261C14] tracking-tight">
          Select Your Workspace Portal
        </h1>
        <p className="text-sm sm:text-base text-[#73675C] mt-2.5 leading-relaxed">
          Please select your intended destination to continue to the designated sign-in terminal. Each portal provides role-tailored authentication and workspace tools.
        </p>
      </div>

      {/* Role Selection Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {/* 1. Customer Card (Olive & Cream) */}
        <div className="group bg-white rounded-3xl border border-[#EAE3D6] p-8 shadow-sm hover:shadow-xl hover:border-[#3D5A2B]/40 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#EEF3E8]/70 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#EEF3E8] text-[#3D5A2B] border border-[#D4E0C9] flex items-center justify-center mb-6 shadow-2xs group-hover:bg-[#3D5A2B] group-hover:text-white transition-all">
              <UtensilsCrossed className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EEF3E8] text-[#3D5A2B]">
                Customer
              </span>
              <span className="text-xs text-[#73675C] font-medium">Tower A Canteen</span>
            </div>

            <h2 className="text-xl font-black text-[#261C14] tracking-tight group-hover:text-[#3D5A2B] transition-colors">
              Customer Login
            </h2>

            <p className="text-xs text-[#73675C] mt-2.5 leading-relaxed">
              Explore freshly cooked daily menus, customize your food plate, place orders, and track your status in real time.
            </p>
          </div>

          <div className="pt-8 mt-6 border-t border-[#EAE3D6] space-y-3">
            <Link
              to="/customer/login"
              className="w-full py-3 px-4 rounded-2xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98"
              id="role-select-customer-btn"
            >
              <span>Sign In as Customer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="text-center">
              <Link
                to="/register"
                className="text-[11px] font-semibold text-[#73675C] hover:text-[#3D5A2B] transition-colors"
              >
                New employee? <span className="underline font-bold text-[#3D5A2B]">Create account</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Kitchen Staff Card (Deep Navy & Cyan) */}
        <div className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-cyan-500 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-[#F0F7FF] rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#0B192C] text-cyan-400 border border-slate-800 flex items-center justify-center mb-6 shadow-2xs group-hover:bg-[#0891B2] group-hover:text-white transition-all">
              <ChefHat className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/80">
                Kitchen Staff
              </span>
              <span className="text-xs text-slate-500 font-medium">Floor 3 Terminal</span>
            </div>

            <h2 className="text-xl font-black text-[#0B192C] tracking-tight group-hover:text-cyan-700 transition-colors">
              Kitchen Staff Login
            </h2>

            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              Live kitchen display terminal to accept incoming orders, manage the cooking queue, dispatch counter tokens, and mark meals ready.
            </p>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100 space-y-3">
            <Link
              to="/staff/login"
              className="w-full py-3 px-4 rounded-2xl bg-[#0B192C] hover:bg-[#1E3E62] border border-cyan-500/40 text-cyan-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98"
              id="role-select-staff-btn"
            >
              <span>Sign In to Kitchen Terminal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="text-center">
              <span className="text-[11px] text-slate-400">
                Restricted to authorized kitchen personnel
              </span>
            </div>
          </div>
        </div>

        {/* 3. Admin Card (Preserved Executive Slate) */}
        <div className="group bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:border-slate-400 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-28 h-28 bg-slate-100/70 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

          <div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center mb-6 shadow-2xs group-hover:bg-[#0f172a] group-hover:text-white transition-all">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>

            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                Administration
              </span>
              <span className="text-xs text-slate-500 font-medium">Clearance Level 1</span>
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-[#0f172a] transition-colors">
              Admin Login
            </h2>

            <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
              Executive console for staff provisioning, user roles, catalog dish pricing and availability, and system-wide order audit logs.
            </p>
          </div>

          <div className="pt-8 mt-6 border-t border-slate-100 space-y-3">
            <Link
              to="/admin/login"
              className="w-full py-3 px-4 rounded-2xl bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all active:scale-98"
              id="role-select-admin-btn"
            >
              <span>Sign In to Admin Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="text-center">
              <span className="text-[11px] text-slate-400">
                Restricted to system administrators & supervisors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Security Disclaimer */}
      <div className="mt-12 text-center text-xs text-[#73675C] flex items-center justify-center gap-2">
        <KeyRound className="w-3.5 h-3.5 text-[#3D5A2B]" />
        <span>OfficeBite Enterprise Authentication • All sessions secured by 256-bit JWT authorization</span>
      </div>
    </div>
  );
};

export default RoleSelectionPage;
