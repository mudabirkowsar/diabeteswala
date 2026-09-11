"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    Layers,
    Loader2,
    User,
    Phone,
    Mail,
    MapPin,
    Clock,
    Calendar,
    Utensils,
    CheckCircle2,
    CreditCard,
    Receipt,
    Flame,
    ShieldCheck,
    Truck,
    AlertCircle,
    XCircle,
    AlertTriangle,
    Ban
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import FoodAPI from '../../../../../services/FoodVendorAPI';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200";
const USER_PLACEHOLDER = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";

export default function TiffinDetailModal({ subscriptionId, isOpen, onClose, onSubscriptionUpdated }) {
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Cancellation State ---
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // --- Fetch Single Subscription Details ---
    const fetchDetail = async () => {
        if (!subscriptionId) return;
        setLoading(true);
        try {
            const response = await FoodAPI.getVendorStandardSubscriptionDetails(subscriptionId);
            if (response && response.success) {
                setDetail(response.data);
            } else {
                toast.error("Failed to load subscription details.");
            }
        } catch (err) {
            console.error("Error loading subscription detail:", err);
            toast.error("Failed to load subscription record.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && subscriptionId) {
            fetchDetail();
        } else {
            setDetail(null);
            setShowCancelModal(false);
            setCancelReason('');
        }
    }, [isOpen, subscriptionId]);

    // --- Handle Subscription Cancellation ---
    const handleCancelSubscription = async (e) => {
        e.preventDefault();

        if (!cancelReason.trim()) {
            toast.error("Please enter a valid cancellation reason.");
            return;
        }

        setCancelling(true);
        try {
            const payload = {
                cancelReason: cancelReason.trim()
            };

            const response = await FoodAPI.cancelSubscriptionTiffin(subscriptionId, payload);

            if (response && response.success) {
                toast.success(response.message || "Subscription cancelled successfully.");
                setShowCancelModal(false);
                setCancelReason('');
                
                // Update local state immediately
                setDetail((prev) => ({
                    ...prev,
                    status: 'Cancelled',
                    cancelReason: cancelReason.trim()
                }));

                // Trigger parent list refresh
                if (onSubscriptionUpdated) {
                    onSubscriptionUpdated();
                }
            } else {
                toast.error(response?.message || "Failed to cancel subscription.");
            }
        } catch (err) {
            console.error("Error cancelling subscription:", err);
            const errMsg = err?.response?.data?.message || "Failed to connect to the server.";
            toast.error(errMsg);
        } finally {
            setCancelling(false);
        }
    };

    if (!isOpen) return null;

    // --- Helper: Render Diet Badge ---
    const renderDietBadge = (type) => {
        const lower = (type || '').toLowerCase();
        const isVeg = lower === 'veg';
        const isEgg = lower === 'egg';
        const isNonVeg = lower === 'non veg' || lower === 'nonveg';

        return (
            <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-white ${
                    isVeg
                        ? 'text-emerald-600 border-emerald-100'
                        : isEgg
                        ? 'text-amber-600 border-amber-100'
                        : isNonVeg
                        ? 'text-rose-600 border-rose-100'
                        : 'text-slate-500 border-slate-100'
                }`}
            >
                <span
                    className={`w-1.5 h-1.5 rounded-full ${
                        isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
                    }`}
                />
                {type}
            </span>
        );
    };

    const subDetails = detail?.subscriptionDetails || {};
    const deliveryTimes = subDetails.universalDeliveryTimes || {};
    const bill = detail?.billSummary || {};
    const user = detail?.userId || {};
    const address = detail?.address || {};
    const payment = detail?.paymentDetails || {};
    const isCancelled = (detail?.status || '').toUpperCase() === 'CANCELLED';

    // Group the dailyMealSchedule by day of the week (e.g. Monday, Tuesday, etc.)
    const groupedSchedule = (subDetails.dailyMealSchedule || []).reduce((acc, item) => {
        const day = item.dayOfWeek ? item.dayOfWeek.toLowerCase() : 'other';
        if (!acc[day]) acc[day] = [];
        acc[day].push(item);
        return acc;
    }, {});

    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    return (
        <div className="fixed inset-0 bg-slate-900/65 backdrop-blur-md flex items-center justify-center z-50 p-3 sm:p-6 select-none antialiased">
            {/* Expanded Wide Modal Container */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-5xl w-full p-6 sm:p-10 shadow-2xl relative max-h-[92vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left space-y-8">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
                >
                    <X size={18} />
                </button>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-28">
                        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Loading comprehensive subscription monograph...
                        </p>
                    </div>
                ) : !detail ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-bold">
                        No subscription record located.
                    </div>
                ) : (
                    <div className="space-y-8">

                        {/* --- TOP HEADER WITH IDENTIFICATION --- */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 pr-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                        Subscription Ledger
                                    </span>
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                        {detail.bookingType || "Subscription"}
                                    </span>
                                </div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                                    <Layers size={24} className="text-[#3d3f96]" /> {detail.bookingId}
                                </h2>
                            </div>

                            <div className="flex items-center gap-3">
                                <span
                                    className={`text-xs font-black uppercase px-3 py-1.5 rounded-xl border ${
                                        isCancelled
                                            ? 'text-rose-600 bg-rose-50 border-rose-200'
                                            : detail.status === 'Active'
                                            ? 'text-emerald-600 bg-emerald-50 border-emerald-100'
                                            : 'text-blue-600 bg-blue-50 border-blue-100'
                                    }`}
                                >
                                    {detail.status || 'New'}
                                </span>

                                {!isCancelled && (
                                    <button
                                        type="button"
                                        onClick={() => setShowCancelModal(true)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-black transition cursor-pointer"
                                    >
                                        <Ban size={13} />
                                        <span>Cancel Subscription</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* --- CANCELLATION REASON BANNER (IF CANCELLED) --- */}
                        {isCancelled && (
                            <div className="bg-rose-50 border border-rose-200 p-4.5 rounded-2xl flex items-start gap-3 text-rose-800">
                                <XCircle className="text-rose-600 shrink-0 mt-0.5" size={20} />
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider block text-rose-700">
                                        Subscription Cancelled
                                    </span>
                                    <p className="text-xs font-bold leading-relaxed">
                                        {detail.cancelReason || "This subscription was cancelled by the kitchen."}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* --- DELIVERY OTP BANNER --- */}
                        {detail.deliveryOTP && !isCancelled && (
                            <div className="bg-red-50/60 border border-red-200/60 text-red-600 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black uppercase tracking-wider block">
                                        Security Delivery OTP
                                    </span>
                                    <p className="text-xs text-red-600/90 font-semibold">
                                        Subscriber must present this code to the delivery partner upon arrival.
                                    </p>
                                </div>
                                <strong className="text-2xl font-black font-mono tracking-widest bg-white/90 px-4 py-1.5 rounded-xl border border-red-200/80 shrink-0">
                                    {detail.deliveryOTP}
                                </strong>
                            </div>
                        )}

                        {/* --- 2-COLUMN PRIMARY OVERVIEW GRID --- */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

                            {/* COLUMN 1: CUSTOMER & DELIVERY ADDRESS */}
                            <div className="space-y-6">

                                {/* Customer Profile */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-200/50 pb-2">
                                        Subscriber Monograph
                                    </span>

                                    <div className="flex items-center gap-3.5 pt-1">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                            <img
                                                src={getMediaUrl(user.profilePic) || USER_PLACEHOLDER}
                                                alt={user.name || "Customer"}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = USER_PLACEHOLDER;
                                                }}
                                            />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <h4 className="text-sm font-extrabold text-slate-800 truncate">
                                                {user.name || "Customer"}
                                            </h4>
                                            <p className="text-xs font-bold text-[#3d3f96] flex items-center gap-1">
                                                <Phone size={11} /> {user.phone || "No Phone"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/50 font-semibold text-slate-600">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase">Email</span>
                                            <span className="truncate block" title={user.email}>
                                                {user.email || "N/A"}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase">Gender / DOB</span>
                                            <span>
                                                {user.gender || "N/A"} • {user.dob ? new Date(user.dob).toLocaleDateString() : "N/A"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Delivery Location
                                        </span>
                                        <span className="text-[9px] font-black uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                                            {address.addressType || "Home"}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-xs">
                                        <div className="flex items-center gap-1.5 text-slate-800 font-extrabold">
                                            <MapPin size={14} className="text-rose-500 shrink-0" />
                                            <span>{address.name || user.name} • {address.phone || user.phone}</span>
                                        </div>
                                        <p className="text-slate-600 font-medium leading-relaxed pt-1 pl-5">
                                            {[address.houseNo, address.sector, address.city, address.state, address.pincode]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </p>
                                        <div className="pt-2 pl-5">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Fulfillment Mode:</span>{" "}
                                            <span className="text-xs font-black text-[#3d3f96]">{detail.collectionType || "Home Delivery"}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                            {/* COLUMN 2: PLAN PARAMETERS & DETAILED BILLING */}
                            <div className="space-y-6">

                                {/* Plan Specs & Universal Delivery Windows */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block border-b border-slate-200/50 pb-2">
                                        Subscription Parameters
                                    </span>

                                    <div className="grid grid-cols-2 gap-3 text-xs font-bold text-slate-700">
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase">Plan Title</span>
                                            <strong className="text-sm font-black text-slate-900">{subDetails.planName}</strong>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-slate-400 block uppercase">Billing Cadence</span>
                                            <span className="capitalize">{subDetails.billingCycle} ({subDetails.durationDays || 7} Days)</span>
                                        </div>
                                    </div>

                                    {/* Universal Timings */}
                                    <div className="pt-2 border-t border-slate-200/50 space-y-1.5">
                                        <span className="text-[9px] font-black uppercase text-slate-400 block">Universal Delivery Windows</span>
                                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                                                <span className="text-[9px] font-black uppercase text-slate-400 block">Breakfast</span>
                                                <span className="font-bold text-slate-800 text-[10px]">{deliveryTimes.breakfastTime || "N/A"}</span>
                                            </div>
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                                                <span className="text-[9px] font-black uppercase text-slate-400 block">Lunch</span>
                                                <span className="font-bold text-slate-800 text-[10px]">{deliveryTimes.lunchTime || "N/A"}</span>
                                            </div>
                                            <div className="p-2 bg-white rounded-xl border border-slate-200/60">
                                                <span className="text-[9px] font-black uppercase text-slate-400 block">Dinner</span>
                                                <span className="font-bold text-slate-800 text-[10px]">{deliveryTimes.dinnerTime || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Comprehensive Billing Summary */}
                                <div className="bg-slate-50/50 border border-slate-150 p-5 rounded-3xl space-y-3">
                                    <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                            Invoice &amp; Payment Ledger
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                            {detail.paymentStatus || "Paid"} via {detail.paymentMethod || "Online"}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs font-semibold text-slate-600">
                                        <div className="flex justify-between">
                                            <span>Base Plan Item Total:</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.itemTotal || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Delivery Charge:</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.deliveryCharge || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Packaging Fee:</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.packagingCharge || 0}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Taxes ({bill.taxPercentage || 0}% GST):</span>
                                            <span className="font-mono text-slate-800 font-bold">₹{bill.taxAmount || 0}</span>
                                        </div>
                                        {payment.razorpayPaymentId && (
                                            <div className="pt-2 border-t border-slate-200/50 text-[10px] text-slate-400">
                                                <span>Razorpay Ref: </span>
                                                <span className="font-mono text-slate-600 font-bold">{payment.razorpayPaymentId}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm text-slate-900 border-t border-slate-200/60 pt-2 font-black">
                                            <span>Total Amount Settled:</span>
                                            <span className="font-mono text-base text-[#3d3f96]">₹{bill.totalAmount || 0}</span>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>

                        {/* --- SECTION 3: COMPLETE 7-DAY SCHEDULED MEAL CALENDAR --- */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Utensils size={18} className="text-[#3d3f96]" /> 7-Day Scheduled Meal Calendar
                                    </h3>
                                    <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                        Day-by-day breakfast, lunch, and dinner dish allocation breakdown.
                                    </p>
                                </div>
                                <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                                    {(subDetails.dailyMealSchedule || []).length} Total Meal Slots
                                </span>
                            </div>

                            {/* Grouped Day Cards */}
                            <div className="space-y-4">
                                {dayOrder.map((dayKey) => {
                                    const dayMeals = groupedSchedule[dayKey] || [];
                                    if (dayMeals.length === 0) return null;

                                    return (
                                        <div key={dayKey} className="border border-slate-150 rounded-3xl p-5 bg-slate-50/40 space-y-3">
                                            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                                                <h4 className="text-xs font-black uppercase text-[#3d3f96] tracking-wider flex items-center gap-1.5">
                                                    <Calendar size={13} /> {dayKey} Allocation
                                                </h4>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                    {dayMeals.length} Slot{dayMeals.length > 1 ? 's' : ''}
                                                </span>
                                            </div>

                                            {/* Slot Cards Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                                                {dayMeals.map((slotItem) => {
                                                    const mealImg = slotItem.mealImage || slotItem.mealId?.imageUrl;

                                                    return (
                                                        <div
                                                            key={slotItem._id}
                                                            className="bg-white border border-slate-200/80 rounded-2xl p-3.5 flex gap-3 items-center shadow-xs"
                                                        >
                                                            <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                                                <img
                                                                    src={getMediaUrl(mealImg) || PLACEHOLDER_IMAGE}
                                                                    alt={slotItem.mealName}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        e.target.src = PLACEHOLDER_IMAGE;
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="space-y-0.5 min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <span className="text-[9px] font-black uppercase text-[#3d3f96] bg-indigo-50 px-1.5 py-0.5 rounded">
                                                                        {slotItem.slotName}
                                                                    </span>
                                                                    {renderDietBadge(slotItem.dietType)}
                                                                </div>

                                                                <strong className="text-xs font-black text-slate-800 block truncate" title={slotItem.mealName}>
                                                                    {slotItem.mealName}
                                                                </strong>

                                                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-0.5">
                                                                    <span className="flex items-center gap-0.5 font-mono text-amber-600">
                                                                        <Flame size={10} className="text-amber-500" /> {slotItem.calories || 0} Kcal
                                                                    </span>
                                                                    <span className="font-mono text-slate-700">₹{slotItem.mealPrice}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* --- INLINE CONFIRMATION / REASON MODAL FOR CANCELLATION --- */}
            {showCancelModal && (
                <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2 text-rose-600">
                                <AlertTriangle size={18} />
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                                    Cancel Subscription
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (!cancelling) {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }
                                }}
                                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCancelSubscription} className="space-y-4">
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                Are you sure you want to cancel subscription <strong className="text-slate-900 font-mono">{detail?.bookingId}</strong>? This action is permanent and will stop all future scheduled deliveries.
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center justify-between">
                                    <span>Cancellation Reason <span className="text-rose-500">*</span></span>
                                    <span className="text-[10px] font-normal text-slate-400">Mandatory</span>
                                </label>
                                <textarea
                                    rows={3}
                                    required
                                    placeholder="e.g. Kitchen temporarily closed due to maintenance."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-rose-400 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    disabled={cancelling}
                                    onClick={() => {
                                        setShowCancelModal(false);
                                        setCancelReason('');
                                    }}
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelling || !cancelReason.trim()}
                                    className="px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-black tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Cancelling...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Ban size={13} />
                                            <span>Confirm Cancellation</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}