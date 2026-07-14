import React from 'react';
import { Zap, Activity, Apple, Users, ChevronRight } from 'lucide-react';

function MiniCarePrograms() {
  const programs = [
    {
      title: "Diabetes Reversal",
      desc: "Reduce meds with science.",
      icon: <Zap size={20} />,
      color: "bg-orange-500",
      lightBg: "bg-orange-50",
    },
    {
      title: "CGM Tracking",
      desc: "Real-time sugar alerts.",
      icon: <Activity size={20} />,
      color: "bg-blue-500",
      lightBg: "bg-blue-50",
    },
    {
      title: "Smart Diet",
      desc: "Custom low-carb plans.",
      icon: <Apple size={20} />,
      color: "bg-emerald-500",
      lightBg: "bg-emerald-50",
    },
    {
      title: "Expert Support",
      desc: "24/7 Doctor access.",
      icon: <Users size={20} />,
      color: "bg-purple-500",
      lightBg: "bg-purple-50",
    }
  ];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-[1400px] mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            Our Care <span className="text-[#3d3f96]">Programs</span>
          </h2>
          <button className="text-xs font-bold text-[#3d3f96] flex items-center gap-1 hover:underline">
            VIEW ALL <ChevronRight size={14} />
          </button>
        </div>

        {/* Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {programs.map((item, index) => (
            <div 
              key={index}
              className="group flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-[#3d3f96]/30 hover:shadow-lg hover:shadow-indigo-50 transition-all cursor-pointer bg-white"
            >
              {/* Icon Box */}
              <div className={`${item.lightBg} ${item.color.replace('bg-', 'text-')} w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                {item.icon}
              </div>

              {/* Text Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-800 truncate">{item.title}</h3>
                <p className="text-[11px] text-slate-500 font-medium truncate">{item.desc}</p>
              </div>

              {/* Arrow */}
              <div className="text-slate-300 group-hover:text-[#3d3f96] transition-colors">
                <ChevronRight size={18} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MiniCarePrograms;