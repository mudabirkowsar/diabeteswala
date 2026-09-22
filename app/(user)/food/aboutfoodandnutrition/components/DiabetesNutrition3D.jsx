"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Activity,
  Sparkles,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  Leaf,
  Dna,
  HeartPulse,
  Flame,
  Stethoscope,
  Gauge,
  Icon
} from "lucide-react";

// Diabetic Clinical Phases Data
const DIABETIC_PHASES = [
  {
    id: "phase-1",
    phase: "Phase 01 • Low Glycemic Base",
    title: "Ultra-Low Glycemic Index (<28 GI)",
    side: "left", // Flies in from Left
    threshold: [0.08, 0.28],
    stat: "GI < 28",
    statLabel: "Glycemic Load",
    headline: "Eliminating the Post-Meal Glucose Surge",
    description:
      "Rapid-digesting starches are replaced with slow-burning complex carbs like sprouted black lentils, wild rice, and ancient tubers—preventing insulin spikes that trigger metabolic fatigue.",
    features: [
      "Zero high-GI fillers (no white rice, maltodextrin, or corn syrups)",
      "Continuous sustained cellular energy for 5+ hours",
      "Endocrinologist certified for Pre-Diabetes & Type 2"
    ],
    accentColor: "#3D3F96",
    dialMetric: "98.4%",
    dialLabel: "Glucose Stability"
  },
  {
    id: "phase-2",
    phase: "Phase 02 • Soluble Fiber Mesh",
    title: "14g+ Prebiotic Soluble Fiber Matrix",
    side: "right", // Flies in from Right
    threshold: [0.28, 0.50],
    stat: "14g+",
    statLabel: "Soluble Viscous Fiber",
    headline: "Mechanical Glucose Absorption Delay",
    description:
      "A specialized gel-forming soluble fiber network (sprouted chia, flaxseed mucilage, and organic whole oats) physically slows carbohydrate transport into the bloodstream.",
    features: [
      "Blunts carbohydrate uptake rate by up to 42%",
      "Nourishes Akkermansia muciniphila gut microbiome",
      "Naturally stimulates gut GLP-1 satiety pathways"
    ],
    accentColor: "#10B981",
    dialMetric: "+42%",
    dialLabel: "Absorption Delay"
  },
  {
    id: "phase-3",
    phase: "Phase 03 • Cellular Sensitizers",
    title: "Insulin Receptor Co-Factor Infusion",
    side: "left", // Flies in from Left
    threshold: [0.50, 0.72],
    stat: "400mg",
    statLabel: "Magnesium & Chromium",
    headline: "Restoring Natural Insulin Sensitivity",
    description:
      "Formulated with whole-food micronutrients including bioavailable magnesium, chromium picolinate co-factors, and Ceylon cinnamon polyphenols to activate GLUT-4 glucose transporters.",
    features: [
      "Stimulates natural cellular glucose uptake",
      "Reduces insulin resistance at the muscle receptor level",
      "Cardiovascular endothelial cell protection"
    ],
    accentColor: "#F59E0B",
    dialMetric: "100%",
    dialLabel: "GLUT-4 Activation"
  },
  {
    id: "phase-4",
    phase: "Phase 04 • Pure Lipids",
    title: "Zero Hidden Sugars & Clean Lipid Matrix",
    side: "right", // Flies in from Right
    threshold: [0.72, 0.94],
    stat: "0g",
    statLabel: "Industrial Seed Oils",
    headline: "Suppressing Cellular Lipotoxicity",
    description:
      "Industrial seed oils paralyze metabolic insulin receptors. Every dish is cooked exclusively with cold-pressed extra virgin olive oil, avocado fats, and organic herbs.",
    features: [
      "Zero inflammatory canola, soybean, or palm oils",
      "No artificial sugar alcohols or glycemic spiking syrups",
      "100% Whole food, non-GMO clinical clean label"
    ],
    accentColor: "#06B6D4",
    dialMetric: "0.0%",
    dialLabel: "Inflammatory Lipids"
  }
];

export default function DiabetesNutrition3D() {
  const containerRef = useRef(null);

  // Smooth scroll progression across 400vh runway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 18,
    mass: 0.7,
    restDelta: 0.0001
  });

  // Dynamic Background Hue Shift
  const dynamicBg = useTransform(
    smoothProgress,
    [0.0, 0.2, 0.45, 0.7, 0.9, 1.0],
    [
      "#FAF8F5", // Neutral Linen
      "#F4F3FB", // Soft Indigo Tint (Phase 1)
      "#EEF8F3", // Mint Emerald Tint (Phase 2)
      "#FBF6EC", // Warm Amber Tint (Phase 3)
      "#EDF8FA", // Cyan Blue Tint (Phase 4)
      "#EEF2FA"  // Medical Indigo Finish
    ]
  );

  // 3D Center Dial Dynamic Spatial Rotations
  const centerRotateY = useTransform(smoothProgress, [0, 1], [-30, 30]);
  const centerRotateX = useTransform(smoothProgress, [0, 1], [15, -15]);
  const centerZ = useTransform(smoothProgress, [0, 0.5, 1], [-40, 50, -40]);

  // Click scrubber to jump directly to any milestone
  const scrollToMilestone = (index) => {
    if (!containerRef.current) return;
    const targets = [0.18, 0.40, 0.62, 0.84];
    const targetScroll =
      containerRef.current.offsetTop +
      targets[index] * (containerRef.current.offsetHeight - window.innerHeight);
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor: dynamicBg }}
      className="relative text-slate-900 transition-colors duration-700 select-none selection:bg-[#3D3F96] selection:text-white"
    >
      {/* 400vh Scroll Runway (Provides the scrolling distance while viewport stays pinned) */}
      <div style={{ height: "400vh" }}>
        
        {/* Pinned Sticky Stage (Looks completely static while user scrolls) */}
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-6 lg:px-8 py-5">
          
          {/* TOP STATIC HEADER */}
          <header className="text-center max-w-2xl mx-auto space-y-1.5 z-20 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#3D3F96] text-xs font-black uppercase tracking-widest border border-[#3D3F96]/20 shadow-sm">
              <Sparkles size={13} className="text-[#3D3F96] animate-pulse" />
              Endocrinologist-Formulated Protocol
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Food as Medicine: <br className="hidden sm:inline" />
              <span className="text-[#3D3F96]">Precision Glycemic Management</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Scroll down to explore how our clinical food matrix stabilizes glucose response.
            </p>
          </header>

          {/* MIDDLE SPATIAL 3D STAGE: Left Flying Card + Center 3D Bio-Hub + Right Flying Card */}
          <div
            className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto"
            style={{ perspective: "1400px" }} // Genuine 3D depth perspective
          >
            
            {/* LEFT 3D FLYING CARDS (Phases 1 & 3) */}
            <div className="hidden lg:block relative h-[420px] w-80 z-20 pointer-events-none">
              {DIABETIC_PHASES.filter((p) => p.side === "left").map((phase) => (
                <Spatial3DFlyingCard
                  key={phase.id}
                  phase={phase}
                  progress={smoothProgress}
                />
              ))}
            </div>

            {/* CENTER: 3D HOLOGRAPHIC GLYCEMIC BIO-CORE */}
            <div className="relative flex flex-col items-center justify-center mx-auto px-4 z-10">
              
              <motion.div
                style={{
                  rotateY: centerRotateY,
                  rotateX: centerRotateX,
                  z: centerZ,
                  transformStyle: "preserve-3d"
                }}
                className="relative w-[300px] sm:w-[380px] p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#181A4A] to-[#0E0F2B] text-white border-2 border-white/20 shadow-[0_30px_80px_rgba(61,63,150,0.35)] backdrop-blur-2xl"
              >
                {/* Inner Atmospheric Glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#3D3F96]/40 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                {/* Top Status Line */}
                <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-200">
                      Live Glycemic Hub
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active Telemetry
                  </span>
                </div>

                {/* Central Dynamic Wave SVG: Flattens as you scroll */}
                <div className="relative w-full h-24 my-2 flex items-center justify-center">
                  <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="waveGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#818CF8" />
                        <stop offset="50%" stopColor="#34D399" />
                        <stop offset="100%" stopColor="#38BDF8" />
                      </linearGradient>
                    </defs>

                    {/* Target Safe Glycemic Corridor */}
                    <rect x="0" y="25" width="300" height="30" rx="6" fill="rgba(52, 211, 153, 0.08)" border="1px dashed rgba(52, 211, 153, 0.3)" />

                    {/* Stabilizing Glucose Curve */}
                    <motion.path
                      d="M 0,40 Q 75,32 150,40 T 300,40"
                      fill="none"
                      stroke="url(#waveGlow)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Live Tracking Node */}
                    <circle cx="150" cy="40" r="4.5" fill="#34D399" stroke="#FFFFFF" strokeWidth="2" />
                    <circle cx="150" cy="40" r="9" fill="#34D399" opacity="0.3" className="animate-ping" />
                  </svg>
                </div>

                {/* Live Real-Time Telemetry Counters */}
                <div className="grid grid-cols-3 gap-2.5 text-center mt-3 pt-4 border-t border-white/10">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Peak Load</div>
                    <div className="text-base sm:text-lg font-black text-emerald-400 mt-0.5">&lt; 28 GI</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Soluble Fiber</div>
                    <div className="text-base sm:text-lg font-black text-indigo-300 mt-0.5">14g+</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    <div className="text-[9px] uppercase font-bold text-slate-400">Insulin Surge</div>
                    <div className="text-base sm:text-lg font-black text-teal-300 mt-0.5">0.0%</div>
                  </div>
                </div>
              </motion.div>

              {/* Floor Shadow */}
              <div className="w-56 sm:w-72 h-4 bg-slate-900/10 rounded-full blur-xl mt-3" />

              {/* Mobile Active Insight View */}
              <div className="lg:hidden mt-3 w-full max-w-xs">
                <MobilePhaseIndicator progress={smoothProgress} />
              </div>

            </div>

            {/* RIGHT 3D FLYING CARDS (Phases 2 & 4) */}
            <div className="hidden lg:block relative h-[420px] w-80 z-20 pointer-events-none">
              {DIABETIC_PHASES.filter((p) => p.side === "right").map((phase) => (
                <Spatial3DFlyingCard
                  key={phase.id}
                  phase={phase}
                  progress={smoothProgress}
                />
              ))}
            </div>

          </div>

          {/* BOTTOM TIMELINE SCRUBBER & NEXT.JS ACTION */}
          <footer className="max-w-4xl mx-auto w-full z-20 shrink-0 pt-2 pb-2">
            <BottomScrubber
              progress={smoothProgress}
              onSelectMilestone={scrollToMilestone}
            />
          </footer>

        </div>

      </div>
    </motion.div>
  );
}

// Sub-Component: 3D Flying Card (Flies in from Left/Right & Tilts in genuine 3D space)
function Spatial3DFlyingCard({ phase, progress }) {
  const Icon = phase.icon;
  const isLeft = phase.side === "left";

  // Strict Turn-by-Turn Window
  const opacity = useTransform(
    progress,
    [
      phase.threshold[0] - 0.04,
      phase.threshold[0],
      phase.threshold[1],
      phase.threshold[1] + 0.04
    ],
    [0, 1, 1, 0]
  );

  // 3D Spatial X Flight
  const x = useTransform(
    progress,
    [phase.threshold[0] - 0.04, phase.threshold[0], phase.threshold[1], phase.threshold[1] + 0.04],
    isLeft ? [-220, 0, 0, -220] : [220, 0, 0, 220]
  );

  // 3D Perspective Rotations
  const rotateY = useTransform(
    progress,
    [phase.threshold[0] - 0.04, phase.threshold[0], phase.threshold[1], phase.threshold[1] + 0.04],
    isLeft ? [35, 0, 0, -35] : [-35, 0, 0, 35]
  );

  const z = useTransform(
    progress,
    [phase.threshold[0] - 0.04, phase.threshold[0], phase.threshold[1], phase.threshold[1] + 0.04],
    [-80, 20, 20, -80]
  );

  const scale = useTransform(
    progress,
    [phase.threshold[0] - 0.04, phase.threshold[0], phase.threshold[1], phase.threshold[1] + 0.04],
    [0.85, 1, 1, 0.85]
  );

  return (
    <motion.div
      style={{
        opacity,
        x,
        rotateY,
        z,
        scale,
        transformStyle: "preserve-3d"
      }}
      className="pointer-events-auto absolute inset-0 my-auto h-fit p-6 rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-[#3D3F96] shadow-[0_25px_60px_rgba(61,63,150,0.2)]"
    >
      {/* OPTICAL LASER BEACON TOWARDS THE 3D CORE */}
      {isLeft ? (
        <div className="absolute top-1/2 -right-14 -translate-y-1/2 flex items-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#3D3F96]" />
            <div className="absolute w-6 h-6 rounded-full bg-[#3D3F96]/30 animate-ping" />
          </div>
          <div className="w-8 h-[2px] bg-gradient-to-r from-[#3D3F96] to-[#3D3F96]/60" />
          <svg className="w-5 h-5 text-[#3D3F96] -ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      ) : (
        <div className="absolute top-1/2 -left-14 -translate-y-1/2 flex items-center flex-row-reverse pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#3D3F96]" />
            <div className="absolute w-6 h-6 rounded-full bg-[#3D3F96]/30 animate-ping" />
          </div>
          <div className="w-8 h-[2px] bg-gradient-to-l from-[#3D3F96] to-[#3D3F96]/60" />
          <svg className="w-5 h-5 text-[#3D3F96] -mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
      )}

      {/* Card Content */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#3D3F96] px-3 py-1 rounded-full shadow-sm">
          {phase.phase}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96]">
          <Icon size={16} />
        </div>
      </div>

      <h3 className="text-base font-black text-slate-900 leading-snug">
        {phase.title}
      </h3>

      <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
        {phase.description}
      </p>

      {/* Checklist */}
      <div className="space-y-1.5 pt-3 mt-3 border-t border-slate-100">
        {phase.features.map((feat, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
            <CheckCircle2 size={13} className="text-[#3D3F96] shrink-0" />
            <span className="truncate">{feat}</span>
          </div>
        ))}
      </div>

      {/* Metric Badge */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-wider text-[10px]">Clinical Spec</span>
        <span className="text-[#3D3F96] font-black">{phase.stat}</span>
      </div>
    </motion.div>
  );
}

// Sub-Component: Mobile Phase HUD
function MobilePhaseIndicator({ progress }) {
  return (
    <div className="relative min-h-[110px]">
      {DIABETIC_PHASES.map((phase) => {
        const opacity = useTransform(
          progress,
          [phase.threshold[0] - 0.03, phase.threshold[0], phase.threshold[1], phase.threshold[1] + 0.03],
          [0, 1, 1, 0]
        );

        const y = useTransform(
          progress,
          [phase.threshold[0] - 0.03, phase.threshold[0], phase.threshold[1], phase.threshold[1] + 0.03],
          [12, 0, 0, -12]
        );

        return (
          <motion.div
            key={phase.id}
            style={{ opacity, y }}
            className="absolute inset-0 p-3.5 rounded-2xl bg-white/95 border-2 border-[#3D3F96] shadow-lg text-left flex flex-col justify-between"
          >
            <div>
              <span className="text-[9px] font-black uppercase text-[#3D3F96]">
                {phase.phase}
              </span>
              <h4 className="text-xs font-extrabold text-slate-900 truncate">
                {phase.title}
              </h4>
            </div>
            <div className="flex items-center justify-between text-[11px] font-black text-[#3D3F96] pt-1 border-t border-slate-100">
              <span>{phase.stat}</span>
              <span className="text-[10px] text-slate-400 font-medium">Endocrinologist Approved</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Sub-Component: Bottom Scrubber Timeline & Next.js Direct Link
function BottomScrubber({ progress, onSelectMilestone }) {
  const showCta = useTransform(progress, [0.82, 0.94], [0, 1]);
  const ctaY = useTransform(progress, [0.82, 0.94], [15, 0]);

  return (
    <div className="flex flex-col items-center gap-3">
      
      {/* 4-Step Milestone Progress Bar */}
      <div className="w-full max-w-xl grid grid-cols-4 gap-2.5 px-2">
        {DIABETIC_PHASES.map((phase, idx) => {
          const stepFill = useTransform(
            progress,
            [phase.threshold[0], phase.threshold[1]],
            ["0%", "100%"]
          );

          return (
            <button
              key={phase.id}
              type="button"
              onClick={() => onSelectMilestone(idx)}
              className="space-y-1.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/40">
                <motion.div
                  style={{ width: stepFill }}
                  className="h-full bg-[#3D3F96] rounded-full"
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                <span className="truncate">0{idx + 1} {phase.phase.split("•")[1]?.trim() || "Phase"}</span>
                <span className="text-[9px] text-[#3D3F96] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
                  Jump
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion CTA linking to /food/programs */}
      <motion.div
        style={{ opacity: showCta, y: ctaY }}
        className="w-full max-w-md pt-1"
      >
        <Link
          href="/food/programs?plan=glycemic-balance"
          className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#3D3F96] hover:bg-[#303277] text-white font-black text-sm shadow-xl shadow-[#3D3F96]/25 transition-all transform hover:-translate-y-0.5 group"
        >
          <span>Explore All Diabetic Health Plans</span>
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}