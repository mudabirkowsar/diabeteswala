"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Smartphone, 
  Bluetooth, 
  Activity, 
  Bell, 
  CheckCircle2, 
  Calendar, 
  Waves,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const StepsToUse = () => {
  const steps = [
    {
      id: 1,
      title: "PREPARE",
      desc: "Clean the back of your upper arm with an alcohol swab and let it dry completely.",
      icon: <Droplets className="text-blue-500" size={22} />,
    },
    {
      id: 2,
      title: "APPLY",
      desc: "Place the applicator on your arm and press firmly. The sensor will painlessly apply in one click.",
      icon: <CheckCircle2 className="text-emerald-500" size={22} />,
    },
    {
      id: 3,
      title: "START SENSOR",
      desc: "Open the Diabeteswala app and tap \"Start New Sensor\". The sensor will warm up for 60 minutes.",
      icon: <Smartphone className="text-indigo-500" size={22} />,
    },
    {
      id: 4,
      title: "PAIR WITH APP",
      desc: "Keep Bluetooth active and allow the app to securely establish connection with your CGM.",
      icon: <Bluetooth className="text-sky-500" size={22} />,
    },
    {
      id: 5,
      title: "VIEW READINGS",
      desc: "After warm-up, your live glucose readings and trend arrows will stream in real time.",
      icon: <Activity className="text-teal-500" size={22} />,
    },
    {
      id: 6,
      title: "STAY INFORMED",
      desc: "Set customizable alerts, track daily glucose trends, and export insightful reports easily.",
      icon: <Bell className="text-purple-500" size={22} />,
    }
  ];

  const features = [
    { icon: <Waves size={20} />, title: "Water Resistant", desc: "Shower or swim worry-free" },
    { icon: <Calendar size={20} />, title: "Wear Up to 14 Days", desc: "Long-lasting daily continuous wear" },
    { icon: <Activity size={20} />, title: "24/7 Live Monitoring", desc: "Real-time updates every minute" },
    { icon: <Bell size={20} />, title: "Smart Alerts", desc: "Instant notifications on high/low glucose" },
  ];

  return (
    <section className="w-full bg-slate-50/50 py-16 md:py-24 px-4 sm:px-6 lg:px-8 antialiased overflow-hidden">
      <div className="max-w-[1400px] mx-auto">
        
        {/* --- 1. HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[#3d3f96] text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Quick & Easy Guide
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              How to Use Your <br className="hidden sm:inline" />
              <span className="text-[#3d3f96]">Diabetes</span>
              <span className="text-[#68cca6]">wala</span> CGM
            </h2>
          </div>
          <p className="text-base sm:text-lg text-slate-600 font-medium max-w-md">
            Continuous glucose monitoring designed for effortless setup, absolute comfort, and reliable 24/7 clarity.
          </p>
        </div>

        {/* --- 2. LANDSCAPE IMAGE BANNER --- */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative w-full bg-gradient-to-br from-slate-900 via-[#1e204d] to-[#3d3f96] rounded-3xl p-6 md:p-10 mb-16 shadow-2xl overflow-hidden border border-slate-800"
        >
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#68cca6]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#3d3f96]/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center lg:text-left">
              <span className="text-[#68cca6] text-xs font-black tracking-widest uppercase mb-2 block">
                Visual Step-By-Step Overview
              </span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
                Simple 6-Step Continuous Health Tracking
              </h3>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Follow our straightforward guide to apply, connect, and start receiving real-time health insights straight to your phone.
              </p>
            </div>

            {/* Landscape Container */}
            <div className="w-full lg:max-w-[650px] relative rounded-2xl overflow-hidden bg-white/5 p-2 backdrop-blur-md border border-white/10 shadow-lg">
              <Image 
                src="/howtousee.png" 
                alt="Diabeteswala CGM Usage Guide" 
                width={1200} 
                height={675} 
                priority
                className="w-full h-auto object-cover rounded-xl transition-transform duration-700 hover:scale-[1.02]"
              />
            </div>
          </div>
        </motion.div>

        {/* --- 3. STEPS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              className="relative group bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Header inside Card */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  {/* Step Badge */}
                  <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-[#3d3f96] text-white text-sm font-black shadow-md shadow-[#3d3f96]/20">
                    0{step.id}
                  </span>

                  {/* Icon Wrapper */}
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 group-hover:bg-indigo-50/50 transition-all duration-300">
                    {step.icon}
                  </div>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 tracking-wider mb-2 group-hover:text-[#3d3f96] transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              {/* Bottom Subtle Bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-slate-400 group-hover:text-[#3d3f96] transition-colors text-xs font-semibold">
                <span>Step {step.id} of 6</span>
                <ArrowRight size={14} className="transform group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- 4. FEATURE HIGHLIGHTS BAR --- */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, i) => (
              <div key={i} className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/50 flex-shrink-0 flex items-center justify-center text-[#3d3f96] group-hover:bg-[#3d3f96] group-hover:text-white transition-all duration-300 shadow-xs">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#3d3f96] transition-colors mb-1">
                    {feat.title}
                  </h4>
                  <p className="text-xs text-slate-500 font-medium leading-normal">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default StepsToUse;