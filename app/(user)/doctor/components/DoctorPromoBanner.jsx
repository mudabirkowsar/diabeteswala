"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, ShieldCheck, Users, ArrowRight, Star } from 'lucide-react';

const DoctorPromoBanner = () => {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-10">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#3d3f96] to-[#5255a5] rounded-[2.5rem] p-8 md:p-10 shadow-2xl shadow-indigo-100">
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          
          {/* --- LEFT: DOCTOR AVATARS & STATS --- */}
          <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
            {/* Stacked Avatars */}
            <div className="relative flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <motion.img
                  key={i}
                  whileHover={{ y: -5, zIndex: 50 }}
                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                  alt="Doctor"
                  className="w-16 h-16 rounded-2xl border-4 border-[#3d3f96] object-cover shadow-lg"
                />
              ))}
              <div className="w-16 h-16 rounded-2xl border-4 border-[#3d3f96] bg-white flex items-center justify-center shadow-lg">
                <PlusIcon size={20} className="text-[#3d3f96]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <span className="text-blue-100 text-xs font-bold uppercase tracking-widest">Top Rated Platform</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                India's Most Trusted <br className="hidden md:block" /> 
                <span className="text-blue-300">Diabetes Experts.</span>
              </h3>
            </div>
          </div>

          {/* --- MIDDLE: KEY HIGHLIGHTS --- */}
          <div className="hidden xl:flex items-center gap-10 border-x border-white/10 px-10">
            <div className="text-center">
              <p className="text-2xl font-black text-white">10k+</p>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Happy Patients</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">50+</p>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Specialists</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-black text-white">15+</p>
              <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest">Years Exp.</p>
            </div>
          </div>

          {/* --- RIGHT: CTA BUTTON --- */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full lg:w-auto bg-white text-[#3d3f96] px-10 py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl hover:bg-blue-50 transition-all"
            >
              <Stethoscope size={20} />
              Consult a Doctor
              <ArrowRight size={18} />
            </motion.button>
            <div className="flex items-center justify-center gap-2 mt-3 text-blue-200/60">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">MCI Verified Specialists</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Small Helper Icon
const PlusIcon = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default DoctorPromoBanner;