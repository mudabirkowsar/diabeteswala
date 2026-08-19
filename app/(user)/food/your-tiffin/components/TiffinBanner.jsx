'use client';

import React from 'react';

export default function TiffinBanner({ onLaunch }) {
  return (
    <div className="relative rounded-3xl overflow-hidden shadow-sm border border-gray-150 bg-gray-950 h-[380px] md:h-[600px] flex items-center">
      <img 
        src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&auto=format&fit=crop&q=80"
        alt="Clean ingredients"
        className="absolute inset-0 w-full h-full object-cover opacity-40 hover:scale-101 transition-transform duration-700 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent"></div>

      <div className="relative z-10 px-6 md:px-14 max-w-xl text-white">
        <span className="inline-flex items-center gap-1.5 text-[9px] bg-emerald-500 text-white font-extrabold uppercase tracking-widest px-2.5 py-1 rounded shadow-sm mb-4">
          DIY Precision Nutrition
        </span>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-4">
          Design Your <br className="hidden sm:inline" /> Custom Plate
        </h2>
        <p className="text-xs md:text-sm text-gray-300 leading-relaxed mb-8 max-w-md">
          Customize exact carb, protein, and fiber ratios for your Breakfast, Lunch, and Dinner. Target your specific glycemic values and clinical guidelines.
        </p>
        <button
          onClick={onLaunch}
          className="inline-flex items-center gap-2 bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-black px-7 py-4 rounded-xl shadow-lg transition active:scale-95 border border-indigo-400/25"
        >
          <span>Launch Meal Builder</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
      </div>
    </div>
  );
}