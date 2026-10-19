"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    HeartHandshake,
    Eye,
    CheckCircle2,
    Inbox,
    ChevronLeft,
    ChevronRight,
    X,
    Receipt,
    User,
    Calendar,
    Phone,
    Mail,
    Search,
    MapPin,
    Loader2,
    Star,
    CircleDot,
    CreditCard,
    Ban,
    Clock,
    Video,
    Building2,
    Tag,
    KeyRound,
    ShieldAlert,
    Info,
    DollarSign
} from "lucide-react";

import AdminAPI from "../../../../services/AdminAPI";
import CancelledCoachOrders from "./CancelledCoachOrders";

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.4:5002";

const getMediaUrl = (path) => {
    if (!path || typeof path !== "string") return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

const COACH_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop";

export default function CoachOrders() {
    // ----------------- STEP 1: COACHES DASHBOARD STATE -----------------
    const [coaches, setCoaches] = useState([]);
    const [loadingCoaches, setLoadingCoaches] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [coachTypeFilter, setCoachTypeFilter] = useState("");
    const [cityFilter, setCityFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCoaches, setTotalCoaches] = useState(0);

    // ----------------- CANCELLED ORDERS MODAL STATE -----------------
    const [showCancelledModal, setShowCancelledModal] = useState(false);

    // ----------------- STEP 2: COACH BOOKINGS HISTORY MODAL STATE -----------------
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [selectedCoach, setSelectedCoach] = useState(null);
    const [coachBookings, setCoachBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    const [bookingSearch, setBookingSearch] = useState("");
    const [bookingStatusFilter, setBookingStatusFilter] = useState("");
    const [bookingModeFilter, setBookingModeFilter] = useState("");
    const [bookingLocationFilter, setBookingLocationFilter] = useState("");
    const [bookingPage, setBookingPage] = useState(1);
    const [bookingTotalPages, setBookingTotalPages] = useState(1);
    const [totalCoachBookings, setTotalCoachBookings] = useState(0);

    // ----------------- STEP 3: SINGLE BOOKING DETAILS MODAL STATE -----------------
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const bookingsModalRef = useRef(null);
    const detailModalRef = useRef(null);

    // ========================================================
    // 1. FETCH ALL COACHES WITH BOOKING STATS (STEP 1)
    // ========================================================
    const fetchCoaches = useCallback(async () => {
        try {
            setLoadingCoaches(true);
            const params = {
                page: currentPage,
                limit: 10,
                ...(searchQuery.trim() && { search: searchQuery.trim() }),
                ...(coachTypeFilter && { coachType: coachTypeFilter }),
                ...(cityFilter.trim() && { city: cityFilter.trim() })
            };

            const response = await AdminAPI.getAdminCoachesWithBookingStats(params);

            if (response && response.success) {
                setCoaches(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalCoaches(response.totalCoaches || response.count || 0);
            } else {
                setCoaches([]);
            }
        } catch (error) {
            console.error("Error fetching coaches with stats:", error);
            setCoaches([]);
        } finally {
            setLoadingCoaches(false);
        }
    }, [currentPage, searchQuery, coachTypeFilter, cityFilter]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            fetchCoaches();
        }, 300);
        return () => clearTimeout(debounce);
    }, [fetchCoaches]);

    // ========================================================
    // 2. FETCH BOOKINGS OF SPECIFIC COACH (STEP 2)
    // ========================================================
    const fetchCoachBookings = useCallback(
        async (coachId, page = 1) => {
            if (!coachId) return;
            try {
                setBookingsLoading(true);
                const params = {
                    page: page,
                    limit: 10,
                    ...(bookingSearch.trim() && { search: bookingSearch.trim() }),
                    ...(bookingStatusFilter && { status: bookingStatusFilter }),
                    ...(bookingModeFilter && { consultationMode: bookingModeFilter }),
                    ...(bookingLocationFilter && { locationType: bookingLocationFilter })
                };

                const response = await AdminAPI.getAdminCoachBookingsByCoachId(coachId, params);

                if (response && response.success) {
                    setCoachBookings(response.data || []);
                    setBookingTotalPages(response.totalPages || 1);
                    setBookingPage(response.currentPage || 1);
                    setTotalCoachBookings(response.totalBookings || response.count || 0);
                    if (response.coach) {
                        setSelectedCoach((prev) => ({ ...prev, ...response.coach }));
                    }
                } else {
                    setCoachBookings([]);
                }
            } catch (error) {
                console.error("Error fetching coach bookings history:", error);
                setCoachBookings([]);
            } finally {
                setBookingsLoading(false);
            }
        },
        [bookingSearch, bookingStatusFilter, bookingModeFilter, bookingLocationFilter]
    );

    // Open Coach Bookings History Modal
    const handleOpenCoachBookings = (coach) => {
        setSelectedCoach(coach);
        setBookingSearch("");
        setBookingStatusFilter("");
        setBookingModeFilter("");
        setBookingLocationFilter("");
        setBookingPage(1);
        setShowBookingsModal(true);
        fetchCoachBookings(coach._id, 1);
    };

    // ========================================================
    // 3. FETCH SINGLE BOOKING DETAILS (STEP 3)
    // ========================================================
    const handleViewSingleBooking = async (bookingId) => {
        if (!bookingId) return;
        try {
            setDetailLoading(true);
            setShowDetailModal(true);
            const response = await AdminAPI.getAdminCoachBookingDetailsById(bookingId);
            if (response && response.success) {
                setSelectedBookingDetail(response.data);
            } else {
                setSelectedBookingDetail(null);
            }
        } catch (error) {
            console.error("Error fetching single coach booking details:", error);
            setSelectedBookingDetail(null);
        } finally {
            setDetailLoading(false);
        }
    };

    // Status Badge Helper
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case "confirmed":
            case "completed":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "in-progress":
                return "bg-blue-50 text-blue-700 border-blue-200";
            case "placed":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "cancelled":
                return "bg-rose-50 text-rose-700 border-rose-200";
            default:
                return "bg-slate-50 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="space-y-5 antialiased select-none text-left">
            {/* 1. TOP HEADER WITH CANCELLED BOOKINGS BUTTON & FILTERS */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                        <HeartHandshake className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-slate-900 tracking-tight">Diabetic Coaches &amp; Educators</h2>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> {totalCoaches} Registered
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-medium">
                            Monitor coach workload, patient consultation metrics, and booking audit trails
                        </p>
                    </div>
                </div>

                {/* Right Actions: Cancelled Orders Hub Button + Filters */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <button
                        onClick={() => setShowCancelledModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-black text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-xl transition-all shadow-xs cursor-pointer focus:outline-none"
                    >
                        <Ban className="w-4 h-4 text-rose-600" />
                        <span>Cancelled Bookings</span>
                    </button>

                    {/* Coach Type Filter */}
                    <select
                        value={coachTypeFilter}
                        onChange={(e) => {
                            setCoachTypeFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="text-xs font-semibold rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                    >
                        <option value="">All Coach Types</option>
                        <option value="Diabetes Educator">Diabetes Educator</option>
                        <option value="Diabetes Coach">Diabetes Coach</option>
                        <option value="Both">Both</option>
                    </select>

                    {/* City Filter */}
                    <div className="relative">
                        <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="City filter..."
                            value={cityFilter}
                            onChange={(e) => {
                                setCityFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-28 sm:w-32"
                        />
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search coach, phone, email..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-8.5 pr-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all w-48 sm:w-56"
                        />
                    </div>
                </div>
            </div>

            {/* 2. STEP 1: COACHES DATA TABLE WITH BOOKING STATS */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/70 border-b border-slate-100">
                                <th className="text-center px-5 py-4 w-14">Profile</th>
                                <th className="text-left px-5 py-4">Coach Info</th>
                                <th className="text-left px-5 py-4">Contact</th>
                                <th className="text-left px-5 py-4">Location &amp; Fees</th>
                                <th className="text-center px-5 py-4">Real-Time Booking Stats</th>
                                <th className="text-center px-5 py-4">Account Status</th>
                                <th className="text-center px-5 py-4 w-36">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loadingCoaches ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                                            <span className="text-xs font-bold text-slate-500">Loading diabetes coaches...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : coaches.length > 0 ? (
                                coaches.map((c) => {
                                    const coachImage = getMediaUrl(c.profileImage) || COACH_PLACEHOLDER;
                                    const stats = c.bookingStats || {};

                                    return (
                                        <tr key={c._id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Avatar */}
                                            <td className="px-5 py-4 text-center">
                                                <img
                                                    src={coachImage}
                                                    alt={c.name}
                                                    className="w-10 h-10 rounded-xl object-cover border border-slate-100 mx-auto shadow-xs"
                                                    onError={(e) => {
                                                        e.currentTarget.src = COACH_PLACEHOLDER;
                                                    }}
                                                />
                                            </td>

                                            {/* Coach Name & Qualification */}
                                            <td className="px-5 py-4">
                                                <div className="font-extrabold text-slate-900 text-sm">{c.name}</div>
                                                <div className="text-[11px] font-bold text-[#3D3F96] mt-0.5">
                                                    {c.qualification || "Diabetes Educator"}
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/50">
                                                        <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                                                        {c.rating || "5.0"}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded">
                                                        {c.coachType || "Both"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Contact */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-700 flex items-center gap-1.5">
                                                    <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
                                                </div>
                                                <div className="text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                    <Mail className="w-3 h-3 text-slate-400" /> {c.email || "N/A"}
                                                </div>
                                            </td>

                                            {/* Location & Fees */}
                                            <td className="px-5 py-4">
                                                <div className="font-bold text-slate-700 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3 text-rose-500" />
                                                    <span>{c.location?.city || "Mohali"}, {c.location?.state || "Punjab"}</span>
                                                </div>
                                                <div className="text-[10px] font-mono font-bold text-slate-500 mt-1 flex items-center gap-2">
                                                    <span>Online: ₹{c.fees?.online || 0}</span>
                                                    <span>&bull;</span>
                                                    <span>Offline: ₹{c.fees?.offline || 0}</span>
                                                </div>
                                            </td>

                                            {/* Real-Time Stats Chips */}
                                            <td className="px-5 py-4 text-center">
                                                <div className="inline-flex flex-wrap items-center justify-center gap-1.5 max-w-[210px]">
                                                    <span
                                                        title="Total Bookings"
                                                        className="text-[10px] font-mono font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200"
                                                    >
                                                        {stats.totalBookings || 0} Total
                                                    </span>
                                                    <span
                                                        title="Active Bookings"
                                                        className="text-[10px] font-mono font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200"
                                                    >
                                                        {stats.activeBookings || 0} Active
                                                    </span>
                                                    <span
                                                        title="Completed Sessions"
                                                        className="text-[10px] font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200"
                                                    >
                                                        {stats.completedBookings || 0} Done
                                                    </span>
                                                    <span
                                                        title="Cancelled Bookings"
                                                        className="text-[10px] font-mono font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200"
                                                    >
                                                        {stats.cancelledBookings || 0} Cancelled
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border ${c.isActive !== false
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                                        }`}
                                                >
                                                    <CircleDot className={`w-2.5 h-2.5 ${c.isActive !== false ? "text-emerald-500" : "text-slate-400"}`} />
                                                    {c.isActive !== false ? "ACTIVE" : "INACTIVE"}
                                                </span>
                                            </td>

                                            {/* View Bookings Action (Step 2 trigger) */}
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => handleOpenCoachBookings(c)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider bg-[#3D3F96]/10 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all focus:outline-none shadow-xs cursor-pointer"
                                                >
                                                    <Eye className="w-3.5 h-3.5" /> View Bookings
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2.5">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                <Inbox className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-xs font-bold text-slate-700">No Coaches Found</h4>
                                            <p className="text-[11px] text-slate-400">Try adjusting your search criteria or city filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* STEP 1 PAGINATION */}
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 flex-wrap gap-3">
                    <button
                        disabled={currentPage <= 1 || loadingCoaches}
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" /> Previous
                    </button>

                    <span className="text-xs font-extrabold text-slate-500">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage >= totalPages || loadingCoaches}
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        Next <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* ========================================================
          3. STEP 2: COACH BOOKINGS HISTORY MODAL
      ======================================================== */}
            {showBookingsModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
                    <div
                        ref={bookingsModalRef}
                        className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 shrink-0 bg-slate-50/70">
                            <div className="flex items-center gap-4">
                                <div className="w-13 h-13 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center shrink-0 border border-[#3D3F96]/20 shadow-xs">
                                    <Receipt className="w-6 h-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5">
                                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Coach Consultation Records</h3>
                                        <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] border border-[#3D3F96]/20">
                                            {totalCoachBookings} Total Sessions
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500 mt-1">
                                        <span>
                                            Coach: <strong className="text-slate-800 font-extrabold">{selectedCoach?.name}</strong>
                                        </span>
                                        <span>&bull;</span>
                                        <span className="text-[#3D3F96]">{selectedCoach?.qualification}</span>
                                        <span>&bull;</span>
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-3 h-3 text-slate-400" /> {selectedCoach?.phone}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowBookingsModal(false)}
                                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all focus:outline-none shadow-xs cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Filters */}
                        <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-3 shrink-0">
                            <div className="relative flex-1 min-w-[220px] max-w-md">
                                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search Booking ID, Patient Name, Phone..."
                                    value={bookingSearch}
                                    onChange={(e) => setBookingSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") fetchCoachBookings(selectedCoach?._id, 1);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {/* Status Filter */}
                                <select
                                    value={bookingStatusFilter}
                                    onChange={(e) => {
                                        setBookingStatusFilter(e.target.value);
                                        fetchCoachBookings(selectedCoach?._id, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Placed">Placed</option>
                                    <option value="Confirmed">Confirmed</option>
                                    <option value="In-Progress">In-Progress</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>

                                {/* Consultation Mode */}
                                <select
                                    value={bookingModeFilter}
                                    onChange={(e) => {
                                        setBookingModeFilter(e.target.value);
                                        fetchCoachBookings(selectedCoach?._id, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                                >
                                    <option value="">All Modes</option>
                                    <option value="Online">Online</option>
                                    <option value="Offline">Offline</option>
                                </select>

                                {/* Location Type */}
                                <select
                                    value={bookingLocationFilter}
                                    onChange={(e) => {
                                        setBookingLocationFilter(e.target.value);
                                        fetchCoachBookings(selectedCoach?._id, 1);
                                    }}
                                    className="text-xs font-bold rounded-xl px-3 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                                >
                                    <option value="">All Locations</option>
                                    <option value="Online">Online</option>
                                    <option value="Home">Home</option>
                                    <option value="Hospital">Hospital</option>
                                    <option value="Other">Other</option>
                                </select>

                                <button
                                    onClick={() => fetchCoachBookings(selectedCoach?._id, 1)}
                                    className="px-4 py-2 bg-[#3D3F96] hover:bg-[#2D2F75] text-white text-xs font-black rounded-xl transition-all shadow-xs cursor-pointer"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Modal Body - Bookings Table */}
                        <div className="overflow-y-auto flex-1 p-6 space-y-4">
                            <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                                <table className="w-full text-xs text-left align-middle">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                            <th className="px-5 py-4">Booking ID</th>
                                            <th className="px-5 py-4">Patient &amp; User</th>
                                            <th className="px-5 py-4">Schedule &amp; Mode</th>
                                            <th className="px-5 py-4">Location</th>
                                            <th className="px-5 py-4">Payment</th>
                                            <th className="px-5 py-4 text-center">Session OTP</th>
                                            <th className="px-5 py-4 text-center">Status</th>
                                            <th className="px-5 py-4 text-center w-28">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {bookingsLoading ? (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center gap-2.5">
                                                        <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                                                        <span className="text-xs font-bold text-slate-500">Loading consultation records...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : coachBookings.length > 0 ? (
                                            coachBookings.map((b) => {
                                                const isOnline = b.consultationMode?.toLowerCase() === "online";
                                                const patient = b.patient || {};
                                                const user = b.user || {};

                                                return (
                                                    <tr key={b._id} className="hover:bg-slate-50/60 transition-colors">
                                                        {/* Booking ID */}
                                                        <td className="px-5 py-4 align-top">
                                                            <span className="font-mono font-black text-sm text-[#3D3F96] block">
                                                                {b.bookingId}
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                                                                {b.bookingDate ? new Date(b.bookingDate).toLocaleDateString() : ""}
                                                            </span>
                                                        </td>

                                                        {/* Patient & User */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="font-extrabold text-slate-900 text-xs">
                                                                {patient.name || user.name || "Patient"}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                <Phone className="w-2.5 h-2.5 text-slate-400" /> {patient.phone || user.phone || "N/A"}
                                                            </div>
                                                            <div className="flex items-center gap-1.5 mt-1">
                                                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                                                    {patient.relation || patient.bookingFor || "Self"}
                                                                </span>
                                                                {patient.isDiabetic && (
                                                                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                                                                        {patient.diabetesType || "Diabetic"}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Schedule & Mode */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5 text-[#3D3F96]" />
                                                                <span>{b.scheduledDate}</span>
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5 mt-0.5">
                                                                <Clock className="w-3 h-3 text-amber-500" />
                                                                <span>{b.slotTime}</span>
                                                            </div>
                                                            <div className="mt-1">
                                                                <span
                                                                    className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded border ${isOnline
                                                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                                                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                        }`}
                                                                >
                                                                    {isOnline ? <Video className="w-2.5 h-2.5" /> : <Building2 className="w-2.5 h-2.5" />}
                                                                    <span>{b.consultationMode || "Offline"}</span>
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Location */}
                                                        <td className="px-5 py-4 align-top">
                                                            <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                                                {b.locationType || "Standard"}
                                                            </span>
                                                        </td>

                                                        {/* Payment */}
                                                        <td className="px-5 py-4 align-top">
                                                            <div className="font-mono font-black text-slate-900 text-xs">
                                                                ₹{b.totalPayable}
                                                            </div>
                                                            <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                                                                Mode: <strong className="text-slate-700">{b.paymentMethod || "COD"}</strong>
                                                            </div>
                                                            <span
                                                                className={`inline-block mt-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase border ${b.paymentStatus?.toLowerCase() === "paid"
                                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                                                    }`}
                                                            >
                                                                {b.paymentStatus || "Pending"}
                                                            </span>
                                                        </td>

                                                        {/* Session OTP */}
                                                        <td className="px-5 py-4 align-top text-center">
                                                            {b.sessionOtp ? (
                                                                <span className="font-mono font-black text-xs text-[#3D3F96] bg-[#3D3F96]/10 px-2 py-1 rounded-lg border border-[#3D3F96]/20">
                                                                    {b.sessionOtp}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-300">&mdash;</span>
                                                            )}
                                                        </td>

                                                        {/* Status */}
                                                        <td className="px-5 py-4 align-top text-center">
                                                            <span
                                                                className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusBadge(
                                                                    b.status
                                                                )}`}
                                                            >
                                                                {b.status || "Placed"}
                                                            </span>
                                                        </td>

                                                        {/* Inspect Action (Step 3) */}
                                                        <td className="px-5 py-4 align-top text-center">
                                                            <button
                                                                onClick={() => handleViewSingleBooking(b.bookingId || b._id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-100 hover:bg-[#3D3F96] hover:text-white transition-all text-slate-700 cursor-pointer"
                                                            >
                                                                <Info className="w-3 h-3" /> Inspect
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan={8} className="px-6 py-16 text-center text-slate-400 font-semibold">
                                                    No consultation records found matching filter criteria.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* STEP 2 MODAL FOOTER */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex-wrap gap-3">
                            <div className="flex items-center gap-3">
                                <button
                                    disabled={bookingPage <= 1 || bookingsLoading}
                                    onClick={() => fetchCoachBookings(selectedCoach?._id, bookingPage - 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                    <ChevronLeft className="w-3.5 h-3.5" /> Previous
                                </button>
                                <span className="text-xs font-extrabold text-slate-600">
                                    Page {bookingPage} of {bookingTotalPages}
                                </span>
                                <button
                                    disabled={bookingPage >= bookingTotalPages || bookingsLoading}
                                    onClick={() => fetchCoachBookings(selectedCoach?._id, bookingPage + 1)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                    Next <ChevronRight className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowBookingsModal(false)}
                                className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                            >
                                Close History
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          4. STEP 3: SINGLE BOOKING FULL DETAILS MODAL
      ======================================================== */}
            {showDetailModal && (
                <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-60 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-150">
                    <div
                        ref={detailModalRef}
                        className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/70">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold">
                                    <Receipt className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 tracking-tight font-mono">
                                        {selectedBookingDetail?.bookingId || "Booking Dossier"}
                                    </h4>
                                    <p className="text-[11px] font-semibold text-slate-500">
                                        Comprehensive Attending Details &amp; Location Audit
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto p-6 space-y-4 text-xs">
                            {detailLoading ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="w-7 h-7 text-[#3D3F96] animate-spin" />
                                    <span className="text-xs font-bold text-slate-400">Loading deep record...</span>
                                </div>
                            ) : selectedBookingDetail ? (
                                <>
                                    {/* OTP Banner */}
                                    {selectedBookingDetail.sessionOtp && selectedBookingDetail.status !== "Cancelled" && (
                                        <div className="p-3.5 bg-gradient-to-r from-indigo-500 to-[#3D3F96] text-white rounded-2xl flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <KeyRound className="w-4 h-4 text-indigo-200" />
                                                <span className="font-bold uppercase tracking-wider text-[11px]">Session PIN:</span>
                                            </div>
                                            <span className="font-mono text-xl font-black tracking-widest bg-white/20 px-3 py-0.5 rounded-lg">
                                                {selectedBookingDetail.sessionOtp}
                                            </span>
                                        </div>
                                    )}

                                    {/* Patient Details */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Patient Profile
                                        </span>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-slate-500 text-[11px]">Name:</span>
                                                <strong className="block text-slate-900 font-extrabold">
                                                    {selectedBookingDetail.patientDetails?.name || selectedBookingDetail.patient?.name}
                                                </strong>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-[11px]">Phone:</span>
                                                <span className="block font-mono font-bold text-slate-800">
                                                    {selectedBookingDetail.patientDetails?.phone || selectedBookingDetail.patient?.phone}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-[11px]">Age &amp; Gender:</span>
                                                <span className="block text-slate-800 font-semibold">
                                                    {selectedBookingDetail.patientDetails?.age || selectedBookingDetail.patient?.age || "N/A"} Yrs •{" "}
                                                    {selectedBookingDetail.patientDetails?.gender || selectedBookingDetail.patient?.gender}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-slate-500 text-[11px]">Diabetic Profile:</span>
                                                <span className="block font-bold text-emerald-700">
                                                    {selectedBookingDetail.patientDetails?.isDiabetic || selectedBookingDetail.patient?.isDiabetic
                                                        ? selectedBookingDetail.patientDetails?.diabetesType || "Diabetic"
                                                        : "Non-Diabetic"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Hospital or Physical Address */}
                                    {selectedBookingDetail.hospitalDetails && (
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">
                                                Hospital Bedside Information
                                            </span>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                <div>
                                                    <span className="text-slate-400 text-[10px]">Hospital</span>
                                                    <strong className="block text-slate-900">{selectedBookingDetail.hospitalDetails.hospitalName}</strong>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px]">Floor</span>
                                                    <span className="block text-slate-800">{selectedBookingDetail.hospitalDetails.floorNo}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px]">Ward</span>
                                                    <span className="block text-slate-800">{selectedBookingDetail.hospitalDetails.ward}</span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400 text-[10px]">Bed #</span>
                                                    <span className="block font-mono font-bold text-emerald-700">
                                                        {selectedBookingDetail.hospitalDetails.bedNo}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Pricing Breakdown */}
                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5 font-medium">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                                            Billing Summary
                                        </span>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Base Consultation Fee:</span>
                                            <span className="font-mono font-bold text-slate-900">
                                                ₹{selectedBookingDetail.pricing?.baseFee || selectedBookingDetail.totalPayable || 0}
                                            </span>
                                        </div>
                                        {selectedBookingDetail.pricing?.extraDistanceCharge > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Extra Distance Charge:</span>
                                                <span className="font-mono font-bold text-slate-900">
                                                    ₹{selectedBookingDetail.pricing.extraDistanceCharge}
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between pt-1 border-t border-slate-200/80 font-bold text-slate-900">
                                            <span>Total Payable:</span>
                                            <span className="font-mono text-sm font-black text-[#3D3F96]">
                                                ₹{selectedBookingDetail.pricing?.totalPayable || selectedBookingDetail.totalPayable}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-slate-400">Booking record not accessible.</div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-right">
                            <button
                                type="button"
                                onClick={() => setShowDetailModal(false)}
                                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-all cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================
          5. CANCELLED COACH ORDERS HUB MODAL
      ======================================================== */}
            {showCancelledModal && (
                <CancelledCoachOrders
                    isOpen={showCancelledModal}
                    onClose={() => setShowCancelledModal(false)}
                />
            )}
        </div>
    );
}