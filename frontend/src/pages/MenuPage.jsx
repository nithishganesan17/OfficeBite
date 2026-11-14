import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  ShoppingCart,
  Star,
  Flame,
  Heart,
  LayoutGrid,
  ArrowRight,
  Utensils,
  Wheat,
  Drumstick,
  Sparkles,
  Salad,
} from 'lucide-react';
import { CATEGORIES, MENU_ITEMS, getCanonicalDish, resolveDishImage } from '../data/mockData';
import { CategoryCarousel } from '../components/common/CategoryCarousel';
import { getMenuCatalog } from '../services/api';
import { useCart } from '../context/CartContext';
import { useLocation } from 'react-router-dom';

/**
 * Category metadata with high-res food thumbnails matching the approved reference design.
 */
const CATEGORY_META = {
  all: {
    name: 'All Dishes',
    icon: LayoutGrid,
    image: '/assets/images/showcase_thali_royal.png',
  },
  breakfast: {
    name: 'Breakfast',
    image: '/assets/images/showcase_steamed_idli.png',
  },
  lunch: {
    name: 'Lunch',
    image: '/assets/images/showcase_thali_deluxe.png',
  },
  snacks: {
    name: 'Snacks',
    image: '/assets/images/samosa_platter.png',
  },
  beverages: {
    name: 'Beverages',
    image: '/assets/images/filter_coffee.png',
  },
  combos: {
    name: 'Combos',
    image: '/assets/images/club_sandwich.png',
  },
  'south-indian': {
    name: 'South Indian',
    image: '/assets/images/showcase_masala_dosa.png',
  },
  'north-indian': {
    name: 'North Indian',
    image: '/assets/images/showcase_thali_deluxe.png',
  },
  'indian-meals': {
    name: 'Indian Meals',
    image: '/assets/images/showcase_thali_deluxe.png',
  },
  dosa: {
    name: 'Dosa & Crepes',
    image: '/assets/images/showcase_masala_dosa.png',
  },
  idli: {
    name: 'Idli Specials',
    image: '/assets/images/showcase_steamed_idli.png',
  },
  biryani: {
    name: 'Dum Biryani',
    image: '/assets/images/biryani_bowl_nobg.png',
  },
  'rice-bowls': {
    name: 'Rice Bowls',
    image: '/assets/images/jeera_rice_bowl.png',
  },
  sandwiches: {
    name: 'Sandwiches',
    image: '/assets/images/club_sandwich.png',
  },
  coffee: {
    name: 'Filter Coffee & Tea',
    image: '/assets/images/filter_coffee.png',
  },
  juice: {
    name: 'Fresh Juices',
    image: '/assets/images/fresh_juice_varieties.png',
  },
  chinese: {
    name: 'Chinese',
    image: '/assets/images/veg_paneer_biryani_bowl.png',
  },
  healthy: {
    name: 'Healthy',
    image: '/assets/images/executive_south_indian_thali.png',
  },
  desserts: {
    name: 'Desserts',
    image: '/assets/images/royal_kesar_pista_rasmalai.png',
  },
};

/**
 * Animated Wispy Steam Component
 * Generates continuous soft warm vapour rising gently from the hot dish.
 */
const SteamMist = () => (
  <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-32 pointer-events-none overflow-visible flex justify-center z-20">
    <div className="w-8 h-20 bg-gradient-to-t from-white/35 via-white/15 to-transparent rounded-full blur-md animate-steam-rise-1 transform -rotate-6" />
    <div className="w-10 h-24 bg-gradient-to-t from-white/40 via-white/20 to-transparent rounded-full blur-md animate-steam-rise-2 transform rotate-4 -ml-2" />
    <div className="w-7 h-18 bg-gradient-to-t from-white/30 via-white/10 to-transparent rounded-full blur-md animate-steam-rise-3 transform -rotate-2 -ml-1" />
  </div>
);

/**
 * Floating 3D Ingredients Component
 * Realistic sliced red onion rings, fresh mint leaves, and roasted cashew nuts
 * floating organically around the central dish in 3D perspective.
 */
const FloatingIngredients = () => (
  <>
    {/* Sliced Red Onion Ring (Top Left - Tilted in 3D perspective) */}
    <div
      className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none z-20 animate-float-slow"
      style={{ transform: 'perspective(400px) rotateX(48deg) rotateZ(-22deg)' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_12px_rgba(48,41,31,0.22)]">
        <ellipse cx="50" cy="50" rx="42" ry="34" fill="none" stroke="#C93B6E" strokeWidth="8" />
        <ellipse cx="50" cy="50" rx="42" ry="34" fill="none" stroke="#FF85A2" strokeWidth="3" opacity="0.8" />
        <ellipse cx="50" cy="50" rx="34" ry="26" fill="#FFF8F0" fillOpacity="0.5" />
      </svg>
    </div>

    {/* Fresh Green Mint Leaf (Top Center) */}
    <div
      className="absolute -top-7 left-1/3 w-10 h-10 sm:w-12 sm:h-12 pointer-events-none z-20 animate-float-medium"
      style={{ transform: 'rotate(24deg)' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_10px_rgba(48,41,31,0.2)]">
        <path d="M50 12 C32 32 26 66 50 88 C74 66 68 32 50 12 Z" fill="#405B39" />
        <path d="M50 18 Q48 50 50 82" stroke="#79C565" strokeWidth="3" fill="none" />
        <path d="M50 36 Q38 42 34 50" stroke="#79C565" strokeWidth="2" fill="none" />
        <path d="M50 52 Q62 58 66 66" stroke="#79C565" strokeWidth="2" fill="none" />
      </svg>
    </div>

    {/* Golden Roasted Cashew Nut (Top Right) */}
    <div
      className="absolute top-2 right-4 sm:top-4 sm:right-6 w-9 h-9 sm:w-11 sm:h-11 pointer-events-none z-20 animate-float-fast"
      style={{ transform: 'rotate(-35deg)' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_10px_rgba(48,41,31,0.2)]">
        <path
          d="M32 28 C52 10 78 22 74 54 C70 76 50 82 38 72 C28 62 44 46 32 28 Z"
          fill="#E5B26E"
          stroke="#C89045"
          strokeWidth="2.5"
        />
        <path d="M42 34 Q58 26 62 48" stroke="#FDE2B5" strokeWidth="3" fill="none" opacity="0.7" />
      </svg>
    </div>

    {/* Sliced Red Onion Ring (Right Side) */}
    <div
      className="absolute top-1/4 -right-6 sm:-right-10 w-16 h-16 sm:w-20 sm:h-20 pointer-events-none z-20 animate-float-slow"
      style={{ transform: 'perspective(400px) rotateX(42deg) rotateZ(35deg)' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_8px_14px_rgba(48,41,31,0.25)]">
        <ellipse cx="50" cy="50" rx="42" ry="34" fill="none" stroke="#D13B72" strokeWidth="8" />
        <ellipse cx="50" cy="50" rx="42" ry="34" fill="none" stroke="#FFA3B8" strokeWidth="3" opacity="0.8" />
        <ellipse cx="50" cy="50" rx="34" ry="26" fill="#FFF8F0" fillOpacity="0.45" />
      </svg>
    </div>

    {/* Green Mint / Coriander Leaf (Bottom Left) */}
    <div
      className="absolute bottom-6 -left-4 sm:bottom-8 sm:-left-6 w-11 h-11 pointer-events-none z-20 animate-float-medium"
      style={{ transform: 'rotate(-40deg)' }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_6px_10px_rgba(48,41,31,0.18)]">
        <path d="M50 14 C30 36 28 68 50 86 C72 68 70 36 50 14 Z" fill="#405B39" />
        <path d="M50 20 Q52 50 50 80" stroke="#79C565" strokeWidth="3" fill="none" />
      </svg>
    </div>
  </>
);

/**
 * OfficeBite Customer Menu Page — Light Green Theme.
 * Recreates the approved 3D Food Carousel layout with the elegant light green palette:
 * - Palette: #F4F7EF, #E5EDDC, #405B39, #A8BC91, #30291F, #777B70, #D8E2CE
 * - Mid-top category navigation bar with circular food thumbnails and active sage green pill
 * - Featured 3D Food Carousel with normal plated dish on wooden board, rising steam, and floating garnishes
 * - Left/Right preview dishes (Masala Dosa, Chicken Burger) peeking in
 * - Circular previous & next navigation buttons
 * - Synchronized food details, stepper, and deep sage Add to Cart button
 * - Arched Food Varieties section below with 8 cards and circular + buttons
 */
export const MenuPage = () => {
  const { addToCart, showToast } = useCart();
  const location = useLocation();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dietFilter, setDietFilter] = useState(() => {
    const params = new URLSearchParams(location.search);
    return params.get('diet') || 'all'; // 'all' | 'veg' | 'non-veg'
  });
  const [activeSlide, setActiveSlide] = useState(0);
  const [prevSlideIndex, setPrevSlideIndex] = useState(null);
  const [slideDirection, setSlideDirection] = useState('next'); // 'next' | 'prev'
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [favorites, setFavorites] = useState(() => new Set());

  // Carousel interaction refs
  const carouselViewportRef = useRef(null);
  const isTransitioningRef = useRef(false);
  const transitionTimeoutRef = useRef(null);
  const pointerState = useRef({
    isDown: false,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  // Sync search query and diet filter from URL parameter or custom window events
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q');
    if (q !== null) {
      setSearchQuery(q);
    }
    const d = params.get('diet');
    setDietFilter(d || 'all');

    const handleSearchEvent = (e) => {
      setSearchQuery(e.detail || '');
    };
    const handleDietEvent = (e) => {
      setDietFilter(e.detail || 'all');
    };
    window.addEventListener('officebite:search', handleSearchEvent);
    window.addEventListener('officebite:diet-filter', handleDietEvent);
    return () => {
      window.removeEventListener('officebite:search', handleSearchEvent);
      window.removeEventListener('officebite:diet-filter', handleDietEvent);
    };
  }, [location.search]);

  // Fetch menu catalog from Spring Boot REST API
  const fetchMenu = async () => {
    setLoading(true);
    try {
      const data = await getMenuCatalog();
      if (Array.isArray(data) && data.length > 0) {
        const apiIds = new Set();
        const normalized = data.map((item) => {
          const canonical = getCanonicalDish(item);
          const resolvedImg = resolveDishImage(canonical || item);
          const dishId = canonical ? canonical.id : item.id;
          apiIds.add(dishId);

          return {
            id: dishId,
            name: canonical ? canonical.name : item.name,
            description: item.description || (canonical && canonical.description),
            price: item.price,
            image: resolvedImg,
            imageUrl: resolvedImg,
            isVeg:
              item.vegetarian !== undefined
                ? item.vegetarian
                : canonical
                ? canonical.isVeg
                : item.isVeg ?? true,
            category: canonical ? canonical.category : item.category,
            categoryAlias: canonical ? canonical.categoryAlias : item.categoryAlias || [],
            categoryName:
              (canonical && canonical.categoryName) || item.categoryName || item.category,
            rating: item.rating || (canonical && canonical.rating) || 4.7,
            reviewsCount: item.reviewsCount || (canonical && canonical.reviewsCount) || 120,
            prepTime: item.prepTime || (canonical && canonical.prepTime) || '10-15 mins',
            calories: item.calories || (canonical && canonical.calories) || '450 kcal',
            badge: item.badge || (canonical && canonical.badge) || (item.isPopular ? 'Popular' : ''),
            isPopular: item.isPopular ?? (canonical ? canonical.isPopular : true),
            ingredients:
              item.ingredients || (canonical && canonical.ingredients) || [
                'Fresh Ingredients',
                'Traditional Spices',
              ],
          };
        });

        // Ensure dishes in mock catalog (e.g. non-veg dishes 24 and 25) are merged if missing from backend DB
        const missingFromBackend = MENU_ITEMS.filter((mockDish) => !apiIds.has(mockDish.id)).map(
          (d) => {
            const resolvedImg = resolveDishImage(d);
            return {
              ...d,
              image: resolvedImg,
              imageUrl: resolvedImg,
            };
          }
        );

        setMenuItems([...normalized, ...missingFromBackend]);
      } else {
        setMenuItems(
          MENU_ITEMS.map((d) => {
            const resolvedImg = resolveDishImage(d);
            return {
              ...d,
              image: resolvedImg,
              imageUrl: resolvedImg,
            };
          })
        );
      }
    } catch {
      // Offline fallback ensures reliable catalog
      setMenuItems(
        MENU_ITEMS.map((d) => {
          const resolvedImg = resolveDishImage(d);
          return {
            ...d,
            image: resolvedImg,
            imageUrl: resolvedImg,
          };
        })
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Filter dishes by category, search query, and diet preference (Veg / Non-Veg)
  const filteredDishes = useMemo(() => {
    return menuItems.filter((dish) => {
      // Diet preference filter (Veg / Non-Veg)
      if (dietFilter === 'veg' && !dish.isVeg) {
        return false;
      }
      if (dietFilter === 'non-veg' && dish.isVeg) {
        return false;
      }

      // Category filter matching primary category or category aliases
      if (selectedCategory !== 'all') {
        const matchesCategory =
          dish.category === selectedCategory ||
          (Array.isArray(dish.categoryAlias) && dish.categoryAlias.includes(selectedCategory));
        if (!matchesCategory) return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = dish.name.toLowerCase().includes(query);
        const matchesDesc = (dish.description || '').toLowerCase().includes(query);
        const matchesCat = (dish.categoryName || dish.category || '').toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [menuItems, selectedCategory, searchQuery, dietFilter]);

  // Reset active slide when category, search, or diet filter changes
  useEffect(() => {
    setActiveSlide(0);
    setPrevSlideIndex(null);
    setIsTransitioning(false);
    isTransitioningRef.current = false;
    setDragOffset(0);
    setIsDragging(false);
  }, [selectedCategory, searchQuery, dietFilter]);

  // Clean up transition timer on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  // Guard activeSlide bounds if list changes dynamically
  useEffect(() => {
    if (filteredDishes.length > 0 && activeSlide >= filteredDishes.length) {
      setActiveSlide(filteredDishes.length - 1);
    }
  }, [filteredDishes.length, activeSlide]);

  // Unified slide trigger with horizontal direction and outgoing dish capture
  const triggerSlide = useCallback(
    (direction, nextIndex) => {
      if (isTransitioningRef.current || filteredDishes.length <= 1) return;
      isTransitioningRef.current = true;
      setIsTransitioning(true);
      setSlideDirection(direction);
      setPrevSlideIndex(activeSlide);
      setActiveSlide(nextIndex);
      setDragOffset(0);
      setIsDragging(false);

      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        setPrevSlideIndex(null);
      }, 380);
    },
    [activeSlide, filteredDishes.length]
  );

  const handlePrev = useCallback(() => {
    if (isTransitioningRef.current || filteredDishes.length <= 1) return;
    const newIndex = activeSlide === 0 ? filteredDishes.length - 1 : activeSlide - 1;
    triggerSlide('prev', newIndex);
  }, [activeSlide, filteredDishes.length, triggerSlide]);

  const handleNext = useCallback(() => {
    if (isTransitioningRef.current || filteredDishes.length <= 1) return;
    const newIndex = activeSlide === filteredDishes.length - 1 ? 0 : activeSlide + 1;
    triggerSlide('next', newIndex);
  }, [activeSlide, filteredDishes.length, triggerSlide]);

  // Direct slide jumping (e.g. from pagination dots)
  const goToSlide = (newIndex) => {
    if (isTransitioningRef.current || filteredDishes.length <= 1) return;
    if (newIndex < 0 || newIndex >= filteredDishes.length || newIndex === activeSlide) return;
    const direction = newIndex > activeSlide ? 'next' : 'prev';
    triggerSlide(direction, newIndex);
  };

  // Keyboard Left / Right arrow navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrev, handleNext]);

  // Unified Pointer Event handlers for touch & mouse swiping (fixes image ghost dragging & preserves page scroll)
  const handlePointerDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    if (e.target && e.target.closest && e.target.closest('button')) return;
    if (isTransitioningRef.current || filteredDishes.length <= 1) return;

    pointerState.current = {
      isDown: true,
      isDragging: false,
      startX: e.clientX,
      startY: e.clientY,
    };

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!pointerState.current.isDown) return;

    const diffX = e.clientX - pointerState.current.startX;
    const diffY = e.clientY - pointerState.current.startY;

    // Detect intent: yield to native vertical page scroll if vertical motion is dominant
    if (!pointerState.current.isDragging) {
      if (Math.abs(diffY) > 8 && Math.abs(diffY) > Math.abs(diffX) * 1.2) {
        pointerState.current.isDown = false;
        return;
      }
      if (Math.abs(diffX) > 8) {
        pointerState.current.isDragging = true;
        setIsDragging(true);
      }
    }

    if (pointerState.current.isDragging) {
      // Elastic damped drag offset
      const clampedOffset = Math.max(-180, Math.min(180, diffX));
      setDragOffset(clampedOffset);
    }
  };

  const handlePointerUp = (e) => {
    if (!pointerState.current.isDown) return;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    const wasDragging = pointerState.current.isDragging;
    const diffX = e.clientX - pointerState.current.startX;

    pointerState.current.isDown = false;
    pointerState.current.isDragging = false;
    setIsDragging(false);

    if (wasDragging) {
      const swipeThreshold = 45; // px
      if (diffX < -swipeThreshold) {
        handleNext();
      } else if (diffX > swipeThreshold) {
        handlePrev();
      } else {
        setDragOffset(0);
      }
    } else {
      setDragOffset(0);
    }
  };

  const handlePointerCancel = (e) => {
    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}
    pointerState.current.isDown = false;
    pointerState.current.isDragging = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Quantity stepper management per dish
  const updateSlideQuantity = (dishId, delta) => {
    setQuantities((prev) => {
      const current = prev[dishId] || 1;
      const updated = Math.max(1, current + delta);
      return { ...prev, [dishId]: updated };
    });
  };

  // Add dish to cart with specified quantity
  const handleAddDishToCart = (dish, qty = 1) => {
    if (!dish) return;
    for (let i = 0; i < qty; i++) {
      addToCart(dish);
    }
    if (showToast) {
      showToast(`Added ${qty}× ${dish.name} to your food tray!`, 'success');
    }
  };

  // Favorite heart toggle
  const toggleFavorite = (id, e) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Select a dish from variety cards and smoothly scroll to the featured carousel
  const handleSelectVarietyCard = (dish) => {
    const foundIdx = filteredDishes.findIndex((d) => d.id === dish.id);
    if (foundIdx !== -1) {
      goToSlide(foundIdx);
      if (carouselViewportRef.current) {
        carouselViewportRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Dynamic heading for variety section
  const varietiesHeading = useMemo(() => {
    if (selectedCategory === 'all') {
      return 'Biryani & Rice Varieties';
    }
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? `${cat.name} Varieties` : 'Food Varieties';
  }, [selectedCategory]);

  // Current featured dish, outgoing dish during transitions, previous dish preview, and next dish preview
  const currentDish = filteredDishes[activeSlide] || filteredDishes[0];
  const outgoingDish =
    prevSlideIndex !== null && filteredDishes[prevSlideIndex]
      ? filteredDishes[prevSlideIndex]
      : null;
  const prevDish =
    filteredDishes.length > 1
      ? filteredDishes[(activeSlide - 1 + filteredDishes.length) % filteredDishes.length]
      : null;
  const nextDish =
    filteredDishes.length > 1
      ? filteredDishes[(activeSlide + 1) % filteredDishes.length]
      : null;

  const currentQty = currentDish ? quantities[currentDish.id] || 1 : 1;

  // Ingredient chips styled with warm dark palette
  const renderIngredientChips = (dish) => {
    if (!dish) return null;
    return (
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-[#F59E0B]">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-white/10 text-white/90 shadow-2xs">
          {dish.isVeg ? (
            <Salad className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Drumstick className="w-3.5 h-3.5 text-[#F59E0B]" />
          )}
          <span>{dish.isVeg ? 'Veg Delight' : 'Chicken'}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-white/10 text-white/90 shadow-2xs">
          <Wheat className="w-3.5 h-3.5 text-amber-300" />
          <span>Basmati Rice</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-white/10 text-white/90 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>Traditional Spices</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1A1A1A] border border-white/10 text-white/90 shadow-2xs">
          <Utensils className="w-3.5 h-3.5 text-amber-300" />
          <span>Raita & Salad</span>
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#121212] text-[#F3F4F6] pb-24 selection:bg-[#F59E0B]/30 selection:text-[#F59E0B]">
      {/* =========================================
          1. OPEN BORDERLESS FOOD CATEGORY CAROUSEL (Free Varieties Row - Static / Non-Sticky)
         ========================================= */}
      <section className="relative z-10 bg-transparent border-none pt-1 pb-2">
        <CategoryCarousel
          categories={CATEGORIES}
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setActiveSlide(0);
          }}
        />
      </section>

      {/* =========================================
          2. APPROVED 3D FOOD HERO CAROUSEL (Compact & Direct - Zero Blank Space)
         ========================================= */}
      <section className="relative overflow-hidden pt-2 pb-6 sm:pb-8 min-h-0 flex flex-col justify-start bg-gradient-to-b from-[#121212] via-[#161616] to-[#121212] border-none">
        {/* Soft Ambient Warm Amber Glow behind the food presentation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[820px] h-[600px] bg-gradient-to-r from-[#F59E0B]/12 via-[#D97706]/9 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          {loading ? (
            <div className="py-28 text-center space-y-4">
              <div className="w-12 h-12 border-3 border-[#F59E0B] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-white/60">Loading fresh dishes from kitchen...</p>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="py-20 text-center bg-[#1A1A1A]/80 backdrop-blur-md rounded-3xl border border-white/10 max-w-lg mx-auto p-8 shadow-xs">
              <Utensils className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
              <h3 className="text-xl font-bold text-white">No dishes found</h3>
              <p className="text-xs text-white/60 mt-1.5 leading-relaxed">
                No menu items match your search or filter. Try another category or clear your search term.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                  setDietFilter('all');
                  const params = new URLSearchParams(location.search);
                  params.delete('diet');
                  params.delete('q');
                  window.dispatchEvent(new CustomEvent('officebite:diet-filter', { detail: 'all' }));
                }}
                className="mt-5 px-5 py-2.5 rounded-xl bg-[#F59E0B] text-[#121212] text-xs font-black shadow-xs hover:bg-[#D97706] transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="relative">
              {/* Carousel Viewport Container with Unified Pointer Swiping */}
              <div
                ref={carouselViewportRef}
                className="relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-pan-y"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerCancel}
              >
                {/* =========================================
                    A. LEFT PREVIEW DISH (PEEKING FROM OFFSCREEN - BORDERLESS)
                   ========================================= */}
                {prevDish && filteredDishes.length > 1 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrev();
                    }}
                    aria-label={`Switch to previous dish: ${prevDish.name}`}
                    className="absolute -left-10 sm:-left-16 md:-left-20 lg:-left-28 top-1/2 -translate-y-1/2 w-40 sm:w-52 md:w-64 lg:w-72 aspect-square cursor-pointer hidden md:flex items-center justify-center z-10 group select-none"
                    style={{
                      transform: `translateY(-50%) translateX(${
                        isDragging && dragOffset > 0 ? dragOffset * 0.35 : 0
                      }px) scale(${
                        isDragging && dragOffset > 0
                          ? Math.min(0.85, 0.68 + dragOffset * 0.0008)
                          : 0.68
                      })`,
                      opacity:
                        isDragging && dragOffset > 0
                          ? Math.min(0.65, 0.32 + dragOffset * 0.002)
                          : 0.32,
                      filter: `blur(${
                        isDragging && dragOffset > 0
                          ? Math.max(0.5, 3.5 - dragOffset * 0.015)
                          : 3.5
                      }px) drop-shadow(0 15px 30px rgba(0,0,0,0.85))`,
                      transition: isDragging
                        ? 'none'
                        : 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1), opacity 450ms ease, filter 450ms ease',
                    }}
                  >
                    <img
                      src={prevDish.image}
                      alt={prevDish.name}
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none group-hover:scale-105 group-hover:opacity-100 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                      }}
                    />
                  </div>
                )}

                {/* =========================================
                    B. CENTER FEATURED DISH & DETAILS (BORDERLESS)
                   ========================================= */}
                <div className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-2">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
                    {/* Main Featured Food Plate Column (Large, Dominant & Flanked by Prev/Next Navigation Arrows) */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
                      <div className="relative w-[320px] h-[320px] sm:w-[420px] sm:h-[420px] md:w-[480px] md:h-[480px] lg:w-[520px] lg:h-[520px] xl:w-[560px] xl:h-[560px] flex items-center justify-center p-2 sm:p-4 group">
                        {/* Left Navigation Arrow — Positioned directly next to the food plate */}
                        {filteredDishes.length > 1 && (
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handlePrev();
                            }}
                            aria-label="Previous Dish"
                            className="absolute -left-3 sm:-left-5 md:-left-7 lg:-left-9 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A]/95 border border-white/10 text-white hover:text-[#F59E0B] hover:bg-[#252525] shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all flex items-center justify-center cursor-pointer pointer-events-auto"
                          >
                            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
                          </button>
                        )}

                        {/* Right Navigation Arrow — Positioned directly next to the food plate (NOT after the price) */}
                        {filteredDishes.length > 1 && (
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleNext();
                            }}
                            aria-label="Next Dish"
                            className="absolute -right-3 sm:-right-5 md:-right-7 lg:-right-9 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#1A1A1A]/95 border border-white/10 text-white hover:text-[#F59E0B] hover:bg-[#252525] shadow-lg hover:shadow-xl hover:scale-108 active:scale-95 transition-all flex items-center justify-center cursor-pointer pointer-events-auto"
                          >
                            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
                          </button>
                        )}

                        {/* Glowing Orange Crescent Rim Underlight hugging the bottom of the plate */}
                        <div
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[90%] sm:w-[94%] aspect-square pointer-events-none z-10 flex items-end justify-center"
                          aria-hidden="true"
                        >
                          <svg viewBox="0 0 200 100" className="w-full h-1/2 overflow-visible" fill="none">
                            <path
                              d="M 16 12 Q 100 92 184 12"
                              stroke="url(#menuPlateGlowArcGrad)"
                              strokeWidth="3.6"
                              strokeLinecap="round"
                              style={{
                                filter:
                                  'drop-shadow(0 0 8px rgba(255, 140, 0, 0.95)) drop-shadow(0 0 22px rgba(255, 120, 0, 0.7))',
                              }}
                            />
                            <defs>
                              <linearGradient id="menuPlateGlowArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.25" />
                                <stop offset="25%" stopColor="#FF8C00" stopOpacity="0.9" />
                                <stop offset="50%" stopColor="#FFAA00" stopOpacity="1" />
                                <stop offset="75%" stopColor="#FF8C00" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#FFAA00" stopOpacity="0.25" />
                              </linearGradient>
                            </defs>
                          </svg>
                          <div className="absolute bottom-1 w-2/3 h-5 bg-[#FF8C00]/30 blur-lg rounded-full pointer-events-none" />
                        </div>

                        {/* Outgoing Food Plate (Slides out smoothly while shrinking and blurring, zero rotation) */}
                        {outgoingDish && (
                          <div
                            key={`outgoing-${outgoingDish.id}`}
                            className={`absolute inset-0 w-full h-full flex items-center justify-center pointer-events-none select-none p-2 sm:p-4 z-20 ${
                              slideDirection === 'next'
                                ? 'animate-menu-dish-exit-left'
                                : 'animate-menu-dish-exit-right'
                            }`}
                          >
                            <img
                              src={outgoingDish.image}
                              alt={outgoingDish.name}
                              draggable={false}
                              className="w-full h-full object-contain pointer-events-none select-none anim-showcase-dish drop-shadow-[0_28px_55px_rgba(0,0,0,0.95)]"
                              onError={(e) => {
                                e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                              }}
                            />
                          </div>
                        )}

                        {/* Active / Incoming Food Plate (Interactive drag offset + slides in scaling up to full size, zero rotation) */}
                        <div
                          key={`active-${currentDish.id}-${isTransitioning ? slideDirection : 'idle'}`}
                          className={`w-full h-full flex items-center justify-center pointer-events-none select-none p-2 sm:p-4 z-20 ${
                            isTransitioning
                              ? slideDirection === 'next'
                                ? 'animate-menu-dish-enter-right'
                                : 'animate-menu-dish-enter-left'
                              : ''
                          }`}
                          style={{
                            transform:
                              !isTransitioning && dragOffset !== 0
                                ? `translateX(${dragOffset}px) scale(${1 - Math.min(0.12, Math.abs(dragOffset) * 0.0005)})`
                                : undefined,
                            transition: isDragging ? 'none' : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1)',
                          }}
                        >
                          <img
                            src={currentDish.image}
                            alt={currentDish.name}
                            draggable={false}
                            className="w-full h-full object-contain pointer-events-none select-none anim-showcase-dish drop-shadow-[0_28px_55px_rgba(0,0,0,0.95)] transform group-hover:scale-103 transition-transform duration-500 ease-out"
                            loading="eager"
                            onError={(e) => {
                              e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Food Information & Price Column (Completely clean with zero content below the price) */}
                    <div
                      key={`details-${currentDish.id}`}
                      className="lg:col-span-5 space-y-4 text-left animate-fade-in"
                    >
                      {/* Popular / Bestseller Badge */}
                      {currentDish.badge && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-xs font-semibold tracking-wide">
                          <Flame className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{currentDish.badge}</span>
                        </div>
                      )}

                      {/* Food Title — Elegant Luxury Serif Typography */}
                      <h1 className="font-['Playfair_Display',serif] text-4xl sm:text-5xl lg:text-6xl font-normal text-white tracking-tight leading-tight drop-shadow-sm">
                        {currentDish.name}
                      </h1>

                      {/* Price Display & Add to My Plate Button (Zero content below this line) */}
                      <div className="flex flex-wrap items-center gap-4 pt-1">
                        <span className="text-3xl sm:text-4xl font-extrabold text-[#F59E0B]">
                          ₹{currentDish.price}
                        </span>

                        <button
                          type="button"
                          onPointerDown={(e) => e.stopPropagation()}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddDishToCart(currentDish, 1);
                          }}
                          className="px-6 py-2.5 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] font-bold text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <Plus className="w-4 h-4 stroke-[2.8]" />
                          <span>Add to My Plate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================
                    C. RIGHT PREVIEW DISH (PEEKING FROM OFFSCREEN - BORDERLESS)
                   ========================================= */}
                {nextDish && filteredDishes.length > 1 && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    aria-label={`Switch to next dish: ${nextDish.name}`}
                    className="absolute -right-10 sm:-right-16 md:-right-20 lg:-right-28 top-1/2 -translate-y-1/2 w-40 sm:w-52 md:w-64 lg:w-72 aspect-square cursor-pointer hidden md:flex items-center justify-center z-10 group select-none"
                    style={{
                      transform: `translateY(-50%) translateX(${
                        isDragging && dragOffset < 0 ? dragOffset * 0.35 : 0
                      }px) scale(${
                        isDragging && dragOffset < 0
                          ? Math.min(0.85, 0.68 + Math.abs(dragOffset) * 0.0008)
                          : 0.68
                      })`,
                      opacity:
                        isDragging && dragOffset < 0
                          ? Math.min(0.65, 0.32 + Math.abs(dragOffset) * 0.002)
                          : 0.32,
                      filter: `blur(${
                        isDragging && dragOffset < 0
                          ? Math.max(0.5, 3.5 - Math.abs(dragOffset) * 0.015)
                          : 3.5
                      }px) drop-shadow(0 15px 30px rgba(0,0,0,0.85))`,
                      transition: isDragging
                        ? 'none'
                        : 'transform 450ms cubic-bezier(0.25, 1, 0.5, 1), opacity 450ms ease, filter 450ms ease',
                    }}
                  >
                    <img
                      src={nextDish.image}
                      alt={nextDish.name}
                      draggable={false}
                      className="w-full h-full object-contain pointer-events-none select-none group-hover:scale-105 group-hover:opacity-100 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Centered Pagination Dots (Matching Reference Image) */}
              {filteredDishes.length > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2 z-20">
                  {filteredDishes.slice(0, 5).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      className={`rounded-full transition-all duration-300 cursor-pointer ${
                        activeSlide === idx
                          ? 'w-7 h-2 bg-[#F59E0B] shadow-[0_0_10px_rgba(245,158,11,0.6)]'
                          : 'w-2 h-2 bg-white/20 hover:bg-white/40'
                      }`}
                      aria-label={`Go to dish ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* =========================================
          3. OPEN FOOD VARIETIES SECTION (Seamless & Borderless)
         ========================================= */}
      <section className="bg-transparent relative z-20 pt-4 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {varietiesHeading}
            </h2>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold text-[#F59E0B] hover:text-[#D97706] transition-colors cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Responsive Layout for Free-Floating Food Dishes (Auto-centers and covers full width for 2 or 3 dishes) */}
          {filteredDishes.length > 0 ? (
            <div
              className={`w-full ${
                filteredDishes.length === 1
                  ? 'flex justify-center max-w-md mx-auto'
                  : filteredDishes.length === 2
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-14 max-w-2xl lg:max-w-3xl mx-auto justify-items-center'
                  : filteredDishes.length === 3
                  ? 'grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-10 lg:gap-12 max-w-5xl lg:max-w-6xl mx-auto justify-items-center'
                  : 'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10'
              }`}
            >
              {filteredDishes.map((dish, idx) => {
                const isSelected = currentDish?.id === dish.id;
                const isFav = favorites.has(dish.id);

                return (
                  <div
                    key={dish.id}
                    onClick={() => handleSelectVarietyCard(dish)}
                    className="group relative flex flex-col items-center text-center cursor-pointer select-none p-3 sm:p-4 rounded-3xl transition-all duration-300 hover:-translate-y-2 w-full max-w-[320px]"
                  >
                    {/* Soft ambient background glow placed strictly BEHIND the item */}
                    <div
                      className={`absolute inset-0 -z-10 rounded-3xl transition-opacity duration-500 pointer-events-none ${
                        isSelected
                          ? 'bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_72%)]'
                          : 'hover:bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02)_0%,_transparent_72%)]'
                      }`}
                    />

                    {/* The Dominant Food Plate Stage (Circular, Floating & Glowing with Reduced Subtle Amber Aura) */}
                    <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-50 md:h-50 lg:w-56 lg:h-56 flex items-center justify-center mb-3 sm:mb-4">
                      {/* Ambient Warm Radial Spotlight Glow strictly behind Food Plate */}
                      <div
                        className={`absolute inset-0 -z-10 rounded-full transition-all duration-500 pointer-events-none ${
                          isSelected
                            ? 'bg-[radial-gradient(circle,_rgba(245,158,11,0.18)_0%,_rgba(217,119,6,0.04)_50%,_transparent_70%)] blur-xl scale-110'
                            : 'bg-[radial-gradient(circle,_rgba(245,158,11,0.1)_0%,_transparent_65%)] blur-lg group-hover:scale-105 group-hover:bg-[radial-gradient(circle,_rgba(245,158,11,0.16)_0%,_transparent_65%)]'
                        }`}
                      />

                      {/* Floor Contact Shadow */}
                      <div className="absolute -bottom-1 w-3/4 h-3.5 bg-black/60 blur-md rounded-full pointer-events-none group-hover:scale-95 transition-transform duration-500" />

                      {/* Free-Floating Food Image with Floating Animation & Gentle Drop-Shadow */}
                      <img
                        src={dish.image}
                        alt={dish.name}
                        loading="lazy"
                        draggable={false}
                        className="relative z-10 w-full h-full object-contain pointer-events-none select-none anim-showcase-dish drop-shadow-[0_16px_30px_rgba(0,0,0,0.9)] transform group-hover:scale-108 transition-transform duration-500 ease-out"
                        style={{
                          animationDelay: `${(idx % 4) * 0.35}s`,
                        }}
                        onError={(e) => {
                          e.currentTarget.src = '/assets/images/showcase_thali_royal.png';
                        }}
                      />

                      {/* Floating Glassmorphic Favorite Heart Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleFavorite(dish.id, e)}
                        className="absolute top-0 right-0 z-20 w-8 h-8 rounded-full bg-[#121212]/75 backdrop-blur-md border border-white/15 hover:border-[#F59E0B]/60 flex items-center justify-center text-white/70 hover:text-red-400 hover:scale-110 active:scale-95 transition-all shadow-md cursor-pointer"
                        title={isFav ? 'Remove from favorites' : 'Save to favorites'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isFav ? 'fill-red-500 text-red-500' : 'stroke-[2.2]'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Food Info & Pricing (Prominent, Bold & High-Contrast Typography strictly in foreground) */}
                    <div className="relative z-20 w-full flex flex-col items-center text-center">
                      {/* Chef Signature / Bestseller Badge */}
                      {dish.badge && (
                        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[11px] font-semibold tracking-wide mb-1.5">
                          <Flame className="w-3 h-3 fill-[#F59E0B] text-[#F59E0B]" />
                          <span>{dish.badge}</span>
                        </div>
                      )}

                      {/* Dish Title — Bolder, Larger, High Contrast, No Unwanted Truncation */}
                      <h3 className="font-['Playfair_Display',serif] text-lg sm:text-xl lg:text-[22px] font-extrabold text-white leading-snug line-clamp-2 max-w-[270px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
                        {dish.name}
                      </h3>

                      {/* Price & Add to Plate Button */}
                      <div className="mt-2.5 flex items-center justify-center gap-3">
                        <span className="font-['Playfair_Display',serif] font-extrabold text-xl sm:text-2xl text-[#F59E0B] tracking-tight drop-shadow-sm">
                          ₹{dish.price}
                        </span>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            addToCart(dish);
                            if (showToast) {
                              showToast(`Added ${dish.name} to your food tray!`, 'success');
                            }
                          }}
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#F59E0B] hover:bg-[#D97706] text-[#121212] flex items-center justify-center font-bold shadow-md shadow-[#F59E0B]/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                          title="Add to tray"
                        >
                          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                        </button>
                      </div>

                      {/* Active Indicator when featured in hero above */}
                      {isSelected && (
                        <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/30 text-[11px] text-[#F59E0B] font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse" />
                          <span>Now Featured</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-white/50 text-xs">
              No dishes available under this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MenuPage;
