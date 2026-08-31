"use client";

import React from 'react';
import { Layers, Clock, MapPin, Star } from 'lucide-react';

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BASE_SERVER_URL}/${path.startsWith("/") ? path.substring(1) : path}`;
};

export default function PlanMediaSidebar({ plan, isAvailable, aggregatedIngredients }) {
    const bannerImage = plan?.imageUrl || plan?.dishPool?.[0]?.imageUrl || null;
    const vendor = plan?.vendorId || {};

    return (
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 text-left">
            {/* Visual Banner */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-md border border-slate-100 bg-white">
                <div className="relative aspect-square w-full">
                    <img
                        src={getMediaUrl(bannerImage) || PLACEHOLDER_IMAGE}
                        alt={plan?.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {!isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                            <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-500/50">
                                Not Available Near You
                            </span>
                        </div>
                    )}

                    <div className="absolute top-4 left-4 z-20">
                        <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider border border-white/10">
                            {plan?.planCycle || "Monthly Plan"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Parameters */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-center sm:text-left">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                    Plan Parameters
                </span>

                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                        <Layers className="text-indigo-500 mb-1" size={18} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Meals / Day</span>
                        <span className="font-mono font-black text-sm text-slate-800 mt-1">{plan?.mealsPerDay || 1} Meal{plan?.mealsPerDay > 1 ? 's' : ''}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                        <Clock className="text-amber-500 mb-1" size={18} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cycle</span>
                        <span className="font-sans font-black text-xs text-slate-800 mt-1 text-center truncate w-full">{plan?.planCycle || "Monthly"}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                        <MapPin className="text-rose-500 mb-1" size={18} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Proximity</span>
                        <span className="font-mono font-black text-sm text-slate-800 mt-1">{plan?.distanceText || `${plan?.distance || 0} km`}</span>
                    </div>
                </div>
            </div>

            {/* Kitchen Vendor Card */}
            {vendor.name && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                            <img
                                src={getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER}
                                alt={vendor.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                            />
                        </div>
                        <div className="space-y-0.5 min-w-0">
                            <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Prepared By</span>
                            <strong className="text-xs font-black text-slate-800 tracking-tight block mt-1">{vendor.name}</strong>
                            <p className="text-[10px] text-slate-400 font-bold truncate max-w-[160px]">{vendor.address || "Cloud Hub"}</p>
                        </div>
                    </div>
                    {vendor.rating !== undefined && (
                        <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-extrabold shrink-0 select-none">
                            <Star size={13} className="fill-amber-500 text-amber-500" /> {vendor.rating || '0.0'}
                        </span>
                    )}
                </div>
            )}

            {/* Ingredients Summary */}
            {aggregatedIngredients?.length > 0 && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Combined Ingredients Included</span>
                    <div className="flex flex-wrap gap-1.5">
                        {aggregatedIngredients.map((ing) => (
                            <span key={ing} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 rounded-lg">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}