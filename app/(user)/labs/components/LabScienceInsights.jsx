"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Beaker, 
  Microscope, 
  FileText, 
  Activity, 
  Dna, 
  ShieldCheck, 
  ArrowRight,
  Info
} from 'lucide-react';

const LabScienceInsights = () => {
  const labMarkers = [
    {
      name: "HbA1c (Glycated Hemoglobin)",
      hormoneLink: "Average Glucose Control",
      desc: "This test measures your average blood sugar over 3 months. It shows how well your Insulin has been managing glucose over a long period.",
      icon: <Activity className="text-red-500" size={24} />,
      bg: "bg-red-50"
    },
    {
      name: "C-Peptide Test",
      hormoneLink: "Insulin Production",
      desc: "A vital marker that tells us exactly how much insulin your pancreas is still producing. Essential for distinguishing Type 1 from Type 2.",
      icon: <Dna className="text-blue-500" size={24} />,
      bg: "bg-blue-50"
    },
    {
      name: "Fasting Insulin",
      hormoneLink: "Insulin Resistance",
      desc: "Measures the insulin levels in your blood after fasting. High levels often indicate 'Insulin Resistance' before blood sugar even rises.",
      icon: <Beaker className="text-purple-500" size={24} />,
      bg: "bg-purple-50"
    }
  ];

  return (
    <section className="py-20 bg-[#fcfdfe]">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* --- HEADER SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-[#3d3f96]/5 text-[#3d3f96] px-4 py-2 rounded-full mb-6">
              <Microscope size={16} />
              <span className="text-[11px] font-black uppercase tracking-widest">Diagnostic Science</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              Your Lab Report is a <br />
              <span className="text-[#3d3f96]">Hormonal Map.</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed max-w-xl">
              Blood tests are the only way to see the "hidden" dance of hormones. At Diabetes Wala, we use precision diagnostics to look beyond sugar levels and understand your metabolic health.
            </p>
          </motion.div>

          {/* Info Highlight Box */}
          <div className="bg-[#3d3f96] rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-100">
            <div className="absolute top-0 right-0 p-8 opacity-10">
                <FileText size={100} />
            </div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info size={20} className="text-blue-300" /> Why Labs Matter
            </h3>
            <p className="text-blue-100/70 leading-relaxed font-medium text-sm">
                Hormonal imbalances like <span className="text-white font-bold">Hyperinsulinemia</span> often go undetected for years. Our specialized lab panels are designed to catch these shifts early, allowing for faster reversal and better long-term outcomes.
            </p>
            <div className="mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-300">
                <ShieldCheck size={16} /> NABL Accredited Partner Labs
            </div>
          </div>
        </div>

        {/* --- LAB MARKER CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {labMarkers.map((marker, index) => (
            <motion.div 
              key={index}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-100 transition-all duration-500"
            >
              <div className={`${marker.bg} w-14 h-14 rounded-2xl flex items-center justify-center mb-8`}>
                {marker.icon}
              </div>
              <h4 className="text-[10px] font-black text-[#3d3f96] uppercase tracking-[0.2em] mb-2">
                {marker.hormoneLink}
              </h4>
              <h3 className="text-xl font-black text-slate-800 mb-4 leading-tight">{marker.name}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                {marker.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* --- BOTTOM CTA --- */}
        <div className="mt-16 text-center">
            <div className="inline-block p-1 bg-slate-100 rounded-2xl">
                <button className="bg-white text-[#3d3f96] px-8 py-4 rounded-xl font-black text-sm flex items-center gap-3 hover:bg-[#3d3f96] hover:text-white transition-all shadow-sm">
                    Book a Specialized Diabetes Panel <ArrowRight size={18} />
                </button>
            </div>
            <p className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Free Home Sample Collection Included
            </p>
        </div>

      </div>
    </section>
  );
};

export default LabScienceInsights;