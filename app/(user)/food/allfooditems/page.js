"use client";

import React, { useState } from 'react';
import { Sparkles, Utensils, Calendar, ChefHat, HeartPulse, Flame } from 'lucide-react';

// Import components from the ./components folder
import AllFood from './components/AllFood';
import Weekly from './components/Weekly';
import AllTiffins from './components/AllTiffins';

export default function FoodPage() {
  // Active Tab State: 'discovery' | 'weekly' | 'tiffins'
  const [activeTab, setActiveTab] = useState('discovery');

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">
      
      {/* --- HERO & CLINICAL TOP DISCOVERY HEADER --- */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
        
        <div className="space-y-3.5 z-10 max-w-2xl text-left">
          {/* Clinical Live Badge with Red Accent */}
          <div className="inline-flex items-center gap-2 bg-red-50/80 border border-red-200/60 text-red-600 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full shadow-xs backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <HeartPulse size={13} className="text-red-500" />
            <span>Clinical Nutrition &amp; Tiffin Hub</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Nutritious Chef Meals &amp; <span className="text-red-500">Clinical Tiffins</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed max-w-xl">
            Personalized calorie-counted meal plans, 7-day cyclical menus, and subscription tiffins formulated by certified clinical dietitians.
          </p>
        </div>

        {/* --- ENHANCED DYNAMIC NAVTAB SWITCHER --- */}
        <div className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200/70 self-start lg:self-auto shrink-0 z-10 shadow-inner gap-1.5 flex-wrap sm:flex-nowrap">
          
          {/* Tab 1: Daily Specials */}
          <button
            type="button"
            onClick={() => setActiveTab('discovery')}
            className={`flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'discovery'
                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Utensils size={15} className={activeTab === 'discovery' ? 'text-red-400' : 'text-slate-500'} />
            <span>Daily Specials</span>
            {activeTab === 'discovery' && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            )}
          </button>

          {/* Tab 2: Weekly Planner */}
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'weekly'
                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Calendar size={15} className={activeTab === 'weekly' ? 'text-amber-400' : 'text-slate-500'} />
            <span>Weekly Planner</span>
            {activeTab === 'weekly' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Tab 3: All Tiffins (Subscription Plans) */}
          <button
            type="button"
            onClick={() => setActiveTab('tiffins')}
            className={`flex items-center gap-2 px-4.5 py-2.5 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 cursor-pointer whitespace-nowrap ${
              activeTab === 'tiffins'
                ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <ChefHat size={15} className={activeTab === 'tiffins' ? 'text-red-400' : 'text-slate-500'} />
            <span>All Tiffins</span>
            <span
              className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider transition-colors ${
                activeTab === 'tiffins'
                  ? 'bg-red-500 text-white shadow-xs'
                  : 'bg-red-50 text-red-600 border border-red-200/60'
              }`}
            >
              Plans
            </span>
          </button>

        </div>

        {/* Decorative ambient background glows */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -top-16 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* --- DYNAMIC TAB VIEW WITH SMOOTH TRANSITION --- */}
      <div className="w-full transition-all duration-300">
        {activeTab === 'discovery' && <AllFood />}
        {activeTab === 'weekly' && <Weekly />}
        {activeTab === 'tiffins' && <AllTiffins />}
      </div>

    </div>
  );
}