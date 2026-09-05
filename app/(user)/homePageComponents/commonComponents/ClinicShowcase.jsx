"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MapPin,
    Star,
    Clock,
    Phone,
    ChevronRight,
    CheckCircle2,
    Loader2,
    Building2,
    Navigation,
    ShieldAlert
} from 'lucide-react';

import UserAPI from '../../../services/UserAPI';

// --- MEDIA HELPER ---
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

export default function ClinicShowcase() {
    const router = useRouter();

    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radiusInfo, setRadiusInfo] = useState('');

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

    const fetchNearestClinics = async (targetCoords) => {
        setLoading(true);
        try {
            const payload = {};
            if (targetCoords?.lat && targetCoords?.lng) {
                payload.lat = targetCoords.lat;
                payload.lng = targetCoords.lng;
            }

            const response = await UserAPI.getUserNearestClinics(payload, {
                page: 1,
                limit: 12
            });

            if (response && response.success) {
                setClinics(response.data || []);
                if (response.maxDistanceLimitApplied) {
                    setRadiusInfo(response.maxDistanceLimitApplied);
                }
            } else {
                setClinics([]);
            }
        } catch (error) {
            console.error("Failed to fetch nearest clinics:", error);
            setClinics([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialCoords = getInitialCoords();
        fetchNearestClinics(initialCoords);
    }, []);

    // Navigate to Clinic Detail Page
    const handleClinicClick = (clinicId) => {
        if (!clinicId) return;
        router.push(`/clinic/clinicdetail/${clinicId}`);
    };

    const handlePhoneCall = (e, phoneNumber) => {
        e.stopPropagation();
        if (phoneNumber) {
            window.open(`tel:${phoneNumber}`, '_self');
        }
    };

    return (
        <section className="py-12 antialiased select-none">
            <div className="max-w-[1400px] mx-auto px-6">
                
                {/* Header Section */}
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                            Our <span className="text-[#3d3f96]">Premium Clinics</span>
                        </h2>
                        <p className="text-slate-500 text-sm font-medium mt-1">
                            Experience certified diabetes & multi-speciality care in person {radiusInfo ? `(within ${radiusInfo})` : ''}
                        </p>
                    </div>

                    <button 
                        onClick={() => router.push('/clinic/allclinics')}
                        className="text-red-500 hover:text-red-600 font-bold text-xs flex items-center gap-1 hover:underline uppercase tracking-wider cursor-pointer"
                    >
                        View All Locations <ChevronRight size={14} />
                    </button>
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-50/60 rounded-3xl border border-slate-100">
                        <Loader2 className="animate-spin text-red-500 mb-3" size={36} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Scanning verified clinics in your area...
                        </p>
                    </div>
                ) : clinics.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                        <Building2 size={40} className="text-slate-300 mb-3" />
                        <h3 className="text-base font-bold text-slate-700">No Nearby Clinics Found</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm">
                            We could not locate any active certified clinics near your location. Try searching another area.
                        </p>
                    </div>
                ) : (
                    <div className="flex overflow-x-auto gap-6 pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {clinics.map((clinic) => {
                            const clinicImage = getMediaUrl(clinic.image || clinic.posterimage) || CLINIC_PLACEHOLDER;
                            const fullAddress = [clinic.address, clinic.city, clinic.state]
                                .filter(Boolean)
                                .join(', ') || 'Address not specified';

                            return (
                                <div
                                    key={clinic._id}
                                    onClick={() => handleClinicClick(clinic._id)}
                                    className="flex-shrink-0 w-80 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden cursor-pointer flex flex-col justify-between"
                                >
                                    {/* Image with Red Accent Badges */}
                                    <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={clinicImage}
                                            alt={clinic.clinicName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => { e.target.src = CLINIC_PLACEHOLDER; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

                                        {/* Verified Badge */}
                                        {clinic.isVerified && (
                                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md px-3 py-1 rounded-xl flex items-center gap-1.5 shadow-sm">
                                                <CheckCircle2 size={12} className="text-emerald-500" />
                                                <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter">
                                                    Verified
                                                </span>
                                            </div>
                                        )}

                                        {/* Badge / Tag (Secondary Red accent) */}
                                        {clinic.badge && (
                                            <div className="absolute top-4 right-4 bg-red-500 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                                                {clinic.badge}
                                            </div>
                                        )}

                                        {/* Distance Tag */}
                                        {clinic.distanceText && (
                                            <div className="absolute bottom-3 left-4 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 border border-white/10">
                                                <Navigation size={10} className="text-red-400 shrink-0 fill-red-400" />
                                                <span>{clinic.distanceText}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Body Information */}
                                    <div className="p-6 flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Rating */}
                                            <div className="flex items-center gap-1 text-amber-400 mb-2">
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

                                            {/* Clinic Name */}
                                            <h3 className="text-lg font-black text-slate-800 leading-tight mb-1 group-hover:text-red-500 transition-colors line-clamp-1">
                                                {clinic.clinicName}
                                            </h3>

                                            {/* Doctor Incharge */}
                                            {clinic.doctorIncharge && (
                                                <p className="text-[11px] font-bold text-slate-400 mb-3">
                                                    Lead: Dr. {clinic.doctorIncharge}
                                                </p>
                                            )}

                                            {/* Location */}
                                            <div className="flex items-start gap-2 text-slate-500 mb-3">
                                                <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" />
                                                <p className="text-xs font-bold line-clamp-1">{fullAddress}</p>
                                            </div>

                                            {/* Operational Timing & Status */}
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-6 flex-wrap">
                                                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-lg">
                                                    <Clock size={13} className="text-slate-400" />
                                                    <span>{clinic.is24x7 ? "24x7 Open" : clinic.timings || "09:00 AM - 08:00 PM"}</span>
                                                </div>
                                                {clinic.isEmergency && (
                                                    <span className="text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200 text-[9px] font-black flex items-center gap-1">
                                                        <ShieldAlert size={10} /> Emergency
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleClinicClick(clinic._id);
                                                }}
                                                className="bg-[#3d3f96] hover:bg-red-500 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-slate-200 active:scale-95 cursor-pointer"
                                            >
                                                Book Visit
                                            </button>

                                            <button
                                                onClick={(e) => handlePhoneCall(e, clinic.phoneNumber)}
                                                className="border border-slate-200 text-slate-700 hover:border-red-300 hover:text-red-500 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
                                                disabled={!clinic.phoneNumber}
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
                )}
            </div>
        </section>
    );
}