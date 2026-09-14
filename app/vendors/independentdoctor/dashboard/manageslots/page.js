'use client';

import React, { useState, useEffect } from 'react';
import IndependentDoctorAPI from '../../../../services/IndependentDoctorAPI';
import {
    Clock,
    Calendar,
    DollarSign,
    Sun,
    Sunrise,
    Sunset,
    Plus,
    Trash2,
    Save,
    RotateCcw,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Ban,
    Sparkles,
    CalendarDays,
    Coffee,
    Zap
} from 'lucide-react';

const WEEK_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DoctorSlotsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [slotActionLoading, setSlotActionLoading] = useState(null); // holds slot time currently being blocked/unblocked
    const [feedback, setFeedback] = useState({ type: '', message: '' });

    // Active Category Filter for Live Grid
    const [categoryFilter, setCategoryFilter] = useState('All');

    // 1. Shift & Working Hours Config
    const [config, setConfig] = useState({
        startTime: '09:00',
        endTime: '20:00',
        slotDuration: 30,
        morningSlots: true,
        afternoonSlots: true,
        eveningSlots: true,
        offDays: ['Sunday'],
        blockedDates: [],
        unavailableSlots: [],
    });

    // 2. Premium Slots Array: [{ time: "18:00", extraFee: 200 }]
    const [premiumSlots, setPremiumSlots] = useState([]);
    const [newPremiumTime, setNewPremiumTime] = useState('');
    const [newPremiumFee, setNewPremiumFee] = useState('');

    // 3. Blocked Dates State
    const [newBlockedDate, setNewBlockedDate] = useState('');

    // 4. Live Generated Slots from Backend
    const [generatedSlots, setGeneratedSlots] = useState([]);

    // Fetch live slots & configuration on load
    useEffect(() => {
        fetchSlotsAndConfig();
    }, []);

    const fetchSlotsAndConfig = async () => {
        setLoading(true);
        try {
            const res = await IndependentDoctorAPI.getMyDoctorSlots();
            if (res?.success) {
                if (res.config) {
                    setConfig({
                        startTime: res.config.startTime || '09:00',
                        endTime: res.config.endTime || '20:00',
                        slotDuration: res.config.slotDuration || 30,
                        morningSlots: res.config.morningSlots ?? true,
                        afternoonSlots: res.config.afternoonSlots ?? true,
                        eveningSlots: res.config.eveningSlots ?? true,
                        offDays: res.config.offDays || ['Sunday'],
                        blockedDates: res.config.blockedDates || [],
                        unavailableSlots: res.config.unavailableSlots || [],
                    });

                    // Parse premium slots if present in config
                    if (Array.isArray(res.config.premiumSlots)) {
                        setPremiumSlots(res.config.premiumSlots);
                    }
                }

                if (Array.isArray(res.generatedSlots)) {
                    setGeneratedSlots(res.generatedSlots);
                }
            }
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || 'Failed to load doctor slot schedule.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Toggle Weekly Off Day
    const toggleOffDay = (day) => {
        if (config.offDays.includes(day)) {
            setConfig({ ...config, offDays: config.offDays.filter((d) => d !== day) });
        } else {
            setConfig({ ...config, offDays: [...config.offDays, day] });
        }
    };

    // Add Blocked Holiday Date
    const handleAddBlockedDate = () => {
        if (newBlockedDate && !config.blockedDates.includes(newBlockedDate)) {
            setConfig({
                ...config,
                blockedDates: [...config.blockedDates, newBlockedDate],
            });
            setNewBlockedDate('');
        }
    };

    // Remove Blocked Holiday Date
    const handleRemoveBlockedDate = (dateToRemove) => {
        setConfig({
            ...config,
            blockedDates: config.blockedDates.filter((d) => d !== dateToRemove),
        });
    };

    // Add Premium Surcharge Slot
    const handleAddPremiumSlot = () => {
        if (!newPremiumTime) return;
        const fee = Number(newPremiumFee) || 0;

        // Check duplicate time
        const exists = premiumSlots.some((p) => p.time === newPremiumTime);
        if (exists) {
            setPremiumSlots(
                premiumSlots.map((p) => (p.time === newPremiumTime ? { ...p, extraFee: fee } : p))
            );
        } else {
            setPremiumSlots([...premiumSlots, { time: newPremiumTime, extraFee: fee }]);
        }
        setNewPremiumTime('');
        setNewPremiumFee('');
    };

    // Remove Premium Slot
    const handleRemovePremiumSlot = (time) => {
        setPremiumSlots(premiumSlots.filter((p) => p.time !== time));
    };

    // Save Overall Availability Configuration
    const handleSaveAvailability = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        setFeedback({ type: '', message: '' });

        try {
            const payload = {
                startTime: config.startTime,
                endTime: config.endTime,
                slotDuration: Number(config.slotDuration) || 30,
                morningSlots: Boolean(config.morningSlots),
                afternoonSlots: Boolean(config.afternoonSlots),
                eveningSlots: Boolean(config.eveningSlots),
                offDays: config.offDays,
                blockedDates: config.blockedDates,
                premiumSlots: premiumSlots.map((p) => ({
                    time: p.time,
                    extraFee: Number(p.extraFee) || 0,
                })),
            };

            const res = await IndependentDoctorAPI.setDoctorAvailability(payload);
            setFeedback({
                type: 'success',
                message: res.message || 'Doctor availability and shift timings saved successfully!',
            });

            // Refresh live slots
            await fetchSlotsAndConfig();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || 'Failed to update doctor availability settings.',
            });
        } finally {
            setSaving(false);
        }
    };

    // Block a specific time slot (Break / Emergency)
    const handleBlockSlot = async (time) => {
        setSlotActionLoading(time);
        try {
            const res = await IndependentDoctorAPI.blockDoctorSlot({ time });
            setFeedback({
                type: 'success',
                message: res.message || `Slot ${time} blocked for appointments.`,
            });
            // Update local unavailable array and refresh
            setConfig((prev) => ({
                ...prev,
                unavailableSlots: [...prev.unavailableSlots, time],
            }));
            await fetchSlotsAndConfig();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || `Failed to block slot ${time}.`,
            });
        } finally {
            setSlotActionLoading(null);
        }
    };

    // Unblock a specific time slot
    const handleUnblockSlot = async (time) => {
        setSlotActionLoading(time);
        try {
            const res = await IndependentDoctorAPI.unblockDoctorSlot({ time });
            setFeedback({
                type: 'success',
                message: res.message || `Slot ${time} is now available again.`,
            });
            // Update local unavailable array and refresh
            setConfig((prev) => ({
                ...prev,
                unavailableSlots: prev.unavailableSlots.filter((t) => t !== time),
            }));
            await fetchSlotsAndConfig();
        } catch (error) {
            setFeedback({
                type: 'error',
                message: error?.response?.data?.message || `Failed to unblock slot ${time}.`,
            });
        } finally {
            setSlotActionLoading(null);
        }
    };

    // Filter slots for the live preview grid
    const filteredSlots = generatedSlots.filter((slot) => {
        if (categoryFilter === 'All') return true;
        if (categoryFilter === 'Morning') return slot.category === 'Morning';
        if (categoryFilter === 'Afternoon') return slot.category === 'Afternoon';
        if (categoryFilter === 'Evening') return slot.category === 'Evening';
        if (categoryFilter === 'Premium') return slot.extraFee > 0;
        if (categoryFilter === 'Blocked') return config.unavailableSlots.includes(slot.time);
        return true;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
                <Loader2 className="w-10 h-10 text-[#3d3f96] animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-600">Loading doctor shifts & slot planner...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-2.5">
                            <div className="w-10 h-10 rounded-xl bg-[#3d3f96]/10 flex items-center justify-center text-[#3d3f96]">
                                <Clock className="w-6 h-6" />
                            </div>
                            Slots, Shifts & Premium Pricing
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Configure daily OPD hours, shift switches, weekly leaves, emergency breaks, and surcharge time slots.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={fetchSlotsAndConfig}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl shadow-sm transition"
                        >
                            <RotateCcw className="w-4 h-4" /> Refresh
                        </button>

                        <button
                            type="button"
                            onClick={handleSaveAvailability}
                            disabled={saving}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2e3077] text-white font-bold text-sm rounded-xl shadow-md transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {saving ? 'Saving...' : 'Save Availability'}
                        </button>
                    </div>
                </div>

                {/* Feedback Notification Banner */}
                {feedback.message && (
                    <div
                        className={`p-4 rounded-xl flex items-start gap-3 border ${
                            feedback.type === 'success'
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : 'bg-[#e53e3e]/10 border-[#e53e3e]/30 text-[#e53e3e]'
                        }`}
                    >
                        {feedback.type === 'success' ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        ) : (
                            <AlertCircle className="w-5 h-5 text-[#e53e3e] mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                            <p className="text-sm font-semibold">{feedback.message}</p>
                        </div>
                    </div>
                )}

                {/* TOP ROW: CONFIGURATION & PREMIUM SURCHARGES */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* COL 1 & 2: WORKING HOURS & SHIFT SWITCHES */}
                    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[#3d3f96]" />
                                Working Hours & Consultation Windows
                            </h2>
                            <span className="text-xs text-slate-400 font-medium">24-Hour Format</span>
                        </div>

                        {/* Start Time, End Time, Duration */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Start Time</label>
                                <input
                                    type="time"
                                    value={config.startTime}
                                    onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none bg-white font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">End Time</label>
                                <input
                                    type="time"
                                    value={config.endTime}
                                    onChange={(e) => setConfig({ ...config, endTime: e.target.value })}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none bg-white font-semibold"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1.5">Patient Slot Duration</label>
                                <select
                                    value={config.slotDuration}
                                    onChange={(e) => setConfig({ ...config, slotDuration: Number(e.target.value) })}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#3d3f96] focus:outline-none bg-white font-semibold"
                                >
                                    <option value={15}>15 Minutes</option>
                                    <option value={30}>30 Minutes</option>
                                    <option value={45}>45 Minutes</option>
                                    <option value={60}>60 Minutes (1 Hour)</option>
                                </select>
                            </div>
                        </div>

                        {/* Shift Switches */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-3">Active Shift Toggles</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {/* Morning */}
                                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                                            <Sunrise className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Morning</p>
                                            <p className="text-[10px] text-slate-400">05:00 - 12:00</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.morningSlots}
                                            onChange={(e) => setConfig({ ...config, morningSlots: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3f96]"></div>
                                    </label>
                                </div>

                                {/* Afternoon */}
                                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                                            <Sun className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Afternoon</p>
                                            <p className="text-[10px] text-slate-400">12:00 - 17:00</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.afternoonSlots}
                                            onChange={(e) => setConfig({ ...config, afternoonSlots: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3f96]"></div>
                                    </label>
                                </div>

                                {/* Evening */}
                                <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                                            <Sunset className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">Evening</p>
                                            <p className="text-[10px] text-slate-400">17:00 - 23:00</p>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.eveningSlots}
                                            onChange={(e) => setConfig({ ...config, eveningSlots: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#3d3f96]"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Weekly Off Days */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Weekly Off Days</label>
                            <div className="flex flex-wrap gap-2">
                                {WEEK_DAYS.map((day) => {
                                    const isOff = config.offDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleOffDay(day)}
                                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg border transition ${
                                                isOff
                                                    ? 'bg-[#e53e3e]/10 border-[#e53e3e]/30 text-[#e53e3e]'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                            }`}
                                        >
                                            {day} {isOff ? '• Off' : ''}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Custom Blocked Holiday Dates */}
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2">Custom Holiday / Blocked Dates</label>
                            <div className="flex gap-2 mb-2">
                                <input
                                    type="date"
                                    value={newBlockedDate}
                                    onChange={(e) => setNewBlockedDate(e.target.value)}
                                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3d3f96] bg-white font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddBlockedDate}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#3d3f96] text-white text-xs font-bold rounded-lg hover:bg-[#2e3077] transition"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Date
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {config.blockedDates.map((date) => (
                                    <span
                                        key={date}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-md text-xs font-semibold"
                                    >
                                        <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                                        {date}
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBlockedDate(date)}
                                            className="text-[#e53e3e] hover:text-[#c53030] font-bold"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* COL 3: PREMIUM SLOTS PRICING MANAGER */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between space-y-4">
                        <div>
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#3d3f96]" />
                                    Premium Surcharge Slots
                                </h2>
                                <span className="text-xs bg-[#3d3f96]/10 text-[#3d3f96] font-bold px-2 py-0.5 rounded-full">
                                    Extra ₹
                                </span>
                            </div>

                            <p className="text-xs text-slate-500 mb-4">
                                Set higher fees for high-demand evening hours or prime consult slots.
                            </p>

                            {/* Add Premium Slot Input */}
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3 mb-4">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Time (24h)</label>
                                        <input
                                            type="time"
                                            value={newPremiumTime}
                                            onChange={(e) => setNewPremiumTime(e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-semibold focus:ring-1 focus:ring-[#3d3f96]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-600 mb-1">Extra Fee (₹)</label>
                                        <input
                                            type="number"
                                            placeholder="200"
                                            value={newPremiumFee}
                                            onChange={(e) => setNewPremiumFee(e.target.value)}
                                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-md bg-white font-semibold focus:ring-1 focus:ring-[#3d3f96]"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddPremiumSlot}
                                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 bg-[#3d3f96] hover:bg-[#2e3077] text-white text-xs font-bold rounded-lg transition shadow-sm"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add Surcharge Slot
                                </button>
                            </div>

                            {/* Premium Slots List */}
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                {premiumSlots.length === 0 ? (
                                    <div className="text-center py-6 text-xs text-slate-400">
                                        No premium slots configured yet.
                                    </div>
                                ) : (
                                    premiumSlots.map((ps) => (
                                        <div
                                            key={ps.time}
                                            className="flex items-center justify-between p-2.5 bg-white border border-[#3d3f96]/20 rounded-lg shadow-sm"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Zap className="w-3.5 h-3.5 text-[#3d3f96]" />
                                                <span className="text-xs font-bold text-slate-800">{ps.time}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs font-extrabold text-[#3d3f96]">
                                                    + ₹{ps.extraFee}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePremiumSlot(ps.time)}
                                                    className="text-[#e53e3e] hover:text-[#c53030] p-1 rounded hover:bg-[#e53e3e]/10 transition"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-100">
                            *Extra surcharge is added on top of your normal base consultation rates.
                        </p>
                    </div>
                </div>

                {/* BOTTOM SECTION: LIVE GENERATED SLOTS & BREAK MANAGEMENT */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#3d3f96]" />
                                Live Generated Slots & Quick Break Manager
                            </h2>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Click on any slot to temporarily <b>Block for Break</b> or <b>Unblock</b> for appointments.
                            </p>
                        </div>

                        {/* Filter Tabs */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                            {['All', 'Morning', 'Afternoon', 'Evening', 'Premium', 'Blocked'].map((filter) => (
                                <button
                                    key={filter}
                                    type="button"
                                    onClick={() => setCategoryFilter(filter)}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-lg whitespace-nowrap transition ${
                                        categoryFilter === filter
                                            ? 'bg-[#3d3f96] text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Slots Grid */}
                    {filteredSlots.length === 0 ? (
                        <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-semibold text-slate-700">No generated slots match this filter.</p>
                            <p className="text-xs text-slate-400 mt-1">Adjust your daily start/end timings or shift switches above.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {filteredSlots.map((slot) => {
                                const isBlocked = config.unavailableSlots.includes(slot.time);
                                const isPremium = slot.extraFee > 0;
                                const isActionInProgress = slotActionLoading === slot.time;

                                return (
                                    <div
                                        key={slot.time}
                                        className={`p-3 rounded-xl border transition flex flex-col justify-between relative ${
                                            isBlocked
                                                ? 'bg-[#e53e3e]/5 border-[#e53e3e]/30 text-[#e53e3e]'
                                                : isPremium
                                                ? 'bg-[#3d3f96]/5 border-[#3d3f96]/40 text-slate-800'
                                                : 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-slate-500 uppercase">
                                                {slot.category}
                                            </span>
                                            {isPremium && (
                                                <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold bg-[#3d3f96] text-white px-1.5 py-0.5 rounded">
                                                    +₹{slot.extraFee}
                                                </span>
                                            )}
                                        </div>

                                        <div className="my-1">
                                            <p className={`text-base font-extrabold ${isBlocked ? 'text-[#e53e3e] line-through' : 'text-slate-900'}`}>
                                                {slot.time}
                                            </p>
                                            <p className="text-[10px] font-semibold mt-0.5">
                                                {isBlocked ? (
                                                    <span className="text-[#e53e3e] flex items-center gap-1">
                                                        <Ban className="w-3 h-3" /> Blocked
                                                    </span>
                                                ) : (
                                                    <span className="text-emerald-600 flex items-center gap-1">
                                                        <CheckCircle2 className="w-3 h-3" /> Available
                                                    </span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Action Button: Block / Unblock */}
                                        <div className="mt-3 pt-2 border-t border-slate-100">
                                            {isBlocked ? (
                                                <button
                                                    type="button"
                                                    disabled={isActionInProgress}
                                                    onClick={() => handleUnblockSlot(slot.time)}
                                                    className="w-full py-1 text-[11px] font-bold rounded bg-white border border-[#e53e3e]/40 text-[#e53e3e] hover:bg-[#e53e3e] hover:text-white transition disabled:opacity-50"
                                                >
                                                    {isActionInProgress ? 'Unblocking...' : 'Unblock'}
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={isActionInProgress}
                                                    onClick={() => handleBlockSlot(slot.time)}
                                                    className="w-full py-1 text-[11px] font-bold rounded bg-slate-50 border border-slate-200 text-slate-600 hover:bg-[#e53e3e]/10 hover:text-[#e53e3e] hover:border-[#e53e3e]/30 transition disabled:opacity-50 flex items-center justify-center gap-1"
                                                >
                                                    <Coffee className="w-3 h-3" />
                                                    {isActionInProgress ? 'Blocking...' : 'Take Break'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}