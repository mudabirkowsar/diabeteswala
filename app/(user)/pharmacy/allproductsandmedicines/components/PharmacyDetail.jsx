"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    Phone, 
    Clock, 
    ShieldCheck, 
    Truck, 
    MapPin, 
    Star, 
    Loader2 
} from 'lucide-react';

const PharmacyDetail = ({ pharmacyId, isOpen, onClose }) => {
    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Simulated local database for mock API responses
    const mockDb = {
        1: { 
            name: "DiabetesWala Central", 
            location: "Sector 15, Gurgaon", 
            rating: 4.9, 
            image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 01234",
            hours: "8:00 AM - 11:00 PM",
            license: "DL-12053-GUR",
            delivery: "Instant delivery in 2 hours"
        },
        2: { 
            name: "Apollo Pharmacy", 
            location: "DLF Phase 3", 
            rating: 4.7, 
            image: "https://images.unsplash.com/photo-1631549916768-4119b255f926?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 56789",
            hours: "Open 24 Hours",
            license: "DL-99432-DLF",
            delivery: "Free home delivery on orders above ₹499"
        },
        3: { 
            name: "Wellness Forever", 
            location: "MG Road, Delhi", 
            rating: 4.8, 
            image: "https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 11122",
            hours: "Open 24 Hours",
            license: "DL-44810-DEL",
            delivery: "Same-day delivery inside Delhi"
        },
        4: { 
            name: "Guardian Life", 
            location: "Noida Sec 62", 
            rating: 4.6, 
            image: "https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?q=80&w=400&auto=format&fit=crop",
            phone: "+91 98765 33344",
            hours: "9:00 AM - 10:00 PM",
            license: "DL-77321-NOI",
            delivery: "Next-day standard delivery"
        }
    };

    useEffect(() => {
        if (!pharmacyId || !isOpen) return;

        const fetchPharmacyDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Simulate network latency (e.g., 800ms)
                await new Promise((resolve) => setTimeout(resolve, 800));

                /* 
                   Replace this mock block with your real API request:
                   const response = await fetch(`/api/pharmacy/${pharmacyId}`);
                   const data = await response.json();
                   setPharmacy(data);
                */
                const data = mockDb[pharmacyId];
                if (data) {
                    setPharmacy(data);
                } else {
                    setError("Pharmacy details not found");
                }
            } catch (err) {
                setError("Failed to load pharmacy details");
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDetails();
    }, [pharmacyId, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Box */}
                    <motion.div 
                        className="bg-white rounded-[2.5rem] max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative z-10 min-h-[350px] flex flex-col justify-between"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                    >
                        {/* Close Button */}
                        <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur-md text-slate-700 hover:bg-white p-2 rounded-full border border-slate-100 shadow-md transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {loading ? (
                            /* Loading Spinner State */
                            <div className="flex-1 flex flex-col items-center justify-center p-12">
                                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                                <p className="text-slate-400 text-sm font-semibold">Retrieving store information...</p>
                            </div>
                        ) : error ? (
                            /* Error Handling State */
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <p className="text-red-500 font-bold mb-2">{error}</p>
                                <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:underline">
                                    Go Back
                                </button>
                            </div>
                        ) : pharmacy ? (
                            /* Data Rendered State */
                            <>
                                <div>
                                    {/* Pharmacy Header Image */}
                                    <div className="relative h-48 bg-slate-100">
                                        <img src={pharmacy.image} alt={pharmacy.name} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-6 right-6 text-white">
                                            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-lg w-max mb-2 border border-white/10">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-xs font-black">{pharmacy.rating}</span>
                                            </div>
                                            <h2 className="text-2xl font-black">{pharmacy.name}</h2>
                                        </div>
                                    </div>

                                    {/* Details List */}
                                    <div className="p-6 space-y-5">
                                        {/* Location */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Location</p>
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.location}</p>
                                            </div>
                                        </div>

                                        {/* Hours */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl">
                                                <Clock size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Business Hours</p>
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.hours}</p>
                                            </div>
                                        </div>

                                        {/* Phone */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Contact Number</p>
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.phone}</p>
                                            </div>
                                        </div>

                                        {/* License */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl">
                                                <ShieldCheck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">License Number</p>
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.license}</p>
                                            </div>
                                        </div>

                                        {/* Delivery Info */}
                                        <div className="flex items-start gap-3.5">
                                            <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl">
                                                <Truck size={18} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Delivery Details</p>
                                                <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.delivery}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="px-6 pb-6 pt-2">
                                    <button 
                                        onClick={onClose}
                                        className="w-full py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-colors"
                                    >
                                        Close Details
                                    </button>
                                </div>
                            </>
                        ) : null}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PharmacyDetail;