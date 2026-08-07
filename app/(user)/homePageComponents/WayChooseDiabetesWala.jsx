"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Award,
  Calendar,
  Activity,
  Dna
} from 'lucide-react';

function WayChooseDiabetesWala() {
  const highlights = [
    {
      title: "Root-Cause Focus",
      desc: "Maps Insulin & C-Peptide, not just sugar",
      icon: <Dna className="w-4 h-4 text-[#3d3f96]" />
    },
    {
      title: "Hormone Experts",
      desc: "MCI certified endocrinologists",
      icon: <Activity className="w-4 h-4 text-emerald-600" />
    },
    {
      title: "Proven Reversal",
      desc: "Over 50,000+ members off heavy meds",
      icon: <Award className="w-4 h-4 text-amber-500" />
    }
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8 antialiased">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/40 to-blue-50/60 rounded-[2rem] sm:rounded-[2.5rem] border border-indigo-100/80 p-6 sm:p-8 shadow-[0_20px_50px_-15px_rgba(61,63,150,0.12)]">
        
        {/* Ambient Light Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8">
          
          {/* --- LEFT SIDE: BRAND PROMOTION (7 Columns) --- */}
          <div className="lg:col-span-7 space-y-4 text-center sm:text-left">
            
            {/* Logo + Tag */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <div className="bg-white px-3 py-1.5 rounded-xl shadow-sm border border-slate-200/80">
                <Image 
                  src="/logo/diabeteslogo.png" 
                  alt="DiabetesWala" 
                  width={100} 
                  height={22} 
                  className="object-contain h-5 w-auto" 
                />
              </div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-600/10 border border-indigo-600/20 px-3 py-1 rounded-full text-[#3d3f96] text-xs font-black tracking-wide">
                <Sparkles size={13} className="text-[#3d3f96]" />
                <span>India's #1 Reversal Care</span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
              Why Choose <span className="bg-gradient-to-r from-[#3d3f96] via-indigo-600 to-blue-600 bg-clip-text text-transparent">DiabetesWala™</span>?
            </h2>

            <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
              We go beyond symptom masking. <span className="text-slate-900 font-bold">DiabetesWala</span> targets the underlying hormonal imbalance with diagnostic precision, MCI-verified doctors, and custom reversal protocols.
            </p>

            {/* Compact Trust Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {highlights.map((item, idx) => (
                <div key={idx} className="bg-white/80 border border-slate-200/80 p-3 rounded-xl flex items-start gap-2.5 text-left shadow-xs">
                  <div className="p-1.5 bg-indigo-50 rounded-lg shrink-0 mt-0.5">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900">{item.title}</p>
                    <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* --- RIGHT SIDE: STATS & QUICK CTA CARD (5 Columns) --- */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white/90 border border-indigo-100/80 p-5 sm:p-6 rounded-2xl shadow-xl space-y-4 backdrop-blur-xl">
              
              {/* Metric Row */}
              <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100 text-center">
                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-[#3d3f96] font-black text-base sm:text-lg">
                    <Users size={16} />
                    <span>50k+</span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Reversed Diabetes</p>
                </div>

                <div className="bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-center gap-1 text-amber-500 font-black text-base sm:text-lg">
                    <Award size={16} />
                    <span>4.9 / 5</span>
                  </div>
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Patient Trust Score</p>
                </div>
              </div>

              {/* Action Callout */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck size={14} />
                    MCI Certified Experts
                  </span>
                  <span className="text-[#3d3f96]">HbA1c Guarantee</span>
                </div>

                <Link 
                  href="/consultation" 
                  className="group w-full bg-[#3d3f96] hover:bg-[#32347d] text-white font-black px-5 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/15 transition-all active:scale-95"
                >
                  <Calendar size={16} />
                  <span>START DIABETESWALA CARE</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Footer Note */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-500">
                <CheckCircle2 size={12} className="text-emerald-500" />
                <span>100% Personalised Metabolic Reversal Protocol</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

export default WayChooseDiabetesWala;