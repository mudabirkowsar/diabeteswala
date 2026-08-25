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
    Trash2
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

    // Check if the current item is already in the user's food cart [cite: custom_context]
    const isItemInCart = foodCart?.items?.some(
        (item) => (item.itemId?._id || item.itemId) === id
    );

    const handleAddToCart = async () => {
        if (!dish) return;
        setAddingToCart(true);
        try {
            const payload = {
                foodId: dish.vendorId?._id || dish.vendorId,
                itemId: dish._id,
                quantity: 1
            };
            const response = await addToFoodCart(payload);
            if (response && response.success) {
                if (showNotification) {
                    showNotification(response.message || `${dish.name} added to tray successfully!`, "success");
                }
                // Redirect user to food cart on success
                router.push('/otherscreens/carts/foodcart');
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
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border bg-white ${
                isVeg ? 'text-emerald-600 border-emerald-100' : isEgg ? 'text-amber-600 border-amber-100' : isNonVeg ? 'text-rose-600 border-rose-100' : 'text-slate-500 border-slate-100'
            }`}>
                <span className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'}`} />
                {type}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] select-none">
                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Retrieving nutritional formulations...</p>
            </div>
        );
    }

    if (!dish) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fbff] text-center p-8 select-none">
                <AlertCircle className="text-slate-300 mb-4" size={48} />
                <h2 className="text-lg font-bold text-slate-700">Dish Details Not Found</h2>
                <p className="text-sm text-slate-400 mt-1 max-w-sm">We were unable to locate this recipe. It may have been unlisted or moved.</p>
                <button 
                    onClick={() => router.push('/food/nearest')} 
                    className="mt-6 px-6 py-3 bg-[#3d3f96] hover:bg-[#2F3175] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                    Back to Menu
                </button>
            </div>
        );
    }

    const isAvailable = dish.isAvailable !== false && !dish.UnavailableFoodItem; // Dynamic availability checks
    const dishImage = getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE;
    const vendor = dish.vendorId || {};
    const kitchenImage = getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER;

    const ingredientsList = Array.isArray(dish.ingredients) ? dish.ingredients : [];
    const tagsList = Array.isArray(dish.tags) ? dish.tags : [];

    return (
        <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1200px] mx-auto space-y-8 antialiased select-none text-left">
            
            {/* Breadcrumb Back Button */}
            <button 
                onClick={() => router.back()} 
                className="flex items-center gap-2 text-xs font-extrabold text-slate-400 hover:text-[#3d3f96] tracking-wider uppercase transition-colors"
            >
                <ArrowLeft size={16} /> Back to Nearest Dishes
            </button>

            {/* Main Workspace Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* COLUMN A: MEDIA & METRICS */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="relative rounded-[2rem] overflow-hidden shadow-md border border-slate-100 bg-white">
                        <div className="relative aspect-square w-full">
                            <img 
                                src={dishImage} 
                                alt={dish.name} 
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

                            {/* Diet Tag */}
                            <div className="absolute top-4 left-4 z-20">
                                {renderDietBadge(dish.dietType)}
                            </div>
                        </div>
                    </div>

                    {/* Metric Breakdown Panel */}
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                            Recipe Parameters
                        </span>
                        
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                                <Flame className="text-amber-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Calories</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-1">{dish.calories || 0} Kcal</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                                <Clock className="text-indigo-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Prep Time</span>
                                <span className="font-mono font-black text-sm text-slate-800 mt-1">{dish.prepTime || 0} Mins</span>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex flex-col items-center justify-center">
                                <HeartPulse className="text-emerald-500 mb-1" size={18} />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Portion</span>
                                <span className="font-mono font-black text-xs text-slate-800 mt-1 text-center truncate w-full">{dish.servingSize || '1 Person'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMN B: DETAILS & CALLS TO ACTIONS */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
                        
                        {/* Header details */}
                        <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2.5">
                                {dish.foodEffectCategory && (
                                    <span className="text-[10px] font-black uppercase text-red-600 bg-red-50/60 px-3 py-1.5 rounded-xl border border-red-100/50">
                                        {dish.foodEffectCategory}
                                    </span>
                                )}
                                {dish.isPopular && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 border border-amber-100 text-amber-700 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                                        Popular
                                    </span>
                                )}
                                {dish.isRecommended && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl text-[10px] font-bold uppercase tracking-wide">
                                        Recommended
                                    </span>
                                )}
                            </div>

                            {dish.categoryId?.foodCategory && (
                                <p className="text-[10px] font-extrabold text-[#3d3f96] uppercase tracking-widest">
                                    {dish.categoryId.foodCategory}
                                </p>
                            )}

                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                                {dish.name}
                            </h1>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-baseline gap-2.5">
                                    <span className="text-2xl font-black text-slate-900 font-mono">₹{dish.discountPrice || dish.price}</span>
                                    {dish.discountPrice && dish.price !== dish.discountPrice && (
                                        <span className="text-sm text-slate-400 line-through font-mono">₹{dish.price}</span>
                                    )}
                                </div>

                                {dish.spicyLevel && (
                                    <span className="inline-flex items-center text-xs text-slate-500 font-bold bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                                        Spicy: {dish.spicyLevel}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Description</span>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {dish.description}
                            </p>
                        </div>

                        {/* Ingredients */}
                        {ingredientsList.length > 0 && (
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Key Ingredients</span>
                                <div className="flex flex-wrap gap-2">
                                    {ingredientsList.map((ing) => (
                                        <span key={ing} className="px-3.5 py-1.5 bg-slate-50 border border-slate-100 text-xs font-bold text-slate-600 rounded-xl">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tags */}
                        {tagsList.length > 0 && (
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Classifications</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {tagsList.map((tag) => (
                                        <span key={tag} className="px-2.5 py-1 bg-indigo-50/50 text-[#3d3f96] text-[10px] font-bold rounded-lg uppercase tracking-wide">
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
                                            src={getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER} 
                                            alt={vendor.name} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                                        />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide">Prepared By</p>
                                        <p className="text-xs font-black text-slate-800">{vendor.name}</p>
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
                                        className="w-full bg-rose-600 hover:bg-rose-750 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-rose-950/10 cursor-pointer disabled:opacity-75"
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
                            <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">FSSAI Certified Preparation</span>
                            <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                                This meal is hygienically prepared in an audited clean facility strictly following low-GI and dietitian-approved culinary protocols.
                            </span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}