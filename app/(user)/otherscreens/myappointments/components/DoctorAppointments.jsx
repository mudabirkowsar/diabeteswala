"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Video,
  Home,
  ChevronRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  CreditCard,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Activity,
  User,
  BadgeCheck,
  Phone,
  Building2
} from 'lucide-react';

// Adjust relative path as needed based on your folder structure
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop";

export default function DoctorAppointments() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Independent Doctor Bookings List from API
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await UserAPI.getIndependentDoctorBookingsList();
      if (response && response.success) {
        setBookings(response.data || []);
      } else {
        setBookings([]);
        if (showNotification) {
          showNotification("Unable to load doctor appointments.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching doctor bookings:", err);
      setBookings([]);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to load doctor bookings.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Card Click Navigation to Details Page
  const handleBookingClick = (bookingId) => {
    if (!bookingId) return;
    router.push(`/otherscreens/myappointments/doctorbookingdetail/${bookingId}`);
  };

  // Helper: Format Date String
  const formatAppointmentDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  // Helper: Status Badges
  const renderStatusBadge = (status) => {
    const isConfirmed = status?.toLowerCase() === 'confirmed';
    const isCompleted = status?.toLowerCase() === 'completed';
    const isCancelled = status?.toLowerCase() === 'cancelled';

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${isConfirmed || isCompleted
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            : isCancelled
              ? 'bg-rose-50 text-rose-600 border-rose-200/80'
              : 'bg-amber-50 text-amber-700 border-amber-200/80'
          }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isConfirmed || isCompleted
              ? 'bg-emerald-500'
              : isCancelled
                ? 'bg-rose-500'
                : 'bg-amber-500'
            }`}
        />
        {status || 'Pending'}
      </span>
    );
  };

  // Helper: Consultation Type Icon & Pill
  const renderConsultationBadge = (type) => {
    const isVideo = type?.toLowerCase().includes('video');
    const isHome = type?.toLowerCase().includes('home');

    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200/60 px-2.5 py-1 rounded-lg">
        {isVideo ? (
          <Video size={12} className="text-indigo-600" />
        ) : isHome ? (
          <Home size={12} className="text-emerald-600" />
        ) : (
          <MapPin size={12} className="text-rose-500" />
        )}
        <span>{type || 'Clinic Visit'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left antialiased select-none">

      {/* Top Count Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Stethoscope className="text-[#3d3f96]" size={20} />
            My Doctor Consultations ({bookings.length})
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Real-time record of all your video consults, clinic visits, and home medical appointments.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="text-xs font-bold text-[#3d3f96] hover:text-[#2d2f75] hover:underline self-start sm:self-auto cursor-pointer"
        >
          Refresh Records
        </button>
      </div>

      {/* --- CONTENT LIST VIEW --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Fetching your doctor appointment records...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
            <Activity size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Doctor Appointments Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
            You haven't booked any doctor consultations or home visits yet.
          </p>
          <button
            onClick={() => router.push('/doctor')}
            className="mt-5 px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Find &amp; Book Doctors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => {
            const doctor = item.doctorId || {};
            const docImage = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;
            const primaryPatient = (item.patients && item.patients.length > 0) ? item.patients[0] : null;
            const address = item.address || {};
            const isHomeVisit = item.consultationType?.toLowerCase().includes('home');

            return (
              <div
                key={item._id}
                onClick={() => handleBookingClick(item._id)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer group p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                {/* 1. Header Bar: Booking ID, Consultation Type & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-xl tracking-wider">
                      {item.bookingId || "N/A"}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border bg-indigo-50 text-[#3d3f96] border-indigo-100">
                      {item.bookingType || 'Appointment'}
                    </span>
                    {renderConsultationBadge(item.consultationType)}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {/* 2. Middle Grid: Doctor, Patient/Address & Date-Time Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                  {/* Doctor Info (5/12) */}
                  <div className="md:col-span-5 flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 relative">
                      <img
                        src={docImage}
                        alt={doctor.name || "Doctor"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Assigned Specialist
                      </span>
                      <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-[#3d3f96] transition-colors flex items-center gap-1.5" title={doctor.name}>
                        <span>{doctor.name?.toLowerCase().startsWith('dr.') ? doctor.name : `Dr. ${doctor.name || 'Medical Practitioner'}`}</span>
                        {doctor.profileStatus === 'Approved' && (
                          <BadgeCheck size={14} className="text-emerald-500 shrink-0 inline" />
                        )}
                      </h3>
                      <p className="text-xs text-[#3d3f96] font-bold truncate">
                        {doctor.speciality || "General Practitioner"}
                      </p>
                    </div>
                  </div>

                  {/* Patient & Location Info (4/12) */}
                  <div className="md:col-span-4 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                      {isHomeVisit ? <Home size={18} className="text-[#3d3f96]" /> : <User size={18} className="text-slate-600" />}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Patient &amp; Location
                      </span>
                      <h4 className="text-xs font-black text-slate-900 truncate" title={primaryPatient?.patientName || address?.name}>
                        {primaryPatient?.patientName || address?.name || "Self"}
                        {primaryPatient?.patientAge ? ` (${primaryPatient.patientAge}y, ${primaryPatient.gender || ''})` : ''}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span>{address.city ? `${address.city}, ${address.state || ''}` : 'Online Telehealth'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Date & Time info (3/12) */}
                  <div className="md:col-span-3 space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
                      <Calendar size={13} className="text-[#3d3f96] shrink-0" />
                      <span>{formatAppointmentDate(item.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 font-mono">
                      <Clock size={13} className="text-amber-500 shrink-0" />
                      <span>{item.appointmentTime || "Flexible Slot"}</span>
                    </div>
                  </div>

                </div>

                {/* 3. Bottom Row: Payment details & View Button */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Total Paid:</span>
                      <strong className="text-base font-black font-mono text-slate-900">
                        ₹{item.totalAmount}
                      </strong>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {item.paymentStatus || "Paid"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[#3d3f96] group-hover:translate-x-1 transition-transform">
                    <span>View Booking Details</span>
                    <ChevronRight size={15} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}