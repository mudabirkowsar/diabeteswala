"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    FlaskConical,
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
    Award,
    CreditCard,
    Check
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

export default function LabManagementPage() {
    // --- Core States ---
    const [labs, setLabs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Filtering & Pagination States ---
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState(""); // '', 'Pending', 'Approved', 'Rejected'
    const [isActive, setIsActive] = useState(""); // '', 'true', 'false'
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // --- Modal & Detail States ---
    const [selectedLab, setSelectedLab] = useState(null);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verificationType, setVerificationType] = useState('Approved'); // 'Approved' or 'Rejected'
    const [rejectionReason, setRejectionReason] = useState('');
    const [isImageZoomed, setIsImageZoomed] = useState(false);
    const [zoomedImageUrl, setZoomedImageUrl] = useState('');

    // --- Base Server URL Helper for Images and Documents ---
    // Defaults to the specified IP and port provided in your example
    const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

    const getMediaUrl = (path) => {
        if (!path) return null;
        if (path.startsWith("http://") || path.startsWith("https://")) {
            return path;
        }
        
        // Convert Windows backslashes "public\\uploads\\..." to forward slashes "public/uploads/..."
        let cleanPath = path.replace(/\\/g, '/');
        
        // Strip the leading "public/" segment since static folders are served from root
        if (cleanPath.startsWith("public/")) {
            cleanPath = cleanPath.substring(7);
        }
        
        // Strip any remaining leading slashes
        if (cleanPath.startsWith("/")) {
            cleanPath = cleanPath.substring(1);
        }
        
        return `${BASE_SERVER_URL}/${cleanPath}`;
    };

    // Default placeholder image if laboratory profile image fails to load
    const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1579165466541-71e22690a559?q=80&w=150";

    // --- Fetch Labs ---
    const fetchLabs = async () => {
        setLoading(true);
        try {
            const params = {
                page: currentPage,
                limit: 8,
                ...(search.trim() && { search: search.trim() }),
                ...(status && { status }),
                ...(isActive !== "" && { isActive: isActive === 'true' })
            };

            const response = await AdminAPI.getLabsList(params);
            if (response && response.success) {
                setLabs(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalCount(response.total || 0);
            } else {
                toast.error("Failed to load laboratory list.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error fetching laboratory database.");
        } finally {
            setLoading(false);
        }
    };

    // Trigger search and filters resetting pagination to page 1
    useEffect(() => {
        setCurrentPage(1);
    }, [search, status, isActive]);

    useEffect(() => {
        fetchLabs();
    }, [currentPage, status, isActive]);

    const handleSearchKeyPress = (e) => {
        if (e.key === 'Enter') {
            fetchLabs();
        }
    };

    // --- Toggle Lab Directory Status (Active/Inactive) ---
    const handleToggleActive = async (id) => {
        setActionLoading(true);
        try {
            const response = await AdminAPI.toggleLabActive(id);
            if (response && response.success) {
                toast.success(response.message || "Laboratory status updated.");
                fetchLabs(); // Refresh view
            } else {
                toast.error("Failed to update status.");
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
        if (!selectedLab) return;

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

            const response = await AdminAPI.approveRejectLab(selectedLab._id, payload);
            if (response && response.success) {
                toast.success(response.message || `Lab profile verification finalized as ${verificationType}.`);
                setShowVerifyModal(false);
                setRejectionReason('');
                setSelectedLab(null);
                fetchLabs();
            } else {
                toast.error("Failed to process profile verification.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error processing profile validation.");
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

    const triggerImageZoom = (path) => {
        const url = getMediaUrl(path) || PLACEHOLDER_IMAGE;
        setZoomedImageUrl(url);
        setIsImageZoomed(true);
    };

    return (
        <main className="min-h-screen py-0 px-0 sm:px-6 lg:px-0 antialiased select-none">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <FlaskConical className="text-[#3d3f96]" /> Lab Management
                    </h1>
                    <p className="text-slate-500 font-semibold text-xs mt-1">Review diagnostic center registrations, view licenses, and control directory visibility.</p>
                </div>
                <button
                    onClick={fetchLabs}
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
                            placeholder="Search by lab name... (Press Enter)"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearchKeyPress}
                            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all"
                        />
                    </div>

                    {/* Profile Validation Filter */}
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

                    {/* Platform Active Toggle Filter */}
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

            {/* --- LAB DATA TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Lab Database...</p>
                </div>
            ) : labs.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                            <thead>
                                <tr className="text-[11px] font-black uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                                    <th className="text-center px-6 py-4 w-16">S No.</th>
                                    <th className="text-center px-6 py-4 w-24">Profile</th>
                                    <th className="text-left px-6 py-4">Lab Identity</th>
                                    <th className="text-left px-6 py-4">Contact Details</th>
                                    <th className="text-left px-6 py-4">Location</th>
                                    <th className="text-center px-6 py-4">Verification</th>
                                    <th className="text-center px-6 py-4 w-28">Directory Status</th>
                                    <th className="text-center px-6 py-4 w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {labs.map((lab, index) => (
                                    <tr key={lab._id} className="hover:bg-slate-50/40 transition-colors duration-150">

                                        {/* Serial Number */}
                                        <td className="px-6 py-4 text-center font-bold text-slate-400 text-xs">
                                            {String((currentPage - 1) * 8 + index + 1).padStart(2, "0")}
                                        </td>

                                        {/* Profile Picture */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden shadow-sm">
                                                <img
                                                    src={getMediaUrl(lab.profileImage) || PLACEHOLDER_IMAGE}
                                                    alt={lab.name}
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>

                                        {/* Lab Identity */}
                                        <td className="px-6 py-4">
                                            <h3 className="font-bold text-slate-800 tracking-tight leading-tight">{lab.name || "Unnamed Laboratory"}</h3>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1.5 truncate max-w-[200px]">
                                                {lab.about || "Diagnostic Lab"}
                                            </p>
                                        </td>

                                        {/* Contact Details */}
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold">
                                                <Phone size={11} className="text-slate-350 shrink-0" />
                                                <span>{lab.phone || "--"}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-semibold truncate max-w-[200px]">
                                                <Mail size={11} className="text-slate-350 shrink-0" />
                                                <span className="select-all">{lab.email}</span>
                                            </div>
                                        </td>

                                        {/* Location */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-bold truncate max-w-[150px]">
                                                <MapPin size={13} className="text-rose-500 shrink-0" />
                                                <span>{lab.city ? `${lab.city}, ${lab.state}` : "Unspecified"}</span>
                                            </div>
                                        </td>

                                        {/* Profile Status */}
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md border ${lab.profileStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                lab.profileStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                                                    lab.profileStatus === 'Rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}>
                                                {lab.profileStatus}
                                            </span>
                                        </td>

                                        {/* Directory Toggle Status */}
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleToggleActive(lab._id)}
                                                    disabled={actionLoading}
                                                    className="focus:outline-none transition-colors duration-200"
                                                    title={lab.isActive ? "Set Inactive" : "Set Active"}
                                                >
                                                    {lab.isActive ? (
                                                        <ToggleRight className="text-[#3d3f96]" size={28} />
                                                    ) : (
                                                        <ToggleLeft className="text-slate-300" size={28} />
                                                    )}
                                                </button>
                                            </div>
                                        </td>

                                        {/* View Details Action */}
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => { setSelectedLab(lab); }}
                                                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60 transition-all inline-flex items-center justify-center"
                                                title="Inspect Lab Details"
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
                    <FlaskConical size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-500 font-bold px-4">No diagnostic labs matched your filter requirements.</p>
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

            {/* --- LAB INSPECTION MODAL --- */}
            {selectedLab && !showVerifyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedLab(null)} />

                    <div className="bg-white rounded-[2.5rem] max-w-4xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        <button onClick={() => setSelectedLab(null)} className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all">
                            <X size={18} />
                        </button>

                        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
                            <FlaskConical className="text-[#3d3f96]" size={20} /> Diagnostic Lab Credentials & Info
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Left Column: Core Identity & Offerings */}
                            <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                                <div className="h-40 w-full rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden relative cursor-zoom-in group">
                                    <img
                                        src={getMediaUrl(selectedLab.profileImage) || PLACEHOLDER_IMAGE}
                                        alt={selectedLab.name}
                                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-[1.02]"
                                        onClick={() => triggerImageZoom(selectedLab.profileImage)}
                                    />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Lab Name</p>
                                    <p className="text-sm font-black text-slate-800 mt-0.5">{selectedLab.name || "Incomplete Details"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Email Address</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5 select-all">{selectedLab.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Contact Number</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedLab.phone || "--"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Rating & Reviews</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <Award size={14} className="text-amber-500" />
                                        <span className="text-xs font-bold text-slate-700">{selectedLab.rating || "0"} / 5</span>
                                        <span className="text-[10px] font-semibold text-slate-400">({selectedLab.totalReviews || 0} reviews)</span>
                                    </div>
                                </div>

                                {/* Platform Parameters */}
                                <div className="pt-2 border-t border-slate-50 space-y-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Services & Facilities</p>
                                    <div className="grid grid-cols-1 gap-2">
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Check size={14} className={selectedLab.isHomeCollectionAvailable ? "text-emerald-500" : "text-slate-300"} />
                                            <span>Home Sample Collection</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Check size={14} className={selectedLab.isRapidServiceAvailable ? "text-emerald-500" : "text-slate-300"} />
                                            <span>Rapid Service Available</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Check size={14} className={selectedLab.is24x7 ? "text-emerald-500" : "text-slate-300"} />
                                            <span>24x7 Services</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                            <Check size={14} className={selectedLab.isInsuranceAccepted ? "text-emerald-500" : "text-slate-300"} />
                                            <span>Insurance Accepted</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Middle Column: Registration & Certification Details */}
                            <div className="md:col-span-1 space-y-4 border-r border-slate-100 pr-0 md:pr-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">NABL License Number</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedLab.documents?.nablNumber || "Not Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">GST Identification Number</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedLab.documents?.gstNumber || "Not Provided"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Experience / Age of Lab</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedLab.documents?.experience || "Not Stated"}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Issuing Authority & State</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                                        {selectedLab.documents?.issuingAuthority || "N/A"} 
                                        {selectedLab.documents?.documentState ? ` (${selectedLab.documents.documentState})` : ""}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Diagnostic Drug License Type</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5">{selectedLab.documents?.drugLicenseType || "None"}</p>
                                </div>
                                <div className="pt-2 border-t border-slate-50">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Operational Address</p>
                                    <p className="text-xs font-bold text-slate-700 mt-0.5 leading-relaxed">
                                        {selectedLab.address || "No complete physical address listed."}
                                    </p>
                                </div>
                            </div>

                            {/* Right Column: Bank Details & Uploaded Certificates */}
                            <div className="md:col-span-1 space-y-4">
                                {/* Bank Details sub-card */}
                                <div className="bg-slate-50 border border-slate-100/80 p-4 rounded-2xl">
                                    <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                                        <CreditCard size={12} className="text-[#3d3f96]" /> Settlement Bank Details
                                    </h4>
                                    {selectedLab.bankDetails ? (
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-semibold">Bank Name:</span>
                                                <span className="font-bold text-slate-700 truncate max-w-[120px]">{selectedLab.bankDetails.bankName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-semibold">Holder:</span>
                                                <span className="font-bold text-slate-700 truncate max-w-[120px]">{selectedLab.bankDetails.accountHolderName || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-semibold">A/C Number:</span>
                                                <span className="font-bold text-slate-700">{selectedLab.bankDetails.accountNumber || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-semibold">IFSC Code:</span>
                                                <span className="font-bold text-slate-700">{selectedLab.bankDetails.ifscCode || "N/A"}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-400 font-semibold">Type:</span>
                                                <span className="font-bold text-slate-700">{selectedLab.bankDetails.accountType || "N/A"}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-[11px] font-semibold text-slate-400 text-center py-2">Bank details not set up yet.</p>
                                    )}
                                </div>

                                {/* Attached Certification Docs */}
                                <div className="space-y-2 pt-2">
                                    <p className="text-[10px] font-black uppercase text-slate-400">Attached Documents</p>
                                    
                                    {/* Lab Certificates */}
                                    {selectedLab.documents?.labCertificates?.length > 0 ? (
                                        <a
                                            href={getMediaUrl(selectedLab.documents.labCertificates[0])}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 p-2.5 bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50 text-[#3d3f96] rounded-xl text-xs font-bold transition-all w-full justify-between group"
                                        >
                                            <span className="flex items-center gap-1.5"><FileText size={13} /> NABL Certificate</span>
                                            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-all" />
                                        </a>
                                    ) : null}

                                    {/* Lab Licenses */}
                                    {selectedLab.documents?.labLicenses?.length > 0 ? (
                                        <a
                                            href={getMediaUrl(selectedLab.documents.labLicenses[0])}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 p-2.5 bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50 text-[#3d3f96] rounded-xl text-xs font-bold transition-all w-full justify-between group"
                                        >
                                            <span className="flex items-center gap-1.5"><FileText size={13} /> Laboratory License</span>
                                            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-all" />
                                        </a>
                                    ) : null}

                                    {/* GST Certificates */}
                                    {selectedLab.documents?.gstCertificates?.length > 0 ? (
                                        <a
                                            href={getMediaUrl(selectedLab.documents.gstCertificates[0])}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 p-2.5 bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50 text-[#3d3f96] rounded-xl text-xs font-bold transition-all w-full justify-between group"
                                        >
                                            <span className="flex items-center gap-1.5"><FileText size={13} /> GST Registration File</span>
                                            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-all" />
                                        </a>
                                    ) : null}

                                    {/* Other Certificates */}
                                    {selectedLab.documents?.otherCertificates?.length > 0 ? (
                                        <a
                                            href={getMediaUrl(selectedLab.documents.otherCertificates[0])}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 p-2.5 bg-indigo-50/40 hover:bg-indigo-50 border border-indigo-100/50 text-[#3d3f96] rounded-xl text-xs font-bold transition-all w-full justify-between group"
                                        >
                                            <span className="flex items-center gap-1.5"><FileText size={13} /> Other Documents</span>
                                            <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-all" />
                                        </a>
                                    ) : null}

                                    {/* Other Certificates fallback notice if none exist */}
                                    {(!selectedLab.documents?.labCertificates?.length && !selectedLab.documents?.labLicenses?.length && !selectedLab.documents?.gstCertificates?.length && !selectedLab.documents?.otherCertificates?.length) && (
                                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs font-semibold text-slate-400">
                                            No licensing documents attached yet.
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>

                        {/* Rejection Notification Indicator */}
                        {selectedLab.profileStatus === 'Rejected' && selectedLab.rejectionReason && (
                            <div className="mt-6 p-4 bg-red-50/60 rounded-2xl border border-red-100/50 flex items-start gap-2 text-left">
                                <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-red-700 uppercase tracking-wide">Previously Stated Rejection Reason</p>
                                    <p className="text-[12px] text-red-600 font-semibold mt-0.5">{selectedLab.rejectionReason}</p>
                                </div>
                            </div>
                        )}

                        {/* Verification controls */}
                        {selectedLab.profileStatus !== 'Approved' && (
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
                                src={zoomedImageUrl}
                                alt="Zoomed document"
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* --- APPROVAL / REJECTION CONFIRMATION MODAL --- */}
            {showVerifyModal && selectedLab && (
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
                                ? `Are you sure you want to verify and approve "${selectedLab.name || "this laboratory"}"? This will allow them to launch services and accept diagnostic bookings.`
                                : `Are you sure you want to reject the application for "${selectedLab.name || "this laboratory"}"? This action requires a mandatory explanation.`}
                        </p>

                        {/* Mandate Rejection Reason Field if rejecting */}
                        {verificationType === 'Rejected' && (
                            <div className="mt-4 text-left space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Rejection Reason</label>
                                <textarea
                                    rows={4}
                                    placeholder="Enter specific reasons (e.g. NABL license details are blurry, incomplete, or expired)..."
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