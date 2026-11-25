"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar,
    Clock,
    Video,
    Home,
    Building2,
    CheckCircle2,
    Clock3,
    XCircle,
    RefreshCw,
    Search,
    Stethoscope,
    ArrowUpRight,
    Users,
    ChevronLeft,
    ChevronRight,
    Activity,
    CalendarCheck,
    Hash,
    DoorOpen,
    SkipForward,
    AlertTriangle,
    BellRing,
    Check
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorOpdAppointmentsPage() {
    const router = useRouter();

    // Data & Pagination
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Filters & Tabs
    // Tabs: 'all' | 'today' | 'active' | 'skipped' | 'bedside' | 'pending-acceptance' | 'history'
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('all');
    const [skippedFilter, setSkippedFilter] = useState(''); // '' | 'false' | 'true'

    // Fetch paginated OPD appointments (Token Queue + Skip Status)
    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 15
            };

            // Map top tabs to backend parameters
            if (activeTab === 'today') {
                params.date = 'today';
            } else if (activeTab === 'active') {
                params.status = 'active';
            } else if (activeTab === 'history') {
                params.status = 'history';
            } else if (activeTab === 'skipped') {
                params.skipped = 'true';
            }

            // Dropdown filters override if set
            if (statusFilter) params.status = statusFilter;
            if (dateFilter && dateFilter !== 'all') params.date = dateFilter;
            if (skippedFilter) params.skipped = skippedFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const response = await ClinicDoctorAPI.getClinicDoctorOpdAppointments(params);

            if (response && response.success) {
                let list = response.data || [];

                // Filter for Bedside Specialist / Pending Acceptance tabs if selected
                if (activeTab === 'bedside') {
                    list = list.filter((item) => item.isBedsideSpecialist === true);
                } else if (activeTab === 'pending-acceptance') {
                    list = list.filter(
                        (item) => item.doctorAcceptanceStatus === 'Pending' || item.canRespondToAssignment
                    );
                }

                setAppointments(list);
                setTotalPages(response.totalPages || 1);
                setTotalDocs(response.totalDocs || list.length);
            } else {
                setAppointments([]);
                toast.error(response?.message || 'Failed to load OPD appointments');
            }
        } catch (err) {
            console.error('Error retrieving OPD appointments:', err);
            toast.error(err?.response?.data?.message || err.message || 'Failed to fetch OPD appointments');
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, statusFilter, dateFilter, skippedFilter, searchQuery, currentPage]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    // Derive Live OPD Token & Queue Summary from queueInfo
    const queueSummary = useMemo(() => {
        const tokenItems = appointments.filter(
            (item) => item?.queueInfo?.hasToken || item?.formattedToken || item?.tokenNumber
        );
        const sampleQueue = tokenItems.find((item) => item?.queueInfo)?.queueInfo || {};

        const inProgressItem = appointments.find(
            (item) => (item.status || '').toLowerCase() === 'in-progress'
        );

        const nextInQueueItem =
            appointments.find(
                (item) =>
                    sampleQueue.nextInQueueToken &&
                    (item.formattedToken === sampleQueue.nextInQueueToken ||
                        item?.queueInfo?.formattedToken === sampleQueue.nextInQueueToken)
            ) ||
            appointments.find(
                (item) =>
                    !item.isTokenSkipped &&
                    ['confirmed', 'pending'].includes((item.status || '').toLowerCase())
            );

        const skippedCount = appointments.filter((item) => item.isTokenSkipped).length;
        const opdRoomNumber =
            sampleQueue.opdRoomNumber || tokenItems[0]?.opdRoomNumber || null;

        return {
            hasQueueData: tokenItems.length > 0,
            opdRoomNumber,
            currentServingToken:
                sampleQueue.currentServingToken ||
                inProgressItem?.formattedToken ||
                null,
            nextInQueueToken:
                sampleQueue.nextInQueueToken ||
                nextInQueueItem?.formattedToken ||
                null,
            nextInQueueItem,
            totalTokensToday: sampleQueue.totalTokensToday ?? tokenItems.length,
            completedTokensCount: sampleQueue.completedTokensCount ?? 0,
            skippedCount
        };
    }, [appointments]);

    // Navigate to Case Dossier Details
    const handleNavigateToDetail = (appointmentId) => {
        if (!appointmentId) {
            toast.error('Invalid appointment record');
            return;
        }
        router.push(`/vendors/clinicdoctor/dashboard/OPDAppointments/casedetail/${appointmentId}`);
    };

    // Tab Switch Handler
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        if (tabKey !== 'skipped' && skippedFilter === 'true') {
            setSkippedFilter('');
        }
        setCurrentPage(1);
    };

    // Helper: Format token display
    const getFormattedToken = (item) => {
        if (item?.formattedToken) return item.formattedToken;
        if (item?.queueInfo?.formattedToken) return item.queueInfo.formattedToken;
        if (item?.tokenNumber !== undefined && item?.tokenNumber !== null) {
            return String(item.tokenNumber).padStart(3, '0');
        }
        return null;
    };

    // Helper: Format timestamp for skippedAt
    const formatShortTime = (isoDate) => {
        if (!isoDate) return '';
        try {
            return new Date(isoDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    // Helper: Mode Icon
    const getConsultationIcon = (type = '') => {
        const lower = type.toLowerCase();
        if (lower.includes('video') || lower.includes('tele')) return <Video size={13} className="text-purple-600" />;
        if (lower.includes('home')) return <Home size={13} className="text-amber-600" />;
        return <Building2 size={13} className="text-indigo-600" />;
    };

    // Helper: Status Badges
    const getStatusBadge = (status = '') => {
        const lower = status.toLowerCase();
        if (lower === 'in-progress') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    In Cabin
                </span>
            );
        }
        if (lower === 'confirmed') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> {status}
                </span>
            );
        }
        if (lower === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    <Check size={12} /> Completed
                </span>
            );
        }
        if (['pending', 'clinic-pending'].includes(lower)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock3 size={12} /> {status}
                </span>
            );
        }
        if (lower.includes('cancel')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle size={12} /> {status}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {status || 'Scheduled'}
            </span>
        );
    };

    return (
        <div className="min-h-screen text-slate-800 pb-16">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* 1. Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                            Clinic Doctor Panel
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                            <Stethoscope className="text-indigo-600" size={26} />
                            OPD Token Queue &amp; Case Encounters
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Token-wise OPD appointments, live queue status, cabin assignments, and patient case dossiers
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        {queueSummary.nextInQueueItem && (
                            <button
                                type="button"
                                onClick={() => handleNavigateToDetail(queueSummary.nextInQueueItem._id)}
                                className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl transition shadow-sm cursor-pointer"
                            >
                                <BellRing size={14} />
                                <span>
                                    Call Next #{getFormattedToken(queueSummary.nextInQueueItem) || 'Patient'}
                                </span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={fetchAppointments}
                            disabled={loading}
                            className="inline-flex items-center gap-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl transition border border-slate-200 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? 'animate-spin text-indigo-600' : ''} />
                            <span>Sync OPD</span>
                        </button>
                    </div>
                </div>

                {/* 1.5 Live OPD Queue & Cabin Summary Strip */}
                {queueSummary.hasQueueData && (
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Assigned Cabin
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <DoorOpen size={18} className="text-indigo-600" />
                                <span className="text-base font-black text-slate-900">
                                    {queueSummary.opdRoomNumber || 'OPD Cabin'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                                Now Serving
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Hash size={17} className="text-emerald-600" />
                                <span className="text-lg font-mono font-black text-emerald-800">
                                    {queueSummary.currentServingToken || 'None'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 block">
                                Next in Queue
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <Hash size={17} className="text-indigo-600" />
                                <span className="text-lg font-mono font-black text-indigo-900">
                                    {queueSummary.nextInQueueToken || '—'}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                Completed / Total
                            </span>
                            <div className="flex items-baseline gap-1 mt-1.5">
                                <span className="text-lg font-mono font-black text-slate-900">
                                    {queueSummary.completedTokensCount}
                                </span>
                                <span className="text-xs font-bold text-slate-400">
                                    / {queueSummary.totalTokensToday} tokens
                                </span>
                            </div>
                        </div>

                        <div className="col-span-2 sm:col-span-1 bg-amber-50/70 p-4 rounded-2xl border border-amber-100 shadow-xs">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 block">
                                Skipped in View
                            </span>
                            <div className="flex items-center gap-2 mt-1.5">
                                <SkipForward size={17} className="text-amber-600" />
                                <span className="text-lg font-mono font-black text-amber-800">
                                    {queueSummary.skippedCount}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. Top Category & Bedside Specialist Filter Pills */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                    {[
                        { id: 'all', label: 'All OPD Visits', icon: Activity, color: 'text-indigo-600' },
                        { id: 'today', label: "Today's Queue", icon: CalendarCheck, color: 'text-blue-600' },
                        { id: 'active', label: 'Active Encounters', icon: Stethoscope, color: 'text-emerald-600' },
                        { id: 'skipped', label: 'Skipped Tokens', icon: SkipForward, color: 'text-amber-600' },
                        { id: 'bedside', label: 'Bedside Cross-Consults', icon: Users, color: 'text-purple-600' },
                        { id: 'pending-acceptance', label: 'Awaiting Acceptance', icon: Clock3, color: 'text-orange-600' },
                        { id: 'history', label: 'Historical Visits', icon: CheckCircle2, color: 'text-slate-600' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 ring-2 ring-indigo-500/20'
                                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={14} className={isSelected ? 'text-white' : tab.color} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. Filter & Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    <div className="sm:col-span-5 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by token (001), patient name, phone, booking ID, symptoms..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active Cases</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="history">Historical Cases</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <select
                            value={skippedFilter}
                            onChange={(e) => {
                                setSkippedFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="">All Tokens</option>
                            <option value="false">Unskipped Queue</option>
                            <option value="true">Skipped Only</option>
                        </select>
                    </div>

                    <div className="sm:col-span-2">
                        <select
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today&apos;s Visits Only</option>
                        </select>
                    </div>
                </div>

                {/* 4. Token-Wise OPD Appointments Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <RefreshCw className="animate-spin text-indigo-600 mb-3" size={32} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Loading OPD Token Queue...
                        </span>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Calendar size={26} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No OPD Encounters Found</h3>
                        <p className="text-xs text-slate-400 max-w-sm">
                            No token or appointment records match your criteria or active filter category.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-5">Token &amp; Cabin</th>
                                        <th className="py-3.5 px-5">Booking &amp; Mode</th>
                                        <th className="py-3.5 px-5">Patient Dossier</th>
                                        <th className="py-3.5 px-5">Slot, Wait &amp; Reason</th>
                                        <th className="py-3.5 px-5">Fee &amp; Payment</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {appointments.map((item) => {
                                        const patient = item?.patient || {};
                                        const queue = item?.queueInfo || {};
                                        const tokenStr = getFormattedToken(item);
                                        const roomNumber = item.opdRoomNumber || queue.opdRoomNumber;
                                        const statusLower = (item.status || '').toLowerCase();
                                        const isInProgress = statusLower === 'in-progress';
                                        const isCompleted = statusLower === 'completed';
                                        const isCancelled = statusLower.includes('cancel');
                                        const isNextInQueue =
                                            !item.isTokenSkipped &&
                                            tokenStr &&
                                            queueSummary.nextInQueueToken === tokenStr &&
                                            !isInProgress;

                                        return (
                                            <tr
                                                key={item._id}
                                                onClick={() => handleNavigateToDetail(item._id)}
                                                className={`transition cursor-pointer group ${
                                                    isInProgress
                                                        ? 'bg-emerald-50/40 hover:bg-emerald-50/70'
                                                        : item.isTokenSkipped
                                                        ? 'bg-amber-50/25 hover:bg-amber-50/50'
                                                        : 'hover:bg-indigo-50/40'
                                                }`}
                                            >
                                                {/* Token & Cabin */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-1.5">
                                                        {tokenStr ? (
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span
                                                                    className={`inline-flex items-center gap-1 font-mono font-black text-sm px-2.5 py-1 rounded-xl border ${
                                                                        isInProgress
                                                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                                                            : item.isTokenSkipped
                                                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                                            : isNextInQueue
                                                                            ? 'bg-indigo-600 text-white border-indigo-600'
                                                                            : 'bg-slate-100 text-slate-900 border-slate-200'
                                                                    }`}
                                                                >
                                                                    <Hash size={12} />
                                                                    {tokenStr}
                                                                </span>

                                                                {isNextInQueue && (
                                                                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                                                                        Next
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-[11px] font-bold text-slate-400">
                                                                No Token
                                                            </span>
                                                        )}

                                                        {roomNumber && (
                                                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                                                                <DoorOpen size={12} className="text-indigo-500" />
                                                                <span>{roomNumber}</span>
                                                            </div>
                                                        )}

                                                        {item.isTokenSkipped && (
                                                            <div className="space-y-0.5 max-w-[180px]">
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100/80 border border-amber-200 px-2 py-0.5 rounded-md">
                                                                    <AlertTriangle size={10} />
                                                                    Skipped
                                                                    {item.tokenSkipCount > 1 ? ` (x${item.tokenSkipCount})` : ''}
                                                                    {item.tokenSkippedAt
                                                                        ? ` • ${formatShortTime(item.tokenSkippedAt)}`
                                                                        : ''}
                                                                </span>
                                                                {item.tokenSkipReason && (
                                                                    <p
                                                                        className="text-[10px] text-amber-700 font-medium leading-snug line-clamp-2"
                                                                        title={item.tokenSkipReason}
                                                                    >
                                                                        {item.tokenSkipReason}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Booking ID, Mode & Acceptance */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="space-y-1.5">
                                                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg text-[11px] block w-fit">
                                                            {item.bookingId}
                                                        </span>

                                                        {item.isDoctorSelectedAlready && (
                                                            <span className="text-[9px] font-bold text-slate-400 block">
                                                                Direct Selection
                                                            </span>
                                                        )}

                                                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                                            {getConsultationIcon(item.consultationType)}
                                                            <span>{item.consultationType || 'Clinic Visit'}</span>
                                                        </span>

                                                        <div>
                                                            {item.doctorAcceptanceStatus === 'Accepted' ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                                    <CheckCircle2 size={10} /> Accepted
                                                                </span>
                                                            ) : item.doctorAcceptanceStatus === 'Pending' ? (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                                    <Clock3 size={10} /> Awaiting Response
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                                                    <XCircle size={10} /> {item.doctorAcceptanceStatus || 'None'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Patient Details */}
                                                <td className="py-4 px-5 align-top">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs shrink-0 overflow-hidden">
                                                            {patient.profilePic ? (
                                                                <img
                                                                    src={patient.profilePic}
                                                                    alt={patient.name}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                patient.name?.charAt(0) || 'P'
                                                            )}
                                                        </div>
                                                        <div>
                                                            <strong className="text-slate-900 block font-bold text-xs">
                                                                {patient.name || 'Anonymous Patient'}
                                                            </strong>
                                                            <span className="text-[11px] text-slate-400 font-semibold block">
                                                                {patient.gender ? `${patient.gender}, ` : ''}
                                                                {patient.age ? `${patient.age} Yrs` : ''}
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-mono">
                                                                {patient.phone}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Appointment Slot, Queue ETA & Reason */}
                                                <td className="py-4 px-5 max-w-xs align-top">
                                                    <div className="space-y-1.5">
                                                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                                                            <Calendar size={11} className="text-indigo-600" />
                                                            <span>{item.appointmentDate || 'Today'}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <Clock size={11} className="text-amber-600" />
                                                            <span className="text-amber-700">{item.appointmentTime || 'N/A'}</span>
                                                        </div>

                                                        <p
                                                            className="text-[11px] text-slate-600 font-medium line-clamp-2"
                                                            title={item.reasonForVisit}
                                                        >
                                                            {item.reasonForVisit || 'General Clinical Consultation'}
                                                        </p>

                                                        {(queue.expectedCallTime || queue.estimatedWaitText) && !isCompleted && !isCancelled && (
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                                {queue.expectedCallTime && (
                                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">
                                                                        ETA: {queue.expectedCallTime}
                                                                    </span>
                                                                )}
                                                                {queue.estimatedWaitText && (
                                                                    <span>Wait: {queue.estimatedWaitText}</span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Fee & Payment */}
                                                <td className="py-4 px-5 align-top">
                                                    <div>
                                                        <span className="font-mono font-black text-slate-900 text-xs">
                                                            ₹{item.totalAmount || 0}
                                                        </span>
                                                        <span
                                                            className={`block text-[10px] font-bold ${
                                                                (item.paymentStatus || '').toLowerCase() === 'paid'
                                                                    ? 'text-emerald-600'
                                                                    : 'text-amber-600'
                                                            }`}
                                                        >
                                                            {item.paymentStatus || 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-5 align-top">
                                                    {getStatusBadge(item.status)}
                                                </td>

                                                {/* Action: Call in Cabin / View All Details */}
                                                <td className="py-4 px-5 text-right align-top">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNavigateToDetail(item._id);
                                                        }}
                                                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition shadow-2xs text-[11px] font-bold cursor-pointer whitespace-nowrap ${
                                                            !isCompleted && !isCancelled
                                                                ? 'bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-600'
                                                                : 'bg-slate-100 group-hover:bg-indigo-600 text-slate-700 group-hover:text-white border border-slate-200/80 group-hover:border-indigo-600'
                                                        }`}
                                                    >
                                                        {!isCompleted && !isCancelled ? (
                                                            <>
                                                                <DoorOpen size={13} />
                                                                <span>Call in Cabin</span>
                                                            </>
                                                        ) : (
                                                            <span>View Details</span>
                                                        )}
                                                        <ArrowUpRight size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Strip */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-100 text-xs">
                                <span className="text-slate-500 font-medium">
                                    Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of{' '}
                                    <strong className="text-slate-900 font-bold">{totalPages}</strong> ({totalDocs} Total)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        type="button"
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                                    >
                                        <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}