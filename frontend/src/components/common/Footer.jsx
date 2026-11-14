import React, { useRef, useState, useEffect } from 'react';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

/**
 * OfficeBite Footer — Interactive Golden Journey
 * - Far Left (Start): Chef / Cook preparing fresh ingredients (Black and white illustration with floating animation)
 * - Start Anchor: Solid gold dot + 2 forward-pointing chevron arrows
 * - Golden Dashed Journey: Undulating sinusoidal curve with 2 peaks & 2 valleys
 * - Exact Alignment: 4 info pins mathematically locked at the curve peaks and valleys:
 *     1. Peak 1 (x=410, y=56): Operating Hours (Clock)
 *     2. Valley 1 (x=630, y=176): Location (MapPin)
 *     3. Peak 2 (x=855, y=56): Contact Number (Phone)
 *     4. Valley 2 (x=1080, y=176): Email (Mail)
 * - Far Right (End): Delta chevron arrowhead pointing directly into customer eating delicious meal
 *   (Black and white illustration with floating animation; "OfficeBite" text removed as requested)
 */
export const Footer = () => {
  const footerRef = useRef(null);
  const [isFooterInView, setIsFooterInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFooterInView(entry.isIntersecting);
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    const currentRef = footerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-[#121212] border-none outline-none relative z-20 pt-7 sm:pt-9 pb-4 text-white overflow-hidden selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]"
    >
      {/* Styles for smooth animations & glowing aura */}
      <style>{`
        @keyframes floatCook {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-1deg); }
        }
        @keyframes floatEat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes floatPin1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(-1deg); }
        }
        @keyframes floatPin2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(7px) rotate(1deg); }
        }
        @keyframes floatPin3 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(1deg); }
        }
        @keyframes floatPin4 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(7px) rotate(-1deg); }
        }
        @keyframes auraGlow {
          0%, 100% { filter: drop-shadow(0 0 6px rgba(255,255,255,0.4)) drop-shadow(0 0 16px rgba(245,158,11,0.25)); }
          50% { filter: drop-shadow(0 0 12px rgba(255,255,255,0.75)) drop-shadow(0 0 24px rgba(245,158,11,0.5)); }
        }
        @keyframes pinAuraGlow {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(245,158,11,0.5)) drop-shadow(0 0 12px rgba(245,158,11,0.25));
          }
          50% {
            filter: drop-shadow(0 0 10px rgba(251,191,36,0.85)) drop-shadow(0 0 20px rgba(245,158,11,0.5));
          }
        }
        .anim-cook {
          animation: floatCook 3.2s ease-in-out infinite, auraGlow 4s ease-in-out infinite;
          transform-origin: 80px 105px;
        }
        .anim-eat {
          animation: floatEat 2.8s ease-in-out infinite, auraGlow 3.6s ease-in-out infinite;
          transform-origin: 1335px 105px;
        }
        .anim-pin-1 {
          animation: floatPin1 3.2s ease-in-out infinite 0.15s, pinAuraGlow 3.8s ease-in-out infinite 0.15s;
          transform-origin: 0px 0px;
        }
        .anim-pin-2 {
          animation: floatPin2 3.4s ease-in-out infinite 0.6s, pinAuraGlow 3.8s ease-in-out infinite 0.6s;
          transform-origin: 0px 0px;
        }
        .anim-pin-3 {
          animation: floatPin3 3.1s ease-in-out infinite 1.05s, pinAuraGlow 3.8s ease-in-out infinite 1.05s;
          transform-origin: 0px 0px;
        }
        .anim-pin-4 {
          animation: floatPin4 3.5s ease-in-out infinite 1.5s, pinAuraGlow 3.8s ease-in-out infinite 1.5s;
          transform-origin: 0px 0px;
        }
        .anim-mobile-cook {
          animation: floatCook 3.2s ease-in-out infinite, auraGlow 4s ease-in-out infinite;
        }
        .anim-mobile-eat {
          animation: floatEat 2.8s ease-in-out infinite, auraGlow 3.6s ease-in-out infinite;
        }
        .anim-mobile-pin-1 {
          animation: floatMobile 3.2s ease-in-out infinite 0.15s, pinAuraGlow 3.8s ease-in-out infinite 0.15s;
        }
        .anim-mobile-pin-2 {
          animation: floatMobile 3.4s ease-in-out infinite 0.6s, pinAuraGlow 3.8s ease-in-out infinite 0.6s;
        }
        .anim-mobile-pin-3 {
          animation: floatMobile 3.1s ease-in-out infinite 1.05s, pinAuraGlow 3.8s ease-in-out infinite 1.05s;
        }
        .anim-mobile-pin-4 {
          animation: floatMobile 3.5s ease-in-out infinite 1.5s, pinAuraGlow 3.8s ease-in-out infinite 1.5s;
        }
        @keyframes floatMobile {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
        .pin-node {
          cursor: pointer;
        }
        .pin-node:hover circle.pin-marker {
          stroke: #FBBF24;
          filter: drop-shadow(0 0 16px rgba(251, 191, 36, 1));
        }
        .pin-node:hover text.pin-val {
          fill: #F59E0B;
        }
      `}</style>

      {/* Soft Ambient Warm Amber Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[240px] bg-gradient-to-r from-[#F59E0B]/6 via-[#D97706]/4 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* ============================================================
          1. DESKTOP & LAPTOP PANORAMIC JOURNEY (>= 1024px)
          Unified SVG: Curve, Extrema Pins, Cook & Eater scale in perfect sync
         ============================================================ */}
      <div className="hidden lg:block relative w-full max-w-[1560px] mx-auto px-4 h-[240px]">
        <svg
          viewBox="0 0 1440 230"
          className="w-full h-full overflow-visible"
          fill="none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Golden Glow for Journey Arrow & Markers */}
            <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#F59E0B" floodOpacity="0.6" />
            </filter>

            {/* Glowing White Aura for Characters */}
            <filter id="whiteGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#FFFFFF" floodOpacity="0.5" />
              <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor="#F59E0B" floodOpacity="0.35" />
            </filter>

            {/* Left-to-Right Animated Path Mask */}
            <mask id="footerArrowMask">
              <rect
                x="0"
                y="0"
                width={isFooterInView ? '1440' : '0'}
                height="230"
                fill="white"
                style={{
                  transition: 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </mask>
          </defs>

          {/* 1. START (Left Edge): Cook / Chef Preparing Ingredients (Black & White with Float Animation) */}
          <g
            className="anim-cook"
            style={{
              opacity: isFooterInView ? 1 : 0,
              transform: isFooterInView ? 'scale(1)' : 'scale(0.85)',
              transformOrigin: '80px 105px',
              transition: 'opacity 0.6s ease-out 100ms, transform 0.6s ease-out 100ms',
            }}
          >
            <image
              href="/assets/images/footer_cook_bw.png"
              x="10"
              y="48"
              width="140"
              height="115"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>

          {/* 2. START ANCHOR: Solid Golden Dot + 2 Small Forward Chevrons */}
          <g filter="url(#goldGlow)" mask="url(#footerArrowMask)">
            <circle cx="160" cy="118" r="5" fill="#F59E0B" />
            {/* Arrow 1 */}
            <line x1="170" y1="118" x2="183" y2="118" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <polyline
              points="178,113 183,118 178,123"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Arrow 2 */}
            <line x1="189" y1="118" x2="202" y2="118" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
            <polyline
              points="197,113 202,118 197,123"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          {/* 3. BODY: Smooth Undulating Sinusoidal Journey Path
                 Peak 1: (410, 56) | Valley 1: (630, 176) | Peak 2: (855, 56) | Valley 2: (1080, 176) */}
          <path
            d="M 210,118 C 275,118 335,56 410,56 C 485,56 550,176 630,176 C 710,176 775,56 855,56 C 935,56 1000,176 1080,176 C 1135,176 1180,128 1220,118"
            stroke="#F59E0B"
            strokeWidth="2.8"
            strokeDasharray="9 7"
            strokeLinecap="round"
            filter="url(#goldGlow)"
            mask="url(#footerArrowMask)"
          />

          {/* 4. PIN 1: OPERATING HOURS — Mathematically at Peak 1 (x=410, y=56) */}
          <g transform="translate(410, 56)">
            <g
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: '0px 0px',
                transition: 'opacity 0.4s ease-out 350ms, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 350ms',
              }}
            >
              <g className="anim-pin-1 pin-node">
                {/* Text Label Above Peak */}
                <text x="0" y="-34" fill="#F59E0B" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
                  OPERATING HOURS
                </text>
                <text x="0" y="-18" fill="#F3F4F6" fontSize="13" fontWeight="600" textAnchor="middle" className="pin-val transition-colors">
                  8:00 AM – 10:00 PM
                </text>
                {/* Pin Marker on Peak */}
                <circle cx="0" cy="0" r="18" fill="#141414" stroke="#F59E0B" strokeWidth="2.5" className="pin-marker" filter="url(#goldGlow)" />
                {/* Clock Icon */}
                <g transform="translate(-8, -8)" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <circle cx="8" cy="8" r="6.8" />
                  <polyline points="8,4 8,8 10.8,9.5" />
                </g>
              </g>
            </g>
          </g>

          {/* 5. PIN 2: LOCATION — Mathematically at Valley 1 (x=630, y=176) */}
          <g transform="translate(630, 176)">
            <g
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: '0px 0px',
                transition: 'opacity 0.4s ease-out 600ms, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 600ms',
              }}
            >
              <g className="anim-pin-2 pin-node">
                {/* Pin Marker in Valley */}
                <circle cx="0" cy="0" r="18" fill="#141414" stroke="#F59E0B" strokeWidth="2.5" className="pin-marker" filter="url(#goldGlow)" />
                {/* MapPin Icon */}
                <g transform="translate(-8, -9)" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M13.5 6.8c0 4.2-5.5 8.4-5.5 8.4s-5.5-4.2-5.5-8.4a5.5 5.5 0 0 1 11 0Z" />
                  <circle cx="8" cy="6.8" r="2" />
                </g>
                {/* Text Label Below Valley */}
                <text x="0" y="34" fill="#F59E0B" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
                  LOCATION
                </text>
                <text x="0" y="50" fill="#F3F4F6" fontSize="13" fontWeight="600" textAnchor="middle" className="pin-val transition-colors">
                  Krishnagiri Dt, TamilNadu-635104
                </text>
              </g>
            </g>
          </g>

          {/* 6. PIN 3: CONTACT NUMBER — Mathematically at Peak 2 (x=855, y=56) */}
          <g transform="translate(855, 56)">
            <g
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: '0px 0px',
                transition: 'opacity 0.4s ease-out 850ms, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 850ms',
              }}
            >
              <g className="anim-pin-3 pin-node">
                {/* Text Label Above Peak */}
                <text x="0" y="-34" fill="#F59E0B" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
                  CONTACT NUMBER
                </text>
                <a href="tel:9363584566">
                  <text x="0" y="-18" fill="#F3F4F6" fontSize="13" fontWeight="600" textAnchor="middle" className="pin-val transition-colors">
                    9363584566
                  </text>
                </a>
                {/* Pin Marker on Peak */}
                <circle cx="0" cy="0" r="18" fill="#141414" stroke="#F59E0B" strokeWidth="2.5" className="pin-marker" filter="url(#goldGlow)" />
                {/* Phone Icon */}
                <g transform="translate(-8, -8)" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M14.5 11.2v2a1.3 1.3 0 0 1-1.4 1.3 13 13 0 0 1-5.7-2 12.8 12.8 0 0 1-4-4 13 13 0 0 1-2-5.7A1.3 1.3 0 0 1 2.7 1.4h2a1.3 1.3 0 0 1 1.3 1.1 8.5 8.5 0 0 0 .5 1.8 1.3 1.3 0 0 1-.3 1.4L5.3 6.6a10.5 10.5 0 0 0 4 4l1-1a1.3 1.3 0 0 1 1.4-.3 8.5 8.5 0 0 0 1.8.5 1.3 1.3 0 0 1 1 1.4z" />
                </g>
              </g>
            </g>
          </g>

          {/* 7. PIN 4: EMAIL — Mathematically at Valley 2 (x=1080, y=176) */}
          <g transform="translate(1080, 176)">
            <g
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'scale(1)' : 'scale(0.5)',
                transformOrigin: '0px 0px',
                transition: 'opacity 0.4s ease-out 1100ms, transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) 1100ms',
              }}
            >
              <g className="anim-pin-4 pin-node">
                {/* Pin Marker in Valley */}
                <circle cx="0" cy="0" r="18" fill="#141414" stroke="#F59E0B" strokeWidth="2.5" className="pin-marker" filter="url(#goldGlow)" />
                {/* Mail Icon */}
                <g transform="translate(-8, -6)" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <rect width="16" height="12" x="0" y="0" rx="1.5" />
                  <path d="m16 2-8 5-8-5" />
                </g>
                {/* Text Label Below Valley */}
                <text x="0" y="34" fill="#F59E0B" fontSize="11" fontWeight="900" textAnchor="middle" letterSpacing="0.8">
                  EMAIL
                </text>
                <a href="mailto:nithishganesh1710@gmail.com">
                  <text x="0" y="50" fill="#F3F4F6" fontSize="13" fontWeight="600" textAnchor="middle" className="pin-val transition-colors">
                    nithishganesh1710@gmail.com
                  </text>
                </a>
              </g>
            </g>
          </g>

          {/* 8. END: Open Delta Chevron Arrowhead pointing right */}
          <path
            d="M 1210,102 L 1255,118 L 1210,134 L 1220,118 Z"
            stroke="#F59E0B"
            strokeWidth="2.8"
            strokeLinejoin="round"
            strokeLinecap="round"
            fill="#0B0B0B"
            filter="url(#goldGlow)"
            style={{
              opacity: isFooterInView ? 1 : 0,
              transform: isFooterInView ? 'scale(1)' : 'scale(0.75)',
              transformOrigin: '1235px 118px',
              transition: 'opacity 0.4s ease-out 1250ms, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 1250ms',
            }}
          />

          {/* 9. END (Right Edge): Customer Eating Food (Black & White with Float Animation, No OfficeBite Text) */}
          <g
            className="anim-eat"
            style={{
              opacity: isFooterInView ? 1 : 0,
              transform: isFooterInView ? 'scale(1)' : 'scale(0.85)',
              transformOrigin: '1335px 105px',
              transition: 'opacity 0.6s ease-out 1250ms, transform 0.6s ease-out 1250ms',
            }}
          >
            <image
              href="/assets/images/footer_eat_bw.png"
              x="1265"
              y="48"
              width="145"
              height="115"
              preserveAspectRatio="xMidYMid meet"
            />
          </g>
        </svg>
      </div>

      {/* ============================================================
          2. MOBILE & TABLET RESPONSIVE JOURNEY (< 1024px)
         ============================================================ */}
      <div className="lg:hidden relative max-w-md mx-auto px-6 py-4">
        {/* Top: Chef Cooking Illustration */}
        <div
          className="flex justify-center mb-6 transition-all duration-600 ease-out"
          style={{
            opacity: isFooterInView ? 1 : 0,
            transform: isFooterInView ? 'scale(1)' : 'scale(0.85)',
            transitionDelay: '100ms',
          }}
        >
          <img
            src="/assets/images/footer_cook_bw.png"
            alt="Chef cooking fresh food"
            className="w-32 h-auto object-contain anim-mobile-cook drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          />
        </div>

        {/* Continuous Golden Dashed Connecting Line */}
        <div className="relative">
          <div className="absolute left-[24px] top-4 bottom-4 w-0.5 border-l-2 border-dashed border-[#F59E0B] filter drop-shadow-[0_0_6px_rgba(245,158,11,0.5)] pointer-events-none" />

          <div className="space-y-7 relative z-10">
            {/* 1. Clock Pin */}
            <div
              className="anim-mobile-pin-1 flex items-center gap-4 transition-all duration-600 ease-out"
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: '300ms',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-[#141414] border-2 border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.45)]">
                <Clock className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-[11px] font-black text-[#F59E0B] uppercase tracking-wider">
                  Operating Hours
                </span>
                <span className="block text-sm font-semibold text-[#F3F4F6] mt-0.5">
                  8:00 AM – 10:00 PM
                </span>
              </div>
            </div>

            {/* 2. Location Pin */}
            <div
              className="anim-mobile-pin-2 flex items-center gap-4 transition-all duration-600 ease-out"
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: '550ms',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-[#141414] border-2 border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.45)]">
                <MapPin className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-[11px] font-black text-[#F59E0B] uppercase tracking-wider">
                  Location
                </span>
                <span className="block text-sm font-semibold text-[#F3F4F6] mt-0.5">
                  Krishnagiri Dt, TamilNadu-635104
                </span>
              </div>
            </div>

            {/* 3. Phone Pin */}
            <div
              className="anim-mobile-pin-3 flex items-center gap-4 transition-all duration-600 ease-out"
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: '800ms',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-[#141414] border-2 border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.45)]">
                <Phone className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <span className="block text-[11px] font-black text-[#F59E0B] uppercase tracking-wider">
                  Contact Number
                </span>
                <a
                  href="tel:9363584566"
                  className="block text-sm font-semibold text-[#F3F4F6] hover:text-[#F59E0B] transition-colors mt-0.5"
                >
                  9363584566
                </a>
              </div>
            </div>

            {/* 4. Mail Pin */}
            <div
              className="anim-mobile-pin-4 flex items-center gap-4 transition-all duration-600 ease-out"
              style={{
                opacity: isFooterInView ? 1 : 0,
                transform: isFooterInView ? 'translateX(0)' : 'translateX(-16px)',
                transitionDelay: '1050ms',
              }}
            >
              <div className="w-12 h-12 rounded-full bg-[#141414] border-2 border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.45)]">
                <Mail className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="block text-[11px] font-black text-[#F59E0B] uppercase tracking-wider">
                  Email
                </span>
                <a
                  href="mailto:nithishganesh1710@gmail.com"
                  className="block text-sm font-semibold text-[#F3F4F6] hover:text-[#F59E0B] transition-colors mt-0.5 truncate"
                >
                  nithishganesh1710@gmail.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Arrow pointing down to Eating Customer */}
        <div
          className="pt-6 flex flex-col items-center transition-all duration-600 ease-out"
          style={{
            opacity: isFooterInView ? 1 : 0,
            transform: isFooterInView ? 'translateY(0)' : 'translateY(16px)',
            transitionDelay: '1250ms',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-90 mb-3">
            <path
              d="M 3,2 L 21,12 L 3,22 L 7,12 Z"
              stroke="#F59E0B"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="#0B0B0B"
              filter="drop-shadow(0 0 4px rgba(245,158,11,0.6))"
            />
          </svg>
          <img
            src="/assets/images/footer_eat_bw.png"
            alt="Customer enjoying delicious food"
            className="w-36 h-auto object-contain anim-mobile-eat drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]"
          />
        </div>
      </div>

      {/* ============================================================
          3. CLEAN MINIMAL BOTTOM COPYRIGHT BAR
         ============================================================ */}
      <div className="mt-4 sm:mt-5 pt-3 border-t border-white/5 text-center text-xs text-white/40 max-w-7xl mx-auto px-4">
        <p>© {CURRENT_YEAR} OfficeBite. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
