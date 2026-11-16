import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  Utensils,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Flame,
  User,
} from 'lucide-react';
import { CATEGORIES, MENU_ITEMS, HOMEPAGE_SIGNATURE_DISHES } from '../data/mockData';
import { BiryaniBowl3D } from '../components/common/BiryaniBowl3D';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getMenuCatalog } from '../services/api';

const AnimateOnScrollDown = ({
  children,
  className = '',
  initial = { opacity: 0, y: 50 },
  animate = { opacity: 1, y: 0 },
  transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  variants,
  threshold = 0.90,
  ...props
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const check = () => {
      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;

      // When the top of the element enters the visible screen area
      if (rect.top <= windowHeight * threshold && rect.bottom >= 0) {
        setIsVisible(true);
      } else if (rect.top > windowHeight) {
        setIsVisible(false);
      }
    };

    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [threshold]);

  if (variants) {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        variants={variants}
        transition={transition}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initial}
      animate={isVisible ? animate : initial}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { orders, addToCart, showToast, activeOrdersCount: contextActiveOrdersCount } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [_error, _setError] = useState(null);

  // Borderless Showcase Carousel State (Smooth Horizontal Slide Only)
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideDirection, setSlideDirection] = useState('next');
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Transition state for horizontal slide between outgoing and incoming dishes
  const [transitioningFrom, setTransitioningFrom] = useState(null);

  // Trigger smooth horizontal slide transition between dishes
  const triggerTransition = (targetIndex, dir) => {
    if (transitioningFrom !== null || targetIndex === currentSlide) return;
    const oldIndex = currentSlide;
    setTransitioningFrom(oldIndex);
    setSlideDirection(dir);
    setCurrentSlide(targetIndex);

    setTimeout(() => {
      setTransitioningFrom(null);
    }, 500);
  };

  const handleShowcaseNext = () => {
    const listLen = showcaseList.length || 5;
    const nextIdx = (currentSlide + 1) % listLen;
    triggerTransition(nextIdx, 'next');
  };

  const handleShowcasePrev = () => {
    const listLen = showcaseList.length || 5;
    const prevIdx = (currentSlide - 1 + listLen) % listLen;
    triggerTransition(prevIdx, 'prev');
  };

  // Autoplay timer: Automatically changes to next dish every 5 seconds (5000ms)
  // Only paused when user hovers over the showcase section
  useEffect(() => {
    if (isCarouselHovered) return;
    const interval = setInterval(() => {
      handleShowcaseNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [isCarouselHovered, transitioningFrom, currentSlide]);

  // 1. Load Canteen Catalog with Spring Boot API and offline local fallback
  useEffect(() => {
    let isMounted = true;
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const data = await getMenuCatalog();
        if (isMounted) {
          if (Array.isArray(data) && data.length > 0) {
            setMenuItems(data);
          } else {
            setMenuItems(MENU_ITEMS);
          }
        }
      } catch (err) {
        if (isMounted) {
          console.warn('[OfficeBite] API offline, loaded local menu items fallback:', err);
          setMenuItems(MENU_ITEMS);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchMenu();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Robust Defensive Fallbacks for Borderless Food Showcase (Homepage Main Signature Dishes)
  const showcaseList =
    Array.isArray(HOMEPAGE_SIGNATURE_DISHES) && HOMEPAGE_SIGNATURE_DISHES.length > 0
      ? HOMEPAGE_SIGNATURE_DISHES
      : [];
  const safeSlideIndex =
    showcaseList.length > 0
      ? ((currentSlide % showcaseList.length) + showcaseList.length) % showcaseList.length
      : 0;

  const activeDish = showcaseList[safeSlideIndex] || {
    id: 'showcase-paneer-tikka',
    name: 'Tandoori Paneer Tikka Platter',
    badge: 'Tandoor Signature',
    rating: 4.8,
    reviewsCount: 265,
    price: 175,
    prepTime: '12-15 mins',
    description:
      'Charcoal-roasted cottage cheese skewers infused with Kashmiri red chillies, mustard oil, thick hung curd, roasted bell peppers, charred red onions, and tangy mint-coriander chutney.',
    image: '/assets/images/showcase_paneer_tikka.png',
  };

  const prevIndex =
    showcaseList.length > 0 ? (safeSlideIndex - 1 + showcaseList.length) % showcaseList.length : 0;
  const nextIndex =
    showcaseList.length > 0 ? (safeSlideIndex + 1) % showcaseList.length : 0;

  const prevDish = showcaseList[prevIndex] || activeDish;
  const nextDish = showcaseList[nextIndex] || activeDish;
  const outgoingDish =
    transitioningFrom !== null && showcaseList[transitioningFrom]
      ? showcaseList[transitioningFrom]
      : null;

  const activeOrdersCount =
    typeof contextActiveOrdersCount === 'number'
      ? contextActiveOrdersCount
      : Array.isArray(orders)
        ? orders.filter(
          (o) =>
            o.status === 'PLACED' ||
            o.status === 'ACCEPTED' ||
            o.status === 'PREPARING' ||
            o.status === 'READY'
        ).length
        : 0;

  const handleOrderNowClick = (e) => {
    e.preventDefault();
    const menuEl = document.getElementById('menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F4F6] selection:bg-[#F59E0B]/30 selection:text-[#F59E0B] relative">
      {/* =========================================
          1. HERO SECTION (Dark Steakhouse Style + Open Rotating Biryani)
         ========================================= */}
      <section className="relative overflow-hidden pt-6 sm:pt-8 lg:pt-10 pb-10 sm:pb-14 lg:pb-16 z-10">
        {/* Soft Warm Amber Ambient Vignette Glows */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-[#F59E0B]/10 via-[#D97706]/8 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#F59E0B]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Hero Column (Smooth, staggered visible text animation matching showcase style) */}
            <AnimateOnScrollDown
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.12,
                    delayChildren: 0.08,
                  },
                },
              }}
              className="lg:col-span-6 space-y-6 text-center lg:text-left"
            >
              {/* Luxury Editorial Headline */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="font-['Playfair_Display',serif] text-5xl sm:text-6xl lg:text-7xl font-normal text-white tracking-tight leading-[1.14]"
              >
                A Premium<br />
                And Authentic<br />
                <span className="font-['Dancing_Script',cursive] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FDE68A] via-[#F59E0B] to-[#D97706] block sm:inline drop-shadow-sm">
                  OfficeBite
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="text-base sm:text-lg text-white/65 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                Indulge in authentic royal recipes: slow-cooked gravies, golden ghee-roasted dosas, aromatic dum biryanis in sizzling iron skillets, and degree filter coffee.
              </motion.p>

              {/* Call-to-action Buttons — Clean rounded button pills in a single line */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="pt-2 flex flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3 flex-nowrap overflow-x-auto no-scrollbar"
              >
                {/* 1. Order Now Button */}
                <button
                  type="button"
                  onClick={handleOrderNowClick}
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs sm:text-sm tracking-wider uppercase shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>

                {/* 2. Menu Button */}
                <Link
                  to="/menu"
                  className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-[#1E1E1E] hover:bg-[#282828] text-white border border-white/15 hover:border-white/30 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 shadow-sm"
                >
                  <Utensils className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Menu</span>
                </Link>

                {/* 3. Active Order / Sign In Button */}
                {isAuthenticated ? (
                  <Link
                    to="/orders"
                    className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 shadow-sm ${
                      activeOrdersCount > 0
                        ? 'bg-[#F59E0B]/15 hover:bg-[#F59E0B]/25 text-[#F59E0B] border border-[#F59E0B]/40 shadow-xs'
                        : 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/15 hover:border-white/30'
                    }`}
                  >
                    {activeOrdersCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                    <span>Active Order {activeOrdersCount > 0 ? `(${activeOrdersCount})` : ''}</span>
                  </Link>
                ) : (
                  <Link
                    to="/customer/login"
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/15 hover:border-[#F59E0B]/40 font-bold text-xs sm:text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 whitespace-nowrap shrink-0 shadow-sm"
                  >
                    <User className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Sign In</span>
                  </Link>
                )}
              </motion.div>
            </AnimateOnScrollDown>

            {/* Right Hero Visual (Vertically centered with headline & larger biryani) */}
            <AnimateOnScrollDown
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-6 relative flex items-center justify-center lg:justify-end"
            >
              <BiryaniBowl3D />
            </AnimateOnScrollDown>
          </div>
        </div>
      </section>

      {/* =========================================
          2. BORDERLESS CINEMATIC FOOD SHOWCASE (EXACT REFERENCE MATCH: SLIDE ONLY, DUAL ARROWS, ZERO SIDE DISHES)
         ========================================= */}
      <section
        id="food-showcase-section"
        className="pt-10 sm:pt-14 lg:pt-16 pb-8 sm:pb-10 lg:pb-12 border-none outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 bg-transparent relative overflow-hidden z-10 select-none"
        onMouseEnter={() => setIsCarouselHovered(true)}
        onMouseLeave={() => setIsCarouselHovered(false)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') handleShowcasePrev();
          if (e.key === 'ArrowRight') handleShowcaseNext();
        }}
      >
        {/* Subtle warm orange & dark amber ambient glow in background */}
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.14)_0%,_rgba(180,83,9,0.06)_50%,_transparent_75%)] blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)] blur-3xl pointer-events-none rounded-full" />

        {/* Showcase Content Container */}
        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Chef's Signature Showcase Heading & Indicator Controls (Smooth scroll-down animation) */}
          <AnimateOnScrollDown
            variants={{
              hidden: { opacity: 0, y: 30 },
              visible: {
                opacity: 1,
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1],
                  staggerChildren: 0.12,
                },
              },
            }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3 sm:mb-4 lg:mb-5"
          >
            <div>
              <motion.span
                variants={{
                  hidden: { opacity: 0, y: 20, filter: 'blur(5px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="font-['Dancing_Script',cursive] text-2xl sm:text-3xl font-bold text-[#F59E0B] block"
              >
                Chef's Signature Showcase
              </motion.span>
              <motion.h2
                variants={{
                  hidden: { opacity: 0, y: 25, filter: 'blur(5px)' },
                  visible: {
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                className="font-['Playfair_Display',serif] text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight mt-1"
              >
                Royal Culinary Highlights
              </motion.h2>
            </div>

            {/* Dish counter in luxury typography */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.85 },
                visible: {
                  opacity: 1,
                  scale: 1,
                  transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                },
              }}
              className="flex items-center gap-3 self-end sm:self-auto"
            >
              <div className="flex items-baseline gap-1.5 font-['Playfair_Display',serif] text-sm text-white/50">
                <span className="text-xl font-bold text-[#F59E0B]">
                  {String(currentSlide + 1).padStart(2, '0')}
                </span>
                <span>/</span>
                <span className="text-xs text-white/40">
                  {String(showcaseList.length).padStart(2, '0')}
                </span>
              </div>
            </motion.div>
          </AnimateOnScrollDown>

          {/* Main Showcase Grid: Left Dominant Food Stage + Right Open Information */}
          <div className="relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
              {/* Left Column: Food Stage (Clean scale-in, completely stable, ZERO rotation) */}
              <AnimateOnScrollDown
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-7 relative flex items-center justify-center select-none py-0 sm:py-1"
              >
                {/* Ambient warm radial spotlight glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] sm:w-[520px] lg:w-[640px] aspect-square rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.2)_0%,_rgba(217,119,6,0.06)_50%,_transparent_72%)] blur-3xl pointer-events-none" />

                {/* The Food Cluster — Food Plate with Left and Right Arrows Immediately Flanking It */}
                <div className="relative flex items-center justify-center">
                  {/* Subtle Left Navigation Arrow: Immediately beside the food image on the left, vertically centered */}
                  <button
                    type="button"
                    onClick={handleShowcasePrev}
                    aria-label="Previous dish"
                    className="absolute -left-4 sm:-left-6 md:-left-8 lg:-left-9 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A1A1A]/85 hover:bg-[#252525] border border-white/10 hover:border-[#F59E0B]/50 text-white/70 hover:text-[#F59E0B] shadow-xl backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group"
                  >
                    <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                  </button>

                  {/* The Dominant Food Plate Stage (Responsive, zero cropping, tight luxury fit) */}
                  <div className="food-visual-stage relative w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[450px] md:h-[450px] lg:w-[510px] lg:h-[510px] xl:w-[560px] xl:h-[560px] flex items-center justify-center will-change-transform z-20 p-1 sm:p-2">
                    {/* Outgoing Food Plate (Slides horizontally out without distortion - Zero Rotation) */}
                    {outgoingDish && (
                      <div
                        key={`outgoing-${outgoingDish.id}`}
                        className="absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none p-2 sm:p-4"
                        style={{
                          transform:
                            slideDirection === 'next'
                              ? 'translateX(-100%)'
                              : 'translateX(100%)',
                          opacity: 0,
                          transition: 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 420ms ease-out',
                        }}
                      >
                        <img
                          src={outgoingDish.image}
                          alt={outgoingDish.name}
                          draggable={false}
                          className="w-full h-full object-contain pointer-events-none select-none anim-showcase-dish drop-shadow-[0_28px_55px_rgba(0,0,0,0.95)]"
                          onError={(e) => {
                            e.currentTarget.src = '/assets/images/showcase_paneer_tikka.png';
                          }}
                        />
                      </div>
                    )}

                    {/* Active / Incoming Food Plate (Slides horizontally in - Zero Rotation) */}
                    <div
                      key={`active-${activeDish.id}-${transitioningFrom !== null ? slideDirection : 'idle'}`}
                      className={`w-full h-full flex items-center justify-center pointer-events-none select-none p-2 sm:p-4 ${transitioningFrom !== null
                          ? slideDirection === 'next'
                            ? 'animate-dish-slide-next'
                            : 'animate-dish-slide-prev'
                          : ''
                        }`}
                      style={{
                        transformOrigin: 'center center',
                      }}
                    >
                      <img
                        src={activeDish.image}
                        alt={activeDish.name}
                        draggable={false}
                        className="w-full h-full object-contain pointer-events-none select-none anim-showcase-dish drop-shadow-[0_28px_55px_rgba(0,0,0,0.95)]"
                        loading="eager"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/showcase_paneer_tikka.png';
                        }}
                      />
                    </div>
                  </div>

                  {/* Subtle Right Navigation Arrow: Immediately beside the food image on the right, vertically centered */}
                  <button
                    type="button"
                    onClick={handleShowcaseNext}
                    aria-label="Next dish"
                    className="absolute -right-4 sm:-right-6 md:-right-8 lg:-right-9 top-1/2 -translate-y-1/2 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1A1A1A]/85 hover:bg-[#252525] border border-white/10 hover:border-[#F59E0B]/50 text-white/70 hover:text-[#F59E0B] shadow-xl backdrop-blur-md transition-all duration-300 flex items-center justify-center cursor-pointer active:scale-95 group"
                  >
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </AnimateOnScrollDown>

              {/* Right Column: Food Details (Crisp, snappy staggered visible text animation on scroll down) */}
              <AnimateOnScrollDown
                key={`details-${activeDish.id}`}
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.11,
                      delayChildren: 0.08,
                    },
                  },
                }}
                className="lg:col-span-5 relative z-10 space-y-4 sm:space-y-5 text-center lg:text-left lg:pl-4 xl:pl-6 lg:pt-3 xl:pt-4"
              >
                {/* Bestseller / Signature Badge */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="flex items-center justify-center lg:justify-start"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 tracking-wide">
                    <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{activeDish.badge || 'Bestseller'}</span>
                  </span>
                </motion.div>

                {/* Dish Name in Luxury Serif Typography */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 28, filter: 'blur(6px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                >
                  <h3 className="font-['Playfair_Display',serif] text-3xl sm:text-4xl lg:text-5xl font-normal text-white tracking-tight leading-tight">
                    {activeDish.name}
                  </h3>
                </motion.div>

                {/* Price & Rating */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="space-y-1.5"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#F59E0B]">
                    ₹{activeDish.price}
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2 text-sm">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-4 h-4 fill-current text-amber-400" />
                    </div>
                    <span className="font-bold text-white">{activeDish.rating}</span>
                    <span className="text-white/50">({activeDish.reviewsCount} reviews)</span>
                  </div>
                </motion.div>

                {/* Dietary & Feature Tags */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1"
                >
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] border border-white/10 text-white/80">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeDish.isVeg !== false ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                    <span>{activeDish.isVeg !== false ? 'Veg Delight' : "Chef's Special"}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] border border-white/10 text-white/80">
                    <Utensils className="w-3.5 h-3.5 text-amber-400" />
                    <span>Basmati Rice</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] border border-white/10 text-white/80">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Traditional Flavors</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#1A1A1A] border border-white/10 text-white/80">
                    <Utensils className="w-3.5 h-3.5 text-amber-400" />
                    <span>Raita & Salad</span>
                  </span>
                </motion.div>

                {/* Action Buttons: Add to My Plate & View Full Menu */}
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 24, filter: 'blur(5px)' },
                    visible: {
                      opacity: 1,
                      y: 0,
                      filter: 'blur(0px)',
                      transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
                    },
                  }}
                  className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4"
                >
                  <button
                    type="button"
                    onClick={() => {
                      addToCart(activeDish);
                      if (showToast) {
                        showToast(`Added ${activeDish.name} to your food tray!`, 'success');
                      }
                    }}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-bold text-sm tracking-wide shadow-lg shadow-[#F59E0B]/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Plus className="w-4 h-4 stroke-[2.8]" />
                    <span>Add to My Plate</span>
                  </button>

                  <Link
                    to="/menu"
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-transparent hover:bg-white/5 text-white border border-white/25 hover:border-[#F59E0B]/60 font-semibold text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>View Full Menu</span>
                  </Link>
                </motion.div>
              </AnimateOnScrollDown>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          3. MASTER CHEF LIVE COOKING & FLAME WOK SHOWCASE (Borderless, Floating & Lively Bouncing)
         ========================================= */}
      <section className="relative z-10 pt-8 sm:pt-12 lg:pt-16 pb-10 sm:pb-14 lg:pb-20 overflow-hidden bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none ring-0">
        {/* Soft Ambient Warm Glow in Background */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.12)_0%,_rgba(217,119,6,0.03)_50%,_transparent_72%)] blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            
            {/* LEFT COLUMN: Clean 2-3 Line Content & Typography (Matching Reference Layout, Completely Unboxed) */}
            <AnimateOnScrollDown
              initial={{ opacity: 0, y: 55 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 xl:col-span-5 space-y-6 text-left select-none"
            >
              {/* Headline — Exactly Matching Reference Style */}
              <h2 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-white tracking-tight leading-[1.08]">
                A Fiery <br />
                And Authentic <br />
                <span className="font-['Dancing_Script',cursive] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#F59E0B] block mt-1 drop-shadow-sm">
                  OfficeBite
                </span>
              </h2>

              {/* Simple 2 to 3 Lines of Cooking Content */}
              <p className="text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed font-normal max-w-lg">
                Savor the sizzle of live high-flame wok tosses, hand-ground heirloom masalas, and farm-fresh ingredients cooked hot to order with royal culinary passion.
              </p>

              {/* Action Button — Primary ORDER NOW */}
              <div className="pt-2 flex items-center">
                <Link
                  to="/menu"
                  className="px-7 sm:px-8 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2.5 shadow-lg shadow-[#F59E0B]/25 hover:shadow-[#F59E0B]/40 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimateOnScrollDown>

            {/* RIGHT COLUMN: Large Chef Image with Fast Bounce & Floating Masala Powders (Free & Unboxed) */}
            <AnimateOnScrollDown
              initial={{ opacity: 0, y: 70, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 xl:col-span-7 relative flex items-center justify-center lg:justify-end select-none"
            >
              {/* Masala Powder Dust Cloud 1 (Golden Turmeric & Saffron Halo) */}
              <div className="absolute top-4 right-4 w-88 h-88 sm:w-[480px] sm:h-[480px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.28)_0%,_rgba(217,119,6,0.1)_45%,_transparent_72%)] blur-2xl animate-powder-pulse pointer-events-none -z-10" />

              {/* Masala Powder Dust Cloud 2 (Kashmiri Chilli & Paprika Flame Flare) */}
              <div
                className="absolute bottom-8 right-16 w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-[radial-gradient(circle,_rgba(239,68,68,0.22)_0%,_rgba(185,28,28,0.06)_50%,_transparent_72%)] blur-2xl animate-powder-pulse pointer-events-none -z-10"
                style={{ animationDelay: '1.2s' }}
              />

              {/* Wok Flame Core Glow */}
              <div className="absolute top-1/2 right-1/4 -translate-y-1/4 w-64 h-64 rounded-full bg-[radial-gradient(circle,_rgba(255,140,0,0.38)_0%,_rgba(239,68,68,0.16)_40%,_transparent_70%)] blur-xl pointer-events-none -z-10" />

              {/* Floating Whole Spices & Masala Elements around the Wok */}
              
              {/* Star Anise (Chakra Phool) - Drifting top-right */}
              <div className="absolute top-6 right-8 z-20 pointer-events-none animate-spice-slow opacity-90 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
                <svg width="48" height="48" viewBox="0 0 100 100" fill="none">
                  {/* Star Anise 8-petal shape */}
                  <g fill="#92400E" stroke="#78350F" strokeWidth="2">
                    <path d="M50 10 C46 25 46 35 50 50 C54 35 54 25 50 10 Z" />
                    <path d="M50 90 C46 75 46 65 50 50 C54 65 54 75 50 90 Z" />
                    <path d="M10 50 C25 46 35 46 50 50 C35 54 25 54 10 50 Z" />
                    <path d="M90 50 C75 46 65 46 50 50 C65 54 75 54 90 50 Z" />
                    <path d="M22 22 C34 32 40 38 50 50 C40 42 32 34 22 22 Z" />
                    <path d="M78 78 C66 68 60 62 50 50 C60 58 68 66 78 78 Z" />
                    <path d="M78 22 C66 32 60 38 50 50 C60 42 68 34 78 22 Z" />
                    <path d="M22 78 C34 68 40 62 50 50 C40 58 32 66 22 78 Z" />
                  </g>
                  {/* Glossy seeds inside pods */}
                  <circle cx="50" cy="22" r="3.5" fill="#F59E0B" />
                  <circle cx="50" cy="78" r="3.5" fill="#F59E0B" />
                  <circle cx="22" cy="50" r="3.5" fill="#F59E0B" />
                  <circle cx="78" cy="50" r="3.5" fill="#F59E0B" />
                  <circle cx="30" cy="30" r="3" fill="#FBBF24" />
                  <circle cx="70" cy="70" r="3" fill="#FBBF24" />
                  <circle cx="70" cy="30" r="3" fill="#FBBF24" />
                  <circle cx="30" cy="70" r="3" fill="#FBBF24" />
                  <circle cx="50" cy="50" r="6" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
                </svg>
              </div>

              {/* Cardamom Pod (Elaichi) - Drifting mid-left */}
              <div className="absolute top-1/3 left-6 z-20 pointer-events-none animate-spice-med opacity-90 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
                <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                  {/* Ribbed Cardamom pod */}
                  <path
                    d="M50 12 C30 35 28 65 50 88 C72 65 70 35 50 12 Z"
                    fill="#65A30D"
                    stroke="#4D7C0F"
                    strokeWidth="3"
                  />
                  {/* Ribs */}
                  <path d="M50 14 Q38 48 50 86" stroke="#84CC16" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M50 14 Q62 48 50 86" stroke="#84CC16" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                  <path d="M50 14 L50 86" stroke="#A3E635" strokeWidth="2" strokeLinecap="round" />
                  {/* Stem tip */}
                  <path d="M50 12 L50 6" stroke="#4D7C0F" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>

              {/* Cinnamon Stick (Dalchini) - Drifting bottom-left */}
              <div className="absolute bottom-16 left-8 z-20 pointer-events-none animate-spice-fast opacity-85 drop-shadow-[0_8px_16px_rgba(0,0,0,0.85)]">
                <svg width="46" height="46" viewBox="0 0 100 100" fill="none">
                  <g transform="rotate(-35 50 50)">
                    <rect x="25" y="42" width="50" height="16" rx="6" fill="#78350F" stroke="#451A03" strokeWidth="2" />
                    <line x1="30" y1="46" x2="70" y2="46" stroke="#B45309" strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="52" x2="68" y2="52" stroke="#92400E" strokeWidth="2" strokeLinecap="round" />
                    <ellipse cx="27" cy="50" rx="4" ry="6" fill="#451A03" />
                  </g>
                </svg>
              </div>

              {/* Curry Leaf - Floating near tossed food */}
              <div className="absolute top-16 right-36 z-20 pointer-events-none animate-spice-med opacity-90 drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]">
                <img src="/assets/images/curry_leaves.svg" alt="" className="w-10 h-10 drop-shadow-md rotate-12" />
              </div>

              {/* Floating Masala Powder Particles / Sparks */}
              <div className="absolute top-24 right-20 w-3 h-3 rounded-full bg-[#F59E0B] shadow-[0_0_12px_#F59E0B] animate-mote" style={{ animationDelay: '0.1s' }} />
              <div className="absolute top-44 right-14 w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_10px_#EF4444] animate-mote" style={{ animationDelay: '0.6s' }} />
              <div className="absolute top-1/2 right-48 w-3.5 h-3.5 rounded-full bg-[#FBBF24] shadow-[0_0_14px_#FBBF24] animate-mote" style={{ animationDelay: '0.9s' }} />
              <div className="absolute bottom-28 right-24 w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_10px_#F59E0B] animate-mote" style={{ animationDelay: '1.2s' }} />
              <div className="absolute bottom-44 right-44 w-2 h-2 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444] animate-mote" style={{ animationDelay: '0.4s' }} />
              <div className="absolute top-14 right-52 w-2.5 h-2.5 rounded-full bg-[#FCD34D] shadow-[0_0_10px_#FCD34D] animate-mote" style={{ animationDelay: '0.8s' }} />

              {/* Sizzling Floor Contact Shadow */}
              <div className="absolute -bottom-2 w-full h-10 bg-black/80 blur-2xl rounded-full pointer-events-none" />

              {/* The Chef Image (Masked & Feathered at the bottom to eliminate any straight line) */}
              <div
                className="relative z-10 w-full max-w-[650px] sm:max-w-[760px] md:max-w-[880px] lg:max-w-[980px] xl:max-w-[1080px] flex items-center justify-center animate-chef-bounce"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.75) 84%, rgba(0,0,0,0.15) 94%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.75) 84%, rgba(0,0,0,0.15) 94%, transparent 100%)',
                }}
              >
                <img
                  src="/assets/images/chef_cooking_flame.png"
                  alt="Master chef tossing flame-sizzled fresh ingredients in a wok"
                  draggable={false}
                  className="w-full h-auto object-contain pointer-events-none select-none drop-shadow-[0_28px_60px_rgba(0,0,0,0.95)]"
                />

                {/* Bottom Edge Blur Overlay to ensure a completely seamless transition into dark background */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent blur-md pointer-events-none" />
              </div>
            </AnimateOnScrollDown>

          </div>
        </div>
      </section>

      {/* =========================================
          4. MASTER DESK DELIVERY SHOWCASE (Delivery Image on Left, Reference Typography on Right, Completely Unboxed)
         ========================================= */}
      <section className="relative z-10 pt-10 sm:pt-14 lg:pt-20 pb-16 sm:pb-20 lg:pb-24 overflow-hidden bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none ring-0">
        {/* Soft Ambient Warm Glow in Background */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.12)_0%,_rgba(217,119,6,0.03)_50%,_transparent_72%)] blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl xl:max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
            
            {/* LEFT COLUMN: Large Delivery Partner Image with Natural Bounce (Free & Unboxed, on the Left) */}
            <AnimateOnScrollDown
              initial={{ opacity: 0, y: 70, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-7 xl:col-span-7 relative flex items-center justify-center lg:justify-start select-none"
            >
              {/* Golden Aura Dust Cloud 1 */}
              <div className="absolute top-4 left-4 w-88 h-88 sm:w-[500px] sm:h-[500px] rounded-full bg-[radial-gradient(circle,_rgba(245,158,11,0.25)_0%,_rgba(217,119,6,0.08)_45%,_transparent_72%)] blur-2xl animate-powder-pulse pointer-events-none -z-10" />

              {/* Kashmiri Flame & Saffron Glow 2 */}
              <div
                className="absolute bottom-8 left-16 w-80 h-80 sm:w-[440px] sm:h-[440px] rounded-full bg-[radial-gradient(circle,_rgba(239,68,68,0.18)_0%,_rgba(185,28,28,0.05)_50%,_transparent_72%)] blur-2xl animate-powder-pulse pointer-events-none -z-10"
                style={{ animationDelay: '1.2s' }}
              />

              {/* Warm Speed Core Glow */}
              <div className="absolute top-1/2 left-1/4 -translate-y-1/4 w-64 h-64 rounded-full bg-[radial-gradient(circle,_rgba(255,140,0,0.32)_0%,_rgba(239,68,68,0.12)_40%,_transparent_70%)] blur-xl pointer-events-none -z-10" />

              {/* Floor Contact Shadow */}
              <div className="absolute -bottom-2 w-full h-10 bg-black/80 blur-2xl rounded-full pointer-events-none" />

              {/* The Delivery Partner Image (Masked & Feathered at the bottom to eliminate any straight line) */}
              <div
                className="relative z-10 w-full max-w-[650px] sm:max-w-[760px] md:max-w-[880px] lg:max-w-[980px] xl:max-w-[1080px] flex items-center justify-center animate-chef-bounce"
                style={{
                  WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.75) 84%, rgba(0,0,0,0.15) 94%, transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, black 0%, black 72%, rgba(0,0,0,0.75) 84%, rgba(0,0,0,0.15) 94%, transparent 100%)',
                }}
              >
                <img
                  src="/assets/images/delivery_hero.png"
                  alt="OfficeBite delivery partner delivering piping-hot royal food"
                  draggable={false}
                  className="w-full h-auto object-contain pointer-events-none select-none drop-shadow-[0_28px_60px_rgba(0,0,0,0.95)]"
                />

                {/* Bottom Edge Blur Overlay to ensure a completely seamless transition into dark background */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent blur-md pointer-events-none" />
              </div>
            </AnimateOnScrollDown>

            {/* RIGHT COLUMN: Clean 2-3 Line Content & Typography (Matching Reference Layout, Completely Unboxed) */}
            <AnimateOnScrollDown
              initial={{ opacity: 0, y: 55 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-5 xl:col-span-5 space-y-6 text-left select-none lg:pl-4 xl:pl-6"
            >
              {/* Headline — Exactly Matching Reference Style */}
              <h2 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal text-white tracking-tight leading-[1.08]">
                Swift & Hot <br />
                Desk Delivery <br />
                <span className="font-['Dancing_Script',cursive] text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-[#F59E0B] block mt-1 drop-shadow-sm">
                  OfficeBite
                </span>
              </h2>

              {/* Simple 2 to 3 Lines of Delivery Content */}
              <p className="text-sm sm:text-base lg:text-lg text-white/70 leading-relaxed font-normal max-w-lg">
                From our master flame wok straight to your workspace desk. Insulated thermal packaging locks in piping-hot freshness with zero wait time.
              </p>

              {/* Action Button — Primary ORDER NOW */}
              <div className="pt-2 flex items-center">
                <Link
                  to="/menu"
                  className="px-7 sm:px-8 py-3.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-black text-xs sm:text-sm tracking-wider uppercase transition-all flex items-center gap-2.5 shadow-lg shadow-[#F59E0B]/25 hover:shadow-[#F59E0B]/40 hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <span>ORDER NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimateOnScrollDown>

          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;