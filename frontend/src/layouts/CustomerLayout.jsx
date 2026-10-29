import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/common/CartDrawer';
import { Toast } from '../components/common/Toast';
import { AuthModal } from '../components/common/AuthModal';

/**
 * Dedicated Customer Portal Layout.
 * Contains customer shopping navbar, food tray drawer, customer footer, and modals.
 * Strictly used for customer-facing routes (/ , /menu, /cart, /checkout, /orders).
 */
export const CustomerLayout = () => {
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
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col text-[#261C14] selection:bg-[#3D5A2B]/20 selection:text-[#3D5A2B]">
      {/* Customer-only Navigation Bar */}
      <Navbar onSearchClick={handleSearchClick} />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Global customer drawer & modals */}
      <CartDrawer />
      <Toast />
      <AuthModal />
    </div>
  );
};

export default CustomerLayout;
