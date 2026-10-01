"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ambulance,
  PhoneCall,
  Navigation,
  ShieldCheck,
  Clock,
  Activity,
  ArrowRight,
  HeartPulse,
  Zap,
  Radio,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Stethoscope,
  Sparkles,
  Award,
  ShieldAlert,
  Flame
} from "lucide-react";

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // High-impact dynamic sliding banners
  const banners = [
    {
      id: 1,
      badge: "Flagship Service",
      badgeColor: "bg-red-500/10 text-red-600 border-red-200",
      title: "Diabetic Emergency ICU on Wheels",
      subtitle: "Dedicated unit for Hypoglycemia, DKA & Sudden Blood Sugar Crises",
      stats: "10-12 Min Arrival",
      statsLabel: "Average GPS Dispatch",
      image: "https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=1200&auto=format&fit=crop",
      features: ["IV Glucose & Insulin Infusion", "Continuous CGM Telemetry", "Endocrine Specialist On-Call"],
      accentGradient: "from-red-600 via-rose-600 to-red-700",
      icon: Droplets
    },
    {
      id: 2,
      badge: "Advanced Life Support",
      badgeColor: "bg-blue-500/10 text-blue-600 border-blue-200",
      title: "ACLS Cardiac & Critical Care Unit",
      subtitle: "Heavy critical care equipped with Transport Ventilators & Defibrillators",
      stats: "100% ICU Setup",
      statsLabel: "Hospital Grade Care",
      image: "https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=1200&auto=format&fit=crop",
      features: ["Transport Ventilator & Oxygen", "Multipara Cardiac Monitor", "Emergency ER Physician Link"],
      accentGradient: "from-blue-600 via-indigo-600 to-blue-700",
      icon: HeartPulse
    },
    {
      id: 3,
      badge: "Zero Delay Protocol",
      badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
      title: "Green Corridor Rapid Response",
      subtitle: "Priority traffic clearance with live telemetry transmission to hospital ER",
      stats: "< 8 Mins",
      statsLabel: "Fast Responder Units",
      image: "https://images.unsplash.com/photo-1583912267670-6575ad36248b?q=80&w=1200&auto=format&fit=crop",
      features: ["Traffic Police Route Bypass", "Pre-admission Hospital ER Alert", "Paramedic First-Response"],
      accentGradient: "from-emerald-600 via-teal-600 to-emerald-700",
      icon: Zap
    }
  ];

  // Infinite ticker items
  const tickerItems = [
    "🚨 24x7 Live GPS Dispatch",
    "🩺 Diabetic Coma & DKA Kits",
    "⚡ 12-Min Response Guarantee",
    "🏥 Direct Admission into 250+ Partner Hospitals",
    "🩸 Point-of-Care Blood Sugar & Lactate Labs",
    "🫀 ACLS Certified Paramedics"
  ];

  // Auto-play timer for moving banners (every 5 seconds)
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, banners.length]);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative w-full min-h-screen flex flex-col justify-between overflow-hidden bg-[#F8FAFC] select-none">
      
      {/* ========================================================
          1. TOP LIVE EMERGENCY ALERT BAR
         ======================================================== */}
      <div className="w-full bg-gradient-to-r from-red-700 via-red-600 to-rose-700 text-white px-4 py-2 shadow-sm relative z-30">
        <div className="max-w-[1536px] mx-auto flex items-center justify-between text-xs sm:text-sm">
          <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
            <span className="flex h-2.5 w-2.5 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300"></span>
            </span>
            <span className="font-extrabold uppercase text-[10px] bg-black/30 px-2 py-0.5 rounded border border-white/20">
              Live Network
            </span>
            <span className="text-red-50 truncate">
              Specialized Diabetic Critical Ambulances Standing By in <strong className="text-white underline decoration-amber-300">Delhi NCR, Mumbai & Bangalore</strong>
            </span>
          </div>
          <a
            href="tel:+919876543210"
            className="hidden md:flex items-center gap-1.5 font-bold hover:text-amber-200 transition-colors flex-shrink-0 text-xs"
          >
            <Radio size={14} className="animate-pulse text-amber-300" />
            24/7 Helpline: 1800-DIABETES
          </a>
        </div>
      </div>

      {/* ========================================================
          2. HERO CONTENT WITH ONE-BY-ONE ROTATING BANNERS
         ======================================================== */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-12 w-full z-10 relative flex-1 flex flex-col justify-center py-6 sm:py-10">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-full mb-3 shadow-xs">
              <Sparkles size={14} className="text-red-600 animate-spin" />
              <span className="text-[11px] font-black text-red-700 uppercase tracking-widest">
                Specialized Emergency Medical Service
              </span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Diabetes Wala{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-red-700">
                On Wheels.
              </span>
            </h1>
          </div>

          {/* Emergency Direct Call Button */}
          <div className="flex items-center gap-4">
            <a
              href="tel:+919876543210"
              className="inline-flex items-center gap-3.5 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl shadow-xl shadow-red-600/30 transition-all transform hover:-translate-y-0.5 active:scale-95 group"
            >
              <div className="bg-white/20 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <PhoneCall size={20} className="animate-bounce" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-black text-red-200 tracking-widest">1-Tap Emergency Call</p>
                <p className="text-base font-black tracking-tight">+91 98765 43210</p>
              </div>
            </a>
          </div>
        </div>

        {/* ========================================================
            3. DYNAMIC ONE-BY-ONE ROTATING SLIDE BANNER
           ======================================================== */}
        <div
          className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Progress Bar for Auto-rotation */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/10 z-30">
            <motion.div
              key={currentSlide}
              initial={{ width: "0%" }}
              animate={{ width: isPaused ? "100%" : "100%" }}
              transition={{ duration: 5, ease: "linear" }}
              className="h-full bg-gradient-to-r from-red-500 to-amber-400"
            />
          </div>

          {/* Animated Slide Content Container */}
          <div className="relative min-h-[460px] sm:min-h-[500px] lg:min-h-[520px] flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={banners[currentSlide].id}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-0 w-full h-full flex flex-col lg:flex-row items-center justify-between"
              >
                {/* Background Image with Dark/Color Gradient Overlay */}
                <div className="absolute inset-0 z-0">
                  <img
                    src={banners[currentSlide].image}
                    alt={banners[currentSlide].title}
                    className="w-full h-full object-cover opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/60" />
                </div>

                {/* Left Side Content inside Banner */}
                <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-2xl space-y-5 text-white">
                  
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1.5 rounded-full">
                    {React.createElement(banners[currentSlide].icon, {
                      size: 16,
                      className: "text-red-400"
                    })}
                    <span className="text-xs font-bold tracking-wider uppercase text-slate-100">
                      {banners[currentSlide].badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <div className="space-y-2">
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                      {banners[currentSlide].title}
                    </h2>
                    <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
                      {banners[currentSlide].subtitle}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {banners[currentSlide].features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-200">
                        <ShieldCheck size={16} className="text-emerald-400 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action CTA inside Banner */}
                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <a
                      href="tel:+919876543210"
                      className="inline-flex items-center gap-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl shadow-lg transition-all"
                    >
                      <Ambulance size={18} />
                      <span>DISPATCH THIS AMBULANCE</span>
                      <ArrowRight size={16} />
                    </a>

                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Clock size={14} className="text-amber-400" />
                      <span>GPS Tracking activated automatically</span>
                    </div>
                  </div>

                </div>

                {/* Right Side Stats Glass Badge inside Banner */}
                <div className="relative z-10 p-6 sm:p-10 lg:pr-14 flex lg:flex-col items-center justify-center gap-4">
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-6 rounded-3xl shadow-2xl text-center min-w-[200px] sm:min-w-[240px]">
                    <div className="w-12 h-12 mx-auto bg-red-600/30 border border-red-400/40 rounded-2xl flex items-center justify-center text-red-400 mb-3">
                      <Activity size={24} className="animate-pulse" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {banners[currentSlide].stats}
                    </p>
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mt-1">
                      {banners[currentSlide].statsLabel}
                    </p>
                    <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400 font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Ready for Immediate Deployment
                    </div>
                  </div>
                </div>

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls (Prev / Next Buttons) */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-110"
            aria-label="Previous Banner"
          >
            <ChevronLeft size={22} />
          </button>
          
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20 transition-all opacity-80 hover:opacity-100 hover:scale-110"
            aria-label="Next Banner"
          >
            <ChevronRight size={22} />
          </button>

          {/* Bottom Dot Indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentSlide === idx
                    ? "w-8 h-2.5 bg-gradient-to-r from-red-500 to-amber-400"
                    : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

        </div>

      </div>

      {/* ========================================================
          4. INFINITE MOVING TICKER STRIP AT BOTTOM
         ======================================================== */}
      <div className="w-full bg-slate-900 text-white py-3.5 overflow-hidden border-t border-slate-800 relative z-20">
        <div className="flex whitespace-nowrap">
          {/* Animated Marquee Strip 1 */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-10 pr-10 flex-shrink-0"
          >
            {tickerItems.map((text, i) => (
              <span key={i} className="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-3 text-slate-200">
                <span>{text}</span>
                <span className="text-red-500 font-black">✦</span>
              </span>
            ))}
          </motion.div>

          {/* Animated Marquee Strip 2 (Duplicate for Seamless Loop) */}
          <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="flex items-center gap-10 pr-10 flex-shrink-0"
          >
            {tickerItems.map((text, i) => (
              <span key={`dup-${i}`} className="text-xs sm:text-sm font-bold tracking-wide flex items-center gap-3 text-slate-200">
                <span>{text}</span>
                <span className="text-red-500 font-black">✦</span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default Hero;