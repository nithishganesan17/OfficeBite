import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User,
  BadgeCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Sparkles,
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
      // Public customer registration: Role is strictly CUSTOMER on backend
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
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-[#EDE8DC] shadow-sm p-8 sm:p-10">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#197A50] to-[#125B3C] text-white flex items-center justify-center mx-auto shadow-md mb-4">
              <UtensilsCrossed className="w-7 h-7 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-extrabold text-[#292524] tracking-tight">
              Create Employee Account
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] mt-1.5">
              Order fresh meals and track live pickup tokens in Tower A
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-red-800">Registration Error</p>
                <p className="text-red-700 mt-0.5 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: null }));
                  }}
                  placeholder="e.g. Priya Patel"
                  autoComplete="name"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F2] border text-xs sm:text-sm text-[#292524] focus:outline-none transition-colors ${
                    fieldErrors.name
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#EDE8DC] focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]'
                  }`}
                  disabled={isSubmitting || authLoading}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Work Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F2] border text-xs sm:text-sm text-[#292524] focus:outline-none transition-colors ${
                    fieldErrors.email
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#EDE8DC] focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]'
                  }`}
                  disabled={isSubmitting || authLoading}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Corporate Employee ID (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Corporate Employee ID <span className="text-[11px] font-normal text-[#78716C]">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <BadgeCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="e.g. OB-4102"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC] text-xs sm:text-sm text-[#292524] focus:outline-none focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50] transition-colors"
                  disabled={isSubmitting || authLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Create Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
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
                  className={`w-full pl-10 pr-11 py-3 rounded-2xl bg-[#FAF8F2] border text-xs sm:text-sm text-[#292524] focus:outline-none transition-colors ${
                    fieldErrors.password
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#EDE8DC] focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]'
                  }`}
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
              {fieldErrors.password && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-bold text-[#292524] mb-1.5">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#A8A29E]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  required
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl bg-[#FAF8F2] border text-xs sm:text-sm text-[#292524] focus:outline-none transition-colors ${
                    fieldErrors.confirmPassword
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-[#EDE8DC] focus:border-[#197A50] focus:ring-1 focus:ring-[#197A50]'
                  }`}
                  disabled={isSubmitting || authLoading}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-[11px] text-red-600 font-medium mt-1">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Role Info Box (Educates user that this is for customers) */}
            <div className="bg-[#FAF8F2] border border-[#EDE8DC] rounded-2xl p-3 text-[11px] text-[#78716C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#197A50] shrink-0" />
              <span>Registers an employee <strong>Customer</strong> account for food ordering and token tracking.</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                isSubmitting || authLoading
                  ? 'bg-[#197A50]/70 text-white cursor-not-allowed'
                  : 'bg-[#197A50] hover:bg-[#125B3C] text-white hover:shadow-lg cursor-pointer active:scale-98'
              }`}
            >
              {isSubmitting || authLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start Ordering</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Login */}
          <div className="mt-6 pt-6 border-t border-[#F4EFE6] text-center text-xs text-[#78716C]">
            <span>Already have an employee account? </span>
            <Link
              to="/login"
              className="font-bold text-[#197A50] hover:text-[#125B3C] hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Security Footer Note */}
        <div className="mt-6 text-center text-[11px] text-[#A8A29E] flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#197A50]" />
          <span>OfficeBite Corporate Authentication • Tower A</span>
        </div>
      </div>
    </div>
  );
};
