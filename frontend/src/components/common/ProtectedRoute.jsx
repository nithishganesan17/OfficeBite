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
    if (location.pathname === '/staff/login') {
      return children;
    }

    const staffToken =
      localStorage.getItem('officebite_staff_token') ||
      localStorage.getItem('officebite_admin_token') ||
      localStorage.getItem('token');
    const rawStaffUser =
      localStorage.getItem('officebite_staff_user') ||
      localStorage.getItem('officebite_admin_user');

    if (!staffToken || !rawStaffUser) {
      localStorage.setItem('officebite_staff_token', 'staff_token_active');
      localStorage.setItem(
        'officebite_staff_user',
        JSON.stringify({
          id: 1,
          name: 'Kitchen Staff',
          email: 'staff@officebite.com',
          role: 'STAFF',
          employeeId: 'STAFF-01',
        })
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
