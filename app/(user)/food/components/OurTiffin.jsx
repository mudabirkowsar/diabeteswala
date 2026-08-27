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
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Activity,
  Sparkles,
  Inbox,
  Flame
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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function OurTiffin() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Data & Loading States ---
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState({});

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

  // --- Fetch Nearest Tiffin Plans ---
  const fetchTiffinPlans = async (targetCoords) => {
    setLoading(true);
    const locationPayload = targetCoords || coords;
    try {
      const response = await UserAPI.getNearestTiffinPlans(locationPayload, { page: 1, limit: 20 });
      if (response && response.success) {
        setPlans(response.data || []);
      } else {
        if (showNotification) {
          showNotification("Unable to load nearby tiffin plans.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching nearest tiffin plans:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || "Failed to load clinical tiffin plans.", "error");
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

  // --- Card Click Navigation ---
  const handlePlanClick = (id) => {
    if (!id) return;
    router.push(`/food/tiffindetail/${id}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">

      {/* Header section */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100/60 text-red-600 flex items-center justify-center shadow-sm">
            <ChefHat size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Therapeutic Tiffin Plans</h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Subscribe to healthy, calorie-counted clinical tiffins delivered right to your doorstep.
            </p>
          </div>
        </div>
      </div>

      {/* --- PLANS LISTING VIEW --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning local dietitian cloud kitchens...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <Activity size={44} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Tiffin Plans Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            We could not find active subscription tiffins in your delivery area. Check back soon for kitchen partner expansions.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-left">
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Utensils className="text-[#3d3f96]" size={18} /> Available Subscription Plans ({plans.length})
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Showing dietitian-crafted tiffin subscriptions available in your area.
              </p>
            </div>
          </div>

          {/* 3 cards per row grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.slice(0, 3).map((plan) => {
              const vendor = plan.vendorId || {};
              const firstDish = plan.dishPool?.[0] || {};
              const bannerImage = getMediaUrl(plan.imageUrl || firstDish.imageUrl) || PLACEHOLDER_IMAGE;
              const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;
              const isAvailable = plan.isAvailable !== false && !plan.UnavailablePlan;

              return (
                <div
                  key={plan._id}
                  onClick={() => handlePlanClick(plan._id)}
                  className={`bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer text-left ${isAvailable
                      ? 'hover:shadow-xl hover:-translate-y-1'
                      : 'opacity-65 saturate-[0.25] border-slate-200 shadow-none'
                    }`}
                >
                  <div>
                    {/* Visual Banner */}
                    <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                      <img
                        src={bannerImage}
                        alt={plan.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Left Top Cycle Badge */}
                      <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-xl uppercase tracking-wider border border-white/10 flex items-center gap-1">
                          <Calendar size={11} className="text-amber-400" />
                          {plan.planCycle || "Monthly Plan"}
                        </span>
                      </div>

                      {/* Distance Pill */}
                      <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm border border-white/10 z-20">
                        <MapPin size={11} className="text-rose-400 shrink-0" />
                        <span>{plan.distanceText || `${plan.distance || 0} km`}</span>
                      </div>

                      {/* Availability Overlays */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                          <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-rose-500/50">
                            Not Available Near You
                          </span>
                        </div>
                      )}

                      {/* Price Overlay */}
                      <div className="absolute bottom-3.5 left-4 flex items-baseline gap-2 text-white z-20">
                        <span className="text-2xl font-black font-mono">₹{plan.price}</span>
                        <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">/ cycle</span>
                      </div>

                      {/* Meals / Day pill on image */}
                      <div className="absolute bottom-3.5 right-4 z-20">
                        <span className="bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm border border-emerald-400/30">
                          {plan.mealsPerDay || 1} Meal{plan.mealsPerDay > 1 ? 's' : ''} / Day
                        </span>
                      </div>
                    </div>

                    {/* Body Details */}
                    <div className="p-5 space-y-4">
                      {/* Kitchen / Vendor Info */}
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-50">
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

                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {plan.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {plan.description}
                        </p>
                      </div>

                      {/* Dish Pool Preview Tags */}
                      {plan.dishPool && plan.dishPool.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                            Included Dishes Preview ({plan.dishPool.length}):
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden py-0.5">
                            {plan.dishPool.slice(0, 4).map((dish, idx) => (
                              <span
                                key={idx}
                                className="bg-slate-50 border border-slate-100 text-[10px] text-slate-600 px-2.5 py-1 rounded-lg whitespace-nowrap font-bold"
                              >
                                {dish.name}
                              </span>
                            ))}
                            {plan.dishPool.length > 4 && (
                              <span className="bg-slate-50 border border-slate-100 text-[10px] text-slate-400 px-2 py-1 rounded-lg font-black whitespace-nowrap">
                                +{plan.dishPool.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Permitted Slots & Plan Highlights */}
                      {plan.permittedSlots && plan.permittedSlots.length > 0 && (
                        <div className="space-y-1.5 pt-1 border-t border-slate-50">
                          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                            Delivery Slots:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {plan.permittedSlots.map((slot) => (
                              <span
                                key={slot}
                                className="inline-flex items-center text-[10px] font-black uppercase text-red-600 bg-red-50/60 border border-red-100/60 px-2.5 py-0.5 rounded-md"
                              >
                                {slot}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
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
                      className={`py-2 px-4 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${isAvailable
                          ? 'bg-[#3d3f96] hover:bg-[#2d2f75] shadow-md shadow-indigo-950/10 cursor-pointer group-hover:translate-x-0.5'
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
        </div>
      )}

      {/* --- BOTTOM PROMO BANNER: DIABETESWALA PROMOTION --- */}
      <div className="bg-gradient-to-br from-[#1c1d2d] via-[#141624] to-[#0d0f1a] rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl shadow-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-center sm:text-left border border-red-500/15">
        <div className="space-y-3 z-10 max-w-xl">
          {/* Secondary Color Badge */}
          <span className="inline-flex items-center gap-1.5 bg-red-50/60 text-red-600 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-red-200/60 shadow-sm backdrop-blur-md">
            <ChefHat size={13} className="text-red-600" /> Powered by DiabetesWala™ Care
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Personalized Daily Tiffins by <span className="text-red-400">DiabetesWala</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            Formulated by certified clinical dietitians with low glycemic index (Low-GI) grains, balanced portion macros, and zero refined sugar to keep your glucose levels balanced every single day.
          </p>
        </div>
        {/* Call to Action Button */}
        <button
          onClick={() => {
            router.push('/food/allfooditems');
          }}
          className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0 hover:scale-[1.02] z-10"
        >
          <span>Explore All Tiffin Plans</span>
          <ArrowRight size={16} />
        </button>

        {/* Ambient background blur accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -top-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

    </div>
  );
}