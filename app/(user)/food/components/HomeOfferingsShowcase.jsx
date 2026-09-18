"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Salad, 
  CalendarRange, 
  BadgePercent, 
  HeartPulse, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Flame,
  Layers
} from 'lucide-react';

const OFFERINGS = [
  {
    id: "meals",
    title: "Clinical Healthy Dishes",
    tagline: "Single Chef-Crafted Meals",
    description: "Low-GI, diabetes-friendly, keto & high-protein portioned meals with full ingredient breakdown.",
    badge: "150+ Dishes",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    icon: Salad,
    link: "/food/nearest",
    buttonText: "Explore Dishes"
  },
  {
    id: "plans",
    title: "Multi-Day Diet Plans",
    tagline: "5-Day to 14-Day Formulations",
    description: "Personalized breakfast, lunch & dinner day-wise schedules curated for PCOS, weight loss & heart care.",
    badge: "Targeted Programs",
    badgeColor: "bg-[#3D3F96]/10 text-[#3D3F96] border-[#3D3F96]/20",
    icon: CalendarRange,
    link: "/food/plans",
    buttonText: "View Diet Plans"
  },
  {
    id: "combos",
    title: "Value Combo Bundles",
    tagline: "Paired Savings Offers",
    description: "Curated multi-item bowls, salads & cold-pressed sides bundled at instant discount prices.",
    badge: "Save up to 35%",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    icon: BadgePercent,
    link: "/food/combos",
    buttonText: "Browse Combos"
  },
  {
    id: "nutrition",
    title: "100% Audited Sourcing",
    tagline: "Clinical Precision",
    description: "Real-time calorie summation, FSSAI-audited kitchens, zero refined sugar and cold-pressed oils.",
    badge: "Doctor Approved",
    badgeColor: "bg-rose-50 text-rose-700 border-rose-100",
    icon: HeartPulse,
    link: "/about",
    buttonText: "Our Standards"
  }
];

export default function HomeOfferingsShowcase() {
  return (
    <section className="py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto select-none text-left">
      
      {/* Outer Card Container */}
      <div className="bg-gradient-to-br from-slate-900 via-[#1e204c] to-[#3D3F96] rounded-[2rem] p-6 sm:p-8 lg:p-10 shadow-xl text-white relative overflow-hidden">
        
        {/* Subtle Background Glow Circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Compact Header Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b border-white/10 gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-indigo-200 mb-2 border border-white/10">
              <Sparkles size={12} className="text-amber-300" />
              Complete Nutrition Ecosystem
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Targeted Food Solutions Made Simple
            </h2>
          </div>

          <p className="text-xs text-slate-300 font-medium max-w-md leading-relaxed">
            From single therapeutic meals to doctor-approved 14-day diet programs, discover food formulated to transform your health.
          </p>
        </div>

        {/* 4 Compact Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {OFFERINGS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 text-slate-800 flex flex-col justify-between shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 border border-slate-100 group"
              >
                <div>
                  {/* Top Row: Icon & Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/15 group-hover:bg-[#3D3F96] group-hover:text-white transition-colors duration-200 shrink-0">
                      <Icon size={20} strokeWidth={2.2} />
                    </div>

                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  {/* Title & Tagline */}
                  <h3 className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-snug group-hover:text-[#3D3F96] transition-colors">
                    {item.title}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase text-[#3D3F96] tracking-wider block mb-2 mt-0.5">
                    {item.tagline}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                {/* Bottom CTA Link */}
                <div className="pt-4 mt-3 border-t border-slate-100">
                  <Link
                    href={item.link}
                    className="inline-flex items-center gap-1.5 text-xs font-black text-[#3D3F96] group-hover:text-[#2d2f75] tracking-wide uppercase transition-colors"
                  >
                    <span>{item.buttonText}</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Trust Strip */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 font-semibold gap-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>FSSAI Certified Cloud Kitchens</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame size={14} className="text-amber-400" />
            <span>Live Calorie & Macro Tracking</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers size={14} className="text-indigo-300" />
            <span>Dietitian & Clinical Protocols</span>
          </div>
        </div>

      </div>

    </section>
  );
}