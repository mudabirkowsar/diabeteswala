'use client';

import React, { useEffect, useState } from 'react';
import { X, MapPin, CheckCircle2, Home, Briefcase, Compass, Loader2 } from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust your import path

export default function SelectAddressModal({
    isOpen,
    onClose,
    onSelectAddress,
    selectedAddressId
}) {
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [tempSelectedId, setTempSelectedId] = useState(selectedAddressId || null);

    useEffect(() => {
        if (isOpen) {
            setTempSelectedId(selectedAddressId || null);
            fetchAddresses();
        }
    }, [isOpen, selectedAddressId]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await UserAPI.getAddressList();
            if (res && res.success && Array.isArray(res.data)) {
                setAddresses(res.data);
                // Default selection if none selected yet
                if (!tempSelectedId) {
                    const defaultAddr = res.data.find((a) => a.isDefault);
                    if (defaultAddr) setTempSelectedId(defaultAddr._id);
                }
            } else {
                setAddresses([]);
            }
        } catch (err) {
            console.error('Error fetching address list:', err);
            setError('Could not load addresses. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getAddressIcon = (type = '') => {
        switch (type.toLowerCase()) {
            case 'home':
                return <Home size={15} className="text-[#3d3f96]" />;
            case 'work':
            case 'office':
                return <Briefcase size={15} className="text-indigo-600" />;
            default:
                return <Compass size={15} className="text-emerald-600" />;
        }
    };

    if (!isOpen) return null;

    const handleConfirm = () => {
        const chosen = addresses.find((a) => a._id === tempSelectedId);
        if (chosen) {
            onSelectAddress(chosen);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div
                className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">Select Saved Address</h3>
                            <p className="text-[11px] text-slate-400">Choose where the coach will visit for in-person consultation</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 overflow-y-auto space-y-3 flex-1 scrollbar-thin">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                            <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                            <span className="text-xs font-semibold">Loading saved addresses...</span>
                        </div>
                    ) : error ? (
                        <div className="py-8 text-center text-red-500 text-xs">{error}</div>
                    ) : addresses.length === 0 ? (
                        <div className="py-8 text-center text-slate-500 text-xs">
                            No saved addresses found. Please enter an address manually below.
                        </div>
                    ) : (
                        addresses.map((addr) => {
                            const isSelected = tempSelectedId === addr._id;

                            return (
                                <div
                                    key={addr._id}
                                    onClick={() => setTempSelectedId(addr._id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${isSelected
                                            ? 'border-[#3d3f96] bg-indigo-50/40 shadow-sm'
                                            : 'border-slate-200 hover:border-slate-300 bg-white'
                                        }`}
                                >
                                    <div className="space-y-1 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
                                                {getAddressIcon(addr.addressType)}
                                                {addr.addressType || 'Address'}
                                            </span>
                                            {addr.isDefault && (
                                                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 uppercase">
                                                    Default
                                                </span>
                                            )}
                                            <span className="text-xs text-slate-600 font-semibold truncate">• {addr.name}</span>
                                        </div>

                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            {[addr.houseNo, addr.sector, addr.landmark].filter(Boolean).join(', ')}
                                        </p>
                                        <p className="text-[11px] text-slate-500 font-medium">
                                            {addr.city}, {addr.state} - <span className="font-bold text-slate-700">{addr.pincode}</span>
                                        </p>
                                        {addr.phone && (
                                            <p className="text-[10px] text-slate-400">Phone: {addr.phone}</p>
                                        )}
                                    </div>

                                    <div
                                        className={`w-5 h-5 rounded-full border mt-1 shrink-0 flex items-center justify-center transition-colors ${isSelected
                                                ? 'border-[#3d3f96] bg-[#3d3f96] text-white'
                                                : 'border-slate-300'
                                            }`}
                                    >
                                        {isSelected && <CheckCircle2 size={13} />}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        className="px-5 py-2 rounded-xl bg-[#3d3f96] hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    >
                        Use This Address
                    </button>
                </div>
            </div>
        </div>
    );
}