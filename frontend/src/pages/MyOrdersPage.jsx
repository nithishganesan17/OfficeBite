import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  CheckCircle2,
  ShoppingBag,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ChefHat,
  PackageCheck,
  RefreshCw,
  Server,
  XCircle,
  LogIn,
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
  const { isAuthenticated, openAuthModal } = useAuth();
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
    <div className="min-h-screen bg-[#121212] text-[#F3F4F6] py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider bg-[#F59E0B]/15 px-3.5 py-1 rounded-full border border-[#F59E0B]/30">
            Live Order Tracking
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-2">
            My Canteen Orders
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Track live kitchen preparation, pickup tokens, and order history from MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBackendOrders}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1A1A1A] border border-white/10 text-xs font-semibold text-white hover:bg-[#262626] shadow-2xs cursor-pointer transition-colors"
            title="Refresh orders from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <Link
            to="/menu"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] text-xs font-black shadow-xs hover:shadow-md transition-all active:scale-95"
          >
            <span>Order Food</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Auth Notification Banner */}
      {!isAuthenticated && (
        <div className="bg-[#1A1A1A] border border-white/10 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-white/80 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-[#F59E0B] shrink-0" />
            <div>
              <p className="font-bold text-white">Viewing session guest orders</p>
              <p className="text-[11px] text-white/50 mt-0.5">
                Sign in with your employee account to view your complete order history and track live canteen pickup tokens.
              </p>
            </div>
          </div>
          <button
            onClick={() => openAuthModal('login')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs shadow-xs transition-all shrink-0 cursor-pointer active:scale-95"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-3 overflow-x-auto">
        <button
          onClick={() => setFilterTab('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'ALL'
              ? 'bg-[#F59E0B] text-[#121212] shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          All Orders ({orderList.length})
        </button>
        <button
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            filterTab === 'ACTIVE'
              ? 'bg-[#F59E0B] text-[#121212] shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Live Kitchen ({activeOrders.length})</span>
        </button>
        <button
          onClick={() => setFilterTab('COMPLETED')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filterTab === 'COMPLETED'
              ? 'bg-[#F59E0B] text-[#121212] shadow-xs'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          Completed ({pastOrders.length})
        </button>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#262626] text-[#F59E0B] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No orders found</h3>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            You don't have any orders under this tab yet. Explore the menu and place a fresh order!
          </p>
          <Link
            to="/menu"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs shadow-md transition-all cursor-pointer"
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
                className="bg-[#1A1A1A] rounded-3xl border border-white/10 p-5 sm:p-6 shadow-xl hover:border-white/20 transition-all"
              >
                {/* Order Top Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#262626] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0 shadow-2xs">
                      <span className="text-[9px] text-white/50 font-sans font-bold uppercase leading-none">
                        Token
                      </span>
                      <span className="text-lg font-black text-[#F59E0B] leading-none mt-0.5">
                        {order.tokenNumber}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-white">
                          Order #{order.id}
                        </h3>
                        {order.isRealBackend && (
                          <span className="text-[10px] font-bold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Server className="w-2.5 h-2.5" />
                            <span>MySQL Verified</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5">Placed at {order.placedAt}</p>
                    </div>
                  </div>

                  {/* Status Pill & Location */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        isPreparing || isAccepted || isPlaced
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                          : isReady
                          ? 'bg-amber-400/20 text-amber-300 animate-pulse ring-1 ring-amber-400'
                          : isRejected
                          ? 'bg-red-950/60 text-red-400 border border-red-800'
                          : 'bg-white/10 text-white/60'
                      }`}
                    >
                      {isPlaced && <Clock className="w-3.5 h-3.5" />}
                      {isAccepted && <CheckCircle2 className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      {isPreparing && <ChefHat className="w-3.5 h-3.5 text-[#F59E0B]" />}
                      {isReady && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                      {isCompleted && <PackageCheck className="w-3.5 h-3.5 text-white/60" />}
                      {isRejected && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                      <span>{order.statusLabel || order.status}</span>
                    </span>
                  </div>
                </div>

                {/* Progress Stepper for Active Orders */}
                {!isCompleted && !isRejected && (
                  <div className="py-5 border-b border-white/10">
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      {/* Step 1: Placed */}
                      <div className="flex flex-col items-center">
                        <div className="w-7 h-7 rounded-full bg-[#F59E0B] text-[#121212] flex items-center justify-center font-bold text-xs shadow-xs">
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span className="font-bold text-white mt-1.5">Placed</span>
                        <span className="text-[10px] text-white/50">Order Received</span>
                      </div>

                      {/* Step 2: Accepted */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                            isAccepted || isPreparing || isReady
                              ? 'bg-[#F59E0B] text-[#121212]'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                        </div>
                        <span className="font-bold text-white mt-1.5">Accepted</span>
                        <span className="text-[10px] text-white/50">Confirmed</span>
                      </div>

                      {/* Step 3: Preparing */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                            isPreparing
                              ? 'bg-[#F59E0B] text-[#121212] ring-4 ring-[#F59E0B]/20'
                              : isReady
                              ? 'bg-[#F59E0B] text-[#121212]'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          <ChefHat className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white mt-1.5">Cooking</span>
                        <span className="text-[10px] text-white/50">
                          {isPreparing ? 'Cooking now' : 'Kitchen Prep'}
                        </span>
                      </div>

                      {/* Step 4: Ready */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                            isReady
                              ? 'bg-amber-400 text-[#121212] ring-4 ring-amber-400/20'
                              : 'bg-white/10 text-white/40'
                          }`}
                        >
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white mt-1.5">Ready</span>
                        <span className="text-[10px] text-white/50">
                          {isReady ? 'Collect now' : 'Pickup'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items in Order — Dish Names in BOLD STYLISH HANDWRITING (Caveat) */}
                <div className="py-4 space-y-2">
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-md bg-[#262626] border border-white/10 font-bold text-[#F59E0B] flex items-center justify-center text-xs">
                            {item.quantity}×
                          </span>
                          <span className="font-['Caveat',cursive] text-xl sm:text-2xl font-bold text-white tracking-wide">
                            {item.name}
                          </span>
                        </div>
                        <span className="font-bold text-[#F59E0B] text-sm">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.specialInstructions && (
                    <div className="pt-2 text-[11px] text-white/50 italic">
                      Note: "{order.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* Card Footer: Location & Total */}
                <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 text-white/60">
                    <MapPin className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                    <span>{order.deliveryLocation}</span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div>
                      <span className="text-white/60 mr-1.5">Total Paid:</span>
                      <strong className="text-base font-extrabold text-[#F59E0B]">
                        ₹{Number(order.total).toFixed(2)}
                      </strong>
                    </div>

                    <button
                      onClick={() => handleReorder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#262626] hover:bg-white/10 text-white font-bold text-xs border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3 text-[#F59E0B]" />
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
