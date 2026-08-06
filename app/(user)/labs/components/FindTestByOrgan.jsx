"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { 
  HeartPulse, 
  Activity, 
  Droplets, 
  ShieldCheck, 
  Zap, 
  User, 
  Brain, 
  Stethoscope,
  Eye,
  Wind,
  Bone,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

const FindTestByOrgan = () => {
  const organs = [
    { 
      name: "Pancreas", 
      icon: <Droplets className="w-7 h-7" />, 
      desc: "Insulin & Sugar", 
      color: "text-blue-600", 
      bg: "bg-blue-500/10", 
      hoverBg: "group-hover:bg-blue-600",
      highlight: true 
    },
    { 
      name: "Heart", 
      icon: <HeartPulse className="w-7 h-7" />, 
      desc: "Cardiac Health", 
      color: "text-rose-600", 
      bg: "bg-rose-500/10",
      hoverBg: "group-hover:bg-rose-600"
    },
    { 
      name: "Kidney", 
      icon: <ShieldCheck className="w-7 h-7" />, 
      desc: "Renal Function", 
      color: "text-emerald-600", 
      bg: "bg-emerald-500/10",
      hoverBg: "group-hover:bg-emerald-600"
    },
    { 
      name: "Liver", 
      icon: <Activity className="w-7 h-7" />, 
      desc: "Hepatic Health", 
      color: "text-amber-600", 
      bg: "bg-amber-500/10",
      hoverBg: "group-hover:bg-amber-600"
    },
    { 
      name: "Thyroid", 
      icon: <Zap className="w-7 h-7" />, 
      desc: "Hormone Balance", 
      color: "text-purple-600", 
      bg: "bg-purple-500/10",
      hoverBg: "group-hover:bg-purple-600"
    },
    { 
      name: "Brain", 
      icon: <Brain className="w-7 h-7" />, 
      desc: "Neuro Wellness", 
      color: "text-indigo-600", 
      bg: "bg-indigo-500/10",
      hoverBg: "group-hover:bg-indigo-600"
    },
    { 
      name: "Lungs", 
      icon: <Wind className="w-7 h-7" />, 
      desc: "Respiratory", 
      color: "text-cyan-600", 
      bg: "bg-cyan-500/10",
      hoverBg: "group-hover:bg-cyan-600"
    },
    { 
      name: "Eyes", 
      icon: <Eye className="w-7 h-7" />, 
      desc: "Ocular Health", 
      color: "text-teal-600", 
      bg: "bg-teal-500/10",
      hoverBg: "group-hover:bg-teal-600"
    },
    { 
      name: "Stomach", 
      icon: <Stethoscope className="w-7 h-7" />, 
      desc: "Digestive System", 
      color: "text-pink-600", 
      bg: "bg-pink-500/10",
      hoverBg: "group-hover:bg-pink-600"
    },
    { 
      name: "Bones", 
      icon: <Bone className="w-7 h-7" />, 
      desc: "Joints & Calcium", 
      color: "text-slate-600", 
      bg: "bg-slate-500/10",
      hoverBg: "group-hover:bg-slate-700"
    },
    { 
      name: "Skin", 
      icon: <Sparkles className="w-7 h-7" />, 
      desc: "Dermatology", 
      color: "text-fuchsia-600", 
      bg: "bg-fuchsia-500/10",
      hoverBg: "group-hover:bg-fuchsia-600"
    },
    { 
      name: "Full Body", 
      icon: <User className="w-7 h-7" />, 
      desc: "Total Checkup", 
      color: "text-[#3d3f96]", 
      bg: "bg-[#3d3f96]/10",
      hoverBg: "group-hover:bg-[#3d3f96]"
    },
  ];

  return (
    <section className="relative py-28 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/50 overflow-hidden">
      {/* Background Subtle Mesh Decorative Accents */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-40">
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-[1440px] mx-auto px-6">
        
        {/* --- Header Section --- */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#3d3f96]/10 text-[#3d3f96] text-xs font-bold tracking-widest uppercase mb-4">
              <Sparkles className="w-3.5 h-3.5" /> Diagnostic Categories
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">
              Find Tests by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] to-indigo-500">Organ</span>
            </h2>
            <p className="text-base md:text-lg text-slate-500 font-medium mt-6 leading-relaxed max-w-2xl mx-auto">
              Precision diagnostics tailored to every vital system. Select an organ to explore specialized lab packages and hormonal profiles.
            </p>
          </motion.div>
        </div>

        {/* --- Organ Grid --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
          {organs.map((organ, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04, duration: 0.5 }}
              whileHover={{ y: -8 }}
              className={`group relative p-7 bg-white/80 backdrop-blur-md border ${
                organ.highlight 
                  ? 'border-[#3d3f96]/40 shadow-xl shadow-indigo-100/50 ring-2 ring-[#3d3f96]/10' 
                  : 'border-slate-100 hover:border-slate-300/80'
              } rounded-[2.5rem] flex flex-col items-center text-center cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/60`}
            >
              {/* Highlight Badge for Pancreas */}
              {organ.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#3d3f96] to-indigo-600 text-white text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-md shadow-indigo-300/50">
                  Primary Focus
                </div>
              )}

              {/* Icon Container with subtle transform effects */}
              <div 
                className={`relative ${organ.bg} ${organ.color} ${organ.hoverBg} group-hover:text-white w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-3`}
              >
                {organ.icon}
              </div>

              {/* Text Content */}
              <h3 className="text-base font-extrabold text-slate-900 mb-1 group-hover:text-[#3d3f96] transition-colors">
                {organ.name}
              </h3>
              <p className="text-[11px] font-semibold text-slate-400 group-hover:text-slate-500 transition-colors tracking-wide">
                {organ.desc}
              </p>

              {/* Hover Action Link Accent */}
              <div className="mt-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex items-center gap-1 text-xs font-bold text-[#3d3f96]">
                Explore <ArrowUpRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FindTestByOrgan;