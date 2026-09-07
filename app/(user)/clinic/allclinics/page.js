"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Building2,
    Search,
    MapPin,
    Phone,
    Clock,
    Star,
    ShieldCheck,
    Sparkles,
    Stethoscope,
    Loader2,
    ChevronRight,
    AlertCircle,
    Inbox,
    CheckCircle2,
    Navigation,
    ShieldAlert
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import User API Service
import UserAPI from '../../../services/UserAPI'; // Adjust relative path based on folder depth

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=600&auto=format&fit=crop";

export default function NearestClinicsPage() {
    const router = useRouter();

    // --- Data & Loading States ---
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radiusText, setRadiusText] = useState('');
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalDocs: 0
    });

    // --- Search & Filter States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [facilityFilter, setFacilityFilter] = useState('All'); // 'All' | 'isEmergency' | 'is24x7' | 'isOPD' | 'isIPD'

    // --- Retrieve Stored User Coordinates ---
    const getInitialCoords = () => {
        let lat;
        let lng;
        if (typeof window !== "undefined") {
            const savedCoords = localStorage.getItem("userCoords");
            if (savedCoords) {
                try {
                    const parsed = JSON.parse(savedCoords);
                    if (parsed.lat !== undefined && parsed.lng !== undefined) {
                        lat = Number(parsed.lat);
                        lng = Number(parsed.lng);
                    }
                } catch (e) {
                    console.error("Error reading stored user coordinates:", e);
                }
            }
        }
        return { lat, lng };
    };

    // --- Fetch Nearest Clinics from Backend ---
    const fetchClinics = async (pageNumber = 1) => {
        setLoading(true);
        const { lat, lng } = getInitialCoords();

        // Build Payload according to API specifications
        const locationPayload = {
            ...(lat !== undefined && { lat }),
            ...(lng !== undefined && { lng }),
            ...(searchQuery.trim() && { search: searchQuery.trim() }),
            ...(facilityFilter === 'isEmergency' && { isEmergency: true }),
            ...(facilityFilter === 'is24x7' && { is24x7: true }),
            ...(facilityFilter === 'isOPD' && { isOPD: true }),
            ...(facilityFilter === 'isIPD' && { isIPD: true })
        };

        const params = {
            page: pageNumber,
            limit: 12
        };

        try {
            const response = await UserAPI.getUserNearestClinics(locationPayload, params);
            if (response && response.success) {
                setClinics(response.data || []);
                setPagination({
                    currentPage: response.currentPage || 1,
                    totalPages: response.totalPages || 1,
                    totalDocs: response.totalDocs || 0
                });
                if (response.maxDistanceLimitApplied) {
                    setRadiusText(response.maxDistanceLimitApplied);
                }
            } else {
                setClinics([]);
            }
        } catch (err) {
            console.error("Error fetching nearest clinics:", err);
            toast.error(err.response?.data?.message || "Failed to load nearest clinics.");
            setClinics([]);
        } finally {
            setLoading(false);
        }
    };

    // Re-fetch on filter or search changes
    useEffect(() => {
        fetchClinics(1);
    }, [facilityFilter, searchQuery]);

    // Navigate to Clinic Detail Page
    const handleClinicClick = (clinicId) => {
        if (!clinicId) return;
        router.push(`/clinic/clinicdetail/${clinicId}`);
    };

    // Direct Phone Dialer Action
    const handlePhoneCall = (e, phoneNumber) => {
        e.stopPropagation();
        if (phoneNumber) {
            window.open(`tel:${phoneNumber}`, '_self');
        }
    };

    const facilityTabs = [
        { id: 'All', label: 'All Clinics' },
        { id: 'isEmergency', label: 'Emergency Ready' },
        { id: 'is24x7', label: '24/7 Open' },
        { id: 'isOPD', label: 'OPD Consultations' },
        { id: 'isIPD', label: 'IPD / Daycare' }
    ];

    return (
        <div className="min-h-screen bg-[#f8fbff] py-8 sm:py-10 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left text-slate-800">
            <Toaster position="top-right" />

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4  pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center  shrink-0 shadow-sm">
                        <Building2 className="w-7 h-7" strokeWidth={2.2} />
                    </div>
                    <div>
                        <div className="flex flex-wrap items-center gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Our <span className="text-[#3d3f96]">Certified Clinics</span>
                            </h1>
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-black uppercase text-red-600 bg-red-50/80 border border-red-200/70 px-3 py-0.5 rounded-full shadow-xs">
                                <Sparkles size={11} className="animate-pulse" /> Live Distance Engine
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
                            Discover verified doctor-led clinics, emergency OPDs, and daycare medical centers nearby {radiusText ? `(within ${radiusText})` : ''}   .
                        </p>
                    </div>
                </div>

                {radiusText && (
                    <div className="text-xs font-bold text-slate-500 bg-white border border-slate-200/80 px-4 py-2 rounded-2xl shadow-xs self-start sm:self-auto">
                        Radius: <strong className="text-[#3d3f96]">{radiusText}</strong>
                    </div>
                )}
            </div>

            {/* --- SEARCH & FACILITY FILTERS BAR --- */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Search Input */}
                    <div className="relative w-full lg:w-[440px]">
                        <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by Clinic Name, Doctor, or Address..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition shadow-inner"
                        />
                    </div>

                    {/* Facility Switcher Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto [&::-webkit-scrollbar]:hidden pb-1 lg:pb-0">
                        {facilityTabs.map((tab) => {
                            const isSelected = facilityFilter === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setFacilityFilter(tab.id)}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border shrink-0 ${isSelected
                                            ? 'bg-red-50/70 text-red-600 border-red-200/80 font-black shadow-sm'
                                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* --- CLINICS GRID LIST --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-red-500 mb-3" size={40} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Scanning verified clinics in your area...   </p>
                </div>
            ) : clinics.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm border-dashed">
                    <Building2 size={44} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Nearby Clinics Found   </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        We could not locate any active certified clinics matching your filters. Try adjusting your search parameters   .
                    </p>
                </div>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {clinics.map((clinic) => {
                            const clinicImage = getMediaUrl(clinic.posterimage || clinic.image) || CLINIC_PLACEHOLDER;
                            const fullAddress = [clinic.address, clinic.city, clinic.state]
                                .filter(Boolean)
                                .join(', ') || 'Address not specified';

                            return (
                                <div
                                    key={clinic._id}
                                    onClick={() => handleClinicClick(clinic._id)}
                                    className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden cursor-pointer flex flex-col justify-between text-left"
                                >
                                    <div>
                                        {/* Image Banner Container with Overlays */}
                                        <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                                            <img
                                                src={clinicImage}
                                                alt={clinic.clinicName}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e) => { e.target.src = CLINIC_PLACEHOLDER; }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                            {/* Top Left: Verified Badge */}
                                            {clinic.isVerified && (
                                                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm z-20">
                                                    <CheckCircle2 size={12} className="text-emerald-500" />
                                                    <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                                                        Verified
                                                    </span>
                                                </div>
                                            )}

                                            {/* Top Right: Custom Badge */}
                                            {clinic.badge && (
                                                <div className="absolute top-4 right-4 bg-red-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm z-20">
                                                    {clinic.badge}
                                                </div>
                                            )}

                                            {/* Bottom Left: Distance Tag */}
                                            {clinic.distanceText && (
                                                <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 border border-white/10 z-20">
                                                    <Navigation size={10} className="text-red-400 shrink-0 fill-red-400" />
                                                    <span>{clinic.distanceText}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Body Information */}
                                        <div className="p-6 space-y-3.5">

                                            {/* Rating Stars & Reviews */}
                                            <div className="flex items-center gap-1 text-amber-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={12}
                                                        fill={i < Math.floor(clinic.rating || 5) ? "currentColor" : "none"}
                                                        className={i < Math.floor(clinic.rating || 5) ? "text-amber-400" : "text-slate-200"}
                                                    />
                                                ))}
                                                <span className="text-[11px] font-bold text-slate-400 ml-1">
                                                    {clinic.rating || 5.0} ({clinic.reviewsCount || "Verified"})
                                                </span>
                                            </div>

                                            {/* Clinic Name & Doctor Incharge */}
                                            <div>
                                                <h3 className="text-lg font-black text-slate-900 leading-tight mb-1 group-hover:text-red-500 transition-colors line-clamp-1">
                                                    {clinic.clinicName}
                                                </h3>

                                                {clinic.doctorIncharge && (
                                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                                                        <Stethoscope size={13} className="text-[#3d3f96] shrink-0" />
                                                        <span>Lead: Dr. {clinic.doctorIncharge}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Location Details */}
                                            <div className="flex items-start gap-2 text-slate-500 pt-1 border-t border-slate-50">
                                                <MapPin size={14} className="text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-xs font-bold line-clamp-1 leading-snug">{fullAddress}</p>
                                            </div>

                                            {/* Operational Timing & Facility Badges */}
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider flex-wrap">
                                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                                    <Clock size={12} className="text-slate-400" />
                                                    <span>{clinic.is24x7 ? "24x7 Open" : clinic.timings || "09:00 AM - 08:00 PM"}</span>
                                                </div>

                                                {clinic.isEmergency && (
                                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200 text-[9px] font-black flex items-center gap-1">
                                                        <ShieldAlert size={10} /> Emergency
                                                    </span>
                                                )}
                                                {clinic.isOPD && (
                                                    <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md text-[9px] font-black">
                                                        OPD
                                                    </span>
                                                )}
                                                {clinic.isIPD && (
                                                    <span className="text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[9px] font-black">
                                                        IPD / Daycare
                                                    </span>
                                                )}
                                            </div>

                                        </div>
                                    </div>

                                    {/* Action Buttons Footer (Book Visit + Call) */}
                                    <div className="p-5 pt-0">
                                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClinicClick(clinic._id);
                                                }}
                                                className="bg-[#3d3f96] hover:bg-red-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                                            >
                                                Book Visit
                                            </button>

                                            <button
                                                type="button"
                                                onClick={(e) => handlePhoneCall(e, clinic.phoneNumber)}
                                                disabled={!clinic.phoneNumber}
                                                className="border border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-500 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer disabled:opacity-50"
                                                title={clinic.phoneNumber || "No phone available"}
                                            >
                                                <Phone size={13} /> Call
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            );
                        })}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 pt-6">
                            <button
                                disabled={pagination.currentPage <= 1}
                                onClick={() => fetchClinics(pagination.currentPage - 1)}
                                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs hover:bg-slate-50 transition"
                            >
                                Previous
                            </button>
                            <span className="text-xs font-bold text-slate-500 px-4">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                disabled={pagination.currentPage >= pagination.totalPages}
                                onClick={() => fetchClinics(pagination.currentPage + 1)}
                                className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs hover:bg-slate-50 transition"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* --- BOTTOM HEALTHCARE COMPLIANCE BANNER --- */}
            <div className="bg-gradient-to-br from-[#3d3f96] to-[#242664] rounded-[2.5rem] p-8 sm:p-12 text-white shadow-xl shadow-indigo-950/15 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden text-center sm:text-left">
                <div className="space-y-2 z-10 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-indigo-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/15">
                        <ShieldCheck size={12} /> Verified Healthcare Centers
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
                        Standardized Clinical Infrastructure &amp; Doctors
                    </h3>
                    <p className="text-xs sm:text-sm text-indigo-100/80 font-medium leading-relaxed">
                        All clinics listed in this directory operate with state health registrations and certified medical personnel
                    </p>
                </div>

                {/* Ambient background blur accent */}
                <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute left-10 -top-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
            </div>

        </div>
    );
}