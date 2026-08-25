"use client";

import React from 'react';
import { Store, ShieldCheck } from 'lucide-react';

export default function KitchenInfoCard({ kitchen, getMediaUrl, placeholderImage }) {
    if (!kitchen?.name) return null;

    const kitchenImage = getMediaUrl(kitchen.profileImage) || placeholderImage;

    return (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                <img
                    src={kitchenImage}
                    alt={kitchen.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = placeholderImage; }}
                />
            </div>
            <div className="space-y-0.5 min-w-0 flex-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">Formulated Kitchen</span>
                <h4 className="text-xs font-black text-slate-800 tracking-tight truncate">{kitchen.name}</h4>
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Store size={11} /> {kitchen.city || "Mohali"} Cloud Hub
                </span>
            </div>
            <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100 flex items-center gap-1 select-none whitespace-nowrap shrink-0">
                <ShieldCheck size={11} /> FSSAI Certified
            </span>
        </div>
    );
}