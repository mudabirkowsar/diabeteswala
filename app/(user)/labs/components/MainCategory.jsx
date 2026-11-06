"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Microscope, 
  Dna, 
  FileUp, 
  Droplet, 
  Scan, 
  ShieldCheck, 
  Sparkles, 
  ArrowUpRight, 
  Clock 
} from 'lucide-react';

const CATEGORIES = [
  {
    id: "pathology",
    displayName: "Pathology Tests",
    subtitle: "Urine, Biopsy & Cultures",
    route: "/labs/category/Pathology",
    badgeText: "Up to 79% OFF",
    cardBg: "from-cyan-50/80 via-teal-50/40 to-white",
    cardBorder: "border-cyan-200/80 hover:border-cyan-400",
    badgeTheme: "bg-cyan-100/80 text-cyan-900 border-cyan-200",
    iconBox: "bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-cyan-500/25",
    hoverGlow: "group-hover:shadow-cyan-500/10",
    icon: <Microscope className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
  },
  {
    id: "genetics",
    displayName: "Genetics & DNA",
    subtitle: "Chromosomes & Heredity",
    route: "/labs/category/Genetics",
    badgeText: "Up to 70% OFF",
    cardBg: "from-pink-50/80 via-rose-50/40 to-white",
    cardBorder: "border-pink-200/80 hover:border-pink-400",
    badgeTheme: "bg-pink-100/80 text-pink-900 border-pink-200",
    iconBox: "bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/25",
    hoverGlow: "group-hover:shadow-pink-500/10",
    icon: <Dna className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
  },
  {
    id: "upload_prescription",
    displayName: "Upload Rx",
    subtitle: "Book via Doctor's Slip",
    route: "/labs/uploadprescription",
    badgeText: "Quick Assist",
    isSpecial: true,
    cardBg: "from-indigo-50/90 via-blue-50/50 to-white",
    cardBorder: "border-indigo-300 hover:border-indigo-500",
    badgeTheme: "bg-indigo-100/90 text-indigo-950 border-indigo-200 font-black",
    iconBox: "bg-gradient-to-br from-[#3D3F96] to-indigo-600 text-white shadow-indigo-500/25",
    hoverGlow: "group-hover:shadow-indigo-500/15",
    icon: <FileUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
  },
  {
    id: "hematology",
    displayName: "Hematology",
    subtitle: "CBC, Hemoglobin & Blood",
    route: "/labs/category/Hematology",
    badgeText: "Up to 75% OFF",
    cardBg: "from-rose-50/80 via-red-50/40 to-white",
    cardBorder: "border-rose-200/80 hover:border-rose-400",
    badgeTheme: "bg-rose-100/80 text-rose-900 border-rose-200",
    iconBox: "bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-rose-500/25",
    hoverGlow: "group-hover:shadow-rose-500/10",
    icon: <Droplet className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
  },
  {
    id: "radiology",
    displayName: "X-Ray & Scans",
    subtitle: "CT, Ultrasound & MRI",
    route: "/labs/category/Radiology",
    badgeText: "Up to 70% OFF",
    cardBg: "from-violet-50/80 via-purple-50/40 to-white",
    cardBorder: "border-violet-200/80 hover:border-violet-400",
    badgeTheme: "bg-violet-100/80 text-violet-900 border-violet-200",
    iconBox: "bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-violet-500/25",
    hoverGlow: "group-hover:shadow-violet-500/10",
    icon: <Scan className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
  }
];

export default function MainCategory() {
  return (
    <section className="py-12 bg-white select-none">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-16">
        
        {/* =========================================================================
            HEADER (KEPT 100% UNCHANGED AS REQUESTED)
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8 border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-50/80 text-[#3D3F96] text-[11px] font-bold uppercase tracking-wider mb-1.5">
              <Sparkles size={13} className="text-[#3D3F96]" />
              Diagnostic Care
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Top Diagnostic <span className="text-[#3D3F96]">Departments</span>
            </h2>
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
              <span>NABL & ISO Certified</span>
            </div>
            <span className="w-1 h-1 rounded-full bg-slate-300 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-1.5">
              <Clock size={15} className="text-indigo-600 shrink-0" />
              <span>60-Min Home Sample Pickup</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            CENTERED CARDS CONTAINER
            ========================================================================= */}
        <div className="flex justify-center w-full">
          <div className="w-full max-w-[1080px]">
            <div className="flex sm:grid sm:grid-cols-5 gap-2.5 sm:gap-3.5 justify-start sm:justify-center overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 scrollbar-none snap-x snap-mandatory">
              {CATEGORIES.map((cat, idx) => (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.04, duration: 0.3, ease: "easeOut" }}
                  className="snap-start flex-shrink-0 w-[136px] sm:w-auto"
                >
                  <Link
                    href={cat.route}
                    className={`group relative flex flex-col justify-between h-[142px] sm:h-[155px] p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-b ${cat.cardBg} border ${cat.cardBorder} shadow-2xs hover:shadow-lg ${cat.hoverGlow} hover:-translate-y-0.5 transition-all duration-300 overflow-hidden`}
                  >
                    {/* Highlight Ribbon for Upload Rx */}
                    {cat.isSpecial && (
                      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
                        <div className="absolute top-1.5 -right-5 w-16 bg-[#3D3F96] text-[7px] font-black uppercase text-center text-white py-0.5 rotate-45 shadow-xs">
                          Popular
                        </div>
                      </div>
                    )}

                    {/* Top Bar: Icon & Arrow Button */}
                    <div className="flex items-start justify-between w-full">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl ${cat.iconBox} shadow-sm flex items-center justify-center transition-transform duration-300 group-hover:scale-105`}>
                        {cat.icon}
                      </div>

                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/80 border border-slate-200/60 flex items-center justify-center text-slate-400 group-hover:text-slate-900 group-hover:bg-white transition-all shadow-2xs">
                        <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </div>
                    </div>

                    {/* Bottom Content: Title, Subtitle & Compact Badge */}
                    <div className="mt-auto pt-1">
                      <h3 className="text-xs sm:text-[13px] font-black text-slate-800 group-hover:text-[#3D3F96] transition-colors leading-tight line-clamp-1">
                        {cat.displayName}
                      </h3>

                      <p className="text-[9px] sm:text-[10px] font-medium text-slate-500 line-clamp-1 mt-0.5">
                        {cat.subtitle}
                      </p>

                      {/* Compact Offer Badge */}
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded border text-[8px] sm:text-[9px] font-extrabold tracking-tight ${cat.badgeTheme}`}>
                          {cat.badgeText}
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}