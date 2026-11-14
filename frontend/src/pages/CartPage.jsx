import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  Clock,
  ShieldCheck,
  Sparkles,
  Utensils,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartPage = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItemCount,
  } = useCart();

  const [imgErrors, setImgErrors] = useState({});

  const fallbackImg =
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F4F6] py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-white/50 mb-6">
        <Link to="/" className="hover:text-[#F59E0B] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        <Link to="/menu" className="hover:text-[#F59E0B] transition-colors">
          Menu
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-white/30" />
        <span className="font-semibold text-white">Shopping Cart</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-8">
        <div>
          <span className="text-xs font-bold text-[#F59E0B] uppercase tracking-wider bg-[#F59E0B]/15 px-3 py-1 rounded-full border border-[#F59E0B]/30">
            Canteen Food Tray
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-2">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            {totalItemCount === 0
              ? 'Your tray is currently empty'
              : `${totalItemCount} ${totalItemCount === 1 ? 'unit' : 'units'} selected from Floor 3 Live Kitchen`}
          </p>
        </div>

        {cartItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearCart}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-950/70 border border-red-800/40 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Remove all items from cart"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
            <Link
              to="/menu"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#F59E0B] bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/30 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Dishes</span>
            </Link>
          </div>
        )}
      </div>

      {/* EMPTY CART STATE */}
      {cartItems.length === 0 ? (
        <div className="bg-[#1A1A1A] rounded-3xl p-8 sm:p-14 text-center border border-white/10 shadow-xs max-w-xl mx-auto my-6">
          <div className="w-20 h-20 rounded-full bg-[#262626] text-[#F59E0B] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShoppingBag className="w-10 h-10 stroke-[1.6]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            Your food tray is empty
          </h2>
          <p className="text-xs sm:text-sm text-white/60 mt-2 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our delicious office lunch specials, crispy dosas, biryani, or fresh beverages!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Canteen Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#262626] hover:bg-white/10 text-white border border-white/10 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Home</span>
            </Link>
          </div>
        </div>
      ) : (
        /* CART CONTENT GRID */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ITEMS LIST (Left Column) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xs p-4 sm:p-6 divide-y divide-white/5">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* Food Info & Thumbnail */}
                  <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                    <img
                      src={imgErrors[item.id] ? fallbackImg : item.image || item.imageUrl || fallbackImg}
                      alt={item.name}
                      onError={() => handleImgError(item.id)}
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-[#262626] border border-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* DISH NAME IN BOLD STYLISH HANDWRITING (Caveat) */}
                        <h3 className="font-['Caveat',cursive] font-bold text-xl sm:text-2xl text-white truncate tracking-wide">
                          {item.name}
                        </h3>
                        {item.category && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#262626] text-white/60 border border-white/10">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-1 line-clamp-1">
                        {item.description || 'Prepared fresh at Tower A kitchen'}
                      </p>
                      <p className="text-xs font-semibold text-[#F59E0B] mt-1">
                        ₹{item.price} per unit
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pl-2 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                    {/* Stepper with Requirement 4: Prevent quantities falling below 1 */}
                    <div className="inline-flex items-center border border-white/10 rounded-xl bg-[#121212] p-1 shadow-2xs">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                          item.quantity <= 1
                            ? 'opacity-30 cursor-not-allowed text-white/30'
                            : 'text-white/60 hover:text-white hover:bg-white/10 active:scale-90 cursor-pointer'
                        }`}
                        title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs sm:text-sm font-extrabold text-white">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 active:scale-90 transition-all cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-white/50 block leading-none">Total</span>
                      <span className="text-base sm:text-lg font-extrabold text-[#F59E0B]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Action Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/40 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                      title="Remove this dish"
                    >
                      <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#F59E0B] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Ordering from Menu</span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-white/50">
                <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Live Kitchen estimated prep time: 10-15 mins</span>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY (Right Column) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-[#1A1A1A] rounded-3xl border border-white/10 shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-extrabold text-base text-white">Order Summary</h3>
                <span className="text-xs font-bold text-[#F59E0B] bg-[#F59E0B]/15 border border-[#F59E0B]/30 px-2.5 py-0.5 rounded-full">
                  Floor 3 Canteen
                </span>
              </div>

              {/* Requirement 8: Calculate subtotal and grand total correctly without invented fees/taxes */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Total Ordered Units</span>
                  <span className="font-bold text-white">{totalItemCount} units</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-white">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-white/10 flex justify-between items-baseline">
                  <div>
                    <span className="font-extrabold text-sm sm:text-base text-white block">
                      Grand Total
                    </span>
                    <span className="text-[11px] text-white/50">Inclusive of all item costs</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#F59E0B]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Proceed to Checkout button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-white/10 space-y-2 text-[11px] text-white/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0" />
                  <span>Direct Corporate Payroll or UPI • Instant token</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Prepared fresh on order at Floor 3 live kitchen</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
