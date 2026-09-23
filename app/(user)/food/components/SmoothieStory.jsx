"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Sparkles, ArrowRight, ShieldCheck, Leaf, Flame } from "lucide-react";

// Image layers in your /public folder
const CUP_LAYERS = [
    { id: "layer-0", src: "/animationimages/img1.webp", label: "Empty Glass" },
    { id: "layer-1", src: "/animationimages/img2.webp", label: "Pea Protein", threshold: [0.06, 0.17] },
    { id: "layer-2", src: "/animationimages/img3.webp", label: "Flax Seeds", threshold: [0.18, 0.30] },
    { id: "layer-3", src: "/animationimages/img4.webp", label: "Blueberries", threshold: [0.31, 0.44] },
    { id: "layer-4", src: "/animationimages/img5.webp", label: "Strawberries", threshold: [0.45, 0.58] },
    { id: "layer-5", src: "/animationimages/img6.webp", label: "Bananas", threshold: [0.59, 0.72] },
    { id: "layer-6", src: "/animationimages/img7.webp", label: "Kale", threshold: [0.73, 0.86] }
];

// Ingredient callouts matching your breakdown screen
const CALLOUTS = {
    left: [
        {
            id: "banana",
            title: "BANANA",
            description: "Natural energy. Fiber. Potassium.",
            start: 0.59
        },
        {
            id: "blueberry",
            title: "BLUEBERRY",
            description: "Anthocyanins. Fiber. Vitamin C.",
            start: 0.31
        },
        {
            id: "flax",
            title: "FLAX SEEDS",
            description: "Omega-3s. Fiber. Lignans.",
            start: 0.18
        }
    ],
    right: [
        {
            id: "kale",
            title: "KALE",
            description: "Iron. Calcium. Vitamin K.",
            start: 0.73
        },
        {
            id: "strawberry",
            title: "STRAWBERRY",
            description: "Vitamin C. Antioxidants. Fiber.",
            start: 0.45
        },
        {
            id: "protein",
            title: "PEA PROTEIN",
            description: "Muscle recovery. Essential amino acids. Sustained fullness.",
            start: 0.06
        }
    ]
};

export default function SmoothieStory() {
    const containerRef = useRef(null);

    // 450vh scroll track for smooth layer assembly + grand finale
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Spring physics for buttery smooth motion
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 70,
        damping: 20,
        mass: 0.5,
        restDelta: 0.0001
    });

    // Fades OUT individual callouts near the end (0.83 -> 0.88)
    const calloutsGlobalOpacity = useTransform(
        smoothProgress,
        [0.83, 0.88],
        [1, 0],
        { clamp: true }
    );

    // Fades IN the big "FROZEN AT PEAK" finale titles (0.88 -> 0.95)
    const finaleOpacity = useTransform(
        smoothProgress,
        [0.88, 0.95],
        [0, 1],
        { clamp: true }
    );

    const finaleLeftX = useTransform(
        smoothProgress,
        [0.88, 0.96],
        [-20, 0],
        { clamp: true }
    );

    const finaleRightX = useTransform(
        smoothProgress,
        [0.88, 0.96],
        [20, 0],
        { clamp: true }
    );

    const finaleTaglineY = useTransform(
        smoothProgress,
        [0.89, 0.96],
        [15, 0],
        { clamp: true }
    );

    // Click-to-jump handler for the bottom dashed scrubber
    const scrollToMilestone = (index) => {
        if (!containerRef.current) return;
        const targetPercentages = [0.0, 0.12, 0.25, 0.38, 0.52, 0.66, 0.80, 0.96];
        const container = containerRef.current;
        const rect = container.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const containerTop = rect.top + scrollTop;
        const totalScroll = container.offsetHeight - window.innerHeight;
        const targetScroll = containerTop + targetPercentages[index] * totalScroll;

        window.scrollTo({
            top: targetScroll,
            behavior: "smooth"
        });
    };

    return (
        <div
            ref={containerRef}
            className="relative bg-[#FAF7F2] text-slate-950 selection:bg-slate-900 selection:text-white"
        >
            <div style={{ height: "450vh" }}>

                {/* Sticky Stage Viewport */}
                <div className="sticky top-0 h-screen w-full flex flex-col justify-between items-center px-4 sm:px-8 lg:px-12 py-3 sm:py-5 select-none overflow-hidden">

                    {/* Subtle Stage Ambient Aura */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-amber-500/[0.03] rounded-full blur-3xl pointer-events-none -z-10" />

                    {/* MAIN STAGE: Left Column | Center Cup | Right Column */}
                    <div className="relative flex-1 w-full max-w-[1400px] mx-auto flex items-center justify-between my-auto px-2 sm:px-4">

                        {/* ================= LEFT COLUMN ================= */}
                        <div className="relative flex-1 flex items-center justify-end pr-2 sm:pr-4 lg:pr-8 z-20 min-w-0">

                            {/* 1. Ingredient Callouts (Active during scroll 0.0 -> 0.85) */}
                            <motion.div
                                style={{ opacity: calloutsGlobalOpacity }}
                                className="hidden md:flex flex-col justify-between h-[380px] lg:h-[440px] w-48 lg:w-60 text-left pointer-events-none"
                            >
                                {CALLOUTS.left.map((item) => (
                                    <CalloutItem
                                        key={item.id}
                                        item={item}
                                        progress={smoothProgress}
                                        side="left"
                                    />
                                ))}
                            </motion.div>

                            {/* 2. Finale Headline: "FROZEN" (Fitted to prevent 'F' clipping) */}
                            <motion.div
                                style={{ opacity: finaleOpacity, x: finaleLeftX }}
                                className="absolute right-0 sm:right-2 lg:right-4 top-1/2 -translate-y-1/2 text-right pointer-events-none max-w-full pl-2"
                            >
                                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[6.5rem] font-black tracking-tight text-slate-950 uppercase leading-none font-sans select-none">
                                    FROZEN
                                </h1>
                                <p className="text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-widest text-[#E07A5F] mt-2 hidden sm:block">
                                    Phase 01 • Peak Solar Harvest
                                </p>
                            </motion.div>
                        </div>

                        {/* ================= CENTER CUP CONTAINER ================= */}
                        <div className="relative flex flex-col items-center justify-center shrink-0 z-10 mx-1 sm:mx-4">

                            {/* Layered Image Frame */}
                            <div className="relative w-[280px] sm:w-[340px] md:w-[390px] lg:w-[440px] xl:w-[480px] h-[390px] sm:h-[480px] md:h-[540px] lg:h-[600px] drop-shadow-[0_20px_35px_rgba(0,0,0,0.10)]">

                                {/* 1. Base Layer (Empty Glass - Always visible) */}
                                <img
                                    src={CUP_LAYERS[0].src}
                                    alt="Base Glass"
                                    className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                                    onError={(e) => {
                                        e.currentTarget.style.opacity = "0.4";
                                    }}
                                />

                                {/* 2 to 6: Layered Ingredient Images that crossfade sequentially */}
                                {CUP_LAYERS.slice(1).map((layer) => (
                                    <LayerImage
                                        key={layer.id}
                                        layer={layer}
                                        progress={smoothProgress}
                                    />
                                ))}

                            </div>

                            {/* Floor Contact Soft Shadow */}
                            <div className="w-48 sm:w-64 md:w-72 h-3.5 bg-black/[0.08] rounded-full blur-md -mt-2 pointer-events-none" />

                            {/* Mobile HUD Indicator */}
                            <div className="md:hidden mt-2 w-full max-w-xs">
                                <MobileCalloutHUD
                                    progress={smoothProgress}
                                    calloutsOpacity={calloutsGlobalOpacity}
                                    finaleOpacity={finaleOpacity}
                                />
                            </div>

                        </div>

                        {/* ================= RIGHT COLUMN ================= */}
                        <div className="relative flex-1 flex items-center justify-start pl-2 sm:pl-4 lg:pl-8 z-20 min-w-0">

                            {/* 1. Ingredient Callouts (Active during scroll 0.0 -> 0.85) */}
                            <motion.div
                                style={{ opacity: calloutsGlobalOpacity }}
                                className="hidden md:flex flex-col justify-between h-[380px] lg:h-[440px] w-48 lg:w-60 text-left pointer-events-none"
                            >
                                {CALLOUTS.right.map((item) => (
                                    <CalloutItem
                                        key={item.id}
                                        item={item}
                                        progress={smoothProgress}
                                        side="right"
                                    />
                                ))}
                            </motion.div>

                            {/* 2. Finale Headline: "AT PEAK" (Fitted to prevent 'K' clipping) */}
                            <motion.div
                                style={{ opacity: finaleOpacity, x: finaleRightX }}
                                className="absolute left-0 sm:left-2 lg:left-4 top-1/2 -translate-y-1/2 text-left pointer-events-none max-w-full pr-2"
                            >
                                <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[6.5rem] font-black tracking-tight text-slate-950 uppercase leading-none font-sans select-none whitespace-nowrap">
                                    AT PEAK
                                </h1>
                                <p className="text-[10px] sm:text-xs lg:text-sm font-black uppercase tracking-widest text-[#3D3F96] mt-2 hidden sm:block">
                                    100% Intact Phytonutrients
                                </p>
                            </motion.div>
                        </div>

                    </div>

                    {/* ================= FINALE TAGLINE & SCRUBBER FOOTER ================= */}
                    <div className="w-full max-w-2xl mx-auto z-20 shrink-0 flex flex-col items-center gap-2 pt-1 pb-1">

                        {/* Animated Finale Supporting Tagline */}
                        <motion.div
                            style={{ opacity: finaleOpacity, y: finaleTaglineY }}
                            className="text-center space-y-1"
                        >
                            <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-lg mx-auto leading-relaxed">
                                Flash-frozen within hours of harvest to lock in maximum cellular enzymes, antioxidants, and pure flavor.
                            </p>
                            <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-500">
                                <span className="flex items-center gap-1 text-slate-800">
                                    <Sparkles size={11} className="text-amber-500" /> 0g Added Sugar
                                </span>
                                <span>•</span>
                                <span className="text-slate-800">100% Organic</span>
                                <span>•</span>
                                <span className="text-slate-800">No Preservatives</span>
                            </div>
                        </motion.div>

                        {/* Bottom Dashed Milestone Scrubber */}
                        <div className="w-full max-w-xs sm:max-w-sm pt-1">
                            <BottomDashScrubber
                                progress={smoothProgress}
                                onSelect={scrollToMilestone}
                            />
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
}

// Sub-Component: Layered PNG Image (Crossfading with spring physics)
function LayerImage({ layer, progress }) {
    const opacity = useTransform(
        progress,
        [layer.threshold[0], layer.threshold[1]],
        [0, 1],
        { clamp: true }
    );

    const scale = useTransform(
        progress,
        [layer.threshold[0], layer.threshold[1]],
        [0.98, 1.0],
        { clamp: true }
    );

    return (
        <motion.img
            src={layer.src}
            alt={layer.label}
            style={{ opacity, scale }}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
    );
}

// Sub-Component: Desktop Ingredient Callout
function CalloutItem({ item, progress, side }) {
    const isLeft = side === "left";

    const opacity = useTransform(
        progress,
        [item.start - 0.03, item.start + 0.04],
        [0, 1],
        { clamp: true }
    );

    const x = useTransform(
        progress,
        [item.start - 0.03, item.start + 0.04],
        isLeft ? [-14, 0] : [14, 0],
        { clamp: true }
    );

    return (
        <motion.div
            style={{ opacity, x }}
            className="flex flex-col transition-all duration-300"
        >
            {/* Title with Dash Line Connector */}
            <div className="flex items-center gap-2">
                {isLeft ? (
                    <>
                        <h3 className="text-sm lg:text-base font-black tracking-wide text-slate-900 font-sans uppercase">
                            {item.title}
                        </h3>
                        <span className="w-5 lg:w-8 h-[1.5px] bg-slate-900 block shrink-0" />
                    </>
                ) : (
                    <>
                        <span className="w-5 lg:w-8 h-[1.5px] bg-slate-900 block shrink-0" />
                        <h3 className="text-sm lg:text-base font-black tracking-wide text-slate-900 font-sans uppercase">
                            {item.title}
                        </h3>
                    </>
                )}
            </div>

            {/* Description Subtitle */}
            <p
                className={`text-[10px] lg:text-[11px] text-slate-500 font-medium tracking-normal mt-0.5 max-w-[180px] lg:max-w-[210px] leading-snug ${isLeft ? "pl-0" : "pl-7 lg:pl-10"
                    }`}
            >
                {item.description}
            </p>
        </motion.div>
    );
}

// Sub-Component: Mobile HUD Callout Indicator
function MobileCalloutHUD({ progress, calloutsOpacity, finaleOpacity }) {
    const allItems = [...CALLOUTS.right, ...CALLOUTS.left];

    return (
        <div className="relative min-h-[46px] flex items-center justify-center">
            {/* Ingredient cycling on mobile */}
            <motion.div style={{ opacity: calloutsOpacity }} className="absolute inset-0">
                {allItems.map((item) => {
                    const opacity = useTransform(
                        progress,
                        [item.start - 0.03, item.start, item.start + 0.12, item.start + 0.16],
                        [0, 1, 1, 0],
                        { clamp: true }
                    );

                    return (
                        <motion.div
                            key={item.id}
                            style={{ opacity }}
                            className="absolute inset-0 flex flex-col items-center justify-center text-center p-1.5 rounded-xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-sm"
                        >
                            <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-900">
                                {item.title}
                            </h4>
                            <p className="text-[9px] text-slate-500 font-medium truncate max-w-xs">
                                {item.description}
                            </p>
                        </motion.div>
                    );
                })}
            </motion.div>

            {/* Finale headline on mobile */}
            <motion.div
                style={{ opacity: finaleOpacity }}
                className="absolute inset-0 flex items-center justify-center"
            >
                <span className="text-base font-black tracking-tight uppercase text-slate-950 bg-white/95 px-4 py-1 rounded-full border border-slate-300 shadow-sm">
                    FROZEN AT PEAK
                </span>
            </motion.div>
        </div>
    );
}

// Sub-Component: Bottom Dashed Milestone Scrubber
function BottomDashScrubber({ progress, onSelect }) {
    const totalSteps = CUP_LAYERS.length + 1; // 7 layers + 1 finale step

    return (
        <div className="flex items-center justify-between gap-1.5 px-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
                <DashItem
                    key={index}
                    index={index}
                    totalSteps={totalSteps}
                    progress={progress}
                    onSelect={onSelect}
                />
            ))}
        </div>
    );
}

// Individual Dash Bar with Active Fill Transition
function DashItem({ index, totalSteps, progress, onSelect }) {
    const stepThreshold = index / (totalSteps - 1);

    const barWidth = useTransform(
        progress,
        [stepThreshold - 0.08, stepThreshold],
        ["0%", "100%"],
        { clamp: true }
    );

    const opacity = useTransform(
        progress,
        [stepThreshold - 0.08, stepThreshold],
        [0.3, 1.0],
        { clamp: true }
    );

    return (
        <button
            type="button"
            onClick={() => onSelect(index)}
            className="flex-1 h-3 flex items-center justify-center group cursor-pointer focus:outline-none py-1"
            title={index === totalSteps - 1 ? "Frozen at Peak" : CUP_LAYERS[index]?.label}
        >
            <div className="relative w-full h-[2px] bg-slate-300 rounded-full overflow-hidden transition-colors group-hover:bg-slate-400">
                <motion.div
                    style={{ width: index === 0 ? "100%" : barWidth, opacity }}
                    className="h-full bg-slate-900 rounded-full"
                />
            </div>
        </button>
    );
}