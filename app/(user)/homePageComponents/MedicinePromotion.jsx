"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Truck,
  CheckCircle2,
  Sparkles,
  Stethoscope,
  HeartPulse,
  BadgeCheck,
  Award
} from 'lucide-react';

const MedicinePromotion = () => {
  const protocolSteps = [
    {
      step: "01",
      title: "DiabetesWala Diagnostics",
      desc: "Measure Fasting Insulin & C-Peptide",
      icon: <Activity className="w-4 h-4 text-indigo-600" />
    },
    {
      step: "02",
      title: "DiabetesWala Custom Protocol",
      desc: "Targeted hormone balance therapy",
      icon: <Stethoscope className="w-4 h-4 text-emerald-600" />
    },
    {
      step: "03",
      title: "Sustained Reversal Care",
      desc: "Continuous HbA1c drop tracking",
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />
    }
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10 antialiased">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60 rounded-[2.5rem] sm:rounded-[3rem] border border-indigo-100/80 shadow-[0_20px_50px_-15px_rgba(61,63,150,0.12)]">
        
        {/* --- High-End Ambient Background Glows --- */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        {/* Subtle Wave / Grid Accent Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: `radial-gradient(#3d3f96 1px, transparent 1px)`, 
            backgroundSize: '28px 28px' 
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-8 lg:gap-10">
          
          {/* --- LEFT SIDE: THE BRAND PITCH (7 Columns) --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badge & Brand Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                <Image 
                  src="/logo/diabeteslogo.png" 
                  alt="DiabetesWala" 
                  width={110} 
                  height={26} 
                  className="object-contain h-5.5 w-auto" 
                />
              </div>
              <span className="text-slate-300 font-bold hidden sm:inline">|</span>
              <div className="inline-flex items-center gap-1.5 bg-indigo-600/10 border border-indigo-600/20 px-3 py-1 rounded-full text-[#3d3f96] text-xs font-black tracking-wide">
                <Sparkles size={13} className="text-[#3d3f96]" />
                <span>India's #1 DiabetesWala Hormone Reversal Platform</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.12] tracking-tight">
                Diabetes is Hormonal. <br />
                <span className="bg-gradient-to-r from-[#3d3f96] via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  DiabetesWala Balances the Root.
                </span>
              </h2>
            </div>

            <p className="text-slate-600 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
              Stop temporarily masking symptoms with pill overloads. <span className="text-slate-900 font-bold">DiabetesWala™</span> scientific <span className="text-slate-900 font-bold">Hormonal Reversal Protocols</span> combine doctor-prescribed genuine medicines with biological monitoring for true metabolic freedom.
            </p>

            {/* Value Props Strip */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-700 pt-1">
              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm">
                <BadgeCheck size={16} className="text-emerald-500 shrink-0" />
                <span>DiabetesWala 100% Genuine Pharmacy</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl shadow-sm">
                <Truck size={16} className="text-indigo-600 shrink-0" />
                <span>24h Express Delivery</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl text-amber-700">
                <Zap size={15} className="fill-amber-500 text-amber-500 shrink-0" />
                <span>Flat 20% OFF Meds</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link 
                href="/pharmacy" 
                className="group bg-[#3d3f96] hover:bg-[#32347d] text-white font-black px-7 py-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 transition-all active:scale-95"
              >
                <ShoppingBag size={18} />
                <span>SHOP DIABETESWALA MEDICINES</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link 
                href="/consultation"
                className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold px-6 py-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Stethoscope size={16} className="text-[#3d3f96]" />
                <span>Talk to DiabetesWala Expert</span>
              </Link>
            </div>

          </div>

          {/* --- RIGHT SIDE: REVERSAL PROTOCOL WORKFLOW CARD (5 Columns) --- */}
          <div className="lg:col-span-5 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="bg-white/90 backdrop-blur-2xl border border-indigo-100/80 p-6 sm:p-7 rounded-[2rem] shadow-xl space-y-5"
            >
              
              {/* Card Title */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-[#3d3f96] rounded-lg">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">DiabetesWala Blueprint</h3>
                    <p className="text-[10px] text-slate-500 font-medium">Precision Hormone Balancing</p>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-extrabold px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
                  <Award size={12} />
                  <span>92% Success</span>
                </span>
              </div>

              {/* Protocol Step Workflow */}
              <div className="space-y-3">
                {protocolSteps.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-white hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center font-black text-xs text-[#3d3f96] shadow-xs">
                      {item.step}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">{item.desc}</p>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-100/80">
                      {item.icon}
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Trust Footer Inside Card */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-600">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-500" />
                  <span>50,000+ DiabetesWala Members</span>
                </div>
                <div className="flex items-center gap-1 text-[#3d3f96]">
                  <CheckCircle2 size={15} />
                  <span>MCI Certified Care</span>
                </div>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MedicinePromotion;