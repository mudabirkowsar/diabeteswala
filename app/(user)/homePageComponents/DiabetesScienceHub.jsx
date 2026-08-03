"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Zap, 
  Activity, 
  Microscope, 
  Brain, 
  HeartPulse, 
  CheckCircle2,
  Info
} from 'lucide-react';

const DiabetesScienceHub = () => {
  const hormones = [
    {
      title: "Insulin",
      subtitle: "The Energy Key",
      desc: "Produced by the pancreas, insulin acts like a key that unlocks your cells, allowing glucose from your food to enter and provide energy.",
      icon: <Droplets className="text-blue-600" size={28} />,
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      title: "Glucagon",
      subtitle: "The Sugar Reserve",
      desc: "When blood sugar is low, glucagon signals the liver to release stored glucose, ensuring your brain and body always have fuel.",
      icon: <Activity className="text-orange-600" size={28} />,
      bg: "bg-orange-50",
      border: "border-orange-100"
    },
    {
      title: "Cortisol",
      subtitle: "The Stress Factor",
      desc: "High stress releases cortisol, which can cause 'Insulin Resistance,' making it harder for your body to manage sugar levels effectively.",
      icon: <Zap className="text-purple-600" size={28} />,
      bg: "bg-purple-50",
      border: "border-purple-100"
    }
  ];

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- SECTION HEADER --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 text-[#3d3f96] px-4 py-2 rounded-full mb-6">
              <Microscope size={16} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">The Biological Blueprint</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
              Diabetes is a <br />
              <span className="text-[#3d3f96]">Hormonal Symphony.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Most people think diabetes is just about sugar. In reality, it is a complex imbalance of the endocrine system—the network of glands that produce hormones to regulate your entire body.
            </p>
          </motion.div>

          {/* Quick Fact Box */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 rounded-[3rem] p-10 text-white relative"
          >
            <div className="absolute top-6 right-6 opacity-10">
                <Brain size={80} />
            </div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-400" /> Did you know?
            </h3>
            <p className="text-blue-100/70 leading-relaxed font-medium">
                Your body uses over <span className="text-white font-bold">50 different hormones</span> to communicate. When the "Insulin-Glucagon" loop is broken, it creates a domino effect that impacts your heart, kidneys, and energy levels.
            </p>
          </motion.div>
        </div>

        {/* --- HORMONE CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {hormones.map((h, i) => (
            <div 
              key={i}
              className={`p-10 rounded-[3rem] border-2 ${h.border} ${h.bg} transition-all duration-500 hover:shadow-2xl hover:shadow-slate-100 group`}
            >
              <div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm mb-8 group-hover:scale-110 transition-transform">
                {h.icon}
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Endocrine Profile</h4>
              <h3 className="text-2xl font-black text-slate-800 mb-1">{h.title}</h3>
              <p className="text-xs font-bold text-[#3d3f96] uppercase tracking-tighter mb-6">{h.subtitle}</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {h.desc}
              </p>
            </div>
          ))}
        </div>

        {/* --- THE IMPACT GRID --- */}
        <div className="bg-slate-50 rounded-[4rem] p-10 md:p-20 border border-slate-100">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-black text-slate-900">How Imbalance Affects You</h3>
            <p className="text-slate-500 font-medium mt-2">Long-term high sugar levels impact vital organ systems.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Impact 1 */}
            <div className="flex gap-6">
              <div className="shrink-0 text-red-500"><HeartPulse size={32} /></div>
              <div>
                <h4 className="font-black text-slate-800 mb-2">Cardiovascular</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Excess sugar damages the lining of blood vessels, increasing the risk of heart conditions.</p>
              </div>
            </div>
            {/* Impact 2 */}
            <div className="flex gap-6">
              <div className="shrink-0 text-blue-500"><Activity size={32} /></div>
              <div>
                <h4 className="font-black text-slate-800 mb-2">Metabolic Rate</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Hormonal shifts can slow down your metabolism, making weight management a constant struggle.</p>
              </div>
            </div>
            {/* Impact 3 */}
            <div className="flex gap-6">
              <div className="shrink-0 text-emerald-500"><CheckCircle2 size={32} /></div>
              <div>
                <h4 className="font-black text-slate-800 mb-2">Cellular Energy</h4>
                <p className="text-sm text-slate-500 leading-relaxed">Without proper insulin function, your cells "starve" for energy even when blood sugar is high.</p>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="mt-16 pt-10 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-600 font-bold italic text-center md:text-left">
              "At Diabetes Wala, we focus on restoring this hormonal balance, not just masking symptoms."
            </p>
            <button className="bg-[#3d3f96] text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#2d2f75] transition-all shadow-xl shadow-indigo-100">
              Start Your Reversal Journey
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default DiabetesScienceHub;