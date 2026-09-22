"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import {
  Sparkles,
  Leaf,
  ArrowRight,
  Flame,
  Dna,
  HeartPulse,
  Activity,
  ShieldCheck,
  Check,
  Zap
} from "lucide-react";

// Ingredient Telemetry & Layer Data
const INGREDIENTS = [
  {
    id: "layer-1",
    name: "Golden Pea & Sprouted Hemp Protein",
    role: "Muscle Protein Synthesis & Fullness",
    macros: "24g Bioavailable Protein",
    statValue: 24,
    statUnit: "g",
    statLabel: "Clean Protein",
    benefits: "Cold-pressed complete amino acid matrix (high BCAA) with zero dairy or gut bloat.",
    badge: "Phase 01 • Bio-Protein",
    icon: Flame,
    threshold: [0.08, 0.28],
    accentColor: "#D9A036",
    glassY: 370,
    side: "left"
  },
  {
    id: "layer-2",
    name: "Sprouted Chia & Cold-Milled Flaxseeds",
    role: "Cellular Longevity & Gut Microbiome",
    macros: "4,200mg Omega-3 ALA",
    statValue: 4.2,
    statUnit: "g",
    statLabel: "Omega-3 ALA",
    benefits: "Rich in soluble mucilage fiber and plant lignans to balance microbiome diversity.",
    badge: "Phase 02 • Healthy Lipids",
    icon: Dna,
    threshold: [0.28, 0.50],
    accentColor: "#966A3F",
    glassY: 280,
    side: "right"
  },
  {
    id: "layer-3",
    name: "Wild Arctic Blueberries & Acai Puree",
    role: "Cellular Anti-Inflammatory Defense",
    macros: "380mg Active Anthocyanins",
    statValue: 380,
    statUnit: "mg",
    statLabel: "Anthocyanins",
    benefits: "Harvested at peak solar ripeness and flash-frozen to preserve cellular polyphenols.",
    badge: "Phase 03 • Antioxidant Core",
    icon: HeartPulse,
    threshold: [0.50, 0.72],
    accentColor: "#673AB7",
    glassY: 190,
    side: "left"
  },
  {
    id: "layer-4",
    name: "Organic Lacinato Kale & Baby Spinach",
    role: "Cellular Alkalization & Micronutrients",
    macros: "100% Daily Vitamin K & Folate",
    statValue: 100,
    statUnit: "%",
    statLabel: "Daily Vit-K",
    benefits: "Concentrated bioactive lutein, magnesium, and gentle alkalizing chlorophyll.",
    badge: "Phase 04 • Micro-Greens",
    icon: Leaf,
    threshold: [0.72, 0.94],
    accentColor: "#2D7D46",
    glassY: 100,
    side: "right"
  }
];

export default function CupStory() {
  const containerRef = useRef(null);

  // Smooth scroll progression across 380vh scroll track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Butter-smooth spring physics
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 18,
    mass: 0.65,
    restDelta: 0.0001
  });

  // Dynamic Ambient Section Lighting
  const dynamicBg = useTransform(
    smoothProgress,
    [0.0, 0.18, 0.38, 0.60, 0.82, 1.0],
    [
      "#FAF8F5", // Pristine Linen
      "#FBF4DF", // Warm Golden Glow
      "#F5EDE4", // Nutty Warm Amber
      "#F2ECF8", // Soft Deep Berry
      "#EBF5EE", // Botanical Green
      "#EFF3FA"  // Medical Indigo Finish
    ]
  );

  const ambientGlow = useTransform(
    smoothProgress,
    [0.0, 0.18, 0.38, 0.60, 0.82, 1.0],
    [
      "rgba(61,63,150,0.06)",
      "rgba(217,160,54,0.15)",
      "rgba(150,106,63,0.15)",
      "rgba(103,58,183,0.14)",
      "rgba(45,125,70,0.14)",
      "rgba(61,63,150,0.18)"
    ]
  );

  // Master SVG Fluid Fill Levels
  const liquidFillY = useTransform(smoothProgress, [0.08, 0.92], [440, 60]);
  const waveFrontY = useTransform(smoothProgress, [0.08, 0.92], [436, 56]);
  const waveBackY = useTransform(smoothProgress, [0.08, 0.92], [440, 60]);

  // Falling Ingredient Organic Vector Particles
  const drop1Y = useTransform(smoothProgress, [0.06, 0.22], [-100, 390]);
  const drop1Rotate = useTransform(smoothProgress, [0.06, 0.22], [0, 45]);
  const drop1Opacity = useTransform(smoothProgress, [0.06, 0.14, 0.22], [0, 1, 0]);

  const drop2Y = useTransform(smoothProgress, [0.26, 0.42], [-100, 300]);
  const drop2Rotate = useTransform(smoothProgress, [0.26, 0.42], [15, -60]);
  const drop2Opacity = useTransform(smoothProgress, [0.26, 0.34, 0.42], [0, 1, 0]);

  const drop3Y = useTransform(smoothProgress, [0.48, 0.64], [-100, 200]);
  const drop3Rotate = useTransform(smoothProgress, [0.48, 0.64], [-20, 50]);
  const drop3Opacity = useTransform(smoothProgress, [0.48, 0.56, 0.64], [0, 1, 0]);

  const drop4Y = useTransform(smoothProgress, [0.70, 0.86], [-100, 110]);
  const drop4Rotate = useTransform(smoothProgress, [0.70, 0.86], [30, -35]);
  const drop4Opacity = useTransform(smoothProgress, [0.70, 0.78, 0.86], [0, 1, 0]);

  // Click handler to scrub to milestone
  const scrollToMilestone = (index) => {
    if (!containerRef.current) return;
    const targets = [0.18, 0.40, 0.62, 0.84];
    const targetScroll = containerRef.current.offsetTop + targets[index] * (containerRef.current.offsetHeight - window.innerHeight);
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  return (
    <motion.div
      ref={containerRef}
      style={{ backgroundColor: dynamicBg }}
      className="relative text-slate-900 transition-colors duration-700 selection:bg-[#3D3F96] selection:text-white"
    >
      <div style={{ height: "380vh" }}>
        
        {/* Sticky Stage Viewport */}
        <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-6 lg:px-8 py-5 select-none">
          
          {/* Ambient Lighting Orb */}
          <motion.div
            style={{ backgroundColor: ambientGlow }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -z-10"
          />

          {/* TOP HEADER */}
          <div className="text-center max-w-2xl mx-auto space-y-1.5 z-20 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#3D3F96] text-xs font-black uppercase tracking-widest border border-[#3D3F96]/20 shadow-sm">
              <Sparkles size={13} className="text-[#3D3F96] animate-pulse" />
              Clinical Nutritional Architecture
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              Grown with Purpose. <br className="hidden sm:inline" />
              <span className="text-[#3D3F96]">Formulated Layer by Layer.</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Scroll down to watch our clinical ingredients drop and layer into the glass.
            </p>
          </div>

          {/* MIDDLE STAGE: Left Laser HUD + Center Vector Glass + Right Laser HUD */}
          <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto">
            
            {/* LEFT SIDE CARDS */}
            <div className="hidden lg:block relative h-[420px] w-80 z-20">
              {INGREDIENTS.filter((item) => item.side === "left").map((layer) => (
                <LaserCard
                  key={layer.id}
                  layer={layer}
                  progress={smoothProgress}
                  glassFillY={liquidFillY}
                />
              ))}
            </div>

            {/* CENTER: HIGH-RESOLUTION SVG GLASS CONTAINER */}
            <div className="relative flex flex-col items-center justify-center mx-auto px-4 z-10">
              
              <div className="relative w-[280px] sm:w-[330px] h-[390px] sm:h-[460px] drop-shadow-[0_25px_50px_rgba(61,63,150,0.22)]">
                
                <svg
                  viewBox="0 0 340 500"
                  className="w-full h-full overflow-visible"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Glass Body Outer Cylindrical Shading */}
                    <linearGradient id="glassBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
                      <stop offset="10%" stopColor="#FFFFFF" stopOpacity="0.25" />
                      <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.04" />
                      <stop offset="90%" stopColor="#FFFFFF" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.85" />
                    </linearGradient>

                    {/* Heavy Curved Glass Base */}
                    <linearGradient id="glassHeavyBase" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#CBD5E1" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.9" />
                    </linearGradient>

                    {/* Layer 1: Golden Pea Protein */}
                    <linearGradient id="layer1Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FDEAB2" />
                      <stop offset="50%" stopColor="#E6C875" />
                      <stop offset="100%" stopColor="#CF9F34" />
                    </linearGradient>

                    {/* Layer 2: Chia & Flax Matrix */}
                    <linearGradient id="layer2Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A88157" />
                      <stop offset="50%" stopColor="#7B542E" />
                      <stop offset="100%" stopColor="#54371B" />
                    </linearGradient>

                    {/* Layer 3: Wild Arctic Berry */}
                    <linearGradient id="layer3Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7649A8" />
                      <stop offset="50%" stopColor="#4A2675" />
                      <stop offset="100%" stopColor="#2E124D" />
                    </linearGradient>

                    {/* Layer 4: Organic Curly Kale */}
                    <linearGradient id="layer4Grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#3C855D" />
                      <stop offset="50%" stopColor="#225D3D" />
                      <stop offset="100%" stopColor="#143E27" />
                    </linearGradient>

                    {/* Tapered Glass Interior Clip Path */}
                    <clipPath id="glassInteriorClip">
                      <path d="M 48,54 L 292,54 L 268,446 C 265,468 248,478 226,478 L 114,478 C 92,478 75,468 72,446 Z" />
                    </clipPath>

                    {/* Chia Seed Speckle Matrix Pattern */}
                    <pattern id="chiaMatrix" x="0" y="0" width="22" height="22" patternUnits="userSpaceOnUse">
                      <ellipse cx="6" cy="6" rx="2" ry="3.8" fill="#3D2612" transform="rotate(28, 6, 6)" />
                      <ellipse cx="15" cy="15" rx="1.8" ry="3.2" fill="#D9A566" transform="rotate(-35, 15, 15)" />
                      <circle cx="17" cy="5" r="1.4" fill="#1C0F05" />
                      <circle cx="4" cy="18" r="1.1" fill="#E6BA80" />
                    </pattern>
                  </defs>

                  {/* 1. GLASS BACKDROP INNER AMBIENCE */}
                  <path
                    d="M 44,45 L 296,45 L 272,450 C 268,474 250,486 226,486 L 114,486 C 90,486 72,474 68,450 Z"
                    fill="rgba(255, 255, 255, 0.45)"
                    stroke="rgba(255, 255, 255, 0.95)"
                    strokeWidth="2"
                  />

                  {/* 2. CLIPPED LIQUID FLUID STACK */}
                  <g clipPath="url(#glassInteriorClip)">
                    
                    {/* Layer 1: Protein Base */}
                    <g>
                      <rect x="30" y="350" width="280" height="140" fill="url(#layer1Grad)" />
                      <circle cx="110" cy="410" r="5" fill="#FFF2CE" opacity="0.6" />
                      <circle cx="200" cy="430" r="7" fill="#FFF2CE" opacity="0.4" />
                      <circle cx="240" cy="385" r="4" fill="#FFF2CE" opacity="0.7" />
                    </g>

                    {/* Layer 2: Chia Seeds & Sprouted Flax */}
                    <g>
                      <rect x="30" y="250" width="280" height="110" fill="url(#layer2Grad)" />
                      <rect x="30" y="250" width="280" height="110" fill="url(#chiaMatrix)" opacity="0.9" />
                    </g>

                    {/* Layer 3: Wild Blueberries & Acai */}
                    <g>
                      <rect x="30" y="150" width="280" height="110" fill="url(#layer3Grad)" />
                      <g opacity="0.8">
                        <circle cx="95" cy="195" r="13" fill="#2B1047" />
                        <circle cx="115" cy="190" r="10" fill="#38185C" />
                        <circle cx="165" cy="205" r="14" fill="#240A3D" />
                        <circle cx="230" cy="185" r="12" fill="#2B1047" />
                        <circle cx="248" cy="198" r="13" fill="#38185C" />
                      </g>
                    </g>

                    {/* Layer 4: Organic Curly Kale */}
                    <g>
                      <rect x="30" y="50" width="280" height="110" fill="url(#layer4Grad)" />
                      <g opacity="0.6" stroke="#184D30" strokeWidth="1.8" fill="none" strokeLinecap="round">
                        <path d="M 85,85 Q 120,65 145,95" />
                        <path d="M 185,75 Q 220,105 255,80" />
                        <path d="M 130,125 Q 165,145 200,120" />
                      </g>
                    </g>

                    {/* PROGRESSIVE MASK REVEAL */}
                    <motion.rect
                      x="0"
                      y="0"
                      width="340"
                      style={{ height: liquidFillY }}
                      fill="#FAF8F5"
                    />

                    {/* DUAL OUT-OF-PHASE FLUID SURFACE WAVES */}
                    {/* Background Wave */}
                    <motion.g style={{ y: waveBackY }}>
                      <motion.path
                        animate={{ x: [0, -40, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                        d="M -40,0 Q 20,8 80,0 T 200,0 T 320,0 T 440,0 L 440,24 L -40,24 Z"
                        fill="rgba(255, 255, 255, 0.3)"
                      />
                    </motion.g>

                    {/* Foreground Crest Wave */}
                    <motion.g style={{ y: waveFrontY }}>
                      <motion.path
                        animate={{ x: [-40, 0, -40] }}
                        transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }}
                        d="M -40,0 Q 30,-10 90,0 T 210,0 T 330,0 T 450,0 L 450,24 L -40,24 Z"
                        fill="rgba(255, 255, 255, 0.55)"
                      />
                    </motion.g>

                    {/* RISING MICRO-BUBBLE PARTICLES */}
                    <g opacity="0.6" pointerEvents="none">
                      <motion.circle
                        animate={{ y: [460, 60], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: "easeOut" }}
                        cx="120"
                        r="2.5"
                        fill="#FFFFFF"
                      />
                      <motion.circle
                        animate={{ y: [460, 60], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 3.6, delay: 0.8, ease: "easeOut" }}
                        cx="180"
                        r="3.5"
                        fill="#FFFFFF"
                      />
                      <motion.circle
                        animate={{ y: [460, 60], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2.4, delay: 1.4, ease: "easeOut" }}
                        cx="225"
                        r="2"
                        fill="#FFFFFF"
                      />
                    </g>

                  </g>

                  {/* 3. PHYSICS DROPPING VECTOR INGREDIENTS */}
                  <g clipPath="url(#glassInteriorClip)" pointerEvents="none">
                    
                    {/* Dropping 1: Golden Protein Droplet */}
                    <motion.g style={{ y: drop1Y, rotate: drop1Rotate, opacity: drop1Opacity }}>
                      <path d="M 170,-25 C 158,-2 152,15 170,32 C 188,15 182,-2 170,-25 Z" fill="#FCE79D" stroke="#D8AB3A" strokeWidth="2" />
                      <circle cx="166" cy="6" r="3" fill="#FFFFFF" opacity="0.6" />
                    </motion.g>

                    {/* Dropping 2: Sprouted Chia Seed Matrix */}
                    <motion.g style={{ y: drop2Y, rotate: drop2Rotate, opacity: drop2Opacity }}>
                      <ellipse cx="150" cy="-10" rx="5" ry="8" fill="#5E3F21" transform="rotate(30, 150, -10)" />
                      <ellipse cx="190" cy="-15" rx="5" ry="7" fill="#D9A566" transform="rotate(-40, 190, -15)" />
                      <circle cx="170" cy="-5" r="4" fill="#201308" />
                    </motion.g>

                    {/* Dropping 3: Arctic Wild Blueberries with Crown */}
                    <motion.g style={{ y: drop3Y, rotate: drop3Rotate, opacity: drop3Opacity }}>
                      <circle cx="165" cy="-15" r="16" fill="#3D1C68" stroke="#6834A8" strokeWidth="2.5" />
                      <circle cx="159" cy="-21" r="3.5" fill="#8852D1" opacity="0.7" />
                      <path d="M 160,-15 L 170,-15 M 165,-20 L 165,-10" stroke="#220D3D" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                    {/* Dropping 4: Organic Lacinato Kale Leaf */}
                    <motion.g style={{ y: drop4Y, rotate: drop4Rotate, opacity: drop4Opacity }}>
                      <path
                        d="M 170,-40 C 135,-15 140,20 170,32 C 200,20 205,-15 170,-40 Z"
                        fill="#3AA066"
                        stroke="#1B633A"
                        strokeWidth="2.5"
                      />
                      <path d="M 170,-32 L 170,24 M 170,-12 L 156,-4 M 170,4 L 184,12" stroke="#1B633A" strokeWidth="2" strokeLinecap="round" />
                    </motion.g>

                  </g>

                  {/* 4. GLASS FOREGROUND SPECULAR REFRACTION */}
                  {/* Heavy Glass Curved Base */}
                  <path
                    d="M 68,450 L 80,480 C 85,488 98,494 114,494 L 226,494 C 242,494 255,488 260,480 L 272,450 Z"
                    fill="url(#glassHeavyBase)"
                    stroke="rgba(255, 255, 255, 0.95)"
                    strokeWidth="2"
                  />

                  {/* Outer Glass Wall Cylindrical Glare */}
                  <path
                    d="M 44,45 L 296,45 L 272,450 C 268,474 250,486 226,486 L 114,486 C 90,486 72,474 68,450 Z"
                    fill="url(#glassBodyGrad)"
                    stroke="rgba(255, 255, 255, 0.9)"
                    strokeWidth="2.5"
                    pointerEvents="none"
                  />

                  {/* Top Glass Rim Ellipse */}
                  <ellipse cx="170" cy="45" rx="126" ry="11" fill="none" stroke="#FFFFFF" strokeWidth="3.5" />
                  <ellipse cx="170" cy="45" rx="124" ry="9" fill="rgba(255, 255, 255, 0.25)" />

                  {/* Etched Milliliter Measurement Ticks */}
                  <g opacity="0.55" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" fill="none">
                    <line x1="254" y1="130" x2="268" y2="130" />
                    <text x="246" y="133" fontSize="8.5" fontFamily="monospace" fontWeight="bold" fill="#475569" textAnchor="end">500ml</text>

                    <line x1="248" y1="225" x2="260" y2="225" />
                    <text x="240" y="228" fontSize="8.5" fontFamily="monospace" fontWeight="bold" fill="#475569" textAnchor="end">350ml</text>

                    <line x1="240" y1="320" x2="254" y2="320" />
                    <text x="232" y="323" fontSize="8.5" fontFamily="monospace" fontWeight="bold" fill="#475569" textAnchor="end">200ml</text>
                  </g>

                  {/* Vertical Caustic Specular Glare Streak */}
                  <path
                    d="M 74,58 L 88,58 L 105,450 L 92,450 Z"
                    fill="linear-gradient(180deg, rgba(255,255,255,0.75) 0%, rgba(255,255,255,0.05) 100%)"
                    opacity="0.65"
                    pointerEvents="none"
                  />
                </svg>

              </div>

              {/* Glass Floor Contact Shadow */}
              <div className="w-52 sm:w-64 h-4 bg-slate-900/10 rounded-full blur-lg mt-3" />

              {/* Mobile Active HUD Indicator */}
              <div className="lg:hidden mt-3 w-full max-w-xs">
                <MobileLaserHUD progress={smoothProgress} />
              </div>

            </div>

            {/* RIGHT SIDE CARDS */}
            <div className="hidden lg:block relative h-[420px] w-80 z-20">
              {INGREDIENTS.filter((item) => item.side === "right").map((layer) => (
                <LaserCard
                  key={layer.id}
                  layer={layer}
                  progress={smoothProgress}
                  glassFillY={liquidFillY}
                />
              ))}
            </div>

          </div>

          {/* BOTTOM TELEMETRY HUD & MILESTONE SCRUBBER */}
          <div className="max-w-4xl mx-auto w-full z-20 shrink-0 pt-2 pb-2">
            <BottomTelemetry
              progress={smoothProgress}
              onSelectMilestone={scrollToMilestone}
            />
          </div>

        </div>

      </div>
    </motion.div>
  );
}

// Sub-Component: Desktop Laser Target Card with Optical Directional Pointer
function LaserCard({ layer, progress, glassFillY }) {
  const Icon = layer.icon;

  // Strict Window Visibility
  const opacity = useTransform(
    progress,
    [
      layer.threshold[0] - 0.04,
      layer.threshold[0],
      layer.threshold[1],
      layer.threshold[1] + 0.04
    ],
    [0, 1, 1, 0]
  );

  const x = useTransform(
    progress,
    [layer.threshold[0] - 0.04, layer.threshold[0], layer.threshold[1], layer.threshold[1] + 0.04],
    layer.side === "left" ? [-30, 0, 0, -30] : [30, 0, 0, 30]
  );

  const scale = useTransform(
    progress,
    [layer.threshold[0] - 0.04, layer.threshold[0], layer.threshold[1], layer.threshold[1] + 0.04],
    [0.9, 1, 1, 0.9]
  );

  const isLeft = layer.side === "left";

  return (
    <motion.div
      style={{ opacity, x, scale }}
      className="absolute inset-0 my-auto h-fit p-6 rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-[#3D3F96] shadow-[0_20px_50px_rgba(61,63,150,0.18)]"
    >
      {/* OPTICAL DIRECTIONAL LASER POINTER TOWARDS GLASS */}
      {isLeft ? (
        <div className="absolute top-1/2 -right-14 -translate-y-1/2 flex items-center pointer-events-none">
          {/* Laser Pulsing Anchor Dot */}
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#3D3F96]" />
            <div className="absolute w-6 h-6 rounded-full bg-[#3D3F96]/30 animate-ping" />
          </div>
          {/* Laser Guide Line */}
          <div className="w-8 h-[2px] bg-gradient-to-r from-[#3D3F96] to-[#3D3F96]/60" />
          {/* Directional Arrow Head */}
          <svg className="w-5 h-5 text-[#3D3F96] -ml-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      ) : (
        <div className="absolute top-1/2 -left-14 -translate-y-1/2 flex items-center flex-row-reverse pointer-events-none">
          {/* Laser Pulsing Anchor Dot */}
          <div className="relative flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-[#3D3F96]" />
            <div className="absolute w-6 h-6 rounded-full bg-[#3D3F96]/30 animate-ping" />
          </div>
          {/* Laser Guide Line */}
          <div className="w-8 h-[2px] bg-gradient-to-l from-[#3D3F96] to-[#3D3F96]/60" />
          {/* Directional Arrow Head */}
          <svg className="w-5 h-5 text-[#3D3F96] -mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </div>
      )}

      {/* Card Header & Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#3D3F96] px-3 py-1 rounded-full shadow-sm">
          {layer.badge}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96]">
          <Icon size={16} />
        </div>
      </div>

      {/* Title & Role */}
      <h3 className="text-base font-black text-slate-900 leading-snug">
        {layer.name}
      </h3>

      <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
        {layer.benefits}
      </p>

      {/* Live Potency Telemetry Pill */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Zap size={12} className="text-[#3D3F96]" /> Potency Matrix
        </span>
        <span className="text-[#3D3F96] font-black text-xs">{layer.macros}</span>
      </div>
    </motion.div>
  );
}

// Sub-Component: Mobile Laser HUD Indicator
function MobileLaserHUD({ progress }) {
  return (
    <div className="relative min-h-[96px]">
      {INGREDIENTS.map((layer) => {
        const opacity = useTransform(
          progress,
          [layer.threshold[0] - 0.03, layer.threshold[0], layer.threshold[1], layer.threshold[1] + 0.03],
          [0, 1, 1, 0]
        );

        const y = useTransform(
          progress,
          [layer.threshold[0] - 0.03, layer.threshold[0], layer.threshold[1], layer.threshold[1] + 0.03],
          [12, 0, 0, -12]
        );

        return (
          <motion.div
            key={layer.id}
            style={{ opacity, y }}
            className="absolute inset-0 p-3.5 rounded-2xl bg-white/95 border-2 border-[#3D3F96] shadow-lg text-left flex flex-col justify-between"
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

// Sub-Component: Bottom Live Telemetry & Interactive Scrubber
function BottomTelemetry({ progress, onSelectMilestone }) {
  const showCta = useTransform(progress, [0.82, 0.94], [0, 1]);
  const ctaY = useTransform(progress, [0.82, 0.94], [15, 0]);

  return (
    <div className="flex flex-col items-center gap-3">
      
      {/* 4-Step Interactive Milestone Scrubber */}
      <div className="w-full max-w-xl grid grid-cols-4 gap-2.5 px-2">
        {INGREDIENTS.map((layer, idx) => {
          const stepFill = useTransform(
            progress,
            [layer.threshold[0], layer.threshold[1]],
            ["0%", "100%"]
          );

          return (
            <button
              key={layer.id}
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
                <span className="truncate">0{idx + 1} {layer.role.split(" ")[0]}</span>
                <span className="text-[9px] text-[#3D3F96] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity">
                  Jump
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Completion CTA (Smoothly Glides In at 85%+ Scroll) */}
      <motion.div
        style={{ opacity: showCta, y: ctaY }}
        className="w-full max-w-md pt-1"
      >
        <Link
          href="/food/programs"
          className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#3D3F96] hover:bg-[#303277] text-white font-black text-sm shadow-xl shadow-[#3D3F96]/25 transition-all transform hover:-translate-y-0.5 group"
        >
          <span>Build Your Personalized Box</span>
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}