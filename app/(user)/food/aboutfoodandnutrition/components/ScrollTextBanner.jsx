'use client'

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

// --- Pinned Section with Scroll-Driven Content ---
export function ScrollTextBanner() {
  const targetRef = useRef(null);

  // 1. Track scroll inside the 300vh tall container
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  // Smooth physics spring for organic movement
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    restDelta: 0.001,
  });

  // 2. Horizontal text translation: moves from +80% (right) to -100% (completely off left)
  const x = useTransform(smoothProgress, [0, 1], ['80%', '-100%']);

  // 3. Dynamic text opacity & scale effect during scroll
  const textScale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1.05, 0.95]);

  return (
    /* Tall parent section gives scroll runway without moving the pinned content */
    <section ref={targetRef} className="relative h-[300vh] bg-slate-950">
      
      {/* 
        Sticky Viewport: Pins content in the center of the screen
        until the entire 300vh section has been scrolled through
      */}
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        
        {/* Left Edge Fade & Blur Mask */}
        <div className="absolute left-0 top-0 bottom-0 w-1/3 z-20 pointer-events-none bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent backdrop-blur-[2px]" />

        {/* Right Edge Soft Gradient Entry */}
        <div className="absolute right-0 top-0 bottom-0 w-1/6 z-20 pointer-events-none bg-gradient-to-l from-slate-950 to-transparent" />

        {/* Floating Indicator */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 uppercase backdrop-blur-md">
          Pinned Viewport • Scroll to Reveal
        </div>

        {/* Scroll-Driven Horizontal Text */}
        <motion.div
          style={{ x, scale: textScale }}
          className="flex whitespace-nowrap items-center text-7xl md:text-9xl lg:text-[12rem] font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-400 select-none drop-shadow-2xl"
        >
          <span className="mr-12">FRESH ORGANIC INGREDIENTS</span>
          <span className="mr-12"> • </span>
          <span className="mr-12">100% NATURAL SALAD BOWL</span>
          <span className="mr-12"> • </span>
          <span className="mr-12">GREAT HEALTHY LIFESTYLE</span>
        </motion.div>

        {/* Bottom Progress Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 w-64 bg-slate-800/80 h-1.5 rounded-full overflow-hidden border border-slate-700/50 backdrop-blur-md">
          <motion.div
            className="bg-emerald-400 h-full rounded-full"
            style={{ scaleX: smoothProgress, transformOrigin: '0%' }}
          />
        </div>
      </div>
    </section>
  );
}

// --- Full Page Demo Setup ---
export default function App() {
  return (
    <div className="bg-slate-950 text-slate-100 font-sans">
      
      {/* Normal Page Content Above */}
      <section className="h-screen flex flex-col items-center justify-center p-6 text-center border-b border-slate-800">
        <h1 className="text-4xl md:text-6xl font-black text-white mb-4">
          Scroll Down
        </h1>
        <p className="text-slate-400 max-w-md">
          Once you reach the next section, the page will freeze/pin in place while the text scrolls across the screen.
        </p>
        <div className="mt-8 animate-bounce text-emerald-400 text-3xl">↓</div>
      </section>

      {/* Pinned Scroll Section */}
      <PinnedHorizontalScroll />

      {/* Normal Page Content Below */}
      <section className="h-screen flex flex-col items-center justify-center p-6 text-center border-t border-slate-800">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Unpinned & Resumed
        </h2>
        <p className="text-slate-400 max-w-md">
          All text finished scrolling, so the viewport unlocked and normal page scrolling resumed seamlessly.
        </p>
      </section>

    </div>
  );
}