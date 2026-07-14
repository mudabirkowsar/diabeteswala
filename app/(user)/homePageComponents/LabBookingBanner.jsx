"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Beaker, Calendar, Clock, ArrowRight, CheckCircle, Shield } from 'lucide-react';

const LabBookingBanner = () => {
  return (
    <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8 antialiased">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#3d3f96] via-[#484aa3] to-[#5255a5] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-[0_20px_50px_-12px_rgba(61,63,150,0.25)] border border-white/10">
        
        {/* --- Micro Ambient Decorative Graphics --- */}
        <div className="absolute top-[-40%] right-[-10%] w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-60 h-60 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay" 
          style={{ 
            backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', 
            backgroundSize: '20px 20px' 
          }}
        ></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6">
          
          {/* --- Left Side: Labeled Icon & Text Cluster --- */}
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left w-full lg:w-auto">
            {/* Soft-Glass Floating Icon Container */}
            <motion.div 
              initial={{ scale: 0.92, opacity: 0.9 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] flex-shrink-0"
            >
              <Beaker size={30} className="text-blue-200" />
            </motion.div>

            <div>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 mb-2.5">
                <h3 className="text-2xl font-black text-white tracking-tight">Well Labs</h3>
                <div className="inline-flex items-center gap-1 bg-emerald-500/90 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                  <Shield size={10} className="inline" />
                  <span>NABL Accredited</span>
                </div>
              </div>
              <p className="text-blue-100/90 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
                Complete Diabetes Profile & HbA1c tests. 
                <span className="text-white font-bold ml-1.5 inline-block sm:inline">
                  Home sample collection available.
                </span>
              </p>
            </div>
          </div>

          {/* --- Middle Side: Quick Quality Guarantees (Adaptive Breakpoints) --- */}
          <div className="hidden md:flex lg:hidden xl:flex items-center gap-8 bg-black/10 backdrop-blur-sm px-6 py-3.5 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2.5 text-blue-100/80">
              <Clock size={16} className="text-blue-300" />
              <span className="text-xs font-bold tracking-wide">Reports in 24h</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <div className="flex items-center gap-2.5 text-blue-100/80">
              <CheckCircle size={16} className="text-blue-300" />
              <span className="text-xs font-bold tracking-wide">Safe & Hygienic</span>
            </div>
          </div>

          {/* --- Right Side: High Conversion Call-To-Action System --- */}
          <div className="flex-shrink-0 w-full sm:w-auto text-center sm:text-right">
            <motion.button 
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="group relative w-full sm:w-auto bg-white text-[#3d3f96] px-8 py-4 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-3 shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1)] hover:bg-blue-50 transition-colors"
            >
              <Calendar size={16} className="text-[#3d3f96]/80 group-hover:rotate-12 transition-transform duration-200" />
              <span>Book Your Slot Now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>
            
            <div className="flex items-center justify-center sm:justify-end gap-1.5 mt-3">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse"></span>
              <p className="text-[11px] text-blue-200/70 font-bold uppercase tracking-widest">
                Starting from ₹499 only
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LabBookingBanner;