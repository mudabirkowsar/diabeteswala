"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2,
  Filter,
  Loader2
} from 'lucide-react';

// Replace this with your actual API service import path
import UserAPI from '../../../services/UserAPI'; 

const Hero = () => {
  const [heroData, setHeroData] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = [
    "Diabetes Reversal", 
    "Nutrition & Diet", 
    "Hormonal Health", 
    "Success Stories", 
    "Medical Research"
  ];

  useEffect(() => {
    const fetchHeroContent = async () => {
      try {
        setLoading(true);
        const response = await UserAPI.getBlogsHeroContent();
        if (response && response.success === 1) {
          setHeroData(response.data);
        }
      } catch (err) {
        console.error("Error fetching blog hero content:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHeroContent();
  }, []);

  // Loading State
  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-[#f8fbff]">
        <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
      </div>
    );
  }

  // Fallback if data fails to load
  const data = heroData || {
    badgeText: "THE DIABETES KNOWLEDGE HUB",
    headlinePart1: "Your Guide to asds",
    headlinePart2: "Limitless Life.",
    subheadline: "Expert-backed articles, nutritional science, and hormonal insights.",
    trendingTopic: "The HbA1c Reversal Protocol"
  };

  return (
    <section className="relative w-full bg-[#f8fbff] overflow-hidden pt-20 pb-16 lg:pt-28 lg:pb-24">
      
      {/* --- Background Decorative Elements --- */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/grid-me.png')]" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-200/30 rounded-full blur-[100px]" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100/40 rounded-full blur-[100px]" />

      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          
          {/* Dynamic Badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-white border border-blue-100 px-4 py-2 rounded-2xl shadow-sm mb-8"
          >
            <Sparkles size={16} className="text-[#3d3f96]" />
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
              {data.badgeText}
            </span>
          </motion.div>

          {/* Dynamic Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8"
          >
            {data.headlinePart1} <br />
            <span className="text-[#3d3f96]">{data.headlinePart2}</span>
          </motion.h1>

          {/* Dynamic Sub-headline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed mb-12 max-w-2xl"
          >
            {data.subheadline}
          </motion.p>

          {/* --- SEARCH BAR --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="w-full max-w-2xl relative group mb-10"
          >
            <div className="absolute inset-0 bg-[#3d3f96]/10 blur-2xl rounded-full group-focus-within:bg-[#3d3f96]/20 transition-all" />
            <div className="relative bg-white border border-slate-200 rounded-[2rem] p-2 flex items-center shadow-xl group-focus-within:border-[#3d3f96] transition-all">
              <div className="pl-6 pr-4 text-slate-400">
                <Search size={22} />
              </div>
              <input 
                type="text" 
                placeholder="Search for recipes, reversal tips, or research..." 
                className="w-full bg-transparent outline-none text-slate-700 font-bold text-sm md:text-base py-4"
              />
              <button className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-8 py-4 rounded-[1.5rem] font-black text-sm transition-all hidden md:block">
                Search
              </button>
            </div>
          </motion.div>

          {/* --- CATEGORY CHIPS --- */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <div className="flex items-center gap-2 mr-2 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                <Filter size={14} /> Popular:
            </div>
            {categories.map((cat, i) => (
              <button 
                key={i}
                className="px-5 py-2.5 bg-white border border-slate-100 rounded-full text-xs font-bold text-slate-600 hover:border-[#3d3f96] hover:text-[#3d3f96] hover:shadow-lg hover:shadow-indigo-50 transition-all"
              >
                {cat}
              </button>
            ))}
          </motion.div>

          {/* --- TRENDING TOPIC FOOTER --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 pt-8 border-t border-slate-200/60 w-full"
          >
            <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
                    <TrendingUp size={18} />
                </div>
                <p className="text-xs font-bold text-slate-500">
                    Trending: <span className="text-slate-900 ml-1 hover:underline cursor-pointer">{data.trendingTopic}</span>
                </p>
            </div>
            <div className="flex items-center gap-3">
                <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
                    <CheckCircle2 size={18} />
                </div>
                <p className="text-xs font-bold text-slate-500 tracking-tight uppercase">
                    100% Expert Reviewed Content
                </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Hero;