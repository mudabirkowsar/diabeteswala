"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Layers,
  Sparkles
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

// --- DATE HELPER TO GET TODAY'S YYYY-MM-DD FORMAT ---
const getTodayYMD = () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// --- DATE HELPER TO DETECT TODAY'S DATE ---
const isToday = (dateVal) => {
  if (!dateVal) return false;
  try {
    const today = new Date();
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) {
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }
    // String matching fallback (YYYY-MM-DD or DD/MM/YYYY)
    const todayYMD = getTodayYMD();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    const strVal = String(dateVal).trim();
    return (
      strVal.includes(todayYMD) ||
      strVal.includes(`${dd}/${mm}/${yyyy}`) ||
      strVal.includes(`${dd}-${mm}-${yyyy}`)
    );
  } catch {
    return false;
  }
};

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
  const [selectedDoctorId, setSelectedDoctorId] = useState('ALL'); // 'ALL' | doctor _id or name
  const [searchQuery, setSearchQuery] = useState('');

  // --- DATE FILTER STATE ('today' | 'all' | 'YYYY-MM-DD') ---
  // Defaults to 'today' as requested
  const [dateFilter, setDateFilter] = useState('today');

  // Helpers to identify active date filter
  const isTodaySelected = dateFilter === 'today' || dateFilter === getTodayYMD();
  const isAllDatesSelected = dateFilter === 'all';
  const isCustomDate = !isTodaySelected && !isAllDatesSelected;

  // --- Dynamic Doctor List Registry ---
  const [availableDoctors, setAvailableDoctors] = useState([]);

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

      // API Date Specification (?date=all or ?date=YYYY-MM-DD)
      if (dateFilter === 'all') {
        params.date = 'all';
      } else if (dateFilter === 'today') {
        params.date = getTodayYMD();
      } else if (dateFilter) {
        params.date = dateFilter;
      }

      // API Category Specification (OPD, IPD, EMERGENCY)
      if (activeTypeTab !== 'ALL') {
        const typeVal = activeTypeTab === 'Emergency' ? 'EMERGENCY' : activeTypeTab;
        params.bookingType = typeVal;
        params.type = typeVal;
      }

      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      if (selectedDoctorId !== 'ALL') {
        params.doctorId = selectedDoctorId;
        params.doctor = selectedDoctorId;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await ClinicAPI.getAllClinicBookings(params);
      if (response && response.success) {
        const fetchedList = response.data || [];
        setBookings(fetchedList);
        setPagination({
          totalDocs: response.totalDocs || response.count || 0,
          totalPages: response.totalPages || 1,
          currentPage: response.currentPage || pageNumber,
          limit: response.limit || 10
        });

        // Harvest unique doctors for the dropdown
        setAvailableDoctors((prev) => {
          const map = new Map(prev.map((d) => [d.id, d]));
          fetchedList.forEach((b) => {
            if (b.doctor && (b.doctor._id || b.doctor.id || b.doctor.name)) {
              const id = b.doctor._id || b.doctor.id || b.doctor.name;
              if (!map.has(id)) {
                map.set(id, {
                  id,
                  name: b.doctor.name || "Specialist Doctor",
                  speciality: b.doctor.speciality || ""
                });
              }
            }
          });
          return Array.from(map.values());
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
  }, [activeTypeTab, selectedStatus, selectedDoctorId, searchQuery, dateFilter]);

  // Initial load & Filter change trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchBookings(1);
    }, 250);

    return () => clearTimeout(handler);
  }, [fetchBookings]);

  // Calculate Today's Appointments count
  const todayAppointmentsCount = useMemo(() => {
    let list = bookings;
    if (selectedDoctorId !== 'ALL') {
      list = list.filter((b) => {
        const docId = b.doctor?._id || b.doctor?.id || b.doctor?.name;
        return docId === selectedDoctorId || b.doctor?.name === selectedDoctorId;
      });
    }
    if (isTodaySelected) {
      return pagination.totalDocs || list.length;
    }
    return list.filter((b) => isToday(b.appointmentDate || b.date || b.createdAt)).length;
  }, [bookings, selectedDoctorId, isTodaySelected, pagination.totalDocs]);

  // Client-side Doctor Filter Application
  const displayedBookings = useMemo(() => {
    let list = bookings;
    if (selectedDoctorId !== 'ALL') {
      list = list.filter((b) => {
        const docId = b.doctor?._id || b.doctor?.id || b.doctor?.name;
        return docId === selectedDoctorId || b.doctor?.name === selectedDoctorId;
      });
    }
    return list;
  }, [bookings, selectedDoctorId]);

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
    <div className="min-h-screen text-slate-800 max-w-[1600px] mx-auto space-y-6 antialiased select-none text-left">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
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

        {/* Right Section: Today's Appointments Counter + Refresh Action */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Today's Appointments Stat Button / Quick Toggle */}
          <button
            type="button"
            onClick={() => setDateFilter((prev) => (prev === 'today' ? 'all' : 'today'))}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border transition-all cursor-pointer shadow-xs ${isTodaySelected
                ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md shadow-indigo-950/20 ring-2 ring-indigo-200'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
              }`}
            title="Click to toggle Today's appointments"
          >
            <div className={`p-2 rounded-xl ${isTodaySelected ? 'bg-white/20 text-white' : 'bg-indigo-50 text-[#3d3f96]'}`}>
              <Calendar size={18} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-black uppercase tracking-wider block ${isTodaySelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  Today Appointments
                </span>
                {todayAppointmentsCount > 0 && !isTodaySelected && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-black font-mono leading-none ${isTodaySelected ? 'text-white' : 'text-slate-900'}`}>
                  {todayAppointmentsCount}
                </span>
                <span className={`text-[10px] font-bold ${isTodaySelected ? 'text-indigo-200' : 'text-[#3d3f96]'}`}>
                  {isTodaySelected ? 'Showing Today' : 'Scheduled Today'}
                </span>
              </div>
            </div>
          </button>

          {/* Refresh List Button */}
          <button
            type="button"
            onClick={() => fetchBookings(pagination.currentPage)}
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span className="hidden sm:inline">Refresh List</span>
          </button>
        </div>
      </div>

      {/* --- REDESIGNED FILTER & SEARCH CONTROLS CARD --- */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">

        {/* ROW 1: Category Navigation Tabs (Left) & Unified Date Selector (Right) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-4">

          {/* Category Tabs */}
          <div className="inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 gap-1 overflow-x-auto max-w-full">
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
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${isSelected
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

          {/* Date Segmented Control: Today | All Dates | Calendar Date Picker */}
          <div className="inline-flex items-center p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70 gap-1 self-start xl:self-auto flex-wrap sm:flex-nowrap">
            {/* Today Button */}
            <button
              type="button"
              onClick={() => setDateFilter('today')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${isTodaySelected
                  ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <Sparkles size={13} />
              <span>Today</span>
            </button>

            {/* All Appointments Button */}
            <button
              type="button"
              onClick={() => setDateFilter('all')}
              className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-black rounded-xl transition-all cursor-pointer whitespace-nowrap ${isAllDatesSelected
                  ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
            >
              <Layers size={13} />
              <span>All Dates</span>
            </button>

            {/* Calendar Input Container */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all ${isCustomDate
                  ? 'bg-white border-[#3d3f96] ring-2 ring-indigo-100 text-[#3d3f96] shadow-xs'
                  : 'bg-white/80 border-slate-200/90 hover:bg-white text-slate-700'
                }`}
            >
              <Calendar size={13} className={isCustomDate ? "text-[#3d3f96]" : "text-slate-400"} />
              <input
                type="date"
                value={isCustomDate ? dateFilter : ''}
                onChange={(e) => {
                  if (e.target.value) {
                    setDateFilter(e.target.value);
                  }
                }}
                className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
                title="Pick custom date"
              />
              {isCustomDate && (
                <button
                  type="button"
                  onClick={() => setDateFilter('today')}
                  className="text-slate-400 hover:text-rose-500 cursor-pointer p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                  title="Reset to Today"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* ROW 2: Live Search Bar (Flex-1) + Doctor Dropdown + Status Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-0.5">

          {/* Search Input Bar */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by Booking ID, Patient Name, or Contact Phone Number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-[#3d3f96] focus:ring-2 focus:ring-indigo-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Doctor Filter Pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 w-full sm:w-auto shrink-0">
            <Stethoscope size={14} className="text-[#3d3f96]" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Doctor:</span>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL">All Doctors</option>
              {availableDoctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} {doc.speciality ? `(${doc.speciality})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Pill */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-2 w-full sm:w-auto shrink-0">
            <Filter size={14} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Pending">Pending</option>
              <option value="In-Progress">In-Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

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
      ) : displayedBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
          <div className="w-14 h-14 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-3">
            <Activity size={28} />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {selectedDoctorId !== 'ALL'
              ? "No Appointments Found For Selected Doctor"
              : isTodaySelected
                ? "No Appointments Found For Today"
                : isCustomDate
                  ? `No Appointments Found For ${dateFilter}`
                  : "No Clinic Records Found"}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm font-medium">
            {selectedDoctorId !== 'ALL'
              ? "This doctor does not have any appointments matching the current date, type, or status filters."
              : isTodaySelected
                ? "There are no appointments registered for today's date under the current filters."
                : isCustomDate
                  ? `There are no appointments registered for date ${dateFilter} under the current filters.`
                  : "No bookings match your current search criteria, category selection, or status filters."}
          </p>

          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            {selectedDoctorId !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedDoctorId('ALL')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Clear Doctor Filter
              </button>
            )}
            {!isTodaySelected && (
              <button
                type="button"
                onClick={() => setDateFilter('today')}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#3d3f96] rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Switch to Today
              </button>
            )}
            {!isAllDatesSelected && (
              <button
                type="button"
                onClick={() => setDateFilter('all')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Show All Appointments
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedBookings.map((item) => {
            const doctor = item.doctor || {};
            const doctorPhoto = getMediaUrl(doctor.profileImage) || DOC_PLACEHOLDER;
            const appointmentIsToday = isToday(item.appointmentDate);

            return (
              <div
                key={item._id}
                onClick={() => handleOpenDossier(item._id)}
                className={`bg-white rounded-3xl border shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden cursor-pointer group p-5 sm:p-6 flex flex-col justify-between gap-5 ${appointmentIsToday ? 'border-indigo-200/90 ring-1 ring-indigo-100' : 'border-slate-100'
                  }`}
              >
                {/* 1. Header Bar: Booking ID, Category Pill, Consultation Type, & Status */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 border border-slate-200/80 px-3 py-1 rounded-xl tracking-wider">
                      {item.bookingId}
                    </span>
                    {renderCategoryBadge(item.categoryTag, item.bookingType)}
                    {renderConsultationMode(item.consultationType)}

                    {/* Today Pill */}
                    {appointmentIsToday && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-indigo-600 text-white px-2.5 py-0.5 rounded-lg shadow-xs">
                        <Sparkles size={10} />
                        Today
                      </span>
                    )}
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
                  <div className={`md:col-span-4 space-y-1.5 p-3 rounded-2xl border ${appointmentIsToday ? 'bg-indigo-50/50 border-indigo-100' : 'bg-slate-50/80 border-slate-100'
                    }`}>
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 font-mono">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={13} className={appointmentIsToday ? "text-indigo-600 shrink-0" : "text-[#3d3f96] shrink-0"} />
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