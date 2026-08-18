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
    Loader2,
    Mail,
    FileText,
    Image as ImageIcon,
    Building,
    CheckCircle
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust relative path based on setup

const BASE_URL = "http://192.168.1.3:5002";

const PharmacyDetail = ({ pharmacyId, isOpen, onClose }) => {
    const [pharmacy, setPharmacy] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!pharmacyId || !isOpen) return;

        const fetchPharmacyDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await UserAPI.getPharmacyProfileDetails(pharmacyId);
                if (response && response.success) {
                    setPharmacy(response.data);
                } else {
                    setError("Store information could not be retrieved");
                }
            } catch (err) {
                console.error("Error loading pharmacy details:", err);
                setError("Failed to load pharmacy details");
            } finally {
                setLoading(false);
            }
        };

        fetchPharmacyDetails();
    }, [pharmacyId, isOpen]);

    // Sanitizes and formats media URLs with the correct host prefix
    const getFullImageUrl = (path) => {
        if (!path) return "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?q=80&w=400&auto=format&fit=crop";
        if (path.startsWith('http://') || path.startsWith('https://')) return path;

        let cleanPath = path.replace(/\\/g, '/');
        cleanPath = cleanPath.replace(/^public\//, '');
        if (cleanPath.startsWith('/')) {
            cleanPath = cleanPath.substring(1);
        }
        return `${BASE_URL}/${cleanPath}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop Overlay */}
                    <motion.div
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal Box */}
                    <motion.div
                        className="bg-white rounded-[2.5rem] max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 relative z-10 max-h-[90vh] flex flex-col"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 bg-white/85 backdrop-blur-md text-slate-700 hover:bg-white p-2.5 rounded-full border border-slate-100 shadow-md transition-colors"
                        >
                            <X size={18} />
                        </button>

                        {loading ? (
                            /* Loading Spinner State */
                            <div className="flex-1 flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                                <p className="text-slate-400 text-sm font-semibold">Retrieving store details...</p>
                            </div>
                        ) : error ? (
                            /* Error Handling State */
                            <div className="flex-1 flex flex-col items-center justify-center py-20 px-8 text-center">
                                <p className="text-red-500 font-bold mb-2">{error}</p>
                                <button onClick={onClose} className="text-xs font-bold text-slate-500 hover:underline">
                                    Close Window
                                </button>
                            </div>
                        ) : pharmacy ? (
                            /* Data Rendered State */
                            <>
                                <div className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                                    {/* --- HERO IMAGE & PRIMARY BADGES --- */}
                                    <div className="relative h-56 bg-slate-100 shrink-0">
                                        <img
                                            src={getFullImageUrl(pharmacy.profileImage)}
                                            alt={pharmacy.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                                        {/* Status & Rating Badges */}
                                        <div className="absolute top-4 left-6 flex gap-2">
                                            {/* Rating */}
                                            <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-slate-100/50">
                                                <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                <span className="text-[11px] font-black text-slate-800">{pharmacy.rating || "4.8"}</span>
                                                {pharmacy.totalReviews > 0 && (
                                                    <span className="text-[9px] text-slate-400 font-bold">({pharmacy.totalReviews})</span>
                                                )}
                                            </div>

                                            {/* Online Status */}
                                            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-slate-100/50">
                                                <span className={`h-2 w-2 rounded-full ${pharmacy.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">
                                                    {pharmacy.isOnline ? 'Online' : 'Offline'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Store Name & Location */}
                                        <div className="absolute bottom-5 left-6 right-6 text-white">
                                            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{pharmacy.name}</h2>
                                            <p className="text-white/80 text-xs font-bold mt-1.5 flex items-center gap-1">
                                                <MapPin size={12} className="text-indigo-300" />
                                                {[pharmacy.city, pharmacy.state, pharmacy.country].filter(Boolean).join(', ')}
                                            </p>
                                        </div>
                                    </div>

                                    {/* --- MAIN DETAILS CONTAINER --- */}
                                    <div className="p-6 sm:p-8 space-y-8">

                                        {/* About Segment */}
                                        {pharmacy.about && (
                                            <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">About Store</p>
                                                <p className="text-xs font-bold text-slate-600 mt-1.5 leading-relaxed">
                                                    {pharmacy.about}
                                                </p>
                                            </div>
                                        )}

                                        {/* Two Column Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* Left Column: Operations & Contact */}
                                            <div className="space-y-5">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Operations & Contact</p>

                                                {/* Hours & 24x7 Status */}
                                                <div className="flex items-start gap-3.5">
                                                    <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl shrink-0">
                                                        <Clock size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Business Hours</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5">
                                                            {pharmacy.is24x7 ? "Open 24 Hours / 7 Days" : "8:00 AM - 11:00 PM"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Delivery Options */}
                                                <div className="flex items-start gap-3.5">
                                                    <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl shrink-0">
                                                        <Truck size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Delivery Logistics</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5">
                                                            {pharmacy.isHomeDeliveryAvailable ? "Home Delivery Available" : "Store Pickup Only"}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Contact Phone */}
                                                <div className="flex items-start gap-3.5">
                                                    <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl shrink-0">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Telephone Number</p>
                                                        <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.phone}</p>
                                                    </div>
                                                </div>

                                                {/* Contact Email */}
                                                {pharmacy.email && (
                                                    <div className="flex items-start gap-3.5">
                                                        <div className="p-2.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded-xl shrink-0">
                                                            <Mail size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Address</p>
                                                            <p className="text-sm font-bold text-slate-700 mt-0.5 break-all">{pharmacy.email}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Column: Credentials & Status */}
                                            <div className="space-y-5">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 pb-2">Store Credentials</p>

                                                {/* GST Register Details */}
                                                {pharmacy.documents?.gstNumber && (
                                                    <div className="flex items-start gap-3.5">
                                                        <div className="p-2.5 bg-indigo-50/60 text-[#3d3f96] rounded-xl shrink-0">
                                                            <FileText size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">GSTIN Identifier</p>
                                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.documents.gstNumber}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Drug License Details */}
                                                {pharmacy.documents?.drugLicenseType && (
                                                    <div className="flex items-start gap-3.5">
                                                        <div className="p-2.5 bg-indigo-50/60 text-[#3d3f96] rounded-xl shrink-0">
                                                            <ShieldCheck size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Drug License Class</p>
                                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.documents.drugLicenseType} License</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Document issuing details */}
                                                {pharmacy.documents?.issuingAuthority && (
                                                    <div className="flex items-start gap-3.5">
                                                        <div className="p-2.5 bg-indigo-50/60 text-[#3d3f96] rounded-xl shrink-0">
                                                            <Building size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Issuing Authority</p>
                                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.documents.issuingAuthority}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* State Jurisdiction */}
                                                {pharmacy.documents?.documentState && (
                                                    <div className="flex items-start gap-3.5">
                                                        <div className="p-2.5 bg-indigo-50/60 text-[#3d3f96] rounded-xl shrink-0">
                                                            <CheckCircle size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Document Jurisdictional State</p>
                                                            <p className="text-sm font-bold text-slate-700 mt-0.5">{pharmacy.documents.documentState}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* --- GALLERY & DOCUMENTS SECTION --- */}
                                        {(pharmacy.documents?.pharmacyImages?.length > 0 ||
                                            pharmacy.documents?.pharmacyLicenses?.length > 0 ||
                                            pharmacy.documents?.pharmacyCertificates?.length > 0) && (
                                                <div className="space-y-4 pt-2 border-t border-slate-100">
                                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verified Media & Certificates</p>
                                                    <div className="flex flex-col gap-4">

                                                        {/* Store Images */}
                                                        {pharmacy.documents?.pharmacyImages?.length > 0 && (
                                                            <div>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                                    <ImageIcon size={10} /> Store Gallery
                                                                </span>
                                                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
                                                                    {pharmacy.documents.pharmacyImages.map((imgUrl, i) => (
                                                                        <a key={i} href={getFullImageUrl(imgUrl)} target="_blank" rel="noreferrer" className="shrink-0 group relative rounded-2xl overflow-hidden border border-slate-100 h-20 w-28 bg-slate-50 shadow-sm block">
                                                                            <img src={getFullImageUrl(imgUrl)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Store Preview" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Licenses Preview */}
                                                        {pharmacy.documents?.pharmacyLicenses?.length > 0 && (
                                                            <div>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                                    <ShieldCheck size={10} /> Operating Licenses
                                                                </span>
                                                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
                                                                    {pharmacy.documents.pharmacyLicenses.map((licenseUrl, i) => (
                                                                        <a key={i} href={getFullImageUrl(licenseUrl)} target="_blank" rel="noreferrer" className="shrink-0 group relative rounded-2xl overflow-hidden border border-slate-100 h-20 w-28 bg-slate-50 shadow-sm block">
                                                                            <img src={getFullImageUrl(licenseUrl)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="License Preview" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Certificates Preview */}
                                                        {pharmacy.documents?.pharmacyCertificates?.length > 0 && (
                                                            <div>
                                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                                    <FileText size={10} /> Registration Certificates
                                                                </span>
                                                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none select-none">
                                                                    {pharmacy.documents.pharmacyCertificates.map((certUrl, i) => (
                                                                        <a key={i} href={getFullImageUrl(certUrl)} target="_blank" rel="noreferrer" className="shrink-0 group relative rounded-2xl overflow-hidden border border-slate-100 h-20 w-28 bg-slate-50 shadow-sm block">
                                                                            <img src={getFullImageUrl(certUrl)} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Certificate Preview" />
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                    </div>
                                                </div>
                                            )}

                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="p-6 bg-slate-50 border-t border-slate-100 shrink-0 flex gap-4">
                                    <button
                                        onClick={onClose}
                                        className="w-full py-4 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-sm rounded-2xl shadow-lg shadow-indigo-100/40 transition-all duration-300 active:scale-95 text-center"
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