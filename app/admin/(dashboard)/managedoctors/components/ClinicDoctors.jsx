"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Stethoscope,
    Building2,
    Search,
    RefreshCw,
    MapPin,
    Eye,
    Inbox,
    Phone,
    Mail,
    X,
    CheckCircle2,
    AlertCircle,
    FileText,
    Loader2,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    IndianRupee,
    ShieldCheck,
    Clock,
    Check,
    Hospital
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

import AdminAPI from "../../../../services/AdminAPI";

// --- BASE MEDIA HELPER ---
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";

const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${IMAGE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop";

export default function ClinicDoctors() {
    // --- Table & Filter States ---
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    // --- Pagination States ---
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalDoctors, setTotalDoctors] = useState(0);
    const limit = 10;

    // --- Verification Modal States ---
    const [selectedDocId, setSelectedDocId] = useState(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [docDetails, setDocDetails] = useState(null);
    const [detailsLoading, setDetailsLoading] = useState(false);

    // --- Reject Reason Prompt State ---
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");

    // --- 1. Fetch Clinic Doctors Approval List ---
    const fetchClinicDoctors = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
                ...(searchTerm.trim() && { search: searchTerm.trim() }),
                ...(statusFilter !== "All" && { status: statusFilter })
            };

            const response = await AdminAPI.getClinicDoctorsApprovalList(params);

            if (response && response.success) {
                setDoctors(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalDoctors(response.total || 0);
            } else {
                setDoctors([]);
            }
        } catch (error) {
            console.error("Failed to load clinic doctors:", error);
            toast.error("Failed to load clinic doctors ledger.");
            setDoctors([]);
        } finally {
            setLoading(false);
        }
    }, [page, searchTerm, statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchClinicDoctors();
        }, 350);

        return () => clearTimeout(timer);
    }, [fetchClinicDoctors]);

    // --- 2. Open Verification Modal & Fetch Full Details ---
    const handleViewDetails = async (id) => {
        setSelectedDocId(id);
        setDetailsModalOpen(true);
        setShowRejectForm(false);
        setRejectionReason("");
        setDocDetails(null);
        setDetailsLoading(true);

        try {
            const response = await AdminAPI.getClinicDoctorApprovalDetails(id);
            if (response && response.success) {
                setDocDetails(response.data);
            } else {
                toast.error("Unable to retrieve doctor details.");
            }
        } catch (error) {
            console.error("Error fetching doctor details:", error);
            toast.error("Error connecting to doctor database.");
            setDetailsModalOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    // --- 3. Handle Doctor Approval or Rejection ---
    const handleApproveReject = async (status) => {
        if (status === "Rejected" && !rejectionReason.trim()) {
            toast.error("Please provide a justification for rejecting this doctor.");
            return;
        }

        try {
            setActionLoading(true);
            const payload = {
                status,
                ...(status === "Rejected" && { rejectionReason: rejectionReason.trim() })
            };

            const response = await AdminAPI.approveRejectClinicDoctor(selectedDocId, payload);

            if (response && response.success) {
                toast.success(response.message || `Doctor status updated to ${status}`);
                setDetailsModalOpen(false);
                fetchClinicDoctors();
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(error?.response?.data?.message || "Failed to update verification status.");
        } finally {
            setActionLoading(false);
        }
    };

    // Reset Filters
    const handleResetFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setPage(1);
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
        return (
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 flex items-center gap-1 w-fit mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" /> Pending Review
            </span>
        );
    };

    const statusOptions = ["All", "Pending", "Approved", "Rejected"];

    return (
        <div className="max-w-[1550px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left text-slate-800">
            <Toaster position="top-right" />

            {/* --- FILTERS & SEARCH ROW --- */}
            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">

                    {/* Search Input */}
                    <div className="relative w-full lg:w-96">
                        <Search className="absolute left-4 top-3 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by doctor name, clinic, license..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition"
                        />
                    </div>

                    {/* Status Filter Tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto [&::-webkit-scrollbar]:hidden pb-1 lg:pb-0">
                        {statusOptions.map((status) => {
                            const isSelected = statusFilter === status;
                            return (
                                <button
                                    key={status}
                                    onClick={() => {
                                        setStatusFilter(status);
                                        setPage(1);
                                    }}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer border ${isSelected
                                            ? "bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm"
                                            : "bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100"
                                        }`}
                                >
                                    {status === "All" ? "All Doctors" : status}
                                </button>
                            );
                        })}
                    </div>

                </div>
            </div>

            {/* --- CLINIC DOCTORS TABLE --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading clinic doctors ledger...</p>
                </div>
            ) : doctors.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-20 text-center bg-white rounded-3xl border border-slate-100 shadow-sm border-dashed">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Clinic Doctors Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        No doctors match your current search and verification filters [cite: custom_context].
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
                                    <th className="py-4 px-6">Associated Clinic</th>
                                    <th className="py-4 px-6">Contact Details</th>
                                    <th className="py-4 px-6">Location</th>
                                    <th className="py-4 px-6 text-center">Verification Status</th>
                                    <th className="py-4 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold">
                                {doctors.map((doc, index) => {
                                    const imageSrc = doc.profileImage ? getFullUrl(doc.profileImage) : DEFAULT_AVATAR;

                                    return (
                                        <tr key={doc._id} className="hover:bg-slate-50/50 transition-colors">

                                            {/* Serial Number */}
                                            <td className="py-4 px-6 text-center font-bold text-slate-400 text-xs">
                                                {String((page - 1) * limit + (index + 1)).padStart(2, "0")}
                                            </td>

                                            {/* Doctor Details */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                        <img
                                                            src={imageSrc}
                                                            alt={doc.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <strong className="text-slate-900 font-black text-sm block">{doc.name}</strong>
                                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block mt-0.5">
                                                            {doc.qualification || "MBBS"} • <span className="text-[#3d3f96] font-black">{doc.speciality}</span>
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium block">
                                                            Lic: <span className="font-mono font-bold text-slate-700">{doc.licenseNumber || "N/A"}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Clinic Association */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-0.5">
                                                    <strong className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                                                        <Hospital size={13} className="text-[#3d3f96] shrink-0" />
                                                        <span>{doc.clinicId?.clinicName || "Unassigned"}</span>
                                                    </strong>
                                                    <span className="text-[10px] text-slate-400 block font-medium">
                                                        City: {doc.clinicId?.city || "N/A"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Contact Details */}
                                            <td className="py-4 px-6">
                                                <div className="space-y-0.5 text-[11px]">
                                                    <a href={`tel:${doc.phone}`} className="text-slate-700 font-bold hover:text-[#3d3f96] flex items-center gap-1">
                                                        <Phone size={10} className="text-slate-400" /> {doc.phone}
                                                    </a>
                                                    <span className="text-slate-400 flex items-center gap-1 truncate max-w-[140px]">
                                                        <Mail size={10} className="text-slate-400" /> {doc.email}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* City / State */}
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-1 text-slate-700 font-bold text-xs">
                                                    <MapPin size={13} className="text-rose-500 shrink-0" />
                                                    <span>{doc.clinicId?.city || doc.city || "N/A"}</span>
                                                </div>
                                            </td>

                                            {/* Verification Status */}
                                            <td className="py-4 px-6 text-center">
                                                {renderVerificationBadge(doc.profileStatus)}
                                            </td>

                                            {/* Action Verify Button */}
                                            <td className="py-4 px-6 text-right">
                                                <button
                                                    onClick={() => handleViewDetails(doc._id)}
                                                    className="px-3.5 py-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5 ml-auto cursor-pointer"
                                                >
                                                    <Eye size={13} />
                                                    <span>Verify</span>
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Footer */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50/50">
                            <span className="text-xs text-slate-500 font-bold">
                                Total Records: {totalDoctors}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page <= 1}
                                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs hover:bg-slate-50 transition"
                                >
                                    Previous
                                </button>
                                <span className="text-xs font-black text-slate-800 px-2">
                                    Page {page} of {totalPages}
                                </span>
                                <button
                                    disabled={page >= totalPages}
                                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                    className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs hover:bg-slate-50 transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* --- DOCTOR FULL VERIFICATION MODAL --- */}
            {detailsModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 select-none antialiased">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left space-y-6">

                        {/* Close Button */}
                        <button
                            onClick={() => setDetailsModalOpen(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>

                        {/* Modal Header */}
                        <div className="border-b border-slate-100 pb-4 pr-10">
                            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                <Stethoscope size={20} className="text-[#3d3f96]" /> Review Clinic Doctor Profile
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Verify certificates, state medical registrations, and associated clinic records [cite: custom_context].
                            </p>
                        </div>

                        {detailsLoading || !docDetails ? (
                            <div className="py-24 text-center">
                                <Loader2 className="animate-spin text-[#3d3f96] mb-3 mx-auto" size={36} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fetching detailed profile...</p>
                            </div>
                        ) : (
                            <div className="space-y-6">

                                {/* Doctor Info Card */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-3xl bg-[#3d3f96]/5 border border-[#3d3f96]/10">
                                    <div className="flex items-center gap-3.5">
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm shrink-0">
                                            <img
                                                src={docDetails.profileImage ? getFullUrl(docDetails.profileImage) : DEFAULT_AVATAR}
                                                alt={docDetails.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-base font-black text-slate-900">{docDetails.name}</h2>
                                                {renderVerificationBadge(docDetails.profileStatus)}
                                            </div>
                                            <p className="text-xs text-[#3d3f96] font-bold mt-0.5">{docDetails.speciality} • {docDetails.qualification || "MBBS"}</p>
                                            <p className="text-slate-500 font-medium text-[11px] mt-0.5">
                                                {docDetails.experienceYears ? `${docDetails.experienceYears} Years Experience` : "Experience not specified"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-right shrink-0">
                                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Council Registration</span>
                                        <span className="font-extrabold text-slate-800 text-xs font-mono">{docDetails.licenseNumber || "N/A"}</span>
                                        <span className="text-[10px] text-slate-500 block">{docDetails.councilName || "State Council"}</span>
                                    </div>
                                </div>

                                {/* Rejection Notice if Present */}
                                {docDetails.profileStatus === "Rejected" && docDetails.rejectionReason && (
                                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs space-y-1">
                                        <strong className="text-[10px] font-black uppercase text-rose-700 block">Previous Rejection Justification</strong>
                                        <p className="text-rose-800 font-medium">{docDetails.rejectionReason}</p>
                                    </div>
                                )}

                                {/* Grid: Clinic Association & Contact Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Associated Clinic Card */}
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                                        <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-200/50 pb-1">
                                            <Hospital className="text-[#3d3f96]" size={13} /> Associated Clinic Details
                                        </h4>
                                        <p className="font-bold text-slate-900 text-sm">{docDetails.clinicId?.clinicName || "Unassigned"}</p>
                                        <div className="space-y-1 text-slate-600 pt-1">
                                            <p>Director: <strong className="text-slate-800">{docDetails.clinicId?.name || "N/A"}</strong></p>
                                            <p>City: <strong className="text-slate-800">{docDetails.clinicId?.city || "N/A"}</strong></p>
                                            <p className="text-slate-500 leading-snug">{docDetails.clinicId?.address || ""}</p>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2 text-xs">
                                        <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-200/50 pb-1">
                                            <Phone className="text-[#3d3f96]" size={13} /> Doctor Contact Details
                                        </h4>
                                        <div className="space-y-1 text-slate-600 pt-1">
                                            <p>Phone: <strong className="text-[#3d3f96]">{docDetails.phone}</strong> {docDetails.alternatePhone ? `| ${docDetails.alternatePhone}` : ""}</p>
                                            <p>Email: <strong className="text-slate-800">{docDetails.email}</strong></p>
                                            <p>Address: <span className="text-slate-700 font-semibold">{docDetails.address ? `${docDetails.address}, ${docDetails.city}` : `${docDetails.city || ""}, ${docDetails.state || ""}`}</span></p>
                                        </div>
                                    </div>
                                </div>

                                {/* Consultation Fees Breakdown */}
                                {docDetails.fees && (
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-2 text-xs">
                                        <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                                            <IndianRupee className="text-emerald-600" size={13} /> Consultation Fee Structure
                                        </h4>
                                        <div className="grid grid-cols-3 gap-3 text-center pt-1 font-bold">
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Online Teleconsult</span>
                                                <span className="text-xs font-black text-emerald-600 font-mono">₹{docDetails.fees.online || 0}</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Clinic Visit</span>
                                                <span className="text-xs font-black text-slate-800 font-mono">₹{docDetails.fees.clinic || 0}</span>
                                            </div>
                                            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                <span className="text-[9px] text-slate-400 font-bold uppercase block">Home Visit</span>
                                                <span className="text-xs font-black text-purple-700 font-mono">₹{docDetails.fees.home || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Detailed Qualifications Array */}
                                <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3 text-xs">
                                    <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                                        <GraduationCap className="text-[#3d3f96]" size={15} /> Educational Degrees &amp; Council Details
                                    </h4>
                                    {docDetails.qualifications && docDetails.qualifications.length > 0 ? (
                                        <div className="space-y-2">
                                            {docDetails.qualifications.map((q, idx) => (
                                                <div key={idx} className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100">
                                                    <div>
                                                        <strong className="text-slate-900 text-xs">{q.degree}</strong>
                                                        <span className="text-slate-400 text-[10px] ml-1.5">({q.year})</span>
                                                        <p className="text-slate-600 text-[11px] font-semibold">{q.college}</p>
                                                        <p className="text-slate-400 text-[10px]">Council: {q.councilName} • Reg: {q.registrationNo}</p>
                                                    </div>
                                                    {q.certFile && (
                                                        <a
                                                            href={getFullUrl(q.certFile)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-[#3d3f96] hover:bg-[#3d3f96] hover:text-white transition flex items-center gap-1"
                                                        >
                                                            <FileText size={11} /> View Cert
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">No detailed degrees array provided.</p>
                                    )}
                                </div>

                                {/* Uploaded Verification Documents */}
                                {docDetails.documents && docDetails.documents.length > 0 && (
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-3 text-xs">
                                        <h4 className="font-black text-slate-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5 border-b border-slate-100 pb-1">
                                            <FileText className="text-[#3d3f96]" size={13} /> Uploaded Verification Documents ({docDetails.documents.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2 pt-1">
                                            {docDetails.documents.map((docUrl, i) => (
                                                <a
                                                    key={i}
                                                    href={getFullUrl(docUrl)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#3d3f96] hover:bg-[#3d3f96] hover:text-white font-bold text-xs flex items-center gap-1.5 transition"
                                                >
                                                    <FileText size={13} /> Document {i + 1}
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
                                            placeholder="State reason (e.g. Council registration certificate is blurred/expired)..."
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
                                                onClick={() => handleApproveReject("Rejected")}
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
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                        <span className="text-[11px] text-slate-400 font-bold">
                                            Current Verification: <strong className="text-slate-800 font-black">{docDetails.profileStatus}</strong>
                                        </span>

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
                                                disabled={actionLoading || docDetails.profileStatus === "Approved"}
                                                onClick={() => handleApproveReject("Approved")}
                                                className={`px-6 py-2.5 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50 ${docDetails.profileStatus === "Approved"
                                                        ? "bg-emerald-300 cursor-not-allowed"
                                                        : "bg-[#3d3f96] hover:bg-[#2d2f75]"
                                                    }`}
                                            >
                                                {actionLoading ? <Loader2 size={13} className="animate-spin text-white" /> : <Check size={14} />}
                                                <span>{docDetails.profileStatus === "Approved" ? "Already Approved" : "Approve KYC"}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                            </div>
                        )}

                    </div>
                </div>
            )}

        </div>
    );
}