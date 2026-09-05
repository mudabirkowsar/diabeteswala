"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    X,
    Eye,
    FileText,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter,
    ShieldCheck,
    Stethoscope,
    Hospital,
    Utensils,
    Pill,
    FlaskConical,
    Bike,
    Ambulance,
    ExternalLink,
    RefreshCw,
    Check,
    Ban,
    UserCheck,
    Sparkles,
    ArrowRight,
    Building2
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import AdminAPI Service
import AdminAPI from '../../../services/AdminAPI';

// --- MEDIA URL HELPER ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

// --- HELPER: VENDOR MODEL CONFIGURATIONS ---
const VENDOR_CONFIGS = {
    Doctor: {
        label: "Doctor / Practitioner",
        icon: Stethoscope,
        badgeBg: "bg-blue-50 text-blue-700 border-blue-200",
        iconBg: "bg-blue-100/70 text-blue-600"
    },
    Clinic: {
        label: "Clinic / Hospital Center",
        icon: Hospital,
        badgeBg: "bg-teal-50 text-teal-700 border-teal-200",
        iconBg: "bg-teal-100/70 text-teal-600"
    },
    Food: {
        label: "Food & Cloud Kitchen",
        icon: Utensils,
        badgeBg: "bg-orange-50 text-orange-700 border-orange-200",
        iconBg: "bg-orange-100/70 text-orange-600"
    },
    Pharmacy: {
        label: "Pharmacy Store",
        icon: Pill,
        badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
        iconBg: "bg-rose-100/70 text-rose-600"
    },
    Lab: {
        label: "Diagnostic Lab",
        icon: FlaskConical,
        badgeBg: "bg-purple-50 text-purple-700 border-purple-200",
        iconBg: "bg-purple-100/70 text-purple-600"
    },
    Driver: {
        label: "Logistics Driver",
        icon: Bike,
        badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconBg: "bg-emerald-100/70 text-emerald-600"
    },
    Ambulance: {
        label: "Ambulance Operator",
        icon: Ambulance,
        badgeBg: "bg-red-50 text-red-700 border-red-200",
        iconBg: "bg-red-100/70 text-red-600"
    }
};

export default function ProfileUpdateApprovalsPage() {
    // --- State Management ---
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionProcessing, setActionProcessing] = useState(false);

    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState('Pending'); // 'Pending' | 'Approved' | 'Rejected' | 'ALL'
    const [modelFilter, setModelFilter] = useState('ALL'); // 'ALL' | 'Doctor' | 'Clinic' | 'Pharmacy' | 'Lab' | 'Food' | 'Driver' | 'Ambulance'
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Side-by-Side Selective Inspection Modal State
    const [comparisonData, setComparisonData] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // Rejection Reason Prompt State
    const [rejectPromptOpen, setRejectPromptOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [targetRequestId, setTargetRequestId] = useState(null);

    // --- 1. Fetch Profile Update Requests List ---
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 20
            };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (modelFilter !== 'ALL') params.vendorModel = modelFilter;

            const response = await AdminAPI.getProfileUpdateRequests(params);
            if (response && response.success) {
                setRequests(response.data || []);
                setTotalCount(response.total || response.count || (response.data ? response.data.length : 0));
                setTotalPages(response.totalPages || Math.ceil((response.total || response.data?.length || 1) / 20) || 1);
            }
        } catch (err) {
            console.error("Error fetching update requests:", err);
            toast.error(err.response?.data?.message || "Failed to load profile update requests.");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, modelFilter, page]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    // --- 2. Open Selective Inspection Modal ---
    const handleOpenDetailModal = async (requestId) => {
        setLoadingDetails(true);
        setIsDetailModalOpen(true);
        try {
            const response = await AdminAPI.getProfileUpdateRequestDetails(requestId);
            if (response && response.success) {
                setComparisonData(response.data);
            } else {
                toast.error("Failed to load request details.");
            }
        } catch (err) {
            console.error("Error loading request details:", err);
            toast.error(err.response?.data?.message || "Failed to retrieve selective comparison.");
        } finally {
            setLoadingDetails(false);
        }
    };

    // --- 3. Process Action: Approve Request ---
    const handleApproveRequest = async (requestId) => {
        if (!window.confirm("Are you sure you want to APPROVE this update? The new changes will apply directly to the live profile.")) {
            return;
        }

        setActionProcessing(true);
        try {
            const response = await AdminAPI.processProfileUpdateRequest(requestId, {
                action: "Approve"
            });
            if (response && response.success) {
                toast.success(response.message || "Profile update successfully Approved!");
                setIsDetailModalOpen(false);
                fetchRequests();
            }
        } catch (err) {
            console.error("Error approving update request:", err);
            toast.error(err.response?.data?.message || "Failed to approve profile update.");
        } finally {
            setActionProcessing(false);
        }
    };

    // --- 4. Process Action: Open Reject Prompt ---
    const handleOpenRejectPrompt = (requestId) => {
        setTargetRequestId(requestId);
        setRejectionReason('');
        setRejectPromptOpen(true);
    };

    // --- 5. Process Action: Confirm Reject Request ---
    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a mandatory reason explaining why the update was declined.");
            return;
        }

        setActionProcessing(true);
        try {
            const response = await AdminAPI.processProfileUpdateRequest(targetRequestId, {
                action: "Reject",
                reason: rejectionReason.trim()
            });
            if (response && response.success) {
                toast.success(response.message || "Profile update successfully Rejected!");
                setRejectPromptOpen(false);
                setIsDetailModalOpen(false);
                fetchRequests();
            }
        } catch (err) {
            console.error("Error rejecting update request:", err);
            toast.error(err.response?.data?.message || "Failed to reject update request.");
        } finally {
            setActionProcessing(false);
        }
    };

    // Helper: Render Status Badge
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'PENDING';
        if (uppercase === 'APPROVED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Approved
                </span>
            );
        }
        if (uppercase === 'REJECTED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                    <Ban size={12} className="text-rose-500" /> Rejected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                <Clock size={12} className="text-amber-500 animate-pulse" /> Pending Review
            </span>
        );
    };

    // Helper: Render Field Values (Images, Files, Objects, Strings)
    const renderFieldComparisonValue = (val, isNew = false) => {
        if (val === null || val === undefined || val === '') {
            return <span className="text-slate-400 italic text-xs">Not Set / Empty</span>;
        }

        // Image / PDF Detection
        if (typeof val === 'string' && (val.match(/\.(jpeg|jpg|png|webp|gif|svg|pdf)$/i) || val.startsWith('/uploads/'))) {
            const mediaUrl = getMediaUrl(val);
            const isPdf = val.toLowerCase().endsWith('.pdf');

            return (
                <div className="flex items-center gap-3 pt-1">
                    {isPdf ? (
                        <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-xl text-xs transition border border-slate-200"
                        >
                            <FileText size={15} className="text-rose-500" />
                            <span>View Document (PDF)</span>
                            <ExternalLink size={12} />
                        </a>
                    ) : (
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                                <img
                                    src={mediaUrl}
                                    alt="Uploaded Media"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-[#3d3f96] hover:underline inline-flex items-center gap-1"
                            >
                                <Eye size={13} /> View Full
                            </a>
                        </div>
                    )}
                </div>
            );
        }

        // Nested Objects (e.g. fees: { clinic, online, home })
        if (typeof val === 'object') {
            return (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {Object.entries(val).map(([nestedKey, nestedVal]) => (
                        <div
                            key={nestedKey}
                            className={`p-2.5 rounded-xl border text-xs ${isNew ? 'bg-indigo-50/50 border-indigo-100 text-indigo-900' : 'bg-slate-50 border-slate-200 text-slate-700'
                                }`}
                        >
                            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                                {nestedKey}
                            </span>
                            <span className="font-extrabold text-sm">{String(nestedVal)}</span>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <span className={`font-bold text-xs sm:text-sm break-all ${isNew ? 'text-indigo-950 font-black' : 'text-slate-700'}`}>
                {String(val)}
            </span>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-7 py-4 pb-16 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/15 flex-shrink-0 shadow-xs">
                        <UserCheck className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Profile Update Approvals
                            </h1>
                            <span className="text-[11px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full shadow-xs">
                                {totalCount} Requests
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Review selective field differences and approve or reject profile update submissions.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchRequests}
                        disabled={loading}
                        className="px-4 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-2xl shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={loading ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh Queue</span>
                    </button>
                </div>
            </div>

            {/* --- FILTERS (STATUS & VENDOR MODEL) --- */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Status Filter */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden">
                        {[
                            { id: 'Pending', label: 'Pending Review' },
                            { id: 'Approved', label: 'Approved' },
                            { id: 'Rejected', label: 'Rejected' },
                            { id: 'ALL', label: 'All History' }
                        ].map((status) => (
                            <button
                                key={status.id}
                                onClick={() => { setStatusFilter(status.id); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${statusFilter === status.id
                                        ? 'bg-white text-[#3d3f96] shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                    }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    {/* Vendor Model Filter */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-slate-400 mr-1 flex items-center gap-1">
                            <Filter size={12} /> Model:
                        </span>
                        {['ALL', 'Doctor', 'Clinic', 'Pharmacy', 'Lab', 'Food', 'Driver', 'Ambulance'].map((model) => (
                            <button
                                key={model}
                                onClick={() => { setModelFilter(model); setPage(1); }}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition cursor-pointer border ${modelFilter === model
                                        ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-xs'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                    }`}
                            >
                                {model === 'ALL' ? 'All Models' : model}
                            </button>
                        ))}
                    </div>

                </div>
            </div>

            {/* --- REQUESTS TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-200 shadow-xs">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning profile update requests...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 sm:p-20 text-center bg-white rounded-3xl border border-slate-200 shadow-xs border-dashed">
                    <ShieldCheck size={44} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Profile Update Requests Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        There are currently no provider profile update submissions matching your active filters.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-5 px-6">Vendor Model & ID</th>
                                    <th className="py-5 px-6">Submitted On</th>
                                    <th className="py-5 px-6">Status</th>
                                    <th className="py-5 px-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {requests.map((item) => {
                                    const modelType = item.vendorModel || 'Doctor';
                                    const modelConfig = VENDOR_CONFIGS[modelType] || {
                                        label: modelType,
                                        icon: Building2,
                                        badgeBg: "bg-slate-50 text-slate-700 border-slate-200"
                                    };
                                    const ModelIcon = modelConfig.icon;
                                    const changedFieldsList = item.updatedFields ? Object.keys(item.updatedFields) : [];
                                    const formattedDate = new Date(item.createdAt || Date.now()).toLocaleDateString("en-US", {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    });

                                    return (
                                        <tr key={item._id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Vendor Model */}
                                            <td className="py-5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 ${modelConfig.badgeBg}`}>
                                                        <ModelIcon size={20} />
                                                    </div>
                                                    <div>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${modelConfig.badgeBg}`}>
                                                            {modelType}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-slate-500 block mt-1 font-bold">
                                                            ID: {typeof item.vendorId === 'object' ? item.vendorId?._id : item.vendorId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Submitted On */}
                                            <td className="py-5 px-6 text-slate-500 font-bold">
                                                {formattedDate}
                                            </td>

                                            {/* Status */}
                                            <td className="py-5 px-6">
                                                {renderStatusBadge(item.status)}
                                                {item.status === 'Rejected' && item.rejectionReason && (
                                                    <p className="text-[10px] text-rose-500 font-bold mt-1 truncate max-w-[180px]" title={item.rejectionReason}>
                                                        {item.rejectionReason}
                                                    </p>
                                                )}
                                            </td>

                                            {/* Review Modal Trigger */}
                                            <td className="py-5 px-6 text-right">
                                                <button
                                                    onClick={() => handleOpenDetailModal(item._id)}
                                                    className="px-4 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition inline-flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>Review Changes</span>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="py-4 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                                Page {page} of {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- SELECTIVE SIDE-BY-SIDE INSPECTION & APPROVAL MODAL --- */}
            {isDetailModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">

                        {/* Modal Header */}
                        <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                        Review Profile Changes
                                    </h3>
                                    {comparisonData && renderStatusBadge(comparisonData.status)}
                                </div>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                    Comparing proposed changed fields against live database values.
                                </p>
                            </div>

                            <button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Content / Comparison Grid */}
                        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            {loadingDetails || !comparisonData ? (
                                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loading changed fields comparison...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">

                                    {/* Partner Info Banner */}
                                    <div className="bg-slate-50 p-4 sm:p-5 rounded-3xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                                                {comparisonData.vendorModel} Partner
                                            </span>
                                            <h4 className="text-base font-black text-slate-900">
                                                {comparisonData.currentFields?.vendorName || comparisonData.currentFields?.name || comparisonData.currentFields?.fullName || "Registered Partner"}
                                            </h4>
                                            <span className="font-mono text-xs text-slate-400 block mt-0.5">
                                                Vendor ID: {comparisonData.vendorId}
                                            </span>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Request Document ID</span>
                                            <span className="font-mono text-xs font-bold text-slate-700">{comparisonData.requestId || comparisonData._id}</span>
                                        </div>
                                    </div>

                                    {/* Rejection Note (If Rejected) */}
                                    {comparisonData.status === 'Rejected' && comparisonData.rejectionReason && (
                                        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-bold">
                                            <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="block font-black uppercase tracking-wide">Decline Reason:</strong>
                                                <p className="mt-0.5 font-medium">{comparisonData.rejectionReason}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Selective Fields Diff Card */}
                                    <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                                        <div className="grid grid-cols-1 md:grid-cols-2 bg-slate-100 border-b border-slate-200 text-xs font-black uppercase tracking-wider text-slate-600">
                                            <div className="p-4 border-b md:border-b-0 md:border-r border-slate-200 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-slate-400" />
                                                <span>Live Current Value</span>
                                            </div>
                                            <div className="p-4 bg-indigo-50/70 text-[#3d3f96] flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-[#3d3f96]" />
                                                <span>Proposed Update (New)</span>
                                            </div>
                                        </div>

                                        <div className="divide-y divide-slate-100">
                                            {comparisonData.updatedFields && Object.keys(comparisonData.updatedFields).length > 0 ? (
                                                Object.entries(comparisonData.updatedFields).map(([fieldKey, newFieldValue]) => {
                                                    const currentFieldValue = comparisonData.currentFields ? comparisonData.currentFields[fieldKey] : undefined;

                                                    return (
                                                        <div key={fieldKey} className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 text-xs">
                                                            {/* Current Old Value */}
                                                            <div className="p-4 sm:p-5 bg-white space-y-1.5">
                                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                                                    {fieldKey}
                                                                </span>
                                                                <div>
                                                                    {renderFieldComparisonValue(currentFieldValue, false)}
                                                                </div>
                                                            </div>

                                                            {/* Proposed New Value */}
                                                            <div className="p-4 sm:p-5 bg-indigo-50/20 space-y-1.5">
                                                                <span className="text-[10px] font-black uppercase text-[#3d3f96] tracking-wider block flex items-center gap-1">
                                                                    <Sparkles size={11} /> New {fieldKey}
                                                                </span>
                                                                <div>
                                                                    {renderFieldComparisonValue(newFieldValue, true)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="p-8 text-center text-slate-400 text-xs font-bold">
                                                    No specific field diffs found in this request.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            )}
                        </div>

                        {/* Modal Action Bar (Approve / Reject Buttons) */}
                        {comparisonData && comparisonData.status === 'Pending' && (
                            <div className="px-6 py-4 sm:px-8 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4 shrink-0">
                                <button
                                    type="button"
                                    disabled={actionProcessing}
                                    onClick={() => handleOpenRejectPrompt(comparisonData.requestId || comparisonData._id)}
                                    className="px-6 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider rounded-2xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <Ban size={14} />
                                    <span>Reject</span>
                                </button>

                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        disabled={actionProcessing}
                                        onClick={() => setIsDetailModalOpen(false)}
                                        className="px-5 py-3 text-slate-500 hover:bg-slate-200 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="button"
                                        disabled={actionProcessing}
                                        onClick={() => handleApproveRequest(comparisonData.requestId || comparisonData._id)}
                                        className="px-8 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/15 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                                        <span>Approve & Apply Live</span>
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}

            {/* --- REJECTION REASON PROMPT MODAL --- */}
            {rejectPromptOpen && (
                <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 shadow-2xl space-y-4 text-left">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <Ban size={16} className="text-rose-500" />
                                Reject Profile Update
                            </h4>
                            <button
                                onClick={() => setRejectPromptOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Please provide a detailed justification for declining this update. This reason will be stored and returned to the vendor.
                        </p>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                Rejection Reason <span className="text-rose-500">*</span>
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g. Medical council registration document is blurred. Please upload a clear photo or PDF."
                                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-rose-500 focus:bg-white resize-none leading-relaxed transition"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                            <button
                                type="button"
                                disabled={actionProcessing}
                                onClick={() => setRejectPromptOpen(false)}
                                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={actionProcessing}
                                onClick={handleConfirmReject}
                                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                                {actionProcessing ? <Loader2 size={13} className="animate-spin" /> : null}
                                <span>Confirm Rejection</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}