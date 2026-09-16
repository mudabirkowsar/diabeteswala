"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
    ChevronRight,
    ArrowUpRight
} from 'lucide-react';

import IndependentDoctorAPI from '../../../../services/IndependentDoctorAPI';

export default function DoctorAppointmentsPage() {
    const router = useRouter();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [consultationFilter, setConsultationFilter] = useState('');

    // Fetch All Assigned Bookings
    const fetchBookings = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (statusFilter) params.status = statusFilter;
            if (consultationFilter) params.consultationType = consultationFilter;

            const response = await IndependentDoctorAPI.getDoctorPatientBookings(params);

            if (response && response.success) {
                setBookings(response.data || []);
            } else {
                setBookings([]);
                toast.error(response?.message || "Failed to load appointments");
            }
        } catch (err) {
            console.error("Error fetching doctor bookings:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch appointments");
            setBookings([]);
        } finally {
            setLoading(false);
        }
    }, [statusFilter, consultationFilter]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    // Navigate to appointment detail page
    const handleNavigateToDetail = (appointmentId) => {
        if (!appointmentId) {
            toast.error("Appointment ID not found");
            return;
        }
        router.push(`/vendors/independentdoctor/dashboard/appointments/appointmentdetail/${appointmentId}`);
    };

    // Client-side search filtering
    const filteredBookings = useMemo(() => {
        if (!searchQuery.trim()) return bookings;
        const query = searchQuery.toLowerCase();
        return bookings.filter((item) => {
            const name = item?.patientDetails?.name?.toLowerCase() || '';
            const code = item?.appointmentInfo?.bookingId?.toLowerCase() || '';
            const phone = item?.patientDetails?.phone || '';
            const problem = item?.appointmentInfo?.problemDescription?.toLowerCase() || '';
            return name.includes(query) || code.includes(query) || phone.includes(query) || problem.includes(query);
        });
    }, [bookings, searchQuery]);

    // Badges helpers
    const getConsultationIcon = (type = '') => {
        const lower = type.toLowerCase();
        if (lower.includes('video') || lower.includes('tele')) return <Video size={14} className="text-purple-600" />;
        if (lower.includes('home')) return <Home size={14} className="text-amber-600" />;
        return <Building2 size={14} className="text-indigo-600" />;
    };

    const getStatusBadge = (status = '') => {
        const lower = status.toLowerCase();
        if (lower === 'confirmed') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> Confirmed
                </span>
            );
        }
        if (lower === 'pending') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock3 size={12} /> Pending
                </span>
            );
        }
        if (lower === 'cancelled') {
            return (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle size={12} /> Cancelled
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {status || 'Scheduled'}
            </span>
        );
    };

    return (
        <div className="min-h-screen text-slate-800">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600">Doctor Portal</span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                            <Stethoscope className="text-indigo-600" size={26} />
                            Patient Appointments
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Manage upcoming clinical visits, teleconsultations, and home medical orders
                        </p>
                    </div>

                    <button
                        onClick={fetchBookings}
                        disabled={loading}
                        className="inline-flex items-center gap-2 self-start sm:self-auto text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl transition border border-slate-200 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
                        Refresh Records
                    </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-100 shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                    {/* Search Input */}
                    <div className="sm:col-span-6 relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by patient name, booking ID (e.g. HK-303D75), phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="sm:col-span-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Pending">Pending</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Consultation Type Filter */}
                    <div className="sm:col-span-3">
                        <select
                            value={consultationFilter}
                            onChange={(e) => setConsultationFilter(e.target.value)}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition cursor-pointer"
                        >
                            <option value="">All Consultation Types</option>
                            <option value="Clinic Visit">In-Clinic Visit</option>
                            <option value="Video Consult">Video Teleconsult</option>
                            <option value="Home Visit">Home Visit</option>
                        </select>
                    </div>
                </div>

                {/* Appointments Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <RefreshCw className="animate-spin text-indigo-600 mb-3" size={32} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">Loading Appointments...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                            <Calendar size={26} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No Appointments Found</h3>
                        <p className="text-xs text-slate-400 max-w-sm">
                            There are no patient bookings matching your active search query or filter selection.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-5">Booking ID</th>
                                        <th className="py-3.5 px-5">Patient Info</th>
                                        <th className="py-3.5 px-5">Consultation Mode</th>
                                        <th className="py-3.5 px-5">Date &amp; Slot</th>
                                        <th className="py-3.5 px-5">Total Paid</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {filteredBookings.map((item, index) => {
                                        const apt = item?.appointmentInfo || {};
                                        const patient = item?.patientDetails || {};

                                        return (
                                            <tr
                                                key={apt.id || index}
                                                onClick={() => handleNavigateToDetail(apt.id)}
                                                className="hover:bg-indigo-50/40 transition cursor-pointer group"
                                            >
                                                {/* Booking ID */}
                                                <td className="py-4 px-5">
                                                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg text-[11px]">
                                                        {apt.bookingId || 'N/A'}
                                                    </span>
                                                </td>

                                                {/* Patient Summary */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <strong className="text-slate-900 block font-bold text-xs">
                                                            {patient.name || 'Anonymous Patient'}
                                                        </strong>
                                                        <span className="text-[11px] text-slate-400 block font-semibold mt-0.5">
                                                            {patient.gender ? `${patient.gender}, ` : ''}{patient.age ? `${patient.age} Yrs` : ''} • {patient.phone}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Consultation Type */}
                                                <td className="py-4 px-5">
                                                    <span className="inline-flex items-center gap-1.5 font-bold text-slate-700 text-xs">
                                                        {getConsultationIcon(apt.consultationType)}
                                                        <span>{apt.consultationType || apt.serviceType || 'Consultation'}</span>
                                                    </span>
                                                </td>

                                                {/* Highlighted Schedule (Date & Slot) */}
                                                <td className="py-4 px-5">
                                                    <div className="inline-flex flex-col gap-1 p-2 rounded-xl bg-gradient-to-r from-amber-50/80 to-indigo-50/80 border border-amber-200/70 shadow-2xs">
                                                        <div className="flex items-center gap-1.5 font-mono font-black text-slate-900 text-[11px]">
                                                            <Calendar size={13} className="text-indigo-600 shrink-0" />
                                                            <span>{apt.formattedDate || apt.date}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 font-mono font-bold text-amber-700 text-[11px]">
                                                            <Clock size={13} className="text-amber-600 shrink-0" />
                                                            <span className="bg-amber-100/70 px-1.5 py-0.2 rounded text-[10px] tracking-wide">
                                                                {apt.timeSlot || 'Slot TBD'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Price */}
                                                <td className="py-4 px-5">
                                                    <div>
                                                        <span className="font-mono font-black text-slate-900 text-xs">
                                                            ₹{item.totalPay ?? apt.price ?? 0}
                                                        </span>
                                                        <span className={`block text-[10px] font-bold ${apt.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {apt.paymentStatus || (apt.isPaid ? 'Paid' : 'Unpaid')}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-5">
                                                    {getStatusBadge(apt.status)}
                                                </td>

                                                {/* Details Action */}
                                                <td className="py-4 px-5 text-right">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNavigateToDetail(apt.id);
                                                        }}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-indigo-600 text-slate-600 group-hover:text-white transition shadow-2xs border border-slate-200/80 group-hover:border-indigo-600 text-[11px] font-bold cursor-pointer"
                                                    >
                                                        <span>View</span>
                                                        <ArrowUpRight size={13} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}