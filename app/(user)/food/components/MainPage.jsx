"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, ChevronDown } from 'lucide-react';

export default function MainPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Directs to the geolocated nearest food catalog with the search query parameters
      router.push(`/food/nearest?search=${encodeURIComponent(searchQuery.trim())}`);
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

        {/* NETFLIX-STYLE SEARCH INPUT */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-xl sm:max-w-2xl mx-auto flex flex-col sm:flex-row items-stretch gap-2 p-1.5 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search clinical meals, diet styles, or health targets..."
              value={searchQuery}
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

      </div>

      {/* SWIPE UP / SCROLL DOWN DYNAMIC INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 text-slate-300 animate-bounce pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        <span className="text-[9px] font-black uppercase tracking-widest leading-none">Swipe Up</span>
        <ChevronDown size={16} className="stroke-[2.5]" />
      </div>

    </div>
  );
}