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
    Check
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=300&auto=format&fit=crop";
const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=300&auto=format&fit=crop";

export default function ClinicalOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id;
    const { showNotification } = useNotification();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch single booking details from API
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
    }, [bookingId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                    Loading Clinical Order Receipt...
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Retrieving attending doctor notes, ward bed allocation &amp; transaction summary
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
                    <ArrowLeft size={14} /> Back to My Appointments
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
        createdAt
    } = booking;

    const primaryPatient = patients[0] || {};
    const clinicImage = getMediaUrl(clinic.image) || CLINIC_PLACEHOLDER;
    const doctorImage = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;

    const isConfirmed = status?.toLowerCase() === 'confirmed';
    const isPaid = paymentStatus?.toLowerCase() === 'paid';
    const isEmergency = bookingType?.toLowerCase() === 'emergency';

    return (
        <div className="min-h-screen bg-[#f8fbff] text-slate-800 pb-28 antialiased select-none text-left">
            
            {/* Top Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
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
                                Booking Details
                            </span>
                            <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight font-mono mt-0.5">
                                {orderCode || booking._id}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
                            isEmergency
                                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                        }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                            <span>{bookingType || "Clinical"} • {consultationType || "Visit"}</span>
                        </span>

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
                    
                    {/* LEFT COLUMN: ORDER RECEIPT & SUMMARY BREAKDOWN (7/12) */}
                    <div className="lg:col-span-7 space-y-6">
                        
                        {/* 1. Clinic Facility Overview Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-[#3d3f96]">
                                    <Building2 size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Clinical Healthcare Facility
                                    </h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 font-mono">
                                    Booked On {new Date(createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={clinicImage}
                                        alt={clinic.clinicName || clinic.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = CLINIC_PLACEHOLDER; }}
                                    />
                                </div>

                                <div className="space-y-1 min-w-0 flex-1">
                                    <h4 className="text-sm sm:text-base font-black text-slate-900 truncate">
                                        {clinic.clinicName || clinic.name || "Specialized Care Clinic"}
                                    </h4>
                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 leading-relaxed">
                                        <MapPin size={12} className="text-rose-500 shrink-0" />
                                        <span>{clinic.address ? `${clinic.address}, ` : ''}{clinic.city}, {clinic.state}</span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Attending Specialist Details */}
                        {doctor.name && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2 text-[#3d3f96]">
                                        <Stethoscope size={16} />
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Attending Medical Specialist
                                        </h3>
                                    </div>
                                    <span className="text-xs font-mono font-bold text-slate-800">
                                        Consultation Mode: {consultationType}
                                    </span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={doctorImage}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                                        />
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-sm font-black text-slate-900 truncate">
                                                {doctor.name}
                                            </h4>
                                            {doctor.qualification && (
                                                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-1.5 py-0.5 rounded">
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
                                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-2 gap-2 text-xs">
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700">
                                        <Calendar size={13} className="text-[#3d3f96]" />
                                        <span>{appointmentDate ? new Date(appointmentDate).toLocaleDateString() : 'Date Pending'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 font-mono font-bold text-slate-700">
                                        <Clock size={13} className="text-amber-500" />
                                        <span>{appointmentTime || '10:30 AM'}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 3. Patient Medical Record Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2 text-[#3d3f96]">
                                    <User size={16} />
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Patient Profile
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                                    {primaryPatient.relation || "PATIENT"}
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
                                        {primaryPatient.patientAge || '30'} Yrs • {primaryPatient.gender || 'Other'}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Insurance Linked</span>
                                    <span className="text-emerald-700 font-bold block mt-0.5">
                                        {insuranceDetails.hasInsurance ? `Yes (${insuranceDetails.insuranceNumber || 'Active'})` : 'None / Self-Pay'}
                                    </span>
                                </div>
                            </div>

                            {/* Reason for Visit / Chief Complaint */}
                            {(bookingReason || primaryPatient.reasonForVisit) && (
                                <div className="pt-2 border-t border-slate-50 space-y-1">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                        Chief Medical Complaint / Reason
                                    </span>
                                    <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100/80 leading-relaxed font-medium">
                                        "{bookingReason || primaryPatient.reasonForVisit}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* 4. Inpatient Ward & Stay Duration Breakdown (If Allocated) */}
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

                        {/* 5. Ambulance Dispatch Details (If Emergency ride attached) */}
                        {ambulanceId?.vehicleNumber && (
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
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Driver Emergency Hotline</span>
                                        <span className="text-slate-800 font-bold block mt-0.5 flex items-center gap-1">
                                            <Phone size={12} className="text-rose-500" /> {ambulanceId.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT COLUMN: PAYMENT RECEIPT, COUPON & TRANSACTION INFO (5/12) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
                        
                        {/* 6. Payment & Itemized Pricing Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                    <Receipt size={18} />
                                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                        Payment Summary
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
                                    <span>Doctor Consultation Fee</span>
                                    <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.baseFee || 0}</span>
                                </div>

                                {pricingBreakdown.visitCharges > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Clinical Visit &amp; Triage Charges</span>
                                        <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.visitCharges}</span>
                                    </div>
                                )}

                                {pricingBreakdown.extraCharges > 0 && (
                                    <div className="flex items-center justify-between">
                                        <span>Inpatient Bed / Facility Fees</span>
                                        <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.extraCharges}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-slate-700">
                                    <span>Subtotal</span>
                                    <span className="font-mono font-bold text-slate-900">₹{pricingBreakdown.subtotal || totalAmount}</span>
                                </div>

                                {couponDetails?.discountValue > 0 && (
                                    <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
                                        <span className="flex items-center gap-1">
                                            <Percent size={12} /> Coupon ({couponDetails.couponCode})
                                        </span>
                                        <span className="font-mono">- ₹{couponDetails.discountValue}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Total Amount Paid</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Inclusive of all medical service taxes</span>
                                    </div>
                                    <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                                        ₹{totalAmount}
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {/* 7. Online Payment Transaction Metadata */}
                        {paymentDetails?.razorpayPaymentId && (
                            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-2 text-xs">
                                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">
                                    Online Transaction Credentials
                                </span>
                                <div className="space-y-1 font-mono text-[11px] text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Payment ID:</span>
                                        <strong className="text-slate-800">{paymentDetails.razorpayPaymentId}</strong>
                                    </div>
                                    {paymentDetails.razorpayOrderId && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Order ID:</span>
                                            <span>{paymentDetails.razorpayOrderId}</span>
                                        </div>
                                    )}
                                    {paymentDetails.paidAt && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Paid Timestamp:</span>
                                            <span>{new Date(paymentDetails.paidAt).toLocaleTimeString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 8. Action: Print / Download Invoice */}
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

        </div>
    );
}