"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  Activity,
  Droplets,
  ShieldCheck,
  Zap,
  Brain,
  Eye,
  Wind,
  Bone,
  Stethoscope,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldPlus
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';

// 1. Strict Whitelist of Anatomical Body Organs
const VALID_ANATOMICAL_PARTS = [
  "heart",
  "kidney",
  "liver",
  "brain",
  "lungs",
  "lung",
  "thyroid",
  "pancreas",
  "bone",
  "joint",
  "stomach",
  "eyes",
  "eye",
  "bladder",
  "prostate",
  "intestine"
];

// 2. Blacklist to prevent non-body-parts from showing up
const EXCLUDED_KEYWORDS = [
  "full body",
  "allergy",
  "fever",
  "infection",
  "package",
  "checkup",
  "profile",
  "routine",
  "general",
  "cancer",
  "diabetes",
  "anemia",
  "vitamins",
  "pathology",
  "microbiology"
];

// 3. Clinical Metadata & Color Theming strictly mapped to organs
const BODY_PART_META = {
  heart: {
    desc: "Cardiovascular Screen",
    testsInfo: "Lipid, ECG, Troponin",
    icon: <HeartPulse className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    iconBg: "bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white",
    borderColor: "group-hover:border-rose-300",
    glowColor: "group-hover:shadow-rose-500/10"
  },
  kidney: {
    desc: "Renal & Electrolytes",
    testsInfo: "KFT, Creatinine, Urea",
    icon: <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    iconBg: "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
    borderColor: "group-hover:border-emerald-300",
    glowColor: "group-hover:shadow-emerald-500/10"
  },
  liver: {
    desc: "Hepatic & Bilirubin",
    testsInfo: "LFT, SGOT, SGPT",
    icon: <Activity className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    iconBg: "bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
    borderColor: "group-hover:border-amber-300",
    glowColor: "group-hover:shadow-amber-500/10"
  },
  brain: {
    desc: "Neurological & Cognition",
    testsInfo: "Nerve & Mental Vitals",
    icon: <Brain className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
    iconBg: "bg-indigo-500/10 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white",
    borderColor: "group-hover:border-indigo-300",
    glowColor: "group-hover:shadow-indigo-500/10"
  },
  lungs: {
    desc: "Pulmonary & Respiratory",
    testsInfo: "Spirometry, Oxygenation",
    icon: <Wind className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
    borderColor: "group-hover:border-cyan-300",
    glowColor: "group-hover:shadow-cyan-500/10"
  },
  lung: {
    desc: "Pulmonary & Respiratory",
    testsInfo: "Spirometry, Oxygenation",
    icon: <Wind className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-cyan-500/10 via-cyan-500/5 to-transparent",
    iconBg: "bg-cyan-500/10 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white",
    borderColor: "group-hover:border-cyan-300",
    glowColor: "group-hover:shadow-cyan-500/10"
  },
  thyroid: {
    desc: "Endocrine & Hormones",
    testsInfo: "T3, T4, Ultra TSH",
    icon: <Zap className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    iconBg: "bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    borderColor: "group-hover:border-purple-300",
    glowColor: "group-hover:shadow-purple-500/10"
  },
  bone: {
    desc: "Skeletal & Mineral",
    testsInfo: "Calcium, Vitamin D3",
    icon: <Bone className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-slate-500/10 via-slate-500/5 to-transparent",
    iconBg: "bg-slate-500/10 text-slate-700 group-hover:bg-slate-800 group-hover:text-white",
    borderColor: "group-hover:border-slate-400",
    glowColor: "group-hover:shadow-slate-500/10"
  },
  joint: {
    desc: "Mobility & Cartilage",
    testsInfo: "Uric Acid, RA Factor",
    icon: <Bone className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-orange-500/10 via-orange-500/5 to-transparent",
    iconBg: "bg-orange-500/10 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
    borderColor: "group-hover:border-orange-300",
    glowColor: "group-hover:shadow-orange-500/10"
  },
  pancreas: {
    desc: "Enzymes & Glucose",
    testsInfo: "Amylase, Lipase, Sugar",
    icon: <Droplets className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    iconBg: "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    borderColor: "group-hover:border-blue-300",
    glowColor: "group-hover:shadow-blue-500/10"
  },
  stomach: {
    desc: "Gastrointestinal Care",
    testsInfo: "H. Pylori, Gastric Profile",
    icon: <Stethoscope className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-pink-500/10 via-pink-500/5 to-transparent",
    iconBg: "bg-pink-500/10 text-pink-600 group-hover:bg-pink-600 group-hover:text-white",
    borderColor: "group-hover:border-pink-300",
    glowColor: "group-hover:shadow-pink-500/10"
  },
  eyes: {
    desc: "Ocular & Vision",
    testsInfo: "Retinal Screening",
    icon: <Eye className="w-6 h-6 sm:w-7 sm:h-7" />,
    gradient: "from-teal-500/10 via-teal-500/5 to-transparent",
    iconBg: "bg-teal-500/10 text-teal-600 group-hover:bg-teal-600 group-hover:text-white",
    borderColor: "group-hover:border-teal-300",
    glowColor: "group-hover:shadow-teal-500/10"
  }
};

const STRICT_FALLBACK_BODY_PARTS = [
  "Heart",
  "Kidney",
  "Liver",
  "Brain",
  "Lungs",
  "Thyroid",
  "Bone",
  "Pancreas"
];

const FindTestByOrgan = () => {
  const [rawBodyParts, setRawBodyParts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        setLoading(true);
        const res = await UserAPI.getTestByBodyPart();

        if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
          setRawBodyParts(res.data);
        } else {
          setRawBodyParts(STRICT_FALLBACK_BODY_PARTS);
        }
      } catch (err) {
        console.error("Error fetching body parts:", err);
        setRawBodyParts(STRICT_FALLBACK_BODY_PARTS);
      } finally {
        setLoading(false);
      }
    };

    fetchBodyParts();
  }, []);

  // Strict Filter: Ensure ONLY anatomical body organs pass
  const bodyParts = useMemo(() => {
    return rawBodyParts.filter((item) => {
      if (!item || typeof item !== "string") return false;
      const normalized = item.toLowerCase().trim();

      const isExcluded = EXCLUDED_KEYWORDS.some((kw) => normalized.includes(kw));
      if (isExcluded) return false;

      return VALID_ANATOMICAL_PARTS.some(
        (part) => normalized === part || normalized.includes(part)
      );
    });
  }, [rawBodyParts]);

  const getBodyPartConfig = (name) => {
    const key = name.toLowerCase().trim();
    if (BODY_PART_META[key]) {
      return { name, ...BODY_PART_META[key] };
    }
    return {
      name,
      desc: "Vital Organ Diagnostics",
      testsInfo: "Clinical Laboratory Panels",
      icon: <Activity className="w-6 h-6 sm:w-7 sm:h-7" />,
      gradient: "from-indigo-500/10 via-indigo-500/5 to-transparent",
      iconBg: "bg-indigo-500/10 text-indigo-600 group-hover:bg-[#3d3f96] group-hover:text-white",
      borderColor: "group-hover:border-indigo-300",
      glowColor: "group-hover:shadow-indigo-500/10"
    };
  };

  return (
    <section className="relative py-14 sm:py-20 lg:py-24 bg-gradient-to-b from-white via-slate-50/70 to-white overflow-hidden">

      {/* Decorative ambient glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-indigo-100/40 via-blue-50/30 to-rose-50/30 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">

        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 sm:mb-14">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 mb-3.5">
              <ShieldPlus className="w-3.5 h-3.5 text-[#3d3f96]" />
              <span className="text-[11px] font-bold text-[#3d3f96] tracking-wider uppercase">
                Vital Organ Screening
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Explore Lab Tests by <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3d3f96] via-indigo-600 to-blue-600">
                Body Organ
              </span>
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-slate-500 mt-2.5 font-normal leading-relaxed">
              Targeted pathology evaluations for specific biological organs. Select an organ to view calibrated diagnostic panels.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-400 pb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            100% NABL Accredited Diagnostics
          </div>
        </div>

        {/* --- ORGAN GRID --- */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-100 animate-pulse flex flex-col items-center text-center space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-100" />
                <div className="h-4 bg-slate-200 rounded w-20" />
                <div className="h-3 bg-slate-100 rounded w-28" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {bodyParts.map((partName, index) => {
              const part = getBodyPartConfig(partName);

              return (
                <Link
                  key={part.name}
                  href={`/labs/category/${encodeURIComponent(part.name)}`}
                  className="group block focus:outline-none"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.03, duration: 0.4 }}
                    className={`relative h-full bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 ${part.borderColor} transition-all duration-300 hover:shadow-xl ${part.glowColor} flex flex-col justify-between overflow-hidden`}
                  >
                    {/* Radial background tint on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-b ${part.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                    <div>
                      {/* Top Header of Card: Icon & Quick arrow */}
                      <div className="flex items-start justify-between mb-4 relative z-10">
                        <div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-md ${part.iconBg}`}
                        >
                          {part.icon}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-[#3d3f96] group-hover:border-transparent transition-all duration-200">
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </div>
                      </div>

                      {/* Organ Name */}
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#3d3f96] transition-colors relative z-10">
                        {part.name}
                      </h3>

                      {/* Clinical Specialty */}
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-500 mt-0.5 tracking-tight relative z-10">
                        {part.desc}
                      </p>

                      {/* Test indicators badge */}
                      <p className="text-[10px] text-slate-400 mt-2 font-medium truncate relative z-10">
                        Includes: <span className="text-slate-600 font-semibold">{part.testsInfo}</span>
                      </p>
                    </div>

                    {/* Bottom CTA Strip */}
                    <div className="pt-3.5 mt-3 sm:mt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-[#3d3f96] transition-colors relative z-10">
                      <span>View Tests</span>
                      <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
};

export default FindTestByOrgan;