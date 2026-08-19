'use client';

import React from 'react';

// Live active combo bundles managed by the system administrator
const INITIAL_COMBOS = [
  {
    id: "CMB-801",
    name: "Diabetic Couple Combo 👩‍❤️‍👨",
    description: "A perfectly portioned date-night bundle containing our best-selling salad bowl and low-carb mains.",
    dishes: [
      { name: "Keto Garden Veg Salad Bowl", qty: 1, price: 220 },
      { name: "Low-Carb Cauliflower Fried Rice", qty: 1, price: 210 }
    ],
    basePrice: 430,
    comboPrice: 360,
    spicyLevel: "Medium",
    isPopular: true,
    isRecommended: true,
    isAvailable: true,
    bannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "CMB-802",
    name: "Healthy Family Feast 🏡",
    description: "Complete healthy dinner bundle for a family of four featuring high-protein mains and sugar-free desserts.",
    dishes: [
      { name: "Low GI Quinoa Biryani", qty: 2, price: 290 },
      { name: "Sugar-Free Chia Seed Pudding", qty: 2, price: 120 }
    ],
    basePrice: 820,
    comboPrice: 690,
    spicyLevel: "Medium",
    isPopular: false,
    isRecommended: true,
    isAvailable: true,
    bannerUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80"
  }
];

export default function Combos({ onAddToCart }) {
  const combos = INITIAL_COMBOS.filter(c => c.isAvailable);

  return (
    <div className="w-full">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 mb-8">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-rose-50 text-rose-600 font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Bundled Savings
          </span>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-2">Combo & Party Offers</h2>
          <p className="text-xs text-gray-500 mt-1">Share and celebrate with clinical-grade, portion-controlled multi-item meals.</p>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {combos.map((combo) => {
          const discountPct = Math.round(((combo.basePrice - combo.comboPrice) / combo.basePrice) * 100);
          return (
            <div 
              key={combo.id}
              className="bg-white rounded-3xl flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            >
              <div>
                {/* Visual Header Photo Container with overlays */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                  <img src={combo.bannerUrl} alt={combo.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Savings Overlay */}
                  <span className="absolute bottom-3 left-4 bg-[#00B574] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                    Save {discountPct}% Off
                  </span>
                  
                  {/* ID Tag */}
                  <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    ID: {combo.id}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{combo.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Ready for dispatch</p>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {combo.description}
                  </p>

                  {/* Connected Dot-Track for Bundle Items */}
                  <div className="space-y-3 py-2 mt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Items included:</span>
                    <div className="relative pl-6 space-y-3.5">
                      <div className="absolute left-2 top-2 bottom-2 w-[1.5px] bg-slate-200" />
                      
                      {combo.dishes.map((dish) => (
                        <div key={dish.name} className="relative flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="absolute -left-5 w-2 h-2 rounded-full bg-[#3D3F96]" />
                          <span>{dish.name} <strong className="text-slate-500">x{dish.qty}</strong></span>
                          <span className="text-slate-400">₹{dish.price * dish.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spicy level and promotions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-extrabold">
                      Spicy: {combo.spicyLevel}
                    </span>
                    {combo.isPopular && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase">
                        Popular
                      </span>
                    )}
                    {combo.isRecommended && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Frictionless Pricing & Actions Footer */}
              <div className="px-6 py-4 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <span className="block text-[10px] text-gray-400 line-through">₹{combo.basePrice}</span>
                  <strong className="text-lg font-black text-gray-950">₹{combo.comboPrice}</strong>
                </div>
                
                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(combo.comboPrice, combo.name);
                  }}
                  className="bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
                >
                  Add Combo
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}