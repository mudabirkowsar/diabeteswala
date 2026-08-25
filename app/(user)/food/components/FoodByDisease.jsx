"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  HeartPulse,
  Flame,
  Clock,
  Search,
  Loader2,
  Utensils,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Activity,
  MapPin
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
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function FoodByDisease() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Dynamic Data & Loading States ---
  const [diseases, setDiseases] = useState([]); // Loaded dynamically from GET /api/foodpage/effects
  const [meals, setMeals] = useState([]); // Loaded dynamically from POST /api/foodpage/nearest-meals
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({});

  // --- Filtering & Selection States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Egg', 'Non Veg'
  const [selectedFocus, setSelectedFocus] = useState('All'); // Matches foodEffectCategory string value

  // --- Retrieve Stored Coords on Mount ---
  const getInitialCoords = () => {
    let lat = 30.698383813970036;
    let lng = 76.68573589283919;

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

  // --- Fetch Dynamic Onboarding Therapy Focuses ---
  const fetchClinicalCategories = async () => {
    try {
      const response = await UserAPI.getMedicalCatgoriesAll();
      if (response && response.success) {
        setDiseases(response.data || []);
      }
    } catch (err) {
      console.error("Error loading dynamic therapeutic profiles:", err);
    }
  };

  // --- Fetch Geolocated Meals ---
  const fetchNearestMeals = async (targetCoords) => {
    setLoading(true);
    const locationPayload = targetCoords || coords;
    try {
      const response = await UserAPI.getNearestGeolocatedMeals(locationPayload);
      if (response && response.success) {
        setMeals(response.data || []);
      } else {
        if (showNotification) {
          showNotification("Unable to find active kitchen partners near you.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching nearest meals:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || "Failed to load clinical food directory.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  // Concurrent load on mount
  useEffect(() => {
    const initialCoords = getInitialCoords();
    setCoords(initialCoords);

    Promise.allSettled([
      fetchNearestMeals(initialCoords),
      fetchClinicalCategories()
    ]);
  }, []);

  // --- Silent Client-Side Fallback ---
  // If the category API is delayed or fails, parse active focuses directly from loaded meals
  useEffect(() => {
    if (meals.length > 0 && diseases.length === 0) {
      const activeMealCategories = Array.from(new Set(meals.map(m => m.foodEffectCategory).filter(Boolean)));
      const backupDiseases = activeMealCategories.map((name, index) => ({
        _id: `backup-${index}`,
        foodEffectCategory: name
      }));
      setDiseases(backupDiseases);
    }
  }, [meals, diseases]);

  // --- Card Click Navigation ---
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

  // --- Filter Matching & Limit to 4 items ---
  const filteredMeals = meals.filter((meal) => {
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = meal.name?.toLowerCase().includes(query);
    const descMatch = meal.description?.toLowerCase().includes(query);
    const vendorMatch = meal.vendorId?.name?.toLowerCase().includes(query);

    const matchesSearch = query === '' || nameMatch || descMatch || vendorMatch;
    const matchesDiet = selectedDietType === 'All' || meal.dietType === selectedDietType;

    // Matches therapeutic/disease focus category
    const matchesFocus = selectedFocus === 'All' ||
      (meal.foodEffectCategory && meal.foodEffectCategory.toLowerCase() === selectedFocus.toLowerCase());

    return matchesSearch && matchesDiet && matchesFocus;
  });

  // Limit to only 4 items
  const displayedMeals = filteredMeals.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">

      {/* Header section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100/60 text-red-600 flex items-center justify-center shadow-sm">
            <HeartPulse size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Therapeutic Focus</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">Explore dynamic health categories formulated for specific medical conditions.</p>
          </div>
        </div>
      </div>

      {/* --- CLINICAL DISEASES CATEGORY NAVBAR (DYNAMICALLY RENDERED) --- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 border-b border-slate-100 [&::-webkit-scrollbar]:hidden">
        <button
          onClick={() => setSelectedFocus('All')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${selectedFocus === 'All'
            ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm'
            : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
            }`}
        >
          🌐 All Profiles
        </button>

        {diseases.map((dis) => {
          const isSelected = selectedFocus === dis.foodEffectCategory;
          return (
            <button
              key={dis._id}
              onClick={() => setSelectedFocus(dis.foodEffectCategory)}
              className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${isSelected
                ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                }`}
            >
              {dis.foodEffectCategory}
            </button>
          );
        })}
      </div>

      {/* --- MEALS LISTING VIEW --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning local dietitian kitchens...</p>
        </div>
      ) : displayedMeals.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <Activity size={44} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Food Formulations Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            No active clinical dishes match your selections. Try choosing another medical profile or adjusting your search parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-left">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Utensils className="text-[#3d3f96]" size={18} /> Available Formulations ({displayedMeals.length})
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Showing dietitian dishes nearby formulated for {selectedFocus === 'All' ? 'all conditions' : selectedFocus}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayedMeals.map((dish) => {
              const vendor = dish.vendorId || {};
              const dishImage = getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE;
              const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;
              const isAvailable = dish.isAvailable !== false && !dish.UnavailableFoodItem;

              return (
                <div
                  key={dish._id}
                  onClick={() => handleMealClick(dish._id)}
                  className={`bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer text-left ${isAvailable
                    ? 'hover:shadow-xl hover:-translate-y-1'
                    : 'opacity-65 saturate-[0.25] border-slate-200 shadow-none'
                    }`}
                >
                  {/* Photo Container with Overlays */}
                  <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                    <img
                      src={dishImage}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    {/* Diet Badge */}
                    <div className="absolute top-3.5 left-3.5 z-20">{renderDietBadge(dish.dietType)}</div>

                    {/* Proximity Distance Pill */}
                    <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm border border-white/10 z-20">
                      <MapPin size={11} className="text-rose-400 shrink-0" />
                      <span>{dish.distanceText || `${dish.distance || 0} km`}</span>
                    </div>

                    {/* Availability Overlays */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                        <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-rose-500/50">
                          Not Available Near You
                        </span>
                      </div>
                    )}

                    {/* Price Tag Overlay */}
                    <div className="absolute bottom-3.5 left-4 flex items-baseline gap-2 text-white z-20">
                      <span className="text-xl font-black font-mono">₹{dish.discountPrice || dish.price}</span>
                      {dish.discountPrice && dish.price !== dish.discountPrice && (
                        <span className="text-xs text-slate-300 line-through font-mono">₹{dish.price}</span>
                      )}
                    </div>
                  </div>

                  {/* Body Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      {/* Kitchen / Vendor Info */}
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                        <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                          <img
                            src={kitchenImage}
                            alt={vendor.name || "Kitchen"}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 truncate" title={vendor.name}>
                          {vendor.name || "Partner Health Kitchen"}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                        {dish.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {dish.description}
                      </p>
                    </div>

                    {/* Nutrient & Metric Pills */}
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

                      {/* Therapeutic Focus Badge */}
                      {dish.foodEffectCategory && (
                        <div className="pt-1 flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-red-600 bg-red-50/60 px-2.5 py-0.5 rounded-md border border-red-100/50">
                            {dish.foodEffectCategory}
                          </span>
                          <span className="text-xs font-bold text-[#3d3f96] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            Order <ChevronRight size={14} />
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- BOTTOM PROMO BANNER: DIABETESWALA PROMOTION --- */}
      <div className="bg-gradient-to-br from-[#1c1d2d] via-[#141624] to-[#0d0f1a] rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl shadow-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-center sm:text-left border border-red-500/15">
        <div className="space-y-3 z-10 max-w-xl">
          {/* Secondary Color Badge */}
          <span className="inline-flex items-center gap-1.5 bg-red-50/60 text-red-600 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-red-200/60 shadow-sm backdrop-blur-md">
            <HeartPulse size={13} className="text-red-600" /> Powered by DiabetesWala™ Care
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Precision Nutrition for Blood Sugar by <span className="text-red-400">DiabetesWala</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Formulated by certified clinical dietitians with low glycemic index (Low-GI) grains, balanced portion macros, and zero refined sugar to help keep your glucose levels balanced.
          </p>
        </div>
        {/* Call to Action Button */}
        <button
          onClick={() => {
            router.push('/food/allfooditems');
          }}
          className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0 hover:scale-[1.02] z-10"
        >
          <span>Explore DiabetesWala Meals</span>
          <ArrowRight size={16} />
        </button>

        {/* Ambient background blur accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -top-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

    </div>
  );
}