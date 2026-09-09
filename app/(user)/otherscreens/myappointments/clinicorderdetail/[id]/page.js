"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Building2,
    Stethoscope,
    User,
    Calendar,
    Clock,
    MapPin,
    Video,
    Home,
    Bed,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
    CreditCard,
    Receipt,
    Phone,
    Loader2,
    Percent,
    Ticket,
    FileText,
    Ambulance,
    HeartPulse,
    Activity,
    ShieldAlert,
    Download,
    Printer,
    Check,
    Eye,
    ExternalLink,
    Image as ImageIcon,
    FileCheck,
    FileCode,
    Sparkles,
    Hash
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

// --- BASE MEDIA URL HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.4:5002";

const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=400&auto=format&fit=crop";
const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function ClinicalOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id;
    const { showNotification } = useNotification();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImagePreview, setSelectedImagePreview] = useState(null);

    // Fetch single clinical booking details
    useEffect(() => {
        if (!bookingId) return;

        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await UserAPI.getSingleClinicalBookingDetails(bookingId);
                if (response && response.success) {
                    setBooking(response.data);
                } else {
                    setBooking(null);
                    if (showNotification) {
                        showNotification("Unable to load booking details.", "error");
                    }
                }
            } catch (err) {
                console.error("Error fetching clinical booking details:", err);
                setBooking(null);
                if (showNotification) {
                    showNotification(err.response?.data?.message || err.message || "Failed to retrieve booking.", "error");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [bookingId, showNotification]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                    Loading Clinical Order Receipt...
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Retrieving attending doctor notes, reports, and transaction summary
                </p>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
                <div className="w-14 h-14 rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 mb-4 shadow-sm">
                    <AlertCircle size={28} />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Booking Record Not Found</h2>
                <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm font-medium">
                    We could not locate this clinical appointment. It may have been unlisted or moved.
                </p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer"
                >
                    <ArrowLeft size={14} /> Back to Appointments
                </button>
            </div>
        );
    }

    // Deconstruct API properties
    const {
        bookingId: orderCode,
        bookingType,
        bedBookingType,
        bookingReason,
        patients = [],
        address,
        appointmentDate,
        appointmentTime,
        consultationType,
        pricingBreakdown = {},
        couponDetails,
        insuranceDetails = {},
        totalAmount,
        paymentStatus,
        status,
        stayDuration,
        wardName,
        bedNumber,
        startDate,
        endDate,
        clinicalSummary = {},
        paymentDetails = {},
        ambulanceId,
        clinicId: clinic = {},
        doctorId: doctor = {},
        rescheduleReason,
        rescheduleCount = 0,
        cancellationCount = 0,
        createdAt
    } = booking;

    const primaryPatient = patients[0] || {};
    const clinicImage = getMediaUrl(clinic.image) || CLINIC_PLACEHOLDER;
    const doctorImage = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;

    const isConfirmed = status?.toLowerCase() === 'confirmed';
    const isPaid = paymentStatus?.toLowerCase() === 'paid';
    const isHomeVisit = consultationType?.toLowerCase().includes('home');
    const isVideo = consultationType?.toLowerCase().includes('video') || consultationType?.toLowerCase().includes('tele');

    const formattedBookedDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const formattedApptDate = appointmentDate
        ? new Date(appointmentDate).toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
          })
        : 'Date Pending';

    const uploadedReportsList = clinicalSummary?.uploadedReports || [];

    return (
        <div className="min-h-screen bg-[#f8fbff] text-slate-800 pb-28 antialiased select-none text-left">
            
            {/* Top Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                            <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Back</span>
                        </button>
                        <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
                        <div>
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block leading-none">
                                Booking Reference
                            </span>
                            <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight font-mono mt-0.5">
                                {orderCode || booking._id}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Consultation Type Badge */}
                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
                            isHomeVisit
                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                : isVideo
                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                        }`}>
                            {isHomeVisit ? <Home size={12} /> : isVideo ? <Video size={12} /> : <Building2 size={12} />}
                            <span>{consultationType || bookingType || "In-Clinic Visit"}</span>
                        </span>

                        {/* Status Badge */}
                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
                            isConfirmed ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span>{status || 'Confirmed'}</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* LEFT COLUMN: ORDER DETAILS, DOCTOR, ADDRESS, REPORTS (7/12) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* 1. Clinic Facility Overview */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-[#3d3f96]">
                                    <Building2 size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Healthcare Facility & Clinic
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                    Booked on {formattedBookedDate}
                                </span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                                    <img
                                        src={clinicImage}
                                        alt={clinic.clinicName || clinic.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = CLINIC_PLACEHOLDER; }}
                                    />
                                </div>

                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="text-base font-black text-slate-900 truncate">
                                        {clinic.clinicName || clinic.name || "Mudabir's Clinic"}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 leading-relaxed">
                                        <MapPin size={13} className="text-rose-500 shrink-0" />
                                        <span>{clinic.address ? `${clinic.address}, ` : ''}{clinic.city}, {clinic.state}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Attending Specialist Doctor Card */}
                        {doctor && doctor.name && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-[#3d3f96]">
                                        <Stethoscope size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Attending Doctor / Specialist
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100 font-mono">
                                        {consultationType}
                                    </span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                                        <img
                                            src={doctorImage}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.currentTarget.src = DOC_PLACEHOLDER; }}
                                        />
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-base font-black text-slate-900">
                                                {doctor.name}
                                            </h4>
                                            {doctor.qualification && (
                                                <span className="text-[10px] font-black text-slate-500 uppercase bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                                                    {doctor.qualification}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-bold text-[#3d3f96]">
                                            {doctor.speciality} {doctor.experienceYears ? `• ${doctor.experienceYears}+ Yrs Experience` : ''}
                                        </p>
                                    </div>
                                </div>

                                {/* Appointment Schedule strip */}
                                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                                        <Calendar size={14} className="text-[#3d3f96]" />
                                        <span>{formattedApptDate}</span>
                                    </div>
                                    <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                                        <Clock size={14} className="text-amber-500" />
                                        <span>{appointmentTime || 'Morning Slot'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Home Visit Patient Address (Rendered when address is provided) */}
                        {address && (address.houseNo || address.city || address.name) && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-orange-600">
                                        <Home size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Home Visit Delivery Address
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                                        {address.addressType || 'Home'}
                                    </span>
                                </div>

                                <div className="space-y-1.5 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                        <strong className="text-sm font-black text-slate-900">{address.name}</strong>
                                        {address.phone && (
                                            <span className="text-xs font-mono font-bold text-slate-500 flex items-center gap-1">
                                                <Phone size={11} className="text-slate-400" /> {address.phone}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-slate-600 font-semibold leading-relaxed">
                                        {address.houseNo}{address.sector ? `, ${address.sector}` : ''}
                                        {address.landmark ? ` (Landmark: ${address.landmark})` : ''}
                                        <br />
                                        {address.city}, {address.state} - <span className="font-mono font-bold">{address.pincode}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* 4. Patient Medical Profile Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-[#3d3f96]">
                                    <User size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Patient Details
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                                    {primaryPatient.relation || "SELF"}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                                    <strong className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                                        {primaryPatient.patientName || "Primary User"}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Age &amp; Gender</span>
                                    <span className="text-slate-800 font-bold block mt-0.5">
                                        {primaryPatient.patientAge || '30'} Yrs • {primaryPatient.gender || 'Male'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Insurance Linked</span>
                                    <span className={`font-bold block mt-0.5 ${insuranceDetails.hasInsurance ? 'text-emerald-700' : 'text-slate-500'}`}>
                                        {insuranceDetails.hasInsurance ? `Yes (${insuranceDetails.insuranceNumber || 'Active'})` : 'Self-Pay / None'}
                                    </span>
                                </div>
                            </div>

                            {/* Chief Complaint / Reason for Visit */}
                            {(bookingReason || primaryPatient.reasonForVisit) && (
                                <div className="pt-2 border-t border-slate-50 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                        Reason for Consultation / Symptoms
                                    </span>
                                    <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/80 leading-relaxed font-semibold">
                                        &ldquo;{bookingReason || primaryPatient.reasonForVisit}&rdquo;
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 5. Uploaded Medical Reports & Clinical Documents */}
                        {uploadedReportsList.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-[#3d3f96]">
                                        <FileText size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Uploaded Medical Reports ({uploadedReportsList.length})
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 font-mono">
                                        Attached Documents
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {uploadedReportsList.map((reportPath, idx) => {
                                        const reportUrl = getMediaUrl(reportPath);
                                        const isPdf = reportPath.toLowerCase().endsWith('.pdf');

                                        return (
                                            <div
                                                key={idx}
                                                className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    {isPdf ? (
                                                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200">
                                                            <FileText size={22} />
                                                        </div>
                                                    ) : (
                                                        <div
                                                            onClick={() => setSelectedImagePreview(reportUrl)}
                                                            className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 cursor-pointer group relative shadow-2xs"
                                                        >
                                                            <img
                                                                src={reportUrl}
                                                                alt={`Report ${idx + 1}`}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="min-w-0">
                                                        <span className="font-black text-slate-800 block truncate">
                                                            Medical Report #{idx + 1}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                                                            {reportPath.split('/').pop()}
                                                        </span>
                                                    </div>
                                                </div>

                                                <a
                                                    href={reportUrl}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="p-2 bg-white hover:bg-slate-100 text-[#3d3f96] rounded-xl border border-slate-200 transition shadow-2xs shrink-0 cursor-pointer"
                                                    title="Open Full File"
                                                >
                                                    <ExternalLink size={14} />
                                                </a>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 6. Ward & Bed Stay Breakdown (If Allocated) */}
                        {wardName && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <Bed size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Ward &amp; Observation Bed Stay
                                        </h3>
                                    </div>
                                    <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-lg">
                                        {stayDuration || 1} Days Stay
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Ward Category</span>
                                        <strong className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                                            {wardName}
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Bed #</span>
                                        <span className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-lg inline-block mt-0.5">
                                            Bed #{bedNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Admission Duration</span>
                                        <span className="text-slate-800 font-bold block mt-0.5">
                                            {startDate ? new Date(startDate).toLocaleDateString() : ''} to {endDate ? new Date(endDate).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 7. Emergency Ambulance Dispatch (If Dispatched) */}
                        {ambulanceId && ambulanceId.vehicleNumber && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-rose-600">
                                        <Ambulance size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Emergency Ambulance Dispatched
                                        </h3>
                                    </div>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-600 border border-rose-200">
                                        {ambulanceId.vehicleType || "ICU Ambulance"}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 text-xs font-medium">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Vehicle Number</span>
                                        <strong className="text-sm font-mono font-black text-slate-900 block mt-0.5">
                                            {ambulanceId.vehicleNumber}
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Driver Emergency Contact</span>
                                        <span className="text-slate-800 font-bold block mt-0.5 flex items-center gap-1">
                                            <Phone size={12} className="text-rose-500" /> {ambulanceId.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: PAYMENT RECEIPT & TRANSACTION INFO (5/12) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        
                        {/* 8. Itemized Payment & Pricing Receipt */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                    <Receipt size={18} />
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                        Payment Receipt
                                    </h3>
                                </div>
                                <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                                    isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700'
                                }`}>
                                    {paymentStatus || "Paid"}
                                </span>
                            </div>

                            <div className="space-y-3 text-xs font-medium text-slate-600">
                                <div className="flex items-center justify-between">
                                    <span>Doctor Consultation Fee ({consultationType})</span>
                                    <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.baseFee || 0}</span>
                                </div>

                                {pricingBreakdown.visitCharges > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Home Visit / Travel Surcharge</span>
                                        <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.visitCharges}</span>
                                    </div>
                                )}

                                {pricingBreakdown.extraCharges > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Ward Bed &amp; Facilities Charge</span>
                                        <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.extraCharges}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-slate-700">
                                    <span>Subtotal Fee</span>
                                    <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.subtotal || totalAmount}</span>
                                </div>

                                {/* Coupon Discount */}
                                {couponDetails && couponDetails.discountValue > 0 && (
                                    <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                                        <span className="flex items-center gap-1.5">
                                            <Percent size={13} /> Coupon Discount ({couponDetails.couponCode})
                                        </span>
                                        <span className="font-mono font-black">- ₹{couponDetails.discountValue}</span>
                                    </div>
                                )}

                                {/* Total Amount Paid */}
                                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Total Amount Paid</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of taxes &amp; consultation fees</span>
                                    </div>
                                    <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                                        ₹{totalAmount}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* 9. Online Transaction Metadata */}
                        {paymentDetails && paymentDetails.razorpayPaymentId && (
                            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2 text-xs">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                                    Online Payment Credentials
                                </span>
                                <div className="space-y-1.5 font-mono text-[11px] text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Payment ID:</span>
                                        <strong className="text-slate-800">{paymentDetails.razorpayPaymentId}</strong>
                                    </div>
                                    {paymentDetails.razorpayOrderId && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Order ID:</span>
                                            <span>{paymentDetails.razorpayOrderId}</span>
                                        </div>
                                    )}
                                    {paymentDetails.paidAt && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-slate-400">Paid At:</span>
                                            <span>{new Date(paymentDetails.paidAt).toLocaleTimeString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 10. Receipt Actions */}
                        <div className="space-y-2.5">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                            >
                                <Printer size={15} />
                                <span>Print Hospital Receipt</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => router.push('/clinic')}
                                className="w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-950/15"
                            >
                                <span>Book Another Consultation</span>
                            </button>
                        </div>

                    </div>

                </div>
            </main>

            {/* Lightbox Image Preview Modal for Uploaded Reports */}
            {selectedImagePreview && (
                <div 
                    onClick={() => setSelectedImagePreview(null)}
                    className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
                >
                    <div className="relative max-w-3xl max-h-[90vh] bg-white rounded-3xl overflow-hidden p-2 shadow-2xl">
                        <img
                            src={selectedImagePreview}
                            alt="Full Report Preview"
                            className="w-full h-auto max-h-[82vh] object-contain rounded-2xl"
                        />
                    </div>
                </div>
            )}

        </div>
    );
}