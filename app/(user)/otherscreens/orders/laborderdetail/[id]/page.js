"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    FlaskConical,
    MapPin,
    Phone,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    ReceiptText,
    Clock,
    Loader2,
    Calendar,
    Sparkles,
    RefreshCw,
    XCircle,
    AlertTriangle,
    CreditCard,
    FileText,
    Download,
    User,
    Check
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=300";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function LabOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params?.id;
    const { showNotification } = useNotification();

    // --- State ---
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cancel Modal States
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // --- Fetch Single Lab Booking Details & Tracking Timeline ---
    const fetchBookingDetails = useCallback(async (isRefresh = false) => {
        if (!bookingId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await UserAPI.getUserBookingTrackingDetails(bookingId);
            if (response && response.success) {
                setBooking(response.data);
                if (isRefresh && showNotification) {
                    showNotification("Diagnostic timeline updated!", "success");
                }
            } else {
                if (showNotification) {
                    showNotification("Failed to load lab booking details.", "error");
                }
            }
        } catch (err) {
            console.error("Error fetching lab booking details:", err);
            if (showNotification) {
                showNotification(err?.response?.data?.message || "Failed to retrieve lab order specifications.", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [bookingId, showNotification]);

    useEffect(() => {
        fetchBookingDetails();
    }, [fetchBookingDetails]);

    // --- Cancel Lab Booking Handler (Strict Guard Against Sample Loss) ---
    const handleCancelBooking = async () => {
        if (!cancelReason.trim()) {
            if (showNotification) {
                showNotification("Please state a reason for cancelling.", "error");
            }
            return;
        }

        setCancelling(true);
        try {
            const response = await UserAPI.cancelUserLabBooking(
                booking?.bookingId || booking?._id,
                { reason: cancelReason }
            );

            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || "Booking cancelled successfully.", "success");
                }
                setIsCancelModalOpen(false);
                fetchBookingDetails(true);
            } else {
                if (showNotification) {
                    showNotification(response?.message || "Unable to cancel booking.", "error");
                }
            }
        } catch (err) {
            console.error("Error cancelling lab booking:", err);
            const errData = err?.response?.data;
            if (errData?.errorType === 'SAMPLE_ALREADY_COLLECTED') {
                if (showNotification) {
                    showNotification(errData.message || "Cannot cancel: Sample already drawn.", "error");
                }
            } else {
                if (showNotification) {
                    showNotification(errData?.message || "Failed to cancel diagnostic booking.", "error");
                }
            }
        } finally {
            setCancelling(false);
        }
    };

    // --- Helper: Status Badge ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'CONFIRMED';

        if (uppercase.includes('COMPLETED') || uppercase.includes('REPORT GENERATED')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={13} className="text-emerald-600" /> {status}
                </span>
            );
        }
        if (uppercase.includes('CANCELLED')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 shadow-xs">
                    <AlertCircle size={13} className="text-rose-600" /> Cancelled
                </span>
            );
        }
        if (uppercase.includes('SAMPLE') || uppercase.includes('WAY') || uppercase.includes('TRANSIT')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-xs animate-pulse">
                    <FlaskConical size={13} className="text-amber-600" /> {status}
                </span>
            );
        }
        if (uppercase.includes('TESTING')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                    <Sparkles size={13} className="text-[#3d3f96]" /> Testing In Progress
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                <Loader2 size={13} className="animate-spin text-[#3d3f96]" /> {status || 'Confirmed'}
            </span>
        );
    };

    // --- Diagnostic Lifecycle Timeline Stepper ---
    const renderTrackingTimeline = () => {
        const timeline = booking?.trackingTimeline;
        if (!timeline || timeline.isCancelled || !timeline.steps) {
            return null;
        }

        return (
            <div className="bg-gradient-to-r from-slate-50 via-white to-indigo-50/40 p-5 sm:p-6 rounded-3xl border border-slate-100">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3 relative">
                    {timeline.steps.map((step) => {
                        const isDone = step.isCompleted;
                        const isCurrent = step.isCurrent;

                        return (
                            <div key={step.stepNumber} className="flex flex-col items-center text-center space-y-2 relative z-10">
                                <div
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                                        isDone
                                            ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20 ring-4 ring-white'
                                            : isCurrent
                                            ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 animate-bounce'
                                            : 'bg-white text-slate-300 border border-slate-200 ring-4 ring-white'
                                    }`}
                                >
                                    {isDone ? (
                                        <Check size={16} />
                                    ) : (
                                        <span className="font-mono text-xs font-black">{step.stepNumber}</span>
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <h4
                                        className={`text-[11px] font-black uppercase tracking-tight ${
                                            isDone ? 'text-slate-900' : isCurrent ? 'text-amber-700' : 'text-slate-400'
                                        }`}
                                    >
                                        {step.title}
                                    </h4>
                                    <p className="text-[9px] text-slate-400 line-clamp-2 leading-tight">
                                        {step.description}
                                    </p>
                                    {step.timestamp && (
                                        <span className="text-[9px] font-mono text-slate-400 block pt-0.5">
                                            {new Date(step.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center shadow-xs">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Retrieving Diagnostic Details...</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Fetching live tracking, phlebotomist status, and lab reports</p>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h2 className="text-lg font-black text-slate-800">Diagnostic Booking Not Found</h2>
                <p className="text-xs text-slate-400 font-medium">We couldn&apos;t retrieve the details for this diagnostic booking reference identifier.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-2 inline-flex items-center gap-2 bg-[#3d3f96] text-white text-xs font-black uppercase px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#2e3075] transition"
                >
                    <ArrowLeft size={14} /> Go Back to Diagnostic Bookings
                </button>
            </div>
        );
    }

    const lab = booking.labId || {};
    const labImg = getMediaUrl(lab.profileImage);
    const phleb = booking.phlebotomistId || {};

    const isCompleted = booking.status?.toUpperCase()?.includes('COMPLETED');
    const isCancelled = booking.status?.toUpperCase()?.includes('CANCELLED');

    // Anti-Sample Loss Guard: Cancellation is strictly prohibited once the sample has been collected or testing has begun
    const currentStep = booking.trackingTimeline?.currentStepNumber || 1;
    const canCancel = !isCancelled && !isCompleted && currentStep < 4;

    const pickupOtp = booking.tracking?.otp || booking.pickupOtp;

    return (
        <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-6 text-left select-none antialiased">
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs cursor-pointer"
                        title="Back to Bookings"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                                #{booking.bookingId}
                            </h1>
                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                {booking.collectionType || 'Home Collection'}
                            </span>
                            {booking.isAllReportsUploaded && (
                                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg flex items-center gap-1">
                                    <CheckCircle2 size={11} /> Reports Complete
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} /> Scheduled for {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString() : 'N/A'} ({booking.appointmentTime || 'Slot N/A'})
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {canCancel && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <XCircle size={14} />
                            <span>Cancel Booking</span>
                        </button>
                    )}
                    <button
                        onClick={() => fetchBookingDetails(true)}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh</span>
                    </button>
                    <div>{renderStatusBadge(booking.status)}</div>
                </div>
            </div>

            {/* --- MAIN GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === LEFT COLUMN: TRACKER, PATIENTS & TEST REPORTS (2 COLS) === */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Live Diagnostic Milestone Stepper */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-[#3d3f96]" /> Diagnostic Specimen &amp; Report Pipeline
                            </h3>
                            <span className="text-xs font-bold text-slate-600">
                                Mode: <strong className="text-slate-900">{booking.collectionType || 'Home Collection'}</strong>
                            </span>
                        </div>
                        {renderTrackingTimeline()}

                        {/* Scheduled Slot Notice */}
                        <div className="flex items-center gap-2 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-900">
                            <Clock size={14} className="text-[#3d3f96] shrink-0" />
                            <span>
                                Appointment Window: <strong>{booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString() : 'Date N/A'}</strong> at <strong>{booking.appointmentTime || 'Time Slot N/A'}</strong>
                            </span>
                        </div>
                    </div>

                    {/* 2. Security Sample Collection Verification OTP / PIN */}
                    {pickupOtp && !isCompleted && !isCancelled && (
                        <div className="bg-gradient-to-r from-red-50/70 to-rose-50/50 border border-red-200/70 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5">
                                    <ShieldCheck size={14} /> Specimen Pickup Verification OTP
                                </span>
                                <p className="text-xs font-bold text-slate-600">
                                    Share this secret 6-digit code with the visiting phlebotomist before sample extraction.
                                </p>
                            </div>
                            <div className="bg-white px-5 py-2.5 rounded-2xl border border-red-200 shadow-xs text-center shrink-0">
                                <span className="text-2xl font-black font-mono tracking-widest text-red-600">
                                    {pickupOtp}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 3. Patients & Diagnostic Test Reports */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <FileText size={14} className="text-[#3d3f96]" />
                                Patients &amp; Test Reports ({booking.patientsWithReports?.length || 0})
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Pathologist Signed</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {booking.patientsWithReports?.map((patient, idx) => (
                                <div key={patient.patientId || idx} className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-center gap-3.5 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96] shrink-0 font-bold">
                                            <User size={20} />
                                        </div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-2">
                                                {patient.name}
                                                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                                    {patient.relation || 'Patient'}
                                                </span>
                                            </h4>
                                            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">
                                                <span>{patient.gender || 'Not specified'}</span>
                                                {patient.age && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{patient.age} yrs</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Report Download or Pending Badge */}
                                    <div className="flex items-center gap-3 shrink-0">
                                        {patient.hasReport && patient.reportUrl ? (
                                            <a
                                                href={getMediaUrl(patient.reportUrl)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-black uppercase tracking-wider transition shadow-xs"
                                            >
                                                <Download size={13} />
                                                <span>Download PDF</span>
                                            </a>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-400 border border-slate-200/80 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                <Clock size={12} /> Report Awaited
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* === RIGHT COLUMN: BILL SUMMARY, LAB PARTNER, PHLEBOTOMIST (1 COL) === */}
                <div className="space-y-6">

                    {/* 1. Complete Bill Ledger */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <ReceiptText size={14} className="text-emerald-500" />
                                Payment &amp; Bill Ledger
                            </h3>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {booking.paymentMethod || 'COD'} ({booking.paymentStatus || 'Pending'})
                            </span>
                        </div>

                        <div className="space-y-2.5 text-xs font-bold text-slate-600">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Diagnostic Tests Subtotal</span>
                                <span className="font-mono text-slate-800">₹{booking.billSummary?.itemTotal || 0}</span>
                            </div>

                            {booking.billSummary?.couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-rose-600">
                                    <span>Voucher Discount</span>
                                    <span className="font-mono font-black">-₹{booking.billSummary.couponDiscount}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Home Phlebotomist Visit</span>
                                <span className="font-mono text-slate-800">
                                    {booking.billSummary?.homeVisitCharge > 0 ? `₹${booking.billSummary.homeVisitCharge}` : 'FREE'}
                                </span>
                            </div>

                            {booking.billSummary?.rapidDeliveryCharge > 0 && (
                                <div className="flex justify-between items-center text-amber-700">
                                    <span>Rapid Specimen Logistics</span>
                                    <span className="font-mono font-black">+₹{booking.billSummary.rapidDeliveryCharge}</span>
                                </div>
                            )}

                            {/* Final Total Amount */}
                            <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3.5 text-sm font-black">
                                <div>
                                    <span className="block leading-none">Grand Total</span>
                                    <span className="text-[10px] text-slate-400 font-bold">Inclusive of sample collection &amp; GST</span>
                                </div>
                                <span className="font-mono text-xl font-black text-[#3d3f96]">
                                    ₹{booking.billSummary?.totalAmount || 0}
                                </span>
                            </div>
                        </div>

                        {booking.paymentTransactionId && (
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <CreditCard size={13} className="text-[#3d3f96]" /> Transaction Ref
                                </span>
                                <span className="font-mono text-slate-700 uppercase">
                                    {booking.paymentTransactionId}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Diagnostic Lab Partner Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <FlaskConical size={14} className="text-[#3d3f96]" /> Performing Diagnostic Lab
                        </h3>

                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                <img
                                    src={labImg}
                                    alt={lab.name || "Lab"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                    {lab.name || "Partner Diagnostic Center"}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <MapPin size={11} /> {lab.city || "Mohali"}
                                </p>
                            </div>
                        </div>

                        {lab.phone && (
                            <a
                                href={`tel:${lab.phone}`}
                                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 transition"
                            >
                                <Phone size={13} /> Call Lab Helpdesk ({lab.phone})
                            </a>
                        )}
                    </div>

                    {/* 3. Assigned Visiting Phlebotomist */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <User size={14} className="text-[#3d3f96]" /> Assigned Phlebotomist
                        </h3>

                        {phleb.name ? (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-[#3d3f96] flex items-center justify-center shrink-0 font-bold">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                                            Transit Vehicle ({phleb.vehicleNumber || 'Standard Kit'})
                                        </span>
                                        <strong className="text-xs font-black text-slate-900 block">
                                            {phleb.name}
                                        </strong>
                                    </div>
                                </div>
                                {phleb.phone && (
                                    <a
                                        href={`tel:${phleb.phone}`}
                                        className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                                        title="Call Phlebotomist"
                                    >
                                        <Phone size={14} />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 text-slate-500">
                                <FlaskConical size={18} className="text-slate-400 animate-pulse shrink-0" />
                                <div className="text-xs">
                                    <span className="font-bold block text-slate-700">Assigning Home Phlebotomist</span>
                                    <span className="text-[10px] text-slate-400">A certified healthcare professional is being assigned</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* --- CANCELLATION MODAL DIALOG (ANTI-SAMPLE LOSS GUARD) --- */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                                <AlertTriangle size={18} />
                                <span>Cancel Diagnostic Booking</span>
                            </div>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Are you sure you want to cancel booking <strong className="text-slate-800">#{booking.bookingId}</strong>? Note: Bookings can only be cancelled before your physical sample is collected.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                                Reason for Cancellation
                            </label>
                            <select
                                className="w-full text-xs font-bold text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#3d3f96]"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="">Select a reason...</option>
                                <option value="Traveling out of station, cannot attend sample pickup">Traveling out of station, cannot attend sample pickup</option>
                                <option value="Booked another test slot">Booked another test slot</option>
                                <option value="Doctor revised diagnostic tests">Doctor revised diagnostic tests</option>
                                <option value="Doctor advised not to proceed with test">Doctor advised not to proceed with test</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                            >
                                Nevermind
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelBooking}
                                disabled={cancelling || !cancelReason}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-900/10 cursor-pointer"
                            >
                                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                <span>Confirm Cancellation</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}