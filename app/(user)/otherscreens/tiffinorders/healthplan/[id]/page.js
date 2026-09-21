"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Flame,
    MapPin,
    Phone,
    ReceiptText,
    ShieldCheck,
    Utensils,
    Loader2,
    AlertCircle,
    CheckCircle2,
    KeyRound,
    CreditCard,
    ChevronRight,
    Tag,
    Building2,
    Store,
    XCircle,
    Truck,
    Zap,
    HeartPulse,
    Egg,
    Scale,
    Sparkles,
    FileText,
    Target,
    Sun,
    Sunset,
    Moon
} from 'lucide-react';

// Import API & Notification Context
import UserAPI from '../../../../../services/UserAPI'; // Adjust path if needed
import { useNotification } from '../../../../../context/NotificationContext'; // Adjust path if needed

// --- MEDIA URL RESOLVER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    const cleanPath = path.replace(/[\n\r\s]+/g, ""); // Clean any newline or whitespace
    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) return cleanPath;
    const cleanBackendUrl = BASE_SERVER_URL.endsWith('/') ? BASE_SERVER_URL.slice(0, -1) : BASE_SERVER_URL;
    const formattedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    return `${cleanBackendUrl}${formattedPath}`;
};

const PLACEHOLDER_DISH = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function HealthPlanOrderDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification?.() || {};

    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Active Day Selector state for Day-Wise Schedule
    const [selectedDayNumber, setSelectedDayNumber] = useState(1);
    const [activeMealTab, setActiveMealTab] = useState('all'); // 'all' | 'breakfast' | 'lunch' | 'dinner'

    // Fetch Plan Order Details
    const fetchOrderDetails = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const response = await UserAPI.getMyFoodHealthPlanDetails(id);
            if (response && response.success && response.data) {
                setOrderData(response.data);
                const schedule = response.data.healthyPlanDetails?.dayWiseSchedule || [];
                if (schedule.length > 0) {
                    setSelectedDayNumber(schedule[0].dayNumber || 1);
                }
            } else {
                if (showNotification) showNotification("Health plan order details not found.", "error");
            }
        } catch (error) {
            console.error("Error loading health plan order:", error);
            if (showNotification) showNotification("Failed to load health plan subscription details.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [id]);

    // Format Dates (e.g. "Sep 30, 2026")
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

    // Format Date & Time
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

    // Dietary Badge (Pure Veg / Non-Veg / Egg)
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

    // Ingredient Row Colorful Themes
    const ingredientThemes = [
        { dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 border-emerald-200" },
        { dot: "bg-sky-500", pill: "bg-sky-50 text-sky-800 border-sky-200" },
        { dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 border-amber-200" },
        { dot: "bg-violet-500", pill: "bg-violet-50 text-violet-800 border-violet-200" },
        { dot: "bg-rose-500", pill: "bg-rose-50 text-rose-800 border-rose-200" }
    ];

    if (loading) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading health plan subscription details...
                </p>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <AlertCircle className="text-slate-300" size={48} />
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-800">Health Plan Order Not Found</h2>
                    <p className="text-xs text-slate-400">We were unable to locate this health plan subscription record.</p>
                </div>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-2.5 bg-[#3d3f96] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                >
                    Go Back
                </button>
            </div>
        );
    }

    const {
        bookingId,
        bookingType,
        status,
        deliveryOTP,
        collectionType,
        cancelReason,
        healthyPlanDetails = {},
        address = {},
        foodId: kitchen = {},
        billSummary = {},
        paymentMethod,
        paymentStatus,
        paymentDetails = {},
        clinicalFlags = {},
        createdAt
    } = orderData;

    const dayScheduleList = healthyPlanDetails.dayWiseSchedule || [];
    const deliveryTimes = healthyPlanDetails.deliveryTimes || {};

    const activeDayData = dayScheduleList.find(d => d.dayNumber === selectedDayNumber) || dayScheduleList[0];

    // Helper to render dish cards for breakfast, lunch, or dinner
    const renderDishesList = (dishes = [], slotTitle = "Meal", iconType = "breakfast") => {
        if (!dishes || dishes.length === 0) return null;

        const IconComponent = iconType === "breakfast" ? Sun : iconType === "lunch" ? Sunset : Moon;
        const iconColor = iconType === "breakfast" ? "text-amber-500" : iconType === "lunch" ? "text-emerald-500" : "text-indigo-500";
        const iconBg = iconType === "breakfast" ? "bg-amber-50 border-amber-200" : iconType === "lunch" ? "bg-emerald-50 border-emerald-200" : "bg-indigo-50 border-indigo-200";

        return (
            <div className="space-y-3">
                {/* Slot Header */}
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl border ${iconBg}`}>
                    <div className="flex items-center gap-2">
                        <IconComponent size={14} className={iconColor} />
                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">{slotTitle}</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">
                        {dishes.length} {dishes.length === 1 ? 'Dish' : 'Dishes'}
                    </span>
                </div>

                {/* Dishes Cards */}
                <div className="space-y-3">
                    {dishes.map((dish, dIdx) => (
                        <div
                            key={dish._id || dIdx}
                            className="p-4 sm:p-5 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-indigo-100 hover:shadow-xs transition-all space-y-3.5"
                        >
                            {/* Top info */}
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                    {renderDietBadge(dish.dietType)}
                                    {dish.foodEffectCategory && (
                                        <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
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

                            {/* Dish Row with Image, Name, Price */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_DISH}
                                        alt={dish.name || "Healthy Dish"}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = PLACEHOLDER_DISH; }}
                                    />
                                </div>

                                <div className="flex-1 min-w-0 space-y-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <strong className="text-sm sm:text-base font-black text-slate-800 line-clamp-1 block">
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
                                    <p className="text-[11px] text-slate-400 font-medium">Fresh Cloud Kitchen Preparation</p>
                                </div>
                            </div>

                            {/* Macro Ingredients Breakdown Table */}
                            {dish.ingredients && dish.ingredients.length > 0 && (
                                <div className="pt-2.5 border-t border-slate-100 space-y-2">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1">
                                        <Scale size={11} className="text-[#3d3f96]" /> Macro Ingredients Breakdown
                                    </span>

                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {dish.ingredients.map((ing, iIdx) => {
                                            const theme = ingredientThemes[iIdx % ingredientThemes.length];
                                            return (
                                                <div
                                                    key={ing._id || iIdx}
                                                    className="bg-white border border-slate-200/70 rounded-xl p-2 flex flex-col justify-between"
                                                >
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                                                        <span className="text-[11px] font-bold text-slate-700 truncate">{ing.name}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-1 pt-1 border-t border-slate-100">
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
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-7 antialiased select-none text-left">

            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] uppercase tracking-wider transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back to My Health Plans
                </button>

                {/* Badges Line */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        {bookingId}
                    </span>

                    {renderStatusBadge(status)}

                    {deliveryOTP && status?.toLowerCase() !== "cancelled" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 text-[#3d3f96] border border-indigo-100 shadow-xs">
                            <KeyRound size={13} />
                            <span>OTP: <strong className="font-mono tracking-wider">{deliveryOTP}</strong></span>
                        </span>
                    )}
                </div>
            </div>

            {/* Cancellation Banner (If Cancelled) */}
            {cancelReason && (
                <div className="bg-rose-50/90 border border-rose-200 rounded-[2rem] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                        <XCircle size={22} />
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                        <span className="text-[10px] font-black uppercase text-rose-800 tracking-wider flex items-center gap-1.5">
                            Cancellation Notice
                        </span>
                        <p className="text-xs font-bold text-rose-950 leading-relaxed">
                            {cancelReason}
                        </p>
                    </div>
                </div>
            )}

            {/* Split Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: HEALTH PLAN SCHEDULE & MEALS (7/12) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Plan Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
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

                            <span className="text-[11px] font-bold text-slate-400">
                                Subscribed on {formatDate(createdAt)}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                {healthyPlanDetails.title || "Custom Healthy Diet Plan"}
                            </h1>
                            <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                                <Utensils size={12} className="text-[#3d3f96]" />
                                <span>{healthyPlanDetails.programType || "Full Day Diet Program"}</span>
                                <span>• {healthyPlanDetails.daysCount || 5} Days Curated Schedule</span>
                            </p>
                        </div>

                        {/* Subscription Duration Banner */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] shrink-0">
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
                            <span className="text-xs font-mono font-black text-[#3d3f96] bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                                {healthyPlanDetails.daysCount || 5} Days Package
                            </span>
                        </div>

                        {/* Additional User Customization Tags */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            {healthyPlanDetails.purposeOfBuying && (
                                <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                                    <Target size={11} /> Goal: {healthyPlanDetails.purposeOfBuying}
                                </div>
                            )}

                            {healthyPlanDetails.userNote && (
                                <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                    <FileText size={11} /> Note: "{healthyPlanDetails.userNote}"
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
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Daily Meal Delivery Windows
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

                    {/* Day-Wise Curated Menu Schedule */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                                    Day-Wise Dietary Meals Schedule
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Explore the dietitian-curated recipes scheduled for each day
                                </p>
                            </div>

                            {/* Meal Type Quick Filter */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                                {['all', 'breakfast', 'lunch', 'dinner'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveMealTab(tab)}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer ${
                                            activeMealTab === tab
                                                ? 'bg-[#3d3f96] text-white shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Horizontal Day Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                            {dayScheduleList.map((d) => {
                                const isSelected = selectedDayNumber === d.dayNumber;
                                return (
                                    <button
                                        key={d.dayNumber}
                                        onClick={() => setSelectedDayNumber(d.dayNumber)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                            isSelected
                                                ? 'bg-[#3d3f96] text-white border-[#3d3f96] font-black shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {d.dayName || `Day ${d.dayNumber}`}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dishes Display for Selected Day */}
                        <div className="space-y-4 pt-2">
                            {!activeDayData ? (
                                <div className="py-8 text-center text-slate-400 space-y-1">
                                    <Utensils size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-xs font-bold">No meals configured for this day.</p>
                                </div>
                            ) : (
                                <>
                                    {(activeMealTab === 'all' || activeMealTab === 'breakfast') &&
                                        renderDishesList(activeDayData.breakfast, "Breakfast Menu", "breakfast")}

                                    {(activeMealTab === 'all' || activeMealTab === 'lunch') &&
                                        renderDishesList(activeDayData.lunch, "Lunch Menu", "lunch")}

                                    {(activeMealTab === 'all' || activeMealTab === 'dinner') &&
                                        renderDishesList(activeDayData.dinner, "Dinner Menu", "dinner")}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Prepared By Kitchen Partner Card */}
                    {kitchen && kitchen.name && (
                        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={getMediaUrl(kitchen.profileImage) || KITCHEN_PLACEHOLDER}
                                        alt={kitchen.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Certified Cloud Kitchen</span>
                                    <strong className="text-xs font-black text-slate-800 tracking-tight block truncate">{kitchen.name}</strong>
                                    <span className="text-[11px] text-slate-400 font-bold block truncate">{kitchen.city || "Mohali"}</span>
                                </div>
                            </div>

                            {kitchen.phone && (
                                <a
                                    href={`tel:${kitchen.phone}`}
                                    className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#3d3f96] hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-black transition-colors shrink-0 cursor-pointer"
                                >
                                    <Phone size={13} />
                                    <span>Call Kitchen</span>
                                </a>
                            )}
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: ADDRESS, PAYMENT, & BILL SUMMARY (5/12) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">

                    {/* Delivery Destination Card */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Delivery Destination
                        </span>

                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-3.5">
                            <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] shrink-0">
                                <MapPin size={17} />
                            </div>

                            <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase bg-white border border-slate-200 px-2 py-0.5 rounded-md text-slate-700">
                                        {address.addressType || "Home"}
                                    </span>
                                    <strong className="text-xs font-black text-slate-800 truncate">
                                        {address.name}
                                    </strong>
                                </div>

                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {[address.houseNo, address.sector, address.landmark, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
                                </p>

                                {address.phone && (
                                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 pt-0.5">
                                        <Phone size={11} className="text-slate-400" />
                                        <span>+91 {address.phone}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Payment & Transaction Details Card */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Payment Details
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
                                    <span className="font-mono font-bold text-slate-800">{paymentDetails.razorpayPaymentId}</span>
                                </div>
                            )}

                            {paymentDetails.razorpayOrderId && (
                                <div className="flex justify-between items-center text-[11px] text-slate-600">
                                    <span>Order ID:</span>
                                    <span className="font-mono font-bold text-slate-800">{paymentDetails.razorpayOrderId}</span>
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

                    {/* Complete Itemized Bill Breakdown */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <ReceiptText size={14} className="text-[#3d3f96]" /> Complete Bill Summary
                        </span>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Plan Base Total</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary.itemTotal || 0}</span>
                            </div>

                            {billSummary.packagingCharge > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                    <span>Packaging Fee</span>
                                    <span className="font-mono font-bold text-slate-800">₹{billSummary.packagingCharge}</span>
                                </div>
                            )}

                            {billSummary.peakOrderCharge > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                    <span>Peak Order Charge</span>
                                    <span className="font-mono font-bold text-slate-800">₹{billSummary.peakOrderCharge}</span>
                                </div>
                            )}

                            {billSummary.rapidCharge > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                    <span>Rapid Delivery Charge</span>
                                    <span className="font-mono font-bold text-slate-800">₹{billSummary.rapidCharge}</span>
                                </div>
                            )}

                            {billSummary.fastDeliveryCharge > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                    <span>Priority Delivery Fee</span>
                                    <span className="font-mono font-bold text-slate-800">₹{billSummary.fastDeliveryCharge}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Delivery Fee</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {billSummary.deliveryCharge === 0 ? (
                                        <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                                    ) : (
                                        `₹${billSummary.deliveryCharge || 0}`
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>GST / Taxes ({billSummary.taxPercentage || 5}%)</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary.taxAmount || 0}</span>
                            </div>

                            {billSummary.couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 font-bold">
                                    <span>Coupon Discount</span>
                                    <span className="font-mono">-₹{billSummary.couponDiscount}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-sm">
                                <span className="font-black text-slate-900 uppercase tracking-tight">Total Amount Paid</span>
                                <span className="font-mono font-black text-xl text-slate-900">
                                    ₹{billSummary.totalAmount || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hygiene, Macro & Health Standard Box */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-0.5">
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">
                                Dietitian &amp; Hygiene Certified
                            </span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                Prepared in FSSAI-compliant hygienic kitchen hubs. All macros, carbs, and calories are strictly weighed for optimal nutrition.
                            </span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}