import React, { useState } from 'react';
import { Star, Clock, Plus, Minus, Trash2, Sparkles, ChefHat } from 'lucide-react';
import { useCart } from '../../context/CartContext';

/**
 * Animated FoodCard with 3D tilt, hover lift, image zoom, and Kanigiri palette.
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
      <div className="tilt-card group bg-white rounded-3xl border border-[#EAE3D6] overflow-hidden shadow-[0_4px_20px_rgba(38,28,20,0.04)] hover:shadow-[0_20px_35px_rgba(61,90,43,0.12)] hover:border-[#D4E0C9] transition-all duration-300 flex flex-col h-full">
        {/* Food Image Container */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#F2ECE0]">
          <img
            src={imgError ? fallbackImg : dish.image}
            alt={dish.alt || dish.name}
            onError={() => setImgError(true)}
            loading="lazy"
            className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Luxury Gradient Overlay for image readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/25 pointer-events-none" />

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
            {/* Pure Veg Indicator */}
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-white/60">
              <span className="w-3 h-3 rounded-xs border-2 border-[#3D5A2B] flex items-center justify-center p-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3D5A2B]"></span>
              </span>
              <span className="text-[10px] font-black tracking-wider text-[#3D5A2B] uppercase">
                Veg
              </span>
            </div>

            {/* Special / Bestseller Badge */}
            {dish.badge && (
              <span
                className={`text-[11px] font-black px-3 py-1 rounded-xl shadow-xs tracking-wide ${
                  dish.badge === 'Bestseller' || dish.badge === 'Chef Signature'
                    ? 'bg-gradient-to-r from-[#D48B18] to-[#E5A93C] text-white'
                    : 'bg-[#3D5A2B] text-white'
                }`}
              >
                {dish.badge}
              </span>
            )}
          </div>

          {/* Bottom stats inside image */}
          <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs font-medium pointer-events-none drop-shadow-md">
            <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10">
              <Star className="w-3.5 h-3.5 fill-[#E5A93C] text-[#E5A93C]" />
              <span className="font-extrabold">{dish.rating}</span>
              <span className="text-white/80 text-[10px]">({dish.reviewsCount || 120})</span>
            </div>

            <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl border border-white/10 text-[11px]">
              <Clock className="w-3 h-3 text-[#E5A93C]" />
              <span>{dish.prepTime || '12 mins'}</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col justify-between bg-white">
          <div>
            <h3 className="font-extrabold text-base text-[#261C14] group-hover:text-[#3D5A2B] transition-colors leading-snug line-clamp-1">
              {dish.name}
            </h3>
            <p className="text-xs text-[#73675C] mt-1.5 leading-relaxed line-clamp-2">
              {dish.description}
            </p>
          </div>

          {/* Price & Action Button */}
          <div className="mt-4 pt-3.5 border-t border-[#EAE3D6] flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#73675C] block leading-none">
                Price
              </span>
              <span className="text-xl font-black text-[#261C14] tracking-tight">
                ₹{dish.price}
              </span>
            </div>

            {quantity === 0 ? (
              <button
                onClick={() => addToCart(dish)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-[#EEF3E8] hover:bg-[#3D5A2B] text-[#3D5A2B] hover:text-white font-bold text-xs transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-md active:scale-95 border border-[#D4E0C9]/60 hover:border-transparent"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Plate</span>
              </button>
            ) : (
              <div className="inline-flex items-center bg-[#3D5A2B] text-white rounded-2xl px-2 py-1 shadow-md shadow-[#3D5A2B]/20">
                <button
                  onClick={() => {
                    if (quantity > 1) {
                      updateQuantity(dish.id, quantity - 1);
                    } else {
                      removeFromCart(dish.id);
                    }
                  }}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-black/20 active:scale-90 transition-all cursor-pointer"
                  title={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                >
                  {quantity === 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                </button>
                <span className="w-7 text-center font-black text-xs">{quantity}</span>
                <button
                  onClick={() => updateQuantity(dish.id, quantity + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-black/20 active:scale-90 transition-all cursor-pointer"
                  title="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
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
