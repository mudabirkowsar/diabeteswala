"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Apple, 
  Eye, 
  Footprints, 
  Star, 
  ArrowRight,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';

const Hero = () => {
  const router = useRouter();

  const categories = [
    { name: "Endocrinologist", icon: <Stethoscope size={18} />, color: "bg-blue-50 text-blue-600" },
    { name: "Nutritionist", icon: <Apple size={18} />, color: "bg-emerald-50 text-emerald-600" },
    { name: "Ophthalmologist", icon: <Eye size={18} />, color: "bg-purple-50 text-purple-600" },
    { name: "Podiatrist", icon: <Footprints size={18} />, color: "bg-orange-50 text-orange-600" },
  ];

  const handleFindDoctor = () => {
    router.push('/doctor/seealldoctors');
  };

  return (
    <section className="relative w-full min-h-screen bg-white overflow-hidden flex items-center pt-8 pb-12 lg:py-0 select-none antialiased">
      
      {/* --- Background Mesh Gradients --- */}
      <div className="absolute top-0 right-0 w-[60%] sm:w-[50%] h-[50%] bg-blue-50 rounded-full blur-[90px] sm:blur-[120px] opacity-60 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[40%] sm:w-[30%] h-[40%] bg-indigo-50 rounded-full blur-[80px] sm:blur-[100px] opacity-60 pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center z-10 w-full">
        
        {/* --- LEFT SIDE: CONTENT --- */}
        <div className="space-y-6 sm:space-y-8 lg:space-y-10 text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 border border-[#3d3f96]/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <CalendarCheck size={14} className="text-[#3d3f96] shrink-0 sm:w-4 sm:h-4" />
              <span className="text-[10px] sm:text-[11px] font-bold text-[#3d3f96] uppercase tracking-widest">
                Instant Booking Available
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.12] tracking-tight">
              Expert Care for Your <br className="hidden sm:inline" />
              <span className="text-[#3d3f96]">Diabetes Journey.</span>
            </h1>

            <p className="mt-3 sm:mt-6 text-sm sm:text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed font-medium">
              Access India's most experienced diabetes specialists. From reversal protocols to daily management, find the right expert today.
            </p>
          </motion.div>

          {/* --- CATEGORY SELECTOR --- */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 max-w-md">
            {categories.map((cat, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02, backgroundColor: "#f8fafc" }}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 border border-slate-100 rounded-xl sm:rounded-2xl cursor-pointer transition-all shadow-sm bg-white"
              >
                <div className={`${cat.color} p-2 sm:p-2.5 rounded-lg sm:rounded-xl shrink-0`}>
                  {cat.icon}
                </div>
                <span className="text-xs sm:text-xs font-bold text-slate-700 truncate">{cat.name}</span>
              </motion.div>
            ))}
          </div>

          {/* --- ACTION BUTTONS --- */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button 
              onClick={handleFindDoctor}
              className="w-full sm:w-auto justify-center bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 sm:px-10 py-3.5 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 sm:gap-3 shadow-xl shadow-indigo-100/60 transition-all active:scale-95 cursor-pointer"
            >
              Find My Doctor <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* --- RIGHT SIDE: INTERACTIVE DOCTOR CARD --- */}
        <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0">
          
          {/* Main Doctor Image with Frame */}
          <div className="relative w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[450px] aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden border-[6px] sm:border-[10px] border-white shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" 
              alt="Specialist" 
              className="w-full h-full object-cover"
            />
            
            {/* Glassmorphic Doctor Info Overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 backdrop-blur-xl bg-white/85 p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-white/50 shadow-xl">
                <div className="flex justify-between items-start mb-1 sm:mb-2">
                    <div>
                        <h3 className="text-base sm:text-lg font-black text-slate-800">Dr. Ananya Sharma</h3>
                        <p className="text-[10px] sm:text-xs font-bold text-[#3d3f96] uppercase tracking-wider">Senior Endocrinologist</p>
                    </div>
                    <div className="bg-emerald-500 text-white px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg text-[9px] sm:text-[10px] font-black shrink-0">
                        AVAILABLE
                    </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-200/50">
                    <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400 sm:w-3.5 sm:h-3.5" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700">4.9 (2k+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-blue-500 sm:w-3.5 sm:h-3.5" />
                        <span className="text-[11px] sm:text-xs font-bold text-slate-700">MCI Verified</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Floating "Next Slot" Card */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-3 left-2 sm:-top-6 sm:left-4 lg:-left-8 bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-50 min-w-[170px] sm:min-w-[200px] z-20"
          >
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2">
              Next Available Slot
            </p>
            <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="bg-blue-50 p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-[#3d3f96] shrink-0">
                    <CalendarCheck size={16} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                    <p className="text-xs sm:text-sm font-black text-slate-800">Today, 04:30 PM</p>
                    <p className="text-[9px] sm:text-[10px] font-bold text-emerald-500">Instant Confirmation</p>
                </div>
            </div>
          </motion.div>

          {/* Decorative Dot Pattern */}
          <div 
            className="absolute -bottom-8 -right-8 w-28 h-28 opacity-20 pointer-events-none hidden lg:block" 
            style={{ backgroundImage: 'radial-gradient(#3d3f96 2px, transparent 2px)', backgroundSize: '15px 15px' }}
          />

        </div>
      </div>
    </section>
  );
};

export default Hero;