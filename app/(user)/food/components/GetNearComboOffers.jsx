"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Package,
  Flame,
  Search,
  Loader2,
  ArrowRight,
  ShieldCheck,
  HeartPulse,
  CheckCircle2,
  Leaf
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

export default function GetNearComboOffers() {
  const router = useRouter();
  const { showNotification } = useNotification();

  // --- Data & Loading States ---
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [radiusText, setRadiusText] = useState('10 km');
  const [coords, setCoords] = useState({});

  // --- Filter & Search States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Non Veg', 'Egg'

  // --- Retrieve Stored User Coordinates ---
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

  // --- Fetch Nearest Combos from Backend ---
  const fetchNearestCombos = async (targetCoords) => {
    setLoading(true);
    const locationPayload = targetCoords || coords;
    try {
      const response = await UserAPI.getNearestGeolocatedCombos(locationPayload);
      if (response && response.success) {
        setCombos(response.data || []);
        if (response.maxDistanceLimitApplied) {
          setRadiusText(response.maxDistanceLimitApplied);
        }
      } else {
        if (showNotification) {
          showNotification("Unable to find combo packages in this area.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching nearest combos:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || "Failed to load nearby combo offers.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initialCoords = getInitialCoords();
    setCoords(initialCoords);
    fetchNearestCombos(initialCoords);
  }, []);

  // --- Helper: Render Diet Badge ---
  const renderDietBadge = (type) => {
    const isVeg = type === 'Veg';
    const isEgg = type === 'Egg';
    const isNonVeg = type === 'Non Veg';

    return (
      <div
        className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 bg-white/95 shadow-sm ${
          isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-red-500' : 'border-slate-300'
        }`}
        title={type}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-red-500' : 'bg-slate-400'
          }`}
        />
      </div>
    );
  };

  // --- Filter Combos ---
  const filteredCombos = combos.filter((combo) => {
    const query = searchQuery.toLowerCase().trim();
    const nameMatch = combo.name?.toLowerCase().includes(query);
    const descMatch = combo.description?.toLowerCase().includes(query);
    const vendorMatch = combo.vendorId?.name?.toLowerCase().includes(query);
    const dishMatch = (combo.dishes || []).some(d =>
      d.foodServiceId?.name?.toLowerCase().includes(query)
    );

    const matchesSearch = query === '' || nameMatch || descMatch || vendorMatch || dishMatch;

    const matchesDiet = selectedDietType === 'All' || (combo.dishes || []).some(d =>
      d.foodServiceId?.dietType === selectedDietType
    );

    return matchesSearch && matchesDiet;
  });

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">

      {/* --- GEOLOCATED COMBOS LISTING --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Finding nearest combo offers in your radius...</p>
        </div>
      ) : filteredCombos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <Package size={44} className="text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">No Nearby Combo Offers Available</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm">
            We could not find active combo packages in your immediate delivery radius. Try expanding your search or selecting another diet category.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-left">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Package className="text-[#3d3f96]" size={20} /> Available Combo Deals ({Math.min(filteredCombos.length, 3)})
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Sorted by closest kitchen proximity first. Showing up to 3 combo packages.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCombos.slice(0, 3).map((combo) => {
              const firstDish = combo.dishes?.[0]?.foodServiceId || {};
              const bannerImage = getMediaUrl(firstDish.imageUrl) || PLACEHOLDER_IMAGE;
              const dietType = firstDish.dietType || "Veg";
              const vendor = combo.vendorId || {};
              const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;
              const isAvailable = combo.isAvailable !== false; // Validate operational state

              const discountPct = combo.basePrice > combo.comboPrice
                ? Math.round(((combo.basePrice - combo.comboPrice) / combo.basePrice) * 100)
                : 0;

              // Calculate total calories in combo bundle
              const totalCalories = (combo.dishes || []).reduce(
                (acc, curr) => acc + ((curr.foodServiceId?.calories || 0) * (curr.quantity || 1)),
                0
              );

              // Health goal tag determination
              const healthGoalTag = totalCalories > 0 && totalCalories < 500
                ? "Weight Loss • Calorie Smart"
                : "Active Fuel • High Nutrition";

              return (
                /* --- REDESIGNED HEALTH MEAL PLAN CARD --- */
                <div
                  key={combo._id}
                  onClick={() => router.push(`/food/combodetail/${combo._id}`)}
                  className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between group text-left cursor-pointer ${
                    isAvailable
                      ? 'hover:shadow-xl hover:border-[#3d3f96]/50 hover:-translate-y-1'
                      : 'opacity-65 saturate-[0.25] border-slate-200 shadow-none'
                  }`}
                >
                  <div>
                    {/* Visual Banner with Health Badges */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={bannerImage}
                        alt={combo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                      {/* Top Badges: Diet + Health Category */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-20">
                        {renderDietBadge(dietType)}
                        <span className="bg-[#3d3f96] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow border border-white/15">
                          {healthGoalTag}
                        </span>
                      </div>

                      {/* Distance Pill */}
                      <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm border border-white/10 z-20">
                        <MapPin size={11} className="text-red-400 shrink-0" />
                        <span>{combo.distanceText || `${combo.distance || 0} km`}</span>
                      </div>

                      {/* Savings Percentage Tag */}
                      {discountPct > 0 && (
                        <span className="absolute bottom-3.5 left-4 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm z-20">
                          Save {discountPct}% on Plan
                        </span>
                      )}

                      {/* Availability Overlays */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px] flex items-center justify-center z-30">
                          <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-red-500/50">
                            Currently Unavailable Near You
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      {/* Certified Kitchen / Health Tag Header */}
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                            <img
                              src={kitchenImage}
                              alt={vendor.name || "Kitchen"}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]" title={vendor.name}>
                            {vendor.name || "Certified Health Kitchen"}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Leaf size={10} /> Clean Nutrition
                        </span>
                      </div>

                      {/* Plan Name & Description */}
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {combo.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {combo.description || "Physician & chef-crafted meal package for complete daily wellness and balanced macros."}
                        </p>
                      </div>

                      {/* Curated Entrées Box */}
                      <div className="space-y-2.5 py-3 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-2xl">
                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-slate-400">
                          <span>Included Entrées & Sides</span>
                          <span className="text-[#3d3f96] font-bold">{combo.dishes?.length || 0} Items</span>
                        </div>

                        <div className="space-y-2">
                          {(combo.dishes || []).map((item, idx) => {
                            const dishObj = item.foodServiceId || {};
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs font-bold text-slate-700"
                              >
                                <div className="flex items-center gap-2 truncate max-w-[200px]">
                                  <CheckCircle2 size={13} className="text-[#3d3f96] shrink-0" />
                                  <span className="truncate">{dishObj.name || "Curated Dish"}</span>
                                </div>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  x{item.quantity || 1}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Macro & Calories Pill */}
                      <div className="flex items-center gap-2 pt-1">
                        {totalCalories > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                            <Flame size={12} className="text-red-500" /> {totalCalories} Kcal
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {combo.spicyLevel || 'Mild Spice'} • Zero Prep
                        </span>
                        {combo.isPopular && (
                          <span className="text-[9px] font-black uppercase text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md ml-auto">
                            Doctor Pick
                          </span>
                        )}
                      </div>

                      {/* Price Comparison Summary */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-t border-slate-100 items-center">
                        <div>
                          <span className="text-slate-400 block uppercase text-[9px] font-bold">Base Value</span>
                          <span className="text-slate-400 text-xs line-through font-mono">₹{combo.basePrice}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-red-500 block uppercase text-[9px] font-extrabold">Plan Price</span>
                          <span className="text-[#3d3f96] text-xl font-black font-mono leading-none">
                            ₹{combo.comboPrice}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* Plan CTA Button */}
                  <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/food/combodetail/${combo._id}`);
                      }}
                      className={`w-full py-3.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${
                        isAvailable
                          ? 'bg-[#3d3f96] hover:bg-[#32347c] text-white shadow-md shadow-[#3d3f96]/20 cursor-pointer'
                          : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      }`}
                    >
                      <span>{isAvailable ? 'View Plan & Order' : 'Unavailable in Your Area'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}