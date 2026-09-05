"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Clock,
    Bed,
    Video,
    Home,
    Stethoscope,
    ShieldCheck,
    Loader2,
    Building2,
    AlertCircle,
    Navigation,
    ShieldAlert,
    Share2,
    ExternalLink,
    Calendar,
    Sparkles,
    Search,
    Check,
    ChevronRight
} from 'lucide-react';

import UserAPI from '../../../../services/UserAPI';

// --- MEDIA HELPERS ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=800&auto=format&fit=crop";
const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function ClinicDetailPage() {
    const params = useParams();
    const router = useRouter();
    const clinicId = params?.id;

    // --- Dynamic API States ---
    const [loading, setLoading] = useState(true);
    const [clinicData, setClinicData] = useState(null);
    const [selectedConsultModes, setSelectedConsultModes] = useState({});
    const [activeGalleryImage, setActiveGalleryImage] = useState(null);
    const [doctorSearch, setDoctorSearch] = useState("");
    const [copiedLink, setCopiedLink] = useState(false);

    // Retrieve user coordinates from localStorage
    const getStoredCoords = () => {
        let lat, lng;
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("userCoords");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.lat !== undefined && parsed.lng !== undefined) {
                        lat = Number(parsed.lat);
                        lng = Number(parsed.lng);
                    }
                } catch (e) {
                    console.error("Coords reading error:", e);
                }
            }
        }
        return { lat, lng };
    };

    useEffect(() => {
        if (!clinicId) return;

        const fetchClinicDetails = async () => {
            setLoading(true);
            try {
                const coords = getStoredCoords();
                const queryParams = coords.lat && coords.lng ? { lat: coords.lat, lng: coords.lng } : {};

                const response = await UserAPI.getUserClinicProfileDetails(clinicId, queryParams);
                if (response && response.success && response.data) {
                    setClinicData(response.data);

                    const initialModes = {};
                    (response.data.doctors || []).forEach((doc) => {
                        if (doc.fees?.clinicVisit?.isAvailable) {
                            initialModes[doc._id] = 'clinicVisit';
                        } else if (doc.fees?.onlineConsult?.isAvailable) {
                            initialModes[doc._id] = 'onlineConsult';
                        } else if (doc.fees?.homeVisit?.isAvailable) {
                            initialModes[doc._id] = 'homeVisit';
                        }
                    });
                    setSelectedConsultModes(initialModes);

                    if (response.data.clinicDetails?.mainImage) {
                        setActiveGalleryImage(getMediaUrl(response.data.clinicDetails.mainImage));
                    }
                } else {
                    setClinicData(null);
                }
            } catch (err) {
                console.error("Error fetching clinic details:", err);
                setClinicData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchClinicDetails();
    }, [clinicId]);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: clinicData?.clinicDetails?.clinicName || "Clinic Profile",
                url: window.location.href,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(window.location.href);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        }
    };

    const filteredDoctors = useMemo(() => {
        if (!clinicData?.doctors) return [];
        if (!doctorSearch.trim()) return clinicData.doctors;
        return clinicData.doctors.filter((doc) =>
            doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
            doc.speciality?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
            doc.qualification?.toLowerCase().includes(doctorSearch.toLowerCase())
        );
    }, [clinicData?.doctors, doctorSearch]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-200 border-t-red-500 animate-spin" />
                    <Stethoscope size={24} className="text-slate-700 absolute" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mt-5">Loading Clinic Profile...</h3>
                <p className="text-xs text-slate-400 mt-1">Verifying schedules, doctor availability, and facility beds</p>
            </div>
        );
    }

    if (!clinicData || !clinicData.clinicDetails) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-3xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500 mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Clinic Profile Unavailable</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm">We couldn't retrieve the facility you requested. It may have moved or is temporarily offline.</p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to Search
                </button>
            </div>
        );
    }

    const { clinicDetails, doctorsCount = 0 } = clinicData;

    const fullAddress = [clinicDetails.address, clinicDetails.city, clinicDetails.state, clinicDetails.country]
        .filter(Boolean)
        .join(', ');

    const clinicImages = [
        clinicDetails.mainImage,
        clinicDetails.posterImage,
        ...(clinicDetails.clinicImages || [])
    ].filter(Boolean);

    const activeImageSrc = activeGalleryImage || getMediaUrl(clinicDetails.mainImage) || CLINIC_PLACEHOLDER;
    const mapQueryUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${clinicDetails.clinicName} ${fullAddress}`)}`;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-800 pb-32 antialiased selection:bg-red-50 selection:text-red-600">

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-900 bg-slate-100/70 hover:bg-slate-200/70 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            <ArrowLeft size={15} /> Directory
                        </button>
                        <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
                        <span className="hidden sm:inline-block text-xs font-medium text-slate-500 truncate max-w-xs">
                            {clinicDetails.clinicName}
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {clinicDetails.distanceText && (
                            <span className="bg-red-50 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-100 flex items-center gap-1.5">
                                <Navigation size={12} className="fill-red-500" /> {clinicDetails.distanceText}
                            </span>
                        )}
                        <button
                            onClick={handleShare}
                            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 cursor-pointer"
                            title="Share Clinic Profile"
                        >
                            {copiedLink ? <Check size={16} className="text-emerald-600" /> : <Share2 size={16} />}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">

                {/* ========================================================================= */}
                {/* 1. CLINIC HERO BANNER & HEADER */}
                {/* ========================================================================= */}
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                        {/* Visual Image & Interactive Gallery */}
                        <div className="lg:col-span-5 space-y-3">
                            <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 group">
                                <img
                                    src={activeImageSrc}
                                    alt={clinicDetails.clinicName}
                                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                                    onError={(e) => { e.target.src = CLINIC_PLACEHOLDER; }}
                                />

                                {/* Status Badges Overlaid on Image */}
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                                    {clinicDetails.facilities?.is24x7 && (
                                        <span className="bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-sm">
                                            24x7 Open
                                        </span>
                                    )}
                                    {clinicDetails.facilities?.isEmergency && (
                                        <span className="bg-red-600/95 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1">
                                            <ShieldAlert size={12} /> Emergency Facility
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Thumbnail Row */}
                            {clinicImages.length > 1 && (
                                <div className="flex gap-2.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                                    {clinicImages.map((img, idx) => {
                                        const url = getMediaUrl(img);
                                        const isActive = activeImageSrc === url;
                                        return (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => setActiveGalleryImage(url)}
                                                className={`relative w-16 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${isActive ? 'border-red-500 ring-2 ring-red-100 scale-102' : 'border-slate-200 opacity-60 hover:opacity-100'
                                                    }`}
                                            >
                                                <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Clinic Headline & Information */}
                        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-6">
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2.5">
                                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                        {clinicDetails.clinicName}
                                    </h1>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                                        <ShieldCheck size={13} className="text-emerald-600" /> Verified Facility
                                    </span>
                                </div>

                                {clinicDetails.doctorIncharge && (
                                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                        Medical Director: <strong className="text-slate-800">Dr. {clinicDetails.doctorIncharge}</strong>
                                    </p>
                                )}

                                {fullAddress && (
                                    <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                                        <MapPin size={15} className="text-red-500 shrink-0 mt-0.5" />
                                        <span>{fullAddress}</span>
                                    </div>
                                )}

                                {clinicDetails.about && (
                                    <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-100">
                                        {clinicDetails.about}
                                    </p>
                                )}
                            </div>

                            {/* Service Badges & Timings */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <div className="flex flex-wrap gap-2">
                                    {clinicDetails.facilities?.isOPD && (
                                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200">
                                            Outpatient (OPD)
                                        </span>
                                    )}
                                    {clinicDetails.facilities?.isIPD && (
                                        <span className="text-[11px] font-bold text-slate-700 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200">
                                            Inpatient (IPD)
                                        </span>
                                    )}
                                    <span className="text-[11px] font-medium text-slate-600 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200">
                                        Days: <strong className="text-slate-800">{clinicDetails.timings?.workingDays || 'Mon - Sat'}</strong>
                                    </span>
                                    {clinicDetails.timings?.weeklyHoliday && (
                                        <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-3 py-1 rounded-lg border border-amber-200/60">
                                            Off: {clinicDetails.timings.weeklyHoliday}
                                        </span>
                                    )}
                                </div>

                                {/* Direct Actions */}
                                <div className="flex flex-wrap gap-3 pt-2">
                                    {clinicDetails.phoneNumber && (
                                        <a
                                            href={`tel:${clinicDetails.phoneNumber}`}
                                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                                        >
                                            <Phone size={14} /> Call Reception ({clinicDetails.phoneNumber})
                                        </a>
                                    )}
                                    <a
                                        href={mapQueryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 transition-all shadow-xs"
                                    >
                                        <ExternalLink size={14} className="text-slate-400" /> Get Directions
                                    </a>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 2. MAIN CONTENT GRID */}
                {/* ========================================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: Core Details & Doctors */}
                    <div className="lg:col-span-8 space-y-8">

                        {/* Shifts & Service Hours */}
                        {clinicDetails.serviceTimings && (
                            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-5 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <Clock className="text-red-500" size={16} /> Operational Shifts & Hours
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Standard hours: {clinicDetails.timings?.displayTime || '09:00 AM - 06:00 PM'}
                                        </p>
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                                        Shift I: {clinicDetails.timings?.morningShift || '09:00 AM - 01:00 PM'} • Shift II: {clinicDetails.timings?.eveningShift || '02:00 PM - 06:00 PM'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    {/* OPD */}
                                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                            Outpatient (OPD)
                                        </span>
                                        <div className="text-sm font-black font-mono text-slate-900">
                                            {clinicDetails.serviceTimings.opd?.is24x7
                                                ? "24x7 Open"
                                                : `${clinicDetails.serviceTimings.opd?.startTime || "09:00 AM"} - ${clinicDetails.serviceTimings.opd?.endTime || "06:00 PM"}`}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">General consultation</p>
                                    </div>

                                    {/* IPD */}
                                    <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                                            Inpatient & Daycare
                                        </span>
                                        <div className="text-sm font-black font-mono text-slate-900">
                                            {clinicDetails.serviceTimings.ipd?.is24x7
                                                ? "24x7 Open"
                                                : `${clinicDetails.serviceTimings.ipd?.startTime || "10:00 AM"} - ${clinicDetails.serviceTimings.ipd?.endTime || "08:00 PM"}`}
                                        </div>
                                        <p className="text-[10px] text-slate-400 mt-1">Observation & admission</p>
                                    </div>

                                    {/* Emergency */}
                                    <div className="p-4 rounded-2xl bg-red-50/50 border border-red-100">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 block mb-1">
                                            Casualty & Triage
                                        </span>
                                        <div className="text-sm font-black font-mono text-red-600">
                                            {clinicDetails.serviceTimings.emergency?.is24x7
                                                ? "24x7 Continuous"
                                                : `${clinicDetails.serviceTimings.emergency?.startTime || "06:00 PM"} - ${clinicDetails.serviceTimings.emergency?.endTime || "09:00 AM"}`}
                                        </div>
                                        <p className="text-[10px] text-red-400 mt-1">Urgent care unit</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Daycare & Wards Facility */}
                        {clinicDetails.daycareFacility?.hasWards && (
                            <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 space-y-5 shadow-xs">
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                    <div>
                                        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            <Bed className="text-red-500" size={16} /> Daycare Observation Wards
                                        </h2>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            Real-time bed availability & admission rates
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-xs font-semibold text-emerald-800">
                                            {clinicDetails.daycareFacility.availableBeds} of {clinicDetails.daycareFacility.totalBeds} Beds Free
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {clinicDetails.daycareFacility.wards?.map((ward) => {
                                        const percentFree = Math.round((ward.availableBeds / (ward.totalBeds || 1)) * 100);
                                        return (
                                            <div key={ward._id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 flex flex-col justify-between space-y-3">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="text-xs font-bold text-slate-900">{ward.name}</h3>
                                                        <span className="text-[9px] font-bold uppercase text-slate-600 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                                                            {ward.type}
                                                        </span>
                                                    </div>

                                                    {/* Bed Capacity Bar */}
                                                    <div className="space-y-1.5 mt-2">
                                                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                                                            <span>Capacity</span>
                                                            <span>{ward.availableBeds} free / {ward.totalBeds} total</span>
                                                        </div>
                                                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                                                                style={{ width: `${percentFree}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-3 border-t border-slate-200/60 flex items-baseline justify-between">
                                                    <span className="text-[10px] uppercase font-bold text-slate-400">Ward Charge</span>
                                                    <span className="text-sm font-mono font-bold text-slate-900">
                                                        ₹{ward.pricePerDay} <span className="text-[10px] font-normal text-slate-400">/day</span>
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* Availability Protocol Banner */}
                        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 flex items-start gap-4 shadow-sm">
                            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 text-red-400">
                                <Sparkles size={20} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                                    Doctor Assignment Guarantee
                                </h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    Should your chosen physician be summoned to an emergency triage, an equally qualified accredited specialist will be assigned immediately to prevent clinical treatment delays.
                                </p>
                            </div>
                        </div>

                        {/* Panel Doctors Grid */}
                        <section className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Stethoscope className="text-red-500" size={18} /> Panel Doctors ({doctorsCount})
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium">Available specialists for outpatient and online consultations</p>
                                </div>

                                {doctorsCount > 2 && (
                                    <div className="relative w-full sm:w-56">
                                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={doctorSearch}
                                            onChange={(e) => setDoctorSearch(e.target.value)}
                                            placeholder="Search doctor or specialty..."
                                            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                                        />
                                    </div>
                                )}
                            </div>

                            {filteredDoctors.length === 0 ? (
                                <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
                                    <p className="text-xs text-slate-500">No doctors found matching "{doctorSearch}".</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredDoctors.map((doc) => {
                                        const docPhoto = getMediaUrl(doc.profileImage) || DOC_PLACEHOLDER;
                                        const activeMode = selectedConsultModes[doc._id] || (doc.fees?.clinicVisit?.isAvailable ? 'clinicVisit' : doc.fees?.onlineConsult?.isAvailable ? 'onlineConsult' : 'homeVisit');

                                        return (
                                            <div
                                                key={doc._id}
                                                className="bg-white rounded-3xl p-5 border border-slate-200/90 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                                            >
                                                <div className="space-y-4">
                                                    {/* Header */}
                                                    <div className="flex gap-3.5 items-start">
                                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                            <img
                                                                src={docPhoto}
                                                                alt={doc.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                                                            />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between">
                                                                <h3 className="text-sm font-bold text-slate-900 truncate" title={doc.name}>
                                                                    {doc.name}
                                                                </h3>
                                                            </div>

                                                            <p className="text-xs font-semibold text-red-600 truncate mt-0.5">
                                                                {doc.speciality}
                                                            </p>

                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                                    {doc.dutyStatus || "On Duty"}
                                                                </span>
                                                                <span className="text-[11px] text-slate-400 font-medium">
                                                                    • {doc.experience || "5+ yrs exp"}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Qualifications */}
                                                    <div className="py-2 border-y border-slate-100 text-[11px]">
                                                        <span className="font-semibold text-slate-700">{doc.qualification || "MBBS"}</span>
                                                        {doc.degreesList && doc.degreesList.length > 0 && (
                                                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                                                {doc.degreesList.map(d => d.degree).join(", ")}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Consultation Options & Pricing */}
                                                    <div className="space-y-1.5">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                            Consultation Rates
                                                        </span>

                                                        <div className="grid grid-cols-3 gap-2">
                                                            {/* Clinic Visit */}
                                                            <div
                                                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center ${doc.fees?.clinicVisit?.isAvailable
                                                                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                                                                    : 'opacity-30 border-dashed border-slate-200'
                                                                    }`}
                                                            >
                                                                <Building2 size={13} className="mb-0.5 text-slate-500" />
                                                                <span className="text-[9px] font-medium">Clinic</span>
                                                                <span className="text-xs font-mono font-bold mt-0.5 text-slate-900">
                                                                    {doc.fees?.clinicVisit?.isAvailable ? `₹${doc.fees.clinicVisit.price}` : '—'}
                                                                </span>
                                                            </div>

                                                            {/* Online Video */}
                                                            <div
                                                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center ${doc.fees?.onlineConsult?.isAvailable
                                                                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                                                                    : 'opacity-30 border-dashed border-slate-200'
                                                                    }`}
                                                            >
                                                                <Video size={13} className="mb-0.5 text-slate-500" />
                                                                <span className="text-[9px] font-medium">Video</span>
                                                                <span className="text-xs font-mono font-bold mt-0.5 text-slate-900">
                                                                    {doc.fees?.onlineConsult?.isAvailable ? `₹${doc.fees.onlineConsult.price}` : '—'}
                                                                </span>
                                                            </div>

                                                            {/* Home Visit */}
                                                            <div
                                                                className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center ${doc.fees?.homeVisit?.isAvailable
                                                                    ? 'border-slate-200 bg-slate-50 text-slate-700'
                                                                    : 'opacity-30 border-dashed border-slate-200'
                                                                    }`}
                                                            >
                                                                <Home size={13} className="mb-0.5 text-slate-500" />
                                                                <span className="text-[9px] font-medium">Home</span>
                                                                <span className="text-xs font-mono font-bold mt-0.5 text-slate-900">
                                                                    {doc.fees?.homeVisit?.isAvailable ? `₹${doc.fees.homeVisit.price}` : '—'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </section>

                    </div>

                    {/* RIGHT COLUMN: Summary & Contacts Card */}
                    <aside className="lg:col-span-4 space-y-6 sticky top-22">

                        {/* Summary Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
                                Clinic Overview
                            </h3>

                            <div className="space-y-3.5 text-xs">
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-semibold text-slate-700 block">Facility Address</span>
                                        <p className="text-slate-500 text-[11px] mt-0.5">{fullAddress || 'Address on request'}</p>
                                    </div>
                                </div>

                                {clinicDetails.phoneNumber && (
                                    <div className="flex items-start gap-3">
                                        <Phone size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-slate-700 block">Reception Desk</span>
                                            <a href={`tel:${clinicDetails.phoneNumber}`} className="text-red-600 font-mono text-[11px] hover:underline">
                                                {clinicDetails.phoneNumber}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {clinicDetails.alternatePhoneNumber && (
                                    <div className="flex items-start gap-3">
                                        <Phone size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-slate-700 block">Alternate Contact</span>
                                            <a href={`tel:${clinicDetails.alternatePhoneNumber}`} className="text-slate-600 font-mono text-[11px] hover:underline">
                                                {clinicDetails.alternatePhoneNumber}
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {clinicDetails.email && (
                                    <div className="flex items-start gap-3">
                                        <Mail size={16} className="text-slate-400 shrink-0 mt-0.5" />
                                        <div>
                                            <span className="font-semibold text-slate-700 block">Official Email</span>
                                            <a href={`mailto:${clinicDetails.email}`} className="text-slate-600 text-[11px] hover:underline truncate block">
                                                {clinicDetails.email}
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <a
                                href={mapQueryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Open in Google Maps <ExternalLink size={13} />
                            </a>
                        </div>

                        {/* Emergency Helpline Box */}
                        {clinicDetails.facilities?.isEmergency && (
                            <div className="bg-red-50 border border-red-200 rounded-3xl p-5 space-y-2">
                                <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-wider">
                                    <ShieldAlert size={15} /> 24x7 Emergency Line
                                </div>
                                <p className="text-[11px] text-red-600">
                                    Immediate casualty intake & ambulance support available round the clock.
                                </p>
                                {clinicDetails.phoneNumber && (
                                    <a
                                        href={`tel:${clinicDetails.phoneNumber}`}
                                        className="block text-center bg-red-600 hover:bg-red-700 text-white font-bold font-mono text-xs py-2 rounded-xl transition-all shadow-xs"
                                    >
                                        Call Emergency: {clinicDetails.phoneNumber}
                                    </a>
                                )}
                            </div>
                        )}

                    </aside>

                </div>

            </main>

            {/* ========================================================================= */}
            {/* 3. CENTERED FLOATING STICKY BOTTOM BOOKING BAR */}
            {/* ========================================================================= */}
            <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-50 px-4 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl sm:rounded-[2rem] border border-slate-200/80 shadow-2xl shadow-slate-900/15 p-2.5 sm:p-3">
                    <button
                        onClick={() => router.push(`/clinic/bookclinic/${clinicDetails._id}`)}
                        className="w-full py-3.5 px-8 rounded-2xl sm:rounded-[1.5rem] bg-slate-900 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-red-500/25 flex items-center justify-center gap-2.5 cursor-pointer group hover:scale-[1.01]"
                    >
                        <Calendar size={16} className="text-red-400 group-hover:text-white transition-colors shrink-0" />
                        <span>Book Your Consult</span>
                        <ChevronRight size={16} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                    </button>
                </div>
            </div>

        </div>
    );
}