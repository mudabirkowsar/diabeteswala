"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar,
    Clock,
    BedDouble,
    CheckCircle2,
    Clock3,
    XCircle,
    RefreshCw,
    Search,
    ArrowUpRight,
    ChevronLeft,
    ChevronRight,
    Activity,
    CalendarCheck,
    Phone,
    Building2,
    LogOut,
    Stethoscope
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorIpdAppointmentsPage() {
    const router = useRouter();

    // Data & Pagination
    const [admissions, setAdmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Filters & Tabs
    // Tabs: 'all' | 'today' | 'active' | 'discharge-pending' | 'pending-acceptance' | 'history'
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('all');

    // Fetch IPD Admissions
    const fetchIpdAdmissions = useCallback(async () => {
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
            } else if (activeTab === 'discharge-pending') {
                params.status = 'Discharge-Pending';
            } else if (activeTab === 'history') {
                params.status = 'history';
            }

            // Dropdown overrides
            if (statusFilter) params.status = statusFilter;
            if (dateFilter && dateFilter !== 'all') params.date = dateFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();

            const response = await ClinicDoctorAPI.getClinicDoctorIpdAppointments(params);

            if (response && response.success) {
                let list = response.data || [];

                // Filter for doctor acceptance pending tab
                if (activeTab === 'pending-acceptance') {
                    list = list.filter(
                        (item) => item.doctorAcceptanceStatus === 'Pending' || item.canRespondToAssignment
                    );
                }

                setAdmissions(list);
                setTotalPages(response.totalPages || 1);
                setTotalDocs(response.totalDocs || list.length);
            } else {
                setAdmissions([]);
                toast.error(response?.message || "Failed to load IPD admissions roster");
            }
        } catch (err) {
            console.error("Error retrieving IPD admissions:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch IPD admissions");
            setAdmissions([]);
        } finally {
            setLoading(false);
        }
    }, [activeTab, statusFilter, dateFilter, searchQuery, currentPage]);

    useEffect(() => {
        fetchIpdAdmissions();
    }, [fetchIpdAdmissions]);

    // Handle Tab Change
    const handleTabChange = (tabKey) => {
        setActiveTab(tabKey);
        setCurrentPage(1);
    };

    // Navigate to Detail Page
    const handleNavigateToDetail = (mongoId) => {
        if (!mongoId) {
            toast.error("Admission ID not found");
            return;
        }
        router.push(`/vendors/clinicdoctor/dashboard/IPDAppointments/casedetail/${mongoId}`);
    };

    // Helper: Status Badges
    const getStatusBadge = (status = '') => {
        const lower = status.toLowerCase();
        if (['in-progress', 'confirmed'].includes(lower)) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <BedDouble size={12} /> {status}
                </span>
            );
        }
        if (lower.includes('discharge')) {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <LogOut size={12} /> {status}
                </span>
            );
        }
        if (lower === 'completed') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> Discharged
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
                {status || 'Admitted'}
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
                        <span className="text-xs font-black uppercase tracking-wider text-purple-600">
                            Clinic Doctor Panel
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                            <BedDouble className="text-purple-600" size={26} />
                            Inpatient Ward Admissions (IPD)
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Live ward bed roster, active inpatient stays, observation rounds, and discharge planning
                        </p>
                    </div>

                    <button
                        onClick={fetchIpdAdmissions}
                        disabled={loading}
                        className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-2.5 rounded-2xl transition border border-purple-200 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-purple-600" : ""} />
                        <span>Sync IPD Roster</span>
                    </button>
                </div>

                {/* 2. Top Filter Pills */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                    {[
                        { id: 'all', label: 'All Inpatients', icon: Activity, color: 'text-purple-600' },
                        { id: 'today', label: "Admitted Today", icon: CalendarCheck, color: 'text-blue-600' },
                        { id: 'active', label: 'Active In-Stay', icon: BedDouble, color: 'text-indigo-600' },
                        { id: 'discharge-pending', label: 'Discharge Pending', icon: LogOut, color: 'text-amber-600' },
                        { id: 'pending-acceptance', label: 'Awaiting Acceptance', icon: Clock3, color: 'text-rose-600' },
                        { id: 'history', label: 'Past Discharged', icon: CheckCircle2, color: 'text-slate-600' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                                    isSelected
                                        ? 'bg-purple-600 text-white border-purple-600 shadow-purple-100 ring-2 ring-purple-500/20'
                                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={14} className={isSelected ? 'text-white' : tab.color} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* 3. Search and Dropdown Filter Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    <div className="sm:col-span-6 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient, phone, booking ID, ward name, bed number..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                        />
                    </div>

                    <div className="sm:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="active">Active Cases</option>
                            <option value="In-Progress">In-Progress</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Discharge-Pending">Discharge-Pending</option>
                            <option value="Completed">Completed (Discharged)</option>
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
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition cursor-pointer"
                        >
                            <option value="all">All Dates</option>
                            <option value="today">Active Today</option>
                        </select>
                    </div>
                </div>

                {/* 4. IPD Admissions Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <RefreshCw className="animate-spin text-purple-600 mb-3" size={32} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Retrieving Inpatient Ward Records...
                        </span>
                    </div>
                ) : admissions.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500">
                            <BedDouble size={26} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No Inpatient Admissions Found</h3>
                        <p className="text-xs text-slate-400 max-w-sm">
                            No active ward stays or IPD admission records match your filter criteria.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-5">Admission Ref</th>
                                        <th className="py-3.5 px-5">Ward &amp; Bed Allocated</th>
                                        <th className="py-3.5 px-5">Patient Dossier</th>
                                        <th className="py-3.5 px-5">Stay Window &amp; Duration</th>
                                        <th className="py-3.5 px-5">Tariff &amp; Billing</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Dossier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {admissions.map((item) => {
                                        const patient = item?.patient || {};
                                        return (
                                            <tr
                                                key={item._id}
                                                onClick={() => handleNavigateToDetail(item._id)}
                                                className="hover:bg-purple-50/30 transition cursor-pointer group"
                                            >
                                                {/* Admission Ref */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1">
                                                        <span className="font-mono font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg text-[11px] block w-fit">
                                                            {item.bookingId}
                                                        </span>
                                                        {item.doctorAcceptanceStatus === 'Pending' && (
                                                            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                                                                Acceptance Pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Ward & Bed */}
                                                <td className="py-4 px-5">
                                                    <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-purple-50/70 border border-purple-200/70">
                                                        <div className="flex items-center gap-1 font-bold text-purple-900 text-[11px]">
                                                            <Building2 size={13} className="text-purple-600 shrink-0" />
                                                            <span className="truncate max-w-[150px]">{item.wardName || 'Ward Unassigned'}</span>
                                                        </div>
                                                        <span className="text-[10px] text-purple-700 font-mono font-bold">
                                                            Bed: {item.bedNumber || 'TBD'}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Patient Dossier */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <strong className="text-slate-900 block font-bold text-xs">
                                                            {patient.name || 'Admitted Inpatient'}
                                                        </strong>
                                                        <span className="text-[11px] text-slate-400 font-semibold block">
                                                            {patient.gender ? `${patient.gender}, ` : ''}{patient.age ? `${patient.age} Yrs` : ''}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-mono">
                                                            {patient.phone}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Stay Duration & Dates */}
                                                <td className="py-4 px-5">
                                                    <div className="space-y-1">
                                                        <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-slate-800 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                                                            <Calendar size={12} className="text-purple-600" />
                                                            <span>{item.startDate ? item.startDate.split('T')[0] : 'N/A'}</span>
                                                            <span className="text-slate-300">→</span>
                                                            <span>{item.endDate ? item.endDate.split('T')[0] : 'TBD'}</span>
                                                        </div>
                                                        <span className="text-[10px] text-purple-700 font-bold block font-mono">
                                                            Stay: {item.stayDuration || 1} Day(s) Booked
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Billing */}
                                                <td className="py-4 px-5">
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
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-purple-600 text-slate-600 group-hover:text-white transition shadow-2xs border border-slate-200/80 group-hover:border-purple-600 text-[11px] font-bold cursor-pointer"
                                                    >
                                                        <span>IPD Dossier</span>
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
                                    Page <strong className="text-slate-900 font-bold">{currentPage}</strong> of <strong className="text-slate-900 font-bold">{totalPages}</strong> ({totalDocs} Total)
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