"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    ChevronRight,
    Search,
    Star,
    LayoutGrid,
    Info,
    Clock,
    Truck,
    Loader2,
    AlertCircle
} from 'lucide-react';
import AllMedicines from './components/AllMedicines';
import PharmacyDetail from './components/PharmacyDetail'; // Adjust path if needed
import UserAPI from '../../../services/UserAPI'; // Adjust path based on your structure

const PharmacyPage = () => {
    const [pharmacies, setPharmacies] = useState([]);
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Fetch partners based on coordinates stored in localStorage
    useEffect(() => {
        const fetchPharmacies = async () => {
            try {
                setLoading(true);
                setError(false);
                let lat = null;
                let lng = null;
                // Get coordinates from localStorage
                if (typeof window !== "undefined") {
                    const savedCords = localStorage.getItem("userCoords");
                    if (savedCords) {
                        try {
                            const parsed = JSON.parse(savedCords);
                            lat = parsed.lat;
                            lng = parsed.lng;
                            console.log("Latitude:", lat);
                            console.log("Longitude:", lng);
                        } catch (e) {
                            console.error(
                                "Error reading stored user coordinates:",
                                e
                            );
                        }
                    }
                }
                // Send exact coordinates to backend
                const searchPayload = {
                    lat: lat,
                    lng: lng,
                    search: "",
                };
                console.log("Payload:", searchPayload);
                const response = await UserAPI.getAllPharmacies(searchPayload);
                if (response?.success) {
                    setPharmacies(response.data || []);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Failed to load pharmacies:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacies();
    }, []);

    // Helper to format/sanitize node backslash upload paths and prefix the base URL
    const getPharmacyImage = (ph) => {
        const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

        if (ph.profileImage) {
            // Replace backslashes with forward slashes
            let cleanPath = ph.profileImage.replace(/\\/g, '/');
            // Remove 'public/' prefix from path if returned by backend
            cleanPath = cleanPath.replace(/^public\//, '');
            // Prevent double-slashes by ensuring path doesn't start with a slash
            if (cleanPath.startsWith('/')) {
                cleanPath = cleanPath.substring(1);
            }
            return `${BASE_URL}/${cleanPath}`;
        }

        if (ph.documents?.pharmacyImages?.length > 0) {
            let cleanPath = ph.documents.pharmacyImages[0].replace(/\\/g, '/');
            cleanPath = cleanPath.replace(/^public\//, '');
            if (cleanPath.startsWith('/')) {
                cleanPath = cleanPath.substring(1);
            }
            return `${BASE_URL}/${cleanPath}`;
        }

        // Return static high-quality fallback image if none exist
        return "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop";
    };

    // Stable mock ratings mapping for clean layout aesthetics
    const getPharmacyRating = (index) => {
        const ratings = [4.9, 4.8, 4.7, 4.6];
        return ratings[index % ratings.length];
    };

    return (
        <main className="min-h-screen lg:h-screen lg:overflow-hidden flex flex-col bg-[#f8fbff] pt-6 pb-6 lg:pb-8 antialiased">

            {/* Outer Grid Container */}
            <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col lg:flex-1 lg:min-h-0">

                {/* --- HEADER & SEARCH (Non-scrollable shrink-0 element) --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 shrink-0">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            {selectedPharmacy ? selectedPharmacy.name : "All Pharmacies"}
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                            <p className="text-slate-500 font-medium text-sm">
                                {selectedPharmacy
                                    ? `Browsing products from ${selectedPharmacy.city || selectedPharmacy.state}`
                                    : "Order genuine medicines from verified partners"}
                            </p>
                            {selectedPharmacy && (
                                <button
                                    onClick={() => setIsModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#3d3f96]/10 text-[#3d3f96] hover:bg-[#3d3f96]/20 transition-colors rounded-full text-xs font-bold"
                                >
                                    <Info size={14} /> View Pharmacy Details
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#3d3f96] transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search medicines in this store..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm outline-none focus:border-[#3d3f96] transition-all font-medium text-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* --- COLUMN WRAPPER (Responsive independent scrolls) --- */}
                <div className="flex flex-col lg:flex-row gap-8 lg:flex-1 lg:min-h-0 lg:overflow-hidden">

                    {/* --- LEFT SIDE: PHARMACY LIST --- */}
                    <aside className="w-full lg:w-80 shrink-0 flex flex-col lg:h-full lg:min-h-0">
                        <div className="flex items-center gap-2 mb-4 px-2 shrink-0">
                            <Store size={18} className="text-[#3d3f96]" />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Partner Stores</span>
                        </div>

                        {/* Pharmacy List with Scrollbars Hidden */}
                        <div className="flex lg:flex-col overflow-x-auto lg:overflow-y-auto lg:overflow-x-visible gap-4 pb-4 lg:pb-2 lg:flex-1 lg:pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                            {/* "All Products" Toggle */}
                            <button
                                onClick={() => setSelectedPharmacy(null)}
                                className={`flex-shrink-0 w-72 lg:w-full flex items-center gap-4 p-4 rounded-3xl border-2 transition-all duration-300 shrink-0 ${!selectedPharmacy
                                    ? 'bg-[#3d3f96] border-[#3d3f96] text-white shadow-xl shadow-indigo-100'
                                    : 'bg-white border-white text-slate-600 hover:border-slate-200 shadow-sm'
                                    }`}
                            >
                                <div className={`p-2 rounded-xl ${!selectedPharmacy ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    <LayoutGrid size={20} />
                                </div>
                                <span className="font-bold text-sm whitespace-nowrap">All Medicines</span>
                            </button>

                            {/* LOADING STATE - SKELETONS */}
                            {loading && (
                                [1, 2, 3].map((num) => (
                                    <div key={num} className="flex-shrink-0 w-72 lg:w-full bg-white border border-slate-100 p-4 rounded-3xl animate-pulse space-y-3">
                                        <div className="flex gap-3">
                                            <div className="w-12 h-12 bg-slate-100 rounded-2xl" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                                                <div className="h-3 bg-slate-100 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}

                            {/* ERROR STATE */}
                            {!loading && error && (
                                <div className="p-4 bg-rose-50 border border-rose-100 rounded-3xl text-center">
                                    <AlertCircle className="mx-auto text-rose-500 mb-2" size={20} />
                                    <p className="text-xs font-bold text-slate-600">Failed to load local partners</p>
                                </div>
                            )}

                            {/* EMPTY STATE */}
                            {!loading && !error && pharmacies.length === 0 && (
                                <div className="p-6 bg-slate-50 rounded-3xl text-center border-2 border-dashed border-slate-100">
                                    <p className="text-xs font-bold text-slate-500">No partner stores found nearby</p>
                                </div>
                            )}

                            {/* POPULATED STORE CARDS */}
                            {!loading && !error && pharmacies.map((pharmacy, index) => {
                                const rating = getPharmacyRating(index);
                                const isSelected = selectedPharmacy?._id === pharmacy._id;
                                const is24hr = pharmacy.is24x7 ?? false;
                                const openStatusString = pharmacy.openStatus || (is24hr ? "Open 24 Hours" : "Open Now");
                                const deliveryDetails = pharmacy.isHomeDeliveryAvailable ? "Home Delivery Available" : "Store Pickup Only";
                                const formattedLocation = [pharmacy.city, pharmacy.state].filter(Boolean).join(', ');

                                return (
                                    <button
                                        key={pharmacy._id || index}
                                        onClick={() => setSelectedPharmacy(pharmacy)}
                                        className={`flex-shrink-0 w-72 lg:w-full flex flex-col gap-3 p-4 rounded-3xl border-2 transition-all duration-300 text-left shrink-0 ${isSelected
                                            ? 'bg-[#3d3f96] border-[#3d3f96] text-white shadow-xl shadow-indigo-100'
                                            : 'bg-white border-white text-slate-600 hover:border-slate-200 shadow-sm'
                                            }`}
                                    >
                                        {/* Header Info: Image, Name, Rating */}
                                        <div className="flex items-start gap-3 w-full">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20 bg-slate-50">
                                                <img
                                                    src={getPharmacyImage(pharmacy)}
                                                    alt={pharmacy.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm truncate">{pharmacy.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                    <span className={`text-[10px] font-bold ${isSelected ? "text-blue-100" : "text-slate-400"}`}>
                                                        {rating}
                                                    </span>
                                                    <span className="mx-1 text-[10px] opacity-30">•</span>
                                                    <span className={`text-[10px] font-medium truncate ${isSelected ? "text-indigo-150" : "text-slate-400"}`}>
                                                        {pharmacy.distance ? `${pharmacy.distance} km away` : formattedLocation}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className={`h-[1px] w-full ${isSelected ? 'bg-white/15' : 'bg-slate-100'}`} />

                                        {/* Simplified Metadata Block */}
                                        <div className="space-y-1 w-full text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <Clock size={12} className={isSelected ? "text-indigo-200" : "text-slate-400"} />
                                                <span className={`font-medium ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                                                    {openStatusString}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Truck size={12} className={isSelected ? "text-indigo-200" : "text-slate-400"} />
                                                <span className={`font-medium truncate ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                                                    {deliveryDetails}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* --- RIGHT SIDE: PRODUCTS GRID --- */}
                    <div className="flex-1 lg:h-full lg:overflow-y-auto lg:pr-2 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPharmacy ? selectedPharmacy._id : 'all'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AllMedicines
                                    pharmacyId={selectedPharmacy?._id}
                                    searchQuery={searchQuery}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            {/* --- SEPARATE PHARMACY DETAIL MODAL --- */}
            <PharmacyDetail
                pharmacyId={selectedPharmacy?._id}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </main>
    );
};

export default PharmacyPage;