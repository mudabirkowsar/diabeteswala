"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Beaker, 
  Pill, 
  Zap, 
  ArrowRight, 
  CheckCircle, 
  ShieldCheck,
  Star
} from 'lucide-react';

const EcosystemPromo = () => {
  const services = [
    { 
      title: "Expert Doctors", 
      desc: "Top endocrinologists at your fingertips.", 
      icon: <Stethoscope size={22} />, 
      color: "text-blue-600", 
      bg: "bg-blue-50/80 border-blue-100/50" 
    },
    { 
      title: "Lab Tests", 
      desc: "NABL certified tests with home collection.", 
      icon: <Beaker size={22} />, 
      color: "text-purple-600", 
      bg: "bg-purple-50/80 border-purple-100/50" 
    },
    { 
      title: "Pharmacy", 
      desc: "Genuine medicines delivered in 24 hours.", 
      icon: <Pill size={22} />, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50/80 border-emerald-100/50" 
    },
    { 
      title: "Care Programs", 
      desc: "Science-backed plans for sugar reversal.", 
      icon: <Zap size={22} />, 
      color: "text-amber-600", 
      bg: "bg-amber-50/80 border-amber-100/50" 
    },
  ];

  return (
    <section className="relative py-24 bg-gradient-to-b from-[#fdfefe] via-[#f8fafc] to-[#f1f5f9] overflow-hidden">
      
      {/* Decorative background glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-emerald-50/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-20 items-center">
          
          {/* --- LEFT SIDE: CONTENT & SERVICE GRID (Columns: 7/12) --- */}
          <div className="order-2 lg:order-1 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Trust Tagline */}
              <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 border border-[#3d3f96]/10 px-4.5 py-2 rounded-2xl mb-8 shadow-sm">
                <ShieldCheck size={16} className="text-[#3d3f96]" />
                <span className="text-[11px] font-extrabold text-[#3d3f96] uppercase tracking-widest">All-In-One Diabetes Platform</span>
              </div>

              {/* Main Heading */}
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                Everything You Need to <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3d3f96] to-[#5a5ebd]">Master Diabetes.</span>
              </h2>

              {/* Supporting Subtext */}
              <p className="text-lg text-slate-600 font-medium mb-10 leading-relaxed max-w-xl">
                Diabeteswala brings together India's top-tier endocrinologists, certified diagnostic facilities, and dedicated lifestyle care systems to help you take control and live limitless.
              </p>

              {/* High-Fidelity Service Mini-Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-10">
                {services.map((s, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-4 p-5 rounded-[1.75rem] border border-slate-100 bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:shadow-slate-100/80 transition-all duration-300 group"
                  >
                    <div className={`${s.bg} ${s.color} p-3 rounded-2xl border group-hover:scale-105 transition-transform duration-300`}>
                      {s.icon}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-800">{s.title}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-normal">{s.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Call to Action Button */}
              <button className="group bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-9 py-4.5 rounded-2xl font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-indigo-950/10 hover:shadow-indigo-950/20 transition-all duration-300 active:scale-[0.98]">
                Explore All Services 
                <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>

          {/* --- RIGHT SIDE: PREMIUM VISUAL LAYOUT (Columns: 5/12) --- */}
          <div className="order-1 lg:order-2 lg:col-span-5 relative flex items-center justify-center">
            
            {/* Dots Pattern Grid Decoration */}
            <div className="absolute -bottom-8 -left-8 w-44 h-44 opacity-20 pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#3d3f96 2px, transparent 2px)', backgroundSize: '18px 18px' }}>
            </div>

            {/* Main Visual Block */}
            <div className="relative z-10 rounded-[4.5rem] overflow-hidden border-[14px] border-white shadow-[0_32px_64px_-16px_rgba(15,23,42,0.12)] aspect-square w-full max-w-[420px] bg-slate-100">
              <img 
                src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=2070&auto=format&fit=crop" 
                alt="Personalized healthcare checking and assistance" 
                className="w-full h-full object-cover select-none hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#3d3f96]/20 to-transparent pointer-events-none" />
            </div>

            {/* Floating Card 1: Reversal Rate (Top-Left) */}
            <motion.div 
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-4 z-20 bg-white/95 backdrop-blur-md p-4.5 rounded-[2rem] shadow-[0_20px_40px_-8px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col items-center justify-center gap-1 min-w-[150px]"
            >
              <div className="bg-emerald-500 p-2.5 rounded-2xl text-white shadow-md shadow-emerald-500/20">
                <CheckCircle size={22} />
              </div>
              <p className="text-2xl font-black text-slate-800 tracking-tight">95%</p>
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest">Success Rate</p>
            </motion.div>

            {/* Floating Card 2: Interactive Reviews (Bottom-Right) */}
            <motion.div 
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-6 -right-4 z-20 bg-white/95 backdrop-blur-md p-4.5 rounded-[2.25rem] shadow-[0_24px_48px_-12px_rgba(61,63,150,0.15)] border border-slate-100 flex items-center gap-4.5"
            >
              <div className="flex -space-x-3.5">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="User review 1" />
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="User review 2" />
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="User review 3" />
              </div>
              
              <div className="flex flex-col gap-0.5">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="currentColor" stroke="none" />)}
                </div>
                <p className="text-xs font-black text-slate-800">4.9/5 Rating</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Patient Reviews</p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default EcosystemPromo;