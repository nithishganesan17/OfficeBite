import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    totalItemCount,
  } = useCart();

  const [imgErrors, setImgErrors] = useState({});

  if (!isCartOpen) return null;

  const fallbackImg =
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';

  const handleImgError = (id) => {
    setImgErrors((prev) => ({ ...prev, [id]: true }));
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  const handleGoToMenu = () => {
    setIsCartOpen(false);
    navigate('/menu');
  };

  const handleGoToCartPage = () => {
    setIsCartOpen(false);
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#FAF6EE] shadow-2xl flex flex-col border-l border-[#EAE3D6]">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-white border-b border-[#EAE3D6] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#261C14] leading-tight">Your Food Tray</h2>
                <p className="text-xs text-[#73675C]">
                  {totalItemCount} {totalItemCount === 1 ? 'unit' : 'units'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#78716C] hover:text-red-600 font-medium px-2 py-1 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                  title="Remove all items from tray"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#78716C] hover:text-[#292524] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
                title="Close tray"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center mb-4 shadow-xs">
                <ShoppingBag className="w-9 h-9 stroke-[1.6]" />
              </div>
              <h3 className="text-lg font-bold text-[#261C14]">Your food tray is empty</h3>
              <p className="text-xs text-[#73675C] mt-1.5 max-w-xs leading-relaxed">
                Add wholesome Indian meals, crispy dosas, biryani, or fresh filter coffee to beat the lunchtime rush!
              </p>
              <button
                onClick={handleGoToMenu}
                className="mt-6 px-5 py-2.5 rounded-xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-semibold text-xs tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Explore Royal Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#78716C] px-1 pb-1">
                  <span>Selected Dishes ({cartItems.length} types)</span>
                  <button
                    onClick={handleGoToCartPage}
                    className="text-[#197A50] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>Full page view</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 border border-[#EDE8DC] shadow-xs flex items-center gap-3 transition-all hover:border-[#D5E6DC]"
                  >
                    <img
                      src={imgErrors[item.id] ? fallbackImg : item.image || item.imageUrl || fallbackImg}
                      alt={item.name}
                      onError={() => handleImgError(item.id)}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#F4EFE6]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-[#292524] truncate leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#78716C] mt-0.5 font-medium">₹{item.price} each</p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Stepper with Requirement 4: Prevent quantities falling below 1 */}
                        <div className="inline-flex items-center border border-[#EDE8DC] rounded-lg bg-[#FAF8F2] px-1 py-0.5">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className={`w-5 h-5 flex items-center justify-center transition-all ${
                              item.quantity <= 1
                                ? 'opacity-30 cursor-not-allowed text-[#A8A29E]'
                                : 'text-[#78716C] hover:text-[#292524] active:scale-90 cursor-pointer'
                            }`}
                            title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-[#292524]">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-[#78716C] hover:text-[#292524] active:scale-90 cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <span className="text-sm font-extrabold text-[#197A50]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#A8A29E] hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer self-start"
                      title="Remove dish from tray"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {/* Canteen Notice */}
                <div className="bg-[#EBF5F0] border border-[#D5E6DC] rounded-xl p-3 flex items-start gap-2.5 mt-3">
                  <Clock className="w-4 h-4 text-[#197A50] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#197A50] leading-relaxed">
                    <strong>Floor 3 Canteen Live Kitchen:</strong> Avg prep time is 10-15 mins. Pickup counter token assigned upon order.
                  </p>
                </div>
              </div>

              {/* Bill Details & Checkout CTA */}
              <div className="p-4 sm:p-5 bg-white border-t border-[#EDE8DC] space-y-3">
                {/* Requirement 8: Calculate subtotal and grand total correctly without invented fees/taxes */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-[#73675C]">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-[#261C14]">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#EAE3D6] flex justify-between text-sm font-bold text-[#261C14]">
                    <span>Grand Total</span>
                    <span className="text-base text-[#3D5A2B] font-extrabold">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGoToCartPage}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF6EE] hover:bg-[#EAE3D6] text-[#261C14] border border-[#EAE3D6] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View & Edit Cart Details</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#73675C] pt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3D5A2B]" />
                  <span>Office Canteen Express Order • No Extra Fees</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
