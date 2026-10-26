"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Pill,
    MapPin,
    Store,
    Phone,
    CheckCircle2,
    AlertCircle,
    ShieldCheck,
    Truck,
    ReceiptText,
    Clock,
    Loader2,
    Calendar,
    Sparkles,
    RefreshCw,
    XCircle,
    Star,
    Tag,
    AlertTriangle,
    CreditCard,
    RotateCcw
} from 'lucide-react';

// API Service & Notification Context
import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=300";

const getMediaUrl = (path) => {
    if (!path) return PLACEHOLDER_IMAGE;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanBase = BASE_SERVER_URL.replace(/\/+$/, '');
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${cleanBase}${cleanPath}`;
};

export default function PharmacyOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const orderId = params?.id;
    const { showNotification } = useNotification();

    // --- State ---
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Cancel Modal States
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // --- Fetch Single Order Details ---
    const fetchOrderDetails = useCallback(async (isRefresh = false) => {
        if (!orderId) return;
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        try {
            const response = await UserAPI.getUserPharmacyOrderDetails(orderId);
            if (response && response.success) {
                setOrder(response.data);
                if (isRefresh && showNotification) {
                    showNotification("Order ledger updated!", "success");
                }
            } else {
                if (showNotification) {
                    showNotification("Failed to load pharmacy order specifications.", "error");
                }
            }
        } catch (err) {
            console.error("Error fetching pharmacy order details:", err);
            if (showNotification) {
                showNotification(err?.response?.data?.message || "Failed to retrieve order details.", "error");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [orderId, showNotification]);

    useEffect(() => {
        fetchOrderDetails();
    }, [fetchOrderDetails]);

    // --- Cancel Order Handler ---
    const handleCancelOrder = async () => {
        if (!cancelReason.trim()) {
            if (showNotification) {
                showNotification("Please provide a reason for cancellation.", "error");
            }
            return;
        }

        setCancelling(true);
        try {
            const response = await UserAPI.cancelUserPharmacyOrder({
                orderId: order?.orderId || order?._id,
                reason: cancelReason
            });

            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || "Order cancelled successfully.", "success");
                }
                setIsCancelModalOpen(false);
                fetchOrderDetails(true);
            } else {
                if (showNotification) {
                    showNotification(response?.message || "Unable to cancel order.", "error");
                }
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            if (showNotification) {
                showNotification(err?.response?.data?.message || "Failed to cancel order.", "error");
            }
        } finally {
            setCancelling(false);
        }
    };

    // --- Status Badge Helper ---
    const renderStatusBadge = (status) => {
        const uppercase = status?.toUpperCase() || 'PLACED';

        if (uppercase === 'DELIVERED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200 shadow-xs">
                    <CheckCircle2 size={13} className="text-emerald-600" /> Delivered
                </span>
            );
        }
        if (uppercase === 'CANCELLED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-700 bg-rose-50 px-3.5 py-1.5 rounded-full border border-rose-200 shadow-xs">
                    <AlertCircle size={13} className="text-rose-600" /> Cancelled
                </span>
            );
        }
        if (uppercase === 'SHIPPED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 shadow-xs animate-pulse">
                    <Truck size={13} className="text-amber-600" /> Shipped
                </span>
            );
        }
        if (uppercase === 'PACKED') {
            return (
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                    <Sparkles size={13} className="text-[#3d3f96]" /> Packed by Pharmacy
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200 shadow-xs">
                <Loader2 size={13} className="animate-spin text-[#3d3f96]" /> {status || 'Placed'}
            </span>
        );
    };

    // --- Order Lifecycle / Timeline Stepper ---
    const renderTrackingTimeline = () => {
        if (!order?.trackingTimeline || order.status?.toUpperCase() === 'CANCELLED') {
            return null;
        }

        return (
            <div className="bg-gradient-to-r from-slate-50 to-indigo-50/40 p-5 sm:p-6 rounded-3xl border border-slate-100">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative">
                    {order.trackingTimeline.map((step) => {
                        const isDone = step.isCompleted;
                        const isCurrent = step.isCurrent;

                        return (
                            <div key={step.step} className="flex flex-col items-center text-center space-y-2 relative z-10">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                        isDone
                                            ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/20 ring-4 ring-white'
                                            : isCurrent
                                            ? 'bg-amber-500 text-white shadow-md ring-4 ring-amber-100 animate-bounce'
                                            : 'bg-white text-slate-300 border border-slate-200 ring-4 ring-white'
                                    }`}
                                >
                                    {isDone ? <CheckCircle2 size={18} /> : <span className="font-mono text-xs font-black">{step.step}</span>}
                                </div>
                                <div className="space-y-0.5">
                                    <h4
                                        className={`text-xs font-black uppercase tracking-tight ${
                                            isDone ? 'text-slate-900' : isCurrent ? 'text-amber-700' : 'text-slate-400'
                                        }`}
                                    >
                                        {step.title}
                                    </h4>
                                    <p className="text-[10px] text-slate-400 line-clamp-2">{step.description}</p>
                                    {step.time && (
                                        <span className="text-[9px] font-mono text-slate-400 block pt-0.5">
                                            {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center shadow-xs">
                    <Loader2 className="animate-spin text-[#3d3f96]" size={32} />
                </div>
                <div className="text-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-widest">Retrieving Pharmacy Ledger...</p>
                    <p className="text-xs font-semibold text-slate-400 mt-1">Fetching live tracking, prescriptions, and dispatch status</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4">
                <AlertCircle className="w-12 h-12 text-rose-500" />
                <h2 className="text-lg font-black text-slate-800">Prescription Order Not Found</h2>
                <p className="text-xs text-slate-400 font-medium">We couldn&apos;t retrieve the ledger for this order reference identifier.</p>
                <button
                    onClick={() => router.back()}
                    className="mt-2 inline-flex items-center gap-2 bg-[#3d3f96] text-white text-xs font-black uppercase px-6 py-3 rounded-2xl cursor-pointer hover:bg-[#2e3075] transition"
                >
                    <ArrowLeft size={14} /> Go Back to Orders
                </button>
            </div>
        );
    }

    const pharmacy = order.pharmacy || {};
    const pharmacyImg = getMediaUrl(pharmacy.image);
    const isDelivered = order.status?.toUpperCase() === 'DELIVERED';
    const isCancelled = order.status?.toUpperCase() === 'CANCELLED';
    const isShipped = order.status?.toUpperCase() === 'SHIPPED';
    const isOutForDelivery =
        order.deliveryStatus === 'OutForDelivery' ||
        order.deliveryStatus === 'PickedUp' ||
        order.deliveryStatus === 'ReachedLocation';

    // Cancellation is allowed strictly prior to shipping or out for delivery
    const canCancel = !isDelivered && !isCancelled && !isShipped && !isOutForDelivery;

    return (
        <div className="max-w-[1400px] mx-auto py-6 px-4 sm:px-6 space-y-6 text-left select-none antialiased">
            {/* --- TOP NAVIGATION BAR --- */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 hover:bg-slate-50 flex items-center justify-center text-slate-600 transition shadow-xs cursor-pointer"
                        title="Back to Orders"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-mono">
                                #{order.orderId}
                            </h1>
                            <span className="text-[10px] font-black uppercase text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg">
                                {order.orderType || 'General'}
                            </span>
                            {order.deliveryMode?.isRapid && (
                                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                                    Express Rapid
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                            <Calendar size={13} /> Placed on {order.formattedDate || new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                    {canCancel && (
                        <button
                            onClick={() => setIsCancelModalOpen(true)}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                        >
                            <XCircle size={14} />
                            <span>Cancel Order</span>
                        </button>
                    )}
                    <button
                        onClick={() => fetchOrderDetails(true)}
                        disabled={refreshing}
                        className="px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl text-xs font-extrabold text-slate-700 flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                        <RefreshCw size={13} className={refreshing ? "animate-spin text-[#3d3f96]" : ""} />
                        <span>Refresh</span>
                    </button>
                    <div>{renderStatusBadge(order.status)}</div>
                </div>
            </div>

            {/* --- MAIN GRID LAYOUT --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* === LEFT COLUMN: TRACKER, ITEMS, PIN & RETURNS (2 COLS) === */}
                <div className="lg:col-span-2 space-y-6">

                    {/* 1. Live Step-by-Step Tracking Timeline */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Sparkles size={14} className="text-[#3d3f96]" /> Pharmacy Fulfillment Pipeline
                            </h3>
                            <span className="text-xs font-bold text-slate-600">
                                Dispatch Mode: <strong className="text-slate-900">{order.collectionType || 'Home Delivery'}</strong>
                            </span>
                        </div>
                        {renderTrackingTimeline()}

                        {/* Scheduled Slot Notice */}
                        {order.slotSchedule?.timeSlot && (
                            <div className="flex items-center gap-2 p-3 bg-indigo-50/60 border border-indigo-100 rounded-2xl text-xs font-bold text-indigo-900">
                                <Clock size={14} className="text-[#3d3f96] shrink-0" />
                                <span>
                                    Scheduled Window: <strong>{order.slotSchedule.formattedDate || order.slotSchedule.date}</strong> at <strong>{order.slotSchedule.timeSlot}</strong>
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Security Delivery OTP / PIN */}
                    {order.deliveryOTP && !isDelivered && !isCancelled && (
                        <div className="bg-gradient-to-r from-red-50/70 to-rose-50/50 border border-red-200/70 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600 flex items-center gap-1.5">
                                    <ShieldCheck size={14} /> Doorstep Handover Verification PIN
                                </span>
                                <p className="text-xs font-bold text-slate-600">
                                    Share this secret 4-digit code with the courier upon receiving your medicine package.
                                </p>
                            </div>
                            <div className="bg-white px-5 py-2.5 rounded-2xl border border-red-200 shadow-xs text-center shrink-0">
                                <span className="text-2xl font-black font-mono tracking-widest text-red-600">
                                    {order.deliveryOTP}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* 3. Ordered Medicines Breakdown */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <Pill size={14} className="text-[#3d3f96]" />
                                Prescribed Medicines & Healthcare Products ({order.items?.length || 0})
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400">Authentic & Verified</span>
                        </div>

                        <div className="divide-y divide-slate-100">
                            {order.items?.map((item, idx) => {
                                const medImg = getMediaUrl(item.image);
                                return (
                                    <div key={item.medicineId || idx} className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                                <img
                                                    src={medImg}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = PLACEHOLDER_IMAGE;
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1 min-w-0">
                                                <h4 className="text-sm font-extrabold text-slate-900 truncate">
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center gap-2 flex-wrap text-[10px] font-bold text-slate-400">
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-600">
                                                        {item.packaging || 'Standard Pack'}
                                                    </span>
                                                    {item.duration && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-[#3d3f96]">{item.duration}</span>
                                                        </>
                                                    )}
                                                    {item.isComboApplied && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-emerald-600 font-extrabold">Combo Applied</span>
                                                        </>
                                                    )}
                                                    {item.freeQuantity > 0 && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="text-emerald-600 font-black">+{item.freeQuantity} Free</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-left sm:text-right shrink-0">
                                            <div className="flex items-center sm:justify-end gap-2">
                                                {item.mrp && item.mrp > item.price && (
                                                    <span className="text-xs text-slate-400 line-through font-mono">
                                                        ₹{item.mrp}
                                                    </span>
                                                )}
                                                <span className="text-xs text-slate-500 font-bold">
                                                    {item.quantity} × ₹{item.price}
                                                </span>
                                            </div>
                                            <div className="font-mono text-sm font-black text-slate-900 mt-0.5">
                                                ₹{(item.price || 0) * (item.quantity || 1)}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Return / Replacement Status */}
                    {order.returnDetails && order.returnDetails.status !== 'None' && (
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <RotateCcw size={14} className="text-amber-600" />
                                Return / Replacement Request
                            </h3>
                            <div className="bg-amber-50/70 border border-amber-200/60 p-4 rounded-2xl space-y-1.5 text-xs">
                                <div className="flex items-center justify-between font-bold text-amber-900">
                                    <span>Type: {order.returnDetails.requestType || 'Return'}</span>
                                    <span className="uppercase text-[10px] bg-amber-200/60 px-2 py-0.5 rounded-md">
                                        Status: {order.returnDetails.status}
                                    </span>
                                </div>
                                {order.returnDetails.reason && (
                                    <p className="text-amber-800">Reason: {order.returnDetails.reason}</p>
                                )}
                                {order.returnDetails.refundAmount > 0 && (
                                    <p className="text-emerald-700 font-black font-mono">
                                        Refund Initiated: ₹{order.returnDetails.refundAmount}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                </div>

                {/* === RIGHT COLUMN: BILL SUMMARY, PHARMACY, ADDRESS, DRIVER (1 COL) === */}
                <div className="space-y-6">

                    {/* 1. Complete Bill Ledger */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <ReceiptText size={14} className="text-emerald-500" />
                                Payment & Bill Ledger
                            </h3>
                            <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                {order.paymentInfo?.method || 'COD'} ({order.paymentInfo?.status || 'Pending'})
                            </span>
                        </div>

                        <div className="space-y-2.5 text-xs font-bold text-slate-600">
                            {order.billSummary?.originalItemTotal > order.billSummary?.itemTotal && (
                                <div className="flex justify-between items-center text-slate-400">
                                    <span>Total MRP Value</span>
                                    <span className="font-mono line-through">₹{order.billSummary?.originalItemTotal}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Item Subtotal</span>
                                <span className="font-mono text-slate-800">₹{order.billSummary?.itemTotal || 0}</span>
                            </div>

                            {order.billSummary?.comboSavings > 0 && (
                                <div className="flex justify-between items-center text-emerald-600">
                                    <span>Combo / BOGO Savings</span>
                                    <span className="font-mono font-black">-₹{order.billSummary?.comboSavings}</span>
                                </div>
                            )}

                            {order.billSummary?.couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-rose-600">
                                    <span className="flex items-center gap-1">
                                        <Tag size={12} /> Voucher Discount
                                    </span>
                                    <span className="font-mono font-black">-₹{order.billSummary?.couponDiscount}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center">
                                <span className="text-slate-500">Delivery Charges</span>
                                <span className="font-mono text-slate-800">
                                    {order.billSummary?.deliveryCharge > 0 ? `₹${order.billSummary.deliveryCharge}` : 'FREE'}
                                </span>
                            </div>

                            {order.billSummary?.rapidDeliveryCharge > 0 && (
                                <div className="flex justify-between items-center text-amber-700">
                                    <span>Rapid Express Dispatch</span>
                                    <span className="font-mono font-black">+₹{order.billSummary?.rapidDeliveryCharge}</span>
                                </div>
                            )}

                            {order.billSummary?.slotCharge > 0 && (
                                <div className="flex justify-between items-center text-[#3d3f96]">
                                    <span>Scheduled Premium Slot</span>
                                    <span className="font-mono font-black">+₹{order.billSummary?.slotCharge}</span>
                                </div>
                            )}

                            {/* Final Total Amount */}
                            <div className="flex justify-between items-center text-slate-900 border-t border-slate-200 pt-3.5 text-sm font-black">
                                <div>
                                    <span className="block leading-none">Grand Total</span>
                                    <span className="text-[10px] text-slate-400 font-bold">Inclusive of all medical taxes</span>
                                </div>
                                <span className="font-mono text-xl font-black text-[#3d3f96]">
                                    ₹{order.billSummary?.totalAmount || 0}
                                </span>
                            </div>
                        </div>

                        {order.paymentInfo?.transactionId && (
                            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <CreditCard size={13} className="text-[#3d3f96]" /> Transaction Ref
                                </span>
                                <span className="font-mono text-slate-700 uppercase">
                                    {order.paymentInfo.transactionId}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 2. Pharmacy Store Partner Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Store size={14} className="text-[#3d3f96]" /> Dispensed By
                        </h3>

                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                <img
                                    src={pharmacyImg}
                                    alt={pharmacy.name || "Pharmacy"}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = PLACEHOLDER_IMAGE;
                                    }}
                                />
                            </div>
                            <div className="min-w-0 space-y-0.5">
                                <h4 className="text-sm font-extrabold text-slate-900 truncate flex items-center gap-1.5">
                                    {pharmacy.name || "Partner Pharmacy"}
                                    {pharmacy.rating && (
                                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                                            <Star size={10} className="fill-amber-400 text-amber-400" />
                                            {pharmacy.rating}
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <MapPin size={11} /> {pharmacy.address || pharmacy.city || "Mohali"}
                                </p>
                            </div>
                        </div>

                        {pharmacy.phone && (
                            <a
                                href={`tel:${pharmacy.phone}`}
                                className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 rounded-xl text-slate-700 text-xs font-extrabold flex items-center justify-center gap-2 transition"
                            >
                                <Phone size={13} /> Call Chemist ({pharmacy.phone})
                            </a>
                        )}
                    </div>

                    {/* 3. Delivery Recipient Address */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                <MapPin size={14} className="text-[#3d3f96]" /> Destination Address
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                                {order.deliveryAddress?.addressType || "Home"}
                            </span>
                        </div>

                        <div className="space-y-1 text-xs">
                            <strong className="text-slate-900 font-extrabold block text-sm">
                                {order.deliveryAddress?.name || "Patient"}
                            </strong>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {[
                                    order.deliveryAddress?.houseNo,
                                    order.deliveryAddress?.sector,
                                    order.deliveryAddress?.landmark,
                                    order.deliveryAddress?.city,
                                    order.deliveryAddress?.state,
                                    order.deliveryAddress?.pincode
                                ]
                                    .filter(Boolean)
                                    .join(", ")}
                            </p>
                            {order.deliveryAddress?.phone && (
                                <p className="text-slate-400 font-bold pt-1 flex items-center gap-1">
                                    <Phone size={11} /> +91 {order.deliveryAddress.phone}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* 4. Assigned Logistics Courier */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                            <Truck size={14} className="text-[#3d3f96]" /> Assigned Courier Partner
                        </h3>

                        {order.deliveryPartner ? (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-[#3d3f96] flex items-center justify-center shrink-0 font-bold">
                                        <Truck size={18} />
                                    </div>
                                    <div>
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">
                                            {order.deliveryPartner.vehicleType || "Courier Associate"} ({order.deliveryPartner.vehicleNumber || 'Standard'})
                                        </span>
                                        <strong className="text-xs font-black text-slate-900 block">
                                            {order.deliveryPartner.name || "Assigned Driver"}
                                        </strong>
                                    </div>
                                </div>
                                {order.deliveryPartner.phone && (
                                    <a
                                        href={`tel:${order.deliveryPartner.phone}`}
                                        className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition"
                                        title="Call Driver"
                                    >
                                        <Phone size={14} />
                                    </a>
                                )}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center gap-3 text-slate-500">
                                <Truck size={18} className="text-slate-400 animate-pulse shrink-0" />
                                <div className="text-xs">
                                    <span className="font-bold block text-slate-700">Assigning Logistics Partner</span>
                                    <span className="text-[10px] text-slate-400">Medicines are being packed & sealed by the chemist</span>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

            </div>

            {/* --- CANCELLATION MODAL DIALOG --- */}
            {isCancelModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-rose-600 font-black text-sm">
                                <AlertTriangle size={18} />
                                <span>Cancel Medicine Order</span>
                            </div>
                            <button
                                onClick={() => setIsCancelModalOpen(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition"
                            >
                                <XCircle size={18} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 font-medium leading-relaxed">
                            Are you sure you want to cancel order <strong className="text-slate-800">#{order.orderId}</strong>? Reserved stock will be restored to pharmacy inventory.
                        </p>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                                Reason for Cancellation
                            </label>
                            <select
                                className="w-full text-xs font-bold text-slate-700 p-3 rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:border-[#3d3f96]"
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            >
                                <option value="">Select a reason...</option>
                                <option value="Ordered wrong dosage or medicine">Ordered wrong dosage or medicine</option>
                                <option value="Purchased elsewhere from local chemist">Purchased elsewhere from local chemist</option>
                                <option value="Doctor altered prescription">Doctor altered prescription</option>
                                <option value="Delivery slot inconvenient">Delivery slot inconvenient</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3">
                            <button
                                type="button"
                                onClick={() => setIsCancelModalOpen(false)}
                                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-50 cursor-pointer transition"
                            >
                                Nevermind
                            </button>
                            <button
                                type="button"
                                onClick={handleCancelOrder}
                                disabled={cancelling || !cancelReason}
                                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase tracking-wider transition disabled:opacity-50 flex items-center gap-1.5 shadow-md shadow-rose-900/10 cursor-pointer"
                            >
                                {cancelling ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                <span>Confirm Cancellation</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}