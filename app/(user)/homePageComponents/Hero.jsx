"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  ShoppingBag, 
  Calendar, 
  Droplets, 
  Zap, 
  Activity, 
  Microscope, 
  ShieldCheck,
  Info,
  Dna,
  HeartPulse
} from 'lucide-react';

const Hero = () => {
  // Animation presets for entrance
  const fadeInUp = {
    hidden: { opacity: 0, y: 25 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-slate-50/50 overflow-hidden flex items-center pt-24 lg:pt-12 pb-16 lg:pb-0">
      
      {/* --- Scientific Background Grid & Glows --- */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-25 pointer-events-none" />
      
      {/* Mesh Glow Blobs */}
      <div className="absolute top-[-10%] left-[-5%] w-[45%] h-[45%] bg-blue-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-5%] w-[40%] h-[45%] bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] left-[45%] w-[20%] h-[20%] bg-emerald-100/20 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center z-10 w-full">
        
        {/* --- LEFT COLUMN: THE SCIENCE & COPY --- */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-8 text-left"
        >
          {/* Science Badge */}
          <motion.div 
            variants={fadeInUp}
            className="inline-flex items-center gap-2.5 bg-indigo-50 border border-indigo-100/80 px-4 py-2 rounded-full shadow-sm"
          >
            <Microscope size={15} className="text-[#3d3f96]" />
            <span className="text-[10px] sm:text-[11px] font-extrabold text-[#3d3f96] uppercase tracking-[0.2em]">
              Endocrine Science First
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.div variants={fadeInUp} className="space-y-4">
            <h1 className="text-4xl sm:text-6xl xl:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Master the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] via-[#5256cc] to-indigo-600">
                Hormonal Symphony.
              </span>
            </h1>
          </motion.div>

          {/* Detailed Science Copy */}
          <motion.div variants={fadeInUp} className="space-y-5 max-w-2xl">
            <p className="text-base sm:text-lg md:text-xl text-slate-600 leading-relaxed font-normal">
              Diabetes is far more than managed sugar levels—it is a complex, continuous system interaction within the <span className="text-[#3d3f96] font-semibold">Endocrine System</span>.
            </p>
            <p className="text-sm sm:text-base text-slate-500 leading-relaxed">
              When the pancreas struggles to align <span className="text-blue-600 font-semibold bg-blue-50/80 px-1.5 py-0.5 rounded">Insulin</span> (the key that unlocks cellular energy) and <span className="text-emerald-600 font-semibold bg-emerald-50/80 px-1.5 py-0.5 rounded">Glucagon</span> (the release mechanism for stored energy), metabolic stability suffers. We leverage biological insights to restore balance to your body.
            </p>
          </motion.div>

          {/* Call To Actions */}
          <motion.div 
            variants={fadeInUp} 
            className="flex flex-col sm:flex-row gap-4 pt-2"
          >
            <button className="group bg-[#3d3f96] hover:bg-[#313380] active:scale-[0.98] text-white px-8 py-4.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/10 hover:shadow-indigo-900/20 transition-all duration-200">
              <ShoppingBag size={18} />
              <span>Shop Now</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="bg-white border-2 border-slate-200/80 text-slate-700 px-8 py-4.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:border-slate-300 hover:text-slate-950 hover:bg-slate-50/50 active:scale-[0.98] transition-all duration-200">
              <Calendar size={18} className="text-slate-500" />
              <span>Book Consult</span>
            </button>
          </motion.div>

          {/* Quick Trust Badges */}
          <motion.div 
            variants={fadeInUp}
            className="pt-8 flex flex-wrap gap-x-8 gap-y-4 border-t border-slate-200/60"
          >
            <div className="flex items-center gap-2.5 text-slate-500">
              <ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">MCI Verified Experts</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-500">
              <Dna size={18} className="text-blue-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Genomic Insights</span>
            </div>
          </motion.div>
        </motion.div>

        {/* --- RIGHT COLUMN: THE BIOLOGICAL DASHBOARD (NO PHOTOS) --- */}
        <div className="lg:col-span-5 relative flex justify-center items-center py-16 lg:py-0 min-h-[500px]">
          
          {/* Rotating Outer Science Orbits */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
            className="absolute w-80 h-80 md:w-96 md:h-96 border border-dashed border-slate-300/60 rounded-full flex items-center justify-center pointer-events-none"
          >
            <div className="w-[85%] h-[85%] border border-dashed border-indigo-200/40 rounded-full" />
          </motion.div>

          {/* Central Metabolic Hub Core */}
          <motion.div 
            animate={{ 
              scale: [1, 1.03, 1],
              boxShadow: [
                "0 0 50px rgba(61,63,150,0.05)",
                "0 0 70px rgba(61,63,150,0.12)",
                "0 0 50px rgba(61,63,150,0.05)"
              ]
            }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-56 h-56 md:w-72 md:h-72 bg-white/95 backdrop-blur-xl rounded-full border border-slate-100 flex flex-col items-center justify-center text-center p-6 z-10 shadow-2xl"
          >
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-4 rounded-2xl text-[#3d3f96] mb-3.5 shadow-sm">
              <Activity size={36} strokeWidth={2} />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Metabolic Hub</h3>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5">
              Pancreatic Feedback Loop
            </p>
            
            {/* Visual heartbeat wave line */}
            <div className="w-16 h-4 mt-3 text-[#3d3f96]/30 flex items-center justify-center">
              <HeartPulse size={16} className="animate-pulse" />
            </div>
          </motion.div>

          {/* --- HORMONAL FLOATING INSTRUMENTS --- */}

          {/* Card 1: Insulin (The Key) */}
          <motion.div 
            animate={{ y: [0, -12, 0], x: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-2 left-2 md:-left-8 bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100/80 flex flex-col gap-2 w-56 z-20"
          >
            <div className="flex items-center justify-between">
              <div className="bg-blue-500/10 p-2.5 rounded-xl text-blue-600">
                <Droplets size={20} />
              </div>
              <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Regulatory
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Insulin Signal</h4>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                Facilitates blood glucose transfer into cellular energy pathways.
              </p>
            </div>
          </motion.div>

          {/* Card 2: Glucagon (The Fuel) */}
          <motion.div 
            animate={{ y: [0, 12, 0], x: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-2 right-2 md:-right-8 bg-white/95 backdrop-blur-md p-5 rounded-[2rem] shadow-xl shadow-slate-100 border border-slate-100/80 flex flex-col gap-2 w-56 z-20"
          >
            <div className="flex items-center justify-between">
              <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-600">
                <Zap size={20} />
              </div>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                Mobilizer
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">Glucagon</h4>
              <p className="text-[11px] text-slate-500 leading-normal mt-0.5">
                Promotes glycogen mobilization to sustain normal energy baseline.
              </p>
            </div>
          </motion.div>

          {/* Card 3: Cortisol (The Stress Response Indicator) */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1], y: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
            className="absolute top-1/2 -right-8 -translate-y-1/2 bg-slate-900/95 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-3.5 text-white w-48 z-25 hidden md:flex"
          >
            <div className="bg-white/10 p-2 rounded-lg text-indigo-300">
              <Info size={16} />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                Stochastic Factor
              </p>
              <p className="text-xs font-bold text-slate-100">Cortisol Sync</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;