"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  GlassWater, 
  Flame, 
  MapPin, 
  Clock, 
  ArrowRight, 
  Sparkles,
  Plus,
  Droplets,
  Zap,
  Leaf,
  ShieldCheck
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';

// Helper for backend image URL resolution
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_DRINK = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800";

export default function NearestSmoothies() {
  const router = useRouter();
  const [drinks, setDrinks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Coordinate resolution helper
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

  useEffect(() => {
    const fetchNearestDrinks = async () => {
      setLoading(true);
      try {
        const coords = getInitialCoords();
        const response = await UserAPI.getNearestDrinks(
          { lat: coords.lat, lng: coords.lng },
          { limit: 5 }
        );

        if (response && response.success && Array.isArray(response.data)) {
          setDrinks(response.data.slice(0, 5));
        }
      } catch (err) {
        console.error("Failed to load nearest smoothies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNearestDrinks();
  }, []);

  const getDietBadge = (type) => {
    if (type === 'Vegan') {
      return (
        <span className="backdrop-blur-md bg-emerald-500/90 text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-emerald-400/30 uppercase">
          <Leaf size={10} className="fill-white" /> 100% Vegan
        </span>
      );
    }
    if (type === 'Non Veg') {
      return (
        <span className="backdrop-blur-md bg-rose-500/90 text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-rose-400/30 uppercase">
          Non-Veg
        </span>
      );
    }
    return (
      <span className="backdrop-blur-md bg-green-600/90 text-white text-[9px] font-black tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-green-400/30 uppercase">
        <Leaf size={10} className="fill-white" /> Veg
      </span>
    );
  };

  if (!loading && drinks.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#f8fbff] pt-8 pb-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto antialiased select-none relative overflow-hidden">
      
      {/* Ambient Multi-Tone Berry & Tropical Glows */}
      <div className="absolute -top-24 left-10 w-96 h-96 bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-4 w-80 h-80 bg-gradient-to-tl from-amber-400/15 via-purple-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-gradient-to-tr from-[#3D3F96]/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header Container */}
      <div className="flex items-center justify-between px-4 sm:px-8 mb-6 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-[#3D3F96] flex items-center justify-center text-white shadow-xl shadow-rose-500/20 ring-4 ring-white/80 backdrop-blur-md group-hover:scale-105 transition-transform duration-300">
              <GlassWater className="w-6 h-6 animate-pulse" strokeWidth={2.2} />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-900 shadow-sm">
              ✨
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Cold-Pressed & Artisan Shakes
              </h2>
              <span className="hidden sm:inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-gradient-to-r from-rose-500/10 to-[#3D3F96]/10 text-rose-600 border border-rose-200/60 rounded-full backdrop-blur-md">
                100% Raw & Fresh
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Nutrient-dense botanical elixirs, active protein shakes & detox cold-press nearby
            </p>
          </div>
        </div>

        {/* View All Menu Button */}
        <Link
          href="/food/smoothies"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 hover:bg-white text-slate-800 border border-slate-200/80 hover:border-rose-300 shadow-sm hover:shadow-md backdrop-blur-md transition-all duration-300 cursor-pointer"
        >
          <span className="text-xs font-black text-slate-800 group-hover:text-rose-600 transition-colors">
            FULL MENU
          </span>
          <ArrowRight size={14} className="text-slate-400 group-hover:text-rose-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Horizontal Smoothie Deck */}
      <div className="flex items-stretch gap-5 overflow-x-auto px-4 sm:px-8 pb-6 pt-2 snap-x snap-mandatory relative z-10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {loading ? (
          // Skeleton Loader Cards
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="w-[240px] sm:w-[260px] bg-white/70 backdrop-blur-xl rounded-[32px] p-3.5 border border-white/80 shadow-lg animate-pulse flex flex-col justify-between shrink-0"
            >
              <div className="w-full h-60 bg-slate-200/80 rounded-[24px] mb-3" />
              <div className="space-y-2.5">
                <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
                <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                <div className="h-10 bg-slate-100 rounded-2xl w-full mt-3" />
              </div>
            </div>
          ))
        ) : (
          drinks.map((drink) => {
            const primaryImage = Array.isArray(drink.images) && drink.images.length > 0 
              ? getMediaUrl(drink.images[0]) 
              : PLACEHOLDER_DRINK;

            const savings = drink.discountPrice && drink.price > drink.discountPrice 
              ? drink.price - drink.discountPrice 
              : 0;

            return (
              <div
                key={drink._id}
                onClick={() => router.push(`/food/smoothiedetail/${drink._id}`)}
                className="group relative w-[240px] sm:w-[260px] bg-white/80 hover:bg-white backdrop-blur-2xl rounded-[32px] p-3 border border-white/80 hover:border-rose-400/40 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.12)] hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col justify-between shrink-0 snap-start overflow-hidden"
              >
                {/* TALL Beverage Visual Display */}
                <div className="relative w-full h-60 sm:h-64 rounded-[24px] overflow-hidden bg-slate-950 shadow-inner">
                  <img
                    src={primaryImage}
                    alt={drink.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => { e.target.src = PLACEHOLDER_DRINK; }}
                  />

                  {/* Gradient Glass Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
                    {getDietBadge(drink.dietType)}

                    {savings > 0 ? (
                      <span className="backdrop-blur-xl bg-rose-600/90 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full shadow-lg border border-rose-400/30">
                        ₹{savings} OFF
                      </span>
                    ) : drink.isPopular ? (
                      <span className="backdrop-blur-xl bg-amber-500/90 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-amber-300/40">
                        <Sparkles size={10} className="fill-white" /> HOT
                      </span>
                    ) : null}
                  </div>

                  {/* Image Bottom Overlay Info */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10 text-white text-[10px] font-bold">
                    <div className="backdrop-blur-xl bg-slate-900/60 border border-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-md">
                      <Clock size={11} className="text-amber-400 shrink-0" />
                      <span>{drink.prepTime || 6} mins</span>
                    </div>

                    {drink.distanceText && (
                      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/20 px-2.5 py-1 rounded-xl flex items-center gap-1.5 text-rose-300 shadow-md">
                        <MapPin size={11} className="text-rose-400 shrink-0" />
                        <span>{drink.distanceText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Beverage Card Details */}
                <div className="p-1 pt-3 flex-1 flex flex-col justify-between space-y-2.5">
                  
                  {/* Category & Title */}
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                        {drink.drinkType || "Craft Blend"}
                      </span>
                      {drink.foodEffectCategory && (
                        <span className="text-[9px] font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 truncate max-w-[100px]">
                          {drink.foodEffectCategory}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors mt-2 line-clamp-1 leading-tight">
                      {drink.name}
                    </h3>

                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 mt-1 leading-snug">
                      {drink.description || "Cold-pressed fresh nutrients, botanical extracts & rich wholesome flavors."}
                    </p>
                  </div>

                  {/* Premium Nutrition Micro-Strip */}
                  <div className="grid grid-cols-2 gap-1.5 bg-slate-100/70 p-1.5 rounded-2xl border border-slate-200/50 text-[10px]">
                    <div className="flex items-center gap-1.5 font-black text-slate-800 bg-white px-2 py-1 rounded-xl shadow-2xs">
                      <Flame size={12} className="text-rose-500 fill-rose-500" />
                      <span>{drink.calories ? `${drink.calories} kcal` : 'Fresh Blend'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-white px-2 py-1 rounded-xl shadow-2xs">
                      <Droplets size={11} className="text-sky-500" />
                      <span>{drink.sugar !== undefined ? `${drink.sugar}g Sugar` : 'No Added Sugar'}</span>
                    </div>
                  </div>

                  {/* Price & Order Action CTA */}
                  <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                          ₹{drink.discountPrice || drink.price}
                        </span>
                        {drink.discountPrice && drink.price !== drink.discountPrice && (
                          <span className="text-xs text-slate-400 line-through font-mono font-semibold">
                            ₹{drink.price}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        {drink.servingSize || "350 ml serving"}
                      </span>
                    </div>

                    {/* Glowing Order Action Button */}
                    <button
                      type="button"
                      className="h-8 px-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-[#3D3F96] hover:from-rose-600 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-rose-500/25 group-hover:shadow-rose-500/40 group-hover:scale-105 active:scale-90 transition-all duration-300 flex items-center gap-1 cursor-pointer"
                    >
                      <span>ADD</span>
                      <Plus size={13} strokeWidth={3} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}