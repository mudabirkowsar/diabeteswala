"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Stethoscope,
  Calendar,
  Clock,
  Bed,
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
  Activity
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

const CLINIC_PLACEHOLDER = "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=200&auto=format&fit=crop";
const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop";

export default function ClinicalAppointments() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Clinical Bookings List from API
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await UserAPI.getClinicalBookingsList();
      if (response && response.success) {
        setBookings(response.data || []);
      } else {
        setBookings([]);
        if (showNotification) {
          showNotification("Unable to load clinical appointments.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching clinical bookings:", err);
      setBookings([]);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to load bookings.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Card Click Navigation
  const handleBookingClick = (bookingId) => {
    if (!bookingId) return;
    router.push(`/otherscreens/myappointments/clinicorderdetail/${bookingId}`);
  };

  // Helper: Status Badges
  const renderStatusBadge = (status) => {
    const isConfirmed = status?.toLowerCase() === 'confirmed';
    const isCompleted = status?.toLowerCase() === 'completed';
    const isCancelled = status?.toLowerCase() === 'cancelled';

    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
          isConfirmed || isCompleted
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            : isCancelled
            ? 'bg-rose-50 text-rose-600 border-rose-200/80'
            : 'bg-amber-50 text-amber-700 border-amber-200/80'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isConfirmed || isCompleted
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
            <Building2 className="text-[#3d3f96]" size={20} />
            My Clinical Appointments &amp; Admissions ({bookings.length})
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Real-time record of all your confirmed OPD doctor visits, admissions, and teleconsultations.
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
            Fetching your clinical booking records...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
            <Activity size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Clinical Appointments Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
            You have not booked any clinic visits or inpatient ward admissions yet.
          </p>
          <button
            onClick={() => router.push('/clinic')}
            className="mt-5 px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Explore Clinics &amp; Doctors
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => {
            const clinic = item.clinic || {};
            const doctor = item.doctor || {};
            const clinicImage = getMediaUrl(clinic.image) || CLINIC_PLACEHOLDER;
            const docImage = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;
            const isAdmission = item.bookingType?.toLowerCase() === 'admission';

            return (
              <div
                key={item._id}
                onClick={() => handleBookingClick(item._id)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer group p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                {/* 1. Header Bar: Booking ID, Type & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-xl tracking-wider">
                      {item.bookingId}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${
                        isAdmission
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
                      }`}
                    >
                      {item.bookingType || 'Appointment'}
                    </span>
                    {renderConsultationBadge(item.consultationType)}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {/* 2. Middle Grid: Clinic, Doctor & Ward Details */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Clinic Info (5/12) */}
                  <div className="md:col-span-5 flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={clinicImage}
                        alt={clinic.name || "Clinic"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = CLINIC_PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Clinic Facility
                      </span>
                      <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-[#3d3f96] transition-colors" title={clinic.name}>
                        {clinic.name || "Partner Health Facility"}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 truncate">
                        <MapPin size={11} className="text-slate-400 shrink-0" />
                        <span>{clinic.city || "Mohali, Punjab"}</span>
                      </p>
                    </div>
                  </div>

                  {/* Doctor Info (4/12) */}
                  <div className="md:col-span-4 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={docImage}
                        alt={doctor.name || "Doctor"}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Attending Specialist
                      </span>
                      <h4 className="text-xs font-black text-slate-900 truncate" title={doctor.name}>
                        {doctor.name || "Specialist Assigned"}
                      </h4>
                      <p className="text-[11px] font-bold text-[#3d3f96] truncate">
                        {doctor.speciality || "Consultant"}
                      </p>
                    </div>
                  </div>

                  {/* Date, Time & Ward info (3/12) */}
                  <div className="md:col-span-3 space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
                      <Calendar size={13} className="text-[#3d3f96] shrink-0" />
                      <span>{item.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 font-mono">
                      <Clock size={13} className="text-amber-500 shrink-0" />
                      <span>{item.appointmentTime}</span>
                    </div>
                    {item.wardInfo && (
                      <div className="flex items-center gap-1 text-[11px] font-black text-emerald-800 pt-0.5 truncate" title={item.wardInfo}>
                        <Bed size={13} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{item.wardInfo}</span>
                      </div>
                    )}
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