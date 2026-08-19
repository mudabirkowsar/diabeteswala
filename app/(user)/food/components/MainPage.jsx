"use client";

import React from 'react';

export default function MainPage() {
  return (
    <div className="relative min-h-[580px] md:min-h-[883px] flex items-center justify-center overflow-hidden bg-[#0A0B1E] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      
      {/* CRYSTAL CLEAR BACKGROUND VIDEO LAYER */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-70 z-0"
      >
        <source src="/banner-video.mp4" type="video/mp4" />
      </video>

      {/* SOFT VIGNETTE OVERLAY */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-[#0A0B1E] z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-10"></div>

      {/* FOREGROUND MAIN CONTENT PANEL */}
      <div className="max-w-3xl mx-auto text-center relative z-20">
        
        {/* Pulsing Tagline Badge with Text Drop Shadow */}
        <span className="inline-flex items-center gap-1.5 bg-black/40 backdrop-blur-md text-[#00B574] text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-6 border border-white/10 shadow-lg drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00B574] animate-pulse"></span>
          India's 1st Healthy Food Platform
        </span>
        
        {/* Headings with high-contrast text shadow filters */}
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-5 leading-tight drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
          Stable Glucose. <br className="hidden md:inline" /> Wholesome Flavor.
        </h1>
        
        <p className="text-xs md:text-sm text-indigo-100 max-w-lg mx-auto leading-relaxed font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
          Nutritional formulas designed by clinical dietitians for diabetic, pre-diabetic, and ketogenic wellness.
        </p>

      </div>

      {/* SWIPE UP / SCROLL DOWN DYNAMIC INDICATOR */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 z-20 text-indigo-150/90 animate-bounce pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Swipe Up</span>
        <svg className="w-4 h-4 stroke-[2.5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
        </svg>
      </div>

    </div>
  );
}