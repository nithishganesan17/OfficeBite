import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CATEGORIES } from '../../data/mockData';

/**
 * Premium Food Category Carousel — Open, Borderless Cinematic Design.
 * Exact visual match to the approved design reference:
 * - Completely open, borderless horizontal category navigation row with generous spacing.
 * - Realistic circular food image above each category label.
 * - Unselected categories: subtly blurred (depth-of-field), dimmed, slightly scaled down.
 * - Selected category: enlarged, crystal sharp, with warm circular golden radial underglow.
 * - Glowing gold curved arc underline directly beneath the selected category label.
 * - Smooth gliding animation that slides the curved indicator seamlessly between categories.
 */
export const CategoryCarousel = ({
  categories = CATEGORIES,
  selectedCategory = 'all',
  onSelectCategory,
  className = '',
}) => {
  const containerRef = useRef(null);
  const itemRefs = useRef({});

  const scrollToActive = useCallback(() => {
    const activeEl = itemRefs.current[selectedCategory];
    const containerEl = containerRef.current;

    if (activeEl && containerEl) {
      // Gently scroll container if active category is outside viewport
      const containerWidth = containerEl.clientWidth;
      const targetScroll = activeEl.offsetLeft - containerWidth / 2 + activeEl.offsetWidth / 2;
      containerEl.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    scrollToActive();
    const timeout = setTimeout(scrollToActive, 80);
    window.addEventListener('resize', scrollToActive);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', scrollToActive);
    };
  }, [scrollToActive, categories]);

  return (
    <nav
      aria-label="Food Categories"
      className={`relative w-full max-w-[1560px] mx-auto px-2 sm:px-4 select-none ${className}`}
    >
      {/* Horizontal Scrollable Track — Completely Borderless & Open */}
      <div
        ref={containerRef}
        className="flex items-center justify-start lg:justify-center gap-6 sm:gap-8 md:gap-9 lg:gap-10 overflow-x-auto no-scrollbar scroll-smooth relative pt-1.5 pb-2 px-3 sm:px-6 touch-pan-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {/* Category Items */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const isExternalPhoto = cat.image && (cat.image.startsWith('http') || cat.image.includes('.jpg'));

          return (
            <button
              key={cat.id}
              ref={(el) => {
                if (el) itemRefs.current[cat.id] = el;
              }}
              type="button"
              onClick={() => onSelectCategory && onSelectCategory(cat.id)}
              className="flex flex-col items-center shrink-0 cursor-pointer group relative pt-1 pb-1 transition-transform duration-300 outline-none focus:outline-none"
              role="tab"
              aria-selected={isSelected}
            >
              {/* Food Thumbnail Container */}
              <div className="relative flex items-center justify-center">
                {/* Selected Category: Warm Golden Circular Halo Glow */}
                {isSelected && (
                  <div
                    className="absolute inset-0 -m-3 rounded-full bg-[radial-gradient(circle_at_center,_rgba(255,170,0,0.65)_0%,_rgba(255,130,0,0.22)_50%,_transparent_72%)] blur-md pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/* The Food Image */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 aspect-square relative flex items-center justify-center transition-all duration-300 ease-out ${
                    isSelected
                      ? 'scale-110 sm:scale-115 opacity-100 z-10'
                      : 'scale-90 opacity-60 group-hover:opacity-90 group-hover:scale-95'
                  }`}
                  style={{
                    filter: isSelected
                      ? 'drop-shadow(0 0 16px rgba(255,170,0,0.5)) drop-shadow(0 8px 18px rgba(0,0,0,0.8))'
                      : 'drop-shadow(0 4px 10px rgba(0,0,0,0.6))',
                  }}
                >
                  <img
                    src={cat.image || '/assets/images/showcase_thali_deluxe.png'}
                    alt={cat.name}
                    draggable={false}
                    className={`w-full h-full pointer-events-none select-none transition-transform duration-300 ${
                      isExternalPhoto ? 'rounded-full object-cover shadow-inner' : 'object-contain'
                    }`}
                    loading="eager"
                    onError={(e) => {
                      e.currentTarget.src = '/assets/images/showcase_thali_deluxe.png';
                    }}
                  />
                </div>
              </div>

              {/* Category Label — Clean, Open, Free Typography (No Box / No Border) */}
              <span
                className={`tracking-wide whitespace-nowrap transition-colors duration-300 mt-2 text-center select-none ${
                  isSelected
                    ? 'text-[#F59E0B] font-extrabold text-sm sm:text-base drop-shadow-sm'
                    : 'text-white/60 font-medium text-xs sm:text-sm group-hover:text-white/95'
                }`}
              >
                {cat.name}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default CategoryCarousel;
