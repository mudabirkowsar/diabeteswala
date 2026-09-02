"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  MapPin,
  Calendar,
  Layers,
  Clock,
  Loader2,
  Utensils,
  ChevronRight,
  ShieldCheck,
  Activity,
  ArrowRight,
  Flame,
  Star,
  Sparkles
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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function AllTiffins() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Data & Loading States ---
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({ lat: 30.7046, lng: 76.7179 });
  const [maxDistance, setMaxDistance] = useState("10 km");

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

  // --- Fetch Nearest Tiffin Plans from API ---
  const fetchTiffinPlans = async (targetCoords) => {
    setLoading(true);
    const locationPayload = targetCoords || coords;

    try {
      const response = await UserAPI.getNearestTiffinPlans(locationPayload, { page: 1, limit: 20 });
      if (response && response.success) {
        setPlans(response.data || []);
        if (response.maxDistanceLimitApplied) {
          setMaxDistance(response.maxDistanceLimitApplied);
        }
      } else {
        if (showNotification) {
          showNotification("Unable to load nearby tiffin plans.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching nearest tiffin plans:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to load clinical tiffins.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCoords = getInitialCoords();
    setCoords(initialCoords);
    fetchTiffinPlans(initialCoords);
  }, []);

  // --- Card Click Navigation to Detail Page ---
  const handlePlanClick = (id) => {
    if (!id) return;
    router.push(`/food/tiffindetail/${id}`);
  };

  // --- Helper: Render Diet Badge ---
  const renderDietBadge = (type) => {
    const isVeg = type === 'Veg';
    const isEgg = type === 'Egg';
    const isNonVeg = type === 'Non Veg';

    return (
      <div 
        className={`w-3.5 h-3.5 border rounded flex items-center justify-center p-[1.5px] shrink-0 bg-white/95 shadow-xs ${
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

  return (
    <div className="space-y-6 text-left antialiased select-none">
      
      {/* Header section bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <ChefHat className="text-red-500" size={20} /> Curated Clinical Tiffin Subscriptions ({plans.length})
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Dietitian-formulated cyclical meal subscriptions delivered fresh within {maxDistance}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50/80 border border-red-200/60 px-3 py-1.5 rounded-xl shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Active Delivery Radius ({maxDistance})
          </span>
        </div>
      </div>

      {/* --- PLANS GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Scanning local dietitian cloud kitchens for tiffin plans...
          </p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <Activity size={44} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Nearby Tiffin Plans Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            We could not find active subscription tiffins in your current delivery radius ({maxDistance}). Check back soon for cloud kitchen expansions.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const vendor = plan.vendorId || {};
            const firstDish = plan.dishPool?.[0] || {};
            const bannerImage = getMediaUrl(plan.imageUrl || firstDish.imageUrl) || PLACEHOLDER_IMAGE;
            const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;
            const isAvailable = plan.isAvailable !== false && !plan.UnavailablePlan;

            return (
              <div
                key={plan._id}
                onClick={() => handlePlanClick(plan._id)}
                className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer text-left ${
                  isAvailable
                    ? 'hover:shadow-xl hover:-translate-y-1'
                    : 'opacity-65 saturate-[0.25] border-slate-200 shadow-none'
                }`}
              >
                <div>
                  {/* Photo Visual Banner */}
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={bannerImage}
                      alt={plan.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                    {/* Left Top Cycle & Plan ID Badges */}
                    <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5">
                      <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-wider border border-white/10 flex items-center gap-1">
                        <Calendar size={11} className="text-amber-400" />
                        {plan.planCycle || "Weekly Cycle"}
                      </span>
                      {plan.planId && (
                        <span className="bg-red-500/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-xs">
                          {plan.planId}
                        </span>
                      )}
                    </div>

                    {/* Distance Tag */}
                    <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm border border-white/10 z-20">
                      <MapPin size={11} className="text-red-400 shrink-0" />
                      <span>{plan.distanceText || `${plan.distance || 0} km`}</span>
                    </div>

                    {/* Proximity Availability Overlay */}
                    {!isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                        <span className="bg-red-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-red-500/50">
                          Not Available Near You
                        </span>
                      </div>
                    )}

                    {/* Price Overlay */}
                    <div className="absolute bottom-3.5 left-4 flex items-baseline gap-1.5 text-white z-20">
                      <span className="text-2xl font-black font-mono">₹{plan.price}</span>
                      <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">
                        / {plan.planCycle?.includes('Month') ? 'month' : 'cycle'}
                      </span>
                    </div>

                    {/* Meals Per Day Pill */}
                    <div className="absolute bottom-3.5 right-4 z-20">
                      <span className="bg-emerald-500/95 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-emerald-400/30">
                        {plan.mealsPerDay || 1} Meal{plan.mealsPerDay > 1 ? 's' : ''} / Day
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-4">
                    
                    {/* Kitchen / Vendor Info */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60">
                          <img
                            src={kitchenImage}
                            alt={vendor.name || "Kitchen"}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-slate-500 truncate max-w-[170px]" title={vendor.name}>
                          {vendor.name || "Partner Health Kitchen"}
                        </span>
                      </div>

                      {vendor.rating > 0 && (
                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                          <Star size={10} className="fill-amber-500 text-amber-500" /> {vendor.rating}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-red-600 transition-colors">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2 font-medium">
                        {plan.description}
                      </p>
                    </div>

                    {/* Included Dishes Preview Pool */}
                    {plan.dishPool && plan.dishPool.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                          Included Dishes Preview ({plan.dishPool.length}):
                        </span>
                        <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden py-0.5">
                          {plan.dishPool.slice(0, 3).map((dish, idx) => (
                            <span
                              key={idx}
                              className="bg-slate-50 border border-slate-100 text-[10px] text-slate-700 px-2.5 py-1 rounded-lg whitespace-nowrap font-bold flex items-center gap-1.5"
                            >
                              {dish.dietType && renderDietBadge(dish.dietType)}
                              <span className="truncate max-w-[110px]">{dish.name}</span>
                            </span>
                          ))}
                          {plan.dishPool.length > 3 && (
                            <span className="bg-slate-50 border border-slate-100 text-[10px] text-slate-400 px-2 py-1 rounded-lg font-black whitespace-nowrap">
                              +{plan.dishPool.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Permitted Slots in Clinical Red Accents */}
                    {plan.permittedSlots && plan.permittedSlots.length > 0 && (
                      <div className="space-y-1.5 pt-1 border-t border-slate-50">
                        <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                          Permitted Meal Slots:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {plan.permittedSlots.map((slot) => (
                            <span
                              key={slot}
                              className="inline-flex items-center text-[10px] font-black uppercase text-red-600 bg-red-50/70 border border-red-200/60 px-2.5 py-0.5 rounded-md"
                            >
                              {slot}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Card Bottom Footer */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 block uppercase leading-none">Starting from</span>
                    <strong className="text-base font-black text-slate-900 font-mono block mt-0.5">₹{plan.price}</strong>
                  </div>

                  <button
                    type="button"
                    disabled={!isAvailable}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlanClick(plan._id);
                    }}
                    className={`py-2.5 px-4 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                      isAvailable
                        ? 'bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 cursor-pointer group-hover:translate-x-0.5'
                        : 'bg-slate-300 border border-slate-200 text-slate-500 cursor-not-allowed shadow-none'
                    }`}
                  >
                    <span>{isAvailable ? 'Subscribe Plan' : 'Unavailable'}</span>
                    <ChevronRight size={14} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}