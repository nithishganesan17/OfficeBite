import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * CustomerLoginPage
 * Styled with Kanigiri warm cream, olive green, saffron gold, and dark brown.
 */
export const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated, currentUser, authLoading } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated with customer, redirect
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'CUSTOMER') {
        const dest = location.state?.from;
        const isCustomerDest = dest && !dest.startsWith('/staff') && !dest.startsWith('/admin');
        navigate(isCustomerDest ? dest : '/', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !password) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser(trimmedEmail, password, null);

      if (showToast) {
        showToast(`Welcome back, ${user.name}!`, 'success');
      }

      if (user.role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else if (user.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        const dest = location.state?.from;
        const isCustomerDest = dest && !dest.startsWith('/staff') && !dest.startsWith('/admin');
        navigate(isCustomerDest ? dest : '/', { replace: true });
      }
    } catch (err) {
      console.error('Customer login error:', err);
      if (err.response?.status === 401) {
        setErrorMessage('Invalid work email or password. Please check your credentials.');
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-[#261C14]">
      <div className="max-w-md w-full">
        {/* Navigation back to role selector */}
        <div className="mb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#73675C] hover:text-[#3D5A2B] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Switch Portal Selection</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-[#EAE3D6] shadow-sm p-8 sm:p-10 relative overflow-hidden">
          {/* Top Decorative accent banner in Olive */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3D5A2B] via-[#507538] to-[#D48B18]" />

          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#3D5A2B] to-[#507538] text-white flex items-center justify-center mx-auto shadow-md mb-4 shadow-[#3D5A2B]/20">
              <UtensilsCrossed className="w-7 h-7 stroke-[2.2]" />
            </div>

            <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#EEF3E8] text-[#3D5A2B] border border-[#D4E0C9] mb-2">
              Employee Food Ordering
            </span>

            <h1 className="text-2xl font-black text-[#261C14] tracking-tight">
              Customer Sign In
            </h1>
            <p className="text-xs sm:text-sm text-[#73675C] mt-1.5">
              Access your corporate canteen account and order tracking
            </p>
          </div>

          {/* Redirect Notice Banner */}
          {location.state?.from && !location.state?.roleMismatch && (
            <div className="mb-5 bg-[#EEF3E8] border border-[#D4E0C9] rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-[#3D5A2B]">
              <Sparkles className="w-4 h-4 shrink-0 text-[#D48B18]" />
              <span>Please sign in to view your orders or complete your checkout.</span>
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
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#261C14] mb-1.5">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#73675C]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  id="customer-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="employee@company.com"
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D6] text-xs sm:text-sm text-[#261C14] focus:outline-none focus:border-[#3D5A2B] focus:ring-1 focus:ring-[#3D5A2B] transition-colors"
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#261C14] mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#73675C]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="customer-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D6] text-xs sm:text-sm text-[#261C14] focus:outline-none focus:border-[#3D5A2B] focus:ring-1 focus:ring-[#3D5A2B] transition-colors"
                  disabled={isSubmitting || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#73675C] hover:text-[#261C14] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              id="customer-login-submit"
              disabled={isSubmitting || authLoading}
              className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                isSubmitting || authLoading
                  ? 'bg-[#3D5A2B]/70 text-white cursor-not-allowed'
                  : 'bg-[#3D5A2B] hover:bg-[#2E4620] text-white hover:shadow-lg cursor-pointer active:scale-98'
              }`}
            >
              {isSubmitting || authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Customer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-6 pt-6 border-t border-[#EAE3D6] text-center text-xs text-[#73675C]">
            <span>Don't have an employee account? </span>
            <Link
              to="/register"
              id="customer-register-link"
              className="font-bold text-[#3D5A2B] hover:text-[#2E4620] hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-[11px] text-[#73675C] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3D5A2B]" />
          <span>OfficeBite Customer Authentication • Tower A Canteen</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
