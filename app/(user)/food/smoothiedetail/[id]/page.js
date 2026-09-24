"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    Flame,
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
    Award,
    Check,
    Leaf
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
    const [cartSuccessAnim, setCartSuccessAnim] = useState(false);
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
                setCartSuccessAnim(true);
                setTimeout(() => setCartSuccessAnim(false), 1200);
                if (showNotification) {
                    showNotification(response.message || `${drink.name} added to cart!`, "success");
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
                    showNotification(response.message || `${drink.name} removed.`, "success");
                }
            }
        } catch (err) {
            console.error("Error removing item from cart:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to remove item.", "error");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    const renderDietBadge = (type) => {
        const isVegan = type === 'Vegan';
        const isVeg = type === 'Veg';
        const isNonVeg = type === 'Non Veg';

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                isVegan
                    ? 'bg-emerald-500/90 text-white border-emerald-400/40 shadow-xs'
                    : isVeg
                        ? 'bg-green-600/90 text-white border-green-400/40 shadow-xs'
                        : isNonVeg
                            ? 'bg-rose-500/90 text-white border-rose-400/40 shadow-xs'
                            : 'bg-slate-800/80 text-white border-white/20'
                }`}>
                <Leaf size={10} className="fill-white" />
                {type || 'Vegan'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 select-none">
                <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-rose-500/20 animate-pulse">
                        <GlassWater size={22} />
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
                    Retrieving Smoothie Details...
                </p>
            </div>
        );
    }

    if (!drink) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/50 text-center p-6 select-none">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 mb-3 shadow-xs">
                    <AlertCircle size={24} />
                </div>
                <h2 className="text-base font-bold text-slate-800">Smoothie Not Found</h2>
                <p className="text-[11px] text-slate-400 mt-1 max-w-xs font-medium">This drink is unavailable or may have been unlisted.</p>
                <button
                    onClick={() => router.push('/food/smoothies')}
                    className="mt-5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer"
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
        <div className="min-h-screen py-6 px-3 sm:px-5 lg:px-8 max-w-[1100px] mx-auto space-y-5 antialiased select-none text-left relative bg-slate-50/60">

            {/* Subtle Gradient Glow Backgrounds */}
            <div className="absolute top-8 left-10 w-64 h-64 bg-rose-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute top-1/3 right-8 w-56 h-56 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none" />

            {/* Compact Back Button */}
            <button
                onClick={() => router.back()}
                className="group inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 hover:text-indigo-600 tracking-wide uppercase transition-colors cursor-pointer bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-200/70 shadow-2xs hover:shadow-xs"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                <span>Back</span>
            </button>

            {/* Main Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start relative z-10">

                {/* LEFT COLUMN: MEDIA & STATS */}
                <div className="lg:col-span-5 space-y-4">

                    {/* Compact Image Container */}
                    <div className="relative rounded-3xl overflow-hidden shadow-xs border border-white bg-white p-2">
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900">
                            <img
                                src={activeImage}
                                alt={drink.name}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />

                            {!isAvailable && (
                                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-20">
                                    <span className="bg-rose-600 text-white text-[10px] font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-xl shadow-md border border-rose-400/30">
                                        Unavailable
                                    </span>
                                </div>
                            )}

                            <div className="absolute top-3 left-3 z-20">
                                {renderDietBadge(drink.dietType)}
                            </div>
                        </div>

                        {/* Thumbnail Selector */}
                        {imagesList.length > 1 && (
                            <div className="pt-2 px-1 flex items-center gap-2 overflow-x-auto no-scrollbar">
                                {imagesList.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveImageIdx(idx)}
                                        className={`relative w-12 h-12 rounded-xl overflow-hidden border transition-all cursor-pointer ${
                                            activeImageIdx === idx
                                                ? 'border-indigo-600 ring-2 ring-indigo-600/20 scale-105'
                                                : 'border-slate-100 opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        <img
                                            src={getMediaUrl(img) || PLACEHOLDER_IMAGE}
                                            alt={`thumb-${idx}`}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Modernized Compact Metrics */}
                    <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200/60 shadow-2xs space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider">
                                Nutritional Breakdown
                            </span>
                            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                Verified Intake
                            </span>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            <div className="bg-amber-50/60 border border-amber-200/40 p-2 rounded-xl flex flex-col items-center text-center">
                                <Flame className="text-amber-500 fill-amber-500 mb-0.5" size={15} />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Calories</span>
                                <span className="font-mono font-bold text-xs text-slate-800 mt-0.5">{drink.calories || 0} Cal</span>
                            </div>

                            <div className="bg-sky-50/60 border border-sky-200/40 p-2 rounded-xl flex flex-col items-center text-center">
                                <Droplets className="text-sky-500 mb-0.5" size={15} />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Sugar</span>
                                <span className="font-mono font-bold text-xs text-sky-700 mt-0.5">
                                    {drink.sugar !== undefined ? `${drink.sugar}g` : '0g'}
                                </span>
                            </div>

                            <div className="bg-indigo-50/60 border border-indigo-200/40 p-2 rounded-xl flex flex-col items-center text-center">
                                <Clock className="text-indigo-500 mb-0.5" size={15} />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Time</span>
                                <span className="font-mono font-bold text-xs text-slate-800 mt-0.5">{drink.prepTime || 10} m</span>
                            </div>

                            <div className="bg-emerald-50/60 border border-emerald-200/40 p-2 rounded-xl flex flex-col items-center text-center">
                                <GlassWater className="text-emerald-500 mb-0.5" size={15} />
                                <span className="text-[8px] font-bold text-slate-400 uppercase">Volume</span>
                                <span className="font-mono font-bold text-[10px] text-slate-800 mt-0.5 truncate w-full">
                                    {drink.servingSize || '350ml'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: DETAILS & ACTIONS */}
                <div className="lg:col-span-7 space-y-4">
                    <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-slate-200/60 shadow-2xs space-y-4">

                        {/* Title & Badges Header */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                                {drink.foodEffectCategory && (
                                    <span className="text-[9px] font-extrabold uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-lg border border-rose-100">
                                        {drink.foodEffectCategory}
                                    </span>
                                )}
                                {drink.isPopular && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 border border-amber-200/50 text-amber-700 rounded-lg text-[9px] font-bold uppercase">
                                        <Sparkles size={10} className="fill-amber-500" /> Popular
                                    </span>
                                )}
                                {drink.isRecommended && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 border border-emerald-200/50 text-emerald-700 rounded-lg text-[9px] font-bold uppercase">
                                        <Award size={10} /> Recommended
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-2 py-0.5 rounded">
                                    {drink.drinkType || "Smoothie"}
                                </span>
                                {drink.categoryId?.foodCategory && (
                                    <>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                            {drink.categoryId.foodCategory}
                                        </span>
                                    </>
                                )}
                            </div>

                            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                                {drink.name}
                            </h1>

                            <div className="flex items-center gap-3 pt-1">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl font-black text-slate-900 font-mono">
                                        ₹{drink.discountPrice || drink.price}
                                    </span>
                                    {drink.discountPrice && drink.price !== drink.discountPrice && (
                                        <span className="text-xs text-slate-400 line-through font-mono font-medium">
                                            ₹{drink.price}
                                        </span>
                                    )}
                                </div>

                                {drink.distanceText && (
                                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-lg">
                                        <MapPin size={12} className="text-rose-500" />
                                        {drink.distanceText}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-1 pt-2 border-t border-slate-100">
                            <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Description</span>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                {drink.description}
                            </p>
                        </div>

                        {/* Ingredients Table */}
                        {ingredientsList.length > 0 && (
                            <div className="space-y-2 pt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">
                                        Recipe Formula ({ingredientsList.length})
                                    </span>
                                    {drink.calories > 0 && (
                                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1">
                                            <Flame size={10} className="text-amber-500 fill-amber-500" />
                                            {drink.calories} Cal Total
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-hidden border border-slate-200/60 rounded-xl bg-white shadow-2xs">
                                    <table className="w-full text-left text-xs border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-400 font-bold uppercase text-[8px] tracking-wider border-b border-slate-100">
                                                <th className="py-2 px-3">Ingredient</th>
                                                <th className="py-2 px-3 text-center">Portion</th>
                                                <th className="py-2 px-3 text-right">Calories</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-slate-700">
                                            {ingredientsList.map((ing, idx) => {
                                                const isObject = typeof ing === 'object' && ing !== null;
                                                const keyId = isObject ? (ing._id || `${ing.name}-${idx}`) : `${ing}-${idx}`;
                                                const ingName = isObject ? ing.name : ing;
                                                const ingQty = isObject ? (ing.quantity ? `${ing.quantity}g/ml` : '—') : '—';
                                                const ingCal = isObject ? (ing.calories !== undefined ? `${ing.calories} Cal` : '—') : '—';

                                                return (
                                                    <tr key={keyId} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="py-2 px-3 text-[11px] font-semibold text-slate-800">
                                                            {ingName}
                                                        </td>
                                                        <td className="py-2 px-3 text-center text-[10px] font-medium text-slate-500">
                                                            <span className="bg-slate-100 px-2 py-0.5 rounded text-[9px] font-bold text-slate-600">
                                                                {ingQty}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-600 text-[11px]">
                                                            {ingCal}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Filter Tags */}
                        {tagsList.length > 0 && (
                            <div className="space-y-1.5 pt-1">
                                <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">Tags</span>
                                <div className="flex flex-wrap gap-1">
                                    {tagsList.map((tag, idx) => (
                                        <span key={`${tag}-${idx}`} className="px-2.5 py-0.5 bg-slate-100 text-indigo-700 text-[9px] font-bold rounded-lg uppercase tracking-wider border border-slate-200/50">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Cloud Kitchen Details */}
                        {vendor.name && (
                            <div className="bg-slate-50/80 border border-slate-200/60 p-3 rounded-xl flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 shadow-2xs">
                                        <img
                                            src={kitchenImage}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[8px] font-extrabold uppercase text-slate-400 tracking-wider">Blended By</p>
                                        <p className="text-xs font-bold text-slate-800">{vendor.name}</p>
                                        {vendor.address && (
                                            <p className="text-[9px] text-slate-400 font-medium truncate max-w-[180px]">{vendor.address}</p>
                                        )}
                                    </div>
                                </div>
                                {vendor.rating !== undefined && (
                                    <span className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/60 text-amber-800 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-2xs">
                                        <Star size={11} className="fill-amber-500 text-amber-500" /> {vendor.rating || '0.0'}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Action Buttons with Animations */}
                        <div className="pt-2">
                            {isAvailable ? (
                                isItemInCart ? (
                                    <button
                                        onClick={handleRemoveFromCart}
                                        disabled={addingToCart}
                                        className="w-full bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-rose-500/20 active:scale-95 cursor-pointer disabled:opacity-75"
                                    >
                                        {addingToCart ? (
                                            <Loader2 size={16} className="animate-spin text-white" />
                                        ) : (
                                            <Trash2 size={16} className="transition-transform group-hover:rotate-12" />
                                        )}
                                        <span>Remove from Cart</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={addingToCart}
                                        className={`w-full relative overflow-hidden bg-gradient-to-r from-rose-500 via-pink-500 to-indigo-600 hover:opacity-95 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-md shadow-rose-500/20 active:scale-95 cursor-pointer disabled:opacity-75 ${
                                            cartSuccessAnim ? 'scale-98 ring-2 ring-emerald-400' : ''
                                        }`}
                                    >
                                        {addingToCart ? (
                                            <Loader2 size={16} className="animate-spin text-white" />
                                        ) : cartSuccessAnim ? (
                                            <Check size={16} className="animate-bounce text-emerald-300" />
                                        ) : (
                                            <ShoppingBag size={16} className="transition-transform group-hover:-translate-y-0.5" />
                                        )}
                                        <span>{cartSuccessAnim ? "Added to Cart!" : "Add to Cart"}</span>
                                    </button>
                                )
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-slate-100 text-slate-400 py-3 rounded-xl font-bold text-xs uppercase tracking-wider border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <AlertCircle size={16} />
                                    Not Available Nearby
                                </button>
                            )}
                        </div>

                    </div>

                    {/* FSSAI Hygiene Banner */}
                    <div className="bg-emerald-50/70 border border-emerald-200/50 rounded-2xl p-3 flex items-center gap-3 shadow-2xs">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <ShieldCheck size={16} />
                        </div>
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wide block">
                                FSSAI Certified Hygiene
                            </span>
                            <span className="text-[10px] text-emerald-800/90 font-medium leading-snug block">
                                Blended live in audited facilities following strict zero-preservative health protocols.
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}