"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
    FaCheck,
    FaTimes,
    FaEye,
    FaSearch,
    FaPills,
    FaStore,
    FaPrescriptionBottleAlt,
    FaSpinner,
    FaExclamationTriangle
} from "react-icons/fa";
import { toast } from "react-hot-toast";
// Adjust the import path according to your project's folder structure
import AdminAPI from "../../../../../services/AdminAPI";

function MedicineRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Modals state
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    // Rejection modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectId, setRejectId] = useState(null);
    const [adminComment, setAdminComment] = useState("");

    // Action loading states
    const [processingId, setProcessingId] = useState(null);

    // 1. Fetch all pending medicine requests
    const fetchPendingRequests = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.getAdminPendingMedicineRequests();
            if (res?.success) {
                setRequests(res?.data || []);
            } else {
                toast.error(res?.message || "Failed to load requests");
            }
        } catch (err) {
            console.error("Error fetching pending requests:", err);
            toast.error(err?.response?.data?.message || "Error fetching pending requests");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    // 2. Approve Request
    const handleApprove = async (requestId) => {
        try {
            setProcessingId(requestId);
            const res = await AdminAPI.approveAdminMedicineRequest(requestId);
            if (res?.success) {
                toast.success(res?.message || "Medicine request approved successfully!");
                setRequests((prev) => prev.filter((item) => item._id !== requestId));
                if (showDetailModal) setShowDetailModal(false);
            } else {
                toast.error(res?.message || "Approval failed");
            }
        } catch (err) {
            console.error("Approve error:", err);
            toast.error(err?.response?.data?.message || "Failed to approve medicine request");
        } finally {
            setProcessingId(null);
        }
    };

    // 3. Open Rejection Modal
    const openRejectModal = (requestId) => {
        setRejectId(requestId);
        setAdminComment("");
        setShowRejectModal(true);
    };

    // 4. Submit Rejection
    const handleRejectSubmit = async (e) => {
        e.preventDefault();
        if (!rejectId) return;

        try {
            setProcessingId(rejectId);
            const payload = {
                adminComment: adminComment.trim() || "Rejected by Admin",
            };
            const res = await AdminAPI.rejectAdminMedicineRequest(rejectId, payload);
            if (res?.success) {
                toast.success(res?.message || "Medicine request rejected");
                setRequests((prev) => prev.filter((item) => item._id !== rejectId));
                setShowRejectModal(false);
                if (showDetailModal) setShowDetailModal(false);
            } else {
                toast.error(res?.message || "Rejection failed");
            }
        } catch (err) {
            console.error("Reject error:", err);
            toast.error(err?.response?.data?.message || "Failed to reject medicine request");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter requests based on medicine name, vendor name, or manufacturer
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const q = searchQuery.toLowerCase();
            const medName = req?.data?.name?.toLowerCase() || "";
            const vendorName = req?.vendorId?.name?.toLowerCase() || "";
            const manufacturer = req?.data?.manufacturers?.toLowerCase() || "";
            const salt = req?.data?.salt_composition?.toLowerCase() || "";
            return (
                medName.includes(q) ||
                vendorName.includes(q) ||
                manufacturer.includes(q) ||
                salt.includes(q)
            );
        });
    }, [requests, searchQuery]);

    // Formatter for images
    const resolveImageUrl = (img) => {
        if (!img) return null;
        if (img.startsWith("http://") || img.startsWith("https://")) return img;
        const base = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(/\/+$/, "") || "";
        const cleaned = img.replace(/^public[\\/]/, "").replace(/^\/+/, "");
        return `${base}/${cleaned}`;
    };

    return (
        <div className="w-full">
            {/* Search & Stats Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-80">
                    <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                    <input
                        type="text"
                        placeholder="Search medicine, vendor, salt..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3D3F96] transition-all shadow-sm"
                    />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Pending Requests:
                    </span>
                    <span className="px-3 py-1 bg-[#3D3F96]/10 text-[#3D3F96] font-black text-xs rounded-full">
                        {requests.length}
                    </span>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <FaSpinner className="animate-spin text-3xl text-[#3D3F96]" />
                        <p className="text-xs font-bold uppercase tracking-wider">Loading Requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 text-2xl mb-3">
                            <FaPills />
                        </div>
                        <h4 className="text-base font-bold text-gray-700">No Pending Requests Found</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                            All submitted medicine proposals have been processed or no submissions match your search query.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-500">
                                    <th className="py-4 px-5">Medicine Details</th>
                                    <th className="py-4 px-5">Vendor (Pharmacy)</th>
                                    <th className="py-4 px-5">Pricing</th>
                                    <th className="py-4 px-5">Rx Flag</th>
                                    <th className="py-4 px-5">Submitted</th>
                                    <th className="py-4 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {filteredRequests.map((req) => {
                                    const med = req?.data || {};
                                    const vendor = req?.vendorId || {};
                                    const isProcessing = processingId === req._id;
                                    const thumb = Array.isArray(med.image_url) && med.image_url.length > 0
                                        ? resolveImageUrl(med.image_url[0])
                                        : null;

                                    return (
                                        <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Medicine Info */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-11 h-11 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                        {thumb ? (
                                                            <img
                                                                src={thumb}
                                                                alt={med.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <FaPills className="text-gray-400 text-base" />
                                                        )}
                                                    </div>
                                                    <div className="max-w-[220px]">
                                                        <p className="font-bold text-gray-900 truncate">{med.name || "N/A"}</p>
                                                        <p className="text-[10px] text-gray-400 font-semibold truncate">
                                                            {med.manufacturers || "Manufacturer not listed"}
                                                        </p>
                                                        <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                                                            {med.salt_composition || med.packaging}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Vendor Info */}
                                            <td className="py-4 px-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                                        <FaStore className="text-gray-400 text-[10px]" />
                                                        {vendor.name || "Unknown Store"}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">{vendor.phone || vendor.email || "-"}</span>
                                                </div>
                                            </td>

                                            {/* Pricing */}
                                            <td className="py-4 px-5">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-emerald-600">
                                                        ₹{med.best_price ?? 0}
                                                    </span>
                                                    <span className="text-[10px] text-gray-400 line-through">
                                                        MRP: ₹{med.mrp ?? 0}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Rx Requirement */}
                                            <td className="py-4 px-5">
                                                <span
                                                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${med.prescription_required?.toUpperCase() === "YES"
                                                        ? "bg-amber-50 text-amber-600 border border-amber-200/60"
                                                        : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                                                        }`}
                                                >
                                                    {med.prescription_required?.toUpperCase() === "YES" ? "Rx Required" : "OTC"}
                                                </span>
                                            </td>

                                            {/* Submitted Date */}
                                            <td className="py-4 px-5 text-gray-400 text-[11px]">
                                                {req.createdAt
                                                    ? new Date(req.createdAt).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })
                                                    : "-"}
                                            </td>

                                            {/* Actions */}
                                            <td className="py-4 px-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {/* View Modal */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedRequest(req);
                                                            setShowDetailModal(true);
                                                        }}
                                                        title="View Full Details"
                                                        className="p-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                    >
                                                        <FaEye className="text-xs" />
                                                    </button>

                                                    {/* Quick Approve */}
                                                    <button
                                                        type="button"
                                                        disabled={isProcessing}
                                                        onClick={() => handleApprove(req._id)}
                                                        title="Approve Request"
                                                        className="p-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                    >
                                                        {isProcessing ? (
                                                            <FaSpinner className="animate-spin text-xs" />
                                                        ) : (
                                                            <FaCheck className="text-xs" />
                                                        )}
                                                    </button>

                                                    {/* Quick Reject */}
                                                    <button
                                                        type="button"
                                                        disabled={isProcessing}
                                                        onClick={() => openRejectModal(req._id)}
                                                        title="Reject Request"
                                                        className="p-2 rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors disabled:opacity-50"
                                                    >
                                                        <FaTimes className="text-xs" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ================= DETAIL MODAL ================= */}
            {showDetailModal && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">

                        {/* Modal Header */}
                        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-black text-gray-800">
                                    {selectedRequest?.data?.name || "Medicine Specification"}
                                </h3>
                                <p className="text-xs text-gray-400 font-semibold">
                                    Submitted by {selectedRequest?.vendorId?.name || "Vendor"}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6 overflow-y-auto space-y-6 text-xs text-gray-700">

                            {/* Product Images */}
                            {Array.isArray(selectedRequest?.data?.image_url) && selectedRequest.data.image_url.length > 0 && (
                                <div>
                                    <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-2 text-[10px]">
                                        Medicine Images
                                    </h4>
                                    <div className="flex gap-3 overflow-x-auto pb-2">
                                        {selectedRequest.data.image_url.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="w-24 h-24 rounded-2xl bg-gray-50 border border-gray-200 overflow-hidden flex-shrink-0"
                                            >
                                                <img
                                                    src={resolveImageUrl(img)}
                                                    alt={`Uploaded medicine ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Grid Specifications */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100">
                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Manufacturer</span>
                                    <span className="font-bold text-gray-800 text-sm">
                                        {selectedRequest?.data?.manufacturers || "N/A"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Packaging</span>
                                    <span className="font-bold text-gray-800 text-sm">
                                        {selectedRequest?.data?.packaging || "N/A"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Salt Composition</span>
                                    <span className="font-semibold text-gray-800">
                                        {selectedRequest?.data?.salt_composition || "N/A"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Prescription Required</span>
                                    <span className="font-bold text-gray-800">
                                        {selectedRequest?.data?.prescription_required || "NO"}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Maximum Retail Price (MRP)</span>
                                    <span className="font-black text-gray-800 text-sm">
                                        ₹{selectedRequest?.data?.mrp ?? 0}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-[10px] text-gray-400 uppercase font-black block">Proposed Selling Price</span>
                                    <span className="font-black text-emerald-600 text-sm">
                                        ₹{selectedRequest?.data?.best_price ?? 0}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            {selectedRequest?.data?.description && (
                                <div>
                                    <h4 className="font-bold text-gray-400 uppercase tracking-wider mb-1 text-[10px]">
                                        Description & Usage
                                    </h4>
                                    <p className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-gray-600 leading-relaxed">
                                        {selectedRequest.data.description}
                                    </p>
                                </div>
                            )}

                            {/* Vendor Information Box */}
                            <div className="border border-indigo-100 bg-indigo-50/30 p-4 rounded-2xl">
                                <h4 className="font-black text-[#3D3F96] uppercase tracking-wider mb-2 text-[10px]">
                                    Vendor Profile
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">Name:</span>
                                        <span className="font-bold text-gray-800">{selectedRequest?.vendorId?.name || "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">Email:</span>
                                        <span className="font-bold text-gray-800">{selectedRequest?.vendorId?.email || "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-gray-400 block">Phone:</span>
                                        <span className="font-bold text-gray-800">{selectedRequest?.vendorId?.phone || "-"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions Footer */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => openRejectModal(selectedRequest._id)}
                                disabled={processingId === selectedRequest._id}
                                className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-all text-xs"
                            >
                                Reject Request
                            </button>
                            <button
                                type="button"
                                onClick={() => handleApprove(selectedRequest._id)}
                                disabled={processingId === selectedRequest._id}
                                className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all text-xs flex items-center gap-2"
                            >
                                {processingId === selectedRequest._id && <FaSpinner className="animate-spin text-xs" />}
                                Approve & Add to Master
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ================= REJECT CONFIRMATION MODAL ================= */}
            {showRejectModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg flex-shrink-0">
                                <FaExclamationTriangle />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-gray-800">Reject Medicine Request</h3>
                                <p className="text-xs text-gray-400">Please provide a reason to inform the vendor.</p>
                            </div>
                        </div>

                        <form onSubmit={handleRejectSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                    Rejection Reason (Admin Comment)
                                </label>
                                <textarea
                                    rows={4}
                                    required
                                    placeholder="e.g. This medicine already exists under another name. Please check master catalog."
                                    value={adminComment}
                                    onChange={(e) => setAdminComment(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-rose-500 transition-all"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowRejectModal(false)}
                                    className="px-4 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-all text-xs"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processingId === rejectId}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all text-xs flex items-center gap-2 disabled:opacity-50"
                                >
                                    {processingId === rejectId && <FaSpinner className="animate-spin text-xs" />}
                                    Confirm Rejection
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MedicineRequest;