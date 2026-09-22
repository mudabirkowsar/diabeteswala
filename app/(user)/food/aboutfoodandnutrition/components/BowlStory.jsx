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
  Wheat,
  Carrot,
  Salad,
  Zap
} from "lucide-react";

// Ingredient Layers Configuration for Harvest Salad Bowl
const BOWL_INGREDIENTS = [
  {
    id: "bowl-layer-1",
    name: "Ancient Grains & Spiced Chickpea Base",
    role: "Slow-Burning Carbohydrates & Satiety",
    macros: "16g Complex Plant Protein",
    benefits: "Tricolor organic quinoa, wild black rice, and sprouted chickpeas for sustained glycemic stability.",
    badge: "Phase 01 • Grain Foundation",
    icon: Wheat,
    threshold: [0.08, 0.28],
    accentColor: "#C29352",
    side: "left"
  },
  {
    id: "bowl-layer-2",
    name: "Herb-Roasted Sweet Potatoes & Asparagus",
    role: "Carotenoids & Prebiotic Fibers",
    macros: "450% Daily Beta-Carotene",
    benefits: "Caramelized with rosemary, garlic, and sea salt to lock in prebiotic resistant starches.",
    badge: "Phase 02 • Roasted Harvest",
    icon: Carrot,
    threshold: [0.28, 0.50],
    accentColor: "#E07A43",
    side: "right"
  },
  {
    id: "bowl-layer-3",
    name: "Vine-Ripe Heirloom Tomatoes & Wild Arugula",
    role: "Lycopene & Cellular Detoxification",
    macros: "14g Soluble Fiber Matrix",
    benefits: "Juicy sun-ripened tomatoes and peppery arugula containing glucosinolates for liver phase-II detox.",
    badge: "Phase 03 • Fresh Produce",
    icon: Leaf,
    threshold: [0.50, 0.72],
    accentColor: "#D63D2F",
    side: "left"
  },
  {
    id: "bowl-layer-4",
    name: "Hass Avocado, Pomegranate & Citrus Glaze",
    role: "Monounsaturated Lipids & Bio-Absorption",
    macros: "100% Cold-Pressed EVOO Glaze",
    benefits: "Oleic-rich avocado paired with ruby pomegranate arils and cold-pressed lime vinaigrette.",
    badge: "Phase 04 • Superfood Finishing",
    icon: Salad,
    threshold: [0.72, 0.94],
    accentColor: "#6B8E23",
    side: "right"
  }
];

export default function BowlStory() {
  const containerRef = useRef(null);

  // Smooth scroll progression across 380vh scroll runway
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 60,
    damping: 18,
    mass: 0.65,
    restDelta: 0.0001
  });

  // Dynamic Ambient Background shifting with food palette
  const dynamicBg = useTransform(
    smoothProgress,
    [0.0, 0.18, 0.38, 0.60, 0.82, 1.0],
    [
      "#FAF8F5", // Neutral Linen
      "#F8F3E8", // Warm Grain Cream
      "#FAF0E8", // Roasted Amber Terracotta
      "#FDF0EE", // Heirloom Tomato Coral Blush
      "#F4F7E6", // Citrus Avocado Olive
      "#EFF2FA"  // Medical Indigo Completion
    ]
  );

  const ambientGlow = useTransform(
    smoothProgress,
    [0.0, 0.18, 0.38, 0.60, 0.82, 1.0],
    [
      "rgba(61,63,150,0.06)",
      "rgba(194,147,82,0.16)",
      "rgba(224,122,67,0.16)",
      "rgba(214,61,47,0.14)",
      "rgba(107,142,35,0.16)",
      "rgba(61,63,150,0.18)"
    ]
  );

  // Progressive Bowl Content Reveal
  const bowlFillY = useTransform(smoothProgress, [0.08, 0.92], [280, 50]);

  // Physics-driven falling ingredients
  const drop1Y = useTransform(smoothProgress, [0.06, 0.22], [-100, 230]);
  const drop1Rotate = useTransform(smoothProgress, [0.06, 0.22], [0, 60]);
  const drop1Opacity = useTransform(smoothProgress, [0.06, 0.14, 0.22], [0, 1, 0]);

  const drop2Y = useTransform(smoothProgress, [0.26, 0.42], [-100, 180]);
  const drop2Rotate = useTransform(smoothProgress, [0.26, 0.42], [25, -45]);
  const drop2Opacity = useTransform(smoothProgress, [0.26, 0.34, 0.42], [0, 1, 0]);

  const drop3Y = useTransform(smoothProgress, [0.48, 0.64], [-100, 130]);
  const drop3Rotate = useTransform(smoothProgress, [0.48, 0.64], [-30, 40]);
  const drop3Opacity = useTransform(smoothProgress, [0.48, 0.56, 0.64], [0, 1, 0]);

  const drop4Y = useTransform(smoothProgress, [0.70, 0.86], [-100, 80]);
  const drop4Rotate = useTransform(smoothProgress, [0.70, 0.86], [15, -25]);
  const drop4Opacity = useTransform(smoothProgress, [0.70, 0.78, 0.86], [0, 1, 0]);

  // Click handler to scrub directly to layer
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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full blur-[140px] pointer-events-none -z-10"
          />

          {/* TOP HEADER */}
          <div className="text-center max-w-2xl mx-auto space-y-1.5 z-20 shrink-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#3D3F96] text-xs font-black uppercase tracking-widest border border-[#3D3F96]/20 shadow-sm">
              <Sparkles size={13} className="text-[#3D3F96] animate-pulse" />
              Clinical Chef Formulation
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
              From Soil to Ceramic. <br className="hidden sm:inline" />
              <span className="text-[#3D3F96]">The Perfect Whole Food Bowl.</span>
            </h2>
            
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
              Scroll down to watch organic, whole ingredients layer into the bowl in real time.
            </p>
          </div>

          {/* MIDDLE STAGE: Left Laser Card + Center Realistic Vector Bowl + Right Laser Card */}
          <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto">
            
            {/* LEFT SIDE ACTIVE CARDS */}
            <div className="hidden lg:block relative h-[420px] w-80 z-20">
              {BOWL_INGREDIENTS.filter((item) => item.side === "left").map((layer) => (
                <BowlLaserCard
                  key={layer.id}
                  layer={layer}
                  progress={smoothProgress}
                />
              ))}
            </div>

            {/* CENTER: HIGH-RESOLUTION REALISTIC SVG CERAMIC BOWL */}
            <div className="relative flex flex-col items-center justify-center mx-auto px-4 z-10">
              
              <div className="relative w-[330px] sm:w-[460px] h-[270px] sm:h-[350px] drop-shadow-[0_28px_55px_rgba(61,63,150,0.22)]">
                
                <svg
                  viewBox="0 0 460 340"
                  className="w-full h-full overflow-visible"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Ceramic Stoneware Outer Shading */}
                    <linearGradient id="ceramicGlaze" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="35%" stopColor="#EFE8E0" />
                      <stop offset="85%" stopColor="#DDD4C8" />
                      <stop offset="100%" stopColor="#BCB0A0" />
                    </linearGradient>

                    {/* Ceramic Inner Shadow Depth */}
                    <radialGradient id="ceramicInnerCavity" cx="50%" cy="30%" r="55%">
                      <stop offset="0%" stopColor="#F6F1EA" />
                      <stop offset="75%" stopColor="#E2D9CE" />
                      <stop offset="100%" stopColor="#C4B7A7" />
                    </radialGradient>

                    {/* Tomato Flesh Gradient */}
                    <radialGradient id="tomatoFlesh" cx="40%" cy="40%" r="60%">
                      <stop offset="0%" stopColor="#FF4D36" />
                      <stop offset="70%" stopColor="#D92614" />
                      <stop offset="100%" stopColor="#9E1507" />
                    </radialGradient>

                    {/* Tomato Seed Jelly Cavity */}
                    <linearGradient id="tomatoJelly" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#780C05" />
                      <stop offset="100%" stopColor="#4A0501" />
                    </linearGradient>

                    {/* Avocado Cream Gradient */}
                    <linearGradient id="avocadoFlesh" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#416119" />   {/* Dark Skin */}
                      <stop offset="15%" stopColor="#88B832" />  {/* Lime Edge */}
                      <stop offset="65%" stopColor="#D4EE85" />  {/* Cream Flesh */}
                      <stop offset="100%" stopColor="#F5FAD2" /> {/* Soft Yellow Core */}
                    </linearGradient>

                    {/* Sweet Potato Roasted Caramel Gradient */}
                    <linearGradient id="sweetPotatoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFB057" />
                      <stop offset="50%" stopColor="#EB7423" />
                      <stop offset="100%" stopColor="#A84008" />
                    </linearGradient>

                    {/* Chickpea 3D Shading */}
                    <radialGradient id="chickpeaShade" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#FFF0CC" />
                      <stop offset="50%" stopColor="#E5BD78" />
                      <stop offset="100%" stopColor="#9C7333" />
                    </radialGradient>

                    {/* Pomegranate Jewel Gradient */}
                    <radialGradient id="pomegranateJewel" cx="30%" cy="30%" r="70%">
                      <stop offset="0%" stopColor="#FF6E7B" />
                      <stop offset="60%" stopColor="#C41230" />
                      <stop offset="100%" stopColor="#5E0311" />
                    </radialGradient>

                    {/* Pepita Pumpkin Seed Gradient */}
                    <linearGradient id="pepitaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#7BA83D" />
                      <stop offset="100%" stopColor="#456619" />
                    </linearGradient>

                    {/* Bowl Interior Clip Path */}
                    <clipPath id="bowlInteriorClip">
                      <path d="M 45,115 Q 230,140 415,115 C 405,245 340,300 230,300 C 120,300 55,245 45,115 Z" />
                    </clipPath>

                    {/* Quinoa & Wild Rice Speckle Matrix */}
                    <pattern id="grainMatrix" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                      <ellipse cx="6" cy="6" rx="1.6" ry="3.8" fill="#2E2013" transform="rotate(35, 6, 6)" />
                      <ellipse cx="14" cy="14" rx="1.4" ry="3.2" fill="#1C130B" transform="rotate(-40, 14, 14)" />
                      <circle cx="15" cy="5" r="1.8" fill="#FCE8BE" />
                      <circle cx="5" cy="16" r="1.4" fill="#D4B07B" />
                    </pattern>
                  </defs>

                  {/* 1. CERAMIC BOWL EXTERIOR BODY */}
                  <path
                    d="M 40,115 Q 230,135 420,115 C 410,260 340,312 230,312 C 120,312 50,260 40,115 Z"
                    fill="url(#ceramicGlaze)"
                    stroke="rgba(255, 255, 255, 0.95)"
                    strokeWidth="3.5"
                  />

                  {/* Bowl Foot Ring Stand */}
                  <path
                    d="M 165,308 Q 230,314 295,308 L 286,324 Q 230,332 174,324 Z"
                    fill="#9E9182"
                    opacity="0.9"
                  />

                  {/* 2. INNER BOWL CAVITY DEPTH */}
                  <path
                    d="M 45,115 Q 230,140 415,115 C 405,245 340,300 230,300 C 120,300 55,245 45,115 Z"
                    fill="url(#ceramicInnerCavity)"
                  />

                  {/* 3. CLIPPED DETAILED SALAD LAYERS INSIDE BOWL */}
                  <g clipPath="url(#bowlInteriorClip)">
                    
                    {/* LAYER 1: ANCIENT GRAINS & 3D CHICKPEAS (Bottom) */}
                    <g>
                      <rect x="30" y="215" width="400" height="95" fill="#A88B59" />
                      <rect x="30" y="215" width="400" height="95" fill="url(#grainMatrix)" opacity="0.9" />
                      
                      {/* Realistic 3D Chickpeas */}
                      <g>
                        {/* Chickpea 1 */}
                        <circle cx="140" cy="255" r="10" fill="url(#chickpeaShade)" stroke="#876022" strokeWidth="1" />
                        <path d="M 137,250 C 137,255 142,255 142,258" stroke="#7A5317" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                        
                        {/* Chickpea 2 */}
                        <circle cx="215" cy="265" r="11" fill="url(#chickpeaShade)" stroke="#876022" strokeWidth="1" />
                        <path d="M 212,260 C 212,265 217,265 217,268" stroke="#7A5317" strokeWidth="1.2" fill="none" strokeLinecap="round" />

                        {/* Chickpea 3 */}
                        <circle cx="295" cy="250" r="9.5" fill="url(#chickpeaShade)" stroke="#876022" strokeWidth="1" />
                        <path d="M 292,246 C 292,250 297,250 297,253" stroke="#7A5317" strokeWidth="1.2" fill="none" strokeLinecap="round" />

                        {/* Chickpea 4 */}
                        <circle cx="350" cy="240" r="9" fill="url(#chickpeaShade)" stroke="#876022" strokeWidth="1" />
                      </g>
                    </g>

                    {/* LAYER 2: ROASTED SWEET POTATOES & ASPARAGUS SPEARS */}
                    <g>
                      <rect x="30" y="150" width="400" height="85" fill="#59442A" opacity="0.4" />
                      
                      {/* Asparagus Stalks */}
                      <path d="M 110,200 Q 160,175 220,195" stroke="#467838" strokeWidth="8" strokeLinecap="round" />
                      {/* Asparagus Head bracts */}
                      <polygon points="110,200 116,196 114,204" fill="#315925" />
                      <polygon points="120,197 126,193 124,201" fill="#315925" />

                      <path d="M 240,190 Q 290,175 350,200" stroke="#467838" strokeWidth="8" strokeLinecap="round" />
                      <polygon points="350,200 344,196 346,204" fill="#315925" />

                      {/* Roasted Sweet Potato Cubes with Charred Edges */}
                      <g>
                        {/* Wedge 1 */}
                        <g transform="rotate(14, 150, 175)">
                          <rect x="135" y="165" width="28" height="22" rx="4" fill="url(#sweetPotatoGrad)" stroke="#592002" strokeWidth="1.5" />
                          <line x1="140" y1="172" x2="158" y2="172" stroke="#421600" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="145" cy="178" r="1.5" fill="#FFE5B5" />
                        </g>

                        {/* Wedge 2 */}
                        <g transform="rotate(-10, 230, 175)">
                          <rect x="215" y="165" width="32" height="20" rx="4" fill="url(#sweetPotatoGrad)" stroke="#592002" strokeWidth="1.5" />
                          <line x1="220" y1="170" x2="242" y2="170" stroke="#421600" strokeWidth="2.5" strokeLinecap="round" />
                          <line x1="222" y1="176" x2="238" y2="176" stroke="#421600" strokeWidth="1.8" strokeLinecap="round" />
                        </g>

                        {/* Wedge 3 */}
                        <g transform="rotate(18, 305, 170)">
                          <rect x="290" y="160" width="28" height="24" rx="4" fill="url(#sweetPotatoGrad)" stroke="#592002" strokeWidth="1.5" />
                          <line x1="295" y1="168" x2="312" y2="168" stroke="#421600" strokeWidth="2" strokeLinecap="round" />
                        </g>
                      </g>
                    </g>

                    {/* LAYER 3: REALISTIC SLICED HEIRLOOM TOMATOES & ARUGULA */}
                    <g>
                      <rect x="30" y="90" width="400" height="85" fill="#2E5C38" opacity="0.3" />
                      
                      {/* Detailed Multi-Lobed Wild Arugula Leaves */}
                      <g>
                        <path
                          d="M 75,135 C 95,105 125,120 145,100 C 135,125 155,140 125,150 C 105,155 85,150 75,135 Z"
                          fill="#48A85D"
                          stroke="#1B662C"
                          strokeWidth="1.8"
                        />
                        <path d="M 85,138 Q 115,125 140,105" stroke="#1B662C" strokeWidth="1.5" fill="none" />

                        <path
                          d="M 320,130 C 340,100 370,115 390,95 C 380,120 400,135 370,145 C 350,150 330,145 320,130 Z"
                          fill="#48A85D"
                          stroke="#1B662C"
                          strokeWidth="1.8"
                        />
                        <path d="M 330,133 Q 360,120 385,100" stroke="#1B662C" strokeWidth="1.5" fill="none" />

                        {/* Purple Radicchio / Cabbage Ribbon Strips */}
                        <path d="M 120,135 Q 160,115 200,140 Q 240,120 280,145" stroke="#85226E" strokeWidth="4.5" fill="none" strokeLinecap="round" />
                        <path d="M 120,135 Q 160,115 200,140 Q 240,120 280,145" stroke="#F0BBE3" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                      </g>

                      {/* REALISTIC SLICED HEIRLOOM CHERRY TOMATOES */}
                      <g>
                        {/* Tomato Slice 1 (Left Center) */}
                        <g transform="translate(160, 115) rotate(-15)">
                          {/* Outer Red Skin & Flesh */}
                          <circle cx="0" cy="0" r="20" fill="url(#tomatoFlesh)" stroke="#780C05" strokeWidth="1.5" />
                          {/* 3 Inner Seed Chambers */}
                          <path d="M -12,-4 C -10,-12 -2,-12 0,-4 C -4,-2 -8,-2 -12,-4 Z" fill="url(#tomatoJelly)" />
                          <circle cx="-6" cy="-7" r="1.6" fill="#FCE38A" />
                          <circle cx="-3" cy="-6" r="1.4" fill="#FCE38A" />

                          <path d="M 12,-4 C 10,-12 2,-12 0,-4 C 4,-2 8,-2 12,-4 Z" fill="url(#tomatoJelly)" />
                          <circle cx="6" cy="-7" r="1.6" fill="#FCE38A" />
                          <circle cx="3" cy="-6" r="1.4" fill="#FCE38A" />

                          <path d="M -6,6 C -10,14 10,14 6,6 C 2,4 -2,4 -6,6 Z" fill="url(#tomatoJelly)" />
                          <circle cx="0" cy="10" r="1.6" fill="#FCE38A" />
                          
                          {/* Core Star & Specular Wet Highlights */}
                          <circle cx="0" cy="-1" r="3" fill="#FFE2DC" opacity="0.8" />
                          <ellipse cx="-8" cy="-8" rx="4" ry="1.5" fill="#FFFFFF" opacity="0.65" transform="rotate(-30, -8, -8)" />
                        </g>

                        {/* Tomato Slice 2 (Right Center) */}
                        <g transform="translate(265, 120) rotate(20)">
                          <circle cx="0" cy="0" r="18" fill="url(#tomatoFlesh)" stroke="#780C05" strokeWidth="1.5" />
                          <path d="M -10,-3 C -8,-10 -2,-10 0,-3 C -4,-1 -7,-1 -10,-3 Z" fill="url(#tomatoJelly)" />
                          <circle cx="-5" cy="-6" r="1.5" fill="#FCE38A" />
                          
                          <path d="M 10,-3 C 8,-10 2,-10 0,-3 C 4,-1 7,-1 10,-3 Z" fill="url(#tomatoJelly)" />
                          <circle cx="5" cy="-6" r="1.5" fill="#FCE38A" />

                          <path d="M -5,5 C -8,12 8,12 5,5 Z" fill="url(#tomatoJelly)" />
                          <circle cx="0" cy="8" r="1.5" fill="#FCE38A" />

                          <circle cx="0" cy="-1" r="2.5" fill="#FFE2DC" opacity="0.8" />
                          <ellipse cx="-6" cy="-6" rx="3.5" ry="1.2" fill="#FFFFFF" opacity="0.65" transform="rotate(-30, -6, -6)" />
                        </g>
                      </g>
                    </g>

                    {/* LAYER 4: CREAMY HASS AVOCADO FAN, PEPITAS & POMEGRANATE */}
                    <g>
                      {/* Layered Crescent Hass Avocado Fan */}
                      <g transform="translate(195, 75)">
                        {/* Avocado Slice 1 (Back) */}
                        <path
                          d="M -30,25 C -5,5 35,10 65,35 C 45,30 5,20 -30,25 Z"
                          fill="url(#avocadoFlesh)"
                          stroke="#2A4010"
                          strokeWidth="1.5"
                        />
                        {/* Avocado Slice 2 (Middle) */}
                        <path
                          d="M -20,35 C 5,15 45,20 75,45 C 55,40 15,30 -20,35 Z"
                          fill="url(#avocadoFlesh)"
                          stroke="#2A4010"
                          strokeWidth="1.5"
                        />
                        {/* Avocado Slice 3 (Front) */}
                        <path
                          d="M -10,45 C 15,25 55,30 85,55 C 65,50 25,40 -10,45 Z"
                          fill="url(#avocadoFlesh)"
                          stroke="#2A4010"
                          strokeWidth="1.5"
                        />
                      </g>

                      {/* Ruby Pomegranate Arils */}
                      <g>
                        <ellipse cx="145" cy="88" rx="5" ry="6.5" fill="url(#pomegranateJewel)" stroke="#4A020C" strokeWidth="0.8" />
                        <circle cx="143" cy="86" r="1.5" fill="#FFFFFF" opacity="0.75" />

                        <ellipse cx="160" cy="98" rx="4.5" ry="6" fill="url(#pomegranateJewel)" stroke="#4A020C" strokeWidth="0.8" />
                        <circle cx="158" cy="96" r="1.4" fill="#FFFFFF" opacity="0.75" />

                        <ellipse cx="305" cy="85" rx="5" ry="6.5" fill="url(#pomegranateJewel)" stroke="#4A020C" strokeWidth="0.8" />
                        <circle cx="303" cy="83" r="1.5" fill="#FFFFFF" opacity="0.75" />

                        <ellipse cx="320" cy="95" rx="4.8" ry="6" fill="url(#pomegranateJewel)" stroke="#4A020C" strokeWidth="0.8" />
                      </g>

                      {/* Toasted Pepitas (Pumpkin Seeds) */}
                      <g>
                        <ellipse cx="130" cy="100" rx="3.5" ry="7" fill="url(#pepitaGrad)" stroke="#2B4010" strokeWidth="0.8" transform="rotate(25, 130, 100)" />
                        <ellipse cx="175" cy="78" rx="3.2" ry="6.5" fill="url(#pepitaGrad)" stroke="#2B4010" strokeWidth="0.8" transform="rotate(-35, 175, 78)" />
                        <ellipse cx="285" cy="80" rx="3.5" ry="7" fill="url(#pepitaGrad)" stroke="#2B4010" strokeWidth="0.8" transform="rotate(40, 285, 80)" />
                      </g>

                      {/* Glistening Cold-Pressed Herb Oil Droplets */}
                      <g opacity="0.85">
                        <circle cx="210" cy="95" r="3.5" fill="#FFF275" />
                        <circle cx="209" cy="94" r="1.2" fill="#FFFFFF" />

                        <circle cx="165" cy="90" r="3" fill="#FFF275" />
                        <circle cx="270" cy="92" r="3.2" fill="#FFF275" />
                      </g>
                    </g>

                    {/* MASK REVEAL: REVEALS THE BOWL AS USER SCROLLS DOWN */}
                    <motion.rect
                      x="0"
                      y="0"
                      width="460"
                      style={{ height: bowlFillY }}
                      fill="#FAF8F5"
                    />

                  </g>

                  {/* 4. PHYSICS-DRIVEN DROPPING FOOD VECTORS */}
                  <g clipPath="url(#bowlInteriorClip)" pointerEvents="none">
                    
                    {/* Dropping 1: 3D Spiced Chickpeas */}
                    <motion.g style={{ y: drop1Y, rotate: drop1Rotate, opacity: drop1Opacity }}>
                      <circle cx="220" cy="-15" r="12" fill="url(#chickpeaShade)" stroke="#876022" strokeWidth="1.5" />
                      <path d="M 216,-20 C 216,-15 222,-15 222,-11" stroke="#7A5317" strokeWidth="1.4" fill="none" />
                      <circle cx="240" cy="-24" r="10" fill="url(#chickpeaShade)" stroke="#876022" strokeWidth="1.2" />
                    </motion.g>

                    {/* Dropping 2: Charred Sweet Potato Wedge */}
                    <motion.g style={{ y: drop2Y, rotate: drop2Rotate, opacity: drop2Opacity }}>
                      <rect x="200" y="-22" width="38" height="24" rx="5" fill="url(#sweetPotatoGrad)" stroke="#592002" strokeWidth="2.5" />
                      <line x1="208" y1="-12" x2="230" y2="-12" stroke="#421600" strokeWidth="2.5" strokeLinecap="round" />
                    </motion.g>

                    {/* Dropping 3: Juicy Sliced Heirloom Cherry Tomato */}
                    <motion.g style={{ y: drop3Y, rotate: drop3Rotate, opacity: drop3Opacity }}>
                      <circle cx="230" cy="-20" r="18" fill="url(#tomatoFlesh)" stroke="#780C05" strokeWidth="2" />
                      <path d="M 220,-24 C 222,-30 228,-30 230,-24 Z" fill="url(#tomatoJelly)" />
                      <circle cx="225" cy="-27" r="1.6" fill="#FCE38A" />
                      <path d="M 240,-24 C 238,-30 232,-30 230,-24 Z" fill="url(#tomatoJelly)" />
                      <circle cx="235" cy="-27" r="1.6" fill="#FCE38A" />
                      <circle cx="230" cy="-21" r="2.5" fill="#FFE2DC" opacity="0.9" />
                      <ellipse cx="222" cy="-28" rx="3.5" ry="1.2" fill="#FFFFFF" opacity="0.8" transform="rotate(-30, 222, -28)" />
                    </motion.g>

                    {/* Dropping 4: Creamy Hass Avocado Slice */}
                    <motion.g style={{ y: drop4Y, rotate: drop4Rotate, opacity: drop4Opacity }}>
                      <path d="M 200,-35 C 235,-20 265,5 275,35 C 255,25 220,10 200,-35 Z" fill="url(#avocadoFlesh)" stroke="#2A4010" strokeWidth="2" />
                    </motion.g>

                  </g>

                  {/* 5. CERAMIC BOWL FOREGROUND SPECULAR RIM */}
                  <ellipse cx="230" cy="115" rx="185" ry="25" fill="none" stroke="#FFFFFF" strokeWidth="4" />
                  <ellipse cx="230" cy="115" rx="183" ry="23" fill="rgba(255, 255, 255, 0.25)" />
                </svg>

              </div>

              {/* Bowl Ground Contact Shadow */}
              <div className="w-80 sm:w-[420px] h-5 bg-slate-900/10 rounded-full blur-xl mt-1" />

              {/* Mobile Active Insight HUD */}
              <div className="lg:hidden mt-3 w-full max-w-xs">
                <MobileBowlHUD progress={smoothProgress} />
              </div>

            </div>

            {/* RIGHT SIDE ACTIVE CARDS */}
            <div className="hidden lg:block relative h-[420px] w-80 z-20">
              {BOWL_INGREDIENTS.filter((item) => item.side === "right").map((layer) => (
                <BowlLaserCard
                  key={layer.id}
                  layer={layer}
                  progress={smoothProgress}
                />
              ))}
            </div>

          </div>

          {/* BOTTOM TELEMETRY HUD & MILESTONE SCRUBBER */}
          <div className="max-w-4xl mx-auto w-full z-20 shrink-0 pt-2 pb-2">
            <BottomBowlTelemetry
              progress={smoothProgress}
              onSelectMilestone={scrollToMilestone}
            />
          </div>

        </div>

      </div>
    </motion.div>
  );
}

// Sub-Component: Desktop Laser HUD Card with Optical Directional Pointer to Bowl
function BowlLaserCard({ layer, progress }) {
  const Icon = layer.icon;

  // Strict Turn Visibility
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
      {/* OPTICAL DIRECTIONAL LASER POINTER TOWARDS BOWL */}
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

      {/* Header & Badge */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-white bg-[#3D3F96] px-3 py-1 rounded-full shadow-sm">
          {layer.badge}
        </span>
        <div className="w-8 h-8 rounded-xl bg-[#3D3F96]/10 flex items-center justify-center text-[#3D3F96]">
          <Icon size={16} />
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-base font-black text-slate-900 leading-snug">
        {layer.name}
      </h3>

      <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
        {layer.benefits}
      </p>

      {/* Live Nutrient Potency Footer */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
        <span className="text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
          <Zap size={12} className="text-[#3D3F96]" /> Clinical Potency
        </span>
        <span className="text-[#3D3F96] font-black text-xs">{layer.macros}</span>
      </div>
    </motion.div>
  );
}

// Sub-Component: Mobile Laser HUD Indicator
function MobileBowlHUD({ progress }) {
  return (
    <div className="relative min-h-[96px]">
      {BOWL_INGREDIENTS.map((layer) => {
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
              <span className="text-[10px] text-slate-400 font-medium">100% Whole Food</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// Sub-Component: Bottom Scrubber & Completion Action
function BottomBowlTelemetry({ progress, onSelectMilestone }) {
  const showCta = useTransform(progress, [0.82, 0.94], [0, 1]);
  const ctaY = useTransform(progress, [0.82, 0.94], [15, 0]);

  return (
    <div className="flex flex-col items-center gap-3">
      
      {/* 4-Step Milestone Scrubber */}
      <div className="w-full max-w-xl grid grid-cols-4 gap-2.5 px-2">
        {BOWL_INGREDIENTS.map((layer, idx) => {
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

      {/* Final Action Button to /food/programs */}
      <motion.div
        style={{ opacity: showCta, y: ctaY }}
        className="w-full max-w-md pt-1"
      >
        <Link
          href="/food/programs"
          className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#3D3F96] hover:bg-[#303277] text-white font-black text-sm shadow-xl shadow-[#3D3F96]/25 transition-all transform hover:-translate-y-0.5 group"
        >
          <span>Explore Chef-Crafted Bowls</span>
          <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}