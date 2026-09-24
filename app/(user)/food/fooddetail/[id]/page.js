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
    Plus,
    Minus,
    CheckCircle2,
    Sparkles,
    ChefHat,
    ChevronRight
} from 'lucide-react';

// Import your API service functions, Notification Context & Cart Context
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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=150";

export default function FoodDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { showNotification } = useNotification();
    const { foodCart, addToFoodCart, removeFoodCartItem } = useCart();

    const [dish, setDish] = useState(null);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);

    const fetchDishDetails = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getSinglMealDetailsById(id);
            if (response && response.success) {
                setDish(response.data);
            } else {
                if (showNotification) {
                    showNotification("Unable to load dish details.", "error");
                }
            }
        } catch (err) {
            console.error("Error loading dish details:", err);
            if (showNotification) {
                showNotification("Failed to connect to the product database.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchDishDetails();
        }
    }, [id]);

    // Find cart entry for current item
    const cartItem = foodCart?.items?.find(
        (item) => (item.itemId?._id || item.itemId) === id
    );
    const isItemInCart = Boolean(cartItem);
    const currentQty = cartItem?.quantity || 1;

    const handleAddToCart = async (targetQty = 1) => {
        if (!dish) return;
        setAddingToCart(true);
        try {
            const payload = {
                foodId: dish.vendorId?._id || dish.vendorId,
                itemId: dish._id,
                quantity: targetQty
            };
            const response = await addToFoodCart(payload);
            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || `${dish.name} updated in tray!`, "success");
                }
                if (!isItemInCart) {
                    router.push('/otherscreens/carts/foodcart');
                }
            }
        } catch (err) {
            console.error("Error adding item to cart:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to update food cart.", "error");
            }
        } finally {
            setAddingToCart(false);
        }
    };

    const handleRemoveFromCart = async () => {
        if (!dish) return;
        setAddingToCart(true);
        try {
            const response = await removeFoodCartItem(dish._id);
            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || `${dish.name} removed from your tray.`, "success");
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

    // --- Helper: Render Diet Badge ---
    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isEgg = type === 'Egg';
        const isNonVeg = type === 'Non Veg';

        return (
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm border backdrop-blur-md ${isVeg
                    ? 'text-emerald-700 bg-emerald-50/90 border-emerald-200/80'
                    : isEgg
                        ? 'text-amber-700 bg-amber-50/90 border-amber-200/80'
                        : isNonVeg
                            ? 'text-rose-700 bg-rose-50/90 border-rose-200/80'
                            : 'text-slate-600 bg-slate-50/90 border-slate-200/80'
                }`}>
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isVeg ? 'bg-emerald-400' : isEgg ? 'bg-amber-400' : isNonVeg ? 'bg-rose-400' : 'bg-slate-400'
                        }`} />
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
                        }`} />
                </span>
                {type || 'Dietary Standard'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] select-none p-6">
                <div className="relative flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-[#3d3f96] animate-spin" />
                    <ChefHat className="absolute text-[#3d3f96]" size={24} />
                </div>
                <p className="mt-4 text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">
                    Retrieving Nutritional Formulations...
                </p>
            </div>
        );
    }

    if (!dish) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] text-center p-8 select-none">
                <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-4 border border-rose-100">
                    <AlertCircle className="text-rose-500" size={36} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Dish Details Not Found</h2>
                <p className="text-xs text-slate-500 mt-2 max-w-sm leading-relaxed">
                    We were unable to locate this recipe formulation. It may have been unlisted, sold out, or moved.
                </p>
                <button
                    onClick={() => router.push('/food/nearest')}
                    className="mt-6 px-7 py-3 bg-[#3d3f96] hover:bg-[#2F3175] active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md hover:shadow-indigo-950/20 transition-all duration-200"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    const isAvailable = dish.isAvailable !== false && !dish.UnavailableFoodItem;
    const dishImage = getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE;
    const vendor = dish.vendorId || {};
    const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;

    const ingredientsList = Array.isArray(dish.ingredients) ? dish.ingredients : [];
    const tagsList = Array.isArray(dish.tags) ? dish.tags : [];

    return (
        <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-10 max-w-[1240px] mx-auto space-y-8 antialiased select-none text-left bg-[#f8fbff]">

            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center gap-2 text-xs font-black text-slate-500 hover:text-[#3d3f96] bg-white border border-slate-200/80 px-4 py-2.5 rounded-2xl shadow-xs hover:border-indigo-200 tracking-wider uppercase transition-all duration-200 group cursor-pointer"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Dishes</span>
                </button>

                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200/60">
                        ID: {dish._id ? dish._id.slice(-6) : 'N/A'}
                    </span>
                </div>
            </div>

            {/* Main Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* COLUMN A: MEDIA & METRICS */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Image Box */}
                    <div className="relative rounded-[2.5rem] overflow-hidden shadow-lg border border-slate-200/80 bg-white group">
                        <div className="relative aspect-square w-full overflow-hidden">
                            <img
                                src={dishImage}
                                alt={dish.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

                            {/* Proximity Availability Overlay */}
                            {!isAvailable && (
                                <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
                                    <AlertCircle className="text-rose-500 mb-2" size={36} />
                                    <span className="bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-400">
                                        Currently Unavailable
                                    </span>
                                    <p className="text-slate-300 text-xs mt-2 max-w-xs font-medium">
                                        This kitchen is not operational or out of delivery range.
                                    </p>
                                </div>
                            )}

                            {/* Diet Tag */}
                            <div className="absolute top-5 left-5 z-20">
                                {renderDietBadge(dish.dietType)}
                            </div>

                            {/* Price Pill Tag on Image */}
                            <div className="absolute bottom-5 right-5 z-20 bg-slate-900/90 text-white backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-white/10 flex items-center gap-2">
                                <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">Price</span>
                                <span className="text-lg font-black font-mono text-emerald-400">
                                    ₹{dish.discountPrice || dish.price}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Metric Breakdown Panel */}
                    <div className="bg-white rounded-[2rem] p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                                <Sparkles size={14} className="text-amber-500" /> Recipe Macro Metrics
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md">
                                Per Serving
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-amber-50/50 border border-amber-100/80 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-amber-200 transition-colors">
                                <Flame className="text-amber-500 mb-1" size={20} />
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Calories</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-0.5">{dish.calories || 0} <span className="text-[10px] text-slate-400">Kcal</span></span>
                            </div>

                            <div className="bg-indigo-50/50 border border-indigo-100/80 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-indigo-200 transition-colors">
                                <Clock className="text-indigo-500 mb-1" size={20} />
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Prep Time</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-0.5">{dish.prepTime || 0} <span className="text-[10px] text-slate-400">Mins</span></span>
                            </div>

                            <div className="bg-emerald-50/50 border border-emerald-100/80 p-3.5 rounded-2xl flex flex-col items-center justify-center text-center hover:border-emerald-200 transition-colors">
                                <HeartPulse className="text-emerald-500 mb-1" size={20} />
                                <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wide">Portion</span>
                                <span className="font-mono font-black text-xs text-slate-800 mt-0.5 text-center truncate w-full">{dish.servingSize || '1 Person'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN B: DETAILS & CALLS TO ACTIONS */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">

                        {/* Header details */}
                        <div className="space-y-3.5 border-b border-slate-100 pb-6">
                            <div className="flex flex-wrap items-center gap-2">
                                {dish.foodEffectCategory && (
                                    <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-3 py-1 rounded-xl border border-rose-100">
                                        {dish.foodEffectCategory}
                                    </span>
                                )}
                                {dish.isPopular && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 border border-amber-200/60 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                        <Sparkles size={11} className="text-amber-500" /> Popular
                                    </span>
                                )}
                                {dish.isRecommended && (
                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200/60 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wide">
                                        <CheckCircle2 size={11} className="text-emerald-500" /> Recommended
                                    </span>
                                )}
                            </div>

                            {dish.categoryId?.foodCategory && (
                                <p className="text-[11px] font-black text-[#3d3f96] uppercase tracking-widest flex items-center gap-1.5">
                                    <span>{dish.categoryId.foodCategory}</span>
                                </p>
                            )}

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                                {dish.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                <div className="flex items-baseline gap-2.5 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                                    <span className="text-2xl font-black text-slate-900 font-mono">
                                        ₹{dish.discountPrice || dish.price}
                                    </span>
                                    {dish.discountPrice && dish.price !== dish.discountPrice && (
                                        <span className="text-sm text-slate-400 line-through font-mono">
                                            ₹{dish.price}
                                        </span>
                                    )}
                                </div>

                                {dish.spicyLevel && (
                                    <span className="inline-flex items-center gap-1 text-xs text-slate-600 font-bold bg-slate-50 border border-slate-200/60 px-3 py-2 rounded-2xl">
                                        🌶️ Spicy: <span className="text-slate-900 font-black">{dish.spicyLevel}</span>
                                    </span>
                                )}

                                {dish.distanceText && (
                                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-bold bg-indigo-50/50 border border-indigo-100 px-3 py-2 rounded-2xl">
                                        <MapPin size={14} className="text-[#3d3f96]" />
                                        <span>{dish.distanceText}</span>
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                Overview & Culinary Profile
                            </span>
                            <p className="text-sm text-slate-600 leading-relaxed font-normal">
                                {dish.description || "No specific detailed description supplied for this item."}
                            </p>
                        </div>

                        {/* Ingredients Table */}
                        {ingredientsList.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                        Ingredients Breakdown ({ingredientsList.length})
                                    </span>
                                    {dish.calories > 0 && (
                                        <span className="text-[10px] font-extrabold text-[#3d3f96] bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                                            <Flame size={12} className="text-amber-500" />
                                            {dish.calories} Kcal Total
                                        </span>
                                    )}
                                </div>

                                <div className="overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-xs">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50/90 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                                    <th className="py-3 px-4">Ingredient</th>
                                                    <th className="py-3 px-4 text-center">Quantity</th>
                                                    <th className="py-3 px-4 text-right">Calories</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {ingredientsList.map((ing, idx) => {
                                                    const isObject = typeof ing === 'object' && ing !== null;
                                                    const keyId = isObject ? (ing._id || `${ing.name}-${idx}`) : `${ing}-${idx}`;
                                                    const ingName = isObject ? ing.name : ing;
                                                    const ingQty = isObject ? (ing.quantity || '—') : '—';
                                                    const ingCal = isObject ? (ing.calories !== undefined ? `${ing.calories} Kcal` : '—') : '—';

                                                    return (
                                                        <tr key={keyId} className="hover:bg-slate-50/60 transition-colors">
                                                            <td className="py-3 px-4 font-bold text-slate-800">
                                                                {ingName}
                                                            </td>
                                                            <td className="py-3 px-4 text-center font-medium text-slate-500">
                                                                <span className="bg-slate-100/80 px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-700 border border-slate-200/40">
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
                                                        Total Nutritional Calories
                                                    </td>
                                                    <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                                                        —
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-mono font-black text-xs text-[#3d3f96]">
                                                        {dish.calories || 0} Kcal
                                                    </td>
                                                </tr>
                                            </tfoot>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Classifications / Tags */}
                        {tagsList.length > 0 && (
                            <div className="space-y-2 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Classifications</span>
                                <div className="flex flex-wrap gap-2">
                                    {tagsList.map((tag, idx) => (
                                        <span key={`${tag}-${idx}`} className="px-3 py-1 bg-indigo-50/80 text-[#3d3f96] border border-indigo-100 text-[10px] font-black rounded-xl uppercase tracking-wide">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Partner Cloud Kitchen Details */}
                        {vendor.name && (
                            <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3.5">
                                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/80 overflow-hidden shrink-0 shadow-xs">
                                        <img
                                            src={getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER}
                                            alt={vendor.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                        />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Prepared By Kitchen</span>
                                        <h4 className="text-sm font-black text-slate-800 leading-tight">{vendor.name}</h4>
                                        {vendor.address && (
                                            <p className="text-[11px] text-slate-500 font-medium truncate max-w-[220px] sm:max-w-xs mt-0.5">{vendor.address}</p>
                                        )}
                                    </div>
                                </div>
                                {vendor.rating !== undefined && (
                                    <span className="flex items-center gap-1 bg-amber-50 border border-amber-200/80 text-amber-800 px-3 py-1.5 rounded-xl text-xs font-black shadow-xs shrink-0">
                                        <Star size={13} className="fill-amber-500 text-amber-500" />
                                        {vendor.rating || '0.0'}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Actions Button Bar */}
                        <div className="pt-2">
                            {isAvailable ? (
                                isItemInCart ? (
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            {/* Quantity Adjuster */}
                                            <div className="flex items-center bg-slate-100 rounded-2xl p-1.5 border border-slate-200">
                                                <button
                                                    onClick={() => handleAddToCart(Math.max(1, currentQty - 1))}
                                                    disabled={addingToCart || currentQty <= 1}
                                                    className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 active:scale-95 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-12 text-center font-mono font-black text-slate-800 text-base">
                                                    {currentQty}
                                                </span>
                                                <button
                                                    onClick={() => handleAddToCart(currentQty + 1)}
                                                    disabled={addingToCart}
                                                    className="w-10 h-10 rounded-xl bg-white text-slate-700 flex items-center justify-center font-bold hover:bg-slate-50 active:scale-95 disabled:opacity-40 transition-all shadow-xs cursor-pointer"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                onClick={handleRemoveFromCart}
                                                disabled={addingToCart}
                                                className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200/80 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                                            >
                                                {addingToCart ? (
                                                    <Loader2 size={16} className="animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} />
                                                )}
                                                <span>Remove From Tray</span>
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => router.push('/otherscreens/carts/foodcart')}
                                            className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer active:scale-98"
                                        >
                                            <span>View Food Tray & Checkout</span>
                                            <ChevronRight size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleAddToCart(1)}
                                        disabled={addingToCart}
                                        className="w-full bg-[#3d3f96] hover:bg-[#2F3175] active:scale-98 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer disabled:opacity-75"
                                    >
                                        {addingToCart ? (
                                            <Loader2 size={18} className="animate-spin text-white" />
                                        ) : (
                                            <ShoppingBag size={18} />
                                        )}
                                        <span>Add to Food Tray</span>
                                    </button>
                                )
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm uppercase tracking-wider border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed"
                                >
                                    <AlertCircle size={18} />
                                    Not Available in Your Area
                                </button>
                            )}
                        </div>

                    </div>

                    {/* Certifications Banner */}
                    <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4.5 flex items-start gap-3.5 shadow-xs">
                        <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                        <div className="space-y-1">
                            <span className="text-xs font-black uppercase text-emerald-900 tracking-wide block">
                                FSSAI Certified Preparation
                            </span>
                            <span className="text-xs text-emerald-800/90 font-medium leading-relaxed block">
                                Dynamically prepared in an audited clean facility strictly following low-GI and dietitian-approved culinary protocols.
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}