"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Beaker, 
  ShieldCheck, 
  Home, 
  ArrowRight, 
  Zap, 
  Activity, 
  Dna,
  Clock,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  TestTube2,
  FileSpreadsheet
} from 'lucide-react';

const LabPromotion = () => {
  const popularTests = [
    { name: "Fasting Insulin", time: "Same Day", icon: <Dna className="w-4 h-4 text-emerald-500" /> },
    { name: "HbA1c + Glucose", time: "12 Hours", icon: <Activity className="w-4 h-4 text-blue-500" /> },
    { name: "C-Peptide Level", time: "24 Hours", icon: <TestTube2 className="w-4 h-4 text-purple-500" /> },
  ];

  return (
    <section className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12 antialiased">
      <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] sm:rounded-[3rem] border border-slate-800 shadow-2xl">
        
        {/* --- Background High-Tech Accent Lighting --- */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Lab Grid Matrix Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`, 
            backgroundSize: '40px 40px' 
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 items-center p-6 sm:p-10 lg:p-12 gap-8 lg:gap-12">
          
          {/* --- LEFT SIDE: DIAGNOSTICS & VALUE PITCH (7 Columns) --- */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Brand Tag */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/95 px-3 py-1.5 rounded-xl shadow-md backdrop-blur-md">
                <Image 
                  src="/logo/diabeteslogo.png" 
                  alt="DiabetesWala Labs" 
                  width={110} 
                  height={26} 
                  className="object-contain h-5 w-auto" 
                />
              </div>
              <span className="text-slate-400 text-xs font-bold">|</span>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 text-[11px] font-bold tracking-wide">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>NABL & ISO Accredited Diagnostics</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-400 uppercase tracking-[0.25em]">
                DiabetesWala Smart Labs
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-[1.12] tracking-tight">
                Don't Guess. <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  Map Your Hormones.
                </span>
              </h2>
            </div>

            <p className="text-slate-300 text-sm sm:text-base font-medium leading-relaxed max-w-xl">
              Traditional tests only check sugar. Our specialized <span className="text-white font-bold">Reversal Diagnostic Panels</span> measure Fasting Insulin & C-Peptide to pinpoint your exact level of insulin resistance.
            </p>

            {/* Features Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                  <Home size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Free Home Visit</p>
                  <p className="text-[10px] text-slate-400">Painless sample draw</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">24h Digital Report</p>
                  <p className="text-[10px] text-slate-400">Direct to WhatsApp</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-800/60 border border-slate-700/50 p-3 rounded-2xl">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
                  <FileSpreadsheet size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Doctor Review</p>
                  <p className="text-[10px] text-slate-400">Included free</p>
                </div>
              </div>
            </div>

            {/* CTA + Offer Badge */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link 
                href="/lab-tests" 
                className="group bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black px-7 py-4 rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Beaker size={18} />
                <span>BOOK REVERSAL LAB PACKAGE</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-3 rounded-2xl text-amber-300 text-xs font-bold">
                <Zap size={16} className="fill-amber-300 text-amber-300" />
                <span>Flat 50% OFF Reversal Panel Today</span>
              </div>
            </div>

          </div>

          {/* --- RIGHT SIDE: HIGH-TECH LAB TERMINAL CARD (5 Columns) --- */}
          <div className="lg:col-span-5 relative">
            <div className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 border border-slate-700/80 p-6 rounded-[2rem] shadow-2xl backdrop-blur-xl space-y-5">
              
              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700/60">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    Full Metabolic Assessment
                  </span>
                </div>
                <span className="text-[10px] bg-slate-700 text-slate-300 font-bold px-2.5 py-1 rounded-md">
                  12 Parameters
                </span>
              </div>

              {/* Individual Tests Included List */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Included Key Hormones</p>
                {popularTests.map((test, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-800">
                        {test.icon}
                      </div>
                      <span className="text-xs font-bold text-slate-100">{test.name}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-1 rounded-md">
                      {test.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Callout Banner */}
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 p-4 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Package Special</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-white">₹1,499</span>
                    <span className="text-xs text-slate-500 line-through font-bold">₹2,999</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                  <span>50% OFF</span>
                  <CheckCircle2 size={16} />
                </div>
              </div>

              {/* Bottom Guarantee */}
              <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>100% Painless Guarantee or Free Consultation</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default LabPromotion;