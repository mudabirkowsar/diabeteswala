"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Stethoscope, 
  ShieldCheck, 
  ArrowRight, 
  Building2, 
  CheckCircle2,
  Users,
  Clock,
  Sparkles
} from 'lucide-react';

// Spring transition configs for smooth, premium-feeling animations
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

const Hero = () => {
  return (
    <section className="relative w-full min-h-screen bg-[#f8fbff] overflow-hidden flex items-center pt-24 pb-16 lg:py-0">
      
      {/* --- PREMIUM BACKGROUND PATTERNS --- */}
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-full lg:w-[55%] h-full bg-gradient-to-bl from-blue-50/70 via-indigo-50/30 to-transparent rounded-bl-[120px] lg:rounded-bl-[200px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-blue-200/20 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-purple-200/20 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 pointer-events-none z-0"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 w-full">
        
        {/* --- LEFT SIDE: CONTENT & CLINIC SEARCH (Span 7/12) --- */}
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
              <Building2 size={13} />
            </div>
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
              World-Class Diabetes Facilities <Sparkles size={12} className="text-amber-500 fill-amber-500" />
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
            Modern Clinics <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] via-[#5053b5] to-[#3d3f96] bg-[length:200%_auto] animate-pulse-slow">
              Near Your Home.
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
            Experience premium, specialized in-person care. Access advanced diagnostics and consult India's finest endocrinology experts right in your neighborhood.
          </motion.p>

          {/* --- CLINIC SEARCH BAR (RE-DESIGNED FOR PREMIUM FEEL) --- */}
          <motion.div 
            custom={3}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="bg-white p-3 rounded-3xl lg:rounded-[2.2rem] shadow-[0_20px_50px_rgba(61,63,150,0.1)] border border-slate-100/80 flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-10 group hover:shadow-[0_24px_60px_rgba(61,63,150,0.14)] transition-all duration-500"
          >
            {/* Location input */}
            <div className="flex items-center gap-3 px-4 py-2 w-full border-b md:border-b-0 md:border-r border-slate-100 group-focus-within:border-indigo-100 transition-all duration-300">
              <MapPin className="text-indigo-500 shrink-0" size={20} />
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                <input 
                  type="text" 
                  placeholder="Enter city or area..." 
                  className="bg-transparent outline-none text-sm font-semibold text-slate-800 w-full placeholder:text-slate-400 mt-0.5"
                />
              </div>
            </div>

            {/* Specialization selector */}
            <div className="flex items-center gap-3 px-4 py-2 w-full">
              <Stethoscope className="text-indigo-500 shrink-0" size={20} />
              <div className="flex flex-col w-full">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Care Specialization</label>
                <select className="bg-transparent outline-none text-sm font-semibold text-slate-800 w-full cursor-pointer mt-0.5 appearance-none pr-4">
                  <option>All Specializations</option>
                  <option>Endocrinology</option>
                  <option>Diabetic Foot Care</option>
                  <option>Nutrition & Diet</option>
                </select>
              </div>
            </div>

            {/* Action button */}
            <button className="bg-gradient-to-r from-[#3d3f96] to-[#5a5dbd] hover:from-[#2d2f75] hover:to-[#4a4ca6] text-white py-4 px-8 rounded-2xl md:rounded-[1.6rem] font-bold shadow-[0_10px_25px_rgba(61,63,150,0.3)] hover:shadow-[0_12px_30px_rgba(61,63,150,0.45)] active:scale-[0.98] transition-all duration-300 w-full md:w-auto shrink-0 flex items-center justify-center gap-2 group/btn">
              Find Clinic 
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div 
            custom={4}
            variants={fadeUpVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-center gap-y-4 gap-x-8 border-t border-slate-100 pt-6"
          >
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl border border-emerald-100/50">
                <ShieldCheck size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">ISO 9001 Certified</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accredited Safety</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-blue-50 text-[#3d3f96] p-2.5 rounded-2xl border border-blue-100/50">
                <Users size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Expert Medical Staff</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">India's Top Tier</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-amber-50 text-amber-600 p-2.5 rounded-2xl border border-amber-100/50">
                <Clock size={18} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-800">Instant Booking</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Zero Wait Time</p>
              </div>
            </div>
          </motion.div>

        </div>

        {/* --- RIGHT SIDE: PREMIUM VISUALS (Span 5/12) --- */}
        <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center items-center">
          
          {/* Main Visual Frame */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 rounded-[3rem] lg:rounded-[4.5rem] overflow-hidden border-[10px] border-white shadow-[0_30px_70px_rgba(15,23,42,0.15)] aspect-[4/5] w-full max-w-[420px]"
          >
            {/* High-quality clinic visual */}
            <img 
              src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop" 
              alt="State of the art modern clinic interior" 
              className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[2000ms] ease-out"
            />
            {/* Decorative Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#3d3f96]/25 via-transparent to-transparent"></div>
          </motion.div>

          {/* --- FLOATING glassmorphism CARDS --- */}
          
          {/* Floating Card 1: Safety/Sanitized */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-16 -left-8 lg:-left-12 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-3xl shadow-[0_15px_35px_rgba(0,0,0,0.08)] border border-white/50 flex items-center gap-4.5 min-w-[220px] pointer-events-none hover:scale-105 transition-transform duration-300"
          >
            <div className="bg-emerald-500 text-white p-3 rounded-2xl shadow-lg shadow-emerald-500/20">
              <CheckCircle2 size={22} className="stroke-[3]" />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Care Standards</p>
              <p className="text-base font-black text-slate-800">100% Sanitized</p>
            </div>
          </motion.div>

          {/* Floating Card 2: Expansion Stats */}
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-12 -right-4 lg:-right-8 z-20 bg-white/95 backdrop-blur-xl p-5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-white/50 flex flex-col gap-3 min-w-[210px] pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Rapid Growth</span>
            </div>
            
            <div className="flex items-center gap-3.5">
              <div className="bg-indigo-50 text-[#3d3f96] p-3 rounded-2xl">
                <Building2 size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800 tracking-tight">25+</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Clinics Nationwide</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;