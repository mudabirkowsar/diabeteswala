"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Microscope, 
  Dna, 
  FileUp, 
  Droplet, 
  Scan,
  Flame,
  ShieldCheck
} from 'lucide-react';

// Exactly 5 cards: Pathology, Genetics, Upload Prescription, Hematology, and Radiology
const FIXED_CATEGORIES = [
  {
    id: "pathology",
    displayName: "Pathology Tests",
    route: "/labs/category/Pathology",
    badgeText: "Up to 79% off",
    bgGradient: "bg-gradient-to-b from-[#DDF7FB] to-[#C9F0F7]",
    badgeBg: "bg-white/95 text-cyan-800 border-cyan-200/70",
    iconBg: "bg-cyan-500/15 text-cyan-700 group-hover:bg-cyan-600 group-hover:text-white",
    dotColor: "bg-cyan-500",
    icon: <Microscope className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
  },
  {
    id: "genetics",
    displayName: "Genetics & DNA Test",
    route: "/labs/category/Genetics",
    badgeText: "Up to 70% off",
    bgGradient: "bg-gradient-to-b from-[#FCE5F2] to-[#F8D2E7]",
    badgeBg: "bg-white/95 text-pink-800 border-pink-200/70",
    iconBg: "bg-pink-500/15 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
    dotColor: "bg-pink-500",
    icon: <Dna className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
  },
  {
    id: "upload_prescription",
    displayName: "Upload Prescription",
    route: "/labs/uploadprescription",
    badgeText: "Quick Booking",
    bgGradient: "bg-gradient-to-b from-[#E2F0FE] to-[#CFE5FD]",
    badgeBg: "bg-white/95 text-blue-800 border-blue-200/70",
    iconBg: "bg-blue-500/15 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    dotColor: "bg-blue-500",
    icon: <FileUp className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
  },
  {
    id: "hematology",
    displayName: "Hematology Tests",
    route: "/labs/category/Hematology",
    badgeText: "Up to 75% off",
    bgGradient: "bg-gradient-to-b from-[#FFEBE3] to-[#FFD8CB]",
    badgeBg: "bg-white/95 text-orange-900 border-orange-200/70",
    iconBg: "bg-orange-500/15 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
    dotColor: "bg-orange-500",
    icon: <Droplet className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
  },
  {
    id: "radiology",
    displayName: "X-Rays & Radiology",
    route: "/labs/category/Radiology",
    badgeText: "Up to 70% off",
    bgGradient: "bg-gradient-to-b from-[#E7EEFE] to-[#D5E1FD]",
    badgeBg: "bg-white/95 text-indigo-800 border-indigo-200/70",
    iconBg: "bg-indigo-500/15 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    dotColor: "bg-indigo-500",
    icon: <Scan className="w-8 h-8 sm:w-9 sm:h-9 stroke-[1.8]" />
  }
];

export default function MainCategory() {
  const router = useRouter();

  const handleCardClick = (route) => {
    router.push(route);
  };

  return (
    <section className="w-full py-6 sm:py-10 bg-white select-none">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex items-center justify-between mb-5 sm:mb-7">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[11px] font-bold tracking-widest text-[#3d3f96] uppercase">
                Diagnostic Services
              </p>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Top Categories & Services
            </h2>
          </div>
          
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-400">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>NABL Accredited Partners</span>
          </div>
        </div>

        {/* Categories Grid (5 Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5 sm:gap-5">
          {FIXED_CATEGORIES.map((cat, idx) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.35 }}
              whileHover={{ y: -6 }}
              onClick={() => handleCardClick(cat.route)}
              className="group flex flex-col items-center cursor-pointer text-center"
            >
              {/* Card Capsule */}
              <div
                className={`relative w-full aspect-[4/3.8] ${cat.bgGradient} rounded-2xl sm:rounded-[2rem] p-3 sm:p-3.5 flex flex-col items-center justify-between transition-all duration-300 shadow-xs group-hover:shadow-xl group-hover:shadow-slate-300/40 border border-black/[0.04] overflow-hidden`}
              >
                {/* Top Corner Dot Indicator */}
                <div className="w-full flex justify-end">
                  <span className={`w-2 h-2 rounded-full ${cat.dotColor} opacity-40 group-hover:opacity-100 transition-opacity`} />
                </div>

                {/* Centered Icon Container */}
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${cat.iconBg} backdrop-blur-xs flex items-center justify-center transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-1 shadow-sm`}
                >
                  {cat.icon}
                </div>

                {/* Bottom Pill Badge */}
                <div
                  className={`w-full py-1 px-2 rounded-full border backdrop-blur-md shadow-xs ${cat.badgeBg} flex items-center justify-center gap-1 transition-all duration-200 group-hover:scale-[1.02]`}
                >
                  <Flame size={11} className="text-amber-500 fill-amber-500 shrink-0" />
                  <span className="text-[10px] sm:text-[11px] font-extrabold tracking-tight truncate">
                    {cat.badgeText}
                  </span>
                </div>
              </div>

              {/* Title Below Card */}
              <h3 className="mt-2.5 text-xs sm:text-[13px] font-extrabold text-slate-800 group-hover:text-[#3d3f96] transition-colors leading-snug line-clamp-2 px-1">
                {cat.displayName}
              </h3>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}