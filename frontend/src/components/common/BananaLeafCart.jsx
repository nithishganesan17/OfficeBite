import React from 'react';

/**
 * BananaLeafCart - Authentic South Indian Green Banana Leaf Food Tray / Cart Icon.
 * Uses the authentic high-resolution banana leaf plate provided by the user.
 * - Empty (itemCount === 0): Fresh, vibrant green oval banana leaf plate with natural veins and textures.
 * - With Food (itemCount > 0): A bountiful South Indian feast spread generously across the leaf,
 *   filling the banana leaf with fluffy white basmati rice, golden ghee pool, crispy appalam,
 *   potato roast, toasted cashews, fresh curry leaves, and fragrant rising steam!
 */
export const BananaLeafCart = ({ itemCount = 0, className = 'w-14 sm:w-16 h-auto' }) => {
  const hasFood = itemCount > 0;

  return (
    <div className={`relative inline-flex items-center justify-center select-none ${className}`}>
      {/* 1. Real Banana Leaf Plate Image (High Resolution Transparent PNG) */}
      <img
        src="/assets/images/banana_leaf_cart.png"
        alt="Banana Leaf Food Tray"
        className="w-full h-auto object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)] transition-transform duration-200 group-hover:scale-105"
        draggable={false}
      />

      {/* 2. Full Feast Served Across the Banana Leaf (Fills the leaf when items are added) */}
      {hasFood && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg
            viewBox="0 0 100 58"
            className="w-[88%] h-[84%] filter drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]"
            fill="none"
          >
            <defs>
              {/* Rice mound 3D volume gradient */}
              <linearGradient id="fullRiceGrad" x1="50" y1="12" x2="50" y2="48" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="35%" stopColor="#FAFBFD" />
                <stop offset="70%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Golden Ghee / Dal Pool gradient */}
              <radialGradient id="gheePoolGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FEF08A" />
                <stop offset="45%" stopColor="#F59E0B" />
                <stop offset="85%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#B45309" />
              </radialGradient>

              {/* Crisp Appalam / Papad gradient */}
              <linearGradient id="appalamGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#FEF3C7" />
                <stop offset="60%" stopColor="#FCD34D" />
                <stop offset="100%" stopColor="#F59E0B" />
              </linearGradient>

              {/* Roasted Side Sabzi gradient */}
              <linearGradient id="roastGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="70%" stopColor="#B45309" />
                <stop offset="100%" stopColor="#78350F" />
              </linearGradient>
            </defs>

            {/* Crisp Appalam (Papad) Wedge on Left Rim */}
            <ellipse cx="22" cy="27" rx="8" ry="6" fill="url(#appalamGrad)" transform="rotate(-18 22 27)" stroke="#F59E0B" strokeWidth="0.5" />
            <circle cx="20" cy="25" r="0.7" fill="#D97706" opacity="0.6" />
            <circle cx="23" cy="28" r="0.5" fill="#D97706" opacity="0.6" />

            {/* Main Full Basmati Rice Mound - Spanning generously across the leaf */}
            <path
              d="M 16 30 C 16 18, 30 14, 50 14 C 70 14, 84 18, 84 30 C 84 42, 70 46, 50 46 C 30 46, 16 42, 16 30 Z"
              fill="url(#fullRiceGrad)"
              stroke="#CBD5E1"
              strokeWidth="0.6"
            />

            {/* Rice Texture - Basmati Grains Scattered Generously Across Left, Center, Right */}
            {/* Left Region Grains */}
            <ellipse cx="26" cy="26" rx="2.4" ry="0.9" fill="#FFFFFF" transform="rotate(-15 26 26)" />
            <ellipse cx="30" cy="32" rx="2.5" ry="0.9" fill="#FFFFFF" transform="rotate(25 30 32)" />
            <ellipse cx="34" cy="22" rx="2.2" ry="0.8" fill="#F8FAFC" transform="rotate(-35 34 22)" />
            <ellipse cx="28" cy="37" rx="2.4" ry="0.9" fill="#E2E8F0" transform="rotate(10 28 37)" />
            <ellipse cx="35" cy="40" rx="2.3" ry="0.9" fill="#E2E8F0" transform="rotate(-20 35 40)" />

            {/* Center Region Grains */}
            <ellipse cx="44" cy="20" rx="2.5" ry="0.9" fill="#FFFFFF" transform="rotate(12 44 20)" />
            <ellipse cx="56" cy="21" rx="2.5" ry="0.9" fill="#FFFFFF" transform="rotate(-18 56 21)" />
            <ellipse cx="40" cy="27" rx="2.6" ry="0.9" fill="#FFFFFF" transform="rotate(30 40 27)" />
            <ellipse cx="60" cy="28" rx="2.6" ry="0.9" fill="#FFFFFF" transform="rotate(-25 60 28)" />
            <ellipse cx="44" cy="38" rx="2.5" ry="0.9" fill="#F1F5F9" transform="rotate(-10 44 38)" />
            <ellipse cx="54" cy="39" rx="2.5" ry="0.9" fill="#F1F5F9" transform="rotate(15 54 39)" />
            <ellipse cx="50" cy="42" rx="2.4" ry="0.9" fill="#E2E8F0" transform="rotate(2 50 42)" />

            {/* Right Region Grains */}
            <ellipse cx="66" cy="23" rx="2.4" ry="0.9" fill="#FFFFFF" transform="rotate(22 66 23)" />
            <ellipse cx="72" cy="27" rx="2.3" ry="0.9" fill="#FFFFFF" transform="rotate(-12 72 27)" />
            <ellipse cx="68" cy="34" rx="2.5" ry="0.9" fill="#F8FAFC" transform="rotate(35 68 34)" />
            <ellipse cx="75" cy="35" rx="2.2" ry="0.8" fill="#F1F5F9" transform="rotate(-28 75 35)" />
            <ellipse cx="65" cy="40" rx="2.4" ry="0.9" fill="#E2E8F0" transform="rotate(8 65 40)" />

            {/* Golden Desi Ghee & Sambar Pool in Center */}
            <ellipse cx="50" cy="29" rx="5.5" ry="3.5" fill="url(#gheePoolGrad)" />
            <ellipse cx="49" cy="28" rx="2.2" ry="1.2" fill="#FEF08A" opacity="0.9" />

            {/* Roasted Golden Cashews on the Rice */}
            <path d="M 40 33 C 39 31, 41 29, 43 30 C 44 31, 43 33, 41 34 Z" fill="#E5B26E" stroke="#B45309" strokeWidth="0.4" />
            <path d="M 59 34 C 61 32, 63 34, 62 36 C 60 37, 58 35, 59 34 Z" fill="#E5B26E" stroke="#B45309" strokeWidth="0.4" />

            {/* Fresh Green Cilantro / Curry Leaf Garnish on Top */}
            <path d="M 48 24 C 47 21, 51 20, 52 23 C 53 25, 49 26, 48 24 Z" fill="#15803D" />
            <path d="M 52 25 C 54 22, 57 23, 56 26 C 55 28, 52 27, 52 25 Z" fill="#16A34A" />

            {/* Golden Potato Roast / Side Sabzi on Right Rim */}
            <rect x="76" y="24" width="4.5" height="4" rx="1.5" fill="url(#roastGrad)" transform="rotate(15 78 26)" />
            <rect x="78" y="29" width="4" height="3.5" rx="1.2" fill="url(#roastGrad)" transform="rotate(-10 80 30)" />

            {/* Delicate Rising Steam Trails */}
            <path d="M 42 13 C 40 8, 44 5, 41 1" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1" strokeLinecap="round" />
            <path d="M 50 11 C 52 6, 48 4, 51 1" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M 58 13 C 56 9, 60 6, 58 2" stroke="rgba(255, 255, 255, 0.85)" strokeWidth="1" strokeLinecap="round" />
          </svg>
        </div>
      )}
    </div>
  );
};

export default BananaLeafCart;
