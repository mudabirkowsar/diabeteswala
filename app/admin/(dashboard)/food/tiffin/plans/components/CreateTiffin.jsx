"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Utensils,
    X,
    Check,
    Loader2,
    Search,
    AlertCircle,
    Flame,
    Layers,
    Coffee,
    Sun,
    Moon,
    Package,
    Plus,
    Info,
    CheckCircle2
} from 'lucide-react';
import AdminAPI from '../../../../../../services/AdminAPI'; // Adjust path if needed

export default function CreateTiffin({
    isOpen,
    onClose,
    onSuccess,
    initialData = null,
    mode = 'create' // 'create' | 'edit'
}) {
    // --- Dynamic Catalog Pool State ---
    const [catalogItems, setCatalogItems] = useState([]);
    const [loadingCatalog, setLoadingCatalog] = useState(false);
    const [dishSearch, setDishSearch] = useState('');
    const [itemFilterTab, setItemFilterTab] = useState('all'); // 'all' | 'dishes' | 'combos'
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // --- Form States ---
    const [formName, setFormName] = useState('');
    const [formPlanCycle, setFormPlanCycle] = useState('Monthly Cycle');
    const [formMealsPerDay, setFormMealsPerDay] = useState(1);
    const [formPrice, setFormPrice] = useState('');
    const [formPermittedSlots, setFormPermittedSlots] = useState(["Breakfast"]);
    const [formDesc, setFormDesc] = useState('');

    // Active Slot Tab for dish mapping ('breakfast' | 'lunch' | 'dinner')
    const [activeSlotTab, setActiveSlotTab] = useState('breakfast');

    // Slot-wise dishes mapping: { breakfast: [{ itemType, itemId, name }], lunch: [], dinner: [] }
    const [slotDishes, setSlotDishes] = useState({
        breakfast: [],
        lunch: [],
        dinner: []
    });

    // --- 1. Fetch Catalog Pool (Dishes + Combos) ---
    const fetchCatalogPool = useCallback(async (searchQuery = '') => {
        setLoadingCatalog(true);
        try {
            const params = searchQuery ? { search: searchQuery } : {};
            const response = await AdminAPI.getTiffinCatalogPool(params);
            if (response && response.success) {
                const items = response.data?.all || response.data || [];
                setCatalogItems(items);
            }
        } catch (err) {
            console.error("Error loading tiffin catalog pool:", err);
            setErrorMessage("Failed to load active dishes and combo pool.");
        } finally {
            setLoadingCatalog(false);
        }
    }, []);

    // Debounced Search
    useEffect(() => {
        if (!isOpen) return;
        const delayDebounce = setTimeout(() => {
            fetchCatalogPool(dishSearch);
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [dishSearch, fetchCatalogPool, isOpen]);

    // --- 2. Initial Setup on Modal Open / Edit Mode ---
    useEffect(() => {
        if (isOpen) {
            setErrorMessage('');
            fetchCatalogPool('');

            if (initialData && mode === 'edit') {
                setFormName(initialData.name || '');
                setFormPlanCycle(initialData.planCycle || 'Monthly Cycle');
                setFormPrice(initialData.price ? initialData.price.toString() : '');
                
                const mealsCount = initialData.mealsPerDay || 1;
                setFormMealsPerDay(mealsCount);
                
                const permitted = initialData.permittedSlots?.length > 0
                    ? initialData.permittedSlots.slice(0, mealsCount)
                    : ["Breakfast"];
                setFormPermittedSlots(permitted);
                setActiveSlotTab(permitted[0]?.toLowerCase() || 'breakfast');
                setFormDesc(initialData.description || '');

                // Normalize incoming slotDishes
                const normalizedSlots = {
                    breakfast: (initialData.slotDishes?.breakfast || []).map(item => ({
                        itemType: item.itemType || (item.productType === 'FoodComboOffer' ? 'FoodComboOffer' : 'FoodService'),
                        itemId: typeof item.itemId === 'object' ? item.itemId?._id : (item.itemId || item._id),
                        name: item.itemId?.name || item.name
                    })),
                    lunch: (initialData.slotDishes?.lunch || []).map(item => ({
                        itemType: item.itemType || (item.productType === 'FoodComboOffer' ? 'FoodComboOffer' : 'FoodService'),
                        itemId: typeof item.itemId === 'object' ? item.itemId?._id : (item.itemId || item._id),
                        name: item.itemId?.name || item.name
                    })),
                    dinner: (initialData.slotDishes?.dinner || []).map(item => ({
                        itemType: item.itemType || (item.productType === 'FoodComboOffer' ? 'FoodComboOffer' : 'FoodService'),
                        itemId: typeof item.itemId === 'object' ? item.itemId?._id : (item.itemId || item._id),
                        name: item.itemId?.name || item.name
                    }))
                };
                setSlotDishes(normalizedSlots);
            } else {
                resetForm();
            }
        }
    }, [isOpen, initialData, mode, fetchCatalogPool]);

    const resetForm = () => {
        setFormName('');
        setFormPlanCycle('Monthly Cycle');
        setFormPrice('');
        setFormMealsPerDay(1);
        setFormPermittedSlots(["Breakfast"]);
        setActiveSlotTab('breakfast');
        setSlotDishes({ breakfast: [], lunch: [], dinner: [] });
        setFormDesc('');
        setDishSearch('');
        setErrorMessage('');
    };

    // --- 3. Handle Meals Per Day Change ---
    const handleMealsPerDayChange = (count) => {
        setFormMealsPerDay(count);
        setErrorMessage('');

        const allSlots = ["Breakfast", "Lunch", "Dinner"];

        if (count === 1) {
            // Keep only 1 slot
            const currentSlot = formPermittedSlots[0] || "Breakfast";
            setFormPermittedSlots([currentSlot]);
            setActiveSlotTab(currentSlot.toLowerCase());
        } else if (count === 2) {
            // Up to 2 slots
            if (formPermittedSlots.length > 2) {
                const trimmed = formPermittedSlots.slice(0, 2);
                setFormPermittedSlots(trimmed);
                setActiveSlotTab(trimmed[0].toLowerCase());
            } else if (formPermittedSlots.length < 2) {
                const nextSlot = allSlots.find(s => !formPermittedSlots.includes(s)) || "Lunch";
                const updated = [...formPermittedSlots, nextSlot];
                setFormPermittedSlots(updated);
            }
        } else if (count === 3) {
            // All 3 slots
            setFormPermittedSlots(["Breakfast", "Lunch", "Dinner"]);
        }
    };

    // --- 4. Slot Selection Logic based on MealsPerDay ---
    const handleSlotToggle = (slotName) => {
        setErrorMessage('');
        const slotKey = slotName.toLowerCase();

        // 1 MEAL PER DAY: Radio-button style (Select exactly 1)
        if (formMealsPerDay === 1) {
            setFormPermittedSlots([slotName]);
            setActiveSlotTab(slotKey);
            return;
        }

        // 2 MEALS PER DAY: Max 2 slots allowed
        if (formMealsPerDay === 2) {
            if (formPermittedSlots.includes(slotName)) {
                if (formPermittedSlots.length === 1) {
                    setErrorMessage("A 2 Meals/Day plan must have at least 1 permitted slot selected.");
                    return;
                }
                const updated = formPermittedSlots.filter(s => s !== slotName);
                setFormPermittedSlots(updated);
                setSlotDishes(prev => ({ ...prev, [slotKey]: [] }));
                if (activeSlotTab === slotKey) {
                    setActiveSlotTab(updated[0].toLowerCase());
                }
            } else {
                if (formPermittedSlots.length >= 2) {
                    setErrorMessage("You can select a maximum of 2 slots for a 2 Meals/Day plan.");
                    return;
                }
                const updated = [...formPermittedSlots, slotName];
                setFormPermittedSlots(updated);
                setActiveSlotTab(slotKey);
            }
            return;
        }

        // 3 MEALS PER DAY: Up to 3 slots
        if (formMealsPerDay === 3) {
            if (formPermittedSlots.includes(slotName)) {
                if (formPermittedSlots.length === 1) {
                    setErrorMessage("At least one slot must remain selected.");
                    return;
                }
                const updated = formPermittedSlots.filter(s => s !== slotName);
                setFormPermittedSlots(updated);
                setSlotDishes(prev => ({ ...prev, [slotKey]: [] }));
                if (activeSlotTab === slotKey) {
                    setActiveSlotTab(updated[0].toLowerCase());
                }
            } else {
                const updated = [...formPermittedSlots, slotName];
                setFormPermittedSlots(updated);
                setActiveSlotTab(slotKey);
            }
        }
    };

    // --- 5. Toggle Dish/Combo in Active Slot Tab ---
    const handleItemToggleInSlot = (item) => {
        setErrorMessage('');
        const slotKey = activeSlotTab;
        const currentSlotList = slotDishes[slotKey] || [];
        const isAlreadyAdded = currentSlotList.some(i => i.itemId === item._id);

        if (isAlreadyAdded) {
            setSlotDishes(prev => ({
                ...prev,
                [slotKey]: prev[slotKey].filter(i => i.itemId !== item._id)
            }));
        } else {
            const itemType = item.productType === 'FoodComboOffer' ? 'FoodComboOffer' : 'FoodService';
            const newItemEntry = {
                itemType,
                itemId: item._id,
                name: item.name
            };
            setSlotDishes(prev => ({
                ...prev,
                [slotKey]: [...prev[slotKey], newItemEntry]
            }));
        }
    };

    // --- 6. Form Submission ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!formName.trim()) {
            setErrorMessage("Please enter a valid plan name.");
            return;
        }
        if (!formPrice || Number(formPrice) <= 0) {
            setErrorMessage("Please enter a valid subscription price.");
            return;
        }
        if (formPermittedSlots.length === 0) {
            setErrorMessage("Please select at least one permitted meal slot.");
            return;
        }
        if (formPermittedSlots.length > formMealsPerDay) {
            setErrorMessage(`You can only select up to ${formMealsPerDay} meal slot(s) for a ${formMealsPerDay} Meal(s)/Day plan.`);
            return;
        }

        const totalSelectedItems = 
            slotDishes.breakfast.length + 
            slotDishes.lunch.length + 
            slotDishes.dinner.length;

        if (totalSelectedItems === 0) {
            setErrorMessage("Please assign at least one dish or combo pack to your permitted slots.");
            return;
        }

        if (!formDesc.trim()) {
            setErrorMessage("Please provide a plan description.");
            return;
        }

        const payload = {
            name: formName.trim(),
            planCycle: formPlanCycle,
            mealsPerDay: parseInt(formMealsPerDay, 10),
            price: parseFloat(formPrice),
            permittedSlots: formPermittedSlots,
            slotDishes: {
                breakfast: slotDishes.breakfast.map(i => ({ itemType: i.itemType, itemId: i.itemId })),
                lunch: slotDishes.lunch.map(i => ({ itemType: i.itemType, itemId: i.itemId })),
                dinner: slotDishes.dinner.map(i => ({ itemType: i.itemType, itemId: i.itemId }))
            },
            description: formDesc.trim()
        };

        setSubmitting(true);
        try {
            let response;
            if (mode === 'create') {
                response = await AdminAPI.createTiffinPlanTier(payload);
            } else if (mode === 'edit' && (initialData?._id || initialData?.planId)) {
                const targetId = initialData._id || initialData.planId;
                response = await AdminAPI.updateTiffinPlan(targetId, payload);
            }

            if (response && response.success) {
                if (onSuccess) onSuccess(response.data);
                onClose();
            } else {
                setErrorMessage(response?.message || "Failed to save subscription tier.");
            }
        } catch (err) {
            console.error("API Error saving tiffin plan:", err);
            setErrorMessage(err.response?.data?.message || "Failed to save subscription plan tier.");
        } finally {
            setSubmitting(false);
        }
    };

    const filteredCatalog = catalogItems.filter(item => {
        if (itemFilterTab === 'dishes') return item.productType === 'FoodService';
        if (itemFilterTab === 'combos') return item.productType === 'FoodComboOffer';
        return true;
    });

    if (!isOpen) return null;

    const currentSlotDishes = slotDishes[activeSlotTab] || [];

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-4xl w-full max-h-[94vh] overflow-hidden shadow-2xl relative flex flex-col text-left">

                {/* --- Modal Header --- */}
                <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center border border-indigo-100 shadow-xs">
                            <Layers className="w-5 h-5 stroke-[2.2]" />
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                                {mode === 'create' ? 'Create Tiffin Subscription Tier' : 'Update Subscription Plan'}
                            </h3>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">
                                Set daily limits, slot restrictions, pricing, and permitted dishes
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

                {/* --- Error Notification Banner --- */}
                {errorMessage && (
                    <div className="mx-6 sm:mx-8 mt-4 p-3.5 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-600 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0 text-rose-500" />
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* --- Main Form Content --- */}
                <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">

                    {/* 1. Plan Name */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                            Plan Title <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            placeholder="e.g. 1 Meal Daily Executive Lunch Plan"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3D3F96] focus:bg-white focus:ring-4 focus:ring-indigo-50 transition shadow-xs"
                        />
                    </div>

                    {/* 2. Cycle, Meals Per Day & Price Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                Plan Cycle <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formPlanCycle}
                                onChange={(e) => setFormPlanCycle(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white cursor-pointer transition shadow-xs"
                            >
                                <option value="Monthly Cycle">Monthly Cycle (30 Days)</option>
                                <option value="Weekly Cycle">Weekly Cycle (7 Days)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                Daily Meal Allowance <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={formMealsPerDay}
                                onChange={(e) => handleMealsPerDayChange(parseInt(e.target.value, 10))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white cursor-pointer transition shadow-xs"
                            >
                                <option value={1}>1 Meal / Day (Single Slot Only)</option>
                                <option value={2}>2 Meals / Day (Combo Slots)</option>
                                <option value={3}>3 Meals / Day (Full Day Pack)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                                Total Price (₹) <span className="text-rose-500">*</span>
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
                                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white font-mono transition shadow-xs"
                                />
                            </div>
                        </div>
                    </div>

                    {/* 3. Permitted Slots with Dynamic Allowance Indicator */}
                    <div className="space-y-2 pt-1 bg-slate-50/70 p-4 sm:p-5 rounded-3xl border border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
                                Permitted Meal Slots <span className="text-rose-500">*</span>
                            </label>
                            <span className="text-[11px] font-bold text-[#3D3F96] bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
                                Allowed: {formMealsPerDay} slot{formMealsPerDay > 1 ? 's' : ''} (Selected: {formPermittedSlots.length})
                            </span>
                        </div>

                        <p className="text-[11px] text-slate-400 font-medium pb-1">
                            {formMealsPerDay === 1
                                ? "Since this is a 1 Meal/Day plan, you can select only one slot (Breakfast, Lunch, or Dinner)."
                                : `Select up to ${formMealsPerDay} meal slots for this subscription tier.`}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {[
                                { name: "Breakfast", icon: Coffee, desc: "Morning Diet Plan" },
                                { name: "Lunch", icon: Sun, desc: "Midday Balanced Meal" },
                                { name: "Dinner", icon: Moon, desc: "Night Light Nutrition" }
                            ].map(({ name, icon: SlotIcon, desc }) => {
                                const isSelected = formPermittedSlots.includes(name);

                                return (
                                    <button
                                        type="button"
                                        key={name}
                                        onClick={() => handleSlotToggle(name)}
                                        className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                                            isSelected
                                                ? 'bg-[#3D3F96] text-white border-[#3D3F96] shadow-md shadow-indigo-950/15 ring-2 ring-indigo-100'
                                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                                <SlotIcon size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-black leading-tight">{name}</h4>
                                                <p className={`text-[10px] font-semibold mt-0.5 ${
                                                    isSelected ? 'text-indigo-100' : 'text-slate-400'
                                                }`}>
                                                    {desc}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                                            isSelected ? 'bg-white text-[#3D3F96] border-white' : 'border-slate-300 bg-slate-50'
                                        }`}>
                                            {isSelected && <Check size={12} strokeWidth={3.5} />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* 4. Slot-Wise Dishes Pool (NO IMAGES - CLEAN TEXT/BADGE UI) */}
                    <div className="space-y-4 pt-2 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                                    Assigned Dishes & Combo Packs <span className="text-rose-500">*</span>
                                </label>
                                <p className="text-[11px] text-slate-400 font-semibold">
                                    Configure which meals can be ordered under each active slot tab.
                                </p>
                            </div>

                            {/* Slot Tabs */}
                            <div className="flex bg-slate-100 p-1 rounded-2xl gap-1 shrink-0">
                                {formPermittedSlots.map((slotName) => {
                                    const key = slotName.toLowerCase();
                                    const count = slotDishes[key]?.length || 0;
                                    const isActive = activeSlotTab === key;

                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setActiveSlotTab(key)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                                                isActive
                                                    ? 'bg-white text-[#3D3F96] shadow-xs'
                                                    : 'text-slate-500 hover:text-slate-900'
                                            }`}
                                        >
                                            <span>{slotName}</span>
                                            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                                                isActive ? 'bg-indigo-50 text-[#3D3F96]' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Search & Category Filter Controls */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/80 p-2.5 rounded-2xl border border-slate-100">
                            <div className="flex gap-1.5 w-full sm:w-auto">
                                {[
                                    { id: 'all', label: 'All Items' },
                                    { id: 'dishes', label: 'Single Dishes' },
                                    { id: 'combos', label: 'Combo Packs' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setItemFilterTab(tab.id)}
                                        className={`px-3 py-1 text-[11px] font-extrabold rounded-xl transition cursor-pointer ${
                                            itemFilterTab === tab.id
                                                ? 'bg-[#3D3F96] text-white shadow-xs'
                                                : 'text-slate-500 hover:bg-slate-200/60'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </div>

                            <div className="relative w-full sm:w-64">
                                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    value={dishSearch}
                                    onChange={(e) => setDishSearch(e.target.value)}
                                    placeholder="Search food pool..."
                                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3D3F96]"
                                />
                            </div>
                        </div>

                        {/* --- Clean Text-Based Meal Cards Grid --- */}
                        {loadingCatalog ? (
                            <div className="py-14 flex flex-col items-center justify-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                                <Loader2 className="animate-spin text-[#3D3F96] mb-2" size={22} />
                                <span className="text-xs font-bold text-slate-400">Loading catalog items...</span>
                            </div>
                        ) : filteredCatalog.length === 0 ? (
                            <div className="py-12 text-center bg-slate-50/60 rounded-3xl border border-dashed border-slate-200">
                                <Utensils className="mx-auto text-slate-300 mb-2" size={24} />
                                <p className="text-xs font-bold text-slate-600">No dishes or combo packs found</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[290px] overflow-y-auto pr-1">
                                {filteredCatalog.map((item) => {
                                    const isAdded = currentSlotDishes.some(i => i.itemId === item._id);
                                    const isCombo = item.productType === 'FoodComboOffer';
                                    const isVeg = item.dietType === 'Veg';

                                    return (
                                        <div
                                            key={item._id}
                                            onClick={() => handleItemToggleInSlot(item)}
                                            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                                                isAdded
                                                    ? 'bg-indigo-50/40 border-[#3D3F96] shadow-xs'
                                                    : 'bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            {/* Item Overview */}
                                            <div className="space-y-1 min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    {/* Veg / Non-Veg / Combo Icon */}
                                                    {isCombo ? (
                                                        <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                                                            <Package size={10} /> Combo
                                                        </span>
                                                    ) : (
                                                        <div className={`w-3.5 h-3.5 border-2 rounded flex items-center justify-center p-[1px] bg-white shrink-0 ${
                                                            isVeg ? 'border-emerald-500' : 'border-rose-500'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                        </div>
                                                    )}

                                                    <h4 className="text-xs font-black text-slate-900 truncate" title={item.name}>
                                                        {item.name}
                                                    </h4>
                                                </div>

                                                {/* Meta Info Badges */}
                                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                    <span className="text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                        {item.foodEffectCategory || "Health Diet"}
                                                    </span>
                                                    {item.calories > 0 && (
                                                        <span className="flex items-center gap-0.5 text-amber-600 font-mono">
                                                            <Flame size={11} /> {item.calories} kcal
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Price & Selection Checkbox Button */}
                                            <div className="flex items-center gap-3 shrink-0">
                                                <span className="font-mono text-xs font-black text-slate-800">
                                                    ₹{item.price || item.discountPrice}
                                                </span>

                                                <div className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all ${
                                                    isAdded
                                                        ? 'bg-[#3D3F96] text-white border-[#3D3F96] shadow-xs'
                                                        : 'border-slate-300 bg-slate-50 text-transparent hover:border-slate-400'
                                                }`}>
                                                    <Check size={13} strokeWidth={3.5} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 5. Plan Description */}
                    <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
                            Plan Description & Guidelines <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                            rows={3}
                            required
                            value={formDesc}
                            onChange={(e) => setFormDesc(e.target.value)}
                            placeholder="Detail portion sizes, daily calorie breakdown, nutritional guidelines, and dispatch schedules..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:bg-white resize-none leading-relaxed shadow-xs"
                        />
                    </div>

                    {/* --- Action Buttons Footer --- */}
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
                            disabled={submitting || loadingCatalog}
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