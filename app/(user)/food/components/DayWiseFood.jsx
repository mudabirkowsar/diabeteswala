"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Clock,
  Flame,
  HeartPulse,
  Award,
  RefreshCw,
  Loader2,
  ArrowRight,
  ChevronRight,
  UtensilsCrossed
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500";

export default function DayWiseFood() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Data States ---
  const [daywiseData, setDaywiseData] = useState({
    categories: [],
    todaySpecials: [],
    popularMeals: [],
    recommendedMeals: []
  });
  const [loading, setLoading] = useState(true);

  // --- Filter & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Egg', 'Non Veg'

  // --- Fetch Daywise Layout Content ---
  const fetchDaywiseContent = async () => {
    setLoading(true);
    try {
      const response = await UserAPI.getUserFoodPageDaywise();
      if (response && response.success) {
        setDaywiseData(response.data || {
          categories: [],
          todaySpecials: [],
          popularMeals: [],
          recommendedMeals: []
        });
      } else {
        if (showNotification) {
          showNotification("Could not load today's menu layout.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching daily food content:", err);
      if (showNotification) {
        showNotification(err.message || "Unable to load today's food feed.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDaywiseContent();
  }, []);

  // --- Navigation Handler ---
  const handleDishClick = (id) => {
    if (!id) return;
    router.push(`/food/fooddetail/${id}`);
  };

  // --- Helper: Render Diet Badge ---
  const renderDietBadge = (type) => {
    const isVeg = type === 'Veg';
    const isEgg = type === 'Egg';
    const isNonVeg = type === 'Non Veg';

    return (
      <div
        className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 bg-white/95 shadow-sm ${isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
          }`}
        title={type}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
            }`}
        />
      </div>
    );
  };

  // --- Dish Filtering Logic ---
  const filterDishes = (dishList = []) => {
    return dishList.filter(dish => {
      const nameMatch = dish.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = dish.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const tagMatch = Array.isArray(dish.tags)
        ? dish.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
        : false;

      const matchesSearch = searchQuery.trim() === '' || nameMatch || descMatch || tagMatch;
      const matchesDiet = selectedDietType === 'All' || dish.dietType === selectedDietType;
      const matchesCategory = selectedCategory === 'All' ||
        dish.categoryId?.foodCategory === selectedCategory ||
        dish.foodEffectCategory === selectedCategory;

      return matchesSearch && matchesDiet && matchesCategory;
    });
  };

  // Category & Therapeutic Focus Chips
  const categoryChips = [
    'All',
    ...new Set(
      (daywiseData.categories || [])
        .map(c => c.foodCategory || c.foodEffectCategory)
        .filter(Boolean)
    )
  ];

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-10 antialiased">

      {/* --- SEARCH & QUICK FILTERS --- */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

          {/* Search Box */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search dishes, ingredients, or dietary tags (e.g., Quinoa, High Fiber)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Diet Type Switcher */}
          <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['All', 'Veg', 'Egg', 'Non Veg'].map((type) => {
              // Dynamic color mappings for active states
              const activeStyles = {
                All: 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black',
                Veg: 'bg-emerald-50/80 text-emerald-600 border border-emerald-100/60 font-black',
                Egg: 'bg-amber-50/80 text-amber-600 border border-amber-100/60 font-black',
                'Non Veg': 'bg-red-50/60 text-red-600 border border-red-100/60 font-black'
              };

              const isSelected = selectedDietType === type;

              return (
                <button
                  key={type}
                  onClick={() => setSelectedDietType(type)}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer border ${isSelected
                    ? activeStyles[type]
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                    }`}
                >
                  {type}
                </button>
              );
            })}
          </div>

        </div>

        {/* Category Chips Scroll */}
        {categoryChips.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden">
            {categoryChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${selectedCategory === chip
                  ? 'bg-red-50/60 text-red-600 border-red-200/60 shadow-sm shadow-red-900/5 font-black'
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* --- CONTENT FEED --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading fresh culinary feed...</p>
        </div>
      ) : (
        <div className="space-y-12">

          {/* 1. TODAY'S SPECIALS (LIMIT TO 4) */}
          {filterDishes(daywiseData.todaySpecials || []).length > 0 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-left">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-amber-500" size={20} /> Today's Featured Specials
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Fresh chef formulations currently active for today's delivery slots.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterDishes(daywiseData.todaySpecials || []).slice(0, 4).map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => handleDishClick(dish._id)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <div className="absolute top-3.5 left-3.5">{renderDietBadge(dish.dietType)}</div>

                      {dish.foodEffectCategory && (
                        <span className="absolute top-3.5 right-3.5 bg-red-50/90 backdrop-blur-sm text-red-600 border border-red-100/60 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm">
                          {dish.foodEffectCategory}
                        </span>
                      )}

                      <div className="absolute bottom-3.5 left-4 flex items-baseline gap-2 text-white">
                        <span className="text-xl font-black font-mono">₹{dish.discountPrice || dish.price}</span>
                        {dish.discountPrice && dish.price !== dish.discountPrice && (
                          <span className="text-xs text-slate-300 line-through font-mono">₹{dish.price}</span>
                        )}
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                          {dish.description}
                        </p>
                      </div>

                      {/* Nutrient Metrics */}
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100/80">
                        <span className="flex items-center gap-1.5 font-mono">
                          <Flame size={13} className="text-amber-500" /> {dish.calories || 0} Kcal
                        </span>
                        {dish.prepTime && (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <Clock size={13} /> {dish.prepTime} mins
                          </span>
                        )}
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[10px] font-black">
                          {dish.servingSize || '1 Person'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. TOP ORDERED POPULAR MEALS (LIMIT TO 4) */}
          {filterDishes(daywiseData.popularMeals || []).length > 0 && (
            <div className="space-y-5">
              <div className="text-left">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Award className="text-[#3d3f96]" size={20} /> Popular Healthy Picks
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Top-rated and most frequently ordered wellness dishes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterDishes(daywiseData.popularMeals || []).slice(0, 4).map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => handleDishClick(dish._id)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">{renderDietBadge(dish.dietType)}</div>
                      <span className="absolute bottom-3 left-4 text-white text-base font-black font-mono">
                        ₹{dish.discountPrice || dish.price}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-left">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-50">
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Flame size={12} className="text-amber-500" /> {dish.calories || 0} Kcal
                        </span>
                        {dish.foodEffectCategory && (
                          <span className="text-red-600 bg-red-50/60 border border-red-100/60 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            {dish.foodEffectCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. NUTRITIONIST RECOMMENDED MEALS (LIMIT TO 4) */}
          {filterDishes(daywiseData.recommendedMeals || []).length > 0 && (
            <div className="space-y-5">
              <div className="text-left">
                <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <HeartPulse className="text-rose-500" size={20} /> Nutritionist Recommended
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Curated formulations designed for macro and micronutrient distribution.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filterDishes(daywiseData.recommendedMeals || []).slice(0, 4).map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => handleDishClick(dish._id)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">{renderDietBadge(dish.dietType)}</div>
                      <span className="absolute bottom-3 left-4 text-white text-base font-black font-mono">
                        ₹{dish.discountPrice || dish.price}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3 text-left">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 pt-2 border-t border-slate-50">
                        <span className="flex items-center gap-1 font-mono text-slate-600">
                          <Flame size={12} className="text-amber-500" /> {dish.calories || 0} Kcal
                        </span>
                        {dish.foodEffectCategory && (
                          <span className="text-red-600 bg-red-50/60 border border-red-100/60 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                            {dish.foodEffectCategory}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* --- BOTTOM CTA: EXPLORE ALL FOOD ITEMS --- */}
      <div className="bg-gradient-to-br from-[#3d3f96] to-[#252766] rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl shadow-indigo-950/15 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-center sm:text-left">
        <div className="space-y-2 z-10 max-w-xl">
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/15">
            <UtensilsCrossed size={12} /> Comprehensive Menu Catalog
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Explore All Culinary & Wellness Dishes
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100/80 font-medium leading-relaxed">
            Browse our full nutritional inventory catalog with extended filter options for calories, allergens, and clinical diet regimes.
          </p>
        </div>

        <button
          onClick={() => router.push('/food/allfooditems')}
          className="inline-flex items-center gap-2.5 bg-white hover:bg-slate-50 text-[#3d3f96] px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer shrink-0 hover:scale-[1.02] z-10"
        >
          <span>View All Food Items</span>
          <ArrowRight size={16} />
        </button>

        {/* Background ambient lighting */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -top-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

    </div>
  );
}