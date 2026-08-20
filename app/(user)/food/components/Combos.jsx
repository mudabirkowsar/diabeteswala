'use client';

import React from 'react';
import { Sparkles, Flame, TrendingUp, ShoppingBag, Check } from 'lucide-react';

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
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-10 antialiased">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-8 border-b border-gray-100">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-rose-50 text-rose-600 font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            Bundled Savings
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-2">Combo & Party Offers</h2>
          <p className="text-sm text-gray-500 mt-1.5">Celebrate with clinical-grade, portion-controlled multi-item meals.</p>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {combos.map((combo) => {
          const discountPct = Math.round(((combo.basePrice - combo.comboPrice) / combo.basePrice) * 100);
          return (
            <div
              key={combo.id}
              className="group bg-white rounded-3xl flex flex-col justify-between border border-slate-100/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
            >
              <div>
                {/* Visual Header Photo Container with overlays */}
                <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                  <img
                    src={combo.bannerUrl}
                    alt={combo.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent"></div>

                  {/* Savings Overlay */}
                  <span className="absolute bottom-4 left-4 bg-emerald-500/90 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Save {discountPct}% Off
                  </span>

                  {/* ID Tag */}
                  <span className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[9px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    ID: {combo.id}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug group-hover:text-[#3D3F96] transition-colors">
                      {combo.name}
                    </h3>
                    <p className="text-[10px] font-extrabold text-emerald-600 mt-1 uppercase tracking-widest flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      Ready for dispatch
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                    {combo.description}
                  </p>

                  {/* Connected Dot-Track for Bundle Items */}
                  <div className="space-y-3 py-2 mt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">
                      Items included:
                    </span>
                    <div className="relative pl-5 space-y-3.5">
                      <div className="absolute left-[7px] top-2.5 bottom-2 w-0.5 border-l-2 border-dashed border-slate-200" />

                      {combo.dishes.map((dish) => (
                        <div key={dish.name} className="relative flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="absolute -left-[19px] w-3 h-3 rounded-full bg-indigo-50 border-2 border-[#3D3F96] flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-[#3D3F96]" />
                          </span>
                          <span className="text-slate-800">{dish.name} <strong className="text-slate-400 font-extrabold text-[10px]">x{dish.qty}</strong></span>
                          <span className="text-slate-500 font-mono text-[11px]">₹{dish.price * dish.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spicy level and promotions */}
                  <div className="flex flex-wrap gap-2 pt-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-extrabold">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      Spicy: {combo.spicyLevel}
                    </span>
                    {combo.isPopular && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                        <TrendingUp className="w-3 h-3 text-amber-600" />
                        Popular
                      </span>
                    )}
                    {combo.isRecommended && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-[10px] font-bold uppercase tracking-wide">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Frictionless Pricing & Actions Footer */}
              <div className="px-6 py-5 bg-slate-50/50 border-t border-slate-100/60 flex justify-between items-center gap-4">
                <div>
                  <span className="block text-[10px] text-gray-400 line-through font-mono">₹{combo.basePrice}</span>
                  <strong className="text-xl font-black text-slate-900 font-mono">₹{combo.comboPrice}</strong>
                </div>

                <button
                  onClick={() => {
                    if (onAddToCart) onAddToCart(combo.comboPrice, combo.name);
                  }}
                  className="bg-[#3D3F96] hover:bg-[#2c2e7a] hover:shadow-lg hover:shadow-indigo-900/10 text-white text-xs font-bold px-4 py-3 rounded-xl transition active:scale-[0.98] duration-200 flex items-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
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