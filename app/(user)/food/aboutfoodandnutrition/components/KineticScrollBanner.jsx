"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  HeartPulse,
  Flame,
  ArrowRight,
  Activity,
  Dna,
  CheckCircle2,
  Apple,
  Zap,
  Recycle,
  Droplets
} from "lucide-react";

export default function KineticScrollBanner() {
  const containerRef = useRef(null);

  // Track scroll progress across the taller 300vh runway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth physics-based spring translation
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 22,
    mass: 0.8,
    restDelta: 0.0001
  });

  // Extended horizontal translations for longer scroll duration
  // Track 1 & 3: Right to Left
  const xLeft = useTransform(smoothScroll, [0, 1], ["0%", "-60%"]);
  // Track 2: Left to Right
  const xRight = useTransform(smoothScroll, [0, 1], ["-60%", "0%"]);

  return (
    /* Tall parent container gives enough vertical runway to scroll for several seconds */
    <section ref={containerRef} className="relative h-[250vh] bg-[#FAF8F5]">
      
      {/* Pinned Sticky Viewport */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden py-12 select-none">
        
        {/* --- Ambient Background Lighting Mesh --- */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1200px] h-[400px] sm:h-[600px] bg-gradient-to-tr from-[#3D3F96]/15 via-emerald-500/10 to-amber-500/10 rounded-full blur-[120px] sm:blur-[180px] pointer-events-none -z-10" />

        {/* --- Edge Blur & Gradient Masking Overlays --- */}
        <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-64 z-20 pointer-events-none bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent backdrop-blur-[1px]" />
        <div className="absolute right-0 top-0 bottom-0 w-28 sm:w-64 z-20 pointer-events-none bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent backdrop-blur-[1px]" />

        {/* --- Angled Kinetic Track Wrapper --- */}
        <div className="relative -rotate-2 space-y-4 sm:space-y-6 my-auto">
          
          {/* ================= TRACK 1: Moving Right-to-Left ================= */}
          <div className="flex overflow-hidden py-1">
            <motion.div
              style={{ x: xLeft }}
              className="flex whitespace-nowrap items-center font-black text-4xl sm:text-6xl lg:text-8xl uppercase tracking-tighter text-slate-900"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
                  
                  <span>Doctor Formulated</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-[#3D3F96] text-white shadow-xl ring-4 ring-[#3D3F96]/20">
                    <ShieldCheck size={24} className="sm:scale-125" />
                  </span>

                  <span className="bg-gradient-to-r from-[#3D3F96] to-indigo-600 bg-clip-text text-transparent">
                    100% Organic Whole Food
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-emerald-500 text-white shadow-xl ring-4 ring-emerald-500/20">
                    <Leaf size={24} className="sm:scale-125" />
                  </span>

                  <span>Zero Seed Oils</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-amber-500 text-white shadow-xl ring-4 ring-amber-500/20">
                    <Flame size={24} className="sm:scale-125" />
                  </span>

                  <span>Glycemic Index &lt; 28</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-indigo-600 text-white shadow-xl ring-4 ring-indigo-600/20">
                    <Activity size={24} className="sm:scale-125" />
                  </span>

                  <span>Bioavailable Micronutrients</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-teal-500 text-white shadow-xl ring-4 ring-teal-500/20">
                    <Zap size={24} className="sm:scale-125" />
                  </span>

                </div>
              ))}
            </motion.div>
          </div>

          {/* ================= TRACK 2: Moving Left-to-Right ================= */}
          <div className="flex overflow-hidden py-1">
            <motion.div
              style={{ x: xRight }}
              className="flex whitespace-nowrap items-center font-black text-4xl sm:text-6xl lg:text-8xl uppercase tracking-tighter"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
                  
                  <span
                    className="text-transparent"
                    style={{ WebkitTextStroke: "2.5px #3D3F96" }}
                  >
                    Flash-Frozen at Peak
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-[#3D3F96] text-[#3D3F96] shadow-lg ring-4 ring-white">
                    <Sparkles size={24} className="sm:scale-125" />
                  </span>

                  <span className="text-[#3D3F96]">
                    14g+ Prebiotic Fiber
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-emerald-500 text-emerald-600 shadow-lg ring-4 ring-white">
                    <Dna size={24} className="sm:scale-125" />
                  </span>

                  <span
                    className="text-transparent"
                    style={{ WebkitTextStroke: "2.5px #0F172A" }}
                  >
                    30+ Plants Weekly
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-rose-500 text-rose-600 shadow-lg ring-4 ring-white">
                    <HeartPulse size={24} className="sm:scale-125" />
                  </span>

                  <span className="text-slate-900">
                    Ready in 60 Seconds
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-[#3D3F96] text-[#3D3F96] shadow-lg ring-4 ring-white">
                    <CheckCircle2 size={24} className="sm:scale-125" />
                  </span>

                  <span className="text-emerald-700">
                    Polyphenol Rich
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-white border-2 border-teal-500 text-teal-600 shadow-lg ring-4 ring-white">
                    <Apple size={24} className="sm:scale-125" />
                  </span>

                </div>
              ))}
            </motion.div>
          </div>

          {/* ================= TRACK 3: Moving Right-to-Left ================= */}
          <div className="flex overflow-hidden py-1">
            <motion.div
              style={{ x: xLeft }}
              className="flex whitespace-nowrap items-center font-black text-4xl sm:text-6xl lg:text-8xl uppercase tracking-tighter text-slate-800"
            >
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-6 sm:gap-10 shrink-0 pr-6 sm:pr-10">
                  
                  <span className="text-[#3D3F96]">
                    25g+ Clean Plant Protein
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-[#3D3F96] text-white shadow-xl ring-4 ring-[#3D3F96]/20">
                    <Zap size={24} className="sm:scale-125" />
                  </span>

                  <span>Cold-Pressed Dressings</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-amber-500 text-white shadow-xl ring-4 ring-amber-500/20">
                    <Droplets size={24} className="sm:scale-125" />
                  </span>

                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    100% Compostable Packaging
                  </span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-emerald-600 text-white shadow-xl ring-4 ring-emerald-600/20">
                    <Recycle size={24} className="sm:scale-125" />
                  </span>

                  <span>Zero Added Sugars</span>
                  <span className="inline-flex items-center justify-center w-9 h-9 sm:w-14 sm:h-14 rounded-full bg-rose-500 text-white shadow-xl ring-4 ring-rose-500/20">
                    <Flame size={24} className="sm:scale-125" />
                  </span>

                </div>
              ))}
            </motion.div>
          </div>

        </div>

        {/* --- Floating CTA Button & Progress Bar --- */}
        <div className="relative z-30 mt-10 sm:mt-14 flex flex-col items-center gap-4">
          <Link
            href="/food/programs"
            className="relative group inline-flex items-center gap-3 px-8 sm:px-10 py-4 sm:py-5 rounded-full bg-[#3D3F96] text-white font-extrabold text-sm sm:text-base tracking-wide shadow-2xl shadow-[#3D3F96]/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-emerald-500/20 active:translate-y-0"
          >
            {/* Animated Glow Halo */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#3D3F96] via-indigo-500 to-emerald-500 opacity-40 blur-lg group-hover:opacity-100 transition-opacity duration-500 -z-10" />

            <span>Explore All Nutrition Programs</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-2 transition-transform duration-300 ease-out text-emerald-400"
            />
          </Link>

          {/* Dynamic Scroll Indicator Line */}
          <div className="w-48 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="bg-gradient-to-r from-[#3D3F96] to-emerald-500 h-full rounded-full"
              style={{ scaleX: smoothScroll, transformOrigin: "0%" }}
            />
          </div>
        </div>

      </div>
    </section>
  );
}