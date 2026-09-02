"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Flame,
  Loader2,
  Utensils,
  ChevronRight,
  MapPin,
  Star,
  Activity,
  Sparkles,
  ArrowRight
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

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
];

export default function Weekly() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Dynamic API Data States ---
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [nearestVendor, setNearestVendor] = useState(null);
  const [maxDistance, setMaxDistance] = useState("10 km");
  const [loading, setLoading] = useState(true);

  // --- Navigation & Filtering States ---
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('monday');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [coords, setCoords] = useState({ lat: 30.7046, lng: 76.7179 });

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

  // --- Fetch Weekly Menu Content from API ---
  const fetchWeeklyMenu = useCallback(async (targetCoords) => {
    setLoading(true);
    const locationPayload = targetCoords || coords;

    try {
      // POST /api/foodpage/weekly
      const response = await UserAPI.getUserFoodPageWeeklyMenu(locationPayload, { page: 1, limit: 10 });
      if (response && response.success) {
        setWeeklyMenu(response.data || []);
        setCategories(response.categories || []);
        setNearestVendor(response.nearestVendor || null);
        if (response.maxDistanceLimitApplied) {
          setMaxDistance(response.maxDistanceLimitApplied);
        }
      } else {
        if (showNotification) {
          showNotification("Unable to load weekly cyclical menu.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching weekly food content:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to load weekly menu.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [coords, showNotification]);

  useEffect(() => {
    const initialCoords = getInitialCoords();
    setCoords(initialCoords);
    fetchWeeklyMenu(initialCoords);
  }, []);

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

  // Extract Category Chips from response
  const categoryChips = [
    'All',
    ...new Set(
      categories
        .map(c => c.foodCategory || c.foodEffectCategory)
        .filter(Boolean)
    )
  ];

  // Resolve meals for currently active day
  const currentDayPlan = weeklyMenu.find(d => d.dayOfWeek?.toLowerCase() === selectedWeeklyDay);
  const rawMeals = currentDayPlan?.meals || [];

  // Filter by selected category chip if active
  const filteredMeals = rawMeals.filter(meal => {
    if (selectedCategory === 'All') return true;
    return (
      meal.foodEffectCategory === selectedCategory ||
      meal.categoryId?.foodCategory === selectedCategory
    );
  });

  return (
    <div className="space-y-6 text-left antialiased select-none">

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
                {nearestVendor.rating > 0 && (
                  <span className="flex items-center gap-1 text-[11px] font-black text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                    <Star size={11} className="fill-amber-500 text-amber-500" /> {nearestVendor.rating}
                  </span>
                )}
              </div>
              <h3 className="text-sm font-black text-slate-800 tracking-tight truncate">{nearestVendor.name}</h3>
              <p className="text-[11px] text-slate-400 font-bold truncate max-w-sm">{nearestVendor.address || "Local Delivery Partner"}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
            <MapPin size={13} className="text-red-500 shrink-0" />
            <span className="text-xs font-black text-slate-700 font-mono">
              {nearestVendor.distanceText || `${nearestVendor.distance || 0} km`} away
            </span>
          </div>
        </div>
      )}

      {/* --- PLANNER HEADER BANNER --- */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="text-red-500" size={20} /> 7-Day Cyclical Tiffin Menu Planner
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Explore rotating healthy meals scheduled across each weekday within {maxDistance}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50/80 border border-red-200/60 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live 7-Day Menu Cycle
          </span>
        </div>
      </div>

      {/* --- WEEKDAY SWITCHER TABS --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
        {WEEKDAYS.map((day) => {
          const dayData = weeklyMenu.find(d => d.dayOfWeek?.toLowerCase() === day.key);
          const count = dayData?.mealsCount !== undefined ? dayData.mealsCount : (dayData?.meals?.length || 0);
          const isSelected = selectedWeeklyDay === day.key;

          return (
            <button
              key={day.key}
              onClick={() => setSelectedWeeklyDay(day.key)}
              className={`flex-1 min-w-[105px] sm:min-w-[135px] p-3 rounded-2xl border transition-all cursor-pointer text-center ${
                isSelected
                  ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                  : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
              }`}
            >
              <span className="block text-xs font-black uppercase tracking-wider">{day.label}</span>
              <span className={`text-[10px] font-bold mt-0.5 block ${isSelected ? 'text-red-100' : 'text-slate-400'}`}>
                {count} {count === 1 ? 'Meal' : 'Meals'}
              </span>
            </button>
          );
        })}
      </div>

      {/* --- DYNAMIC CATEGORY FILTER CHIPS --- */}
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
                    : 'bg-white text-slate-600 border-slate-100 hover:bg-slate-50'
                }`}
              >
                {chip === 'All' ? '🌐 All Profiles' : chip}
              </button>
            );
          })}
        </div>
      )}

      {/* --- CONTENT / LOADING / GRID VIEW --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading weekly cyclical menu...
          </p>
        </div>
      ) : filteredMeals.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm border-dashed p-8">
          <Utensils size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">
            No Meals Scheduled for {selectedWeeklyDay.toUpperCase()}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Our clinical nutritionist has not listed dishes for this day or under the selected category. Check back soon for schedule updates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMeals.map((meal) => (
            <div
              key={meal._id}
              onClick={() => handleMealClick(meal._id)}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer text-left"
            >
              {/* Photo Banner */}
              <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                <img
                  src={getMediaUrl(meal.imageUrl) || PLACEHOLDER_IMAGE}
                  alt={meal.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Diet Badge */}
                <div className="absolute top-3.5 left-3.5 z-10">{renderDietBadge(meal.dietType)}</div>
                
                {/* Effect Category Badge */}
                {meal.foodEffectCategory && (
                  <span className="absolute top-3.5 right-3.5 bg-red-50/95 backdrop-blur-sm text-red-600 border border-red-200/60 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm z-10">
                    {meal.foodEffectCategory}
                  </span>
                )}

                {/* Price Tag Overlay */}
                <div className="absolute bottom-3.5 left-4 flex items-baseline gap-2 text-white z-10">
                  <span className="text-xl font-black font-mono">₹{meal.discountPrice || meal.price}</span>
                  {meal.discountPrice && meal.price !== meal.discountPrice && (
                    <span className="text-xs text-slate-300 line-through font-mono">₹{meal.price}</span>
                  )}
                </div>
              </div>

              {/* Body Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
                    {meal.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                    {meal.description || `Cyclical healthy recipe for ${selectedWeeklyDay.toUpperCase()} subscription.`}
                  </p>
                </div>

                {/* Metric & Order bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="flex items-center gap-1 font-mono">
                      <Flame size={12} className="text-amber-500" /> {meal.calories || 0} Kcal
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[10px] font-black">
                      Daily Portion
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400">
                      {selectedWeeklyDay.toUpperCase()} Schedule
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
      )}

    </div>
  );
}