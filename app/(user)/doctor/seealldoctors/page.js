'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Search,
    MapPin,
    Video,
    Home,
    Star,
    CheckCircle2,
    ShieldCheck,
    ChevronRight,
    Loader2,
    SlidersHorizontal,
    X,
    Navigation,
    Sparkles,
    GraduationCap,
    RotateCcw,
    Stethoscope
} from 'lucide-react';
import UserAPI from '../../../services/UserAPI';

const CONSULTATION_TYPES = [
    { label: 'All Modes', value: '' },
    { label: 'Video Consult', value: 'Video Consult', icon: Video },
    { label: 'Clinic Visit', value: 'Clinic Visit', icon: MapPin },
    { label: 'Home Visit', value: 'Home Visit', icon: Home }
];

export default function AllDoctorsPage() {
    const router = useRouter();

    // State Management
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isLocating, setIsLocating] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Dynamic Specializations state
    const [availableSpecialities, setAvailableSpecialities] = useState([]);

    // Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpeciality, setSelectedSpeciality] = useState('');
    const [selectedConsultationType, setSelectedConsultationType] = useState('');
    const [cityQuery, setCityQuery] = useState('');
    const [userCoords, setUserCoords] = useState({ lat: null, lng: null });

    // 1. Initial Load: Retrieve stored coordinates if present
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCoords = localStorage.getItem('userCoords');
            if (savedCoords) {
                try {
                    const parsed = JSON.parse(savedCoords);
                    if (parsed.lat && parsed.lng) {
                        setUserCoords({ lat: Number(parsed.lat), lng: Number(parsed.lng) });
                    }
                } catch (err) {
                    console.error('Error reading stored user coordinates:', err);
                }
            }
        }
    }, []);

    // 2. Request Live GPS Location
    const handleGetLiveLocation = () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserCoords(coords);
                if (typeof window !== 'undefined') {
                    localStorage.setItem('userCoords', JSON.stringify(coords));
                }
                setIsLocating(false);
            },
            (error) => {
                console.error('GPS Location error:', error);
                alert('Unable to retrieve location. Please allow location permissions in your browser.');
                setIsLocating(false);
            },
            { timeout: 10000, enableHighAccuracy: true }
        );
    };

    // 3. Helper to update dynamic specialities from doctor results
    const extractAndMergeSpecialities = (docsList) => {
        if (!Array.isArray(docsList)) return;

        setAvailableSpecialities((prevSpecialities) => {
            const extractedSet = new Set(prevSpecialities);

            docsList.forEach((doc) => {
                const spec = doc.specialization || doc.speciality;
                if (spec && typeof spec === 'string' && spec.trim() !== '') {
                    extractedSet.add(spec.trim());
                }
            });

            return Array.from(extractedSet).sort();
        });
    };

    // 4. Fetch Doctors API Call
    const fetchDoctors = useCallback(async () => {
        try {
            setLoading(true);

            const payload = {};

            if (userCoords.lat && userCoords.lng) {
                payload.userLat = userCoords.lat;
                payload.userLng = userCoords.lng;
            }

            if (searchQuery.trim()) {
                payload.search = searchQuery.trim();
            }

            if (selectedSpeciality && selectedSpeciality !== 'All Specialties') {
                payload.speciality = selectedSpeciality;
            }

            if (cityQuery.trim()) {
                payload.city = cityQuery.trim();
            }

            if (selectedConsultationType) {
                payload.consultationType = selectedConsultationType;
            }

            const res = await UserAPI.getIndependentDoctors(payload);

            if (res && res.data) {
                setDoctors(res.data);
                extractAndMergeSpecialities(res.data);
            } else {
                setDoctors([]);
            }
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, [userCoords, searchQuery, selectedSpeciality, cityQuery, selectedConsultationType]);

    // Initial Master Specialities Fetch
    useEffect(() => {
        const fetchMasterSpecialities = async () => {
            try {
                const masterRes = await UserAPI.getIndependentDoctors({});
                if (masterRes && masterRes.data) {
                    extractAndMergeSpecialities(masterRes.data);
                }
            } catch (e) {
                console.error('Error prefetching dynamic specialities:', e);
            }
        };
        fetchMasterSpecialities();
    }, []);

    // Debounce API calls on search or filter change
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchDoctors();
        }, 350);

        return () => clearTimeout(handler);
    }, [fetchDoctors]);

    // Reset all filters
    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedSpeciality('');
        setSelectedConsultationType('');
        setCityQuery('');
    };

    const hasActiveFilters = useMemo(() => {
        return Boolean(searchQuery || selectedSpeciality || selectedConsultationType || cityQuery);
    }, [searchQuery, selectedSpeciality, selectedConsultationType, cityQuery]);

    // Format doctor image URL safely
    const getImageSrc = (imgPath) => {
        if (!imgPath) {
            return 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
        }
        if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
            return imgPath;
        }
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
        return `${baseUrl}${imgPath}`;
    };

    const handleDoctorClick = (id) => {
        if (id) {
            router.push(`/doctor/doctordetail/${id}`);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-800">
            {/* Subtle Geometric Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none -z-10" />

            {/* Top Hero Banner */}
            <header className="bg-white border-b border-slate-200/80 shadow-xs relative">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                        <div className="space-y-1">
                            <div className="inline-flex items-center gap-1.5 text-[#3d3f96] font-bold text-[10px] sm:text-xs tracking-wider uppercase bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                                <ShieldCheck size={13} className="text-[#3d3f96]" /> Verified Independent Doctors
                            </div>
                            <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                                Find & Consult <span className="text-[#3d3f96]">Top Specialists</span>
                            </h1>
                            <p className="text-slate-500 text-xs sm:text-base max-w-2xl">
                                Browse verified clinical experts, check real-time availability, and sort by nearest distance.
                            </p>
                        </div>

                        {/* GPS Location & Mobile Filter Trigger */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                type="button"
                                onClick={handleGetLiveLocation}
                                disabled={isLocating}
                                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border cursor-pointer ${userCoords.lat
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#3d3f96] hover:text-[#3d3f96] shadow-xs'
                                    }`}
                            >
                                {isLocating ? (
                                    <Loader2 size={14} className="animate-spin text-emerald-600" />
                                ) : (
                                    <Navigation size={13} className={userCoords.lat ? 'fill-emerald-500 text-emerald-600' : ''} />
                                )}
                                <span>
                                    {isLocating
                                        ? 'Locating...'
                                        : userCoords.lat
                                            ? 'GPS Active'
                                            : 'Use Live GPS'}
                                </span>
                            </button>

                            {/* Mobile Filter Toggle */}
                            <button
                                type="button"
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="lg:hidden flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-xs cursor-pointer"
                            >
                                <SlidersHorizontal size={14} />
                                <span>Filters</span>
                                {hasActiveFilters && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#3d3f96]" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 pt-4 sm:pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8 items-start relative">

                    {/* ================= FIXED / STICKY FILTER SIDEBAR ================= */}
                    <aside
                        className={`lg:block ${showMobileFilters
                                ? 'fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end p-0'
                                : 'hidden'
                            } lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-200`}
                    >
                        <div
                            className={`bg-white lg:rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-6 space-y-5 sm:space-y-6 ${showMobileFilters
                                    ? 'h-full w-full max-w-xs overflow-y-auto'
                                    : 'w-full'
                                }`}
                        >
                            {/* Sidebar Header */}
                            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
                                    <SlidersHorizontal size={16} className="text-[#3d3f96]" />
                                    <span>Filter Directory</span>
                                </div>
                                {showMobileFilters && (
                                    <button
                                        onClick={() => setShowMobileFilters(false)}
                                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            {/* Consultation Mode */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    Consultation Mode
                                </label>
                                <div className="flex flex-col gap-1.5">
                                    {CONSULTATION_TYPES.map((type) => {
                                        const isSelected = selectedConsultationType === type.value;
                                        const Icon = type.icon;
                                        return (
                                            <button
                                                key={type.label}
                                                type="button"
                                                onClick={() => setSelectedConsultationType(type.value)}
                                                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${isSelected
                                                        ? 'bg-[#3d3f96] text-white shadow-xs'
                                                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100/80 border border-slate-200/50'
                                                    }`}
                                            >
                                                <span className="flex items-center gap-2">
                                                    {Icon && <Icon size={13} />}
                                                    {type.label}
                                                </span>
                                                {isSelected && <CheckCircle2 size={13} className="text-white" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dynamic Medical Specialty */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                        <Stethoscope size={12} />
                                        <span>Specialty</span>
                                    </label>
                                    {availableSpecialities.length > 0 && (
                                        <span className="text-[9px] text-slate-400 font-medium">
                                            {availableSpecialities.length} Types
                                        </span>
                                    )}
                                </div>

                                <select
                                    value={selectedSpeciality}
                                    onChange={(e) => setSelectedSpeciality(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96] transition-all"
                                >
                                    <option value="">All Specialties</option>
                                    {availableSpecialities.map((spec) => (
                                        <option key={spec} value={spec}>
                                            {spec}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* City / Region Input */}
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                    City / Location
                                </label>
                                <div className="relative">
                                    <MapPin size={14} className="absolute left-3 top-2.5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="e.g. Mohali, Delhi"
                                        value={cityQuery}
                                        onChange={(e) => setCityQuery(e.target.value)}
                                        className="w-full pl-8 pr-7 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                                    />
                                    {cityQuery && (
                                        <button
                                            onClick={() => setCityQuery('')}
                                            className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                        >
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Reset All Filters Button */}
                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer"
                                >
                                    <RotateCcw size={13} />
                                    <span>Reset All Filters</span>
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* ================= DOCTOR LISTING & SEARCH AREA ================= */}
                    <section className="lg:col-span-3 space-y-4 sm:space-y-6">

                        {/* Search Input Bar */}
                        <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm p-1.5 sm:p-2 flex items-center gap-2">
                            <div className="flex-1 flex items-center gap-2 pl-2 sm:pl-3">
                                <Search size={16} className="text-slate-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search doctors (e.g. Dr. Siddharth, Mudabir)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-slate-800 focus:outline-none placeholder-slate-400"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                                    >
                                        <X size={14} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Results Count & Badges */}
                        <div className="flex items-center justify-between text-[11px] sm:text-xs text-slate-500 px-1">
                            <span>
                                Found <strong className="text-slate-900">{doctors.length}</strong> doctor{doctors.length === 1 ? '' : 's'}
                            </span>
                            {userCoords.lat && (
                                <span className="flex items-center gap-1 text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] sm:text-xs">
                                    <Navigation size={11} /> GPS Sorted
                                </span>
                            )}
                        </div>

                        {/* Dynamic Content Grid: 2 COLUMNS ON MOBILE (grid-cols-2) */}
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200/80 shadow-xs gap-3 text-slate-500">
                                <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                                <p className="text-xs sm:text-sm font-semibold">Finding nearest specialists...</p>
                            </div>
                        ) : doctors.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200/80 shadow-xs px-4">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 text-[#3d3f96] rounded-2xl mx-auto flex items-center justify-center mb-3">
                                    <Sparkles size={24} />
                                </div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-900">No Specialists Found</h3>
                                <p className="text-slate-500 text-xs sm:text-sm mt-1 max-w-sm mx-auto">
                                    Try adjusting or clearing your filters to see more available doctors.
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        onClick={handleResetFilters}
                                        className="mt-4 px-4 py-2 bg-[#3d3f96] text-white rounded-xl text-xs font-bold shadow-md hover:bg-slate-900 transition-all cursor-pointer"
                                    >
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* 2 Columns on Mobile -> 2 on Tablet -> 3 on Desktop */
                            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-5 pt-3 sm:pt-6">
                                {doctors.map((doc) => {
                                    const rating = doc.review?.rating ?? doc.averageRating ?? 5.0;
                                    const reviewCount = doc.review?.totalReviews ?? doc.totalReviews ?? 0;
                                    const displaySpeciality = doc.specialization || doc.speciality || 'Specialist';
                                    const experience = doc.experienceYears ? `${doc.experienceYears}+ Yrs` : doc.experience || 'Experienced';

                                    return (
                                        <div
                                            key={doc._id}
                                            onClick={() => handleDoctorClick(doc._id)}
                                            className="flex flex-col bg-white rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-transparent transition-all duration-300 group relative p-2 sm:p-4 cursor-pointer"
                                        >
                                            {/* Compact Image Container */}
                                            <div className="relative -mt-4 sm:-mt-8 mx-0.5 sm:mx-2 h-28 sm:h-44 md:h-48 rounded-lg sm:rounded-xl overflow-hidden bg-slate-100 shadow-sm sm:shadow-md border border-white">
                                                <img
                                                    src={getImageSrc(doc.profileImage)}
                                                    alt={doc.name || 'Doctor'}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop';
                                                    }}
                                                />

                                                {/* Rating Pill */}
                                                <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-slate-900/85 backdrop-blur-xs text-white px-1 sm:px-2 py-0.5 rounded-md sm:rounded-lg flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold border border-white/10">
                                                    <Star size={9} fill="currentColor" className="text-amber-400" />
                                                    <span>{Number(rating).toFixed(1)}</span>
                                                    <span className="text-slate-400 font-normal hidden sm:inline">({reviewCount})</span>
                                                </div>

                                                {/* Duty Status Badge */}
                                                <div className="absolute top-1 left-1 sm:top-2 sm:left-2">
                                                    <span
                                                        className={`inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded backdrop-blur-xs ${doc.dutyStatus === 'On Duty'
                                                                ? 'bg-emerald-500/90 text-white'
                                                                : 'bg-slate-900/70 text-slate-200'
                                                            }`}
                                                    >
                                                        <span
                                                            className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${doc.dutyStatus === 'On Duty' ? 'bg-white animate-pulse' : 'bg-slate-400'
                                                                }`}
                                                        />
                                                        <span className="truncate max-w-[55px] sm:max-w-none">{doc.dutyStatus || 'Verified'}</span>
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Doctor Details Body */}
                                            <div className="flex flex-col flex-1 pt-2 sm:pt-4 px-0.5">
                                                <div className="flex-1">
                                                    {/* Experience & Qualification row */}
                                                    <div className="flex items-center justify-between gap-1 mb-1">
                                                        <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-0.5 truncate">
                                                            <GraduationCap size={10} className="hidden sm:inline" />
                                                            <span className="truncate">{doc.qualification || 'MBBS'}</span>
                                                        </span>
                                                        <span className="text-[8px] sm:text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1 sm:px-1.5 py-0.5 rounded whitespace-nowrap">
                                                            {experience}
                                                        </span>
                                                    </div>

                                                    {/* Doctor Name */}
                                                    <h2 className="text-xs sm:text-base font-bold text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                                                        {doc.name?.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                                                    </h2>

                                                    {/* Specialty */}
                                                    <p className="text-[10px] sm:text-xs font-semibold text-slate-500 mt-0.5 truncate">
                                                        {displaySpeciality}
                                                    </p>

                                                    {/* Compact Consultation Mode Badges */}
                                                    <div className="mt-2 flex flex-wrap gap-1 items-center">
                                                        {(doc.consultationStatus?.online || doc.isOnlineAvailable) && (
                                                            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 bg-indigo-50/70 text-indigo-700 rounded border border-indigo-100/40">
                                                                <Video size={10} /> <span className="hidden sm:inline">Telehealth</span><span className="sm:hidden">Online</span>
                                                            </span>
                                                        )}
                                                        {(doc.consultationStatus?.clinic || doc.isClinicAvailable) && (
                                                            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 bg-rose-50/70 text-rose-600 rounded border border-rose-100/40">
                                                                <MapPin size={10} /> <span className="hidden sm:inline">In-Person</span><span className="sm:hidden">Clinic</span>
                                                            </span>
                                                        )}
                                                        {(doc.consultationStatus?.home || doc.isHomeAvailable) && (
                                                            <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[10px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 bg-amber-50/70 text-amber-700 rounded border border-amber-100/40">
                                                                <Home size={10} /> Home
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Card Bottom Meta & Button */}
                                                <div className="mt-3 sm:mt-4 pt-2 border-t border-slate-100 flex flex-col gap-1.5 sm:gap-2">
                                                    <div className="flex items-center justify-between text-[9px] sm:text-xs">
                                                        <div className="flex items-center gap-0.5 text-slate-500 truncate max-w-[65px] sm:max-w-[130px]">
                                                            <MapPin size={10} className="text-slate-400 shrink-0" />
                                                            <span className="truncate">{doc.city || doc.address || 'Available'}</span>
                                                        </div>

                                                        {doc.distance !== undefined && (
                                                            <span className="text-[8px] sm:text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded shrink-0">
                                                                {doc.distance} km
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Action Button */}
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDoctorClick(doc._id);
                                                        }}
                                                        className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-1 shadow-xs group/btn cursor-pointer active:scale-95"
                                                    >
                                                        <span>Book</span>
                                                        <ChevronRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}