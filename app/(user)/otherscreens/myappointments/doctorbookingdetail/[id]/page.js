'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  Building2,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Receipt,
  CreditCard,
  User,
  Phone,
  Mail,
  FileText,
  Download,
  Share2,
  Sparkles,
  Key,
  Navigation,
  FileCheck2,
  BadgeCheck,
  Star,
  Activity,
  HeartPulse,
  Tag,
  HelpCircle,
  Printer
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

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop";

export default function DoctorBookingDetailPage({ params }) {
  const resolvedParams = use(params);
  const bookingId = resolvedParams?.id;
//   alert(bookingId)

  const router = useRouter();
  const { showNotification } = useNotification();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

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

    fetchBookingDetails();
  }, [bookingId]);

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

  const isHomeVisit = booking.consultationType?.toLowerCase().includes('home');
  const isVideoConsult = booking.consultationType?.toLowerCase().includes('video');
  const isConfirmed = booking.status?.toLowerCase() === 'confirmed';
  const isCancelled = booking.status?.toLowerCase() === 'cancelled';
  const isCompleted = booking.status?.toLowerCase() === 'completed';

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
                
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg border ${
                  isConfirmed || isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : isCancelled
                    ? 'bg-rose-50 text-rose-600 border-rose-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    isConfirmed || isCompleted ? 'bg-emerald-500' : isCancelled ? 'bg-rose-500' : 'bg-amber-500'
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

            {/* Quick Live OTP / ETA Widget (For Home Visits / On Duty) */}
            {tracking.otp && (
              <div className="flex items-center gap-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 p-4 rounded-2xl border border-indigo-100/90 shrink-0">
                <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100">
                  <Key size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Security Verification OTP</span>
                    <Sparkles size={12} className="text-[#3d3f96]" />
                  </div>
                  <div className="text-2xl font-black font-mono tracking-widest text-slate-900">
                    {tracking.otp}
                  </div>
                  {tracking.eta && (
                    <p className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 mt-0.5">
                      <Navigation size={11} />
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
                {doctor.averageRating && (
                  <div className="flex items-center gap-1 text-xs font-extrabold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-xl border border-amber-200/80">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{Number(doctor.averageRating).toFixed(1)}</span>
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
                    <BadgeCheck size={16} className="text-emerald-600 fill-emerald-50" />
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

                  {/* Languages & Contact Pills */}
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

            {/* D. Uploaded Medical Reports & Clinical Summaries */}
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
                            <FileCheck2 size={16} />
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
                  <span className="font-bold text-slate-900 font-mono">{policy.reschedulesLeft ?? 2} Remaining</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span>Free Cancellation Window:</span>
                  <span className="font-bold text-emerald-700 font-mono">Up to 2 hrs before</span>
                </div>
              </div>

              {/* Help & Support */}
              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400 font-medium">
                  Need clinical emergency assistance or booking support?
                </p>
                <button
                  onClick={() => router.push('/contact')}
                  className="mt-2 text-xs font-bold text-[#3d3f96] hover:underline cursor-pointer"
                >
                  Contact 24x7 Medical Helpline
                </button>
              </div>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}