"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    FaCheck,
    FaTimes,
    FaSearch,
    FaSpinner,
    FaArrowUp,
    FaStore,
    FaInfoCircle,
    FaChevronLeft,
    FaChevronRight,
    FaExclamationTriangle,
    FaCheckCircle,
    FaCommentDots
} from "react-icons/fa";
import { toast } from "react-hot-toast";
// Adjust the import path according to your project's folder structure
import AdminAPI from "../../../../../services/AdminAPI";

function HikeRequest() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("Pending"); // "Pending" | "Approved" | "Rejected" | ""
    const [searchQuery, setSearchQuery] = useState("");

    // Pagination State
    const [page, setPage] = useState(1);
    const [limit] = useState(15);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);

    // Action Modals State
    const [activeModal, setActiveModal] = useState(null); // { type: 'approve' | 'reject' | 'view', item: object }
    const [adminComment, setAdminComment] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    const themeColor = "#3D3F96";

    // 1. Fetch Requests from API
    const fetchHikeRequests = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit,
            };
            if (statusFilter) {
                params.status = statusFilter;
            }

            const res = await AdminAPI.getAdminMedicineAndMrpRequests(params);

            if (res?.success) {
                // Filter specifically for MRP hike requests (contains medicineId or proposedMrp)
                const items = res?.data || [];
                setRequests(items);
                setTotalPages(res?.totalPages || 1);
                setTotalRecords(res?.total || items.length);
            } else {
                toast.error(res?.message || "Failed to load requests");
            }
        } catch (err) {
            console.error("Error fetching hike requests:", err);
            toast.error(err?.response?.data?.message || "Error fetching MRP hike requests");
        } finally {
            setLoading(false);
        }
    }, [page, limit, statusFilter]);

    useEffect(() => {
        fetchHikeRequests();
    }, [fetchHikeRequests]);

    // Reset page when filter changes
    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    // 2. Open Action Modal
    const openActionModal = (type, item) => {
        setActiveModal({ type, item });
        setAdminComment(
            type === "approve"
                ? "Verified against physical manufacturer batch pricing."
                : ""
        );
    };

    const closeModal = () => {
        setActiveModal(null);
        setAdminComment("");
    };

    // 3. Submit Approve / Reject Action
    const handleActionSubmit = async (e) => {
        e?.preventDefault();
        if (!activeModal?.item?._id || !activeModal?.type) return;

        const isApprove = activeModal.type === "approve";
        const payload = {
            action: isApprove ? "Approved" : "Rejected",
            adminComment: adminComment.trim() || (isApprove ? "Approved by Admin" : "Rejected by Admin"),
        };

        try {
            setActionLoading(true);
            const res = await AdminAPI.handleAdminMedicineAndMrpRequestAction(
                activeModal.item._id,
                payload
            );

            if (res?.success) {
                toast.success(res?.message || `Request ${payload.action} successfully!`);
                closeModal();
                fetchHikeRequests(); // Refresh data
            } else {
                toast.error(res?.message || "Action failed");
            }
        } catch (err) {
            console.error("Action error:", err);
            toast.error(err?.response?.data?.message || "Failed to process request");
        } finally {
            setActionLoading(false);
        }
    };

    // Client-side search filter
    const filteredRequests = requests.filter((req) => {
        const q = searchQuery.toLowerCase();
        const medName = req?.data?.medicineName || req?.data?.name || "";
        const vendorName = req?.vendorId?.name || "";
        const vendorCity = req?.vendorId?.city || "";
        return (
            medName.toLowerCase().includes(q) ||
            vendorName.toLowerCase().includes(q) ||
            vendorCity.toLowerCase().includes(q)
        );
    });

    return (
        <div className="w-full">
            {/* Top Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">

                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-2xl shadow-sm self-start md:self-auto">
                    {[
                        { label: "Pending", value: "Pending" },
                        { label: "Approved", value: "Approved" },
                        { label: "Rejected", value: "Rejected" },
                        { label: "All", value: "" },
                    ].map((tab) => {
                        const isActive = statusFilter === tab.value;
                        return (
                            <button
                                key={tab.label}
                                type="button"
                                onClick={() => handleStatusChange(tab.value)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                                        ? "bg-[#3D3F96] text-white shadow-sm"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Search Input & Total Counter */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input
                            type="text"
                            placeholder="Search medicine or pharmacy..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#3D3F96] transition-all shadow-sm"
                        />
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-xl shadow-sm text-xs font-bold text-gray-600">
                        <span>Total:</span>
                        <span className="text-[#3D3F96] font-black">{totalRecords}</span>
                    </div>
                </div>

            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-400">
                        <FaSpinner className="animate-spin text-3xl text-[#3D3F96]" />
                        <p className="text-xs font-bold uppercase tracking-wider">Loading Hike Requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-24 flex flex-col items-center justify-center text-center p-6">
                        <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 text-2xl mb-3">
                            <FaArrowUp />
                        </div>
                        <h4 className="text-base font-bold text-gray-700">No MRP Hike Requests Found</h4>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm">
                            No price revision submissions match the selected status or filter criteria.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black uppercase tracking-wider text-gray-500">
                                    <th className="py-4 px-5">Target Medicine</th>
                                    <th className="py-4 px-5">Submitting Pharmacy</th>
                                    <th className="py-4 px-5">MRP Hike Comparison</th>
                                    <th className="py-4 px-5">Vendor Justification</th>
                                    <th className="py-4 px-5">Status</th>
                                    <th className="py-4 px-5">Submitted Date</th>
                                    <th className="py-4 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                                {filteredRequests.map((req) => {
                                    const data = req?.data || {};
                                    const vendor = req?.vendorId || {};
                                    const currentMrp = Number(data.currentMasterMrp || 0);
                                    const proposedMrp = Number(data.proposedMrp || 0);
                                    const diff = proposedMrp - currentMrp;
                                    const percent = currentMrp > 0 ? ((diff / currentMrp) * 100).toFixed(1) : 0;
                                    const isPending = req.status === "Pending";

                                    return (
                                        <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                                            {/* Medicine Name */}
                                            <td className="py-4 px-5">
                                                <div className="max-w-[200px]">
                                                    <p className="font-bold text-gray-900 truncate">
                                                        {data.medicineName || data.name || "N/A"}
                                                    </p>
                                                    {data.medicineId && (
                                                        <span className="text-[10px] text-gray-400 font-mono block truncate">
                                                            ID: {data.medicineId}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Pharmacy Vendor Info */}
                                            <td className="py-4 px-5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-800 flex items-center gap-1.5">
                                                        <FaStore className="text-gray-400 text-[10px]" />
                                                        {vendor.name || "Unknown Store"}
                                                    </span>
                                                    <span className="text-[11px] text-gray-400">
                                                        {[vendor.city, vendor.state].filter(Boolean).join(", ") || vendor.phone || "-"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Pricing Comparison */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div>
                                                        <span className="text-[10px] text-gray-400 uppercase font-bold block">Current</span>
                                                        <span className="font-bold text-gray-700">₹{currentMrp}</span>
                                                    </div>

                                                    <div className="flex items-center text-gray-300 font-black">→</div>

                                                    <div>
                                                        <span className="text-[10px] text-indigo-500 uppercase font-bold block">Proposed</span>
                                                        <span className="font-black text-[#3D3F96]">₹{proposedMrp}</span>
                                                    </div>

                                                    {diff > 0 && (
                                                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100">
                                                            <FaArrowUp className="text-[8px]" />
                                                            ₹{diff} ({percent}%)
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Vendor Justification */}
                                            <td className="py-4 px-5">
                                                <p className="text-gray-600 italic max-w-[220px] truncate" title={data.reason || "None"}>
                                                    "{data.reason || "No reason specified"}"
                                                </p>
                                            </td>

                                            {/* Status */}
                                            <td className="py-4 px-5">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${req.status === "Approved"
                                                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                                                            : req.status === "Rejected"
                                                                ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                                                                : "bg-amber-50 text-amber-600 border border-amber-200/60"
                                                        }`}
                                                >
                                                    {req.status}
                                                </span>
                                            </td>

                                            {/* Created Date */}
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
                                                    {/* View Info */}
                                                    <button
                                                        type="button"
                                                        onClick={() => openActionModal("view", req)}
                                                        title="View Info"
                                                        className="p-2 rounded-lg text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                                                    >
                                                        <FaInfoCircle className="text-xs" />
                                                    </button>

                                                    {/* Quick Actions (only enabled if status is Pending) */}
                                                    {isPending ? (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal("approve", req)}
                                                                title="Approve Hike"
                                                                className="p-2 rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                                                            >
                                                                <FaCheck className="text-xs" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal("reject", req)}
                                                                title="Reject Hike"
                                                                className="p-2 rounded-lg text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm"
                                                            >
                                                                <FaTimes className="text-xs" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        req.adminComment && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openActionModal("view", req)}
                                                                title="View Admin Comment"
                                                                className="p-2 rounded-lg text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                                            >
                                                                <FaCommentDots className="text-xs" />
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination Bar */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-semibold">
                            Page {page} of {totalPages}
                        </span>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                disabled={page <= 1}
                                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <FaChevronLeft className="text-xs" />
                            </button>
                            <button
                                type="button"
                                disabled={page >= totalPages}
                                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                                className="p-2 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <FaChevronRight className="text-xs" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* ================= MODAL: APPROVE / REJECT / VIEW ================= */}
            {activeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-gray-100 p-6">

                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg ${activeModal.type === "approve"
                                            ? "bg-emerald-50 text-emerald-600"
                                            : activeModal.type === "reject"
                                                ? "bg-rose-50 text-rose-600"
                                                : "bg-indigo-50 text-[#3D3F96]"
                                        }`}
                                >
                                    {activeModal.type === "approve" && <FaCheckCircle />}
                                    {activeModal.type === "reject" && <FaExclamationTriangle />}
                                    {activeModal.type === "view" && <FaInfoCircle />}
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-gray-800">
                                        {activeModal.type === "approve" && "Approve Price Hike"}
                                        {activeModal.type === "reject" && "Reject Price Hike"}
                                        {activeModal.type === "view" && "Request Details"}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-semibold">
                                        {activeModal.item?.data?.medicineName || activeModal.item?.data?.name}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={closeModal}
                                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-xs"
                            >
                                <FaTimes />
                            </button>
                        </div>

                        {/* Info Summary Box */}
                        <div className="my-5 bg-gray-50/80 p-4 rounded-2xl border border-gray-100 space-y-3 text-xs">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Store:</span>
                                <span className="font-bold text-gray-800">{activeModal.item?.vendorId?.name || "N/A"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Location:</span>
                                <span className="font-medium text-gray-700">
                                    {[activeModal.item?.vendorId?.address, activeModal.item?.vendorId?.city, activeModal.item?.vendorId?.state].filter(Boolean).join(", ") || "-"}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 font-bold uppercase text-[10px]">Current vs Proposed MRP:</span>
                                <span className="font-black text-gray-800">
                                    ₹{activeModal.item?.data?.currentMasterMrp || 0} → <span className="text-emerald-600">₹{activeModal.item?.data?.proposedMrp || 0}</span>
                                </span>
                            </div>
                            <div className="border-t border-gray-200/60 pt-2">
                                <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Vendor's Reason:</span>
                                <p className="text-gray-700 italic">"{activeModal.item?.data?.reason || "No reason given"}"</p>
                            </div>
                            {activeModal.item?.adminComment && (
                                <div className="border-t border-gray-200/60 pt-2">
                                    <span className="text-indigo-500 font-bold uppercase text-[10px] block mb-1">Saved Admin Comment:</span>
                                    <p className="text-gray-800 font-medium">{activeModal.item.adminComment}</p>
                                </div>
                            )}
                        </div>

                        {/* Form for Approve or Reject */}
                        {activeModal.type !== "view" ? (
                            <form onSubmit={handleActionSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                                        Admin Comment / Justification {activeModal.type === "reject" && <span className="text-rose-500">*</span>}
                                    </label>
                                    <textarea
                                        rows={3}
                                        required={activeModal.type === "reject"}
                                        placeholder={
                                            activeModal.type === "approve"
                                                ? "e.g. Verified against manufacturer batch price list."
                                                : "e.g. Proposed MRP exceeds government NPPA ceiling limits."
                                        }
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#3D3F96] transition-all"
                                    />
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="px-4 py-2.5 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-all text-xs"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={actionLoading}
                                        className={`px-5 py-2.5 rounded-xl text-white font-bold transition-all text-xs flex items-center gap-2 shadow-sm disabled:opacity-50 ${activeModal.type === "approve"
                                                ? "bg-emerald-600 hover:bg-emerald-700"
                                                : "bg-rose-600 hover:bg-rose-700"
                                            }`}
                                    >
                                        {actionLoading && <FaSpinner className="animate-spin text-xs" />}
                                        Confirm {activeModal.type === "approve" ? "Approval" : "Rejection"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all text-xs"
                                >
                                    Close
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

export default HikeRequest;