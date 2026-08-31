"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    Flame,
    HeartPulse,
    Loader2,
    ShoppingBag,
    AlertCircle,
    ShieldCheck,
    Star,
    Layers,
    Calendar,
    Utensils,
    Tag,
    Store,
    MapPin,
    Bookmark,
    CheckCircle2,
    Circle,
    Copy,
    Check,
    Info,
    Sparkles,
    HelpCircle,
    ChevronDown
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_TIME_SLOTS = {
    breakfast: ['07:00 AM - 08:00 AM', '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM'],
    lunch: ['12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM'],
    dinner: ['07:00 PM - 08:00 PM', '08:00 PM - 09:00 PM', '09:00 PM - 10:00 PM']
};

export default function TiffinPlanDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

    // --- Dropdown state for Special Instructions ---
    const [showInstructions, setShowInstructions] = useState(false);

    // --- Subscription Customization States ---
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [applyToAllWeeks, setApplyToAllWeeks] = useState(true);

    // Structure: { [weekNumber]: { [dayName]: { [slotKey]: dishId } } }
    const [customizedSchedule, setCustomizedSchedule] = useState({});

    // Universal Delivery Times: { breakfast: "...", lunch: "...", dinner: "..." }
    const [deliveryTimes, setDeliveryTimes] = useState({
        breakfast: '08:00 AM - 09:00 AM',
        lunch: '01:00 PM - 02:00 PM',
        dinner: '08:00 PM - 09:00 PM'
    });

    // --- Retrieve Coords safely for nearby distance calculations ---
    const getInitialCoords = () => {
        let lat;
        let lng;

        if (typeof window !== "undefined") {
            const savedCoords = localStorage.getItem("userCoords");
            if (savedCoords) {
                try {
                    const parsed = JSON.parse(savedCoords);
                    if (parsed.lat !== undefined && parsed.lng !== undefined) {
                        lat = Number(parsed.lat);
                        lng = Number(parsed.lng);
                    }
                } catch (e) {
                    console.error("Error reading stored user coordinates:", e);
                }
            }
        }
        return { lat, lng };
    };

    const fetchPlanDetails = async () => {
        setLoading(true);
        const currentCoords = getInitialCoords();
        try {
            const response = await UserAPI.getUserTiffinPlanDetails(id, currentCoords);
            if (response && response.success) {
                const planData = response.data;
                setPlan(planData);
                initializeDefaultSelections(planData);
            } else {
                if (showNotification) {
                    showNotification("Unable to load tiffin plan details.", "error");
                }
            }
        } catch (err) {
            console.error("Error loading tiffin details:", err);
            if (showNotification) {
                showNotification("Failed to connect to the subscription database.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    // Pre-populate the first dish of each slot as default choice for a smooth UX
    const initializeDefaultSelections = (planData) => {
        if (!planData || !planData.permittedSlots) return;

        const defaultDaySchedule = {};
        planData.permittedSlots.forEach((slotName) => {
            const slotKey = slotName.toLowerCase();
            const dishes = planData.slotDishes?.[slotKey] || [];
            if (dishes.length > 0) {
                defaultDaySchedule[slotKey] = dishes[0].itemId?._id || dishes[0]._id;
            }
        });

        const initialSchedule = {};
        const totalWeeks = isMonthlyPlan(planData.planCycle) ? 4 : 1;

        for (let w = 1; w <= totalWeeks; w++) {
            initialSchedule[w] = {};
            DAYS_OF_WEEK.forEach((day) => {
                initialSchedule[w][day] = { ...defaultDaySchedule };
            });
        }

        setCustomizedSchedule(initialSchedule);
    };

    useEffect(() => {
        if (id) {
            fetchPlanDetails();
        }
    }, [id]);

    const isMonthly = useMemo(() => {
        return isMonthlyPlan(plan?.planCycle);
    }, [plan?.planCycle]);

    function isMonthlyPlan(cycle) {
        if (!cycle) return false;
        const lower = cycle.toLowerCase();
        return lower.includes('month') || lower.includes('28') || lower.includes('30') || lower.includes('4 week');
    }

    // --- Dish Selection Handler (One meal per slot) ---
    const handleSelectDish = (slotKey, dishId) => {
        setCustomizedSchedule((prev) => {
            const updated = { ...prev };

            if (isMonthly && applyToAllWeeks) {
                // Apply this selection for this day across all 4 weeks
                for (let w = 1; w <= 4; w++) {
                    if (!updated[w]) updated[w] = {};
                    if (!updated[w][selectedDay]) updated[w][selectedDay] = {};
                    updated[w][selectedDay] = {
                        ...updated[w][selectedDay],
                        [slotKey]: dishId
                    };
                }
            } else {
                // Apply only to currently selected week & day
                if (!updated[selectedWeek]) updated[selectedWeek] = {};
                if (!updated[selectedWeek][selectedDay]) updated[selectedWeek][selectedDay] = {};
                updated[selectedWeek][selectedDay] = {
                    ...updated[selectedWeek][selectedDay],
                    [slotKey]: dishId
                };
            }

            return updated;
        });
    };

    // Replicate current week's schedule to all other weeks
    const handleReplicateWeekToAll = () => {
        if (!customizedSchedule[selectedWeek]) return;
        const currentWeekData = customizedSchedule[selectedWeek];

        setCustomizedSchedule((prev) => {
            const updated = { ...prev };
            for (let w = 1; w <= 4; w++) {
                updated[w] = JSON.parse(JSON.stringify(currentWeekData));
            }
            return updated;
        });

        if (showNotification) {
            showNotification(`Week ${selectedWeek} selections replicated to all 4 weeks!`, "success");
        }
    };

    // --- Delivery Time Handler ---
    const handleDeliveryTimeChange = (slotKey, timeWindow) => {
        setDeliveryTimes((prev) => ({
            ...prev,
            [slotKey]: timeWindow
        }));
    };

    const handleSubscribe = () => {
        setSubscribing(true);

        const subscriptionPayload = {
            planId: plan._id,
            planName: plan.name,
            price: plan.price,
            planCycle: plan.planCycle,
            deliveryTimes,
            schedule: customizedSchedule
        };

        if (typeof window !== "undefined") {
            sessionStorage.setItem("activeSubscriptionConfig", JSON.stringify(subscriptionPayload));
        }

        setTimeout(() => {
            setSubscribing(false);
            if (showNotification) {
                showNotification(`Successfully configured ${plan.name}!`, "success");
            }
            // router.push('/otherscreens/carts/foodcart');
        }, 1000);
    };

    // --- Helper: Render Diet Badge ---
    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isEgg = type === 'Egg';
        const isNonVeg = type === 'Non Veg';

        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-white ${isVeg ? 'text-emerald-600 border-emerald-100' :
                    isEgg ? 'text-amber-600 border-amber-100' :
                        isNonVeg ? 'text-rose-600 border-rose-100' :
                            'text-slate-500 border-slate-100'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' :
                        isEgg ? 'bg-amber-500' :
                            isNonVeg ? 'bg-rose-500' :
                                'bg-slate-400'
                    }`} />
                {type}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Assembling tiffin subscription details...</p>
            </div>
        );
    }

    if (!plan) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] text-center p-8 select-none">
                <AlertCircle className="text-slate-300 mb-4" size={48} />
                <h2 className="text-lg font-bold text-slate-700">Tiffin Plan Not Found</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">We were unable to locate this subscription. It may have been unlisted or moved.</p>
                <button
                    onClick={() => router.push('/food/nearest')}
                    className="mt-6 px-6 py-3 bg-[#3d3f96] hover:bg-[#2F3175] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    const isAvailable = plan.isAvailable !== false && !plan.UnavailablePlan;
    const bannerImage = plan.imageUrl || plan.dishPool?.[0]?.imageUrl || null;
    const vendor = plan.vendorId || {};
    const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;

    // Dynamically aggregate distinct tags, ingredients, and therapy focuses from child slot meals
    const getAllDishesList = () => {
        return [
            ...(plan.slotDishes?.breakfast || []),
            ...(plan.slotDishes?.lunch || []),
            ...(plan.slotDishes?.dinner || [])
        ].map(item => item.itemId).filter(Boolean);
    };

    const aggregatedIngredients = Array.from(new Set(getAllDishesList().flatMap(d => d.ingredients || [])));
    const aggregatedTags = Array.from(new Set(getAllDishesList().flatMap(d => d.tags || [])));
    const aggregatedFocusAreas = Array.from(new Set(getAllDishesList().map(d => d.foodEffectCategory).filter(Boolean)));

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-8 antialiased select-none text-left">

            {/* Breadcrumb Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] tracking-wider uppercase transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} /> Back to Tiffin Plans
            </button>

            {/* Split Grid Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN A: MEDIA & METRICS (5/12) */}
                <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
                    {/* Visual Card */}
                    <div className="relative rounded-[2rem] overflow-hidden shadow-md border border-slate-100 bg-white">
                        <div className="relative aspect-square w-full">
                            <img
                                src={getMediaUrl(bannerImage) || PLACEHOLDER_IMAGE}
                                alt={plan.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                            {/* Proximity Availability Block */}
                            {!isAvailable && (
                                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                                    <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-500/50">
                                        Not Available Near You
                                    </span>
                                </div>
                            )}

                            {/* Cycle Tag */}
                            <div className="absolute top-4 left-4 z-20">
                                <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black px-2.5 py-1.5 rounded-lg uppercase tracking-wider border border-white/10">
                                    {plan.planCycle || "Monthly Plan"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Parameters Panel */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Plan Parameters
                        </span>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                                <Layers className="text-indigo-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Meals / Day</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-1">{plan.mealsPerDay || 1} Meal{plan.mealsPerDay > 1 ? 's' : ''}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                                <Clock className="text-amber-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Cycle</span>
                                <span className="font-sans font-black text-xs text-slate-800 mt-1 text-center truncate w-full">{plan.planCycle || "Monthly"}</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                                <MapPin className="text-rose-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Proximity</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-1">{plan.distanceText || `${plan.distance || 0} km`}</span>
                            </div>
                        </div>
                    </div>

                    {/* Kitchen Vendor Card */}
                    {vendor.name && (
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0">
                                    <img
                                        src={getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER}
                                        alt={vendor.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                    />
                                </div>
                                <div className="space-y-0.5 min-w-0">
                                    <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Prepared By</span>
                                    <strong className="text-xs font-black text-slate-800 tracking-tight block mt-1">{vendor.name}</strong>
                                    <p className="text-[10px] text-slate-400 font-bold truncate max-w-[160px]">{vendor.address || "Cloud Hub"}</p>
                                </div>
                            </div>
                            {vendor.rating !== undefined && (
                                <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-extrabold shrink-0 select-none">
                                    <Star size={13} className="fill-amber-500 text-amber-500" /> {vendor.rating || '0.0'}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Combined Ingredients Summary */}
                    {aggregatedIngredients.length > 0 && (
                        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Combined Ingredients Included</span>
                            <div className="flex flex-wrap gap-1.5">
                                {aggregatedIngredients.map((ing) => (
                                    <span key={ing} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[11px] font-bold text-slate-600 rounded-lg">
                                        {ing}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* COLUMN B: DETAILS, SLOTS & ACTION FORM (7/12) */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">

                        {/* Title block */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border bg-indigo-50 border-indigo-100 text-[#3d3f96]">
                                    <Bookmark size={11} className="fill-[#3d3f96] text-[#3d3f96]" />
                                    Tiffin Subscription Package
                                </span>
                                {aggregatedFocusAreas.map((area) => (
                                    <span key={area} className="text-[10px] font-black uppercase text-red-600 bg-red-50/60 px-3 py-1.5 rounded-xl border border-red-200/60 shadow-sm">
                                        {area}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                                {plan.name}
                            </h1>

                            <div className="flex items-baseline gap-2.5 pt-1.5 border-t border-slate-50">
                                <span className="text-2xl font-black text-slate-900 font-mono">₹{plan.price}</span>
                                <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">• Subscription Cost for {plan.planCycle || 'Cycle'}</span>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Description Overview</span>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                {plan.description}
                            </p>
                        </div>

                        {/* --- SPECIAL INSTRUCTION: COLLAPSIBLE DROPDOWN ACCORDION --- */}
                        <div className="border border-indigo-100 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50/70 via-slate-50/60 to-red-50/40 transition-all">
                            {/* Clickable Header Button */}
                            <button
                                type="button"
                                onClick={() => setShowInstructions(!showInstructions)}
                                className="w-full p-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors cursor-pointer"
                            >
                                <div className="flex items-center gap-2.5 text-[#3d3f96]">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-100/80 flex items-center justify-center shrink-0">
                                        <HelpCircle size={16} className="text-[#3d3f96]" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            How Subscription Customization Works
                                        </h3>
                                        <p className="text-[10px] text-slate-500 font-medium">
                                            {showInstructions ? "Click to collapse instructions" : "Click to view 4 simple booking steps"}
                                        </p>
                                    </div>
                                </div>

                                <div className={`w-6 h-6 rounded-full bg-white border border-indigo-100 flex items-center justify-center transition-transform duration-300 ${showInstructions ? 'rotate-180 bg-indigo-50 text-[#3d3f96]' : 'text-slate-400'
                                    }`}>
                                    <ChevronDown size={14} />
                                </div>
                            </button>

                            {/* Dropdown Content */}
                            {showInstructions && (
                                <div className="p-4 pt-1 border-t border-indigo-50/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left animate-in fade-in slide-in-from-top-1 duration-200">
                                    {/* Step 1 */}
                                    <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 shadow-xs space-y-1">
                                        <span className="inline-flex items-center gap-1 bg-indigo-100/70 text-[#3d3f96] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                                            Step 1 • Daily Timings
                                        </span>
                                        <p className="text-[11px] text-slate-600 font-medium leading-snug">
                                            Set your preferred universal delivery time for each meal slot (Breakfast, Lunch, or Dinner).
                                        </p>
                                    </div>

                                    {/* Step 2 */}
                                    <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 shadow-xs space-y-1">
                                        <span className="inline-flex items-center gap-1 bg-red-100/70 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                                            Step 2 • Pick 1 Meal / Slot
                                        </span>
                                        <p className="text-[11px] text-slate-600 font-medium leading-snug">
                                            For each active day (Monday to Sunday), choose strictly <strong>1 dish</strong> per slot from available items.
                                        </p>
                                    </div>

                                    {/* Step 3 */}
                                    <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 shadow-xs space-y-1">
                                        <span className="inline-flex items-center gap-1 bg-amber-100/70 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                                            Step 3 • Weekly / Monthly Sync
                                        </span>
                                        <p className="text-[11px] text-slate-600 font-medium leading-snug">
                                            {isMonthly
                                                ? "Monthly Plan: Configure Week 1 and keep 'Sync across all 4 weeks' checked to replicate, or customize each week individually."
                                                : "Weekly Plan: Configure your meals day-by-day from Monday through Sunday."}
                                        </p>
                                    </div>

                                    {/* Step 4 */}
                                    <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 shadow-xs space-y-1">
                                        <span className="inline-flex items-center gap-1 bg-emerald-100/70 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                                            Step 4 • Confirm &amp; Checkout
                                        </span>
                                        <p className="text-[11px] text-slate-600 font-medium leading-snug">
                                            Click <strong>Confirm Subscription &amp; Pay</strong> to proceed with your dietitian-crafted meal package.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* --- UNIVERSAL DELIVERY TIME WINDOWS --- */}
                        <div className="space-y-3 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                    Universal Delivery Time Preferences
                                </span>
                                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                    Fixed Daily Timings
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {plan.permittedSlots?.map((slot) => {
                                    const slotKey = slot.toLowerCase();
                                    const options = DEFAULT_TIME_SLOTS[slotKey] || ['08:00 AM - 09:00 AM', '01:00 PM - 02:00 PM', '08:00 PM - 09:00 PM'];
                                    return (
                                        <div key={slot} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1.5">
                                            <span className="text-[10px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                                                <Clock size={12} className="text-[#3d3f96]" /> {slot} Time
                                            </span>
                                            <select
                                                value={deliveryTimes[slotKey] || options[0]}
                                                onChange={(e) => handleDeliveryTimeChange(slotKey, e.target.value)}
                                                className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-[#3d3f96] transition-colors cursor-pointer"
                                            >
                                                {options.map((timeOpt) => (
                                                    <option key={timeOpt} value={timeOpt}>
                                                        {timeOpt}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- WEEK & DAY SELECTION CONTROLS --- */}
                        <div className="space-y-4 pt-2 border-t border-slate-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                        Customize Daily Meal Schedule
                                    </span>
                                    <p className="text-xs text-slate-500 font-medium">
                                        Select strictly 1 dish per slot for every day.
                                    </p>
                                </div>

                                {/* Month Sync Option */}
                                {isMonthly && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setApplyToAllWeeks(!applyToAllWeeks);
                                            if (!applyToAllWeeks) {
                                                handleReplicateWeekToAll();
                                            }
                                        }}
                                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${applyToAllWeeks
                                                ? 'bg-indigo-50 border-indigo-200 text-[#3d3f96]'
                                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {applyToAllWeeks ? <Check size={14} className="text-[#3d3f96]" /> : <Copy size={13} />}
                                        <span>Sync selections across all 4 weeks</span>
                                    </button>
                                )}
                            </div>

                            {/* Week Tabs (For Monthly plans) */}
                            {isMonthly && (
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                                    {[1, 2, 3, 4].map((weekNum) => (
                                        <button
                                            key={weekNum}
                                            type="button"
                                            onClick={() => setSelectedWeek(weekNum)}
                                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${selectedWeek === weekNum
                                                    ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                }`}
                                        >
                                            Week {weekNum}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Day Tabs (Monday - Sunday) */}
                            <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                                {DAYS_OF_WEEK.map((day) => {
                                    const isSelected = selectedDay === day;
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${isSelected
                                                    ? 'bg-red-50 text-red-600 border-red-200 font-black shadow-sm'
                                                    : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* --- SLOT-WISE DISH SELECTION (RADIO / 1 MEAL ONLY PER SLOT) --- */}
                        <div className="space-y-4">
                            {plan.permittedSlots?.map((slot) => {
                                const slotKey = slot.toLowerCase();
                                const dishes = plan.slotDishes?.[slotKey] || [];
                                if (dishes.length === 0) return null;

                                const currentSelectedDishId = customizedSchedule[selectedWeek]?.[selectedDay]?.[slotKey];

                                return (
                                    <div key={slot} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                                        {/* Slot Header */}
                                        <div className="bg-slate-100/60 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <h4 className="text-xs font-black text-[#3d3f96] uppercase tracking-wider flex items-center gap-1.5">
                                                    <Utensils size={14} /> {slot} Slot
                                                </h4>
                                                <span className="text-[10px] text-slate-400 font-bold">
                                                    ({selectedDay} • Week {selectedWeek})
                                                </span>
                                            </div>
                                            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                                                Pick 1 Dish
                                            </span>
                                        </div>

                                        {/* Slot Dish Options */}
                                        <div className="p-3.5 space-y-2.5">
                                            {dishes.map((dishItem) => {
                                                const dishObj = dishItem.itemId || {};
                                                const dishId = dishObj._id || dishItem._id;
                                                const isSelected = currentSelectedDishId === dishId;

                                                return (
                                                    <div
                                                        key={dishItem._id || dishId}
                                                        onClick={() => handleSelectDish(slotKey, dishId)}
                                                        className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${isSelected
                                                                ? 'bg-white border-[#3d3f96] shadow-sm ring-1 ring-[#3d3f96]'
                                                                : 'bg-white/80 border-slate-100 hover:border-slate-300'
                                                            }`}
                                                    >
                                                        {/* Radio Indicator */}
                                                        <div className="shrink-0">
                                                            {isSelected ? (
                                                                <CheckCircle2 size={20} className="text-[#3d3f96] fill-indigo-50" />
                                                            ) : (
                                                                <Circle size={20} className="text-slate-300" />
                                                            )}
                                                        </div>

                                                        {/* Dish Thumbnail */}
                                                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                            <img
                                                                src={getMediaUrl(dishObj.imageUrl) || PLACEHOLDER_IMAGE}
                                                                alt={dishObj.name}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                            />
                                                        </div>

                                                        {/* Dish Details */}
                                                        <div className="flex-1 min-w-0 space-y-0.5">
                                                            <div className="flex items-center gap-2 justify-between">
                                                                <strong className="text-xs font-black text-slate-800 truncate" title={dishObj.name}>
                                                                    {dishObj.name}
                                                                </strong>
                                                                {renderDietBadge(dishObj.dietType)}
                                                            </div>

                                                            <div className="flex items-center justify-between pt-0.5">
                                                                <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                                                                    <Flame size={11} className="text-amber-500 shrink-0" /> {dishObj.calories || 0} Kcal
                                                                </span>
                                                                {dishObj.foodEffectCategory && (
                                                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-wide">
                                                                        {dishObj.foodEffectCategory}
                                                                    </span>
                                                                )}
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

                        {/* Combined Tags */}
                        {aggregatedTags.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Health Filters Applied</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {aggregatedTags.map((tag) => (
                                        <span key={tag} className="px-2.5 py-1 bg-indigo-50/50 text-[#3d3f96] text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Confirm Subscription Actions */}
                        <div className="pt-2">
                            {isAvailable ? (
                                <button
                                    onClick={handleSubscribe}
                                    disabled={subscribing}
                                    className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer disabled:opacity-75"
                                >
                                    {subscribing ? (
                                        <Loader2 size={18} className="animate-spin text-white" />
                                    ) : (
                                        <ShoppingBag size={18} />
                                    )}
                                    <span>Confirm Subscription &amp; Pay</span>
                                </button>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm uppercase tracking-wider border border-slate-200/60 flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <AlertCircle size={18} />
                                    Not Available in Your Area
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Certifications Banner */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                        <div className="space-y-0.5">
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">Clinical Hygiene Protocols</span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                Subscription tiffins are packed using food-grade eco-friendly boxes and shipped directly from audited cloud kitchens.
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}