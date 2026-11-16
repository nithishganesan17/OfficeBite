import React, { useState, useEffect, useMemo } from 'react';
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
  XCircle,
  LogIn,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { getCanonicalDish, resolveDishImage } from '../data/mockData';

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
  const [filterTab, setFilterTab] = useState('ACTIVE'); // 'ACTIVE' | 'COMPLETED'
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

  const userOrderList = useMemo(() => {
    const list = contextOrders || [];
    if (!currentUser) return list;
    const name = (currentUser.name || '').toLowerCase();
    const email = (currentUser.email || '').toLowerCase();
    const isSrikanth = name.includes('srikanth') || email.includes('srikanth');
    const isShanthosh =
      name.includes('shanthosh') ||
      name.includes('santhosh') ||
      email.includes('shanthosh') ||
      email.includes('santhosh');

    if (isSrikanth) {
      return list.filter((o) => {
        const oNum = String(o.orderNumber || o.id || '').toUpperCase();
        // Srikanth sees his canonical order OB-7540 and all newly placed orders (excluding Shanthosh's OB-7978)
        if (oNum === 'OB-7978') return false;
        return true;
      });
    }
    if (isShanthosh) {
      return list.filter((o) => {
        const oNum = String(o.orderNumber || o.id || '').toUpperCase();
        return oNum === 'OB-7978';
      });
    }
    return list;
  }, [contextOrders, currentUser]);

  const orderList = userOrderList;
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

  const displayedOrders = filterTab === 'COMPLETED' ? pastOrders : activeOrders;


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
          '/assets/images/showcase_thali_royal.png',
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Orders
          </h1>
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
                Sign in with your employee account to view your complete order history and track pickup tokens.
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

      {/* Filter Tabs — Exactly two: Active & Completed */}
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-3">
        <button
          onClick={() => setFilterTab('ACTIVE')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
            filterTab === 'ACTIVE'
              ? 'bg-[#F59E0B] text-[#121212] shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Active ({activeOrders.length})</span>
        </button>
        <button
          onClick={() => setFilterTab('COMPLETED')}
          className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            filterTab === 'COMPLETED'
              ? 'bg-[#F59E0B] text-[#121212] shadow-md'
              : 'text-white/60 hover:text-white hover:bg-white/5 border border-white/5'
          }`}
        >
          <span>Completed ({pastOrders.length})</span>
        </button>
      </div>

      {/* Orders List */}
      {displayedOrders.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-3xl p-12 text-center border border-white/10 max-w-md mx-auto my-12 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#262626] text-[#F59E0B] flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">
            {filterTab === 'ACTIVE' ? 'No active orders' : 'No completed orders'}
          </h3>
          <p className="text-xs text-white/50 mt-1.5 leading-relaxed">
            {filterTab === 'ACTIVE'
              ? "You don't have any orders in progress right now. Explore the menu and place a fresh order!"
              : "You haven't completed any orders yet."}
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
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#262626] border border-white/10 flex flex-col items-center justify-center font-mono shrink-0 shadow-sm">
                      <span className="text-[10px] text-white/50 font-sans font-bold uppercase leading-none">
                        Token
                      </span>
                      <span className="text-xl sm:text-2xl font-black text-[#F59E0B] leading-none mt-1">
                        {order.tokenNumber}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-extrabold text-white">
                          Order #{order.id}
                        </h3>
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
                      <span>
                        {isPlaced
                          ? 'Placed'
                          : isAccepted
                          ? 'Accepted'
                          : isPreparing
                          ? 'Cooking'
                          : isReady
                          ? 'Ready'
                          : isRejected
                          ? 'Rejected'
                          : 'Completed'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* 1. Dish Image & Ordered Items */}
                <div className="py-4 space-y-3">
                  <div className="space-y-3">
                    {(order.items || []).map((item, idx) => {
                      const canonical = getCanonicalDish(item);
                      const dishImg = resolveDishImage(canonical || item);
                      const itemPrice = Number(item.price ?? item.unitPrice ?? 0);
                      const itemQty = Number(item.quantity) || 1;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-2.5 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={dishImg}
                              alt={item.name}
                              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-contain bg-black p-1.5 border border-white/10 shrink-0 shadow-sm"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-[#262626] border border-white/10 font-bold text-[#F59E0B] flex items-center justify-center text-xs shrink-0">
                                  {itemQty}×
                                </span>
                                <h4 className="font-bold text-sm sm:text-base text-white truncate">
                                  {item.name || item.itemName || 'Dish'}
                                </h4>
                              </div>
                              <span className="text-[11px] text-white/50 block mt-1">
                                ₹{itemPrice.toFixed(2)} each
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-[#F59E0B] text-base sm:text-lg shrink-0 ml-3">
                            ₹{(itemPrice * itemQty).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {order.specialInstructions && (
                    <div className="pt-2 text-[11px] text-white/50 italic">
                      Note: "{order.specialInstructions}"
                    </div>
                  )}
                </div>

                {/* 2. Below Buttons: Default is Black, Changed/Active Status is Yellow */}
                {!isCompleted && !isRejected && (
                  <div className="py-4 border-t border-b border-white/10">
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {/* Step 1: Placed Button (Always reached for any placed order) */}
                      <div className="py-3 px-1.5 sm:px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all select-none bg-[#F59E0B] text-[#121212] shadow-lg shadow-[#F59E0B]/25 border-2 border-[#F59E0B]">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 stroke-[2.5]" />
                        <span>Placed</span>
                      </div>

                      {/* Step 2: Accepted Button (Yellow if Accepted, Cooking, or Ready; Black otherwise) */}
                      <div
                        className={`py-3 px-1.5 sm:px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all select-none ${
                          isAccepted || isPreparing || isReady
                            ? 'bg-[#F59E0B] text-[#121212] shadow-lg shadow-[#F59E0B]/25 border-2 border-[#F59E0B]'
                            : 'bg-black text-white/50 border border-white/10'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isAccepted || isPreparing || isReady ? 'stroke-[2.5]' : ''}`} />
                        <span>Accepted</span>
                      </div>

                      {/* Step 3: Cooking Button (Yellow if Cooking or Ready; Black otherwise) */}
                      <div
                        className={`py-3 px-1.5 sm:px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all select-none ${
                          isPreparing || isReady
                            ? 'bg-[#F59E0B] text-[#121212] shadow-lg shadow-[#F59E0B]/25 border-2 border-[#F59E0B]'
                            : 'bg-black text-white/50 border border-white/10'
                        }`}
                      >
                        <ChefHat className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isPreparing || isReady ? 'stroke-[2.5]' : ''}`} />
                        <span>Cooking</span>
                      </div>

                      {/* Step 4: Ready Button (Yellow if Ready; Black otherwise) */}
                      <div
                        className={`py-3 px-1.5 sm:px-3 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 sm:gap-2 transition-all select-none ${
                          isReady
                            ? 'bg-[#F59E0B] text-[#121212] shadow-lg shadow-[#F59E0B]/25 border-2 border-[#F59E0B]'
                            : 'bg-black text-white/50 border border-white/10'
                        }`}
                      >
                        <PackageCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isReady ? 'stroke-[2.5]' : ''}`} />
                        <span>Ready</span>
                      </div>
                    </div>
                  </div>
                )}

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
                        ₹{Number(order.total || order.totalAmount || 0).toFixed(2)}
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
