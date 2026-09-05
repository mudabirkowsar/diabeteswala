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
    ChevronRight
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

    // Symptoms / Medical Notes State
    const [patientSymptoms, setPatientSymptoms] = useState("");

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

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
                    Preparing Booking Review...
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                    Compiling doctor consultation details, bed stay duration &amp; patient records
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
                <h2 className="text-base font-black text-slate-900 tracking-tight">No Active Booking Session</h2>
                <p className="text-xs text-slate-400 mt-1 mb-6 max-w-sm font-medium">
                    Your appointment session could not be retrieved. Please re-select your preferred doctor or admission package.
                </p>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer"
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
        ward,
        totalPrice
    } = booking;

    const doctorPhoto = getMediaUrl(doctor?.profileImage) || DOC_PLACEHOLDER;
    const discountAmount = appliedCoupon?.discountAmount || 0;
    const finalPayable = Math.max(0, totalPrice - discountAmount);

    // Handle Payment & Confirmation
    const handleConfirmPayment = () => {
        setProcessingPayment(true);

        const finalOrderPayload = {
            ...booking,
            symptoms: patientSymptoms.trim(),
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
        <div className="min-h-screen bg-[#f8fbff] text-slate-800 pb-20 antialiased select-none text-left">

            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-xs">
                <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="inline-flex items-center gap-2 text-xs font-black text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                            <span className="hidden sm:inline uppercase tracking-wider text-[11px]">Modify Choices</span>
                        </button>
                        <span className="hidden sm:inline-block h-4 w-px bg-slate-200" />
                        <div>
                            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block leading-none">
                                Review &amp; Checkout
                            </span>
                            <h1 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate max-w-xs sm:max-w-md mt-0.5">
                                {clinicName}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${bookingType === 'EMERGENCY'
                                ? 'bg-amber-50 text-amber-700 border-amber-200/60'
                                : bookingType === 'IPD'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                                    : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                            }`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{bookingType} Package</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* LEFT COLUMN: BOOKING BREAKDOWN (7/12) */}
                    <div className="lg:col-span-7 space-y-6">

                        {/* 1. Patient Profile Summary Card */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <User size={16} />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                        Patient Information
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                                    {patient?.relation || "PATIENT"}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Full Name</span>
                                    <strong className="text-sm font-black text-slate-900 block mt-0.5">
                                        {patient?.memberName || "Primary User"}
                                    </strong>
                                </div>
                                <div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</span>
                                    <span className="text-slate-800 font-bold block mt-0.5">
                                        {patient?.phone || "Registered Number"}
                                    </span>
                                </div>
                                {patient?.gender && (
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Gender &amp; DOB</span>
                                        <span className="text-slate-800 font-semibold block mt-0.5">
                                            {patient.gender} {patient.dob ? `• ${patient.dob}` : ''}
                                        </span>
                                    </div>
                                )}
                                {patient?.hasInsurance && (
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Insurance Status</span>
                                        <span className="text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
                                            <ShieldCheck size={13} className="text-emerald-500" /> Linked ({patient.insuranceNo || 'Active'})
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Doctor & Consultation Mode Card */}
                        {doctor && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Stethoscope size={16} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Assigned Specialist
                                        </h3>
                                    </div>
                                    <span className="text-xs font-mono font-black text-slate-900">
                                        Consultation: ₹{doctor.fee}
                                    </span>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={doctorPhoto}
                                            alt={doctor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                                        />
                                    </div>

                                    <div className="space-y-1 min-w-0 flex-1">
                                        <h4 className="text-sm font-black text-slate-900 truncate">
                                            {doctor.name}
                                        </h4>
                                        <p className="text-xs font-bold text-slate-500 truncate">
                                            {doctor.speciality}
                                        </p>

                                        {/* Consultation Mode Tag */}
                                        <div className="pt-1.5 flex items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200/70 text-slate-700 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">
                                                {doctor.mode === 'clinicVisitFee' && <><MapPin size={11} className="text-[#3d3f96]" /> In-Clinic Consultation</>}
                                                {doctor.mode === 'onlineConsultFee' && <><Video size={11} className="text-indigo-500" /> Video Teleconsultation</>}
                                                {doctor.mode === 'homeVisitFee' && <><Home size={11} className="text-emerald-600" /> Home Doctor Visit</>}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Home Visit Address Verification */}
                                {doctor.mode === 'homeVisitFee' && address && (
                                    <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-2xl space-y-1 mt-3 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                                            <Home size={13} className="text-[#3d3f96]" />
                                            <span>Visiting Destination Address:</span>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed pl-4.5">
                                            {address.houseNo ? `${address.houseNo}, ` : ''}
                                            {address.sector ? `${address.sector}, ` : ''}
                                            {address.city}, {address.state} - <span className="font-mono font-bold text-slate-900">{address.pincode}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. Inpatient Ward & Stay Duration Breakdown */}
                        {ward && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                                    <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                            <Bed size={16} />
                                        </div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            Ward &amp; Stay Duration Breakdown
                                        </h3>
                                    </div>
                                    <span className="text-xs font-mono font-black text-slate-800 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-lg">
                                        {ward.totalDays} Days Stay
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Ward Category</span>
                                        <strong className="text-sm font-black text-slate-900 block mt-0.5">
                                            {ward.wardName} ({ward.wardType})
                                        </strong>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Assigned Bed</span>
                                        <span className="text-sm font-mono font-black text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-lg inline-block mt-0.5">
                                            Bed #{ward.bedNumber}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Stay Duration Range</span>
                                        <span className="text-slate-800 font-bold block mt-0.5">
                                            {ward.startDate} <span className="text-slate-400 font-normal">to</span> {ward.endDate}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Bed Charge Calculation</span>
                                        <span className="text-slate-800 font-mono font-bold block mt-0.5">
                                            ₹{ward.pricePerDay}/day × {ward.totalDays} days = <strong className="text-slate-900">₹{ward.totalBedPrice}</strong>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* 4. Clinical Notes & Symptoms */}
                        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
                            <div className="flex items-center gap-2.5 text-[#3d3f96] border-b border-slate-50 pb-3">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <FileText size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Symptoms &amp; Clinical Notes
                                </h3>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Describe Symptoms or Medical Reason (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    placeholder="e.g. Mild fever since yesterday, persistent headache, routine checkup notes for doctor..."
                                    value={patientSymptoms}
                                    onChange={(e) => setPatientSymptoms(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] focus:ring-1 focus:ring-[#3d3f96] transition-all resize-none leading-relaxed"
                                />
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: COUPONS & PAYMENT DOCK (5/12) */}
                    <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

                        {/* 5. COUPONS & PROMO OFFERS CARD (TRIGGERS RIGHT-SIDE MODAL) */}
                        <div
                            onClick={() => setIsCouponModalOpen(true)}
                            className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm transition-all hover:border-[#3d3f96] hover:shadow-md cursor-pointer space-y-3 group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                                        <Tag size={17} />
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
                                    className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2 text-xs"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                            <Check size={10} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <span className="font-mono font-black text-emerald-900 block leading-tight">
                                                '{appliedCoupon.couponName}' Applied
                                            </span>
                                            <span className="text-[10px] text-emerald-700 font-bold">
                                                Saving ₹{discountAmount} on this booking
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

                        {/* 6. COST BREAKDOWN & PAYMENT CARD */}
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
                            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-50">
                                <Receipt size={18} className="text-[#3d3f96]" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                    Payment Summary
                                </h3>
                            </div>

                            <div className="space-y-3 text-xs font-medium text-slate-600">
                                {doctor && (
                                    <div className="flex items-center justify-between">
                                        <span>Specialist Consultation Fee</span>
                                        <span className="font-mono font-bold text-slate-900">₹{doctor.fee}</span>
                                    </div>
                                )}

                                {ward && (
                                    <div className="flex items-center justify-between">
                                        <span>
                                            Bed #{ward.bedNumber} ({ward.totalDays} {ward.totalDays === 1 ? 'Day' : 'Days'} × ₹{ward.pricePerDay})
                                        </span>
                                        <span className="font-mono font-bold text-slate-900">₹{ward.totalBedPrice}</span>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-slate-700">
                                    <span>Subtotal</span>
                                    <span className="font-mono font-bold text-slate-900">₹{totalPrice}</span>
                                </div>

                                {discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                                        <span className="flex items-center gap-1">
                                            <Percent size={12} /> Coupon Discount ({appliedCoupon?.couponName})
                                        </span>
                                        <span className="font-mono">- ₹{discountAmount}</span>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Total Payable</span>
                                        <span className="text-[10px] text-slate-400 font-medium">Zero static or hidden fees</span>
                                    </div>
                                    <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                                        ₹{finalPayable}
                                    </strong>
                                </div>
                            </div>

                            {/* Pay & Confirm Action Button */}
                            <button
                                type="button"
                                disabled={processingPayment}
                                onClick={handleConfirmPayment}
                                className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 hover:scale-[1.01]"
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
                        <div className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 space-y-2 flex items-start gap-3">
                            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                            <div className="space-y-0.5">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                    Verified Facility &amp; Instant Token
                                </h4>
                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                    Your hospital admission token and appointment queue pass will be generated immediately upon confirmation.
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