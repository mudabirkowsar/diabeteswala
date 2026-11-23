"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar,
    Clock,
    CheckCircle2,
    Clock3,
    XCircle,
    RefreshCw,
    Search,
    ArrowUpRight,
    BedDouble,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Activity,
    HeartPulse,
    Siren,
    Ambulance,
    CalendarCheck,
    Phone
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorEmergencyAppointmentsPage() {
    const router = useRouter();

    // Data & Pagination States
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Filter States
    // Tabs: 'all' | 'today' | 'active' | 'inbound-ambulance' | 'pending-acceptance' | 'history'
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Fetch Emergency Appointments
    const fetchEmergencyAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 15
            };

            // Map active tab to backend queries
            if (activeTab === 'today') {
                params.date = 'today';
            } else if (activeTab === 'active') {
                params.status = 'active';
            } else if (activeTab === 'history') {
                params.status = 'history';
            }

            // Dropdown overrides
            if (statusFilter) params.status = statusFilter;
            if (dateFilter && dateFilter !== 'all') params.date = dateFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const response = await ClinicDoctorAPI.getClinicDoctorEmergencyAppointments(params);

            if (response && response.success) {
                let list = response.data || [];

                // Filter for Inbound Ambulance or Pending Acceptance tabs
                if (activeTab === 'inbound-ambulance') {
                    list = list.filter((item) => item.hasAmbulance === true);
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
                toast.error(response?.message || "Failed to load emergency roster");
            }
        } catch (err) {
            console.error("Error retrieving emergency appointments:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch emergency appointments");
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, statusFilter, dateFilter, searchQuery, currentPage]);

    useEffect(() => {
        fetchEmergencyAppointments();
    }, [fetchEmergencyAppointments]);

    // Tab Switch Handler
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setCurrentPage(1);
    };

    // Route to Emergency Case Detail
    const handleNavigateToDetail = (mongoId) => {
        if (!mongoId) {
            toast.error("Case ID not found");
            return;
        }
        router.push(`/vendors/clinicdoctor/dashboard/emergencyappointments/casedetail/${mongoId}`);
    };

    // Helper: Status Badges
    const getStatusBadge = (status = '') => {
        const lower = status.toLowerCase();
        if (['confirmed', 'in-progress'].includes(lower)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> {status}
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
                {status || 'Active'}
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
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black uppercase tracking-wider text-rose-600 flex items-center gap-1">
                                <Siren size={14} className="animate-pulse" /> Emergency &amp; Trauma Triage
                            </span>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                            <HeartPulse className="text-rose-600" size={26} />
                            Code Red &amp; Emergency Encounters
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Live triage monitoring, ambulance dispatch sync, observation unit beds, and immediate clinical intakes
                        </p>
                    </div>

                    <button
                        onClick={fetchEmergencyAppointments}
                        disabled={loading}
                        className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 px-4 py-2.5 rounded-2xl transition border border-rose-200 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-rose-600" : ""} />
                        <span>Sync Trauma Roster</span>
                    </button>
                </div>

                {/* 2. Emergency Quick Filter Pills */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                    {[
                        { id: 'all', label: 'All Emergency Cases', icon: AlertTriangle, color: 'text-rose-600' },
                        { id: 'today', label: "Today's Intakes", icon: CalendarCheck, color: 'text-indigo-600' },
                        { id: 'active', label: 'Active Traumas', icon: Activity, color: 'text-red-600' },
                        { id: 'inbound-ambulance', label: 'Inbound Ambulances', icon: Ambulance, color: 'text-amber-600' },
                        { id: 'pending-acceptance', label: 'Awaiting Doctor Action', icon: Clock3, color: 'text-purple-600' },
                        { id: 'history', label: 'Past / Discharged', icon: CheckCircle2, color: 'text-slate-600' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                                    isSelected
                                        ? 'bg-rose-600 text-white border-rose-600 shadow-rose-100 ring-2 ring-rose-500/20'
                                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={14} className={isSelected ? 'text-white' : tab.color} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. Search and Dropdown Filter Strip */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    <div className="sm:col-span-6 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, phone, booking ID, ward/bed, incident reason..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition cursor-pointer"
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

                    <div className="sm:col-span-3">
                        <select
                            value={dateFilter}
                            onChange={(e) => {
                                setDateFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Today's Emergencies Only</option>
                        </select>
                    </div>
                </div>

                {/* 4. Emergency Appointments Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <RefreshCw className="animate-spin text-rose-600 mb-3" size={32} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Retrieving Emergency &amp; Trauma Logs...
                        </span>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                            <HeartPulse size={26} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No Emergency Encounters Active</h3>
                        <p className="text-xs text-slate-400 max-w-sm">
                            No emergency admissions or inbound trauma cases match your active filters.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-5">Emergency Ref</th>
                                        <th className="py-3.5 px-5">Triage &amp; Transit</th>
                                        <th className="py-3.5 px-5">Patient Dossier</th>
                                        <th className="py-3.5 px-5">Ward / Bed Allocation</th>
                                        <th className="py-3.5 px-5">Intake Schedule</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {appointments.map((item) => {
                                        const patient = item?.patient || {};
                                        return (
                                            <tr
                                                key={item._id}
                                                onClick={() => handleNavigateToDetail(item._id)}
                                                className="hover:bg-rose-50/30 transition cursor-pointer group"
                                            >
                                                {/* Ref & Acceptance */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1">
                                                        <span className="font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg text-[11px] block w-fit">
                                                            {item.bookingId}
                                                        </span>
                                                        {item.doctorAcceptanceStatus === 'Pending' && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                                                Acceptance Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Triage & Ambulance */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1.5">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                                            <Siren size={11} className="animate-pulse text-rose-600" />
                                                            {item.triageLevel || 'Emergency'}
                                                        </span>

                                                        {item.hasAmbulance && (
                                                            <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                                                                <Ambulance size={13} className="text-amber-600 shrink-0" />
                                                                <span>{item.ambulanceVehicleNumber || 'Dispatched'}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Patient Profile */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <strong className="text-slate-900 block font-bold text-xs">
                                                            {patient.name || 'Emergency Intake'}
                                                        </strong>
                                                        <span className="text-[11px] text-slate-400 font-semibold block">
                                                            {patient.gender ? `${patient.gender}, ` : ''}{patient.age ? `${patient.age} Yrs` : ''}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {patient.phone}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Bed & Ward Stay */}
                                                <td className="py-4 px-5">
                                                    {item.wardName ? (
                                                        <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-purple-50/70 border border-purple-200/70">
                                                            <div className="flex items-center gap-1 font-bold text-purple-900 text-[11px]">
                                                                <BedDouble size={13} className="text-purple-600 shrink-0" />
                                                                <span className="truncate max-w-[140px]">{item.wardName}</span>
                                                            </div>
                                                            <span className="text-[10px] text-purple-700 font-mono font-bold">
                                                                Bed: {item.bedNumber || 'Triage Area'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Bed Unassigned
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Intake Schedule & Complaint */}
                                                <td className="py-4 px-5 max-w-xs">
                                                    <div className="space-y-1">
                                                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                                                            <Calendar size={12} className="text-rose-600" />
                                                            <span>{item.appointmentDate || 'Today'}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <Clock size={12} className="text-amber-600" />
                                                            <span>{item.appointmentTime || 'Immediate'}</span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-600 line-clamp-1" title={item.reasonForVisit}>
                                                            {item.reasonForVisit || 'Acute emergency triage'}
                                                        </p>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-5">
                                                    {getStatusBadge(item.status)}
                                                </td>

                                                {/* Action */}
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNavigateToDetail(item._id);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-rose-600 text-slate-600 group-hover:text-white transition shadow-2xs border border-slate-200/80 group-hover:border-rose-600 text-[11px] font-bold cursor-pointer"
                                                    >
                                                        <span>Trauma Dossier</span>
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
                                    Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong> ({totalDocs} Cases)
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