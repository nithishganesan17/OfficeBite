import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  login as apiLogin,
  register as apiRegister,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth,
} from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => getStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' | 'register'
  const [authLoading, setAuthLoading] = useState(false);

  // Sync auth state if token is present on startup and listen for session expiration
  useEffect(() => {
    const existingToken = getStoredToken();
    const existingUser = getStoredUser();
    if (existingUser) {
      setCurrentUser(existingUser);
      setToken(existingToken);
    }

    if (existingToken) {
      getCurrentUser()
        .then((profile) => {
          if (profile) {
            setCurrentUser(profile);
            setStoredAuth(existingToken, profile);
          }
        })
        .catch(() => {
          // Keep current fallback customer session intact
        });
    }

    const handleSessionExpired = () => {
      clearStoredAuth();
      const freshUser = getStoredUser();
      setCurrentUser(freshUser);
      setToken(getStoredToken());
    };

    window.addEventListener('officebite:session-expired', handleSessionExpired);
    return () => window.removeEventListener('officebite:session-expired', handleSessionExpired);
  }, []);

  const openAuthModal = (tab = 'login') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const loginUser = async (email, password, requiredRoles = null) => {
    setAuthLoading(true);
    try {
      const data = await apiLogin(email, password);

      // Verify user's actual role against expected portal roles if specified.
      // SPECIAL RULE: Accounts with ADMIN role have master privileges across all portals
      // and should never be blocked by role mismatch when logging in anywhere.
      if (
        data.user?.role !== 'ADMIN' &&
        requiredRoles &&
        Array.isArray(requiredRoles) &&
        requiredRoles.length > 0
      ) {
        if (!requiredRoles.includes(data.user?.role)) {
          // Clear any stored authentication so mismatched role does not gain access
          clearStoredAuth();
          const roleError = new Error(
            `Access Denied: Account '${data.user?.email || email}' has role '${data.user?.role || 'UNKNOWN'}'. ${requiredRoles.join(' or ')} privileges are required to access this portal.`
          );
          roleError.isRoleMismatch = true;
          roleError.actualRole = data.user?.role;
          roleError.requiredRoles = requiredRoles;
          throw roleError;
        }
      }

      setStoredAuth(data.token, data.user);
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const registerUser = async (userData) => {
    setAuthLoading(true);
    try {
      const data = await apiRegister(userData);
      setStoredAuth(data.token, data.user);
      setToken(data.token);
      setCurrentUser(data.user);
      setAuthModalOpen(false);
      return data.user;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    clearStoredAuth();
    setCurrentUser(null);
    setToken(null);
  };

  const isAuthenticated = Boolean(token && currentUser);
  const isStaff = Boolean(
    currentUser && (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN')
  );
  const isAdmin = Boolean(currentUser && currentUser.role === 'ADMIN');

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        isAuthenticated,
        isStaff,
        isAdmin,
        authModalOpen,
        authModalTab,
        authLoading,
        openAuthModal,
        closeAuthModal,
        setAuthModalTab,
        loginUser,
        registerUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
