"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Activity,
    Smartphone,
    ShieldCheck,
    ArrowRight,
    Sparkles,
    CheckCircle2,
    Award,
    Download,
    BellRing,
    LineChart,
    Apple
} from 'lucide-react';

export default function PromoteCGM() {
    return (
        <section className="py-12 sm:py-16 lg:py-20 bg-slate-50/60 text-slate-800 text-left antialiased overflow-hidden select-none">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">

                {/* --- HERO BANNER & VALUE PROP --- */}
                <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#161843] via-[#242761] to-[#333680] text-white p-6 sm:p-10 lg:p-14 overflow-hidden shadow-2xl shadow-indigo-950/20 border border-white/10">

                    {/* Background Ambient Glows */}
                    <div className="absolute -right-20 -top-20 w-96 h-96 bg-red-500/20 rounded-full blur-[120px] pointer-events-none" />
                    <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-64 h-64 bg-rose-500/10 rounded-full blur-[90px] pointer-events-none" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                        {/* Left Column: Headlines & Benefits */}
                        <div className="lg:col-span-7 space-y-6">

                            {/* Top Pill Badges */}
                            <div className="inline-flex flex-wrap items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/15 shadow-sm">
                                <div className="flex items-center gap-1.5">
                                    <Sparkles size={14} className="text-amber-300 animate-pulse" />
                                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-200">
                                        Next-Gen Glucose Intelligence
                                    </span>
                                </div>
                                <span className="text-white/30 hidden sm:inline">•</span>
                                <span className="text-[11px] font-semibold text-white/90 flex items-center gap-1">
                                    <Award size={13} className="text-emerald-400" /> CDSCO Lab-Grade Certified
                                </span>
                            </div>

                            {/* Headline */}
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12]">
                                Track Blood Sugar <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-300 to-amber-300">
                                    In Real-Time, 24/7.
                                </span>
                            </h2>

                            <p className="text-sm sm:text-base text-slate-200/90 font-normal max-w-xl leading-relaxed">
                                Experience needle-free continuous monitoring with CGM biosensors and smartphone-connected smart glucometers. Get instant AI insights, auto-cloud syncing, and free expert diabetologist guidance.
                            </p>

                            {/* Key Highlights Pill Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
                                    <div className="p-2 bg-red-500/20 rounded-xl text-red-400 shrink-0">
                                        <Activity size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">CGM Sensors</span>
                                        <strong className="text-xs font-black text-white">14-Day Wear</strong>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-300 shrink-0">
                                        <Smartphone size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">Smartphone Port</span>
                                        <strong className="text-xs font-black text-white">Auto Cloud Sync</strong>
                                    </div>
                                </div>

                                <div className="p-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-3 col-span-2 sm:col-span-1">
                                    <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 shrink-0">
                                        <ShieldCheck size={20} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">NIB Tested</span>
                                        <strong className="text-xs font-black text-white">CV &lt; 2% Precision</strong>
                                    </div>
                                </div>
                            </div>

                            {/* Main CTA & Social Proof */}
                            <div className="flex flex-col sm:flex-row sm:items-center gap-5 pt-4">
                                <Link href="/shop/cgmdevices" className="w-full sm:w-auto">
                                    <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-red-500 via-rose-600 to-red-600 hover:from-red-600 hover:to-rose-700 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-red-600/30 transition-all duration-200 flex items-center justify-center gap-3 group active:scale-[0.98] cursor-pointer">
                                        <span>Explore CGM Devices</span>
                                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>

                                <div className="flex items-center gap-3 px-2">
                                    <div className="flex -space-x-2.5 overflow-hidden">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-rose-400 border-2 border-[#161843] flex items-center justify-center text-[10px] font-black text-white shadow-md">
                                            8L+
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-[#161843] flex items-center justify-center text-xs text-slate-900 font-bold shadow-md">
                                            ★
                                        </div>
                                    </div>
                                    <div className="text-left">
                                        <span className="text-xs font-bold text-white block leading-tight">
                                            Trusted by 8 Lakh+
                                        </span>
                                        <span className="text-[11px] text-slate-300 font-medium">Diabetic Warriors</span>
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Right Column: Application Showcase Banner */}
                        <div className="lg:col-span-5">
                            <div className="relative bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 p-6 sm:p-7 shadow-2xl overflow-hidden group">

                                {/* Background Highlight */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

                                {/* Header Badges */}
                                <div className="flex items-center justify-between gap-2 mb-4 z-10 relative">
                                    <span className="text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                        <Smartphone size={13} /> Mobile Companion App
                                    </span>
                                    <span className="text-xs font-black text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-lg border border-emerald-400/20">
                                        Free Sync Included
                                    </span>
                                </div>

                                {/* App Preview Image Banner */}
                                <div className="relative h-52 sm:h-56 rounded-2xl bg-gradient-to-b from-slate-900/50 to-indigo-950/80 border border-white/10 overflow-hidden flex items-center justify-center p-3">
                                    <Image
                                        src="/cgmdevice.png"
                                        alt="Health Mobile Application Companion"
                                        fill
                                        priority
                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-500 ease-out"
                                    />

                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white z-10">
                                        <div>
                                            <span className="text-xs font-bold drop-shadow-md text-slate-100 block">
                                                Glucose Tracker App
                                            </span>
                                            <span className="text-[10px] text-slate-300 font-medium">iOS & Android Compatible</span>
                                        </div>
                                        <span className="text-[10px] font-black uppercase bg-indigo-500/90 backdrop-blur-md px-2.5 py-1 rounded-md text-white shadow-sm flex items-center gap-1">
                                            <BellRing size={11} /> Real-Time AI
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile App Key Features */}
                                <div className="space-y-2.5 my-5 text-xs font-semibold text-slate-200">
                                    <div className="flex items-center gap-2.5">
                                        <LineChart size={15} className="text-indigo-400 shrink-0" />
                                        <span>Instant graph trends &amp; spike predictions</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <BellRing size={15} className="text-amber-400 shrink-0" />
                                        <span>Smart high/low blood sugar alerts</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                        <span>Automated logs shared directly with your doctor</span>
                                    </div>
                                </div>

                                {/* App Store Download Section */}
                                <div className="pt-4 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-300 block uppercase tracking-wider">Get the App</span>
                                        <strong className="text-xs font-bold text-white">Sync with any CGM sensor</strong>
                                    </div>

                                    {/* App Store Buttons */}
                                    <div className="flex items-center gap-2 w-full sm:w-auto">
                                        <Link href="#" className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-all flex items-center justify-center gap-2 text-white">
                                            <Apple size={16} />
                                            <span className="text-[11px] font-bold">App Store</span>
                                        </Link>
                                        <Link href="#" className="flex-1 sm:flex-none px-3.5 py-2.5 bg-white/15 hover:bg-white/25 border border-white/20 rounded-xl transition-all flex items-center justify-center gap-2 text-white">
                                            <Download size={15} />
                                            <span className="text-[11px] font-bold">Google Play</span>
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}