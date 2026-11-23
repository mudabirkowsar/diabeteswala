"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    FaCalendarTimes,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaSearch,
    FaSpinner,
    FaExclamationCircle,
    FaChevronLeft,
    FaChevronRight,
    FaUserMd,
    FaBan,
    FaCheck,
    FaTimes,
    FaCalendarAlt,
    FaDoorOpen,
    FaInfoCircle,
    FaRedoAlt,
    FaFilter,
} from "react-icons/fa";
import ClinicAPI from "../../../../services/ClinicAPI";

const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";

const getImageUrl = (path) => {
    if (!path)
        return "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200";
    if (
        path.startsWith("http://") ||
        path.startsWith("https://") ||
        path.startsWith("blob:") ||
        path.startsWith("data:")
    ) {
        return path;
    }
    const cleanBase = BACKEND_URL.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function ClinicDoctorLeaves() {
    const [leaves, setLeaves] = useState([]);
    const [counts, setCounts] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMessage, setToastMessage] = useState(null);

    // Filters & Search
    const [statusFilter, setStatusFilter] = useState("All"); // 'All' | 'Pending' | 'Approved' | 'Rejected'
    const [searchTerm, setSearchTerm] = useState("");

    // Action Loading state for individual items
    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Reject Modal State
    const [rejectModalItem, setRejectModalItem] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectError, setRejectError] = useState("");

    // View Details Modal State
    const [selectedLeaveDetails, setSelectedLeaveDetails] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const showToast = (message, type = "success") => {
        setToastMessage({ message, type });
        setTimeout(() => setToastMessage(null), 4000);
    };

    // 1. Fetch Leave Requests
    const fetchLeaves = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (statusFilter !== "All") {
                params.status = statusFilter;
            }

            const res = await ClinicAPI.getClinicDoctorLeaveRequests(params);

            if (res?.success) {
                setLeaves(Array.isArray(res.data) ? res.data : []);
                setCounts({
                    total: res.totalCount ?? res.data?.length ?? 0,
                    pending: res.pendingCount ?? 0,
                    approved: res.approvedCount ?? 0,
                    rejected: res.rejectedCount ?? 0,
                });
            } else {
                setLeaves([]);
            }
        } catch (err) {
            console.error("Failed to fetch doctor leaves:", err);
            setError(
                err.response?.data?.message ||
                "Could not load doctor leave applications."
            );
        } finally {
            setLoading(false);
        }
    }, [statusFilter]);

    useEffect(() => {
        fetchLeaves();
        setCurrentPage(1);
    }, [fetchLeaves]);

    // 2. Handle Approve Leave
    const handleApproveLeave = async (leave) => {
        const confirmMessage = `Approve leave for ${leave.doctorName} from ${formatDate(
            leave.startDate
        )} to ${formatDate(
            leave.endDate
        )}?\n\nNote: All dates within this range will automatically be blocked from patient bookings.`;

        if (!window.confirm(confirmMessage)) return;

        try {
            setActionLoadingId(leave.leaveId);
            const res = await ClinicAPI.approveClinicDoctorLeave(
                leave.doctorId,
                leave.leaveId
            );

            if (res?.success) {
                const blockedCount = res.blockedDatesAdded?.length || leave.totalDays;
                showToast(
                    res.message ||
                    `Leave approved! ${blockedCount} date(s) automatically blocked.`,
                    "success"
                );
                fetchLeaves();
            }
        } catch (err) {
            console.error("Approve leave failed:", err);
            showToast(
                err.response?.data?.message || "Failed to approve leave request.",
                "error"
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    // 3. Handle Confirm Reject Leave
    const handleConfirmReject = async (e) => {
        e.preventDefault();
        if (!rejectionReason.trim()) {
            setRejectError("Please provide a valid reason for rejecting this leave.");
            return;
        }

        try {
            setActionLoadingId(rejectModalItem.leaveId);
            setRejectError("");

            const res = await ClinicAPI.rejectClinicDoctorLeave(
                rejectModalItem.doctorId,
                rejectModalItem.leaveId,
                rejectionReason.trim()
            );

            if (res?.success) {
                showToast(
                    res.message || `Leave rejected for ${rejectModalItem.doctorName}.`,
                    "info"
                );
                setRejectModalItem(null);
                setRejectionReason("");
                fetchLeaves();
            }
        } catch (err) {
            console.error("Reject leave failed:", err);
            setRejectError(
                err.response?.data?.message || "Failed to reject leave application."
            );
        } finally {
            setActionLoadingId(null);
        }
    };

    // Helper date formatter
    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });
        } catch {
            return dateStr;
        }
    };

    // Helper datetime formatter
    const formatDateTime = (dateStr) => {
        if (!dateStr) return "-";
        try {
            return new Date(dateStr).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    // Search Filter calculation
    const filteredLeaves = leaves.filter((item) => {
        const q = searchTerm.toLowerCase();
        const docMatch = item.doctorName?.toLowerCase().includes(q);
        const specMatch = item.speciality?.toLowerCase().includes(q);
        const reasonMatch = item.reason?.toLowerCase().includes(q);
        const cabinMatch = item.cabinNumber?.toLowerCase().includes(q);
        return docMatch || specMatch || reasonMatch || cabinMatch;
    });

    // Pagination calculation
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentLeavesList = filteredLeaves.slice(
        indexOfFirstItem,
        indexOfLastItem
    );
    const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

    return (
        <div className="space-y-8 select-none">
            {/* --- Toast Alert --- */}
            {toastMessage && (
                <div
                    className={`fixed top-6 right-6 z-[999999] px-5 py-3 rounded-2xl text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 animate-in fade-in slide-in-from-top-4 ${toastMessage.type === "error"
                            ? "bg-rose-600"
                            : toastMessage.type === "info"
                                ? "bg-slate-800"
                                : "bg-[#3D3F96]"
                        }`}
                >
                    {toastMessage.type === "error" ? (
                        <FaExclamationCircle />
                    ) : (
                        <FaCheckCircle />
                    )}
                    {toastMessage.message}
                </div>
            )}

            {/* --- Page Header --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-gray-800">
                            Doctor Leave Governance
                        </h2>
                        <span className="text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3D3F96] border border-indigo-100">
                            Clinic Panel
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                        Review practitioner time-off applications. Approving leaves automatically
                        blocks OPD calendar dates from patient bookings.
                    </p>
                </div>

                <button
                    onClick={fetchLeaves}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-sm self-start sm:self-auto"
                >
                    <FaRedoAlt className={loading ? "animate-spin" : ""} size={11} /> Refresh
                    Roster
                </button>
            </div>

            {/* --- Summary Metrics Cards --- */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Total */}
                <div
                    onClick={() => setStatusFilter("All")}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === "All"
                            ? "bg-indigo-50/50 border-[#3D3F96] shadow-sm"
                            : "bg-white border-gray-100 hover:border-slate-300"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                            Total Applications
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                            <FaCalendarTimes />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-slate-800 mt-2">
                        {counts.total}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">All submissions</span>
                </div>

                {/* Pending */}
                <div
                    onClick={() => setStatusFilter("Pending")}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === "Pending"
                            ? "bg-amber-50/70 border-amber-500 shadow-sm"
                            : "bg-white border-gray-100 hover:border-slate-300"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                            Pending Review
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs">
                            <FaClock />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-600 mt-2">
                        {counts.pending}
                    </div>
                    <span className="text-[10px] font-bold text-amber-500">
                        Awaiting decision
                    </span>
                </div>

                {/* Approved */}
                <div
                    onClick={() => setStatusFilter("Approved")}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === "Approved"
                            ? "bg-emerald-50/70 border-emerald-500 shadow-sm"
                            : "bg-white border-gray-100 hover:border-slate-300"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
                            Approved
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">
                            <FaCheckCircle />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-600 mt-2">
                        {counts.approved}
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500">
                        Dates blocked
                    </span>
                </div>

                {/* Rejected */}
                <div
                    onClick={() => setStatusFilter("Rejected")}
                    className={`p-5 rounded-3xl border cursor-pointer transition-all ${statusFilter === "Rejected"
                            ? "bg-rose-50/70 border-rose-500 shadow-sm"
                            : "bg-white border-gray-100 hover:border-slate-300"
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider">
                            Rejected
                        </span>
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-xs">
                            <FaTimesCircle />
                        </div>
                    </div>
                    <div className="text-2xl font-black text-rose-600 mt-2">
                        {counts.rejected}
                    </div>
                    <span className="text-[10px] font-bold text-rose-500">Denied requests</span>
                </div>
            </div>

            {/* --- Filter & Search Controls --- */}
            <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Status Pill Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0">
                    {["All", "Pending", "Approved", "Rejected"].map((tab) => {
                        const isActive = statusFilter === tab;
                        return (
                            <button
                                key={tab}
                                onClick={() => setStatusFilter(tab)}
                                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all shrink-0 ${isActive
                                        ? "bg-[#3D3F96] text-white shadow-md shadow-indigo-950/10"
                                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                                    }`}
                            >
                                {tab}
                            </button>
                        );
                    })}
                </div>

                {/* Search Field */}
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search doctor, cabin, reason..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#3D3F96] w-64 md:w-72 font-medium"
                        />
                    </div>

                    <span className="inline-block px-3.5 py-2 rounded-2xl text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96] shrink-0">
                        {filteredLeaves.length} Records
                    </span>
                </div>
            </div>

            {/* --- Error Display --- */}
            {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3 text-rose-700 text-xs font-semibold">
                    <FaExclamationCircle className="text-base shrink-0" /> {error}
                    <button onClick={fetchLeaves} className="underline font-bold ml-auto">
                        Retry
                    </button>
                </div>
            )}

            {/* --- Leave Applications Table --- */}
            <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse align-middle">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-gray-100 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                                <th className="p-4 w-16">Doctor</th>
                                <th className="p-4">Doctor Details</th>
                                <th className="p-4">Leave Duration</th>
                                <th className="p-4">Reason / Purpose</th>
                                <th className="p-4">Applied At</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center w-36">Governance</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-slate-400">
                                        <FaSpinner className="animate-spin text-2xl mx-auto mb-2 text-[#3D3F96]" />
                                        <span className="text-xs font-medium">
                                            Loading doctor leave applications...
                                        </span>
                                    </td>
                                </tr>
                            ) : currentLeavesList.length > 0 ? (
                                currentLeavesList.map((item) => {
                                    const isActionLoading = actionLoadingId === item.leaveId;
                                    const isPending = item.status === "Pending";
                                    const isApproved = item.status === "Approved";
                                    const isRejected = item.status === "Rejected";

                                    return (
                                        <tr
                                            key={item.leaveId}
                                            className="hover:bg-indigo-50/10 transition-all"
                                        >
                                            {/* Avatar */}
                                            <td className="p-4">
                                                <img
                                                    src={getImageUrl(item.profileImage)}
                                                    alt={item.doctorName}
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src =
                                                            "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200";
                                                    }}
                                                    className="w-11 h-11 rounded-xl object-cover border border-slate-100 shadow-sm"
                                                />
                                            </td>

                                            {/* Doctor Details */}
                                            <td className="p-4">
                                                <div className="font-bold text-gray-800">
                                                    {item.doctorName}
                                                </div>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-[#3D3F96]">
                                                        {item.speciality || "General"}
                                                    </span>
                                                    {item.cabinNumber && (
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <FaDoorOpen size={9} /> {item.cabinNumber}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Leave Duration */}
                                            <td className="p-4">
                                                <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                                                    <FaCalendarAlt size={10} className="text-[#3D3F96]" />
                                                    {formatDate(item.startDate)} &rarr;{" "}
                                                    {formatDate(item.endDate)}
                                                </div>
                                                <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                                                    Duration:{" "}
                                                    <span className="text-slate-700">
                                                        {item.totalDays || 1} day(s)
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Reason */}
                                            <td className="p-4 max-w-xs">
                                                <div className="text-xs font-semibold text-slate-700 line-clamp-2">
                                                    {item.reason || "Personal Leave"}
                                                </div>
                                                {isRejected && item.rejectionReason && (
                                                    <div className="mt-1 text-[11px] font-bold text-rose-600 bg-rose-50/70 p-1.5 rounded-lg border border-rose-100">
                                                        <span className="underline">Rejection Note:</span>{" "}
                                                        {item.rejectionReason}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Applied At */}
                                            <td className="p-4">
                                                <div className="text-xs font-bold text-slate-600">
                                                    {formatDateTime(item.appliedAt)}
                                                </div>
                                                {item.reviewedAt && (
                                                    <div className="text-[10px] text-slate-400">
                                                        Reviewed: {formatDateTime(item.reviewedAt)}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4 text-center">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isApproved
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : isRejected
                                                                ? "bg-rose-50 text-rose-700 border border-rose-200"
                                                                : "bg-amber-50 text-amber-700 border border-amber-200"
                                                        }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            {/* Governance Actions */}
                                            <td className="p-4 text-center">
                                                {isPending ? (
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        {/* Approve Button */}
                                                        <button
                                                            onClick={() => handleApproveLeave(item)}
                                                            disabled={isActionLoading}
                                                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 disabled:opacity-50"
                                                            title="Approve Leave & Block Dates"
                                                        >
                                                            {isActionLoading ? (
                                                                <FaSpinner className="animate-spin text-xs" />
                                                            ) : (
                                                                <FaCheck size={10} />
                                                            )}
                                                            Approve
                                                        </button>

                                                        {/* Reject Button */}
                                                        <button
                                                            onClick={() => {
                                                                setRejectModalItem(item);
                                                                setRejectionReason("");
                                                                setRejectError("");
                                                            }}
                                                            disabled={isActionLoading}
                                                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1 disabled:opacity-50"
                                                            title="Reject Leave Request"
                                                        >
                                                            <FaTimes size={10} />
                                                            Reject
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => setSelectedLeaveDetails(item)}
                                                        className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 text-slate-400 hover:text-[#3D3F96] border border-slate-100 transition-all text-xs font-bold inline-flex items-center gap-1"
                                                    >
                                                        <FaInfoCircle size={12} /> Details
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="p-16 text-center text-gray-400 font-bold">
                                        <FaCalendarTimes className="text-3xl mx-auto mb-2 text-indigo-400 opacity-60" />
                                        <h5>No Leave Requests Found</h5>
                                        <p className="text-xs text-gray-400 font-medium mt-1">
                                            {statusFilter !== "All"
                                                ? `There are no "${statusFilter}" applications at the moment.`
                                                : "Doctors have not submitted any leave applications yet."}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* --- Pagination --- */}
                {totalPages > 1 && (
                    <div className="p-5 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-400">
                            Showing{" "}
                            <strong className="text-gray-700">
                                {indexOfFirstItem + 1} -{" "}
                                {Math.min(indexOfLastItem, filteredLeaves.length)}
                            </strong>{" "}
                            of <strong className="text-gray-700">{filteredLeaves.length}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className="p-2 rounded-xl border border-gray-100 bg-white disabled:opacity-40"
                            >
                                <FaChevronLeft size={11} />
                            </button>

                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold ${currentPage === i + 1
                                            ? "bg-[#3D3F96] text-white"
                                            : "bg-white border border-gray-100 text-gray-600"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                className="p-2 rounded-xl border border-gray-100 bg-white disabled:opacity-40"
                            >
                                <FaChevronRight size={11} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* --- MODAL 1: REJECT LEAVE MODAL (WITH MANDATORY REJECTION REASON) --- */}
            {/* ========================================================================= */}
            {rejectModalItem && (
                <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                                <FaBan />
                                <span>Reject Leave Request</span>
                            </div>
                            <button
                                onClick={() => setRejectModalItem(null)}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                            <div className="font-bold text-slate-800">
                                {rejectModalItem.doctorName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                                {formatDate(rejectModalItem.startDate)} &rarr;{" "}
                                {formatDate(rejectModalItem.endDate)} ({rejectModalItem.totalDays}{" "}
                                days)
                            </div>
                            <div className="mt-1 text-[11px] text-slate-600 italic">
                                &ldquo;{rejectModalItem.reason}&rdquo;
                            </div>
                        </div>

                        {rejectError && (
                            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                                <FaExclamationCircle className="shrink-0" /> {rejectError}
                            </div>
                        )}

                        <form onSubmit={handleConfirmReject} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-black uppercase text-slate-600 mb-1.5 block">
                                    Reason for Rejection <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="e.g. High OPD patient load scheduled on these dates, insufficient roster backup..."
                                    className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-medium text-slate-800 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 bg-white"
                                />
                                <span className="text-[10px] text-slate-400 block mt-1">
                                    This note will be recorded and shared with the doctor.
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setRejectModalItem(null)}
                                    className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={actionLoadingId === rejectModalItem.leaveId}
                                    className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-950/10 flex items-center gap-1.5 disabled:opacity-50 transition-all"
                                >
                                    {actionLoadingId === rejectModalItem.leaveId ? (
                                        <FaSpinner className="animate-spin" />
                                    ) : (
                                        <FaBan />
                                    )}
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* --- MODAL 2: VIEW LEAVE DETAILS MODAL --- */}
            {/* ========================================================================= */}
            {selectedLeaveDetails && (
                <div className="fixed inset-0 z-[999999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-sm">
                                    <FaCalendarTimes />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800">
                                        Leave Record Overview
                                    </h4>
                                    <span className="text-[10px] text-slate-400 font-bold">
                                        ID: {selectedLeaveDetails.leaveId}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedLeaveDetails(null)}
                                className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>

                        {/* Doctor Info Card */}
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <img
                                src={getImageUrl(selectedLeaveDetails.profileImage)}
                                alt={selectedLeaveDetails.doctorName}
                                className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div>
                                <div className="text-xs font-black text-slate-800">
                                    {selectedLeaveDetails.doctorName}
                                </div>
                                <div className="text-[11px] font-bold text-[#3D3F96]">
                                    {selectedLeaveDetails.speciality} &bull;{" "}
                                    {selectedLeaveDetails.cabinNumber || "No Cabin"}
                                </div>
                            </div>
                            <span
                                className={`ml-auto px-3 py-1 rounded-full text-[10px] font-black uppercase ${selectedLeaveDetails.status === "Approved"
                                        ? "bg-emerald-100 text-emerald-700"
                                        : selectedLeaveDetails.status === "Rejected"
                                            ? "bg-rose-100 text-rose-700"
                                            : "bg-amber-100 text-amber-700"
                                    }`}
                            >
                                {selectedLeaveDetails.status}
                            </span>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">
                                    Start Date
                                </span>
                                <span className="font-bold text-slate-700">
                                    {formatDate(selectedLeaveDetails.startDate)}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">
                                    End Date
                                </span>
                                <span className="font-bold text-slate-700">
                                    {formatDate(selectedLeaveDetails.endDate)}
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">
                                    Total Duration
                                </span>
                                <span className="font-bold text-slate-700">
                                    {selectedLeaveDetails.totalDays} Day(s)
                                </span>
                            </div>
                            <div className="p-3 rounded-2xl bg-slate-50/60 border border-slate-100">
                                <span className="text-[10px] font-black uppercase text-slate-400 block">
                                    Submitted At
                                </span>
                                <span className="font-bold text-slate-700">
                                    {formatDateTime(selectedLeaveDetails.appliedAt)}
                                </span>
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-100 text-xs">
                            <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">
                                Doctor&apos;s Application Reason
                            </span>
                            <p className="font-medium text-slate-700 italic">
                                &ldquo;{selectedLeaveDetails.reason || "None specified"}&rdquo;
                            </p>
                        </div>

                        {/* Rejection Note (if rejected) */}
                        {selectedLeaveDetails.status === "Rejected" &&
                            selectedLeaveDetails.rejectionReason && (
                                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs">
                                    <span className="text-[10px] font-black uppercase text-rose-600 block mb-1">
                                        Rejection Reason
                                    </span>
                                    <p className="font-bold text-rose-800">
                                        {selectedLeaveDetails.rejectionReason}
                                    </p>
                                </div>
                            )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedLeaveDetails(null)}
                                className="px-5 py-2.5 rounded-2xl bg-[#3D3F96] text-white text-xs font-bold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}