"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  Clock,
  User,
  MapPin,
  Video,
  Building2,
  ChevronRight,
  Loader2,
  Activity,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  HeartHandshake
} from 'lucide-react';

import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

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

const STATUS_TABS = [
  { label: 'All', value: '' },
  { label: 'Confirmed', value: 'Confirmed' },
  { label: 'In-Progress', value: 'In-Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Cancelled', value: 'Cancelled' }
];

export default function CoachBookingss() {
  const router = useRouter();
  const { showNotification } = useNotification();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch coach bookings list
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (selectedStatus) params.status = selectedStatus;

      const response = await UserAPI.getMyCoachBookings(params);
      if (response && response.success) {
        setBookings(response.data || []);
        setTotalPages(response.totalPages || 1);
        setTotalCount(response.totalBookings || response.count || 0);
      } else {
        setBookings([]);
        if (showNotification) {
          showNotification("Unable to load coach bookings.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching coach bookings:", err);
      setBookings([]);
      if (showNotification) {
        showNotification(err.response?.data?.message || err.message || "Failed to load coach bookings.", "error");
      }
    } finally {
      setLoading(false);
    }
  }, [page, selectedStatus, showNotification]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Navigate to Detail Page
  const handleBookingClick = (bookingId) => {
    if (!bookingId) return;
    router.push(`/otherscreens/myappointments/coachbookingdetail/${bookingId}`);
  };

  // Status Badge Helper
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const isSuccess = s === 'confirmed' || s === 'completed';
    const isCancelled = s === 'cancelled';
    const isInProgress = s === 'in-progress';

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
          isSuccess
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
            : isCancelled
            ? 'bg-rose-50 text-rose-600 border-rose-200/80'
            : isInProgress
            ? 'bg-blue-50 text-blue-700 border-blue-200/80'
            : 'bg-amber-50 text-amber-700 border-amber-200/80'
        }`}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isSuccess
              ? 'bg-emerald-500'
              : isCancelled
              ? 'bg-rose-500'
              : isInProgress
              ? 'bg-blue-500'
              : 'bg-amber-500'
          }`}
        />
        {status || 'Pending'}
      </span>
    );
  };

  // Consultation Mode Badge
  const renderModeBadge = (mode) => {
    const isOnline = mode?.toLowerCase() === 'online';
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
          isOnline
            ? 'bg-purple-50 text-purple-700 border-purple-200/70'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200/70'
        }`}
      >
        {isOnline ? <Video size={12} className="text-purple-600" /> : <Building2 size={12} className="text-emerald-600" />}
        <span>{mode || 'Offline'}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left antialiased select-none">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <HeartHandshake className="text-[#3d3f96]" size={22} />
            My Diabetes Coach Bookings ({totalCount})
          </h2>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            Manage your personal diabetes educator sessions, consultations, and hospital bedside guidance.
          </p>
        </div>

        <button
          onClick={fetchBookings}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3d3f96] hover:text-[#2d2f75] hover:underline self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={13} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      {/* <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => {
                setSelectedStatus(tab.value);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#3d3f96] text-white shadow-sm shadow-[#3d3f96]/20'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/70'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div> */}

      {/* Content List View */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Fetching coach booking sessions...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
            <Activity size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Coach Bookings Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
            {selectedStatus
              ? `You don't have any sessions under the "${selectedStatus}" filter.`
              : 'You have not booked any diabetes coach consultations yet.'}
          </p>
          <button
            onClick={() => router.push('/diabetes-coach')}
            className="mt-5 px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Explore Diabetes Coaches
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => {
            const coach = item.coach || {};
            const patient = item.patient || {};
            const coachImage = getMediaUrl(coach.profileImage) || COACH_PLACEHOLDER;
            const isCOD = item.paymentMethod?.toUpperCase() === 'COD';

            return (
              <div
                key={item._id}
                onClick={() => handleBookingClick(item.bookingId || item._id)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer group p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                {/* 1. Header Bar: Booking ID, Consultation Mode, Location & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100/90 border border-slate-200 px-3 py-1 rounded-xl tracking-wider">
                      {item.bookingId || item._id}
                    </span>
                    {renderModeBadge(item.consultationMode)}
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                      {item.locationType || 'Session'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {/* 2. Middle Grid: Coach Info, Patient Info & Scheduled Slot */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  {/* Coach Info (5/12) */}
                  <div className="md:col-span-5 flex items-center gap-3.5">
                    <div className="w-13 h-13 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={coachImage}
                        alt={coach.name || "Diabetes Coach"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.currentTarget.src = COACH_PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#3d3f96] block">
                        Assigned Coach
                      </span>
                      <h3
                        className="text-sm font-black text-slate-900 truncate group-hover:text-[#3d3f96] transition-colors"
                        title={coach.name}
                      >
                        {coach.name || "Certified Coach"}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold truncate">
                        {coach.qualification || "Diabetes Educator"}
                      </p>
                    </div>
                  </div>

                  {/* Patient Info (4/12) */}
                  <div className="md:col-span-4 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                      <User size={20} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Session For ({patient.relation || patient.bookingFor || 'Self'})
                      </span>
                      <h4 className="text-xs font-black text-slate-900 truncate" title={patient.name}>
                        {patient.name || "Patient"}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 truncate">
                        Relation: {patient.relation || "Self"}
                      </p>
                    </div>
                  </div>

                  {/* Date & Time Slot (3/12) */}
                  <div className="md:col-span-3 space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 font-mono">
                      <Calendar size={13} className="text-[#3d3f96] shrink-0" />
                      <span>{item.scheduledDate || 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 font-mono">
                      <Clock size={13} className="text-amber-500 shrink-0" />
                      <span>{item.slotTime || 'Pending'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Bottom Row: Payable amount, Payment mode & View Details */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Total Payable:</span>
                      <strong className="text-base font-black font-mono text-slate-900">
                        ₹{item.totalPayable}
                      </strong>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {item.paymentMethod || 'COD'}
                    </span>

                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                        item.paymentStatus?.toLowerCase() === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.paymentStatus?.toLowerCase() === 'refund-pending'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {item.paymentStatus || 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[#3d3f96] group-hover:translate-x-1 transition-transform">
                    <span>View Session Details</span>
                    <ChevronRight size={15} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            Previous
          </button>
          <span className="text-xs font-mono font-bold text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}