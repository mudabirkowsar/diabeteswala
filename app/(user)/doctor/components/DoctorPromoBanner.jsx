"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Stethoscope, ShieldCheck, ArrowRight, Star } from 'lucide-react';

const DoctorPromoBanner = () => {
  const router = useRouter();

  const handleConsultClick = () => {
    router.push('/doctor/seealldoctors');
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 md:py-10 antialiased select-none">
      <div className="relative overflow-hidden bg-gradient-to-r from-[#3d3f96] via-[#484ba3] to-[#5255a5] rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 md:p-10 shadow-2xl shadow-indigo-100">
        
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/5 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20 blur-2xl sm:blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-32 sm:w-40 h-32 sm:h-40 bg-blue-400/10 rounded-full -ml-8 -mb-8 sm:-ml-10 sm:-mb-10 blur-xl sm:blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 sm:gap-8 lg:gap-10">
          
          {/* --- LEFT: DOCTOR AVATARS & STATS --- */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 md:gap-8 text-center sm:text-left w-full lg:w-auto">
            {/* Stacked Avatars */}
            <div className="relative flex -space-x-3 sm:-space-x-4 shrink-0">
              {[1, 2, 3, 4].map((i) => (
                <motion.img
                  key={i}
                  whileHover={{ y: -5, zIndex: 50 }}
                  src={`https://i.pravatar.cc/150?img=${i + 10}`}
                  alt="Doctor avatar"
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-[#3d3f96] object-cover shadow-lg"
                />
              ))}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-[#3d3f96] bg-white flex items-center justify-center shadow-lg">
                <PlusIcon size={18} className="text-[#3d3f96] sm:w-5 sm:h-5" />
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="sm:w-3.5 sm:h-3.5" fill="currentColor" />
                  ))}
                </div>
                <span className="text-blue-100 text-[10px] sm:text-xs font-bold uppercase tracking-widest">
                  Top Rated Platform
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
                India's Most Trusted <br className="hidden sm:block" /> 
                <span className="text-blue-200">Diabetes Experts.</span>
              </h3>
            </div>
          </div>

          {/* --- MIDDLE: KEY HIGHLIGHTS --- */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 border-y sm:border-y-0 sm:border-x border-white/10 py-4 sm:py-0 px-2 sm:px-8 lg:px-10 w-full lg:w-auto my-2 lg:my-0">
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-black text-white">10k+</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-widest whitespace-nowrap">
                Happy Patients
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-black text-white">50+</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-widest whitespace-nowrap">
                Specialists
              </p>
            </div>
            <div className="text-center">
              <p className="text-lg sm:text-2xl font-black text-white">15+</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-blue-200 uppercase tracking-widest whitespace-nowrap">
                Years Exp.
              </p>
            </div>
          </div>

          {/* --- RIGHT: CTA BUTTON --- */}
          <div className="flex-shrink-0 w-full lg:w-auto">
            <motion.button
              onClick={handleConsultClick}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="w-full lg:w-auto bg-white hover:bg-blue-50 text-[#3d3f96] px-8 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 sm:gap-3 shadow-xl transition-all cursor-pointer active:scale-95"
            >
              <Stethoscope size={18} className="sm:w-5 sm:h-5" />
              Consult a Doctor
              <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px]" />
            </motion.button>
            <div className="flex items-center justify-center gap-1.5 mt-2.5 sm:mt-3 text-blue-200/70">
              <ShieldCheck size={13} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                MCI Verified Specialists
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// Small Helper Icon
const PlusIcon = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="3" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export default DoctorPromoBanner;