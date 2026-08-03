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
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

const EndocrineInsights = () => {
  const hormoneData = [
    {
      title: "Insulin & Glucagon",
      gland: "Pancreas",
      impact: "Blood Sugar Regulation",
      desc: "The master switch for energy. Imbalance leads to high sugar levels and metabolic fatigue.",
      icon: <Droplets className="text-blue-600" size={24} />,
      bg: "bg-blue-50"
    },
    {
      title: "Cortisol",
      gland: "Adrenal Glands",
      impact: "Stress & Sugar Spikes",
      desc: "Known as the stress hormone, it can block insulin's effectiveness, causing 'Stress Diabetes'.",
      icon: <Zap className="text-orange-600" size={24} />,
      bg: "bg-orange-50"
    },
    {
      title: "Leptin & Ghrelin",
      gland: "Adipose Tissue",
      impact: "Hunger & Satiety",
      desc: "These hormones control your appetite. Diabetes often disrupts these, leading to overeating.",
      icon: <Activity className="text-emerald-600" size={24} />,
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
    <section className="py-20 bg-[#fcfdfe]">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- CLINICAL HEADER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 text-[#3d3f96] px-4 py-2 rounded-full mb-6">
              <Stethoscope size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">Clinical Knowledge Base</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              The Endocrine <br />
              <span className="text-[#3d3f96]">Connection.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Diabetes is fundamentally a disorder of the endocrine system. Understanding how your hormones interact is the first step toward effective management and reversal.
            </p>
          </div>
          
          {/* Warning Signs Box */}
          <div className="bg-red-50 border border-red-100 p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 text-red-600">
                <AlertTriangle size={80} />
            </div>
            <h3 className="text-xl font-black text-red-900 mb-6 flex items-center gap-2">
                <AlertTriangle size={20} /> Red Flags to Watch For
            </h3>
            <ul className="space-y-4">
                {warningSigns.map((sign, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-bold text-red-800/80">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                        {sign}
                    </li>
                ))}
            </ul>
          </div>
        </div>

        {/* --- HORMONE INTERACTION GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {hormoneData.map((item, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
            >
              <div className={`${item.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-8`}>
                {item.icon}
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">
                {item.gland} • {item.impact}
              </h4>
              <h3 className="text-2xl font-black text-slate-800 mb-4">{item.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                {item.desc}
              </p>
              <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-widest">Clinical Data</span>
                <Info size={16} className="text-slate-300" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default EndocrineInsights;