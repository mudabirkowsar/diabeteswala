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
  HeartPulse
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

              return (
                <div
                  key={combo._id}
                  onClick={() => router.push(`/food/combodetail/${combo._id}`)}
                  className={`bg-white rounded-3xl border border-slate-100 shadow-sm transition-all duration-300 overflow-hidden flex flex-col justify-between group text-left cursor-pointer ${isAvailable
                    ? 'hover:shadow-xl hover:-translate-y-1'
                    : 'opacity-65 saturate-[0.25] border-slate-200 shadow-none'
                    }`}
                >
                  <div>
                    {/* Visual Banner with Badges */}
                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                      <img
                        src={bannerImage}
                        alt={combo.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                      {/* Top Badges */}
                      <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                        {renderDietBadge(dietType)}
                        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border border-white/10 z-20">
                          {combo.comboId || "COMBO"}
                        </span>
                      </div>

                      {/* Distance Pill */}
                      <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 shadow-sm border border-white/10 z-20">
                        <MapPin size={11} className="text-rose-400 shrink-0" />
                        <span>{combo.distanceText || `${combo.distance || 0} km`}</span>
                      </div>

                      {/* Availability Overlays if Unavailable near client location */}
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                          <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-rose-500/50">
                            Not Available Near You
                          </span>
                        </div>
                      )}

                      {/* Savings Percentage Tag */}
                      {discountPct > 0 && (
                        <span className="absolute bottom-3.5 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm z-20">
                          Save {discountPct}% Off
                        </span>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      {/* Kitchen / Vendor Info Header */}
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
                        <h3 className="font-extrabold text-slate-900 text-lg leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                          {combo.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                          {combo.description}
                        </p>
                      </div>

                      {/* Dot-Track for Included Dishes */}
                      <div className="space-y-3 py-2 border-t border-slate-100/70">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                          Included in Bundle ({combo.dishes?.length || 0} items):
                        </span>
                        <div className="relative pl-6 space-y-3">
                          <div className="absolute left-2 top-2 bottom-2 w-[1.5px] bg-slate-200" />

                          {(combo.dishes || []).map((item, idx) => {
                            const dishObj = item.foodServiceId || {};
                            return (
                              <div
                                key={idx}
                                className="relative flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
                              >
                                <span className="absolute -left-5 w-2 h-2 rounded-full bg-[#3d3f96] border border-white" />
                                <span className="truncate max-w-[190px]">
                                  {dishObj.name || "Dish"} <strong className="text-[#3d3f96]">x{item.quantity}</strong>
                                </span>
                                <span className="text-slate-400 font-mono text-[11px]">
                                  ₹{(dishObj.price || 0) * (item.quantity || 1)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nutrient & Price Summary Box */}
                      <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-50 text-xs font-bold items-center bg-slate-50 p-3.5 rounded-2xl">
                        <div>
                          <span className="text-slate-400 block uppercase text-[9px] font-black">Sum Price</span>
                          <span className="text-slate-400 text-sm line-through font-mono">₹{combo.basePrice}</span>
                        </div>
                        <div>
                          <span className="text-[#3d3f96] block uppercase text-[9px] font-black">Combo Deal</span>
                          <span className="text-[#3d3f96] text-xl font-black font-mono">₹{combo.comboPrice}</span>
                        </div>
                      </div>

                      {/* Badges & Metrics */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                          {totalCalories > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                              <Flame size={12} className="text-amber-500" /> {totalCalories} Kcal
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                            {combo.spicyLevel || 'Mild'}
                          </span>
                        </div>

                        {combo.isPopular && (
                          <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                            Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Button Footer */}
                  <div className="px-6 py-4 bg-slate-50/70 border-t border-slate-100">
                    <button
                      type="button"
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/food/combodetail/${combo._id}`);
                      }}
                      className={`w-full py-3 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 ${isAvailable
                        ? 'bg-[#3d3f96] hover:bg-[#2d2f75] shadow-md shadow-indigo-950/10 cursor-pointer'
                        : 'bg-slate-350 border border-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                      <span>{isAvailable ? 'Order Combo Deal' : 'Unavailable in Your Area'}</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- BOTTOM HYGIENE & DIABETESWALA PROMO BANNER --- */}
      <div className="bg-gradient-to-br from-[#1c1d2d] via-[#141624] to-[#0d0f1a] rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl shadow-slate-950/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-center sm:text-left border border-red-500/15">

        {/* Left Content Area */}
        <div className="space-y-3 z-10 max-w-xl">
          {/* Secondary Color Badge */}
          <span className="inline-flex items-center gap-1.5 bg-red-50/60 text-red-600 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-red-200/60 shadow-sm backdrop-blur-md">
            <HeartPulse size={13} className="text-red-600" /> Powered by DiabetesWala™ Care
          </span>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Fresh Diabetic Combo Offers by <span className="text-red-400">DiabetesWala</span>
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
            All meal packages are freshly prepared in sanitized cloud kitchens using low-GI grains, zero refined sugars, and packed in 100% food-grade eco containers.
          </p>
        </div>

        {/* CTA Action Button */}
        <button
          onClick={() => router.push('/food/allfooditems')}
          className="inline-flex items-center gap-2.5 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all cursor-pointer shrink-0 hover:scale-[1.02] z-10"
        >
          <span>Explore Diabetic Tiffins</span>
          <ArrowRight size={16} />
        </button>

        {/* Ambient background blur accents */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -top-10 w-48 h-48 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

    </div>
  );
}