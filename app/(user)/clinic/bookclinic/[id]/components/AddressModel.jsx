"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    MapPin,
    Home,
    Building,
    Check,
    CheckCircle2,
    Circle,
    Plus,
    Loader2,
    Phone,
    AlertCircle,
    Navigation
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';

export default function AddressModel({ isOpen, onClose, selectedAddress, onSelectAddress }) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tempSelected, setTempSelected] = useState(selectedAddress);

    // Sync temp selection when prop changes
    useEffect(() => {
        setTempSelected(selectedAddress);
    }, [selectedAddress]);

    // Fetch user addresses on open
    useEffect(() => {
        if (!isOpen) return;

        const fetchAddresses = async () => {
            setLoading(true);
            try {
                const response = await UserAPI.getAddressList();
                if (response && response.success) {
                    const addrList = response.data || [];
                    setAddresses(addrList);

                    // If no address is currently selected, pre-select the default address
                    if (!selectedAddress && addrList.length > 0) {
                        const defaultAddr = addrList.find(a => a.isDefault) || addrList[0];
                        setTempSelected(defaultAddr);
                    }
                } else {
                    setAddresses([]);
                }
            } catch (err) {
                console.error("Error fetching addresses:", err);
                setAddresses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [isOpen]);

    // Lock body scroll on open
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (tempSelected) {
            onSelectAddress(tempSelected);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-5000 flex justify-end select-none antialiased">
            {/* Backdrop Blur Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Right Slide-over Panel */}
            <div className="relative w-full max-w-md bg-white shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-slate-100">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600">
                                <Home size={16} />
                            </div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Select Home Visit Address
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Choose where the doctor should arrive for consultation
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer border border-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={32} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Loading saved addresses...
                            </p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200/60 border-dashed space-y-3 my-auto">
                            <AlertCircle size={36} className="text-slate-300 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-700">No Saved Addresses Found</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                Please add a residential address to your profile to book doctor home visits.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                Saved Locations ({addresses.length})
                            </span>

                            {addresses.map((addr) => {
                                const isSelected = tempSelected?._id === addr._id;
                                const isHome = addr.addressType?.toLowerCase() === 'home';

                                return (
                                    <div
                                        key={addr._id}
                                        onClick={() => setTempSelected(addr)}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3.5 ${
                                            isSelected
                                                ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96] shadow-sm'
                                                : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                        }`}
                                    >
                                        {/* Custom Radio Button */}
                                        <div className="pt-0.5 shrink-0">
                                            {isSelected ? (
                                                <CheckCircle2 size={19} className="text-[#3d3f96] fill-indigo-100" />
                                            ) : (
                                                <Circle size={19} className="text-slate-300" />
                                            )}
                                        </div>

                                        {/* Address Details */}
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5">
                                                    <strong className="text-xs font-black text-slate-900 truncate">
                                                        {addr.name}
                                                    </strong>
                                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                                        isHome 
                                                            ? 'bg-red-50 text-red-600 border-red-200/60' 
                                                            : 'bg-slate-100 text-slate-600 border-slate-200'
                                                    }`}>
                                                        {addr.addressType || 'Home'}
                                                    </span>
                                                </div>

                                                {addr.isDefault && (
                                                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                                        Default
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                                {addr.houseNo ? `${addr.houseNo}, ` : ''}
                                                {addr.sector ? `${addr.sector}, ` : ''}
                                                {addr.landmark ? `Near ${addr.landmark}, ` : ''}
                                                {addr.city}, {addr.state} - <span className="font-mono font-bold text-slate-900">{addr.pincode}</span>
                                            </p>

                                            {addr.phone && (
                                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 pt-0.5">
                                                    <Phone size={11} className="text-slate-400" />
                                                    <span>{addr.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer Action Button */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-1/3 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!tempSelected}
                        onClick={handleConfirm}
                        className={`w-2/3 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                            tempSelected
                                ? 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/15 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <span>Select Address</span>
                        <Check size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}