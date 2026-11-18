"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
    BedDouble,
    AlertTriangle,
    Users,
    ChevronLeft,
    ChevronRight,
    Activity,
    HeartPulse,
    UserCheck
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorAppointmentsPage() {
    const router = useRouter();

    // Data & Pagination States
    const [bookings, setBookings] = useState([]);
    const [summary, setSummary] = useState({
        opdCount: 0,
        ipdCount: 0,
        emergencyCount: 0,
        pendingHandoversCount: 0,
        bedsideRequestsCount: 0
    });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Filter States
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Fetch paginated appointments list from Clinic Doctor API
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                tab: activeTab,
                page: currentPage,
                limit: 15
            };

            if (statusFilter) params.status = statusFilter;
            if (dateFilter && dateFilter !== 'all') params.date = dateFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const response = await ClinicDoctorAPI.getClinicDoctorAppointments(params);

            if (response && response.success) {
                setBookings(response.data || []);
                if (response.summary) setSummary(response.summary);
                setTotalPages(response.totalPages || 1);
                setTotalDocs(response.totalDocs || 0);
            } else {
                setBookings([]);
                toast.error(response?.message || "Failed to load clinical cases");
            }
        } catch (err) {
            console.error("Error retrieving clinic appointments:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch appointments");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, statusFilter, dateFilter, searchQuery, currentPage]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Handle Tab Switch (resets page to 1)
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setCurrentPage(1);
    };

    // Route to Detail using MongoDB _id
    const handleNavigateToDetail = (mongoId) => {
        if (!mongoId) {
            toast.error("Appointment ID not found");
            return;
        }
        router.push(`/vendors/clinicdoctor/dashboard/appointments/appointmentdetail/${mongoId}`);
    };

    // Helpers for Badges
    const getCategoryBadge = (tag = '', triage = null) => {
        const upper = tag.toUpperCase();
        if (upper === 'EMERGENCY' || triage === 'Emergency') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs">
                    <HeartPulse size={12} className="animate-pulse text-rose-600" /> Emergency
                </span>
            );
        }
        if (upper === 'IPD') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 shadow-2xs">
                    <BedDouble size={12} className="text-purple-600" /> IPD Admission
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
                <Activity size={12} className="text-blue-600" /> OPD Visit
            </span>
        );
    };

    const getConsultationIcon = (type = '') => {
        const lower = type.toLowerCase();
        if (lower.includes('video') || lower.includes('tele')) return <Video size={13} className="text-purple-600" />;
        if (lower.includes('home')) return <Home size={13} className="text-amber-600" />;
        return <Building2 size={13} className="text-indigo-600" />;
    };

    const getStatusBadge = (status = '') => {
        const lower = status.toLowerCase();
        if (['confirmed', 'in-progress'].includes(lower)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> {status}
                </span>
            );
        }
        if (['pending', 'clinic-pending'].includes(lower)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock3 size={12} /> {status}
                </span>
            );
        }
        if (lower.includes('cancel')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle size={12} /> Cancelled
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.8 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {status || 'Scheduled'}
            </span>
        );
    };

    return (
        <div className="min-h-screen text-slate-800 pb-16">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-5">

                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Clinic Doctor Panel</span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                            <Stethoscope className="text-indigo-600" size={26} />
                            Clinical Encounters &amp; Inpatient Roster
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Live management of OPD consultations, IPD ward admissions, triage emergencies, and bedside rounds
                        </p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl transition border border-slate-200 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
                        Sync Cases
                    </button>
                </div>

                {/* Dynamic Category Summary Metric Pills */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                    {[
                        { id: 'all', label: 'All Cases', count: totalDocs, icon: Activity, color: 'text-indigo-600' },
                        { id: 'opd', label: 'OPD Visits', count: summary.opdCount, icon: Stethoscope, color: 'text-blue-600' },
                        { id: 'ipd', label: 'IPD Admissions', count: summary.ipdCount, icon: BedDouble, color: 'text-purple-600' },
                        { id: 'emergency', label: 'Emergencies', count: summary.emergencyCount, icon: AlertTriangle, color: 'text-rose-600' },
                        { id: 'handover', label: 'Handovers', count: summary.pendingHandoversCount, icon: UserCheck, color: 'text-amber-600' },
                        { id: 'bedside', label: 'Bedside Teams', count: summary.bedsideRequestsCount, icon: Users, color: 'text-teal-600' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 ring-2 ring-indigo-500/20'
                                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                                    }`}
                            >
                                <Icon size={15} className={isSelected ? 'text-white' : tab.color} />
                                <span>{tab.label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-black font-mono leading-none ${isSelected
                                            ? 'bg-white/20 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                        }`}
                                >
                                    {tab.count || 0}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    {/* Search Input */}
                    <div className="sm:col-span-6 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, phone, booking ID, ward/bed..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Status Filter */}
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
                            <option value="active">Active Cases (Pending / In-Progress)</option>
                            <option value="history">Historical Cases (Completed / Cancelled)</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Date Filter */}
                    <div className="sm:col-span-3">
                        <select
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today's Schedule</option>
                        </select>
                    </div>
                </div>

                {/* Appointments Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <RefreshCw className="animate-spin text-indigo-600 mb-3" size={32} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">Retrieving Clinical Records...</span>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Calendar size={26} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No Patient Cases Found</h3>
                        <p className="text-xs text-slate-400 max-w-sm">
                            No matching clinical cases, admissions, or teleconsultations match your active criteria.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-5">Booking Ref</th>
                                        <th className="py-3.5 px-5">Category &amp; Mode</th>
                                        <th className="py-3.5 px-5">Patient Dossier</th>
                                        <th className="py-3.5 px-5">Schedule / Bed Location</th>
                                        <th className="py-3.5 px-5">Payment</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {bookings.map((item) => {
                                        const patient = item?.patient || {};
                                        const stay = item?.stayDetails || null;
                                        const payment = item?.payment || {};

                                        return (
                                            <tr
                                                key={item._id}
                                                onClick={() => handleNavigateToDetail(item._id)}
                                                className="hover:bg-indigo-50/40 transition cursor-pointer group"
                                            >
                                                {/* Booking ID with Handover Flag */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1">
                                                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-[11px] block w-fit">
                                                            {item.bookingId}
                                                        </span>
                                                        {item.assignmentMeta?.isPendingHandover && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                                                Handover Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Category & Consultation Mode */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1">
                                                        <div>{getCategoryBadge(item.categoryTag || item.bookingType, item.triageLevel)}</div>
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600">
                                                            {getConsultationIcon(item.consultationType)}
                                                            <span>{item.consultationType || 'Clinic Visit'}</span>
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Patient Info */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <strong className="text-slate-900 block font-bold text-xs">
                                                            {patient.name || 'Anonymous Patient'}
                                                        </strong>
                                                        <span className="text-[11px] text-slate-400 block font-semibold mt-0.5">
                                                            {patient.gender ? `${patient.gender}, ` : ''}{patient.age ? `${patient.age} Yrs` : ''}
                                                            {patient.bloodGroup ? ` • ${patient.bloodGroup}` : ''}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {patient.phone}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Schedule / Stay Details */}
                                                <td className="py-4 px-5">
                                                    {stay ? (
                                                        <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-purple-50/70 border border-purple-200/70 shadow-2xs">
                                                            <div className="flex items-center gap-1.5 font-bold text-purple-900 text-[11px]">
                                                                <BedDouble size={13} className="text-purple-600 shrink-0" />
                                                                <span>{stay.wardName}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1 text-[10px] text-purple-700 font-mono font-bold">
                                                                <span>Bed: {stay.bedNumber}</span>
                                                                <span>• {stay.stayDuration} Day(s)</span>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-gradient-to-r from-amber-50/80 to-indigo-50/80 border border-amber-200/70 shadow-2xs">
                                                            <div className="flex items-center gap-1.5 font-mono font-black text-slate-900 text-[11px]">
                                                                <Calendar size={13} className="text-indigo-600 shrink-0" />
                                                                <span>{item.appointmentDate || 'Today'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 font-mono font-bold text-amber-700 text-[11px]">
                                                                <Clock size={13} className="text-amber-600 shrink-0" />
                                                                <span className="bg-amber-100/70 px-1.5 py-0.2 rounded text-[10px]">
                                                                    {item.appointmentTime || 'Immediate'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Payment */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <span className="font-mono font-black text-slate-900 text-xs">
                                                            ₹{payment.totalAmount || 0}
                                                        </span>
                                                        <span className={`block text-[10px] font-bold ${payment.paymentStatus?.toLowerCase() === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {payment.paymentStatus || 'Unpaid'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-5">
                                                    {getStatusBadge(item.status)}
                                                </td>

                                                {/* Action View */}
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNavigateToDetail(item._id);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white transition shadow-2xs border border-slate-200/80 group-hover:border-indigo-600 text-[11px] font-bold cursor-pointer"
                                                    >
                                                        <span>Dossier</span>
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
                                    Showing Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong> ({totalDocs} Total)
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        disabled={currentPage <= 1}
                                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    >
                                        <ChevronLeft size={14} />
                                    </button>
                                    <button
                                        disabled={currentPage >= totalPages}
                                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                        className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
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