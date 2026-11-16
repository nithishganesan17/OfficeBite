import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  UtensilsCrossed,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const AuthModal = () => {
  const navigate = useNavigate();
  const {
    authModalOpen,
    authModalTab,
    setAuthModalTab,
    closeAuthModal,
    loginUser,
    registerUser,
    authLoading,
  } = useAuth();
  const { showToast } = useCart();

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerEmployeeId, setRegisterEmployeeId] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  if (!authModalOpen) return null;

  const handleTabChange = (tab) => {
    setAuthModalTab(tab);
    setErrorMessage(null);
    setFieldErrors({});
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!loginEmail.trim() || !loginPassword) {
      setErrorMessage('Please provide both your work email and password.');
      return;
    }

    try {
      const user = await loginUser(loginEmail.trim(), loginPassword);
      setLoginEmail('');
      setLoginPassword('');

      // Universal master redirection for admin or staff
      if (user.role === 'ADMIN') {
        if (showToast) {
          showToast(`Welcome, Administrator ${user.name}!`, 'success');
        }
        navigate('/admin', { replace: true });
      } else if (user.role === 'STAFF') {
        if (showToast) {
          showToast(`Authenticated as ${user.name} (Kitchen Staff)`, 'success');
        }
        navigate('/staff', { replace: true });
      } else {
        if (showToast) {
          showToast(`Welcome back, ${user.name}!`, 'success');
        }
      }
    } catch (err) {
      console.error('Login failed:', err);
      if (err.response?.status === 401) {
        setErrorMessage('Invalid email or password. Please check your credentials.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Unable to connect to the authentication service. Please ensure the backend is running.');
      }
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    if (!registerName.trim()) {
      setFieldErrors({ name: 'Full name is required.' });
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!registerEmail.trim()) {
      setFieldErrors({ email: 'Email address is required.' });
      setErrorMessage('Please enter your work email.');
      return;
    }

    if (!registerPassword || registerPassword.length < 6) {
      setFieldErrors({ password: 'Password must be at least 6 characters long.' });
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    try {
      const user = await registerUser({
        name: registerName.trim(),
        email: registerEmail.trim(),
        password: registerPassword,
        employeeId: registerEmployeeId.trim() || null,
      });

      if (showToast) {
        showToast(`Account created successfully! Welcome, ${user.name}`, 'success');
      }
      setRegisterName('');
      setRegisterEmail('');
      setRegisterEmployeeId('');
      setRegisterPassword('');
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.response?.status === 409 || err.response?.data?.error === 'DUPLICATE_EMAIL') {
        setErrorMessage(
          err.response?.data?.message || 'An account with this email already exists. Please sign in instead.'
        );
      } else if (err.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
        const first = Object.values(err.response.data.fieldErrors)[0];
        setErrorMessage(first || 'Please fix the highlighted validation errors.');
      } else if (err.response?.data?.message) {
        setErrorMessage(err.response.data.message);
      } else {
        setErrorMessage('Registration failed. Please check your network and try again.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#1A1A1A] border border-white/10 text-[#F3F4F6] rounded-3xl shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#242424] to-[#181818] p-6 text-white border-b border-white/10 relative">
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 backdrop-blur-md flex items-center justify-center border border-[#F59E0B]/20">
              <UtensilsCrossed className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div>
              <span className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                OfficeBite Canteen
              </span>
              <h3 className="text-xl font-extrabold tracking-tight">
                {authModalTab === 'login' ? 'Employee Sign In' : 'Create Customer Account'}
              </h3>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-white/10 bg-[#141414]">
          <button
            type="button"
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
              authModalTab === 'login'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#1A1A1A]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-3 text-xs font-bold transition-all text-center border-b-2 cursor-pointer ${
              authModalTab === 'register'
                ? 'border-[#F59E0B] text-[#F59E0B] bg-[#1A1A1A]'
                : 'border-transparent text-white/50 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-2xl bg-red-950/40 border border-red-800/50 flex items-start gap-2.5 text-xs text-red-400 animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <p className="leading-relaxed font-medium">{errorMessage}</p>
            </div>
          )}

          {authModalTab === 'login' ? (
            /* --- SIGN IN FORM --- */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#121212] text-xs text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#121212] text-xs text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In to OfficeBite</span>
                )}
              </button>

              <div className="pt-2 text-center text-xs text-white/50">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('register')}
                  className="font-bold text-[#F59E0B] hover:underline cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* --- CREATE ACCOUNT FORM --- */
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Priya Patel"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#121212] text-xs text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder:text-white/30"
                  />
                </div>
                {fieldErrors.name && (
                  <p className="text-[10px] text-red-400 mt-0.5">{fieldErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Work Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="priya@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#121212] text-xs text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder:text-white/30"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-[10px] text-red-400 mt-0.5">{fieldErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Employee ID <span className="text-white/40 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={registerEmployeeId}
                    onChange={(e) => setRegisterEmployeeId(e.target.value)}
                    placeholder="e.g. OB-4891"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 bg-[#121212] text-xs text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder:text-white/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white mb-1">
                  Password <span className="text-red-400">*</span>{' '}
                  <span className="text-white/40 font-normal">(min 6 chars)</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-white/10 bg-[#121212] text-xs text-white focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all placeholder:text-white/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-[10px] text-red-400 mt-0.5">{fieldErrors.password}</p>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-[#222222] border border-white/10 text-[11px] text-white/70 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0" />
                <span>All public registrations receive Customer access. Passwords are BCrypt-encrypted.</span>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer disabled:opacity-50"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>

              <div className="pt-1 text-center text-xs text-white/50">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className="font-bold text-[#F59E0B] hover:underline cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
