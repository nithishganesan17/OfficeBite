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

  // 1. Staff portal routes (/staff/*): isolated staff session check
  if (location.pathname.startsWith('/staff')) {
    const staffToken =
      localStorage.getItem('officebite_staff_token') ||
      localStorage.getItem('officebite_admin_token');
    const rawStaffUser =
      localStorage.getItem('officebite_staff_user') ||
      localStorage.getItem('officebite_admin_user');
    let staffUser = null;
    try {
      staffUser = rawStaffUser ? JSON.parse(rawStaffUser) : null;
    } catch {}

    const isStaffAuthorized = Boolean(
      (staffToken && staffUser && (staffUser.role === 'STAFF' || staffUser.role === 'ADMIN')) ||
      (isAuthenticated && currentUser && (currentUser.role === 'STAFF' || currentUser.role === 'ADMIN'))
    );

    if (!isStaffAuthorized) {
      return (
        <Navigate
          to="/staff/login"
          state={{ from: location.pathname }}
          replace
        />
      );
    }
    return children;
  }

  // 2. Admin portal routes (/admin/*): isolated admin session check
  if (location.pathname.startsWith('/admin')) {
    const adminToken = localStorage.getItem('officebite_admin_token');
    const rawAdminUser = localStorage.getItem('officebite_admin_user');
    let adminUser = null;
    try {
      adminUser = rawAdminUser ? JSON.parse(rawAdminUser) : null;
    } catch {}

    const isAdminAuthorized = Boolean(
      (adminToken && adminUser && adminUser.role === 'ADMIN') ||
      (isAuthenticated && currentUser && currentUser.role === 'ADMIN')
    );

    if (!isAdminAuthorized) {
      return (
        <Navigate
          to="/admin/login"
          state={{ from: location.pathname }}
          replace
        />
      );
    }
    return children;
  }

  // 3. Customer portal routes: check customer authentication
  if (!isAuthenticated || !currentUser || !token) {
    return (
      <Navigate
        to={loginPath}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  // 4. Role mismatch checking if specified (Admin has universal master access)
  if (currentUser.role === 'ADMIN') {
    return children;
  }

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
            message: `Access Denied: Your account (${currentUser.email}) has role '${currentUser.role}'.`,
          }}
          replace
        />
      );
    }
  }

  // 5. Authenticated and authorized -> Render protected component
  return children;
};
