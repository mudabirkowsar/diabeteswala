"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Ambulance,
  ArrowLeft,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  HeartPulse,
  Clock,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Building2,
  KeyRound,
  CreditCard,
  Banknote,
  Copy,
  Check,
  Radio,
  Sparkles,
  Share2,
  Stethoscope,
  Ticket,
  Mail,
  Navigation,
  Loader2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import UserAPI service
import UserAPI from '../../../../../services/UserAPI';

export default function AmbulanceBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Fetch Order Details
  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) return;
    setLoading(true);
    try {
      const response = await UserAPI.getAmbulanceBookingOrderById(orderId);
      if (response && response.success) {
        setOrder(response.data);
      } else {
        toast.error("Ambulance booking details not found.");
      }
    } catch (err) {
      console.error("Error fetching order details:", err);
      toast.error(err.response?.data?.message || "Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  // Copy OTP Helper
  const handleCopyOtp = (otp) => {
    if (!otp) return;
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    toast.success("OTP copied to clipboard!");
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Share Booking Info
  const handleShare = () => {
    if (!order) return;
    if (navigator.share) {
      navigator.share({
        title: `Ambulance Dispatch: ${order.bookingId}`,
        text: `Ambulance Unit ${order.ambulanceId?.vehicleNumber} is en route. Pilot: ${order.ambulanceId?.name} (${order.ambulanceId?.phone}). OTP: ${order.otp || 'N/A'}`
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Booking tracking link copied!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-4">
        <Toaster position="top-right" />
        <Loader2 className="animate-spin text-red-600" size={40} />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">
          Loading live dispatch telemetry & order specifications...
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <Toaster position="top-right" />
        <AlertCircle size={52} className="text-rose-400 mb-3" />
        <h2 className="text-xl font-black text-slate-800">Booking Record Not Found</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-sm">
          The requested ambulance order ID may be invalid or expired.
        </p>
        <button
          onClick={() => router.push('/otherscreens/myambulancebookings')}
          className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const {
    bookingId,
    caseReference,
    bookingCategory,
    rideType,
    status,
    otp,
    isOtpVerified,
    ambulanceId: ambulance,
    clinicId: clinic,
    pickupLocation,
    dropoffLocation,
    patientDetails,
    supportStaff = [],
    couponDetails,
    pricing = {},
    paymentMethod,
    paymentStatus,
    transactionId,
    trackingTimeline = [],
    scheduledDate,
    scheduledTime,
    estimateTime,
    createdAt
  } = order;

  const isEmergency = bookingCategory?.toLowerCase() === 'emergency';
  const isPaid = paymentStatus?.toLowerCase() === 'paid';

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 py-8 px-4 sm:px-6 lg:px-8 text-left antialiased">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- Top Navigation Bar --- */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/otherscreens/myambulancebookings')}
              className="p-2.5 bg-white border border-slate-200 rounded-2xl text-slate-600 hover:text-slate-900 shadow-xs transition cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {bookingId}
                </h1>
                <span className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-md ${
                  isEmergency ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'
                }`}>
                  {isEmergency ? 'Emergency SOS' : 'Scheduled Referral'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-0.5">
                Case Reference: <span className="text-slate-800">{caseReference}</span> • Booked {new Date(createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-slate-900 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xs transition cursor-pointer"
            >
              <Share2 size={14} />
              <span>Share Link</span>
            </button>

            <span className="text-xs font-black uppercase px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl flex items-center gap-1.5 shadow-xs">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {status || 'Confirmed'}
            </span>
          </div>
        </div>

        {/* --- Emergency OTP & Status Banner --- */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block">
              Active Dispatch Telemetry
            </span>
            <h3 className="text-lg sm:text-xl font-black">
              {isEmergency ? '🚨 Emergency Unit Broadcast Dispatched' : '📅 Scheduled Ambulance Confirmed'}
            </h3>
            <p className="text-xs text-slate-300 max-w-xl">
              {isEmergency 
                ? 'The assigned pilot has received your GPS pickup point. Please keep the patient stabilized and your phone reachable.'
                : `Ambulance reserved for ${scheduledDate} (${scheduledTime}). Estimated duration: ${estimateTime}.`
              }
            </p>
          </div>

          {/* OTP Verification Pill */}
          {otp && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 flex items-center gap-4 shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block flex items-center gap-1">
                  <KeyRound size={12} className="text-yellow-400" /> Pilot Verification OTP
                </span>
                <span className="text-2xl font-black tracking-widest text-white tabular-nums">
                  {otp}
                </span>
              </div>
              <button
                onClick={() => handleCopyOtp(otp)}
                className="p-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl transition cursor-pointer"
                title="Copy OTP"
              >
                {copiedOtp ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          )}
        </div>

        {/* --- Main 2-Column Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* =========================================================
              LEFT 7 COLS: ROUTE, PATIENT, STAFF & TIMELINE
             ========================================================= */}
          <div className="lg:col-span-7 space-y-6">

            {/* Route & GPS Locations Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Navigation size={15} className="text-red-600" /> Route & GPS Coordinates
              </h3>

              <div className="space-y-4 text-xs">
                {/* Pickup Address */}
                <div className="flex items-start gap-3 p-3.5 bg-red-50/40 rounded-2xl border border-red-100">
                  <div className="p-2 bg-red-100 text-red-600 rounded-xl mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-red-600 block">Pickup Location</span>
                    <h4 className="text-sm font-black text-slate-900">{pickupLocation?.address}</h4>
                    {pickupLocation?.lat && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        GPS: {pickupLocation.lat}° N, {pickupLocation.lng}° E
                      </p>
                    )}
                  </div>
                </div>

                {/* Dropoff Address */}
                <div className="flex items-start gap-3 p-3.5 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl mt-0.5">
                    <Building2 size={16} />
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 block">Destination Hospital</span>
                    <h4 className="text-sm font-black text-slate-900">{dropoffLocation?.address}</h4>
                    {dropoffLocation?.lat && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        GPS: {dropoffLocation.lat}° N, {dropoffLocation.lng}° E
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ride Timing Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Ride Mode</span>
                  <strong className="text-xs font-black text-slate-800">{rideType || 'Single Ride'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">Estimated Journey</span>
                  <strong className="text-xs font-black text-slate-800">{estimateTime || 'Immediate'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">OTP Status</span>
                  <strong className={`text-xs font-black ${isOtpVerified ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isOtpVerified ? 'Verified' : 'Pending At Pickup'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Patient Clinical Info Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <User size={15} className="text-indigo-600" /> Patient Clinical Profile
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Patient Name</span>
                  <strong className="text-xs font-black text-slate-900">{patientDetails?.name || 'N/A'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Age / Gender</span>
                  <strong className="text-xs font-black text-slate-800">
                    {patientDetails?.age || 'N/A'} Yrs • {patientDetails?.gender || 'N/A'}
                  </strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Relation</span>
                  <strong className="text-xs font-black text-slate-800">{patientDetails?.relation || 'Self'}</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Condition</span>
                  <strong className="text-xs font-black text-red-600 truncate block">
                    {patientDetails?.condition || 'Emergency'}
                  </strong>
                </div>
              </div>

              {patientDetails?.emergencyDescription && (
                <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs">
                  <span className="text-[10px] font-black uppercase text-indigo-700 block mb-0.5">Clinical Transfer Notes</span>
                  <p className="text-slate-700 font-medium">{patientDetails.emergencyDescription}</p>
                </div>
              )}
            </div>

            {/* Attached Support Staff & Equipment */}
            {supportStaff.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <HeartPulse size={15} className="text-emerald-600" /> Attached Medical Staff & Facilities
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {supportStaff.map((staff, idx) => (
                    <div key={idx} className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <Stethoscope size={16} className="text-emerald-600" />
                        <strong className="font-black text-slate-900">{staff.name}</strong>
                      </div>
                      <span className="font-black text-emerald-800">+₹{staff.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Tracking Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Clock size={15} className="text-blue-600" /> Dispatch & Tracking Timeline
              </h3>

              {trackingTimeline.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No timeline events recorded yet.</p>
              ) : (
                <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 ml-2 pt-1">
                  {trackingTimeline.map((item, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <span className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-xs" />
                      <div className="flex items-center justify-between text-xs">
                        <strong className="font-black text-slate-900">{item.status}</strong>
                        <span className="text-[10px] text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {item.note && (
                        <p className="text-xs text-slate-600 font-medium">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* =========================================================
              RIGHT 5 COLS: AMBULANCE, CLINIC & FARE BREAKDOWN
             ========================================================= */}
          <div className="lg:col-span-5 space-y-6">

            {/* Assigned Ambulance & Pilot Card */}
            {ambulance && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Assigned Unit Pilot
                  </span>
                  <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    {ambulance.vehicleType}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-200 shrink-0">
                    <Ambulance size={28} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">{ambulance.vehicleNumber}</h3>
                    <p className="text-xs text-slate-500 font-semibold">{ambulance.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Blood Group</span>
                    <strong className="font-black text-rose-600">{ambulance.bloodGroup || 'N/A'}</strong>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Experience</span>
                    <strong className="font-black text-slate-800">{ambulance.experienceYears || '0'} Years</strong>
                  </div>
                </div>

                {/* Direct Call CTA */}
                <a
                  href={`tel:${ambulance.phone}`}
                  className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition shadow-lg shadow-red-500/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone size={14} />
                  <span>Call Pilot: {ambulance.phone}</span>
                </a>
              </div>
            )}

            {/* Affiliated Clinic Card (if available) */}
            {clinic && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    Affiliated Hub / Clinic
                  </span>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                    Verified Base
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900">{clinic.name}</h4>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" /> {clinic.address}
                  </p>
                </div>

                {clinic.phoneNumber && (
                  <a
                    href={`tel:${clinic.phoneNumber}`}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Phone size={13} />
                    <span>Call Clinic: {clinic.phoneNumber}</span>
                  </a>
                )}
              </div>
            )}

            {/* Financial Ledger & Payment Details */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl shadow-slate-100 space-y-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-100 pb-2">
                Payment & Billing Breakdown
              </span>

              <div className="space-y-2 text-xs font-bold">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Base Ride Charge:</span>
                  <span className="font-black text-slate-900">₹{pricing.baseRideCharge || 0}</span>
                </div>

                {pricing.distanceCharge > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Distance Surcharge:</span>
                    <span className="font-black text-slate-900">+₹{pricing.distanceCharge}</span>
                  </div>
                )}

                {supportStaff.length > 0 && (
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Support Staff Add-ons:</span>
                    <span className="font-black text-emerald-700">
                      +₹{supportStaff.reduce((sum, item) => sum + (item.price || 0), 0)}
                    </span>
                  </div>
                )}

                {couponDetails && couponDetails.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-600">
                    <span className="flex items-center gap-1">
                      <Ticket size={12} /> Coupon ({couponDetails.couponCode}):
                    </span>
                    <span className="font-black">-₹{couponDetails.discountAmount}</span>
                  </div>
                )}
              </div>

              {/* Total Summary */}
              <div className="pt-3 border-t border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 block">Total Amount</span>
                  <span className={`text-[10px] font-bold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {paymentMethod} • {paymentStatus}
                  </span>
                </div>
                <div className="text-3xl font-black text-slate-900">
                  ₹{pricing.total || 0}
                </div>
              </div>

              {transactionId && (
                <div className="p-2.5 bg-slate-50 rounded-xl text-[11px] text-slate-500 font-mono truncate">
                  Txn ID: {transactionId}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}