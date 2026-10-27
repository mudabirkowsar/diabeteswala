
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Ban,
    X,
    Search,
    Calendar,
    Phone,
    User,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Inbox,
    Store,
    Clock,
    AlertCircle,
    Copy,
    Check,
    TicketPercent,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    CheckCircle2,
    Pill
} from "lucide-react";

// Exact AdminAPI service path
import AdminAPI from "../../../../services/AdminAPI";

export default function CancelledPharmacyOrders({ isOpen = true, onClose = () => { } }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [pharmacyFilter, setPharmacyFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCancelled, setTotalCancelled] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    // Apology Coupon Sub-Modal State
    const [selectedOrderForCoupon, setSelectedOrderForCoupon] = useState(null);
    const [couponForm, setCouponForm] = useState({
        couponName: "",
        discountPercentage: 20,
        maxDiscount: 150,
        minOrderAmount: 200,
        maxUsagePerUser: 1,
        expiryDate: ""
    });
    const [submittingCoupon, setSubmittingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH CANCELLED PHARMACY ORDERS (Step 4 API)
    // ========================================================
    const fetchCancelledOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(pharmacyFilter && { pharmacyId: pharmacyFilter })
            };

            const response = await AdminAPI.adminGetCancelledPharmacyOrders(params);

            if (response && response.success) {
                let fetchedData = response.data || [];

                // Filter search term locally if needed
                if (search.trim()) {
                    const q = search.toLowerCase().trim();
                    fetchedData = fetchedData.filter(
                        (ord) =>
                            ord.orderId?.toLowerCase().includes(q) ||
                            ord.customer?.name?.toLowerCase().includes(q) ||
                            ord.customer?.phone?.includes(q) ||
                            ord.cancelReason?.toLowerCase().includes(q)
                    );
                }

                setOrders(fetchedData);
                setTotalPages(response.totalPages || 1);
                setTotalCancelled(response.total || response.count || fetchedData.length);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching cancelled pharmacy orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, pharmacyFilter]);

    useEffect(() => {
        if (!isOpen) return;
        const debounce = setTimeout(() => {
            fetchCancelledOrders();
        }, 300);
        return () => clearTimeout(debounce);
    }, [isOpen, fetchCancelledOrders]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!selectedOrderForCoupon && modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose, selectedOrderForCoupon]);

    // Copy to clipboard helper
    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // Open Compensation Coupon Modal
    const handleOpenCouponModal = (order) => {
        const randomNum = Math.floor(100 + Math.random() * 900);
        const prefix = order.orderType === "Prescription" ? "SORRYMED" : "SORRYHEALTH";
        const defaultName = `${prefix}${randomNum}`;

        const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        setCouponForm({
            couponName: defaultName,
            discountPercentage: 25,
            maxDiscount: 200,
            minOrderAmount: 250,
            maxUsagePerUser: 1,
            expiryDate: defaultExpiry
        });

        setCouponError("");
        setCouponSuccess("");
        setSelectedOrderForCoupon(order);
    };

    // Submit Special Coupon
    const handleCreateCouponSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrderForCoupon) return;

        setCouponError("");
        setCouponSuccess("");
        setSubmittingCoupon(true);

        try {
            const formattedCoupon = couponForm.couponName.trim().toUpperCase();
            const payload = {
                cancellationBookingId: selectedOrderForCoupon.orderId || selectedOrderForCoupon._id,
                userId: selectedOrderForCoupon.customer?.id || selectedOrderForCoupon.customer?._id,
                couponName: formattedCoupon,
                discountPercentage: Number(couponForm.discountPercentage),
                maxDiscount: Number(couponForm.maxDiscount),
                minOrderAmount: Number(couponForm.minOrderAmount) || 0,
                maxUsagePerUser: Number(couponForm.maxUsagePerUser) || 1,
                expiryDate: couponForm.expiryDate
            };

            const response = await AdminAPI.createSpecialUserCoupon(payload);

            if (response && response.success) {
                setCouponSuccess(response.message || "Apology pharmacy coupon issued successfully!");

                // Optimistic UI update
                setOrders((prev) =>
                    prev.map((ord) =>
                        ord._id === selectedOrderForCoupon._id
                            ? { ...ord, isCouponIssued: true, issuedCouponCode: formattedCoupon }
                            : ord
                    )
                );

                setTimeout(() => {
                    setSelectedOrderForCoupon(null);
                }, 1300);
            } else {
                setCouponError(response?.message || "Failed to issue apology coupon.");
            }
        } catch (error) {
            console.error("Error creating special coupon:", error);
            setCouponError(error.response?.data?.message || "Something went wrong while issuing coupon.");
        } finally {
            setSubmittingCoupon(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
            <div
                ref={modalRef}
                className="bg-white rounded-3xl w-full max-w-7xl h-[92vh] max-h-[92vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150 relative"
            >
                {/* 1. MODAL HEADER */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-rose-50/40 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200 shadow-xs">
                            <Ban className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                    Cancelled Pharmacy Orders Hub
                                </h3>
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                    {totalCancelled} Cancelled
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Track dosage errors, stockouts, driver returns, and issue patient apology vouchers
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. SEARCH & CONTROLS */}
                <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, patient, phone, or cancellation reason..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {/* 3. TABLE BODY */}
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left align-middle">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                    <th className="px-5 py-4">Booking Info</th>
                                    <th className="px-5 py-4">Patient Details</th>
                                    <th className="px-5 py-4">Pharmacy Store</th>
                                    <th className="px-5 py-4 w-1/4">Cancelled Medicines & Reason</th>
                                    <th className="px-5 py-4">Timeline</th>
                                    <th className="px-5 py-4">Payment & Refund</th>
                                    <th className="px-5 py-4 text-center w-52">Apology Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-24 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <Loader2 className="w-8 h-8 text-rose-500 animate-spin" />
                                                <span className="text-xs font-bold text-slate-500">Loading cancelled orders...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">
                                            {/* Order ID & Type */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono font-black text-rose-600 text-xs">
                                                        {order.orderId}
                                                    </span>
                                                    <button
                                                        onClick={() => handleCopy(order.orderId, order._id)}
                                                        title="Copy ID"
                                                        className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                                                    >
                                                        {copiedId === order._id ? (
                                                            <Check className="w-3 h-3 text-emerald-600" />
                                                        ) : (
                                                            <Copy className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>
                                                <div className="mt-1">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${order.orderType === "Prescription"
                                                            ? "bg-purple-50 text-purple-700 border-purple-200"
                                                            : "bg-slate-100 text-slate-600 border-slate-200"
                                                            }`}
                                                    >
                                                        {order.orderType || "General"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Patient Details */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                        <User className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-slate-900 text-xs">
                                                            {order.customer?.name || "Patient"}
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                            <Phone className="w-2.5 h-2.5 text-slate-400" />{" "}
                                                            {order.customer?.phone || "N/A"}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Pharmacy Store */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                                    <Store className="w-3 h-3 text-[#3D3F96] shrink-0" />
                                                    {order.pharmacy?.name || "Pharmacy Store"}
                                                </div>
                                                <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                    {order.pharmacy?.city || "Mohali"} &bull; {order.pharmacy?.phone || ""}
                                                </div>
                                            </td>

                                            {/* Medicines & Cancel Reason */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-1 mb-1.5">
                                                    {order.itemsSummary && order.itemsSummary.length > 0 ? (
                                                        order.itemsSummary.map((med, idx) => (
                                                            <div key={idx} className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                                                <Pill className="w-3 h-3 text-rose-400 shrink-0" />
                                                                <span>{med.name}</span>
                                                                <span className="text-[10px] text-slate-400 font-black">
                                                                    (x{med.quantity})
                                                                </span>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs font-bold text-slate-700">
                                                            {order.itemsCount || 1} Medicine Items
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="inline-flex items-start gap-1.5 p-2 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-700 text-[11px] font-medium w-full">
                                                    <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                                    <div>
                                                        <span className="font-bold">Reason:</span>{" "}
                                                        {order.cancelReason || "Cancelled by patient or store"}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Timeline */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="space-y-1 text-[11px]">
                                                    <div className="text-slate-600 font-semibold flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        <strong className="text-slate-800 font-bold">
                                                            {order.formattedCancelledDate ||
                                                                (order.cancelledAt
                                                                    ? new Date(order.cancelledAt).toLocaleDateString("en-IN", {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric"
                                                                    })
                                                                    : "N/A")}
                                                        </strong>
                                                    </div>
                                                    {order.cancelledAt && (
                                                        <div className="text-slate-400 text-[10px] font-medium flex items-center gap-1 pl-4">
                                                            <Clock className="w-2.5 h-2.5" />
                                                            {new Date(order.cancelledAt).toLocaleTimeString([], {
                                                                hour: "2-digit",
                                                                minute: "2-digit"
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Payment & Refund Status */}
                                            <td className="px-5 py-4 align-top">
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                    {order.paymentMethod || "Online"}
                                                </div>
                                                <div className="text-xs font-black text-slate-900 mt-0.5">
                                                    ₹{(order.totalAmount || 0).toLocaleString("en-IN")}
                                                </div>
                                                <div className="mt-1">
                                                    <span
                                                        className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${order.paymentStatus?.toLowerCase().includes("refund")
                                                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                            : order.paymentStatus === "Paid"
                                                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                                : "bg-slate-100 text-slate-600"
                                                            }`}
                                                    >
                                                        {order.paymentStatus || "Refund-Initiated"}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Apology Voucher Status & Action */}
                                            <td className="px-5 py-4 align-top text-center">
                                                {order.isCouponIssued ? (
                                                    <div className="inline-flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 max-w-[180px]">
                                                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
                                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                            <span>VOUCHER ISSUED</span>
                                                        </div>
                                                        {order.issuedCouponCode && (
                                                            <span className="text-[10px] font-mono font-extrabold bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded-md mt-1 border border-emerald-300/60 truncate max-w-[150px]">
                                                                {order.issuedCouponCode}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenCouponModal(order)}
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#3D3F96] to-[#4F52B2] text-white hover:opacity-95 text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none"
                                                    >
                                                        <TicketPercent className="w-3.5 h-3.5" />
                                                        <span>ISSUE VOUCHER</span>
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <Inbox className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-xs font-bold text-slate-700">No Cancelled Pharmacy Orders</h4>
                                                <p className="text-[11px] text-slate-400">
                                                    There are no cancelled pharmacy bookings matching your criteria.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 4. MODAL FOOTER & PAGINATION */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex-wrap gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            disabled={page <= 1 || loading}
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" /> Previous
                        </button>
                        <span className="text-xs font-extrabold text-slate-600">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            disabled={page >= totalPages || loading}
                            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-xs font-extrabold uppercase tracking-wider transition-all focus:outline-none shadow-xs cursor-pointer"
                    >
                        Close Modal
                    </button>
                </div>

                {/* ========================================================
                    5. SPECIAL APOLOGY VOUCHER ISSUANCE POPUP
                ======================================================== */}
                {selectedOrderForCoupon && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden select-none animate-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#3D3F96]/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-900">Issue Patient Apology Voucher</h4>
                                        <p className="text-[11px] font-semibold text-slate-500">
                                            Exclusive to {selectedOrderForCoupon.customer?.name} ({selectedOrderForCoupon.orderId})
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedOrderForCoupon(null)}
                                    className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateCouponSubmit} className="p-6 space-y-4">
                                {couponError && (
                                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{couponError}</span>
                                    </div>
                                )}

                                {couponSuccess && (
                                    <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 shrink-0" />
                                        <span>{couponSuccess}</span>
                                    </div>
                                )}

                                <div className="space-y-1">
                                    <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                        Voucher Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={couponForm.couponName}
                                        onChange={(e) =>
                                            setCouponForm({ ...couponForm, couponName: e.target.value.toUpperCase() })
                                        }
                                        placeholder="e.g. SORRYMED25"
                                        className="w-full px-3.5 py-2 text-xs font-black tracking-wider uppercase rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                            Discount % *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            max="100"
                                            value={couponForm.discountPercentage}
                                            onChange={(e) =>
                                                setCouponForm({ ...couponForm, discountPercentage: e.target.value })
                                            }
                                            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                            Max Discount (₹) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            value={couponForm.maxDiscount}
                                            onChange={(e) =>
                                                setCouponForm({ ...couponForm, maxDiscount: e.target.value })
                                            }
                                            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                            Min Order (₹)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={couponForm.minOrderAmount}
                                            onChange={(e) =>
                                                setCouponForm({ ...couponForm, minOrderAmount: e.target.value })
                                            }
                                            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                            Expiry Date *
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={couponForm.expiryDate}
                                            onChange={(e) =>
                                                setCouponForm({ ...couponForm, expiryDate: e.target.value })
                                            }
                                            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2 flex items-center justify-end gap-2.5">
                                    <button
                                        type="button"
                                        disabled={submittingCoupon}
                                        onClick={() => setSelectedOrderForCoupon(null)}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={submittingCoupon}
                                        className="px-5 py-2 rounded-xl bg-[#3D3F96] hover:bg-[#2F3175] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        {submittingCoupon ? (
                                            <>
                                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                <span>Issuing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Issue Voucher</span>
                                                <ArrowRight className="w-3.5 h-3.5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}