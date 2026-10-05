
"use client";

import React from 'react';
import {
    X,
    Star,
    Leaf,
    Activity,
    Smartphone,
    Package
} from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return '/placeholder-device.png';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function ViewProduct({
    isOpen,
    onClose,
    device
}) {
    if (!isOpen || !device) return null;

    const prodType = device.productType || 'Glucometer';

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                            <img
                                src={getMediaUrl(device.mainImage)}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?q=80&w=300&auto=format&fit=crop'; }}
                            />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight line-clamp-1">
                                {device.title}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                {device.brand} • {prodType}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden text-xs">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Selling Price</span>
                            <strong className="text-base font-black text-slate-900">₹{device.sellingPrice}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Prepaid Price</span>
                            <strong className="text-base font-black text-emerald-600">₹{device.prepaidDiscountPrice || device.sellingPrice}</strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Stock</span>
                            <strong className="text-base font-black text-slate-900">{device.stockQuantity} Units</strong>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                            <span className="text-[10px] text-slate-400 uppercase font-black block">Rating</span>
                            <strong className="text-base font-black text-amber-500 flex items-center justify-center gap-1">
                                <Star size={14} fill="currentColor" /> {device.averageRating || 4.8}
                            </strong>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Description</span>
                        <p className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            {device.description}
                        </p>
                    </div>

                    {prodType === 'Supplement' && device.supplementDetails && (
                        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-emerald-800 flex items-center gap-1.5">
                                <Leaf size={12} /> Supplement Specifications
                            </span>
                            <p className="font-bold text-slate-800">Dosage: {device.supplementDetails.dosage}</p>
                            <p className="font-medium text-slate-600">
                                Quantity: {device.supplementDetails.netQuantity} • Form: {device.supplementDetails.form}
                            </p>
                            {device.supplementDetails.keyIngredients && (
                                <p className="text-[11px] text-slate-500">
                                    Ingredients: {Array.isArray(device.supplementDetails.keyIngredients) ? device.supplementDetails.keyIngredients.join(', ') : device.supplementDetails.keyIngredients}
                                </p>
                            )}
                        </div>
                    )}

                    {prodType === 'CGM' && device.cgmDetails && (
                        <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-2xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-rose-800 flex items-center gap-1.5">
                                <Activity size={12} /> CGM Continuous Sensor Specifications
                            </span>
                            <p className="font-bold text-slate-800">Lifespan: {device.cgmDetails.sensorLifeSpanDays} Days Continuous Wear</p>
                            <p className="font-medium text-slate-600">Warmup Time: {device.cgmDetails.sensorWarmupTime}</p>
                        </div>
                    )}

                    {prodType === 'Glucometer' && (
                        <div className="p-4 bg-indigo-50/60 border border-indigo-200 rounded-2xl space-y-1">
                            <span className="text-[10px] font-black uppercase text-indigo-800 flex items-center gap-1.5">
                                <Smartphone size={12} /> Smartphone Glucometer Compatibility
                            </span>
                            <p className="font-bold text-slate-800">Connector: {device.connectorType || 'Type-C'}</p>
                            <p className="font-medium text-slate-600">Supported OS: {device.compatibility || 'Android Only'}</p>
                        </div>
                    )}

                    {device.boxContents?.length > 0 && (
                        <div className="space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Included In The Box</span>
                            <div className="grid grid-cols-2 gap-2">
                                {device.boxContents.map((item, idx) => (
                                    <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 font-bold text-slate-700 flex items-center gap-2">
                                        <Package size={13} className="text-[#3d3f96]" />
                                        <span>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-black uppercase text-xs rounded-xl cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}