import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ChefHat,
  PackageCheck,
  RefreshCw,
  Server,
  XCircle,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getCanonicalDish } from '../data/mockData';

export const MyOrdersPage = () => {
  const {
    orders: contextOrders,
    refreshOrders,
    ordersLoading,
    addToCart,
    setIsCartOpen,
    showToast,
  } = useCart();
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'COMPLETED'
  const [refreshing, setRefreshing] = useState(false);

  const fetchBackendOrders = async () => {
    setRefreshing(true);
    try {
      if (refreshOrders) {
        await refreshOrders();
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && refreshOrders) {
      refreshOrders();
    }
  }, [isAuthenticated, refreshOrders]);

  const orderList = contextOrders || [];
  const loading = refreshing || (ordersLoading && orderList.length === 0);

  const activeOrders = orderList.filter(
    (o) =>
      o.status === 'PLACED' ||
      o.status === 'ACCEPTED' ||
      o.status === 'PREPARING' ||
      o.status === 'READY'
  );

  const pastOrders = orderList.filter(
    (o) =>
      o.status === 'COMPLETED' ||
      o.status === 'DELIVERED' ||
      o.status === 'REJECTED' ||
      o.status === 'CANCELLED' ||
      o.status === 'CANCELED'
  );

  const displayedOrders =
    filterTab === 'ACTIVE'
      ? activeOrders
      : filterTab === 'COMPLETED'
      ? pastOrders
      : orderList;


  const handleReorder = (order) => {
    order.items.forEach((item) => {
      const canonical = getCanonicalDish(item);
      addToCart({
        id: canonical ? canonical.id : (item.menuItemId || item.id),
        name: canonical ? canonical.name : item.name,
        price: canonical ? canonical.price : item.price,
        image:
          canonical?.image ||
          item.image ||
          'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
        quantity: item.quantity || 1,
      });
    });
    setIsCartOpen(true);
    if (showToast) {
      showToast(`Added ${order.items.length} items from Order #${order.id} to your tray!`);
    }
  };

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#3D5A2B] uppercase tracking-wider bg-[#EEF3E8] px-3.5 py-1 rounded-full border border-[#D4E0C9]">
            Live Order Tracking
          </span>
          <h1 className="text-3xl font-extrabold text-[#261C14] tracking-tight mt-2">
            My Canteen Orders
          </h1>
          <p className="text-xs sm:text-sm text-[#73675C] mt-1">
            Track live kitchen preparation, pickup tokens, and order history from MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBackendOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-[#EAE3D6] text-xs font-semibold text-[#261C14] hover:bg-[#FAF6EE] shadow-2xs cursor-pointer transition-colors"
            title="Refresh orders from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <span>Order Food</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Auth Notification Banner */}
      {!isAuthenticated && (
        <div className="bg-[#FEF3EB] border border-[#FCDDC7] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#DE752C] shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#F28C45] shrink-0" />
            <div>
              <p className="font-bold text-[#292524]">Viewing session guest orders</p>
              <p className="text-[11px] text-[#78716C] mt-0.5">
                Sign in with your employee account to view your complete order history and track live canteen pickup tokens.
              </p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-[#EAE3D6] pb-3 overflow-x-auto">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'ALL'
              ? 'bg-[#3D5A2B] text-white shadow-xs'
              : 'text-[#73675C] hover:text-[#261C14] hover:bg-white'
          }`}
        >
          All Orders ({orderList.length})
        </button>
        <button
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === 'ACTIVE'
              ? 'bg-[#3D5A2B] text-white shadow-xs'
              : 'text-[#73675C] hover:text-[#261C14] hover:bg-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#D48B18] animate-pulse"></span>
          <span>Live Kitchen ({activeOrders.length})</span>
        </button>
        <button
          onClick={() => setFilterTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'COMPLETED'
              ? 'bg-[#3D5A2B] text-white shadow-xs'
              : 'text-[#73675C] hover:text-[#261C14] hover:bg-white'
          }`}
        >
          Completed ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#EDE8DC] max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#EBF5F0] text-[#197A50] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-[#292524]">No orders found</h3>
          <p className="text-xs text-[#78716C] mt-1.5 leading-relaxed">
            You don't have any orders under this tab yet. Explore the menu and place a fresh order!
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <span>Browse Today's Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedOrders.map((order) => {
            const isPlaced = order.status === 'PLACED';
            const isAccepted = order.status === 'ACCEPTED';
            const isPreparing = order.status === 'PREPARING';
            const isReady = order.status === 'READY';
            const isCompleted = order.status === 'COMPLETED' || order.status === 'DELIVERED';
            const isRejected = order.status === 'REJECTED';

            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-[#EDE8DC] p-5 sm:p-6 shadow-xs hover:shadow-md transition-all"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F4EFE6]">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF8F2] border border-[#EDE8DC] flex flex-col items-center justify-center font-mono shrink-0 shadow-2xs">
                      <span className="text-[9px] text-[#78716C] font-sans font-bold uppercase leading-none">
                        Token
                      </span>
                      <span className="text-lg font-black text-[#197A50] leading-none mt-0.5">
                        {order.tokenNumber}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-[#292524]">
                          Order #{order.id}
                        </h3>
                        {order.isRealBackend && (
                          <span className="text-[10px] font-bold bg-[#EBF5F0] text-[#197A50] px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Server className="w-2.5 h-2.5" />
                            <span>MySQL Verified</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#78716C] mt-0.5">Placed at {order.placedAt}</p>
                    </div>
                  </div>

                  {/* Status Pill & Location */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isPreparing || isAccepted || isPlaced
                          ? 'bg-[#EBF5F0] text-[#197A50]'
                          : isReady
                          ? 'bg-[#FEF3EB] text-[#F28C45] animate-pulse ring-1 ring-[#F28C45]'
                          : isRejected
                          ? 'bg-red-50 text-red-700'
                          : 'bg-[#F4EFE6] text-[#78716C]'
                      }`}
                    >
                      {isPlaced && <Clock className="w-3.5 h-3.5" />}
                      {isAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-[#197A50]" />}
                      {isPreparing && <ChefHat className="w-3.5 h-3.5 text-[#197A50]" />}
                      {isReady && <Sparkles className="w-3.5 h-3.5 text-[#F28C45]" />}
                      {isCompleted && <PackageCheck className="w-3.5 h-3.5 text-[#78716C]" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                      <span>{order.statusLabel || order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Stepper for Active Orders */}
                {!isCompleted && !isRejected && (
                  <div className="py-5 border-b border-[#F4EFE6]">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1: Placed */}
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-[#197A50] text-white flex items-center justify-center font-bold text-xs shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#292524] mt-1.5">Placed</span>
                        <span className="text-[10px] text-[#78716C]">Order Received</span>
                      </div>

                      {/* Step 2: Accepted */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                            isAccepted || isPreparing || isReady
                              ? 'bg-[#197A50] text-white'
                              : 'bg-[#EDE8DC] text-[#78716C]'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#292524] mt-1.5">Accepted</span>
                        <span className="text-[10px] text-[#78716C]">Confirmed</span>
                      </div>

                      {/* Step 3: Preparing */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                            isPreparing
                              ? 'bg-[#197A50] text-white ring-4 ring-[#EBF5F0]'
                              : isReady
                              ? 'bg-[#197A50] text-white'
                              : 'bg-[#EDE8DC] text-[#78716C]'
                          }`}
                        >
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#292524] mt-1.5">Cooking</span>
                        <span className="text-[10px] text-[#78716C]">
                          {isPreparing ? 'Cooking now' : 'Kitchen Prep'}
                        </span>
                      </div>

                      {/* Step 4: Ready */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                            isReady
                              ? 'bg-[#F28C45] text-white ring-4 ring-[#FEF3EB]'
                              : 'bg-[#EDE8DC] text-[#78716C]'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-[#292524] mt-1.5">Ready</span>
                        <span className="text-[10px] text-[#78716C]">
                          {isReady ? 'Collect now' : 'Pickup'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items in Order */}
                <div className="py-4 space-y-2">
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-[#FAF8F2] border border-[#EDE8DC] font-bold text-[#197A50] flex items-center justify-center text-[11px]">
                            {item.quantity}×
                          </span>
                          <span className="font-medium text-[#292524]">{item.name}</span>
                        </div>
                        <span className="font-bold text-[#292524]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="pt-2 text-[11px] text-[#78716C] italic">
                      Note: "{order.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* Card Footer: Location & Total */}
                <div className="pt-3 border-t border-[#F4EFE6] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-[#78716C]">
                    <MapPin className="w-3.5 h-3.5 text-[#197A50] shrink-0" />
                    <span>{order.deliveryLocation}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div>
                      <span className="text-[#78716C] mr-1.5">Total Paid:</span>
                      <strong className="text-sm font-extrabold text-[#197A50]">
                        ₹{Number(order.total).toFixed(2)}
                      </strong>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F2] hover:bg-[#EDE8DC] text-[#292524] font-bold text-xs border border-[#EDE8DC] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-[#197A50]" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
