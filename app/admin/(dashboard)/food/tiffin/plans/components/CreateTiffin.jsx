"use client";

import React, { useState, useEffect } from 'react';
import {
    Utensils,
    X,
    Check,
    Loader2,
    Search,
    AlertCircle,
    Flame,
    Layers,
    IndianRupee,
    Sparkles
} from 'lucide-react';

// Import your API Service (Adjust the relative import path to match your project)
import AdminAPI from '../../../../../../services/AdminAPI';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80";

export default function CreateTiffin({
    isOpen,
    onClose,
    onSuccess, // Callback after successful creation
    initialData = null,
    mode = 'create' // 'create' | 'edit'
}) {
    // --- Dynamic Food Catalog State ---
    const [foodItems, setFoodItems] = useState([]);
    const [loadingDishes, setLoadingDishes] = useState(false);
    const [dishSearch, setDishSearch] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // --- Form Fields (Matching Backend Spec) ---
    const [formName, setFormName] = useState('');
    const [formPlanCycle, setFormPlanCycle] = useState('Monthly Cycle'); // 'Monthly Cycle' | 'Weekly Cycle'
    const [formMealsPerDay, setFormMealsPerDay] = useState(1);
    const [formPrice, setFormPrice] = useState('');
    const [formPermittedSlots, setFormPermittedSlots] = useState(["Breakfast", "Lunch", "Dinner"]);
    const [formDishPool, setFormDishPool] = useState([]); // Array of ObjectIds ['6a85a2d7...', '6a868a42...']
    const [formDesc, setFormDesc] = useState('');

    // --- Fetch Master Dishes from Backend ---
    const fetchAvailableDishes = async () => {
        setLoadingDishes(true);
        try {
            const response = await AdminAPI.getAllFoodItems();
            if (response && response.success) {
                setFoodItems(response.data || []);
            }
        } catch (err) {
            console.error("Error fetching dishes for tiffin pool:", err);
            setErrorMessage("Failed to load master food items directory.");
        } finally {
            setLoadingDishes(false);
        }
    };

    // --- Initial Load on Modal Open ---
    useEffect(() => {
        if (isOpen) {
            fetchAvailableDishes();
            setErrorMessage('');

            if (initialData && mode === 'edit') {
                setFormName(initialData.name || '');
                setFormPlanCycle(initialData.planCycle || 'Monthly Cycle');
                setFormPrice(initialData.price ? initialData.price.toString() : '');
                setFormMealsPerDay(initialData.mealsPerDay || 1);
                setFormPermittedSlots(initialData.permittedSlots || ["Breakfast", "Lunch", "Dinner"]);

                // If dishPool has populated objects, extract their _id
                const poolIds = (initialData.dishPool || []).map(dish =>
                    typeof dish === 'object' ? dish._id : dish
                );
                setFormDishPool(poolIds);
                setFormDesc(initialData.description || '');
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData, mode]);

    const resetForm = () => {
        setFormName('');
        setFormPlanCycle('Monthly Cycle');
        setFormPrice('');
        setFormMealsPerDay(1);
        setFormPermittedSlots(["Breakfast", "Lunch", "Dinner"]);
        setFormDishPool([]);
        setFormDesc('');
        setDishSearch('');
        setErrorMessage('');
    };

    // --- Permitted Slot Checkbox Handler ---
    const handleSlotToggle = (slot) => {
        if (formPermittedSlots.includes(slot)) {
            if (formPermittedSlots.length === 1) {
                setErrorMessage("At least one meal slot must remain permitted.");
                return;
            }
            setFormPermittedSlots(prev => prev.filter(s => s !== slot));
        } else {
            setFormPermittedSlots([...formPermittedSlots, slot]);
        }
    };

    // --- Dish Pool Selection Handler (Stores ObjectId) ---
    const handleDishToggle = (dishId) => {
        setErrorMessage('');
        if (formDishPool.includes(dishId)) {
            setFormDishPool(prev => prev.filter(id => id !== dishId));
        } else {
            setFormDishPool(prev => [...prev, dishId]);
        }
    };

    // --- Form Submit to Backend API ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        // Client-side validations
        if (!formName.trim()) {
            setErrorMessage("Please enter a valid plan name.");
            return;
        }
        if (!formPrice || Number(formPrice) <= 0) {
            setErrorMessage("Please enter a valid subscription price.");
            return;
        }
        if (formPermittedSlots.length === 0) {
            setErrorMessage("Select at least one permitted meal slot.");
            return;
        }
        if (formDishPool.length === 0) {
            setErrorMessage("Please select at least one dish in the selection pool.");
            return;
        }
        if (!formDesc.trim()) {
            setErrorMessage("Please provide a plan description.");
            return;
        }

        // Payload formatted strictly as per Backend API specification
        const payload = {
            name: formName.trim(),
            planCycle: formPlanCycle, // 'Monthly Cycle' | 'Weekly Cycle'
            mealsPerDay: parseInt(formMealsPerDay, 10),
            price: parseFloat(formPrice),
            permittedSlots: formPermittedSlots,
            dishPool: formDishPool, // Array of Mongo ObjectIds
            description: formDesc.trim()
        };

        setSubmitting(true);
        try {
            let response;
            if (mode === 'create') {
                response = await AdminAPI.createTiffinPlan(payload);
            } else if (mode === 'edit' && initialData?._id) {
                // If you have an update endpoint
                response = await AdminAPI.updateTiffinPlan?.(initialData._id, payload);
            }

            if (response && (response.success || response.data)) {
                if (onSuccess) {
                    onSuccess(response.data);
                }
                onClose();
            } else {
                setErrorMessage(response?.message || "Failed to create subscription plan.");
            }
        } catch (err) {
            console.error("API Error creating tiffin plan:", err);
            setErrorMessage(err.response?.data?.message || err.message || "Failed to save subscription tier.");
        } finally {
            setSubmitting(false);
        }
    };

    // Filter dishes by search query
    const filteredDishes = foodItems.filter(dish =>
        dish.name?.toLowerCase().includes(dishSearch.toLowerCase()) ||
        dish.foodEffectCategory?.toLowerCase().includes(dishSearch.toLowerCase()) ||
        dish.dietType?.toLowerCase().includes(dishSearch.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl relative flex flex-col text-left">

                {/* Modal Header */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center border border-indigo-100 shadow-xs">
                            <Layers className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                                {mode === 'create' ? 'Create Tiffin Subscription Tier' : 'Update Plan Details'}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Configure cycle, allowed slots, pricing, and master dish catalog
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        disabled={submitting}
                        className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer disabled:opacity-50"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Error Banner */}
                {errorMessage && (
                    <div className="mx-6 sm:mx-8 mt-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0 text-rose-500" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">

                    {/* Plan Name */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                            Plan Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. 1 Meal Anytime Plan"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-indigo-50 transition shadow-xs"
                        />
                    </div>

                    {/* Cycle, Daily Allowance & Price Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                        {/* Plan Cycle */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                Plan Cycle <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formPlanCycle}
                                onChange={(e) => setFormPlanCycle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-indigo-50 cursor-pointer transition shadow-xs"
                            >
                                <option value="Monthly Cycle">Monthly Cycle</option>
                                <option value="Weekly Cycle">Weekly Cycle</option>
                            </select>
                        </div>

                        {/* Meals Per Day */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                Meals Count / Day <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formMealsPerDay}
                                onChange={(e) => setFormMealsPerDay(parseInt(e.target.value, 10))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-indigo-50 cursor-pointer transition shadow-xs"
                            >
                                <option value={1}>1 Meal / Day (Anytime)</option>
                                <option value={2}>2 Meals / Day (Combo)</option>
                                <option value={3}>3 Meals / Day (Full Day Pack)</option>
                            </select>
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                Subscription Price (₹) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">₹</span>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={formPrice}
                                    onChange={(e) => setFormPrice(e.target.value)}
                                    placeholder="e.g. 1800"
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-indigo-50 font-mono transition shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permitted Slots Selection */}
                    <div className="space-y-2 pt-1">
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500">
                            Permitted Meal Slots <span className="text-rose-500">*</span>
                        </label>
                        <div className="flex gap-3 flex-wrap">
                            {["Breakfast", "Lunch", "Dinner"].map((slot) => {
                                const isSelected = formPermittedSlots.includes(slot);
                                return (
                                    <button
                                        type="button"
                                        key={slot}
                                        onClick={() => handleSlotToggle(slot)}
                                        className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border flex items-center gap-2 cursor-pointer ${isSelected
                                            ? 'bg-[#3D3F96] text-white border-[#3D3F96] shadow-md shadow-indigo-950/15'
                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${isSelected ? 'bg-white text-[#3D3F96] border-white' : 'border-slate-300'
                                            }`}>
                                            {isSelected && <Check size={12} strokeWidth={3} />}
                                        </div>
                                        <span>{slot}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Dish Selection Pool (Master Dish API Integrated) */}
                    <div className="space-y-3 pt-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                    Master Dish Pool <span className="text-rose-500">*</span>
                                </label>
                                <p className="text-[11px] text-slate-400 font-semibold">
                                    Select dishes subscribers are allowed to pick from ({formDishPool.length} selected)
                                </p>
                            </div>

                            {/* Search Filter for Food Items */}
                            <div className="relative min-w-[220px]">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={dishSearch}
                                    onChange={(e) => setDishSearch(e.target.value)}
                                    placeholder="Search food catalog..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3D3F96] focus:bg-white"
                                />
                            </div>
                        </div>

                        {/* Dish Cards Grid */}
                        {loadingDishes ? (
                            <div className="py-16 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                                <Loader2 className="animate-spin text-[#3D3F96] mb-2" size={24} />
                                <span className="text-xs font-bold text-slate-400">Loading master food directory...</span>
                            </div>
                        ) : filteredDishes.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                                <Utensils className="mx-auto text-slate-300 mb-2" size={28} />
                                <p className="text-xs font-bold text-slate-600">No dishes match your search criteria</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-1">
                                {filteredDishes.map((dish) => {
                                    const isChecked = formDishPool.includes(dish._id);
                                    const dishImage = getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE;
                                    const isVeg = dish.dietType === 'Veg';

                                    return (
                                        <div
                                            key={dish._id}
                                            onClick={() => handleDishToggle(dish._id)}
                                            className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-200 relative flex flex-col justify-between bg-white select-none ${isChecked
                                                ? 'border-[#3D3F96] ring-2 ring-indigo-50 shadow-md scale-[1.01]'
                                                : 'border-slate-200 hover:border-slate-300'
                                                }`}
                                        >
                                            {/* Dish Thumbnail */}
                                            <div className="relative h-20 w-full overflow-hidden bg-slate-100">
                                                <img
                                                    src={dishImage}
                                                    alt={dish.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                                                {/* Diet Type Dot Badge */}
                                                <div className="absolute top-2 left-2 z-10">
                                                    <div className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-[1px] bg-white shadow-xs ${isVeg ? 'border-emerald-500' : 'border-rose-500'
                                                        }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                                                            }`} />
                                                    </div>
                                                </div>

                                                {/* Selected Checkmark Icon */}
                                                {isChecked && (
                                                    <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-1 rounded-full shadow-md z-10 animate-in zoom-in-75">
                                                        <Check size={11} strokeWidth={3.5} />
                                                    </span>
                                                )}

                                                {/* Price pill */}
                                                <div className="absolute bottom-1.5 left-2 text-white font-mono text-[11px] font-black z-10">
                                                    ₹{dish.discountPrice || dish.price}
                                                </div>

                                                {/* Calories info */}
                                                {dish.calories > 0 && (
                                                    <div className="absolute bottom-1.5 right-2 text-amber-300 font-mono text-[10px] font-bold flex items-center gap-0.5 z-10">
                                                        <Flame size={10} /> {dish.calories} kcal
                                                    </div>
                                                )}
                                            </div>

                                            {/* Details */}
                                            <div className="p-2.5 space-y-1">
                                                <h4 className="text-xs font-black text-slate-900 truncate leading-snug" title={dish.name}>
                                                    {dish.name}
                                                </h4>
                                                <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold uppercase">
                                                    <span className="truncate">{dish.foodEffectCategory || "Health Diet"}</span>
                                                    <span className="text-[#3D3F96] font-mono font-bold">
                                                        {isChecked ? 'SELECTED' : '+ ADD'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                            Plan Description <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            required
                            value={formDesc}
                            onChange={(e) => setFormDesc(e.target.value)}
                            placeholder="Detail the portion sizes, daily calorie splits, and dietary strategies of this subscription model..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-indigo-50 resize-none leading-relaxed shadow-xs"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                        <button
                            type="button"
                            disabled={submitting}
                            onClick={onClose}
                            className="px-6 py-3.5 text-xs font-black uppercase tracking-wider text-slate-500 hover:bg-slate-100 rounded-2xl transition cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={submitting || loadingDishes}
                            className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
                        >
                            {submitting && <Loader2 size={14} className="animate-spin text-white" />}
                            <span>{mode === 'create' ? 'Create Custom Tier' : 'Save Plan Updates'}</span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}