"use client";

import React, { useState, useEffect } from 'react';
import {
    MapPin,
    Home,
    Briefcase,
    Building,
    CheckCircle2,
    Plus,
    RefreshCw,
    Loader2,
    X,
    Check,
    AlertCircle
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

const MAX_DELIVERY_DISTANCE_KM = 10;
const DEFAULT_USER_COORDS = { lat: 30.7046, lng: 76.7179 }; // Mohali fallback

// --- Haversine Distance Formula (Returns Distance in KM) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Earth radius in KM
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// --- Helper: Geocode an address using OpenStreetMap Nominatim ---
const geocodeAddress = async (addr) => {
    try {
        // Construct search query focusing on pincode, city, state, country
        const queryParts = [addr.pincode, addr.city, addr.state, addr.country || "India"]
            .filter(Boolean)
            .join(", ");

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryParts)}&limit=1`;
        const res = await fetch(url, { headers: { 'Accept-Language': 'en' } });
        const data = await res.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
            };
        }
    } catch (e) {
        console.error("Geocoding failed for:", addr, e);
    }
    return null;
};

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
    const [userCoords, setUserCoords] = useState(DEFAULT_USER_COORDS);

    // --- Read User Coordinates from LocalStorage ---
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedCoords = localStorage.getItem("userCoords");
            if (savedCoords) {
                try {
                    const parsed = JSON.parse(savedCoords);
                    if (parsed.lat && parsed.lng) {
                        setUserCoords({
                            lat: Number(parsed.lat),
                            lng: Number(parsed.lng)
                        });
                    }
                } catch (e) {
                    console.error("Error reading coordinates:", e);
                }
            }
        }
    }, [isOpen]);

    // --- Fetch & Geocode Addresses ---
    const fetchAddressList = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getAddressList();
            if (response && response.success) {
                const rawAddresses = response.data || [];

                // Resolve distance for all addresses
                const addressesWithDistance = await Promise.all(
                    rawAddresses.map(async (addr) => {
                        let lat = addr.lat ? Number(addr.lat) : null;
                        let lng = addr.lng ? Number(addr.lng) : null;

                        // If lat/lng missing in DB, geocode using city, state & pincode
                        if (!lat || !lng) {
                            const coords = await geocodeAddress(addr);
                            if (coords) {
                                lat = coords.lat;
                                lng = coords.lng;
                            }
                        }

                        let distance = null;
                        let isOutOfRange = false;

                        if (lat && lng) {
                            distance = calculateDistance(userCoords.lat, userCoords.lng, lat, lng);
                            isOutOfRange = distance > MAX_DELIVERY_DISTANCE_KM;
                        }

                        return {
                            ...addr,
                            lat,
                            lng,
                            distance,
                            isOutOfRange
                        };
                    })
                );

                setAddresses(addressesWithDistance);
            } else {
                if (showNotification) {
                    showNotification("Unable to load saved addresses.", "error");
                }
            }
        } catch (err) {
            console.error("Error fetching address list:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to retrieve addresses.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAddressList();
        }
    }, [isOpen, userCoords]);

    // --- Helper: Handle Selection ---
    const handleSelect = (address) => {
        if (address.isOutOfRange) {
            if (showNotification) {
                showNotification(
                    `This address is ${address.distance ? address.distance.toFixed(1) + " km" : "too far"} away. Maximum delivery range is ${MAX_DELIVERY_DISTANCE_KM} km.`,
                    "error"
                );
            }
            return;
        }
        if (onSelectAddress) {
            onSelectAddress(address);
        }
    };

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
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                    Select an address within {MAX_DELIVERY_DISTANCE_KM} km of your location
                                </p>
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
                                Calculating distance & addresses...
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
                                const isOutOfRange = address.isOutOfRange;

                                return (
                                    <div
                                        key={address._id}
                                        onClick={() => handleSelect(address)}
                                        className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                                            isOutOfRange
                                                ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                                : isSelected
                                                ? 'border-[#3d3f96] bg-indigo-50/20 ring-2 ring-[#3d3f96]/20 shadow-sm cursor-pointer'
                                                : 'border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50/60 cursor-pointer group'
                                        }`}
                                    >
                                        <div className="space-y-2 flex-1 min-w-0">

                                            {/* Badges */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase">
                                                    {getAddressTypeIcon(address.addressType)}
                                                    <span>{address.addressType || "Address"}</span>
                                                </span>

                                                {address.isDefault && (
                                                    <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border border-emerald-100">
                                                        <CheckCircle2 size={10} /> Default
                                                    </span>
                                                )}

                                                {/* Distance / Range Tag */}
                                                {address.distance !== null && (
                                                    <span
                                                        className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                                            isOutOfRange
                                                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}
                                                    >
                                                        {isOutOfRange && <AlertCircle size={10} />}
                                                        {address.distance.toFixed(1)} km away
                                                        {isOutOfRange && ' • Out of range'}
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

                                            {isOutOfRange && (
                                                <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 mt-1">
                                                    <AlertCircle size={12} /> Delivery not available (exceeds {MAX_DELIVERY_DISTANCE_KM} km limit)
                                                </p>
                                            )}
                                        </div>

                                        {/* Radio Indicator */}
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all ${
                                                isOutOfRange
                                                    ? 'border-slate-300 bg-slate-100 cursor-not-allowed'
                                                    : isSelected
                                                    ? 'border-[#3d3f96] bg-[#3d3f96]'
                                                    : 'border-slate-300 bg-white group-hover:border-slate-400'
                                            }`}
                                        >
                                            {isSelected && !isOutOfRange && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                            )}
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