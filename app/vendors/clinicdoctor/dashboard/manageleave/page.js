"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar,
    Clock3,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Search,
    Plus,
    CalendarDays,
    AlertCircle,
    FileText,
    X,
    Info,
    ChevronRight,
    UserCheck
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorLeavesPage() {
    // Data & Loading States
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Search States
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'
    const [searchQuery, setSearchQuery] = useState('');

    // Modal & Form States
    const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        startDate: '',
        endDate: '',
        reason: ''
    });

    // Helper: Compute tomorrow's date string in YYYY-MM-DD
    const tomorrowDateStr = useMemo(() => {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        return d.toISOString().split('T')[0];
    }, []);

    // Fetch Leaves History
    const fetchLeaves = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ClinicDoctorAPI.getClinicDoctorLeaves();
            if (response && response.success) {
                setLeaves(response.data || []);
            } else {
                setLeaves([]);
                toast.error(response?.message || "Failed to retrieve leave history");
            }
        } catch (err) {
            console.error("Error retrieving leaves:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to retrieve leaves");
            setLeaves([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaves();
    }, [fetchLeaves]);

    // Summary Metrics Calculation
    const summary = useMemo(() => {
        const counts = { all: leaves.length, pending: 0, approved: 0, rejected: 0 };
        leaves.forEach((item) => {
            const status = (item.status || '').toLowerCase();
            if (status === 'pending') counts.pending += 1;
            else if (status === 'approved') counts.approved += 1;
            else if (status === 'rejected') counts.rejected += 1;
        });
        return counts;
    }, [leaves]);

    // Client-side Filtered Leaves
    const filteredLeaves = useMemo(() => {
        return leaves.filter((item) => {
            const status = (item.status || '').toLowerCase();
            const matchesTab = activeTab === 'all' || status === activeTab;
            const matchesSearch =
                searchQuery.trim() === '' ||
                (item.reason && item.reason.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (item.rejectionReason && item.rejectionReason.toLowerCase().includes(searchQuery.toLowerCase())) ||
                status.includes(searchQuery.toLowerCase());

            return matchesTab && matchesSearch;
        });
    }, [leaves, activeTab, searchQuery]);

    // Handle Form Input Change
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };
            // If user adjusts startDate after endDate, keep endDate consistent
            if (name === 'startDate' && updated.endDate && updated.endDate < value) {
                updated.endDate = value;
            }
            return updated;
        });
    };

    // Calculate days duration in modal preview
    const calculateLeaveDays = () => {
        if (!formData.startDate || !formData.endDate) return null;
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays > 0 ? diffDays : null;
    };

    // Submit Leave Application
    const handleSubmitLeave = async (e) => {
        e.preventDefault();

        if (!formData.startDate || !formData.endDate || !formData.reason.trim()) {
            toast.error("Please fill out all required fields");
            return;
        }

        if (formData.startDate < tomorrowDateStr) {
            toast.error("Leave start date must be tomorrow or later");
            return;
        }

        if (formData.endDate < formData.startDate) {
            toast.error("End date cannot be prior to start date");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                startDate: formData.startDate,
                endDate: formData.endDate,
                reason: formData.reason.trim()
            };

            const res = await ClinicDoctorAPI.applyClinicDoctorLeave(payload);

            if (res && res.success) {
                toast.success(res.message || "Leave application submitted successfully!");
                setIsApplyModalOpen(false);
                setFormData({ startDate: '', endDate: '', reason: '' });
                fetchLeaves();
            } else {
                toast.error(res?.message || "Failed to submit leave application");
            }
        } catch (err) {
            console.error("Error submitting leave:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to submit leave application");
        } finally {
            setSubmitting(false);
        }
    };

    // Status Badge Component
    const getStatusBadge = (status = '') => {
        const lower = status.toLowerCase();
        if (lower === 'approved') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={12} /> Approved
                </span>
            );
        }
        if (lower === 'pending') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <Clock3 size={12} /> Pending Review
                </span>
            );
        }
        if (lower === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    <XCircle size={12} /> Rejected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                {status || 'Unknown'}
            </span>
        );
    };

    // Date formatting helper
    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen text-slate-800 pb-16">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-5">
                {/* Header Strip */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div>
                        <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                            Clinic Doctor Panel
                        </span>
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 mt-0.5">
                            <CalendarDays className="text-indigo-600" size={26} />
                            Leave Applications &amp; Rostering
                        </h1>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            Submit planned absence requests for clinic approval and track review status
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 self-start sm:self-auto">
                        <button
                            onClick={fetchLeaves}
                            disabled={loading}
                            className="inline-flex items-center gap-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-2xl transition border border-slate-200 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
                            Sync
                        </button>
                        <button
                            onClick={() => setIsApplyModalOpen(true)}
                            className="inline-flex items-center gap-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-2xl transition shadow-xs cursor-pointer"
                        >
                            <Plus size={15} />
                            Apply for Leave
                        </button>
                    </div>
                </div>

                {/* Summary Pills */}
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
                    {[
                        { id: 'all', label: 'All Requests', count: summary.all, icon: CalendarDays, color: 'text-indigo-600' },
                        { id: 'pending', label: 'Pending Review', count: summary.pending, icon: Clock3, color: 'text-amber-600' },
                        { id: 'approved', label: 'Approved', count: summary.approved, icon: CheckCircle2, color: 'text-emerald-600' },
                        { id: 'rejected', label: 'Rejected', count: summary.rejected, icon: XCircle, color: 'text-rose-600' }
                    ].map((tab) => {
                        const Icon = tab.icon;
                        const isSelected = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-full border text-xs font-bold transition whitespace-nowrap cursor-pointer shadow-xs ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100 ring-2 ring-indigo-500/20'
                                        : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                                }`}
                            >
                                <Icon size={15} className={isSelected ? 'text-white' : tab.color} />
                                <span>{tab.label}</span>
                                <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-black font-mono leading-none ${
                                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                                    }`}
                                >
                                    {tab.count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Search Bar */}
                <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by reason, remarks, or rejection details..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                        />
                    </div>
                </div>

                {/* Leaves Table */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm">
                        <RefreshCw className="animate-spin text-indigo-600 mb-3" size={32} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                            Retrieving Leave Applications...
                        </span>
                    </div>
                ) : filteredLeaves.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center flex flex-col items-center justify-center shadow-sm space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                            <CalendarDays size={26} />
                        </div>
                        <h3 className="text-sm font-black text-slate-800">No Leave Applications Found</h3>
                        <p className="text-xs text-slate-400 max-w-sm">
                            {searchQuery || activeTab !== 'all'
                                ? "No leave requests match your active filters or search terms."
                                : "You have not submitted any leave applications yet."}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-400">
                                        <th className="py-3.5 px-5">Leave Period</th>
                                        <th className="py-3.5 px-5">Duration</th>
                                        <th className="py-3.5 px-5">Reason &amp; Remarks</th>
                                        <th className="py-3.5 px-5">Applied On</th>
                                        <th className="py-3.5 px-5">Status</th>
                                        <th className="py-3.5 px-5 text-right">Review Details</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs font-medium">
                                    {filteredLeaves.map((item) => {
                                        const start = new Date(item.startDate);
                                        const end = new Date(item.endDate);
                                        const dayDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                                        const duration = dayDiff > 0 ? dayDiff : 1;

                                        return (
                                            <tr key={item._id} className="hover:bg-indigo-50/30 transition">
                                                {/* Leave Period */}
                                                <td className="py-4 px-5">
                                                    <div className="inline-flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 border border-slate-200/80 shadow-2xs font-mono font-bold text-slate-800 text-[11px]">
                                                        <Calendar size={13} className="text-indigo-600 shrink-0" />
                                                        <span>{formatDate(item.startDate)}</span>
                                                        <ChevronRight size={12} className="text-slate-400" />
                                                        <span>{formatDate(item.endDate)}</span>
                                                    </div>
                                                </td>

                                                {/* Duration */}
                                                <td className="py-4 px-5">
                                                    <span className="font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-[11px]">
                                                        {duration} {duration === 1 ? 'Day' : 'Days'}
                                                    </span>
                                                </td>

                                                {/* Reason */}
                                                <td className="py-4 px-5 max-w-xs">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-slate-900 line-clamp-2">
                                                            {item.reason}
                                                        </p>
                                                        {item.rejectionReason && (
                                                            <div className="flex items-start gap-1 text-[11px] text-rose-600 bg-rose-50 border border-rose-200 p-1.5 rounded-lg mt-1">
                                                                <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                                                <span><strong>Admin Note:</strong> {item.rejectionReason}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Applied On */}
                                                <td className="py-4 px-5">
                                                    <span className="text-[11px] text-slate-500 font-mono block">
                                                        {formatDateTime(item.appliedAt)}
                                                    </span>
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-5">
                                                    {getStatusBadge(item.status)}
                                                </td>

                                                {/* Review Timestamp */}
                                                <td className="py-4 px-5 text-right">
                                                    {item.reviewedAt ? (
                                                        <div className="text-[11px] text-slate-400 font-mono">
                                                            <span>Reviewed on</span>
                                                            <strong className="block text-slate-700 font-semibold">
                                                                {formatDate(item.reviewedAt)}
                                                            </strong>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[11px] text-slate-400 italic">
                                                            Awaiting Action
                                                        </span>
                                                    )}
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

            {/* Apply Leave Modal */}
            {isApplyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
                    <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                                    <CalendarDays size={20} />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-slate-900">Apply for Leave</h3>
                                    <p className="text-xs text-slate-400 font-medium">
                                        Future dates only (from tomorrow onwards)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsApplyModalOpen(false)}
                                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmitLeave} className="p-6 space-y-4">
                            {/* Rules Alert */}
                            <div className="flex items-start gap-2 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-[11px] text-indigo-900 font-medium">
                                <Info size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                <span>
                                    Requests cannot overlap with existing pending or approved dates. Please ensure emergency roster handovers are coordinated with clinic management.
                                </span>
                            </div>

                            {/* Date Picker Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                        Start Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        min={tomorrowDateStr}
                                        value={formData.startDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                        End Date <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        min={formData.startDate || tomorrowDateStr}
                                        value={formData.endDate}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                                    />
                                </div>
                            </div>

                            {/* Calculated Duration Banner */}
                            {calculateLeaveDays() && (
                                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                                    <span className="text-slate-500 font-medium">Estimated Absence:</span>
                                    <span className="font-mono font-black text-indigo-600">
                                        {calculateLeaveDays()} {calculateLeaveDays() === 1 ? 'Day' : 'Days'}
                                    </span>
                                </div>
                            )}

                            {/* Reason for Leave */}
                            <div>
                                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                    Reason for Leave <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    name="reason"
                                    rows={3}
                                    placeholder="Explain the purpose of the leave (e.g., Medical Conference, Personal Emergency)..."
                                    value={formData.reason}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition resize-none"
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setIsApplyModalOpen(false)}
                                    disabled={submitting}
                                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {submitting && <RefreshCw size={13} className="animate-spin" />}
                                    <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}