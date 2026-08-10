"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShieldCheck,
    Smartphone,
    Cpu,
    Waves,
    ArrowRight
} from 'lucide-react';

const Hero = () => {
    const [currentBg, setCurrentBg] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const bgImages = [
        "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=1920&auto=format&fit=crop",
        "https://media.post.rvohealth.io/wp-content/uploads/2025/05/4275804-Best-Glucose-Meters-header_1296x728.jpg",
        "https://plus.unsplash.com/premium_photo-1743278352775-250218de8473?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBg((prev) => (prev + 1) % bgImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="relative w-full min-h-[85vh] flex items-center overflow-hidden bg-white pt-12 pb-12">

            {/* --- 1. FULL SCREEN BACKGROUND SLIDER --- */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentBg}
                        src={bgImages[currentBg]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }} // Subtle visibility for professional light theme
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
            </div>

            {/* --- 2. CONTENT LAYER --- */}
            <div className="max-w-[1536px] mx-auto px-6 lg:px-12 w-full z-10 relative">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    <div className="lg:col-span-8 xl:col-span-7 space-y-10">

                        {/* Tech Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 bg-[#3d3f96]/10 border border-[#3d3f96]/20 px-4 py-2 rounded-full shadow-sm"
                        >
                            <Cpu size={14} className="text-[#3d3f96] animate-pulse" />
                            <span className="text-[10px] font-black text-[#3d3f96] uppercase tracking-[0.3em]">
                                Proprietary Biosensor Technology
                            </span>
                        </motion.div>

                        {/* Professional Headline */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.05] tracking-tighter">
                                The Future of <br />
                                <span className="text-white bg-[#3d3f96] px-5 py-1 rounded-2xl inline-block mt-2 shadow-xl shadow-indigo-100">
                                    Sugar Tracking.
                                </span>
                            </h1>
                            <p className="text-lg md:text-xl text-slate-600 font-medium max-w-2xl leading-relaxed">
                                Meet the <span className="text-[#3d3f96] font-bold">DiabetesWala Pro CGM</span>. A painless, 24/7 continuous monitoring system that syncs directly with your smartphone for real-time metabolic insights.
                            </p>
                        </motion.div>

                        {/* --- SEARCH BAR --- */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="relative max-w-2xl group"
                        >
                            <div className="absolute inset-0 bg-[#3d3f96]/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                            <div className="relative flex items-center bg-white rounded-[2rem] p-2 shadow-2xl border border-slate-200 group-focus-within:border-[#3d3f96] transition-all">
                                <div className="pl-6 pr-4 text-slate-400">
                                    <Search size={24} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search CGM, Sensors, or Medicines..."
                                    className="w-full bg-transparent outline-none text-slate-700 font-bold text-sm md:text-lg py-4"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-10 py-4 rounded-[1.5rem] font-black text-sm transition-all hidden md:flex items-center gap-2 shadow-lg active:scale-95">
                                    SEARCH <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>

                        {/* Trust Strip */}
                        <div className="pt-8 flex flex-wrap gap-8 border-t border-slate-100">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <ShieldCheck size={16} className="text-emerald-500" /> FDA & CE Approved
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Smartphone size={16} className="text-blue-500" /> Real-time App Sync
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <Waves size={16} className="text-cyan-500" /> IP67 Waterproof
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;