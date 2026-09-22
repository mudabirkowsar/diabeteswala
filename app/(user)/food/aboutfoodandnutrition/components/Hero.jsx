"use client";

import React, { useState } from "react";
import {
  Stethoscope,
  HeartPulse,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Apple,
  Star,
  Activity,
  Flame
} from "lucide-react";

export default function Hero() {
  const [activePillar, setActivePillar] = useState("doctor"); // 'doctor' | 'nutrition'

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50/50 py-10 lg:py-10 pt-0 text-slate-850">
      
      {/* Decorative background glow accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-[#3D3F96]/10 to-emerald-500/10 blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Tagline Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#3D3F96]/20 shadow-sm shadow-[#3D3F96]/5 text-xs sm:text-sm font-bold text-[#3D3F96]">
            <Sparkles size={15} className="text-[#3D3F96] animate-pulse" />
            <span>Medically Backed • Nutritionist Engineered • Chef Crafted</span>
          </div>
        </div>

        {/* Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* LEFT COLUMN: Hero Copy & Value Props */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Precision Food Designed by{" "}
                <span className="text-[#3D3F96] relative inline-block">
                  Doctors
                  <span className="absolute left-0 -bottom-1 w-full h-1 bg-[#3D3F96]/30 rounded-full" />
                </span>{" "}
                & Master{" "}
                <span className="text-emerald-600 relative inline-block">
                  Dietitians
                  <span className="absolute left-0 -bottom-1 w-full h-1 bg-emerald-600/30 rounded-full" />
                </span>.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Take the guesswork out of healthy living. Every meal is formulated 
                to target blood sugar stability, heart vitality, and gut health—without sacrificing the gourmet flavors you crave.
              </p>
            </div>

            {/* Interactive Toggle for Doctor vs Nutritionist Pillars */}
            <div className="inline-flex p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 shadow-inner">
              <button
                type="button"
                onClick={() => setActivePillar("doctor")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 ${
                  activePillar === "doctor"
                    ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/20 scale-100"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Stethoscope size={16} />
                Doctor-Prescribed Care
              </button>

              <button
                type="button"
                onClick={() => setActivePillar("nutrition")}
                className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm transition-all duration-300 ${
                  activePillar === "nutrition"
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-100"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Apple size={16} />
                Dietitian-Crafted Nutrition
              </button>
            </div>

            {/* Dynamic Pillar Feature Cards */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-lg shadow-slate-200/40 text-left transition-all duration-300">
              {activePillar === "doctor" ? (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-[#3D3F96] font-black text-sm">
                    <HeartPulse size={18} />
                    <span>Clinical Health Standards</span>
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-base sm:text-lg">
                    Formulated by MDs for Cardiovascular & Metabolic Wellness
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 font-medium pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#3D3F96] shrink-0" />
                      Low Glycemic & Blood Sugar Stable
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#3D3F96] shrink-0" />
                      Sodium-Controlled & Heart-Friendly
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#3D3F96] shrink-0" />
                      Zero Refined Sugars or Trans Fats
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-[#3D3F96] shrink-0" />
                      Anti-Inflammatory Whole Foods
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2 text-emerald-600 font-black text-sm">
                    <Activity size={18} />
                    <span>Macro & Micronutrient Optimization</span>
                  </div>
                  <h4 className="text-slate-900 font-extrabold text-base sm:text-lg">
                    Calibrated by Dietitians for Gut Health & All-Day Energy
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-slate-600 font-medium pt-1">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      30g+ Bioavailable Lean Protein
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      10g+ Prebiotic Gut Fiber
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      Organic Seasonal Greens & Micro-Vitamins
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                      100% Nutrient-Dense Macro Balance
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#32347c] text-white font-extrabold text-sm sm:text-base shadow-xl shadow-[#3D3F96]/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Find Your Personalized Plan</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-sm sm:text-base shadow-sm transition-all"
              >
                <ShieldCheck size={18} className="text-[#3D3F96]" />
                <span>View Clinical Research</span>
              </button>
            </div>

            {/* Trust Stats Row */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 border-t border-slate-200/70 text-slate-600">
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={15} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm font-extrabold text-slate-800">4.9/5 Rating</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
                <ShieldCheck size={16} className="text-[#3D3F96]" />
                <span>50+ Board-Certified MDs</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700">
                <Flame size={16} className="text-emerald-600" />
                <span>100% Preservative Free</span>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Interactive Plate & Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center items-center">
            
            {/* Outer Decorative Rings */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-full p-4 bg-gradient-to-br from-white via-slate-100 to-indigo-50/50 shadow-2xl border border-slate-200/80 flex items-center justify-center">
              
              {/* Dish Image */}
              <div className="w-full h-full rounded-full overflow-hidden shadow-inner border-4 border-white relative">
                <img
                  src="https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=800"
                  alt="Doctor & Nutritionist Approved Healthy Bowl"
                  className="w-full h-full object-cover select-none transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Floating Badge 1: Doctor Approved (Top Left) */}
              <div className="absolute -top-4 -left-4 sm:-left-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-200/80 flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96]">
                  <Stethoscope size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clinical Standard</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">Doctor-Approved</div>
                </div>
              </div>

              {/* Floating Badge 2: Nutritionist Approved (Bottom Right) */}
              <div className="absolute -bottom-4 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-xl border border-slate-200/80 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Apple size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nutritionist Formulated</div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900">Macro Optimized</div>
                </div>
              </div>

              {/* Floating Macro Pill (Center bottom overlay) */}
              <div className="absolute bottom-6 bg-slate-900/90 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg border border-slate-700/50 flex items-center gap-3">
                <span className="text-emerald-400 font-extrabold">34g Protein</span>
                <span className="text-slate-500">•</span>
                <span className="text-indigo-300 font-extrabold">420 Kcal</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-extrabold">11g Fiber</span>
              </div>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}