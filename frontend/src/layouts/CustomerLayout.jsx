import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/common/CartDrawer';
import { Toast } from '../components/common/Toast';
import { AuthModal } from '../components/common/AuthModal';
import { ErrorBoundary } from '../components/common/ErrorBoundary';

/**
 * Dedicated Customer Portal Layout.
 * Contains customer shopping navbar, food tray drawer, customer footer, and modals.
 * Strictly used for customer-facing routes (/ , /menu, /cart, /checkout, /orders).
 */
export const CustomerLayout = () => {
  const location = useLocation();
  const hideFooter =
    location.pathname.startsWith('/checkout') ||
    location.pathname.startsWith('/cart') ||
    location.pathname.startsWith('/orders');

  const handleSearchClick = () => {
    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.location.href = '/menu';
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex flex-col text-[#F3F4F6] selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]">
      {/* Customer-only Navigation Bar */}
      <Navbar onSearchClick={handleSearchClick} />

      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>

      {!hideFooter && <Footer />}

      {/* Global customer drawer & modals */}
      <CartDrawer />
      <Toast />
      <AuthModal />
    </div>
  );
};

export default CustomerLayout;
