"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Stethoscope,
    Building2,
    Video,
    Home,
    Star,
    ShieldAlert,
    AlertCircle,
    Search,
    ChevronRight,
    Check,
    Bed,
    CheckCircle2,
    ShieldCheck,
    MapPin,
    Calendar,
    Activity,
    Users,
    User,
    Sparkles,
    Clock,
    CreditCard
} from 'lucide-react';

import UserAPI from '../../../../services/UserAPI';
import WardBeds from './components/WardBeds';
import AddressModel from './components/AddressModel';
import ChoosePatient from './components/ChoosePatient';

// --- MEDIA HELPERS ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function ClinicBookingPage() {
    const params = useParams();
    const router = useRouter();
    const clinicId = params?.id;

    // --- Dynamic API States ---
    const [loading, setLoading] = useState(true);
    const [bookingData, setBookingData] = useState(null);

    // --- Step 1: Booking Type ('OPD' | 'IPD' | 'EMERGENCY') ---
    const [bookingType, setBookingType] = useState('OPD');

    // --- Step 2: Patient Selection State ---
    const [selectedPatient, setSelectedPatient] = useState({
        _id: 'self-primary',
        memberName: 'Myself (Primary Account)',
        relation: 'SELF',
        isSelf: true
    });
    const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);

    // --- Step 3: Doctor Selection ---
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [selectedConsultModes, setSelectedConsultModes] = useState({});
    const [doctorSearch, setDoctorSearch] = useState("");

    // --- Home Visit Address Selection States ---
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

    // --- Step 4: Ward & Bed Selection ---
    const [selectedWard, setSelectedWard] = useState(null);
    const [selectedBed, setSelectedBed] = useState(null);
    const [isWardModalOpen, setIsWardModalOpen] = useState(false);

    // Fetch clinic combined data
    useEffect(() => {
        if (!clinicId) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await UserAPI.getClinicDoctorsAndBeds(clinicId);
                if (response && response.success) {
                    setBookingData(response);

                    // Initialize default doctor & consult modes
                    const initialModes = {};
                    if (response.doctors && response.doctors.length > 0) {
                        response.doctors.forEach((doc) => {
                            if (doc.fees?.clinicVisitFee?.isAvailable) {
                                initialModes[doc._id] = 'clinicVisitFee';
                            } else if (doc.fees?.onlineConsultFee?.isAvailable) {
                                initialModes[doc._id] = 'onlineConsultFee';
                            } else if (doc.fees?.homeVisitFee?.isAvailable) {
                                initialModes[doc._id] = 'homeVisitFee';
                            }
                        });
                        setSelectedConsultModes(initialModes);
                        setSelectedDoctorId(response.doctors[0]._id);
                    }
                } else {
                    setBookingData(null);
                }
            } catch (err) {
                console.error("Error fetching clinic details:", err);
                setBookingData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [clinicId]);

    // Filter doctors
    const filteredDoctors = useMemo(() => {
        if (!bookingData?.doctors) return [];
        if (!doctorSearch.trim()) return bookingData.doctors;
        return bookingData.doctors.filter((doc) =>
            doc.name?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
            doc.speciality?.toLowerCase().includes(doctorSearch.toLowerCase()) ||
            doc.degree?.toLowerCase().includes(doctorSearch.toLowerCase())
        );
    }, [bookingData?.doctors, doctorSearch]);

    // Active Selected Doctor Object
    const activeDoctor = useMemo(() => {
        if (!bookingData?.doctors) return null;
        return bookingData.doctors.find(d => d._id === selectedDoctorId);
    }, [bookingData?.doctors, selectedDoctorId]);

    // Price Calculations (Doctor Fee + Dynamic Multiplied Bed Fee)
    const selectedDoctorMode = selectedDoctorId ? selectedConsultModes[selectedDoctorId] : null;
    const selectedDoctorPrice = activeDoctor?.fees?.[selectedDoctorMode]?.price || 0;

    // Dynamic Bed Total = Days * Price Per Day
    const calculatedBedTotal = selectedBed?.totalBedPrice || 0;

    // Total Calculation
    const totalPrice = useMemo(() => {
        if (bookingType === 'OPD') {
            return selectedDoctorPrice;
        }
        return selectedDoctorPrice + calculatedBedTotal;
    }, [bookingType, selectedDoctorPrice, calculatedBedTotal]);

    // Booking Ready Validation
    const isBookingReady = useMemo(() => {
        if (!selectedPatient) return false;
        if (bookingType === 'OPD') {
            if (!selectedDoctorId) return false;
            if (selectedDoctorMode === 'homeVisitFee' && !selectedAddress) return false;
            return true;
        }
        return Boolean(selectedDoctorId && selectedBed);
    }, [bookingType, selectedDoctorId, selectedDoctorMode, selectedAddress, selectedBed, selectedPatient]);

    // Open Ward Modal
    const handleOpenWardModal = (ward) => {
        setSelectedWard(ward);
        setIsWardModalOpen(true);
    };

    // Proceed to Review Page Handler
    const handleProceedToReview = () => {
        if (!isBookingReady) return;

        const bookingPayload = {
            clinicId,
            clinicName: bookingData.clinicName,
            bookingType,
            patient: selectedPatient,
            doctor: activeDoctor ? {
                doctorId: activeDoctor._id,
                name: activeDoctor.name,
                speciality: activeDoctor.speciality,
                profileImage: activeDoctor.profileImage,
                mode: selectedDoctorMode,
                fee: selectedDoctorPrice
            } : null,
            address: selectedDoctorMode === 'homeVisitFee' ? selectedAddress : null,
            ward: (bookingType === 'IPD' || bookingType === 'EMERGENCY') && selectedBed ? {
                wardId: selectedWard?.wardId,
                wardName: selectedWard?.wardName,
                wardType: selectedWard?.wardType,
                bedId: selectedBed.bedId,
                bedNumber: selectedBed.bedNumber,
                startDate: selectedBed.startDate,
                endDate: selectedBed.endDate,
                totalDays: selectedBed.totalDays,
                pricePerDay: selectedBed.pricePerDay,
                totalBedPrice: selectedBed.totalBedPrice
            } : null,
            totalPrice
        };

        if (typeof window !== "undefined") {
            sessionStorage.setItem("activeClinicBooking", JSON.stringify(bookingPayload));
        }

        router.push(`/clinic/review?clinicId=${clinicId}&type=${bookingType}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#f4f7fc] to-[#eef2f9] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="relative flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-4 border-indigo-100 border-t-[#3d3f96] border-r-rose-500 animate-spin" />
                    <div className="absolute w-12 h-12 rounded-2xl bg-white shadow-md flex items-center justify-center text-[#3d3f96]">
                        <Stethoscope size={22} className="animate-pulse" />
                    </div>
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mt-6">Loading Clinic Facility</h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">Fetching verified specialists, care tiers &amp; bed availability...</p>
            </div>
        );
    }

    if (!bookingData) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mb-4 shadow-sm">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">Facility Details Unavailable</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm font-medium leading-relaxed">
                    We could not retrieve doctor schedules or ward inventory for this clinic at the moment. Please try again.
                </p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-lg shadow-indigo-950/15 hover:scale-[1.02] cursor-pointer"
                >
                    <ArrowLeft size={14} /> Return to Directory
                </button>
            </div>
        );
    }

    const { clinicName, doctors = [], wardBedSummary } = bookingData;

    return (
        <div className="min-h-screen bg-linear-to-b from-[#f8fbff] via-[#f4f7fb] to-[#edf2f9] text-slate-800 pb-48 antialiased select-none text-left">

            {/* Top Glassmorphic Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
                <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer shadow-xs hover:shadow-sm"
                        >
                            <ArrowLeft size={15} />
                            <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Back</span>
                        </button>
                        <span className="hidden sm:inline-block h-6 w-px bg-slate-200" />
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#3d3f96] flex items-center gap-1 leading-none">
                                <Building2 size={11} /> Verified Clinic Facility
                            </span>
                            <h1 className="text-sm sm:text-base md:text-lg font-black text-slate-900 tracking-tight truncate max-w-xs sm:max-w-md lg:max-w-lg mt-0.5">
                                {clinicName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <div className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50/90 px-3.5 py-2 rounded-2xl border border-indigo-100/90 flex items-center gap-1.5 shadow-2xs">
                            <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                            <span>{doctors.length} Doctors Available</span>
                        </div>
                        {wardBedSummary && (
                            <div className="hidden sm:flex text-[10px] font-black uppercase text-emerald-800 bg-emerald-50/90 px-3.5 py-2 rounded-2xl border border-emerald-200/70 items-center gap-1.5 shadow-2xs">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span>{wardBedSummary.availableBeds} Beds Ready</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-10 pt-8 space-y-10">

                {/* ========================================================================= */}
                {/* STEP 1: PATIENT SELECTION CARD */}
                {/* ========================================================================= */}
                <div className="relative overflow-hidden bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-bl from-indigo-50/70 to-transparent rounded-full -mr-20 -mt-20 pointer-events-none" />

                    <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-[#3d3f96] p-0.5 shadow-md shadow-indigo-950/15 shrink-0">
                                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-[#3d3f96]">
                                    <User size={24} />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Patient Profile
                                    </span>
                                    <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3d3f96] border border-indigo-100/80">
                                        {selectedPatient?.relation || "SELF"}
                                    </span>
                                </div>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight mt-0.5">
                                    {selectedPatient?.memberName || "Myself"}
                                </h3>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">
                                    {selectedPatient?.phone ? `Contact: ${selectedPatient.phone}` : "Primary personal medical file"}
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsPatientModalOpen(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs font-black text-[#3d3f96] hover:text-white bg-indigo-50/80 hover:bg-[#3d3f96] px-5 py-3 rounded-2xl border border-indigo-100 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-95"
                        >
                            <Users size={15} />
                            <span>Switch Patient / Add Member</span>
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* STEP 2: SELECT BOOKING CATEGORY */}
                {/* ========================================================================= */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-white bg-[#3d3f96] px-2.5 py-1 rounded-lg shadow-xs">
                                Step 1
                            </span>
                            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                                Choose Care Category
                            </h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
                        {/* OPD Option */}
                        <div
                            onClick={() => {
                                setBookingType('OPD');
                                setSelectedBed(null);
                            }}
                            className={`p-6 rounded-[1.75rem] border text-left transition-all duration-300 cursor-pointer relative flex items-start gap-4.5 bg-white group ${bookingType === 'OPD'
                                ? 'border-[#3d3f96] ring-3 ring-[#3d3f96]/15 shadow-xl shadow-indigo-950/10 -translate-y-1'
                                : 'border-slate-200/70 hover:border-slate-300 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${bookingType === 'OPD'
                                ? 'bg-[#3d3f96] text-white shadow-lg shadow-indigo-900/30 rotate-0'
                                : 'bg-indigo-50/80 text-[#3d3f96] border border-indigo-100/70 group-hover:scale-105'
                                }`}>
                                <Stethoscope size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight">OPD Consultation</h3>
                                    {bookingType === 'OPD' && (
                                        <div className="w-5 h-5 rounded-full bg-[#3d3f96] text-white flex items-center justify-center shadow-xs">
                                            <Check size={12} strokeWidth={3.5} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                    In-clinic visit, live video call, or doctor home visit
                                </p>
                                <span className="inline-block mt-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96]">
                                    Outpatient Care
                                </span>
                            </div>
                        </div>

                        {/* IPD Option */}
                        <div
                            onClick={() => setBookingType('IPD')}
                            className={`p-6 rounded-[1.75rem] border text-left transition-all duration-300 cursor-pointer relative flex items-start gap-4.5 bg-white group ${bookingType === 'IPD'
                                ? 'border-emerald-600 ring-3 ring-emerald-600/15 shadow-xl shadow-emerald-950/10 -translate-y-1'
                                : 'border-slate-200/70 hover:border-slate-300 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${bookingType === 'IPD'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                                : 'bg-emerald-50/80 text-emerald-700 border border-emerald-100/70 group-hover:scale-105'
                                }`}>
                                <Building2 size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight">IPD Admission</h3>
                                    {bookingType === 'IPD' && (
                                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                            <Check size={12} strokeWidth={3.5} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                    Specialist doctor rounds + multi-day inpatient bed stay
                                </p>
                                <span className="inline-block mt-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                                    Inpatient Stay
                                </span>
                            </div>
                        </div>

                        {/* Emergency Option */}
                        <div
                            onClick={() => setBookingType('EMERGENCY')}
                            className={`p-6 rounded-[1.75rem] border text-left transition-all duration-300 cursor-pointer relative flex items-start gap-4.5 bg-white group ${bookingType === 'EMERGENCY'
                                ? 'border-rose-600 ring-3 ring-rose-600/15 shadow-xl shadow-rose-950/10 -translate-y-1'
                                : 'border-slate-200/70 hover:border-slate-300 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${bookingType === 'EMERGENCY'
                                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                                : 'bg-rose-50/80 text-rose-600 border border-rose-100/70 group-hover:scale-105'
                                }`}>
                                <ShieldAlert size={24} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-slate-900 tracking-tight">Emergency / Triage</h3>
                                    {bookingType === 'EMERGENCY' && (
                                        <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-xs">
                                            <Check size={12} strokeWidth={3.5} />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                    Priority urgent doctor review + casualty observation bed
                                </p>
                                <span className="inline-block mt-3 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-600">
                                    Urgent Priority
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* STEP 3: DOCTOR SELECTION & VISIT TYPE SELECTION */}
                {/* ========================================================================= */}
                <div className="space-y-5 pt-4 border-t border-slate-200/70">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
                        <div className="flex items-center gap-2.5">
                            <span className="text-[11px] font-black uppercase tracking-wider text-white bg-[#3d3f96] px-2.5 py-1 rounded-lg shadow-xs">
                                Step 2
                            </span>
                            <div>
                                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                                    {bookingType === 'OPD' ? 'Select Doctor & Consultation Mode' : 'Select Attending Specialist'}
                                </h2>
                            </div>
                        </div>

                        {doctors.length > 2 && (
                            <div className="relative w-full sm:w-80">
                                <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={doctorSearch}
                                    onChange={(e) => setDoctorSearch(e.target.value)}
                                    placeholder="Search specialist by name or degree..."
                                    className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-[#3d3f96] focus:ring-2 focus:ring-[#3d3f96]/15 shadow-2xs transition-all"
                                />
                            </div>
                        )}
                    </div>

                    {filteredDoctors.length === 0 ? (
                        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs border-dashed">
                            <Activity size={40} className="text-slate-300 mx-auto mb-3" />
                            <h4 className="text-sm font-bold text-slate-700">No matching specialists found</h4>
                            <p className="text-xs text-slate-400 mt-1">Try clearing your search query "{doctorSearch}".</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredDoctors.map((doc) => {
                                const docPhoto = getMediaUrl(doc.profileImage) || DOC_PLACEHOLDER;
                                const isSelectedDoc = selectedDoctorId === doc._id;
                                const activeMode = selectedConsultModes[doc._id] || (doc.fees?.clinicVisitFee?.isAvailable ? 'clinicVisitFee' : doc.fees?.onlineConsultFee?.isAvailable ? 'onlineConsultFee' : 'homeVisitFee');

                                return (
                                    <div
                                        key={doc._id}
                                        onClick={() => setSelectedDoctorId(doc._id)}
                                        className={`flex flex-col bg-white rounded-[2rem] border transition-all duration-300 group overflow-hidden cursor-pointer ${isSelectedDoc
                                            ? 'border-[#3d3f96] ring-3 ring-[#3d3f96]/15 shadow-xl shadow-indigo-950/10 -translate-y-1'
                                            : 'border-slate-200/80 shadow-xs hover:shadow-lg hover:border-slate-300'
                                            }`}
                                    >
                                        {/* Doctor Image & Status Overlay */}
                                        <div className="relative h-56 w-full bg-slate-100 overflow-hidden">
                                            <img
                                                src={docPhoto}
                                                alt={doc.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                                                onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                                            />
                                            <div className="absolute inset-0 bg-linear-to-t from-slate-950/80 via-transparent to-black/20" />

                                            {/* On-Duty Badge */}
                                            <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 bg-emerald-500/95 backdrop-blur-md text-white px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm border border-white/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                                <span>On Duty</span>
                                            </div>

                                            {/* Rating Badge */}
                                            {doc.rating && (
                                                <div className="absolute top-3.5 right-3.5 bg-slate-950/75 backdrop-blur-md text-white px-2.5 py-1 rounded-xl flex items-center gap-1 text-[10px] font-black border border-white/10 shadow-xs z-10">
                                                    <Star size={11} className="fill-amber-400 text-amber-400" />
                                                    <span>{doc.rating}</span>
                                                </div>
                                            )}

                                            {/* Selected Badge */}
                                            {isSelectedDoc && (
                                                <div className="absolute bottom-3 right-3 bg-[#3d3f96] text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg border border-white/25 z-10 animate-in fade-in zoom-in-90 duration-200">
                                                    <Check size={12} strokeWidth={3} /> Selected
                                                </div>
                                            )}

                                            {/* Experience tag */}
                                            <div className="absolute bottom-3 left-3.5 text-white/95 text-[11px] font-bold z-10 flex items-center gap-1">
                                                <Clock size={12} className="text-white/80" />
                                                <span>{doc.experience || "10+ Yrs Exp."}</span>
                                            </div>
                                        </div>

                                        {/* Doctor Content */}
                                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                            <div>
                                                <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug group-hover:text-[#3d3f96] transition-colors truncate" title={doc.name}>
                                                    {doc.name}
                                                </h3>

                                                <p className="text-xs font-bold text-rose-600 truncate mt-0.5">
                                                    {doc.speciality}
                                                </p>

                                                {doc.degree && (
                                                    <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                                                        {doc.degree}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Consultation Mode / Type of Visit Selector Section */}
                                            <div className="pt-3.5 border-t border-slate-100 space-y-2.5" onClick={(e) => e.stopPropagation()}>

                                                {/* Header sign prompting user to choose consultation mode */}
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                                        <Sparkles size={12} className="text-[#3d3f96]" />
                                                        {bookingType === 'OPD' ? 'Choose Visit Mode *' : 'Specialist Fee'}
                                                    </span>
                                                    {bookingType === 'OPD' && isSelectedDoc && (
                                                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-[#3d3f96] text-white shadow-2xs flex items-center gap-1">
                                                            <Check size={9} strokeWidth={3} />
                                                            {activeMode === 'clinicVisitFee' ? 'Clinic' : activeMode === 'onlineConsultFee' ? 'Video' : 'Home'}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* 3-Way Mode Buttons with active states */}
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {/* Clinic */}
                                                    <button
                                                        type="button"
                                                        disabled={!doc.fees?.clinicVisitFee?.isAvailable}
                                                        onClick={() => {
                                                            setSelectedDoctorId(doc._id);
                                                            setSelectedConsultModes({ ...selectedConsultModes, [doc._id]: 'clinicVisitFee' });
                                                        }}
                                                        className={`py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${activeMode === 'clinicVisitFee' && isSelectedDoc
                                                            ? 'border-[#3d3f96] bg-indigo-50/80 text-[#3d3f96] font-black shadow-xs ring-2 ring-[#3d3f96]/20'
                                                            : 'border-slate-200/80 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                                            } ${!doc.fees?.clinicVisitFee?.isAvailable ? 'opacity-30 cursor-not-allowed border-dashed' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-0.5 text-[9px] font-black uppercase">
                                                            <MapPin size={10} className="text-rose-500 shrink-0" /> Clinic
                                                        </div>
                                                        <span className="text-[10px] font-mono font-black mt-0.5">
                                                            {doc.fees?.clinicVisitFee?.isAvailable ? `₹${doc.fees.clinicVisitFee.price}` : '—'}
                                                        </span>
                                                        {activeMode === 'clinicVisitFee' && isSelectedDoc && (
                                                            <span className="absolute -top-1 -right-1 bg-[#3d3f96] text-white rounded-full p-0.5 shadow-xs">
                                                                <Check size={8} strokeWidth={4} />
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Video */}
                                                    <button
                                                        type="button"
                                                        disabled={bookingType !== 'OPD' || !doc.fees?.onlineConsultFee?.isAvailable}
                                                        onClick={() => {
                                                            setSelectedDoctorId(doc._id);
                                                            setSelectedConsultModes({ ...selectedConsultModes, [doc._id]: 'onlineConsultFee' });
                                                        }}
                                                        className={`py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${activeMode === 'onlineConsultFee' && isSelectedDoc
                                                            ? 'border-[#3d3f96] bg-indigo-50/80 text-[#3d3f96] font-black shadow-xs ring-2 ring-[#3d3f96]/20'
                                                            : 'border-slate-200/80 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                                            } ${(bookingType !== 'OPD' || !doc.fees?.onlineConsultFee?.isAvailable) ? 'opacity-30 cursor-not-allowed border-dashed' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-0.5 text-[9px] font-black uppercase">
                                                            <Video size={10} className="text-indigo-600 shrink-0" /> Video
                                                        </div>
                                                        <span className="text-[10px] font-mono font-black mt-0.5">
                                                            {doc.fees?.onlineConsultFee?.isAvailable ? `₹${doc.fees.onlineConsultFee.price}` : '—'}
                                                        </span>
                                                        {activeMode === 'onlineConsultFee' && isSelectedDoc && (
                                                            <span className="absolute -top-1 -right-1 bg-[#3d3f96] text-white rounded-full p-0.5 shadow-xs">
                                                                <Check size={8} strokeWidth={4} />
                                                            </span>
                                                        )}
                                                    </button>

                                                    {/* Home Visit */}
                                                    <button
                                                        type="button"
                                                        disabled={bookingType !== 'OPD' || !doc.fees?.homeVisitFee?.isAvailable}
                                                        onClick={() => {
                                                            setSelectedDoctorId(doc._id);
                                                            setSelectedConsultModes({ ...selectedConsultModes, [doc._id]: 'homeVisitFee' });
                                                            setIsAddressModalOpen(true);
                                                        }}
                                                        className={`py-2.5 px-1 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center relative ${activeMode === 'homeVisitFee' && isSelectedDoc
                                                            ? 'border-[#3d3f96] bg-indigo-50/80 text-[#3d3f96] font-black shadow-xs ring-2 ring-[#3d3f96]/20'
                                                            : 'border-slate-200/80 bg-slate-50/60 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                                                            } ${(bookingType !== 'OPD' || !doc.fees?.homeVisitFee?.isAvailable) ? 'opacity-30 cursor-not-allowed border-dashed' : ''}`}
                                                    >
                                                        <div className="flex items-center gap-0.5 text-[9px] font-black uppercase">
                                                            <Home size={10} className="text-emerald-600 shrink-0" /> Home
                                                        </div>
                                                        <span className="text-[10px] font-mono font-black mt-0.5">
                                                            {doc.fees?.homeVisitFee?.isAvailable ? `₹${doc.fees.homeVisitFee.price}` : '—'}
                                                        </span>
                                                        {activeMode === 'homeVisitFee' && isSelectedDoc && (
                                                            <span className="absolute -top-1 -right-1 bg-[#3d3f96] text-white rounded-full p-0.5 shadow-xs">
                                                                <Check size={8} strokeWidth={4} />
                                                            </span>
                                                        )}
                                                    </button>
                                                </div>

                                                {/* Selected Mode Confirmation Sign inside Doctor Card */}
                                                {bookingType === 'OPD' && isSelectedDoc && (
                                                    <div className="bg-slate-50 rounded-xl p-2 border border-slate-200/70 flex items-center justify-between text-[10px]">
                                                        <span className="text-slate-500 font-bold">Selected Mode:</span>
                                                        <span className="font-black text-[#3d3f96] flex items-center gap-1">
                                                            {activeMode === 'clinicVisitFee' && <><MapPin size={11} className="text-rose-500" /> In-Clinic Visit</>}
                                                            {activeMode === 'onlineConsultFee' && <><Video size={11} className="text-indigo-600" /> Video Consult</>}
                                                            {activeMode === 'homeVisitFee' && <><Home size={11} className="text-emerald-600" /> Home Visit</>}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Home Visit Address Selector Pill */}
                                                {activeMode === 'homeVisitFee' && isSelectedDoc && (
                                                    <div
                                                        onClick={() => setIsAddressModalOpen(true)}
                                                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 mt-2 ${selectedAddress
                                                            ? 'bg-emerald-50/90 border-emerald-200 text-emerald-800'
                                                            : 'bg-rose-50/90 border-rose-200 text-rose-700 animate-pulse'
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <MapPin size={13} className={selectedAddress ? "text-emerald-600 shrink-0" : "text-rose-500 shrink-0"} />
                                                            <span className="text-[10px] font-bold truncate">
                                                                {selectedAddress ? `${selectedAddress.houseNo || ''} ${selectedAddress.city} (${selectedAddress.pincode})` : 'Choose Home Address *'}
                                                            </span>
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase underline shrink-0">
                                                            {selectedAddress ? 'Change' : 'Select'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ========================================================================= */}
                {/* STEP 4: WARD SELECTION (IPD / EMERGENCY) */}
                {/* ========================================================================= */}
                {(bookingType === 'IPD' || bookingType === 'EMERGENCY') && wardBedSummary && (
                    <div className="space-y-4 pt-4 border-t border-slate-200/70">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                                <span className="text-[11px] font-black uppercase tracking-wider text-white bg-emerald-600 px-2.5 py-1 rounded-lg shadow-xs">
                                    Step 3
                                </span>
                                <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900">
                                    {bookingType === 'EMERGENCY' ? 'Choose Emergency Ward & Bed' : 'Choose Inpatient Ward & Bed'}
                                </h2>
                            </div>

                            {selectedBed && (
                                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black px-3.5 py-1.5 rounded-2xl flex items-center gap-1.5 shadow-2xs">
                                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                                    <span>
                                        Bed {selectedBed.bedNumber} ({selectedWard?.wardName}) • <strong>{selectedBed.totalDays} Days</strong> (₹{selectedBed.totalBedPrice})
                                    </span>
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wardBedSummary.wards?.map((ward) => {
                                const isWardActiveForBed = selectedWard?.wardId === ward.wardId && selectedBed;
                                const percentFree = Math.round((ward.availableBeds / (ward.totalBeds || 1)) * 100);

                                return (
                                    <div
                                        key={ward.wardId}
                                        onClick={() => handleOpenWardModal(ward)}
                                        className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-5 bg-white group ${isWardActiveForBed
                                            ? 'bg-emerald-50/40 border-emerald-600 ring-3 ring-emerald-600/15 shadow-lg'
                                            : 'border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md'
                                            }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-base font-black text-slate-900 tracking-tight truncate">
                                                    {ward.wardName}
                                                </h3>
                                                <span className="text-[9px] font-black uppercase px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200/70">
                                                    {ward.wardType}
                                                </span>
                                            </div>

                                            {/* Capacity Progress Bar */}
                                            <div className="space-y-2 mt-3.5">
                                                <div className="flex justify-between text-[11px] text-slate-500 font-bold">
                                                    <span>Available Beds</span>
                                                    <span className="text-slate-800 font-black">{ward.availableBeds} of {ward.totalBeds} Free</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
                                                    <div
                                                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                                                        style={{ width: `${percentFree}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                            <div>
                                                <span className="text-[9px] uppercase font-black text-slate-400 block">Daily Charge</span>
                                                <span className="text-base font-mono font-black text-slate-900">
                                                    ₹{ward.pricePerDay}<span className="text-xs text-slate-400 font-normal">/day</span>
                                                </span>
                                            </div>

                                            <span className={`text-xs font-black px-4 py-2.5 rounded-2xl transition-all flex items-center gap-1.5 shadow-xs ${isWardActiveForBed
                                                ? 'bg-emerald-600 text-white shadow-emerald-950/15'
                                                : 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/15'
                                                }`}>
                                                <Bed size={14} />
                                                <span>{isWardActiveForBed ? `Bed: ${selectedBed.bedNumber} (${selectedBed.totalDays}d)` : 'Choose Bed'}</span>
                                                <ChevronRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

            </main>

            {/* --- MODALS --- */}
            <ChoosePatient
                isOpen={isPatientModalOpen}
                onClose={() => setIsPatientModalOpen(false)}
                selectedPatient={selectedPatient}
                onSelectPatient={(patient) => setSelectedPatient(patient)}
            />

            <WardBeds
                isOpen={isWardModalOpen}
                onClose={() => setIsWardModalOpen(false)}
                ward={selectedWard}
                selectedBed={selectedBed}
                onSelectBed={(bed) => {
                    setSelectedBed(bed);
                    setIsWardModalOpen(false);
                }}
            />

            <AddressModel
                isOpen={isAddressModalOpen}
                onClose={() => setIsAddressModalOpen(false)}
                selectedAddress={selectedAddress}
                onSelectAddress={(address) => {
                    setSelectedAddress(address);
                    setIsAddressModalOpen(false);
                }}
            />

            {/* --- PROFESSIONAL FLOATING SUMMARY DOCK --- */}
            <div className="fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 px-4 sm:px-6 flex items-center justify-center pointer-events-none">
                <div className="pointer-events-auto w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-3xl sm:rounded-[2.25rem] border border-slate-200/90 shadow-2xl shadow-slate-900/20 p-4 sm:px-7 sm:py-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">

                    {/* Left: Summary text */}
                    <div className="flex items-center gap-4 w-full sm:w-auto min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/90 flex items-center justify-center text-[#3d3f96] shrink-0 shadow-xs">
                            <Activity size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[#3d3f96] block leading-none">
                                    {bookingType} Tier
                                </span>
                                <span className="text-[9px] font-bold text-slate-400">•</span>
                                <span className="text-[10px] font-bold text-slate-600 truncate">
                                    For {selectedPatient?.memberName || "Patient"}
                                </span>
                            </div>

                            <div className="mt-1">
                                {bookingType === 'OPD' ? (
                                    activeDoctor ? (
                                        <div className="truncate">
                                            <div className="flex items-center gap-2 truncate">
                                                <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                                    {activeDoctor.name}
                                                </h4>
                                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                                    {selectedDoctorMode === 'clinicVisitFee' ? 'Clinic Visit' : selectedDoctorMode === 'onlineConsultFee' ? 'Video Call' : 'Home Visit'}
                                                </span>
                                            </div>

                                            {selectedDoctorMode === 'homeVisitFee' && (
                                                <div
                                                    onClick={() => setIsAddressModalOpen(true)}
                                                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#3d3f96] cursor-pointer mt-0.5 truncate"
                                                >
                                                    <MapPin size={12} className={selectedAddress ? "text-emerald-500 shrink-0" : "text-rose-500 shrink-0"} />
                                                    <span className="truncate">
                                                        {selectedAddress
                                                            ? `${selectedAddress.houseNo || ''} ${selectedAddress.city} (${selectedAddress.pincode})`
                                                            : 'Address required (Click to select)'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <p className="text-xs font-bold text-slate-400">Please choose an attending specialist</p>
                                    )
                                ) : (
                                    <div className="flex items-center gap-2 truncate">
                                        <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate">
                                            {activeDoctor ? activeDoctor.name : "Doctor Pending"} • {selectedBed ? `Bed ${selectedBed.bedNumber} (${selectedBed.totalDays}d)` : "Bed Required"}
                                        </h4>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Total Price + CTA Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="text-left sm:text-right">
                            <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">Total Due</span>
                            <span className="text-lg sm:text-xl font-mono font-black text-slate-900 tracking-tight">
                                ₹{totalPrice}
                            </span>
                        </div>

                        <button
                            disabled={!isBookingReady}
                            onClick={handleProceedToReview}
                            className={`py-3.5 px-7 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shrink-0 ${isBookingReady
                                ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/25 cursor-pointer hover:scale-[1.02] active:scale-98'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <span>
                                {selectedDoctorMode === 'homeVisitFee' && !selectedAddress
                                    ? 'Choose Address'
                                    : 'Review & Confirm'}
                            </span>
                            <ChevronRight size={15} />
                        </button>
                    </div>

                </div>
            </div>

        </div>
    );
}