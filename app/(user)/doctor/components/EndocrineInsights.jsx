"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Stethoscope, 
  Activity, 
  AlertTriangle, 
  Droplets, 
  Zap, 
  Info,
  ChevronRight
} from 'lucide-react';

const EndocrineInsights = () => {
  const hormoneData = [
    {
      title: "Insulin & Glucagon",
      gland: "Pancreas",
      impact: "Blood Sugar Regulation",
      desc: "The master switch for energy. Imbalance leads to high sugar levels and metabolic fatigue.",
      icon: <Droplets className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />,
      bg: "bg-blue-50"
    },
    {
      title: "Cortisol",
      gland: "Adrenal Glands",
      impact: "Stress & Sugar Spikes",
      desc: "Known as the stress hormone, it can block insulin's effectiveness, causing 'Stress Diabetes'.",
      icon: <Zap className="text-orange-600 w-5 h-5 sm:w-6 sm:h-6" />,
      bg: "bg-orange-50"
    },
    {
      title: "Leptin & Ghrelin",
      gland: "Adipose Tissue",
      impact: "Hunger & Satiety",
      desc: "These hormones control your appetite. Diabetes often disrupts these, leading to overeating.",
      icon: <Activity className="text-emerald-600 w-5 h-5 sm:w-6 sm:h-6" />,
      bg: "bg-emerald-50"
    }
  ];

  const warningSigns = [
    "Unexplained fatigue despite sleeping",
    "Frequent thirst and blurred vision",
    "Slow healing of minor wounds",
    "Sudden weight changes or cravings"
  ];

  return (
    <section className="py-12 sm:py-16 md:py-20 bg-[#fcfdfe] antialiased select-none overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        
        {/* --- CLINICAL HEADER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 sm:mb-16 md:mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 text-[#3d3f96] px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
              <Stethoscope size={15} className="shrink-0" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest">
                Clinical Knowledge Base
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight mb-4 sm:mb-6">
              The Endocrine <br className="hidden sm:inline" />
              <span className="text-[#3d3f96]">Connection.</span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Diabetes is fundamentally a disorder of the endocrine system. Understanding how your hormones interact is the first step toward effective management and reversal.
            </p>
          </div>
          
          {/* Warning Signs Box */}
          <div className="bg-red-50/80 border border-red-100 p-5 sm:p-8 rounded-3xl sm:rounded-[2.5rem] relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 p-4 sm:p-6 opacity-10 text-red-600 pointer-events-none">
              <AlertTriangle className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-red-900 mb-4 sm:mb-6 flex items-center gap-2">
              <AlertTriangle className="text-red-600 w-5 h-5 shrink-0" /> Red Flags to Watch For
            </h3>
            <ul className="space-y-3 sm:space-y-4">
              {warningSigns.map((sign, i) => (
                <li key={i} className="flex items-center gap-3 text-xs sm:text-sm font-bold text-red-800/80">
                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0"></div>
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* --- HORMONE INTERACTION GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
          {hormoneData.map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-6 sm:p-8 rounded-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
            >
              <div>
                <div className={`${item.bg} w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-5 sm:mb-8 group-hover:scale-105 transition-transform`}>
                  {item.icon}
                </div>
                <h4 className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.18em] mb-1.5 sm:mb-2">
                  {item.gland} • {item.impact}
                </h4>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 mb-3 sm:mb-4 group-hover:text-[#3d3f96] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed mb-6 sm:mb-8">
                  {item.desc}
                </p>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] sm:text-[10px] font-black text-[#3d3f96] uppercase tracking-widest flex items-center gap-1">
                  Clinical Data <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <Info size={16} className="text-slate-300 group-hover:text-[#3d3f96] transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default EndocrineInsights;