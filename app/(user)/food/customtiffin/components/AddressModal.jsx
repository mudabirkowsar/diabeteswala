"use client";

import React, { useState, useEffect } from 'react';
import { X, MapPin, CheckCircle2, Circle, Loader2, Phone, AlertCircle } from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

const MAX_DELIVERY_DISTANCE_KM = 10;
const DEFAULT_USER_COORDS = { lat: 30.7046, lng: 76.7179 }; // Default: Mohali coordinates

// --- Haversine Distance Formula (KM) ---
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const R = 6371; // Radius of the Earth in km
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

// --- Geocode address via OpenStreetMap Nominatim ---
const geocodeAddress = async (addr) => {
    try {
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
        console.error("Geocoding error for address:", addr, e);
    }
    return null;
};

export default function AddressModal({ isOpen, onClose, onSelectAddress, selectedAddressId }) {
    const { showNotification } = useNotification();
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tempSelectedId, setTempSelectedId] = useState(selectedAddressId || null);
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
                    console.error("Error reading userCoords:", e);
                }
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) fetchAddresses();
    }, [isOpen, userCoords]);

    useEffect(() => {
        setTempSelectedId(selectedAddressId);
    }, [selectedAddressId]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getAddressList();
            if (response?.success && Array.isArray(response.data)) {
                const rawAddresses = response.data || [];

                // Resolve distance & 10 km limit for each address
                const processed = await Promise.all(
                    rawAddresses.map(async (addr) => {
                        let lat = addr.lat ? Number(addr.lat) : null;
                        let lng = addr.lng ? Number(addr.lng) : null;

                        // Geocode address when lat/lng are missing in database
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

                setAddresses(processed);

                // Auto-select first eligible address within 10 km if none selected
                if (!tempSelectedId) {
                    const validAddr = processed.find((a) => !a.isOutOfRange && a.isDefault) || processed.find((a) => !a.isOutOfRange);
                    if (validAddr) {
                        setTempSelectedId(validAddr._id);
                    }
                }
            } else {
                setAddresses([]);
            }
        } catch (err) {
            console.error("Error fetching addresses:", err);
            if (showNotification) showNotification("Could not load addresses.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAddress = (addr) => {
        if (addr.isOutOfRange) {
            if (showNotification) {
                showNotification(
                    `This address is ${addr.distance ? addr.distance.toFixed(1) + ' km' : 'too far'} away. Max delivery limit is ${MAX_DELIVERY_DISTANCE_KM} km.`,
                    "error"
                );
            }
            return;
        }
        setTempSelectedId(addr._id);
    };

    const handleConfirm = () => {
        const chosen = addresses.find((a) => a._id === tempSelectedId);
        if (!chosen) {
            if (showNotification) showNotification("Please select an address.", "warning");
            return;
        }
        if (chosen.isOutOfRange) {
            if (showNotification) {
                showNotification(
                    `Selected address is out of delivery range (${MAX_DELIVERY_DISTANCE_KM} km limit).`,
                    "error"
                );
            }
            return;
        }
        onSelectAddress(chosen);
        onClose();
    };

    const selectedAddrObj = addresses.find((a) => a._id === tempSelectedId);
    const isConfirmDisabled = addresses.length === 0 || !tempSelectedId || selectedAddrObj?.isOutOfRange;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
            <div className="bg-white w-full max-w-lg rounded-[2rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                            <MapPin size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Select Delivery Address</h3>
                            <p className="text-[11px] text-slate-400 font-medium">Deliverable within {MAX_DELIVERY_DISTANCE_KM} km of your location</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-3.5 flex-1 text-left [&::-webkit-scrollbar]:hidden">
                    {loading ? (
                        <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                            <Loader2 size={28} className="animate-spin text-[#3d3f96]" />
                            <span className="text-xs font-bold uppercase">Checking distance & addresses...</span>
                        </div>
                    ) : addresses.length === 0 ? (
                        <div className="py-10 text-center space-y-3">
                            <AlertCircle size={36} className="text-slate-300 mx-auto" />
                            <p className="text-sm font-bold text-slate-700">No saved addresses found</p>
                        </div>
                    ) : (
                        addresses.map((addr) => {
                            const isSelected = tempSelectedId === addr._id;
                            const isOutOfRange = addr.isOutOfRange;

                            return (
                                <div
                                    key={addr._id}
                                    onClick={() => handleSelectAddress(addr)}
                                    className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${isOutOfRange
                                            ? 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                                            : isSelected
                                                ? 'bg-indigo-50/40 border-[#3d3f96] ring-1 ring-[#3d3f96] cursor-pointer'
                                                : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                                        }`}
                                >
                                    <div className="pt-0.5 shrink-0">
                                        {isOutOfRange ? (
                                            <Circle size={20} className="text-slate-200" />
                                        ) : isSelected ? (
                                            <CheckCircle2 size={20} className="text-[#3d3f96] fill-indigo-100" />
                                        ) : (
                                            <Circle size={20} className="text-slate-300" />
                                        )}
                                    </div>
                                    <div className="space-y-1 text-left flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border">
                                                    {addr.addressType || "Address"}
                                                </span>
                                                <strong className="text-xs font-black text-slate-800 truncate">{addr.name}</strong>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                {/* Distance / Range Badge */}
                                                {addr.distance !== null && (
                                                    <span
                                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${isOutOfRange
                                                                ? 'bg-rose-50 text-rose-600 border-rose-200'
                                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                            }`}
                                                    >
                                                        {isOutOfRange && <AlertCircle size={9} />}
                                                        {addr.distance.toFixed(1)} km away
                                                        {isOutOfRange && ' • Out of range'}
                                                    </span>
                                                )}

                                                {addr.isDefault && (
                                                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                        Default
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <p className="text-xs font-medium text-slate-600 leading-relaxed">
                                            {[addr.houseNo, addr.sector, addr.landmark ? `Near ${addr.landmark}` : null, addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
                                        </p>

                                        {addr.phone && (
                                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 pt-1">
                                                <Phone size={12} className="text-slate-400" /> +91 {addr.phone}
                                            </div>
                                        )}

                                        {isOutOfRange && (
                                            <p className="text-[11px] text-rose-500 font-semibold flex items-center gap-1 pt-1">
                                                <AlertCircle size={12} /> Delivery unavailable (exceeds {MAX_DELIVERY_DISTANCE_KM} km limit)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 uppercase cursor-pointer">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={isConfirmDisabled}
                        className="flex-1 py-3 rounded-xl bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-extrabold uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Use Address
                    </button>
                </div>
            </div>
        </div>
    );
}