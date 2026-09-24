"use client";

import React, { useState, useEffect } from 'react';
import {
    GlassWater,
    Search,
    Pencil,
    Trash2,
    Inbox,
    Loader2,
    Layers,
    ToggleLeft,
    ToggleRight,
    Flame,
    Sparkles,
    Award,
    Plus
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import AddSmoothie from './components/AddSmoothie';

// Import API functions
import AdminAPI from '../../../../services/AdminAPI';

// Helper for image URLs
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_DRINK_IMAGE = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=150";

export default function ManageDrinksPage() {
    const [categories, setCategories] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [drinks, setDrinks] = useState([]);
    const [loadingDrinks, setLoadingDrinks] = useState(true);
    const [togglingId, setTogglingId] = useState(null);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDrinkType, setSelectedDrinkType] = useState('All');
    const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('All');

    // Diet Switches (Vegan, Veg, Non Veg)
    const [isVeganLive, setIsVeganLive] = useState(true);
    const [isVegLive, setIsVegLive] = useState(true);
    const [isNonVegLive, setIsNonVegLive] = useState(true);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedDrinkForEdit, setSelectedDrinkForEdit] = useState(null);

    // --- Fetch Category Indexes & Health Focuses ---
    const fetchRequirements = async () => {
        try {
            const response = await AdminAPI.getFoodCategories();
            if (response && response.success) {
                const allData = response.data || [];

                const foodCats = allData.filter(item =>
                    item.foodCategory !== null &&
                    item.foodCategory !== undefined &&
                    item.foodCategory !== ""
                );

                const effectCats = allData.filter(item =>
                    item.foodEffectCategory !== null &&
                    item.foodEffectCategory !== undefined &&
                    item.foodEffectCategory !== ""
                );

                setCategories(foodCats);
                setDiseases(effectCats);
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to load categories/therapy targets.");
        }
    };

    // --- Fetch Drinks List with Query Filters ---
    const fetchDrinksList = async () => {
        setLoadingDrinks(true);
        try {
            const params = {
                ...(searchQuery.trim() && { search: searchQuery.trim() }),
                ...(selectedDrinkType !== 'All' && { drinkType: selectedDrinkType }),
                ...(selectedDiseaseFilter !== 'All' && { foodEffectCategory: selectedDiseaseFilter })
            };

            const response = await AdminAPI.getAllDrinks(params);
            if (response && response.success) {
                setDrinks(response.data || []);
            }
        } catch (err) {
            console.error(err);
            toast.error("Error retrieving smoothies & health drinks catalog.");
        } finally {
            setLoadingDrinks(false);
        }
    };

    useEffect(() => {
        fetchRequirements();
    }, []);

    useEffect(() => {
        fetchDrinksList();
    }, [searchQuery, selectedDrinkType, selectedDiseaseFilter]);

    // --- Toggle Drink Status ---
    const toggleDrinkAvailability = async (id) => {
        setTogglingId(id);
        try {
            const response = await AdminAPI.toggleDrinkStatus(id);
            if (response && response.success) {
                toast.success(response.message || "Drink status updated.");
                const newStatus = response.data?.isActive ?? response.isActive;

                setDrinks(prev => prev.map(d => {
                    if (d._id === id) {
                        return {
                            ...d,
                            isActive: newStatus !== undefined ? newStatus : !d.isActive,
                            isAvailable: newStatus !== undefined ? newStatus : !d.isAvailable
                        };
                    }
                    return d;
                }));
            } else {
                toast.error("Failed to update status.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to switch status.");
        } finally {
            setTogglingId(null);
        }
    };

    // --- Delete Drink ---
    const handleDeleteDrink = async (id) => {
        if (!window.confirm("Are you sure you want to permanently delete this drink and its associated images?")) return;
        try {
            const response = await AdminAPI.deleteDrink(id);
            if (response && response.success) {
                toast.success(response.message || "Drink removed successfully.");
                fetchDrinksList();
            }
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete drink.");
        }
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedDrinkForEdit(null);
        setIsModalOpen(true);
    };

    const openEditModal = (drink) => {
        setModalMode('edit');
        setSelectedDrinkForEdit(drink);
        setIsModalOpen(true);
    };

    // Client-side Diet classification filter
    const displayFilteredDrinks = drinks.filter(drink => {
        if (drink.dietType === "Vegan" && !isVeganLive) return false;
        if (drink.dietType === "Veg" && !isVegLive) return false;
        if (drink.dietType === "Non Veg" && !isNonVegLive) return false;
        return true;
    });

    const uncategorizedDrinks = displayFilteredDrinks.filter(d => {
        const parentId = d.categoryId?._id || d.categoryId;
        return !categories.some(c => c._id === parentId);
    });

    const renderDietSymbol = (type) => {
        const colors = {
            Vegan: 'border-emerald-500 text-emerald-500',
            Veg: 'border-green-500 text-green-500',
            'Non Veg': 'border-rose-500 text-rose-500'
        };
        const dotColors = {
            Vegan: 'bg-emerald-500',
            Veg: 'bg-green-500',
            'Non Veg': 'bg-rose-500'
        };

        return (
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 ${colors[type] || 'border-slate-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${dotColors[type] || 'bg-slate-300'}`} />
            </div>
        );
    };

    const formatIngredients = (ingredients) => {
        if (!ingredients) return "None specified";
        if (Array.isArray(ingredients)) {
            return ingredients
                .map(ing => {
                    if (typeof ing === 'object' && ing !== null) {
                        return `${ing.name}${ing.quantity ? ` (${ing.quantity})` : ''}`;
                    }
                    return ing;
                })
                .join(', ');
        }
        return String(ingredients);
    };

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none">
            <Toaster position="top-right" />

            {/* Header section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
                        <GlassWater className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Smoothies & Health Drinks
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Manage cold-pressed juices, protein shakes, sugar contents, and therapeutic targets.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                    >
                        <Plus size={16} />
                        ADD NEW DRINK
                    </button>
                </div>
            </div>

            {/* Clean, Uniform Filters Bar */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                {/* Search Input */}
                <div className="relative w-full xl:w-80 2xl:w-96 shrink-0">
                    <input
                        type="text"
                        placeholder="Search drinks, tags, ingredients..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition-all shadow-sm"
                    />
                    <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" strokeWidth={2.2} />
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                    {/* Health/Therapy Focus Dropdown */}
                    <div className="flex items-center gap-2.5 bg-white px-3.5 py-2 border border-slate-200 rounded-2xl shadow-sm">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Therapy Focus:</span>
                        <select
                            value={selectedDiseaseFilter}
                            onChange={(e) => setSelectedDiseaseFilter(e.target.value)}
                            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                        >
                            <option value="All">🌐 All Profiles</option>
                            {diseases.map(d => (
                                <option key={d._id || d.foodEffectCategory} value={d.foodEffectCategory}>{d.foodEffectCategory}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Dietary Switches (Always Single Row) */}
                <div className="flex items-center gap-3 bg-white p-2.5 sm:px-4 sm:py-2.5 border border-slate-200 rounded-2xl shadow-sm shrink-0 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                        {renderDietSymbol('Vegan')}
                        <span className="text-xs font-bold text-slate-700">Vegan</span>
                        <button
                            type="button"
                            onClick={() => setIsVeganLive(!isVeganLive)}
                            className="focus:outline-none cursor-pointer flex items-center"
                        >
                            {isVeganLive ? <ToggleRight className="text-emerald-500" size={26} /> : <ToggleLeft className="text-slate-300" size={26} />}
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200" />

                    <div className="flex items-center gap-2">
                        {renderDietSymbol('Veg')}
                        <span className="text-xs font-bold text-slate-700">Veg</span>
                        <button
                            type="button"
                            onClick={() => setIsVegLive(!isVegLive)}
                            className="focus:outline-none cursor-pointer flex items-center"
                        >
                            {isVegLive ? <ToggleRight className="text-green-500" size={26} /> : <ToggleLeft className="text-slate-300" size={26} />}
                        </button>
                    </div>

                    <div className="w-px h-6 bg-slate-200" />

                    <div className="flex items-center gap-2">
                        {renderDietSymbol('Non Veg')}
                        <span className="text-xs font-bold text-slate-700">Non-Veg</span>
                        <button
                            type="button"
                            onClick={() => setIsNonVegLive(!isNonVegLive)}
                            className="focus:outline-none cursor-pointer flex items-center"
                        >
                            {isNonVegLive ? <ToggleRight className="text-rose-500" size={26} /> : <ToggleLeft className="text-slate-300" size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Table Display */}
            {loadingDrinks ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading drinks database...</p>
                </div>
            ) : displayFilteredDrinks.length > 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                                    <th className="py-5 px-6">Drink Details</th>
                                    <th className="py-5 px-6">Description & Tags</th>
                                    <th className="py-5 px-6">Pricing</th>
                                    <th className="py-5 px-6">Clinical & Nutrition</th>
                                    <th className="py-5 px-6 text-center">Availability</th>
                                    <th className="py-5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                                {categories.map((cat) => {
                                    const categoryDrinks = displayFilteredDrinks.filter(d => {
                                        const parentId = d.categoryId?._id || d.categoryId;
                                        return parentId === cat._id;
                                    });
                                    if (categoryDrinks.length === 0) return null;
                                    return (
                                        <React.Fragment key={cat._id}>
                                            <tr className="bg-slate-50/80 border-y border-slate-100/60 pointer-events-none">
                                                <td colSpan={6} className="py-4 px-6 text-sm font-black text-[#3d3f96] tracking-tight border-l-4 border-l-[#3d3f96]">
                                                    <div className="flex items-center justify-between">
                                                        <span className="flex items-center gap-1.5"><Layers size={16} /> {cat.foodCategory}</span>
                                                        <span className="text-[10px] font-extrabold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-widest">
                                                            {categoryDrinks.length} Drinks
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>

                                            {categoryDrinks.map((drink) => {
                                                const isDrinkActive = drink.isActive !== undefined ? drink.isActive : (drink.isAvailable ?? true);
                                                const ingredientsText = formatIngredients(drink.ingredients);
                                                const primaryImg = Array.isArray(drink.images) && drink.images.length > 0
                                                    ? getMediaUrl(drink.images[0])
                                                    : PLACEHOLDER_DRINK_IMAGE;

                                                return (
                                                    <tr
                                                        key={drink._id}
                                                        onClick={() => openEditModal(drink)}
                                                        className={`hover:bg-[#3d3f96]/5 cursor-pointer transition-all duration-150 group ${!isDrinkActive ? 'opacity-60 bg-slate-50/40' : ''
                                                            }`}
                                                    >
                                                        <td className="py-5 px-6">
                                                            <div className="flex items-center gap-3">
                                                                {renderDietSymbol(drink.dietType)}
                                                                <div className="flex items-center gap-3">
                                                                    <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                                        <img
                                                                            src={primaryImg}
                                                                            alt={drink.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => { e.target.src = PLACEHOLDER_DRINK_IMAGE; }}
                                                                        />
                                                                        {Array.isArray(drink.images) && drink.images.length > 1 && (
                                                                            <span className="absolute bottom-0 right-0 bg-slate-900/80 text-[8px] font-black text-white px-1 rounded-tl">
                                                                                +{drink.images.length - 1}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <p className="font-bold text-slate-800 text-[13px] leading-snug group-hover:underline">{drink.name}</p>
                                                                            {drink.isPopular && <Sparkles size={13} className="text-amber-500 fill-amber-500" title="Popular" />}
                                                                            {drink.isRecommended && <Award size={13} className="text-[#3d3f96]" title="Recommended" />}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1">
                                                                            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                                                                                {drink.drinkType || "Smoothie"}
                                                                            </span>
                                                                            {drink.foodEffectCategory && (
                                                                                <span className="text-[9px] font-bold bg-[#3d3f96]/10 text-[#3d3f96] px-1.5 py-0.5 rounded">
                                                                                    {drink.foodEffectCategory}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="py-5 px-6">
                                                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-[220px]" title={drink.description}>
                                                                {drink.description}
                                                            </p>
                                                            {Array.isArray(drink.tags) && drink.tags.length > 0 && (
                                                                <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[220px] mt-1">
                                                                    Tags: {drink.tags.join(', ')}
                                                                </p>
                                                            )}
                                                        </td>

                                                        <td className="py-5 px-6 font-semibold">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-slate-900 font-bold font-mono text-[13px]">₹{drink.discountPrice || drink.price}</span>
                                                                {drink.discountPrice && drink.price !== drink.discountPrice && (
                                                                    <span className="text-[11px] text-slate-400 line-through font-mono">₹{drink.price}</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        <td className="py-5 px-6 space-y-1">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="px-2 py-0.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded font-extrabold text-[10px] flex items-center gap-1">
                                                                    <Flame size={11} /> {drink.calories} Kcal
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 font-bold">Vol: {drink.servingSize || "350ml"}</span>
                                                                {drink.sugar !== undefined && (
                                                                    <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
                                                                        Sugar: {drink.sugar}g
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[190px]" title={ingredientsText}>
                                                                <strong className="text-slate-500">Blend:</strong> {ingredientsText}
                                                            </p>
                                                        </td>

                                                        <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    disabled={togglingId === drink._id}
                                                                    onClick={() => toggleDrinkAvailability(drink._id)}
                                                                    className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                                                                    title={isDrinkActive ? "Set Inactive" : "Set Active"}
                                                                >
                                                                    {isDrinkActive ? (
                                                                        <ToggleRight className="text-[#3d3f96]" size={28} />
                                                                    ) : (
                                                                        <ToggleLeft className="text-slate-300" size={28} />
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>

                                                        <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    onClick={() => openEditModal(drink)}
                                                                    className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-lg transition-all cursor-pointer"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil className="w-4 h-4" strokeWidth={2} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteDrink(drink._id)}
                                                                    className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" strokeWidth={2} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    );
                                })}

                                {/* Uncategorized Section */}
                                {uncategorizedDrinks.length > 0 && (
                                    <React.Fragment>
                                        <tr className="bg-slate-100/60 border-y border-slate-100 pointer-events-none">
                                            <td colSpan={6} className="py-4 px-6 text-sm font-extrabold text-slate-500 tracking-wider uppercase border-l-4 border-l-slate-400">
                                                Uncategorized Drinks ({uncategorizedDrinks.length} Items)
                                            </td>
                                        </tr>
                                        {uncategorizedDrinks.map((drink) => {
                                            const isDrinkActive = drink.isActive !== undefined ? drink.isActive : (drink.isAvailable ?? true);
                                            const ingredientsText = formatIngredients(drink.ingredients);
                                            const primaryImg = Array.isArray(drink.images) && drink.images.length > 0
                                                ? getMediaUrl(drink.images[0])
                                                : PLACEHOLDER_DRINK_IMAGE;

                                            return (
                                                <tr
                                                    key={drink._id}
                                                    onClick={() => openEditModal(drink)}
                                                    className={`hover:bg-[#3d3f96]/5 cursor-pointer transition-all duration-150 group ${!isDrinkActive ? 'opacity-60 bg-slate-50/40' : ''
                                                        }`}
                                                >
                                                    <td className="py-5 px-6">
                                                        <div className="flex items-center gap-3">
                                                            {renderDietSymbol(drink.dietType)}
                                                            <div className="flex items-center gap-3">
                                                                <div className="relative w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                                    <img
                                                                        src={primaryImg}
                                                                        alt={drink.name}
                                                                        className="w-full h-full object-cover"
                                                                        onError={(e) => { e.target.src = PLACEHOLDER_DRINK_IMAGE; }}
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <p className="font-bold text-slate-800 text-[13px] leading-snug group-hover:underline">{drink.name}</p>
                                                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                                                                        {drink.drinkType || "Smoothie"}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6">
                                                        <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-[220px]">
                                                            {drink.description}
                                                        </p>
                                                    </td>
                                                    <td className="py-5 px-6 font-semibold">
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-slate-900 font-bold font-mono text-[13px]">₹{drink.discountPrice || drink.price}</span>
                                                            {drink.discountPrice && drink.price !== drink.discountPrice && (
                                                                <span className="text-[11px] text-slate-400 line-through font-mono">₹{drink.price}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6 space-y-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="px-2 py-0.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded font-extrabold text-[10px] flex items-center gap-1">
                                                                <Flame size={11} /> {drink.calories} Kcal
                                                            </span>
                                                            <span className="text-[10px] text-slate-500 font-bold">Vol: {drink.servingSize || "350ml"}</span>
                                                        </div>
                                                        <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[190px]" title={ingredientsText}>
                                                            <strong className="text-slate-500">Blend:</strong> {ingredientsText}
                                                        </p>
                                                    </td>
                                                    <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-center">
                                                            <button
                                                                type="button"
                                                                disabled={togglingId === drink._id}
                                                                onClick={() => toggleDrinkAvailability(drink._id)}
                                                                className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                                                            >
                                                                {isDrinkActive ? (
                                                                    <ToggleRight className="text-[#3d3f96]" size={28} />
                                                                ) : (
                                                                    <ToggleLeft className="text-slate-300" size={28} />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => openEditModal(drink)}
                                                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-lg transition-all cursor-pointer"
                                                            >
                                                                <Pencil className="w-4 h-4" strokeWidth={2} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteDrink(drink._id)}
                                                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                                                            >
                                                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </React.Fragment>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-200">
                    <Inbox className="w-12 h-12 text-slate-300 mb-3" />
                    <p className="font-bold text-slate-700">No Smoothies or Drinks Found</p>
                    <p className="text-xs text-slate-400 mt-1">There are no drinks matching your active criteria.</p>
                </div>
            )}

            {/* Add / Edit Smoothie Modal */}
            <AddSmoothie
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalMode}
                editingDrink={selectedDrinkForEdit}
                categories={categories}
                diseases={diseases}
                onSubmit={fetchDrinksList}
            />
        </div>
    );
}