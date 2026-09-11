"use client";

import React, { useState, useEffect } from "react";
import { 
    Stethoscope, 
    Search, 
    CheckCircle2, 
    AlertCircle, 
    X, 
    Phone, 
    Mail, 
    MapPin, 
    Eye, 
    Loader2, 
    ShieldCheck, 
    Check, 
    Ban, 
    FileText, 
    Clock, 
    IndianRupee, 
    Award, 
    Building2, 
    Globe, 
    Users, 
    Inbox,
    ChevronLeft,
    ChevronRight,
    GraduationCap
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

// Import Admin API service
import AdminAPI from "../../../../services/AdminAPI";

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const DOCTOR_PLACEHOLDER = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200";

export default function AdminDoctorManagementPage() {
    // --- Navigation Views ('all' | 'approved_directory') ---
    const [viewMode, setViewMode] = useState("all");

    // --- Data & Loading States ---
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // --- Pagination State ---
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        total: 0
    });

    // --- Filters & Search States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState("All"); // 'All' | 'Pending' | 'Approved' | 'Rejected' | 'Incomplete'
    const [selectedActiveStatus, setSelectedActiveStatus] = useState("All"); // 'All' | 'true' | 'false'

    // --- Inspect Modal Target ---
    const [inspectDoctor, setInspectDoctor] = useState(null);

    // --- Rejection Dialog States ---
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // --- 1. Fetch All Doctors List (With Dynamic Filters) ---
    const fetchDoctors = async (page = 1) => {
        setLoading(true);
        try {
            if (viewMode === "approved_directory") {
                const response = await AdminAPI.getApprovedDoctorsList({ page });
                if (response && response.success) {
                    setDoctors(response.data || []);
                    setPagination({
                        currentPage: response.currentPage || 1,
                        totalPages: response.totalPages || 1,
                        total: response.count || 0
                    });
                }
            } else {
                const params = {
                    page,
                    limit: 10,
                    ...(searchQuery.trim() && { search: searchQuery.trim() }),
                    ...(selectedStatus !== "All" && { status: selectedStatus }),
                    ...(selectedActiveStatus !== "All" && { isActive: selectedActiveStatus })
                };
                const response = await AdminAPI.getAdminDoctorsList(params);
                if (response && response.success) {
                    setDoctors(response.data || []);
                    setPagination({
                        currentPage: response.currentPage || 1,
                        totalPages: response.totalPages || 1,
                        total: response.total || 0
                    });
                }
            }
        } catch (err) {
            console.error("Error retrieving doctors directory:", err);
            toast.error("Failed to load doctors master ledger.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoctors(1);
    }, [viewMode, selectedStatus, selectedActiveStatus, searchQuery]);

    // --- 2. Approve or Reject Doctor Profile Status ---
    const handleUpdateStatus = async (id, status, reason = null) => {
        if (status === "Rejected" && !reason?.trim()) {
            toast.error("Please provide a justification for rejecting this doctor.");
            return;
        }

        setActionLoading(true);
        try {
            const payload = {
                status,
                ...(reason && { rejectionReason: reason.trim() })
            };
            const response = await AdminAPI.approveRejectDoctorProfile(id, payload);
            if (response && response.success) {
                toast.success(response.message || `Doctor profile marked as ${status}`);
                setShowRejectForm(false);
                setRejectionReason("");
                if (inspectDoctor && inspectDoctor._id === id) {
                    setInspectDoctor(prev => ({ ...prev, profileStatus: status, rejectionReason: reason }));
                }
                fetchDoctors(pagination.currentPage);
            }
        } catch (err) {
            console.error("Error updating doctor verification status:", err);
            toast.error(err.response?.data?.message || "Failed to update verification status.");
        } finally {
            setActionLoading(false);
        }
    };

    // --- 3. Toggle Doctor Active / Inactive Status ---
    const handleToggleActive = async (doctor) => {
        setTogglingId(doctor._id);
        try {
            const response = await AdminAPI.toggleDoctorActiveStatus(doctor._id);
            if (response && response.success) {
                toast.success(response.message || "Account status modified.");
                setDoctors(prev => prev.map(doc => 
                    doc._id === doctor._id ? { ...doc, isActive: !doc.isActive } : doc
                ));
                if (inspectDoctor && inspectDoctor._id === doctor._id) {
                    setInspectDoctor(prev => ({ ...prev, isActive: !prev.isActive }));
                }
            }
        } catch (err) {
            console.error("Error toggling doctor active status:", err);
            toast.error(err.response?.data?.message || "Failed to toggle active status.");
        } finally {
            setTogglingId(null);
        }
    };

    // Open Inspect Modal
    const handleOpenInspect = (doc) => {
        setInspectDoctor(doc);
        setShowRejectForm(false);
        setRejectionReason("");
    };

    // --- Helper: Status Badge Render ---
    const renderVerificationBadge = (status) => {
        const uppercase = status?.toUpperCase();
        if (uppercase === "APPROVED") {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1 w-fit mx-auto">
                    <CheckCircle2 size={11} /> Approved
                </span>
            );
        }
        if (uppercase === "REJECTED") {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 flex items-center gap-1 w-fit mx-auto">
                    <AlertCircle size={11} /> Rejected
                </span>
            );
        }
        if (uppercase === "INCOMPLETE") {
            return (
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1 w-fit mx-auto">
                    <Clock size={11} /> Incomplete
                </span>
            );
        }
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1 w-fit mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Pending Review
            </span>
        );
    };

    const statusOptions = ["All", "Pending", "Approved", "Rejected", "Incomplete"];

    return (
        <div className="max-w-[1550px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left text-slate-800">
            <Toaster position="top-right" />

            {/* --- FILTERS & SEARCH ROW --- */}
            {viewMode === "all" && (
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                        
                        {/* Search Input */}
                        <div className="relative w-full lg:w-96">
                            <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Search by Doctor Name (e.g. Ramesh)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                            />
                        </div>

                        {/* Status Tabs & Active Filters */}
                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden pb-1 lg:pb-0">
                                {statusOptions.map((status) => {
                                    const isSelected = selectedStatus === status;
                                    return (
                                        <button
                                            key={status}
                                            onClick={() => setSelectedStatus(status)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${
                                                isSelected
                                                    ? "bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm"
                                                    : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                                            }`}
                                        >
                                            {status === "All" ? "All Doctors" : status}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Active/Inactive Select */}
                            <select
                                value={selectedActiveStatus}
                                onChange={(e) => setSelectedActiveStatus(e.target.value)}
                                className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition cursor-pointer"
                            >
                                <option value="All">All Accounts</option>
                                <option value="true">Active Only</option>
                                <option value="false">Inactive Only</option>
                            </select>
                        </div>

                    </div>
                </div>
            )}

            {/* --- DOCTORS TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading doctors directory...</p>
                </div>
            ) : doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Doctors Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No independent doctors match your current search and verification filters.
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-4 px-6 text-center w-16">S No.</th>
                                    <th className="py-4 px-6">Doctor Profile</th>
                                    <th className="py-4 px-6">Speciality &amp; Degree</th>
                                    <th className="py-4 px-6">Consulting Fees</th>
                                    <th className="py-4 px-6">Location</th>
                                    <th className="py-4 px-6 text-center">Verification Status</th>
                                    <th className="py-4 px-6 text-center">Account Active</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {doctors.map((doc, index) => {
                                    const docImg = getMediaUrl(doc.profileImage) || DOCTOR_PLACEHOLDER;
                                    const isToggling = togglingId === doc._id;

                                    return (
                                        <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">
                                            
                                            {/* Serial Number */}
                                            <td className="py-4 px-6 text-center font-bold text-slate-400 text-xs">
                                                {String((pagination.currentPage - 1) * 10 + (index + 1)).padStart(2, "0")}
                                            </td>

                                            {/* Doctor Avatar & Contact */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                        <img 
                                                            src={docImg} 
                                                            alt={doc.name} 
                                                            className="w-full h-full object-cover" 
                                                            onError={(e) => { e.currentTarget.src = DOCTOR_PLACEHOLDER; }} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-900 font-black text-sm block">{doc.name}</strong>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mt-0.5">
                                                            {doc.phone}
                                                        </span>
                                                        <span className="text-[10px] text-slate-400 block truncate max-w-[150px] font-medium">
                                                            {doc.email}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Speciality & Qualification */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-0.5">
                                                    <strong className="text-xs font-extrabold text-slate-800 block">
                                                        {doc.speciality || "General Practitioner"}
                                                    </strong>
                                                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">
                                                        {doc.qualification || "MBBS"} • <span className="text-[#3d3f96] font-black">{doc.experienceYears ? `${doc.experienceYears} Yrs Exp.` : "Fresher"}</span>
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Consulting Fees Breakdown */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-0.5 text-[11px] font-mono font-bold">
                                                    {doc.fees?.online !== undefined && (
                                                        <p className="text-emerald-600">Online: ₹{doc.fees.online}</p>
                                                    )}
                                                    {doc.fees?.clinic !== undefined && (
                                                        <p className="text-slate-800">Clinic: ₹{doc.fees.clinic}</p>
                                                    )}
                                                    {doc.fees?.home !== undefined && (
                                                        <p className="text-purple-700">Home: ₹{doc.fees.home}</p>
                                                    )}
                                                </div>
                                            </td>

                                            {/* City & State */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                                                    <MapPin size={13} className="text-rose-500 shrink-0" />
                                                    <span>{doc.city || "Mohali"}, {doc.state || "Punjab"}</span>
                                                </div>
                                            </td>

                                            {/* Profile Status */}
                                            <td className="py-4 px-6 text-center">
                                                {renderVerificationBadge(doc.profileStatus)}
                                            </td>

                                            {/* Active Switch Toggle */}
                                            <td className="py-4 px-6 text-center">
                                                {isToggling ? (
                                                    <Loader2 size={16} className="animate-spin text-[#3d3f96] mx-auto" />
                                                ) : (
                                                    <label className="relative inline-flex items-center cursor-pointer justify-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={doc.isActive}
                                                            onChange={() => handleToggleActive(doc)}
                                                            className="sr-only peer"
                                                        />
                                                        <div className="w-10 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3d3f96]" />
                                                    </label>
                                                )}
                                            </td>

                                            {/* Action Inspect Button */}
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenInspect(doc)}
                                                    className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>Inspect</span>
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-bold">
                                Total Records: {pagination.total}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={pagination.currentPage <= 1}
                                    onClick={() => fetchDoctors(pagination.currentPage - 1)}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs hover:bg-slate-50 transition"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-black text-slate-800 px-2">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </span>
                                <button
                                    disabled={pagination.currentPage >= pagination.totalPages}
                                    onClick={() => fetchDoctors(pagination.currentPage + 1)}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs hover:bg-slate-50 transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- DOCTOR FULL KYC & DETAILS INSPECTION MODAL --- */}
            {inspectDoctor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none antialiased">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left space-y-6">
                        
                        {/* Close Button */}
                        <button
                            onClick={() => setInspectDoctor(null)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        {/* Modal Header */}
                        <div className="border-b border-slate-100 pb-4 pr-10">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Stethoscope size={20} className="text-[#3d3f96]" /> Review Doctor Profile &amp; KYC
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Verify medical council registrations, certificates, consultation modes, and ledger credentials.
                            </p>
                        </div>

                        <div className="space-y-6">
                            
                            {/* Doctor Info Card */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#3d3f96]/5 border border-[#3d3f96]/10">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0">
                                        <img 
                                            src={getMediaUrl(inspectDoctor.profileImage) || DOCTOR_PLACEHOLDER} 
                                            alt={inspectDoctor.name} 
                                            className="w-full h-full object-cover" 
                                            onError={(e) => { e.currentTarget.src = DOCTOR_PLACEHOLDER; }} 
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-base font-black text-slate-900">{inspectDoctor.name}</h2>
                                            {renderVerificationBadge(inspectDoctor.profileStatus)}
                                        </div>
                                        <p className="text-xs text-[#3d3f96] font-bold mt-0.5">{inspectDoctor.speciality} • {inspectDoctor.qualification || "MBBS"}</p>
                                        <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                                            {inspectDoctor.experienceYears ? `${inspectDoctor.experienceYears} Years Experience` : "Experience not specified"}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-right shrink-0">
                                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Council Registration</span>
                                    <span className="font-extrabold text-slate-800 text-xs font-mono">{inspectDoctor.councilNumber || inspectDoctor.licenseNumber || "N/A"}</span>
                                    <span className="text-[10px] text-slate-500 block">{inspectDoctor.councilName || "Medical Council"}</span>
                                </div>
                            </div>

                            {/* Rejection Note if Present */}
                            {inspectDoctor.rejectionReason && (
                                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                                    <strong className="text-[10px] font-black uppercase text-rose-700 block">Rejection Justification</strong>
                                    <p className="text-rose-800 font-medium">{inspectDoctor.rejectionReason}</p>
                                </div>
                            )}

                            {/* Information Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                
                                {/* Personal & Contact Details */}
                                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                                    <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-200/50 pb-1">
                                        <Phone className="text-[#3d3f96]" size={13} /> Personal Monograph &amp; Contact
                                    </h4>
                                    <div className="space-y-1 text-slate-600 pt-1">
                                        <p>Phone: <strong className="text-[#3d3f96]">{inspectDoctor.phone}</strong></p>
                                        <p>Email: <strong className="text-slate-800">{inspectDoctor.email}</strong></p>
                                        <p>Gender: <span className="text-slate-800 font-semibold">{inspectDoctor.gender || "N/A"}</span></p>
                                        <p>Location: <span className="text-slate-700 font-semibold">{inspectDoctor.city || "Mohali"}, {inspectDoctor.state || "Punjab"}</span></p>
                                    </div>
                                </div>

                                {/* Medical Council & License Registration */}
                                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                                    <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-200/50 pb-1">
                                        <GraduationCap className="text-[#3d3f96]" size={15} /> Medical Council Registration
                                    </h4>
                                    <div className="space-y-1 text-slate-600 pt-1">
                                        <p>Council Name: <strong className="text-slate-800">{inspectDoctor.councilName || "N/A"}</strong></p>
                                        <p>Registration No: <strong className="text-slate-800 font-mono">{inspectDoctor.councilNumber || inspectDoctor.licenseNumber || "N/A"}</strong></p>
                                        <p>Active Practice: <strong className="text-slate-800">{inspectDoctor.experienceYears || 0} Years Exp.</strong></p>
                                    </div>
                                </div>

                            </div>

                            {/* Consulting Quotas & Availability Channel */}
                            <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 text-xs">
                                <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                                    <IndianRupee className="text-emerald-600" size={13} /> Consultation Modes &amp; Fees
                                </h4>
                                <div className="grid grid-cols-3 gap-3 text-center pt-1 font-bold">
                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Online Teleconsult</span>
                                        <span className="text-xs font-black text-emerald-600 font-mono">₹{inspectDoctor.fees?.online || 0}</span>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">{inspectDoctor.isOnlineAvailable ? "Channel Open" : "Closed"}</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Clinic In-Person</span>
                                        <span className="text-xs font-black text-slate-800 font-mono">₹{inspectDoctor.fees?.clinic || 0}</span>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">{inspectDoctor.isClinicAvailable ? "Channel Open" : "Closed"}</span>
                                    </div>
                                    <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-[9px] text-slate-400 font-bold uppercase block">Home Visit</span>
                                        <span className="text-xs font-black text-purple-700 font-mono">₹{inspectDoctor.fees?.home || 0}</span>
                                        <span className="text-[9px] text-slate-400 block mt-0.5">{inspectDoctor.isHomeAvailable ? "Channel Open" : "Closed"}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded KYC Documents */}
                            {inspectDoctor.documents && inspectDoctor.documents.length > 0 && (
                                <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3 text-xs">
                                    <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                                        <FileText className="text-[#3d3f96]" size={13} /> Uploaded Council Certificates &amp; Degrees ({inspectDoctor.documents.length})
                                    </h4>
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {inspectDoctor.documents.map((docPath, idx) => (
                                            <a
                                                key={idx}
                                                href={getMediaUrl(docPath)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#3d3f96] hover:bg-[#3d3f96] hover:text-white font-bold text-xs flex items-center gap-1.5 transition"
                                            >
                                                <FileText size={13} /> Certificate #{idx + 1}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Rejection Form Dialog */}
                            {showRejectForm && (
                                <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-3 animate-fadeIn text-xs">
                                    <label className="block text-xs font-black text-rose-800 uppercase">
                                        Justification for Rejection <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows={3}
                                        required
                                        placeholder="State reason (e.g. Medical Council License certificate is expired or blurred)..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="w-full p-3 bg-white rounded-xl border border-rose-300 text-xs font-semibold text-slate-800 outline-none focus:border-rose-500 resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowRejectForm(false)}
                                            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="button"
                                            disabled={actionLoading || !rejectionReason.trim()}
                                            onClick={() => handleUpdateStatus(inspectDoctor._id, "Rejected", rejectionReason)}
                                            className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-black text-white uppercase tracking-wider shadow-md disabled:opacity-50"
                                        >
                                            {actionLoading ? <Loader2 size={12} className="animate-spin inline mr-1" /> : null}
                                            Confirm Rejection
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Modal Footer Actions */}
                            {!showRejectForm && (
                                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-bold text-slate-400">Account Control:</span>
                                        <button
                                            type="button"
                                            onClick={() => handleToggleActive(inspectDoctor)}
                                            className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border transition ${
                                                inspectDoctor.isActive 
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                                    : "bg-slate-100 text-slate-500 border-slate-200"
                                            }`}
                                        >
                                            {inspectDoctor.isActive ? "Account Active" : "Account Disabled"}
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            disabled={actionLoading}
                                            onClick={() => setShowRejectForm(true)}
                                            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                                        >
                                            Reject Profile
                                        </button>

                                        <button
                                            type="button"
                                            disabled={actionLoading || inspectDoctor.profileStatus === "Approved"}
                                            onClick={() => handleUpdateStatus(inspectDoctor._id, "Approved")}
                                            className={`px-6 py-2.5 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${
                                                inspectDoctor.profileStatus === "Approved"
                                                    ? "bg-emerald-300 cursor-not-allowed"
                                                    : "bg-[#3d3f96] hover:bg-[#2d2f75]"
                                            }`}
                                        >
                                            {actionLoading ? <Loader2 size={13} className="animate-spin text-white" /> : <Check size={14} />}
                                            <span>{inspectDoctor.profileStatus === "Approved" ? "Already Approved" : "Approve KYC"}</span>
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}