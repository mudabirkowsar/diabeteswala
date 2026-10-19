"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  HeartHandshake,
  User,
  Calendar,
  Clock,
  MapPin,
  Video,
  Building2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Phone,
  Mail,
  Loader2,
  Percent,
  Printer,
  Star,
  KeyRound,
  ShieldAlert,
  XCircle,
  Navigation,
  Activity,
  History
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

const COACH_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function CoachOrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { showNotification } = useNotification();

  // Support both /coachbookingdetail/[id] and /coachbookingdetail?id=DW-COACH-...
  const bookingId = params?.id || searchParams?.get('id');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal & State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Fetch single coach booking details
  const fetchDetails = useCallback(async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const response = await UserAPI.getCoachBookingDetailsById(bookingId);
      if (response && response.success) {
        setBooking(response.data);
      } else {
        setBooking(null);
        if (showNotification) {
          showNotification("Unable to load booking details.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching coach booking details:", err);
      setBooking(null);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to retrieve booking.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId, showNotification]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Handle Cancellation Action
  const handleCancelBooking = async (e) => {
    e.preventDefault();
    if (!bookingId) return;

    if (!cancelReason.trim()) {
      if (showNotification) {
        showNotification("Please provide a valid cancellation reason.", "warning");
      }
      return;
    }

    setCancelling(true);
    try {
      const response = await UserAPI.cancelCoachBooking(bookingId, { cancelReason: cancelReason.trim() });
      if (response && response.success) {
        if (showNotification) {
          showNotification(response.message || "Coach consultation cancelled successfully.", "success");
        }
        setShowCancelModal(false);
        setCancelReason("");
        // Reload details to show updated cancellation & refund status
        fetchDetails();
      } else {
        if (showNotification) {
          showNotification(response?.message || "Failed to cancel booking.", "error");
        }
      }
    } catch (err) {
      console.error("Cancellation error:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Could not process cancellation.", "error");
      }
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center select-none">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800">
          Loading Coach Booking Details...
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Retrieving consultation slot, educator profile, and session verification
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
          We could not locate this diabetes coach session. It may have been unlisted or expired.
        </p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider px-6 py-3 rounded-2xl transition-all shadow-md cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Bookings
        </button>
      </div>
    );
  }

  // Safe References for populated objects
  const coach = booking.coachId || {};
  const patient = booking.patientDetails || {};
  const address = booking.address || null;
  const hospital = booking.hospitalDetails || null;
  const pricing = booking.pricing || {};
  const cancellation = booking.cancellationDetails || {};
  const tracking = booking.trackingTimeline || [];

  const {
    bookingId: orderCode,
    consultationMode,
    scheduledDate,
    slotTime,
    specialInstructions,
    locationType,
    paymentMethod,
    paymentStatus,
    transactionId,
    status,
    sessionOtp,
    createdAt
  } = booking;

  const coachImage = getMediaUrl(coach.profileImage) || COACH_PLACEHOLDER;
  const isOnline = consultationMode?.toLowerCase() === 'online';
  const isCancelled = status?.toLowerCase() === 'cancelled';
  const isCompleted = status?.toLowerCase() === 'completed';
  const canCancel = !isCancelled && !isCompleted;

  const formattedBookedDate = createdAt
    ? new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A';

  return (
    <div className="min-h-screen bg-[#f8fbff] text-slate-800 pb-28 antialiased select-none text-left">
      {/* Top Navigation Bar */}
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
                Coach Booking Code
              </span>
              <h1 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight font-mono mt-0.5">
                {orderCode || booking._id}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Badge */}
            <span
              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
                isOnline
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isOnline ? <Video size={12} /> : <Building2 size={12} />}
              <span>{consultationMode || 'Offline'}</span>
            </span>

            {/* Status Badge */}
            <span
              className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl border flex items-center gap-1.5 shadow-2xs ${
                isCancelled
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : isCompleted
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isCancelled ? (
                <XCircle size={12} className="text-rose-500" />
              ) : (
                <CheckCircle2 size={12} className="text-emerald-500" />
              )}
              <span>{status || 'Confirmed'}</span>
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: COACH INFO, PATIENT, VENUE & TIMELINE (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Session Start OTP Card (Prominent for Active Visits) */}
            {!isCancelled && sessionOtp && (
              <div className="bg-gradient-to-r from-indigo-500 via-[#3d3f96] to-slate-900 rounded-3xl p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 text-indigo-200 text-xs font-bold uppercase tracking-wider">
                    <KeyRound size={15} />
                    <span>Session Verification Code</span>
                  </div>
                  <p className="text-xs text-indigo-100/80">
                    Share this 4-digit PIN with your coach when starting the consultation.
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/20">
                  <span className="font-mono text-3xl font-black tracking-widest text-white drop-shadow">
                    {sessionOtp}
                  </span>
                </div>
              </div>
            )}

            {/* 2. Cancellation Notice Banner (If Cancelled) */}
            {isCancelled && (
              <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-900 space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} className="text-rose-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
                    Consultation Cancelled by {cancellation.cancelledBy || 'User'}
                  </h4>
                </div>
                {cancellation.reason && (
                  <p className="text-xs text-rose-700 bg-white/60 p-3 rounded-xl border border-rose-100 font-medium">
                    &ldquo;{cancellation.reason}&rdquo;
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-4 pt-1 text-[11px] font-mono">
                  <span>
                    <strong>Refund Status:</strong> {cancellation.refundStatus || 'Not Applicable'}
                  </span>
                  {cancellation.refundAmount > 0 && (
                    <span>
                      <strong>Refund Amount:</strong> ₹{cancellation.refundAmount}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 3. Coach Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 text-[#3d3f96]">
                  <HeartHandshake size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Diabetes Educator / Coach
                  </h3>
                </div>
                {coach.rating && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-black bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200/80">
                    <Star size={11} className="fill-amber-400 text-amber-500" />
                    <span>{coach.rating}</span>
                  </span>
                )}
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                  <img
                    src={coachImage}
                    alt={coach.name || "Coach"}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = COACH_PLACEHOLDER; }}
                  />
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <h4 className="text-base font-black text-slate-900 truncate">
                    {coach.name || "Certified Coach"}
                  </h4>
                  <p className="text-xs font-bold text-[#3d3f96]">
                    {coach.qualification || "Certified Diabetes Educator"}
                  </p>
                  {coach.languages && coach.languages.length > 0 && (
                    <p className="text-[11px] text-slate-500 font-medium">
                      Languages: {coach.languages.join(', ')}
                    </p>
                  )}
                </div>
              </div>

              {coach.about && (
                <p className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-2xl border border-slate-100 leading-relaxed font-normal">
                  {coach.about}
                </p>
              )}

              {/* Slot & Schedule strip */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                  <Calendar size={14} className="text-[#3d3f96]" />
                  <span>{scheduledDate || 'Date Pending'}</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold text-slate-700">
                  <Clock size={14} className="text-amber-500" />
                  <span>{slotTime || 'Time Slot Pending'}</span>
                </div>
              </div>
            </div>

            {/* 4. Patient Medical Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                <div className="flex items-center gap-2 text-[#3d3f96]">
                  <User size={16} />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Patient Profile &amp; Diabetic Assessment
                  </h3>
                </div>
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200/60">
                  {patient.relation || booking.bookingFor || "SELF"}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-medium">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                  <strong className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                    {patient.name || "Primary User"}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Age &amp; Gender</span>
                  <span className="text-slate-800 font-bold block mt-0.5">
                    {patient.age ? `${patient.age} Yrs • ` : ''}{patient.gender || 'Not specified'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Diabetic Profile</span>
                  <span className="text-emerald-700 font-bold block mt-0.5">
                    {patient.isDiabetic ? (patient.diabetesType || "Diabetic") : "Non-Diabetic"}
                  </span>
                </div>
              </div>

              {/* Special Instructions / Notes */}
              {specialInstructions && (
                <div className="pt-2 border-t border-slate-50 space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                    Special Consultation Instructions
                  </span>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/80 leading-relaxed font-semibold">
                    &ldquo;{specialInstructions}&rdquo;
                  </p>
                </div>
              )}
            </div>

            {/* 5. Location Details (Hospital Bedside / Home Visit Address / Online) */}
            {locationType === 'Hospital' && hospital && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-rose-600">
                    <Building2 size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Hospital Bedside Consultation Location
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                    Hospital Inpatient
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Hospital Name</span>
                    <strong className="text-xs sm:text-sm font-black text-slate-900 block mt-0.5">
                      {hospital.hospitalName || 'Local Hospital'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Floor</span>
                    <span className="text-slate-800 font-bold block mt-0.5">
                      {hospital.floorNo || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Ward Wing</span>
                    <span className="text-slate-800 font-bold block mt-0.5">
                      {hospital.ward || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Bed Number</span>
                    <span className="text-emerald-700 font-bold font-mono block mt-0.5">
                      {hospital.bedNo || 'N/A'}
                    </span>
                  </div>
                </div>

                {address && address.city && (
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 pt-2 border-t border-slate-50">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>
                      {address.city}, {address.state} - {address.pincode}
                    </span>
                  </p>
                )}
              </div>
            )}

            {locationType !== 'Hospital' && !isOnline && address && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <MapPin size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Physical Consultation Address
                    </h3>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {locationType || 'Physical Visit'}
                  </span>
                </div>

                <div className="space-y-1 text-xs font-medium">
                  <strong className="text-sm font-black text-slate-900 block">
                    {address.name || patient.name}
                  </strong>
                  <p className="text-slate-600 font-semibold leading-relaxed">
                    {address.houseNo ? `${address.houseNo}, ` : ''}
                    {address.sector ? `${address.sector}, ` : ''}
                    {address.landmark ? `(Near ${address.landmark}), ` : ''}
                    {address.city}, {address.state} - <span className="font-mono font-bold">{address.pincode}</span>
                  </p>
                  {address.phone && (
                    <span className="text-slate-500 font-mono font-bold flex items-center gap-1 pt-1">
                      <Phone size={12} className="text-slate-400" /> {address.phone}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 6. Tracking Timeline Audit */}
            {tracking.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                  <div className="flex items-center gap-2 text-[#3d3f96]">
                    <History size={16} />
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Booking Status Timeline
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 font-mono">
                    {tracking.length} Activities
                  </span>
                </div>

                <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {tracking.map((step, idx) => (
                    <div key={step._id || idx} className="relative">
                      <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#3d3f96] ring-4 ring-white" />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                            {step.status}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {new Date(step.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {step.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: PRICING RECEIPT & ACTIONS (5/12) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            {/* 7. Itemized Payment Receipt */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                  <Receipt size={18} />
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Payment Summary
                  </h3>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                    {paymentMethod || 'COD'}
                  </span>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                      paymentStatus?.toLowerCase() === 'paid'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : paymentStatus?.toLowerCase() === 'refund-pending'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {paymentStatus || 'Pending'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-medium text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Base Coach Consultation Fee</span>
                  <span className="font-mono font-bold text-slate-900">₹{pricing.baseFee || 0}</span>
                </div>

                {pricing.extraDistanceCharge > 0 && (
                  <div className="flex items-center justify-between">
                    <span>
                      Travel / Distance Charge ({pricing.distanceInKM || 0} KM)
                    </span>
                    <span className="font-mono font-bold text-slate-900">₹{pricing.extraDistanceCharge}</span>
                  </div>
                )}

                {pricing.premiumExtraFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span>Premium Slot Fee</span>
                    <span className="font-mono font-bold text-slate-900">₹{pricing.premiumExtraFee}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-slate-700">
                  <span>Subtotal</span>
                  <span className="font-mono font-bold text-slate-900">
                    ₹{pricing.subtotal || pricing.totalPayable || 0}
                  </span>
                </div>

                {pricing.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-700 font-bold bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                    <span className="flex items-center gap-1.5">
                      <Percent size={13} /> Applied Discount
                    </span>
                    <span className="font-mono font-black">- ₹{pricing.discountAmount}</span>
                  </div>
                )}

                {/* Total Payable */}
                <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between text-slate-900">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block">Total Amount</span>
                    <span className="text-[10px] text-slate-400 font-medium">Inclusive of all educator charges</span>
                  </div>
                  <strong className="text-2xl font-black font-mono text-[#3d3f96]">
                    ₹{pricing.totalPayable || 0}
                  </strong>
                </div>
              </div>

              {transactionId && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] font-mono flex items-center justify-between text-slate-600">
                  <span className="text-slate-400">Transaction ID:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[170px]" title={transactionId}>
                    {transactionId}
                  </span>
                </div>
              )}
            </div>

            {/* 8. Action Buttons */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Printer size={15} />
                <span>Print Booking Slip</span>
              </button>

              {canCancel && (
                <button
                  type="button"
                  onClick={() => setShowCancelModal(true)}
                  className="w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <XCircle size={15} />
                  <span>Cancel Coach Consultation</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => router.push('/diabetes-coach')}
                className="w-full py-3.5 px-5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-950/15"
              >
                <span>Book Another Coach</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center border border-rose-100">
                <AlertCircle size={22} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                  Cancel Consultation
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">
                  Session Code: {orderCode || booking._id}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {paymentMethod?.toUpperCase() === 'ONLINE'
                ? "Online payments will be 100% refunded and submitted for admin processing."
                : "Your COD session will be cancelled immediately and the slot released."}
            </p>

            <form onSubmit={handleCancelBooking} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Reason for Cancellation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Patient is discharged early / schedule conflict..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-[#3d3f96] bg-slate-50 resize-none font-medium text-slate-800"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  disabled={cancelling}
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={cancelling}
                  className="flex-1 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/20"
                >
                  {cancelling ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <span>Confirm Cancel</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}