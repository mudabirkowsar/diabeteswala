"use client";

import React, { useState, useEffect } from 'react';
import {
    GlassWater,
    Search,
    Flame,
    Sparkles,
    Award,
    X,
    ChevronLeft,
    ChevronRight,
    Layers,
    Milk,
    CheckCircle2,
    AlertTriangle
} from 'lucide-react';
import FoodAPI from '../../../../services/FoodVendorAPI';

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

const PLACEHOLDER_DRINK = "https://images.unsplash.com/photo-1553530666-ba11a7da3888?q=80&w=400";

const DRINK_TYPES = [
    "All",
    "Smoothie",
    "Cold Pressed Juice",
    "Detox Drink",
    "Protein Shake",
    "Immunity Booster"
];

export default function ManageDrinksInventory() {
    const [catalog, setCatalog] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDietType, setSelectedDietType] = useState('All');
    const [selectedDrinkType, setSelectedDrinkType] = useState('All');
    const [selectedEffect, setSelectedEffect] = useState('All');

    // Tracking selection checklist states
    const [localSelections, setLocalSelections] = useState({});
    const [selectedDrink, setSelectedDrink] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [activeImageIdx, setActiveImageIdx] = useState(0);

    useEffect(() => {
        fetchCatalogData();
    }, []);

    // 1. Fetch Master Drinks Catalog Checklist
    const fetchCatalogData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await FoodAPI.getMasterDrinksCatalog();
            if (response && response.success && Array.isArray(response.data)) {
                setCatalog(response.data);

                // Sync local selections with isAvailable property returned by API
                const initialSelections = {};
                response.data.forEach(item => {
                    initialSelections[item._id] = !!item.isAvailable;
                });
                setLocalSelections(initialSelections);
            } else {
                setError('The catalog data structure returned was unexpected.');
            }
        } catch (err) {
            setError(err?.message || 'Failed to fetch drinks master catalog.');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message) => {
        setSuccessMessage(message);
        setTimeout(() => {
            setSuccessMessage(null);
        }, 4000);
    };

    // 5. Open Modal & Fetch Single Drink Details with Ingredients & Multi-Images
    const handleOpenDetails = async (drinkId) => {
        const localFallback = catalog.find(item => item._id === drinkId);
        setSelectedDrink(localFallback || { _id: drinkId, name: "Loading..." });
        setActiveImageIdx(0);
        setModalLoading(true);
        setError(null);

        try {
            const response = await FoodAPI.getDrinkDetails(drinkId);
            if (response && response.success && response.data) {
                setSelectedDrink(response.data);
            } else if (localFallback) {
                setSelectedDrink(localFallback);
            }
        } catch (err) {
            if (localFallback) {
                console.warn("Details API returned an error. Using catalog fallback:", err);
                setSelectedDrink(localFallback);
            } else {
                setSelectedDrink(null);
                setError(err?.message || 'Error occurred while loading single drink details.');
            }
        } finally {
            setModalLoading(false);
        }
    };

    // 3. Instant Single Drink Availability Toggle (Switch Button)
    const handleInstantToggle = async (drinkId, e) => {
        e.stopPropagation();
        setActionLoading(true);
        setError(null);

        try {
            const response = await FoodAPI.toggleDrinkAvailability(drinkId);
            if (response && response.success) {
                const newStatus = response.isAvailable ?? !localSelections[drinkId];

                // Update local state instantly
                setLocalSelections(prev => ({
                    ...prev,
                    [drinkId]: newStatus
                }));

                setCatalog(prev => prev.map(item =>
                    item._id === drinkId ? { ...item, isAvailable: newStatus } : item
                ));

                showNotification(response.message || `Drink availability updated.`);
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to toggle drink availability.');
        } finally {
            setActionLoading(false);
        }
    };

    // Checkbox local state toggle (for batch sync)
    const handleCheckboxChange = (drinkId, e) => {
        e.stopPropagation();
        setLocalSelections(prev => ({
            ...prev,
            [drinkId]: !prev[drinkId]
        }));
    };

    // 2. Sync / Multi-Select Drinks (Bulk Menu Save)
    const handleBulkSync = async () => {
        setActionLoading(true);
        setError(null);

        const selectedIds = Object.keys(localSelections).filter(
            id => localSelections[id] === true
        );

        try {
            const response = await FoodAPI.syncDrinksMenu(selectedIds);
            if (response && response.success) {
                showNotification(response.message || 'Drinks menu synchronized successfully!');
                await fetchCatalogData();
            }
        } catch (err) {
            setError(err?.response?.data?.message || err?.message || 'Failed to synchronize drinks menu.');
        } finally {
            setActionLoading(false);
        }
    };

    // Compare local checklist modifications against saved DB states
    const hasPendingChanges = () => {
        return catalog.some(item => {
            const dbVal = !!item.isAvailable;
            const localVal = !!localSelections[item._id];
            return dbVal !== localVal;
        });
    };

    // Search & Filter Logic
    const filteredCatalog = catalog.filter(item => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (Array.isArray(item.tags) && item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesDiet = selectedDietType === 'All' || item.dietType === selectedDietType;
        const matchesDrinkType = selectedDrinkType === 'All' || item.drinkType === selectedDrinkType;
        const matchesEffect = selectedEffect === 'All' || item.foodEffectCategory === selectedEffect;

        return matchesSearch && matchesDiet && matchesDrinkType && matchesEffect;
    });

    // Group items dynamically by Drink Type or Category
    const groupedCatalog = filteredCatalog.reduce((groups, item) => {
        const groupName = item.drinkType || item.categoryId?.foodCategory || 'Smoothies & Shakes';
        if (!groups[groupName]) {
            groups[groupName] = [];
        }
        groups[groupName].push(item);
        return groups;
    }, {});

    const uniqueEffects = ['All', ...new Set(catalog.map(i => i.foodEffectCategory).filter(Boolean))];

    const renderDietSymbol = (type) => {
        const colors = {
            Vegan: 'border-emerald-500 text-emerald-500',
            Veg: 'border-green-500 text-green-500',
            'Non Veg': 'border-rose-500 text-rose-500'
        };
        const fillColors = {
            Vegan: 'bg-emerald-500',
            Veg: 'bg-green-500',
            'Non Veg': 'bg-rose-500'
        };

        return (
            <div className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 ${colors[type] || 'border-slate-300'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${fillColors[type] || 'bg-slate-300'}`} />
            </div>
        );
    };

    const formatIngredientsSummary = (ingredients) => {
        if (!Array.isArray(ingredients) || ingredients.length === 0) return 'Fresh blend';
        return ingredients
            .slice(0, 3)
            .map(ing => (typeof ing === 'object' && ing !== null ? `${ing.name}${ing.quantity ? ` (${ing.quantity})` : ''}` : ing))
            .join(', ');
    };

    return (
        <div className="min-h-screen px-4 py-4 relative select-none">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="md:flex md:items-center md:justify-between border-b border-slate-100 pb-6 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
                            <GlassWater className="w-7 h-7" strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-extrabold leading-7 text-slate-900 sm:text-3xl tracking-tight">
                                Smoothies & Health Drinks Menu
                            </h1>
                            <p className="mt-1.5 text-xs text-slate-500 font-medium">
                                Check drinks to add them to your active kitchen menu, or toggle instant availability. Click any row for recipe breakdown.
                            </p>
                        </div>
                    </div>

                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        <button
                            onClick={handleBulkSync}
                            disabled={actionLoading || !hasPendingChanges()}
                            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-2xl shadow-lg text-xs font-bold uppercase tracking-wider transition-all duration-150 focus:outline-none cursor-pointer ${hasPendingChanges() && !actionLoading
                                    ? 'bg-[#3D3F96] hover:bg-[#2d2f75] text-white shadow-[#3D3F96]/20'
                                    : 'bg-slate-300 text-white cursor-not-allowed shadow-none'
                                }`}
                        >
                            {actionLoading ? 'Synchronizing...' : 'Save & Sync Drinks Menu'}
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                {error && (
                    <div className="mb-6 rounded-2xl bg-rose-50 p-4 border border-rose-100 animate-fade-in shadow-sm flex items-center gap-2">
                        <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                        <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-6 rounded-2xl bg-emerald-50 p-4 border border-emerald-100 animate-fade-in shadow-sm flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider">{successMessage}</p>
                    </div>
                )}

                {/* Filter Controls Panel */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 flex flex-col xl:flex-row gap-4 justify-between items-center">

                    {/* Search Bar */}
                    <div className="w-full xl:w-80">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Search Drinks</label>
                        <div className="relative">
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:border-[#3D3F96] transition"
                                placeholder="Search by title, ingredient, or tags..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" strokeWidth={2.2} />
                        </div>
                    </div>

                    {/* Filter Dropdowns & Diet Type Switches */}
                    <div className="w-full xl:w-auto flex flex-wrap items-center gap-4">

                        {/* Drink Type Selector */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Drink Type</label>
                            <select
                                className="border border-slate-200 rounded-xl py-2 px-3 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D3F96] cursor-pointer"
                                value={selectedDrinkType}
                                onChange={(e) => setSelectedDrinkType(e.target.value)}
                            >
                                {DRINK_TYPES.map((type) => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Health Focus Dropdown */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1.5">Therapy Target</label>
                            <select
                                className="border border-slate-200 rounded-xl py-2 px-3 bg-white text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D3F96] cursor-pointer"
                                value={selectedEffect}
                                onChange={(e) => setSelectedEffect(e.target.value)}
                            >
                                {uniqueEffects.map((category) => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                    </div>
                </div>

                {/* Master Catalog Inventory Table */}
                {loading ? (
                    <div className="flex flex-col justify-center items-center py-24 space-y-4 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3D3F96]" />
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Loading drinks checklist...</p>
                    </div>
                ) : filteredCatalog.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <GlassWater className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No smoothies or drinks match your filter.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100 table-fixed">
                                <thead className="bg-[#FAFBFD]">
                                    <tr>
                                        <th scope="col" className="w-[8%] px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
                                            Select
                                        </th>
                                        <th scope="col" className="w-[34%] px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
                                            Drink Information
                                        </th>
                                        <th scope="col" className="w-[12%] px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
                                            Pricing
                                        </th>
                                        <th scope="col" className="w-[14%] px-6 py-4 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
                                            Nutrition & Specs
                                        </th>
                                        <th scope="col" className="w-[8%] px-6 py-4 text-center text-[11px] font-black uppercase tracking-wider text-slate-400">
                                            Available
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {Object.keys(groupedCatalog).map((groupName) => (
                                        <React.Fragment key={groupName}>

                                            {/* Section Header */}
                                            <tr className="bg-[#FAFBFD] border-t border-b border-slate-100 pointer-events-none">
                                                <td colSpan="6" className="px-6 py-3.5">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center space-x-2">
                                                            <Layers size={16} className="text-[#3D3F96]" />
                                                            <span className="text-xs font-black text-[#3D3F96] tracking-wider uppercase">
                                                                {groupName}
                                                            </span>
                                                        </div>
                                                        <span className="text-[10px] font-black bg-[#3D3F96]/10 text-[#3D3F96] px-3 py-1 rounded-full uppercase tracking-wider">
                                                            {groupedCatalog[groupName].length} Items
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Drink Items */}
                                            {groupedCatalog[groupName].map((item) => {
                                                const isCheckedLocal = !!localSelections[item._id];
                                                const itemImage = Array.isArray(item.images) && item.images.length > 0
                                                    ? getMediaUrl(item.images[0])
                                                    : PLACEHOLDER_DRINK;

                                                return (
                                                    <tr
                                                        key={item._id}
                                                        onClick={() => handleOpenDetails(item._id)}
                                                        className={`hover:bg-[#3D3F96]/5 transition-colors duration-150 cursor-pointer ${!isCheckedLocal ? 'opacity-65 bg-slate-50/30' : ''
                                                            }`}
                                                        title="Click to view recipe details and ingredients"
                                                    >
                                                        {/* Checkbox Selector */}
                                                        <td
                                                            className="px-6 py-5 whitespace-nowrap text-left"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isCheckedLocal}
                                                                disabled={actionLoading}
                                                                onChange={(e) => handleCheckboxChange(item._id, e)}
                                                                className="h-5 w-5 text-[#3D3F96] focus:ring-[#3D3F96] border-slate-300 rounded cursor-pointer transition"
                                                            />
                                                        </td>

                                                        {/* Drink Details */}
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="flex items-center space-x-3.5">
                                                                {renderDietSymbol(item.dietType)}

                                                                {/* Thumbnail image */}
                                                                <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                                                    <img
                                                                        className="h-full w-full object-cover"
                                                                        src={itemImage}
                                                                        alt={item.name}
                                                                        onError={(e) => { e.target.src = PLACEHOLDER_DRINK; }}
                                                                    />
                                                                    {Array.isArray(item.images) && item.images.length > 1 && (
                                                                        <span className="absolute bottom-0 right-0 bg-slate-950/70 text-[8px] font-black text-white px-1 rounded-tl">
                                                                            +{item.images.length - 1}
                                                                        </span>
                                                                    )}
                                                                </div>

                                                                <div className="leading-tight">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-[13px] font-bold text-slate-800 line-clamp-1">{item.name}</span>
                                                                        {item.isPopular && <Sparkles size={13} className="text-amber-500 fill-amber-500" title="Popular" />}
                                                                        {item.isRecommended && <Award size={13} className="text-[#3D3F96]" title="Recommended" />}
                                                                    </div>
                                                                    <div className="flex items-center gap-2 mt-1">
                                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                                            {item.drinkType || 'Drink'}
                                                                        </span>
                                                                        {item.foodEffectCategory && (
                                                                            <span className="text-[9px] font-bold bg-[#3D3F96]/10 text-[#3D3F96] px-1.5 py-0.5 rounded">
                                                                                {item.foodEffectCategory}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Pricing (Fixed Master Pricing) */}
                                                        <td className="px-6 py-5 whitespace-nowrap">
                                                            <div className="flex items-baseline space-x-1.5">
                                                                {item.discountPrice ? (
                                                                    <>
                                                                        <span className="text-sm font-extrabold text-slate-800">₹{item.discountPrice}</span>
                                                                        <span className="text-[11px] font-semibold text-slate-400 line-through">₹{item.price}</span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-sm font-extrabold text-slate-800">₹{item.price}</span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Nutrition & Specs */}
                                                        <td className="px-6 py-5">
                                                            <div className="space-y-1">
                                                                <div className="flex items-center space-x-2">
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#3D3F96]/10 text-[#3D3F96] text-[10px] font-extrabold">
                                                                        <Flame size={11} /> {item.calories || 0} Kcal
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-500">
                                                                        {item.servingSize || '350ml'}
                                                                    </span>
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 font-semibold truncate max-w-[160px]" title={formatIngredientsSummary(item.ingredients)}>
                                                                    <strong className="text-slate-500">Blend:</strong> {formatIngredientsSummary(item.ingredients)}
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Instant Single Drink Availability Toggle Switch */}
                                                        <td
                                                            className="px-6 py-5 whitespace-nowrap text-center"
                                                            onClick={(e) => e.stopPropagation()}
                                                        >
                                                            <button
                                                                type="button"
                                                                onClick={(e) => handleInstantToggle(item._id, e)}
                                                                disabled={actionLoading}
                                                                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isCheckedLocal ? 'bg-[#3D3F96]' : 'bg-slate-200'
                                                                    }`}
                                                                title={isCheckedLocal ? "Set Inactive" : "Set Active"}
                                                            >
                                                                <span
                                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isCheckedLocal ? 'translate-x-5' : 'translate-x-0'
                                                                        }`}
                                                                />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>

            {/* DRINK DETAILS INSPECTION MODAL */}
            {selectedDrink && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto">
                    {/* Backdrop Closer */}
                    <div className="absolute inset-0" onClick={() => setSelectedDrink(null)} />

                    {/* Modal Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative z-10 flex flex-col">

                        {/* Gallery Banner */}
                        <div className="relative h-64 bg-slate-900 shrink-0 overflow-hidden">
                            {Array.isArray(selectedDrink.images) && selectedDrink.images.length > 0 ? (
                                <img
                                    className="w-full h-full object-cover"
                                    src={getMediaUrl(selectedDrink.images[activeImageIdx]) || PLACEHOLDER_DRINK}
                                    alt={selectedDrink.name}
                                    onError={(e) => { e.target.src = PLACEHOLDER_DRINK; }}
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full w-full text-slate-400 text-sm font-semibold">
                                    {modalLoading ? "Loading details..." : "No Image Available"}
                                </div>
                            )}

                            {/* Multi-Image Navigation Dots */}
                            {Array.isArray(selectedDrink.images) && selectedDrink.images.length > 1 && (
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    {selectedDrink.images.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setActiveImageIdx(i)}
                                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${activeImageIdx === i ? 'bg-white w-4' : 'bg-white/50'
                                                }`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={() => setSelectedDrink(null)}
                                className="absolute top-4 right-4 bg-slate-950/50 hover:bg-slate-950/80 text-white rounded-full p-2 focus:outline-none transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>

                            {/* Diet Classification Badge */}
                            <span className={`absolute top-4 left-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-black shadow ${selectedDrink.dietType === 'Vegan'
                                    ? 'bg-emerald-500 text-white'
                                    : selectedDrink.dietType === 'Veg'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-rose-500 text-white'
                                }`}>
                                {selectedDrink.dietType || 'Vegan'}
                            </span>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                            {modalLoading ? (
                                <div className="flex flex-col justify-center items-center py-12 space-y-3">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D3F96]" />
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Fetching clinical profile...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Title & Price */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                        <div>
                                            <span className="text-[10px] font-black text-[#3D3F96] uppercase tracking-wider">
                                                {selectedDrink.drinkType || 'Smoothie'} • {selectedDrink.foodEffectCategory || 'Detox'}
                                            </span>
                                            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
                                                {selectedDrink.name}
                                            </h2>
                                        </div>

                                        <div className="flex items-baseline space-x-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl shrink-0">
                                            {selectedDrink.discountPrice ? (
                                                <>
                                                    <span className="text-base font-black text-slate-900">₹{selectedDrink.discountPrice}</span>
                                                    <span className="text-xs font-semibold text-slate-400 line-through">₹{selectedDrink.price}</span>
                                                </>
                                            ) : (
                                                <span className="text-base font-black text-slate-900">₹{selectedDrink.price}</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Drink Description</span>
                                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                                            {selectedDrink.description || "No description provided."}
                                        </p>
                                    </div>

                                    {/* Clinical & Nutrition Specs Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/60 rounded-2xl border border-slate-100 p-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Calories</p>
                                            <p className="text-xs font-black text-[#3D3F96] mt-1 flex items-center justify-center gap-1">
                                                <Flame size={12} /> {selectedDrink.calories || '0'} Kcal
                                            </p>
                                        </div>
                                        <div className="text-center border-l border-slate-200/60">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Serving Volume</p>
                                            <p className="text-xs font-black text-slate-700 mt-1">{selectedDrink.servingSize || '350ml'}</p>
                                        </div>
                                        <div className="text-center border-l border-slate-200/60">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sugar Content</p>
                                            <p className="text-xs font-black text-amber-600 mt-1">{selectedDrink.sugar !== undefined ? `${selectedDrink.sugar}g` : '0g'}</p>
                                        </div>
                                        <div className="text-center border-l border-slate-200/60">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prep Time</p>
                                            <p className="text-xs font-black text-slate-700 mt-1">{selectedDrink.prepTime || '10'} Mins</p>
                                        </div>
                                    </div>

                                    {/* Ingredients Breakdown Table */}
                                    {Array.isArray(selectedDrink.ingredients) && selectedDrink.ingredients.length > 0 && (
                                        <div className="space-y-2.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                                    Ingredients & Recipe Breakdown ({selectedDrink.ingredients.length})
                                                </span>
                                                <span className="text-[10px] font-black text-[#3D3F96] bg-[#3D3F96]/10 px-2.5 py-0.5 rounded-lg">
                                                    {selectedDrink.calories} Kcal Total
                                                </span>
                                            </div>

                                            <div className="overflow-hidden border border-slate-100 rounded-2xl bg-white shadow-xs">
                                                <table className="w-full text-left text-xs border-collapse">
                                                    <thead>
                                                        <tr className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                                                            <th className="py-2.5 px-4">Ingredient Name</th>
                                                            <th className="py-2.5 px-4 text-center">Portion / Qty</th>
                                                            <th className="py-2.5 px-4 text-right">Calories</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100 text-slate-700">
                                                        {selectedDrink.ingredients.map((ing, idx) => {
                                                            const isObject = typeof ing === 'object' && ing !== null;
                                                            const ingName = isObject ? ing.name : ing;
                                                            const ingQty = isObject ? (ing.quantity || '—') : '—';
                                                            const ingCal = isObject ? (ing.calories !== undefined ? `${ing.calories} Kcal` : '—') : '—';

                                                            return (
                                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                                    <td className="py-2.5 px-4 font-bold text-slate-800">{ingName}</td>
                                                                    <td className="py-2.5 px-4 text-center font-medium text-slate-500">
                                                                        <span className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] font-semibold text-slate-600">
                                                                            {ingQty}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-600 text-xs">
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

                                    {/* Search / Clinical Tags */}
                                    {Array.isArray(selectedDrink.tags) && selectedDrink.tags.length > 0 && (
                                        <div className="space-y-2 border-t border-slate-100 pt-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Health Tags</span>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedDrink.tags.map((tag, idx) => (
                                                    <span key={idx} className="bg-[#3D3F96]/10 text-[#3D3F96] text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-slate-100 p-5 flex justify-end shrink-0 bg-white">
                            <button
                                onClick={() => setSelectedDrink(null)}
                                className="px-6 py-2.5 bg-[#3D3F96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg shadow-[#3D3F96]/15 cursor-pointer"
                            >
                                Close Drink View
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
}