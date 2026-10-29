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
  AlertCircle,
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
    <div className="min-h-screen py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-[#78716C] mb-6">
        <Link to="/" className="hover:text-[#197A50] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
        <Link to="/menu" className="hover:text-[#197A50] transition-colors">
          Menu
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#A8A29E]" />
        <span className="font-semibold text-[#292524]">Shopping Cart</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#EDE8DC] mb-8">
        <div>
          <span className="text-xs font-bold text-[#197A50] uppercase tracking-wider bg-[#EBF5F0] px-3 py-1 rounded-full">
            Canteen Food Tray
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#292524] tracking-tight mt-2">
            Your Shopping Cart
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            {totalItemCount === 0
              ? 'Your tray is currently empty'
              : `${totalItemCount} ${totalItemCount === 1 ? 'unit' : 'units'} selected from Floor 3 Live Kitchen`}
          </p>
        </div>

        {cartItems.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              onClick={clearCart}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Remove all items from cart"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
            <Link
              to="/menu"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#197A50] bg-[#EBF5F0] hover:bg-[#D5E6DC] transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add More Dishes</span>
            </Link>
          </div>
        )}
      </div>

      {/* EMPTY CART STATE */}
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 sm:p-14 text-center border border-[#EDE8DC] shadow-xs max-w-xl mx-auto my-6">
          <div className="w-20 h-20 rounded-full bg-[#EBF5F0] text-[#197A50] flex items-center justify-center mx-auto mb-5 shadow-xs">
            <ShoppingBag className="w-10 h-10 stroke-[1.6]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#292524]">
            Your food tray is empty
          </h2>
          <p className="text-xs sm:text-sm text-[#78716C] mt-2 max-w-md mx-auto leading-relaxed">
            Looks like you haven't added anything to your cart yet. Explore our delicious office lunch specials, crispy dosas, biryani, or fresh beverages!
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/menu"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Utensils className="w-4 h-4" />
              <span>Explore Canteen Menu</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#FAF8F2] hover:bg-[#EDE8DC] text-[#292524] border border-[#EDE8DC] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="bg-white rounded-3xl border border-[#EDE8DC] shadow-xs p-4 sm:p-6 divide-y divide-[#F4EFE6]">
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
                      className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 bg-[#F4EFE6] border border-[#EDE8DC]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-[#292524] truncate">
                          {item.name}
                        </h3>
                        {item.category && (
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-[#FAF8F2] text-[#78716C] border border-[#EDE8DC]">
                            {item.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#78716C] mt-1 line-clamp-1">
                        {item.description || 'Prepared fresh at Tower A kitchen'}
                      </p>
                      <p className="text-xs font-semibold text-[#197A50] mt-1">
                        ₹{item.price} per unit
                      </p>
                    </div>
                  </div>

                  {/* Quantity Stepper & Price Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pl-2 sm:pl-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#F4EFE6]">
                    {/* Stepper with Requirement 4: Prevent quantities falling below 1 */}
                    <div className="inline-flex items-center border border-[#EDE8DC] rounded-xl bg-[#FAF8F2] p-1 shadow-2xs">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, item.quantity - 1);
                          }
                        }}
                        disabled={item.quantity <= 1}
                        className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all ${
                          item.quantity <= 1
                            ? 'opacity-30 cursor-not-allowed text-[#A8A29E]'
                            : 'text-[#78716C] hover:text-[#292524] hover:bg-white active:scale-90 cursor-pointer'
                        }`}
                        title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs sm:text-sm font-extrabold text-[#292524]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-[#78716C] hover:text-[#292524] hover:bg-white active:scale-90 transition-all cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[70px]">
                      <span className="text-[10px] text-[#78716C] block leading-none">Total</span>
                      <span className="text-base sm:text-lg font-extrabold text-[#197A50]">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    {/* Remove Action Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A8A29E] hover:text-red-600 p-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
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
                className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#197A50] hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue Ordering from Menu</span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-[#78716C]">
                <Clock className="w-3.5 h-3.5 text-[#197A50]" />
                <span>Live Kitchen estimated prep time: 10-15 mins</span>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY (Right Column) */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-3xl border border-[#EDE8DC] shadow-xs p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#F4EFE6]">
                <h3 className="font-extrabold text-base text-[#292524]">Order Summary</h3>
                <span className="text-xs font-bold text-[#197A50] bg-[#EBF5F0] px-2.5 py-0.5 rounded-full">
                  Floor 3 Canteen
                </span>
              </div>

              {/* Requirement 8: Calculate subtotal and grand total correctly without invented fees/taxes */}
              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-[#78716C]">
                  <span>Total Ordered Units</span>
                  <span className="font-bold text-[#292524]">{totalItemCount} units</span>
                </div>
                <div className="flex justify-between text-[#78716C]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#292524]">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-[#EDE8DC] flex justify-between items-baseline">
                  <div>
                    <span className="font-extrabold text-sm sm:text-base text-[#292524] block">
                      Grand Total
                    </span>
                    <span className="text-[11px] text-[#78716C]">Inclusive of all item costs</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-black text-[#197A50]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Requirement 10: Proceed to Checkout button navigates to /checkout */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#197A50] hover:bg-[#125B3C] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-[#F4EFE6] space-y-2 text-[11px] text-[#78716C]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#197A50] shrink-0" />
                  <span>Direct Corporate Payroll or UPI • Instant token</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#F28C45] shrink-0" />
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
