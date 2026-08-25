"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Home,
    Briefcase,
    Building,
    Phone,
    User,
    CheckCircle2,
    Plus,
    RefreshCw,
    Loader2,
    X,
    Trash2,
    Edit3,
    Check
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

export default function Address({
    isOpen,
    onClose,
    onSelectAddress,
    selectedAddressId
}) {
    const { showNotification } = useNotification();

    // --- States ---
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- Fetch Addresses on Modal Open ---
    const fetchAddressList = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getAddressList();
            if (response && response.success) {
                setAddresses(response.data || []);
            } else {
                if (showNotification) {
                    showNotification("Unable to load saved addresses.", "error");
                }
            }
        } catch (err) {
            console.error("Error fetching address list:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to retrieve your delivery addresses.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAddressList();
        }
    }, [isOpen]);

    // --- Helper: Icon by Address Type ---
    const getAddressTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'home':
                return <Home size={13} className="text-[#3d3f96]" />;
            case 'work':
            case 'office':
                return <Briefcase size={13} className="text-amber-600" />;
            default:
                return <Building size={13} className="text-emerald-600" />;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in antialiased select-none text-slate-800">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left flex flex-col justify-between">

                {/* --- MODAL HEADER --- */}
                <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Delivery Address</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Select a destination for your order</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={fetchAddressList}
                                disabled={loading}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                                title="Refresh addresses"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* --- ADDRESSES LIST CONTAINER --- */}
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Fetching saved addresses...
                            </p>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="py-16 text-center text-slate-400 text-xs font-semibold space-y-3">
                            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mx-auto">
                                <MapPin size={28} />
                            </div>
                            <p className="text-sm font-bold text-slate-700">No saved addresses found</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                Add a drop-off location to complete your food order dispatch.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                            {addresses.map((address) => {
                                const isSelected = selectedAddressId === address._id;

                                return (
                                    <div
                                        key={address._id}
                                        onClick={() => onSelectAddress && onSelectAddress(address)}
                                        className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 group ${isSelected
                                            ? 'border-[#3d3f96] bg-indigo-50/20 ring-2 ring-[#3d3f96]/20 shadow-sm'
                                            : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60'
                                            }`}
                                    >
                                        <div className="space-y-2 flex-1 min-w-0">

                                            {/* Address Type Badge & Default Status */}
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase">
                                                    {getAddressTypeIcon(address.addressType)}
                                                    <span>{address.addressType || "Address"}</span>
                                                </span>

                                                {address.isDefault && (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100">
                                                        <CheckCircle2 size={10} /> Default
                                                    </span>
                                                )}
                                            </div>

                                            {/* Recipient Details */}
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                                <span>{address.name}</span>
                                                <span className="text-slate-400 font-normal">• {address.phone}</span>
                                            </div>

                                            {/* Full Formatted Address */}
                                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                                {address.houseNo}{address.sector ? `, ${address.sector}` : ''}
                                                {address.landmark ? `, Near ${address.landmark}` : ''}, {address.city}, {address.state} - <strong className="font-mono text-slate-800 font-bold">{address.pincode}</strong>
                                            </p>
                                        </div>

                                        {/* Radio Select Indicator */}
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${isSelected ? 'border-[#3d3f96] bg-[#3d3f96]' : 'border-slate-300 bg-white group-hover:border-slate-400'
                                            }`}>
                                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* --- MODAL FOOTER CONTROLS --- */}
                <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={() => {
                            if (showNotification) {
                                showNotification("Address addition form opened.", "success");
                            }
                        }}
                        className="inline-flex items-center gap-2 text-xs font-bold text-[#3d3f96] hover:text-[#2d2f75] px-3 py-2 rounded-xl transition cursor-pointer"
                    >
                        <Plus size={15} />
                        <span>Add New Location</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer shadow-md shadow-indigo-950/10 flex items-center gap-1.5"
                        >
                            <Check size={14} />
                            <span>Confirm</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}