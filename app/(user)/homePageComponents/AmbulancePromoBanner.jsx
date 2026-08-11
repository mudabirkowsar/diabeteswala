"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Ambulance, 
  PhoneCall, 
  ShieldCheck, 
  Clock, 
  ArrowRight,
  AlertCircle,
  Activity
} from 'lucide-react';

const AbulancePromoBanner = () => {
  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8 antialiased">
      {/* Container height is restricted to lg:h-[300px] for a slim profile */}
      <div className="relative min-h-[280px] lg:h-[300px] overflow-hidden bg-gradient-to-r from-[#ef4444] via-[#3d3f96] to-[#1e1b4b] rounded-[2rem] md:rounded-[3rem] shadow-[0_20px_50px_rgba(239,68,68,0.25)] flex items-center">
        
        {/* --- Background Ambient Elements --- */}
        <div className="absolute top-0 right-0 w-64 h-full bg-white/5 -skew-x-12 transform translate-x-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-red-400/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 items-center px-8 md:px-16 gap-6">
          
          {/* --- LEFT SIDE: CONTENT (8 Columns) --- */}
          <div className="lg:col-span-8 py-6 lg:py-0">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Emergency Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full mb-4">
                <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </div>
                <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
                  15 Min Response Time
                </span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-3 tracking-tight">
                Diabetes <span className="text-red-400">on Wheels.</span>
              </h2>
              
              <p className="text-sm md:text-base text-blue-100/80 font-medium mb-6 max-w-xl">
                India's first specialized emergency fleet with <span className="text-white font-bold">on-board insulin & clinical support</span> for diabetic crises.
              </p>

              {/* Compact Action Row */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-8">
                <Link href="/ambulance" className="group bg-white text-[#3d3f96] px-8 py-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-blue-50 transition-all active:scale-95">
                  <Ambulance size={18} className="text-red-600" />
                  BOOK NOW
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                
                <a href="tel:+911234567890" className="flex items-center gap-3 text-white group">
                    <div className="bg-red-600 p-2.5 rounded-lg group-hover:scale-110 transition-transform shadow-lg">
                        <PhoneCall size={18} />
                    </div>
                    <div className="text-left">
                        <p className="text-[9px] uppercase tracking-widest text-blue-300 font-bold">Helpline</p>
                        <p className="text-base font-black">+91 12345 67890</p>
                    </div>
                </a>
              </div>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: COMPACT VISUAL (4 Columns) --- */}
          <div className="hidden lg:flex lg:col-span-4 relative h-full items-center justify-end">
            
            {/* Floating Status Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-0 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white flex items-center gap-3 min-w-[190px] z-20"
            >
              <div className="bg-blue-100 p-2 rounded-xl text-[#3d3f96]">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Equipped</p>
                <p className="text-sm font-black text-slate-800">ICU on Board</p>
              </div>
            </motion.div>

            {/* Main Visual Icon */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              className="relative z-10 bg-white/10 backdrop-blur-xl p-8 rounded-[3rem] border border-white/20 shadow-2xl mr-12"
            >
                <AlertCircle size={60} className="text-red-400 drop-shadow-2xl animate-pulse" strokeWidth={1.5} />
            </motion.div>

            {/* Trust Badge */}
            <div className="absolute bottom-10 right-4 flex items-center gap-2 text-white/60">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[10px] font-bold uppercase tracking-tighter text-blue-200">MCI Certified Staff</span>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AbulancePromoBanner;