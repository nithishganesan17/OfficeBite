import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Route protection wrapper enforcing authentication and role-based access control.
 * Unauthenticated users are redirected to the appropriate portal login page with preserved destination.
 * Users with insufficient privileges are redirected to the respective portal login page with role-mismatch details.
 */
export const ProtectedRoute = ({ children, allowedRoles = null, loginPath = '/login' }) => {
  const { isAuthenticated, currentUser, token } = useAuth();
  const location = useLocation();

  // 1. Not authenticated -> Redirect to the role-specific login page
  if (!isAuthenticated || !currentUser || !token) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 2. Authenticated but missing required role -> Redirect with mismatch explanation
  if (allowedRoles && Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    if (!allowedRoles.includes(currentUser.role)) {
      return (
        <Navigate
          to={loginPath}
          state={{
            from: location.pathname,
            roleMismatch: true,
            requiredRoles: allowedRoles,
            currentRole: currentUser.role,
            message: `Access Denied: Your account (${currentUser.email}) has role '${currentUser.role}'. ${allowedRoles.join(' or ')} privileges are required to access ${location.pathname}.`,
          }}
          replace
        />
      );
    }
  }

  // 3. Authenticated and authorized -> Render protected component
  return children;
};
