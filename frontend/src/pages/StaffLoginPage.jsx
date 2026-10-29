import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ChefHat,
  ArrowRight,
  ChevronLeft,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Toast } from '../components/common/Toast';

/**
 * StaffLoginPage
 * Restored original Kitchen Staff Login interface with warm culinary amber/orange identity (#F28C45 / #DE752C).
 * Isolated auth: strictly does NOT display any other user's email or identity.
 * Standalone layout: does not include the Customer shopping navbar or Customer header.
 */
export const StaffLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated, currentUser, authLoading } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated with STAFF or ADMIN role, redirect to kitchen dashboard
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN') {
        const dest = location.state?.from;
        const isStaffDest = dest && dest.startsWith('/staff');
        navigate(isStaffDest ? dest : '/staff', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your kitchen staff email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Strictly enforce STAFF or ADMIN role on this portal
      const user = await loginUser(trimmedEmail, password, ['STAFF', 'ADMIN']);

      if (showToast) {
        showToast(`Authenticated as ${user.name} (${user.role})`, 'success');
      }

      const dest = location.state?.from;
      const isStaffDest = dest && dest.startsWith('/staff');
      navigate(isStaffDest ? dest : '/staff', { replace: true });
    } catch (err) {
      console.error('Kitchen staff login error:', err);
      if (err.isRoleMismatch) {
        setErrorMessage(
          `Access Denied: Account '${trimmedEmail}' has role '${err.actualRole || 'CUSTOMER'}'. Kitchen Staff (STAFF) or Admin privileges are required to access the Kitchen Terminal.`
        );
      } else if (err.response?.status === 401) {
        setErrorMessage('Invalid staff email or password. Please verify your credentials or contact canteen administration.');
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
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col justify-between text-[#292524] selection:bg-[#F28C45]/20 selection:text-[#DE752C]">
      {/* Top Terminal Navigation Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#EDE8DC] py-3.5 px-4 sm:px-6 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F28C45] to-[#DE752C] flex items-center justify-center text-white shadow-xs">
              <ChefHat className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-base tracking-tight text-[#292524] leading-none">
                  OfficeBite
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC] text-[10px] font-black uppercase tracking-wider">
                  Kitchen Terminal
                </span>
              </div>
              <p className="text-[10px] text-[#78716C] font-semibold tracking-wide">
                Live Kitchen Dispatch & Order Preparation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF5F0] text-[#197A50] border border-[#C8E6D6] text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-[#197A50] animate-pulse" />
              <span>Station 1 Operational</span>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#78716C] hover:text-[#DE752C] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Switch Portal</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Single-Card Login Viewport */}
      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Card Container */}
          <div className="bg-white rounded-3xl border border-[#EDE8DC] shadow-sm p-8 sm:p-10 relative overflow-hidden">
            {/* Top Decorative culinary amber/orange accent banner */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#F28C45] via-[#DE752C] to-[#197A50]" />

            {/* Brand Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FEF3EB] to-[#FDE8D7] text-[#DE752C] flex items-center justify-center mx-auto shadow-sm mb-4 ring-4 ring-[#FEF3EB]">
                <ChefHat className="w-7 h-7 stroke-[2.2]" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FEF3EB] text-[#DE752C] border border-[#FBD8BC] mb-2">
                Kitchen Terminal Access
              </span>

              <h1 className="text-2xl font-black text-[#292524] tracking-tight">
                Kitchen Staff Sign In
              </h1>
              <p className="text-xs sm:text-sm text-[#78716C] mt-1.5">
                Live preparation queue, cooking status updates, and counter token dispatch
              </p>
            </div>

            {/* Role Mismatch Notice if bounced from /staff */}
            {location.state?.roleMismatch && (
              <div className="mb-5 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-red-800">Clearance Required</p>
                  <p className="text-red-700 mt-0.5 leading-relaxed">
                    {location.state.message || 'Kitchen Staff privileges are required to access this dashboard.'}
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
              {/* Staff Email */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">
                  Staff Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="staff-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chef@officebite.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DC] text-xs sm:text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#DE752C] focus:ring-1 focus:ring-[#DE752C] transition-colors"
                    disabled={isSubmitting || authLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-bold text-[#292524] mb-1.5">
                  Terminal Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="staff-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter staff password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#FAF8F5] border border-[#EDE8DC] text-xs sm:text-sm text-[#292524] placeholder:text-[#A8A29E] focus:outline-none focus:border-[#DE752C] focus:ring-1 focus:ring-[#DE752C] transition-colors"
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
                id="staff-login-submit"
                disabled={isSubmitting || authLoading}
                className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                  isSubmitting || authLoading
                    ? 'bg-[#DE752C]/70 text-white cursor-not-allowed'
                    : 'bg-[#F28C45] hover:bg-[#DE752C] text-white hover:shadow-lg cursor-pointer active:scale-98'
                }`}
              >
                {isSubmitting || authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Verifying Kitchen Access...</span>
                  </>
                ) : (
                  <>
                    <ChefHat className="w-4 h-4" />
                    <span>Sign In to Terminal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-5 border-t border-[#EDE8DC] text-center">
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                Authorized kitchen personnel and canteen operators only. Station sessions are logged.
              </p>
            </div>
          </div>

          {/* Security Footer Note */}
          <div className="mt-6 text-center text-[11px] text-[#A8A29E] flex items-center justify-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-[#DE752C]" />
            <span>OfficeBite Kitchen Dispatch • Tower A Floor 3 Infrastructure</span>
          </div>
        </div>
      </main>

      {/* Terminal Footer */}
      <footer className="py-4 text-center text-xs text-[#78716C] border-t border-[#EDE8DC] bg-white/80">
        <p>OfficeBite Kitchen Terminal • Station 1 (Floor 3) • Connected to Spring Boot & MySQL</p>
      </footer>

      {/* Toast notifications */}
      <Toast />
    </div>
  );
};

export default StaffLoginPage;
