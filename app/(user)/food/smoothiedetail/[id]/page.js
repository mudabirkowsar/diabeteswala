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
    Trash2,
    MapPin,
    Droplets,
    GlassWater,
    Sparkles,
    Activity,
    Award,
    CheckCircle2
} from 'lucide-react';

// API Service, Notification Context & Cart Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';
import { useCart } from '../../../../context/CartContext';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function SmoothieDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();
    const { foodCart, addToFoodCart, removeFoodCartItem } = useCart();

    const [drink, setDrink] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    const fetchDrinkDetails = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getDrinkDetails(id);
            if (response && response.success && response.data) {
                setDrink(response.data);
            } else {
                if (showNotification) {
                    showNotification("Unable to load drink details.", "error");
                }
            }
        } catch (err) {
            console.error("Error loading smoothie details:", err);
            if (showNotification) {
                showNotification("Failed to connect to the product database.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDrinkDetails();
        }
    }, [id]);

    // Check if the current drink is already in the user's cart
    const isItemInCart = foodCart?.items?.some(
        (item) => (item.itemId?._id || item.itemId) === id
    );

    const handleAddToCart = async () => {
        if (!drink) return;
        setAddingToCart(true);
        try {
            const payload = {
                foodId: drink.vendorId?._id || drink.vendorId,
                itemId: drink._id,
                quantity: 1
            };
            const response = await addToFoodCart(payload);
            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || `${drink.name} added to cart successfully!`, "success");
                }
                router.push('/otherscreens/carts/foodcart');
            }
        } catch (err) {
            console.error("Error adding item to cart:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to update cart.", "error");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    const handleRemoveFromCart = async () => {
        if (!drink) return;
        setAddingToCart(true);
        try {
            const response = await removeFoodCartItem(drink._id);
            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || `${drink.name} removed from your cart.`, "success");
                }
            }
        } catch (err) {
            console.error("Error removing item from cart:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to remove item from cart.", "error");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    // Helper: Render Diet Badge
    const renderDietBadge = (type) => {
        const isVegan = type === 'Vegan';
        const isVeg = type === 'Veg';
        const isNonVeg = type === 'Non Veg';

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border bg-white ${isVegan
                    ? 'text-emerald-600 border-emerald-100'
                    : isVeg
                        ? 'text-green-600 border-green-100'
                        : isNonVeg
                            ? 'text-rose-600 border-rose-100'
                            : 'text-slate-500 border-slate-100'
                }`}>
                <span className={`w-2 h-2 rounded-full ${isVegan ? 'bg-emerald-500' : isVeg ? 'bg-green-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'}`} />
                {type || 'Vegan'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] select-none">
                <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-3">
                    Retrieving cold-pressed formulation...
                </p>
            </div>
        );
    }

    if (!drink) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] text-center p-8 select-none">
                <AlertCircle className="text-slate-300 mb-4" size={48} />
                <h2 className="text-lg font-bold text-slate-700">Smoothie Details Not Found</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">We were unable to locate this drink. It may have been unlisted or moved.</p>
                <button
                    onClick={() => router.push('/food/smoothies')}
                    className="mt-6 px-6 py-3 bg-[#3d3f96] hover:bg-[#2F3175] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                    Back to Smoothies
                </button>
            </div>
        );
    }

    const isAvailable = drink.isAvailable !== false && !drink.UnavailableDrink;
    const imagesList = Array.isArray(drink.images) && drink.images.length > 0
        ? drink.images
        : [PLACEHOLDER_IMAGE];

    const activeImage = getMediaUrl(imagesList[activeImageIdx]) || PLACEHOLDER_IMAGE;
    const vendor = drink.vendorId || {};
    const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;

    const ingredientsList = Array.isArray(drink.ingredients) ? drink.ingredients : [];
    const tagsList = Array.isArray(drink.tags) ? drink.tags : [];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-8 antialiased select-none text-left">

            {/* Breadcrumb Back Button */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] tracking-wider uppercase transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} /> Back to Nearest Drinks
            </button>

            {/* Main Workspace Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN A: MEDIA & NUTRITION METRICS */}
                <div className="lg:col-span-5 space-y-6">

                    {/* Primary Image Showcase with Thumbnails */}
                    <div className="relative rounded-[2rem] overflow-hidden shadow-md border border-slate-100 bg-white">
                        <div className="relative aspect-square w-full bg-slate-900">
                            <img
                                src={activeImage}
                                alt={drink.name}
                                className="w-full h-full object-cover transition-all duration-300"
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

                            {/* Diet Tag */}
                            <div className="absolute top-4 left-4 z-20">
                                {renderDietBadge(drink.dietType)}
                            </div>
                        </div>

                        {/* Multi-Image Thumbnails Bar */}
                        {imagesList.length > 1 && (
                            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2.5 overflow-x-auto no-scrollbar">
                                {imagesList.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImageIdx(idx)}
                                        className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${activeImageIdx === idx
                                                ? 'border-[#3d3f96] shadow-md ring-2 ring-[#3d3f96]/20 scale-105'
                                                : 'border-slate-100 opacity-60 hover:opacity-100'
                                            }`}
                                    >
                                        <img
                                            src={getMediaUrl(img) || PLACEHOLDER_IMAGE}
                                            alt={`thumbnail-${idx}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Primary Nutritional Metrics */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Nutritional & Clinical Metrics
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center">
                                <Flame className="text-amber-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Calories</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-1">{drink.calories || 0} Kcal</span>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center">
                                <Droplets className="text-blue-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Total Sugar</span>
                                <span className="font-mono font-black text-sm text-amber-600 mt-1">
                                    {drink.sugar !== undefined ? `${drink.sugar}g` : '0g'}
                                </span>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center">
                                <Clock className="text-indigo-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Prep Time</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-1">{drink.prepTime || 10} Mins</span>
                            </div>

                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-2xl flex flex-col items-center justify-center">
                                <GlassWater className="text-emerald-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Volume</span>
                                <span className="font-mono font-black text-xs text-slate-800 mt-1 text-center truncate w-full">
                                    {drink.servingSize || '350ml'}
                                </span>
                            </div>
                        </div>


                    </div>
                </div>

                {/* COLUMN B: DETAILS & CALLS TO ACTIONS */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">

                        {/* Header Details */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                                {drink.foodEffectCategory && (
                                    <span className="text-[10px] font-black uppercase text-red-600 bg-red-50/60 px-3 py-1.5 rounded-xl border border-red-100/50">
                                        {drink.foodEffectCategory}
                                    </span>
                                )}
                                {drink.isPopular && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                        <Sparkles size={11} className="fill-amber-500" /> Popular
                                    </span>
                                )}
                                {drink.isRecommended && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wide">
                                        <Award size={11} /> Recommended
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-[#3d3f96] uppercase tracking-widest">
                                    {drink.drinkType || "Smoothie"}
                                </span>
                                {drink.categoryId?.foodCategory && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                            {drink.categoryId.foodCategory}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                                {drink.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl font-black text-slate-900 font-mono">
                                        ₹{drink.discountPrice || drink.price}
                                    </span>
                                    {drink.discountPrice && drink.price !== drink.discountPrice && (
                                        <span className="text-sm text-slate-400 line-through font-mono">
                                            ₹{drink.price}
                                        </span>
                                    )}
                                </div>

                                {drink.distanceText && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                        <MapPin size={13} className="text-[#3d3f96]" />
                                        {drink.distanceText}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Description</span>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {drink.description}
                            </p>
                        </div>

                        {/* Ingredients Breakdown Table */}
                        {ingredientsList.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                        Recipe & Ingredients Formula ({ingredientsList.length})
                                    </span>
                                    {drink.calories > 0 && (
                                        <span className="text-[10px] font-extrabold text-[#3d3f96] bg-[#3d3f96]/10 px-2.5 py-1 rounded-lg border border-[#3d3f96]/20 flex items-center gap-1">
                                            <Flame size={12} className="text-amber-500" />
                                            {drink.calories} Kcal Total
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                                    <th className="py-2.5 px-4">Ingredient</th>
                                                    <th className="py-2.5 px-4 text-center">Portion / Qty</th>
                                                    <th className="py-2.5 px-4 text-right">Calories</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {ingredientsList.map((ing, idx) => {
                                                    const isObject = typeof ing === 'object' && ing !== null;
                                                    const keyId = isObject ? (ing._id || `${ing.name}-${idx}`) : `${ing}-${idx}`;
                                                    const ingName = isObject ? ing.name : ing;
                                                    const ingQty = isObject ? (ing.quantity ? `${ing.quantity}g/ml` : '—') : '—';
                                                    const ingCal = isObject ? (ing.calories !== undefined ? `${ing.calories} Kcal` : '—') : '—';

                                                    return (
                                                        <tr key={keyId} className="hover:bg-slate-50/50 transition-colors">
                                                            <td className="py-3 px-4 font-bold text-slate-800">
                                                                {ingName}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-medium text-slate-500">
                                                                <span className="bg-slate-100/70 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-600">
                                                                    {ingQty}
                                                                </span>
                                                            </td>
                                                            <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 text-xs">
                                                                {ingCal}
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                            <tfoot>
                                                <tr className="bg-slate-50 font-bold border-t border-slate-200/80 text-slate-800">
                                                    <td className="py-3 px-4 text-[11px] uppercase tracking-wider text-slate-500">
                                                        Total Calculated Calories
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                                                        —
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-black text-xs text-[#3d3f96]">
                                                        {drink.calories || 0} Kcal
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Search & Health Tags */}
                        {tagsList.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Classifications & Tags</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {tagsList.map((tag, idx) => (
                                        <span key={`${tag}-${idx}`} className="px-2.5 py-1 bg-indigo-50/50 text-[#3d3f96] text-[10px] font-bold rounded-lg uppercase tracking-wide">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Cloud Kitchen Details */}
                        {vendor.name && (
                            <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0">
                                        <img
                                            src={kitchenImage}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide">Blended Live By</p>
                                        <p className="text-xs font-black text-slate-800">{vendor.name}</p>
                                        {vendor.address && (
                                            <p className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{vendor.address}</p>
                                        )}
                                    </div>
                                </div>
                                {vendor.rating !== undefined && (
                                    <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                                        <Star size={13} className="fill-amber-500 text-amber-500" /> {vendor.rating || '0.0'}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Actions Button */}
                        <div className="pt-2">
                            {isAvailable ? (
                                isItemInCart ? (
                                    <button
                                        onClick={handleRemoveFromCart}
                                        disabled={addingToCart}
                                        className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-950/10 cursor-pointer disabled:opacity-75"
                                    >
                                        {addingToCart ? (
                                            <Loader2 size={18} className="animate-spin text-white" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                        <span>Remove from Cart</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer disabled:opacity-75"
                                    >
                                        {addingToCart ? (
                                            <Loader2 size={18} className="animate-spin text-white" />
                                        ) : (
                                            <ShoppingBag size={18} />
                                        )}
                                        <span>Add to Cart</span>
                                    </button>
                                )
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
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">
                                FSSAI Certified Cold-Pressed Hygiene
                            </span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                100% natural, freshly blended in an audited hygienic facility strictly following zero-preservative and dietitian-approved clinical protocols.
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}