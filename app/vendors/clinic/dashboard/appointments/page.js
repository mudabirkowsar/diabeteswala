"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Stethoscope,
  ShieldAlert,
  Search,
  Calendar,
  Clock,
  Bed,
  MapPin,
  Video,
  Home,
  User,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Activity,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Phone,
  RefreshCw,
  Layers
} from 'lucide-react';

import ClinicAPI from '../../../../services/ClinicAPI'; // Adjust relative path as needed
import AppointmentDetail from './components/AppointmentDetail';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOC_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop";

export default function ClinicBookingsDashboard() {
  // --- Data & Loading States ---
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    totalDocs: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 10
  });

  // --- Filtering & Search States ---
  const [activeTypeTab, setActiveTypeTab] = useState('ALL'); // 'ALL' | 'OPD' | 'IPD' | 'Emergency'
  const [selectedStatus, setSelectedStatus] = useState('ALL'); // 'ALL' | 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('');

  // --- Single Booking Dossier Modal State ---
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // --- Fetch Bookings List via API ---
  const fetchBookings = useCallback(async (pageNumber = 1) => {
    setLoading(true);
    try {
      const params = {
        page: pageNumber,
        limit: 10
      };

      if (activeTypeTab !== 'ALL') {
        params.bookingType = activeTypeTab;
      }
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await ClinicAPI.getAllClinicBookings(params);
      if (response && response.success) {
        setBookings(response.data || []);
        setPagination({
          totalDocs: response.totalDocs || response.count || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || pageNumber,
          limit: response.limit || 10
        });
      } else {
        setBookings([]);
      }
    } catch (err) {
      console.error("Error fetching clinic bookings list:", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [activeTypeTab, selectedStatus, searchQuery]);

  // Initial load & Filter change trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBookings(1);
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchBookings]);

  // Handle open dossier modal
  const handleOpenDossier = (id) => {
    setSelectedBookingId(id);
    setIsDossierOpen(true);
  };

  // Helper: Status Badges
  const renderStatusBadge = (status) => {
    const s = status?.toLowerCase();
    const isConfirmed = s === 'confirmed';
    const isCompleted = s === 'completed';
    const isCancelled = s === 'cancelled';

    return (
      <span
        className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${isConfirmed || isCompleted
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : isCancelled
              ? 'bg-rose-50 text-rose-600 border-rose-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
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

  // Helper: Category Tag Badge
  const renderCategoryBadge = (tag, type) => {
    const normalized = (tag || type || '').toLowerCase();
    const isEmergency = normalized.includes('emergency');
    const isIPD = normalized.includes('ipd') || normalized.includes('admission');

    return (
      <span
        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${isEmergency
            ? 'bg-red-50 text-red-600 border-red-200/80 shadow-2xs'
            : isIPD
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-2xs'
              : 'bg-indigo-50 text-[#3d3f96] border-indigo-100'
          }`}
      >
        {isEmergency ? 'Emergency' : isIPD ? 'IPD Admission' : 'OPD Consult'}
      </span>
    );
  };

  // Helper: Consultation Mode Pill
  const renderConsultationMode = (mode) => {
    const isVideo = mode?.toLowerCase().includes('video');
    const isHome = mode?.toLowerCase().includes('home');

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
        {isVideo ? (
          <Video size={12} className="text-indigo-600" />
        ) : isHome ? (
          <Home size={12} className="text-emerald-600" />
        ) : (
          <MapPin size={12} className="text-[#3d3f96]" />
        )}
        <span>{mode || 'Clinic Visit'}</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen text-slate-800 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center shadow-xs">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Facility Bookings &amp; Admissions
            </h1>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Live reception roster for OPD appointments, inpatient ward admissions, and casualty triage.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchBookings(pagination.currentPage)}
          className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* --- FILTER & SEARCH CONTROLS ROW --- */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">

        {/* Row A: Category Tabs Switcher */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 gap-1 flex-wrap sm:flex-nowrap">
            {[
              { key: 'ALL', label: 'All Bookings', icon: <Layers size={14} /> },
              { key: 'OPD', label: 'OPD Appointments', icon: <Stethoscope size={14} /> },
              { key: 'IPD', label: 'IPD Admissions', icon: <Bed size={14} /> },
              { key: 'Emergency', label: 'Emergency Triage', icon: <ShieldAlert size={14} /> }
            ].map((tab) => {
              const isSelected = activeTypeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTypeTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${isSelected
                      ? tab.key === 'Emergency'
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Status Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 rounded-xl px-3 py-1.5 outline-none focus:border-[#3d3f96] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Row B: Live Search Input Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by Booking ID (e.g. CLN-ORD), Patient Name, or Contact Phone Number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3d3f96] focus:ring-1 focus:ring-[#3d3f96] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

      </div>

      {/* --- BOOKINGS CONTENT GRID / LIST VIEW --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Loading facility admission records...
          </p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
            <Activity size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Clinic Records Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
            No bookings match your current search criteria, category selection, or status filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((item) => {
            const doctor = item.doctor || {};
            const doctorPhoto = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;

            return (
              <div
                key={item._id}
                onClick={() => handleOpenDossier(item._id)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer group p-5 sm:p-6 flex flex-col justify-between gap-5"
              >
                {/* 1. Header Bar: Booking ID, Category Pill, Consultation Type, & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-xl tracking-wider">
                      {item.bookingId}
                    </span>
                    {renderCategoryBadge(item.categoryTag, item.bookingType)}
                    {renderConsultationMode(item.consultationType)}
                  </div>

                  <div className="flex items-center gap-2">
                    {renderStatusBadge(item.status)}
                  </div>
                </div>

                {/* 2. Middle Row: Patient Info, Doctor Assignment & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                  {/* Patient Info (4/12) */}
                  <div className="md:col-span-4 flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100/80 flex items-center justify-center text-[#3d3f96] shrink-0 font-black">
                      <User size={22} />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Patient Name
                      </span>
                      <h3 className="text-sm font-black text-slate-900 truncate group-hover:text-[#3d3f96] transition-colors" title={item.patientName}>
                        {item.patientName || "Registered Patient"}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold truncate">
                        {item.patientGender ? `${item.patientGender}, ` : ''}{item.patientAge ? `${item.patientAge} Yrs` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Info (4/12) */}
                  <div className="md:col-span-4 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-5">
                    <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={doctorPhoto}
                        alt={doctor.name || "Specialist"}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = DOC_PLACEHOLDER; }}
                      />
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">
                        Assigned Doctor
                      </span>
                      <h4 className="text-xs font-black text-slate-900 truncate" title={doctor.name}>
                        {doctor.name || "Doctor Pending"}
                      </h4>
                      <p className="text-[11px] font-bold text-[#3d3f96] truncate">
                        {doctor.speciality || "Specialist"}
                      </p>
                    </div>
                  </div>

                  {/* Schedule & Ward Info (4/12) */}
                  <div className="md:col-span-4 space-y-1.5 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-[#3d3f96] shrink-0" />
                        {item.appointmentDate}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Clock size={13} className="text-amber-500 shrink-0" />
                        {item.appointmentTime}
                      </span>
                    </div>

                    {item.wardInfo && (
                      <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-800 pt-1 border-t border-slate-100/80 truncate">
                        <Bed size={13} className="text-emerald-600 shrink-0" />
                        <span className="truncate">{item.wardInfo}</span>
                      </div>
                    )}
                  </div>

                </div>

                {/* 3. Bottom Row: Total Amount & Dossier Trigger */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-[10px] font-bold uppercase text-slate-400">Total Billed:</span>
                      <strong className="text-base font-black font-mono text-slate-900">
                        ₹{item.totalAmount}
                      </strong>
                    </div>

                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {item.paymentStatus || "Paid"}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-xs font-black text-[#3d3f96] group-hover:translate-x-1 transition-transform">
                    <span>View 360° Clinical Dossier</span>
                    <ChevronRight size={15} />
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* --- PAGINATION BAR --- */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-xs">
          <span className="text-xs font-bold text-slate-500">
            Showing Page <strong className="text-slate-900">{pagination.currentPage}</strong> of <strong className="text-slate-900">{pagination.totalPages}</strong> ({pagination.totalDocs} Total Records)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={pagination.currentPage <= 1}
              onClick={() => fetchBookings(pagination.currentPage - 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronLeft size={16} />
            </button>

            <button
              type="button"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => fetchBookings(pagination.currentPage + 1)}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* --- 360° CLINICAL DOSSIER SLIDE-OVER MODAL --- */}
      <AppointmentDetail
        isOpen={isDossierOpen}
        onClose={() => {
          setIsDossierOpen(false);
          setSelectedBookingId(null);
        }}
        bookingId={selectedBookingId}
      />

    </div>
  );
}