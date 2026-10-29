import React from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  ShieldCheck,
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  ShoppingBag,
  ChefHat,
  LogOut,
  Sparkles,
  Server,
  Database,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Toast } from '../components/common/Toast';

/**
 * Dedicated Admin Portal Layout.
 * Contains dedicated administrator header, navigation links (Overview, Menu, Users, Orders, Kitchen).
 * Strictly excludes customer shopping navbar, cart drawer, and shopping controls.
 */
export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  const navItems = [
    {
      to: '/admin',
      label: 'Overview',
      icon: LayoutDashboard,
      exact: true,
      active: location.pathname === '/admin' || location.pathname === '/admin/dashboard',
    },
    {
      to: '/admin/menu',
      label: 'Menu Management',
      icon: UtensilsCrossed,
      active: location.pathname === '/admin/menu',
    },
    {
      to: '/admin/users',
      label: 'Users & Staff',
      icon: Users,
      active: location.pathname === '/admin/users',
    },
    {
      to: '/admin/orders',
      label: 'Canteen Orders',
      icon: ShoppingBag,
      active: location.pathname === '/admin/orders',
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col text-slate-800 selection:bg-slate-900 selection:text-white">
      {/* Executive Administrator Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-900 to-slate-700 flex items-center justify-center text-white shadow-md shadow-slate-900/10">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-lg text-slate-900 tracking-tight">OfficeBite</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-300 text-[10px] font-extrabold uppercase tracking-wider">
                    Admin Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Enterprise Canteen Control & Operations
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      item.active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Admin Profile & Terminal Quick Link & Sign Out */}
            <div className="flex items-center gap-2.5">
              {/* Quick Jump to Kitchen Staff Terminal */}
              <Link
                to="/staff"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-700 text-xs font-bold transition-colors"
                title="View Kitchen Staff Terminal"
              >
                <ChefHat className="w-3.5 h-3.5 text-orange-600" />
                <span>Kitchen Terminal</span>
              </Link>

              {/* Admin Profile Chip */}
              {currentUser && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-100 border border-slate-200">
                  <div className="w-7 h-7 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold text-xs shadow-2xs">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] font-extrabold text-emerald-600 tracking-wide">
                      ADMINISTRATOR {currentUser.employeeId ? `• ${currentUser.employeeId}` : ''}
                    </p>
                  </div>
                </div>
              )}

              {/* Admin Sign Out Button */}
              <button
                type="button"
                onClick={handleSignOut}
                id="admin-logout-btn"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                title="Sign out of Administrator Portal"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Mobile Secondary Navigation Row */}
          <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    item.active
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 bg-slate-100'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Admin Viewport */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Admin Executive Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-[1700px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>OfficeBite Enterprise Canteen Management System</span>
          </div>
          <span>Secure Admin Workspace • Connected to Spring Boot & MySQL</span>
        </div>
      </footer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default AdminLayout;
