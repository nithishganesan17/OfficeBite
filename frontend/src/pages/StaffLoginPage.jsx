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
import { login as apiLogin, isUserAccessRevoked, resetRevokedAccess } from '../services/api';

/**
 * StaffLoginPage
 * Clean, dark-themed staff terminal login matching OfficeBite homepage.
 * Simplified strictly to: 'Log In', Staff Email, Password, and Submit.
 * If administrator credentials are submitted, navigates directly to /admin.
 */
export const StaffLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser, isAuthenticated, currentUser, authLoading, logout } = useAuth();
  const { showToast } = useCart();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(() => {
    if (location.state?.message) return location.state.message;
    if (location.state?.revoked) {
      return 'Access Revoked: Staff permissions for this account have been removed by the Administrator.';
    }
    return null;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Synchronize state message if navigating with state
  useEffect(() => {
    if (location.state?.message) {
      setErrorMessage(location.state.message);
    } else if (location.state?.revoked) {
      setErrorMessage(
        'Access Revoked: Staff permissions for this account have been removed by the Administrator.'
      );
    }
  }, [location.state]);

  // If already authenticated with ADMIN, redirect to /admin. If STAFF, redirect to /staff
  useEffect(() => {
    if (location.state?.revoked) return;

    const adminTok = localStorage.getItem('officebite_admin_token');
    const rawAdminUser = localStorage.getItem('officebite_admin_user');
    let adminUser = null;
    try {
      adminUser = rawAdminUser ? JSON.parse(rawAdminUser) : null;
    } catch {}

    if ((adminTok && adminUser?.role === 'ADMIN') || currentUser?.role === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }

    const staffToken = localStorage.getItem('officebite_staff_token');
    const rawStaffUser = localStorage.getItem('officebite_staff_user');
    let staffUser = null;
    try {
      staffUser = rawStaffUser ? JSON.parse(rawStaffUser) : null;
    } catch {}

    if (staffToken && staffUser && staffUser.role === 'STAFF') {
      const isRevoked = isUserAccessRevoked(staffUser.email);
      if (!isRevoked) {
        navigate('/staff', { replace: true });
      }
    }
  }, [navigate, currentUser, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const emailVal = email || document.getElementById('staff-email')?.value || '';
    const passVal = password || document.getElementById('staff-password')?.value || '';

    const trimmedEmail = emailVal.trim().toLowerCase();
    if (!trimmedEmail || !passVal) {
      setErrorMessage('Please enter both your staff email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Authenticate staff with backend and synchronize AuthContext
      const user = await loginUser(trimmedEmail, passVal, null);

      if (user.role === 'ADMIN') {
        if (showToast) {
          showToast(`Welcome, Administrator ${user.name}!`, 'success');
        }
        navigate('/admin', { replace: true });
      } else if (user.role === 'STAFF') {
        if (showToast) {
          showToast(`Authenticated as ${user.name} (Kitchen Staff)`, 'success');
        }
        const dest = location.state?.from;
        const isStaffDest = dest && dest.startsWith('/staff');
        navigate(isStaffDest ? dest : '/staff', { replace: true });
      } else {
        // Customer credentials entered on Staff portal: seamlessly redirect them to customer portal
        if (showToast) {
          showToast(`Welcome, ${user.name}! Redirected to Canteen.`, 'success');
        }
        navigate('/', { replace: true });
      }
    } catch (err) {
      console.error('Kitchen staff login error:', err);
      if (err.isAccessRevoked || err.message?.includes('Access Revoked')) {
        setErrorMessage(
          err.message || 'Access Revoked: Staff permissions for this account have been removed by the Administrator.'
        );
      } else if (err.response?.status === 401) {
        setErrorMessage('Invalid staff email or password. Please verify your credentials.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Invalid credentials or unable to sign in. Please verify your email and password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestoreDemoAccess = () => {
    resetRevokedAccess();
    setErrorMessage(null);
    if (showToast) {
      showToast('Staff access restored! You can now log in.', 'success');
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

        {/* Error Notice Banner */}
        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-xs flex-1">
                <p className="font-bold text-red-300">Authentication Failed</p>
                <p className="text-red-400 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            {errorMessage.toLowerCase().includes('revoked') && (
              <div className="pt-2 border-t border-red-500/20 flex justify-end">
                <button
                  type="button"
                  onClick={handleRestoreDemoAccess}
                  className="px-3 py-1.5 rounded-xl bg-[#F59E0B]/20 hover:bg-[#F59E0B]/30 text-[#F59E0B] font-bold text-xs border border-[#F59E0B]/40 transition-colors cursor-pointer"
                >
                  Restore Staff Access
                </button>
              </div>
            )}
          </div>
        )}

        {/* Form: Mail and Password */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">
              Staff Email <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
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
                id="staff-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter staff password"
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
            id="staff-login-submit"
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
                <span>Verifying Access...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StaffLoginPage;
