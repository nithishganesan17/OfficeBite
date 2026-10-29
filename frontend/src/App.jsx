import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CustomerLayout } from './layouts/CustomerLayout';
import { StaffLayout } from './layouts/StaffLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { StaffDashboardPage } from './pages/StaffDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { RoleSelectionPage } from './pages/RoleSelectionPage';
import { CustomerLoginPage } from './pages/CustomerLoginPage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Scroll to top on route navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* =========================================
            1. CUSTOMER PORTAL
            Dedicated customer shopping & orders experience
            Uses CustomerLayout with customer navbar & tray
           ========================================= */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']} loginPath="/customer/login">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'STAFF', 'ADMIN']} loginPath="/customer/login">
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* =========================================
            2. KITCHEN STAFF PORTAL
            Dedicated kitchen queue & token management
            Uses StaffLayout with terminal navbar (no customer controls)
           ========================================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} loginPath="/staff/login">
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/staff" element={<StaffDashboardPage />} />
          <Route path="/staff/dashboard" element={<StaffDashboardPage />} />
        </Route>

        {/* =========================================
            3. ADMINISTRATOR PORTAL
            Dedicated executive control console
            Uses AdminLayout with executive navigation (no customer controls)
           ========================================= */}
        <Route
          element={
            <ProtectedRoute allowedRoles={['ADMIN']} loginPath="/admin/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage defaultTab="overview" />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage defaultTab="overview" />} />
          <Route path="/admin/menu" element={<AdminDashboardPage defaultTab="menu" />} />
          <Route path="/admin/users" element={<AdminDashboardPage defaultTab="users" />} />
          <Route path="/admin/orders" element={<AdminDashboardPage defaultTab="orders" />} />
        </Route>

        {/* Dedicated Staff Terminal Login */}
        <Route path="/staff/login" element={<StaffLoginPage />} />

        {/* =========================================
            4. AUTHENTICATION & ROLE SELECTION PORTAL
            Independent login forms and role choice
            Uses AuthLayout with clean branding
           ========================================= */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<RoleSelectionPage />} />
          <Route path="/customer/login" element={<CustomerLoginPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
