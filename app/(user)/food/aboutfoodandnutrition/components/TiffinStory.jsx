    "use client";

    import React, { useRef } from "react";
    import Link from "next/link";
    import { motion, useScroll, useTransform, useSpring } from "framer-motion";
    import {
      Sparkles,
      CalendarCheck,
      UtensilsCrossed,
      MapPin,
      ShieldCheck,
      ArrowRight,
      Clock,
      Flame,
      ChefHat,
      CheckCircle2,
      Lock,
      Layers,
      Zap
    } from "lucide-react";

    // Tiffin Steps & Telemetry Milestone Data
    const TIFFIN_STEPS = [
      {
        id: "step-1",
        phase: "Phase 01 • Meal Selection",
        title: "Choose Your Daily Meal Slots",
        role: "Breakfast • Lunch • Dinner • Snack Addons",
        statValue: "100%",
        statUnit: "Flex",
        statLabel: "Slot Flexibility",
        description:
          "Select any combination: only lunch for the office, breakfast + dinner for home, or a full 3-meal nutrition plan.",
        badge: "Step 01 • Frequency",
        icon: CalendarCheck,
        threshold: [0.08, 0.28],
        accentColor: "#E07A5F",
        side: "left"
      },
      {
        id: "step-2",
        phase: "Phase 02 • Modular Menus",
        title: "Curate Distinct Food Per Slot",
        role: "Different Menu for Breakfast & Lunch",
        statValue: "40+",
        statUnit: "Dishes",
        statLabel: "Daily Rotations",
        description:
          "Select homestyle phulkas & dal for lunch, and light millet khichdi or high-protein paneer bhurji for dinner. Zero repetition.",
        badge: "Step 02 • Chef's Curation",
        icon: UtensilsCrossed,
        threshold: [0.28, 0.50],
        accentColor: "#D97706",
        side: "right"
      },
      {
        id: "step-3",
        phase: "Phase 03 • Hyperlocal Kitchen",
        title: "Pick Nearest Outlet & Hot Slots",
        role: "Geo-Fenced Fresh Kitchen Cooking",
        statValue: "< 3km",
        statUnit: "Radius",
        statLabel: "Nearby Cloud Hub",
        description:
          "Your meal is auto-assigned to your closest certified neighborhood kitchen and cooked 45 mins prior to your chosen delivery window.",
        badge: "Step 03 • Hot Kitchen Hub",
        icon: MapPin,
        threshold: [0.50, 0.72],
        accentColor: "#059669",
        side: "left"
      },
      {
        id: "step-4",
        phase: "Phase 04 • Seal & Instant Booking",
        title: "Lock In Tiffin & Instant Schedule",
        role: "Insulated Seal • Contactless Delivery",
        statValue: "Instant",
        statUnit: "Pass",
        statLabel: "Live Confirmation",
        description:
          "Lock your multi-tier thermal dabba subscription. Pause, swap meals, or cancel with 1-click anytime via live tracking.",
        badge: "Step 04 • Booked & Dispatched",
        icon: ShieldCheck,
        threshold: [0.72, 0.94],
        accentColor: "#3D3F96",
        side: "right"
      }
    ];

    export default function CustomTiffinStory() {
      const containerRef = useRef(null);

      // Smooth scroll progression across 380vh scroll track
      const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
      });

      // Spring physics for natural momentum
      const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 60,
        damping: 18,
        mass: 0.65,
        restDelta: 0.0001
      });

      // Dynamic Ambient Section Lighting
      const dynamicBg = useTransform(
        smoothProgress,
        [0.0, 0.2, 0.42, 0.65, 0.85, 1.0],
        [
          "#FAF8F5", // Crisp Linen
          "#FFF7ED", // Warm Turmeric Golden Glow
          "#FEF3C7", // Garam Masala Amber
          "#ECFDF5", // Fresh Herb Emerald
          "#EEF2FF", // Royal Tech Indigo
          "#F8FAFC"  // Titanium Finish
        ]
      );

      const ambientGlow = useTransform(
        smoothProgress,
        [0.0, 0.2, 0.42, 0.65, 0.85, 1.0],
        [
          "rgba(224, 122, 95, 0.08)",
          "rgba(217, 119, 6, 0.16)",
          "rgba(245, 158, 11, 0.18)",
          "rgba(5, 150, 105, 0.15)",
          "rgba(61, 63, 150, 0.18)",
          "rgba(71, 85, 105, 0.12)"
        ]
      );

      // Tiffin Tier 1 (Bottom - Breakfast) Stacking Transforms
      const tier1Y = useTransform(smoothProgress, [0.05, 0.22], [140, 0]);
      const tier1Opacity = useTransform(smoothProgress, [0.03, 0.12], [0, 1]);

      // Tiffin Tier 2 (Middle - Lunch) Stacking Transforms
      const tier2Y = useTransform(smoothProgress, [0.26, 0.44], [180, 0]);
      const tier2Opacity = useTransform(smoothProgress, [0.24, 0.32], [0, 1]);

      // Tiffin Tier 3 (Top - Dinner / Sides) Stacking Transforms
      const tier3Y = useTransform(smoothProgress, [0.48, 0.66], [200, 0]);
      const tier3Opacity = useTransform(smoothProgress, [0.46, 0.54], [0, 1]);

      // Master Lid & Clamp Assembly (Step 4 - Lock & Seal)
      const lidY = useTransform(smoothProgress, [0.68, 0.82], [-140, 0]);
      const lidOpacity = useTransform(smoothProgress, [0.66, 0.74], [0, 1]);
      const clampHeight = useTransform(smoothProgress, [0.74, 0.88], [0, 290]);
      const lockBadgeScale = useTransform(smoothProgress, [0.82, 0.92], [0, 1]);

      // Dropping Food Vector Particles
      // 1. Breakfast Steaming Idlis & Fresh Mint Chutney
      const food1Y = useTransform(smoothProgress, [0.06, 0.22], [-80, 270]);
      const food1Rotate = useTransform(smoothProgress, [0.06, 0.22], [15, -10]);
      const food1Opacity = useTransform(smoothProgress, [0.06, 0.14, 0.24], [0, 1, 0]);

      // 2. Lunch Paneer Cubes & Ghee Phulka
      const food2Y = useTransform(smoothProgress, [0.28, 0.44], [-80, 180]);
      const food2Rotate = useTransform(smoothProgress, [0.28, 0.44], [-25, 30]);
      const food2Opacity = useTransform(smoothProgress, [0.28, 0.36, 0.46], [0, 1, 0]);

      // 3. Outlet Geo-Location Radar Pulse & Herb Garnish
      const food3Y = useTransform(smoothProgress, [0.50, 0.66], [-80, 90]);
      const food3Rotate = useTransform(smoothProgress, [0.50, 0.66], [30, -15]);
      const food3Opacity = useTransform(smoothProgress, [0.50, 0.58, 0.68], [0, 1, 0]);

      // Click handler to scrub to milestone
      const scrollToMilestone = (index) => {
        if (!containerRef.current) return;
        const targets = [0.16, 0.38, 0.60, 0.84];
        const targetScroll =
          containerRef.current.offsetTop +
          targets[index] * (containerRef.current.offsetHeight - window.innerHeight);
        window.scrollTo({ top: targetScroll, behavior: "smooth" });
      };

      return (
        <motion.div
          ref={containerRef}
          style={{ backgroundColor: dynamicBg }}
          className="relative text-slate-900 transition-colors duration-700 selection:bg-[#E07A5F] selection:text-white"
        >
          <div style={{ height: "380vh" }}>
            
            {/* Sticky Stage Viewport */}
            <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-6 select-none">
              
              {/* Ambient Lighting Orb */}
              <motion.div
                style={{ backgroundColor: ambientGlow }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full blur-[140px] pointer-events-none -z-10"
              />

              {/* TOP HEADER */}
              <div className="text-center max-w-2xl mx-auto space-y-1.5 z-20 shrink-0">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#E07A5F] text-xs font-black uppercase tracking-widest border border-[#E07A5F]/20 shadow-sm">
                  <ChefHat size={14} className="text-[#E07A5F] animate-bounce" />
                  Build-Your-Own Tiffin Engine
                </div>

                <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
                  Craft Your Personalized Dabba. <br className="hidden sm:inline" />
                  <span className="text-[#E07A5F]">Fresh From Nearby Kitchens.</span>
                </h2>
                
                <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-md mx-auto">
                  Scroll down to watch your customized meal slots layer, latch, and lock in real time.
                </p>
              </div>

              {/* MIDDLE STAGE: Left Laser HUD + Center Vector Tiffin Carrier + Right Laser HUD */}
              <div className="relative flex-1 w-full max-w-6xl mx-auto flex items-center justify-center my-auto">
                
                {/* LEFT SIDE CARDS */}
                <div className="hidden lg:block relative h-[420px] w-80 z-20">
                  {TIFFIN_STEPS.filter((item) => item.side === "left").map((step) => (
                    <TiffinLaserCard
                      key={step.id}
                      step={step}
                      progress={smoothProgress}
                    />
                  ))}
                </div>

                {/* CENTER: HIGH-RESOLUTION SVG STAINLESS STEEL TIFFIN */}
                <div className="relative flex flex-col items-center justify-center mx-auto px-4 z-10">
                  
                  <div className="relative w-[290px] sm:w-[340px] h-[400px] sm:h-[460px] drop-shadow-[0_25px_50px_rgba(224,122,95,0.2)]">
                    
                    <svg
                      viewBox="0 0 340 500"
                      className="w-full h-full overflow-visible"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <defs>
                        {/* Brushed Stainless Steel Shading */}
                        <linearGradient id="steelBodyGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                          <stop offset="15%" stopColor="#E2E8F0" />
                          <stop offset="45%" stopColor="#CBD5E1" />
                          <stop offset="55%" stopColor="#94A3B8" />
                          <stop offset="85%" stopColor="#CBD5E1" />
                          <stop offset="100%" stopColor="#64748B" />
                        </linearGradient>

                        {/* Golden Brass Latch & Rim Accents */}
                        <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FDE047" />
                          <stop offset="50%" stopColor="#D97706" />
                          <stop offset="100%" stopColor="#92400E" />
                        </linearGradient>

                        {/* Tier 1 - Breakfast Interior Soup/Curry */}
                        <linearGradient id="tier1FoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FED7AA" />
                          <stop offset="60%" stopColor="#F97316" />
                          <stop offset="100%" stopColor="#C2410C" />
                        </linearGradient>

                        {/* Tier 2 - Lunch Dal & Paneer Gravy */}
                        <linearGradient id="tier2FoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FDE68A" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#B45309" />
                        </linearGradient>

                        {/* Tier 3 - Herb & Green Garden Salad */}
                        <linearGradient id="tier3FoodGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#A7F3D0" />
                          <stop offset="60%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#047857" />
                        </linearGradient>

                        {/* Shiny Specular Strip Gradient */}
                        <linearGradient id="specularStrip" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                          <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.6" />
                        </linearGradient>
                      </defs>

                      {/* 1. MASTER BACK STAND / CARRIER FRAME (STEEL STRUTS) */}
                      <g opacity="0.4">
                        <rect x="52" y="100" width="8" height="320" rx="4" fill="#94A3B8" />
                        <rect x="280" y="100" width="8" height="320" rx="4" fill="#94A3B8" />
                      </g>

                      {/* 2. TIER 1 CONTAINER (BOTTOM: BREAKFAST TIER) */}
                      <motion.g style={{ y: tier1Y, opacity: tier1Opacity }}>
                        {/* Container Rim & Base */}
                        <path
                          d="M 60,330 L 280,330 L 274,420 C 272,434 258,444 240,444 L 100,444 C 82,444 68,434 66,420 Z"
                          fill="url(#steelBodyGrad)"
                          stroke="#64748B"
                          strokeWidth="2.5"
                        />
                        {/* Hot Food Fill Peek */}
                        <ellipse cx="170" cy="334" rx="108" ry="12" fill="url(#tier1FoodGrad)" />
                        {/* Breakfast Graphic: Golden Poha / Idlis Vector Details */}
                        <g opacity="0.85">
                          <ellipse cx="130" cy="334" rx="16" ry="6" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                          <ellipse cx="170" cy="336" rx="18" ry="7" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                          <ellipse cx="210" cy="333" rx="15" ry="5" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="1" />
                          <circle cx="150" cy="333" r="3" fill="#16A34A" />
                          <circle cx="190" cy="335" r="2.5" fill="#DC2626" />
                        </g>
                        {/* Metal Latch Ears */}
                        <rect x="54" y="365" width="10" height="22" rx="3" fill="url(#brassGrad)" />
                        <rect x="276" y="365" width="10" height="22" rx="3" fill="url(#brassGrad)" />
                        {/* Tier 1 Label Badge */}
                        <rect x="120" y="390" width="100" height="20" rx="10" fill="#FFFFFF" opacity="0.85" />
                        <text x="170" y="403" fontSize="9" fontWeight="900" fill="#E07A5F" textAnchor="middle" letterSpacing="0.5">
                          TIER 1 • BREAKFAST
                        </text>
                        {/* Specular Highlight Streak */}
                        <rect x="86" y="338" width="14" height="96" fill="url(#specularStrip)" opacity="0.5" rx="3" />
                      </motion.g>

                      {/* 3. TIER 2 CONTAINER (MIDDLE: LUNCH TIER) */}
                      <motion.g style={{ y: tier2Y, opacity: tier2Opacity }}>
                        <path
                          d="M 60,230 L 280,230 L 275,315 C 273,326 260,334 242,334 L 98,334 C 80,334 67,326 65,315 Z"
                          fill="url(#steelBodyGrad)"
                          stroke="#64748B"
                          strokeWidth="2.5"
                        />
                        {/* Rich Lunch Curry Peek */}
                        <ellipse cx="170" cy="234" rx="108" ry="12" fill="url(#tier2FoodGrad)" />
                        {/* Paneer / Dal & Phulka details */}
                        <g opacity="0.9">
                          <rect x="125" y="230" width="14" height="10" rx="2" fill="#FFFFFF" stroke="#FEF3C7" strokeWidth="1" />
                          <rect x="150" y="228" width="12" height="12" rx="2" fill="#FFFFFF" stroke="#FEF3C7" strokeWidth="1" />
                          <circle cx="195" cy="233" r="14" fill="#FBBF24" stroke="#D97706" strokeWidth="1.5" />
                          <path d="M 190,233 Q 195,227 200,233" stroke="#92400E" strokeWidth="1.5" fill="none" />
                        </g>
                        {/* Metal Latch Ears */}
                        <rect x="54" y="265" width="10" height="22" rx="3" fill="url(#brassGrad)" />
                        <rect x="276" y="265" width="10" height="22" rx="3" fill="url(#brassGrad)" />
                        {/* Tier 2 Label Badge */}
                        <rect x="126" y="285" width="88" height="20" rx="10" fill="#FFFFFF" opacity="0.85" />
                        <text x="170" y="298" fontSize="9" fontWeight="900" fill="#D97706" textAnchor="middle" letterSpacing="0.5">
                          TIER 2 • LUNCH
                        </text>
                        {/* Specular Highlight Streak */}
                        <rect x="86" y="238" width="14" height="84" fill="url(#specularStrip)" opacity="0.5" rx="3" />
                      </motion.g>

                      {/* 4. TIER 3 CONTAINER (TOP: DINNER / SIDES) */}
                      <motion.g style={{ y: tier3Y, opacity: tier3Opacity }}>
                        <path
                          d="M 60,130 L 280,130 L 275,215 C 273,226 260,234 242,234 L 98,234 C 80,234 67,226 65,215 Z"
                          fill="url(#steelBodyGrad)"
                          stroke="#64748B"
                          strokeWidth="2.5"
                        />
                        {/* Herb & Green Salad/Millet Peek */}
                        <ellipse cx="170" cy="134" rx="108" ry="12" fill="url(#tier3FoodGrad)" />
                        <g opacity="0.85">
                          <circle cx="130" cy="132" r="5" fill="#DC2626" />
                          <circle cx="145" cy="134" r="6" fill="#16A34A" />
                          <circle cx="190" cy="132" r="7" fill="#047857" />
                          <circle cx="210" cy="135" r="4" fill="#FBBF24" />
                        </g>
                        {/* Metal Latch Ears */}
                        <rect x="54" y="165" width="10" height="22" rx="3" fill="url(#brassGrad)" />
                        <rect x="276" y="165" width="10" height="22" rx="3" fill="url(#brassGrad)" />
                        {/* Tier 3 Label Badge */}
                        <rect x="122" y="185" width="96" height="20" rx="10" fill="#FFFFFF" opacity="0.85" />
                        <text x="170" y="198" fontSize="9" fontWeight="900" fill="#059669" textAnchor="middle" letterSpacing="0.5">
                          TIER 3 • DINNER
                        </text>
                        {/* Specular Highlight Streak */}
                        <rect x="86" y="138" width="14" height="84" fill="url(#specularStrip)" opacity="0.5" rx="3" />
                      </motion.g>

                      {/* 5. TOP DOME LID & CARRYING HANDLE ASSEMBLY */}
                      <motion.g style={{ y: lidY, opacity: lidOpacity }}>
                        {/* Stainless Dome Lid */}
                        <path
                          d="M 56,134 C 56,80 110,64 170,64 C 230,64 284,80 284,134 Z"
                          fill="url(#steelBodyGrad)"
                          stroke="#64748B"
                          strokeWidth="2.5"
                        />
                        {/* Brass Crown Finial */}
                        <rect x="156" y="44" width="28" height="22" rx="6" fill="url(#brassGrad)" stroke="#B45309" strokeWidth="1.5" />
                        {/* Arched Steel Master Handle */}
                        <path
                          d="M 72,130 C 72,10 268,10 268,130"
                          fill="none"
                          stroke="#475569"
                          strokeWidth="7"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 72,130 C 72,10 268,10 268,130"
                          fill="none"
                          stroke="#E2E8F0"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                        />
                        {/* Wooden / Brass Grip Bar */}
                        <rect x="130" y="16" width="80" height="14" rx="7" fill="url(#brassGrad)" stroke="#78350F" strokeWidth="1.5" />
                      </motion.g>

                      {/* 6. VERTICAL STAINLESS STEEL SIDE LOCKING CLAMPS */}
                      <motion.rect
                        x="50"
                        y="130"
                        width="8"
                        style={{ height: clampHeight }}
                        rx="4"
                        fill="url(#brassGrad)"
                        stroke="#78350F"
                        strokeWidth="1"
                      />
                      <motion.rect
                        x="282"
                        y="130"
                        width="8"
                        style={{ height: clampHeight }}
                        rx="4"
                        fill="url(#brassGrad)"
                        stroke="#78350F"
                        strokeWidth="1"
                      />

                      {/* 7. FALLING ORGANIC FOOD VECTOR PARTICLES */}
                      {/* Step 1 Food: Steaming Breakfast Idlis */}
                      <motion.g style={{ y: food1Y, rotate: food1Rotate, opacity: food1Opacity }} pointerEvents="none">
                        <circle cx="170" cy="0" r="18" fill="#FFFBEB" stroke="#FDE68A" strokeWidth="2" />
                        <circle cx="166" cy="-4" r="2.5" fill="#16A34A" />
                        <circle cx="176" cy="3" r="2" fill="#DC2626" />
                      </motion.g>

                      {/* Step 2 Food: Golden Paneer Tikka / Curry Garnish */}
                      <motion.g style={{ y: food2Y, rotate: food2Rotate, opacity: food2Opacity }} pointerEvents="none">
                        <rect x="156" y="-14" width="28" height="28" rx="6" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="2" />
                        <path d="M 160, -2 L 180, 10" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                        <circle cx="170" cy="0" r="3" fill="#15803D" />
                      </motion.g>

                      {/* Step 3: Kitchen Pin & Fresh Herb Sprig */}
                      <motion.g style={{ y: food3Y, rotate: food3Rotate, opacity: food3Opacity }} pointerEvents="none">
                        <path
                          d="M 170,-20 C 158,-20 148,-10 148,2 C 148,16 170,36 170,36 C 170,36 192,16 192,2 C 192,-10 182,-20 170,-20 Z"
                          fill="#059669"
                          stroke="#047857"
                          strokeWidth="2"
                        />
                        <circle cx="170" cy="2" r="7" fill="#FFFFFF" />
                      </motion.g>

                      {/* 8. RISING AROMATIC STEAM PARTICLES */}
                      <g opacity="0.6" pointerEvents="none">
                        <motion.path
                          animate={{ y: [420, 80], opacity: [0, 0.8, 0], x: [140, 132, 148] }}
                          transition={{ repeat: Infinity, duration: 3.2, ease: "easeOut" }}
                          d="M 0,0 Q 10,-20 0,-40 T 0,-80"
                          stroke="#CBD5E1"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <motion.path
                          animate={{ y: [420, 80], opacity: [0, 0.9, 0], x: [175, 185, 168] }}
                          transition={{ repeat: Infinity, duration: 3.8, delay: 0.9, ease: "easeOut" }}
                          d="M 0,0 Q -10,-20 0,-40 T 0,-80"
                          stroke="#CBD5E1"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                        />
                        <motion.path
                          animate={{ y: [420, 80], opacity: [0, 0.8, 0], x: [205, 195, 212] }}
                          transition={{ repeat: Infinity, duration: 2.9, delay: 1.5, ease: "easeOut" }}
                          d="M 0,0 Q 10,-20 0,-40 T 0,-80"
                          stroke="#CBD5E1"
                          strokeWidth="2.5"
                          fill="none"
                          strokeLinecap="round"
                        />
                      </g>

                      {/* 9. FINAL STEP VERIFICATION BADGE */}
                      <motion.g style={{ scale: lockBadgeScale }} className="origin-center">
                        <circle cx="170" cy="280" r="38" fill="#3D3F96" stroke="#FFFFFF" strokeWidth="4" />
                        <path
                          d="M 158 280 L 166 288 L 184 270"
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth="4.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </motion.g>
                    </svg>

                  </div>

                  {/* Tiffin Floor Contact Shadow */}
                  <div className="w-56 sm:w-68 h-4 bg-slate-900/10 rounded-full blur-lg mt-2" />

                  {/* Mobile Active HUD Indicator */}
                  <div className="lg:hidden mt-3 w-full max-w-xs">
                    <MobileTiffinHUD progress={smoothProgress} />
                  </div>

                </div>

                {/* RIGHT SIDE CARDS */}
                <div className="hidden lg:block relative h-[420px] w-80 z-20">
                  {TIFFIN_STEPS.filter((item) => item.side === "right").map((step) => (
                    <TiffinLaserCard
                      key={step.id}
                      step={step}
                      progress={smoothProgress}
                    />
                  ))}
                </div>

              </div>

              {/* BOTTOM TELEMETRY HUD & MILESTONE SCRUBBER */}
              <div className="max-w-4xl mx-auto w-full z-20 shrink-0 pt-2 pb-2">
                <BottomTiffinTelemetry
                  progress={smoothProgress}
                  onSelectMilestone={scrollToMilestone}
                />
              </div>

            </div>

          </div>
        </motion.div>
      );
    }

    // Sub-Component: Desktop Laser Callout Card with Directional Laser Marker
    function TiffinLaserCard({ step, progress }) {
      const Icon = step.icon;

      const opacity = useTransform(
        progress,
        [
          step.threshold[0] - 0.04,
          step.threshold[0],
          step.threshold[1],
          step.threshold[1] + 0.04
        ],
        [0, 1, 1, 0]
      );

      const x = useTransform(
        progress,
        [step.threshold[0] - 0.04, step.threshold[0], step.threshold[1], step.threshold[1] + 0.04],
        step.side === "left" ? [-30, 0, 0, -30] : [30, 0, 0, 30]
      );

      const scale = useTransform(
        progress,
        [step.threshold[0] - 0.04, step.threshold[0], step.threshold[1], step.threshold[1] + 0.04],
        [0.9, 1, 1, 0.9]
      );

      const isLeft = step.side === "left";

      return (
        <motion.div
          style={{ opacity, x, scale }}
          className="absolute inset-0 my-auto h-fit p-6 rounded-3xl bg-white/95 backdrop-blur-2xl border-2 border-slate-200/80 shadow-[0_20px_50px_rgba(224,122,95,0.15)]"
        >
          {/* OPTICAL DIRECTIONAL LASER POINTER TOWARDS TIFFIN TIERS */}
          {isLeft ? (
            <div className="absolute top-1/2 -right-14 -translate-y-1/2 flex items-center pointer-events-none">
              <div className="relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: step.accentColor }} />
                <div
                  className="absolute w-6 h-6 rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: step.accentColor }}
                />
              </div>
              <div
                className="w-8 h-[2px]"
                style={{
                  background: `linear-gradient(to right, ${step.accentColor}, ${step.accentColor}88)`
                }}
              />
              <svg
                className="w-5 h-5 -ml-1"
                style={{ color: step.accentColor }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          ) : (
            <div className="absolute top-1/2 -left-14 -translate-y-1/2 flex items-center flex-row-reverse pointer-events-none">
              <div className="relative flex items-center justify-center">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: step.accentColor }} />
                <div
                  className="absolute w-6 h-6 rounded-full animate-ping opacity-40"
                  style={{ backgroundColor: step.accentColor }}
                />
              </div>
              <div
                className="w-8 h-[2px]"
                style={{
                  background: `linear-gradient(to left, ${step.accentColor}, ${step.accentColor}88)`
                }}
              />
              <svg
                className="w-5 h-5 -mr-1"
                style={{ color: step.accentColor }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
            </div>
          )}

          {/* Card Header & Badge */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className="text-[10px] font-black uppercase tracking-wider text-white px-3 py-1 rounded-full shadow-sm"
              style={{ backgroundColor: step.accentColor }}
            >
              {step.badge}
            </span>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${step.accentColor}18`, color: step.accentColor }}
            >
              <Icon size={16} />
            </div>
          </div>

          {/* Title & Role */}
          <h3 className="text-base font-black text-slate-900 leading-snug">
            {step.title}
          </h3>

          <p className="text-xs text-slate-600 font-medium mt-1.5 leading-relaxed">
            {step.description}
          </p>

          {/* Live Spec Telemetry Pill */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
            <span className="text-slate-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
              <Zap size={12} style={{ color: step.accentColor }} /> {step.statLabel}
            </span>
            <span className="font-black text-xs" style={{ color: step.accentColor }}>
              {step.statValue} {step.statUnit}
            </span>
          </div>
        </motion.div>
      );
    }

    // Sub-Component: Mobile HUD Indicator
    function MobileTiffinHUD({ progress }) {
      return (
        <div className="relative min-h-[96px]">
          {TIFFIN_STEPS.map((step) => {
            const opacity = useTransform(
              progress,
              [step.threshold[0] - 0.03, step.threshold[0], step.threshold[1], step.threshold[1] + 0.03],
              [0, 1, 1, 0]
            );

            const y = useTransform(
              progress,
              [step.threshold[0] - 0.03, step.threshold[0], step.threshold[1], step.threshold[1] + 0.03],
              [12, 0, 0, -12]
            );

            return (
              <motion.div
                key={step.id}
                style={{ opacity, y }}
                className="absolute inset-0 p-3.5 rounded-2xl bg-white/95 border-2 border-slate-300 shadow-lg text-left flex flex-col justify-between"
              >
                <div>
                  <span className="text-[9px] font-black uppercase" style={{ color: step.accentColor }}>
                    {step.badge}
                  </span>
                  <h4 className="text-xs font-extrabold text-slate-900 truncate">
                    {step.title}
                  </h4>
                </div>
                <div className="flex items-center justify-between text-[11px] font-black pt-1 border-t border-slate-100" style={{ color: step.accentColor }}>
                  <span>{step.role}</span>
                  <span className="text-[10px] text-slate-400 font-medium">Auto-Sync</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      );
    }

    // Sub-Component: Bottom Scrubber & Immediate Booking Trigger
    function BottomTiffinTelemetry({ progress, onSelectMilestone }) {
      const showCta = useTransform(progress, [0.82, 0.94], [0, 1]);
      const ctaY = useTransform(progress, [0.82, 0.94], [15, 0]);

      return (
        <div className="flex flex-col items-center gap-3">
          
          {/* 4-Step Interactive Milestone Scrubber */}
          <div className="w-full max-w-xl grid grid-cols-4 gap-2 px-2">
            {TIFFIN_STEPS.map((step, idx) => {
              const stepFill = useTransform(
                progress,
                [step.threshold[0], step.threshold[1]],
                ["0%", "100%"]
              );

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => onSelectMilestone(idx)}
                  className="space-y-1.5 text-left group cursor-pointer focus:outline-none"
                >
                  <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5 border border-slate-300/40">
                    <motion.div
                      style={{ width: stepFill, backgroundColor: step.accentColor }}
                      className="h-full rounded-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 group-hover:text-slate-900 transition-colors">
                    <span className="truncate">0{idx + 1} {step.badge.split("• ")[1] || "Step"}</span>
                    <span
                      className="text-[9px] font-extrabold opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: step.accentColor }}
                    >
                      Jump
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Book Tiffin CTA Button */}
          <motion.div
            style={{ opacity: showCta, y: ctaY }}
            className="w-full max-w-md pt-1"
          >
            <Link
              href="/tiffin/customize"
              className="w-full inline-flex items-center justify-center gap-3 py-3.5 px-6 rounded-2xl bg-[#E07A5F] hover:bg-[#C9684F] text-white font-black text-sm shadow-xl shadow-[#E07A5F]/30 transition-all transform hover:-translate-y-0.5 group"
            >
              <span>Start Building Your Custom Tiffin</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
      );
    }