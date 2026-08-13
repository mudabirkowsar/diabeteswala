"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Store,
    ChevronRight,
    Search,
    Star,
    LayoutGrid,
    Info,
    Clock,
    Truck
} from 'lucide-react';
import AllMedicines from './components/AllMedicines';
import PharmacyDetail from './components/PharmacyDetail'; // Make sure the path matches your setup

const PharmacyPage = () => {
    const [selectedPharmacy, setSelectedPharmacy] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const pharmacies = [
        {
            id: 1,
            name: "DiabetesWala Central",
            location: "Sector 15, Gurgaon",
            rating: 4.9,
            image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 01234",
            hours: "8:00 AM - 11:00 PM",
            license: "DL-12053-GUR",
            delivery: "Instant delivery in 2 hours"
        },
        {
            id: 2,
            name: "Apollo Pharmacy",
            location: "DLF Phase 3",
            rating: 4.7,
            image: "https://images.unsplash.com/photo-1631549916768-4119b255f926?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 56789",
            hours: "Open 24 Hours",
            license: "DL-99432-DLF",
            delivery: "Free delivery over ₹499"
        },
        {
            id: 3,
            name: "Wellness Forever",
            location: "MG Road, Delhi",
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 11122",
            hours: "Open 24 Hours",
            license: "DL-44810-DEL",
            delivery: "Same-day delivery"
        },
        {
            id: 4,
            name: "Guardian Life",
            location: "Noida Sec 62",
            rating: 4.6,
            image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 33344",
            hours: "9:00 AM - 10:00 PM",
            license: "DL-77321-NOI",
            delivery: "Next-day standard delivery"
        },
    ];

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
                                {selectedPharmacy ? `Browsing products from ${selectedPharmacy.location}` : "Order genuine medicines from verified partners"}
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
                                className={`flex-shrink-0 w-72 lg:w-full flex items-center gap-4 p-4 rounded-3xl border-2 transition-all duration-300 shrink-0 ${!selectedPharmacy ? 'bg-[#3d3f96] border-[#3d3f96] text-white shadow-xl shadow-indigo-100' : 'bg-white border-white text-slate-600 hover:border-slate-200 shadow-sm'}`}
                            >
                                <div className={`p-2 rounded-xl ${!selectedPharmacy ? 'bg-white/20' : 'bg-slate-100'}`}>
                                    <LayoutGrid size={20} />
                                </div>
                                <span className="font-bold text-sm whitespace-nowrap">All Medicines</span>
                            </button>

                            {pharmacies.map((pharmacy) => (
                                <button
                                    key={pharmacy.id}
                                    onClick={() => setSelectedPharmacy(pharmacy)}
                                    className={`flex-shrink-0 w-72 lg:w-full flex flex-col gap-3 p-4 rounded-3xl border-2 transition-all duration-300 text-left shrink-0 ${selectedPharmacy?.id === pharmacy.id ? 'bg-[#3d3f96] border-[#3d3f96] text-white shadow-xl shadow-indigo-100' : 'bg-white border-white text-slate-600 hover:border-slate-200 shadow-sm'}`}
                                >
                                    {/* Header Info: Image, Name, Rating */}
                                    <div className="flex items-start gap-3 w-full">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 border-2 border-white/20">
                                            <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{pharmacy.name}</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                                <span className={`text-[10px] font-bold ${selectedPharmacy?.id === pharmacy.id ? "text-blue-100" : "text-slate-400"}`}>{pharmacy.rating}</span>
                                                <span className="mx-1 text-[10px] opacity-30">•</span>
                                                <span className={`text-[10px] font-medium truncate ${selectedPharmacy?.id === pharmacy.id ? "text-indigo-150" : "text-slate-400"}`}>{pharmacy.location.split(',')[0]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Divider */}
                                    <div className={`h-[1px] w-full ${selectedPharmacy?.id === pharmacy.id ? 'bg-white/15' : 'bg-slate-100'}`} />

                                    {/* Simplified Metadata Block */}
                                    <div className="space-y-1 w-full text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} className={selectedPharmacy?.id === pharmacy.id ? "text-indigo-200" : "text-slate-400"} />
                                            <span className={`font-medium ${selectedPharmacy?.id === pharmacy.id ? "text-indigo-100" : "text-slate-500"}`}>{pharmacy.hours}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Truck size={12} className={selectedPharmacy?.id === pharmacy.id ? "text-indigo-200" : "text-slate-400"} />
                                            <span className={`font-medium truncate ${selectedPharmacy?.id === pharmacy.id ? "text-indigo-100" : "text-slate-500"}`}>{pharmacy.delivery}</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* --- RIGHT SIDE: PRODUCTS GRID --- */}
                    <div className="flex-1 lg:h-full lg:overflow-y-auto lg:pr-2 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedPharmacy ? selectedPharmacy.id : 'all'}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AllMedicines
                                    pharmacyId={selectedPharmacy?.id}
                                    searchQuery={searchQuery}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                </div>
            </div>

            {/* --- SEPARATE PHARMACY DETAIL MODAL --- */}
            <PharmacyDetail
                pharmacyId={selectedPharmacy?.id}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </main>
    );
};

export default PharmacyPage;