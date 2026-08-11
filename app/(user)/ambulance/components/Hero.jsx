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
  ArrowRight,
  AlertCircle,
  User,
  MapPin,
  Building2,
  ChevronDown,
  LocateFixed,
  HeartPulse,
  Wind
} from 'lucide-react';

const Hero = () => {
  const [formData, setFormData] = useState({
    name: "",
    currentLocation: "",
    pickup: "",
    destination: "",
    type: "ALS"
  });

  const ambulanceTypes = [
    { id: 'BLS', label: 'Basic Ambulance', desc: 'Non-critical transport', icon: <Ambulance size={16} /> },
    { id: 'ALS', label: 'Advanced Life Support', desc: 'Critical care + Med support', icon: <HeartPulse size={16} /> },
    { id: 'ICU', label: 'ICU Ambulance', desc: 'Advanced ventilator transport', icon: <Wind size={16} /> },
  ];

  return (
    <section className="relative w-full min-h-screen flex items-center overflow-hidden bg-white pt-14 lg:pt-0">

      {/* --- 1. LIGHT CINEMATIC BACKGROUND --- */}
      <div className="absolute inset-0 z-0">
        <motion.img
          initial={{ scale: 1.05, x: 20 }}
          animate={{ scale: 1, x: 0 }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
          src="https://images.unsplash.com/photo-1587745416684-47953f16f02f?q=80&w=1920&auto=format&fit=crop"
          className="w-full h-full object-cover opacity-20 lg:opacity-30"
          alt="Ambulance"
        />
        {/* Light Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent hidden lg:block" />
        <div className="absolute inset-0 bg-white/80 lg:hidden block" />
      </div>

      <div className="max-w-[1536px] mx-auto px-6 lg:px-12 w-full z-10 relative py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">

          {/* --- 2. LEFT SIDE: BRANDING & EMERGENCY CALL --- */}
          <div className="lg:col-span-6 xl:col-span-7 space-y-10">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              {/* Emergency Badge */}
              <div className="inline-flex items-center gap-2.5 bg-red-50 border border-red-100 px-4 py-2 rounded-full shadow-sm">
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                </div>
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-[0.15em]">
                  Emergency Response: 15 Min Arrival
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                Diabetes Wala <br />
                <span className="text-red-600">On Wheels.</span>
              </h1>

              <p className="text-lg md:text-xl text-slate-600 font-medium max-w-xl leading-relaxed">
                India's first specialized emergency network for diabetic crises. <span className="text-[#3d3f96] font-bold">Fast response, expert clinical care, always there.</span>
              </p>

              {/* Trust Badges Strip */}
              <div className="flex flex-wrap gap-8 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Clock size={16} className="text-red-500" /> 24x7 Service
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <Activity size={16} className="text-blue-500" /> Live Tracking
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <ShieldCheck size={16} className="text-emerald-500" /> Safe & Reliable
                </div>
              </div>
            </motion.div>

            {/* Emergency Call Button */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
              <a href="tel:+911234567890" className="inline-flex items-center gap-5 bg-white border border-slate-200 p-2 pr-10 rounded-full hover:shadow-xl hover:border-red-200 transition-all group shadow-lg">
                <div className="bg-red-600 p-4 rounded-full text-white shadow-lg group-hover:scale-110 transition-transform">
                  <PhoneCall size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Helpline</p>
                  <p className="text-xl font-black text-slate-800">+91 12345 67890</p>
                </div>
              </a>
            </motion.div>
          </div>

          {/* --- 3. RIGHT SIDE: PREMIUM LIGHT BOOKING FORM --- */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-6 xl:col-span-5"
          >
            <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(61,63,150,0.15)] border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="bg-red-50 p-2.5 rounded-xl text-red-600">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Book an Ambulance</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quick. Simple. Life-Saving.</p>
                </div>
              </div>

              <form className="space-y-4">
                {/* Name */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input type="text" placeholder="Your Name" className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all" />
                </div>

                {/* Current Location (GPS) */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input type="text" placeholder="Your Current Location" className="w-full pl-12 pr-12 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all" />
                  <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors">
                    <LocateFixed size={18} />
                  </button>
                </div>

                {/* Pickup Location */}
                <div className="relative group">
                  <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input type="text" placeholder="Pickup Point" className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all" />
                </div>

                {/* Destination */}
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={18} />
                  <input type="text" placeholder="Destination Hospital" className="w-full pl-12 pr-4 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-50 transition-all" />
                </div>

                {/* Ambulance Type Dropdown */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Ambulance Type</label>
                  <div className="relative">
                    <select
                      className="w-full pl-4 pr-10 py-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none appearance-none cursor-pointer focus:bg-white focus:border-red-500 transition-all"
                      defaultValue="ALS"
                    >
                      {ambulanceTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.label} — {type.desc}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                {/* Submit Button */}
                <button className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-red-100 transition-all active:scale-95 mt-6">
                  BOOK AMBULANCE NOW
                  <ArrowRight size={20} />
                </button>
              </form>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;