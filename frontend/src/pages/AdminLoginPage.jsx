import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  ShieldAlert,
  ChevronLeft,
  KeyRound,
  Info,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated, currentUser, authLoading } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated with ADMIN role, redirect to admin dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') {
        const dest = location.state?.from;
        const isAdminDest = dest && dest.startsWith('/admin');
        navigate(isAdminDest ? dest : '/admin', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your administrator email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Strictly enforce ADMIN role on this portal
      const user = await loginUser(trimmedEmail, password, ['ADMIN']);

      if (showToast) {
        showToast(`Welcome, Administrator ${user.name}!`, 'success');
      }

      const dest = location.state?.from;
      const isAdminDest = dest && dest.startsWith('/admin');
      navigate(isAdminDest ? dest : '/admin', { replace: true });
    } catch (err) {
      console.error('Administrator login error:', err);
      if (err.isRoleMismatch) {
        // Explicit role-mismatch message
        setErrorMessage(
          `Access Denied: Account '${err.actualRole ? trimmedEmail : 'provided'}' has role '${err.actualRole || 'NON_ADMIN'}'. Full Administrator (ADMIN) privileges are required to access the Admin Console.`
        );
      } else if (err.response?.status === 401) {
        setErrorMessage('Invalid administrator credentials. Access to management operations is restricted.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to connect to authentication service. Please verify backend is running on port 8081.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="max-w-md w-full">
        {/* Navigation back to role selector */}
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#0f172a] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Switch Portal Selection</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 sm:p-10 relative overflow-hidden">
          {/* Top Decorative executive slate accent banner */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#197A50]" />

          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center mx-auto shadow-md mb-4 ring-4 ring-slate-100">
              <ShieldCheck className="w-7 h-7 stroke-[2.2]" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200 mb-2">
              Security Clearance Level 1
            </span>

            <h1 className="text-2xl font-black text-[#292524] tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1.5">
              Canteen personnel provisioning, catalog governance, and system audits
            </p>
          </div>

          {/* Role Mismatch Notice if bounced from /admin */}
          {location.state?.roleMismatch && (
            <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-red-800">Administrator Clearance Required</p>
                <p className="text-red-700 mt-0.5 leading-relaxed">
                  {location.state.message || 'Full Administrator privileges are required to access this portal.'}
                </p>
              </div>
            </div>
          )}



          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-red-800">Authentication Failed</p>
                <p className="text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Admin Email */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Administrator Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="admin-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@officebite.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC] text-xs sm:text-sm text-[#292524] focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Administrator Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="admin-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC] text-xs sm:text-sm text-[#292524] focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                  disabled={isSubmitting || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#A8A29E] hover:text-[#292524] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="admin-login-submit"
              disabled={isSubmitting || authLoading}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                isSubmitting || authLoading
                  ? 'bg-slate-800/70 text-white cursor-not-allowed'
                  : 'bg-[#0f172a] hover:bg-[#1e293b] text-white hover:shadow-lg cursor-pointer active:scale-98'
              }`}
            >
              {isSubmitting || authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Administrator Clearance...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 pt-5 border-t border-[#F4EFE6] text-center">
            <p className="text-[11px] text-[#78716C] leading-relaxed">
              ⚠️ Restricted administrative console. Unauthorized access attempts are logged and reported in accordance with corporate security policy.
            </p>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-[11px] text-[#A8A29E] flex items-center justify-center gap-1.5">
          <KeyRound className="w-3.5 h-3.5 text-slate-600" />
          <span>OfficeBite Operations Security • Tower A Corporate Infrastructure</span>
        </div>
      </div>
    </div>
  );
};
