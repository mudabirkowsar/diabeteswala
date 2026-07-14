"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Beaker, 
  Home, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  MapPin,
  CheckCircle2,
  FileText,
  UserCheck
} from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-br from-[#f8fafc] via-[#fdfeff] to-[#edf2f7] overflow-hidden flex items-center pt-24 lg:pt-12">
      
      {/* --- Advanced Decorative Background Elements --- */}
      <div className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-blue-50/50 via-indigo-50/20 to-transparent rounded-l-[160px] pointer-events-none hidden lg:block"></div>
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-200/20 to-blue-200/30 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-100/30 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center z-10 w-full">
        
        {/* --- LEFT SIDE: CONTENT & SEARCH (Columns: 7/12) --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col justify-center"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/80 backdrop-blur-md border border-emerald-500/10 px-4 py-2 rounded-2xl shadow-[0_4px_20px_-4px_rgba(16,185,129,0.1)] mb-8 w-fit">
            <div className="bg-emerald-500/10 p-1.5 rounded-xl">
              <ShieldCheck size={16} className="text-emerald-600" />
            </div>
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">NABL Accredited & ISO 9001 Certified Labs</span>
          </div>

          {/* Core Typography */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.05] mb-6">
            Accurate Lab Tests <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#3d3f96] to-[#5a5ebd]">At Your Doorstep.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-xl mb-10 leading-relaxed font-normal">
            Book HbA1c, CBC, Lipid Profiles, and over 500+ specialized tests. Get 100% verified digital reports delivered straight to your inbox within 24 hours.
          </p>

          {/* --- HIGH-FIDELITY LAB TEST SEARCH BAR --- */}
          <div className="bg-white p-2.5 rounded-[2.25rem] shadow-[0_20px_50px_-12px_rgba(61,63,150,0.12)] border border-slate-100 flex flex-col sm:flex-row items-center gap-2 mb-12 max-w-2xl group transition-all duration-300 focus-within:border-indigo-200 focus-within:shadow-[0_20px_50px_-12px_rgba(61,63,150,0.18)]">
            <div className="flex items-center gap-3.5 px-4 py-3 w-full border-b sm:border-b-0 sm:border-r border-slate-100">
              <Beaker className="text-indigo-500/70 group-focus-within:text-indigo-600 transition-colors" size={22} />
              <input 
                type="text" 
                placeholder="Search for HbA1c, Full Body Checkup, Sugar..." 
                className="bg-transparent outline-none text-base font-medium text-slate-800 w-full placeholder:text-slate-400"
              />
            </div>
            <div className="flex items-center gap-2.5 px-4 py-3 w-[220px] shrink-0 hidden md:flex">
              <MapPin className="text-slate-400" size={20} />
              <span className="text-base font-semibold text-slate-700">Delhi NCR</span>
            </div>
            <button className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-4 px-8 rounded-[1.75rem] font-bold shadow-lg shadow-indigo-900/20 hover:shadow-indigo-900/30 transition-all duration-300 w-full sm:w-auto flex items-center justify-center gap-2 hover:gap-3 shrink-0">
              Find Test <ArrowRight size={18} />
            </button>
          </div>

          {/* Quick Value Propositions */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-6 sm:gap-10 border-t border-slate-200/60 pt-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50/80 p-2.5 rounded-2xl text-[#3d3f96] border border-blue-100/50">
                <Home size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Free Collection</p>
                <p className="text-[11px] font-medium text-slate-400">At-home convenience</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="bg-emerald-50/80 p-2.5 rounded-2xl text-emerald-600 border border-emerald-100/50">
                <Clock size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Fast Turnaround</p>
                <p className="text-[11px] font-medium text-slate-400">Reports in 24 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-50/80 p-2.5 rounded-2xl text-orange-600 border border-orange-100/50">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">100% Accurate</p>
                <p className="text-[11px] font-medium text-slate-400">Certified pathologists</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- RIGHT SIDE: VISUALS WITH PERSPECTIVE FLOATING CARDS (Columns: 5/12) --- */}
        <div className="lg:col-span-5 relative flex items-center justify-center w-full min-h-[500px] lg:min-h-auto">
          
          {/* Main Visual Composition */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 w-full max-w-[420px] aspect-[4/5] rounded-[4.5rem] overflow-hidden border-[14px] border-white shadow-[0_32px_64px_-16px_rgba(15,23,42,0.12)] bg-slate-100"
          >
            <img 
              src="https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=2070&auto=format&fit=crop" 
              alt="Medical Professional performing precise lab blood analysis" 
              className="w-full h-full object-cover select-none transform hover:scale-105 transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1e204a]/30 via-transparent to-transparent pointer-events-none"></div>
          </motion.div>

          {/* --- FLOATING INTERACTIVE CARDS --- */}
          
          {/* Card 1: Live Status/Report Ready */}
          <motion.div 
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 -left-6 sm:-left-12 z-20 bg-white/90 backdrop-blur-md p-4 rounded-3xl shadow-[0_20px_40px_-8px_rgba(0,0,0,0.08)] border border-slate-100 flex items-center gap-4 min-w-[250px]"
          >
            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Smart Health Tracker</p>
              <p className="text-base font-black text-slate-800">HbA1c Report Ready</p>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">Normal Range</span>
            </div>
          </motion.div>

          {/* Card 2: Phlebotomist Tracking Details */}
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-12 -right-4 sm:-right-8 z-20 bg-white/95 backdrop-blur-md p-4.5 rounded-[2.5rem] shadow-[0_24px_48px_-10px_rgba(61,63,150,0.15)] border border-slate-50 flex flex-col gap-3 min-w-[240px]"
          >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                <div className="w-2 h-2 bg-indigo-600 rounded-full absolute"></div>
                <span className="text-xs font-bold text-slate-800">Agent Dispatched</span>
            </div>
            
            <div className="w-full bg-slate-100 h-[1px]"></div>
            
            <div className="flex items-center gap-3">
                <img 
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=120&auto=format&fit=crop" 
                  className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-50" 
                  alt="Assigned Medical Assistant portrait" 
                />
                <div>
                    <p className="text-xs font-black text-slate-900">Arriving in 14 mins</p>
                    <p className="text-[10px] font-semibold text-slate-500">Certified Phlebotomist</p>
                </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;