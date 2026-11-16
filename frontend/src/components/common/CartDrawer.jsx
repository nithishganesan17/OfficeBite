import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { resolveDishImage } from '../../data/mockData';

export const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  const [imgErrors, setImgErrors] = useState({});

  if (!isCartOpen) return null;

  const fallbackImg = '/assets/images/showcase_thali_royal.png';

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
        <div className="w-screen max-w-md bg-[#161616] text-[#F3F4F6] shadow-2xl flex flex-col border-l border-white/10">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#1A1A1A] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#262626] text-[#F59E0B] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white leading-tight">My Plate</h2>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Close plate"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-[#262626] text-[#F59E0B] flex items-center justify-center mb-4 shadow-xs">
                <ShoppingBag className="w-9 h-9 stroke-[1.6]" />
              </div>
              <h3 className="text-lg font-bold text-white">Your plate is empty</h3>
              <p className="text-xs text-white/50 mt-1.5 max-w-xs leading-relaxed">
                Add dishes from the menu to your plate!
              </p>
              <button
                onClick={handleGoToMenu}
                className="mt-6 px-5 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs tracking-wide shadow-md transition-all active:scale-95 cursor-pointer"
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#1E1E1E] rounded-2xl p-3 border border-white/10 shadow-xs flex items-center gap-3 transition-all hover:border-[#F59E0B]/50"
                  >
                    <img
                      src={imgErrors[item.id] ? fallbackImg : resolveDishImage(item) || fallbackImg}
                      alt={item.name}
                      onError={() => handleImgError(item.id)}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-[#262626]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-white truncate leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-xs text-white/50 mt-0.5 font-medium">₹{item.price} each</p>

                      <div className="flex items-center justify-between mt-2">
                        {/* Stepper: Prevent quantities falling below 1 */}
                        <div className="inline-flex items-center border border-white/10 rounded-lg bg-[#121212] px-1 py-0.5">
                          <button
                            onClick={() => {
                              if (item.quantity > 1) {
                                updateQuantity(item.id, item.quantity - 1);
                              }
                            }}
                            disabled={item.quantity <= 1}
                            className={`w-5 h-5 flex items-center justify-center transition-all ${
                              item.quantity <= 1
                                ? 'opacity-30 cursor-not-allowed text-white/30'
                                : 'text-white/60 hover:text-white active:scale-90 cursor-pointer'
                            }`}
                            title={item.quantity <= 1 ? 'Minimum quantity is 1' : 'Decrease quantity'}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-5 h-5 flex items-center justify-center text-white/60 hover:text-white active:scale-90 cursor-pointer"
                            title="Increase quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Line Total */}
                        <span className="text-sm font-extrabold text-[#F59E0B]">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-white/40 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer self-start"
                      title="Remove dish from plate"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Total Amount, Proceed to Checkout & View Full Page */}
              <div className="p-4 sm:p-5 bg-[#1A1A1A] border-t border-white/10 space-y-3">
                <div className="flex justify-between items-center text-white">
                  <span className="text-sm font-bold text-white/70">Total Amount</span>
                  <span className="text-xl font-black text-[#F59E0B]">
                    ₹{subtotal.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleGoToCartPage}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#262626] hover:bg-white/10 text-white border border-white/10 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>View Full Page</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
