    "use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Flame,
  HeartPulse,
  Leaf,
  Clock,
  Dna,
  BadgePercent
} from "lucide-react";

export default function PrecisionHealthMatrix() {
  const [selectedMode, setSelectedMode] = useState("doctor"); // "standard" | "doctor"

  return (
    <section className="relative py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-800 select-none overflow-hidden">
      
      {/* Ambient Lighting Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#3D3F96]/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* TOP HEADER */}
      <div className="text-center max-w-3xl mx-auto space-y-3 mb-16 sm:mb-20">
        
        {/* Decorative Badge */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#3D3F96]/40 to-[#3D3F96]" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#3D3F96] bg-[#3D3F96]/5 px-4 py-1.5 rounded-full border border-[#3D3F96]/15">
            The Clinical Difference
          </span>
          <div className="h-px bg-gradient-to-l from-transparent via-[#3D3F96]/40 to-[#3D3F96]" />
        </div>

        {/* Main Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Science in Action: <br className="hidden sm:inline" />
          <span className="text-[#3D3F96]">How Precision Food Transforms Your Day</span>
        </h2>

        {/* Subtitle */}
        <p className="text-xs sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          Standard grocery and takeout meals cause rapid insulin spikes followed by energy crashes. 
          See how our clinical macro-matrix stabilizes cellular energy for 6+ continuous hours.
        </p>
      </div>

      {/* INTERACTIVE COMPARISON SIMULATOR (Split Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">

        {/* LEFT COLUMN: Interactive Blood Sugar & Energy Simulator Graph */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-2xl shadow-indigo-950/5 flex flex-col justify-between">
          
          <div className="space-y-4">
            
            {/* Simulator Header & Mode Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Interactive Telemetry
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <Activity size={18} className="text-[#3D3F96]" />
                  Blood Glucose & Energy Response
                </h3>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200/80 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedMode("standard")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedMode === "standard"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Standard Meal
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode("doctor")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-all ${
                    selectedMode === "doctor"
                      ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/20"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  Doctor Plan
                </button>
              </div>
            </div>

            {/* LIVE SVG GLUCOSE CURVE GRAPH */}
            <div className="relative w-full h-56 sm:h-64 pt-4">
              
              {/* Optimal Zone Reference Shading */}
              <div className="absolute top-1/3 bottom-1/3 left-0 right-0 bg-emerald-500/5 border-y border-dashed border-emerald-500/30 rounded-lg flex items-center justify-end px-3 pointer-events-none">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest bg-emerald-100/90 px-2 py-0.5 rounded">
                  Optimal Fat Burn & Energy Zone
                </span>
              </div>

              <svg viewBox="0 0 500 200" className="w-full h-full overflow-visible">
                <defs>
                  {/* Doctor Curve Gradient */}
                  <linearGradient id="doctorGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3D3F96" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#3D3F96" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Standard Spike Gradient */}
                  <linearGradient id="standardGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Graph Axis Horizontal Gridlines */}
                <line x1="0" y1="40" x2="500" y2="40" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4" />
                <line x1="0" y1="160" x2="500" y2="160" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4" />

                {/* ANIMATED CURVE PATH */}
                <AnimatePresence mode="wait">
                  {selectedMode === "standard" ? (
                    <motion.g
                      key="standard-graph"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Standard Filled Area */}
                      <path
                        d="M 0,140 Q 90,0 180,10 Q 270,20 340,185 Q 420,180 500,160 L 500,200 L 0,200 Z"
                        fill="url(#standardGlow)"
                      />
                      {/* Standard Line */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        d="M 0,140 Q 90,0 180,10 Q 270,20 340,185 Q 420,180 500,160"
                        fill="none"
                        stroke="#F43F5E"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                      {/* High Spike Pin */}
                      <circle cx="160" cy="12" r="5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
                      {/* Deep Crash Pin */}
                      <circle cx="340" cy="185" r="5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
                    </motion.g>
                  ) : (
                    <motion.g
                      key="doctor-graph"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Doctor Filled Area */}
                      <path
                        d="M 0,140 Q 120,95 240,90 Q 360,88 500,92 L 500,200 L 0,200 Z"
                        fill="url(#doctorGlow)"
                      />
                      {/* Doctor Smooth Line */}
                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        d="M 0,140 Q 120,95 240,90 Q 360,88 500,92"
                        fill="none"
                        stroke="#3D3F96"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                      {/* Smooth Steady State Indicator */}
                      <circle cx="240" cy="90" r="5" fill="#3D3F96" stroke="#FFFFFF" strokeWidth="2" />
                      <circle cx="240" cy="90" r="10" fill="#3D3F96" opacity="0.2" className="animate-ping" />
                    </motion.g>
                  )}
                </AnimatePresence>
              </svg>

              {/* Time Labels on Graph X-Axis */}
              <div className="flex justify-between text-[10px] font-mono font-bold text-slate-400 mt-2">
                <span>0hr (Meal Time)</span>
                <span>+1.5hr Peak</span>
                <span>+3hr Digestion</span>
                <span>+5hr Sustained Focus</span>
              </div>
            </div>

          </div>

          {/* Dynamic Diagnostic Output Cards */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {selectedMode === "standard" ? (
              <>
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold">
                    <TrendingUp size={14} /> Sugar Spike
                  </div>
                  <div className="text-base font-black text-rose-950 mt-1">+68 mg/dL</div>
                  <p className="text-[11px] text-rose-600 font-medium">Triggers insulin surge & cravings</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold">
                    <TrendingDown size={14} /> Afternoon Crash
                  </div>
                  <div className="text-base font-black text-rose-950 mt-1">Severe at 2.5hrs</div>
                  <p className="text-[11px] text-rose-600 font-medium">Brain fog and lethargy</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                  <div className="flex items-center gap-1.5 text-rose-700 text-xs font-bold">
                    <XCircle size={14} /> Ingredients
                  </div>
                  <div className="text-base font-black text-rose-950 mt-1">Refined Grains</div>
                  <p className="text-[11px] text-rose-600 font-medium">High GI & inflammatory oils</p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <div className="flex items-center gap-1.5 text-[#3D3F96] text-xs font-bold">
                    <Activity size={14} /> Glycemic Control
                  </div>
                  <div className="text-base font-black text-[#3D3F96] mt-1">&lt;15 mg/dL Rise</div>
                  <p className="text-[11px] text-indigo-700 font-medium">Controlled slow glucose release</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                  <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                    <Zap size={14} /> Sustained Fuel
                  </div>
                  <div className="text-base font-black text-emerald-950 mt-1">6+ Hours Steady</div>
                  <p className="text-[11px] text-emerald-700 font-medium">Zero afternoon brain slump</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                  <div className="flex items-center gap-1.5 text-[#3D3F96] text-xs font-bold">
                    <CheckCircle2 size={14} /> Clean Matrix
                  </div>
                  <div className="text-base font-black text-[#3D3F96] mt-1">17+ Whole Foods</div>
                  <p className="text-[11px] text-indigo-700 font-medium">Prebiotic fiber & healthy lipids</p>
                </div>
              </>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Scientific Bento Highlights */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          
          {/* Bento Card 1: 0% Inflammatory Seed Oils */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-100 flex items-start gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-sm">
              <Leaf size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                100% Cold-Pressed
              </span>
              <h4 className="text-base font-extrabold text-slate-900">
                Zero Industrial Seed Oils
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Prepared exclusively with cold-pressed extra virgin olive oil, avocado oil, and natural seed fats. No canola, soy, or palm oils.
              </p>
            </div>
          </motion.div>

          {/* Bento Card 2: 17+ Plant Varieties per Dish */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-md shadow-slate-100 flex items-start gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96] shrink-0 shadow-sm">
              <Dna size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#3D3F96] bg-[#3D3F96]/10 px-2 py-0.5 rounded-md">
                Microbiome Diversity
              </span>
              <h4 className="text-base font-extrabold text-slate-900">
                30+ Organic Plants Weekly
              </h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Clinical research proves that eating 30+ diverse plant species per week fosters optimal gut microbiome health and immune resilience.
              </p>
            </div>
          </motion.div>

          {/* Bento Card 3: HSA/FSA Certified */}
          <motion.div
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-[#1F2154] to-[#3D3F96] text-white p-6 shadow-xl flex items-start gap-4 transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-indigo-200 shrink-0 shadow-inner">
              <BadgePercent size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                TrueMed Verified
              </span>
              <h4 className="text-base font-extrabold text-white">
                HSA / FSA Eligible Pre-Tax Savings
              </h4>
              <p className="text-xs text-indigo-100 font-normal leading-relaxed">
                Use your pre-tax HSA/FSA healthcare dollars to save an average of 30-40% on your entire food plan with doctor certification.
              </p>
            </div>
          </motion.div>

        </div>

      </div>

      {/* BOTTOM ACTION CTA BANNER */}
      <div className="bg-gradient-to-r from-slate-100 via-white to-indigo-50/60 rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
        
        <div className="flex items-start gap-4 sm:gap-5 text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#3D3F96] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#3D3F96]/20">
            <ShieldCheck size={28} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#3D3F96]">
                Guaranteed Satisfaction
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                100% Money-Back Promise
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Transform your daily nutrition routine today.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Choose your doctor-formulated box or customize your favorites with flexible weekly deliveries.
            </p>
          </div>
        </div>

        {/* CTA Link to /food/programs */}
        <Link
          href="/food/programs"
          className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#303277] text-white font-black text-sm sm:text-base shadow-xl shadow-[#3D3F96]/20 transition-all transform hover:-translate-y-0.5 group"
        >
          <span>Get Started With Your Plan</span>
          <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

    </section>
  );
}