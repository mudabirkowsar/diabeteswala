"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    Building2,
    MapPin,
    Phone,
    Mail,
    FileText,
    CheckCircle2,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Eye,
    X,
    RefreshCw,
    Award
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

export default function ClinicManagementPage() {
    // --- Core States ---
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Filtering & Pagination States ---
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(""); // '', 'Incomplete', 'Pending', 'Approved', 'Rejected'
    const [isActive, setIsActive] = useState(""); // '', 'true', 'false'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // --- Modal & Detail States ---
    const [selectedClinic, setSelectedClinic] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationType, setVerificationType] = useState('Approved'); // 'Approved' or 'Rejected'
    const [rejectionReason, setRejectionReason] = useState('');
    const [isImageZoomed, setIsImageZoomed] = useState(false);

    // --- Base Server URL Helper for Images and Documents ---
    const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return `${BASE_SERVER_URL}/${cleanPath}`;
    };

    // Default placeholder image if clinic image fails to load
    const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1631549916768-4119b255f926?q=80&w=150";

    // --- Fetch Clinics ---
    const fetchClinics = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 8,
                ...(search.trim() && { search: search.trim() }),
                ...(status && { status }),
                ...(isActive !== "" && { isActive: isActive === 'true' })
            };

            const response = await AdminAPI.getClinicsList(params);
            if (response && response.success) {
                setClinics(response.data);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.total || 0);
            } else {
                toast.error("Failed to load clinic list.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error fetching clinic database.");
        } finally {
            setLoading(false);
        }
    };

    // Trigger search and filters resetting pagination to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [search, status, isActive]);

    useEffect(() => {
        fetchClinics();
    }, [currentPage, status, isActive]);

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchClinics();
        }
    };

    // --- Toggle Clinic Directory Status (Active/Inactive) ---
    const handleToggleActive = async (id) => {
        setActionLoading(true);
        try {
            const response = await AdminAPI.toggleClinicActive(id);
            if (response && response.success) {
                toast.success(response.message || "Clinic status toggled.");
                fetchClinics(); // Refresh view
            } else {
                toast.error("Failed to update clinic directory status.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error updating status.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Submit Verification Decision (Approve / Reject) ---
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if (!selectedClinic) return;

        if (verificationType === 'Rejected' && !rejectionReason.trim()) {
            toast.error("Please enter a rejection reason.");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                status: verificationType,
                ...(verificationType === 'Rejected' && { rejectionReason: rejectionReason.trim() })
            };

            const response = await AdminAPI.approveRejectClinic(selectedClinic._id, payload);
            if (response && response.success) {
                toast.success(response.message || `Clinic verified as ${verificationType}.`);
                setShowVerifyModal(false);
                setRejectionReason('');
                setSelectedClinic(null);
                fetchClinics();
            } else {
                toast.error("Failed to process verification.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error during verification processing.");
        } finally {
            setActionLoading(false);
        }
    };

    const handleResetFilters = () => {
        setSearch("");
        setStatus("");
        setIsActive("");
        setCurrentPage(1);
    };

    return (
        <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <Building2 className="text-[#3d3f96]" /> Clinic Management
                    </h1>
                    <p className="text-slate-500 font-semibold text-xs mt-1">Review registrations, process approvals, and manage system access.</p>
                </div>
                <button
                    onClick={fetchClinics}
                    disabled={loading}
                    className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                    <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh List
                </button>
            </div>
            {/* --- FILTER & SEARCH BAR --- */}
            <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                    {/* Search Box */}
                    <div className="md:col-span-5 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by clinic name... (Press Enter)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyPress}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Verification Status Filter */}
                    <div className="md:col-span-3">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer"
                        >
                            <option value="">Verification Status (All)</option>
                            <option value="Incomplete">Incomplete</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>

                    {/* Directory Active Filter */}
                    <div className="md:col-span-3">
                        <select
                            value={isActive}
                            onChange={(e) => setIsActive(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-500 outline-none focus:border-[#3d3f96] focus:bg-white transition-all cursor-pointer"
                        >
                            <option value="">Visibility (All)</option>
                            <option value="true">Active Only</option>
                            <option value="false">Inactive Only</option>
                        </select>
                    </div>

                    {/* Reset Action */}
                    <div className="md:col-span-1 flex items-center justify-center">
                        <button
                            onClick={handleResetFilters}
                            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all text-center cursor-pointer"
                        >
                            Reset
                        </button>
                    </div>

                </div>
            </div>

            {/* --- CLINICS DATA TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Clinic Database...</p>
                </div>
            ) : clinics.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-center px-6 py-4 w-16">S No.</th>
                                    <th className="text-center px-6 py-4 w-24">Profile</th>
                                    <th className="text-left px-6 py-4">Clinic Identity</th>
                                    <th className="text-left px-6 py-4">Contact Details</th>
                                    <th className="text-left px-6 py-4">Location</th>
                                    <th className="text-center px-6 py-4">Verification</th>
                                    <th className="text-center px-6 py-4 w-28">Directory Status</th>
                                    <th className="text-center px-6 py-4 w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {clinics.map((clinic, index) => (
                                    <tr key={clinic._id} className="hover:bg-slate-50/40 transition-colors duration-150">

                                        {/* Serial Number */}
                                        <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                                            {String((currentPage - 1) * 8 + index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Image / Logo */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                                                <img
                                                    src={getMediaUrl(clinic.image) || PLACEHOLDER_IMAGE}
                                                    alt={clinic.clinicName}
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        {/* Clinic & Owner Identity */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-slate-800 tracking-tight leading-tight">{clinic.clinicName || "Unnamed Clinic"}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">Owner: {clinic.name}</p>
                                        </td>

                                        {/* Contact details */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                                                <Phone size={11} className="text-slate-350 shrink-0" />
                                                <span>{clinic.phoneNumber || "--"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold truncate max-w-[200px]">
                                                <Mail size={11} className="text-slate-350 shrink-0" />
                                                <span className="select-all">{clinic.email}</span>
                                            </div>
                                        </td>

                                        {/* Location detail */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold truncate max-w-[150px]">
                                                <MapPin size={13} className="text-rose-500 shrink-0" />
                                                <span>{clinic.city ? `${clinic.city}, ${clinic.state}` : "Unspecified"}</span>
                                            </div>
                                        </td>

                                        {/* Verification Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${clinic.Accountverify === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                clinic.Accountverify === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                                                    clinic.Accountverify === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                {clinic.Accountverify}
                                            </span>
                                        </td>

                                        {/* Visibility Toggle Slider */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(clinic._id)}
                                                    disabled={actionLoading}
                                                    className="focus:outline-none transition-colors duration-200"
                                                    title={clinic.isActive ? "Set Inactive" : "Set Active"}
                                                >
                                                    {clinic.isActive ? (
                                                        <ToggleRight className="text-[#3d3f96]" size={28} />
                                                    ) : (
                                                        <ToggleLeft className="text-slate-300" size={28} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>

                                        {/* Action Panel (View / Inspect details) */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => { setSelectedClinic(clinic); }}
                                                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all inline-flex items-center justify-center"
                                                title="Inspect Clinic Details"
                                            >
                                                <Eye size={14} />
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-24 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Building2 size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold px-4">No clinics matched your filter requirements.</p>
                </div>
            )}

            {/* --- PAGINATION WRAPPER --- */}
            {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1 || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold text-slate-500">Page {currentPage} of {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages || loading}
                        className="p-2 bg-white rounded-xl border border-slate-200 text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* --- CLINIC DETAIL / INSPECTION MODAL (Includes approval/rejection decision buttons) --- */}
            {selectedClinic && !showVerifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedClinic(null)} />

                    <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <button onClick={() => setSelectedClinic(null)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                            <X size={18} />
                        </button>

                        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6">Clinic Credentials & Info</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Profile Image & General details */}
                            <div className="space-y-4">
                                <div className="h-40 w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative cursor-zoom-in group">
                                    <img
                                        src={getMediaUrl(selectedClinic.image) || PLACEHOLDER_IMAGE}
                                        alt={selectedClinic.clinicName}
                                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                                        onClick={() => setIsImageZoomed(true)}
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Clinic Name</p>
                                    <p className="text-sm font-black text-slate-800 mt-0.5">{selectedClinic.clinicName || "Incomplete Details"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Email Address</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5 select-all">{selectedClinic.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Phone Details</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedClinic.phoneNumber || "--"}</p>
                                </div>
                            </div>

                            {/* Registration and Licensing Documents */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Medical Council Name</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedClinic.councilName || "Not Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Council Registration Number</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedClinic.councilNumber || "Not Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Active Medical License Number</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedClinic.licenseNumber || "Not Provided"}</p>
                                </div>

                                {/* Document Downloads / Previews */}
                                <div className="pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Attached Documents</p>
                                    {selectedClinic.licenseDocument && selectedClinic.licenseDocument.length > 0 ? (
                                        <a
                                            href={getMediaUrl(selectedClinic.licenseDocument[0])}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 p-3 bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100/50 text-[#3d3f96] rounded-xl text-xs font-bold transition-all w-full justify-between group"
                                        >
                                            <span className="flex items-center gap-1.5"><FileText size={14} /> License Certificate Document</span>
                                            <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-all" />
                                        </a>
                                    ) : (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs font-semibold text-slate-400">
                                            No licensing documents uploaded yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Rejection Notification box inside inspector if status is Rejected */}
                        {selectedClinic.Accountverify === 'Rejected' && selectedClinic.rejectionReason && (
                            <div className="mt-6 p-4 bg-red-50/60 rounded-2xl border border-red-100/50 flex items-start gap-2 text-left">
                                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-red-700 uppercase tracking-wide">Previously Stated Rejection Reason</p>
                                    <p className="text-[12px] text-red-600 font-semibold mt-0.5">{selectedClinic.rejectionReason}</p>
                                </div>
                            </div>
                        )}

                        {/* Verification decision interface inside inspector (Hidden on main page) */}
                        {selectedClinic.Accountverify !== 'Approved' && (
                            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    onClick={() => { setVerificationType('Rejected'); setShowVerifyModal(true); }}
                                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Reject Application
                                </button>
                                <button
                                    onClick={() => { setVerificationType('Approved'); setShowVerifyModal(true); }}
                                    className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    Approve Application
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Full-Screen Image Zoom View Overlay */}
                    {isImageZoomed && (
                        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm">
                            <button
                                type="button"
                                onClick={() => setIsImageZoomed(false)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                            <img
                                src={getMediaUrl(selectedClinic.image) || PLACEHOLDER_IMAGE}
                                alt={selectedClinic.clinicName}
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* --- APPROVAL / REJECTION CONFIRMATION MODAL --- */}
            {showVerifyModal && selectedClinic && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => { setShowVerifyModal(false); setRejectionReason(''); }} />

                    <form
                        onSubmit={handleVerifySubmit}
                        className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${verificationType === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#EB333C]'
                            }`}>
                            {verificationType === 'Approved' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        </div>

                        <h3 className="text-base font-black text-slate-900">
                            Confirm {verificationType === 'Approved' ? 'Approval' : 'Rejection'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            {verificationType === 'Approved'
                                ? `Are you sure you want to verify and approve "${selectedClinic.clinicName || "this clinic"}"? This will allow them to host their doctors and receive orders.`
                                : `Are you sure you want to reject the application for "${selectedClinic.clinicName || "this clinic"}"? This requires a mandatory rejection reason.`}
                        </p>

                        {/* Mandate Rejection Reason Field if rejecting */}
                        {verificationType === 'Rejected' && (
                            <div className="mt-4 text-left space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Rejection Reason</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter specific reasons (e.g. licensing documents are blurred or expired)..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-150 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:border-[#EB333C] focus:bg-white transition-all resize-none"
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <button
                                type="button"
                                onClick={() => { setShowVerifyModal(false); setRejectionReason(''); }}
                                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className={`py-3 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${verificationType === 'Approved'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-[#EB333C] hover:bg-red-700'
                                    }`}
                            >
                                {actionLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <span>Submit Decision</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

        </main>
    );
}