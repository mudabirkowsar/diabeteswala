"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Loader2,
    Calendar,
    Clock,
    Flame,
    MapPin,
    Phone,
    Mail,
    ReceiptText,
    ShieldCheck,
    Utensils,
    AlertCircle,
    CheckCircle2,
    KeyRound,
    CreditCard,
    Tag,
    Truck,
    HeartPulse,
    Egg,
    Scale,
    Sparkles,
    FileText,
    Target,
    Sun,
    Sunset,
    Moon,
    User,
    AlertTriangle,
    XCircle,
    Zap,
    ChefHat,
    BadgeCheck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import FoodAPI from '../../../../../services/FoodVendorAPI'; // Adjust path if needed

// --- MEDIA RESOLVER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/[\n\r\s]+/g, "");
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) return cleanPath;
    const cleanBackendUrl = BASE_SERVER_URL.endsWith('/') ? BASE_SERVER_URL.slice(0, -1) : BASE_SERVER_URL;
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${cleanBackendUrl}${formattedPath}`;
};

const PLACEHOLDER_DISH = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const USER_PLACEHOLDER = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150";

export default function HealthPlanOrderDetail({ orderId, isOpen, onClose, onStatusUpdated }) {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Schedule explorer state
    const [selectedDayNumber, setSelectedDayNumber] = useState(1);
    const [selectedMealTab, setSelectedMealTab] = useState('all'); // 'all' | 'breakfast' | 'lunch' | 'dinner'

    // Cancellation modal state
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // Fetch full order details
    const fetchOrderDetail = async () => {
        if (!orderId) return;
        setLoading(true);
        try {
            const response = await FoodAPI.getUserHealthPlanOrderDetail(orderId);
            if (response && response.success && response.data) {
                setOrderData(response.data);
                const schedule = response.data.healthyPlanDetails?.dayWiseSchedule || [];
                
                // Calculate today's day number if within schedule
                const start = response.data.healthyPlanDetails?.startDate;
                let initialDay = 1;
                if (start) {
                    const startMidnight = new Date(new Date(start).setHours(0, 0, 0, 0));
                    const todayMidnight = new Date(new Date().setHours(0, 0, 0, 0));
                    const diffDays = Math.floor((todayMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1;
                    if (diffDays >= 1 && diffDays <= (response.data.healthyPlanDetails?.daysCount || 5)) {
                        initialDay = diffDays;
                    }
                }
                setSelectedDayNumber(initialDay);
            } else {
                toast.error("Unable to load health plan order details.");
            }
        } catch (err) {
            console.error("Error loading health plan detail:", err);
            toast.error(err?.response?.data?.message || "Failed to fetch order details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && orderId) {
            fetchOrderDetail();
        } else {
            setOrderData(null);
            setShowCancelModal(false);
            setCancelReason("");
        }
    }, [isOpen, orderId]);

    // Compute Today's Day Number based on startDate
    const todayDayNumber = useMemo(() => {
        if (!orderData?.healthyPlanDetails?.startDate) return 1;
        const start = new Date(orderData.healthyPlanDetails.startDate);
        const today = new Date();
        const startMidnight = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const diffDays = Math.floor((todayMidnight - startMidnight) / (1000 * 60 * 60 * 24)) + 1;
        const totalDays = orderData.healthyPlanDetails.daysCount || 5;

        if (diffDays >= 1 && diffDays <= totalDays) {
            return diffDays;
        }
        return null; // Not active today
    }, [orderData]);

    // Handle vendor emergency cancellation
    const handleConfirmCancel = async () => {
        if (!cancelReason.trim()) {
            toast.error("Please provide a valid cancellation reason.");
            return;
        }

        setCancelling(true);
        try {
            const response = await FoodAPI.cancelUserHealthPlan(orderData?._id || orderId, cancelReason.trim());
            if (response && response.success) {
                toast.success(response.message || "Healthy Plan order cancelled successfully.");
                setShowCancelModal(false);
                setCancelReason("");
                if (onStatusUpdated) onStatusUpdated();
                fetchOrderDetail();
            } else {
                toast.error(response?.message || "Failed to cancel order.");
            }
        } catch (err) {
            console.error("Error cancelling order:", err);
            toast.error(err?.response?.data?.message || "Failed to cancel healthy plan order.");
        } finally {
            setCancelling(false);
        }
    };

    // Format Date helper
    const formatDate = (dateString) => {
        if (!dateString) return "—";
        try {
            return new Date(dateString).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric"
            });
        } catch (e) {
            return dateString;
        }
    };

    // Format Date Time
    const formatDateTime = (dateString) => {
        if (!dateString) return "—";
        try {
            return new Date(dateString).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });
        } catch (e) {
            return dateString;
        }
    };

    // Dynamic Status Badge
    const renderStatusBadge = (statusStr = "") => {
        const lower = (statusStr || "").toLowerCase();
        if (lower === "cancelled" || lower === "rejected") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {statusStr || "Cancelled"}
                </span>
            );
        }
        if (lower === "completed" || lower === "delivered") {
            return (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    {statusStr}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {statusStr || "Active"}
            </span>
        );
    };

    // Diet badge
    const renderDietBadge = (type = "") => {
        const lower = (type || "").toLowerCase();
        if (lower === "non veg" || lower === "nonveg") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600" /> Non-Veg
                </span>
            );
        }
        if (lower === "egg") {
            return (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    <Egg className="w-3 h-3 text-amber-600" /> Egg
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" /> Pure Veg
            </span>
        );
    };

    // Macro ingredient color themes
    const ingredientThemes = [
        { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 border-emerald-200" },
        { dot: "bg-sky-500", pill: "bg-sky-50 text-sky-800 border-sky-200" },
        { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 border-amber-200" },
        { dot: "bg-violet-500", pill: "bg-violet-50 text-violet-800 border-violet-200" },
        { dot: "bg-rose-500", pill: "bg-rose-50 text-rose-800 border-rose-200" }
    ];

    if (!isOpen) return null;

    const {
        bookingId,
        bookingType,
        status,
        deliveryOTP,
        collectionType,
        cancelReason: existingCancelReason,
        userId: customer = {},
        healthyPlanDetails = {},
        address = {},
        billSummary = {},
        paymentMethod,
        paymentStatus,
        paymentDetails = {},
        createdAt
    } = orderData || {};

    const dayScheduleList = healthyPlanDetails.dayWiseSchedule || [];
    const deliveryTimes = healthyPlanDetails.deliveryTimes || {};
    const activeDayData = dayScheduleList.find(d => d.dayNumber === selectedDayNumber) || dayScheduleList[0];
    const todayDayData = todayDayNumber ? dayScheduleList.find(d => d.dayNumber === todayDayNumber) : null;
    const isOrderCancelled = (status || "").toLowerCase() === "cancelled";

    // Helper: Render Meal Dishes for active slot
    const renderDishesList = (dishes = [], slotTitle = "Meal", iconType = "breakfast") => {
        if (!dishes || dishes.length === 0) return null;

        const IconComponent = iconType === "breakfast" ? Sun : iconType === "lunch" ? Sunset : Moon;
        const iconColor = iconType === "breakfast" ? "text-amber-500" : iconType === "lunch" ? "text-emerald-500" : "text-indigo-500";
        const iconBg = iconType === "breakfast" ? "bg-amber-50 border-amber-200 text-amber-950" : iconType === "lunch" ? "bg-emerald-50 border-emerald-200 text-emerald-950" : "bg-indigo-50 border-indigo-200 text-indigo-950";

        return (
            <div className="space-y-3">
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-2xl border ${iconBg}`}>
                    <div className="flex items-center gap-2">
                        <IconComponent size={15} className={iconColor} />
                        <span className="text-xs font-black uppercase tracking-wider">{slotTitle}</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-white border border-slate-200/80 text-slate-700 shadow-2xs">
                        {dishes.length} {dishes.length === 1 ? 'Dish' : 'Dishes'}
                    </span>
                </div>

                <div className="space-y-3">
                    {dishes.map((dish, dIdx) => (
                        <div
                            key={dish._id || dIdx}
                            className="p-4 sm:p-5 rounded-3xl border border-slate-200/90 bg-white hover:border-[#3d3f96] hover:shadow-md transition-all space-y-3.5"
                        >
                            {/* Top badge line */}
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                    {renderDietBadge(dish.dietType)}
                                    {dish.foodEffectCategory && (
                                        <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md">
                                            {dish.foodEffectCategory}
                                        </span>
                                    )}
                                </div>

                                {dish.calories && (
                                    <span className="text-xs font-bold text-orange-600 font-mono flex items-center gap-1 bg-orange-50 px-2.5 py-0.5 rounded-lg border border-orange-200">
                                        <Flame size={12} className="fill-orange-500 text-orange-500" />
                                        {dish.calories} kcal
                                    </span>
                                )}
                            </div>

                            {/* Dish Main Details */}
                            <div className="flex items-start gap-4">
                                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_DISH}
                                        alt={dish.name || "Meal Dish"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = PLACEHOLDER_DISH; }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <strong className="text-sm sm:text-base font-black text-slate-900 line-clamp-1 block">
                                            {dish.name}
                                        </strong>

                                        <div className="text-right shrink-0">
                                            <span className="font-mono font-black text-xs sm:text-sm text-[#3d3f96]">
                                                ₹{dish.discountPrice || dish.price}
                                            </span>
                                            {dish.discountPrice && dish.price > dish.discountPrice && (
                                                <span className="block text-[10px] line-through text-slate-400 font-bold">
                                                    ₹{dish.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {dish.description && (
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2">
                                            {dish.description}
                                        </p>
                                    )}

                                    {/* Tags */}
                                    {dish.tags && dish.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 pt-1">
                                            {dish.tags.map((t, tIdx) => (
                                                <span key={tIdx} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md border border-slate-200/60">
                                                    #{t}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Macro Ingredients Breakdown */}
                            {dish.ingredients && dish.ingredients.length > 0 && (
                                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <Scale size={11} className="text-[#3d3f96]" /> Recipe &amp; Macro Ingredients ({dish.ingredients.length} items)
                                    </span>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {dish.ingredients.map((ing, iIdx) => {
                                            const theme = ingredientThemes[iIdx % ingredientThemes.length];
                                            return (
                                                <div
                                                    key={ing._id || iIdx}
                                                    className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-2 flex flex-col justify-between"
                                                >
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                                                        <span className="text-[11px] font-bold text-slate-700 truncate">{ing.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-200/60">
                                                        <span>{ing.quantity}{/^\d+$/.test(String(ing.quantity)) && Number(ing.quantity) > 10 ? 'g' : ''}</span>
                                                        <span className="font-bold text-orange-600">{ing.calories} kcal</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs antialiased text-left select-none overflow-hidden">
            
            {/* Modal Outer Container */}
            <div className="relative w-full max-w-7xl max-h-[94vh] flex flex-col bg-[#f8fafc] rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">

                {/* --- 1. DEDICATED FIXED MODAL HEADER (NO OVERLAPPING OR CLIPPING) --- */}
                <div className="flex-shrink-0 bg-white border-b border-slate-200/90 px-6 py-4 sm:px-8 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-xs">
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 text-[#3d3f96] flex items-center justify-center shrink-0 shadow-2xs">
                            <HeartPulse size={22} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-base sm:text-lg font-black text-slate-900 font-mono tracking-tight">
                                    {bookingId || "HLP-ORDER"}
                                </h3>
                                {renderStatusBadge(status)}
                            </div>
                            <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                                Ordered on {formatDateTime(createdAt)} • {healthyPlanDetails.daysCount || 5} Days Program
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-auto">
                        {deliveryOTP && !isOrderCancelled && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 text-[#3d3f96] border border-indigo-100 font-mono shadow-2xs">
                                <KeyRound size={13} />
                                <span>OTP: {deliveryOTP}</span>
                            </span>
                        )}

                        {/* Emergency Cancel Action Button */}
                        {!isOrderCancelled && (
                            <button
                                type="button"
                                onClick={() => setShowCancelModal(true)}
                                className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                                <AlertTriangle size={13} />
                                <span>Cancel Plan</span>
                            </button>
                        )}

                        {/* Close Modal Button */}
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* --- 2. SCROLLABLE MODAL CONTENT BODY --- */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">

                    {loading ? (
                        <div className="py-28 text-center space-y-3">
                            <Loader2 className="animate-spin text-[#3d3f96] mx-auto" size={40} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Loading kitchen preparation monograph...
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* --- CANCELLATION NOTICE BANNER (IF CANCELLED) --- */}
                            {existingCancelReason && (
                                <div className="bg-rose-50 border border-rose-200 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                                        <XCircle size={22} />
                                    </div>
                                    <div className="space-y-0.5 min-w-0 flex-1">
                                        <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider block">
                                            Order Cancelled by Kitchen
                                        </span>
                                        <p className="text-xs font-bold text-rose-950 leading-relaxed">
                                            Reason: {existingCancelReason}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* --- ⚡ TODAY'S KITCHEN ACTION / DISPATCH HIGHLIGHT BANNER --- */}
                            {!isOrderCancelled && todayDayData && (
                                <div className="bg-gradient-to-br from-[#3d3f96] via-[#32347d] to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-indigo-800/50 space-y-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center font-bold">
                                                <Zap size={18} />
                                            </span>
                                            <div>
                                                <h4 className="text-base font-black tracking-tight flex items-center gap-2">
                                                    <span>Today's Kitchen Dispatch Schedule</span>
                                                    <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/20 text-white">
                                                        Day {todayDayNumber} of {healthyPlanDetails.daysCount}
                                                    </span>
                                                </h4>
                                                <p className="text-[11px] text-slate-300 font-medium">
                                                    Cook &amp; package these meals for today's active delivery windows
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setSelectedDayNumber(todayDayNumber)}
                                            className="px-3.5 py-1.5 rounded-xl bg-white text-[#3d3f96] font-black text-xs uppercase tracking-wider hover:bg-slate-100 transition shadow-xs cursor-pointer self-start sm:self-auto"
                                        >
                                            View Day {todayDayNumber} Below
                                        </button>
                                    </div>

                                    {/* Today's 3 Slots Summary Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {/* Breakfast */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-black text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                                    <Sun size={13} /> Breakfast Slot
                                                </span>
                                                <span className="font-mono text-[11px] text-slate-200">
                                                    {deliveryTimes.breakfastTime || "09:00 - 10:00 AM"}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {todayDayData.breakfast?.length > 0 ? (
                                                    todayDayData.breakfast.map((dish, i) => (
                                                        <div key={i} className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                            <span className="truncate">{dish.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">No Breakfast Scheduled</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Lunch */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-black text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                                    <Sunset size={13} /> Lunch Slot
                                                </span>
                                                <span className="font-mono text-[11px] text-slate-200">
                                                    {deliveryTimes.lunchTime || "12:00 - 01:00 PM"}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {todayDayData.lunch?.length > 0 ? (
                                                    todayDayData.lunch.map((dish, i) => (
                                                        <div key={i} className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            <span className="truncate">{dish.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">No Lunch Scheduled</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Dinner */}
                                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3.5 border border-white/15 space-y-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-black text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                                                    <Moon size={13} /> Dinner Slot
                                                </span>
                                                <span className="font-mono text-[11px] text-slate-200">
                                                    {deliveryTimes.dinnerTime || "08:00 - 09:00 PM"}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                {todayDayData.dinner?.length > 0 ? (
                                                    todayDayData.dinner.map((dish, i) => (
                                                        <div key={i} className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                            <span className="truncate">{dish.name}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span className="text-[11px] text-slate-400 italic">No Dinner Scheduled</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- 3. DUAL-COLUMN GRID LAYOUT --- */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                                {/* LEFT COLUMN (7/12): PLAN INFO, DELIVERY WINDOWS & DAY-WISE MENU */}
                                <div className="lg:col-span-7 space-y-6">

                                    {/* Plan Summary Card */}
                                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex flex-wrap items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-[#3d3f96]">
                                                    <HeartPulse size={12} />
                                                    {bookingType || "Healthy Plan"}
                                                </span>
                                                {healthyPlanDetails.subCategory && (
                                                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black uppercase rounded-lg">
                                                        {healthyPlanDetails.subCategory}
                                                    </span>
                                                )}
                                                {healthyPlanDetails.mainCategory && (
                                                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-lg">
                                                        {healthyPlanDetails.mainCategory}'s Diet
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] font-mono font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                                                Plan ID: {healthyPlanDetails.planId}
                                            </span>
                                        </div>

                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                                {healthyPlanDetails.title}
                                            </h2>
                                            <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                                                <Utensils size={13} className="text-[#3d3f96]" />
                                                <span>{healthyPlanDetails.programType}</span>
                                                <span>• {healthyPlanDetails.daysCount} Days Schedule</span>
                                            </p>
                                        </div>

                                        {/* Duration Banner */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] shrink-0 shadow-2xs">
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="space-y-0.5">
                                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                                        Schedule Period
                                                    </span>
                                                    <strong className="text-xs font-black text-slate-800">
                                                        {formatDate(healthyPlanDetails.startDate || healthyPlanDetails.startAtThisDate)} – {formatDate(healthyPlanDetails.endDate)}
                                                    </strong>
                                                </div>
                                            </div>
                                            <span className="text-xs font-mono font-black text-[#3d3f96] bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto shadow-2xs">
                                                {healthyPlanDetails.daysCount} Days Package
                                            </span>
                                        </div>

                                        {/* User Custom Preferences & Notes */}
                                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                                            {healthyPlanDetails.purposeOfBuying && (
                                                <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                    <Target size={11} /> Goal: {healthyPlanDetails.purposeOfBuying}
                                                </div>
                                            )}
                                            {healthyPlanDetails.userNote && (
                                                <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                                    <FileText size={11} /> Customer Special Note: "{healthyPlanDetails.userNote}"
                                                </div>
                                            )}
                                            {collectionType && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                    <Truck size={11} /> {collectionType}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Universal Daily Delivery Windows */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3.5">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                            Standard Delivery Windows
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                                    <Clock size={12} className="text-amber-500" /> Breakfast
                                                </span>
                                                <span className="font-mono font-black text-xs text-slate-800 block">
                                                    {deliveryTimes.breakfastTime || "09:00 AM - 10:00 AM"}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                                    <Clock size={12} className="text-emerald-500" /> Lunch
                                                </span>
                                                <span className="font-mono font-black text-xs text-slate-800 block">
                                                    {deliveryTimes.lunchTime || "12:00 PM - 01:00 PM"}
                                                </span>
                                            </div>
                                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                                    <Clock size={12} className="text-indigo-500" /> Dinner
                                                </span>
                                                <span className="font-mono font-black text-xs text-slate-800 block">
                                                    {deliveryTimes.dinnerTime || "08:00 PM - 09:00 PM"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Day-Wise Schedule Explorer */}
                                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-5">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                                            <div>
                                                <h4 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                                                    Day-Wise Scheduled Menu &amp; Recipes
                                                </h4>
                                                <p className="text-[11px] text-slate-400 font-medium">
                                                    Select a day to view kitchen ingredients, grams, and macros
                                                </p>
                                            </div>

                                            {/* Meal Filter Tabs */}
                                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                                {['all', 'breakfast', 'lunch', 'dinner'].map((tab) => (
                                                    <button
                                                        key={tab}
                                                        onClick={() => setSelectedMealTab(tab)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                                            selectedMealTab === tab
                                                                ? 'bg-[#3d3f96] text-white shadow-xs'
                                                                : 'text-slate-600 hover:text-slate-900'
                                                        }`}
                                                    >
                                                        {tab}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Horizontal Day Selector */}
                                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                                            {dayScheduleList.map((d) => {
                                                const isSelected = selectedDayNumber === d.dayNumber;
                                                const isToday = todayDayNumber === d.dayNumber;
                                                return (
                                                    <button
                                                        key={d.dayNumber}
                                                        onClick={() => setSelectedDayNumber(d.dayNumber)}
                                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 ${
                                                            isSelected
                                                                ? 'bg-[#3d3f96] text-white border-[#3d3f96] font-black shadow-sm'
                                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <span>{d.dayName || `Day ${d.dayNumber}`}</span>
                                                        {isToday && (
                                                            <span className={`text-[9px] font-black px-1.5 py-0.2 rounded ${
                                                                isSelected ? 'bg-amber-400 text-slate-900' : 'bg-emerald-100 text-emerald-800'
                                                            }`}>
                                                                Today
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Dishes Render for Active Day */}
                                        <div className="space-y-4 pt-1">
                                            {!activeDayData ? (
                                                <div className="py-8 text-center text-slate-400 space-y-1">
                                                    <Utensils size={24} className="mx-auto text-slate-300 mb-2" />
                                                    <p className="text-xs font-bold">No meals configured for Day {selectedDayNumber}.</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {(selectedMealTab === 'all' || selectedMealTab === 'breakfast') &&
                                                        renderDishesList(activeDayData.breakfast, "Breakfast Menu", "breakfast")}

                                                    {(selectedMealTab === 'all' || selectedMealTab === 'lunch') &&
                                                        renderDishesList(activeDayData.lunch, "Lunch Menu", "lunch")}

                                                    {(selectedMealTab === 'all' || selectedMealTab === 'dinner') &&
                                                        renderDishesList(activeDayData.dinner, "Dinner Menu", "dinner")}
                                                </>
                                            )}
                                        </div>
                                    </div>

                                </div>

                                {/* RIGHT COLUMN (5/12): CUSTOMER PROFILE, DESTINATION, PAYMENT & BILL SUMMARY */}
                                <div className="lg:col-span-5 space-y-6">

                                    {/* Customer Profile Card */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                            Customer Information
                                        </span>

                                        <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                <img
                                                    src={getMediaUrl(customer.profilePic) || USER_PLACEHOLDER}
                                                    alt={customer.name || "Customer"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = USER_PLACEHOLDER; }}
                                                />
                                            </div>

                                            <div className="space-y-0.5 min-w-0">
                                                <strong className="text-sm font-black text-slate-900 block truncate">
                                                    {customer.name || address.name || "Customer"}
                                                </strong>
                                                {customer.gender && (
                                                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                                                        {customer.gender}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs">
                                            {(customer.phone || address.phone) && (
                                                <a
                                                    href={`tel:${customer.phone || address.phone}`}
                                                    className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[#3d3f96] hover:bg-indigo-100 transition"
                                                >
                                                    <span className="flex items-center gap-2 font-bold">
                                                        <Phone size={14} /> {customer.phone || address.phone}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase">Call Customer</span>
                                                </a>
                                            )}

                                            {customer.email && (
                                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 font-medium">
                                                    <Mail size={13} className="text-slate-400 shrink-0" />
                                                    <span className="truncate">{customer.email}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Delivery Destination */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                            Delivery Destination
                                        </span>

                                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] shrink-0 shadow-2xs">
                                                <MapPin size={17} />
                                            </div>

                                            <div className="space-y-1 min-w-0 flex-1 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[9px] font-black uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                                                        {address.addressType || "Home"}
                                                    </span>
                                                    <strong className="font-black text-slate-800 truncate">
                                                        {address.name}
                                                    </strong>
                                                </div>

                                                <p className="text-slate-600 font-medium leading-relaxed">
                                                    {[address.houseNo, address.sector, address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Details */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3.5">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                            Payment &amp; Transaction
                                        </span>

                                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="font-bold text-slate-600 flex items-center gap-1.5">
                                                    <CreditCard size={14} className="text-emerald-600" /> Payment Status
                                                </span>
                                                <span className="inline-flex items-center gap-1 font-black text-emerald-700 uppercase text-[10px] bg-white border border-emerald-200 px-2.5 py-0.5 rounded-md">
                                                    <CheckCircle2 size={11} /> {paymentStatus || "Paid"}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-[11px] text-slate-600 pt-1 border-t border-emerald-100/60">
                                                <span>Method:</span>
                                                <span className="font-bold text-slate-800">{paymentMethod || "Online"}</span>
                                            </div>

                                            {paymentDetails.razorpayPaymentId && (
                                                <div className="flex justify-between items-center text-[11px] text-slate-600">
                                                    <span>Payment ID:</span>
                                                    <span className="font-mono font-bold text-slate-800 truncate max-w-[170px]">{paymentDetails.razorpayPaymentId}</span>
                                                </div>
                                            )}

                                            {paymentDetails.paidAt && (
                                                <div className="flex justify-between items-center text-[11px] text-slate-600">
                                                    <span>Paid On:</span>
                                                    <span className="font-bold text-slate-800">{formatDateTime(paymentDetails.paidAt)}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bill Summary */}
                                    <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                                            <ReceiptText size={14} className="text-[#3d3f96]" /> Itemized Bill Summary
                                        </span>

                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                                <span>Base Plan Total</span>
                                                <span className="font-mono font-bold text-slate-800">₹{billSummary.itemTotal || 0}</span>
                                            </div>

                                            {billSummary.packagingCharge > 0 && (
                                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                                    <span>Packaging Charge</span>
                                                    <span className="font-mono font-bold text-slate-800">₹{billSummary.packagingCharge}</span>
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                                <span>Delivery Charge</span>
                                                <span className="font-mono font-bold text-slate-800">
                                                    {billSummary.deliveryCharge === 0 ? "FREE" : `₹${billSummary.deliveryCharge}`}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                                <span>Taxes &amp; GST ({billSummary.taxPercentage || 5}%)</span>
                                                <span className="font-mono font-bold text-slate-800">₹{billSummary.taxAmount || 0}</span>
                                            </div>

                                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
                                                <span className="font-black text-slate-900 uppercase">Total Amount</span>
                                                <span className="font-mono font-black text-xl text-slate-900">
                                                    ₹{billSummary.totalAmount || 0}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                </div>

                            </div>
                        </>
                    )}

                </div>

                {/* --- 4. EMERGENCY CANCEL CONFIRMATION MODAL POPUP --- */}
                {showCancelModal && (
                    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xl max-w-md w-full space-y-4 text-left animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                                    <AlertTriangle size={20} />
                                </div>
                                <div>
                                    <h4 className="text-base font-black text-slate-900">Cancel Healthy Diet Plan</h4>
                                    <p className="text-xs text-slate-500 font-medium">Order: {bookingId}</p>
                                </div>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                Cancelling will notify the customer immediately and halt upcoming meal kitchen prep. A mandatory cancellation reason is required.
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                                    Cancellation Reason <span className="text-rose-600">*</span>
                                </label>
                                <textarea
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g. Kitchen equipment breakdown, unable to fulfill fresh ingredients meal prep..."
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-rose-500 focus:bg-white transition resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowCancelModal(false)}
                                    disabled={cancelling}
                                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                                >
                                    Go Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirmCancel}
                                    disabled={cancelling || !cancelReason.trim()}
                                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-rose-600/20"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Cancelling...</span>
                                        </>
                                    ) : (
                                        <span>Confirm Cancellation</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}