"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  Droplet,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Stethoscope,
  Flame,
  Zap,
  BellRing,
  HelpCircle
} from 'lucide-react';

export default function DiabetesHeroBanner() {
  const [selectedRisk, setSelectedRisk] = useState("fatigue");

  const symptoms = [
    { id: "fatigue", label: "Chronic Fatigue", risk: "Moderate" },
    { id: "thirst", label: "Excessive Thirst", risk: "High" },
    { id: "urination", label: "Frequent Urination", risk: "High" },
    { id: "weight", label: "Sudden Weight Loss", risk: "Critical" },
    { id: "family", label: "Family History", risk: "Genetic" },
  ];

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-10">
      <div className="relative rounded-[36px] sm:rounded-[44px] overflow-hidden bg-gradient-to-br from-indigo-900 via-[#272974] to-[#161743] text-white border border-indigo-400/20 shadow-[0_30px_70px_-15px_rgba(39,41,116,0.45)]">
        
        {/* --- Background Ambient Mesh Lighting & Glows --- */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-gradient-to-b from-cyan-400/20 to-teal-400/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-[450px] h-[400px] bg-gradient-to-tl from-purple-500/25 to-pink-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute -top-12 -left-12 w-80 h-80 bg-blue-500/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Decorative Grid Texture */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(white 1px, transparent 1px)`,
            backgroundSize: '22px 22px'
          }}
        />

        {/* --- MAIN BANNER GRID --- */}
        <div className="relative z-10 p-7 sm:p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* =========================================
              LEFT COLUMN: High-Impact Typography & CTA
             ========================================= */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Pill / Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-xs">
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              <Droplet size={13} className="text-cyan-300 fill-cyan-300" />
              <span className="text-[11px] font-black uppercase tracking-widest text-cyan-200">
                Preventive Diabetes Screening 2026
              </span>
            </div>

            {/* Headline with High-Contrast Gradient Typography */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-black tracking-tight leading-[1.12]">
              Detect Blood Sugar Spikes{" "}
              <span className="bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-200 bg-clip-text text-transparent">
                Before They Damage
              </span>{" "}
              Your Vital Organs.
            </h1>

            {/* Subtitle */}
            <p className="text-indigo-100/80 text-sm sm:text-base font-normal max-w-xl leading-relaxed">
              Prediabetes has zero warning symptoms. Check your 90-day HbA1c & Fasting Glucose from home with painless phlebotomy and NABL-certified accuracy.
            </p>

            {/* Interactive Symptom Risk Indicator */}
            <div className="pt-1">
              <p className="text-[11px] font-black uppercase tracking-wider text-cyan-300 mb-2.5 flex items-center gap-1.5">
                <BellRing size={13} className="text-cyan-400" /> Select any symptom you are experiencing:
              </p>

              <div className="flex flex-wrap gap-2">
                {symptoms.map((s) => {
                  const active = selectedRisk === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedRisk(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-gradient-to-r from-cyan-400 to-teal-400 text-slate-950 font-black shadow-md shadow-cyan-400/25 scale-105'
                          : 'bg-white/10 hover:bg-white/15 text-slate-200 border border-white/10'
                      }`}
                    >
                      <span>{s.label}</span>
                      {active && (
                        <span className="text-[9px] font-black bg-black/20 text-slate-950 px-1.5 py-0.5 rounded-md uppercase">
                          {s.risk}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Bar (CTAs + Reassurance) */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href="/labs/category/Diabetes"
                className="group relative overflow-hidden bg-gradient-to-r from-cyan-400 via-teal-300 to-cyan-400 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-black text-xs sm:text-sm px-7 py-3.5 rounded-2xl flex items-center gap-2.5 shadow-[0_10px_30px_rgba(34,211,238,0.35)] hover:shadow-[0_12px_35px_rgba(34,211,238,0.5)] transition-all duration-300 active:scale-95 uppercase tracking-wider"
              >
                <span>Book Sugar Panel @ ₹299</span>
                <ArrowRight size={16} className="stroke-[3] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/labs/category/Diabetes"
                className="text-xs font-bold text-indigo-200 hover:text-white transition-colors underline-offset-4 hover:underline flex items-center gap-1"
              >
                <span>View All 12 Diabetic Tests</span>
              </Link>
            </div>

            {/* Trust Micro-Metrics */}
            <div className="pt-2 flex flex-wrap items-center gap-6 text-xs text-indigo-200/90 font-semibold border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <Clock size={15} className="text-cyan-400 shrink-0" />
                <span>60-Min Home Sample Pickup</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
                <span>NABL & ISO Certified Labs</span>
              </div>
              <div className="flex items-center gap-2">
                <Stethoscope size={15} className="text-pink-400 shrink-0" />
                <span>Free Doctor Interpretation</span>
              </div>
            </div>

          </div>


          {/* =========================================
              RIGHT COLUMN: Interactive Clinical Monitor
             ========================================= */}
          <div className="lg:col-span-5 relative">
            
            {/* Main Floating Glass Console */}
            <div className="relative rounded-3xl bg-white/[0.08] backdrop-blur-2xl border border-white/20 p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.35)] space-y-5">
              
              {/* Header inside console */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                    <Activity size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Glycemic Index Curve</h3>
                    <p className="text-[10px] text-indigo-200 font-medium">Real-Time Fasting vs PP Range</p>
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-1 rounded-full">
                  Target Zone
                </span>
              </div>

              {/* Simulated Waveform SVG Graph */}
              <div className="relative h-28 w-full bg-slate-950/30 rounded-2xl p-3 border border-white/10 overflow-hidden flex flex-col justify-between">
                
                {/* Target zone band */}
                <div className="absolute inset-x-0 top-1/3 bottom-1/4 bg-emerald-500/[0.07] border-y border-emerald-400/20 pointer-events-none" />

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold z-10">
                  <span>140 mg/dL (Post-Meal)</span>
                  <span className="text-emerald-400 font-mono">NORMAL THRESHOLD</span>
                </div>

                {/* SVG Curve */}
                <svg className="w-full h-12 overflow-visible" viewBox="0 0 300 60" fill="none">
                  <path
                    d="M0,45 C40,45 60,15 90,20 C120,25 150,50 190,30 C220,15 260,35 300,20"
                    stroke="url(#glucoseGradient)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="glucoseGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  {/* Glowing Pulse Dot */}
                  <circle cx="190" cy="30" r="4.5" fill="#22d3ee" className="animate-ping opacity-75" />
                  <circle cx="190" cy="30" r="4" fill="#ffffff" />
                </svg>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold z-10">
                  <span>70 mg/dL (Fasting)</span>
                  <span className="text-cyan-300">Target Range</span>
                </div>
              </div>

              {/* 2 Micro Metric Chips */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <p className="text-[10px] uppercase font-bold text-indigo-200">HbA1c Gold Standard</p>
                  <p className="text-lg font-black text-white mt-0.5">&lt; 5.7%</p>
                  <p className="text-[9px] text-emerald-300 font-semibold mt-0.5">Non-diabetic range</p>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                  <p className="text-[10px] uppercase font-bold text-indigo-200">Fasting Sugar</p>
                  <p className="text-lg font-black text-white mt-0.5">70-99 <span className="text-[10px] text-slate-300">mg/dL</span></p>
                  <p className="text-[9px] text-cyan-300 font-semibold mt-0.5">Safe baseline</p>
                </div>
              </div>

              {/* Instant Callout footer inside card */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame size={15} className="text-pink-400 shrink-0" />
                  <span className="text-xs font-bold text-purple-100">Over 95,000+ Screenings Done</span>
                </div>
                <span className="text-[10px] font-black text-pink-300 bg-pink-500/30 px-2 py-0.5 rounded-md uppercase">
                  99.8% Accurate
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}