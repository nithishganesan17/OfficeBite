import React, { useState } from 'react';
import { Star, Clock, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';

/**
 * Animated FoodCard with dark theme and bold stylish handwriting dish names.
 * Features:
 * - Dish name in bold stylish handwriting (Caveat font)
 * - Dark carbon card surface (#1A1A1A) with soft amber accents (#F59E0B)
 */
export const FoodCard = ({ dish }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const [imgError, setImgError] = useState(false);

  const cartItem = cartItems.find((item) => item.id === dish.id);
  const quantity = cartItem ? cartItem.quantity : 0;

  // Fallback high-res food image if remote CDN fails
  const fallbackImg =
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="perspective-container">
      <div className="tilt-card group bg-[#1A1A1A] rounded-3xl border border-white/10 overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.7)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.9)] hover:border-[#F59E0B]/50 transition-all duration-300 flex flex-col h-full">
        {/* Food Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#141414]">
          <img
            src={imgError ? fallbackImg : dish.image}
            alt={dish.alt || dish.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className={`w-full h-full ${
              dish.image?.includes('.png') ? 'object-contain p-2.5' : 'object-cover'
            } object-center group-hover:scale-108 transition-transform duration-700 ease-out`}
          />

          {/* Gradient Overlay for image readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Pure Veg / Non-Veg Indicator */}
            <div className="flex items-center gap-1.5 bg-[#121212]/90 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-white/10">
              <span className={`w-3 h-3 rounded-xs border-2 ${dish.isVeg ? 'border-green-500' : 'border-red-500'} flex items-center justify-center p-0.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dish.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></span>
              </span>
              <span className={`text-[10px] font-black tracking-wider ${dish.isVeg ? 'text-green-400' : 'text-red-400'} uppercase`}>
                {dish.isVeg ? 'Veg' : 'Non-Veg'}
              </span>
            </div>

            {/* Special / Bestseller Badge */}
            {dish.badge && (
              <span className="text-[11px] font-black px-3 py-1 rounded-xl shadow-xs tracking-wide bg-[#F59E0B] text-[#121212]">
                {dish.badge}
              </span>
            )}
          </div>

          {/* Bottom stats inside image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium pointer-events-none drop-shadow-md">
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-extrabold">{dish.rating}</span>
              <span className="text-white/70 text-[10px]">({dish.reviewsCount || 120})</span>
            </div>

            <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[11px]">
              <Clock className="w-3 h-3 text-amber-300" />
              <span>{dish.prepTime || '12 mins'}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-[#1A1A1A]">
          <div>
            {/* DISH NAME IN BOLD STYLISH HANDWRITING (Caveat font) */}
            <h3 className="font-['Caveat',cursive] text-2xl sm:text-[26px] font-bold text-white group-hover:text-[#F59E0B] transition-colors leading-snug line-clamp-1 tracking-wide">
              {dish.name}
            </h3>
            <p className="text-xs text-white/60 mt-1 leading-relaxed line-clamp-2">
              {dish.description}
            </p>
          </div>

          {/* Price & Action Button */}
          <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/40 block leading-none">
                Price
              </span>
              <span className="text-xl font-black text-[#F59E0B] tracking-tight">
                ₹{dish.price}
              </span>
            </div>

            {quantity === 0 ? (
              <button
                onClick={() => addToCart(dish)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add to Plate</span>
              </button>
            ) : (
              <div className="inline-flex items-center bg-[#F59E0B] text-[#121212] rounded-2xl px-2 py-1 shadow-md font-black">
                <button
                  onClick={() => {
                    if (quantity > 1) {
                      updateQuantity(dish.id, quantity - 1);
                    } else {
                      removeFromCart(dish.id);
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-black/15 active:scale-90 transition-all cursor-pointer"
                  title={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                >
                  {quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5 stroke-[2.5]" />}
                </button>
                <span className="w-7 text-center font-black text-xs">{quantity}</span>
                <button
                  onClick={() => updateQuantity(dish.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-black/15 active:scale-90 transition-all cursor-pointer"
                  title="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
