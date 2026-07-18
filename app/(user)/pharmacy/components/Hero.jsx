"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Pill, 
  Truck, 
  ShieldCheck, 
  UploadCloud, 
  ArrowRight, 
  Clock,
  ShoppingBag,
  CheckCircle2,
  Sparkles,
  Percent
} from 'lucide-react';

// Spring animation configuration for premium, physical-feeling motion
const springTransition = {
  type: "spring",
  stiffness: 100,
  damping: 20,
  mass: 1
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.15,
      ...springTransition
    }
  })
};

const PharmacyHero = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#f8fbff] overflow-hidden flex items-center pt-24 pb-16 lg:py-0">
      
      {/* --- PREMIUM DECORATIVE BACKDROPS --- */}
      {/* Soft Glow Circles */}
      <div className="absolute top-0 right-0 w-full lg:w-[52%] h-full bg-gradient-to-bl from-blue-50/80 via-indigo-50/20 to-transparent rounded-bl-[120px] lg:rounded-bl-[200px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-indigo-200/20 rounded-full blur-[140px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-sky-200/25 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Vector Sub-Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 w-full">
        
        {/* --- LEFT SIDE: CONTENT & MEDICINE SEARCH (Span 7/12) --- */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          
          {/* Tagline Badge */}
          <motion.div 
            custom={0}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-blue-100/80 px-4 py-2 rounded-2xl shadow-sm mb-6 w-fit"
          >
            <div className="bg-gradient-to-br from-indigo-500 to-blue-600 p-1.5 rounded-xl text-white">
              <ShieldCheck size={13} />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              100% Genuine Medicines Guaranteed <Sparkles size={12} className="text-amber-500 fill-amber-500" />
            </span>
          </motion.div>

          {/* Core Headline */}
          <motion.h1 
            custom={1}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl sm:text-5xl md:text-6xl xl:text-[4.5rem] font-black text-slate-900 leading-[1.08] mb-6 tracking-tight"
          >
            Your Pharmacy, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] via-[#5053b5] to-[#3d3f96] bg-[length:200%_auto] animate-pulse-slow">
              Delivered in 24h.
            </span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p 
            custom={2}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-normal"
          >
            Get genuine diabetes care essentials, cold-chain insulin, and clinical supplements dispatched directly to your doorstep at unmatched prices.
          </motion.p>

          {/* --- SEARCH BAR WRAPPER --- */}
          <motion.div 
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-2.5 rounded-3xl lg:rounded-[2.2rem] shadow-[0_20px_50px_rgba(61,63,150,0.08)] border border-slate-100 flex flex-col md:flex-row items-stretch md:items-center gap-2 mb-6 group focus-within:shadow-[0_24px_60px_rgba(61,63,150,0.12)] transition-all duration-500"
          >
            <div className="flex items-center gap-3 px-4 py-2 w-full">
              <Search className="text-indigo-500 shrink-0" size={20} />
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Search Medicine</label>
                <input 
                  type="text" 
                  placeholder="Search for Metformin, Insulin, Glimepiride..." 
                  className="bg-transparent outline-none text-sm font-semibold text-slate-800 w-full placeholder:text-slate-400 mt-1"
                />
              </div>
            </div>
            
            <button className="bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#2d2f75] hover:to-[#4a4ca6] text-white py-4 px-8 rounded-2xl md:rounded-[1.6rem] font-bold shadow-[0_10px_25px_rgba(61,63,150,0.2)] hover:shadow-[0_12px_30px_rgba(61,63,150,0.35)] active:scale-[0.98] transition-all duration-300 w-full md:w-auto shrink-0 flex items-center justify-center gap-2 group/btn">
              Search <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Prescription Upload & Promo Segment */}
          <motion.div 
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-y-3 gap-x-4 mb-10 text-slate-500 font-medium text-sm"
          >
            <button className="flex items-center gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-bold transition-colors group/upload">
              <UploadCloud size={18} className="group-hover/upload:-translate-y-0.5 transition-transform" />
              Upload Prescription
            </button>
            <span className="text-slate-200 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1 rounded-full border border-amber-200/50">
              <Percent size={13} className="stroke-[3]" />
              <p className="text-xs font-black uppercase tracking-wider">Flat 20% Off on your first order</p>
            </div>
          </motion.div>

          {/* Quick Value Pillars */}
          <motion.div 
            custom={5}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-y-4 gap-x-8 border-t border-slate-100 pt-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-[#3d3f96] p-2.5 rounded-2xl border border-blue-100/50">
                <Truck size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">24-Hour Delivery</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Express dispatch</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl border border-emerald-100/50">
                <ShieldCheck size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">100% Certified Safe</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Batch verified</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl border border-amber-100/50">
                <Clock size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Hassle-Free Returns</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No questions asked</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- RIGHT SIDE: VISUALS (Span 5/12) --- */}
        <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center items-center">
          
          {/* Main Pharmacy Hero Graphic Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 rounded-[3rem] lg:rounded-[4.5rem] overflow-hidden border-[10px] border-white shadow-[0_30px_70px_rgba(15,23,42,0.12)] aspect-[4/5] w-full max-w-[420px]"
          >
            <img 
              src="https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?q=80&w=2070&auto=format&fit=crop" 
              alt="Genuine verified pharmacy and cold-chain insulin storage" 
              className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out"
            />
            {/* Visual Tint Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d3f96]/25 via-transparent to-transparent"></div>
          </motion.div>

          {/* --- FLOATING glassmorphism CARDS --- */}
          
          {/* Floating Card 1: Order Tracking Status */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 -left-8 lg:-left-12 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.06)] border border-white/50 flex items-center gap-4 min-w-[230px] pointer-events-none hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-gradient-to-br from-[#3d3f96] to-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-indigo-500/25">
              <Truck size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none mb-1">Live Tracking</p>
              <p className="text-base font-black text-slate-800">Out for delivery</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Discount Badge */}
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-12 -right-4 lg:-right-8 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-white/50 flex flex-col gap-3 min-w-[200px] pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <div className="bg-emerald-50 text-emerald-600 p-1 rounded-md">
                <CheckCircle2 size={13} className="stroke-[3]" />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Verified Pharmacist</span>
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">
                <ShoppingBag size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">Flat 20%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Discount Applied</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default PharmacyHero;