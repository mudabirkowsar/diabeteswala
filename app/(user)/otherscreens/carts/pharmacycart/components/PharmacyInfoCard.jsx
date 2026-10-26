// components/PharmacyInfoCard.jsx
"use client";
import React from 'react';
import { ShieldCheck, MapPin } from 'lucide-react';

export default function PharmacyInfoCard({ pharmacy, getMediaUrl, placeholderImage }) {
  const storeName = pharmacy?.name || "Licensed Partner Pharmacy";
  const storeCity = pharmacy?.city ? `${pharmacy.city}, ${pharmacy.state || ''}` : "Verified Central Warehouse";
  const storeImg = getMediaUrl(pharmacy?.profileImage || pharmacy?.image) || placeholderImage;

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-sm flex items-center gap-3">
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl overflow-hidden bg-slate-50 border border-slate-200/70 shrink-0">
        <img src={storeImg} alt={storeName} className="w-full h-full object-cover" />
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="inline-flex items-center gap-1 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mb-0.5">
          <ShieldCheck size={10} /> 100% Genuine Medicines
        </div>
        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">{storeName}</h4>
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 flex items-center gap-1 mt-0.5 truncate">
          <MapPin size={10} /> {storeCity}
        </p>
      </div>
    </div>
  );
}