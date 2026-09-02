"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Search,
  Clock,
  Flame,
  Award,
  HeartPulse,
  Loader2,
  Utensils,
  ChevronRight,
  MapPin,
  Star,
  Activity,
  Store
} from 'lucide-react';

// Adjust relative path as needed based on your folder structure
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

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
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function AllFood() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Dynamic API Data States ---
  const [daywiseData, setDaywiseData] = useState({
    categories: [],
    todaySpecials: [],
    popularMeals: [],
    recommendedMeals: [],
    nearestVendor: null,
    pagination: null
  });
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 30.7046, lng: 76.7179 });

  // --- Filter & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Egg', 'Non Veg'

  // --- Retrieve Stored Coords on Mount ---
  const getInitialCoords = () => {
    let lat = 30.7046;
    let lng = 76.7179;

    if (typeof window !== "undefined") {
      const savedCoords = localStorage.getItem("userCoords");
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed.lat !== undefined && parsed.lng !== undefined) {
            lat = Number(parsed.lat);
            lng = Number(parsed.lng);
          }
        } catch (e) {
          console.error("Error reading stored user coordinates:", e);
        }
      }
    }
    return { lat, lng };
  };

  // --- Fetch Daywise Layout Content via Backend API ---
  const fetchDaywiseContent = useCallback(async (currentCoords, queryText, diet) => {
    setLoading(true);
    const locationPayload = currentCoords || coords;

    // Build backend query parameters
    const params = {
      page: 1,
      limit: 20
    };

    if (queryText && queryText.trim() !== '') {
      params.search = queryText.trim();
    }

    if (diet && diet !== 'All') {
      params.dietType = diet;
    }

    try {
      // POST /api/foodpage/daywise with location in body and filters in params
      const response = await UserAPI.getUserFoodPageDaywise(locationPayload, params);
      if (response && response.success) {
        setDaywiseData(response.data || {
          categories: [],
          todaySpecials: [],
          popularMeals: [],
          recommendedMeals: [],
          nearestVendor: null,
          pagination: null
        });
      } else {
        if (showNotification) {
          showNotification("Unable to load daily menu data.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching daywise food content:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to load food menu.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [coords, showNotification]);

  // Initial Load with Coordinates
  useEffect(() => {
    const initialCoords = getInitialCoords();
    setCoords(initialCoords);
    fetchDaywiseContent(initialCoords, searchQuery, selectedDietType);
  }, []);

  // Debounced Search & Dietary Switch Handler
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDaywiseContent(coords, searchQuery, selectedDietType);
    }, 350);

    return () => clearTimeout(handler);
  }, [searchQuery, selectedDietType, fetchDaywiseContent, coords]);

  // --- Navigation Handler to Food Details ---
  const handleMealClick = (id) => {
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
        className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 bg-white/95 shadow-sm ${
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

  // --- Client-side Category matching (if Category chip clicked) ---
  const applyCategoryFilter = (dishList = []) => {
    if (selectedCategory === 'All') return dishList;
    return dishList.filter(dish => 
      dish.categoryId?.foodCategory === selectedCategory ||
      dish.foodEffectCategory === selectedCategory
    );
  };

  // Extract distinct category & effect chips from API response
  const categoryChips = [
    'All',
    ...new Set(
      (daywiseData.categories || [])
        .map(c => c.foodCategory || c.foodEffectCategory)
        .filter(Boolean)
    )
  ];

  const filteredSpecials = applyCategoryFilter(daywiseData.todaySpecials || []);
  const filteredPopular = applyCategoryFilter(daywiseData.popularMeals || []);
  const filteredRecommended = applyCategoryFilter(daywiseData.recommendedMeals || []);

  const nearestVendor = daywiseData.nearestVendor;

  return (
    <div className="space-y-8 text-left antialiased select-none">
      
      {/* --- NEAREST CLOUD KITCHEN INFO BANNER --- */}
      {nearestVendor && (
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
              <img
                src={getMediaUrl(nearestVendor.profileImage) || KITCHEN_PLACEHOLDER}
                alt={nearestVendor.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
              />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-red-600 bg-red-50/80 border border-red-200/60 px-2 py-0.5 rounded-md">
                  Active Cloud Kitchen
                </span>
                {nearestVendor.rating && (
                  <span className="flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {nearestVendor.rating}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight truncate">{nearestVendor.name}</h3>
              <p className="text-[11px] text-slate-400 font-bold truncate max-w-sm">{nearestVendor.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
            <MapPin size={13} className="text-red-500 shrink-0" />
            <span className="text-xs font-black text-slate-700 font-mono">
              {nearestVendor.distanceText || `${nearestVendor.distance} km`} away
            </span>
          </div>
        </div>
      )}

      {/* --- SEARCH & CLINICAL FILTERS ROW --- */}
      <div className="bg-white rounded-[2rem] p-4 sm:p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search Box */}
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search clinical dishes, ingredients, tags (e.g. Salad, Quinoa, Low-GI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/60 rounded-2xl text-xs font-bold text-slate-800 outline-none focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-400 transition-all shadow-inner placeholder:text-slate-400"
            />
          </div>

          {/* Diet Type Switch */}
          <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/60">
            {['All', 'Veg', 'Egg', 'Non Veg'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDietType(type)}
                className={`flex-1 py-2 text-[11px] font-black rounded-xl transition-all cursor-pointer ${
                  selectedDietType === type
                    ? 'bg-red-500 text-white shadow-sm shadow-red-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
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
            {categoryChips.map((chip) => {
              const isSelected = selectedCategory === chip;
              return (
                <button
                  key={chip}
                  onClick={() => setSelectedCategory(chip)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-red-50 text-red-600 border-red-200 font-black shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {chip === 'All' ? '🌐 All Categories' : chip}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* --- CONTENT FEED --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning local dietitian cloud kitchens...</p>
        </div>
      ) : filteredSpecials.length === 0 && filteredPopular.length === 0 && filteredRecommended.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <Activity size={44} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Food Formulations Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            No dishes match your search or dietary filter. Try clearing your search parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-10">

          {/* SECTION A: TODAY'S SPECIALS */}
          {filteredSpecials.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Sparkles className="text-red-500" size={18} /> Today's Featured Formulations ({filteredSpecials.length})
                  </h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">
                    Freshly prepared clinical dietitian selections active for today's delivery slots.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSpecials.map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => handleMealClick(dish._id)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    {/* Visual Photo */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 z-10">{renderDietBadge(dish.dietType)}</div>
                      
                      {dish.foodEffectCategory && (
                        <span className="absolute top-3.5 right-3.5 bg-red-50/95 backdrop-blur-sm text-red-600 border border-red-200/60 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm z-10">
                          {dish.foodEffectCategory}
                        </span>
                      )}

                      {/* Price Tag Overlay */}
                      <div className="absolute bottom-3.5 left-4 flex items-baseline gap-2 text-white z-10">
                        <span className="text-xl font-black font-mono">₹{dish.discountPrice || dish.price}</span>
                        {dish.discountPrice && dish.price !== dish.discountPrice && (
                          <span className="text-xs text-slate-300 line-through font-mono">₹{dish.price}</span>
                        )}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {dish.description}
                        </p>
                      </div>

                      {/* Nutrient & Metric Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                          <span className="flex items-center gap-1 font-mono">
                            <Flame size={12} className="text-amber-500" /> {dish.calories || 0} Kcal
                          </span>
                          {dish.prepTime && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock size={12} /> {dish.prepTime} mins
                            </span>
                          )}
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-black">
                            {dish.servingSize || '1 Person'}
                          </span>
                        </div>

                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-slate-400">
                            {dish.categoryId?.foodCategory || "Therapeutic Meal"}
                          </span>
                          <span className="text-xs font-bold text-[#3d3f96] group-hover:text-red-600 group-hover:translate-x-1 transition-all flex items-center gap-0.5">
                            Order <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION B: POPULAR MEALS */}
          {filteredPopular.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Award className="text-red-500" size={18} /> Top Ordered Clinical Meals ({filteredPopular.length})
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Most loved calorie-controlled formulations ordered by subscribers this week.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPopular.map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => handleMealClick(dish._id)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 z-10">{renderDietBadge(dish.dietType)}</div>
                      
                      <span className="absolute bottom-3 left-4 text-white text-lg font-black font-mono z-10">
                        ₹{dish.discountPrice || dish.price}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-mono">
                          <Flame size={12} className="text-amber-500" /> {dish.calories || 0} Kcal
                        </span>
                        {dish.foodEffectCategory && (
                          <span className="text-red-600 bg-red-50/60 border border-red-100 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
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

          {/* SECTION C: NUTRITIONIST RECOMMENDED MEALS */}
          {filteredRecommended.length > 0 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <HeartPulse className="text-red-500" size={18} /> Nutritionist Recommended ({filteredRecommended.length})
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                  Specially curated for balanced macro and glycemic control.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredRecommended.map((dish) => (
                  <div
                    key={dish._id}
                    onClick={() => handleMealClick(dish._id)}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={dish.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-3 left-3 z-10">{renderDietBadge(dish.dietType)}</div>
                      
                      <span className="absolute bottom-3 left-4 text-white text-lg font-black font-mono z-10">
                        ₹{dish.discountPrice || dish.price}
                      </span>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
                          {dish.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                          {dish.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1 font-mono">
                          <Flame size={12} className="text-amber-500" /> {dish.calories || 0} Kcal
                        </span>
                        {dish.foodEffectCategory && (
                          <span className="text-red-600 bg-red-50/60 border border-red-100 px-2 py-0.5 rounded-md text-[10px] font-black uppercase">
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

    </div>
  );
}