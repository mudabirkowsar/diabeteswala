"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  Sparkles,
  Sliders,
  ArrowRight,
  ShieldCheck,
  Scale,
  Flame,
  Clock,
  CheckCircle2,
  UtensilsCrossed
} from 'lucide-react';

export default function CustomTiffin() {
  const router = useRouter();

  const handleNavigate = () => {
    router.push('/food/customtiffin');
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-10 antialiased select-none text-left">
      {/* Main Promo Banner Container */}
      <div 
        onClick={handleNavigate}
        className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1c1d2d] via-[#141624] to-[#0d0f1a] p-8 sm:p-12 lg:p-14 text-white shadow-2xl shadow-slate-950/20 border border-red-500/15 cursor-pointer group transition-all duration-300 hover:border-red-500/30"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Content Area (7 Columns) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badge */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-red-500/20 shadow-sm backdrop-blur-md">
                <Sparkles size={13} className="text-red-400 animate-pulse" /> 100% Customized Therapeutic Meals
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/5 text-slate-300 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                <ChefHat size={13} className="text-amber-400" /> DiabetesWala™ Special
              </span>
            </div>

            {/* Headline & Description */}
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                Build Your Own <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-amber-300">Clinically Customized</span> Tiffin
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-2xl">
                Take full control of your blood sugar with customized Low-GI grains, personalized portion macros, healthy fats, and curated diabetic-friendly curries crafted specifically for your health goals.
              </p>
            </div>

            {/* Feature Highlights Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                  <Scale size={16} className="text-red-400" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-none">Macro-Counted</h4>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Calorie & Carb tuned</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-3 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Flame size={16} className="text-amber-400" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-none">Zero Refined Sugar</h4>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Strict clinical cooking</p>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-2xl p-3 backdrop-blur-sm col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Sliders size={16} className="text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-[11px] font-bold text-white leading-none">Flexible Schedule</h4>
                  <p className="text-[9px] text-slate-400 font-medium mt-0.5">Pause or change anytime</p>
                </div>
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNavigate();
                }}
                className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all duration-300 group-hover:scale-[1.03] cursor-pointer"
              >
                <span>Customize Your Tiffin Now</span>
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>

          </div>

          {/* Right Visual Interactive Card (5 Columns) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-md bg-white/[0.03] border border-white/10 rounded-3xl p-6 backdrop-blur-md space-y-4 shadow-xl">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <UtensilsCrossed size={16} className="text-red-400" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">How Customization Works</span>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 px-2 py-0.5 rounded-lg border border-red-500/30">
                  3 Easy Steps
                </span>
              </div>

              {/* Steps List */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-red-600/20 text-red-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Select Your Grains & Base</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Choose Bajra, Jowar, Multigrain, or Ragi diabetic rotis.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Pick Curries, Sabzis & Protein</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Paneer, Dal, Sprouts & fiber-rich seasonal vegetables.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white/[0.02] p-3 rounded-2xl border border-white/5">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Set Your Delivery Frequency</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">Lunch, Dinner, or Daily Subscriptions at your door.</p>
                  </div>
                </div>
              </div>

              {/* Trust Badge */}
              <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 text-center">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Verified by certified clinical diabetes dietitians</span>
              </div>

            </div>
          </div>

        </div>

        {/* Ambient Glows */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </div>
  );
}