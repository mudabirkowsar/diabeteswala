"use client";

import React, { useState, useEffect } from 'react';
import { 
  FaClock, 
  FaSun, 
  FaMoon, 
  FaSave, 
  FaRedo, 
  FaCheckCircle, 
  FaHospital, 
  FaAmbulance, 
  FaUserMd, 
  FaBed, 
  FaBusinessTime, 
  FaCalendarDay, 
  FaSpinner, 
  FaTimes, 
  FaExclamationTriangle,
  FaBolt,
  FaCoffee
} from 'react-icons/fa';

import ClinicAPI from '../../../../services/ClinicAPI';

const DAYS_OF_WEEK = [
  'Monday', 
  'Tuesday', 
  'Wednesday', 
  'Thursday', 
  'Friday', 
  'Saturday', 
  'Sunday'
];

const TIME_OPTIONS = [
  "12:00 AM", "12:30 AM", "01:00 AM", "01:30 AM", "02:00 AM", "02:30 AM",
  "03:00 AM", "03:30 AM", "04:00 AM", "04:30 AM", "05:00 AM", "05:30 AM",
  "06:00 AM", "06:30 AM", "07:00 AM", "07:30 AM", "08:00 AM", "08:30 AM", 
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", 
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", 
  "06:00 PM", "06:30 PM", "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", 
  "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "11:59 PM"
];

const SLOT_DURATIONS = [15, 20, 30, 45, 60];

export default function ClinicTimingsFacilitiesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toast, setToast] = useState(null);

  // --- 1. DEPARTMENT FACILITIES TOGGLES ---
  const [facilities, setFacilities] = useState({
    is24x7: false,
    isOPD: true,
    isIPD: true,
    isEmergency: true
  });

  // --- 2. DEPARTMENT SERVICE TIMINGS ---
  const [serviceTimings, setServiceTimings] = useState({
    emergency: { is24x7: false, startTime: "06:00 PM", endTime: "09:00 AM" },
    ipd: { is24x7: false, startTime: "10:00 AM", endTime: "08:00 PM" },
    opd: { is24x7: false, startTime: "09:00 AM", endTime: "06:00 PM" }
  });

  // --- 3. OPD SHIFTS & WORKING DAYS ---
  const [shifts, setShifts] = useState({
    startDay: 'Monday',
    endDay: 'Saturday',
    holiday: 'Sunday',
    morningStartTime: '09:00 AM',
    morningEndTime: '01:00 PM',
    eveningStartTime: '02:00 PM',
    eveningEndTime: '06:00 PM',
    slotDuration: 30
  });

  // --- 4. METRICS FROM API ---
  const [metrics, setMetrics] = useState({
    days: 6,
    daily: '8.0h',
    weekly: '48.0h'
  });

  const [summary, setSummary] = useState({
    workingDays: 'Monday - Saturday',
    weeklyHoliday: 'Sunday'
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch initial configuration on mount
  const fetchTimingsAndFacilities = async () => {
    try {
      setLoading(true);
      const res = await ClinicAPI.getClinicTimingsAndFacilities();

      if (res?.success && res?.data) {
        const d = res.data;

        if (d.facilities) {
          setFacilities({
            is24x7: Boolean(d.facilities.is24x7),
            isOPD: Boolean(d.facilities.isOPD),
            isIPD: Boolean(d.facilities.isIPD),
            isEmergency: Boolean(d.facilities.isEmergency)
          });
        }

        if (d.serviceTimings) {
          setServiceTimings({
            emergency: d.serviceTimings.emergency || { is24x7: false, startTime: "06:00 PM", endTime: "09:00 AM" },
            ipd: d.serviceTimings.ipd || { is24x7: false, startTime: "10:00 AM", endTime: "08:00 PM" },
            opd: d.serviceTimings.opd || { is24x7: false, startTime: "09:00 AM", endTime: "06:00 PM" }
          });
        }

        setShifts({
          startDay: d.workingDaysRange?.startDay || 'Monday',
          endDay: d.workingDaysRange?.endDay || 'Saturday',
          holiday: d.weeklyHoliday || 'Sunday',
          morningStartTime: d.morningShift?.shiftStartTime || '09:00 AM',
          morningEndTime: d.morningShift?.shiftEndTime || '01:00 PM',
          eveningStartTime: d.eveningShift?.shiftStartTime || '02:00 PM',
          eveningEndTime: d.eveningShift?.shiftEndTime || '06:00 PM',
          slotDuration: d.slotDuration || 30
        });

        if (d.bandwidthMetrics) setMetrics(d.bandwidthMetrics);
        if (d.summary) setSummary(d.summary);
      }
    } catch (err) {
      console.error("Failed to load timings and facilities:", err);
      showToast(err.response?.data?.message || "Could not fetch configuration", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimingsAndFacilities();
  }, []);

  const handleFacilityToggle = (key) => {
    setFacilities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleServiceTimingChange = (service, field, value) => {
    setServiceTimings(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        [field]: value
      }
    }));
  };

  const handleShiftChange = (e) => {
    const { name, value } = e.target;
    setShifts(prev => ({ ...prev, [name]: value }));
  };

  // Submit / Update configuration
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    let payload;

    if (facilities.is24x7) {
      payload = {
        is24x7: true,
        isOPD: facilities.isOPD,
        isIPD: facilities.isIPD,
        isEmergency: facilities.isEmergency
      };
    } else {
      payload = {
        is24x7: false,
        isOPD: facilities.isOPD,
        isIPD: facilities.isIPD,
        isEmergency: facilities.isEmergency,
        startDay: shifts.startDay,
        endDay: shifts.endDay,
        holiday: shifts.holiday,
        morningStartTime: shifts.morningStartTime,
        morningEndTime: shifts.morningEndTime,
        eveningStartTime: shifts.eveningStartTime,
        eveningEndTime: shifts.eveningEndTime,
        emergencyTimings: serviceTimings.emergency,
        ipdTimings: serviceTimings.ipd,
        opdTimings: serviceTimings.opd,
        slotDuration: Number(shifts.slotDuration)
      };
    }

    try {
      let res;
      try {
        res = await ClinicAPI.updateClinicTimingsAndFacilities(payload);
      } catch (err) {
        if (err.response?.status === 404 || err.response?.data?.message?.includes('not found')) {
          res = await ClinicAPI.createClinicTimingsAndFacilities(payload);
        } else {
          throw err;
        }
      }

      if (res?.success) {
        showToast(res.message || "Timings & facilities updated successfully!");
        if (res.data?.bandwidthMetrics) setMetrics(res.data.bandwidthMetrics);
        if (res.data?.summary) setSummary(res.data.summary);
        if (res.data?.facilities) setFacilities(res.data.facilities);
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast(err.response?.data?.message || "Failed to save configuration", "error");
    } finally {
      setSaving(false);
    }
  };

  // Reset to default
  const handleReset = async () => {
    setResetting(true);
    try {
      const res = await ClinicAPI.resetClinicTimingsAndFacilities();
      if (res?.success) {
        showToast(res.message || "Schedule reset to default configuration!");
        setShowResetModal(false);
        fetchTimingsAndFacilities();
      }
    } catch (err) {
      console.error("Reset error:", err);
      showToast(err.response?.data?.message || "Failed to reset timings", "error");
    } finally {
      setResetting(false);
    }
  };

  const hasAnyFacilitySelected = facilities.isOPD || facilities.isIPD || facilities.isEmergency;

  return (
    <div className="space-y-8 select-none max-w-7xl mx-auto">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[999999] px-5 py-3.5 rounded-2xl text-white text-xs font-bold shadow-2xl border border-white/20 flex items-center gap-2 animate-fadeIn ${
          toast.type === 'error' ? 'bg-rose-600' : 'bg-[#3D3F96]'
        }`}>
          {toast.type === 'error' ? <FaExclamationTriangle /> : <FaCheckCircle />}
          {toast.message}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Clinic Timings, Facilities & 24/7 Operations</h2>
          <p className="text-xs text-gray-400 mt-1">Enable clinical departments to set up their specific operational hours and shifts.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => setShowResetModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-bold transition-all shadow-sm"
          >
            <FaRedo size={11} /> Reset Defaults
          </button>

          <button 
            type="submit" 
            form="timings-facilities-form"
            disabled={saving || loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-[#3D3F96] hover:bg-[#2C2E75] text-white text-xs font-bold transition-all shadow-lg shadow-indigo-950/10 disabled:opacity-60"
          >
            {saving ? <><FaSpinner className="animate-spin" /> Saving...</> : <><FaSave /> Save & Update</>}
          </button>
        </div>
      </div>

      {/* --- LIVE METRICS BANNER --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-xl shrink-0">
            <FaCalendarDay />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Working Days</span>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{metrics.days} Days / Week</h4>
            <span className="text-[10px] font-semibold text-slate-500">
              {facilities.is24x7 ? "Monday - Sunday" : summary.workingDays}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <FaBusinessTime />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Daily Active Hours</span>
            <h4 className="text-xl font-black text-emerald-600 mt-0.5">{metrics.daily}</h4>
            <span className="text-[10px] font-semibold text-emerald-600">
              {facilities.is24x7 ? "24h Continuous Operation" : "Shift Operating Windows"}
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center text-xl shrink-0">
            <FaClock />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Bandwidth</span>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">{metrics.weekly}</h4>
            <span className="text-[10px] font-semibold text-slate-500">{shifts.slotDuration} min consultation slots</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
            facilities.is24x7 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
          }`}>
            {facilities.is24x7 ? <FaBolt /> : <FaCoffee />}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Weekly Off / Holiday</span>
            <h4 className="text-xl font-black text-slate-800 mt-0.5">
              {facilities.is24x7 ? "None (24/7)" : shifts.holiday}
            </h4>
            <span className={`text-[10px] font-semibold ${facilities.is24x7 ? 'text-amber-600' : 'text-rose-500'}`}>
              {facilities.is24x7 ? "Always Open" : "Clinic Closed"}
            </span>
          </div>
        </div>
      </div>

      <form id="timings-facilities-form" onSubmit={handleSave} className="space-y-8">
        
        {/* ========================================================= */}
        {/* 1. MASTER 24/7 TOGGLE & DEPARTMENT FACILITY SWITCHES     */}
        {/* ========================================================= */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          
          {/* Master 24/7 Mode Switch */}
          <div className={`p-6 rounded-3xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            facilities.is24x7 
              ? 'bg-gradient-to-r from-amber-50/90 via-white to-amber-50/40 border-amber-300 shadow-sm' 
              : 'bg-slate-50/80 border-slate-200'
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm shrink-0 ${
                facilities.is24x7 ? 'bg-amber-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                <FaBolt />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-slate-900">24/7 Round-the-Clock Clinic Mode</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    facilities.is24x7 ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {facilities.is24x7 ? "24/7 Enabled" : "Shift Based"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-xl">
                  {facilities.is24x7 
                    ? "Your clinic operates 24 hours round-the-clock. Individual timing windows and holiday off-days are automatically bypassed."
                    : "Turn this on if your clinic is open 24 hours continuously. Turn off to set custom timing boxes for each department below."}
                </p>
              </div>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                checked={facilities.is24x7}
                onChange={() => handleFacilityToggle('is24x7')}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
            </label>
          </div>

          {/* Department Selection Cards */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#3D3F96] mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3D3F96]"></span> Select Active Facilities (Toggle to set their timings below)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* OPD Card */}
              <div 
                onClick={() => handleFacilityToggle('isOPD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  facilities.isOPD 
                    ? 'bg-indigo-50/40 border-[#3D3F96] shadow-sm' 
                    : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                    facilities.isOPD ? 'bg-[#3D3F96] text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <FaUserMd />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">OPD Services</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">Doctor Outpatient Desk</span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  facilities.isOPD ? 'border-[#3D3F96] bg-[#3D3F96] text-white text-[10px]' : 'border-slate-300'
                }`}>
                  {facilities.isOPD && "✓"}
                </div>
              </div>

              {/* IPD Card */}
              <div 
                onClick={() => handleFacilityToggle('isIPD')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  facilities.isIPD 
                    ? 'bg-emerald-50/40 border-emerald-500 shadow-sm' 
                    : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                    facilities.isIPD ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <FaBed />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">IPD & Daycare</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">Ward & Bed Admissions</span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  facilities.isIPD ? 'border-emerald-600 bg-emerald-600 text-white text-[10px]' : 'border-slate-300'
                }`}>
                  {facilities.isIPD && "✓"}
                </div>
              </div>

              {/* Emergency Card */}
              <div 
                onClick={() => handleFacilityToggle('isEmergency')}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  facilities.isEmergency 
                    ? 'bg-rose-50/40 border-rose-500 shadow-sm' 
                    : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base ${
                    facilities.isEmergency ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    <FaAmbulance />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800">Emergency Desk</h5>
                    <span className="text-[10px] text-slate-400 font-semibold">Casualty & Urgent Care</span>
                  </div>
                </div>

                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  facilities.isEmergency ? 'border-rose-500 bg-rose-500 text-white text-[10px]' : 'border-slate-300'
                }`}>
                  {facilities.isEmergency && "✓"}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CONDITIONAL TIMINGS SECTION                           */}
        {/* Appears when 24/7 is false and departments are selected   */}
        {/* ========================================================= */}
        {!facilities.is24x7 ? (
          <div className="space-y-6">
            
            {/* --- BOX A: IPD ADMISSION TIMINGS (SHOWN ONLY IF IPD IS CHOSEN) --- */}
            {facilities.isIPD && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-emerald-200 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                      <FaBed />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">IPD & Daycare Admission Hours</h4>
                      <p className="text-xs text-slate-400">Configure patient admission and visiting hours window</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-emerald-700 cursor-pointer bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <input 
                      type="checkbox" 
                      checked={serviceTimings.ipd.is24x7}
                      onChange={(e) => handleServiceTimingChange('ipd', 'is24x7', e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    24/7 Round-the-Clock Admissions
                  </label>
                </div>

                {!serviceTimings.ipd.is24x7 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Admissions Open Time</label>
                      <select 
                        value={serviceTimings.ipd.startTime}
                        onChange={(e) => handleServiceTimingChange('ipd', 'startTime', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
                      >
                        {TIME_OPTIONS.map(t => <option key={`ipd-s-${t}`} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Admissions Close Time</label>
                      <select 
                        value={serviceTimings.ipd.endTime}
                        onChange={(e) => handleServiceTimingChange('ipd', 'endTime', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
                      >
                        {TIME_OPTIONS.map(t => <option key={`ipd-e-${t}`} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs font-bold text-emerald-700 text-center">
                    ✓ Inpatient Admissions are open 24 Hours Daily without time restrictions.
                  </div>
                )}
              </div>
            )}

            {/* --- BOX B: EMERGENCY TIMINGS (SHOWN ONLY IF EMERGENCY IS CHOSEN) --- */}
            {facilities.isEmergency && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-rose-200 shadow-sm space-y-4 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center text-base">
                      <FaAmbulance />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Emergency Desk & Casualty Timings</h4>
                      <p className="text-xs text-slate-400">Configure urgent care window or mark as 24/7 readiness</p>
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs font-bold text-rose-700 cursor-pointer bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    <input 
                      type="checkbox" 
                      checked={serviceTimings.emergency.is24x7}
                      onChange={(e) => handleServiceTimingChange('emergency', 'is24x7', e.target.checked)}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    24/7 Always Open Emergency
                  </label>
                </div>

                {!serviceTimings.emergency.is24x7 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emergency Open Time</label>
                      <select 
                        value={serviceTimings.emergency.startTime}
                        onChange={(e) => handleServiceTimingChange('emergency', 'startTime', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
                      >
                        {TIME_OPTIONS.map(t => <option key={`em-s-${t}`} value={t}>{t}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">Emergency Close Time</label>
                      <select 
                        value={serviceTimings.emergency.endTime}
                        onChange={(e) => handleServiceTimingChange('emergency', 'endTime', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-slate-800 outline-none"
                      >
                        {TIME_OPTIONS.map(t => <option key={`em-e-${t}`} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200 text-xs font-bold text-rose-700 text-center">
                    ✓ Emergency and Casualty Desk is operational 24 Hours Round-the-Clock.
                  </div>
                )}
              </div>
            )}

            {/* --- BOX C: OPD SCHEDULE & SHIFTS (SHOWN ONLY IF OPD IS CHOSEN) --- */}
            {facilities.isOPD && (
              <div className="bg-white p-6 md:p-8 rounded-3xl border border-indigo-200 shadow-sm space-y-6 animate-fadeIn">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3D3F96] flex items-center justify-center text-base">
                    <FaUserMd />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900">OPD Consultation Shifts & Working Days</h4>
                    <p className="text-xs text-slate-400">Configure weekly active days, holiday, slot duration, and dual shifts</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Working Days & Holiday */}
                  <div className="space-y-4 p-5 rounded-2xl bg-slate-50/80 border border-slate-200">
                    <span className="text-xs font-black uppercase tracking-wide text-slate-700 block">Weekly Working Days & Holiday</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Start Day</label>
                        <select 
                          name="startDay"
                          value={shifts.startDay}
                          onChange={handleShiftChange}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none"
                        >
                          {DAYS_OF_WEEK.map(d => <option key={`start-${d}`} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">End Day</label>
                        <select 
                          name="endDay"
                          value={shifts.endDay}
                          onChange={handleShiftChange}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none"
                        >
                          {DAYS_OF_WEEK.map(d => <option key={`end-${d}`} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Weekly Holiday (Closed)</label>
                        <select 
                          name="holiday"
                          value={shifts.holiday}
                          onChange={handleShiftChange}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-rose-200 bg-rose-50 text-rose-700 outline-none"
                        >
                          {DAYS_OF_WEEK.map(d => <option key={`hol-${d}`} value={d}>{d}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">Slot Interval (Duration)</label>
                        <select 
                          name="slotDuration"
                          value={shifts.slotDuration}
                          onChange={handleShiftChange}
                          className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white outline-none"
                        >
                          {SLOT_DURATIONS.map(dur => (
                            <option key={dur} value={dur}>{dur} Mins / Appointment</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Shifts Timings */}
                  <div className="space-y-4 p-5 rounded-2xl bg-indigo-50/30 border border-indigo-100">
                    <span className="text-xs font-black uppercase tracking-wide text-[#3D3F96] block">OPD Consultation Shifts</span>
                    
                    {/* Morning Shift */}
                    <div className="p-3 rounded-xl bg-white border border-amber-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-800">
                        <span className="flex items-center gap-1.5"><FaSun className="text-amber-500" /> Morning Shift</span>
                        <span className="text-[10px] bg-amber-50 px-2 py-0.5 rounded font-mono">{shifts.morningStartTime} - {shifts.morningEndTime}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          name="morningStartTime" 
                          value={shifts.morningStartTime} 
                          onChange={handleShiftChange}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border bg-slate-50"
                        >
                          {TIME_OPTIONS.map(t => <option key={`ms-${t}`} value={t}>{t}</option>)}
                        </select>
                        <select 
                          name="morningEndTime" 
                          value={shifts.morningEndTime} 
                          onChange={handleShiftChange}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border bg-slate-50"
                        >
                          {TIME_OPTIONS.map(t => <option key={`me-${t}`} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Evening Shift */}
                    <div className="p-3 rounded-xl bg-white border border-indigo-200 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#3D3F96]">
                        <span className="flex items-center gap-1.5"><FaMoon className="text-[#3D3F96]" /> Evening Shift</span>
                        <span className="text-[10px] bg-indigo-50 px-2 py-0.5 rounded font-mono">{shifts.eveningStartTime} - {shifts.eveningEndTime}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <select 
                          name="eveningStartTime" 
                          value={shifts.eveningStartTime} 
                          onChange={handleShiftChange}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border bg-slate-50"
                        >
                          {TIME_OPTIONS.map(t => <option key={`es-${t}`} value={t}>{t}</option>)}
                        </select>
                        <select 
                          name="eveningEndTime" 
                          value={shifts.eveningEndTime} 
                          onChange={handleShiftChange}
                          className="px-2.5 py-1.5 text-xs font-bold rounded-lg border bg-slate-50"
                        >
                          {TIME_OPTIONS.map(t => <option key={`ee-${t}`} value={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* If no facility is selected */}
            {!hasAnyFacilitySelected && (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center text-slate-400 space-y-2">
                <FaHospital className="text-3xl mx-auto text-slate-300" />
                <h5 className="text-sm font-bold text-slate-700">No Facilities Selected</h5>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Please select at least one facility (OPD, IPD, or Emergency) from the top cards to configure its timing windows.
                </p>
              </div>
            )}

          </div>
        ) : (
          /* When 24/7 Global Mode is ON */
          <div className="bg-amber-50/60 p-8 rounded-3xl border border-amber-200 text-center space-y-2 animate-fadeIn">
            <FaBolt className="text-3xl text-amber-500 mx-auto" />
            <h4 className="text-base font-black text-amber-900">24/7 Continuous Operation Active</h4>
            <p className="text-xs text-amber-700 max-w-lg mx-auto leading-relaxed">
              Your clinic is configured to run round-the-clock 24 hours every day. Individual timing windows and holiday schedules are currently bypassed.
            </p>
          </div>
        )}

      </form>

      {/* --- RESET MODAL --- */}
      {showResetModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-slate-100 text-center relative">
            <button 
              onClick={() => setShowResetModal(false)}
              className="absolute right-6 top-6 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500"
            >
              <FaTimes size={14} />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center text-2xl mx-auto mb-4">
              <FaRedo />
            </div>

            <h4 className="text-lg font-black text-slate-900">Reset Timings to Default?</h4>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will disable 24/7 mode and restore your clinic schedule to standard defaults:
              <strong className="block text-slate-800 mt-1 font-bold">Monday – Saturday (9:00 AM – 6:00 PM), Sunday Off</strong>
            </p>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                disabled={resetting}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {resetting ? <FaSpinner className="animate-spin" /> : "Confirm Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}