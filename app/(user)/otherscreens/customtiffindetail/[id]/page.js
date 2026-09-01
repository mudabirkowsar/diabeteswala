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
    ChefHat,
    Loader2,
    AlertCircle,
    CheckCircle2,
    KeyRound,
    CreditCard,
    Tag,
    Store,
    Sparkles,
    FileText,
    Coffee,
    Sun,
    Moon,
    Activity,
    AlertTriangle,
    Check,
    Truck,
    BadgePercent,
    ShieldAlert
} from 'lucide-react';

// Import API & Context
import UserAPI from '../../../../services/UserAPI'; // Adjust path if needed
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path if needed

// --- MEDIA RESOLVER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_DISH = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

const DAYS_OF_WEEK = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
];

export default function CustomTiffinDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification?.() || {};

    const [planDetails, setPlanDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState('monday');

    // Fetch Custom Tiffin Details
    const fetchCustomPlanDetails = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getSingleCustomTiffinDetails(id);
            if (response && response.success && response.data) {
                setPlanDetails(response.data);
            } else {
                if (showNotification) showNotification("Custom tiffin details not found.", "error");
            }
        } catch (error) {
            console.error("Error loading custom tiffin details:", error);
            if (showNotification) showNotification("Failed to connect to server.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchCustomPlanDetails();
        }
    }, [id]);

    // Format Dates (e.g. "Sep 02, 2026")
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

    // Format Full Timestamp
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

    // Render Dietary Badge
    const renderDietBadge = (type = "") => {
        const lower = (type || "").toLowerCase();
        const isVeg = lower === "veg" || lower === "jain";
        const isNonVeg = lower === "non veg" || lower === "nonveg";
        const isEgg = lower === "egg";

        return (
            <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                    isVeg
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                        : isNonVeg
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : isEgg
                        ? 'text-amber-700 bg-amber-50 border-amber-200'
                        : 'text-slate-600 bg-slate-100 border-slate-200'
                }`}
            >
                <span
                    className={`w-1.5 h-1.5 rounded-full ${
                        isVeg ? 'bg-emerald-500' : isNonVeg ? 'bg-rose-500' : isEgg ? 'bg-amber-500' : 'bg-slate-400'
                    }`}
                />
                {type}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading your custom meal schedule...
                </p>
            </div>
        );
    }

    if (!planDetails) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <AlertCircle className="text-slate-300" size={48} />
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-800">Custom Meal Plan Not Found</h2>
                    <p className="text-xs text-slate-400">We could not locate this customized plan record.</p>
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
        paymentMethod,
        paymentStatus,
        paymentDetails = {},
        customTiffinDetails = {},
        foodId: kitchen = {},
        address = {},
        billSummary = {},
        clinicalFlags = {},
        createdAt
    } = planDetails;

    const {
        packageDays = 0,
        startDate,
        endDate,
        dietaryType,
        spiceLevel,
        clinicalNotes,
        selectedMeals = {},
        universalDeliveryTimes = {},
        weeklyCustomSchedule = []
    } = customTiffinDetails;

    // Find schedule for currently active day tab
    const currentDaySchedule = weeklyCustomSchedule.find(
        (s) => (s.dayOfWeek || "").toLowerCase() === selectedDay.toLowerCase()
    );

    // Slot Config Definition for current day
    const slotsConfig = [
        {
            key: "breakfast",
            label: "Breakfast Slot",
            icon: <Coffee size={13} className="text-[#3d3f96]" />,
            badgeClass: "bg-indigo-50 text-[#3d3f96] border-indigo-100",
            slotTime: universalDeliveryTimes.breakfastTime || "07:30 AM - 08:30 AM",
            data: currentDaySchedule?.breakfast,
            isSelectedInPlan: selectedMeals.breakfast
        },
        {
            key: "lunch",
            label: "Lunch Slot",
            icon: <Sun size={13} className="text-amber-600" />,
            badgeClass: "bg-amber-50 text-amber-700 border-amber-100",
            slotTime: universalDeliveryTimes.lunchTime || "12:00 PM - 01:00 PM",
            data: currentDaySchedule?.lunch,
            isSelectedInPlan: selectedMeals.lunch
        },
        {
            key: "dinner",
            label: "Dinner Slot",
            icon: <Moon size={13} className="text-purple-600" />,
            badgeClass: "bg-purple-50 text-purple-700 border-purple-100",
            slotTime: universalDeliveryTimes.dinnerTime || "07:00 PM - 08:00 PM",
            data: currentDaySchedule?.dinner,
            isSelectedInPlan: selectedMeals.dinner
        }
    ];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-7 antialiased select-none text-left">

            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] uppercase tracking-wider transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back to Custom Plans
                </button>

                {/* Badges Line */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                        {bookingId}
                    </span>

                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {status || "Active"}
                    </span>

                    {deliveryOTP && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 text-[#3d3f96] border border-indigo-100 shadow-xs">
                            <KeyRound size={13} />
                            <span>OTP: <strong className="font-mono tracking-wider">{deliveryOTP}</strong></span>
                        </span>
                    )}
                </div>
            </div>

            {/* Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* LEFT COLUMN: MEAL SCHEDULE, SLOTS & TIMINGS (7/12) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Plan Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-[#3d3f96]">
                                <ChefHat size={12} />
                                {bookingType || "Custom Plate"} Package
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                                Booked on {formatDate(createdAt)}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Personalized Meal Schedule
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Complete {packageDays}-Day Custom Dietary Meal Package tailored to your health goals
                            </p>
                        </div>

                        {/* Duration Banner */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#3d3f96] shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                        Subscription Duration
                                    </span>
                                    <strong className="text-xs font-black text-slate-800">
                                        {formatDate(startDate)} – {formatDate(endDate)}
                                    </strong>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-black text-[#3d3f96] bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                                {packageDays} Days Total
                            </span>
                        </div>

                        {/* Dietary, Spice & Slot Preferences */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                            {dietaryType && renderDietBadge(dietaryType)}
                            {spiceLevel && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                    <Flame size={10} /> Spice: {spiceLevel}
                                </span>
                            )}
                            {collectionType && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                    <Truck size={10} /> {collectionType}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Universal Daily Delivery Windows */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-3.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Universal Daily Delivery Windows
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                    <Clock size={12} className="text-[#3d3f96]" /> Breakfast
                                </span>
                                <span className="font-mono font-black text-xs text-slate-800 block">
                                    {universalDeliveryTimes.breakfastTime || "07:30 AM - 08:30 AM"}
                                </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                    <Clock size={12} className="text-amber-500" /> Lunch
                                </span>
                                <span className="font-mono font-black text-xs text-slate-800 block">
                                    {universalDeliveryTimes.lunchTime || "12:00 PM - 01:00 PM"}
                                </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                    <Clock size={12} className="text-indigo-500" /> Dinner
                                </span>
                                <span className="font-mono font-black text-xs text-slate-800 block">
                                    {universalDeliveryTimes.dinnerTime || "07:00 PM - 08:00 PM"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Weekly Meal Schedule */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
                        <div className="border-b border-slate-100 pb-4">
                            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                                Configured Daily Meals
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Explore your customized dishes for each day of the week
                            </p>
                        </div>

                        {/* Day Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                            {DAYS_OF_WEEK.map((d) => {
                                const isSelected = selectedDay === d.key;
                                return (
                                    <button
                                        key={d.key}
                                        onClick={() => setSelectedDay(d.key)}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                            isSelected
                                                ? 'bg-red-50 text-red-600 border-red-200 font-black shadow-sm'
                                                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {d.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Slots Breakdown for the Selected Day */}
                        <div className="space-y-3.5 pt-2">
                            {slotsConfig.map((slot) => {
                                const slotItem = slot.data;
                                const mealObj = slotItem?.mealId || {};
                                const dishName = slotItem?.mealName || mealObj.name;
                                const dishImage = mealObj.imageUrl;
                                const calories = slotItem?.calories || mealObj.calories;
                                const dietType = mealObj.dietType || dietaryType;
                                const ingredients = mealObj.ingredients || [];
                                const tags = mealObj.tags || [];
                                const effect = mealObj.foodEffectCategory;

                                if (!slotItem && !slot.isSelectedInPlan) {
                                    return (
                                        <div
                                            key={slot.key}
                                            className="p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 flex items-center justify-between opacity-60"
                                        >
                                            <div className="flex items-center gap-2">
                                                {slot.icon}
                                                <span className="text-xs font-bold text-slate-600 capitalize">
                                                    {slot.label}
                                                </span>
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-400">
                                                Not Configured
                                            </span>
                                        </div>
                                    );
                                }

                                return (
                                    <div
                                        key={slot.key}
                                        className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xs transition-all space-y-3"
                                    >
                                        {/* Slot Top Bar */}
                                        <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`inline-flex items-center gap-1 text-[10px] font-black uppercase border px-2 py-0.5 rounded-md ${slot.badgeClass}`}
                                                >
                                                    {slot.icon}
                                                    {slot.label}
                                                </span>
                                                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 font-mono">
                                                    <Clock size={11} /> {slotItem?.deliverySlot || slot.slotTime}
                                                </span>
                                            </div>
                                            {dietType && renderDietBadge(dietType)}
                                        </div>

                                        {/* Dish Details */}
                                        <div className="flex items-center gap-3.5">
                                            <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                <img
                                                    src={getMediaUrl(dishImage) || PLACEHOLDER_DISH}
                                                    alt={dishName || "Custom Meal"}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.src = PLACEHOLDER_DISH;
                                                    }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <strong className="text-xs font-black text-slate-800 truncate block">
                                                        {dishName || "Custom Curated Dish"}
                                                    </strong>
                                                    {slotItem?.price && (
                                                        <span className="font-mono font-black text-xs text-slate-900 shrink-0">
                                                            ₹{slotItem.price}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-3 pt-0.5">
                                                    {calories && (
                                                        <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center gap-1">
                                                            <Flame size={11} className="text-amber-500" /> {calories} Kcal
                                                        </span>
                                                    )}
                                                    {effect && (
                                                        <span className="text-[9px] font-black text-red-600 uppercase">
                                                            {effect}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags & Ingredients Preview */}
                                        {(tags.length > 0 || ingredients.length > 0) && (
                                            <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                                                {tags.map((t) => (
                                                    <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md">
                                                        #{t}
                                                    </span>
                                                ))}
                                                {ingredients.slice(0, 5).map((ing) => (
                                                    <span key={ing} className="text-[9px] font-medium px-2 py-0.5 bg-white border border-slate-100 text-slate-500 rounded-md">
                                                        {ing}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Clinical Notes & Health Indicators */}
                    {(clinicalNotes || clinicalFlags.elevatedCarbRisk !== undefined) && (
                        <div className="bg-amber-50/70 border border-amber-200 rounded-[2rem] p-5 sm:p-6 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-900 font-black text-xs uppercase tracking-wider">
                                    <FileText size={14} />
                                    <span>Personalized Clinical Instructions</span>
                                </div>
                                {clinicalFlags.elevatedCarbRisk && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                                        <AlertTriangle size={10} /> Elevated Carb Alert
                                    </span>
                                )}
                            </div>

                            {clinicalNotes && (
                                <p className="text-xs text-amber-950 font-medium leading-relaxed bg-white/80 p-3.5 rounded-xl border border-amber-100">
                                    "{clinicalNotes}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Prepared By Kitchen Card */}
                    {kitchen.name && (
                        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={getMediaUrl(kitchen.profileImage) || KITCHEN_PLACEHOLDER}
                                        alt={kitchen.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.src = KITCHEN_PLACEHOLDER;
                                        }}
                                    />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">
                                        Assigned Cloud Kitchen
                                    </span>
                                    <strong className="text-xs font-black text-slate-800 tracking-tight block truncate">
                                        {kitchen.name}
                                    </strong>
                                    <span className="text-[11px] text-slate-400 font-bold block truncate">
                                        {kitchen.city || "Mohali"}
                                    </span>
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

                    {/* Delivery Destination Address Card */}
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
                                        {address.name || "Customer"}
                                    </strong>
                                </div>

                                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                    {[address.houseNo, address.sector, address.city, address.state, address.pincode]
                                        .filter(Boolean)
                                        .join(', ') || "Address details registered"}
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

                    {/* Payment & Transaction Status Card */}
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
                                    <span className="font-mono font-bold text-slate-800">
                                        {paymentDetails.razorpayPaymentId}
                                    </span>
                                </div>
                            )}

                            {paymentDetails.paidAt && (
                                <div className="flex justify-between items-center text-[11px] text-slate-600">
                                    <span>Paid On:</span>
                                    <span className="font-bold text-slate-800">
                                        {formatDateTime(paymentDetails.paidAt)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Complete Bill Breakdown */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm space-y-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <ReceiptText size={14} className="text-[#3d3f96]" /> Complete Bill Summary
                        </span>

                        <div className="space-y-2 text-xs">
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Meal Subtotal</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary.itemTotal || 0}</span>
                            </div>

                            {billSummary.packagingCharge > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                    <span>Packaging Fee</span>
                                    <span className="font-mono font-bold text-slate-800">
                                        ₹{billSummary.packagingCharge}
                                    </span>
                                </div>
                            )}

                            {billSummary.peakOrderCharge > 0 && (
                                <div className="flex justify-between items-center text-slate-600 font-medium">
                                    <span>Peak Order Charge</span>
                                    <span className="font-mono font-bold text-slate-800">
                                        ₹{billSummary.peakOrderCharge}
                                    </span>
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
                                <span className="font-black text-slate-900 uppercase tracking-tight">
                                    Total Amount Paid
                                </span>
                                <span className="font-mono font-black text-xl text-slate-900">
                                    ₹{billSummary.totalAmount || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Hygiene & Audited Standards Notice */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-0.5">
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">
                                Audited Health Standard
                            </span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                Your customized meals are prepared per your dietary guidelines and delivered hot in insulated packaging.
                            </span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}