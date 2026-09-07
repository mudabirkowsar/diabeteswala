"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Ambulance,
    CheckCircle2,
    Clock,
    Ban,
    Search,
    RefreshCw,
    Eye,
    Check,
    X,
    Phone,
    MapPin,
    Building2,
    FileText,
    ExternalLink,
    ShieldCheck,
    AlertCircle,
    User,
    HeartPulse,
    Stethoscope,
    IndianRupee,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Filter,
    Activity,
    Gauge,
    Mail
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import AdminAPI service (adjust the path if needed)
import AdminAPI from '../../../../services/AdminAPI';

// --- MEDIA URL HELPER ---
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';
const getMediaUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanBase = BACKEND_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function ClinicalAmbulances() {
    // --- State Management ---
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionProcessing, setActionProcessing] = useState(false);
    const [activeActionId, setActiveActionId] = useState(null);

    // Filters & Pagination
    const [statusFilter, setStatusFilter] = useState('Pending'); // 'Pending' | 'Approved' | 'Rejected' | 'ALL'
    const [searchQuery, setSearchQuery] = useState('');
    const [cityFilter, setCityFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);

    // Deep Audit / Inspection Modal State
    const [selectedAmbulance, setSelectedAmbulance] = useState(null);
    const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

    // Rejection Prompt Modal State
    const [rejectPromptOpen, setRejectPromptOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [targetAmbulanceId, setTargetAmbulanceId] = useState(null);

    // --- 1. Fetch Ambulances from Admin Queue ---
    const fetchAmbulanceQueue = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit: 10
            };
            if (statusFilter !== 'ALL') params.status = statusFilter;
            if (searchQuery.trim()) params.search = searchQuery.trim();
            if (cityFilter.trim()) params.city = cityFilter.trim();

            const response = await AdminAPI.getClinicAmbulancesApprovalList(params);
            if (response && response.success) {
                setAmbulances(response.data || []);
                setTotalDocs(response.totalDocs || response.count || (response.data ? response.data.length : 0));
                setTotalPages(response.totalPages || Math.ceil((response.totalDocs || response.data?.length || 1) / 10) || 1);
            }
        } catch (err) {
            console.error('Error fetching admin ambulance queue:', err);
            toast.error(err.response?.data?.message || 'Failed to load ambulance approval queue.');
        } finally {
            setLoading(false);
        }
    }, [statusFilter, searchQuery, cityFilter, page]);

    useEffect(() => {
        fetchAmbulanceQueue();
    }, [fetchAmbulanceQueue]);

    // --- 2. Action: Approve Ambulance ---
    const handleApproveAmbulance = async (id, vehicleNumber) => {
        if (!window.confirm(`Are you sure you want to APPROVE ambulance "${vehicleNumber}"? This unit will immediately be live and available for emergency dispatch.`)) {
            return;
        }

        setActionProcessing(true);
        setActiveActionId(id);
        try {
            const response = await AdminAPI.approveClinicAmbulance(id);
            if (response && response.success) {
                toast.success(response.message || `Ambulance '${vehicleNumber}' approved successfully!`);
                setIsAuditModalOpen(false);
                fetchAmbulanceQueue();
            }
        } catch (err) {
            console.error('Error approving ambulance:', err);
            toast.error(err.response?.data?.message || 'Failed to approve ambulance.');
        } finally {
            setActionProcessing(false);
            setActiveActionId(null);
        }
    };

    // --- 3. Action: Open Reject Prompt ---
    const handleOpenRejectPrompt = (id) => {
        setTargetAmbulanceId(id);
        setRejectionReason('');
        setRejectPromptOpen(true);
    };

    // --- 4. Action: Confirm Reject Ambulance ---
    const handleConfirmReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a mandatory reason explaining why this ambulance was rejected.');
            return;
        }

        setActionProcessing(true);
        setActiveActionId(targetAmbulanceId);
        try {
            const response = await AdminAPI.rejectClinicAmbulance(targetAmbulanceId, {
                reason: rejectionReason.trim()
            });
            if (response && response.success) {
                toast.success(response.message || 'Ambulance rejected.');
                setRejectPromptOpen(false);
                setIsAuditModalOpen(false);
                fetchAmbulanceQueue();
            }
        } catch (err) {
            console.error('Error rejecting ambulance:', err);
            toast.error(err.response?.data?.message || 'Failed to reject ambulance.');
        } finally {
            setActionProcessing(false);
            setActiveActionId(null);
        }
    };

    // --- 5. Open Audit Modal ---
    const handleOpenAuditModal = (ambulance) => {
        setSelectedAmbulance(ambulance);
        setIsAuditModalOpen(true);
    };

    // Helper: Render Status Badge
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'PENDING';
        if (uppercase === 'APPROVED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
                    <CheckCircle2 size={12} className="text-emerald-500" /> Approved
                </span>
            );
        }
        if (uppercase === 'REJECTED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 shadow-2xs">
                    <Ban size={12} className="text-rose-500" /> Rejected
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
                <Clock size={12} className="text-amber-500 animate-pulse" /> Pending Review
            </span>
        );
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-7 py-4 antialiased select-none text-left">
            <Toaster position="top-right" />
            {/* --- FILTER & SEARCH TOOLBAR --- */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Status Tabs */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-2xl gap-1 overflow-x-auto [&::-webkit-scrollbar]:hidden w-full md:w-auto">
                        {[
                            { id: 'Pending', label: 'Pending Review' },
                            { id: 'Approved', label: 'Approved' },
                            { id: 'Rejected', label: 'Rejected' },
                            { id: 'ALL', label: 'All Fleet' }
                        ].map((status) => (
                            <button
                                key={status.id}
                                onClick={() => { setStatusFilter(status.id); setPage(1); }}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                                    statusFilter === status.id
                                        ? 'bg-white text-red-600 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {status.label}
                            </button>
                        ))}
                    </div>

                    {/* Search & City Inputs */}
                    <div className="flex items-center gap-3 flex-wrap w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                placeholder="Search plate, driver, phone, email..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
                            />
                        </div>

                        <div className="relative w-36">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <input
                                type="text"
                                value={cityFilter}
                                onChange={(e) => { setCityFilter(e.target.value); setPage(1); }}
                                placeholder="City (e.g. Mohali)"
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-500 focus:bg-white transition"
                            />
                        </div>
                    </div>

                </div>
            </div>

            {/* --- QUEUE TABLE LEDGER --- */}
            {loading ? (
                <div className="py-28 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="animate-spin text-red-600" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning ambulance verification queue...</p>
                </div>
            ) : ambulances.length === 0 ? (
                <div className="py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-xs flex flex-col items-center justify-center text-center p-6">
                    <ShieldCheck size={48} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Ambulances In Queue</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        There are currently no clinic ambulance registrations matching your active search and filter criteria.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-black bg-slate-50/70 tracking-wider">
                                    <th className="py-4.5 px-6">Vehicle Plate & Model</th>
                                    <th className="py-4.5 px-6">Registered Clinic</th>
                                    <th className="py-4.5 px-6">Driver Contact</th>
                                    <th className="py-4.5 px-6">Support Staff & Pricing</th>
                                    <th className="py-4.5 px-6">Verification Status</th>
                                    <th className="py-4.5 px-6 text-right">Audit & Decision</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {ambulances.map((amb) => {
                                    const clinic = typeof amb.clinicId === 'object' ? amb.clinicId : {};
                                    const clinicName = clinic.clinicName || clinic.name || 'Partner Medical Center';
                                    const pricing = amb.pricing || {};
                                    const supportStaff = amb.supportStaff || {};
                                    const hasNurse = supportStaff.nurse?.available;
                                    const hasDoctor = supportStaff.doctor?.available;

                                    return (
                                        <tr
                                            key={amb._id}
                                            className="hover:bg-slate-50/70 transition-colors"
                                        >
                                            {/* 1. Vehicle Plate & Model */}
                                            <td className="py-4.5 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center shrink-0">
                                                        <Ambulance size={20} />
                                                    </div>
                                                    <div>
                                                        <strong className="text-sm font-black text-slate-900 block">
                                                            {amb.vehicleNumber || 'Unregistered'}
                                                        </strong>
                                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100/70 text-red-700 border border-red-200">
                                                            {amb.vehicleType || 'Van'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Registered Clinic */}
                                            <td className="py-4.5 px-6">
                                                <div className="flex items-start gap-2">
                                                    <Building2 size={15} className="text-indigo-600 shrink-0 mt-0.5" />
                                                    <div>
                                                        <strong className="font-extrabold text-slate-900 block text-xs">
                                                            {clinicName}
                                                        </strong>
                                                        <span className="text-[11px] text-slate-500 font-bold block">
                                                            {clinic.city || amb.city || 'Mohali'}, {clinic.state || amb.state || 'Punjab'}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-400">
                                                            ID: {clinic._id || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 3. Driver Contact */}
                                            <td className="py-4.5 px-6">
                                                <strong className="font-extrabold text-slate-900 block text-xs">
                                                    {amb.name}
                                                </strong>
                                                <span className="text-[11px] font-bold text-slate-500 block">
                                                    {amb.phone}
                                                </span>
                                                <span className="text-[10px] text-slate-400 block truncate max-w-[160px]">
                                                    {amb.email || 'No email provided'}
                                                </span>
                                            </td>

                                            {/* 4. Support Staff & Pricing */}
                                            <td className="py-4.5 px-6">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${hasNurse ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-400'}`}>
                                                            Nurse: {hasNurse ? `₹${supportStaff.nurse?.price || 0}` : 'No'}
                                                        </span>
                                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${hasDoctor ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                                                            Doctor: {hasDoctor ? `₹${supportStaff.doctor?.price || 0}` : 'No'}
                                                        </span>
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 block">
                                                        Base Fare: ₹{pricing.singleRidePrice || 400} (1-Way) • ₹{pricing.pricePerKM || 12}/km
                                                    </span>
                                                </div>
                                            </td>

                                            {/* 5. Verification Status */}
                                            <td className="py-4.5 px-6">
                                                {renderStatusBadge(amb.profileStatus)}
                                                {amb.profileStatus === 'Rejected' && amb.rejectionReason && (
                                                    <p className="text-[10px] text-rose-500 font-bold mt-1 truncate max-w-[180px]" title={amb.rejectionReason}>
                                                        {amb.rejectionReason}
                                                    </p>
                                                )}
                                            </td>

                                            {/* 6. Audit & Decision Actions */}
                                            <td className="py-4.5 px-6 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* Quick Approve / Reject for Pending items */}
                                                    {amb.profileStatus === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleOpenRejectPrompt(amb._id)}
                                                                disabled={actionProcessing && activeActionId === amb._id}
                                                                className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl border border-rose-200 transition cursor-pointer disabled:opacity-50"
                                                                title="Reject Ambulance"
                                                            >
                                                                <Ban size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleApproveAmbulance(amb._id, amb.vehicleNumber)}
                                                                disabled={actionProcessing && activeActionId === amb._id}
                                                                className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl border border-emerald-200 transition cursor-pointer disabled:opacity-50"
                                                                title="Approve Ambulance"
                                                            >
                                                                {actionProcessing && activeActionId === amb._id ? (
                                                                    <Loader2 size={14} className="animate-spin" />
                                                                ) : (
                                                                    <Check size={14} strokeWidth={3} />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}

                                                    <button
                                                        onClick={() => handleOpenAuditModal(amb)}
                                                        className="px-3 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                                    >
                                                        <Eye size={13} />
                                                        <span>Audit Details</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="py-4 px-6 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">
                                Page {page} of {totalPages} ({totalDocs} total records)
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 disabled:opacity-40 transition cursor-pointer"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- DEEP AUDIT / INSPECTION MODAL --- */}
            {isAuditModalOpen && selectedAmbulance && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl relative text-left overflow-hidden">
                        
                        {/* Modal Header */}
                        <div className="px-6 py-5 sm:px-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center border border-red-500/20">
                                    <Ambulance size={22} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <h3 className="font-extrabold text-slate-900 text-lg sm:text-xl tracking-tight">
                                            {selectedAmbulance.vehicleNumber || 'Unregistered'}
                                        </h3>
                                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-red-100/70 text-red-700 border border-red-200">
                                            {selectedAmbulance.vehicleType || 'Van'}
                                        </span>
                                        {renderStatusBadge(selectedAmbulance.profileStatus)}
                                    </div>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                        Submitted by: <strong className="text-slate-700">{selectedAmbulance.clinicId?.clinicName || selectedAmbulance.clinicId?.name || 'Clinic Partner'}</strong>
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsAuditModalOpen(false)}
                                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                            
                            {/* Rejection Alert if already Rejected */}
                            {selectedAmbulance.profileStatus === 'Rejected' && selectedAmbulance.rejectionReason && (
                                <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-start gap-3 text-rose-700 text-xs font-bold">
                                    <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="block font-black uppercase tracking-wide">Decline Reason:</strong>
                                        <p className="mt-0.5 font-medium">{selectedAmbulance.rejectionReason}</p>
                                    </div>
                                </div>
                            )}

                            {/* Section 1: Clinic & Driver Details */}
                            <div className="space-y-3">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <Building2 size={15} className="text-indigo-600" /> Clinic & Driver Profile
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                        <span className="text-[10px] font-black uppercase text-indigo-600 block">Clinic Details</span>
                                        <h5 className="font-black text-slate-900 text-sm">
                                            {selectedAmbulance.clinicId?.clinicName || selectedAmbulance.clinicId?.name || 'Clinic'}
                                        </h5>
                                        <p className="text-slate-600 font-bold">
                                            Phone: {selectedAmbulance.clinicId?.phoneNumber || 'N/A'}
                                        </p>
                                        <p className="text-slate-500">
                                            Address: {selectedAmbulance.clinicId?.address || selectedAmbulance.address || 'N/A'}
                                        </p>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                                        <span className="text-[10px] font-black uppercase text-red-600 block">Driver Details</span>
                                        <h5 className="font-black text-slate-900 text-sm">{selectedAmbulance.name}</h5>
                                        <p className="text-slate-600 font-bold">
                                            Phone: {selectedAmbulance.phone} • Email: {selectedAmbulance.email || 'N/A'}
                                        </p>
                                        <p className="text-slate-500">
                                            Blood Group: {selectedAmbulance.bloodGroup || 'B+'} • Exp: {selectedAmbulance.experienceYears || '0'} Years • Radius: {selectedAmbulance.serviceRadius || '15 km'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: On-Board Medical Staff & Pricing */}
                            <div className="space-y-3">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <HeartPulse size={15} className="text-emerald-600" /> Medical Staff & Fare Specifications
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-2">
                                        <span className="text-[10px] font-black uppercase text-emerald-700 block">On-Board Medical Support</span>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">Nurse Available:</span>
                                            <span className="font-black text-emerald-700">
                                                {selectedAmbulance.supportStaff?.nurse?.available ? `Yes (₹${selectedAmbulance.supportStaff.nurse.price || 0})` : 'No'}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold text-slate-800">Doctor Available:</span>
                                            <span className="font-black text-indigo-700">
                                                {selectedAmbulance.supportStaff?.doctor?.available ? `Yes (₹${selectedAmbulance.supportStaff.doctor.price || 0})` : 'No'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                                        <span className="text-[10px] font-black uppercase text-slate-400 block">Fare Structure</span>
                                        <div className="grid grid-cols-2 gap-2 text-center">
                                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                                                <span className="text-[9px] text-slate-400 block font-bold">1-Way Base</span>
                                                <span className="text-xs font-black text-slate-800">₹{selectedAmbulance.pricing?.singleRidePrice || 400}</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                                                <span className="text-[9px] text-slate-400 block font-bold">Round Trip</span>
                                                <span className="text-xs font-black text-slate-800">₹{selectedAmbulance.pricing?.doubleRidePrice || 700}</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                                                <span className="text-[9px] text-slate-400 block font-bold">Base Distance</span>
                                                <span className="text-xs font-black text-slate-800">{selectedAmbulance.pricing?.baseDistance || 5} km</span>
                                            </div>
                                            <div className="bg-white p-2 rounded-xl border border-slate-200">
                                                <span className="text-[9px] text-slate-400 block font-bold">Extra Rate</span>
                                                <span className="text-xs font-black text-slate-800">₹{selectedAmbulance.pricing?.pricePerKM || 12}/km</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Statutory Document Attachments */}
                            <div className="space-y-3">
                                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block flex items-center gap-1.5 border-b border-slate-100 pb-2">
                                    <FileText size={15} className="text-red-600" /> Statutory Permits & Licenses
                                </span>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {[
                                        { key: 'drivingLicenseFile', label: 'Driving License', number: selectedAmbulance.drivingLicenseNumber },
                                        { key: 'rcFile', label: 'Vehicle RC Certificate', number: selectedAmbulance.rcNumber },
                                        { key: 'insuranceFile', label: 'Insurance Policy', number: selectedAmbulance.insuranceNumber },
                                        { key: 'fitnessCertificate', label: 'Fitness Certificate', number: null },
                                        { key: 'ambulancePermit', label: 'Ambulance Commercial Permit', number: null }
                                    ].map((doc) => {
                                        const filePath = selectedAmbulance.documents ? selectedAmbulance.documents[doc.key] : null;
                                        const fileUrl = getMediaUrl(filePath);

                                        return (
                                            <div
                                                key={doc.key}
                                                className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                                            >
                                                <div>
                                                    <span className="font-bold text-slate-800 block">{doc.label}</span>
                                                    {doc.number && (
                                                        <span className="text-[10px] font-mono text-slate-500 block">
                                                            No: {doc.number}
                                                        </span>
                                                    )}
                                                </div>

                                                {filePath ? (
                                                    <a
                                                        href={fileUrl}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-black text-[11px] transition shrink-0"
                                                    >
                                                        <span>View Document</span>
                                                        <ExternalLink size={12} />
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-400 font-semibold italic text-[11px] shrink-0">Not Uploaded</span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* Modal Action Bar (Approve / Reject) */}
                        <div className="px-6 py-4 sm:px-8 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-4 shrink-0">
                            {selectedAmbulance.profileStatus === 'Pending' ? (
                                <>
                                    <button
                                        type="button"
                                        disabled={actionProcessing}
                                        onClick={() => handleOpenRejectPrompt(selectedAmbulance._id)}
                                        className="px-6 py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-black uppercase tracking-wider rounded-2xl transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                    >
                                        <Ban size={14} />
                                        <span>Reject Application</span>
                                    </button>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            disabled={actionProcessing}
                                            onClick={() => setIsAuditModalOpen(false)}
                                            className="px-5 py-3 text-slate-500 hover:bg-slate-200 text-xs font-black uppercase tracking-wider rounded-2xl transition cursor-pointer"
                                        >
                                            Close
                                        </button>

                                        <button
                                            type="button"
                                            disabled={actionProcessing}
                                            onClick={() => handleApproveAmbulance(selectedAmbulance._id, selectedAmbulance.vehicleNumber)}
                                            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-600/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                        >
                                            {actionProcessing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} strokeWidth={3} />}
                                            <span>Approve & Enable Live</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAuditModalOpen(false)}
                                    className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-black uppercase tracking-wider rounded-2xl transition ml-auto cursor-pointer"
                                >
                                    Close
                                </button>
                            )}
                        </div>

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
                                Reject Ambulance Application
                            </h4>
                            <button
                                onClick={() => setRejectPromptOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Please provide a detailed justification for declining this ambulance registration. The clinic will be notified with this reason.
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
                                placeholder="e.g. Commercial vehicle insurance policy is expired. Please re-upload valid insurance policy."
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