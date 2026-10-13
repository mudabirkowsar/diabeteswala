"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    Building2,
    MapPin,
    Phone,
    Mail,
    ChevronLeft,
    ChevronRight,
    Loader2,
    ToggleLeft,
    ToggleRight,
    Eye,
    RefreshCw,
    CheckCircle2,
    XCircle
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

// Import the newly created 360 Clinic Detail Component
import ClinicDetail from './components/ClinicDetail';

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

    // --- Detail Modal States ---
    const [selectedClinicId, setSelectedClinicId] = useState(null);

    // --- Verification Decision Modal States ---
    const [decisionClinic, setDecisionClinic] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationType, setVerificationType] = useState('Approved'); // 'Approved' or 'Rejected'
    const [rejectionReason, setRejectionReason] = useState('');

    // --- Base Server URL Helper for Images ---
    const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        const cleanPath = path.startsWith("/") ? path.substring(1) : path;
        return `${BASE_SERVER_URL}/${cleanPath}`;
    };

    // Default placeholder image
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

    // Reset pagination to page 1 on filter/search change
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
                fetchClinics();
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

    // Open verification decision modal (called from table or from inside ClinicDetail)
    const handleTriggerDecision = (clinic, type) => {
        setDecisionClinic(clinic);
        setVerificationType(type);
        setRejectionReason('');
        setShowVerifyModal(true);
    };

    // --- Submit Verification Decision (Approve / Reject) ---
    const handleVerifySubmit = async (e) => {
        e.preventDefault();
        if (!decisionClinic) return;

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

            const response = await AdminAPI.approveRejectClinic(decisionClinic._id, payload);
            if (response && response.success) {
                toast.success(response.message || `Clinic verified as ${verificationType}.`);
                setShowVerifyModal(false);
                setRejectionReason('');
                setDecisionClinic(null);
                setSelectedClinicId(null); // Close detail modal if open
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
                    <p className="text-slate-500 font-semibold text-xs mt-1">
                        Review registrations, process approvals, inspect 360° dossiers, and manage platform directory visibility.
                    </p>
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
                            <option value="">Directory Visibility (All)</option>
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
                                    <th className="text-center px-6 py-4 w-28">360° Dossier</th>
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
                                            <h3 className="font-bold text-slate-800 tracking-tight leading-tight">
                                                {clinic.clinicName || "Unnamed Clinic"}
                                            </h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5">
                                                Owner: {clinic.name}
                                            </p>
                                        </td>

                                        {/* Contact Details */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                                                <Phone size={11} className="text-slate-400 shrink-0" />
                                                <span>{clinic.phoneNumber || "--"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold truncate max-w-[200px]">
                                                <Mail size={11} className="text-slate-400 shrink-0" />
                                                <span className="select-all">{clinic.email}</span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold truncate max-w-[150px]">
                                                <MapPin size={13} className="text-rose-500 shrink-0" />
                                                <span>{clinic.city ? `${clinic.city}, ${clinic.state}` : "Unspecified"}</span>
                                            </div>
                                        </td>

                                        {/* Verification Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${
                                                clinic.Accountverify === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
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
                                                    className="focus:outline-none transition-colors duration-200 cursor-pointer"
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

                                        {/* Action: Open 360 Clinic Dossier Modal */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => setSelectedClinicId(clinic._id)}
                                                className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50/70 text-slate-600 hover:text-[#3d3f96] border border-slate-200/60 transition-all inline-flex items-center justify-center cursor-pointer group"
                                                title="Open 360° Clinic Dossier"
                                            >
                                                <Eye size={15} className="group-hover:scale-110 transition-transform" />
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

            {/* --- 360° CLINIC DETAIL DOSSIER MODAL --- */}
            {selectedClinicId && (
                <ClinicDetail
                    clinicId={selectedClinicId}
                    onClose={() => setSelectedClinicId(null)}
                    onActionSuccess={() => {
                        fetchClinics();
                        setSelectedClinicId(null);
                    }}
                    onTriggerDecision={handleTriggerDecision}
                />
            )}

            {/* --- APPROVAL / REJECTION CONFIRMATION MODAL --- */}
            {showVerifyModal && decisionClinic && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div 
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" 
                        onClick={() => { setShowVerifyModal(false); setRejectionReason(''); }} 
                    />

                    <form
                        onSubmit={handleVerifySubmit}
                        className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl border border-slate-100 relative z-10 text-center"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 mx-auto ${
                            verificationType === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-[#EB333C]'
                        }`}>
                            {verificationType === 'Approved' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        </div>

                        <h3 className="text-base font-black text-slate-900">
                            Confirm {verificationType === 'Approved' ? 'Approval' : 'Rejection'}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                            {verificationType === 'Approved'
                                ? `Are you sure you want to verify and approve "${decisionClinic.clinicName || "this clinic"}"? This activates their public profile and allows doctors to practice.`
                                : `Are you sure you want to reject the application for "${decisionClinic.clinicName || "this clinic"}"? A specific rejection explanation is required.`}
                        </p>

                        {/* Rejection Reason textarea */}
                        {verificationType === 'Rejected' && (
                            <div className="mt-4 text-left space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    Rejection Reason
                                </label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter specific reasons (e.g. invalid medical council registration or blurred license certificate)..."
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-700 outline-none focus:border-[#EB333C] focus:bg-white transition-all resize-none"
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3 w-full mt-6">
                            <button
                                type="button"
                                onClick={() => { setShowVerifyModal(false); setRejectionReason(''); }}
                                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className={`py-3 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
                                    verificationType === 'Approved'
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