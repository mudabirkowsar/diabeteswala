"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    MapPin,
    Navigation,
    IndianRupee,
    Gauge,
    ToggleLeft,
    ToggleRight,
    RefreshCw,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Calendar,
    Clock,
    ShieldCheck,
    Calculator,
    Info,
    HelpCircle,
    ArrowRight,
    Sparkles,
    Sliders
} from 'lucide-react';
import AdminAPI from '../../../../services/AdminAPI'; // Adjust this import path as per your folder structure

export default function CoachDistanceConfigPage() {
    // Config Data State
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        freeDistanceKM: 5,
        pricePerKM: 20,
        maxServiceRadiusKM: 30,
        isActive: true,
    });

    // Interactive Live Fare Calculator Test Distance (in KM)
    const [testDistance, setTestDistance] = useState(15);

    // Feedback Toast State
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    const showFeedback = (type, message) => {
        setFeedback({ type, message });
        setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    };

    // ==========================================
    // DATA FETCHING
    // ==========================================
    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await AdminAPI.getAdminCoachDistanceConfig();
            if (res?.success && res?.data) {
                setConfig(res.data);
                setFormData({
                    freeDistanceKM: res.data.freeDistanceKM ?? 5,
                    pricePerKM: res.data.pricePerKM ?? 20,
                    maxServiceRadiusKM: res.data.maxServiceRadiusKM ?? 30,
                    isActive: res.data.isActive ?? true,
                });
            }
        } catch (error) {
            console.error('Failed to load distance configuration:', error);
            showFeedback('error', error.response?.data?.message || 'Failed to fetch distance configuration.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchConfig();
    }, []);

    // ==========================================
    // FORM HANDLERS
    // ==========================================
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleToggleActive = () => {
        setFormData(prev => ({
            ...prev,
            isActive: !prev.isActive
        }));
    };

    const handleReset = () => {
        if (!config) return;
        setFormData({
            freeDistanceKM: config.freeDistanceKM ?? 5,
            pricePerKM: config.pricePerKM ?? 20,
            maxServiceRadiusKM: config.maxServiceRadiusKM ?? 30,
            isActive: config.isActive ?? true,
        });
        showFeedback('info', 'Changes reverted to current active configuration.');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic front-end validation
        if (formData.freeDistanceKM === '' || formData.pricePerKM === '') {
            showFeedback('error', 'Free distance (KM) and Price per KM are mandatory.');
            return;
        }

        const freeDist = Number(formData.freeDistanceKM);
        const priceKm = Number(formData.pricePerKM);
        const maxRadius = Number(formData.maxServiceRadiusKM);

        if (freeDist < 0 || priceKm < 0 || maxRadius < 0) {
            showFeedback('error', 'Distance and price values cannot be negative numbers.');
            return;
        }

        if (maxRadius > 0 && maxRadius < freeDist) {
            showFeedback('error', 'Max service radius cannot be smaller than the free distance allowance.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                freeDistanceKM: freeDist,
                pricePerKM: priceKm,
                maxServiceRadiusKM: maxRadius,
                isActive: Boolean(formData.isActive),
            };

            const res = await AdminAPI.updateAdminCoachDistanceConfig(payload);
            if (res?.success) {
                setConfig(res.data);
                showFeedback('success', res.message || 'Coach distance surcharge configuration saved!');
            }
        } catch (error) {
            console.error('Update distance config error:', error);
            showFeedback('error', error.response?.data?.message || 'Failed to update distance configuration.');
        } finally {
            setSubmitting(false);
        }
    };

    // ==========================================
    // INTERACTIVE PREVIEW CALCULATIONS
    // ==========================================
    const simulationResult = useMemo(() => {
        const free = Number(formData.freeDistanceKM) || 0;
        const rate = Number(formData.pricePerKM) || 0;
        const max = Number(formData.maxServiceRadiusKM) || 0;
        const active = formData.isActive;

        const isBeyondMax = max > 0 && testDistance > max;
        const billableKM = Math.max(0, testDistance - free);
        const extraCharge = active ? (billableKM * rate) : 0;

        return {
            free,
            rate,
            max,
            isBeyondMax,
            billableKM,
            extraCharge,
            isActive: active
        };
    }, [formData, testDistance]);

    // Check if form has unsaved modifications
    const isModified = useMemo(() => {
        if (!config) return false;
        return (
            Number(formData.freeDistanceKM) !== Number(config.freeDistanceKM) ||
            Number(formData.pricePerKM) !== Number(config.pricePerKM) ||
            Number(formData.maxServiceRadiusKM) !== Number(config.maxServiceRadiusKM) ||
            Boolean(formData.isActive) !== Boolean(config.isActive)
        );
    }, [config, formData]);

    return (
        <div className="min-h-screen bg-slate-50/60 p-4 sm:p-8 space-y-7 font-sans text-slate-900">

            {/* Toast Feedback Notification */}
            {feedback.message && (
                <div
                    className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300 ${feedback.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : feedback.type === 'info'
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-rose-50 text-rose-800 border-rose-200'
                        }`}
                >
                    {feedback.type === 'success' ? (
                        <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
                    ) : feedback.type === 'info' ? (
                        <Info size={18} className="text-indigo-600 shrink-0" />
                    ) : (
                        <AlertTriangle size={18} className="text-rose-600 shrink-0" />
                    )}
                    <span>{feedback.message}</span>
                </div>
            )}

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Navigation className="text-purple-600" size={28} />
                        Coach Offline Distance & Travel Surcharge
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                        Configure travel allowances, per-kilometer offline charges, and service perimeter limits for certified diabetes coaches.
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <button
                        onClick={fetchConfig}
                        disabled={loading || submitting}
                        className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition cursor-pointer disabled:opacity-50"
                        title="Reload Configuration"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>

                    <div className={`px-4 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 ${formData.isActive
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                        <span className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>{formData.isActive ? 'Surcharges Active' : 'Surcharges Disabled'}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="min-h-80 flex flex-col items-center justify-center gap-3 bg-white rounded-3xl border border-slate-100 p-12">
                    <Loader2 size={34} className="animate-spin text-purple-600" />
                    <p className="text-xs font-bold text-slate-400">Loading Distance Pricing Configuration...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">

                    {/* Left Column: Configuration Settings Form (7 Cols) */}
                    <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 flex flex-col justify-between">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Section Title */}
                            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                                        <Sliders size={20} className="text-purple-600" />
                                        Rate & Perimeter Rules
                                    </h2>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                                        Define distance limits and baseline billing increments.
                                    </p>
                                </div>

                                {isModified && (
                                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 animate-pulse">
                                        Unsaved Changes
                                    </span>
                                )}
                            </div>

                            {/* Master Toggle */}
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <span className="text-xs font-black text-slate-800 block">Master Distance Surcharge Engine</span>
                                    <p className="text-[11px] text-slate-500">
                                        {formData.isActive
                                            ? 'Auto-calculates travel fare beyond the complimentary threshold during patient checkout.'
                                            : 'Surcharge engine is turned off. No distance travel fees will be added to bookings.'}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleToggleActive}
                                    className="text-purple-600 hover:text-purple-700 transition cursor-pointer"
                                >
                                    {formData.isActive ? (
                                        <ToggleRight size={38} className="text-purple-600" />
                                    ) : (
                                        <ToggleLeft size={38} className="text-slate-300" />
                                    )}
                                </button>
                            </div>

                            {/* Input 1: Free Distance in KM */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                        <MapPin size={15} className="text-indigo-600" />
                                        Free Distance Allowance (KM)
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-medium">Included in base fee</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="0.5"
                                        value={formData.freeDistanceKM}
                                        onChange={(e) => handleInputChange('freeDistanceKM', e.target.value)}
                                        placeholder="5"
                                        className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                        KM
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Visits within this distance radius incur ₹0 extra travel fees.
                                </p>
                            </div>

                            {/* Input 2: Price Per KM */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                        <IndianRupee size={15} className="text-purple-600" />
                                        Extra Travel Surcharge Per KM
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-medium">Charged beyond free KM</span>
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                                        ₹
                                    </span>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        step="1"
                                        value={formData.pricePerKM}
                                        onChange={(e) => handleInputChange('pricePerKM', e.target.value)}
                                        placeholder="20"
                                        className="w-full pl-8 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                        / KM
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Billed per additional kilometer after the initial free distance is consumed.
                                </p>
                            </div>

                            {/* Input 3: Maximum Service Radius */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                                        <Gauge size={15} className="text-emerald-600" />
                                        Max Service Radius (KM)
                                    </label>
                                    <span className="text-[11px] text-slate-400 font-medium">Outer operating perimeter</span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={formData.maxServiceRadiusKM}
                                        onChange={(e) => handleInputChange('maxServiceRadiusKM', e.target.value)}
                                        placeholder="30"
                                        className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400">
                                        KM Max
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Consultations outside this radius are blocked or marked as out-of-service territory.
                                </p>
                            </div>

                            {/* Form Action Buttons */}
                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={handleReset}
                                    disabled={!isModified || submitting}
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition text-xs disabled:opacity-40"
                                >
                                    Revert
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting || !isModified}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-200 transition cursor-pointer text-xs disabled:opacity-50"
                                >
                                    {submitting ? (
                                        <>
                                            <Loader2 size={15} className="animate-spin" />
                                            <span>Saving Configuration...</span>
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={16} />
                                            <span>Save Configuration</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Audit / Metadata Footer */}
                        {config && (
                            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 font-medium">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={13} />
                                    <span>Last modified: {config.updatedAt ? new Date(config.updatedAt).toLocaleString() : 'N/A'}</span>
                                </div>
                                {config._id && (
                                    <div>
                                        <span>Config ID: </span>
                                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono text-[10px]">
                                            {config._id}
                                        </code>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Live Fare Preview & Calculation Formula (5 Cols) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Live Simulator Card */}
                        <div className="bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 w-44 h-44 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

                            <div className="flex items-center justify-between pb-4 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
                                        <Calculator size={18} className="text-purple-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black tracking-wide">Live Travel Fee Simulator</h3>
                                        <p className="text-[10px] text-purple-200">Test how the formula bills a sample distance</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/15 text-purple-200 border border-white/10">
                                    Instant Preview
                                </span>
                            </div>

                            {/* Distance Slider / Input */}
                            <div className="py-5 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-purple-200">Patient Distance from Coach:</span>
                                    <div className="flex items-center gap-1 bg-white/15 px-3 py-1 rounded-xl">
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={testDistance}
                                            onChange={(e) => setTestDistance(Math.max(0, Number(e.target.value)))}
                                            className="w-12 bg-transparent text-right font-black text-base text-white focus:outline-none"
                                        />
                                        <span className="text-xs font-bold text-purple-200">KM</span>
                                    </div>
                                </div>

                                <input
                                    type="range"
                                    min="1"
                                    max={Math.max(50, Number(formData.maxServiceRadiusKM) + 10)}
                                    value={testDistance}
                                    onChange={(e) => setTestDistance(Number(e.target.value))}
                                    className="w-full accent-purple-400 bg-white/20 rounded-lg cursor-pointer h-2"
                                />
                            </div>

                            {/* Calculation Breakdown */}
                            <div className="space-y-2.5 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs">
                                <div className="flex justify-between items-center text-purple-200">
                                    <span>Total Route Distance</span>
                                    <strong className="text-white font-mono">{testDistance} KM</strong>
                                </div>

                                <div className="flex justify-between items-center text-purple-200">
                                    <span>Free Allowance Deducted</span>
                                    <strong className="text-emerald-300 font-mono">- {simulationResult.free} KM</strong>
                                </div>

                                <div className="flex justify-between items-center text-purple-200 border-t border-white/10 pt-2">
                                    <span>Chargeable Excess Distance</span>
                                    <strong className="text-white font-mono">{simulationResult.billableKM} KM</strong>
                                </div>

                                <div className="flex justify-between items-center text-purple-200">
                                    <span>Rate Per KM Applied</span>
                                    <strong className="text-white font-mono">₹{simulationResult.rate}/KM</strong>
                                </div>

                                {/* Warning if beyond max radius */}
                                {simulationResult.isBeyondMax && (
                                    <div className="bg-rose-500/20 border border-rose-400/40 p-2.5 rounded-xl text-rose-200 flex items-start gap-2 text-[11px] mt-2">
                                        <AlertTriangle size={15} className="shrink-0 text-rose-300 mt-0.5" />
                                        <span>Exceeds max radius limit ({simulationResult.max} KM). Offline visit will be unavailable.</span>
                                    </div>
                                )}
                            </div>

                            {/* Total Result */}
                            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-white/15 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-purple-300 tracking-wider block">
                                        Calculated Travel Surcharge
                                    </span>
                                    <span className="text-xs text-purple-200/80">Added to base consultation fee</span>
                                </div>

                                <div className="text-right">
                                    {!formData.isActive ? (
                                        <span className="text-sm font-bold text-slate-300 italic">Surcharges Disabled</span>
                                    ) : (
                                        <span className="text-3xl font-black text-white tracking-tight">
                                            ₹{simulationResult.extraCharge}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Informative Guidance Card */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-3.5">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                                <Info size={16} className="text-indigo-600" />
                                How Pricing Works in Checkout
                            </h4>

                            <ul className="text-xs text-slate-500 space-y-2.5 leading-relaxed font-medium">
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <span><strong>Distance Matrix:</strong> The system measures road distance between the coach's base address and the patient's delivery location.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <span><strong>Free KM Window:</strong> No extra charge is added if the distance is within the free allowance.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <span><strong>Formula:</strong> <code>Travel Fee = (Total KM - Free KM) × Price/KM</code></span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                    <span><strong>Boundary Enforcement:</strong> If patient distance exceeds <strong>Max Service Radius</strong>, offline consultation bookings are prevented.</span>
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}