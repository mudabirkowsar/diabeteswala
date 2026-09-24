"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    MapPin,
    Clock,
    Flame,
    Search,
    Loader2,
    Utensils,
    ChevronRight,
    ArrowRight,
    ShieldCheck,
    Sparkles,
    ChefHat,
    Compass
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function NearestMeal() {
    const router = useRouter();
    const { showNotification } = useNotification();

    // --- Data & Loading States ---
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radiusText, setRadiusText] = useState();
    const [coords, setCoords] = useState({});

    // --- Filtering & Search States ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Egg', 'Non Veg'
    const [selectedFocus, setSelectedFocus] = useState('All');

    // --- Retrieve Stored Coords on Mount ---
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

    // --- Fetch Nearest Meals from Backend ---
    const fetchNearestMeals = async (targetCoords) => {
        setLoading(true);
        const locationPayload = targetCoords || coords;
        try {
            const response = await UserAPI.getNearestGeolocatedMeals(locationPayload);
            if (response && response.success) {
                setMeals(response.data || []);
                if (response.maxDistanceLimitApplied) {
                    setRadiusText(response.maxDistanceLimitApplied);
                }
            } else {
                if (showNotification) {
                    showNotification("Unable to find serviceable kitchens in this area.", "error");
                }
            }
        } catch (err) {
            console.error("Error fetching nearest meals:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to load nearby meals.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const initialCoords = getInitialCoords();
        setCoords(initialCoords);
        fetchNearestMeals(initialCoords);
    }, []);

    // --- Card Click Navigation ---
    const handleMealClick = (id) => {
        if (!id) return;
        router.push(`/food/fooddetail/${id}`);
    };

    // --- Navigate to View All Page ---
    const handleViewAll = () => {
        router.push('/food/all');
    };

    // --- Helper: Render Diet Badge ---
    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isEgg = type === 'Egg';
        const isNonVeg = type === 'Non Veg';

        return (
            <div
                className={`w-5 h-5 border-2 rounded-md flex items-center justify-center p-[2px] shrink-0 bg-white/95 shadow-sm backdrop-blur-md ${
                    isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
                }`}
                title={type || 'Standard'}
            >
                <span
                    className={`w-2 h-2 rounded-full ${
                        isVeg ? 'bg-emerald-500 animate-pulse' : isEgg ? 'bg-amber-500 animate-pulse' : isNonVeg ? 'bg-rose-500 animate-pulse' : 'bg-slate-400'
                    }`}
                />
            </div>
        );
    };

    // --- Filter Matching ---
    const filteredMeals = meals.filter((meal) => {
        const query = searchQuery.toLowerCase().trim();
        const nameMatch = meal.name?.toLowerCase().includes(query);
        const descMatch = meal.description?.toLowerCase().includes(query);
        const vendorMatch = meal.vendorId?.name?.toLowerCase().includes(query);
        const tagMatch = Array.isArray(meal.tags)
            ? meal.tags.some(t => t.toLowerCase().includes(query))
            : false;

        const matchesSearch = query === '' || nameMatch || descMatch || vendorMatch || tagMatch;
        const matchesDiet = selectedDietType === 'All' || meal.dietType === selectedDietType;
        const matchesFocus = selectedFocus === 'All' || meal.foodEffectCategory === selectedFocus;

        return matchesSearch && matchesDiet && matchesFocus;
    });

    // Take max 8 cards for horizontal display
    const visibleMeals = filteredMeals.slice(0, 8);

    return (
        <div className="relative w-full bg-gradient-to-b from-indigo-50/70 via-rose-50/20 to-white pt-8 pb-12 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto antialiased select-none text-left rounded-[3rem] border border-indigo-100/40 shadow-xs overflow-hidden my-4">
            
            {/* Ambient Background Gradient Glows */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-200/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 -right-24 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl pointer-events-none" />

            {/* Section Header & View All Button */}
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 border border-pink-100 text-[#3d3f96] text-[10px] font-black rounded-full uppercase tracking-wider backdrop-blur-md shadow-2xs">
                            <Compass size={12} className="text-[#3d3f96] animate-spin" style={{ animationDuration: '8s' }} />
                            Geolocation Active
                        </span>
                        {radiusText && (
                            <span className="text-[10px] font-bold text-slate-500 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200/60 backdrop-blur-xs">
                                Within {radiusText}
                            </span>
                        )}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Utensils className="text-[#3d3f96]" size={22} />
                        <span>Nearest Kitchen Formulations</span>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Showing closest health kitchen preparations near you.
                    </p>
                </div>

                {/* Diet Filter Quick Switcher + View All */}
                <div className="flex items-center gap-3 self-start sm:self-auto">
                    {/* Diet Filters */}
                    <div className="hidden md:flex items-center gap-1 bg-white/80 p-1 rounded-2xl border border-slate-200/80 backdrop-blur-md shadow-2xs">
                        {['All', 'Veg', 'Egg', 'Non Veg'].map((type) => (
                            <button
                                key={type}
                                onClick={() => setSelectedDietType(type)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black transition-all cursor-pointer ${
                                    selectedDietType === type
                                        ? 'bg-[#3d3f96] text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>

                    {/* View All Button */}
                    <button
                        onClick={handleViewAll}
                        className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2F3175] text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md hover:shadow-indigo-950/20 active:scale-95 cursor-pointer shrink-0"
                    >
                        <span>View All</span>
                        <ArrowRight size={15} />
                    </button>
                </div>
            </div>

            {/* GEOLOCATED MEALS CONTENT */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white/80 rounded-[2.5rem] border border-pink-100/60 shadow-xs backdrop-blur-sm">
                    <div className="relative flex items-center justify-center mb-3">
                        <div className="w-14 h-14 rounded-full border-4 border-pink-100 border-t-[#3d3f96] animate-spin" />
                        <ChefHat className="absolute text-[#3d3f96]" size={22} />
                    </div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
                        Scanning Nearest Kitchens...
                    </p>
                </div>
            ) : visibleMeals.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 text-center bg-white/80 rounded-[2.5rem] border border-pink-100/60 shadow-xs border-dashed backdrop-blur-sm">
                    <div className="w-16 h-16 bg-pink-50/80 rounded-full flex items-center justify-center mb-3 border border-pink-100">
                        <Utensils size={28} className="text-[#3d3f96]" />
                    </div>
                    <h3 className="text-base font-black text-slate-800">No Nearby Dishes Found</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
                        We couldn't locate active meals matching your exact geolocation and filter settings.
                    </p>
                </div>
            ) : (
                /* HORIZONTAL SCROLL CONTAINER (SCROLLBAR HIDDEN) */
                <div className="relative z-10">
                    <div className="flex items-center gap-5 overflow-x-auto pb-4 pt-1 px-1 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {visibleMeals.map((dish) => {
                            const vendor = dish.vendorId || {};
                            const dishImage = getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE;
                            const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;
                            const isAvailable = dish.isAvailable !== false;

                            return (
                                <div
                                    key={dish._id}
                                    onClick={() => handleMealClick(dish._id)}
                                    className={`w-[280px] sm:w-[310px] shrink-0 bg-gradient-to-br from-rose-50/40 via-white to-pink-50/20 rounded-[2rem] border border-pink-100/60 shadow-xs hover:shadow-xl hover:shadow-rose-100/60 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer text-left hover:-translate-y-1.5 hover:border-pink-200/80 ${
                                        isAvailable
                                            ? ''
                                            : 'opacity-60 saturate-[0.25] border-slate-200 shadow-none'
                                    }`}
                                >
                                    {/* Photo Container */}
                                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                                        <img
                                            src={dishImage}
                                            alt={dish.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />

                                        {/* Diet Badge */}
                                        <div className="absolute top-3.5 left-3.5 z-20">
                                            {renderDietBadge(dish.dietType)}
                                        </div>

                                        {/* Distance Pill */}
                                        <div className="absolute top-3.5 right-3.5 bg-slate-900/80 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-black tracking-wide flex items-center gap-1 shadow-md border border-white/10 z-20">
                                            <MapPin size={11} className="text-rose-400 shrink-0" />
                                            <span>{dish.distanceText || `${dish.distance || 0} km`}</span>
                                        </div>

                                        {/* Availability Overlay */}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px] flex items-center justify-center z-10">
                                                <span className="bg-rose-600 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-lg border border-rose-400">
                                                    Unavailable
                                                </span>
                                            </div>
                                        )}

                                        {/* Price Tag Overlay */}
                                        <div className="absolute bottom-3 left-3.5 flex items-baseline gap-2 text-white z-20">
                                            <span className="text-xl font-black font-mono tracking-tight drop-shadow-md text-rose-50">
                                                ₹{dish.discountPrice || dish.price}
                                            </span>
                                            {dish.discountPrice && dish.price !== dish.discountPrice && (
                                                <span className="text-xs text-rose-200/80 line-through font-mono">
                                                    ₹{dish.price}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Body Details */}
                                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                        <div className="space-y-1.5">
                                            {/* Kitchen Vendor Info */}
                                            <div className="flex items-center gap-2 pb-1.5 border-b border-rose-100/50">
                                                <div className="w-5 h-5 rounded-md overflow-hidden bg-slate-100 shrink-0 border border-pink-100">
                                                    <img
                                                        src={kitchenImage}
                                                        alt={vendor.name || "Kitchen"}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                                    />
                                                </div>
                                                <span className="text-[10px] font-extrabold text-slate-500 truncate" title={vendor.name}>
                                                    {vendor.name || "Partner Health Kitchen"}
                                                </span>
                                            </div>

                                            <h3 className="font-black text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                                                {dish.name}
                                            </h3>
                                            <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 font-normal">
                                                {dish.description || "Freshly cooked meal formulated to standard dietary guidelines."}
                                            </p>
                                        </div>

                                        {/* Nutrient & Metric Pills */}
                                        <div className="space-y-2 pt-1">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-slate-700 bg-white/90 p-2 rounded-xl border border-rose-100/60 shadow-2xs">
                                                <span className="flex items-center gap-1 font-mono font-bold">
                                                    <Flame size={12} className="text-amber-500" /> 
                                                    <span>{dish.calories || 0} Kcal</span>
                                                </span>
                                                {dish.prepTime && (
                                                    <span className="flex items-center gap-1 text-slate-500">
                                                        <Clock size={11} className="text-indigo-500" /> 
                                                        <span>{dish.prepTime}m</span>
                                                    </span>
                                                )}
                                                <span className="text-emerald-700 bg-emerald-50/80 border border-emerald-100 px-1.5 py-0.5 rounded-md text-[9px] font-black">
                                                    {dish.servingSize || '1 Person'}
                                                </span>
                                            </div>

                                            {/* Therapeutic Focus & Order Call */}
                                            <div className="flex items-center justify-between pt-0.5">
                                                {dish.foodEffectCategory ? (
                                                    <span className="text-[9px] font-black uppercase text-rose-600 bg-rose-100/60 px-2 py-0.5 rounded-md border border-rose-200/60 truncate max-w-[150px]">
                                                        {dish.foodEffectCategory}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold uppercase text-slate-400">
                                                        Healthy Meal
                                                    </span>
                                                )}
                                                
                                                <span className="text-xs font-black text-[#3d3f96] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                                                    <span>Order</span> 
                                                    <ChevronRight size={14} />
                                                </span>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            );
                        })}

                        {/* End of Horizontal List: Extra "View All" Card */}
                        {filteredMeals.length > 8 && (
                            <div 
                                onClick={handleViewAll}
                                className="w-[200px] shrink-0 h-[380px] bg-gradient-to-br from-rose-50/40 via-white to-pink-50/20 rounded-[2rem] border-2 border-dashed border-rose-200/80 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-rose-50/60 hover:border-[#3d3f96] transition-all group shadow-2xs"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-[#3d3f96] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                                    <ArrowRight size={20} />
                                </div>
                                <span className="text-sm font-black text-slate-800">
                                    View All Dishes
                                </span>
                                <span className="text-[11px] font-semibold text-slate-500 mt-1">
                                    +{filteredMeals.length - 8} More Available
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}