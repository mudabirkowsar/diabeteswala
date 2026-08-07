"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  ArrowRight, 
  ShieldCheck, 
  Star, 
  Award, 
  Users, 
  CheckCircle2,
  Sparkles,
  TrendingUp
} from 'lucide-react';

const DoctorPromotion = () => {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 antialiased">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3d3f96] via-[#4649ad] to-[#2d2f75] rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-10 lg:p-14 shadow-[0_25px_60px_-15px_rgba(61,63,150,0.4)]">
        
        {/* --- Brand Background Ambient Lighting --- */}
        <div className="absolute top-[-20%] right-[-5%] w-[450px] h-[450px] bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[350px] h-[350px] bg-blue-400/15 rounded-full blur-3xl pointer-events-none"></div>
        
        {/* Subtle Scientific Circuit Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" 
             style={{ backgroundImage: `radial-gradient(#fff 1px, transparent 1px)`, backgroundSize: '32px 32px' }}>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-16">
          
          {/* --- LEFT SIDE: BRAND PROMOTION & METRICS --- */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            
            {/* Brand Badge */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-sm"
            >
              <Sparkles size={13} className="text-emerald-400" />
              <span className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em]">
                India's #1 Hormone & Reversal Platform
              </span>
            </motion.div>
            
            {/* Brand Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.12] tracking-tight">
              Experience the <br className="hidden sm:block" /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-indigo-100 to-white">
                DiabetesWala
              </span> Edge.
            </h2>
            
            <p className="text-sm sm:text-base text-blue-100/80 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Stop fighting symptoms on your own. Join <span className="text-white font-bold">50,000+ members</span> who have successfully reclaimed their metabolic health with our science-backed clinical protocols.
            </p>

            {/* Trust Metrics Grid */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg mx-auto lg:mx-0 border-t border-white/10">
              <div className="space-y-0.5">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-amber-300 font-black text-base sm:text-lg">
                  <Star size={16} className="fill-amber-300" />
                  <span>4.9 / 5</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Patient Rating</p>
              </div>

              <div className="space-y-0.5 border-x border-white/10 px-2">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-white font-black text-base sm:text-lg">
                  <Users size={16} className="text-blue-300" />
                  <span>50k+</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">Reversal Stories</p>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center justify-center lg:justify-start gap-1 text-emerald-400 font-black text-base sm:text-lg">
                  <TrendingUp size={16} />
                  <span>92%</span>
                </div>
                <p className="text-[10px] uppercase tracking-wider text-blue-200 font-semibold">HbA1c Reduction</p>
              </div>
            </div>

          </div>

          {/* --- RIGHT SIDE: PROMO ACTION CARD --- */}
          <div className="relative shrink-0 w-full lg:w-[380px]">
            
            {/* Floating Limited Time Tag */}
            <motion.div 
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-3 sm:-right-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-xl shadow-xl z-20 uppercase tracking-wider rotate-6 border border-white/25"
            >
              Limited Slots Left
            </motion.div>

            {/* Glassmorphic Action Card */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
              <div className="bg-white p-3.5 rounded-2xl mb-4 shadow-md text-[#3d3f96]">
                <Award size={32} />
              </div>
              
              <h4 className="text-white font-black text-center mb-1 uppercase tracking-widest text-xs">Expert Consultation</h4>
              <p className="text-blue-100 text-xs sm:text-sm mb-6 text-center font-medium leading-relaxed">
                Book with top endocrinologists today & get a <br/>
                <span className="text-amber-300 font-extrabold text-base">FREE Comprehensive Report</span>
              </p>

              <button className="group w-full bg-white text-[#3d3f96] px-6 py-4 rounded-xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                <Calendar size={16} />
                <span>BOOK CONSULT NOW</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-5 pt-4 border-t border-white/10 flex flex-col gap-2.5 w-full">
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-100 uppercase tracking-wide">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>MCI Verified Hormone Specialists</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-blue-100 uppercase tracking-wide">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>ISO 9001 Certified Clinical Care</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DoctorPromotion;