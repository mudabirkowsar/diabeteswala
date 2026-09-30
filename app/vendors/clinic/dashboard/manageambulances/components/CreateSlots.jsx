"use client";

import React, { useState, useEffect, useCallback } from 'react';
import {
    X,
    Clock,
    Calendar,
    Save,
    Plus,
    Trash2,
    ShieldAlert,
    CheckCircle2,
    Ban,
    Sparkles,
    IndianRupee,
    Loader2,
    RefreshCw,
    AlertCircle,
    Info,
    CalendarOff,
    Check,
    Lock,
    Unlock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import ClinicAPI from '../../../../../services/ClinicAPI';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CreateSlots({ isOpen, onClose, ambulance }) {
    if (!isOpen || !ambulance) return null;

    const ambulanceId = ambulance._id;
    const vehicleNumber = ambulance.vehicleNumber || 'Ambulance';

    // Active View Tab: 'config' | 'live-slots'
    const [activeTab, setActiveTab] = useState('config');

    // Slot Configuration States
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [slotDuration, setSlotDuration] = useState(120);
    const [availableForEmergency, setAvailableForEmergency] = useState(
        ambulance.availableForEmergency !== undefined ? ambulance.availableForEmergency : true
    );
    const [offDays, setOffDays] = useState(['Sunday']);
    const [blockedDates, setBlockedDates] = useState([]);
    const [newBlockedDate, setNewBlockedDate] = useState('');

    // Premium Slots
    const [premiumSlots, setPremiumSlots] = useState([]);
    const [newPremiumTime, setNewPremiumTime] = useState('');
    const [newPremiumFee, setNewPremiumFee] = useState('');

    const [savingConfig, setSavingConfig] = useState(false);

    // Live Slot Preview States
    const todayStr = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [slotsData, setSlotsData] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [togglingSlotTime, setTogglingSlotTime] = useState(null);

    // --- 1. Fetch Live Slots for Selected Date ---
    const fetchSlots = useCallback(async () => {
        setLoadingSlots(true);
        try {
            const response = await ClinicAPI.getClinicAmbulanceSlots({
                ambulanceId,
                date: selectedDate
            });
            if (response && response.success) {
                setSlotsData(response.slots || []);
            }
        } catch (err) {
            console.error('Error fetching ambulance slots:', err);
            toast.error(err.response?.data?.message || 'Failed to load transit time slots.');
        } finally {
            setLoadingSlots(false);
        }
    }, [ambulanceId, selectedDate]);

    useEffect(() => {
        if (activeTab === 'live-slots') {
            fetchSlots();
        }
    }, [activeTab, fetchSlots]);

    // --- 2. Save / Update Slots Configuration ---
    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setSavingConfig(true);

        const payload = {
            ambulanceId,
            startTime,
            endTime,
            slotDuration: Number(slotDuration),
            availableForEmergency,
            offDays,
            blockedDates,
            premiumSlots: premiumSlots.map(p => ({
                time: p.time,
                extraFee: Number(p.extraFee)
            }))
        };

        try {
            const response = await ClinicAPI.updateClinicAmbulanceSlots(payload);
            if (response && response.success) {
                toast.success(response.message || 'Slots configured successfully!');
                // Auto switch to preview slots after saving
                setActiveTab('live-slots');
            }
        } catch (err) {
            console.error('Error configuring ambulance slots:', err);
            toast.error(err.response?.data?.message || 'Failed to update slots configuration.');
        } finally {
            setSavingConfig(false);
        }
    };

    // --- 3. Toggle Block / Unblock Specific Slot ---
    const handleToggleSlotBlock = async (slot) => {
        const isCurrentlyAvailable = slot.isAvailable;
        setTogglingSlotTime(slot.slotTime);

        try {
            let response;
            if (isCurrentlyAvailable) {
                // Block the slot
                response = await ClinicAPI.blockClinicAmbulanceSlot({
                    ambulanceId,
                    time: slot.slotTime
                });
            } else {
                // Unblock the slot
                response = await ClinicAPI.unblockClinicAmbulanceSlot({
                    ambulanceId,
                    time: slot.slotTime
                });
            }

            if (response && response.success) {
                toast.success(response.message);
                // Update local preview state directly
                setSlotsData(prev =>
                    prev.map(s =>
                        s.slotTime === slot.slotTime
                            ? {
                                ...s,
                                isAvailable: !isCurrentlyAvailable,
                                status: !isCurrentlyAvailable ? 'Available' : 'Unavailable'
                            }
                            : s
                    )
                );
            }
        } catch (err) {
            console.error('Error blocking/unblocking slot:', err);
            toast.error(err.response?.data?.message || 'Failed to update slot status.');
        } finally {
            setTogglingSlotTime(null);
        }
    };

    // Off-days toggle helper
    const toggleOffDay = (day) => {
        if (offDays.includes(day)) {
            setOffDays(offDays.filter(d => d !== day));
        } else {
            setOffDays([...offDays, day]);
        }
    };

    // Add Blocked Date
    const handleAddBlockedDate = () => {
        if (!newBlockedDate) return;
        if (blockedDates.includes(newBlockedDate)) {
            toast.error('Date already added to holiday list');
            return;
        }
        setBlockedDates([...blockedDates, newBlockedDate]);
        setNewBlockedDate('');
    };

    // Remove Blocked Date
    const handleRemoveBlockedDate = (dateToRemove) => {
        setBlockedDates(blockedDates.filter(d => d !== dateToRemove));
    };

    // Add Premium Slot
    const handleAddPremiumSlot = () => {
        if (!newPremiumTime || !newPremiumFee) {
            toast.error('Please specify both slot time and extra fee');
            return;
        }
        if (premiumSlots.some(p => p.time === newPremiumTime)) {
            toast.error('This slot already has a premium charge rule');
            return;
        }
        setPremiumSlots([...premiumSlots, { time: newPremiumTime, extraFee: Number(newPremiumFee) }]);
        setNewPremiumTime('');
        setNewPremiumFee('');
    };

    // Remove Premium Slot
    const handleRemovePremiumSlot = (timeToRemove) => {
        setPremiumSlots(premiumSlots.filter(p => p.time !== timeToRemove));
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">

                {/* MODAL HEADER */}
                <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 flex items-center justify-center shrink-0">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                                    Slot & Transit Availability
                                </h2>
                                <span className="text-[11px] font-black uppercase bg-red-500/20 text-red-300 border border-red-500/30 px-2.5 py-0.5 rounded-md">
                                    {vehicleNumber}
                                </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                Set operating windows, slot duration, emergency ready shifts, and live block/unblock slots.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* TAB SWITCHER */}
                <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
                    <button
                        type="button"
                        onClick={() => setActiveTab('config')}
                        className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition border-b-2 cursor-pointer flex items-center gap-2 ${activeTab === 'config'
                            ? 'border-red-600 text-red-600 bg-white shadow-xs'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Clock size={15} />
                        <span>1. Shift & Timing Config</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('live-slots')}
                        className={`px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-t-xl transition border-b-2 cursor-pointer flex items-center gap-2 ${activeTab === 'live-slots'
                            ? 'border-red-600 text-red-600 bg-white shadow-xs'
                            : 'border-transparent text-slate-500 hover:text-slate-800'
                            }`}
                    >
                        <Calendar size={15} />
                        <span>2. Live Slots & Block Matrix</span>
                    </button>
                </div>

                {/* MODAL BODY */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">

                    {/* TAB 1: CONFIGURATION */}
                    {activeTab === 'config' && (
                        <form onSubmit={handleSaveConfig} className="space-y-6">

                            {/* Timing & Buffer Settings */}
                            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                    <Clock size={15} className="text-red-600" />
                                    Daily Operational Timing & Transit Buffer
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-500 mb-1.5">
                                            Start Time (HH:mm)
                                        </label>
                                        <input
                                            type="time"
                                            value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-500 mb-1.5">
                                            End Time (HH:mm)
                                        </label>
                                        <input
                                            type="time"
                                            value={endTime}
                                            onChange={(e) => setEndTime(e.target.value)}
                                            required
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-black uppercase text-slate-500 mb-1.5">
                                            Slot Transit Buffer
                                        </label>
                                        <select
                                            value={slotDuration}
                                            onChange={(e) => setSlotDuration(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500 cursor-pointer"
                                        >
                                            <option value={60}>60 Mins (1 Hour)</option>
                                            <option value={90}>90 Mins (1.5 Hours)</option>
                                            <option value={120}>120 Mins (2 Hours — Recommended)</option>
                                            <option value={180}>180 Mins (3 Hours)</option>
                                            <option value={240}>240 Mins (4 Hours)</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Emergency Availability Checkbox */}
                                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <ShieldAlert size={18} className="text-red-600" />
                                        <div>
                                            <strong className="text-xs font-black text-slate-800 block">Available For Emergency Duty</strong>
                                            <span className="text-[11px] text-slate-400 font-medium">Keep active to dispatch ambulance during critical SOS bookings.</span>
                                        </div>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={availableForEmergency}
                                            onChange={(e) => setAvailableForEmergency(e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                    </label>
                                </div>
                            </div>

                            {/* Weekly Off Days */}
                            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                    <CalendarOff size={15} className="text-amber-600" />
                                    Weekly Off Days (No Transit Bookings)
                                </h3>
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {DAYS_OF_WEEK.map((day) => {
                                        const isSelected = offDays.includes(day);
                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleOffDay(day)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer border flex items-center gap-1.5 ${isSelected
                                                    ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                                                    }`}
                                            >
                                                {isSelected && <Check size={12} strokeWidth={3} />}
                                                <span>{day}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Blocked Holiday Dates */}
                            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                    <Calendar size={15} className="text-blue-600" />
                                    Specific Blocked Dates / Maintenance Holidays
                                </h3>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        min={todayStr}
                                        value={newBlockedDate}
                                        onChange={(e) => setNewBlockedDate(e.target.value)}
                                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddBlockedDate}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus size={14} />
                                        <span>Add Date</span>
                                    </button>
                                </div>
                                {blockedDates.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {blockedDates.map((date) => (
                                            <span
                                                key={date}
                                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-white border border-slate-200 rounded-xl text-slate-700 shadow-2xs"
                                            >
                                                {date}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBlockedDate(date)}
                                                    className="text-slate-400 hover:text-rose-600 cursor-pointer"
                                                >
                                                    <X size={13} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Premium Transit Slots Extra Fee */}
                            <div className="bg-slate-50/80 p-5 rounded-3xl border border-slate-200/80 space-y-3">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-2">
                                    <Sparkles size={15} className="text-amber-500" />
                                    Premium / Peak-Hour Slots (Extra Surcharge)
                                </h3>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                    <input
                                        type="time"
                                        value={newPremiumTime}
                                        onChange={(e) => setNewPremiumTime(e.target.value)}
                                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                                    />
                                    <div className="relative">
                                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                                        <input
                                            type="number"
                                            placeholder="Extra Fee (e.g. 150)"
                                            value={newPremiumFee}
                                            onChange={(e) => setNewPremiumFee(e.target.value)}
                                            className="w-full pl-8 pr-3.5 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddPremiumSlot}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                        <Plus size={14} strokeWidth={3} />
                                        <span>Add Premium Rule</span>
                                    </button>
                                </div>

                                {premiumSlots.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                                        {premiumSlots.map((item) => (
                                            <div
                                                key={item.time}
                                                className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Clock size={13} className="text-amber-600" />
                                                    <span>Slot at {item.time}</span>
                                                    <span className="px-2 py-0.5 bg-amber-200 rounded-md text-[10px] font-black text-amber-800">
                                                        +₹{item.extraFee} Extra
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePremiumSlot(item.time)}
                                                    className="text-amber-700 hover:text-rose-600 cursor-pointer p-1"
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer Submit Button */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-2xl hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingConfig}
                                    className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition flex items-center gap-2 shadow-lg shadow-red-600/20 cursor-pointer disabled:opacity-50"
                                >
                                    {savingConfig ? (
                                        <Loader2 size={15} className="animate-spin" />
                                    ) : (
                                        <Save size={15} />
                                    )}
                                    <span>Save & Generate Slots</span>
                                </button>
                            </div>
                        </form>
                    )}

                    {/* TAB 2: LIVE SLOTS MATRIX & BLOCK/UNBLOCK */}
                    {activeTab === 'live-slots' && (
                        <div className="space-y-5">
                            {/* Date Selector & Refresh */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                    <Calendar className="text-slate-400" size={16} />
                                    <label className="text-xs font-black uppercase text-slate-500 shrink-0">Select Target Date:</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-red-500"
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={fetchSlots}
                                    disabled={loadingSlots}
                                    className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-2 cursor-pointer w-full sm:w-auto justify-center"
                                >
                                    <RefreshCw size={13} className={loadingSlots ? 'animate-spin text-red-600' : ''} />
                                    <span>Refresh Slots</span>
                                </button>
                            </div>

                            {/* Help Banner */}
                            <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/60 border border-blue-200/80 rounded-2xl text-blue-900 text-xs">
                                <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                                <p className="font-medium leading-relaxed">
                                    Click on any slot to <strong>Block (Hide)</strong> or <strong>Unblock (Show)</strong> it for bookings on this specific ambulance unit.
                                </p>
                            </div>

                            {/* Slots Display */}
                            {loadingSlots ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-3">
                                    <Loader2 className="animate-spin text-red-600" size={32} />
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Generating slot schedule...</p>
                                </div>
                            ) : slotsData.length === 0 ? (
                                <div className="py-16 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200 p-6">
                                    <AlertCircle size={36} className="text-slate-300 mx-auto mb-2" />
                                    <h4 className="text-sm font-bold text-slate-700">No Slots Available for this Date</h4>
                                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                        This date might fall on a configured weekly off-day, holiday, or no slots were configured. Check timing configuration.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {slotsData.map((slot) => {
                                        const isBusy = togglingSlotTime === slot.slotTime;
                                        const isAvailable = slot.isAvailable;

                                        return (
                                            <div
                                                key={slot.slotTime}
                                                onClick={() => !isBusy && handleToggleSlotBlock(slot)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between gap-3 ${isAvailable
                                                    ? 'bg-emerald-50/40 hover:bg-emerald-50 border-emerald-200/80 hover:border-emerald-300'
                                                    : 'bg-rose-50/40 hover:bg-rose-50 border-rose-200/80 hover:border-rose-300 opacity-80'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                                        {slot.category || 'Transit'}
                                                    </span>

                                                    <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${isAvailable
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : 'bg-rose-100 text-rose-800'
                                                        }`}>
                                                        {isAvailable ? <CheckCircle2 size={10} /> : <Ban size={10} />}
                                                        {isAvailable ? 'Available' : 'Blocked / Hidden'}
                                                    </span>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-black text-slate-900">
                                                        {slot.displayTime || `${slot.startTimeFormatted} - ${slot.endTimeFormatted}`}
                                                    </h4>
                                                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                                                        Slot Key: {slot.slotTime}
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isBusy}
                                                    className={`w-full py-2 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer ${isAvailable
                                                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                                        }`}
                                                >
                                                    {isBusy ? (
                                                        <Loader2 size={13} className="animate-spin" />
                                                    ) : isAvailable ? (
                                                        <>
                                                            <Lock size={12} />
                                                            <span>Block This Slot</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Unlock size={12} />
                                                            <span>Unblock Slot</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MODAL FOOTER */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0 text-xs">
                    <span className="font-bold text-slate-400">
                        Ambulance ID: <code className="text-slate-600">{ambulanceId}</code>
                    </span>
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}