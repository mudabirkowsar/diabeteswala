'use client';

import React, { useEffect, useState, useMemo, use } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Clock, HeartPulse, Tag, X, AlertTriangle, Check, RotateCcw, MapPin, Printer, XCircle, CalendarClock, BadgeCheck, Video, Home, Building2, Stethoscope, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Receipt, CreditCard, User, Phone, Mail, FileText, Download, Share2, Sparkles, Key, RefreshCw } from 'lucide-react';

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

const DOC_PLACEHOLDER = "https://img.magnific.com/premium-vector/profile-icon-male-avatar-icon-user-circles-default-profile-picture-anonymous-user-avatar-person-icon-head-icon-social-network-avatar-portrait-male-female-businessman-photo-placeholder_180124-4.jpg?semt=ais_hybrid&w=740&q=80";

/**
 * Format 24hr "HH:mm" string to 12hr "hh:mm A" string (e.g., "09:00" -> "09:00 AM", "16:30" -> "04:30 PM")
 */
function formatTime12h(timeStr) {
    if (!timeStr) return '';
    if (timeStr.includes('AM') || timeStr.includes('PM')) return timeStr;
    const [hourStr, minuteStr] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    if (isNaN(hour)) return timeStr;
    const minute = minuteStr || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export default function DoctorBookingDetailPage({ params }) {
    const resolvedParams = use(params);
    const bookingId = resolvedParams?.id;

    const router = useRouter();
    const { showNotification } = useNotification();

    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    // --- Cancellation Modal State ---
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isPermanentCancel, setIsPermanentCancel] = useState(false);
    const [cancelling, setCancelling] = useState(false);

    // --- Reschedule Modal State ---
    const [showRescheduleModal, setShowRescheduleModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [slotsError, setSlotsError] = useState(null);
    const [rescheduling, setRescheduling] = useState(false);

    // Generate next 10 selectable dates starting today
    const nextDates = useMemo(() => {
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 10; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const isoDate = d.toISOString().split('T')[0];
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
            const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dates.push({ isoDate, dayName, monthDay });
        }
        return dates;
    }, []);

    const [selectedDate, setSelectedDate] = useState(nextDates[0]?.isoDate || '');

    // Quick Preset Reasons for Cancellation
    const quickReasons = [
        "Personal emergency, will reschedule later",
        "Feeling better, no longer needed",
        "Consulted another doctor locally",
        "Schedule conflict with work",
        "Need to change patient details"
    ];

    // Fetch Booking Details from API
    const fetchBookingDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await UserAPI.getIndependentDoctorBookingDetails(bookingId);

            if (res && res.success && res.data) {
                setBooking(res.data);
            } else {
                setError(res?.message || 'Appointment record not found.');
            }
        } catch (err) {
            console.error('Error fetching appointment details:', err);
            setError(err?.response?.data?.message || err.message || 'Failed to fetch appointment details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (bookingId) {
            fetchBookingDetails();
        }
    }, [bookingId]);

    // Fetch Real-time Slots dynamically from API whenever reschedule modal is opened or date changes
    useEffect(() => {
        const doctorObjId = booking?.doctorId?._id || booking?.doctorId;
        if (!showRescheduleModal || !selectedDate || !doctorObjId) return;

        const fetchSlots = async () => {
            try {
                setLoadingSlots(true);
                setSlotsError(null);
                setSelectedSlot(null);

                const res = await UserAPI.getDoctorAvailableSlots(doctorObjId, { date: selectedDate });

                if (res && res.success) {
                    if (res.slots && Array.isArray(res.slots) && res.slots.length > 0) {
                        setSlots(res.slots);
                    } else if (res.data && Array.isArray(res.data) && res.data.length > 0) {
                        setSlots(res.data);
                    } else {
                        setSlots([]);
                        setSlotsError(res.message || 'No slots available on this date.');
                    }
                } else {
                    setSlots([]);
                    setSlotsError(res?.message || 'Unable to fetch doctor slots.');
                }
            } catch (err) {
                console.error('Error fetching doctor slots:', err);
                setSlots([]);
                setSlotsError(err?.response?.data?.message || 'Failed to load slots for this date.');
            } finally {
                setLoadingSlots(false);
            }
        };

        fetchSlots();
    }, [showRescheduleModal, selectedDate, booking?.doctorId]);

    const handleShare = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            if (showNotification) showNotification('Appointment link copied to clipboard!', 'success');
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handlePrint = () => {
        if (typeof window !== 'undefined') {
            window.print();
        }
    };

    // Helper: Format Dates
    const formatDate = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleDateString('en-IN', {
                weekday: 'short',
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    const formatDateTime = (dateStr) => {
        if (!dateStr) return 'N/A';
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return dateStr;
            return date.toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateStr;
        }
    };

    // --- 1. HANDLE CANCEL APPOINTMENT ---
    const handleCancelSubmit = async () => {
        if (!booking?._id) return;
        try {
            setCancelling(true);
            const payload = {
                reason: cancelReason.trim() || (isPermanentCancel ? "Cancelled by user for refund." : "Personal emergency, will reschedule later."),
                isPermanent: isPermanentCancel
            };

            const res = await UserAPI.cancelUserDoctorAppointment(booking._id, payload);
            if (res && res.success) {
                if (showNotification) {
                    showNotification(
                        res.message || (isPermanentCancel ? 'Appointment permanently cancelled. Refund initiated.' : 'Appointment cancelled. You can reschedule anytime.'),
                        'success'
                    );
                }
                setShowCancelModal(false);
                setCancelReason("");
                fetchBookingDetails();
            } else {
                if (showNotification) {
                    showNotification(res?.message || 'Failed to cancel appointment.', 'error');
                }
            }
        } catch (err) {
            console.error('Cancellation error:', err);
            if (showNotification) {
                showNotification(err.response?.data?.message || err.message || 'Error occurred while cancelling.', 'error');
            }
        } finally {
            setCancelling(false);
        }
    };

    // --- 2. HANDLE RESCHEDULE APPOINTMENT ---
    const handleRescheduleSubmit = async () => {
        if (!booking?._id) return;
        if (!selectedDate || !selectedSlot) {
            if (showNotification) showNotification('Please choose an available time slot.', 'warning');
            return;
        }

        try {
            setRescheduling(true);
            const timeSlotString = selectedSlot.formattedTime || formatTime12h(selectedSlot.time || selectedSlot.slot || selectedSlot);

            const payload = {
                appointmentId: booking._id,
                newDate: selectedDate,
                newTimeSlot: timeSlotString
            };

            const res = await UserAPI.rescheduleUserDoctorAppointment(payload);
            if (res && res.success) {
                if (showNotification) {
                    showNotification(res.message || 'Appointment rescheduled successfully!', 'success');
                }
                setShowRescheduleModal(false);
                setSelectedSlot(null);
                fetchBookingDetails();
            } else {
                if (showNotification) {
                    showNotification(res?.message || 'Failed to reschedule appointment.', 'error');
                }
            }
        } catch (err) {
            console.error('Reschedule error:', err);
            if (showNotification) {
                showNotification(err.response?.data?.message || err.message || 'Error occurred during reschedule.', 'error');
            }
        } finally {
            setRescheduling(false);
        }
    };

    // Loading State
    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                </div>
                <p className="text-slate-800 font-bold text-sm tracking-tight">Accessing Clinical Records...</p>
                <p className="text-slate-400 text-xs">Loading secure consultation details</p>
            </div>
        );
    }

    // Error State
    if (error || !booking) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-xl">
                    <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100">
                        <AlertCircle size={28} />
                    </div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-2">Record Unavailable</h2>
                    <p className="text-sm text-slate-500 mb-6 font-medium">{error || 'This appointment could not be located or has been archived.'}</p>
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-[#3d3f96] hover:bg-slate-900 text-white py-3.5 rounded-xl font-bold text-xs tracking-wider uppercase transition-all shadow-md cursor-pointer"
                    >
                        Return to Appointments
                    </button>
                </div>
            </div>
        );
    }

    const doctor = booking.doctorId || {};
    const docImage = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;
    const patients = booking.patients || [];
    const primaryPatient = patients[0] || {};
    const address = booking.address || {};
    const pricing = booking.pricingBreakdown || {};
    const payment = booking.paymentDetails || {};
    const coupon = booking.couponDetails || {};
    const clinical = booking.clinicalSummary || {};
    const tracking = booking.tracking || {};
    const policy = booking.policyStatus || {};
    const cancellationDetails = booking.cancellationDetails || {};

    const isHomeVisit = booking.consultationType?.toLowerCase().includes('home');
    const isVideoConsult = booking.consultationType?.toLowerCase().includes('video');
    const isConfirmed = booking.status?.toLowerCase() === 'confirmed';
    const isCancelledByUser = booking.status?.toLowerCase() === 'cancelled-by-user';
    const isRefundInitiated = booking.paymentStatus?.toLowerCase() === 'refund-initiated';
    const isPermanentCancelled = cancellationDetails.isPermanent || isRefundInitiated;
    const isCompleted = booking.status?.toLowerCase() === 'completed';

    // Reschedule & Cancel policy calculations
    const maxLimit = policy.maxLimit ?? 2;
    const reschedulesRemaining = policy.reschedulesLeft ?? Math.max(0, maxLimit - (booking.rescheduleCount || 0));
    const cancellationsRemaining = policy.cancellationsLeft ?? Math.max(0, maxLimit - (booking.cancellationCount || 0));

    const isRescheduleAllowed = !isPermanentCancelled && !isCompleted && reschedulesRemaining > 0;
    const isCancelAllowed = isConfirmed && cancellationsRemaining > 0;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-28 antialiased selection:bg-[#3d3f96] selection:text-white">

            {/* Top Header Bar */}
            <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-40 border-b border-slate-200/70 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-[#3d3f96] transition-colors group cursor-pointer"
                    >
                        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                        <span>My Consultations</span>
                    </button>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handlePrint}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                            title="Print Summary"
                        >
                            <Printer size={13} />
                            <span>Print</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-full transition-all cursor-pointer"
                        >
                            <Share2 size={13} />
                            <span>{copied ? 'Link Copied' : 'Share'}</span>
                        </button>

                        <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3.5 py-1.5 rounded-full uppercase tracking-wider">
                            <ShieldCheck size={14} className="fill-emerald-100 text-emerald-600" />
                            <span>Verified Booking</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-7">

                {/* ================= RESCHEDULE-READY NOTICE BANNER ================= */}
                {isCancelledByUser && !isPermanentCancelled && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                                <RotateCcw size={22} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-amber-900">Reschedule-Ready Appointment</h3>
                                <p className="text-xs text-amber-700 mt-0.5">
                                    Your payment of <span className="font-bold">₹{booking.totalAmount}</span> remains valid. You can reschedule this appointment anytime without making a new payment.
                                </p>
                            </div>
                        </div>

                        {isRescheduleAllowed && (
                            <button
                                onClick={() => setShowRescheduleModal(true)}
                                className="shrink-0 bg-[#3d3f96] hover:bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                            >
                                <CalendarClock size={15} />
                                <span>Reschedule Now</span>
                            </button>
                        )}
                    </div>
                )}

                {/* ================= 1. APPOINTMENT STATUS & LIVE TRACKING HERO ================= */}
                <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">

                        {/* Status & Booking ID */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                                    {booking.bookingId || 'HK-N/A'}
                                </span>

                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${isConfirmed || isCompleted
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : isCancelledByUser
                                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                                        : 'bg-rose-50 text-rose-600 border-rose-200'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${isConfirmed || isCompleted ? 'bg-emerald-500' : isCancelledByUser ? 'bg-amber-500' : 'bg-rose-500'
                                        }`} />
                                    {booking.status || 'Pending'}
                                </span>

                                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg uppercase">
                                    {isVideoConsult ? <Video size={12} /> : isHomeVisit ? <Home size={12} /> : <MapPin size={12} />}
                                    <span>{booking.consultationType || 'Clinic Visit'}</span>
                                </span>
                            </div>

                            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                Appointment with {doctor.name?.toLowerCase().startsWith('dr.') ? doctor.name : `Dr. ${doctor.name || 'Practitioner'}`}
                            </h1>

                            <p className="text-xs text-slate-500 font-medium flex items-center gap-2">
                                <span>Booked on: {formatDateTime(booking.createdAt)}</span>
                                <span>•</span>
                                <span>Type: {booking.bookingType || 'Appointment'}</span>
                            </p>
                        </div>

                        {/* Quick Live OTP / Security Widget (For Home Visits / Telehealth) */}
                        {tracking.otp && (
                            <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-2xl border border-indigo-100/90 shrink-0">
                                <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                                    <Key size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Verification OTP</span>
                                        <Sparkles size={12} className="text-[#3d3f96]" />
                                    </div>
                                    <div className="text-2xl font-black font-mono tracking-widest text-slate-900">
                                        {tracking.otp}
                                    </div>
                                    {tracking.eta && (
                                        <p className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 mt-0.5">
                                            <Clock size={11} />
                                            <span>Doctor ETA: approx {tracking.eta}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Appointment Schedule Time Ribbon */}
                    <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="flex items-center gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96] shrink-0">
                                <Calendar size={17} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Date</p>
                                <p className="text-xs font-extrabold text-slate-900 truncate">
                                    {formatDate(booking.appointmentDate)}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                                <Clock size={17} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Scheduled Time Slot</p>
                                <p className="text-xs font-extrabold text-slate-900 truncate">
                                    {booking.appointmentTime || 'Flexible Slot'}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <CreditCard size={17} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Payment Status</p>
                                <p className="text-xs font-extrabold text-emerald-700 truncate">
                                    ₹{booking.totalAmount} • {booking.paymentStatus || 'Paid'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons: Cancel & Reschedule */}
                    {(isCancelAllowed || isRescheduleAllowed) && (
                        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-end gap-3">
                            {isCancelAllowed && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                                >
                                    <XCircle size={15} />
                                    <span>Cancel Appointment</span>
                                </button>
                            )}

                            {isRescheduleAllowed && (
                                <button
                                    onClick={() => setShowRescheduleModal(true)}
                                    className="px-5 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-extrabold tracking-wider uppercase transition-all shadow-md shadow-indigo-100 flex items-center gap-1.5 cursor-pointer"
                                >
                                    <CalendarClock size={15} />
                                    <span>Reschedule Slot</span>
                                </button>
                            )}
                        </div>
                    )}

                </div>

                {/* ================= 2. MAIN 2-COLUMN DETAILS ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">

                    {/* LEFT CONTENT COLUMN (8 Cols) */}
                    <div className="lg:col-span-8 space-y-6">

                        {/* A. Doctor Practitioner Information Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
                            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center">
                                        <Stethoscope size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Attending Practitioner</h3>
                                        <p className="text-[11px] text-slate-400">Licensed medical consultant handling this case</p>
                                    </div>
                                </div>
                                {doctor.profileStatus === 'Approved' && (
                                    <div className="flex items-center gap-1 text-xs font-extrabold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-xl border border-emerald-200/80">
                                        <BadgeCheck size={13} className="text-emerald-600" />
                                        <span>Verified Practitioner</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-5 items-start">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200/80 shrink-0 mx-auto sm:mx-0">
                                    <img
                                        src={docImage}
                                        alt={doctor.name || 'Doctor'}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.currentTarget.src = DOC_PLACEHOLDER; }}
                                    />
                                </div>

                                <div className="flex-1 space-y-1.5 text-center sm:text-left">
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                                        <h4 className="text-base font-extrabold text-slate-900">
                                            {doctor.name?.toLowerCase().startsWith('dr.') ? doctor.name : `Dr. ${doctor.name || 'Medical Specialist'}`}
                                        </h4>
                                    </div>

                                    <p className="text-xs font-bold text-[#3d3f96]">
                                        {doctor.speciality || 'Consultant Specialist'}
                                    </p>

                                    {doctor.qualification && (
                                        <p className="text-[11px] font-semibold text-slate-600">
                                            {doctor.qualification}
                                        </p>
                                    )}

                                    {doctor.experienceYears && (
                                        <p className="text-[11px] text-slate-400">
                                            {doctor.experienceYears}+ Years Clinical Practice Experience
                                        </p>
                                    )}

                                    {/* Languages & Location Pills */}
                                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                                        {doctor.languages && doctor.languages.length > 0 && (
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                                                {doctor.languages.join(', ')}
                                            </span>
                                        )}
                                        {doctor.city && (
                                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                                                <MapPin size={10} />
                                                {doctor.city}, {doctor.state || ''}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {doctor.about && (
                                <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-normal bg-slate-50/60 p-3.5 rounded-2xl">
                                    {doctor.about}
                                </div>
                            )}
                        </div>

                        {/* B. Patient Demographics & Health Profile */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">Patient Details &amp; Profile</h3>
                                    <p className="text-[11px] text-slate-400">Registered patient information for clinical charting</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Patient Name</span>
                                    <p className="text-xs font-extrabold text-slate-900">
                                        {primaryPatient.patientName || address.name || 'Primary Account'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-semibold">
                                        Relation: {primaryPatient.relation || 'SELF'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Age &amp; Gender</span>
                                    <p className="text-xs font-extrabold text-slate-900">
                                        {primaryPatient.patientAge ? `${primaryPatient.patientAge} Years` : 'Adult'} • {primaryPatient.gender || 'Not specified'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-semibold">
                                        Blood Group: {clinical.bloodGroup || 'O+'}
                                    </p>
                                </div>

                                <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Number</span>
                                    <p className="text-xs font-extrabold text-slate-900 font-mono">
                                        {address.phone || 'Provided via profile'}
                                    </p>
                                    <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                        <CheckCircle2 size={11} /> Verified Contact
                                    </p>
                                </div>
                            </div>

                            {/* Chief Complaint / Booking Reason */}
                            {(booking.bookingReason || primaryPatient.reasonForVisit || clinical.chiefComplaint) && (
                                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-1">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#3d3f96]">
                                        <HeartPulse size={14} />
                                        <span>Chief Medical Complaint / Reason for Consultation</span>
                                    </div>
                                    <p className="text-xs text-slate-700 font-semibold">
                                        "{booking.bookingReason || primaryPatient.reasonForVisit || clinical.chiefComplaint}"
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* C. Home Delivery / Consultation Location Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-slate-900">
                                        {isHomeVisit ? 'Home Visit Service Address' : isVideoConsult ? 'Telemedicine Channel' : 'Clinic Practice Address'}
                                    </h3>
                                    <p className="text-[11px] text-slate-400">Destination for this healthcare consultation session</p>
                                </div>
                            </div>

                            {isHomeVisit ? (
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                            <Home size={14} className="text-[#3d3f96]" />
                                            {address.name || primaryPatient.patientName} ({address.addressType || 'Home'})
                                        </span>
                                        <span className="text-[10px] font-mono font-bold bg-slate-200/70 text-slate-700 px-2 py-0.5 rounded-md">
                                            PIN: {address.pincode || '12345'}
                                        </span>
                                    </div>

                                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                        {[address.houseNo, address.sector, address.landmark, address.city, address.state, address.country]
                                            .filter(Boolean)
                                            .join(', ')}
                                    </p>

                                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1">
                                            <Phone size={12} className="text-slate-400" />
                                            Phone: <span className="font-mono font-bold text-slate-800">{address.phone || 'N/A'}</span>
                                        </span>
                                        <span className="text-emerald-700 font-bold text-[11px]">Direct Visit Assigned</span>
                                    </div>
                                </div>
                            ) : isVideoConsult ? (
                                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 text-center space-y-2">
                                    <Video size={28} className="mx-auto text-[#3d3f96]" />
                                    <h4 className="text-xs font-extrabold text-slate-900">Encrypted Telehealth Consultation</h4>
                                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                                        Video call room link will activate 10 minutes prior to scheduled appointment time ({booking.appointmentTime}).
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 space-y-1 text-xs">
                                    <p className="font-extrabold text-slate-900">{doctor.address || 'Doctor Medical Chamber'}</p>
                                    <p className="text-slate-500 font-medium">{doctor.city}, {doctor.state}</p>
                                </div>
                            )}
                        </div>

                        {/* D. Uploaded Medical Reports & Diagnostic Files */}
                        {clinical.uploadedReports && clinical.uploadedReports.length > 0 && (
                            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm">
                                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                                    <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 flex items-center justify-center">
                                        <FileText size={18} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900">Uploaded Diagnostic Reports</h3>
                                        <p className="text-[11px] text-slate-400">Attached clinical files and diagnostic records</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    {clinical.uploadedReports.map((reportPath, idx) => {
                                        const fullUrl = getMediaUrl(reportPath);
                                        return (
                                            <div
                                                key={idx}
                                                className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 hover:border-indigo-300 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-rose-500 font-bold">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs">
                                                            Clinical_Report_{idx + 1}.pdf
                                                        </p>
                                                        <p className="text-[10px] text-slate-400">Shared with consulting doctor</p>
                                                    </div>
                                                </div>

                                                {fullUrl && (
                                                    <a
                                                        href={fullUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#3d3f96] hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-xs"
                                                    >
                                                        <Download size={13} />
                                                        <span>View / Download</span>
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* RIGHT BILLING & POLICY COLUMN (4 Cols) */}
                    <div className="lg:col-span-4 space-y-6">

                        {/* A. Payment & Pricing Invoice Breakdown Card */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Receipt size={18} className="text-[#3d3f96]" />
                                    <h3 className="text-sm font-extrabold text-slate-900">Payment Breakdown</h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    {booking.paymentStatus || 'Paid'}
                                </span>
                            </div>

                            {/* Price Items */}
                            <div className="space-y-2.5 text-xs">
                                <div className="flex justify-between text-slate-600">
                                    <span>Doctor Consultation Fee:</span>
                                    <span className="font-semibold text-slate-900 font-mono">₹{pricing.baseFee ?? doctor.fees?.home ?? 899}</span>
                                </div>

                                {pricing.visitCharges !== undefined && pricing.visitCharges > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Home Visit &amp; Transit:</span>
                                        <span className="font-semibold text-slate-900 font-mono">₹{pricing.visitCharges}</span>
                                    </div>
                                )}

                                {pricing.extraCharges !== undefined && pricing.extraCharges > 0 && (
                                    <div className="flex justify-between text-slate-600">
                                        <span>Medical Care &amp; Platform:</span>
                                        <span className="font-semibold text-slate-900 font-mono">₹{pricing.extraCharges}</span>
                                    </div>
                                )}

                                {pricing.subtotal !== undefined && (
                                    <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-100">
                                        <span>Gross Subtotal:</span>
                                        <span className="font-semibold text-slate-800 font-mono">₹{pricing.subtotal}</span>
                                    </div>
                                )}

                                {/* Coupon Applied */}
                                {(pricing.discountAmount > 0 || coupon.discountValue > 0) && (
                                    <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50/60 p-2 rounded-xl border border-emerald-100">
                                        <span className="flex items-center gap-1">
                                            <Tag size={12} />
                                            Coupon ({coupon.couponCode || 'DOCDR20'})
                                        </span>
                                        <span className="font-mono">-₹{pricing.discountAmount || coupon.discountValue}</span>
                                    </div>
                                )}

                                {/* Net Final Paid */}
                                <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
                                    <span className="font-extrabold text-slate-900">Total Paid:</span>
                                    <span className="text-xl font-black font-mono text-[#3d3f96]">
                                        ₹{booking.totalAmount}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Gateway Meta */}
                            <div className="mt-5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-[11px]">
                                <div className="flex justify-between text-slate-500">
                                    <span>Method:</span>
                                    <span className="font-bold text-slate-800 uppercase">{payment.method || 'Netbanking'}</span>
                                </div>
                                {payment.bank && (
                                    <div className="flex justify-between text-slate-500">
                                        <span>Bank / Provider:</span>
                                        <span className="font-bold text-slate-800">{payment.bank}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-slate-500 truncate">
                                    <span>Transaction ID:</span>
                                    <span className="font-mono font-semibold text-slate-700 truncate max-w-[150px]" title={booking.transactionId || payment.razorpayPaymentId}>
                                        {booking.transactionId || payment.razorpayPaymentId || 'pay_N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* B. Reschedule & Policy Guidelines */}
                        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-3.5">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-[#3d3f96]" />
                                <h3 className="text-sm font-extrabold text-slate-900">Consultation Policy</h3>
                            </div>

                            <div className="space-y-2 text-xs text-slate-600 font-medium">
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <span>Reschedules Available:</span>
                                    <span className="font-bold text-slate-900 font-mono">{reschedulesRemaining} of {maxLimit} Left</span>
                                </div>
                                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                                    <span>Cancellations Available:</span>
                                    <span className="font-bold text-slate-900 font-mono">{cancellationsRemaining} of {maxLimit} Left</span>
                                </div>
                            </div>

                            {/* Help & Support */}
                            <div className="pt-2 text-center">
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Need clinical emergency assistance or booking support?
                                </p>
                            </div>
                        </div>

                    </div>

                </div>

            </main>

            {/* ========================================================================= */}
            {/* ================= MODAL 1: CANCEL APPOINTMENT =========================== */}
            {/* ========================================================================= */}
            {showCancelModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center font-bold">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">Cancel Doctor Appointment</h3>
                                    <p className="text-xs text-slate-400">Choose your cancellation mode and reason</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Mode Selection Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                            {/* Option A: Reschedule-Ready */}
                            <div
                                onClick={() => setIsPermanentCancel(false)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${!isPermanentCancel
                                    ? 'border-[#3d3f96] bg-indigo-50/40 ring-2 ring-[#3d3f96]/20'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-black text-slate-900">Reschedule Later</span>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${!isPermanentCancel ? 'border-[#3d3f96] bg-[#3d3f96]' : 'border-slate-300'}`}>
                                        {!isPermanentCancel && <Check size={10} className="text-white" strokeWidth={3} />}
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                    Keeps your payment safe. You can pick a new date anytime without re-paying.
                                </p>
                            </div>

                            {/* Option B: Permanent Refund */}
                            <div
                                onClick={() => setIsPermanentCancel(true)}
                                className={`p-4 rounded-2xl border cursor-pointer transition-all ${isPermanentCancel
                                    ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/20'
                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-black text-slate-900">Permanent Cancel</span>
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isPermanentCancel ? 'border-rose-500 bg-rose-500' : 'border-slate-300'}`}>
                                        {isPermanentCancel && <Check size={10} className="text-white" strokeWidth={3} />}
                                    </div>
                                </div>
                                <p className="text-[11px] text-slate-500 leading-snug">
                                    Cancels completely and calculates refund (₹{booking.totalAmount}) to original payment method.
                                </p>
                            </div>

                        </div>

                        {/* Quick Reason Chips */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 block">Select Cancellation Reason</label>
                            <div className="flex flex-wrap gap-2">
                                {quickReasons.map((r, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCancelReason(r)}
                                        className={`text-[11px] font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${cancelReason === r
                                            ? 'bg-[#3d3f96] text-white border-[#3d3f96]'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom Reason Textarea */}
                        <div className="space-y-1.5">
                            <textarea
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                placeholder="Or type specific cancellation reason..."
                                rows={3}
                                className="w-full text-xs p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/20 focus:border-[#3d3f96] transition-all resize-none font-medium"
                            />
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(false)}
                                disabled={cancelling}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                Keep Appointment
                            </button>

                            <button
                                type="button"
                                onClick={handleCancelSubmit}
                                disabled={cancelling}
                                className={`px-5 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider text-white shadow-md flex items-center gap-2 transition-all cursor-pointer ${isPermanentCancel ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#3d3f96] hover:bg-[#2d2f75]'
                                    }`}
                            >
                                {cancelling ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Processing...</span>
                                    </>
                                ) : (
                                    <span>{isPermanentCancel ? 'Confirm Permanent Cancel' : 'Cancel & Save for Reschedule'}</span>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* ================= MODAL 2: RESCHEDULE APPOINTMENT ======================= */}
            {/* ========================================================================= */}
            {showRescheduleModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] border border-indigo-100 flex items-center justify-center font-bold">
                                    <CalendarClock size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-extrabold text-slate-900">Reschedule Appointment</h3>
                                    <p className="text-xs text-slate-400">Pick an available slot for {doctor.name || 'Practitioner'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowRescheduleModal(false)}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Step 1: Date Horizontal Picker Strip */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                                <Calendar size={14} className="text-[#3d3f96]" />
                                <span>Select New Date</span>
                            </label>

                            <div className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
                                {nextDates.map((item) => {
                                    const isSelected = selectedDate === item.isoDate;
                                    return (
                                        <button
                                            key={item.isoDate}
                                            type="button"
                                            onClick={() => setSelectedDate(item.isoDate)}
                                            className={`shrink-0 px-4 py-3 rounded-2xl border text-center transition-all cursor-pointer ${isSelected
                                                ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md shadow-indigo-100'
                                                : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                }`}
                                        >
                                            <p className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                {item.dayName}
                                            </p>
                                            <p className="text-xs font-extrabold mt-0.5 whitespace-nowrap">
                                                {item.monthDay}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step 2: Dynamic Available Slots Grid (From API) */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                    <Clock size={14} className="text-[#3d3f96]" />
                                    <span>Available Slots ({selectedDate})</span>
                                </label>
                                {selectedSlot && (
                                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                                        <CheckCircle2 size={12} />
                                        {selectedSlot.formattedTime || formatTime12h(selectedSlot.time)} Selected
                                    </span>
                                )}
                            </div>

                            {/* Loading State */}
                            {loadingSlots ? (
                                <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 gap-2">
                                    <Loader2 size={24} className="animate-spin text-[#3d3f96]" />
                                    <p className="text-xs font-semibold text-slate-500">Checking doctor real-time availability...</p>
                                </div>
                            ) : slotsError || slots.length === 0 ? (
                                <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-4">
                                    <AlertCircle size={22} className="mx-auto text-amber-500 mb-1.5" />
                                    <p className="text-xs font-bold text-slate-700">{slotsError || 'Doctor is unavailable on this date'}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">Please pick another date from the strip above.</p>
                                </div>
                            ) : (
                                /* Slots Grid */
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-52 overflow-y-auto pr-1">
                                    {slots.map((slotItem, index) => {
                                        const slotTimeStr = typeof slotItem === 'string' ? slotItem : (slotItem.time || slotItem.slot);
                                        const isUnavailable = typeof slotItem === 'object' && (slotItem.available === false || slotItem.isBooked || slotItem.isBlocked);
                                        const isSelected = selectedSlot?.time === slotTimeStr;
                                        const hasPremium = slotItem.premiumFee > 0;

                                        return (
                                            <button
                                                key={`${slotTimeStr}-${index}`}
                                                type="button"
                                                disabled={isUnavailable}
                                                onClick={() => setSelectedSlot({
                                                    ...slotItem,
                                                    time: slotTimeStr,
                                                    date: selectedDate,
                                                    formattedTime: formatTime12h(slotTimeStr)
                                                })}
                                                className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${isUnavailable
                                                    ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed line-through'
                                                    : isSelected
                                                        ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md ring-2 ring-[#3d3f96]/30'
                                                        : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer'
                                                    }`}
                                            >
                                                <span className="text-xs font-extrabold tracking-tight">
                                                    {formatTime12h(slotTimeStr)}
                                                </span>

                                                {/* Premium Surcharge Tag */}
                                                {hasPremium && !isUnavailable && (
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 mt-0.5 ${isSelected ? 'bg-indigo-400/40 text-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                        }`}>
                                                        <Sparkles size={8} />
                                                        +₹{slotItem.premiumFee}
                                                    </span>
                                                )}

                                                {/* Status Label */}
                                                {slotItem.isBooked && (
                                                    <span className="text-[9px] font-bold text-rose-500 uppercase">Booked</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Modal Actions */}
                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowRescheduleModal(false)}
                                disabled={rescheduling}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
                            >
                                Close
                            </button>

                            <button
                                type="button"
                                onClick={handleRescheduleSubmit}
                                disabled={rescheduling || !selectedSlot || loadingSlots}
                                className="px-6 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-extrabold uppercase tracking-wider shadow-md shadow-indigo-100 flex items-center gap-2 transition-all cursor-pointer"
                            >
                                {rescheduling ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        <span>Rescheduling...</span>
                                    </>
                                ) : (
                                    <>
                                        <CalendarClock size={14} />
                                        <span>Confirm Reschedule</span>
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}