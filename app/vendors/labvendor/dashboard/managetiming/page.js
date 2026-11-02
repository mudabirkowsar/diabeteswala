"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    Clock,
    Calendar,
    Users,
    Sparkles,
    IndianRupee,
    Ban,
    CheckCircle2,
    RefreshCw,
    Loader2,
    Save,
    Plus,
    Trash2,
    Sun,
    Sunset,
    Moon,
    AlertCircle,
    Eye,
    EyeOff,
    Tag,
    X, Info
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import Lab Vendor API service functions
import LabVendorAPI from '../../../../services/LabVendorAPI';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DURATION_OPTIONS = [15, 20, 30, 45, 60];

export default function LabSlotsPage() {
    // --- Data States ---
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [togglingSlotTime, setTogglingSlotTime] = useState(null);

    // Stored config and generated slots from API
    const [generatedSlots, setGeneratedSlots] = useState([]);
    const [unavailableSlots, setUnavailableSlots] = useState([]);

    // --- Form States (Config) ---
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [slotDuration, setSlotDuration] = useState(30);
    const [maxClientsPerSlot, setMaxClientsPerSlot] = useState(3);

    // Period Toggles
    const [morningSlots, setMorningSlots] = useState(true);
    const [afternoonSlots, setAfternoonSlots] = useState(true);
    const [eveningSlots, setEveningSlots] = useState(true);

    // Off-days & Blocked Dates
    const [offDays, setOffDays] = useState(['Sunday']);
    const [blockedDates, setBlockedDates] = useState([]);
    const [newBlockedDate, setNewBlockedDate] = useState('');

    // Premium Slots
    const [premiumSlots, setPremiumSlots] = useState([]);
    const [newPremiumTime, setNewPremiumTime] = useState('08:00');
    const [newPremiumFee, setNewPremiumFee] = useState(150);

    // Filter for the live slot grid view
    const [slotFilter, setSlotFilter] = useState('All'); // 'All' | 'Morning' | 'Afternoon' | 'Evening' | 'Blocked' | 'Premium'

    // --- 1. Fetch Existing Configuration & Generated Slots ---
    const fetchSlotsData = async () => {
        setLoading(true);
        try {
            const res = await LabVendorAPI.getLabSlots();
            if (res && res.success) {
                const config = res.config || {};
                setGeneratedSlots(res.generatedSlots || []);
                setUnavailableSlots(config.unavailableSlots || []);

                // Sync config to form states if previously set
                if (config.startTime) setStartTime(config.startTime);
                if (config.endTime) setEndTime(config.endTime);
                if (config.slotDuration) setSlotDuration(config.slotDuration);
                if (config.maxClientsPerSlot !== undefined) setMaxClientsPerSlot(config.maxClientsPerSlot);

                if (config.morningSlots !== undefined) setMorningSlots(config.morningSlots);
                if (config.afternoonSlots !== undefined) setAfternoonSlots(config.afternoonSlots);
                if (config.eveningSlots !== undefined) setEveningSlots(config.eveningSlots);

                if (Array.isArray(config.offDays)) setOffDays(config.offDays);
                if (Array.isArray(config.blockedDates)) setBlockedDates(config.blockedDates);
                if (Array.isArray(config.premiumSlots)) setPremiumSlots(config.premiumSlots);
            } else {
                toast.error("Failed to load availability configuration.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error reading lab slots configuration.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSlotsData();
    }, []);

    // --- Off-Days Toggler ---
    const toggleOffDay = (day) => {
        setOffDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    // --- Blocked Dates Handlers ---
    const handleAddBlockedDate = (e) => {
        e.preventDefault();
        if (!newBlockedDate) return;
        if (blockedDates.includes(newBlockedDate)) {
            toast.error("Date already in holiday list");
            return;
        }
        setBlockedDates(prev => [...prev, newBlockedDate]);
        setNewBlockedDate('');
    };

    const handleRemoveBlockedDate = (dateToRemove) => {
        setBlockedDates(prev => prev.filter(d => d !== dateToRemove));
    };

    // --- Premium Slots Handlers ---
    const handleAddPremiumSlot = (e) => {
        e.preventDefault();
        if (!newPremiumTime) return;
        if (premiumSlots.some(p => p.time === newPremiumTime)) {
            toast.error("Premium fee already configured for this time");
            return;
        }
        setPremiumSlots(prev => [...prev, { time: newPremiumTime, extraFee: Number(newPremiumFee) || 0 }]);
    };

    const handleRemovePremiumSlot = (timeToRemove) => {
        setPremiumSlots(prev => prev.filter(p => p.time !== timeToRemove));
    };

    // --- 2. Save / Update Slots Configuration ---
    const handleSaveSchedule = async (e) => {
        e.preventDefault();

        if (startTime >= endTime) {
            toast.error("Start time must be before End time.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                startTime,
                endTime,
                slotDuration: Number(slotDuration),
                maxClientsPerSlot: Number(maxClientsPerSlot) || 0,
                morningSlots,
                afternoonSlots,
                eveningSlots,
                offDays,
                blockedDates,
                premiumSlots: premiumSlots.map(p => ({
                    time: p.time,
                    extraFee: Number(p.extraFee)
                }))
            };

            const res = await LabVendorAPI.setLabSlots(payload);
            if (res && res.success) {
                toast.success(res.message || "Operational slots updated & regenerated successfully!");
                fetchSlotsData();
            } else {
                toast.error(res?.message || "Failed to save slot settings.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error saving availability settings.");
        } finally {
            setSaving(false);
        }
    };

    // --- 3. Instant Block / Unblock Individual Slot ---
    const handleToggleSlotBlock = async (slotTime, isCurrentlyBlocked) => {
        setTogglingSlotTime(slotTime);
        try {
            if (isCurrentlyBlocked) {
                const res = await LabVendorAPI.unblockLabSlot(slotTime);
                if (res && res.success) {
                    toast.success(`Slot ${slotTime} is visible and available for booking`);
                    setUnavailableSlots(prev => prev.filter(t => t !== slotTime));
                } else {
                    toast.error(res?.message || "Failed to restore slot");
                }
            } else {
                const res = await LabVendorAPI.blockLabSlot(slotTime);
                if (res && res.success) {
                    toast.success(`Slot ${slotTime} blocked and hidden from patients`);
                    setUnavailableSlots(prev => [...prev, slotTime]);
                } else {
                    toast.error(res?.message || "Failed to block slot");
                }
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Error modifying slot visibility.");
        } finally {
            setTogglingSlotTime(null);
        }
    };

    // --- Filtered Slots for Live Preview ---
    const displayedSlots = useMemo(() => {
        return generatedSlots.filter((slot) => {
            const isBlocked = unavailableSlots.includes(slot.slotTime);
            if (slotFilter === 'Morning') return slot.category === 'Morning';
            if (slotFilter === 'Afternoon') return slot.category === 'Afternoon';
            if (slotFilter === 'Evening') return slot.category === 'Evening';
            if (slotFilter === 'Blocked') return isBlocked;
            if (slotFilter === 'Premium') return slot.isPremium;
            return true;
        });
    }, [generatedSlots, unavailableSlots, slotFilter]);

    return (
        <div className="max-w-[1600px] mx-auto space-y-8 py-6 pb-16 antialiased select-none text-left">
            <Toaster position="top-right" />

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 shrink-0 shadow-sm">
                        <Clock className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                            Lab Operational Schedule &amp; Slots
                        </h1>
                        <p className="text-xs text-slate-500 font-bold mt-1">
                            Configure operating hours, sample collection slot intervals, capacity caps, and premium surcharge windows.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchSlotsData}
                        disabled={loading}
                        className="p-3.5 rounded-2xl border border-slate-200 text-slate-600 bg-white hover:bg-slate-50 shadow-sm transition-all duration-150 cursor-pointer disabled:opacity-50"
                        title="Refresh slots"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* --- QUICK STATS SUMMARY TILES --- */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                        <Clock size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Generated Slots</span>
                        <span className="text-2xl font-black text-slate-900 font-mono">{generatedSlots.length}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                        <EyeOff size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Hidden / Blocked</span>
                        <span className="text-2xl font-black text-rose-600 font-mono">{unavailableSlots.length}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Sparkles size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Premium Surcharges</span>
                        <span className="text-2xl font-black text-amber-600 font-mono">{premiumSlots.length}</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Users size={22} />
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Max Per Slot</span>
                        <span className="text-2xl font-black text-emerald-600 font-mono">
                            {maxClientsPerSlot === 0 ? '∞ Unlimited' : maxClientsPerSlot}
                        </span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Generating Diagnostic Time Slots...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* --- LEFT 7 COLS: CONFIGURATION FORM --- */}
                    <form onSubmit={handleSaveSchedule} className="lg:col-span-7 space-y-6">

                        {/* SECTION 1: Operating Hours & Interval */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                    <Clock size={16} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                        1. Operating Window &amp; Slot Duration
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">
                                        Define daily open/close hours and sample collection time intervals
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                        Daily Opening Time (24h) *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96] font-mono"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                        Daily Closing Time (24h) *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96] font-mono"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                        Slot Duration (Minutes)
                                    </label>
                                    <select
                                        value={slotDuration}
                                        onChange={(e) => setSlotDuration(Number(e.target.value))}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96] cursor-pointer"
                                    >
                                        {DURATION_OPTIONS.map((dur) => (
                                            <option key={dur} value={dur}>
                                                {dur} Minutes per sample collection
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                        Max Patients Per Slot (0 = Unlimited)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={maxClientsPerSlot}
                                        onChange={(e) => setMaxClientsPerSlot(Number(e.target.value))}
                                        placeholder="e.g. 3"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96] font-mono"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: Shift / Day-Part Visibility */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                    <Sun size={16} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                        2. Active Day Shifts
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">
                                        Enable or disable broad time periods for appointments
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Morning */}
                                <div 
                                    onClick={() => setMorningSlots(!morningSlots)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                                        morningSlots
                                            ? 'bg-indigo-50/60 border-indigo-200 text-[#3d3f96]'
                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <Sun size={18} />
                                        <span className={`w-2 h-2 rounded-full ${morningSlots ? 'bg-[#3d3f96]' : 'bg-slate-300'}`} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Morning Shift</span>
                                        <span className="text-[10px] font-semibold opacity-75">05:00 - 11:59 AM</span>
                                    </div>
                                </div>

                                {/* Afternoon */}
                                <div 
                                    onClick={() => setAfternoonSlots(!afternoonSlots)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                                        afternoonSlots
                                            ? 'bg-indigo-50/60 border-indigo-200 text-[#3d3f96]'
                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <Sunset size={18} />
                                        <span className={`w-2 h-2 rounded-full ${afternoonSlots ? 'bg-[#3d3f96]' : 'bg-slate-300'}`} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Afternoon Shift</span>
                                        <span className="text-[10px] font-semibold opacity-75">12:00 - 04:59 PM</span>
                                    </div>
                                </div>

                                {/* Evening */}
                                <div 
                                    onClick={() => setEveningSlots(!eveningSlots)}
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-24 ${
                                        eveningSlots
                                            ? 'bg-indigo-50/60 border-indigo-200 text-[#3d3f96]'
                                            : 'bg-slate-50 border-slate-200 text-slate-400'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <Moon size={18} />
                                        <span className={`w-2 h-2 rounded-full ${eveningSlots ? 'bg-[#3d3f96]' : 'bg-slate-300'}`} />
                                    </div>
                                    <div>
                                        <span className="text-xs font-black uppercase tracking-wider block">Evening Shift</span>
                                        <span className="text-[10px] font-semibold opacity-75">05:00 - 11:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: Off-Days & Blocked Holiday Dates */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                    <Calendar size={16} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                        3. Recurring Off-Days &amp; Holiday Closures
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">
                                        Select weekly recurring off days and specific calendar blackout dates
                                    </p>
                                </div>
                            </div>

                            {/* Recurring Days */}
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                    Weekly Recurring Off-Days
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {WEEK_DAYS.map((day) => {
                                        const isOff = offDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleOffDay(day)}
                                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                                    isOff
                                                        ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-sm'
                                                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                                }`}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Blocked Calendar Dates */}
                            <div className="space-y-2 pt-3 border-t border-slate-100">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                    Specific Calendar Blackout Dates (e.g. Festival Holidays)
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={newBlockedDate}
                                        onChange={(e) => setNewBlockedDate(e.target.value)}
                                        className="w-full sm:w-64 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddBlockedDate}
                                        className="px-4 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm"
                                    >
                                        <Plus size={14} /> Add Date
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {blockedDates.map((dateStr) => (
                                        <span
                                            key={dateStr}
                                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold"
                                        >
                                            <Calendar size={12} className="text-slate-400" />
                                            {dateStr}
                                            <X
                                                size={13}
                                                className="cursor-pointer hover:text-rose-600 ml-0.5"
                                                onClick={() => handleRemoveBlockedDate(dateStr)}
                                            />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Premium Slots Surcharge */}
                        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center shrink-0">
                                    <IndianRupee size={16} />
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                        4. Premium Slot Surcharges
                                    </h3>
                                    <p className="text-[11px] text-slate-400 font-semibold">
                                        Apply premium surge charges for early morning or late evening bookings
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="w-full sm:w-1/2 space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                        Slot Start Time (24h)
                                    </label>
                                    <input
                                        type="time"
                                        value={newPremiumTime}
                                        onChange={(e) => setNewPremiumTime(e.target.value)}
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                    />
                                </div>

                                <div className="w-full sm:w-1/2 space-y-1">
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                                        Extra Fee (₹)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={newPremiumFee}
                                        onChange={(e) => setNewPremiumFee(e.target.value)}
                                        placeholder="150"
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:bg-white focus:outline-none focus:border-[#3d3f96]"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddPremiumSlot}
                                    className="w-full sm:w-auto mt-auto px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-sm"
                                >
                                    <Plus size={14} /> Add Surcharge
                                </button>
                            </div>

                            {/* Configured Premium Slots List */}
                            <div className="flex flex-wrap gap-2 pt-2">
                                {premiumSlots.map((prem) => (
                                    <div
                                        key={prem.time}
                                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold shadow-sm"
                                    >
                                        <Sparkles size={13} className="text-amber-600" />
                                        <span className="font-mono">{prem.time}</span>
                                        <span className="text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                                            +₹{prem.extraFee}
                                        </span>
                                        <X
                                            size={13}
                                            className="cursor-pointer hover:text-rose-600 ml-1"
                                            onClick={() => handleRemovePremiumSlot(prem.time)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save Action Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:w-auto px-8 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-2xl transition-all shadow-lg shadow-indigo-950/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                <span>{saving ? 'Regenerating Time Slots...' : 'SAVE SCHEDULE & REGENERATE SLOTS'}</span>
                            </button>
                        </div>

                    </form>

                    {/* --- RIGHT 5 COLS: LIVE SLOTS MATRIX & INSTANT BLOCKER --- */}
                    <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-5">
                        
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight uppercase">
                                    Generated Slots ({displayedSlots.length})
                                </h3>
                                <p className="text-[11px] text-slate-400 font-semibold">
                                    Click any slot to block or restore patient booking availability
                                </p>
                            </div>
                        </div>

                        {/* Slot Filter Pills */}
                        <div className="flex flex-wrap gap-1.5">
                            {['All', 'Morning', 'Afternoon', 'Evening', 'Blocked', 'Premium'].map((flt) => (
                                <button
                                    key={flt}
                                    type="button"
                                    onClick={() => setSlotFilter(flt)}
                                    className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        slotFilter === flt
                                            ? 'bg-[#3d3f96] text-white shadow-sm'
                                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                                    }`}
                                >
                                    {flt}
                                </button>
                            ))}
                        </div>

                        {/* Slot Cards List */}
                        {displayedSlots.length === 0 ? (
                            <div className="py-16 text-center text-slate-400 text-xs font-medium">
                                No slots found for this category filter.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[680px] overflow-y-auto pr-1">
                                {displayedSlots.map((slot) => {
                                    const isBlocked = unavailableSlots.includes(slot.slotTime);
                                    const isToggling = togglingSlotTime === slot.slotTime;

                                    return (
                                        <div
                                            key={slot.slotTime}
                                            onClick={() => !isToggling && handleToggleSlotBlock(slot.slotTime, isBlocked)}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer select-none relative group ${
                                                isBlocked
                                                    ? 'bg-rose-50/50 border-rose-200 opacity-60 hover:opacity-100'
                                                    : slot.isPremium
                                                    ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                                                    : 'bg-slate-50/80 border-slate-200 hover:border-[#3d3f96]/50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-mono font-black text-xs text-slate-800">
                                                    {slot.slotTime}
                                                </span>
                                                {isToggling ? (
                                                    <Loader2 size={13} className="animate-spin text-[#3d3f96]" />
                                                ) : isBlocked ? (
                                                    <span className="text-[9px] font-black uppercase text-rose-600 flex items-center gap-1">
                                                        <EyeOff size={11} /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-black uppercase text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 size={11} /> Open
                                                    </span>
                                                )}
                                            </div>

                                            <div className="text-[10px] text-slate-500 font-medium mt-1 truncate">
                                                {slot.displayTime || `${slot.slotTime} (${slot.category})`}
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/50 text-[10px]">
                                                <span className="text-slate-400 font-semibold">{slot.category}</span>
                                                {slot.isPremium ? (
                                                    <span className="text-amber-700 font-black flex items-center gap-0.5">
                                                        <Sparkles size={10} /> +₹{slot.extraFee}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">Standard</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-2">
                            <Info size={14} className="text-[#3d3f96] shrink-0" />
                            <span>
                                <strong>Tip:</strong> Click on any slot to toggle between <strong>Open</strong> and <strong>Blocked</strong> without needing to regenerate the whole schedule.
                            </span>
                        </div>

                    </div>

                </div>
            )}

        </div>
    );
}