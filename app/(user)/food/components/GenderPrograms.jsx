'use client';

import React from 'react';
import Link from 'next/link';
import {
    Stethoscope,
    ShieldCheck,
    TrendingDown,
    Flame,
    Dna,
    HeartPulse,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Scale,
    Apple
} from 'lucide-react';

const CATEGORIES = [
    {
        id: 'women',
        title: "Women's Health & Weight Loss",
        subtitle: "Doctor-engineered to regulate blood sugar, balance cortisol & estrogen, and trigger steady fat loss without restrictive hunger.",
        href: '/food/programs',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
        badge: "Female Metabolic Biology",
        badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
        accentBorder: "group-hover:border-rose-300 group-hover:shadow-rose-100/50",
        ctaBtn: "bg-slate-900 group-hover:bg-rose-600 text-white",
        primaryGoal: {
            title: "Targeted Clinical Weight Loss",
            badge: "Avg. 1.5 - 2 lbs / week",
            icon: TrendingDown,
            color: "text-emerald-700 bg-emerald-50 border-emerald-200"
        },
        specialties: [
            "Hormonal & Insulin Reset",
            "PCOS & Thyroid-Friendly Options",
            "Anti-Inflammatory Gut Healing",
            "Lean Muscle Tone & Bone Density"
        ],
        clinicalSpecs: [
            { icon: Scale, label: "Caloric Blueprints", value: "1,200 – 1,500 kcal" },
            { icon: Stethoscope, label: "MD & RDN Approved", value: "100% Whole Food" }
        ]
    },
    {
        id: 'men',
        title: "Men's Vitality & Fat Loss",
        subtitle: "Formulated by clinical dietitians to accelerate visceral fat reduction, protect testosterone, and preserve lean muscle mass.",
        href: '/food/programs',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
        badge: "Male Metabolic Biology",
        badgeStyle: "bg-indigo-50 text-[#3d3f96] border-indigo-200",
        accentBorder: "group-hover:border-indigo-300 group-hover:shadow-indigo-100/50",
        ctaBtn: "bg-slate-900 group-hover:bg-[#3d3f96] text-white",
        primaryGoal: {
            title: "Visceral Fat & Calorie Deficit",
            badge: "High Satiety • Zero Energy Crashes",
            icon: Flame,
            color: "text-amber-700 bg-amber-50 border-amber-200"
        },
        specialties: [
            "Hypertrophy & High Bio-Protein (40g+)",
            "Cardiovascular Lipid Management",
            "Endothelial Health & Stamina",
            "Zinc, Magnesium & Micronutrient Dense"
        ],
        clinicalSpecs: [
            { icon: Scale, label: "Caloric Blueprints", value: "1,600 – 2,000 kcal" },
            { icon: Stethoscope, label: "MD & RDN Approved", value: "100% Whole Food" }
        ]
    }
];

export default function ClinicalProgramGateway() {
    return (
        <section className="py-20 bg-[#FBFDFB] relative overflow-hidden">
            {/* Background Medical Gradient Auras */}
            <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">

                {/* Section Hero Header */}
                <div className="max-w-3xl mx-auto text-center mb-14">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs mb-3.5">
                        <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                        Physician & Registered Dietitian Formulated
                    </div>
                    
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                        Doctor-Designed Nutrition for <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-[#3d3f96]">
                            Sustainable Weight Loss & Health
                        </span>
                    </h2>
                    
                    <p className="mt-3.5 text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
                        Every meal plan is clinically calibrated to stabilize blood glucose, regulate hunger hormones, and deliver real metabolic transformation. Choose your path below.
                    </p>

                    {/* Trust Indicators Pill Bar */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Evidence-Based Protocols
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            Zero Refined Sugars & Low Sodium
                        </span>
                        <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            1-on-1 Dietitian Coaching Included
                        </span>
                    </div>
                </div>

                {/* 2 High-Converting Program Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {CATEGORIES.map((cat) => {
                        const GoalIcon = cat.primaryGoal.icon;

                        return (
                            <Link
                                key={cat.id}
                                href={cat.href}
                                className={`group flex flex-col bg-white rounded-3xl border-2 border-slate-200/80 overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${cat.accentBorder}`}
                            >
                                {/* Visual Card Header */}
                                <div className="relative h-52 sm:h-56 w-full overflow-hidden bg-slate-900">
                                    <img
                                        src={cat.image}
                                        alt={cat.title}
                                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                                    />
                                    
                                    {/* Gradient Vignette for strong text contrast */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

                                    {/* Top Clinical Badges */}
                                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                        <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full backdrop-blur-md border shadow-sm ${cat.badgeStyle}`}>
                                            {cat.badge}
                                        </span>
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                            Doctor Curated
                                        </span>
                                    </div>

                                    {/* Card Header Title */}
                                    <div className="absolute bottom-4 left-5 right-5">
                                        <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                            {cat.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                                    
                                    {/* Subtitle / Promise */}
                                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                                        {cat.subtitle}
                                    </p>

                                    {/* Highlighted Primary Weight Loss / Goal Box */}
                                    <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${cat.primaryGoal.color}`}>
                                        <div className="flex items-center gap-2.5">
                                            <div className="p-2 rounded-xl bg-white shadow-xs">
                                                <GoalIcon className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-extrabold tracking-tight">
                                                    {cat.primaryGoal.title}
                                                </p>
                                                <p className="text-[11px] font-medium opacity-90">
                                                    {cat.primaryGoal.badge}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-[10px] font-extrabold uppercase px-2 py-1 bg-white/80 rounded-md border border-black/5">
                                            Active Protocol
                                        </span>
                                    </div>

                                    {/* What's Included: Doctor-Formulated Specialties */}
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                            Specialized Plans In This Track:
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {cat.specialties.map((item, idx) => (
                                                <div 
                                                    key={idx}
                                                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-50/80 p-2 rounded-xl border border-slate-100"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 stroke-[2.5]" />
                                                    <span className="truncate">{item}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Macro / Caloric Specifications */}
                                    <div className="pt-2 grid grid-cols-2 gap-3">
                                        {cat.clinicalSpecs.map((spec, i) => {
                                            const IconComp = spec.icon;
                                            return (
                                                <div key={i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
                                                    <IconComp className="w-4 h-4 text-[#3d3f96] shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] uppercase font-bold text-slate-400 truncate">{spec.label}</p>
                                                        <p className="text-xs font-black text-slate-800 truncate">{spec.value}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Prominent High-Conversion Action Button */}
                                    <div className="pt-2">
                                        <div className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-300 ${cat.ctaBtn}`}>
                                            <span>Explore All {cat.id === 'women' ? "Women's" : "Men's"} Health Plans</span>
                                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                                        </div>
                                    </div>

                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Bottom Clinical Quality Seal */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs text-xs font-bold text-slate-600">
                        <Apple className="w-4 h-4 text-emerald-600" />
                        <span>Freshly Prepared & Delivered Chilled • No Frozen Shortcuts • Cancel Anytime</span>
                    </div>
                </div>

            </div>
        </section>
    );
}