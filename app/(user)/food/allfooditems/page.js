"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Search,
  Clock,
  Flame,
  Layers,
  HeartPulse,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  Loader2,
  Utensils,
  Award,
  Check,
  ShoppingBag,
  SlidersHorizontal
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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400";

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
];

export default function FoodList() {
  const { showNotification } = useNotification();

  // --- View Mode ---
  const [activeTab, setActiveTab] = useState('discovery'); // 'discovery' or 'weekly'

  // --- Data States ---
  const [daywiseData, setDaywiseData] = useState({
    categories: [],
    todaySpecials: [],
    popularMeals: [],
    recommendedMeals: []
  });
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Egg', 'Non Veg'
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('monday');

  // --- Modal / Detail State ---
  const [selectedMeal, setSelectedMeal] = useState(null);

  // --- Fetch Daywise & Weekly Layout Content ---
  const fetchPageContent = async () => {
    setLoading(true);
    try {
      const [daywiseRes, weeklyRes] = await Promise.allSettled([
        UserAPI.getUserFoodPageDaywise(),
        UserAPI.getUserFoodPageWeeklyMenu()
      ]);

      if (daywiseRes.status === 'fulfilled' && daywiseRes.value?.success) {
        setDaywiseData(daywiseRes.value.data || {
          categories: [],
          todaySpecials: [],
          popularMeals: [],
          recommendedMeals: []
        });
      }

      if (weeklyRes.status === 'fulfilled' && weeklyRes.value?.success) {
        setWeeklyMenu(weeklyRes.value.data || []);
      }
    } catch (err) {
      console.error("Error fetching food discovery content:", err);
      if (showNotification) {
        showNotification(err.message || "Unable to load food menu. Please refresh.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPageContent();
  }, []);

  // --- Helper: Render Diet Badge ---
  const renderDietBadge = (type) => {
    const isVeg = type === 'Veg';
    const isEgg = type === 'Egg';
    const isNonVeg = type === 'Non Veg';

    return (
      <div 
        className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 bg-white/90 shadow-sm ${
          isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
        }`}
        title={type}
      >
        <span 
          className={`w-1.5 h-1.5 rounded-full ${
            isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
          }`} 
        />
      </div>
    );
  };

  // --- Filter matching for dishes ---
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

  // Extract distinct category & effect chips
  const categoryChips = [
    'All',
    ...new Set(
      (daywiseData.categories || [])
        .map(c => c.foodCategory || c.foodEffectCategory)
        .filter(Boolean)
    )
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 py-6 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-8 antialiased">

      {/* --- HERO & TOP DISCOVERY HEADER --- */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-3 z-10 max-w-2xl text-left">
          <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-[#3d3f96] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-100/60">
            <Sparkles size={12} /> Healthy Meal Discovery
          </span>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Nutritious Chef-Prepared Meals & Clinical Tiffins
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            Personalized calorie-counted meal plans calibrated for Weight Management, Diabetes, PCOS, and Cardiovascular health.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60 self-start md:self-auto shrink-0 z-10 shadow-inner">
          <button
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'discovery'
                ? 'bg-white text-[#3d3f96] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Utensils size={15} /> Daily Specials
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'weekly'
                ? 'bg-white text-[#3d3f96] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar size={15} /> Weekly Tiffin Planner
          </button>
        </div>

        {/* Decorative background accent */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* --- SEARCH & QUICK FILTERS ROW --- */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search dishes, ingredients, or healthy tags (e.g. Quinoa, High Protein)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Diet Type Switch */}
          <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['All', 'Veg', 'Egg', 'Non Veg'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDietType(type)}
                className={`flex-1 py-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer ${
                  selectedDietType === type
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

        </div>

        {/* Category Scrollable Chips */}
        {categoryChips.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 [&::-webkit-scrollbar]:hidden">
            {categoryChips.map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedCategory(chip)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  selectedCategory === chip
                    ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm'
                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* =========================================================================
          VIEW 1: TODAY'S SPECIALS & DISCOVERY FEED
          ========================================================================= */}
      {activeTab === 'discovery' ? (
        <div className="space-y-10">
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Preparing fresh menu feed...</p>
            </div>
          ) : (
            <>
              {/* SECTION A: TODAY'S SPECIALS CAROUSEL / GRID */}
              {filterDishes(daywiseData.todaySpecials || []).length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <Sparkles className="text-amber-500" size={18} /> Today's Featured Recommendations
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">
                        Freshly prepared chef selections active for today's delivery slots.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filterDishes(daywiseData.todaySpecials || []).map((dish) => (
                      <div
                        key={dish._id}
                        onClick={() => setSelectedMeal(dish)}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                      >
                        <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                          <img
                            src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                            alt={dish.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                          <div className="absolute top-3 left-3">{renderDietBadge(dish.dietType)}</div>
                          
                          {dish.foodEffectCategory && (
                            <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#3d3f96] px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm">
                              {dish.foodEffectCategory}
                            </span>
                          )}

                          <div className="absolute bottom-3 left-4 flex items-baseline gap-1.5 text-white">
                            <span className="text-lg font-black font-mono">₹{dish.discountPrice || dish.price}</span>
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
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                              {dish.description}
                            </p>
                          </div>

                          {/* Quick Nutrient Bar */}
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="flex items-center gap-1">
                              <Flame size={12} className="text-amber-500" /> {dish.calories || 0} Kcal
                            </span>
                            {dish.prepTime && (
                              <span className="flex items-center gap-1">
                                <Clock size={12} className="text-slate-400" /> {dish.prepTime} mins
                              </span>
                            )}
                            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-extrabold">
                              {dish.servingSize || '1 Person'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION B: POPULAR MEALS */}
              {filterDishes(daywiseData.popularMeals || []).length > 0 && (
                <div className="space-y-4">
                  <div className="text-left">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <Award className="text-[#3d3f96]" size={18} /> Top Ordered Healthy Meals
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Most loved calorie-controlled dishes ordered this week.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filterDishes(daywiseData.popularMeals || []).map((dish) => (
                      <div
                        key={dish._id}
                        onClick={() => setSelectedMeal(dish)}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
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

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                              {dish.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {dish.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-50">
                            <span>{dish.calories || 0} Kcal</span>
                            {dish.foodEffectCategory && (
                              <span className="text-[#3d3f96] font-extrabold">{dish.foodEffectCategory}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION C: NUTRITIONIST RECOMMENDED MEALS */}
              {filterDishes(daywiseData.recommendedMeals || []).length > 0 && (
                <div className="space-y-4">
                  <div className="text-left">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <HeartPulse className="text-rose-500" size={18} /> Nutritionist Recommended
                    </h2>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                      Specially curated for balanced macro and micronutrient distribution.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filterDishes(daywiseData.recommendedMeals || []).map((dish) => (
                      <div
                        key={dish._id}
                        onClick={() => setSelectedMeal(dish)}
                        className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
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

                        <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                          <div>
                            <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                              {dish.name}
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {dish.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-2 border-t border-slate-50">
                            <span>{dish.calories || 0} Kcal</span>
                            {dish.foodEffectCategory && (
                              <span className="text-[#3d3f96] font-extrabold">{dish.foodEffectCategory}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        /* =========================================================================
            VIEW 2: WEEKLY TIFFIN SUBSCRIPTION PLANNER (7-DAY VIEW)
            ========================================================================= */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar className="text-[#3d3f96]" size={18} /> 7-Day Cyclical Tiffin Menu Planner
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Explore the daily repeating menu schedule included with your tiffin subscription.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-black px-3 py-1.5 rounded-xl border border-emerald-100">
                Active Weekly Cycle
              </span>
            </div>
          </div>

          {/* Weekday Switcher Tabs for Mobile/Desktop */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
            {WEEKDAYS.map((day) => {
              const dayData = weeklyMenu.find(d => d.dayOfWeek?.toLowerCase() === day.key);
              const count = dayData?.meals?.length || 0;
              const isSelected = selectedWeeklyDay === day.key;

              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedWeeklyDay(day.key)}
                  className={`flex-1 min-w-[100px] sm:min-w-[130px] p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                    isSelected
                      ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md shadow-indigo-500/10'
                      : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-xs font-black uppercase">{day.label}</span>
                  <span className={`text-[10px] font-semibold mt-0.5 block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {count} {count === 1 ? 'Meal' : 'Meals'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Selected Day Meals Grid */}
          {(() => {
            const currentDayPlan = weeklyMenu.find(d => d.dayOfWeek?.toLowerCase() === selectedWeeklyDay);
            const meals = currentDayPlan?.meals || [];

            return meals.length === 0 ? (
              <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm border-dashed">
                <Utensils size={40} className="mx-auto text-slate-200 mb-3" />
                <p className="text-sm font-bold text-slate-700">No meals scheduled for {selectedWeeklyDay.toUpperCase()}.</p>
                <p className="text-xs text-slate-400 mt-1">Check back later as our nutritionist updates the subscription cycle.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {meals.map((meal) => (
                  <div
                    key={meal._id}
                    onClick={() => setSelectedMeal(meal)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(meal.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={meal.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">{renderDietBadge(meal.dietType)}</div>
                      <span className="absolute bottom-3 left-4 text-white text-base font-black font-mono">
                        ₹{meal.price}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 text-left">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {meal.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1">
                          Included with daily {selectedWeeklyDay.toUpperCase()} subscription.
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-1 font-mono">
                          <Flame size={12} className="text-amber-500" /> {meal.calories || 0} Kcal
                        </span>
                        <span className="text-[#3d3f96] font-bold">Standard Portion</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* =========================================================================
          MODAL: FULL MEAL DETAIL INSPECTION OVERLAY
          ========================================================================= */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left">
            <button
              onClick={() => setSelectedMeal(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-6">
              {/* Image banner */}
              <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={getMediaUrl(selectedMeal.imageUrl) || PLACEHOLDER_IMAGE}
                  alt={selectedMeal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
                <div className="absolute top-4 left-4">{renderDietBadge(selectedMeal.dietType)}</div>
                {selectedMeal.foodEffectCategory && (
                  <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#3d3f96] px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm">
                    {selectedMeal.foodEffectCategory}
                  </span>
                )}
              </div>

              {/* Title & Pricing */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedMeal.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                    {selectedMeal.categoryId?.foodCategory || "Healthy Recipe"}
                  </p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 font-mono">
                    ₹{selectedMeal.discountPrice || selectedMeal.price}
                  </span>
                  {selectedMeal.discountPrice && selectedMeal.price !== selectedMeal.discountPrice && (
                    <span className="text-sm text-slate-400 line-through font-mono">₹{selectedMeal.price}</span>
                  )}
                </div>
              </div>

              {/* Description */}
              {selectedMeal.description && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1">Recipe Overview</h4>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {selectedMeal.description}
                  </p>
                </div>
              )}

              {/* Key Nutrients Grid */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Energy</span>
                  <strong className="text-xs text-slate-800 font-mono">{selectedMeal.calories || 0} Kcal</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Prep Time</span>
                  <strong className="text-xs text-slate-800 font-mono">{selectedMeal.prepTime || 15} Mins</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Serving</span>
                  <strong className="text-xs text-slate-800 font-mono">{selectedMeal.servingSize || '1 Person'}</strong>
                </div>
              </div>

              {/* Ingredients List */}
              {selectedMeal.ingredients && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Active Ingredients</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedMeal.ingredients) ? selectedMeal.ingredients : selectedMeal.ingredients.split(',')).map((ing, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-lg">
                        {typeof ing === 'string' ? ing.trim() : ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedMeal.tags && (
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Dietary Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(Array.isArray(selectedMeal.tags) ? selectedMeal.tags : selectedMeal.tags.split(',')).map((tag, idx) => (
                      <span key={idx} className="bg-indigo-50/70 text-[#3d3f96] border border-indigo-100/50 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md">
                        {typeof tag === 'string' ? tag.trim() : tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}