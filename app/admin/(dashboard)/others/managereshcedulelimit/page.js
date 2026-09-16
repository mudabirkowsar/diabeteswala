"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarClock,
    Save,
    Loader2,
    ShieldCheck,
    AlertCircle,
    RefreshCw,
    Sliders,
    CheckCircle2,
    Info,
    Stethoscope,
    Sparkles,
    Calendar,
    Users
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Admin API service
import AdminAPI from '../../../../services/AdminAPI'; // Adjust relative path based on folder depth

export default function DoctorReschedulePolicyPage() {
    // --- Data & Loading States ---
    const [currentLimit, setCurrentLimit] = useState(2); // Default fallback is 2
    const [inputLimit, setInputLimit] = useState('2');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // --- 1. Fetch Current Reschedule Limit ---
    const fetchRescheduleLimit = async () => {
        setLoading(true);
        try {
            const response = await AdminAPI.getDoctorRescheduleLimit();
            if (response && response.success) {
                const limitVal = response.data?.maxRescheduleLimit ?? 2;
                setCurrentLimit(limitVal);
                setInputLimit(String(limitVal));
            } else {
                toast.error("Unable to load active reschedule policy.");
            }
        } catch (err) {
            console.error("Error fetching reschedule limit:", err);
            toast.error(err.response?.data?.message || "Failed to retrieve reschedule policy rules.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRescheduleLimit();
    }, []);

    // --- 2. Update Reschedule Limit Handler ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const numLimit = Number(inputLimit);
        if (isNaN(numLimit) || numLimit < 1) {
            toast.error("Please enter a valid limit (minimum 1 time).");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                limit: numLimit
            };
            const response = await AdminAPI.updateDoctorRescheduleLimit(payload);
            if (response && response.success) {
                toast.success(response.message || `Reschedule limit successfully set to ${numLimit} times.`);
                setCurrentLimit(numLimit);
            } else {
                toast.error(response?.message || "Failed to update reschedule limit.");
            }
        } catch (err) {
            console.error("Error updating reschedule limit:", err);
            toast.error(err.response?.data?.message || "Failed to update global reschedule policy.");
        } finally {
            setSaving(false);
        }
    };

    // Quick presets for fast configuration
    const presetValues = [1, 2, 3, 4, 5];

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 py-4 pb-12 antialiased select-none text-left text-slate-800">
            <Toaster position="top-right" />

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
                        <CalendarClock className="w-7 h-7" strokeWidth={2} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                                Doctor Reschedule Policy
                            </h1>
                            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black uppercase text-red-600 bg-red-50/60 border border-red-200/60 px-2.5 py-0.5 rounded-full shadow-xs">
                                <Sparkles size={11} className="animate-pulse" /> Role Tab: 31 
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Configure platform-wide global limits for patient appointment rescheduling and cancellation allowances .
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button
                        onClick={fetchRescheduleLimit}
                        disabled={loading}
                        className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
                        title="Refresh Policy"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* --- MAIN WORKSPACE SPLIT GRID --- */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Reading active policy configuration...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* COLUMN A: CURRENT ACTIVE OVERVIEW CARD (5/12) */}
                    <div className="lg:col-span-5 space-y-6">

                        {/* Policy Status Monograph Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-150 p-6 sm:p-8 shadow-sm space-y-6">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                                <div className="space-y-0.5">
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Policy Status</span>
                                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Sliders size={18} className="text-[#3d3f96]" /> Global Configuration 
                                    </h3>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Active Policy
                                </span>
                            </div>

                            {/* Prominent Current Metric Display */}
                            <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 p-6 rounded-3xl border border-slate-150 text-center space-y-1.5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                                    Maximum Allowed Reschedules Per Appointment 
                                </span>
                                <div className="flex items-center justify-center gap-2 pt-1">
                                    <strong className="text-5xl sm:text-6xl font-black font-mono text-[#3d3f96]">
                                        {currentLimit}
                                    </strong>
                                    <span className="text-sm font-black uppercase text-slate-500 self-end mb-2">
                                        Time{currentLimit > 1 ? 's' : ''}
                                    </span>
                                </div>
                                <p className="text-[11px] text-slate-500 font-semibold pt-1">
                                    Applies universally to all online teleconsults, clinic visits, and home bookings.
                                </p>
                            </div>

                            {/* Operational Scenarios List */}
                            <div className="space-y-3 pt-2">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                                    Policy Enforcement Rules
                                </span>

                                <div className="space-y-2.5 text-xs">
                                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                                        <p className="text-slate-600 font-semibold leading-relaxed">
                                            Patients can reschedule an appointment up to <strong className="text-slate-900">{currentLimit} time{currentLimit > 1 ? 's' : ''}</strong> without booking forfeiture.
                                        </p>
                                    </div>

                                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5">
                                        <AlertCircle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                                        <p className="text-slate-600 font-semibold leading-relaxed">
                                            Once the <strong className="text-slate-900">{currentLimit} reschedule threshold</strong> is exceeded, patients will be locked from further date/time alterations.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Standard Compliance Notice */}
                        <div className="bg-emerald-50 border border-emerald-100 rounded-3xl p-5 flex items-start gap-3">
                            <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={20} />
                            <div className="space-y-0.5 text-left">
                                <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">
                                    Fair Doctor Scheduling Standard
                                </span>
                                <p className="text-xs text-emerald-700/90 font-medium leading-relaxed">
                                    Enforcing a reschedule cap minimizes doctor idle time and protects specialist consultation calendars against chronic slot blocking.
                                </p>
                            </div>
                        </div>

                    </div>

                    {/* COLUMN B: INTERACTIVE UPDATE FORM (7/12) */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6 text-left">

                            <div className="border-b border-slate-50 pb-4">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <Stethoscope size={20} className="text-[#3d3f96]" /> Modify Policy Threshold
                                </h3>
                                <p className="text-xs text-slate-400 font-semibold mt-1">
                                    Enter a new global numeric limit or select from one of the fast presets below .
                                </p>
                            </div>

                            <form onSubmit={handleFormSubmit} className="space-y-6">

                                {/* Quick Preset Buttons */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        Fast Presets
                                    </label>
                                    <div className="grid grid-cols-5 gap-2.5">
                                        {presetValues.map((val) => {
                                            const isSelected = Number(inputLimit) === val;
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => setInputLimit(String(val))}
                                                    className={`py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 border cursor-pointer ${isSelected
                                                            ? 'bg-red-50/60 text-red-600 border-red-200/60 font-black shadow-sm scale-[1.02]'
                                                            : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    {val}x
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Custom Numeric Input */}
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                        Custom Reschedule Limit * (Integer $\ge$ 1) 
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="1"
                                            step="1"
                                            value={inputLimit}
                                            onChange={(e) => setInputLimit(e.target.value)}
                                            placeholder="e.g. 3"
                                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-black text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white transition shadow-inner font-mono"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase pointer-events-none">
                                            Times Allowed
                                        </span>
                                    </div>
                                </div>

                                {/* Advisory Note */}
                                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-2.5 text-xs text-slate-500">
                                    <Info size={16} className="text-[#3d3f96] shrink-0 mt-0.5" />
                                    <p className="leading-relaxed font-medium">
                                        Updating this configuration directly overrides the active limit in the backend database. Existing booked appointments will instantly respect the newly configured threshold during subsequent reschedule attempts.
                                    </p>
                                </div>

                                {/* Submit Action */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="submit"
                                        disabled={saving || Number(inputLimit) === currentLimit}
                                        className="w-full sm:w-auto px-8 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/15 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                                    >
                                        {saving ? (
                                            <Loader2 size={15} className="animate-spin text-white" />
                                        ) : (
                                            <Save size={15} />
                                        )}
                                        <span>Apply Policy Update </span>
                                    </button>
                                </div>

                            </form>

                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}