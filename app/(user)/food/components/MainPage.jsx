"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ChevronDown, Loader2, Utensils, Package, Tag, Flame } from 'lucide-react';

// Import your API service
import UserAPI from '../../../services/UserAPI'; // Adjust path if located in UserAPI or services folder

// --- MEDIA URL HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

export default function MainPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const searchContainerRef = useRef(null);

  // --- Live Autocomplete Search (Debounced 300ms) ---
  useEffect(() => {
    const query = searchQuery.trim();

    if (query.length < 2) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      setIsOpen(false);
      return;
    }

    setLoadingSuggestions(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await UserAPI.getFoodSearchSuggestions({
          query: query,
          limit: 10
        });

        if (response && response.success) {
          setSuggestions(response.data || []);
          setIsOpen(true);
        } else {
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Error fetching live search suggestions:", error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // --- Close dropdown when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // --- Form Submit Handler ---
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsOpen(false);
      // Directs to the geolocated nearest food catalog with the search query parameters
      router.push(`/food/nearest?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // --- Handle Suggestion Item Click with Dynamic Redirection ---
  const handleSuggestionClick = (item) => {
    setIsOpen(false);
    const targetId = item.id || item._id;

    if (item.itemType === 'Combo') {
      router.push(`/food/combodetail/${targetId}`);
    } else if (item.itemType === 'MealItem') {
      router.push(`/food/fooddetail/${targetId}`);
    } else if (item.redirectPath) {
      router.push(item.redirectPath);
    } else {
      router.push(`/food/fooddetail/${targetId}`);
    }
  };

  return (
    <div className="relative min-h-[640px] md:min-h-[883px] flex items-center justify-center overflow-hidden bg-[#0A0B1E] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">

      {/* CRYSTAL CLEAR BACKGROUND VIDEO LAYER */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-50 z-0"
      >
        <source src="/banner-video.mp4" type="video/mp4" />
      </video>

      {/* SOFT VIGNETTE & RADIAL DARK MASK OVERLAYS */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/30 to-[#0A0B1E] z-10"></div>
      <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60 z-10"></div>

      {/* FOREGROUND MAIN CONTENT PANEL */}
      <div className="max-w-4xl mx-auto text-center relative z-20 space-y-8 px-2">

        {/* Pulsing Tagline Badge with Text Drop Shadow */}
        <span className="inline-flex items-center gap-1.5 bg-black/50 backdrop-blur-md text-emerald-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full border border-white/10 shadow-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] mx-auto">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          India's 1st Healthy Food Platform
        </span>

        {/* Headings with high-contrast text shadow filters */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tight leading-[1.1] drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-500">
              Stable Glucose.
            </span>
            <br />
            Wholesome Flavor.
          </h1>

          <p className="text-xs sm:text-sm md:text-base text-slate-200 max-w-xl mx-auto leading-relaxed font-bold drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
            Nutritional formulas designed by clinical dietitians for diabetic, pre-diabetic, and ketogenic wellness.
          </p>
        </div>

        {/* NETFLIX-STYLE SEARCH INPUT WITH AUTOCOMPLETE DROPDOWN */}
        <div ref={searchContainerRef} className="max-w-xl sm:max-w-2xl mx-auto relative">
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search clinical meals, diet styles, or health targets..."
                value={searchQuery}
                onFocus={() => {
                  if (suggestions.length > 0) setIsOpen(true);
                }}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent pl-12 pr-4 py-4 rounded-xl text-sm font-semibold text-white placeholder-slate-400 outline-none focus:ring-0 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider px-6 py-4 sm:py-3 rounded-xl transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <span>Search</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
          {isOpen && (suggestions.length > 0 || loadingSuggestions) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#0E1027]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 text-left divide-y divide-white/5 animate-in fade-in duration-200">
              {loadingSuggestions ? (
                <div className="p-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-400">
                  <Loader2 className="animate-spin text-emerald-400" size={16} />
                  <span>Searching diet catalog...</span>
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto [&::-webkit-scrollbar]:hidden py-1.5">
                  {suggestions.map((item) => {
                    const isVeg = item.dietType === 'Veg';
                    const isCombo = item.itemType === 'Combo';
                    const isCategory = item.itemType === 'Category';
                    const imgUrl = getMediaUrl(item.imageUrl);

                    return (
                      <div
                        key={item.id || item._id}
                        onClick={() => handleSuggestionClick(item)}
                        className="px-4 py-3 hover:bg-white/10 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl}
                              alt={item.name}
                              className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 shrink-0">
                              {isCombo ? (
                                <Package size={18} className="text-purple-400" />
                              ) : isCategory ? (
                                <Tag size={18} className="text-blue-400" />
                              ) : (
                                <Utensils size={18} className="text-emerald-400" />
                              )}
                            </div>
                          )}

                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              {!isCategory && item.dietType && (
                                <div className={`w-3 h-3 border-2 rounded flex items-center justify-center p-[1px] bg-white shrink-0 ${isVeg ? 'border-emerald-500' : 'border-rose-500'}`}>
                                  <span className={`w-1 h-1 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                </div>
                              )}
                              <p className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors truncate">
                                {item.name}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-400">
                              <span className="text-emerald-400 font-semibold">{item.category || item.itemType}</span>
                              {item.calories ? (
                                <span className="flex items-center gap-0.5 text-amber-400 font-mono">
                                  <Flame size={10} /> {item.calories} kcal
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        {(item.discountPrice || item.price) ? (
                          <div className="text-right shrink-0 font-mono">
                            <span className="text-sm font-black text-emerald-400">
                              ₹{item.discountPrice || item.price}
                            </span>
                            {item.discountPrice && item.price && item.discountPrice < item.price && (
                              <span className="block text-[10px] text-slate-500 line-through">
                                ₹{item.price}
                              </span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* SWIPE UP / SCROLL DOWN DYNAMIC INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 text-slate-300 animate-bounce pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Swipe Up</span>
        <ChevronDown size={16} className="stroke-[2.5]" />
      </div>

    </div>
  );
}