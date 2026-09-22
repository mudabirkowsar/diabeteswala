"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Leaf,
  ShieldCheck,
  ArrowRight,
  Flame,
  Dna,
  HeartPulse,
  RotateCcw,
  CheckCircle2,
  ChevronDown
} from "lucide-react";

// Ingredient Layers Configuration
const INGREDIENTS = [
  {
    id: "layer-1",
    name: "Golden Pea & Hemp Protein Base",
    role: "Muscle Recovery & Satiety",
    macros: "24g Bioavailable Protein",
    benefits: "Cold-extracted plant amino acids (BCAAs) with zero dairy or gut bloat.",
    badge: "Layer 01 • Clean Fuel",
    icon: Flame,
    threshold: [0.08, 0.30],
    level: 110, // SVG Y-height fill
    color: "#EAC875",
    side: "left"
  },
  {
    id: "layer-2",
    name: "Sprouted Chia & Flax Superseeds",
    role: "Cellular & Brain Health",
    macros: "4,200mg Omega-3 ALA",
    benefits: "Dense soluble fiber matrix and lignans that nourish gut microbiota.",
    badge: "Layer 02 • Healthy Lipids",
    icon: Dna,
    threshold: [0.28, 0.52],
    level: 210,
    color: "#8C6A48",
    side: "right"
  },
  {
    id: "layer-3",
    name: "Wild Arctic Blueberries & Acai",
    role: "Anti-Inflammatory Shield",
    macros: "380mg Anthocyanins",
    benefits: "Flash-frozen at harvest to preserve maximum polyphenol cellular defense.",
    badge: "Layer 03 • Antioxidant Core",
    icon: HeartPulse,
    threshold: [0.50, 0.74],
    level: 310,
    color: "#4A2E6D",
    side: "left"
  },
  {
    id: "layer-4",
    name: "Organic Lacinato Kale & Baby Spinach",
    role: "Chlorophyll & Micronutrients",
    macros: "100% Daily Vit-K & Iron",
    benefits: "Bioavailable lutein, magnesium, and gentle alkalizing greens.",
    badge: "Layer 04 • Micro-Greens",
    icon: Leaf,
    threshold: [0.72, 0.94],
    level: 410,
    color: "#2C5E43",
    side: "right"
  }
];

export default function CupStory() {
  const containerRef = useRef(null);

  // Smooth scroll progression across a 380vh scroll runway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 75,
    damping: 22,
    mass: 0.7,
    restDelta: 0.0001
  });

  // Master SVG Liquid Fill Transformations
  const liquidFillY = useTransform(smoothProgress, [0.08, 0.92], [420, 50]);
  const waveTopY = useTransform(smoothProgress, [0.08, 0.92], [415, 45]);

  // Dynamic falling particle translations for each specific layer
  const drop1Y = useTransform(smoothProgress, [0.06, 0.22], [-80, 360]);
  const drop1Opacity = useTransform(smoothProgress, [0.06, 0.16, 0.24], [0, 1, 0]);

  const drop2Y = useTransform(smoothProgress, [0.26, 0.44], [-80, 270]);
  const drop2Opacity = useTransform(smoothProgress, [0.26, 0.36, 0.46], [0, 1, 0]);

  const drop3Y = useTransform(smoothProgress, [0.48, 0.66], [-80, 180]);
  const drop3Opacity = useTransform(smoothProgress, [0.48, 0.58, 0.68], [0, 1, 0]);

  const drop4Y = useTransform(smoothProgress, [0.70, 0.88], [-80, 90]);
  const drop4Opacity = useTransform(smoothProgress, [0.70, 0.80, 0.90], [0, 1, 0]);

  return (
    <div
      ref={containerRef}
      className="relative bg-[#FAF8F5] text-slate-900 selection:bg-[#3D3F96] selection:text-white"
      style={{ height: "380vh" }}
    >
      {/* Sticky Fullscreen Stage */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-6 lg:px-8 py-6 select-none">
        
        {/* TOP HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-2 z-20 shrink-0">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] text-xs font-black uppercase tracking-widest border border-[#3D3F96]/15 shadow-sm">
            <Sparkles size={13} className="text-[#3D3F96] animate-pulse" />
            Clinical Formulation Inside The Glass
          </div>

          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            Grown for This Moment. <br className="hidden sm:inline" />
            <span className="text-[#3D3F96]">Layered with Precision.</span>
          </h2>
          
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
            Scroll down to watch our clinical ingredients drop and layer into the glass.
          </p>
        </div>

        {/* MIDDLE STAGE: Left Insights + Center Animated SVG Glass + Right Insights */}
        <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto">
          
          {/* LEFT CARDS */}
          <div className="hidden lg:flex flex-col justify-around h-[420px] w-80 z-20">
            {INGREDIENTS.filter((item) => item.side === "left").map((layer) => (
              <GlassSideCard key={layer.id} layer={layer} progress={smoothProgress} />
            ))}
          </div>

          {/* CENTER: HIGH-TECH VECTOR GLASS CANVAS */}
          <div className="relative flex flex-col items-center justify-center mx-auto px-4 z-10">
            
            {/* SVG Glass Illustration */}
            <div className="relative w-[280px] sm:w-[320px] h-[380px] sm:h-[450px] drop-shadow-[0_20px_45px_rgba(61,63,150,0.18)]">
              
              <svg
                viewBox="0 0 320 480"
                className="w-full h-full overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Glass Wall Outer Gradient */}
                  <linearGradient id="glassWallGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    <stop offset="8%" stopColor="#FFFFFF" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
                    <stop offset="92%" stopColor="#FFFFFF" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Glass Base Thickness Gradient */}
                  <linearGradient id="glassBaseGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Layer 1: Protein Base Fluid Gradient */}
                  <linearGradient id="layerProteinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F9E8B6" />
                    <stop offset="50%" stopColor="#E6C875" />
                    <stop offset="100%" stopColor="#D4AE54" />
                  </linearGradient>

                  {/* Layer 2: Chia & Flax Matrix Gradient */}
                  <linearGradient id="layerSeedGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#A5825E" />
                    <stop offset="50%" stopColor="#7E5936" />
                    <stop offset="100%" stopColor="#5E3F21" />
                  </linearGradient>

                  {/* Layer 3: Wild Berry Anthocyanin Gradient */}
                  <linearGradient id="layerBerryGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6C4299" />
                    <stop offset="50%" stopColor="#4A2574" />
                    <stop offset="100%" stopColor="#30154F" />
                  </linearGradient>

                  {/* Layer 4: Organic Kale Green Gradient */}
                  <linearGradient id="layerKaleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#387A57" />
                    <stop offset="50%" stopColor="#245A3C" />
                    <stop offset="100%" stopColor="#174029" />
                  </linearGradient>

                  {/* Glass Interior Clip Path (Tapered Cylinder) */}
                  <clipPath id="glassInteriorClip">
                    <path d="M 44,48 L 276,48 L 254,430 C 252,448 238,458 220,458 L 100,458 C 82,458 68,448 66,430 Z" />
                  </clipPath>

                  {/* Seed Pattern for Layer 2 */}
                  <pattern id="chiaSeedPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                    <ellipse cx="6" cy="6" rx="2" ry="3.5" fill="#3D2612" transform="rotate(25, 6, 6)" />
                    <ellipse cx="14" cy="14" rx="1.8" ry="3" fill="#D9A566" transform="rotate(-30, 14, 14)" />
                    <circle cx="16" cy="5" r="1.2" fill="#201308" />
                  </pattern>
                </defs>

                {/* 1. GLASS BACKDROP & INNER SHADOW */}
                <path
                  d="M 40,40 L 280,40 L 258,435 C 255,455 240,466 220,466 L 100,466 C 80,466 65,455 62,435 Z"
                  fill="rgba(255, 255, 255, 0.4)"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="2"
                />

                {/* 2. LIQUID LAYERS (CLIPPED TO INNER GLASS) */}
                <g clipPath="url(#glassInteriorClip)">
                  
                  {/* Layer 1: Protein Base (Bottom) */}
                  <g>
                    <rect x="30" y="340" width="260" height="130" fill="url(#layerProteinGrad)" />
                    {/* Floating Vanilla Protein Droplets */}
                    <circle cx="100" cy="390" r="4" fill="#FFF2CE" opacity="0.6" />
                    <circle cx="180" cy="420" r="6" fill="#FFF2CE" opacity="0.4" />
                    <circle cx="220" cy="370" r="3" fill="#FFF2CE" opacity="0.7" />
                  </g>

                  {/* Layer 2: Chia Seeds & Sprouted Flax Matrix */}
                  <g>
                    <rect x="30" y="240" width="260" height="110" fill="url(#layerSeedGrad)" />
                    <rect x="30" y="240" width="260" height="110" fill="url(#chiaSeedPattern)" opacity="0.85" />
                  </g>

                  {/* Layer 3: Wild Blueberries & Acai Puree */}
                  <g>
                    <rect x="30" y="140" width="260" height="110" fill="url(#layerBerryGrad)" />
                    {/* SVG Wild Berry Silhouettes inside the layer */}
                    <g opacity="0.75">
                      <circle cx="90" cy="185" r="11" fill="#2B1047" />
                      <circle cx="104" cy="180" r="9" fill="#38185C" />
                      <circle cx="150" cy="195" r="12" fill="#240A3D" />
                      <circle cx="210" cy="175" r="10" fill="#2B1047" />
                      <circle cx="225" cy="185" r="11" fill="#38185C" />
                    </g>
                  </g>

                  {/* Layer 4: Organic Kale & Baby Greens (Top) */}
                  <g>
                    <rect x="30" y="45" width="260" height="105" fill="url(#layerKaleGrad)" />
                    {/* SVG Leaf Details */}
                    <g opacity="0.6" stroke="#1D4B31" strokeWidth="1.5" fill="none">
                      <path d="M 80,75 Q 110,60 130,85" />
                      <path d="M 170,65 Q 200,90 230,70" />
                      <path d="M 120,110 Q 150,130 180,105" />
                    </g>
                  </g>

                  {/* MASKING RECTANGLE THAT REVEALS THE GLASS FROM BOTTOM TO TOP */}
                  <motion.rect
                    x="0"
                    y="0"
                    width="320"
                    style={{ height: liquidFillY }}
                    fill="#FAF8F5"
                  />

                  {/* DYNAMIC LIQUID SURFACE WAVE (Moves along the top of liquid) */}
                  <motion.g style={{ y: waveTopY }}>
                    <motion.path
                      animate={{ x: [-30, 0, -30] }}
                      transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                      d="M 0,0 Q 40,-8 80,0 T 160,0 T 240,0 T 320,0 T 400,0 L 400,20 L 0,20 Z"
                      fill="rgba(255, 255, 255, 0.45)"
                    />
                  </motion.g>

                </g>

                {/* 3. FALLING INGREDIENT SVG ANIMATIONS (Dropping in on scroll) */}
                <g clipPath="url(#glassInteriorClip)" pointerEvents="none">
                  
                  {/* Falling Particle 1: Golden Protein Droplet */}
                  <motion.g style={{ y: drop1Y, opacity: drop1Opacity }}>
                    <path d="M 160,-20 C 150,0 145,15 160,30 C 175,15 170,0 160,-20 Z" fill="#FCE79D" stroke="#D8AB3A" strokeWidth="1.5" />
                  </motion.g>

                  {/* Falling Particle 2: Superfood Seed Clusters */}
                  <motion.g style={{ y: drop2Y, opacity: drop2Opacity }}>
                    <ellipse cx="140" cy="-10" rx="4" ry="7" fill="#5E3F21" transform="rotate(30, 140, -10)" />
                    <ellipse cx="180" cy="-15" rx="4" ry="6" fill="#D9A566" transform="rotate(-40, 180, -15)" />
                    <circle cx="160" cy="-5" r="3" fill="#201308" />
                  </motion.g>

                  {/* Falling Particle 3: Arctic Wild Blueberry */}
                  <motion.g style={{ y: drop3Y, opacity: drop3Opacity }}>
                    <circle cx="155" cy="-15" r="14" fill="#3D1C68" stroke="#6834A8" strokeWidth="2" />
                    <circle cx="150" cy="-20" r="3" fill="#8852D1" opacity="0.6" />
                    <path d="M 152,-15 L 158,-15 M 155,-18 L 155,-12" stroke="#220D3D" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>

                  {/* Falling Particle 4: Fresh Kale Leaf */}
                  <motion.g style={{ y: drop4Y, opacity: drop4Opacity }}>
                    <path
                      d="M 160,-35 C 130,-15 135,15 160,25 C 185,15 190,-15 160,-35 Z"
                      fill="#3AA066"
                      stroke="#1B633A"
                      strokeWidth="2"
                    />
                    <path d="M 160,-28 L 160,20 M 160,-10 L 148,-3 M 160,2 L 172,9" stroke="#1B633A" strokeWidth="1.5" strokeLinecap="round" />
                  </motion.g>

                </g>

                {/* 4. GLASS FOREGROUND: RIM, SPECULAR GLARES & MEASUREMENT TICKS */}
                
                {/* Heavy Glass Bottom Base */}
                <path
                  d="M 62,435 L 72,462 C 76,469 88,474 102,474 L 218,474 C 232,474 244,469 248,462 L 258,435 Z"
                  fill="url(#glassBaseGrad)"
                  stroke="rgba(255, 255, 255, 0.9)"
                  strokeWidth="2"
                />

                {/* Glass Cylindrical Walls Specular Overlay */}
                <path
                  d="M 40,40 L 280,40 L 258,435 C 255,455 240,466 220,466 L 100,466 C 80,466 65,455 62,435 Z"
                  fill="url(#glassWallGrad)"
                  stroke="rgba(255, 255, 255, 0.85)"
                  strokeWidth="2.5"
                  pointerEvents="none"
                />

                {/* Top Glass Rim Ellipse */}
                <ellipse cx="160" cy="40" rx="120" ry="10" fill="none" stroke="#FFFFFF" strokeWidth="3" />
                <ellipse cx="160" cy="40" rx="118" ry="8" fill="rgba(255, 255, 255, 0.2)" />

                {/* Measurement Etchings on Glass */}
                <g opacity="0.5" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none">
                  <line x1="240" y1="120" x2="252" y2="120" />
                  <text x="232" y="123" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#475569" textAnchor="end">500ml</text>

                  <line x1="234" y1="210" x2="244" y2="210" />
                  <text x="226" y="213" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#475569" textAnchor="end">350ml</text>

                  <line x1="226" y1="300" x2="238" y2="300" />
                  <text x="218" y="303" fontSize="8" fontFamily="monospace" fontWeight="bold" fill="#475569" textAnchor="end">200ml</text>
                </g>

                {/* Vertical Specular Glass Reflection Streak */}
                <path
                  d="M 68,52 L 80,52 L 95,435 L 85,435 Z"
                  fill="linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.1) 100%)"
                  opacity="0.6"
                  pointerEvents="none"
                />
              </svg>

            </div>

            {/* Glass Shadow */}
            <div className="w-48 sm:w-60 h-4 bg-slate-900/10 rounded-full blur-lg mt-3" />

            {/* Mobile Insight Accordion / Active View */}
            <div className="lg:hidden mt-3 w-full max-w-xs">
              <MobileInsightCarousel progress={smoothProgress} />
            </div>

          </div>

          {/* RIGHT CARDS */}
          <div className="hidden lg:flex flex-col justify-around h-[420px] w-80 z-20">
            {INGREDIENTS.filter((item) => item.side === "right").map((layer) => (
              <GlassSideCard key={layer.id} layer={layer} progress={smoothProgress} />
            ))}
          </div>

        </div>

        {/* BOTTOM PROGRESS TRACKER & COMPLETION ACTION */}
        <div className="max-w-3xl mx-auto w-full z-20 shrink-0 pt-2 pb-2">
          <BottomController progress={smoothProgress} />
        </div>

      </div>
    </div>
  );
}

// Sub-Component: Desktop Floating Insight Card
function GlassSideCard({ layer, progress }) {
  const Icon = layer.icon;

  const opacity = useTransform(
    progress,
    [
      layer.threshold[0] - 0.05,
      layer.threshold[0],
      layer.threshold[1],
      layer.threshold[1] + 0.05
    ],
    [0.2, 1, 1, 0.4]
  );

  const scale = useTransform(
    progress,
    [layer.threshold[0] - 0.05, layer.threshold[0], layer.threshold[1]],
    [0.92, 1, 1]
  );

  const cardBorder = useTransform(
    progress,
    [layer.threshold[0], layer.threshold[1]],
    ["rgba(61, 63, 150, 0.9)", "rgba(226, 232, 240, 0.8)"]
  );

  return (
    <motion.div
      style={{ opacity, scale, borderColor: cardBorder }}
      className="p-5 rounded-2xl bg-white/95 backdrop-blur-md border shadow-xl shadow-slate-200/50 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#3D3F96] bg-[#3D3F96]/10 px-2.5 py-0.5 rounded-full">
          {layer.badge}
        </span>
        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-[#3D3F96] shadow-sm">
          <Icon size={14} />
        </div>
      </div>

      <h3 className="text-sm font-black text-slate-900 leading-snug">
        {layer.name}
      </h3>

      <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
        {layer.benefits}
      </p>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
        <span className="text-slate-400 uppercase tracking-wider">Potency</span>
        <span className="text-[#3D3F96] font-black">{layer.macros}</span>
      </div>
    </motion.div>
  );
}

// Sub-Component: Mobile Insight Active Card
function MobileInsightCarousel({ progress }) {
  return (
    <div className="relative min-h-[90px]">
      {INGREDIENTS.map((layer) => {
        const opacity = useTransform(
          progress,
          [layer.threshold[0], layer.threshold[0] + 0.05, layer.threshold[1] - 0.05, layer.threshold[1]],
          [0, 1, 1, 0]
        );

        return (
          <motion.div
            key={layer.id}
            style={{ opacity }}
            className="absolute inset-0 p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-md text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[9px] font-black uppercase text-[#3D3F96]">
                {layer.badge}
              </span>
              <h4 className="text-xs font-extrabold text-slate-900 truncate">
                {layer.name}
              </h4>
            </div>
            <div className="flex items-center justify-between text-[11px] font-black text-[#3D3F96] pt-1 border-t border-slate-100">
              <span>{layer.macros}</span>
              <span className="text-[10px] text-slate-400 font-medium">100% Organic</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Sub-Component: Bottom Progress Bar & Final CTA
function BottomController({ progress }) {
  const showCta = useTransform(progress, [0.82, 0.94], [0, 1]);
  const ctaY = useTransform(progress, [0.82, 0.94], [15, 0]);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* 4 Step Fill Bar */}
      <div className="w-full max-w-md grid grid-cols-4 gap-2 px-2">
        {INGREDIENTS.map((layer, idx) => {
          const stepFill = useTransform(
            progress,
            [layer.threshold[0], layer.threshold[1]],
            ["0%", "100%"]
          );

          return (
            <div key={layer.id} className="space-y-1">
              <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  style={{ width: stepFill }}
                  className="h-full bg-[#3D3F96] rounded-full"
                />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block text-center truncate">
                0{idx + 1} {layer.role.split(" ")[0]}
              </span>
            </div>
          );
        })}
      </div>

      {/* Completion CTA (Fades in when glass is full) */}
      <motion.div
        style={{ opacity: showCta, y: ctaY }}
        className="w-full max-w-md pt-1"
      >
        <Link
          href="/food/programs"
          className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#3D3F96] hover:bg-[#31337b] text-white font-black text-sm shadow-xl shadow-[#3D3F96]/25 transition-all transform hover:-translate-y-0.5"
        >
          <span>Build Your Personalized Box</span>
          <ArrowRight size={16} />
        </Link>
      </motion.div>
    </div>
  );
}