"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    Flame,
    Coffee,
    Sun,
    Moon,
    Power,
    Save,
    RotateCcw,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Info,
    IndianRupee,
    Clock,
    Zap,
    TrendingUp,
    ShieldAlert,
    SlidersHorizontal
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Import your Admin API service (adjust path if needed)
import AdminAPI from '../../../../services/AdminAPI';

export default function PeakOrderChargesPage() {
    // --- Data & Loading States ---
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [togglingSlot, setTogglingSlot] = useState(null); // 'breakfast' | 'lunch' | 'dinner' | 'global' | null
    const [lastUpdated, setLastUpdated] = useState(null);

    // --- Form State ---
    const [isGlobalActive, setIsGlobalActive] = useState(true);
    const [slotsData, setSlotsData] = useState({
        breakfast: { charge: 25, isActive: true },
        lunch: { charge: 40, isActive: true },
        dinner: { charge: 30, isActive: false }
    });

    // Unsaved Changes Tracker
    const [initialState, setInitialState] = useState(null);

    // --- 1. Fetch Current Peak Order Charges ---
    const fetchPeakCharges = useCallback(async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getPeakCharges();
            if (response && response.success && response.data) {
                const data = response.data;
                setIsGlobalActive(data.isGlobalActive !== false);
                
                const loadedSlots = {
                    breakfast: {
                        charge: data.breakfast?.charge ?? 25,
                        isActive: data.breakfast?.isActive ?? true
                    },
                    lunch: {
                        charge: data.lunch?.charge ?? 40,
                        isActive: data.lunch?.isActive ?? true
                    },
                    dinner: {
                        charge: data.dinner?.charge ?? 30,
                        isActive: data.dinner?.isActive ?? false
                    }
                };

                setSlotsData(loadedSlots);
                setInitialState({
                    isGlobalActive: data.isGlobalActive !== false,
                    ...loadedSlots
                });
                setLastUpdated(data.updatedAt);
            }
        } catch (err) {
            console.error("Error retrieving peak charges:", err);
            toast.error(err.response?.data?.message || "Failed to load peak charges ledger.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeakCharges();
    }, [fetchPeakCharges]);

    // --- 2. Instant 1-Click Toggle for a Specific Slot or Global Switch ---
    const handleInstantToggle = async (slotName) => {
        setTogglingSlot(slotName);
        try {
            const response = await AdminAPI.togglePeakChargeSlot(slotName);
            if (response && response.success) {
                toast.success(response.message || `${slotName.toUpperCase()} surcharge status updated.`);
                
                if (slotName === 'global') {
                    setIsGlobalActive(response.isActive !== undefined ? response.isActive : !isGlobalActive);
                } else {
                    setSlotsData(prev => ({
                        ...prev,
                        [slotName]: {
                            ...prev[slotName],
                            isActive: response.isActive !== undefined ? response.isActive : !prev[slotName].isActive
                        }
                    }));
                }

                // If backend returns updated document, sync it
                if (response.data) {
                    setIsGlobalActive(response.data.isGlobalActive !== false);
                    setSlotsData({
                        breakfast: {
                            charge: response.data.breakfast?.charge ?? slotsData.breakfast.charge,
                            isActive: response.data.breakfast?.isActive ?? slotsData.breakfast.isActive
                        },
                        lunch: {
                            charge: response.data.lunch?.charge ?? slotsData.lunch.charge,
                            isActive: response.data.lunch?.isActive ?? slotsData.lunch.isActive
                        },
                        dinner: {
                            charge: response.data.dinner?.charge ?? slotsData.dinner.charge,
                            isActive: response.data.dinner?.isActive ?? slotsData.dinner.isActive
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`Error toggling ${slotName}:`, err);
            toast.error(err.response?.data?.message || `Failed to toggle ${slotName} status.`);
        } finally {
            setTogglingSlot(null);
        }
    };

    // --- 3. Handle Surcharge Amount Input Change ---
    const handleChargeChange = (slotKey, value) => {
        const numericVal = value === '' ? '' : Math.max(0, parseFloat(value) || 0);
        setSlotsData(prev => ({
            ...prev,
            [slotKey]: {
                ...prev[slotKey],
                charge: numericVal
            }
        }));
    };

    // --- 4. Save / Update Slot-Wise Peak Charges ---
    const handleSaveAllCharges = async (e) => {
        if (e) e.preventDefault();

        // Validations
        if (slotsData.breakfast.charge < 0 || slotsData.lunch.charge < 0 || slotsData.dinner.charge < 0) {
            toast.error("Peak charges cannot be negative numbers.");
            return;
        }

        const payload = {
            isGlobalActive,
            breakfast: {
                charge: parseFloat(slotsData.breakfast.charge) || 0,
                isActive: Boolean(slotsData.breakfast.isActive)
            },
            lunch: {
                charge: parseFloat(slotsData.lunch.charge) || 0,
                isActive: Boolean(slotsData.lunch.isActive)
            },
            dinner: {
                charge: parseFloat(slotsData.dinner.charge) || 0,
                isActive: Boolean(slotsData.dinner.isActive)
            }
        };

        setSaving(true);
        try {
            const response = await AdminAPI.savePeakCharges(payload);
            if (response && response.success) {
                toast.success(response.message || "Peak order charges updated successfully!");
                setInitialState({
                    isGlobalActive,
                    ...slotsData
                });
                if (response.data?.updatedAt) {
                    setLastUpdated(response.data.updatedAt);
                }
            }
        } catch (err) {
            console.error("Error saving peak charges:", err);
            toast.error(err.response?.data?.message || "Failed to save peak order charges.");
        } finally {
            setSaving(false);
        }
    };

    // Check if there are unsaved price changes
    const hasUnsavedChanges = initialState ? (
        initialState.breakfast.charge !== slotsData.breakfast.charge ||
        initialState.lunch.charge !== slotsData.lunch.charge ||
        initialState.dinner.charge !== slotsData.dinner.charge
    ) : false;

    // Slot metadata definitions
    const SLOTS_CONFIG = [
        {
            key: 'breakfast',
            name: 'Breakfast Slot',
            timeWindow: '07:00 AM - 11:00 AM',
            icon: Coffee,
            iconColor: 'text-amber-600',
            iconBg: 'bg-amber-50 border-amber-200/80',
            description: 'Applied on morning clinical dishes and early tiffin dispatches.'
        },
        {
            key: 'lunch',
            name: 'Lunch Slot',
            timeWindow: '12:00 PM - 04:00 PM',
            icon: Sun,
            iconColor: 'text-orange-600',
            iconBg: 'bg-orange-50 border-orange-200/80',
            description: 'Applied during peak midday rush hours for executive meals.'
        },
        {
            key: 'dinner',
            name: 'Dinner Slot',
            timeWindow: '07:00 PM - 11:00 PM',
            icon: Moon,
            iconColor: 'text-indigo-600',
            iconBg: 'bg-indigo-50 border-indigo-200/80',
            description: 'Applied on evening meal orders and late night kitchen deliveries.'
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 py-4 pb-16 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- PAGE HEADER --- */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/15 flex-shrink-0 shadow-xs">
                        <Flame className="w-7 h-7 stroke-[2.2]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Peak Order Charges
                            </h1>
                            <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-full border shadow-xs flex items-center gap-1.5 ${
                                isGlobalActive
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}>
                                <Zap size={12} className={isGlobalActive ? "text-emerald-500" : "text-rose-500"} />
                                {isGlobalActive ? "Global Engine Active" : "Global Engine Disabled"}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1 max-w-2xl">
                            Configure slot-wise peak surge charges (₹) for Breakfast, Lunch, and Dinner checkouts to balance delivery fleet load.
                        </p>
                    </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchPeakCharges}
                        disabled={loading}
                        className="p-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 rounded-2xl shadow-xs transition cursor-pointer disabled:opacity-50"
                        title="Reload peak charges"
                    >
                        <RotateCcw size={16} className={loading ? "animate-spin text-[#3d3f96]" : ""} />
                    </button>

                    <button
                        type="button"
                        onClick={handleSaveAllCharges}
                        disabled={saving || loading}
                        className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                            hasUnsavedChanges
                                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-950/20 animate-pulse'
                                : 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/20'
                        } disabled:opacity-50`}
                    >
                        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        <span>{hasUnsavedChanges ? 'Save Unsaved Changes' : 'Save Peak Rates'}</span>
                    </button>
                </div>
            </div>

            {/* --- GLOBAL MASTER SWITCH CARD --- */}
            <div className={`p-6 sm:p-7 rounded-[2.5rem] border transition-all duration-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                isGlobalActive
                    ? 'bg-gradient-to-r from-emerald-50/70 via-white to-indigo-50/30 border-emerald-200/80'
                    : 'bg-slate-50 border-slate-200/80 opacity-90'
            }`}>
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${
                        isGlobalActive ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-slate-200 text-slate-500 border-slate-300'
                    }`}>
                        <Power size={22} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                                Global Peak Surcharge Engine
                            </h3>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                                isGlobalActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                                Master Switch
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-semibold max-w-2xl leading-relaxed">
                            When toggled <strong className="text-slate-700">OFF</strong>, peak order surcharges are immediately suspended across all food checkouts regardless of individual slot active settings.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                        {isGlobalActive ? "Enabled" : "Disabled"}
                    </span>
                    <button
                        type="button"
                        disabled={togglingSlot === 'global'}
                        onClick={() => handleInstantToggle('global')}
                        className={`relative inline-flex h-7 w-13 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                            isGlobalActive ? 'bg-[#00B574]' : 'bg-slate-300'
                        }`}
                    >
                        <span
                            className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                isGlobalActive ? 'translate-x-6' : 'translate-x-0'
                            }`}
                        />
                    </button>
                </div>
            </div>

            {/* --- THREE SLOT SURCHARGE CARDS (BREAKFAST, LUNCH, DINNER) --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-28 bg-white rounded-3xl border border-slate-200 shadow-xs">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Scanning slot surge matrix...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {SLOTS_CONFIG.map((slot) => {
                        const slotKey = slot.key;
                        const slotData = slotsData[slotKey] || { charge: 0, isActive: false };
                        const SlotIcon = slot.icon;
                        const isToggling = togglingSlot === slotKey;
                        const isEffectiveActive = isGlobalActive && slotData.isActive;

                        return (
                            <div
                                key={slotKey}
                                className={`bg-white rounded-[2.5rem] border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                                    isEffectiveActive
                                        ? 'border-amber-200/90 ring-2 ring-amber-50/60'
                                        : 'border-slate-200/90 opacity-85'
                                }`}
                            >
                                {/* Card Body */}
                                <div className="p-6 sm:p-7 space-y-5">
                                    
                                    {/* Slot Header & 1-Click Toggle */}
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${slot.iconBg} ${slot.iconColor}`}>
                                                <SlotIcon size={22} strokeWidth={2.2} />
                                            </div>
                                            <div>
                                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                                    {slot.name}
                                                </h3>
                                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Clock size={11} /> {slot.timeWindow}
                                                </span>
                                            </div>
                                        </div>

                                        {/* 1-Click Slot Toggle Switch */}
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                type="button"
                                                disabled={isToggling}
                                                onClick={() => handleInstantToggle(slotKey)}
                                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                                    slotData.isActive ? 'bg-[#00B574]' : 'bg-slate-300'
                                                }`}
                                                title={`Toggle ${slot.name}`}
                                            >
                                                <span
                                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                                        slotData.isActive ? 'translate-x-5' : 'translate-x-0'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                        {slot.description}
                                    </p>

                                    {/* Surcharge Input Field */}
                                    <div className="bg-slate-50/80 border border-slate-200/80 p-4 rounded-2xl space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 flex items-center gap-1">
                                                <IndianRupee size={12} className="text-amber-600" /> Peak Surge Fee (₹)
                                            </label>
                                            <span className="text-[10px] font-bold text-slate-400">
                                                Per Order
                                            </span>
                                        </div>

                                        <div className="relative">
                                            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-black text-sm">
                                                ₹
                                            </span>
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={slotData.charge}
                                                onChange={(e) => handleChargeChange(slotKey, e.target.value)}
                                                placeholder="e.g. 25"
                                                className="w-full pl-8 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-black font-mono text-slate-800 focus:outline-none focus:border-[#3d3f96] focus:ring-4 focus:ring-indigo-50 transition shadow-xs"
                                            />
                                        </div>
                                    </div>

                                </div>

                                {/* Card Status Footer */}
                                <div className={`px-6 py-3.5 border-t text-xs font-bold flex items-center justify-between ${
                                    isEffectiveActive
                                        ? 'bg-emerald-50/60 border-emerald-100 text-emerald-800'
                                        : 'bg-slate-50/80 border-slate-100 text-slate-400'
                                }`}>
                                    <span className="flex items-center gap-1.5 text-[11px]">
                                        {isEffectiveActive ? (
                                            <>
                                                <CheckCircle2 size={13} className="text-emerald-600" />
                                                <span>Active: +₹{slotData.charge || 0} applied at checkout</span>
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle size={13} className="text-slate-400" />
                                                <span>Inactive (No fee levied)</span>
                                            </>
                                        )}
                                    </span>
                                </div>

                            </div>
                        );
                    })}
                </div>
            )}

            {/* --- SUMMARY & AUDIT FOOTER --- */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                        <TrendingUp size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                            Dynamic Surge Billing Policy
                        </h4>
                        <p className="text-xs text-slate-400 font-medium">
                            Peak charges are automatically calculated during the active slot window and itemized in customer billing breakdown.
                        </p>
                    </div>
                </div>

                {lastUpdated && (
                    <span className="text-[11px] font-bold text-slate-400 shrink-0 font-mono">
                        Last Updated: {new Date(lastUpdated).toLocaleString("en-US", {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </span>
                )}
            </div>

        </div>
    );
}