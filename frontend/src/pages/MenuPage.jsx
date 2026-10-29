import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  X,
  Filter,
  CheckCircle2,
  Clock,
  Star,
  AlertTriangle,
  RefreshCw,
  Server,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { CATEGORIES, MENU_ITEMS } from '../data/mockData';
import { FoodCard } from '../components/common/FoodCard';
import { getMenuCatalog, API_BASE_URL } from '../services/api';

/**
 * Customer Royal Menu Page
 * Themed with warm cream, white, olive green (#3D5A2B), saffron gold (#D48B18), and dark brown (#261C14).
 */
export const MenuPage = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('loading');

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [sortBy, setSortBy] = useState('RATING');

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
        reviewsCount: item.reviewsCount || 120,
        prepTime: item.prepTime || '10-15 mins',
        calories: item.calories || '450 kcal',
        badge: item.badge || '',
        isPopular: item.isPopular !== undefined ? item.isPopular : (item.popular ?? false),
      }));
      setMenuItems(normalized);
      setDataSource('backend');
    } catch (err) {
      console.error('Failed to fetch from backend, loading fallback catalog:', err);
      setMenuItems(MENU_ITEMS);
      setDataSource('offline_fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const filteredDishes = useMemo(() => {
    return menuItems
      .filter((dish) => {
        if (selectedCategory !== 'all' && dish.category !== selectedCategory) {
          return false;
        }
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const matchesName = dish.name.toLowerCase().includes(query);
          const matchesDesc = dish.description.toLowerCase().includes(query);
          const matchesCat = (dish.categoryName || '').toLowerCase().includes(query);
          if (!matchesName && !matchesDesc && !matchesCat) return false;
        }
        if (filterType === 'POPULAR' && !dish.isPopular) return false;
        if (filterType === 'BUDGET' && dish.price > 100) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.price - b.price;
        if (sortBy === 'PRICE_DESC') return b.price - a.price;
        if (sortBy === 'NAME') return a.name.localeCompare(b.name);
        return b.rating - a.rating;
      });
  }, [menuItems, selectedCategory, searchQuery, filterType, sortBy]);

  return (
    <div className="min-h-screen py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-[#261C14]">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-black uppercase tracking-wider text-[#D48B18] bg-[#FDF5E6] border border-[#F8E3BA] px-3.5 py-1 rounded-full">
          Canteen Royal Catalog
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-[#261C14] tracking-tight mt-2.5">
          Explore All Dishes
        </h1>
        <p className="text-xs sm:text-sm text-[#73675C] mt-1.5 leading-relaxed">
          Artisan South Indian breakfasts, executive thalis, slow-cooked biryanis, and invigorating degree filter coffee.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#EAE3D6] shadow-sm mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-[#73675C] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes (e.g. Dosa, Thali, Biryani, Coffee...)"
              className="w-full bg-[#FAF6EE] border border-[#EAE3D6] rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-[#261C14] placeholder:text-[#73675C] focus:outline-none focus:border-[#3D5A2B] focus:ring-1 focus:ring-[#3D5A2B]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#73675C] hover:text-[#261C14] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'ALL'
                  ? 'bg-[#3D5A2B] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14]'
              }`}
            >
              All Items
            </button>
            <button
              type="button"
              onClick={() => setFilterType('POPULAR')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                filterType === 'POPULAR'
                  ? 'bg-[#3D5A2B] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14]'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#D48B18]" />
              <span>Bestsellers</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterType('BUDGET')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === 'BUDGET'
                  ? 'bg-[#3D5A2B] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14]'
              }`}
            >
              Quick Bites (&lt; ₹100)
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#FAF6EE] border border-[#EAE3D6] rounded-xl px-3 py-2.5 text-xs font-bold text-[#261C14] cursor-pointer focus:outline-none focus:border-[#3D5A2B]"
            >
              <option value="RATING">Highest Rated</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="NAME">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-[#EAE3D6] no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-[#3D5A2B] text-white shadow-xs'
                  : 'bg-[#FAF6EE] text-[#73675C] hover:text-[#261C14] hover:bg-[#F2ECE0]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#3D5A2B] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-[#73675C]">Loading fresh dishes from kitchen...</p>
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
          <h3 className="font-bold text-base text-[#261C14]">No dishes found</h3>
          <p className="text-xs text-[#73675C] mt-1">Try another category or clear your search term.</p>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
