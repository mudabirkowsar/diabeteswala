"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    FlaskConical,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Inbox,
    ChevronRight,
    ArrowRight,
    ReceiptText,
    Truck,
    Clock,
    Loader2,
    Sparkles,
    ChevronLeft,
    FileText,
    User,
    Users,
    ShieldCheck,
    Phone
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=300";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

const TAB_OPTIONS = [
    { key: "Active", label: "Active Bookings" },
    { key: "History", label: "Past History" }
];

export default function LabOrders() {
    const router = useRouter();
    const { showNotification } = useNotification();

    // --- State Management ---
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Active"); // 'Active' | 'History'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalBookings, setTotalBookings] = useState(0);

    // --- Fetch Bookings ---
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                tab: activeTab,
                page: currentPage,
                limit: 10
            };

            const response = await UserAPI.getUserLabBookings(params);
            if (response && response.success) {
                setBookings(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalBookings(response.total || response.count || 0);
            } else {
                if (showNotification) {
                    showNotification("Failed to load laboratory bookings.", "error");
                }
            }
        } catch (err) {
            console.error("Error retrieving lab bookings:", err);
            if (showNotification) {
                showNotification(err?.response?.data?.message || "Failed to retrieve diagnostic bookings.", "error");
            }
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, showNotification]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setCurrentPage(1);
    };

    // --- Helper: Diagnostic Status Badge ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'CONFIRMED';

        if (uppercase.includes('COMPLETED') || uppercase.includes('REPORT GENERATED')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={12} className="text-emerald-500" /> {status}
                </span>
            );
        }
        if (uppercase.includes('CANCELLED')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 shadow-xs">
                    <AlertCircle size={12} className="text-rose-500" /> Cancelled
                </span>
            );
        }
        if (uppercase.includes('SAMPLE') || uppercase.includes('TRANSIT') || uppercase.includes('WAY')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 shadow-xs animate-pulse">
                    <Truck size={12} className="text-amber-600" /> {status}
                </span>
            );
        }
        if (uppercase.includes('TESTING')) {
            return (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
                    <Sparkles size={12} className="text-[#3d3f96]" /> Testing in Progress
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50/80 px-3 py-1 rounded-full border border-indigo-200/60 shadow-xs">
                <Loader2 size={12} className="animate-spin text-[#3d3f96]" /> {status || 'Confirmed'}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left select-none max-w-[1200px] mx-auto py-4 px-3 sm:px-6">

            {/* --- TOP HEADER & TABS --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                        <FlaskConical className="text-[#3d3f96]" size={26} /> Diagnostic &amp; Lab Bookings
                    </h1>
                    <p className="text-xs font-semibold text-slate-400 mt-0.5">
                        Track home blood collection, diagnostic testing, and download verified digital pathology reports.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit">
                    {TAB_OPTIONS.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleTabChange(tab.key)}
                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === tab.key
                                    ? 'bg-white text-[#3d3f96] shadow-sm'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- LIST / LOADING / EMPTY STATES --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
                        <Loader2 className="animate-spin text-[#3d3f96]" size={28} />
                    </div>
                    <p className="text-xs font-black text-slate-700 uppercase tracking-widest">
                        Scanning Diagnostic Records...
                    </p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-1">
                        Fetching appointment schedules, phlebotomist transit, and lab report statuses
                    </p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 sm:p-20 text-center bg-white rounded-[2.5rem] border border-slate-100 shadow-sm border-dashed">
                    <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 mb-4 shadow-inner">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-base font-extrabold text-slate-800">No Diagnostic Bookings Found</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm font-medium leading-relaxed">
                        {activeTab === "Active"
                            ? "You do not have any active diagnostic lab tests in progress right now."
                            : "You have not completed any diagnostic lab tests with us yet."}
                    </p>
                    <button
                        onClick={() => router.push('/labs')}
                        className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2e3075] text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-950/10 cursor-pointer"
                    >
                        <FlaskConical size={14} />
                        <span>Book A Diagnostic Test</span>
                        <ArrowRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => {
                        const lab = booking.lab || {};
                        const labImg = getMediaUrl(lab.profileImage);
                        const isCompleted = booking.status?.toUpperCase()?.includes('COMPLETED');
                        const isCancelled = booking.status?.toUpperCase()?.includes('CANCELLED');

                        return (
                            <div
                                key={booking._id}
                                className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-5 group text-left relative overflow-hidden"
                            >
                                {/* Left Status Stripe */}
                                <div
                                    className={`absolute top-0 bottom-0 left-0 w-1.5 ${
                                        isCompleted
                                            ? 'bg-emerald-500'
                                            : isCancelled
                                            ? 'bg-rose-500'
                                            : 'bg-[#3d3f96]'
                                    }`}
                                />

                                {/* 1. Main Lab & Patient Identity */}
                                <div className="flex items-center gap-4 min-w-0 flex-1 pl-2">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0 shadow-xs">
                                        <img
                                            src={labImg}
                                            alt={lab.name || "Diagnostic Lab"}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = PLACEHOLDER_IMAGE;
                                            }}
                                        />
                                    </div>

                                    <div className="space-y-1.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[11px] font-black uppercase text-slate-800 font-mono tracking-wide">
                                                #{booking.bookingId}
                                            </span>
                                            <span className="text-slate-300">•</span>
                                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                                {booking.bookingType || 'Direct'}
                                            </span>
                                            {booking.isRapid && (
                                                <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md border border-amber-200">
                                                    Rapid
                                                </span>
                                            )}
                                            {booking.hasAnyReport && (
                                                <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                                                    <FileText size={10} /> Report Ready
                                                </span>
                                            )}
                                        </div>

                                        <h4 className="text-sm sm:text-base font-black text-slate-900 tracking-tight truncate group-hover:text-[#3d3f96] transition-colors">
                                            {lab.name || "Accredited Diagnostic Lab"}
                                        </h4>

                                        {/* Date, Time & Collection Type */}
                                        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-400 flex-wrap">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} /> {booking.appointmentDate ? new Date(booking.appointmentDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                            {booking.appointmentTime && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1 text-slate-600 font-bold">
                                                        <Clock size={12} className="text-[#3d3f96]" /> {booking.appointmentTime}
                                                    </span>
                                                </>
                                            )}
                                            <span>•</span>
                                            <span>{booking.collectionType || 'Home Collection'}</span>
                                        </div>

                                        {/* Patient & Tests Breakdown Preview */}
                                        <div className="text-[11px] text-slate-500 font-medium truncate max-w-lg flex items-center gap-1.5 flex-wrap">
                                            <span className="font-bold text-slate-700 flex items-center gap-1">
                                                <User size={11} className="text-[#3d3f96]" />
                                                {booking.patientsSummary?.primaryPatientName || 'Patient'}
                                                {booking.patientsSummary?.totalPatients > 1 && (
                                                    <span className="text-slate-400 font-normal">
                                                        (+{booking.patientsSummary.totalPatients - 1} more)
                                                    </span>
                                                )}:
                                            </span>
                                            <span className="text-slate-600">
                                                {booking.itemsSummary?.displayNames?.join(', ') || 'Diagnostic Tests'}
                                            </span>
                                            {booking.itemsSummary?.hasMore && (
                                                <span className="text-slate-400 font-bold">+more</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. Middle: Status & Payable Amount */}
                                <div className="flex items-center justify-between lg:justify-center gap-6 border-t lg:border-t-0 lg:border-x border-slate-100 pt-3 lg:pt-0 lg:px-8 shrink-0">
                                    <div className="space-y-1">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                            Booking Status
                                        </span>
                                        <div>{renderStatusBadge(booking.status)}</div>
                                    </div>

                                    <div className="space-y-0.5 text-right lg:text-left">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">
                                            Total Fee ({booking.paymentMethod || 'COD'})
                                        </span>
                                        <span className="font-mono font-black text-lg text-slate-900">
                                            ₹{booking.totalAmount || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* 3. Right: Action Navigation */}
                                <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/otherscreens/orders/laborderdetail/${booking.bookingId || booking._id}`)}
                                        className="w-full sm:w-auto bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-[10px] font-black uppercase tracking-wider px-5 py-3 rounded-2xl shadow-md shadow-indigo-950/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <ReceiptText size={13} />
                                        <span>Track &amp; View Reports</span>
                                        <ChevronRight size={13} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 px-2">
                            <span className="text-xs font-bold text-slate-400">
                                Page <strong className="text-slate-800">{currentPage}</strong> of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1 shadow-xs hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={14} /> Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 disabled:opacity-40 flex items-center gap-1 shadow-xs hover:bg-slate-50 cursor-pointer disabled:cursor-not-allowed"
                                >
                                    Next <ChevronRight size={14} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}