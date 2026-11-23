"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaLockOpen,
  FaSave,
  FaSpinner,
  FaExclamationCircle,
  FaDoorOpen,
  FaRupeeSign,
  FaCrown,
  FaUser,
  FaRedoAlt,
  FaSun,
  FaCloudSun,
  FaMoon,
} from "react-icons/fa";
import ClinicAPI from "../../../../../services/ClinicAPI";

const DAYS_OF_WEEK = [
  { short: "Mon", label: "Monday" },
  { short: "Tue", label: "Tuesday" },
  { short: "Wed", label: "Wednesday" },
  { short: "Thu", label: "Thursday" },
  { short: "Fri", label: "Friday" },
  { short: "Sat", label: "Saturday" },
  { short: "Sun", label: "Sunday" },
];

export default function ManageTiming({ doctor, onClose, onUpdated }) {
  const [activeTab, setActiveTab] = useState("slots"); // 'slots' | 'settings'
  const [selectedDate, setSelectedDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoadingSlot, setActionLoadingSlot] = useState(null);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // OPD Live data & config state
  const [liveData, setLiveData] = useState(null);

  // Form states for OPD Settings
  const [isOpdEnabled, setIsOpdEnabled] = useState(true);
  const [cabinNumber, setCabinNumber] = useState("");
  const [opdFee, setOpdFee] = useState(0);
  const [slotDuration, setSlotDuration] = useState(30);
  const [startTime, setStartTime] = useState("09:00 AM");
  const [endTime, setEndTime] = useState("05:00 PM");
  const [availableDays, setAvailableDays] = useState([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);

  // Block Modal Popup State
  const [blockModalSlot, setBlockModalSlot] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [isRecurringBlock, setIsRecurringBlock] = useState(false);

  const notify = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  // 1. Fetch Doctor OPD Settings and Live Slots
  const fetchSettingsAndSlots = useCallback(
    async (targetDate) => {
      try {
        setLoading(true);
        setError(null);
        const res = await ClinicAPI.getClinicDoctorOpdSettings(
          doctor._id,
          targetDate || selectedDate
        );

        if (res?.success && res.data) {
          const { doctor: docData, shiftHours, weeklyRoster, liveSlots } = res.data;

          setLiveData(res.data);
          setIsOpdEnabled(docData?.isOpdEnabled ?? true);
          setCabinNumber(docData?.cabinNumber || "");
          setOpdFee(docData?.opdFee ?? 500);
          setSlotDuration(docData?.slotDuration ?? 30);

          if (shiftHours?.startTime12h) {
            setStartTime(shiftHours.startTime12h);
            setEndTime(shiftHours.endTime12h);
          } else if (shiftHours?.startTime) {
            setStartTime(shiftHours.startTime);
            setEndTime(shiftHours.endTime);
          }

          if (weeklyRoster?.activeDays) {
            // Map full days to short format if necessary
            const shortList = weeklyRoster.activeDays.map((d) =>
              d.substring(0, 3)
            );
            setAvailableDays(shortList);
          }
        }
      } catch (err) {
        console.error("Failed to load OPD settings:", err);
        setError(err.response?.data?.message || "Failed to load OPD details.");
      } finally {
        setLoading(false);
      }
    },
    [doctor._id, selectedDate]
  );

  useEffect(() => {
    if (doctor?._id) {
      fetchSettingsAndSlots(selectedDate);
    }
  }, [doctor?._id, selectedDate, fetchSettingsAndSlots]);

  // 2. Save OPD Configuration
  const handleSaveOpdConfig = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      setError(null);

      const payload = {
        isOpdEnabled,
        cabinNumber,
        opdFee: Number(opdFee),
        slotDuration: Number(slotDuration),
        startTime,
        endTime,
        availableDays,
      };

      const res = await ClinicAPI.configureClinicDoctorOpdSettings(
        doctor._id,
        payload
      );

      if (res?.success) {
        notify("OPD shift and cabin settings saved successfully!");
        if (onUpdated) onUpdated(res.data?.doctor || {});
        fetchSettingsAndSlots(selectedDate);
        setActiveTab("slots");
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      setError(err.response?.data?.message || "Could not save OPD settings.");
    } finally {
      setSavingSettings(false);
    }
  };

  // Day toggle helper
  const toggleDay = (shortDay) => {
    setAvailableDays((prev) =>
      prev.includes(shortDay)
        ? prev.filter((d) => d !== shortDay)
        : [...prev, shortDay]
    );
  };

  // 3. Confirm Block Slot
  const handleConfirmBlock = async () => {
    if (!blockModalSlot) return;

    try {
      setActionLoadingSlot(blockModalSlot.time);
      const payload = {
        timeSlot: blockModalSlot.time,
        action: "block",
        date: isRecurringBlock ? undefined : selectedDate,
        reason: blockReason || "Doctor Unavailable",
      };

      const res = await ClinicAPI.toggleClinicDoctorOpdSlot(doctor._id, payload);

      if (res?.success) {
        notify(
          isRecurringBlock
            ? `Daily recurring block added for ${blockModalSlot.time}`
            : `Slot ${blockModalSlot.time} blocked for ${selectedDate}`
        );
        setBlockModalSlot(null);
        setBlockReason("");
        setIsRecurringBlock(false);
        fetchSettingsAndSlots(selectedDate);
      }
    } catch (err) {
      console.error("Block slot failed:", err);
      alert(err.response?.data?.message || "Failed to block slot.");
    } finally {
      setActionLoadingSlot(null);
    }
  };

  // 4. Unblock Slot
  const handleUnblockSlot = async (slot) => {
    if (
      !window.confirm(
        `Are you sure you want to unblock the ${slot.time} slot?`
      )
    )
      return;

    try {
      setActionLoadingSlot(slot.time);
      const payload = {
        timeSlot: slot.time,
        action: "unblock",
        date: selectedDate,
      };

      const res = await ClinicAPI.toggleClinicDoctorOpdSlot(doctor._id, payload);

      if (res?.success) {
        notify(`Slot ${slot.time} unblocked successfully!`);
        fetchSettingsAndSlots(selectedDate);
      }
    } catch (err) {
      console.error("Unblock slot failed:", err);
      alert(err.response?.data?.message || "Failed to unblock slot.");
    } finally {
      setActionLoadingSlot(null);
    }
  };

  // Categorize slots
  const slotsList = liveData?.liveSlots?.slots || [];
  const morningSlots = slotsList.filter((s) => s.category === "Morning");
  const afternoonSlots = slotsList.filter((s) => s.category === "Afternoon");
  const eveningSlots = slotsList.filter(
    (s) => s.category === "Evening" || (!["Morning", "Afternoon"].includes(s.category))
  );

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* --- Header --- */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#3D3F96] text-white flex items-center justify-center text-xl shadow-md shadow-indigo-900/20">
              <FaClock />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-800">
                  OPD Timings & Slot Manager
                </h3>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    isOpdEnabled
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  {isOpdEnabled ? "OPD Active" : "OPD Disabled"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Dr. {doctor?.name} &bull; {doctor?.speciality || "General"} &bull;{" "}
                {cabinNumber || "No Cabin Assigned"}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all shadow-sm"
          >
            <FaTimes size={14} />
          </button>
        </div>

        {/* --- Notifications --- */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <FaCheckCircle className="shrink-0" /> {successMsg}
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <FaExclamationCircle className="shrink-0" /> {error}
          </div>
        )}

        {/* --- Tab Navigation --- */}
        <div className="px-6 pt-4 flex items-center gap-2 border-b border-slate-100 shrink-0">
          <button
            onClick={() => setActiveTab("slots")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl text-xs font-black transition-all border-b-2 ${
              activeTab === "slots"
                ? "border-[#3D3F96] text-[#3D3F96] bg-indigo-50/40"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FaCalendarAlt size={12} /> Live Slots Grid & Blocking
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-t-2xl text-xs font-black transition-all border-b-2 ${
              activeTab === "settings"
                ? "border-[#3D3F96] text-[#3D3F96] bg-indigo-50/40"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            }`}
          >
            <FaClock size={12} /> OPD Roster & Shift Hours
          </button>
        </div>

        {/* --- Content Area --- */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center justify-center">
              <FaSpinner className="animate-spin text-3xl mb-3 text-[#3D3F96]" />
              <p className="text-xs font-bold text-slate-500">
                Fetching Doctor OPD settings and live slot grid...
              </p>
            </div>
          ) : activeTab === "slots" ? (
            /* ========================================================== */
            /* TAB 1: LIVE SLOTS & SLOT BLOCKING                          */
            /* ========================================================== */
            <div className="space-y-6">
              {/* Date Filter & Metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="text-xs font-bold text-slate-700">Select Date:</div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#3D3F96]"
                  />
                  <button
                    onClick={() => fetchSettingsAndSlots(selectedDate)}
                    title="Reload Slots"
                    className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#3D3F96] transition-all"
                  >
                    <FaRedoAlt size={12} />
                  </button>
                </div>

                {/* Slots Counter Pills */}
                {liveData?.liveSlots && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-slate-200/70 text-slate-700">
                      Total: {liveData.liveSlots.totalSlots || 0}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-emerald-100 text-emerald-700">
                      Available: {liveData.liveSlots.availableCount || 0}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-sky-100 text-sky-700">
                      Booked: {liveData.liveSlots.bookedCount || 0}
                    </span>
                    <span className="text-[11px] font-bold px-3 py-1 rounded-xl bg-rose-100 text-rose-700">
                      Blocked: {liveData.liveSlots.blockedCount || 0}
                    </span>
                  </div>
                )}
              </div>

              {/* Day Closed Alert */}
              {liveData?.liveSlots?.isClosed && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <FaExclamationCircle className="shrink-0" /> Doctor has a weekly
                  off on {liveData.liveSlots.day}. Slots are currently marked
                  closed.
                </div>
              )}

              {/* Slots Section */}
              {slotsList.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                  <FaCalendarAlt className="text-3xl mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-bold">No slots generated for this date.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Check if OPD is enabled or shift hours are properly configured in
                    the &quot;OPD Roster & Shift Hours&quot; tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Morning Slots */}
                  {morningSlots.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 mb-3">
                        <FaSun /> Morning Slots ({morningSlots.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {morningSlots.map((slot) => (
                          <SlotCard
                            key={slot.time24 || slot.time}
                            slot={slot}
                            loading={actionLoadingSlot === slot.time}
                            onBlock={() => {
                              setBlockModalSlot(slot);
                              setBlockReason("");
                              setIsRecurringBlock(false);
                            }}
                            onUnblock={() => handleUnblockSlot(slot)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {afternoonSlots.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-orange-600 mb-3">
                        <FaCloudSun /> Afternoon Slots ({afternoonSlots.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {afternoonSlots.map((slot) => (
                          <SlotCard
                            key={slot.time24 || slot.time}
                            slot={slot}
                            loading={actionLoadingSlot === slot.time}
                            onBlock={() => {
                              setBlockModalSlot(slot);
                              setBlockReason("");
                              setIsRecurringBlock(false);
                            }}
                            onUnblock={() => handleUnblockSlot(slot)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {eveningSlots.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-indigo-600 mb-3">
                        <FaMoon /> Evening Slots ({eveningSlots.length})
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {eveningSlots.map((slot) => (
                          <SlotCard
                            key={slot.time24 || slot.time}
                            slot={slot}
                            loading={actionLoadingSlot === slot.time}
                            onBlock={() => {
                              setBlockModalSlot(slot);
                              setBlockReason("");
                              setIsRecurringBlock(false);
                            }}
                            onUnblock={() => handleUnblockSlot(slot)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* ========================================================== */
            /* TAB 2: OPD CONFIGURATION & SHIFT TIMINGS                   */
            /* ========================================================== */
            <form onSubmit={handleSaveOpdConfig} className="space-y-6">
              {/* OPD Active Toggle */}
              <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-800">
                    OPD Consultation Status
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Enable or disable clinic OPD appointments for Dr. {doctor?.name}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isOpdEnabled}
                    onChange={(e) => setIsOpdEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]"></div>
                </label>
              </div>

              {/* Cabin, Fees, Slot Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <FaDoorOpen /> Cabin / Room
                  </label>
                  <input
                    type="text"
                    value={cabinNumber}
                    onChange={(e) => setCabinNumber(e.target.value)}
                    placeholder="e.g. Cabin 204"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#3D3F96]"
                  />
                </div>
{/* 
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <FaRupeeSign /> OPD Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={opdFee}
                    onChange={(e) => setOpdFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#3D3F96]"
                  />
                </div> */}

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 flex items-center gap-1.5">
                    <FaClock /> Slot Duration (Mins)
                  </label>
                  <select
                    value={slotDuration}
                    onChange={(e) => setSlotDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#3D3F96]"
                  >
                    <option value={10}>10 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={20}>20 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                  </select>
                </div>
              </div>

              {/* Shift Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-3xl border border-slate-100">
                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">
                    Shift Start Time
                  </label>
                  <input
                    type="text"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    placeholder="09:00 AM or 09:00"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#3D3F96]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-black uppercase text-slate-500 mb-1.5 block">
                    Shift End Time
                  </label>
                  <input
                    type="text"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    placeholder="05:00 PM or 17:00"
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-800 bg-white outline-none focus:border-[#3D3F96]"
                  />
                </div>
              </div>

              {/* Weekly Roster Working Days */}
              <div>
                <label className="text-[11px] font-black uppercase text-slate-500 mb-2 block">
                  Weekly Active Days
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                  {DAYS_OF_WEEK.map((d) => {
                    const isActive = availableDays.includes(d.short);
                    return (
                      <button
                        type="button"
                        key={d.short}
                        onClick={() => toggleDay(d.short)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isActive
                            ? "bg-[#3D3F96] text-white border-[#3D3F96] shadow-sm shadow-indigo-900/10"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-black">{d.short}</div>
                        <div
                          className={`text-[9px] uppercase tracking-wider font-bold ${
                            isActive ? "text-indigo-200" : "text-slate-400"
                          }`}
                        >
                          {isActive ? "Active" : "Off"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black tracking-wide shadow-lg shadow-indigo-950/15 disabled:opacity-50 transition-all"
                >
                  {savingSettings ? (
                    <>
                      <FaSpinner className="animate-spin text-sm" /> Saving Settings...
                    </>
                  ) : (
                    <>
                      <FaSave /> Save & Sync OPD Settings
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* --- Block Slot Modal Dialog --- */}
        {blockModalSlot && (
          <div className="fixed inset-0 z-[100000] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-800 flex items-center gap-2">
                  <FaBan className="text-rose-500" /> Block Slot:{" "}
                  {blockModalSlot.time}
                </h4>
                <button
                  onClick={() => setBlockModalSlot(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <FaTimes size={13} />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Reason for Blocking (Optional)
                  </label>
                  <input
                    type="text"
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="e.g. Doctor in Ward Round, Lunch Break"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold outline-none focus:border-[#3D3F96]"
                  />
                </div>

                <label className="flex items-center gap-2 cursor-pointer p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <input
                    type="checkbox"
                    checked={isRecurringBlock}
                    onChange={(e) => setIsRecurringBlock(e.target.checked)}
                    className="rounded text-[#3D3F96] focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-700 block">
                      Block as recurring daily slot
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      When checked, this slot will be permanently blocked every day
                      until unblocked.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBlockModalSlot(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBlock}
                  disabled={actionLoadingSlot === blockModalSlot.time}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-950/10 flex items-center gap-1.5"
                >
                  {actionLoadingSlot === blockModalSlot.time ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaBan />
                  )}
                  Confirm Block
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Component: Individual Slot Card
// -------------------------------------------------------------
function SlotCard({ slot, loading, onBlock, onUnblock }) {
  const isAvailable = slot.status === "Available" || slot.isAvailable;
  const isBooked = slot.status === "Booked";
  const isBlocked = slot.status === "Blocked" || !isAvailable && !isBooked;

  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2.5 ${
        isAvailable
          ? "bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-md"
          : isBooked
          ? "bg-sky-50/50 border-sky-200"
          : "bg-rose-50/40 border-rose-200"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
            {slot.time}
            {slot.isPremium && (
              <span
                title="Premium Slot"
                className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 flex items-center gap-0.5"
              >
                <FaCrown size={8} /> +₹{slot.extraFee}
              </span>
            )}
          </div>
          <div className="text-[10px] text-slate-400 font-medium">
            {slot.displayTime || slot.time}
          </div>
        </div>

        <span
          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
            isAvailable
              ? "bg-emerald-100 text-emerald-700"
              : isBooked
              ? "bg-sky-100 text-sky-700"
              : "bg-rose-100 text-rose-700"
          }`}
        >
          {slot.status}
        </span>
      </div>

      {/* Booked Info */}
      {isBooked && slot.bookedDetails && (
        <div className="p-2 rounded-xl bg-white/80 border border-sky-100 text-[10px] text-slate-600">
          <div className="font-bold flex items-center gap-1 text-sky-900">
            <FaUser size={9} /> {slot.bookedDetails.patientName}
          </div>
          <div className="text-[9px] text-slate-400">
            ID: {slot.bookedDetails.bookingId || slot.bookedDetails.appointmentId}
          </div>
        </div>
      )}

      {/* Block Reason Info */}
      {isBlocked && (
        <div className="text-[10px] text-rose-600 font-medium italic">
          {slot.blockReason ? `"${slot.blockReason}"` : "Slot Blocked"}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-1 flex items-center justify-between border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-600">
          ₹{slot.totalFee || 0}
        </span>

        {isAvailable && (
          <button
            type="button"
            onClick={onBlock}
            disabled={loading}
            className="text-[10px] font-black text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
          >
            {loading ? <FaSpinner className="animate-spin" /> : <FaBan size={9} />}
            Block
          </button>
        )}

        {isBlocked && (
          <button
            type="button"
            onClick={onUnblock}
            disabled={loading}
            className="text-[10px] font-black text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1"
          >
            {loading ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaLockOpen size={9} />
            )}
            Unblock
          </button>
        )}
      </div>
    </div>
  );
}