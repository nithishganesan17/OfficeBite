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
    const adminTok =
      localStorage.getItem('officebite_admin_token') || localStorage.getItem('token');
    const rawAdmin =
      localStorage.getItem('officebite_admin_user') || localStorage.getItem('officebite_user');
    let adminU = null;
    try {
      adminU = rawAdmin ? JSON.parse(rawAdmin) : null;
    } catch {}

    if (
      (adminTok && adminU?.role === 'ADMIN') ||
      (isAuthenticated && currentUser?.role === 'ADMIN')
    ) {
      const dest = location.state?.from;
      const isAdminDest = dest && dest.startsWith('/admin');
      navigate(isAdminDest ? dest : '/admin', { replace: true });
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
        setErrorMessage(
          `Access Denied: Account '${trimmedEmail}' does not have Administrator privileges.`
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
    <div className="w-full max-w-md animate-fade-in">
      <div className="bg-[#1A1A1A]/95 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <h1 className="font-['Playfair_Display',serif] text-3xl font-bold text-white tracking-tight">
            Administrator Access
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-300">Authentication Failed</p>
              <p className="text-red-400 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">
              Administrator Email <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
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
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/90 mb-2">
              Administrator Password <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
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

          <button
            type="submit"
            id="admin-login-submit"
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
                <span>Verifying Clearance...</span>
              </>
            ) : (
              <>
                <span>Unlock Admin Console</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
