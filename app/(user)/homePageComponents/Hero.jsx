"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  UploadCloud, 
  Truck, 
  ShieldCheck, 
  ArrowRight, 
  Pill, 
  Activity, 
  Stethoscope,
  Percent,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Clock,
  ChevronRight
} from 'lucide-react';

const Hero = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { 
      name: "Medicines", 
      count: "2,000+ items",
      href: "/pharmacy",
      icon: <Pill className="w-5 h-5 text-blue-600" />, 
      color: "bg-blue-50/80 hover:bg-blue-100 text-blue-900 border-blue-100 hover:border-blue-300" 
    },
    { 
      name: "CGM & Devices", 
      count: "Top brands",
      href: "/category/devices",
      icon: <Activity className="w-5 h-5 text-amber-600" />, 
      color: "bg-amber-50/80 hover:bg-amber-100 text-amber-900 border-amber-100 hover:border-amber-300" 
    },
    { 
      name: "Consult Doctor", 
      count: "Online 24/7",
      href: "/doctor",
      icon: <Stethoscope className="w-5 h-5 text-indigo-600" />, 
      color: "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border-indigo-100 hover:border-indigo-300" 
    },
    { 
      name: "Lab Tests", 
      count: "Home pickup",
      href: "/labs",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />, 
      color: "bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border-emerald-100 hover:border-emerald-300" 
    },
  ];

  return (
    <section className="relative w-full min-h-[90vh] bg-gradient-to-b from-slate-50/80 via-white to-white overflow-hidden flex items-center pt-24 pb-16 lg:py-0">
      
      {/* Background Lighting & Meshes */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/60 via-indigo-50/20 to-transparent pointer-events-none hidden lg:block" />
      <div className="absolute -top-32 left-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center z-10 w-full">
        
        {/* --- LEFT COLUMN: CONTENT & SEARCH --- */}
        <div className="lg:col-span-7 space-y-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-5"
          >
            {/* Promo Pill */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 border border-amber-200/60 px-3.5 py-1.5 rounded-full shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              <Percent size={14} className="text-amber-600" />
              <span className="text-xs font-bold text-amber-900 tracking-wide">
                Flat 20% OFF + Free Express Delivery on First Order
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 leading-[1.08] tracking-tight">
              Your Complete <br />
              <span className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Diabetes Store.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 font-medium max-w-xl leading-relaxed">
              Genuine insulin, CGMs, test strips, and specialized nutrition. Verified by licensed pharmacists and delivered cold-chain to your door.
            </p>
          </motion.div>

          {/* --- SEARCH BAR SECTION --- */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="relative max-w-2xl group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-[2rem] blur opacity-20 group-hover:opacity-40 group-focus-within:opacity-100 transition duration-300" />
              
              <div className="relative flex items-center bg-white rounded-[1.8rem] p-2 shadow-xl shadow-indigo-950/5 border border-slate-200/80">
                <div className="pl-4 pr-2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                  <Search size={22} />
                </div>
                <input 
                  type="text" 
                  placeholder="Search Metformin, Freestyle Libre, Accu-Chek..." 
                  className="w-full bg-transparent outline-none text-slate-800 placeholder:text-slate-400 font-medium text-sm sm:text-base py-3 px-2"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white px-7 py-3.5 rounded-[1.3rem] font-bold text-sm transition-all shadow-md shadow-indigo-600/20 hidden sm:flex items-center gap-2 whitespace-nowrap">
                  <span>Search</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-2 text-xs sm:text-sm font-semibold">
              <a 
                href="/upload-prescription" 
                className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50/60 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100"
              >
                <UploadCloud size={16} />
                <span>Upload Rx Prescription</span>
              </a>
              <div className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
              <a 
                href="/chat-pharmacist" 
                className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors"
              >
                <MessageSquare size={16} className="text-slate-400" />
                <span>Consult Pharmacist</span>
              </a>
            </div>
          </motion.div>

          {/* --- CATEGORY CARDS (LINK ENABLED) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl pt-2"
          >
            {categories.map((cat, i) => (
              <motion.a
                key={i}
                href={cat.href}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className={`group relative p-3.5 rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col justify-between h-24 ${cat.color}`}
              >
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white/90 rounded-xl shadow-sm backdrop-blur-sm group-hover:bg-white transition-colors">
                    {cat.icon}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-current" />
                </div>
                <div>
                  <h3 className="text-xs font-bold leading-none">{cat.name}</h3>
                  <p className="text-[10px] opacity-75 font-medium mt-1">{cat.count}</p>
                </div>
              </motion.a>
            ))}
          </motion.div>

          {/* Trust Guarantees */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-6 pt-4 border-t border-slate-100 text-slate-500 text-xs font-medium"
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>Cold-Chain Maintained</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <span>100% Genuine Guarantee</span>
            </div>
          </motion.div>

        </div>

        {/* --- RIGHT COLUMN: VISUAL STACK --- */}
        <div className="lg:col-span-5 relative flex justify-center items-center mt-8 lg:mt-0">
          
          <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] bg-gradient-to-tr from-indigo-100/80 to-blue-50 rounded-full border border-indigo-100/50 -z-0 shadow-inner" />

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="relative z-10 w-full aspect-square max-w-[440px] flex items-center justify-center"
          >
            <img 
              src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=1000&auto=format&fit=crop" 
              alt="Diabetes Care Essentials" 
              className="w-4/5 h-4/5 object-contain drop-shadow-[0_25px_30px_rgba(30,27,75,0.18)] hover:scale-105 transition-transform duration-500"
            />
          </motion.div>

          {/* --- FLOATING OVERLAY CARDS --- */}
          
          <motion.div 
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-4 left-0 sm:-left-4 z-20 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl shadow-slate-900/5 border border-white/80 flex items-center gap-3.5"
          >
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl text-white shadow-md shadow-blue-500/20">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <Clock size={12} className="text-emerald-600" />
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Fast Shipping</span>
              </div>
              <p className="text-xs font-bold text-slate-800">Express Delivery in 24h</p>
            </div>
          </motion.div>

          <motion.a 
            href="/subscription"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-6 right-0 sm:-right-2 z-20 bg-gradient-to-br from-slate-900 to-indigo-950 p-4 rounded-2xl shadow-2xl shadow-indigo-950/20 border border-slate-800 text-white min-w-[170px] group cursor-pointer"
          >
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block mb-0.5">Subscription Plan</span>
            <h4 className="text-xl font-extrabold text-amber-400 group-hover:translate-x-0.5 transition-transform">Save up to 25%</h4>
            <p className="text-[11px] text-slate-300 mt-1 font-medium flex items-center gap-1">
              Auto-refill monthly <ChevronRight size={12} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
            </p>
          </motion.a>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute -bottom-2 left-10 z-20 bg-emerald-500 text-white px-3.5 py-1.5 rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-2 border border-emerald-400"
          >
            <ShieldCheck size={16} />
            <span className="text-xs font-bold">100% Certified Pharmacy</span>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;