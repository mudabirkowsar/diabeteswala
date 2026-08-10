"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Ambulance, 
  PhoneCall, 
  Navigation, 
  ShieldCheck, 
  Clock, 
  Activity, 
  Droplets, 
  ArrowRight,
  AlertCircle,
  HeartPulse
} from 'lucide-react';

const Hero = () => {
  const [location, setLocation] = useState("");

  return (
    <section className="relative w-full min-h-[85vh] lg:min-h-screen bg-[#fcfdfe] overflow-hidden flex items-center pt-24 lg:pt-0">
      
      {/* --- 1. REFINED BACKGROUND --- */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-50/30 rounded-l-[120px] pointer-events-none hidden lg:block" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-50/50 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Professional Micro-Grid */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(#ef4444 1px, transparent 1px)`, backgroundSize: '30px 30px' }}>
      </div>

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 w-full">
        
        {/* --- 2. LEFT SIDE: CONTENT & BOOKING --- */}
        <div className="lg:col-span-7 space-y-10">
          
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Live Emergency Badge */}
            <div className="inline-flex items-center gap-2.5 bg-red-50 border border-red-100 px-4 py-2 rounded-full shadow-sm">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </div>
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-[0.15em]">
                Emergency Response: 15 Min Arrival
              </span>
            </div>

            {/* Refined Headline Scale */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Diabetes on <span className="text-red-600">Wheels.</span> <br />
              <span className="text-[#3d3f96] opacity-90">Specialized Critical Care.</span>
            </h1>
            
            <p className="text-base md:text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
              India's first specialized ambulance network equipped with <span className="text-red-600 font-bold">Advanced Glucose Management</span> and on-board clinical support for diabetic emergencies.
            </p>
          </motion.div>

          {/* --- QUICK BOOKING BAR --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-5"
          >
            <div className="relative max-w-2xl group">
              <div className="absolute inset-0 bg-red-600/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="relative flex items-center bg-white border border-slate-200 group-focus-within:border-red-600 group-focus-within:ring-4 group-focus-within:ring-red-50 rounded-2xl p-1.5 shadow-sm transition-all">
                <div className="pl-5 pr-3 text-red-500">
                  <Navigation size={22} />
                </div>
                <input 
                  type="text" 
                  placeholder="Enter Pickup Location..." 
                  className="w-full bg-transparent outline-none text-slate-700 font-semibold text-sm md:text-base py-3"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <button className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-xl font-bold text-xs transition-all hidden sm:block shadow-lg shadow-red-100">
                  BOOK AMBULANCE
                </button>
              </div>
            </div>

            {/* Emergency Call Action */}
            <div className="flex flex-wrap items-center gap-8 px-4">
              <a href="tel:1800123456" className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-widest hover:underline group">
                <PhoneCall size={18} className="group-hover:rotate-12 transition-transform" />
                Call 1800-DIABETES
              </a>
              <div className="h-4 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                <ShieldCheck size={16} className="text-emerald-500" />
                MCI Certified Paramedics
              </div>
            </div>
          </motion.div>

          {/* --- SPECIALIZED FEATURES GRID --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4"
          >
            {[
                { icon: <Droplets className="text-blue-500" />, label: "Insulin On-Board" },
                { icon: <Activity className="text-emerald-500" />, label: "CGM Tracking" },
                { icon: <HeartPulse className="text-red-500" />, label: "Cardiac Monitor" },
                { icon: <Clock className="text-orange-500" />, label: "24/7 Dispatch" }
            ].map((item, i) => (
                <div key={i} className="flex flex-col gap-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                    <div className="bg-slate-50 w-10 h-10 rounded-xl flex items-center justify-center">
                        {React.cloneElement(item.icon, { size: 18 })}
                    </div>
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-tight">{item.label}</span>
                </div>
            ))}
          </motion.div>
        </div>

        {/* --- 3. RIGHT SIDE: 3D VISUAL STACK --- */}
        <div className="lg:col-span-5 relative flex justify-center items-center min-h-[500px]">
          
          {/* Background Orbit */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
            className="absolute w-[400px] h-[400px] border border-dashed border-red-100 rounded-full opacity-40"
          />

          {/* Main Ambulance Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative z-10 w-full max-w-[420px] drop-shadow-[0_40px_60px_rgba(239,68,68,0.15)]"
          >
            <img 
              src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=1000&auto=format&fit=crop" 
              alt="Diabetes on Wheels" 
              className="w-full h-auto object-contain rounded-[2.5rem]"
            />
          </motion.div>

          {/* Floating Status Card 1 */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-12 right-0 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white flex items-center gap-3 min-w-[200px] z-20"
          >
            <div className="bg-red-50 p-2 rounded-xl text-red-600">
              <Ambulance size={24} />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Live Status</p>
              <p className="text-sm font-black text-slate-800">Arriving in 12 Mins</p>
            </div>
          </motion.div>

          {/* Floating Status Card 2 */}
          <motion.div 
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-12 left-0 bg-[#3d3f96] p-4 rounded-2xl shadow-xl flex items-center gap-3 text-white min-w-[220px] z-20"
          >
            <div className="bg-white/10 p-2 rounded-xl">
              <Activity size={24} className="text-blue-200" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest">Specialized Kit</p>
              <p className="text-sm font-black text-white">ICU + Diabetes Setup</p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;