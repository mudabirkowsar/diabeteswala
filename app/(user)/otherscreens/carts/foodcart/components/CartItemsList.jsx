"use client";

import React from 'react';
import { Trash2, Plus, Minus, Loader2 } from 'lucide-react';

export default function CartItemsList({
    items = [],
    updatingId,
    onQtyChange,
    onRemoveItem,
    getMediaUrl,
    placeholderImage
}) {
    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isEgg = type === 'Egg';
        const isNonVeg = type === 'Non Veg';

        return (
            <div
                className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 bg-white shadow-sm ${isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
                    }`}
                title={type || 'Veg'}
            >
                <span
                    className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
                        }`}
                />
            </div>
        );
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 p-5 sm:p-6 shadow-sm space-y-5 text-left">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block border-b border-slate-50 pb-2">
                Items inside Tray ({items.length})
            </span>

            <div className="divide-y divide-slate-100 space-y-4">
                {items.map((item) => {
                    const dish = item.itemId || {};
                    const dishImage = getMediaUrl(dish.imageUrl) || placeholderImage;
                    const isUpdating = updatingId === dish._id;

                    return (
                        <div key={item._id} className="pt-4 first:pt-0 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                                {renderDietBadge(dish.dietType)}

                                <div className="w-16 h-16 rounded-2xl bg-slate-50 overflow-hidden shrink-0 border border-slate-200/60">
                                    <img
                                        src={dishImage}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = placeholderImage; }}
                                    />
                                </div>

                                <div className="space-y-1 min-w-0">
                                    <h4 className="text-sm font-extrabold text-slate-800 truncate pr-2" title={item.name}>
                                        {item.name}
                                    </h4>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {dish.foodEffectCategory && (
                                            <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50/80 px-2 py-0.5 rounded-md border border-indigo-100/60">
                                                {dish.foodEffectCategory}
                                            </span>
                                        )}
                                        <span className="text-[10px] font-bold text-slate-400 font-mono">
                                            ₹{item.price} each
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Quantity Controls & Remove Action */}
                            <div className="flex items-center gap-3 shrink-0">
                                <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() => onQtyChange(dish._id, item.quantity, 'dec')}
                                        className="w-7 h-7 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-700 transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Minus size={12} />
                                    </button>
                                    <span className="w-6 text-center text-xs font-black font-mono">
                                        {isUpdating ? <Loader2 size={12} className="animate-spin text-[#3d3f96] mx-auto" /> : item.quantity}
                                    </span>
                                    <button
                                        type="button"
                                        disabled={isUpdating}
                                        onClick={() => onQtyChange(dish._id, item.quantity, 'inc')}
                                        className="w-7 h-7 bg-white hover:bg-slate-100 rounded-lg border border-slate-200/80 flex items-center justify-center text-slate-700 transition cursor-pointer disabled:opacity-50"
                                    >
                                        <Plus size={12} />
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    disabled={isUpdating}
                                    onClick={() => onRemoveItem(dish._id)}
                                    className="p-2 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer disabled:opacity-50"
                                    title="Remove from tray"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}