"use client";

import React from 'react';
import { MapPin, Plus, Loader2 } from 'lucide-react';

export default function DeliveryAddressCard({
    selectedAddress,
    loadingAddress,
    onOpenAddressModal
}) {
    return (
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 text-left">
            <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#3d3f96]" /> Delivery Destination
                </span>
                <button
                    type="button"
                    onClick={onOpenAddressModal}
                    className="text-xs font-extrabold text-[#3d3f96] hover:text-[#2d2f75] uppercase tracking-wider transition cursor-pointer"
                >
                    {selectedAddress ? "Change" : "Select"}
                </button>
            </div>

            {loadingAddress ? (
                <div className="py-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
                    <Loader2 size={14} className="animate-spin text-[#3d3f96]" />
                    <span>Loading delivery address...</span>
                </div>
            ) : selectedAddress ? (
                <div
                    onClick={onOpenAddressModal}
                    className="p-3.5 bg-slate-50/70 hover:bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer transition space-y-1.5"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-800">{selectedAddress.name}</span>
                            <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                {selectedAddress.addressType || "Home"}
                            </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono font-semibold">{selectedAddress.phone}</span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2">
                        {selectedAddress.houseNo}{selectedAddress.sector ? `, ${selectedAddress.sector}` : ''}
                        {selectedAddress.landmark ? `, Near ${selectedAddress.landmark}` : ''}, {selectedAddress.city}, {selectedAddress.state} - <strong className="font-mono text-slate-700">{selectedAddress.pincode}</strong>
                    </p>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={onOpenAddressModal}
                    className="w-full p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50/50 hover:bg-indigo-50/10 flex items-center justify-center gap-2 text-xs font-bold text-[#3d3f96] transition cursor-pointer"
                >
                    <Plus size={14} />
                    <span>Add or Select Delivery Address</span>
                </button>
            )}
        </div>
    );
}