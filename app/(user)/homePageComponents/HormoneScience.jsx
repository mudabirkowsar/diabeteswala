"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Droplets, 
  Zap, 
  ShieldAlert, 
  Activity, 
  Microscope, 
  ArrowRight,
  Thermometer,
  CheckCircle2
} from 'lucide-react';

const HormoneScience = () => {
  const hormones = [
    {
      name: "Insulin",
      role: "The Glucose Key",
      desc: "The primary hormone that allows your cells to absorb sugar from the blood for energy.",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100"
    },
    {
      name: "Glucagon",
      role: "The Sugar Releaser",
      desc: "Signals the liver to release stored glucose when your blood sugar levels drop too low.",
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100"
    },
    {
      name: "Cortisol",
      role: "The Stress Trigger",
      desc: "The 'stress hormone' that can cause blood sugar spikes by making cells resistant to insulin.",
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100"
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- SECTION HEADER --- */}
        <div className="flex flex-col lg:flex-row items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[#3d3f96] font-bold text-xs uppercase tracking-widest mb-4">
              <Microscope size={16} />
              The Biological Loop
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
              The Science of <br />
              <span className="text-[#3d3f96]">Hormonal Balance.</span>
            </h2>
          </div>
          <p className="text-slate-500 font-medium max-w-md lg:text-right">
            Diabetes isn't just about sugar; it's a delicate dance between multiple hormones that regulate your metabolism.
          </p>
        </div>

        {/* --- HORMONE PROFILE GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {hormones.map((h, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className={`p-8 rounded-[2.5rem] border-2 ${h.border} ${h.bg} transition-all duration-300`}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-white shadow-sm ${h.color}`}>
                  {h.name === "Insulin" && <Droplets size={28} />}
                  {h.name === "Glucagon" && <Activity size={28} />}
                  {h.name === "Cortisol" && <Thermometer size={28} />}
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hormone Profile</span>
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">{h.name}</h3>
              <p className={`text-xs font-bold uppercase tracking-widest mb-4 ${h.color}`}>{h.role}</p>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                {h.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* --- THE DIABETES MECHANISM (INFOGRAPHIC STYLE) --- */}
        <div className="bg-[#3d3f96] rounded-[3.5rem] p-10 md:p-16 text-white relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-4">
              <h3 className="text-3xl font-black mb-6">How Diabetes <br /> Happens</h3>
              <p className="text-blue-100/70 font-medium leading-relaxed mb-8">
                When the hormonal loop is broken, sugar stays in the blood instead of fueling your cells.
              </p>
              <button className="flex items-center gap-2 text-white font-bold text-sm hover:underline">
                View Full Clinical Guide <ArrowRight size={18} />
              </button>
            </div>

            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Step 1 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-400 flex items-center justify-center font-black text-white">1</div>
                  <h4 className="font-bold">Insulin Resistance</h4>
                </div>
                <p className="text-xs text-blue-100/60 leading-relaxed">
                  In Type 2, your cells stop responding to insulin. The "key" no longer fits the lock perfectly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center font-black text-white">2</div>
                  <h4 className="font-bold">Pancreas Fatigue</h4>
                </div>
                <p className="text-xs text-blue-100/60 leading-relaxed">
                  The pancreas works overtime to produce more insulin, eventually leading to burnout and lower production.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center font-black text-white">3</div>
                  <h4 className="font-bold">Hyperglycemia</h4>
                </div>
                <p className="text-xs text-blue-100/60 leading-relaxed">
                  Sugar builds up in the bloodstream, causing inflammation and damage to vital organs over time.
                </p>
              </div>

              {/* Step 4 */}
              <div className="bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-3xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-400 flex items-center justify-center font-black text-white">4</div>
                  <h4 className="font-bold">The Solution</h4>
                </div>
                <p className="text-xs text-blue-100/60 leading-relaxed">
                  Through diet, exercise, and expert care, we can improve insulin sensitivity and restore balance.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* --- TRUST FOOTER --- */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-50">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
             <CheckCircle2 size={16} /> Clinically Validated
           </div>
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
             <ShieldAlert size={16} /> Expert Reviewed
           </div>
        </div>

      </div>
    </section>
  );
};

export default HormoneScience;