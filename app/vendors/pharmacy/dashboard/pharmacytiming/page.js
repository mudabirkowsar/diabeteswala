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
  Save,
  X,
  IndianRupee,
  Lock,
  Unlock,
  Store,
  Layers,
  CalendarOff,
  Sliders,
  Check,
  EyeOff
} from 'lucide-react';

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
  // --- Loading & Notification States ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionSlotTime, setActionSlotTime] = useState(null);
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

  // Filter for live slots view ('All', 'Morning', 'Afternoon', 'Evening', 'Blocked')
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Helper to format 24h slot time (e.g., "14:00") into readable 12h range
  const formatSlotTimeRange = (timeStr, duration = slotDuration) => {
    if (!timeStr) return '';
    try {
      const [h, m] = timeStr.split(':').map(Number);
      const startMins = h * 60 + m;
      const endMins = startMins + duration;

      const to12Hr = (total) => {
        const hrs24 = Math.floor(total / 60) % 24;
        const mins = total % 60;
        const period = hrs24 >= 12 ? 'PM' : 'AM';
        const hrs12 = hrs24 % 12 || 12;
        return `${String(hrs12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
      };

      return `${to12Hr(startMins)} - ${to12Hr(endMins)}`;
    } catch {
      return timeStr;
    }
  };

  // Helper to determine time of day category
  const getSlotCategory = (timeStr) => {
    if (!timeStr) return 'General';
    const hour = parseInt(timeStr.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return 'Morning';
    if (hour >= 12 && hour < 17) return 'Afternoon';
    return 'Evening';
  };

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

  // --- 2. Save / Update Configuration ---
  const handleSaveConfiguration = async (e) => {
    e?.preventDefault();

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
        if (!unavailableSlots.includes(timeStr)) {
          setUnavailableSlots((prev) => [...prev, timeStr]);
        }
        setMessage({ type: 'success', text: `Slot ${timeStr} is now blocked and hidden.` });
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
        setUnavailableSlots((prev) => prev.filter((t) => t !== timeStr));
        setMessage({ type: 'success', text: `Slot ${timeStr} is unblocked and visible again!` });
        await fetchSlotsData();
      }
    } catch (err) {
      console.error('Error unblocking slot:', err);
      setMessage({
        type: 'error',
        text: err?.response?.data?.message || `Failed to unblock slot ${timeStr}.`
      });
    } finally {
      setActionSlotTime(null);
    }
  };

  // --- UI Helpers ---
  const toggleOffDay = (day) => {
    setOffDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

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

  // Combine Active generated slots and Blocked unavailable slots for the list
  const combinedSlotsList = useMemo(() => {
    // 1. Convert active slots from backend
    const activeList = generatedSlots.map((s) => ({
      ...s,
      isUnavailable: false
    }));

    // 2. Synthesize entries for blocked slots that backend removed from generatedSlots
    const blockedList = unavailableSlots.map((time) => {
      const isPrem = premiumSlots.some((p) => p.time === time);
      const premObj = premiumSlots.find((p) => p.time === time);
      return {
        slotTime: time,
        displayTime: formatSlotTimeRange(time, slotDuration),
        category: getSlotCategory(time),
        isPremium: isPrem,
        extraFee: premObj ? premObj.extraFee : 0,
        isUnavailable: true
      };
    });

    // 3. Filter by Selected Category Tab
    if (selectedCategory === 'Blocked') {
      return blockedList;
    }

    const all = [...activeList, ...blockedList].sort((a, b) =>
      a.slotTime.localeCompare(b.slotTime)
    );

    if (selectedCategory === 'All') return all;
    return all.filter((s) => s.category?.toLowerCase() === selectedCategory.toLowerCase());
  }, [generatedSlots, unavailableSlots, selectedCategory, slotDuration, premiumSlots]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased ">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ================= HEADER SECTION ================= */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#3d3f96] text-white flex items-center justify-center shadow-md shadow-indigo-200 shrink-0">
              <Store size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Pharmacy Slots & Availability
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Check size={12} /> Live Engine
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Configure delivery timings, block/unblock slots, and manage holiday off-days.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={fetchSlotsData}
              disabled={loading}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all disabled:opacity-50"
              title="Refresh Slots"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin text-[#3d3f96]' : ''} />
              <span>Refresh</span>
            </button>

            <button
              onClick={handleSaveConfiguration}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-200 active:scale-95 transition-all disabled:opacity-50"
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>

        {/* ================= ALERTS BANNER ================= */}
        {message.text && (
          <div
            className={`p-4 rounded-xl flex items-start justify-between gap-3 text-xs sm:text-sm font-semibold border transition-all ${
              message.type === 'success'
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
                  <Clock className="text-[#3d3f96]" size={18} />
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none transition-all"
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
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:bg-white focus:border-[#3d3f96] outline-none transition-all"
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

              {/* Day Window Toggles */}
              <div className="pt-2 border-t border-slate-100">
                <label className="text-xs font-black text-slate-700 uppercase tracking-wider block mb-3">
                  Active Delivery Day Windows
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Morning */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      morningSlots
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
                      className="w-4 h-4 rounded text-[#3d3f96] accent-[#3d3f96]"
                    />
                  </label>

                  {/* Afternoon */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      afternoonSlots
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
                      className="w-4 h-4 rounded text-[#3d3f96] accent-[#3d3f96]"
                    />
                  </label>

                  {/* Evening */}
                  <label
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all select-none ${
                      eveningSlots
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
                      className="w-4 h-4 rounded text-[#3d3f96] accent-[#3d3f96]"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* --- CARD 2: DEDICATED BLOCKED / HIDDEN SLOTS MANAGEMENT --- */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <EyeOff className="text-rose-600" size={18} />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                    Currently Blocked / Hidden Slots
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                  {unavailableSlots.length} Blocked
                </span>
              </div>

              <p className="text-xs text-slate-500">
                These slots are hidden from user bookings. Click <strong>Unblock</strong> on any slot to make it bookable again.
              </p>

              {unavailableSlots.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-400 font-semibold">
                  <CheckCircle2 size={20} className="mx-auto text-emerald-500 mb-1" />
                  No slots are currently blocked. All generated slots are available!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {unavailableSlots.map((timeStr) => {
                    const isProcessing = actionSlotTime === timeStr;
                    return (
                      <div
                        key={timeStr}
                        className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-200/80 shadow-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Lock size={14} className="text-rose-600 shrink-0" />
                          <div className="min-w-0">
                            <span className="text-xs font-black text-slate-800 block truncate">
                              {formatSlotTimeRange(timeStr, slotDuration)}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-bold block">
                              24h: {timeStr}
                            </span>
                          </div>
                        </div>

                        {/* Unblock Button */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() => handleUnblockSlot(timeStr)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition-all active:scale-95 disabled:opacity-50 shrink-0"
                          title="Restore and make bookable again"
                        >
                          {isProcessing ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <>
                              <Unlock size={12} />
                              <span>Unblock</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* --- CARD 3: WEEKLY OFF DAYS & HOLIDAY DATES --- */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CalendarOff className="text-slate-700" size={18} />
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                    Off Days & Holiday Closures
                  </h2>
                </div>
                <span className="text-[11px] font-bold text-slate-400">Weekly & Specific</span>
              </div>

              {/* Weekly Off Days */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">
                  Weekly Recurring Off Days (Closed for delivery)
                </label>
                <div className="flex flex-wrap gap-2">
                  {DAYS_OF_WEEK.map((day) => {
                    const isSelected = offDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleOffDay(day)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
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
                    className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
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
                  <p className="text-xs text-slate-400 italic">No specific holiday dates added.</p>
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

            {/* --- CARD 4: PREMIUM SLOTS (EXTRA DELIVERY FEES) --- */}
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

          {/* RIGHT COLUMN: LIVE GENERATED & BLOCKED SLOTS (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">

            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4 sticky top-6">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="text-[#3d3f96]" size={18} />
                  <div>
                    <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase tracking-wider">
                      Live Delivery Slots
                    </h2>
                    <p className="text-[10px] text-slate-400 font-bold">
                      {totalGeneratedSlots} Active &bull; {unavailableSlots.length} Blocked
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                  {slotDuration}m windows
                </span>
              </div>

              {/* Info banner */}
              <div className="bg-indigo-50/60 border border-indigo-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-indigo-900 font-medium">
                <Sliders size={16} className="text-[#3d3f96] shrink-0 mt-0.5" />
                <p>
                  Click <strong>Hide</strong> to block any slot from user checkout. Click <strong>Unblock</strong> to make it visible again anytime!
                </p>
              </div>

              {/* Category Filter Tabs including "Blocked" */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
                {['All', 'Morning', 'Afternoon', 'Evening', 'Blocked'].map((cat) => {
                  const isBlockedTab = cat === 'Blocked';
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex-1 py-1.5 px-2 rounded-lg transition-all whitespace-nowrap text-center ${
                        selectedCategory === cat
                          ? isBlockedTab
                            ? 'bg-rose-600 text-white shadow-sm'
                            : 'bg-white text-slate-900 shadow-sm'
                          : isBlockedTab
                          ? 'text-rose-600 hover:bg-rose-50'
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {cat} {isBlockedTab && `(${unavailableSlots.length})`}
                    </button>
                  );
                })}
              </div>

              {/* Slots List Container */}
              <div className="max-h-[580px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {loading ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-2">
                    <RefreshCw size={24} className="animate-spin text-[#3d3f96] mx-auto" />
                    <p>Loading slots...</p>
                  </div>
                ) : combinedSlotsList.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 font-bold text-xs space-y-1">
                    <Clock size={28} className="mx-auto opacity-30 text-slate-500 mb-1" />
                    <p>
                      {selectedCategory === 'Blocked'
                        ? 'No slots are currently blocked!'
                        : 'No slots found for this category.'}
                    </p>
                  </div>
                ) : (
                  combinedSlotsList.map((slot) => {
                    const isProcessing = actionSlotTime === slot.slotTime;

                    return (
                      <div
                        key={slot.slotTime}
                        className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                          slot.isUnavailable
                            ? 'bg-rose-50/60 border-rose-200'
                            : slot.isPremium
                            ? 'bg-amber-50/40 border-amber-200/80 hover:border-amber-400'
                            : 'bg-white border-slate-200 hover:border-[#3d3f96] shadow-sm'
                        }`}
                      >
                        {/* Slot details */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              slot.isUnavailable
                                ? 'bg-rose-500'
                                : slot.category === 'Morning'
                                ? 'bg-amber-400'
                                : slot.category === 'Afternoon'
                                ? 'bg-orange-400'
                                : 'bg-indigo-400'
                            }`}
                          />
                          <div className="min-w-0">
                            <p
                              className={`text-xs font-black truncate ${
                                slot.isUnavailable ? 'line-through text-slate-500' : 'text-slate-800'
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

                              {slot.isUnavailable && (
                                <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-200">
                                  Blocked
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Action Button: Block or Unblock */}
                        <button
                          type="button"
                          disabled={isProcessing}
                          onClick={() =>
                            slot.isUnavailable
                              ? handleUnblockSlot(slot.slotTime)
                              : handleBlockSlot(slot.slotTime)
                          }
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50 shrink-0 ${
                            slot.isUnavailable
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200'
                          }`}
                          title={slot.isUnavailable ? 'Unblock and make visible' : 'Hide from checkout'}
                        >
                          {isProcessing ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : slot.isUnavailable ? (
                            <>
                              <Unlock size={12} />
                              <span>Unblock</span>
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
                <span>Total Blocked: {unavailableSlots.length} slots</span>
                <button
                  type="button"
                  onClick={handleSaveConfiguration}
                  disabled={saving}
                  className="text-[#3d3f96] hover:text-[#2d2f75] font-bold hover:underline"
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