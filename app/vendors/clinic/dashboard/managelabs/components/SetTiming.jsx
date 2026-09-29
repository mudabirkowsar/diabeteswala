"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Clock,
    Calendar,
    CalendarOff,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    Eye,
    EyeOff,
    Plus,
    Sunrise,
    Sun,
    Sunset,
    Users,
    Sliders,
    Check,
    Save,
    RotateCcw,
    Activity
} from "lucide-react";

import ClinicAPI from "../../../../../services/ClinicAPI"; // Adjust path if needed

const WEEK_DAYS = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

// Helper: Convert 24-hour (HH:mm) to 12-hour formatted string (hh:mm A)
const formatTo12Hour = (time24) => {
    if (!time24) return "";
    const [hours, minutes] = time24.split(":");
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return `${String(h).padStart(2, "0")}:${minutes || "00"} ${ampm}`;
};

export default function SetTiming({ isOpen, onClose, onToast }) {
    const [activeTab, setActiveTab] = useState("config"); // 'config' | 'live-slots'
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [actionLoadingSlot, setActionLoadingSlot] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // Lab Profile Info
    const [labInfo, setLabInfo] = useState({
        labId: "",
        name: "Clinic Lab",
        displayTiming: ""
    });

    // Configuration Form State
    const [formData, setFormData] = useState({
        is24x7: false,
        openingTime: "08:00 AM",
        closeTime: "08:00 PM",
        holiday: "Sunday",
        startTime: "08:00",
        endTime: "20:00",
        slotDuration: 30,
        maxClientsPerSlot: 2,
        morningSlots: true,
        afternoonSlots: true,
        eveningSlots: false,
        offDays: ["Sunday"],
        blockedDates: [],
        premiumSlots: []
    });

    // Generated & Blocked Slots State
    const [generatedSlots, setGeneratedSlots] = useState([]);
    const [unavailableSlots, setUnavailableSlots] = useState([]);
    const [slotCategoryFilter, setSlotCategoryFilter] = useState("All");

    // Dynamic inputs
    const [newBlockedDate, setNewBlockedDate] = useState("");
    const [newPremiumTime, setNewPremiumTime] = useState("08:00");
    const [newPremiumFee, setNewPremiumFee] = useState(100);

    const modalRef = useRef(null);

    // ========================================================
    // 1. FETCH CLINIC LAB TIMINGS & SLOTS (API 1)
    // ========================================================
    const fetchTimingsData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await ClinicAPI.getClinicLabTimingsAndSlots();

            if (response && response.success && response.data) {
                const data = response.data;
                const config = data.config || {};

                setLabInfo({
                    labId: data.labId || "",
                    name: data.name || "Clinic Diagnostic Lab",
                    displayTiming: data.displayTiming || `${data.openingTime || "08:00 AM"} - ${data.closeTime || "08:00 PM"}`
                });

                setFormData({
                    is24x7: Boolean(data.is24x7 ?? config.is24x7),
                    openingTime: data.openingTime || "08:00 AM",
                    closeTime: data.closeTime || "08:00 PM",
                    holiday: data.holiday || "Sunday",
                    startTime: config.startTime || "08:00",
                    endTime: config.endTime || "20:00",
                    slotDuration: config.slotDuration || 30,
                    maxClientsPerSlot: config.maxClientsPerSlot !== undefined ? config.maxClientsPerSlot : 2,
                    morningSlots: config.morningSlots ?? true,
                    afternoonSlots: config.afternoonSlots ?? true,
                    eveningSlots: config.eveningSlots ?? false,
                    offDays: Array.isArray(config.offDays) && config.offDays.length > 0 ? config.offDays : [data.holiday || "Sunday"],
                    blockedDates: Array.isArray(config.blockedDates) ? config.blockedDates : [],
                    premiumSlots: Array.isArray(config.premiumSlots) ? config.premiumSlots : []
                });

                setGeneratedSlots(data.generatedSlots || []);
                setUnavailableSlots(config.unavailableSlots || []);
            }
        } catch (err) {
            console.error("Error fetching clinic lab timings:", err);
            setError(err.response?.data?.message || "Failed to load clinic lab timings.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchTimingsData();
        }
    }, [isOpen, fetchTimingsData]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen, onClose]);

    // ========================================================
    // 2. TOGGLE & LOCAL FORM HANDLERS
    // ========================================================
    const handleStartTimeChange = (e) => {
        const val = e.target.value;
        setFormData((prev) => ({
            ...prev,
            startTime: val,
            openingTime: formatTo12Hour(val)
        }));
    };

    const handleEndTimeChange = (e) => {
        const val = e.target.value;
        setFormData((prev) => ({
            ...prev,
            endTime: val,
            closeTime: formatTo12Hour(val)
        }));
    };

    const toggleOffDay = (day) => {
        setFormData((prev) => {
            const exists = prev.offDays.includes(day);
            const updatedOffDays = exists
                ? prev.offDays.filter((d) => d !== day)
                : [...prev.offDays, day];

            return {
                ...prev,
                offDays: updatedOffDays,
                holiday: updatedOffDays.length > 0 ? updatedOffDays[0] : "None"
            };
        });
    };

    const handleAddBlockedDate = () => {
        if (!newBlockedDate) return;
        if (formData.blockedDates.includes(newBlockedDate)) {
            setError("This date is already listed as a holiday.");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            blockedDates: [...prev.blockedDates, newBlockedDate]
        }));
        setNewBlockedDate("");
    };

    const handleRemoveBlockedDate = (dateToRemove) => {
        setFormData((prev) => ({
            ...prev,
            blockedDates: prev.blockedDates.filter((d) => d !== dateToRemove)
        }));
    };

    const handleAddPremiumSlot = () => {
        if (!newPremiumTime) return;
        const fee = Number(newPremiumFee) || 0;
        if (formData.premiumSlots.some((p) => p.time === newPremiumTime)) {
            setError("A surcharge is already attached to this time slot.");
            return;
        }
        setFormData((prev) => ({
            ...prev,
            premiumSlots: [...prev.premiumSlots, { time: newPremiumTime, extraFee: fee }]
        }));
    };

    const handleRemovePremiumSlot = (timeToRemove) => {
        setFormData((prev) => ({
            ...prev,
            premiumSlots: prev.premiumSlots.filter((p) => p.time !== timeToRemove)
        }));
    };

    // ========================================================
    // 3. UPDATE CLINIC LAB TIMINGS & SLOTS (API 2)
    // ========================================================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const payload = {
                is24x7: Boolean(formData.is24x7),
                openingTime: formData.openingTime || formatTo12Hour(formData.startTime),
                closeTime: formData.closeTime || formatTo12Hour(formData.endTime),
                holiday: formData.holiday || (formData.offDays.length > 0 ? formData.offDays[0] : "Sunday"),
                startTime: formData.startTime,
                endTime: formData.endTime,
                slotDuration: Number(formData.slotDuration),
                maxClientsPerSlot: Number(formData.maxClientsPerSlot),
                morningSlots: Boolean(formData.morningSlots),
                afternoonSlots: Boolean(formData.afternoonSlots),
                eveningSlots: Boolean(formData.eveningSlots),
                offDays: formData.offDays,
                blockedDates: formData.blockedDates,
                premiumSlots: formData.premiumSlots
            };

            const response = await ClinicAPI.updateClinicLabTimingsAndSlots(payload);

            if (response && response.success) {
                setSuccessMessage(response.message || "Clinic lab timings updated successfully.");
                if (onToast) onToast("Clinic lab timings saved successfully.");
                await fetchTimingsData();
            } else {
                setError(response?.message || "Failed to update clinic lab timings.");
            }
        } catch (err) {
            console.error("Error updating clinic lab timings:", err);
            setError(err.response?.data?.message || "An error occurred while saving timings.");
        } finally {
            setSaving(false);
        }
    };

    // ========================================================
    // 4. BLOCK / UNBLOCK CLINIC LAB SLOT (API 3 & 4)
    // ========================================================
    const handleToggleSlotBlock = async (time, isCurrentlyBlocked) => {
        try {
            setActionLoadingSlot(time);
            setError(null);

            if (isCurrentlyBlocked) {
                const res = await ClinicAPI.unblockClinicLabSlot({ time });
                if (res?.success) {
                    setUnavailableSlots((prev) => prev.filter((t) => t !== time));
                    if (onToast) onToast(res.message || `Slot '${time}' is now visible and bookable.`);
                }
            } else {
                const res = await ClinicAPI.blockClinicLabSlot({ time });
                if (res?.success) {
                    setUnavailableSlots((prev) => [...prev, time]);
                    if (onToast) onToast(res.message || `Slot '${time}' hidden successfully.`);
                }
            }
        } catch (err) {
            console.error("Failed to toggle clinic lab slot:", err);
            setError(err.response?.data?.message || `Could not toggle visibility for slot ${time}.`);
        } finally {
            setActionLoadingSlot(null);
        }
    };

    if (!isOpen) return null;

    // Filter live slots by category
    const filteredGeneratedSlots = generatedSlots.filter((slot) => {
        if (slotCategoryFilter === "All") return true;
        return slot.category?.toLowerCase() === slotCategoryFilter.toLowerCase();
    });

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-150">
            <div
                ref={modalRef}
                className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col select-none animate-in zoom-in-95 duration-150"
            >
                {/* 1. HEADER */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#3D3F96]/5 shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-[#3D3F96] text-white flex items-center justify-center shrink-0 shadow-md">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                    Clinic Lab Timings & Slot Config
                                </h3>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3" /> Live Booking Engine
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
                                <span>Lab: <strong className="text-slate-800 font-bold">{labInfo.name}</strong></span>
                                {labInfo.displayTiming && (
                                    <>
                                        <span>&bull;</span>
                                        <span className="text-[#3D3F96] font-bold">{labInfo.displayTiming}</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-all cursor-pointer shadow-xs focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 2. TAB CONTROLS */}
                <div className="px-6 py-2.5 border-b border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveTab("config")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                activeTab === "config"
                                    ? "bg-[#3D3F96] text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <Sliders className="w-3.5 h-3.5" />
                            <span>1. Timings & Slot Rules</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => setActiveTab("live-slots")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                                activeTab === "live-slots"
                                    ? "bg-[#3D3F96] text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            <Eye className="w-3.5 h-3.5" />
                            <span>2. Live Slot Manager</span>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-white/20 text-current font-black">
                                {generatedSlots.length} Slots
                            </span>
                        </button>
                    </div>

                    <button
                        onClick={fetchTimingsData}
                        title="Reload configuration"
                        className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-[#3D3F96] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" />
                    </button>
                </div>

                {/* ERROR / SUCCESS ALERTS */}
                {error && (
                    <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5 shrink-0">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                        <button onClick={() => setError(null)} className="ml-auto text-rose-500 hover:text-rose-700 cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2.5 shrink-0">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{successMessage}</span>
                        <button onClick={() => setSuccessMessage(null)} className="ml-auto text-emerald-500 hover:text-emerald-700 cursor-pointer">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* 3. MODAL CONTENT BODY */}
                <div className="overflow-y-auto flex-1 p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-28 gap-3">
                            <Loader2 className="w-8 h-8 text-[#3D3F96] animate-spin" />
                            <span className="text-xs font-bold text-slate-500">Loading clinic lab timings...</span>
                        </div>
                    ) : activeTab === "config" ? (
                        /* ================= TAB 1: FORM CONFIGURATION ================= */
                        <form id="clinic-lab-timing-form" onSubmit={handleSubmit} className="space-y-6">
                            
                            {/* General Hours & Duration */}
                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                                <div className="flex items-center justify-between flex-wrap gap-2">
                                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#3D3F96]" />
                                        <span>Operating Schedule & Interval</span>
                                    </h4>

                                    {/* 24x7 Toggle */}
                                    <div
                                        onClick={() => setFormData({ ...formData, is24x7: !formData.is24x7 })}
                                        className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                                            formData.is24x7
                                                ? "bg-purple-50 border-purple-300 text-purple-700 shadow-2xs"
                                                : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                                        }`}
                                    >
                                        <Activity className="w-3.5 h-3.5" />
                                        <span>24x7 Round-The-Clock Lab</span>
                                        <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                                            formData.is24x7 ? "bg-purple-600 border-purple-700 text-white" : "border-slate-300 bg-white"
                                        }`}>
                                            {formData.is24x7 && <Check className="w-3 h-3 stroke-[3]" />}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Opening Time */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500">
                                            Start Time (24-hr) *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.startTime}
                                            onChange={handleStartTimeChange}
                                            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            Display: <strong>{formData.openingTime}</strong>
                                        </span>
                                    </div>

                                    {/* Closing Time */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500">
                                            End Time (24-hr) *
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={handleEndTimeChange}
                                            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none transition-all"
                                        />
                                        <span className="text-[10px] text-slate-400 font-medium">
                                            Display: <strong>{formData.closeTime}</strong>
                                        </span>
                                    </div>

                                    {/* Slot Duration */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500">
                                            Slot Duration (Mins) *
                                        </label>
                                        <select
                                            value={formData.slotDuration}
                                            onChange={(e) => setFormData({ ...formData, slotDuration: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none transition-all cursor-pointer"
                                        >
                                            <option value={15}>15 Minutes</option>
                                            <option value={20}>20 Minutes</option>
                                            <option value={30}>30 Minutes</option>
                                            <option value={45}>45 Minutes</option>
                                            <option value={60}>60 Minutes (1 Hour)</option>
                                        </select>
                                    </div>

                                    {/* Max Clients Per Slot */}
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-extrabold uppercase text-slate-500 flex items-center justify-between">
                                            <span>Patients / Slot</span>
                                            <span className="text-[10px] text-slate-400 font-normal">0 = Unlimited</span>
                                        </label>
                                        <div className="relative">
                                            <Users className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input
                                                type="number"
                                                min="0"
                                                required
                                                value={formData.maxClientsPerSlot}
                                                onChange={(e) => setFormData({ ...formData, maxClientsPerSlot: e.target.value })}
                                                className="w-full pl-9 pr-3.5 py-2 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none transition-all"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Active Shifts / Sessions */}
                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                                <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider">
                                    Active Testing Sessions
                                </h4>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    {/* Morning */}
                                    <div
                                        onClick={() => setFormData({ ...formData, morningSlots: !formData.morningSlots })}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                            formData.morningSlots
                                                ? "bg-amber-50/60 border-amber-300 text-amber-900"
                                                : "bg-white border-slate-200 text-slate-400 opacity-60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                                                <Sunrise className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black">Morning Hours</div>
                                                <div className="text-[10px] font-semibold text-slate-500">05:00 AM – 11:59 AM</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                                            formData.morningSlots ? "bg-amber-500 border-amber-600 text-white" : "border-slate-300 bg-white"
                                        }`}>
                                            {formData.morningSlots && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>

                                    {/* Afternoon */}
                                    <div
                                        onClick={() => setFormData({ ...formData, afternoonSlots: !formData.afternoonSlots })}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                            formData.afternoonSlots
                                                ? "bg-blue-50/60 border-blue-300 text-blue-900"
                                                : "bg-white border-slate-200 text-slate-400 opacity-60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <Sun className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black">Afternoon Hours</div>
                                                <div className="text-[10px] font-semibold text-slate-500">12:00 PM – 04:59 PM</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                                            formData.afternoonSlots ? "bg-blue-600 border-blue-700 text-white" : "border-slate-300 bg-white"
                                        }`}>
                                            {formData.afternoonSlots && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>

                                    {/* Evening */}
                                    <div
                                        onClick={() => setFormData({ ...formData, eveningSlots: !formData.eveningSlots })}
                                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                                            formData.eveningSlots
                                                ? "bg-purple-50/60 border-purple-300 text-purple-900"
                                                : "bg-white border-slate-200 text-slate-400 opacity-60"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                                                <Sunset className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-black">Evening Hours</div>
                                                <div className="text-[10px] font-semibold text-slate-500">05:00 PM – 10:59 PM</div>
                                            </div>
                                        </div>
                                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border ${
                                            formData.eveningSlots ? "bg-purple-600 border-purple-700 text-white" : "border-slate-300 bg-white"
                                        }`}>
                                            {formData.eveningSlots && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Weekly Holidays & Blocked Dates */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Weekly Off Days */}
                                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                                        <CalendarOff className="w-4 h-4 text-rose-500" />
                                        <span>Weekly Off / Closed Days</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400">Select recurring days when testing is paused</p>

                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {WEEK_DAYS.map((day) => {
                                            const isOff = formData.offDays.includes(day);
                                            return (
                                                <button
                                                    key={day}
                                                    type="button"
                                                    onClick={() => toggleOffDay(day)}
                                                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border ${
                                                        isOff
                                                            ? "bg-rose-50 border-rose-300 text-rose-700 shadow-xs"
                                                            : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {day} {isOff && "✓"}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Blocked Holiday Dates */}
                                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                                        <Calendar className="w-4 h-4 text-amber-500" />
                                        <span>Specific Holiday Dates (YYYY-MM-DD)</span>
                                    </h4>

                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            value={newBlockedDate}
                                            onChange={(e) => setNewBlockedDate(e.target.value)}
                                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none transition-all flex-1 cursor-pointer"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddBlockedDate}
                                            className="px-3.5 py-1.5 rounded-xl bg-[#3D3F96] text-white text-xs font-extrabold hover:bg-[#2C2E75] transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                                        >
                                            <Plus className="w-3.5 h-3.5" /> Add
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pt-1">
                                        {formData.blockedDates.length > 0 ? (
                                            formData.blockedDates.map((d) => (
                                                <span
                                                    key={d}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white border border-rose-200 text-rose-700 shadow-2xs"
                                                >
                                                    {d}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveBlockedDate(d)}
                                                        className="hover:text-rose-900 cursor-pointer"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-slate-400 italic">No specific holidays added</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Premium / Peak Surcharge */}
                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                                <div>
                                    <h4 className="text-xs font-black uppercase text-slate-600 tracking-wider flex items-center gap-1.5">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <span>Peak Hour / Premium Surcharges</span>
                                    </h4>
                                    <p className="text-[11px] text-slate-400 mt-0.5">
                                        Configure extra booking charges for early morning or high-demand test slots
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    <div className="space-y-0.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Slot Time</label>
                                        <input
                                            type="time"
                                            value={newPremiumTime}
                                            onChange={(e) => setNewPremiumTime(e.target.value)}
                                            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none"
                                        />
                                    </div>

                                    <div className="space-y-0.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Extra Fee (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={newPremiumFee}
                                            onChange={(e) => setNewPremiumFee(e.target.value)}
                                            className="w-28 px-3 py-1.5 text-xs font-bold rounded-xl bg-white border border-slate-200 focus:border-[#3D3F96] focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleAddPremiumSlot}
                                        className="mt-4 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Add Surcharge
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-2">
                                    {formData.premiumSlots.length > 0 ? (
                                        formData.premiumSlots.map((p) => (
                                            <span
                                                key={p.time}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-50 border border-amber-300 text-amber-900 shadow-2xs"
                                            >
                                                <span>{p.time}</span>
                                                <span className="text-[10px] bg-amber-200/80 px-1.5 py-0.5 rounded text-amber-950">
                                                    +₹{p.extraFee}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePremiumSlot(p.time)}
                                                    className="hover:text-rose-600 cursor-pointer"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-[11px] text-slate-400 italic">No premium slots configured</span>
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        /* ================= TAB 2: LIVE GENERATED SLOTS & BLOCK MANAGER ================= */
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                                <div>
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                                        Calculated Booking Slots ({filteredGeneratedSlots.length})
                                    </h4>
                                    <p className="text-[11px] text-slate-400">
                                        Click on any slot to immediately block (hide) or unblock (show) it for clinic patients
                                    </p>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    {["All", "Morning", "Afternoon", "Evening"].map((cat) => (
                                        <button
                                            key={cat}
                                            type="button"
                                            onClick={() => setSlotCategoryFilter(cat)}
                                            className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                                slotCategoryFilter === cat
                                                    ? "bg-[#3D3F96] text-white shadow-xs"
                                                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Slot Cards Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {filteredGeneratedSlots.length > 0 ? (
                                    filteredGeneratedSlots.map((slot) => {
                                        const isBlocked = unavailableSlots.includes(slot.time);
                                        const isActionLoading = actionLoadingSlot === slot.time;

                                        return (
                                            <div
                                                key={slot.time}
                                                onClick={() => !isActionLoading && handleToggleSlotBlock(slot.time, isBlocked)}
                                                className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 text-center group relative overflow-hidden ${
                                                    isBlocked
                                                        ? "bg-rose-50/60 border-rose-200 text-rose-800 hover:bg-rose-100/70"
                                                        : "bg-white border-slate-200 hover:border-[#3D3F96] hover:shadow-md"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between text-[10px]">
                                                    <span className="font-bold text-slate-400 uppercase">
                                                        {slot.category}
                                                    </span>
                                                    {slot.extraFee > 0 && (
                                                        <span className="font-black text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                                            +₹{slot.extraFee}
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="font-mono font-black text-sm tracking-tight text-slate-900">
                                                    {slot.time}
                                                </div>

                                                <div className="pt-1 border-t border-slate-100 flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                                    {isActionLoading ? (
                                                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3D3F96]" />
                                                    ) : isBlocked ? (
                                                        <span className="flex items-center gap-1 text-rose-600">
                                                            <EyeOff className="w-3 h-3" /> Blocked
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1 text-emerald-600 group-hover:text-[#3D3F96]">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full py-16 text-center text-slate-400 font-semibold text-xs">
                                        No time slots found matching this filter.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* 4. MODAL FOOTER */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80 shrink-0 flex-wrap gap-3">
                    <div className="text-xs text-slate-500 font-semibold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>
                            {unavailableSlots.length} slot(s) hidden • {generatedSlots.length - unavailableSlots.length} available
                        </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
                        >
                            Close
                        </button>

                        {activeTab === "config" && (
                            <button
                                type="submit"
                                form="clinic-lab-timing-form"
                                disabled={saving || loading}
                                className="px-5 py-2 rounded-xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        <span>Saving Timings...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-3.5 h-3.5" />
                                        <span>Update Lab Timings</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}