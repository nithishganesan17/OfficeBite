import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

/**
 * CustomerLoginPage
 * Clean, dark-themed login interface matching OfficeBite homepage.
 * Simplified strictly to: 'Log In', Work Email, Password, and Submit.
 * If administrator credentials are submitted, navigates directly to /admin.
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

  // If already authenticated, redirect
  useEffect(() => {
    const adminTok = localStorage.getItem('officebite_admin_token');
    const rawAdmin = localStorage.getItem('officebite_admin_user');
    let adminU = null;
    try { adminU = rawAdmin ? JSON.parse(rawAdmin) : null; } catch {}
    if ((adminTok && adminU?.role === 'ADMIN') || (currentUser?.role === 'ADMIN')) {
      navigate('/admin', { replace: true });
      return;
    }

    if (isAuthenticated && currentUser) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (currentUser.role === 'STAFF') {
        navigate('/staff', { replace: true });
      } else {
        const dest = location.state?.from;
        const isCustomerDest = dest && !dest.startsWith('/staff') && !dest.startsWith('/admin');
        navigate(isCustomerDest ? dest : '/', { replace: true });
      }
    }
  }, [isAuthenticated, currentUser, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailVal = email || document.getElementById('customer-email')?.value || '';
    const passVal = password || document.getElementById('customer-password')?.value || '';

    const trimmedEmail = emailVal.trim().toLowerCase();
    if (!trimmedEmail || !passVal) {
      setErrorMessage('Please enter both your work email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginUser(trimmedEmail, passVal, null);

      // If administrator credentials entered, directly navigate to admin console
      if (user.role === 'ADMIN') {
        if (showToast) {
          showToast(`Welcome, Administrator ${user.name}!`, 'success');
        }
        window.location.href = '/admin';
      } else if (user.role === 'STAFF') {
        if (showToast) {
          showToast(`Authenticated as ${user.name} (Kitchen Staff)`, 'success');
        }
        window.location.href = '/staff';
      } else {
        if (showToast) {
          showToast(`Welcome back, ${user.name}!`, 'success');
        }
        const dest = location.state?.from;
        const isCustomerDest = dest && !dest.startsWith('/staff') && !dest.startsWith('/admin');
        window.location.href = isCustomerDest ? dest : '/';
      }
    } catch (err) {
      console.error('Customer login error:', err);
      if (err.isAccessRevoked || err.message?.includes('Access Revoked')) {
        setErrorMessage(
          err.message || 'Access Revoked: This account has been disabled by the Administrator.'
        );
      } else if (err.response?.status === 401) {
        setErrorMessage('Invalid work email or password. Please check your credentials.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Invalid credentials or unable to sign in. Please verify your email and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      {/* Dark Card matching Homepage aesthetic */}
      <div className="bg-[#1A1A1A]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Soft Amber Glow behind the card */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Clean Header: Just 'Log In' */}
        <div className="text-center mb-8">
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Log In
          </h1>
        </div>

        {/* Checkout Intent Notice */}
        {location.state?.notice && !errorMessage && (
          <div className="mb-6 bg-[#F59E0B]/10 border border-[#F59E0B]/30 rounded-2xl p-4 flex items-start gap-3 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-[#F59E0B]">Sign In to Place Order</p>
              <p className="text-white/80 mt-0.5 leading-relaxed">{location.state.notice}</p>
            </div>
          </div>
        )}

        {/* Error Notice Banner */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-300">Authentication Failed</p>
              <p className="text-red-400 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Form: Mail and Password */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">
              Work Email <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">
              Password <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
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
                className="w-full pl-10 pr-11 py-3 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white cursor-pointer"
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
            className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-4 cursor-pointer active:scale-98 ${
              isSubmitting || authLoading
                ? 'bg-[#F59E0B]/70 text-[#121212] cursor-not-allowed'
                : 'bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] hover:shadow-lg hover:shadow-[#F59E0B]/20'
            }`}
          >
            {isSubmitting || authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#121212]" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            id="customer-register-link"
            className="font-bold text-[#F59E0B] hover:text-[#D97706] hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerLoginPage;
