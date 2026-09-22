"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Sparkles,
  Activity,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Dna,
  HeartPulse,
  Sliders,
  CheckCircle2,
  Flame,
  Apple,
  TrendingUp,
  BrainCircuit,
  Lock
} from "lucide-react";

const HEALTH_PILLARS = [
  {
    id: "biomarker",
    tag: "Phase 01 • Medical Calibration",
    title: "Biomarker & Metabolic Alignment",
    shortDesc: "Targeted clinical parameters calibrated to your exact blood glucose, lipid profile, and inflammation markers.",
    icon: Dna,
    iconColor: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    stats: { metric: "100%", label: "Clinically Verified" },
    features: [
      "Continuous glucose & insulin response balancing",
      "Restricted sodium & cardiac-safe electrolyte splits",
      "Zero inflammatory seed oils or artificial stabilizers"
    ],
    previewData: {
      badge: "Cardiometabolic Protocol",
      score: "98.4%",
      glycemicLoad: "Ultra-Low (<25)",
      fiberRatio: "14g Prebiotic"
    }
  },
  {
    id: "macro-matrix",
    tag: "Phase 02 • Nutrition Engineering",
    title: "Precision Macro & Micronutrient Matrix",
    shortDesc: "Registered dietitians formulate optimal amino acid availability and gut-nourishing microbiome variety.",
    icon: BrainCircuit,
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    stats: { metric: "35g+", label: "Bioavailable Protein" },
    features: [
      "Custom macro ratios for longevity and lean retention",
      "30+ distinct whole organic plants per week",
      "Bio-fermented prebiotic digestive support"
    ],
    previewData: {
      badge: "Macro-Optimized Blend",
      score: "96.8%",
      glycemicLoad: "Target Clean Energy",
      fiberRatio: "12g Soluble Matrix"
    }
  },
  {
    id: "culinary-rx",
    tag: "Phase 03 • Gourmet Execution",
    title: "Clinical Chef Formulation",
    shortDesc: "Michelin-trained culinary chefs prepare medical-grade nutrition using 17+ fresh ingredients per dish.",
    icon: Flame,
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    stats: { metric: "0%", label: "Refined Sugars / Additives" },
    features: [
      "Rotating weekly menus so you never eat the same dish twice",
      "Vacuum-sealed farm freshness without preservatives",
      "Gourmet herb reductions & cold-pressed oil glazes"
    ],
    previewData: {
      badge: "Chef Crafted Daily",
      score: "99.1%",
      glycemicLoad: "Whole Food Sourced",
      fiberRatio: "100% Clean Label"
    }
  },
  {
    id: "continuous-tuning",
    tag: "Phase 04 • Adaptive Health",
    title: "Continuous Medical Health Tuning",
    shortDesc: "Your nutrition plan automatically evolves as your weight, energy metrics, and doctor checkups progress.",
    icon: Sliders,
    iconColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    stats: { metric: "24/7", label: "Dietitian Access" },
    features: [
      "Periodic plan re-calibrations by clinical dietitians",
      "Progress tracking for metabolic and cardiovascular vitality",
      "Seamless dietary restriction & allergy adjustments"
    ],
    previewData: {
      badge: "Adaptive Care Loop",
      score: "Active",
      glycemicLoad: "Bi-Weekly Review",
      fiberRatio: "Progress Synced"
    }
  }
];

export default function HealthPlans() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(HEALTH_PILLARS[0]);

  const handleNavigateToPrograms = (pillarId) => {
    router.push(`/food/programs?focus=${pillarId || "all"}`);
  };

  return (
    <section className="relative py-20 lg:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-800 select-none overflow-hidden">
      
      {/* Background ambient lighting glows */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#3D3F96]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16 sm:mb-20">
        
        {/* Top Decorative Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-[#3D3F96]/40 to-[#3D3F96]" />
          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-[#3D3F96] bg-[#3D3F96]/5 px-4 py-1.5 rounded-full border border-[#3D3F96]/15">
            Tailored Nutritional Protocols
          </span>
          <div className="h-px bg-gradient-to-l from-transparent via-[#3D3F96]/40 to-[#3D3F96]" />
        </motion.div>

        {/* Main Headline */}
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight"
        >
          We Don’t Just Deliver Meals. <br className="hidden sm:inline" />
          <span className="text-[#3D3F96] relative inline-block">
            We Engineer Your Health Plan.
            <span className="absolute left-0 -bottom-1 w-full h-1 bg-[#3D3F96]/30 rounded-full" />
          </span>
        </motion.h2>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-xs sm:text-base text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed"
        >
          Every body operates differently. Discover how our board of medical doctors, 
          clinical dietitians, and master chefs construct a custom food program calibrated for you.
        </motion.p>
      </div>

      {/* Main Interactive Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch mb-16">

        {/* LEFT COLUMN: Interactive Feature Nav Tabs (Framer Motion) */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
          {HEALTH_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const isActive = activeTab.id === pillar.id;

            return (
              <motion.div
                key={pillar.id}
                onClick={() => setActiveTab(pillar)}
                whileHover={{ scale: 1.015, x: 4 }}
                whileTap={{ scale: 0.985 }}
                className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer border transition-all duration-300 overflow-hidden ${
                  isActive
                    ? "bg-white border-[#3D3F96] shadow-xl shadow-[#3D3F96]/10 ring-2 ring-[#3D3F96]/20"
                    : "bg-slate-50/80 border-slate-200/80 hover:bg-white hover:border-slate-300 shadow-sm"
                }`}
              >
                {/* Active Indicator Bar on Left */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#3D3F96]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}

                <div className="flex items-start gap-4">
                  {/* Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                      isActive
                        ? "bg-[#3D3F96] text-white border-transparent shadow-md shadow-[#3D3F96]/30"
                        : "bg-white text-slate-700 border-slate-200"
                    }`}
                  >
                    <Icon size={22} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-black tracking-wider uppercase text-slate-400 block mb-1">
                      {pillar.tag}
                    </span>
                    <h3
                      className={`text-base sm:text-lg font-extrabold transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-700"
                      }`}
                    >
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal leading-relaxed mt-1 line-clamp-2">
                      {pillar.shortDesc}
                    </p>
                  </div>

                  {/* Chevron Right */}
                  <div
                    className={`mt-3 transition-transform ${
                      isActive ? "text-[#3D3F96] translate-x-1" : "text-slate-300"
                    }`}
                  >
                    <ChevronRight size={18} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: Holographic Clinical Protocol Card */}
        <div className="lg:col-span-6 flex">
          <motion.div 
            layout
            className="w-full rounded-3xl bg-gradient-to-br from-slate-900 via-[#1E204A] to-[#12132E] text-white p-7 sm:p-10 border border-slate-700/50 shadow-2xl flex flex-col justify-between relative overflow-hidden"
          >
            {/* Ambient inner card glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#3D3F96]/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Dynamic Content animated with AnimatePresence */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6 relative z-10"
              >
                {/* Protocol Top Bar */}
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-black uppercase tracking-wider text-indigo-200">
                      Live Protocol Architecture
                    </span>
                  </div>
                  
                  <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-slate-200 border border-white/10">
                    {activeTab.previewData.badge}
                  </span>
                </div>

                {/* Main Heading for Active Plan */}
                <div className="space-y-2">
                  <h4 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
                    {activeTab.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {activeTab.shortDesc}
                  </p>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-3 py-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Clinical Standards Applied:
                  </span>
                  <div className="space-y-2.5">
                    {activeTab.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                        <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Diagnostic Metrics Box */}
                <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Clinical Accuracy</div>
                    <div className="text-xl font-black text-emerald-400">{activeTab.previewData.score}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Glycemic Stability</div>
                    <div className="text-xl font-black text-indigo-300">{activeTab.previewData.glycemicLoad}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Bottom Card Action: Navigate to /food/programs */}
            <div className="pt-6 border-t border-white/10 mt-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck size={16} className="text-[#8789db]" />
                <span>Doctor Monitored & Approved</span>
              </div>

              <button
                type="button"
                onClick={() => handleNavigateToPrograms(activeTab.id)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-black text-xs sm:text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-black/30 group"
              >
                <span>View Matching Programs</span>
                <ArrowRight size={15} className="text-[#3D3F96] group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </motion.div>
        </div>

      </div>

      {/* Global Interactive Bottom Banner for /food/programs */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-slate-100 via-white to-indigo-50/60 border border-slate-200/90 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8"
      >
        <div className="flex items-start gap-4 sm:gap-5 text-left">
          <div className="w-14 h-14 rounded-2xl bg-[#3D3F96] text-white flex items-center justify-center shrink-0 shadow-lg shadow-[#3D3F96]/20">
            <Stethoscope size={28} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-[#3D3F96]">
                Personalized Assessment
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                Takes 2 Mins
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Ready to find the exact health plan built for your body?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Explore all clinical programs curated for Diabetes, Heart Health, Longevity, and High-Protein Nutrition.
            </p>
          </div>
        </div>

        {/* CTA Button using Next.js Link */}
        <Link
          href="/food/programs"
          className="shrink-0 w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#32347c] text-white font-black text-sm sm:text-base shadow-xl shadow-[#3D3F96]/20 transition-all transform hover:-translate-y-0.5 group"
        >
          <span>Explore All Food Programs</span>
          <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </motion.div>

    </section>
  );
}