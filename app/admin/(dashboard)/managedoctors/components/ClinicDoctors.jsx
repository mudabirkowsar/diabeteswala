"use client";

import { useState, useEffect, useCallback } from "react";
import {
    FaHospital, FaSearch, FaSync, FaMapMarkerAlt, FaEye,
    FaInbox, FaPhoneAlt, FaEnvelope, FaTimes, FaCheckCircle,
    FaTimesCircle, FaFileAlt, FaSpinner, FaChevronLeft, FaChevronRight,
    FaIdCard, FaGraduationCap, FaMoneyBillWave
} from "react-icons/fa";
import AdminAPI from "../../../../services/AdminAPI";

// Base URL for uploads / images
const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.7:5002";

// Helper function to resolve relative / absolute image and document URLs
const getFullUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    return `${IMAGE_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

// Fallback avatar image
const DEFAULT_AVATAR = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=100&auto=format&fit=crop";

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

    const themeRing = "focus:ring-[#3D3F96]/30";

    // 1. Fetch Clinic Doctors List
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

    // 2. Open Verification Modal & Fetch Full Details
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
            }
        } catch (error) {
            console.error("Error fetching doctor details:", error);
            alert("Unable to fetch doctor details. Please try again.");
            setDetailsModalOpen(false);
        } finally {
            setDetailsLoading(false);
        }
    };

    // 3. Handle Doctor Approval or Rejection
    const handleApproveReject = async (status) => {
        if (status === "Rejected" && !rejectionReason.trim()) {
            alert("Please provide a reason for rejecting this doctor.");
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
                alert(response.message || `Doctor status updated to ${status}`);
                setDetailsModalOpen(false);
                fetchClinicDoctors(); // Refresh table list
            }
        } catch (error) {
            console.error("Failed to update status:", error);
            alert(error?.response?.data?.message || "Something went wrong. Please try again.");
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

    return (
        <div className="space-y-6 select-none">
            {/* 1. Search & Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, clinic, license..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1);
                        }}
                        className={`pl-9 pr-4 py-2 w-full rounded-xl bg-gray-50 border border-gray-200 text-xs font-semibold outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            setStatusFilter(e.target.value);
                            setPage(1);
                        }}
                        className={`bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs font-semibold text-gray-700 outline-none focus:border-[#3D3F96] focus:ring-1 ${themeRing} transition-all`}
                    >
                        <option value="All">All Verification Status</option>
                        <option value="Pending">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>

                    <button
                        onClick={handleResetFilters}
                        className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-500 hover:text-gray-800 transition-all focus:outline-none"
                        title="Reset Filters"
                    >
                        <FaSync className="text-xs" />
                    </button>
                </div>
            </div>

            {/* 2. Clinic Doctors Data Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm min-w-[1000px] table-auto align-middle">
                        <thead>
                            <tr className="text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/50 border-b border-gray-100">
                                <th className="text-center px-6 py-4 w-16">S No.</th>
                                <th className="text-left px-6 py-4">Doctor Details</th>
                                <th className="text-left px-6 py-4">Clinic &amp; Contact</th>
                                <th className="text-left px-6 py-4">City</th>
                                <th className="text-center px-6 py-4">Approval Status</th>
                                <th className="text-center px-6 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={8} className="py-20 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <FaSpinner className="animate-spin text-2xl text-[#3D3F96]" />
                                            <p className="text-xs font-semibold text-gray-400">Loading clinic doctors...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : doctors.length > 0 ? (
                                doctors.map((doc, index) => {
                                    const imageSrc = doc.profileImage ? getFullUrl(doc.profileImage) : DEFAULT_AVATAR;

                                    return (
                                        <tr key={doc._id} className="hover:bg-gray-50/60 transition-colors duration-150">
                                            {/* Serial Number */}
                                            <td className="px-6 py-4 text-center font-bold text-gray-400 text-xs">
                                                {String((page - 1) * limit + (index + 1)).padStart(2, "0")}
                                            </td>

                                            {/* Doctor Identity */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-gray-100 shadow-sm shrink-0 bg-gray-100 flex items-center justify-center">
                                                        <img
                                                            src={imageSrc}
                                                            alt={doc.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-gray-800 tracking-tight leading-none text-sm">{doc.name}</h3>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wide mt-1">
                                                            {doc.qualification || "MBBS"} • <span className="text-emerald-600 font-black">{doc.speciality}</span>
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-medium">
                                                            Lic: <span className="font-semibold text-gray-600">{doc.licenseNumber || "N/A"}</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Clinic & Contact */}
                                            <td className="px-6 py-4 space-y-1">
                                                {/* <div className="font-bold text-xs text-gray-800">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                        <FaHospital className="text-[9px]" /> {doc.clinicId?.clinicName}
                                                    </span>
                                                </div> */}
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-semibold pt-0.5">
                                                    <FaPhoneAlt className="text-gray-300 text-[10px]" />
                                                    {doc.phone}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                                                    <FaEnvelope className="text-gray-300 text-[10px]" />
                                                    {doc.email}
                                                </div>
                                            </td>

                                            {/* City */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5 text-xs text-gray-600 font-bold">
                                                    <FaMapMarkerAlt className="text-rose-500 shrink-0" />
                                                    {doc.clinicId?.city || "N/A"}
                                                </div>
                                            </td>

                                            {/* Profile Status Badge */}
                                            <td className="px-6 py-4 text-center">
                                                {doc.profileStatus === "Approved" ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase tracking-wide">
                                                        Approved
                                                    </span>
                                                ) : doc.profileStatus === "Rejected" ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-100 uppercase tracking-wide" title={doc.rejectionReason || "Rejected"}>
                                                        Rejected
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide animate-pulse">
                                                        Pending
                                                    </span>
                                                )}
                                            </td>

                                            {/* Action Button */}
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => handleViewDetails(doc._id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#3D3F96]/10 hover:bg-[#3D3F96] text-[#3D3F96] hover:text-white text-xs font-bold transition-all focus:outline-none shadow-sm"
                                                >
                                                    <FaEye /> Verify
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                                                <FaInbox className="text-3xl" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-700">No Clinic Doctors Found</h4>
                                                <p className="text-xs text-slate-400 mt-1">Try updating your filters or search keywords.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* 3. Pagination Footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-500">
                        <span>Showing {doctors.length} of {totalDoctors} records</span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page <= 1}
                                onClick={() => setPage(p => Math.max(p - 1, 1))}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FaChevronLeft className="text-[10px]" />
                            </button>
                            <span className="font-bold text-gray-700">
                                Page {page} of {totalPages}
                            </span>
                            <button
                                disabled={page >= totalPages}
                                onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                <FaChevronRight className="text-[10px]" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Full Doctor Verification Drawer / Modal */}
            {detailsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-fadeIn max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/60 sticky top-0 z-10">
                            <div>
                                <h3 className="text-base font-black text-gray-800 tracking-tight">Review Doctor Profile</h3>
                                <p className="text-xs text-gray-400 font-medium">Verify certificates, registration numbers &amp; clinic association</p>
                            </div>
                            <button
                                onClick={() => setDetailsModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-gray-200/60 hover:bg-gray-300/80 text-gray-600 flex items-center justify-center transition-all"
                            >
                                <FaTimes className="text-xs" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                            {detailsLoading || !docDetails ? (
                                <div className="py-24 text-center">
                                    <FaSpinner className="animate-spin text-3xl text-[#3D3F96] mx-auto mb-3" />
                                    <p className="text-gray-400 font-semibold text-sm">Fetching detailed profile...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Doctor Info Card */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#3D3F96]/5 border border-[#3D3F96]/10">
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm shrink-0">
                                                <img
                                                    src={docDetails.profileImage ? getFullUrl(docDetails.profileImage) : DEFAULT_AVATAR}
                                                    alt={docDetails.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.currentTarget.src = DEFAULT_AVATAR; }}
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h2 className="text-base font-black text-gray-800">{docDetails.name}</h2>
                                                    <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full uppercase ${docDetails.profileStatus === "Approved" ? "bg-emerald-100 text-emerald-800" :
                                                            docDetails.profileStatus === "Rejected" ? "bg-rose-100 text-rose-800" :
                                                                "bg-amber-100 text-amber-800"
                                                        }`}>
                                                        {docDetails.profileStatus}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[#3D3F96] font-bold mt-0.5">{docDetails.speciality}</p>
                                                <p className="text-gray-500 font-medium text-[11px] mt-0.5">
                                                    {docDetails.experienceYears ? `${docDetails.experienceYears} Years Experience` : "Experience not specified"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-white p-3 rounded-xl border border-gray-200 text-right shrink-0">
                                            <span className="text-[10px] uppercase font-bold text-gray-400 block">Council Registration</span>
                                            <span className="font-extrabold text-gray-800 text-xs">{docDetails.licenseNumber || "N/A"}</span>
                                            <span className="text-[10px] text-gray-500 block">{docDetails.councilName || "State Council"}</span>
                                        </div>
                                    </div>

                                    {/* Rejection notice if previously rejected */}
                                    {docDetails.profileStatus === "Rejected" && docDetails.rejectionReason && (
                                        <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                                            <strong className="block text-[11px] font-black uppercase">Previous Rejection Reason:</strong>
                                            <p className="mt-0.5 text-xs font-semibold">{docDetails.rejectionReason}</p>
                                        </div>
                                    )}

                                    {/* Grid: Clinic Association & Contact info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Clinic Card */}
                                        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                                            <h4 className="font-black text-gray-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                                                <FaHospital className="text-[#3D3F96]" /> Associated Clinic
                                            </h4>
                                            <p className="font-bold text-gray-800 text-sm">{docDetails.clinicId?.clinicName || "Unassigned"}</p>
                                            <p className="text-gray-500 text-xs">Director / Head: <span className="font-semibold text-gray-700">{docDetails.clinicId?.name || "N/A"}</span></p>
                                            <p className="text-gray-500 text-xs">City: <span className="font-semibold text-gray-700">{docDetails.clinicId?.city || "N/A"}</span></p>
                                            <p className="text-gray-400 text-[11px] leading-tight">{docDetails.clinicId?.address || ""}</p>
                                        </div>

                                        {/* Contact & Address */}
                                        <div className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                                            <h4 className="font-black text-gray-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                                                <FaIdCard className="text-[#3D3F96]" /> Personal Contact &amp; Place
                                            </h4>
                                            <p className="text-gray-600">Phone: <strong className="text-gray-800">{docDetails.phone}</strong> {docDetails.alternatePhone ? `| ${docDetails.alternatePhone}` : ""}</p>
                                            <p className="text-gray-600">Email: <strong className="text-gray-800">{docDetails.email}</strong></p>
                                            <p className="text-gray-600">Address: <span className="text-gray-700 font-semibold">{docDetails.address ? `${docDetails.address}, ${docDetails.city}` : `${docDetails.city || ""}, ${docDetails.state || ""}`}</span></p>
                                        </div>
                                    </div>

                                    {/* Consultation Fees */}
                                    {docDetails.fees && (
                                        <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-2">
                                            <h4 className="font-black text-gray-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                                                <FaMoneyBillWave className="text-emerald-600" /> Consultation Fees
                                            </h4>
                                            <div className="grid grid-cols-3 gap-3 text-center">
                                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Online</span>
                                                    <span className="text-xs font-black text-emerald-600">₹{docDetails.fees.online || 0}</span>
                                                </div>
                                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Clinic Visit</span>
                                                    <span className="text-xs font-black text-emerald-600">₹{docDetails.fees.clinic || 0}</span>
                                                </div>
                                                <div className="p-2.5 bg-gray-50 rounded-xl">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Home Visit</span>
                                                    <span className="text-xs font-black text-emerald-600">₹{docDetails.fees.home || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Detailed Qualifications Array */}
                                    <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-3">
                                        <h4 className="font-black text-gray-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                                            <FaGraduationCap className="text-[#3D3F96]" /> Qualifications &amp; Degrees
                                        </h4>
                                        {docDetails.qualifications && docDetails.qualifications.length > 0 ? (
                                            <div className="space-y-2">
                                                {docDetails.qualifications.map((q, idx) => (
                                                    <div key={idx} className="p-3 bg-gray-50 rounded-xl flex items-center justify-between">
                                                        <div>
                                                            <span className="font-extrabold text-gray-800 text-xs">{q.degree}</span>
                                                            <span className="text-gray-400 text-[10px] ml-1.5">({q.year})</span>
                                                            <p className="text-gray-500 text-[11px] font-semibold">{q.college}</p>
                                                            <p className="text-gray-400 text-[10px]">Council: {q.councilName} • Reg: {q.registrationNo}</p>
                                                        </div>
                                                        {q.certFile && (
                                                            <a
                                                                href={getFullUrl(q.certFile)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white transition-all flex items-center gap-1"
                                                            >
                                                                <FaFileAlt /> View Cert
                                                            </a>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-gray-400 italic">No detailed degrees array provided.</p>
                                        )}
                                    </div>

                                    {/* Uploaded Documents */}
                                    {docDetails.documents && docDetails.documents.length > 0 && (
                                        <div className="p-4 rounded-2xl border border-gray-100 bg-white space-y-3">
                                            <h4 className="font-black text-gray-700 uppercase tracking-wide text-[10px] flex items-center gap-1.5">
                                                <FaFileAlt className="text-[#3D3F96]" /> Verification Documents
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {docDetails.documents.map((docUrl, i) => (
                                                    <a
                                                        key={i}
                                                        href={getFullUrl(docUrl)}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[#3D3F96] hover:bg-[#3D3F96] hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                                                    >
                                                        <FaFileAlt className="text-xs" /> Document {i + 1}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejection Form Input (Conditionally visible when Reject is clicked) */}
                                    {showRejectForm && (
                                        <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl space-y-3 animate-fadeIn">
                                            <label className="block text-xs font-black text-rose-800 uppercase">
                                                Reason for Rejection <span className="text-rose-500">*</span>
                                            </label>
                                            <textarea
                                                rows={3}
                                                placeholder="State the reason (e.g. Blurred certificate, invalid medical registration ID)..."
                                                value={rejectionReason}
                                                onChange={(e) => setRejectionReason(e.target.value)}
                                                className="w-full p-3 bg-white rounded-xl border border-rose-300 text-xs font-medium text-gray-800 outline-none focus:ring-2 focus:ring-rose-400"
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setShowRejectForm(false)}
                                                    className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    disabled={actionLoading}
                                                    onClick={() => handleApproveReject("Rejected")}
                                                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-md disabled:opacity-50"
                                                >
                                                    {actionLoading ? "Rejecting..." : "Confirm Rejection"}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Action Footer */}
                        {docDetails && !detailsLoading && (
                            <div className="p-4 border-t border-gray-100 bg-slate-50 flex items-center justify-between gap-3">
                                <span className="text-[11px] text-gray-400 font-semibold">
                                    Current Status: <strong className="text-gray-700">{docDetails.profileStatus}</strong>
                                </span>

                                {!showRejectForm && (
                                    <div className="flex items-center gap-2">
                                        {/* Reject Trigger */}
                                        <button
                                            disabled={actionLoading}
                                            onClick={() => setShowRejectForm(true)}
                                            className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
                                        >
                                            <FaTimesCircle /> Reject
                                        </button>

                                        {/* Approve Trigger */}
                                        <button
                                            disabled={actionLoading || docDetails.profileStatus === "Approved"}
                                            onClick={() => handleApproveReject("Approved")}
                                            className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md ${docDetails.profileStatus === "Approved"
                                                    ? "bg-emerald-300 cursor-not-allowed"
                                                    : "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                                                }`}
                                        >
                                            {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                                            {docDetails.profileStatus === "Approved" ? "Already Approved" : "Approve Doctor"}
                                        </button>
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