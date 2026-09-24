"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Ban,
    X,
    Search,
    Calendar,
    Phone,
    Mail,
    User,
    CreditCard,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Inbox,
    Utensils,
    Layers,
    Clock,
    AlertCircle,
    Copy,
    Check,
    TicketPercent,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    CheckCircle2
} from "lucide-react";

// Exact AdminAPI path as requested
import AdminAPI from "../../../../services/AdminAPI";

export default function CancelledFoodOrdersModal({ isOpen, onClose }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [bookingType, setBookingType] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCancelledOrders, setTotalCancelledOrders] = useState(0);
    const [copiedId, setCopiedId] = useState(null);

    // Compensation Coupon Sub-Modal State
    const [selectedOrderForCoupon, setSelectedOrderForCoupon] = useState(null);
    const [couponForm, setCouponForm] = useState({
        couponName: "",
        discountPercentage: 50,
        maxDiscount: 250,
        minOrderAmount: 100,
        maxUsagePerUser: 1,
        expiryDate: ""
    });
    const [submittingCoupon, setSubmittingCoupon] = useState(false);
    const [couponError, setCouponError] = useState("");
    const [couponSuccess, setCouponSuccess] = useState("");

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH CANCELLED FOOD ORDERS API
    // ========================================================
    const fetchCancelledOrders = useCallback(async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                ...(search.trim() && { search: search.trim() }),
                ...(bookingType && { bookingType })
            };

            const response = await AdminAPI.getCancelledFoodVendorOrders(params);

            if (response && response.success) {
                setOrders(response.data || []);
                setTotalPages(response.totalPages || 1);
                setTotalCancelledOrders(response.totalCancelledOrders || response.count || 0);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetching cancelled food orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [page, search, bookingType]);

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

    // Helper for Booking Type Badge colors
    const getBookingTypeBadge = (type) => {
        switch (type) {
            case "Healthy Plan":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Subscription":
                return "bg-purple-50 text-purple-700 border-purple-200";
            case "Custom Plate":
                return "bg-sky-50 text-sky-700 border-sky-200";
            case "Direct":
            default:
                return "bg-amber-50 text-amber-700 border-amber-200";
        }
    };

    // Open Coupon Modal with prefilled defaults
    const handleOpenCouponModal = (order) => {
        let prefix = "SORRY";
        if (order.bookingType === "Healthy Plan") prefix = "SORRYHEALTHY";
        else if (order.bookingType === "Subscription") prefix = "SORRYTIFFIN";
        else if (order.bookingType === "Custom Plate") prefix = "SORRYCUSTOM";
        else prefix = "SORRYFOOD";

        const randomCode = Math.floor(100 + Math.random() * 900);
        const defaultName = `${prefix}${randomCode}`;

        // Default expiry date: 30 days from now (YYYY-MM-DD)
        const defaultExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0];

        setCouponForm({
            couponName: defaultName,
            discountPercentage: 50,
            maxDiscount: 250,
            minOrderAmount: 100,
            maxUsagePerUser: 1,
            expiryDate: defaultExpiry
        });

        setCouponError("");
        setCouponSuccess("");
        setSelectedOrderForCoupon(order);
    };

    // ========================================================
    // 2. CREATE SPECIAL COMPENSATION COUPON SUBMIT
    // ========================================================
    const handleCreateCouponSubmit = async (e) => {
        e.preventDefault();
        if (!selectedOrderForCoupon) return;

        setCouponError("");
        setCouponSuccess("");
        setSubmittingCoupon(true);

        try {
            const formattedCouponName = couponForm.couponName.trim().toUpperCase();
            const payload = {
                cancellationBookingId: selectedOrderForCoupon.bookingId,
                userId: selectedOrderForCoupon.customer?.userId || selectedOrderForCoupon.customer?._id,
                couponName: formattedCouponName,
                discountPercentage: Number(couponForm.discountPercentage),
                maxDiscount: Number(couponForm.maxDiscount),
                minOrderAmount: Number(couponForm.minOrderAmount) || 0,
                maxUsagePerUser: Number(couponForm.maxUsagePerUser) || 1,
                expiryDate: couponForm.expiryDate
            };

            const response = await AdminAPI.createSpecialUserCoupon(payload);

            if (response && response.success) {
                setCouponSuccess(response.message || "Special compensation coupon issued successfully!");

                // Immediately update the order status in local state (Optimistic UI update)
                setOrders((prevOrders) =>
                    prevOrders.map((ord) =>
                        ord._id === selectedOrderForCoupon._id
                            ? { ...ord, isCouponIssued: true, issuedCouponCode: formattedCouponName }
                            : ord
                    )
                );

                setTimeout(() => {
                    setSelectedOrderForCoupon(null);
                }, 1300);
            } else {
                setCouponError(response?.message || "Failed to create compensation coupon.");
            }
        } catch (error) {
            console.error("Error creating special coupon:", error);
            setCouponError(error.response?.data?.message || "Something went wrong creating the coupon.");
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
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">Cancelled Food Orders Hub</h3>
                                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                                    {totalCancelledOrders} Cancelled
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Track cancellation reasons and issue personalized apology coupons with one-click user lock
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

                {/* 2. SEARCH & FILTER CONTROLS */}
                <div className="px-6 py-3.5 border-b border-slate-100 bg-white flex flex-wrap items-center justify-between gap-4 shrink-0">
                    <div className="relative flex-1 min-w-[240px] max-w-md">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by Booking ID, customer, phone, or reason..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-rose-400 focus:outline-none transition-all"
                        />
                    </div>

                    {/* Booking Type Filter */}
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Layers className="w-3.5 h-3.5 text-slate-400" />
                            <span>Type:</span>
                        </div>
                        <select
                            value={bookingType}
                            onChange={(e) => {
                                setBookingType(e.target.value);
                                setPage(1);
                            }}
                            className="text-xs font-bold rounded-xl px-4 py-2 bg-slate-50 border border-slate-200 focus:outline-none text-slate-700 cursor-pointer"
                        >
                            <option value="">All Booking Types</option>
                            <option value="Direct">Direct</option>
                            <option value="Healthy Plan">Healthy Plan</option>
                            <option value="Subscription">Subscription</option>
                            <option value="Custom Plate">Custom Plate</option>
                        </select>
                    </div>
                </div>

                {/* 3. TABLE BODY */}
                <div className="overflow-y-auto flex-1 p-6">
                    <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-xs">
                        <table className="w-full text-xs text-left align-middle">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100">
                                    <th className="px-5 py-4">Booking Info</th>
                                    <th className="px-5 py-4">Customer Details</th>
                                    <th className="px-5 py-4">Kitchen / Outlet</th>
                                    <th className="px-5 py-4 w-1/4">Cancelled Item & Reason</th>
                                    <th className="px-5 py-4">Timeline</th>
                                    <th className="px-5 py-4">Payment</th>
                                    <th className="px-5 py-4 text-center w-52">Apology Coupon Status</th>
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
                                    orders.map((order) => {
                                        return (
                                            <tr key={order._id} className="hover:bg-slate-50/60 transition-colors">

                                                {/* Booking Info */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono font-black text-rose-600 text-xs">
                                                            {order.bookingId}
                                                        </span>
                                                        <button
                                                            onClick={() => handleCopy(order.bookingId, order._id)}
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
                                                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${getBookingTypeBadge(order.bookingType)}`}>
                                                            {order.bookingType}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Customer Details */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center gap-3">
                                                        {order.customer?.profilePic ? (
                                                            <img
                                                                src={order.customer.profilePic}
                                                                alt={order.customer.name}
                                                                className="w-8 h-8 rounded-xl object-cover border border-slate-200 shrink-0"
                                                                onError={(e) => {
                                                                    e.target.onerror = null;
                                                                    e.target.src = "https://placehold.co/80x80?text=User";
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 shrink-0">
                                                                <User className="w-4 h-4" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-1">
                                                                {order.customer?.name || "Anonymous User"}
                                                            </div>
                                                            <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                <Phone className="w-2.5 h-2.5 text-slate-400" /> {order.customer?.phone || "N/A"}
                                                            </div>
                                                            {order.customer?.email && (
                                                                <div className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.2">
                                                                    <Mail className="w-2.5 h-2.5" /> {order.customer.email}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Kitchen / Outlet */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
                                                        <Utensils className="w-3 h-3 text-amber-500 shrink-0" />
                                                        {order.kitchen?.name || "Main Outlet"}
                                                    </div>
                                                    <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                                                        {order.kitchen?.city || "Mohali"} &bull; {order.kitchen?.phone || ""}
                                                    </div>
                                                </td>

                                                {/* Item Summary & Cancellation Reason */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="font-bold text-slate-800 text-xs mb-1">
                                                        {order.itemSummary}
                                                    </div>
                                                    <div className="inline-flex items-start gap-1.5 p-2 rounded-xl bg-rose-50/80 border border-rose-200/60 text-rose-700 text-[11px] font-medium w-full">
                                                        <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                                                        <div>
                                                            <span className="font-bold">Reason:</span> {order.cancelReason || "Cancelled by vendor/user"}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Dates / Timeline */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="space-y-1 text-[11px]">
                                                        <div className="text-slate-600 font-semibold flex items-center gap-1">
                                                            <Calendar className="w-3 h-3 text-slate-400" />
                                                            <span>Cancelled:</span>
                                                            <strong className="text-slate-800 font-bold">
                                                                {order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "N/A"}
                                                            </strong>
                                                        </div>
                                                        {order.cancelledAt && (
                                                            <div className="text-slate-400 text-[10px] font-medium flex items-center gap-1 pl-4">
                                                                <Clock className="w-2.5 h-2.5" />
                                                                {new Date(order.cancelledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* Payment Details */}
                                                <td className="px-5 py-4 align-top">
                                                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                                        {order.payment?.paymentMethod || "Online"}
                                                    </div>
                                                    <div className="text-xs font-black text-slate-900 mt-0.5">
                                                        ₹{(order.payment?.totalAmount || 0).toLocaleString("en-IN")}
                                                    </div>
                                                    <div className="mt-1">
                                                        <span className={`inline-block px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${order.payment?.paymentStatus === "Paid"
                                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                            : "bg-slate-100 text-slate-600"
                                                            }`}>
                                                            {order.payment?.paymentStatus || "Paid"}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Apology Coupon Button / Status */}
                                                <td className="px-5 py-4 align-top text-center">
                                                    {order.isCouponIssued ? (
                                                        <div className="inline-flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 max-w-[180px]">
                                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                                                <span>COUPON ISSUED</span>
                                                            </div>
                                                            {order.issuedCouponCode && (
                                                                <span className="text-[10px] font-mono font-extrabold bg-emerald-100/80 text-emerald-900 px-2 py-0.5 rounded-md mt-1 border border-emerald-300/60 truncate max-w-[150px]">
                                                                    {order.issuedCouponCode}
                                                                </span>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            disabled={order.isCouponIssued}
                                                            onClick={() => handleOpenCouponModal(order)}
                                                            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#3D3F96] to-[#4F52B2] text-white hover:opacity-95 text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all cursor-pointer focus:outline-none"
                                                        >
                                                            <TicketPercent className="w-3.5 h-3.5" />
                                                            <span>APOLOGY COUPON</span>
                                                        </button>
                                                    )}
                                                </td>

                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center gap-2.5">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300">
                                                    <Inbox className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-xs font-bold text-slate-700">No Cancelled Orders Found</h4>
                                                <p className="text-[11px] text-slate-400">There are no cancelled food orders matching your filter criteria.</p>
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
                    5. SPECIAL USER COMPENSATION COUPON MODAL POPUP
                ======================================================== */}
                {selectedOrderForCoupon && (
                    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
                        <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden select-none animate-in zoom-in-95 duration-150">

                            {/* Submodal Header */}
                            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-[#3D3F96]/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center font-bold">
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-black text-slate-900">Issue Apology Voucher</h4>
                                        <p className="text-[11px] font-semibold text-slate-500">
                                            Exclusive to {selectedOrderForCoupon.customer?.name} ({selectedOrderForCoupon.bookingId})
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

                            {/* Submodal Form */}
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
                                        Unique Coupon Code *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={couponForm.couponName}
                                        onChange={(e) => setCouponForm({ ...couponForm, couponName: e.target.value.toUpperCase() })}
                                        placeholder="e.g. SORRYHEALTHY50"
                                        className="w-full px-3.5 py-2 text-xs font-black tracking-wider uppercase rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                    />
                                    <span className="text-[10px] text-slate-400 font-medium">Auto-converted to uppercase</span>
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
                                            onChange={(e) => setCouponForm({ ...couponForm, discountPercentage: e.target.value })}
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
                                            onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
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
                                            onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                            Usage Per User
                                        </label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={couponForm.maxUsagePerUser}
                                            onChange={(e) => setCouponForm({ ...couponForm, maxUsagePerUser: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider">
                                        Expiry Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={couponForm.expiryDate}
                                        onChange={(e) => setCouponForm({ ...couponForm, expiryDate: e.target.value })}
                                        className="w-full px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#3D3F96] focus:outline-none transition-all cursor-pointer"
                                    />
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
                                                <span>Issue Apology Coupon</span>
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