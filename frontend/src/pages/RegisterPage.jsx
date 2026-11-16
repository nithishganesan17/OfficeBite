import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerUser, isAuthenticated, currentUser, authLoading } = useAuth();
  const { showToast } = useCart();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to menu
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/menu', { replace: true });
    }
  }, [isAuthenticated, currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedEmpId = employeeId.trim();

    if (!trimmedName) {
      setFieldErrors((prev) => ({ ...prev, name: 'Full name is required.' }));
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!trimmedEmail) {
      setFieldErrors((prev) => ({ ...prev, email: 'Work email is required.' }));
      setErrorMessage('Please enter your work email.');
      return;
    }

    if (!password || password.length < 6) {
      setFieldErrors((prev) => ({ ...prev, password: 'Password must be at least 6 characters long.' }));
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await registerUser({
        name: trimmedName,
        email: trimmedEmail,
        employeeId: trimmedEmpId || undefined,
        password: password,
      });

      if (showToast) {
        showToast(`Account created! Welcome, ${user.name}!`, 'success');
      }
      navigate('/menu', { replace: true });
    } catch (err) {
      console.error('Customer registration failed:', err);
      if (err.response?.status === 409) {
        setErrorMessage('This work email is already registered. Please sign in or use a different email.');
        setFieldErrors((prev) => ({ ...prev, email: 'Email already exists in system.' }));
      } else if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
        const firstErr = Object.values(err.response.data.fieldErrors)[0];
        setErrorMessage(firstErr || 'Please check highlighted fields.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to complete registration. Please verify backend is running on port 8081.');
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
          <h1 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Create Account
          </h1>
        </div>

        {errorMessage && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-red-300">Registration Error</p>
              <p className="text-red-400 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Full Name <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
                }}
                placeholder="Priya Sharma"
                autoComplete="name"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Work Email <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                }}
                placeholder="priya@company.com"
                autoComplete="email"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Employee ID <span className="text-white/40 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP-1042"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Password <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                }}
                placeholder="At least 6 characters"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-11 py-2.5 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
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

          <div>
            <label className="block text-xs font-bold text-white/90 mb-1.5">
              Confirm Password <span className="text-[#F59E0B]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword)
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                }}
                placeholder="Repeat your password"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#121212] border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-colors"
                disabled={isSubmitting || authLoading}
              />
            </div>
          </div>

          <button
            type="submit"
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
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-white/50">
          <span>Already have an account? </span>
          <Link
            to="/customer/login"
            className="font-bold text-[#F59E0B] hover:text-[#D97706] hover:underline"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
