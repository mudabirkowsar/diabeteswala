"use client";

import React from 'react';
import { Utensils, Plus, Minus, Check, Sparkles, Leaf, Package } from 'lucide-react';

const AVAILABLE_ACCESSORIES = [
  {
    id: 'acc-1',
    name: 'Eco-Friendly Wooden Cutlery Set',
    description: '1x Wooden Spoon, 1x Fork & 100% Recycled Napkin',
    price: 5,
    icon: Utensils
  },
  {
    id: 'acc-2',
    name: 'Thermal Temperature Insulation Pouch',
    description: 'Maintains optimal heat/cold freshness during transit',
    price: 15,
    icon: Package
  },
  {
    id: 'acc-3',
    name: 'Healthy Herb & Mint Dip (50g)',
    description: 'Low-sodium, gluten-free chef dressing dip',
    price: 20,
    icon: Sparkles
  }
];

export default function AccessoriesCard({
  selectedAccessories = [],
  onUpdateAccessoryQty,
  optOutOfCutlery = false,
  onToggleOptOutCutlery
}) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-5 sm:p-6 shadow-sm space-y-4 text-left">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Utensils size={12} className="text-[#3d3f96]" /> Dining Accessories & Add-ons
          </span>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Add spoons, thermal insulation, or extra dressings
          </p>
        </div>
      </div>

      {/* Opt-out of Cutlery / Green Initiative */}
      <div 
        onClick={onToggleOptOutCutlery}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
          optOutOfCutlery 
            ? 'bg-emerald-50/80 border-emerald-200 ring-2 ring-emerald-500/20'
            : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
            optOutOfCutlery ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
          }`}>
            <Leaf size={15} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 tracking-tight">
              Don't send cutlery (Save Environment)
            </h4>
            <p className="text-[10px] text-slate-400 font-semibold">
              Help reduce single-use plastic and packaging waste
            </p>
          </div>
        </div>

        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
          optOutOfCutlery ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 bg-white'
        }`}>
          {optOutOfCutlery && <Check size={12} strokeWidth={3} />}
        </div>
      </div>

      {/* Accessories Items List */}
      {!optOutOfCutlery && (
        <div className="space-y-3 pt-1">
          {AVAILABLE_ACCESSORIES.map((item) => {
            const Icon = item.icon;
            const existing = selectedAccessories.find(a => a.id === item.id);
            const currentQty = existing?.quantity || 0;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  currentQty > 0 
                    ? 'border-[#3d3f96] bg-indigo-50/20 ring-1 ring-[#3d3f96]/20'
                    : 'border-slate-100 bg-slate-50/40 hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] shrink-0">
                    <Icon size={14} />
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-black text-slate-800 tracking-tight truncate">
                      {item.name}
                    </h5>
                    <p className="text-[10px] text-slate-400 font-medium truncate">
                      {item.description}
                    </p>
                    <span className="text-[11px] font-mono font-black text-slate-900 mt-0.5 block">
                      +₹{item.price}
                    </span>
                  </div>
                </div>

                {/* Quantity or Add Button */}
                <div className="shrink-0">
                  {currentQty > 0 ? (
                    <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                      <button
                        type="button"
                        onClick={() => onUpdateAccessoryQty(item, -1)}
                        className="w-6 h-6 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="w-4 text-center text-xs font-black font-mono text-slate-900">
                        {currentQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateAccessoryQty(item, 1)}
                        className="w-6 h-6 bg-slate-50 hover:bg-slate-100 rounded-lg flex items-center justify-center text-slate-700 cursor-pointer"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onUpdateAccessoryQty(item, 1)}
                      className="px-3.5 py-1.5 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-[#3d3f96] text-[#3d3f96] text-[11px] font-black uppercase rounded-xl transition cursor-pointer shadow-sm"
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}