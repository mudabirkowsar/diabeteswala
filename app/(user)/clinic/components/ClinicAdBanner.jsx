"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  ArrowRight, 
  Star, 
  MapPin, 
  CheckCircle,
  Sparkles 
} from 'lucide-react';

// Parent container motion variants to orchestrate child staggered entries
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const ClinicAdBanner = () => {
  const benefits = [
    "State-of-the-art Diabetes Diagnostics",
    "Consultations with Top 1% Endocrinologists",
    "100% Paperless & Digital Health Records",
    "Personalized Reversal & Management Plans"
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full overflow-hidden">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1e2056] via-[#3d3f96] to-[#252763] rounded-[3rem] shadow-[0_30px_80px_rgba(61,63,150,0.25)] border border-white/5">
        
        {/* --- PREMIUM DECORATIVE BACKGROUND ELEMENTS --- */}
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-5 pointer-events-none z-0"></div>
        
        {/* Colorful Glow Blobs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-sky-400/20 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/20 rounded-full -ml-20 -mb-20 blur-[80px] pointer-events-none z-0"></div>
        <div className="absolute top-1/2 left-1/3 w-[200px] h-[200px] bg-purple-500/10 rounded-full blur-[60px] pointer-events-none z-0"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-0">
          
          {/* --- LEFT SIDE: THE PITCH (Span 7/12) --- */}
          <div className="lg:col-span-7 p-6 sm:p-10 md:p-16 xl:p-20 flex flex-col justify-center">
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="space-y-8"
            >
              {/* Trust Badge */}
              <motion.div 
                variants={itemVariants}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl shadow-inner w-fit"
              >
                <ShieldCheck size={14} className="text-sky-300" />
                <span className="text-[10px] font-black text-white/95 uppercase tracking-[0.18em] flex items-center gap-1.5">
                  India's #1 Diabetes Care Network <Sparkles size={11} className="text-amber-300 fill-amber-300" />
                </span>
              </motion.div>
              
              {/* Main Headline */}
              <motion.h2 
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-black text-white leading-[1.1] tracking-tight"
              >
                Advanced Care, <br /> 
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-blue-200 to-sky-300 bg-[length:200%_auto] animate-pulse-slow">
                  Closer to You.
                </span>
              </motion.h2>
              
              {/* Supporting Text */}
              <motion.p 
                variants={itemVariants}
                className="text-sm sm:text-base md:text-lg text-indigo-100/80 font-normal leading-relaxed max-w-xl"
              >
                Experience the future of diabetes management. Our clinics combine world-class medical expertise with cutting-edge technology to help you live a healthier, limitless life.
              </motion.p>

              {/* Benefits List */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3 text-white/90 group">
                    <div className="bg-emerald-500/20 text-emerald-400 p-1 rounded-lg border border-emerald-500/10 shrink-0 mt-0.5">
                      <CheckCircle size={15} className="stroke-[2.5]" />
                    </div>
                    <span className="text-sm font-semibold text-indigo-50/95 tracking-wide leading-tight">
                      {benefit}
                    </span>
                  </div>
                ))}
              </motion.div>

              {/* Action Buttons */}
              <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-5 pt-4">
                <button className="group bg-white hover:bg-slate-50 text-[#3d3f96] px-8 py-4.5 rounded-2xl font-black text-base flex items-center gap-2.5 shadow-[0_15px_35px_rgba(0,0,0,0.15)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300">
                  <MapPin size={20} className="stroke-[2.5] text-[#3d3f96]" />
                  Find a Clinic
                  <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
                <button className="text-white font-bold text-sm border-b-2 border-white/20 hover:border-white hover:text-sky-200 transition-all duration-300 pb-1.5">
                  Learn More About Us
                </button>
              </motion.div>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: VISUAL ADVERTISEMENT (Span 5/12) --- */}
          <div className="lg:col-span-5 relative w-full h-full min-h-[400px] sm:min-h-[480px] lg:min-h-[580px] flex items-center justify-center p-6 sm:p-12 lg:pr-16 lg:py-0">
            
            {/* Main Clinic Image Frame */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative z-10 w-full max-w-[380px] aspect-[4/5] lg:aspect-square rounded-[3rem] overflow-hidden border-[10px] border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.3)]"
            >
              <img 
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=1000&auto=format&fit=crop" 
                alt="Modern Diabetes Clinic" 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1e2056]/50 via-transparent to-transparent"></div>
            </motion.div>

            {/* Floating Trust Card 1: Network */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-2 sm:left-10 lg:-left-6 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-2xl sm:rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-3.5"
            >
              <div className="bg-indigo-50 text-[#3d3f96] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                <Building2 size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Network</p>
                <p className="text-sm sm:text-base font-black text-slate-800">25+ Clinics</p>
              </div>
            </motion.div>

            {/* Floating Trust Card 2: Patients */}
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.7 }}
              className="absolute bottom-12 right-2 sm:right-10 lg:right-6 z-20 bg-white/95 backdrop-blur-xl p-4 rounded-2xl sm:rounded-3xl shadow-[0_15px_30px_rgba(0,0,0,0.15)] border border-white/50 flex items-center gap-3.5"
            >
              <div className="bg-emerald-50 text-emerald-600 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl">
                <Users size={24} className="stroke-[2.5]" />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Patients</p>
                <div className="flex items-center gap-1">
                  <p className="text-sm sm:text-base font-black text-slate-800">10,000+</p>
                  <Star size={13} fill="currentColor" className="text-amber-400 stroke-amber-400" />
                </div>
              </div>
            </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default ClinicAdBanner;