import React, { useState, useEffect } from 'react';

/**
 * Open Biryani Bowl Hero Component.
 * Uses the user's uploaded Chicken Biryani bowl with background removed:
 * 1. Deep matte charcoal/black canvas.
 * 2. The exact uploaded Chicken Dum Biryani bowl with 3 drumsticks, lemon slices, and mint leaves.
 * 3. NO background behind the bowl — transparent cutout with soft realistic drop-shadow.
 * 4. Realistic scattered fresh ingredients (sliced onion ring, rosemary, garlic cloves, cherry tomato, sea salt).
 * 5. Smooth scroll-driven rotation: as the user scrolls down, the biryani bowl rotates smoothly.
 */
export const BiryaniBowl3D = () => {
  const [scrollY, setScrollY] = useState(0);

  // The user's exact uploaded biryani bowl with background removed
  const biryaniImage = '/assets/images/biryani_bowl_nobg.png';

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute smooth rotation angle based on window scroll
  const rotationAngle = scrollY * 0.22;

  return (
    <div className="relative w-full max-w-[580px] sm:max-w-[660px] lg:max-w-[760px] xl:max-w-[820px] aspect-square flex items-center justify-center select-none mx-auto overflow-visible">
      {/* Soft warm ambient underglow behind the food */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#F59E0B]/16 via-[#D97706]/8 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* =========================================
          1. SCATTERED INGREDIENTS DIRECTLY ON DARK SURFACE
         ========================================= */}

      {/* Arc of Coarse White Sea Salt & Cracked Black Peppercorns */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
        {/* Salt crystals arc top-right */}
        <span className="absolute top-12 right-1/4 w-1.5 h-1.5 bg-white/90 rounded-xs rotate-12 blur-[0.2px] shadow-sm" />
        <span className="absolute top-16 right-1/5 w-2 h-1.5 bg-white/95 rounded-xs rotate-45 shadow-sm" />
        <span className="absolute top-20 right-[22%] w-1 h-1 bg-white/80 rounded-full" />
        <span className="absolute top-26 right-[15%] w-1.5 h-1 bg-white/85 rounded-xs -rotate-12" />
        <span className="absolute top-36 right-[10%] w-2 h-2 bg-white/90 rounded-xs rotate-30" />

        {/* Black peppercorn grains */}
        <span className="absolute top-14 right-[25%] w-2 h-2 bg-[#1C1917] border border-white/20 rounded-full" />
        <span className="absolute top-24 right-[18%] w-1.5 h-1.5 bg-[#1C1917] border border-white/20 rounded-full" />
        <span className="absolute bottom-24 left-[32%] w-2 h-2 bg-[#1C1917] border border-white/20 rounded-full" />
        <span className="absolute bottom-12 right-[32%] w-2 h-2 bg-[#1C1917] border border-white/20 rounded-full" />

        {/* Salt flakes arc bottom-left */}
        <span className="absolute bottom-20 left-1/5 w-2 h-1.5 bg-white/90 rounded-xs rotate-45" />
        <span className="absolute bottom-14 left-1/4 w-1.5 h-1 bg-white/80 rounded-xs -rotate-24" />
        <span className="absolute bottom-28 left-[16%] w-2 h-1 bg-white/85 rounded-xs rotate-12" />
      </div>

      {/* Top-Left: Sliced Red Onion / Shallot Ring */}
      <div
        className="absolute -top-5 left-2 sm:left-4 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none z-20"
        style={{
          transform: `perspective(400px) rotateX(48deg) rotateZ(${-28 + scrollY * 0.05}deg)`,
        }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.92)]">
          <ellipse cx="50" cy="50" rx="44" ry="34" fill="none" stroke="#9D174D" strokeWidth="8" />
          <ellipse cx="50" cy="50" rx="44" ry="34" fill="none" stroke="#F472B6" strokeWidth="2.5" opacity="0.85" />
          <ellipse cx="50" cy="50" rx="36" ry="26" fill="#FFF8F0" fillOpacity="0.25" />
          <ellipse cx="50" cy="50" rx="28" ry="18" fill="none" stroke="#9D174D" strokeWidth="4" opacity="0.6" />
        </svg>
      </div>

      {/* Top-Left: Whole Peeled Garlic Clove */}
      <div
        className="absolute top-16 -left-1 sm:left-1 w-12 h-12 pointer-events-none z-20"
        style={{ transform: `rotate(${-18 + scrollY * 0.04}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.9)]">
          <path
            d="M50 12 C34 28 22 56 32 78 C42 94 60 90 70 78 C80 56 66 28 50 12 Z"
            fill="#F3E5D4"
            stroke="#D6C0A6"
            strokeWidth="3.5"
          />
          <path d="M50 12 Q52 52 50 88" stroke="#D6C0A6" strokeWidth="2" fill="none" />
        </svg>
      </div>

      {/* Top-Right: Sprig of Rosemary */}
      <div
        className="absolute top-0 -right-2 sm:right-2 w-16 h-28 pointer-events-none z-20"
        style={{ transform: `rotate(${32 + scrollY * 0.06}deg)` }}
      >
        <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_10px_18px_rgba(0,0,0,0.85)]">
          <path d="M50 135 Q48 70 50 10" stroke="#1B4332" strokeWidth="3.5" fill="none" />
          <path d="M50 25 Q28 18 20 28" stroke="#40916C" strokeWidth="3" fill="none" />
          <path d="M50 40 Q72 32 80 42" stroke="#52B788" strokeWidth="3" fill="none" />
          <path d="M50 60 Q26 52 18 64" stroke="#40916C" strokeWidth="3.2" fill="none" />
          <path d="M50 80 Q74 72 82 84" stroke="#52B788" strokeWidth="3.2" fill="none" />
          <path d="M50 102 Q28 94 20 108" stroke="#40916C" strokeWidth="3" fill="none" />
        </svg>
      </div>

      {/* Bottom-Left: Fresh Red Tomato & Mint Accent */}
      <div
        className="absolute bottom-4 -left-1 sm:left-2 pointer-events-none z-20 flex items-center gap-2"
        style={{ transform: `rotate(${-12 + scrollY * 0.05}deg)` }}
      >
        <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#EF4444] to-[#991B1B] shadow-[0_12px_22px_rgba(0,0,0,0.9)] flex items-center justify-center">
          <div className="absolute top-1 left-2 w-2 h-1 rounded-full bg-white/60 blur-[0.4px]" />
          <span className="w-2.5 h-2.5 bg-[#22C55E] rounded-full -mt-2" />
        </div>
        <svg viewBox="0 0 60 80" className="w-9 h-11 -ml-2 -mt-2 drop-shadow-[0_8px_14px_rgba(0,0,0,0.85)]">
          <path
            d="M30 75 C10 60 5 35 30 5 C55 35 50 60 30 75 Z"
            fill="#22C55E"
            stroke="#15803D"
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Bottom-Right: Roasted Cashew Nut & Lime Wedge */}
      <div
        className="absolute bottom-2 -right-1 sm:right-4 w-14 h-14 pointer-events-none z-20"
        style={{ transform: `rotate(${24 + scrollY * 0.07}deg)` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_10px_16px_rgba(0,0,0,0.9)]">
          <path
            d="M32 28 C52 10 78 22 74 54 C70 76 50 82 38 72 C28 62 44 46 32 28 Z"
            fill="#E5B26E"
            stroke="#C89045"
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/* =========================================
          2. THE MAIN ROTATING BOWL (SMOOTH SCROLL ROTATION FOR HERO BIRYANI)
         ========================================= */}
      <div
        className="relative w-[390px] h-[390px] sm:w-[500px] sm:h-[500px] lg:w-[600px] lg:h-[600px] xl:w-[660px] xl:h-[660px] flex items-center justify-center will-change-transform transition-transform duration-100 ease-out z-10"
        style={{
          transform: `rotate(${rotationAngle}deg)`,
        }}
      >
        {/* Transparent cutout of the user's Biryani Bowl with realistic multi-layer drop shadow */}
        <div className="relative w-full h-full flex items-center justify-center drop-shadow-[0_32px_65px_rgba(0,0,0,0.96)] filter">
          <img
            src={biryaniImage}
            alt="Authentic Hot Chicken Dum Biryani Bowl"
            className="w-full h-full object-contain pointer-events-none"
            loading="eager"
          />

          {/* Sizzling pan vignette & appetizing warmth overlay */}
          <div className="absolute inset-4 rounded-full bg-radial from-amber-500/10 via-transparent to-black/20 pointer-events-none" />
        </div>

        {/* Wispy warm steam rising from the hot biryani */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-none overflow-visible flex justify-center z-30">
          <div className="w-8 h-20 bg-gradient-to-t from-white/30 via-white/10 to-transparent rounded-full blur-md animate-steam-rise-1 transform -rotate-6" />
          <div className="w-10 h-24 bg-gradient-to-t from-white/35 via-white/15 to-transparent rounded-full blur-md animate-steam-rise-2 transform rotate-4 -ml-2" />
          <div className="w-7 h-18 bg-gradient-to-t from-white/25 via-white/10 to-transparent rounded-full blur-md animate-steam-rise-3 transform -rotate-2 -ml-1" />
        </div>
      </div>
    </div>
  );
};

export { BiryaniBowl3D as BiryaniScene };
export default BiryaniBowl3D;