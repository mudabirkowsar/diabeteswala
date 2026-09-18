"use client";

import React, { useState } from 'react';
import { Sparkles, Utensils, Check } from 'lucide-react';

const INGREDIENTS_DATA = [
  {
    id: 1,
    title: "Herb-Grilled Protein",
    subtitle: "Tender Farm Chicken Breast, Thyme, Rosemary, Garlic Crust",
    pinPosition: { top: "72%", left: "42%" }
  },
  {
    id: 2,
    title: "Salsa Verde & Herb Glaze",
    subtitle: "Tomatillo, Green Chili, Fresh Cilantro, Lime Juice, Sweet Onion",
    pinPosition: { top: "64%", left: "62%" }
  },
  {
    id: 3,
    title: "Black Bean & Mango Medley",
    subtitle: "Organic Black Beans, Sweet Diced Mango, Red Bell Pepper, Crisp Onion",
    pinPosition: { top: "54%", left: "28%" }
  },
  {
    id: 4,
    title: "Citrus Herb Vinaigrette",
    subtitle: "Fresh Lime Juice, Apple Cider Vinegar, Cold-Pressed Olive Oil, Sea Salt",
    pinPosition: { top: "48%", left: "64%" }
  },
  {
    id: 5,
    title: "Artisanal Grains & Toppings",
    subtitle: "Whole Grain Wrap, Monterey Jack Cheese, Roasted Pumpkin Seeds",
    pinPosition: { top: "34%", left: "54%" }
  }
];

export default function VarietyShowcase() {
  const [activeItem, setActiveItem] = useState(2);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-slate-800 select-none">
      
      {/* Top Header Section */}
      <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
        
        {/* Accent Title with decorative side lines */}
        <div className="flex items-center justify-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-[#3D3F96]/30 to-[#3D3F96]/60 w-16 sm:w-28" />
          <h3 className="text-sm sm:text-base font-extrabold uppercase tracking-widest text-[#3D3F96]">
            The Time You Save & The Variety You Crave
          </h3>
          <div className="h-px bg-gradient-to-l from-transparent via-[#3D3F96]/30 to-[#3D3F96]/60 w-16 sm:w-28" />
        </div>

        {/* Main Title */}
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Say goodbye to boring, repetitive meals.
        </h2>

        {/* Descriptive Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
          When meal prepping on your own, you’re often limited by time and pantry items, leading to repetitive meals for the week. With our clinical chef-crafted recipes, you can enjoy a wide variety of dietitian-approved meals every single day and never eat the same dish twice!
        </p>
      </div>

      {/* Main Interactive Presentation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        {/* LEFT COLUMN: Food Plate with Numbered Hotspot Pins */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="relative w-full max-w-[480px] aspect-square rounded-full p-3 sm:p-5 bg-gradient-to-b from-white to-slate-100/80 shadow-2xl border border-slate-200/80 flex items-center justify-center">
            
            {/* Outer Plate Glow & Ring */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-inner border-4 border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800"
                alt="Nutritional Chef Plate"
                className="w-full h-full object-cover select-none"
              />
              
              {/* Subtle Plate Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-slate-900/10 via-transparent to-black/10 pointer-events-none" />
            </div>

            {/* Interactive Pins Over the Plate */}
            {INGREDIENTS_DATA.map((item) => {
              const isActive = activeItem === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => setActiveItem(item.id)}
                  style={{ top: item.pinPosition.top, left: item.pinPosition.left }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 z-20 cursor-pointer focus:outline-none ${
                    isActive ? "scale-115" : "scale-100 hover:scale-110"
                  }`}
                  aria-label={`View ingredient ${item.title}`}
                >
                  {/* Pulse Ring when Active */}
                  {isActive && (
                    <span className="absolute -inset-2 rounded-xl bg-[#3D3F96]/30 animate-ping" />
                  )}

                  {/* Pin Box */}
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black text-sm sm:text-base shadow-lg transition-all border ${
                      isActive
                        ? "bg-[#3D3F96] text-white border-white ring-4 ring-[#3D3F96]/20 shadow-indigo-950/30"
                        : "bg-white/95 text-slate-700 border-slate-200/90 hover:bg-white"
                    }`}
                  >
                    {item.id}
                  </div>
                </button>
              );
            })}

          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Ingredient Breakdown List */}
        <div className="lg:col-span-6 space-y-6 text-left">
          
          {/* Highlight Stat Header */}
          <div className="space-y-1 border-b border-slate-200/80 pb-4">
            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#3D3F96]" /> One freshly curated dish is crafted with
            </span>
            <div className="flex items-baseline gap-2">
              <h4 className="text-3xl sm:text-4xl font-black text-[#3D3F96] tracking-tight">
                17+ Ingredients
              </h4>
              <span className="text-xs font-bold text-slate-500">
                that you don't have to shop for!
              </span>
            </div>
          </div>

          {/* Numbered Category List */}
          <div className="space-y-3">
            {INGREDIENTS_DATA.map((item) => {
              const isActive = activeItem === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveItem(item.id)}
                  onMouseEnter={() => setActiveItem(item.id)}
                  className={`group rounded-2xl p-4 sm:p-5 border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    isActive
                      ? "bg-white border-[#3D3F96] shadow-lg shadow-indigo-950/10 translate-x-1"
                      : "bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Large Number Tag */}
                  <span
                    className={`font-black text-2xl sm:text-3xl font-mono leading-none transition-colors ${
                      isActive ? "text-[#3D3F96]" : "text-slate-300 group-hover:text-slate-400"
                    }`}
                  >
                    {item.id}
                  </span>

                  {/* Title & Ingredients details */}
                  <div className="space-y-1 flex-1 min-w-0">
                    <h5
                      className={`text-sm sm:text-base font-extrabold transition-colors ${
                        isActive ? "text-slate-900" : "text-slate-700 group-hover:text-slate-900"
                      }`}
                    >
                      {item.title}
                    </h5>
                    
                    <p
                      className={`text-xs leading-relaxed transition-colors ${
                        isActive ? "text-slate-600 font-medium" : "text-slate-400 font-normal"
                      }`}
                    >
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Active Indicator Accent */}
                  {isActive && (
                    <div className="w-2 h-2 rounded-full bg-[#3D3F96] mt-2 shrink-0 animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </section>
  );
}