"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaSun, 
  FaMoon, 
  FaCalendarTimes, 
  FaBuilding, 
  FaCheckCircle, 
  FaInfoCircle, 
  FaCalendarAlt,
  FaCheck,
  FaHourglassHalf
} from 'react-icons/fa';

const DAYS_OPTIONS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
  'Friday', 'Saturday', 'Sunday'
];

export default function ClinicTimingsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Local Interactive Timings State
  const [timings, setTimings] = useState({
    clinicName: "Diabetic 11",
    startDay: 'Monday',
    endDay: 'Saturday',
    MorningStartTime: '09:00',
    MorningEndTime: '13:00',
    eveningStartTime: '14:00',
    eveningEndTime: '18:00',
    holiday: 'Sunday'
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (text, type = "success") => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleChange = (field, value) => {
    setTimings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Live Daily Hours Calculation
  const calculateDailyHours = () => {
    try {
      const [mStartH, mStartM] = timings.MorningStartTime.split(':').map(Number);
      const [mEndH, mEndM] = timings.MorningEndTime.split(':').map(Number);
      const [eStartH, eStartM] = timings.eveningStartTime.split(':').map(Number);
      const [eEndH, eEndM] = timings.eveningEndTime.split(':').map(Number);

      const morningMinutes = (mEndH * 60 + mEndM) - (mStartH * 60 + mStartM);
      const eveningMinutes = (eEndH * 60 + eEndM) - (eStartH * 60 + eStartM);

      const totalMinutes = (morningMinutes > 0 ? morningMinutes : 0) + (eveningMinutes > 0 ? eveningMinutes : 0);
      return (totalMinutes / 60).toFixed(1);
    } catch {
      return "0.0";
    }
  };

  // Live Working Days Calculation
  const getWorkingDaysCount = () => {
    const startIdx = DAYS_OPTIONS.indexOf(timings.startDay);
    const endIdx = DAYS_OPTIONS.indexOf(timings.endDay);
    if (startIdx === -1 || endIdx === -1) return 0;

    let count = 0;
    let i = startIdx;
    while (true) {
      if (DAYS_OPTIONS[i] !== timings.holiday) count++;
      if (i === endIdx) break;
      i = (i + 1) % 7;
    }
    return count;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      showToast("Clinic shift timings updated successfully!");
    }, 700);
  };

  if (!mounted) return null;

  const dailyHours = calculateDailyHours();
  const workingDays = getWorkingDaysCount();
  const weeklyHours = (parseFloat(dailyHours) * workingDays).toFixed(1);

  return (
    <div className="p-4 md:p-8 space-y-8 select-none animate-fadeIn">
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>

      {/* Toast Alert */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 p-4 rounded-2xl shadow-2xl text-xs font-black uppercase tracking-wider text-white border border-white/20 animate-fadeIn ${
          notification.type === 'danger' ? 'bg-rose-600' : 'bg-[#3D3F96]'
        }`}>
          {notification.text}
        </div>
      )}

      {/* Header Container */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Timings Management</h2>
          <p className="text-xs text-gray-400 mt-1">Configure morning & evening shifts, working days, and weekly holidays.</p>
        </div>

        <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-2xl text-[#3D3F96] text-xs font-black self-start sm:self-auto">
          <FaBuilding /> {timings.clinicName}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: TIMINGS FORM (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm">
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Working Days Configuration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-gray-800 uppercase tracking-wider">
                <FaCalendarAlt className="text-[#3D3F96]" />
                <span>Working Days Range</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-gray-400">Start Day</label>
                  <select
                    value={timings.startDay}
                    onChange={(e) => handleChange('startDay', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-xs font-bold text-gray-800 transition-all"
                  >
                    {DAYS_OPTIONS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-gray-400">End Day</label>
                  <select
                    value={timings.endDay}
                    onChange={(e) => handleChange('endDay', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-100 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3D3F96]/10 outline-none text-xs font-bold text-gray-800 transition-all"
                  >
                    {DAYS_OPTIONS.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Morning Shift Card */}
            <div className="bg-amber-50/50 border border-amber-100/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-amber-800 uppercase tracking-wider">
                <FaSun className="text-amber-500 text-sm" />
                <span>Morning Shift Schedule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-amber-700/60">Shift Start Time</label>
                  <input
                    type="time"
                    value={timings.MorningStartTime}
                    onChange={(e) => handleChange('MorningStartTime', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-amber-200/60 bg-white text-xs font-black text-gray-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-amber-700/60">Shift End Time</label>
                  <input
                    type="time"
                    value={timings.MorningEndTime}
                    onChange={(e) => handleChange('MorningEndTime', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-amber-200/60 bg-white text-xs font-black text-gray-800 outline-none focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>
            </div>

            {/* 3. Evening Shift Card */}
            <div className="bg-indigo-50/40 border border-indigo-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-[#3D3F96] uppercase tracking-wider">
                <FaMoon className="text-[#3D3F96] text-sm" />
                <span>Evening Shift Schedule</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-indigo-400">Shift Start Time</label>
                  <input
                    type="time"
                    value={timings.eveningStartTime}
                    onChange={(e) => handleChange('eveningStartTime', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-indigo-200/60 bg-white text-xs font-black text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-indigo-400">Shift End Time</label>
                  <input
                    type="time"
                    value={timings.eveningEndTime}
                    onChange={(e) => handleChange('eveningEndTime', e.target.value)}
                    className="px-4 py-3 rounded-xl border border-indigo-200/60 bg-white text-xs font-black text-gray-800 outline-none focus:ring-2 focus:ring-[#3D3F96]/20"
                  />
                </div>
              </div>
            </div>

            {/* 4. Weekly Holiday Card */}
            <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wider">
                <FaCalendarTimes className="text-rose-500 text-sm" />
                <span>Weekly Holiday Off</span>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-black text-rose-400">Select Holiday Day</label>
                <select
                  value={timings.holiday}
                  onChange={(e) => handleChange('holiday', e.target.value)}
                  className="px-4 py-3 rounded-xl border border-rose-200/60 bg-white text-xs font-black text-gray-800 outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  {DAYS_OPTIONS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <span className="text-[10px] font-semibold text-rose-400 mt-1">Note: Clinic operations will remain closed on this selected day.</span>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-lg shadow-indigo-950/10 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="animate-spin inline-block w-4 h-4 border-2 border-white rounded-full"></span>
                ) : (
                  <>
                    <FaCheck /> Save & Update Timings
                  </>
                )}
              </button>
            </div>

          </form>

        </div>

        {/* RIGHT COLUMN: LIVE TIMINGS SUMMARY & METRICS (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Summary Wrapper */}
          <div className="bg-white rounded-[2rem] border border-gray-100 p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-sm">
                <FaInfoCircle />
              </div>
              <div>
                <h4 className="text-sm font-black text-gray-800">Live Shifts Summary</h4>
                <span className="text-[10px] text-gray-400 font-bold block mt-0.5">Real-time schedule breakdown</span>
              </div>
            </div>

            {/* Working Days & Holiday pills */}
            <div className="space-y-3 text-xs font-bold">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-gray-400 text-[10px] uppercase font-black">Working Days</span>
                <span className="text-emerald-600 font-black">{timings.startDay} - {timings.endDay}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-gray-400 text-[10px] uppercase font-black">Weekly Holiday</span>
                <span className="text-rose-600 font-black">{timings.holiday}</span>
              </div>
            </div>

            {/* Shifts Overview Cards */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider flex items-center justify-center gap-1.5">
                  <FaSun className="text-amber-500" /> Morning Shift
                </span>
                <h5 className="text-base font-black text-amber-950">
                  {timings.MorningStartTime} - {timings.MorningEndTime}
                </h5>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-center space-y-1">
                <span className="text-[10px] font-black uppercase text-[#3D3F96] tracking-wider flex items-center justify-center gap-1.5">
                  <FaMoon className="text-[#3D3F96]" /> Evening Shift
                </span>
                <h5 className="text-base font-black text-indigo-950">
                  {timings.eveningStartTime} - {timings.eveningEndTime}
                </h5>
              </div>
            </div>

            {/* Operational Bandwidth Counters */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest block">Bandwidth Metrics</span>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-black text-gray-400 block">Days</span>
                  <span className="text-base font-black text-[#3D3F96] mt-0.5 block">{workingDays}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-black text-gray-400 block">Daily</span>
                  <span className="text-base font-black text-emerald-600 mt-0.5 block">{dailyHours}h</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[9px] uppercase font-black text-gray-400 block">Weekly</span>
                  <span className="text-base font-black text-sky-600 mt-0.5 block">{weeklyHours}h</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}