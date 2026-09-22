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
  CheckCircle2
} from "lucide-react";

export default function KineticScrollBanner() {
  const containerRef = useRef(null);

  // Track scroll progress inside this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Smooth physics-based spring translation
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 22,
    mass: 0.6,
    restDelta: 0.0001
  });

  // Dual opposing horizontal translations
  const xLeft = useTransform(smoothScroll, [0, 1], ["0%", "-40%"]);
  const xRight = useTransform(smoothScroll, [0, 1], ["-40%", "0%"]);

  return (
    <section
      ref={containerRef}
      className="relative w-full py-24 sm:py-32 bg-[#FAF8F5] overflow-hidden select-none"
    >
      {/* --- Ambient Background Lighting Mesh --- */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] sm:w-[1000px] h-[400px] sm:h-[500px] bg-gradient-to-tr from-[#3D3F96]/15 via-emerald-500/10 to-amber-500/10 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none -z-10" />

      {/* --- Edge Blur & Gradient Masking Overlays --- */}
      <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-64 z-20 pointer-events-none bg-gradient-to-r from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent backdrop-blur-[1px]" />
      <div className="absolute right-0 top-0 bottom-0 w-28 sm:w-64 z-20 pointer-events-none bg-gradient-to-l from-[#FAF8F5] via-[#FAF8F5]/90 to-transparent backdrop-blur-[1px]" />

      {/* --- Angled Kinetic Track Wrapper --- */}
      <div className="relative -rotate-2 space-y-6 sm:space-y-8">
        
        {/* TRACK 1: Moving Right-to-Left (Filled Solid & Gradient Typography) */}
        <div className="flex overflow-hidden py-2">
          <motion.div
            style={{ x: xLeft }}
            className="flex whitespace-nowrap items-center font-black text-5xl sm:text-7xl lg:text-9xl uppercase tracking-tighter text-slate-900"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 sm:gap-12 shrink-0 pr-6 sm:pr-12">
                
                {/* Item 1 */}
                <span className="hover:text-[#3D3F96] transition-colors duration-300">
                  Doctor Formulated
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-[#3D3F96] text-white shadow-xl shadow-[#3D3F96]/30 ring-4 ring-[#3D3F96]/20">
                  <ShieldCheck size={28} className="sm:scale-125" />
                </span>

                {/* Item 2 */}
                <span className="bg-gradient-to-r from-[#3D3F96] to-indigo-600 bg-clip-text text-transparent">
                  100% Organic Whole Food
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-emerald-500 text-white shadow-xl shadow-emerald-500/30 ring-4 ring-emerald-500/20">
                  <Leaf size={28} className="sm:scale-125" />
                </span>

                {/* Item 3 */}
                <span className="hover:text-emerald-600 transition-colors duration-300">
                  Zero Seed Oils
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-amber-500 text-white shadow-xl shadow-amber-500/30 ring-4 ring-amber-500/20">
                  <Flame size={28} className="sm:scale-125" />
                </span>

                {/* Item 4 */}
                <span className="text-slate-900">
                  Glycemic Index &lt; 28
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-600/20">
                  <Activity size={28} className="sm:scale-125" />
                </span>

              </div>
            ))}
          </motion.div>
        </div>

        {/* TRACK 2: Moving Left-to-Right (Stylized Outlined Typography) */}
        <div className="flex overflow-hidden py-2">
          <motion.div
            style={{ x: xRight }}
            className="flex whitespace-nowrap items-center font-black text-5xl sm:text-7xl lg:text-9xl uppercase tracking-tighter"
          >
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-6 sm:gap-12 shrink-0 pr-6 sm:pr-12">
                
                {/* Item 1 */}
                <span
                  className="text-transparent transition-all duration-300 hover:text-[#3D3F96]"
                  style={{
                    WebkitTextStroke: "2.5px #3D3F96"
                  }}
                >
                  Flash-Frozen at Peak
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-md border-2 border-[#3D3F96] text-[#3D3F96] shadow-lg ring-4 ring-white">
                  <Sparkles size={28} className="sm:scale-125" />
                </span>

                {/* Item 2 */}
                <span className="text-[#3D3F96]">
                  14g+ Prebiotic Fiber
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-md border-2 border-emerald-500 text-emerald-600 shadow-lg ring-4 ring-white">
                  <Dna size={28} className="sm:scale-125" />
                </span>

                {/* Item 3 */}
                <span
                  className="text-transparent transition-all duration-300 hover:text-slate-900"
                  style={{
                    WebkitTextStroke: "2.5px #0F172A"
                  }}
                >
                  30+ Plants Weekly
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-md border-2 border-rose-500 text-rose-600 shadow-lg ring-4 ring-white">
                  <HeartPulse size={28} className="sm:scale-125" />
                </span>

                {/* Item 4 */}
                <span className="text-slate-900">
                  Ready in 60 Seconds
                </span>
                <span className="inline-flex items-center justify-center w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-white/80 backdrop-blur-md border-2 border-[#3D3F96] text-[#3D3F96] shadow-lg ring-4 ring-white">
                  <CheckCircle2 size={28} className="sm:scale-125" />
                </span>

              </div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* --- Enhanced Floating CTA Button --- */}
      <div className="relative z-30 mt-16 sm:mt-20 flex justify-center">
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
      </div>

    </section>
  );
}