"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Stethoscope,
    User,
    MapPin,
    Video,
    Home,
    Bed,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    FileText,
    Receipt,
    Phone,
    Loader2,
    Check,
    Activity,
    Lock,
    Tag,
    Percent,
    Ticket,
    ChevronRight,
    Car,
    Star,
    Sparkles,
    Clock,
    Calendar,
    UploadCloud,
    Paperclip,
    X
} from 'lucide-react';

import ClinicCoupon from './components/ClinicCoupon';
import { useNotification } from '../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function ClinicReviewPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClinicId = searchParams.get('clinicId');
    const { showNotification } = useNotification();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);

    // Symptoms / Medical Notes & Document Upload State
    const [patientSymptoms, setPatientSymptoms] = useState("");
    const [attachedFile, setAttachedFile] = useState(null);

    // Coupon Modal & Selection State
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Retrieve active booking data from sessionStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedData = sessionStorage.getItem("activeClinicBooking");
            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    setBooking(parsed);
                } catch (e) {
                    console.error("Error reading stored booking configuration:", e);
                }
            }
            setLoading(false);
        }
    }, []);

    // Handle document/prescription file selection
    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachedFile({
                name: file.name,
                size: file.size,
                type: file.type,
                fileObject: file
            });
        }
    };

    const handleRemoveFile = () => {
        setAttachedFile(null);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-linear-to-b from-[#f4f7fc] to-[#eef2f9] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-[#3d3f96] border-r-rose-500 animate-spin" />
                    <Stethoscope size={22} className="absolute text-[#3d3f96]" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 mt-5">
                    Preparing Booking Review...
                </h3>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                    Compiling doctor consultation details, admission records &amp; fleet breakdown
                </p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">No Active Booking Session Found</h2>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm font-medium leading-relaxed">
                    Your appointment session could not be retrieved. Please return to select your preferred medical specialist.
                </p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider px-6 py-3.5 rounded-2xl transition-all shadow-md cursor-pointer hover:scale-[1.02]"
                >
                    <ArrowLeft size={14} /> Return to Booking
                </button>
            </div>
        );
    }

    const {
        clinicName,
        bookingType,
        patient,
        doctor,
        address,
        homeVisitDetails,
        ward,
        ambulance,
        pricingBreakdown,
        totalPrice
    } = booking;

    const doctorPhoto = getMediaUrl(doctor?.profileImage) || DOC_PLACEHOLDER;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalPayable = Math.max(0, totalPrice - discountAmount);

    // Handle Payment & Final Confirmation
    const handleConfirmPayment = () => {
        setProcessingPayment(true);

        const finalOrderPayload = {
            ...booking,
            symptoms: patientSymptoms.trim(),
            medicalDocument: attachedFile ? {
                fileName: attachedFile.name,
                fileType: attachedFile.type,
                fileSize: attachedFile.size
            } : null,
            coupon: appliedCoupon ? {
                couponId: appliedCoupon._id,
                couponName: appliedCoupon.couponName,
                discountPercentage: appliedCoupon.discountPercentage,
                discountAmount: discountAmount
            } : null,
            subtotal: totalPrice,
            discountAmount: discountAmount,
            finalAmount: finalPayable,
            bookedAt: new Date().toISOString()
        };

        // Store confirmed order receipt in session storage
        if (typeof window !== "undefined") {
            sessionStorage.setItem("confirmedClinicOrder", JSON.stringify(finalOrderPayload));
        }

        setTimeout(() => {
            setProcessingPayment(false);
            if (showNotification) {
                showNotification(`Appointment successfully confirmed with ${doctor?.name || clinicName}!`, "success");
            }
            router.push('/otherscreens/carts/foodcart');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-linear-to-b from-[#f8fbff] via-[#f4f7fb] to-[#edf2f9] text-slate-800 pb-28 antialiased select-none text-left">

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-slate-200/70 shadow-xs">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 px-3.5 py-2.5 rounded-2xl transition-all cursor-pointer shadow-xs hover:shadow-sm"
                        >
                            <ArrowLeft size={15} />
                            <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Modify Choices</span>
                        </button>
                        <span className="hidden sm:inline-block h-5 w-px bg-slate-200" />
                        <div>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[#3d3f96] flex items-center gap-1 leading-none">
                                <Building2 size={11} /> Review &amp; Checkout
                            </span>
                            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate max-w-xs sm:max-w-md mt-0.5">
                                {clinicName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-3.5 py-1.5 rounded-2xl border flex items-center gap-1.5 shadow-2xs ${
                            bookingType === 'EMERGENCY'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : bookingType === 'IPD'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{bookingType} Package</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: COMPREHENSIVE BOOKING BREAKDOWN (7/12) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. Patient Profile Summary Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Patient Medical Profile
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Record attached to this appointment</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/70">
                                    {patient?.relation || "PATIENT"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium pt-1">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                                        {patient?.memberName || "Primary Account"}
                                    </strong>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                                    <span className="text-slate-800 font-bold block mt-0.5">
                                        {patient?.phone || "Registered Account"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender &amp; DOB</span>
                                    <span className="text-slate-800 font-semibold block mt-0.5">
                                        {patient?.gender || "Not Specified"} {patient?.dob ? `(${patient.dob})` : ''}
                                    </span>
                                </div>

                                {(patient?.height || patient?.weight) && (
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Physical Metrics</span>
                                        <span className="text-slate-800 font-semibold block mt-0.5">
                                            {patient?.height ? `Ht: ${patient.height}` : ''} {patient?.weight ? `• Wt: ${patient.weight}` : ''}
                                        </span>
                                    </div>
                                )}

                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Health Insurance</span>
                                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${
                                        patient?.hasInsurance ? "text-emerald-700" : "text-slate-500"
                                    }`}>
                                        <ShieldCheck size={13} className={patient?.hasInsurance ? "text-emerald-600" : "text-slate-400"} />
                                        {patient?.hasInsurance ? `Linked (${patient.insuranceNo || 'Active'})` : "Self-Pay / Not Linked"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Doctor & Consultation Mode Card */}
                        {doctor && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                    <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                        <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center">
                                            <Stethoscope size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                                Attending Medical Specialist
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Doctor review and clinical assessment</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-black text-slate-900 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl">
                                        Fee: ₹{doctor.fee}
                                    </span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-18 h-18 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={doctorPhoto}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                                        />
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                                                {doctor.name}
                                            </h4>
                                            {doctor.rating && (
                                                <span className="flex items-center gap-1 text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-lg">
                                                    <Star size={10} className="fill-amber-400 text-amber-400" />
                                                    {doctor.rating}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs font-bold text-rose-600 truncate">
                                            {doctor.speciality} {doctor.degree ? `(${doctor.degree})` : ''}
                                        </p>

                                        {doctor.experience && (
                                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                <Clock size={11} /> {doctor.experience}
                                            </p>
                                        )}

                                        {/* Consultation Mode Tag */}
                                        <div className="pt-2 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#3d3f96] px-3 py-1 rounded-xl text-[10px] font-black uppercase">
                                                {doctor.mode === 'clinicVisitFee' && <><MapPin size={12} className="text-rose-500" /> In-Clinic Consultation</>}
                                                {doctor.mode === 'onlineConsultFee' && <><Video size={12} className="text-indigo-600" /> Video Teleconsultation</>}
                                                {doctor.mode === 'homeVisitFee' && <><Home size={12} className="text-emerald-600" /> Doctor Home Visit</>}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Home Visit Destination & Schedule Card (Shown when Home Visit is selected) */}
                        {doctor?.mode === 'homeVisitFee' && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/90 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-emerald-100 pb-3.5">
                                    <div className="flex items-center gap-2.5 text-emerald-700">
                                        <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                                            <Home size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                                Home Visit Schedule &amp; Destination
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Doctor visit address, timing slot &amp; clinical condition</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                                        Home Consult
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium pt-1">
                                    {/* Destination Address */}
                                    {address && (
                                        <div className="sm:col-span-2 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                                                <MapPin size={11} className="text-emerald-600" /> Destination Address
                                            </span>
                                            <p className="text-slate-800 font-bold leading-relaxed">
                                                {address.houseNo ? `${address.houseNo}, ` : ''}
                                                {address.sector ? `${address.sector}, ` : ''}
                                                {address.landmark ? `Near ${address.landmark}, ` : ''}
                                                {address.city}, {address.state} - <span className="font-mono font-black text-slate-900">{address.pincode}</span>
                                            </p>
                                            {address.phone && (
                                                <span className="text-[11px] text-slate-500 font-medium block">
                                                    Recipient Phone: {address.phone}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Visit Date & Slot */}
                                    {homeVisitDetails?.visitDate && (
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Visit Date &amp; Slot</span>
                                            <strong className="text-slate-900 block mt-0.5">
                                                {homeVisitDetails.visitDate}
                                            </strong>
                                            <span className="text-[11px] text-slate-500 font-medium block">
                                                {homeVisitDetails.preferredTime}
                                            </span>
                                        </div>
                                    )}

                                    {/* Patient Condition */}
                                    {homeVisitDetails?.patientCondition && (
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient's Current Condition</span>
                                            <span className="text-emerald-800 font-bold bg-emerald-50 border border-emerald-200/70 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                                                {homeVisitDetails.patientCondition}
                                            </span>
                                        </div>
                                    )}

                                    {/* Reason for Visit */}
                                    {homeVisitDetails?.reason && (
                                        <div className="sm:col-span-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Primary Reason for Home Visit</span>
                                            <p className="text-slate-800 font-medium mt-0.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                {homeVisitDetails.reason}
                                            </p>
                                        </div>
                                    )}

                                    {/* Existing Prescription (Optional) */}
                                    {homeVisitDetails?.prescription && (
                                        <div className="sm:col-span-2">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Attached Prescription / Rx Notes</span>
                                            <span className="text-slate-700 font-medium flex items-center gap-1.5 mt-0.5 text-[11px]">
                                                <Sparkles size={12} className="text-amber-500 shrink-0" />
                                                {homeVisitDetails.prescription}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 4. Inpatient / Casualty Ward & Bed Details (If selected) */}
                        {ward && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                    <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                        <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100/80 flex items-center justify-center text-emerald-700">
                                            <Bed size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                                {bookingType === 'EMERGENCY' ? 'Emergency Casualty Bed' : 'Inpatient Ward & Stay Duration'}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Facility room and admission allocation</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-black text-emerald-800 bg-emerald-50 border border-emerald-200/70 px-3 py-1 rounded-xl">
                                        {ward.totalDays} {ward.totalDays === 1 ? 'Day' : 'Days'} Stay
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium pt-1">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Ward Category</span>
                                        <strong className="text-sm font-black text-slate-900 block mt-0.5">
                                            {ward.wardName} <span className="text-slate-500 font-normal">({ward.wardType})</span>
                                        </strong>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Bed Number</span>
                                        <span className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">
                                            Bed #{ward.bedNumber}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Stay Duration Dates</span>
                                        <span className="text-slate-800 font-bold block mt-0.5">
                                            {ward.startDate} <span className="text-slate-400 font-normal">to</span> {ward.endDate}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Bed Calculation</span>
                                        <span className="text-slate-800 font-mono font-bold block mt-0.5">
                                            ₹{ward.pricePerDay}/day × {ward.totalDays}d = <strong className="text-slate-900">₹{ward.totalBedPrice}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 5. Emergency Ambulance Dispatch Details (If chosen) */}
                        {bookingType === 'EMERGENCY' && ambulance && (
                            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-rose-200 shadow-xs space-y-4">
                                <div className="flex items-center justify-between border-b border-rose-100 pb-3.5">
                                    <div className="flex items-center gap-2.5 text-rose-600">
                                        <div className="w-9 h-9 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                                            <Car size={18} />
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                                Emergency Ambulance Dispatch
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-medium">Hospital fleet pickup with paramedic support</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-mono font-black text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1 rounded-xl">
                                        Total: ₹{ambulance.totalAmbulancePrice}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium pt-1">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Category</span>
                                        <strong className="text-sm font-black text-slate-900 block mt-0.5">
                                            {ambulance.vehicleType}
                                        </strong>
                                        <span className="text-[11px] font-mono text-slate-500 font-bold">
                                            Number: {ambulance.vehicleNumber}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Driver Details</span>
                                        <span className="text-slate-800 font-bold block mt-0.5">
                                            {ambulance.driverName}
                                        </span>
                                        {ambulance.phone && (
                                            <span className="text-[11px] text-slate-500 font-medium">
                                                Phone: {ambulance.phone}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Ride Type</span>
                                        <span className="text-slate-800 font-bold block mt-0.5">
                                            {ambulance.rideType === 'round' ? 'Round-Trip' : 'One-Way Ride'} (₹{ambulance.ridePrice})
                                        </span>
                                        {ambulance.distanceText && (
                                            <span className="text-[10px] text-rose-600 font-bold">
                                                Distance: {ambulance.distanceText}
                                            </span>
                                        )}
                                    </div>

                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">On-Board Paramedic Staff</span>
                                        <div className="space-y-1 mt-0.5">
                                            <span className={`text-[11px] font-bold block ${ambulance.supportStaff?.nurse?.selected ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                • Nurse: {ambulance.supportStaff?.nurse?.selected ? `Active (+₹${ambulance.supportStaff.nurse.price})` : 'Not Requested'}
                                            </span>
                                            <span className={`text-[11px] font-bold block ${ambulance.supportStaff?.doctor?.selected ? 'text-emerald-700' : 'text-slate-400'}`}>
                                                • Doctor: {ambulance.supportStaff?.doctor?.selected ? `Active (+₹${ambulance.supportStaff.doctor.price})` : 'Not Requested'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 6. Clinical Notes, Symptoms & Document Upload */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Clinical Notes &amp; Medical Documents
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-medium">Describe symptoms and attach existing prescription / lab reports</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-xl bg-slate-100 text-slate-600 border border-slate-200/70">
                                    Optional
                                </span>
                            </div>

                            {/* Symptoms Description */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                                    Describe Symptoms or Reason for Visit
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. Fever for 2 days, persistent back pain, high blood pressure checkup, medical history..."
                                    value={patientSymptoms}
                                    onChange={(e) => setPatientSymptoms(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] focus:ring-2 focus:ring-[#3d3f96]/15 transition-all resize-none leading-relaxed"
                                />
                            </div>

                            {/* Document / Prescription Upload Area */}
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                        <Paperclip size={12} className="text-[#3d3f96]" /> Upload Prescription / Medical Reports (PDF or Image)
                                    </label>
                                    <span className="text-[9px] font-bold text-slate-400">PDF, JPG, PNG up to 10MB</span>
                                </div>

                                {!attachedFile ? (
                                    <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50/70 hover:bg-white rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96] mb-2 group-hover:scale-105 transition-transform">
                                            <UploadCloud size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-800">
                                            Click to browse or drag &amp; drop prescription / report
                                        </span>
                                        <span className="text-[10px] text-slate-400 mt-0.5">
                                            Attaches securely to your consultation file for the doctor
                                        </span>
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                        />
                                    </label>
                                ) : (
                                    <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                                <FileText size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-xs font-black text-emerald-950 truncate max-w-xs sm:max-w-sm">
                                                        {attachedFile.name}
                                                    </span>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-800 shrink-0">
                                                        Attached
                                                    </span>
                                                </div>
                                                <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">
                                                    {attachedFile.size ? `${(attachedFile.size / 1024).toFixed(1)} KB` : 'Ready for doctor review'}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="w-8 h-8 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-emerald-200 hover:border-rose-200 transition-colors flex items-center justify-center cursor-pointer shrink-0"
                                            title="Remove attached file"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: COUPONS & PAYMENT DOCK (5/12) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

                        {/* 7. COUPONS & PROMO OFFERS CARD */}
                        <div
                            onClick={() => setIsCouponModalOpen(true)}
                            className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs transition-all hover:border-[#3d3f96] hover:shadow-md cursor-pointer space-y-3 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                                        <Tag size={18} />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 group-hover:text-[#3d3f96] transition-colors">
                                            Coupons &amp; Offers
                                        </h4>
                                        <p className="text-[11px] text-slate-400 font-medium">
                                            {appliedCoupon ? `Applied: ${appliedCoupon.couponName}` : 'View available clinic promo codes'}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-xs font-bold text-[#3d3f96]">
                                    <span>{appliedCoupon ? 'Change' : 'Apply'}</span>
                                    <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                </div>
                            </div>

                            {/* Applied Coupon Preview Chip */}
                            {appliedCoupon && (
                                <div
                                    className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-2 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                            <Check size={11} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <span className="font-mono font-black text-emerald-900 block leading-tight">
                                                '{appliedCoupon.couponName}' Applied
                                            </span>
                                            <span className="text-[10px] text-emerald-700 font-bold">
                                                Saving ₹{discountAmount} on this appointment
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setAppliedCoupon(null)}
                                        className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-700 underline cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* 8. DETAILED COST BREAKDOWN & PAYMENT SUMMARY CARD */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
                            <div className="flex items-center gap-2.5 pb-3.5 border-b border-slate-100">
                                <Receipt size={20} className="text-[#3d3f96]" />
                                <div>
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                        Payment Summary
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Itemized care fee breakdown</p>
                                </div>
                            </div>

                            <div className="space-y-3 text-xs font-medium text-slate-600">
                                {/* Doctor Fee */}
                                {doctor && (
                                    <div className="flex items-center justify-between">
                                        <span>Specialist Consultation Fee</span>
                                        <span className="font-mono font-bold text-slate-900">₹{doctor.fee}</span>
                                    </div>
                                )}

                                {/* Bed Fee */}
                                {ward && (
                                    <div className="flex items-center justify-between">
                                        <span>
                                            Bed #{ward.bedNumber} ({ward.totalDays}d × ₹{ward.pricePerDay})
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">₹{ward.totalBedPrice}</span>
                                    </div>
                                )}

                                {/* Ambulance Base & Addons */}
                                {ambulance && (
                                    <>
                                        <div className="flex items-center justify-between">
                                            <span>Ambulance ({ambulance.rideType === 'round' ? 'Round-Trip' : 'One-Way'})</span>
                                            <span className="font-mono font-bold text-slate-900">₹{ambulance.ridePrice}</span>
                                        </div>
                                        {ambulance.supportStaff?.nurse?.selected && (
                                            <div className="flex items-center justify-between pl-3 text-slate-500">
                                                <span>• On-Board Nurse Support</span>
                                                <span className="font-mono font-bold text-slate-900">+₹{ambulance.supportStaff.nurse.price}</span>
                                            </div>
                                        )}
                                        {ambulance.supportStaff?.doctor?.selected && (
                                            <div className="flex items-center justify-between pl-3 text-slate-500">
                                                <span>• On-Board Doctor Support</span>
                                                <span className="font-mono font-bold text-slate-900">+₹{ambulance.supportStaff.doctor.price}</span>
                                            </div>
                                        )}
                                    </>
                                )}

                                {/* Subtotal */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-slate-800 font-bold">
                                    <span>Subtotal</span>
                                    <span className="font-mono font-black text-slate-900">₹{totalPrice}</span>
                                </div>

                                {/* Coupon Discount */}
                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                                        <span className="flex items-center gap-1">
                                            <Percent size={12} /> Coupon Discount ({appliedCoupon?.couponName})
                                        </span>
                                        <span className="font-mono">- ₹{discountAmount}</span>
                                    </div>
                                )}

                                {/* Final Total Payable */}
                                <div className="pt-4 border-t border-slate-200 flex items-baseline justify-between text-slate-900">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Total Due</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Zero static charges</span>
                                    </div>
                                    <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                                        ₹{finalPayable}
                                    </strong>
                                </div>
                            </div>

                            {/* Confirm & Pay Button */}
                            <button
                                type="button"
                                disabled={processingPayment}
                                onClick={handleConfirmPayment}
                                className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-xl shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 hover:scale-[1.01] active:scale-98"
                            >
                                {processingPayment ? (
                                    <Loader2 size={18} className="animate-spin text-white" />
                                ) : (
                                    <Lock size={16} />
                                )}
                                <span>{processingPayment ? 'Confirming Appointment...' : `Pay ₹${finalPayable} & Confirm`}</span>
                            </button>
                        </div>

                        {/* Assurance & Clinical Security Badge */}
                        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-2 flex items-start gap-3.5">
                            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={22} />
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Verified Facility &amp; Instant Token
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Your hospital admission pass, doctor queue token, and ambulance dispatch priority will be generated immediately upon confirmation.
                                </p>
                            </div>
                        </div>

                    </div>

                </div>
            </main>

            {/* --- RIGHT-SIDE CLINIC COUPONS SLIDE-OVER MODAL (Z-INDEX 5000) --- */}
            <ClinicCoupon
                isOpen={isCouponModalOpen}
                onClose={() => setIsCouponModalOpen(false)}
                clinicId={queryClinicId || booking.clinicId}
                bookingTotal={totalPrice}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={(couponObj) => setAppliedCoupon(couponObj)}
                onRemoveCoupon={() => setAppliedCoupon(null)}
            />

        </div>
    );
}