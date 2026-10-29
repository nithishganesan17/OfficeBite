import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  Flame,
  Coffee,
  CheckCircle2,
  SlidersHorizontal,
  X,
  Utensils,
  MapPin,
  TrendingUp,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Heart,
  Award,
  Layers,
} from 'lucide-react';
import { CATEGORIES, MENU_ITEMS } from '../data/mockData';
import { FoodCard } from '../components/common/FoodCard';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getMenuCatalog, API_BASE_URL } from '../services/api';

/**
 * Premium Kanigiri-Inspired Customer HomePage.
 * Colors: warm cream (#FAF6EE), white (#FFFFFF), olive green (#3D5A2B), saffron gold (#D48B18), and dark brown (#261C14).
 * Features:
 * - Premium food hero with large food imagery, animated text, price badge, rating, and functional Order Now / Explore buttons.
 * - Interactive featured-food carousel with direct add-to-cart.
 * - Category filters, instant search, and animated section transitions.
 * - Reduced-motion support and accessible structure.
 */
export const HomePage = () => {
  const { orders, addToCart, activeOrdersCount: contextActiveOrdersCount } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'POPULAR' | 'BUDGET'
  const [sortBy, setSortBy] = useState('POPULAR'); // 'POPULAR' | 'PRICE_ASC' | 'PRICE_DESC'

  // Featured Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCarouselHovered, setIsCarouselHovered] = useState(false);

  // Fetch menu catalog from Spring Boot REST API
  const fetchMenu = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMenuCatalog();
      const normalized = data.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.imageUrl || item.image,
        imageUrl: item.imageUrl || item.image,
        isVeg: item.vegetarian !== undefined ? item.vegetarian : item.isVeg ?? true,
        vegetarian: item.vegetarian !== undefined ? item.vegetarian : true,
        isAvailable: item.available !== undefined ? item.available : item.isAvailable ?? true,
        available: item.available !== undefined ? item.available : true,
        category: item.category,
        categoryName: item.categoryName || item.category,
        rating: item.rating || 4.8,
        reviewsCount: item.reviewsCount || 140,
        prepTime: item.prepTime || '10-15 mins',
        calories: item.calories || '450 kcal',
        badge: item.badge || '',
        isPopular: item.isPopular !== undefined ? item.isPopular : (item.popular ?? false),
      }));

      setMenuItems(normalized);
    } catch (err) {
      console.error('Failed to fetch from Spring Boot backend, loading fallback:', err);
      // Seamlessly fall back to rich curated mock data if backend not reachable
      setMenuItems(MENU_ITEMS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  // Filter and sort items
  const filteredDishes = useMemo(() => {
    return menuItems
      .filter((dish) => {
        // Category filter
        if (selectedCategory !== 'all' && dish.category !== selectedCategory) {
          return false;
        }

        // Search query filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = dish.name.toLowerCase().includes(query);
          const matchesDesc = dish.description.toLowerCase().includes(query);
          const matchesCat = (dish.categoryName || '').toLowerCase().includes(query);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }

        // Quick pills filter
        if (filterType === 'POPULAR' && !dish.isPopular) return false;
        if (filterType === 'BUDGET' && dish.price > 100) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        return b.rating - a.rating;
      });
  }, [menuItems, selectedCategory, searchQuery, filterType, sortBy]);

  // Featured dishes for carousel
  const carouselDishes = useMemo(() => {
    const popular = menuItems.filter((item) => item.isPopular || item.badge);
    return popular.length > 0 ? popular.slice(0, 5) : menuItems.slice(0, 5);
  }, [menuItems]);

  // Carousel autoplay timer
  useEffect(() => {
    if (carouselDishes.length <= 1 || isCarouselHovered) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselDishes.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [carouselDishes.length, isCarouselHovered]);

  const activeOrdersCount =
    typeof contextActiveOrdersCount === 'number'
      ? contextActiveOrdersCount
      : orders.filter((o) =>
          o.status === 'PLACED' ||
          o.status === 'ACCEPTED' ||
          o.status === 'PREPARING' ||
          o.status === 'READY'
        ).length;

  const handleOrderNowClick = (e) => {
    e.preventDefault();
    const menuEl = document.getElementById('menu-section');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-[#261C14] selection:bg-[#3D5A2B]/20 selection:text-[#3D5A2B]">
      {/* =========================================
          1. HERO SECTION (Kanigiri Royal Inspiration)
         ========================================= */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-14 lg:pb-28 border-b border-[#EAE3D6] bg-gradient-to-b from-[#FAF6EE] via-[#FDFBF7] to-[#F5EFEB]">
        {/* Warm Ambient Radial Accents */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[900px] h-[400px] bg-gradient-to-tr from-[#3D5A2B]/10 via-[#D48B18]/15 to-transparent blur-3xl pointer-events-none rounded-full" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D48B18]/10 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Left Hero Column */}
            <div className="lg:col-span-7 space-y-7 text-center lg:text-left">
              {/* Gold Shimmer Royal Badge */}
              <div className="inline-flex items-center gap-2.5 bg-white px-4 py-2 rounded-full border border-[#EAE3D6] shadow-sm">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D48B18] animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-[#3D5A2B]">
                  Kanigiri Royal Dining Tradition
                </span>
                <span className="text-[#D48B18] text-xs font-bold">•</span>
                <span className="text-xs font-semibold text-[#73675C]">Floor 3 Kitchen Live</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#261C14] tracking-tight leading-[1.12]">
                Rich Heritage Flavors.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D5A2B] via-[#507538] to-[#D48B18]">
                  Crafted for Workdays.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-[#73675C] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Indulge in authentic royal recipes: slow-cooked North Indian gravies, golden ghee-roasted dosas, aromatic Malabar biryanis, and traditional degree filter coffee.
              </p>

              {/* Featured Dish Pricing & Rating Pill */}
              <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-4 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-[#EAE3D6] shadow-xs">
                <div className="flex items-center gap-2 pl-2">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#3D5A2B] to-[#507538] text-white flex items-center justify-center font-bold text-xs">
                    ₹180
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-[#261C14]">Royal Executive Thali</p>
                    <p className="text-[10px] text-[#73675C]">Special Subsidized Employee Rate</p>
                  </div>
                </div>

                <div className="h-6 w-px bg-[#EAE3D6] hidden sm:block" />

                <div className="flex items-center gap-1.5 px-2">
                  <Star className="w-4 h-4 fill-[#E5A93C] text-[#E5A93C]" />
                  <span className="text-xs font-extrabold text-[#261C14]">4.9 / 5</span>
                  <span className="text-[11px] text-[#73675C]">(2,400+ orders)</span>
                </div>
              </div>

              {/* Call-to-action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  type="button"
                  onClick={handleOrderNowClick}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-black text-sm tracking-wide shadow-lg shadow-[#3D5A2B]/25 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Order Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white hover:bg-[#FAF6EE] text-[#261C14] border border-[#EAE3D6] hover:border-[#3D5A2B]/50 font-bold text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Utensils className="w-4 h-4 text-[#D48B18]" />
                  <span>Explore Menu</span>
                </Link>

                {activeOrdersCount > 0 && (
                  <Link
                    to="/orders"
                    className="w-full sm:w-auto px-5 py-4 rounded-2xl bg-[#FDF5E6] hover:bg-[#F8E3BA] text-[#D48B18] border border-[#F8E3BA] font-extrabold text-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>My Active Orders ({activeOrdersCount})</span>
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="pt-6 border-t border-[#EAE3D6] flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#73675C]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[#261C14]">Fast 10-Min Prep</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#FDF5E6] text-[#D48B18] flex items-center justify-center">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[#261C14]">Desk Delivery Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-[#261C14]">FSSAI Certified Kitchen</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual with 3D Tilt Card & Food Focus */}
            <div className="lg:col-span-5 relative perspective-container">
              <div className="relative mx-auto max-w-md lg:max-w-none tilt-card">
                {/* Glow behind card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3D5A2B]/20 via-[#D48B18]/20 to-transparent rounded-3xl blur-2xl transform rotate-2" />

                <div className="relative bg-white p-3.5 rounded-3xl border border-[#EAE3D6] shadow-2xl overflow-hidden">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#F2ECE0]">
                    <img
                      src="https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1200&q=80"
                      alt="Deluxe Royal North Indian Thali freshly prepared"
                      className="w-full h-full object-cover object-center transform hover:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <span className="bg-[#D48B18] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider shadow-xs">
                        Chef's Royal Special
                      </span>
                      <h3 className="font-extrabold text-xl text-white mt-1.5 tracking-tight">
                        Deluxe Royal North Indian Thali
                      </h3>
                      <p className="text-white/80 text-xs mt-0.5">
                        Paneer Makhani, Dal Tadka, 2 Ghee Rotis, Pulao & Gulab Jamun
                      </p>
                    </div>
                  </div>

                  {/* Card Micro-Interaction Footer */}
                  <div className="mt-3.5 p-3.5 bg-[#FAF6EE] rounded-2xl flex items-center justify-between border border-[#EAE3D6]/70">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-[#3D5A2B] text-white flex items-center justify-center font-black text-xs shadow-xs">
                        ₹180
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#261C14]">Subsidized Meal Rate</p>
                        <p className="text-[10px] text-[#73675C]">Pre-order for instant pickup</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOrderNowClick}
                      className="px-4 py-2 rounded-xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <span>Order Plate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          2. FEATURED DISHES CAROUSEL
         ========================================= */}
      {carouselDishes.length > 0 && (
        <section
          className="py-14 border-b border-[#EAE3D6] bg-white relative overflow-hidden"
          onMouseEnter={() => setIsCarouselHovered(true)}
          onMouseLeave={() => setIsCarouselHovered(false)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-[#D48B18]">
                  Chef's Signature Showcase
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#261C14] tracking-tight mt-1">
                  Royal Culinary Highlights
                </h2>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlide((prev) => (prev === 0 ? carouselDishes.length - 1 : prev - 1))
                  }
                  className="p-2.5 rounded-xl border border-[#EAE3D6] hover:border-[#3D5A2B] text-[#261C14] hover:bg-[#FAF6EE] transition-colors cursor-pointer shadow-2xs"
                  aria-label="Previous slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1 px-2">
                  {carouselDishes.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentSlide === idx ? 'w-6 bg-[#3D5A2B]' : 'w-2 bg-[#EAE3D6]'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentSlide((prev) => (prev + 1) % carouselDishes.length)
                  }
                  className="p-2.5 rounded-xl border border-[#EAE3D6] hover:border-[#3D5A2B] text-[#261C14] hover:bg-[#FAF6EE] transition-colors cursor-pointer shadow-2xs"
                  aria-label="Next slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Active Slide Showcase */}
            <div className="relative overflow-hidden rounded-3xl bg-[#FAF6EE] border border-[#EAE3D6] shadow-sm">
              {carouselDishes.map((dish, idx) => (
                <div
                  key={dish.id}
                  className={`transition-all duration-700 ease-in-out ${
                    currentSlide === idx
                      ? 'opacity-100 relative translate-x-0'
                      : 'opacity-0 absolute inset-0 pointer-events-none translate-x-8'
                  }`}
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                    <div className="md:col-span-6 relative aspect-[16/10] md:aspect-auto md:h-96 overflow-hidden">
                      <img
                        src={dish.image}
                        alt={dish.name}
                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-[#D48B18] text-white text-xs font-black uppercase px-3 py-1 rounded-xl shadow-xs">
                          {dish.badge || 'Chef Selection'}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-6 p-6 sm:p-10 space-y-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-[#E5A93C] text-[#E5A93C]" />
                        <span className="font-extrabold text-sm text-[#261C14]">{dish.rating}</span>
                        <span className="text-xs text-[#73675C]">({dish.reviewsCount || 150} employee reviews)</span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black text-[#261C14] tracking-tight">
                        {dish.name}
                      </h3>
                      <p className="text-sm text-[#73675C] leading-relaxed">
                        {dish.description}
                      </p>

                      <div className="flex items-center gap-6 pt-2">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#73675C] tracking-wider block">Price</span>
                          <span className="text-2xl font-black text-[#261C14]">₹{dish.price}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-[#73675C] tracking-wider block">Prep Time</span>
                          <span className="text-sm font-extrabold text-[#3D5A2B]">{dish.prepTime}</span>
                        </div>
                      </div>

                      <div className="pt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => addToCart(dish)}
                          className="px-6 py-3 rounded-2xl bg-[#3D5A2B] hover:bg-[#2E4620] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add to My Plate</span>
                        </button>
                        <a
                          href="#menu-section"
                          className="px-5 py-3 rounded-2xl bg-white border border-[#EAE3D6] hover:bg-[#FAF6EE] text-[#261C14] font-bold text-xs sm:text-sm transition-colors"
                        >
                          View Full Menu
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* =========================================
          3. EXPLORE MENU & FILTER SECTION
         ========================================= */}
      <section id="menu-section" className="py-16 lg:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-black uppercase tracking-wider text-[#D48B18]">
            Fresh Daily Preparation
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#261C14] tracking-tight mt-1">
            Explore the Royal Canteen Menu
          </h2>
          <p className="text-sm text-[#73675C] mt-2">
            Select authentic hot dishes, customize orders, and pick up fresh with your digital token.
          </p>
        </div>

        {/* Search Bar & Filter Controls */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#EAE3D6] shadow-sm mb-8 space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#73675C]" />
              <input
                type="text"
                placeholder="Search dish by name, ingredients, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-10 py-3 rounded-2xl bg-[#FAF6EE] border border-[#EAE3D6] text-xs sm:text-sm text-[#261C14] focus:outline-none focus:border-[#3D5A2B] focus:ring-1 focus:ring-[#3D5A2B] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#73675C] hover:text-[#261C14]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Quick Filter Pills */}
            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterType === 'ALL'
                    ? 'bg-[#3D5A2B] text-white shadow-xs'
                    : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14]'
                }`}
              >
                All Dishes
              </button>
              <button
                type="button"
                onClick={() => setFilterType('POPULAR')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterType === 'POPULAR'
                    ? 'bg-[#3D5A2B] text-white shadow-xs'
                    : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14]'
                }`}
              >
                ★ Chef Favorites
              </button>
              <button
                type="button"
                onClick={() => setFilterType('BUDGET')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  filterType === 'BUDGET'
                    ? 'bg-[#3D5A2B] text-white shadow-xs'
                    : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14]'
                }`}
              >
                Under ₹100
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#EAE3D6] no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#3D5A2B] text-white shadow-sm'
                    : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14] hover:bg-[#F2ECE0]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count & Sort Dropdown */}
        <div className="flex items-center justify-between gap-4 mb-6 text-xs text-[#73675C]">
          <p>
            Showing <strong className="text-[#261C14]">{filteredDishes.length}</strong> delicious options
          </p>
          <div className="flex items-center gap-2">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-white border border-[#EAE3D6] text-xs font-bold text-[#261C14] focus:outline-none focus:border-[#3D5A2B]"
            >
              <option value="POPULAR">Most Popular</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Dish Grid with 3D Tilt FoodCards */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-10 h-10 border-3 border-[#3D5A2B] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-[#73675C]">Loading fresh canteen catalog...</p>
          </div>
        ) : filteredDishes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => (
              <FoodCard key={dish.id} dish={dish} />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#EAE3D6] p-8">
            <Utensils className="w-10 h-10 text-[#D48B18] mx-auto mb-3" />
            <h3 className="font-bold text-base text-[#261C14]">No dishes matched your selection</h3>
            <p className="text-xs text-[#73675C] mt-1 max-w-sm mx-auto">
              Try adjusting your category filter, clearing your search query, or viewing all dishes.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory('all');
                setSearchQuery('');
                setFilterType('ALL');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#3D5A2B] text-white text-xs font-bold hover:bg-[#2E4620] cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>

      {/* =========================================
          4. KANIGIRI CULINARY HERITAGE & TRUST
         ========================================= */}
      <section className="py-16 bg-white border-t border-[#EAE3D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-wider text-[#D48B18]">
              Culinary Philosophy
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#261C14] tracking-tight mt-1">
              Why OfficeBite Dining Excels
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#EAE3D6] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-[#261C14]">Artisan Heritage Recipes</h4>
              <p className="text-xs text-[#73675C] leading-relaxed">
                Slow-simmered gravies, hand-roasted spice masalas, and traditional clay-pot techniques inspired by Kanigiri culinary lore.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#EAE3D6] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF5E6] text-[#D48B18] flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-[#261C14]">Fresh Daily Produce</h4>
              <p className="text-xs text-[#73675C] leading-relaxed">
                Crisp farm vegetables and organic dairy sourced at daybreak. Zero artificial preservatives or frozen bases.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#EAE3D6] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF3E8] text-[#3D5A2B] flex items-center justify-center font-bold">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-[#261C14]">Zero-Wait Ordering</h4>
              <p className="text-xs text-[#73675C] leading-relaxed">
                Place your food order from your desk, track kitchen cooking status in real-time, and pick up hot without standing in lines.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-[#FAF6EE] border border-[#EAE3D6] space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#FDF5E6] text-[#D48B18] flex items-center justify-center font-bold">
                <Coffee className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-[#261C14]">Authentic Beverages</h4>
              <p className="text-xs text-[#73675C] leading-relaxed">
                Kumbakonam degree filter coffee, ginger chai, and fresh seasonal juices to keep your workdays energized.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
