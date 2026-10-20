"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Calendar,
  Sun,
  Sunset,
  Moon,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  Save,
  X,
  IndianRupee,
  Lock,
  Unlock,
  Store,
  Layers,
  CalendarOff,
  Sliders,
  Check
} from 'lucide-react';

// Adjust this import path as per your project folder structure
import PharmacyVendorAPI from '../../../../services/PharmacyVendorAPI';

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const SLOT_DURATION_OPTIONS = [
  { label: '30 Minutes', value: 30 },
  { label: '45 Minutes', value: 45 },
  { label: '60 Minutes (1 Hour)', value: 60 },
  { label: '90 Minutes (1.5 Hours)', value: 90 },
  { label: '120 Minutes (2 Hours)', value: 120 }
];

export default function PharmacySlotsPage() {
  // --- Loading & State Management ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionSlotTime, setActionSlotTime] = useState(null); // Tracks currently blocking/unblocking slot
  const [message, setMessage] = useState({ type: '', text: '' });

  // --- Form & Configuration State ---
  const [configId, setConfigId] = useState(null);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('22:00');
  const [slotDuration, setSlotDuration] = useState(60);

  // Time Window Toggles
  const [morningSlots, setMorningSlots] = useState(true);
  const [afternoonSlots, setAfternoonSlots] = useState(true);
  const [eveningSlots, setEveningSlots] = useState(true);

  // Lists & Arrays
  const [offDays, setOffDays] = useState(['Sunday']);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newDateInput, setNewDateInput] = useState('');
  const [unavailableSlots, setUnavailableSlots] = useState([]);

  // Premium Slots
  const [premiumSlots, setPremiumSlots] = useState([]);
  const [newPremiumTime, setNewPremiumTime] = useState('');
  const [newPremiumFee, setNewPremiumFee] = useState(40);

  // Live Slots Data
  const [generatedSlots, setGeneratedSlots] = useState([]);
  const [totalGeneratedSlots, setTotalGeneratedSlots] = useState(0);

  // Filter for live slots view
  const [selectedCategory, setSelectedCategory] = useState('All');

  // --- 1. Fetch Configuration & Live Slots ---
  const fetchSlotsData = async () => {
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      const res = await PharmacyVendorAPI.getMyPharmacySlots();

      if (res && res.success) {
        if (res.config) {
          const cfg = res.config;
          setConfigId(cfg._id || null);
          setStartTime(cfg.startTime || '10:00');
          setEndTime(cfg.endTime || '22:00');
          setSlotDuration(cfg.slotDuration || 60);
          setMorningSlots(cfg.morningSlots !== undefined ? cfg.morningSlots : true);
          setAfternoonSlots(cfg.afternoonSlots !== undefined ? cfg.afternoonSlots : true);
          setEveningSlots(cfg.eveningSlots !== undefined ? cfg.eveningSlots : true);
          setOffDays(Array.isArray(cfg.offDays) ? cfg.offDays : []);
          setBlockedDates(Array.isArray(cfg.blockedDates) ? cfg.blockedDates : []);
          setUnavailableSlots(Array.isArray(cfg.unavailableSlots) ? cfg.unavailableSlots : []);
          setPremiumSlots(
            Array.isArray(cfg.premiumSlots)
              ? cfg.premiumSlots.map((item) => ({
                time: item.time,
                extraFee: item.extraFee
              }))
              : []
          );
        }

        setGeneratedSlots(Array.isArray(res.generatedSlots) ? res.generatedSlots : []);
        setTotalGeneratedSlots(res.totalGeneratedSlots || res.generatedSlots?.length || 0);
      }
    } catch (err) {
      console.error('Failed to fetch pharmacy slots:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Could not load your slot configuration.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlotsData();
  }, []);

  // --- 2. Save / Update Slot Configurations ---
  const handleSaveConfiguration = async (e) => {
    e?.preventDefault();

    // Validation
    if (!startTime || !endTime) {
      setMessage({ type: 'error', text: 'Start time and End time are required.' });
      return;
    }

    if (startTime >= endTime) {
      setMessage({ type: 'error', text: 'Start time must be strictly before End time.' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const payload = {
        startTime,
        endTime,
        slotDuration: Number(slotDuration),
        morningSlots: Boolean(morningSlots),
        afternoonSlots: Boolean(afternoonSlots),
        eveningSlots: Boolean(eveningSlots),
        premiumSlots: premiumSlots.map((p) => ({
          time: p.time,
          extraFee: Number(p.extraFee)
        })),
        unavailableSlots: unavailableSlots,
        offDays: offDays,
        blockedDates: blockedDates
      };

      const res = await PharmacyVendorAPI.setPharmacyAvailabilitySlots(payload);

      if (res && res.success) {
        setMessage({ type: 'success', text: res.message || 'Availability settings saved successfully!' });
        // Refresh live slots calculation
        await fetchSlotsData();
      } else {
        setMessage({ type: 'error', text: res?.message || 'Failed to update slots.' });
      }
    } catch (err) {
      console.error('Error saving slot configuration:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || 'Error occurred while saving configuration.'
      });
    } finally {
      setSaving(false);
    }
  };

  // --- 3. Instant 1-Click Block Slot ---
  const handleBlockSlot = async (timeStr) => {
    try {
      setActionSlotTime(timeStr);
      const res = await PharmacyVendorAPI.blockPharmacySlot({ time: timeStr });
      if (res && res.success) {
        // Optimistically update unavailableSlots
        if (!unavailableSlots.includes(timeStr)) {
          setUnavailableSlots((prev) => [...prev, timeStr]);
        }
        setMessage({ type: 'success', text: `Slot ${timeStr} hidden from customer bookings.` });
        await fetchSlotsData();
      }
    } catch (err) {
      console.error('Error blocking slot:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || `Failed to hide slot ${timeStr}.`
      });
    } finally {
      setActionSlotTime(null);
    }
  };

  // --- 4. Instant 1-Click Unblock Slot ---
  const handleUnblockSlot = async (timeStr) => {
    try {
      setActionSlotTime(timeStr);
      const res = await PharmacyVendorAPI.unblockPharmacySlot({ time: timeStr });
      if (res && res.success) {
        // Optimistically remove from unavailableSlots
        setUnavailableSlots((prev) => prev.filter((t) => t !== timeStr));
        setMessage({ type: 'success', text: `Slot ${timeStr} made visible and bookable again.` });
        await fetchSlotsData();
      }
    } catch (err) {
      console.error('Error unblocking slot:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || `Failed to restore slot ${timeStr}.`
      });
    } finally {
      setActionSlotTime(null);
    }
  };

  // --- UI Helpers: Weekly Off Days ---
  const toggleOffDay = (day) => {
    setOffDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  // --- UI Helpers: Blocked Holiday Dates ---
  const handleAddBlockedDate = () => {
    if (!newDateInput) return;
    if (blockedDates.includes(newDateInput)) {
      setMessage({ type: 'error', text: 'This date is already in the blocked list.' });
      return;
    }
    setBlockedDates((prev) => [...prev, newDateInput]);
    setNewDateInput('');
  };

  const handleRemoveBlockedDate = (dateToRemove) => {
    setBlockedDates((prev) => prev.filter((d) => d !== dateToRemove));
  };

  // --- UI Helpers: Premium Slots ---
  const handleAddPremiumSlot = () => {
    if (!newPremiumTime) {
      setMessage({ type: 'error', text: 'Please select a valid time for the premium slot.' });
      return;
    }
    if (premiumSlots.some((p) => p.time === newPremiumTime)) {
      setMessage({ type: 'error', text: 'A premium fee is already defined for this slot time.' });
      return;
    }

    setPremiumSlots((prev) => [
      ...prev,
      { time: newPremiumTime, extraFee: Number(newPremiumFee) || 0 }
    ]);
    setNewPremiumTime('');
    setNewPremiumFee(40);
  };

  const handleRemovePremiumSlot = (timeToRemove) => {
    setPremiumSlots((prev) => prev.filter((p) => p.time !== timeToRemove));
  };

  // --- Filtered Live Slots ---
  const filteredSlots = useMemo(() => {
    if (selectedCategory === 'All') return generatedSlots;
    return generatedSlots.filter(
      (slot) => slot.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [generatedSlots, selectedCategory]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER SECTION ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Store size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pharmacy Slots & Delivery Availability
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={12} /> Live Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Set operating hours, delivery slot windows, holiday leaves, and manage live delivery slots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchSlotsData}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Refresh Slots Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-blue-600' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSaveConfiguration}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-600/20 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* ================= ALERTS BANNER ================= */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-start justify-between gap-3 text-xs sm:text-sm font-semibold border transition-all ${message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle size={18} className="text-rose-600 shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              onClick={() => setMessage({ type: '', text: '' })}
              className="p-1 hover:bg-black/5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ================= MAIN TWO-COLUMN WORKSPACE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: CONFIGURATION SETUP (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">

            {/* --- CARD 1: OPERATING HOURS & SLOT DURATION --- */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-600" size={18} />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                    Operating Hours & Duration
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">24-Hour Format</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Start Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    Opening Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Daily delivery start time</p>
                </div>

                {/* End Time */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    Closing Time <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  />
                  <p className="text-[10px] text-slate-400 font-medium">Daily delivery cutoff time</p>
                </div>

                {/* Slot Window Duration */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    Slot Window <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                  >
                    {SLOT_DURATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-400 font-medium">Window for each order</p>
                </div>
              </div>

              {/* Time Window Toggles */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-3">
                  Active Delivery Day Windows
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Morning */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${morningSlots
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sun size={16} className={morningSlots ? 'text-amber-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-xs font-bold leading-tight">Morning Slots</p>
                        <p className="text-[10px] opacity-75">05:00 - 12:00</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={morningSlots}
                      onChange={(e) => setMorningSlots(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 accent-blue-600"
                    />
                  </label>

                  {/* Afternoon */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${afternoonSlots
                        ? 'bg-orange-50/70 border-orange-300 text-orange-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Sunset size={16} className={afternoonSlots ? 'text-orange-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-xs font-bold leading-tight">Afternoon Slots</p>
                        <p className="text-[10px] opacity-75">12:00 - 17:00</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={afternoonSlots}
                      onChange={(e) => setAfternoonSlots(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 accent-blue-600"
                    />
                  </label>

                  {/* Evening */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${eveningSlots
                        ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <Moon size={16} className={eveningSlots ? 'text-indigo-600' : 'text-slate-400'} />
                      <div>
                        <p className="text-xs font-bold leading-tight">Evening Slots</p>
                        <p className="text-[10px] opacity-75">17:00 - 23:00</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={eveningSlots}
                      onChange={(e) => setEveningSlots(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-0 accent-blue-600"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* --- CARD 2: WEEKLY OFF DAYS & HOLIDAY DATES --- */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarOff className="text-rose-600" size={18} />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                    Off Days & Holiday Closures
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Recurring & Specific</span>
              </div>

              {/* Weekly Off Days Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Weekly Recurring Off Days (Deliveries closed)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = offDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleOffDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${isSelected
                            ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-sm'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                      >
                        {day} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Specific Blocked Dates */}
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Specific Holiday / Blocked Dates (YYYY-MM-DD)
                </label>

                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="date"
                    value={newDateInput}
                    onChange={(e) => setNewDateInput(e.target.value)}
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-blue-600"
                  />
                  <button
                    type="button"
                    onClick={handleAddBlockedDate}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus size={14} /> Add Blocked Date
                  </button>
                </div>

                {blockedDates.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No specific holiday dates blocked.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {blockedDates.map((dateStr) => (
                      <span
                        key={dateStr}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold"
                      >
                        <Calendar size={12} className="text-slate-500" />
                        {dateStr}
                        <button
                          type="button"
                          onClick={() => handleRemoveBlockedDate(dateStr)}
                          className="hover:text-rose-600 p-0.5"
                          title="Remove date"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- CARD 3: PREMIUM SLOTS (EXTRA DELIVERY FEES) --- */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-amber-500" size={18} />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                    High-Demand / Premium Slots
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                  Extra Fee
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Charge an additional convenience or late-night fee on specific high-demand slots.
              </p>

              {/* Add New Premium Slot Form */}
              <div className="flex flex-wrap items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex-1 min-w-[130px]">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Slot Time (HH:mm)</label>
                  <input
                    type="time"
                    value={newPremiumTime}
                    onChange={(e) => setNewPremiumTime(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                  />
                </div>

                <div className="flex-1 min-w-[130px]">
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Extra Fee (₹)</label>
                  <div className="relative">
                    <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={newPremiumFee}
                      onChange={(e) => setNewPremiumFee(e.target.value)}
                      placeholder="e.g. 40"
                      className="w-full pl-7 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div className="self-end">
                  <button
                    type="button"
                    onClick={handleAddPremiumSlot}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus size={14} /> Add Premium
                  </button>
                </div>
              </div>

              {/* Active Premium Slots Table */}
              {premiumSlots.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {premiumSlots.map((ps) => (
                    <div
                      key={ps.time}
                      className="flex items-center justify-between p-3 bg-white hover:bg-slate-50/80 transition-colors text-xs font-bold"
                    >
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-amber-500" />
                        <span className="text-slate-800 font-mono text-sm">{ps.time}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-amber-700 font-extrabold bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                          + ₹{ps.extraFee} extra
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePremiumSlot(ps.time)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete premium setting"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No extra fee slots defined.</p>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE GENERATED SLOTS & 1-CLICK CONTROLS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4 sticky top-6">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="text-indigo-600" size={18} />
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                      Live Delivery Slots
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {totalGeneratedSlots} Total Generated Slots
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {slotDuration}m windows
                </span>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 flex items-start gap-2.5 text-xs text-blue-900 font-medium">
                <Sliders size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Instant Controls:</strong> Click on any slot’s Lock icon to hide it instantly from customer checkout. Click again to unblock.
                </p>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                {['All', 'Morning', 'Afternoon', 'Evening'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`flex-1 py-1.5 rounded-lg transition-all ${selectedCategory === cat
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-500 hover:text-slate-700'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Slots List Container */}
              <div className="max-h-[560px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
                    <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
                    <p>Calculating live availability slots...</p>
                  </div>
                ) : filteredSlots.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-1">
                    <Clock size={28} className="mx-auto opacity-30 text-slate-500 mb-1" />
                    <p>No active slots generated for this criteria.</p>
                    <p className="text-[10px] font-medium text-slate-400">
                      Check operating hours, off-days, and day-window toggles.
                    </p>
                  </div>
                ) : (
                  filteredSlots.map((slot) => {
                    const isUnavailable = unavailableSlots.includes(slot.slotTime);
                    const isProcessing = actionSlotTime === slot.slotTime;

                    return (
                      <div
                        key={slot.slotTime}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${isUnavailable
                            ? 'bg-slate-100/80 border-slate-200 opacity-60'
                            : slot.isPremium
                              ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400'
                              : 'bg-white border-slate-200 hover:border-blue-400 shadow-sm'
                          }`}
                      >
                        {/* Slot details */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${isUnavailable
                                ? 'bg-slate-400'
                                : slot.category === 'Morning'
                                  ? 'bg-amber-400'
                                  : slot.category === 'Afternoon'
                                    ? 'bg-orange-400'
                                    : 'bg-indigo-400'
                              }`}
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-black truncate ${isUnavailable ? 'line-through text-slate-500' : 'text-slate-800'
                                }`}
                            >
                              {slot.displayTime}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {slot.category}
                              </span>

                              {slot.isPremium && (
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-black uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                                  <Sparkles size={9} /> +₹{slot.extraFee}
                                </span>
                              )}

                              {isUnavailable && (
                                <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                                  Hidden
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action: 1-Click Block / Unblock Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            isUnavailable
                              ? handleUnblockSlot(slot.slotTime)
                              : handleBlockSlot(slot.slotTime)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0 ${isUnavailable
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                            }`}
                          title={isUnavailable ? 'Make visible again' : 'Hide from checkout'}
                        >
                          {isProcessing ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : isUnavailable ? (
                            <>
                              <Unlock size={12} />
                              <span>Show</span>
                            </>
                          ) : (
                            <>
                              <Lock size={12} />
                              <span>Hide</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bottom Quick Save Alert */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Blocked: {unavailableSlots.length} slots</span>
                <button
                  type="button"
                  onClick={handleSaveConfiguration}
                  disabled={saving}
                  className="text-blue-600 hover:text-blue-800 font-bold hover:underline"
                >
                  Save All
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}