"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UploadCloud,
  Truck,
  ShieldCheck,
  ArrowRight,
  Pill,
  Activity,
  Stethoscope,
  Percent,
  Ambulance,
  Apple,
  Building2,
  ChevronRight,
  PhoneCall,
  Star,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentBg, setCurrentBg] = useState(0);

  const bgImages = [
    "https://www.shutterstock.com/image-photo/diabetes-concept-blood-sugar-meter-260nw-2464647841.jpg",
    "https://images.unsplash.com/photo-1624454002429-40ed87a5ec04?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1511174511562-5f7f18b874f8?q=80&w=1920&auto=format&fit=crop"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % bgImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: "Medicines", href: "/pharmacy", icon: <Pill size={18} />, color: "text-blue-600", bg: "bg-blue-50" },
    { name: "CGM Devices", href: "/shop/cgmdevices", icon: <Activity size={18} />, color: "text-orange-600", bg: "bg-orange-50" },
    { name: "Doctor", href: "/doctor", icon: <Stethoscope size={18} />, color: "text-purple-600", bg: "bg-purple-50" },
    { name: "Lab Tests", href: "/labs", icon: <ShieldCheck size={18} />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { name: "Clinics", href: "/clinic", icon: <Building2 size={18} />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { name: "Nutrition", href: "/food-nutrition", icon: <Apple size={18} />, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-screen flex items-center overflow-hidden bg-white">

      {/* --- 1. DYNAMIC BACKGROUND SLIDER --- */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentBg}
            src={bgImages[currentBg]}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Professional Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/20 lg:block hidden" />
        <div className="absolute inset-0 bg-white/90 lg:hidden block" />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full z-10 relative py-10 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* --- 2. LEFT CONTENT: REFINED & PROFESSIONAL --- */}
          <div className="lg:col-span-8 xl:col-span-7 space-y-8">

            {/* Minimalist Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap gap-3"
            >
              <div className="inline-flex items-center gap-2 bg-[#3d3f96]/10 text-[#3d3f96] px-3 py-1.5 rounded-full border border-[#3d3f96]/20 text-[10px] font-bold uppercase tracking-wider">
                <Star size={12} className="fill-[#3d3f96]" />
                India's Trusted Diabetes Platform
              </div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100 text-[10px] font-bold uppercase tracking-wider">
                <Percent size={12} />
                Flat 20% Off First Order
              </div>
            </motion.div>

            {/* Professional Headline Scale */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
                Your Health, <br />
                <span className="text-[#3d3f96]">Our Primary Mission.</span>
              </h1>
              <p className="text-base md:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
                Access genuine medicines, 24/7 specialist consultations, and certified diagnostics. Join the movement for <span className="text-slate-900 font-bold">Diabetes Reversal.</span>
              </p>
            </motion.div>

            {/* --- SEARCH & EMERGENCY ACTION --- */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <div className="flex flex-col md:flex-row gap-4 max-w-3xl">
                {/* Clean Search Bar */}
                <div className="relative flex-1 group">
                  <div className="relative flex items-center bg-white border border-slate-200 group-focus-within:border-[#3d3f96] group-focus-within:ring-4 group-focus-within:ring-[#3d3f96]/5 rounded-2xl p-1.5 shadow-sm transition-all">
                    <div className="pl-4 pr-2 text-slate-400">
                      <Search size={20} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search Medicines, CGMs, Labs..."
                      className="w-full bg-transparent outline-none text-slate-800 font-semibold text-sm py-3"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 py-3 rounded-xl font-bold text-xs transition-all hidden sm:block">
                      SEARCH
                    </button>
                  </div>
                </div>

                {/* AMBULANCE - High Visibility but Professional */}
                <Link href='/ambulance' className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-3 shadow-lg shadow-red-100 transition-all active:scale-95 shrink-0">
                  <Ambulance size={20} />
                  BOOK AMBULANCE
                </Link>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-6 px-2">
                <button className="flex items-center gap-2 text-[#3d3f96] font-bold text-xs uppercase tracking-widest hover:underline">
                  <UploadCloud size={18} />
                  Upload Prescription
                </button>
                <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                <div className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase tracking-widest">
                  <PhoneCall size={16} className="text-emerald-500" />
                  Emergency: 1800-DIABETES
                </div>
              </div>
            </motion.div>

            {/* --- CATEGORY GRID (CLEAN & USER FRIENDLY) --- */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-4"
            >
              {categories.map((cat, i) => (
                <Link key={i} href={cat.href}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group bg-white border border-slate-100 p-4 rounded-2xl flex flex-col items-center justify-center gap-3 shadow-sm hover:shadow-md hover:border-[#3d3f96]/20 transition-all cursor-pointer"
                  >
                    <div className={`${cat.bg} ${cat.color} p-2.5 rounded-xl transition-colors group-hover:bg-[#3d3f96] group-hover:text-white`}>
                      {cat.icon}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-700">{cat.name}</span>
                  </motion.div>
                </Link>
              ))}
            </motion.div>

            {/* Trust Footer */}
            <div className="pt-8 flex flex-wrap gap-8 border-t border-slate-100">
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <CheckCircle2 size={14} className="text-emerald-500" /> 100% Genuine
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <Truck size={14} className="text-blue-500" /> 24h Delivery
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <ShieldCheck size={14} className="text-purple-500" /> NABL Certified
              </div>
            </div>

          </div>

          {/* --- RIGHT SIDE: CLEAN STATS OVERLAY --- */}
          <div className="hidden lg:col-span-4 xl:col-span-5 lg:flex flex-col items-end justify-center gap-6">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white/90 backdrop-blur-md p-5 rounded-3xl shadow-xl border border-white flex items-center gap-4 min-w-[220px]"
            >
              <div className="bg-blue-50 p-3 rounded-2xl text-[#3d3f96]">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Active Care</p>
                <p className="text-base font-black text-slate-800">50k+ Patients</p>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="bg-[#3d3f96] p-5 rounded-3xl shadow-xl flex items-center gap-4 min-w-[220px] text-white"
            >
              <div className="bg-white/10 p-3 rounded-2xl">
                <Building2 size={24} className="text-blue-200" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-blue-200 uppercase">Network</p>
                <p className="text-base font-black">25+ Premium Clinics</p>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;