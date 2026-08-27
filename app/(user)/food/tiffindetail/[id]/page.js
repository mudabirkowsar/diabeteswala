"use client";

import React, { useState, useEffect } from 'react';
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
    Bookmark
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../../services/UserAPI'; // Adjust relative path based on folder depth
import { useNotification } from '../../../../context/NotificationContext'; // Adjust path

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

export default function TiffinPlanDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();

    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [subscribing, setSubscribing] = useState(false);

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
            // Passes optional lat/lng coordinates to correctly resolve kitchen offsets [cite: custom_context]
            const response = await UserAPI.getUserTiffinPlanDetails(id, currentCoords);
            if (response && response.success) {
                setPlan(response.data);
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

    useEffect(() => {
        if (id) {
            fetchPlanDetails();
        }
    }, [id]);

    const handleSubscribe = () => {
        setSubscribing(true);
        setTimeout(() => {
            setSubscribing(false);
            if (showNotification) {
                showNotification(`Successfully subscribed to ${plan.name}!`, "success");
            }
            router.push('/otherscreens/carts/foodcart');
        }, 1200);
    };

    // --- Helper: Render Diet Badge ---
    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isEgg = type === 'Egg';
        const isNonVeg = type === 'Non Veg';

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border bg-white ${isVeg ? 'text-emerald-600 border-emerald-100' : isEgg ? 'text-amber-600 border-amber-100' : isNonVeg ? 'text-rose-600 border-rose-100' : 'text-slate-500 border-slate-100'
                }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'}`} />
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

    const isAvailable = plan.isAvailable !== false && !plan.UnavailablePlan; // Validate availability state [cite: custom_context]
    const bannerImage = plan.dishPool?.[0]?.imageUrl || null;
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
                className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] tracking-wider uppercase transition-colors"
            >
                <ArrowLeft size={16} /> Back to Tiffin Plans
            </button>

            {/* Split Grid Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN A: MEDIA & METRICS (5/12) */}
                <div className="lg:col-span-5 space-y-6">
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

                        {/* --- SLOT-WISE DISH CALENDAR --- */}
                        <div className="space-y-4 pt-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Slot-Wise Delivery Calendar</span>

                            <div className="space-y-4">
                                {plan.permittedSlots?.map((slot) => {
                                    const dishes = plan.slotDishes?.[slot.toLowerCase()] || [];
                                    if (dishes.length === 0) return null;

                                    return (
                                        <div key={slot} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                                            {/* Slot Header */}
                                            <div className="bg-slate-100/50 px-4 py-3 border-b border-slate-100/70 flex items-center justify-between">
                                                <h4 className="text-xs font-black text-[#3d3f96] uppercase tracking-wider flex items-center gap-1.5">
                                                    <Utensils size={14} /> {slot} Slot Delivery
                                                </h4>
                                                <span className="text-[9px] font-bold text-slate-400 uppercase">{dishes.length} Dish{dishes.length > 1 ? 'es' : ''} Allocated</span>
                                            </div>

                                            {/* Slot Dishes Checklist */}
                                            <div className="p-4 space-y-3.5">
                                                {dishes.map((dishItem) => {
                                                    const dishObj = dishItem.itemId || {};
                                                    return (
                                                        <div key={dishItem._id} className="flex gap-4 items-start border-b border-slate-100 last:border-0 pb-3.5 last:pb-0">
                                                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                                                <img
                                                                    src={getMediaUrl(dishObj.imageUrl) || PLACEHOLDER_IMAGE}
                                                                    alt={dishObj.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                            </div>
                                                            <div className="flex-1 space-y-1 min-w-0">
                                                                <div className="flex items-center gap-2 justify-between">
                                                                    <strong className="text-xs font-black text-slate-800 truncate pr-2" title={dishObj.name}>
                                                                        {dishObj.name}
                                                                    </strong>
                                                                    {renderDietBadge(dishObj.dietType)}
                                                                </div>

                                                                {/* Dish parameters */}
                                                                <div className="flex items-center justify-between pt-1">
                                                                    <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1 leading-none">
                                                                        <Flame size={11} className="text-amber-500 shrink-0" /> {dishObj.calories || 0} Kcal
                                                                    </span>
                                                                    {dishObj.foodEffectCategory && (
                                                                        <span className="text-[10px] font-black text-red-600 uppercase tracking-wide leading-none">
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
                        </div>

                        {/* Combined Ingredients Summary */}
                        {aggregatedIngredients.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Combined Ingredients Included</span>
                                <div className="flex flex-wrap gap-2">
                                    {aggregatedIngredients.map((ing) => (
                                        <span key={ing} className="px-3.5 py-1.5 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 rounded-xl">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

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
                                    Not Available in Your Area [cite: custom_context]
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