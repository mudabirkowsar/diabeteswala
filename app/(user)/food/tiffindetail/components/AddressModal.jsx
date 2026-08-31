"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    MapPin,
    Home,
    Briefcase,
    Building2,
    CheckCircle2,
    Circle,
    Plus,
    Loader2,
    Phone,
    AlertCircle
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

export default function AddressModal({
    isOpen,
    onClose,
    onSelectAddress,
    selectedAddressId
}) {
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tempSelectedId, setTempSelectedId] = useState(selectedAddressId || null);

    // Fetch user addresses whenever the modal opens
    useEffect(() => {
        if (isOpen) {
            fetchAddresses();
        }
    }, [isOpen]);

    useEffect(() => {
        setTempSelectedId(selectedAddressId);
    }, [selectedAddressId]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getAddressList();
            if (response && response.success && Array.isArray(response.data)) {
                setAddresses(response.data);

                // If nothing currently selected, pick default address or first address
                if (!tempSelectedId && response.data.length > 0) {
                    const defaultAddr = response.data.find((a) => a.isDefault) || response.data[0];
                    setTempSelectedId(defaultAddr._id);
                }
            } else {
                setAddresses([]);
            }
        } catch (err) {
            console.error("Error fetching address list:", err);
            if (showNotification) {
                showNotification("Could not load your saved addresses.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleConfirm = () => {
        const chosen = addresses.find((a) => a._id === tempSelectedId);
        if (!chosen) {
            if (showNotification) {
                showNotification("Please select a delivery address.", "warning");
            }
            return;
        }
        onSelectAddress(chosen);
        onClose();
    };

    const getAddressTypeIcon = (type = "") => {
        const lower = type.toLowerCase();
        if (lower === "home") return <Home size={14} className="text-[#3d3f96]" />;
        if (lower === "office" || lower === "work") return <Briefcase size={14} className="text-amber-600" />;
        return <Building2 size={14} className="text-emerald-600" />;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            {/* Modal Box */}
            <div className="bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                            <MapPin size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                                Select Delivery Address
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Choose where your tiffin meal will be delivered
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-3.5 flex-1">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <Loader2 size={28} className="animate-spin text-[#3d3f96]" />
                            <span className="text-xs font-bold uppercase tracking-wider">Fetching your addresses...</span>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="py-10 text-center space-y-3">
                            <AlertCircle size={36} className="text-slate-300 mx-auto" />
                            <p className="text-sm font-bold text-slate-700">No saved addresses found</p>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                Please add a delivery address to your account to proceed with this subscription.
                            </p>
                        </div>
                    ) : (
                        addresses.map((addr) => {
                            const isSelected = tempSelectedId === addr._id;

                            return (
                                <div
                                    key={addr._id}
                                    onClick={() => setTempSelectedId(addr._id)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                                        isSelected
                                            ? 'bg-indigo-50/40 border-[#3d3f96] ring-1 ring-[#3d3f96]'
                                            : 'bg-white border-slate-200 hover:border-slate-300'
                                    }`}
                                >
                                    {/* Selection Radio */}
                                    <div className="pt-0.5 shrink-0">
                                        {isSelected ? (
                                            <CheckCircle2 size={20} className="text-[#3d3f96] fill-indigo-100" />
                                        ) : (
                                            <Circle size={20} className="text-slate-300" />
                                        )}
                                    </div>

                                    {/* Address Details */}
                                    <div className="space-y-1 text-left flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                    {getAddressTypeIcon(addr.addressType)}
                                                    {addr.addressType || "Address"}
                                                </span>
                                                <strong className="text-xs font-black text-slate-800 truncate">
                                                    {addr.name}
                                                </strong>
                                            </div>

                                            {addr.isDefault && (
                                                <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                                                    Default
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs font-medium text-slate-600 leading-relaxed pt-0.5">
                                            {[
                                                addr.houseNo,
                                                addr.sector,
                                                addr.landmark ? `Near ${addr.landmark}` : null,
                                                addr.city,
                                                addr.state,
                                                addr.pincode
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>

                                        {addr.phone && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 pt-1">
                                                <Phone size={12} className="text-slate-400" />
                                                <span>+91 {addr.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors uppercase tracking-wider cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={addresses.length === 0}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-extrabold shadow-md shadow-indigo-950/10 transition-all uppercase tracking-wider cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Use This Address
                    </button>
                </div>

            </div>
        </div>
    );
}