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
    Star,
    Utensils,
    Loader2,
    AlertCircle,
    CheckCircle2,
    KeyRound,
    CreditCard,
    Layers,
    ChevronRight,
    Tag,
    Building2,
    Store
} from 'lucide-react';

// Import API & Context
import UserAPI from '../../../../../services/UserAPI'; // Adjust path if needed
import { useNotification } from '../../../../../context/NotificationContext'; // Adjust path if needed

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

export default function TiffinSubscriptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification?.() || {};

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);

    // Active Day & Week for Schedule Explorer
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState('monday');

    // Fetch Details
    const fetchSubscriptionDetails = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getUserTiffinSubscriptionDetails(id);
            if (response && response.success && response.data) {
                setSubscription(response.data);
            } else {
                if (showNotification) showNotification("Subscription details not found.", "error");
            }
        } catch (error) {
            console.error("Error loading subscription details:", error);
            if (showNotification) showNotification("Failed to connect to subscription server.", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchSubscriptionDetails();
        }
    }, [id]);

    // Format Dates (e.g. "Aug 31, 2026")
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

    // Render Diet Badge
    const renderDietBadge = (type = "") => {
        const isVeg = type === "Veg";
        const isNonVeg = type === "Non Veg";
        const isEgg = type === "Egg";

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                isVeg ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                isNonVeg ? 'text-rose-700 bg-rose-50 border-rose-200' :
                isEgg ? 'text-amber-700 bg-amber-50 border-amber-200' :
                'text-slate-600 bg-slate-100 border-slate-200'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                    isVeg ? 'bg-emerald-500' : isNonVeg ? 'bg-rose-500' : isEgg ? 'bg-amber-500' : 'bg-slate-400'
                }`} />
                {type}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={38} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Loading your subscription details...
                </p>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-[75vh] flex flex-col items-center justify-center p-6 text-center select-none space-y-4">
                <AlertCircle className="text-slate-300" size={48} />
                <div className="space-y-1">
                    <h2 className="text-lg font-black text-slate-800">Subscription Not Found</h2>
                    <p className="text-xs text-slate-400">We were unable to locate this tiffin subscription record.</p>
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
        status,
        deliveryOTP,
        subscriptionDetails = {},
        address = {},
        foodId: vendor = {},
        billSummary = {},
        paymentMethod,
        paymentStatus,
        paymentDetails = {},
        createdAt
    } = subscription;

    const dailySchedule = subscriptionDetails.dailyMealSchedule || [];
    const universalTimes = subscriptionDetails.universalDeliveryTimes || {};

    // Get total weeks available
    const totalWeeks = Math.max(1, ...dailySchedule.map(s => s.weekNumber || 1));

    // Filter meals for the currently selected Day & Week
    const activeMealsForDay = dailySchedule.filter(
        (m) => (m.weekNumber || 1) === selectedWeek && (m.dayOfWeek || '').toLowerCase() === selectedDay.toLowerCase()
    );

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-7 antialiased select-none text-left">
            
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] uppercase tracking-wider transition-colors cursor-pointer"
                >
                    <ArrowLeft size={16} /> Back to My Subscriptions
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

                {/* LEFT COLUMN: MEAL SCHEDULE & TIMINGS (7/12) */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Plan Header Card */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-[#3d3f96]">
                                <Utensils size={12} />
                                {subscriptionDetails.billingCycle || "Weekly"} Tiffin Plan
                            </span>
                            <span className="text-[11px] font-bold text-slate-400">
                                Booked on {formatDate(createdAt)}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                {subscriptionDetails.planName}
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-1">
                                Complete {subscriptionDetails.durationDays || 7}-Day Custom Dietary Meal Package
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
                                        {formatDate(subscriptionDetails.startDate)} – {formatDate(subscriptionDetails.endDate)}
                                    </strong>
                                </div>
                            </div>
                            <span className="text-xs font-mono font-black text-[#3d3f96] bg-white px-3 py-1.5 rounded-xl border border-slate-200 self-start sm:self-auto">
                                {subscriptionDetails.durationDays || 7} Days Total
                            </span>
                        </div>
                    </div>

                    {/* Universal Delivery Times Card */}
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
                                    {universalTimes.breakfastTime || "08:00 AM - 09:00 AM"}
                                </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                    <Clock size={12} className="text-amber-500" /> Lunch
                                </span>
                                <span className="font-mono font-black text-xs text-slate-800 block">
                                    {universalTimes.lunchTime || "01:00 PM - 02:00 PM"}
                                </span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                                <span className="text-[10px] font-extrabold text-slate-500 uppercase flex items-center gap-1">
                                    <Clock size={12} className="text-indigo-500" /> Dinner
                                </span>
                                <span className="font-mono font-black text-xs text-slate-800 block">
                                    {universalTimes.dinnerTime || "08:00 PM - 09:00 PM"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Interactive Day-by-Day Meal Schedule */}
                    <div className="bg-white rounded-[2rem] p-6 sm:p-7 border border-slate-100 shadow-sm space-y-5">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-sm font-black uppercase text-slate-800 tracking-wider">
                                    Configured Daily Meals
                                </h3>
                                <p className="text-[11px] text-slate-400 font-medium">
                                    Explore your customized dishes for each day of the week
                                </p>
                            </div>

                            {/* Week Tabs if Monthly */}
                            {totalWeeks > 1 && (
                                <div className="flex items-center gap-1.5">
                                    {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((w) => (
                                        <button
                                            key={w}
                                            type="button"
                                            onClick={() => setSelectedWeek(w)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                                selectedWeek === w
                                                    ? 'bg-[#3d3f96] text-white shadow-xs'
                                                    : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                                            }`}
                                        >
                                            Week {w}
                                        </button>
                                    ))}
                                </div>
                            )}
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

                        {/* Slot Dish Cards for the Active Day */}
                        <div className="space-y-3.5 pt-2">
                            {activeMealsForDay.length === 0 ? (
                                <div className="py-8 text-center text-slate-400 space-y-1">
                                    <Utensils size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-xs font-bold">No meals configured for {selectedDay}.</p>
                                </div>
                            ) : (
                                activeMealsForDay.map((slotItem) => {
                                    const mealObj = slotItem.mealId || {};
                                    const dishName = slotItem.mealName || mealObj.name;
                                    const dishImage = slotItem.mealImage || mealObj.imageUrl;
                                    const calories = slotItem.calories || mealObj.calories;
                                    const dietType = slotItem.dietType || mealObj.dietType;
                                    const ingredients = mealObj.ingredients || [];
                                    const tags = mealObj.tags || [];

                                    return (
                                        <div
                                            key={slotItem._id}
                                            className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-100 hover:shadow-xs transition-all space-y-3"
                                        >
                                            {/* Slot Bar */}
                                            <div className="flex items-center justify-between border-b border-slate-100/80 pb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black uppercase text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                                                        {slotItem.slotName} Slot
                                                    </span>
                                                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 font-mono">
                                                        <Clock size={11} /> {slotItem.deliveryTime || "Scheduled"}
                                                    </span>
                                                </div>
                                                {renderDietBadge(dietType)}
                                            </div>

                                            {/* Dish Row */}
                                            <div className="flex items-center gap-3.5">
                                                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                                                    <img
                                                        src={getMediaUrl(dishImage) || PLACEHOLDER_DISH}
                                                        alt={dishName}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = PLACEHOLDER_DISH; }}
                                                    />
                                                </div>

                                                <div className="flex-1 min-w-0 space-y-0.5">
                                                    <strong className="text-xs font-black text-slate-800 truncate block">
                                                        {dishName}
                                                    </strong>

                                                    <div className="flex items-center gap-3 pt-0.5">
                                                        {calories && (
                                                            <span className="text-[10px] font-bold text-slate-500 font-mono flex items-center gap-1">
                                                                <Flame size={11} className="text-amber-500" /> {calories} Kcal
                                                            </span>
                                                        )}
                                                        {mealObj.foodEffectCategory && (
                                                            <span className="text-[9px] font-black text-red-600 uppercase">
                                                                {mealObj.foodEffectCategory}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Tags / Ingredients Preview */}
                                            {(tags.length > 0 || ingredients.length > 0) && (
                                                <div className="flex flex-wrap gap-1 pt-1 border-t border-slate-100">
                                                    {tags.map((t) => (
                                                        <span key={t} className="text-[9px] font-bold px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md">
                                                            #{t}
                                                        </span>
                                                    ))}
                                                    {ingredients.slice(0, 4).map((ing) => (
                                                        <span key={ing} className="text-[9px] font-medium px-2 py-0.5 bg-white border border-slate-100 text-slate-500 rounded-md">
                                                            {ing}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Prepared By Kitchen Card */}
                    {vendor.name && (
                        <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER}
                                        alt={vendor.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block">Cloud Kitchen Hub</span>
                                    <strong className="text-xs font-black text-slate-800 tracking-tight block truncate">{vendor.name}</strong>
                                    <span className="text-[11px] text-slate-400 font-bold block truncate">{vendor.city || "Mohali"}</span>
                                </div>
                            </div>

                            {vendor.phone && (
                                <a
                                    href={`tel:${vendor.phone}`}
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

                    {/* Delivery Address Card */}
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
                                    {[address.houseNo, address.sector, address.city, address.state, address.pincode].filter(Boolean).join(', ')}
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

                    {/* Payment & Transaction Card */}
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

                            {paymentDetails.paidAt && (
                                <div className="flex justify-between items-center text-[11px] text-slate-600">
                                    <span>Paid On:</span>
                                    <span className="font-bold text-slate-800">{formatDateTime(paymentDetails.paidAt)}</span>
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
                                <span>Meal Base Total</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary.itemTotal || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Packaging Fee</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary.packagingCharge || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Delivery Fee</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {billSummary.deliveryCharge === 0 ? <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span> : `₹${billSummary.deliveryCharge || 0}`}
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

                    {/* Hygiene & Food Safety Notice */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-0.5">
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">Audited Health Standard</span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                Your tiffins are packed hot in food-grade insulated boxes and delivered strictly within your chosen time slots.
                            </span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}