'use client';

import React, { useState } from 'react';

const dailySpecials = [
  {
    slot: "Breakfast",
    time: "7:00 AM - 11:00 AM",
    name: "Multi-Grain Methi Paratha Combo",
    description: "Two whole-grain flatbreads kneaded with fresh fenugreek leaves, served with thin non-fat yogurt and mint chutney.",
    price: 130,
    discountPrice: 110,
    calories: 290,
    servingSize: "2 Rotis + 100g Curd",
    dietType: "Veg",
    netCarbs: "22g",
    glycemicIndex: 35,
    tag: "High Fiber",
    gradientClass: "from-amber-50/60 via-orange-50/10 to-transparent",
    iconColor: "text-amber-500 bg-amber-50 border-amber-100",
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80",
    features: ["Organic whole wheat base", "Hand-ground mint chutney", "Low-sodium skimmed curd"],
    iconSvg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    )
  },
  {
    slot: "Lunch",
    time: "12:00 PM - 3:30 PM",
    name: "Tender Paneer Brown Rice Bowl",
    description: "Sautéed malai paneer cubes served over a base of cooked long-grain brown rice and dietary green fibrous vegetables.",
    price: 210,
    discountPrice: 185,
    calories: 420,
    servingSize: "400g Bowl",
    dietType: "Veg",
    netCarbs: "30g",
    glycemicIndex: 45,
    tag: "Low GI",
    gradientClass: "from-sky-50/60 via-indigo-50/10 to-transparent",
    iconColor: "text-sky-500 bg-sky-50 border-sky-100",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    features: ["Organic brown basmati base", "Zero refined sugars or oils", "Fiber-packed local spinach"],
    iconSvg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
      </svg>
    )
  },
  {
    slot: "Dinner",
    time: "7:00 PM - 10:30 PM",
    name: "Sautéed Chicken Breast & Broccoli",
    description: "Lean skinless chicken breast grilled in cold-pressed olive oil, paired with lightly steamed lemon broccoli florets.",
    price: 280,
    discountPrice: 250,
    calories: 310,
    servingSize: "300g Plate",
    dietType: "Non Veg",
    netCarbs: "4g",
    glycemicIndex: 5,
    tag: "Keto",
    gradientClass: "from-indigo-50/40 via-purple-50/10 to-transparent",
    iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    features: ["High-protein lean breast", "Steamed lemon broccoli", "Heart-healthy olive oil dressing"],
    iconSvg: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    )
  }
];

export default function TodaysSpecial({ onAddToCart }) {
  const [activeSpecial, setActiveSpecial] = useState(null);

  const getDietLabelStyle = (type) => {
    switch (type) {
      case 'Veg':
        return 'bg-emerald-500 text-white';
      case 'Non Veg':
        return 'bg-rose-500 text-white';
      default:
        return 'bg-amber-500 text-white';
    }
  };

  return (
    <div className="w-full">
      
      {/* HEADER LABEL SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-rose-50 text-rose-600 font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Today's Specials Menu
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-2">Active Daily Specials</h2>
          <p className="text-xs text-gray-500">Compact list of our kitchen's default highlights. Click any card to review full clinical ingredients.</p>
        </div>
        <div className="mt-3 md:mt-0 bg-gray-50 px-3.5 py-1.5 rounded-xl text-xs text-gray-500 font-semibold">
          Menu Cycle: <span className="text-[#3D3F96]">Today's Feed</span>
        </div>
      </div>

      {/* COMPACT CARD GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {dailySpecials.map((meal) => (
          <div 
            key={meal.slot} 
            onClick={() => setActiveSpecial(meal)}
            className="rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white group flex flex-col justify-between"
          >
            
            {/* Visual Photo Area */}
            <div className="relative h-36 w-full overflow-hidden bg-gray-50">
              <img 
                src={meal.imageUrl} 
                alt={meal.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

              {/* Time-Slot Overlay Label */}
              <span className="absolute top-3 left-3 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-sm">
                {meal.slot}
              </span>

              {/* Diet Overlay Badge */}
              <span className={`absolute top-3 right-3 text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${getDietLabelStyle(meal.dietType)}`}>
                {meal.dietType}
              </span>
            </div>

            {/* Compact Description Body */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-extrabold text-gray-900 text-sm leading-tight group-hover:text-[#3D3F96] transition-colors">
                  {meal.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">{meal.servingSize} • {meal.tag}</span>
              </div>

              {/* Pricing & Click Indicator Footer */}
              <div className="pt-3 mt-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400 line-through text-[10px]">₹{meal.price}</span>
                  <span className="block font-black text-gray-950">₹{meal.discountPrice}</span>
                </div>
                <span className="text-[#3D3F96] font-bold text-[11px] group-hover:underline">
                  View Specs →
                </span>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* DETAILED CLINICAL POPUP DESK OVERLAY */}
      {activeSpecial && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            
            {/* Modal Closer */}
            <button 
              onClick={() => setActiveSpecial(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Modal Top Visual */}
            <div className="relative h-44 w-full rounded-2xl overflow-hidden mb-5 bg-gray-50">
              <img 
                src={activeSpecial.imageUrl} 
                alt={activeSpecial.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              
              <span className="absolute bottom-3 left-3 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                {activeSpecial.slot} • {activeSpecial.time}
              </span>
            </div>

            {/* Modal Body Info */}
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-center gap-2">
                  <h4 className="font-extrabold text-gray-900 text-base leading-snug">
                    {activeSpecial.name}
                  </h4>
                  <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm shrink-0 ${getDietLabelStyle(activeSpecial.dietType)}`}>
                    {activeSpecial.dietType}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">{activeSpecial.servingSize}</span>
                <p className="text-xs text-gray-500 leading-relaxed mt-2">{activeSpecial.description}</p>
              </div>

              {/* Medical Feature Checklist */}
              <div className="space-y-2 pt-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Nutrition Highlights</span>
                {activeSpecial.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-600 font-semibold">
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-50 flex items-center justify-center text-[#00B574] text-[9px] font-bold">
                      ✓
                    </span>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Clinical Diagnostic-style Nutrient Dashboard */}
              <div className="bg-gray-50 rounded-xl p-3.5 space-y-2.5 shadow-sm text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-medium">Calories</span>
                  <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded">{activeSpecial.calories} Kcal</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-gray-400 font-medium">Net Carbohydrates</span>
                  <span className="font-bold text-gray-800 bg-white px-2 py-0.5 rounded">{activeSpecial.netCarbs}</span>
                </div>
                <div className="flex justify-between items-center pt-2.5">
                  <span className="text-gray-400 font-medium">Glycemic Load Impact</span>
                  <span className="font-extrabold text-[#00B574] bg-emerald-50 px-2 py-0.5 rounded">
                    GI: {activeSpecial.glycemicIndex} (Low)
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Price & Checkout CTA */}
            <div className="pt-4 mt-6 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-gray-400 line-through">₹{activeSpecial.price}</span>
                <strong className="text-lg font-black text-gray-950">₹{activeSpecial.discountPrice}</strong>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveSpecial(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(activeSpecial.discountPrice, activeSpecial.name);
                    setActiveSpecial(null);
                  }}
                  className="bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-extrabold px-5 py-2.5 rounded-xl shadow-md transition active:scale-95"
                >
                  Add to Routine
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}