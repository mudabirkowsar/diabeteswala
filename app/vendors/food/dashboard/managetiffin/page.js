"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Layers,
    Coffee,
    Sun,
    Moon,
    Search,
    Check,
    X,
    Loader2,
    RotateCcw,
    Sparkles,
    Eye,
    Tag,
    Flame,
    CheckCircle2,
    Utensils,
    Package,
    Save,
    IndianRupee,
    Info,
    Calendar,
    SlidersHorizontal
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import Vendor API Service (adjust path if needed)
import FoodVendorAPI from '../../../../services/FoodVendorAPI';

export default function VendorTiffinInventory() {
    // --- Data & Loading States ---
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [syncing, setSyncing] = useState(false);

    // --- Search & Filters ---
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'INACTIVE'
    const [cycleFilter, setCycleFilter] = useState('ALL'); // 'ALL' | 'Monthly Cycle' | 'Weekly Cycle'

    // --- Custom Pricing Local State Map { [planId]: number } ---
    const [customPricing, setCustomPricing] = useState({});
    const [hasUnsavedPriceChanges, setHasUnsavedPriceChanges] = useState(false);

    // --- Detail Preview Modal State ---
    const [previewPlan, setPreviewPlan] = useState(null);
    const [previewActiveTab, setPreviewActiveTab] = useState('breakfast');

    // --- 1. Fetch Master Tiffin Plans Checklist ---
    const fetchMasterPlans = async () => {
        setLoading(true);
        try {
            const response = await FoodVendorAPI.getVendorMasterTiffinPlans();
            if (response && response.success) {
                const planList = response.data || [];
                setPlans(planList);

                // Initialize custom pricing state map
                const priceMap = {};
                planList.forEach(p => {
                    if (p.customPrice) {
                        priceMap[p._id] = p.customPrice;
                    }
                });
                setCustomPricing(priceMap);
                setHasUnsavedPriceChanges(false);
            } else {
                toast.error("Unable to load master tiffin plans.");
            }
        } catch (err) {
            console.error("Error fetching vendor tiffin inventory:", err);
            toast.error(err.response?.data?.message || "Failed to load tiffin plans checklist.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMasterPlans();
    }, []);

    // --- 2. Instant Single Plan Toggle ---
    const handleInstantToggle = async (planId) => {
        setActionLoadingId(planId);
        try {
            const response = await FoodVendorAPI.toggleVendorTiffinPlan(planId);
            if (response && response.success) {
                setPlans(prev => prev.map(plan =>
                    plan._id === planId
                        ? { ...plan, isAvailable: response.isAvailable !== undefined ? response.isAvailable : !plan.isAvailable }
                        : plan
                ));
                toast.success(response.message || "Tiffin plan status updated.");
            }
        } catch (err) {
            console.error("Error toggling plan:", err);
            toast.error(err.response?.data?.message || "Failed to update plan status.");
        } finally {
            setActionLoadingId(null);
        }
    };

    // --- 3. Handle Custom Price Input Change ---
    const handleCustomPriceChange = (planId, val) => {
        const numericVal = val === '' ? '' : Math.max(0, parseFloat(val) || 0);
        setCustomPricing(prev => ({
            ...prev,
            [planId]: numericVal
        }));
        setHasUnsavedPriceChanges(true);
    };

    // --- 4. Unified Sync (Multi-Select & Custom Prices) ---
    const handleUnifiedSync = async () => {
        setSyncing(true);
        try {
            // Selected active plan IDs
            const activePlanIds = plans.filter(p => p.isAvailable).map(p => p._id);

            // Clean custom pricing payload (only include plans that have a valid custom price)
            const cleanPricing = {};
            Object.entries(customPricing).forEach(([planId, price]) => {
                if (price !== '' && price > 0) {
                    cleanPricing[planId] = Number(price);
                }
            });

            const syncPayload = {
                selectedPlanIds: activePlanIds,
                customPricing: cleanPricing
            };

            const response = await FoodVendorAPI.syncVendorTiffinPlans(syncPayload);
            if (response && response.success) {
                toast.success(response.message || "Tiffin menu synchronized successfully!");
                setHasUnsavedPriceChanges(false);
                fetchMasterPlans();
            }
        } catch (err) {
            console.error("Error syncing tiffin plans:", err);
            toast.error(err.response?.data?.message || "Failed to sync tiffin plans.");
        } finally {
            setSyncing(false);
        }
    };

    // --- Filtered Plans Calculation ---
    const filteredPlans = useMemo(() => {
        return plans.filter(plan => {
            const matchesSearch =
                plan.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plan.planId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                plan.description?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === 'ALL' ||
                (statusFilter === 'ACTIVE' && plan.isAvailable) ||
                (statusFilter === 'INACTIVE' && !plan.isAvailable);

            const matchesCycle =
                cycleFilter === 'ALL' || plan.planCycle === cycleFilter;

            return matchesSearch && matchesStatus && matchesCycle;
        });
    }, [plans, searchQuery, statusFilter, cycleFilter]);

    // Summary counters
    const activeCount = plans.filter(p => p.isAvailable).length;
    const totalCount = plans.length;

    return (
        <div className="max-w-[1600px] mx-auto space-y-7 py-4 pb-16 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/15 flex-shrink-0 shadow-xs">
                        <Layers className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Tiffin Plans Inventory
                            </h1>
                            <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-xs">
                                {activeCount} of {totalCount} Active
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1 max-w-2xl">
                            Activate daily breakfast, lunch, and dinner subscription packages for your kitchen storefront and adjust local pricing overrides.
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchMasterPlans}
                        disabled={loading}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl shadow-xs transition cursor-pointer disabled:opacity-50"
                        title="Reload inventory"
                    >
                        <RotateCcw size={16} className={loading ? "animate-spin text-[#3d3f96]" : ""} />
                    </button>

                    <button
                        onClick={handleUnifiedSync}
                        disabled={syncing || loading}
                        className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                            hasUnsavedPriceChanges
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/20 animate-pulse'
                                : 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/20'
                        } disabled:opacity-50`}
                    >
                        {syncing ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>{hasUnsavedPriceChanges ? 'Save Price Overrides' : 'Synchronize Menu'}</span>
                    </button>
                </div>
            </div>

            {/* --- STATS SUMMARY BAR --- */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Catalog Tiers</span>
                        <strong className="text-2xl font-black text-slate-900 font-mono mt-0.5 block">{totalCount}</strong>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
                        <Layers size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Active On Storefront</span>
                        <strong className="text-2xl font-black text-emerald-600 font-mono mt-0.5 block">{activeCount}</strong>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Inactive / Paused</span>
                        <strong className="text-2xl font-black text-slate-400 font-mono mt-0.5 block">{totalCount - activeCount}</strong>
                    </div>
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <X size={20} />
                    </div>
                </div>
            </div>

            {/* --- SEARCH & FILTER CONTROLS --- */}
            <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search plans by title, cycle, or keyword..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition"
                    />
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Status Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                        {['ALL', 'ACTIVE', 'INACTIVE'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase transition cursor-pointer ${
                                    statusFilter === status
                                        ? 'bg-white text-[#3d3f96] shadow-xs'
                                        : 'text-slate-500 hover:text-slate-900'
                                }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    {/* Cycle Selector */}
                    <select
                        value={cycleFilter}
                        onChange={(e) => setCycleFilter(e.target.value)}
                        className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                    >
                        <option value="ALL">All Cycles</option>
                        <option value="Monthly Cycle">Monthly Cycle</option>
                        <option value="Weekly Cycle">Weekly Cycle</option>
                    </select>
                </div>
            </div>

            {/* --- MASTER PLANS GRID --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-200 shadow-xs">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning kitchen subscription ledger...</p>
                </div>
            ) : filteredPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs border-dashed">
                    <Utensils size={40} className="text-slate-300 mb-3" />
                    <h3 className="text-base font-bold text-slate-700">No Matching Tiffin Plans Found</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">
                        Try resetting your search query or status filter to view available plans.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPlans.map((plan) => {
                        const isProcessing = actionLoadingId === plan._id;
                        const isAvailable = plan.isAvailable === true;

                        const breakfastDishes = plan.slotDishes?.breakfast || [];
                        const lunchDishes = plan.slotDishes?.lunch || [];
                        const dinnerDishes = plan.slotDishes?.dinner || [];
                        const totalDishes = breakfastDishes.length + lunchDishes.length + dinnerDishes.length;

                        const currentCustomPrice = customPricing[plan._id] ?? (plan.customPrice || '');

                        return (
                            <div
                                key={plan._id}
                                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                                    isAvailable
                                        ? 'border-indigo-200/90 ring-2 ring-indigo-50/50'
                                        : 'border-slate-200 opacity-80'
                                }`}
                            >
                                {/* Top Plan Card Header */}
                                <div className="p-6 space-y-4">
                                    
                                    {/* Top Status & Plan ID Row */}
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-lg uppercase">
                                                {plan.planId || plan._id.substring(0, 8)}
                                            </span>
                                            <span className="text-[10px] font-extrabold text-[#3d3f96] bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-lg uppercase">
                                                {plan.planCycle}
                                            </span>
                                        </div>

                                        {/* Instant Toggle Switch */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={isProcessing}
                                                onClick={() => handleInstantToggle(plan._id)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                                    isAvailable ? 'bg-[#00B574]' : 'bg-slate-300'
                                                }`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                        isAvailable ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Plan Title & Description */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-base font-black text-slate-900 leading-snug">
                                                {plan.name}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                            {plan.description || "Portion-accurate balanced dietary subscription tier."}
                                        </p>
                                    </div>

                                    {/* Allowed Slots Row */}
                                    <div className="space-y-1.5 pt-1">
                                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                                            Allowed Meal Slots ({plan.mealsPerDay} / day):
                                        </span>
                                        <div className="flex gap-2 flex-wrap">
                                            {[
                                                { name: "Breakfast", icon: Coffee, count: breakfastDishes.length },
                                                { name: "Lunch", icon: Sun, count: lunchDishes.length },
                                                { name: "Dinner", icon: Moon, count: dinnerDishes.length }
                                            ].map(({ name, icon: Icon, count }) => {
                                                const isAllowed = plan.permittedSlots?.includes(name);
                                                return (
                                                    <span
                                                        key={name}
                                                        className={`px-2.5 py-1 rounded-xl text-[10px] font-extrabold border flex items-center gap-1.5 ${
                                                            isAllowed
                                                                ? 'bg-indigo-50 border-indigo-100 text-[#3d3f96]'
                                                                : 'bg-slate-50 border-slate-100 text-slate-300 line-through'
                                                        }`}
                                                    >
                                                        <Icon size={11} />
                                                        <span>{name} ({count})</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Base Price vs Custom Kitchen Price */}
                                    <div className="bg-slate-50/80 border border-slate-100 p-3.5 rounded-2xl space-y-2">
                                        <div className="flex justify-between items-center text-xs font-bold">
                                            <span className="text-slate-400">Master Base Price:</span>
                                            <span className="font-mono font-bold text-slate-700">₹{plan.price}</span>
                                        </div>

                                        <div className="flex justify-between items-center gap-2 pt-1 border-t border-slate-200/60">
                                            <label className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                                                <IndianRupee size={12} className="text-emerald-600" /> Kitchen Custom Price:
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                placeholder={`₹${plan.price}`}
                                                value={currentCustomPrice}
                                                onChange={(e) => handleCustomPriceChange(plan._id, e.target.value)}
                                                className="w-24 px-2.5 py-1 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-right text-slate-800 focus:outline-none focus:border-[#3d3f96]"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Bottom Action Footer */}
                                <div className="px-6 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-extrabold text-slate-400 uppercase flex items-center gap-1">
                                        <Utensils size={12} /> {totalDishes} Catalog Dishes
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPreviewPlan(plan);
                                            setPreviewActiveTab(plan.permittedSlots?.[0]?.toLowerCase() || 'breakfast');
                                        }}
                                        className="text-xs font-black text-[#3d3f96] hover:text-[#2d2f75] flex items-center gap-1 cursor-pointer transition hover:underline"
                                    >
                                        <Eye size={13} />
                                        <span>View Dishes</span>
                                    </button>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- PREVIEW DISHES POOL MODAL --- */}
            {previewPlan && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col text-left space-y-5">
                        
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 pr-10">
                            <div>
                                <span className="text-[10px] font-black uppercase text-[#3d3f96] tracking-wider">
                                    {previewPlan.planId} • {previewPlan.planCycle}
                                </span>
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                    {previewPlan.name}
                                </h3>
                            </div>

                            <button
                                onClick={() => setPreviewPlan(null)}
                                className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Slot Tabs */}
                        <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shrink-0">
                            {['breakfast', 'lunch', 'dinner'].map((slotKey) => {
                                const list = previewPlan.slotDishes?.[slotKey] || [];
                                const isPermitted = previewPlan.permittedSlots?.some(s => s.toLowerCase() === slotKey);
                                const isActive = previewActiveTab === slotKey;

                                return (
                                    <button
                                        key={slotKey}
                                        type="button"
                                        onClick={() => setPreviewActiveTab(slotKey)}
                                        className={`flex-1 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                            isActive
                                                ? 'bg-white text-[#3d3f96] shadow-xs'
                                                : 'text-slate-500 hover:text-slate-900'
                                        }`}
                                    >
                                        <span>{slotKey}</span>
                                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                            isActive ? 'bg-indigo-50 text-[#3d3f96]' : 'bg-slate-200 text-slate-600'
                                        }`}>
                                            {list.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Dishes List */}
                        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 [&::-webkit-scrollbar]:hidden">
                            {(previewPlan.slotDishes?.[previewActiveTab] || []).length === 0 ? (
                                <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Utensils size={24} className="mx-auto text-slate-300 mb-2" />
                                    <p className="text-xs font-bold text-slate-500">No dishes mapped under {previewActiveTab} slot</p>
                                </div>
                            ) : (
                                (previewPlan.slotDishes?.[previewActiveTab] || []).map((entry, idx) => {
                                    const dish = entry.itemId || {};
                                    const isCombo = entry.itemType === 'FoodComboOffer';
                                    const isVeg = dish.dietType === 'Veg';

                                    return (
                                        <div
                                            key={dish._id || idx}
                                            className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/60 flex items-center justify-between gap-3 text-xs"
                                        >
                                            <div className="space-y-0.5 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    {isCombo ? (
                                                        <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                                                            <Package size={10} /> Combo Pack
                                                        </span>
                                                    ) : (
                                                        <div className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-[1px] bg-white shrink-0 ${
                                                            isVeg ? 'border-emerald-500' : 'border-rose-500'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        </div>
                                                    )}
                                                    <strong className="font-extrabold text-slate-900 truncate">{dish.name || "Master Dish Item"}</strong>
                                                </div>
                                                {dish.calories > 0 && (
                                                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1 font-mono pl-5">
                                                        <Flame size={11} /> {dish.calories} kcal
                                                    </span>
                                                )}
                                            </div>

                                            <span className="font-mono font-black text-slate-800 shrink-0">
                                                ₹{dish.discountPrice || dish.price || 0}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Action Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                            <button
                                onClick={() => setPreviewPlan(null)}
                                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase transition cursor-pointer"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}