"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Activity, X, ArrowRight, Sparkles, HeartPulse } from 'lucide-react';

export default function FoodLayout({ children }) {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Show the popup after 5 seconds (5000ms)
    const timer = setTimeout(() => {
      // Optional: Check sessionStorage so it doesn't annoy user on every refresh
      const isDismissed = sessionStorage.getItem('diabetes_popup_dismissed');
      if (!isDismissed) {
        setShowPopup(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShowPopup(false);
    sessionStorage.setItem('diabetes_popup_dismissed', 'true');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">

      {/* 5-SECOND TOP-RIGHT CLINICAL DIABETES POPUP */}
      {showPopup && (
        <aside
          aria-label="Diabetes & Blood Sugar Nutrition Banner"
          className="fixed top-5 right-5 z-50 w-[calc(100%-2.5rem)] sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl border-2 border-[#3d3f96]/20 shadow-2xl shadow-slate-900/15 p-5 animate-in fade-in slide-in-from-top-4 duration-500 transition-all"
        >
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            aria-label="Close notification"
            className="absolute top-3.5 right-3.5 p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-3.5">
            {/* Health Icon Badge */}
            <div className="p-2.5 rounded-xl bg-red-50 text-red-500 border border-red-100 shrink-0 mt-0.5 shadow-xs">
              <HeartPulse className="w-5 h-5 animate-pulse" />
            </div>

            {/* Content Area */}
            <div className="space-y-1.5 pr-4">
              <div className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                <Sparkles className="w-2.5 h-2.5" />
                Glycemic Control
              </div>

              <h4 className="text-sm font-extrabold text-[#3d3f96] tracking-tight leading-snug">
                Managing Blood Sugar or Diabetes?
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Explore our doctor-curated, low-GI meals designed for insulin sensitivity and steady all-day energy.
              </p>

              {/* Action Button Redirecting to /food/programs/men */}
              <div className="pt-2">
                <Link
                  href="/food/aboutfoodandnutrition"
                  onClick={() => setShowPopup(false)}
                  className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-4 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-md shadow-red-500/20 hover:shadow-lg transition-all"
                >
                  <span>Explore Diabetes-Friendly Plans</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* GLOBAL VIEWPORT MOUNT */}
      <main className="flex-1">
        {children}
      </main>

    </div>
  );
}