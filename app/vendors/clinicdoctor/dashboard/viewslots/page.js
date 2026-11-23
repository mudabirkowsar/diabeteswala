"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';
import {
    Calendar,
    Clock,
    RefreshCw,
    Building2,
    Video,
    Home,
    DoorClosed,
    CheckCircle2,
    Clock3,
    Ban,
    User,
    ArrowUpRight,
    Sun,
    Sunrise,
    Sunset,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    CalendarOff,
    Sparkles,
    Stethoscope
} from 'lucide-react';

import ClinicDoctorAPI from '../../../../services/ClinicDoctorAPI';

export default function ClinicDoctorOpdSchedulePage() {
    const router = useRouter();

    // Helper: Today's date YYYY-MM-DD
    const getTodayDateString = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // States
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [loading, setLoading] = useState(true);
    const [scheduleData, setScheduleData] = useState(null);

    // Filter States for Slots Grid
    const [categoryFilter, setCategoryFilter] = useState('All'); // 'All' | 'Morning' | 'Afternoon' | 'Evening'
    const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Available' | 'Booked' | 'Blocked'

    // Fetch schedule and live slots
    const fetchSchedule = useCallback(async (date) => {
        setLoading(true);
        try {
            const response = await ClinicDoctorAPI.getMyOpdScheduleAndSlots(date);
            if (response && response.success) {
                setScheduleData(response.data);
            } else {
                setScheduleData(null);
                toast.error(response?.message || "Failed to load OPD schedule");
            }
        } catch (err) {
            console.error("Error retrieving OPD schedule:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to fetch OPD schedule");
            setScheduleData(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSchedule(selectedDate);
    }, [selectedDate, fetchSchedule]);

    // Date Navigation Handlers
    const handleShiftDate = (days) => {
        const curr = new Date(selectedDate);
        curr.setDate(curr.getDate() + days);
        const nextDate = curr.toISOString().split('T')[0];
        setSelectedDate(nextDate);
    };

    const handleJumpToToday = () => {
        setSelectedDate(getTodayDateString());
    };

    // Route to appointment dossier if slot is booked
    const handleNavigateToAppointment = (appointmentId) => {
        if (!appointmentId) return;
        router.push(`/vendors/clinicdoctor/dashboard/appointments/appointmentdetail/${appointmentId}`);
    };

    // Extractors & Safeties
    const doctor = scheduleData?.doctor || {};
    const clinic = doctor?.clinic || {};
    const fees = scheduleData?.fees || {};
    const modes = scheduleData?.consultationModes || {};
    const generalSchedule = scheduleData?.generalSchedule || {};
    const weeklyRoster = scheduleData?.weeklyRoster || {};
    const liveSlots = scheduleData?.liveSlots || {};
    const allSlots = liveSlots?.slots || [];
    const approvedLeaves = scheduleData?.approvedLeaves || [];
    const blockedSlotsWithReason = scheduleData?.blockedSlotsWithReason || [];

    // Filtered Live Slots
    const filteredSlots = useMemo(() => {
        return allSlots.filter((slot) => {
            const matchesCategory =
                categoryFilter === 'All' ||
                slot.category?.toLowerCase() === categoryFilter.toLowerCase();

            const matchesStatus =
                statusFilter === 'All' ||
                slot.status?.toLowerCase() === statusFilter.toLowerCase();

            return matchesCategory && matchesStatus;
        });
    }, [allSlots, categoryFilter, statusFilter]);

    // Slot Category Icon Helper
    const getCategoryIcon = (category = '') => {
        const cat = category.toLowerCase();
        if (cat === 'morning') return <Sunrise size={13} className="text-amber-500" />;
        if (cat === 'afternoon') return <Sun size={13} className="text-orange-500" />;
        return <Sunset size={13} className="text-indigo-500" />;
    };

    return (
        <div className="min-h-screen text-slate-800 pb-16">
            <Toaster position="top-right" reverseOrder={false} />

            <div className="max-w-7xl mx-auto space-y-6">

                {/* 1. Header Profile & Clinic Strip */}
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white overflow-hidden">
                                {doctor.profileImage ? (
                                    <img src={doctor.profileImage} alt={doctor.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span>{doctor.name ? doctor.name.charAt(0) : 'D'}</span>
                                )}
                            </div>
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" title="Active" />
                        </div>

                        <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-indigo-600">
                                    OPD Rostering &amp; Practice
                                </span>
                                {doctor.dutyStatus && (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        <Sparkles size={11} /> {doctor.dutyStatus}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                {doctor.name || "Doctor Schedule"}
                                {doctor.qualification && (
                                    <span className="text-xs font-bold text-slate-400 font-mono">
                                        ({doctor.qualification})
                                    </span>
                                )}
                            </h1>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-medium">
                                <span className="font-bold text-slate-700">{doctor.speciality || "General Physician"}</span>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-slate-600">
                                    <Building2 size={13} className="text-indigo-600" />
                                    {clinic.name || "Main Clinic"} ({clinic.city || "OPD Ward"})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Badges & Cabin */}
                    <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50/70 border border-indigo-100">
                            <DoorClosed size={16} className="text-indigo-600" />
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-indigo-400 leading-none">Consultation Desk</span>
                                <span className="text-xs font-black text-indigo-900 font-mono">{doctor.cabinNumber || "General OPD"}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200">
                            <Clock size={16} className="text-slate-600" />
                            <div>
                                <span className="block text-[10px] font-bold uppercase text-slate-400 leading-none">Slot Window</span>
                                <span className="text-xs font-black text-slate-800 font-mono">{doctor.slotDurationMinutes || 30} mins</span>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchSchedule(selectedDate)}
                            disabled={loading}
                            className="inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2.5 rounded-2xl transition border border-slate-200 cursor-pointer disabled:opacity-50"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin text-indigo-600" : ""} />
                            <span>Sync</span>
                        </button>
                    </div>
                </div>

                {/* 2. Fee Structure & Consultation Modes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Clinic Visit Fee */}
                    <div className={`p-4 rounded-3xl border transition shadow-xs ${modes.clinic ? 'bg-white border-slate-100' : 'bg-slate-50/70 border-slate-200 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                                <Building2 size={16} />
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${modes.clinic ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                                {modes.clinic ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <span className="block text-xs font-bold text-slate-500">In-Clinic Consultation</span>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 font-mono">₹{fees.clinic ?? 0}</span>
                            <span className="text-[11px] text-slate-400 font-medium">/ patient</span>
                        </div>
                    </div>

                    {/* Online Video Fee */}
                    <div className={`p-4 rounded-3xl border transition shadow-xs ${modes.online ? 'bg-white border-slate-100' : 'bg-slate-50/70 border-slate-200 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                                <Video size={16} />
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${modes.online ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                                {modes.online ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <span className="block text-xs font-bold text-slate-500">Video Teleconsultation</span>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 font-mono">₹{fees.online ?? 0}</span>
                            <span className="text-[11px] text-slate-400 font-medium">/ session</span>
                        </div>
                    </div>

                    {/* Home Visit Fee */}
                    <div className={`p-4 rounded-3xl border transition shadow-xs ${modes.home ? 'bg-white border-slate-100' : 'bg-slate-50/70 border-slate-200 opacity-60'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                                <Home size={16} />
                            </div>
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${modes.home ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-200 text-slate-600'}`}>
                                {modes.home ? 'Enabled' : 'Disabled'}
                            </span>
                        </div>
                        <span className="block text-xs font-bold text-slate-500">Home Visit OPD</span>
                        <div className="mt-1 flex items-baseline gap-1">
                            <span className="text-2xl font-black text-slate-900 font-mono">₹{fees.home ?? 0}</span>
                            <span className="text-[11px] text-slate-400 font-medium">/ call</span>
                        </div>
                    </div>
                </div>

                {/* 3. Shift Timing & Weekly Roster Strip */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div>
                            <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                <Clock3 size={16} className="text-indigo-600" />
                                Shift Timings &amp; Weekly Roster
                            </h2>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">
                                Operating Hours: <span className="font-mono font-bold text-slate-700">{generalSchedule.startTime12h || "09:00 AM"} – {generalSchedule.endTime12h || "05:00 PM"}</span>
                            </p>
                        </div>

                        {/* Active Days Count Pill */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-500">Roster Summary:</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {weeklyRoster.activeDaysCount || 0} Working Days
                            </span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                {weeklyRoster.offDaysCount || 0} Off
                            </span>
                        </div>
                    </div>

                    {/* 7-Days Visual Schedule */}
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                        {(weeklyRoster.daysList || []).map((dayItem, idx) => (
                            <div
                                key={idx}
                                className={`p-3 rounded-2xl border text-center transition ${
                                    dayItem.isActive
                                        ? 'bg-indigo-50/50 border-indigo-200/80 shadow-2xs'
                                        : 'bg-slate-50 border-slate-200/70 opacity-60'
                                }`}
                            >
                                <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    {dayItem.shortDay}
                                </span>
                                <span className={`block text-xs font-black mt-1 ${dayItem.isActive ? 'text-indigo-950' : 'text-slate-400'}`}>
                                    {dayItem.isActive ? 'On Duty' : 'Off'}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Alerts for Active Leaves or Day Blocks */}
                    {(approvedLeaves.length > 0 || blockedSlotsWithReason.length > 0) && (
                        <div className="pt-2 flex flex-col sm:flex-row gap-2">
                            {approvedLeaves.length > 0 && (
                                <div className="flex-1 flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[11px] text-amber-900 font-medium">
                                    <CalendarOff size={15} className="text-amber-600 shrink-0" />
                                    <span>
                                        <strong>Approved Leave Roster:</strong> {approvedLeaves.length} registered leave window(s) on file.
                                    </span>
                                </div>
                            )}
                            {blockedSlotsWithReason.length > 0 && (
                                <div className="flex-1 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-[11px] text-rose-900 font-medium">
                                    <ShieldAlert size={15} className="text-rose-600 shrink-0" />
                                    <span>
                                        <strong>Rounds / Blocked Notice:</strong> {blockedSlotsWithReason.length} slot(s) blocked with doctor notes today.
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* 4. Date Picker & Live Slot Grid Controls */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-5">
                    {/* Date Bar & Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleShiftDate(-1)}
                                className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                                title="Previous Day"
                            >
                                <ChevronLeft size={16} />
                            </button>

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                                <Calendar size={15} className="text-indigo-600" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={() => handleShiftDate(1)}
                                className="p-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer"
                                title="Next Day"
                            >
                                <ChevronRight size={16} />
                            </button>

                            <button
                                onClick={handleJumpToToday}
                                className="px-3 py-1.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition border border-indigo-100 cursor-pointer"
                            >
                                Today
                            </button>
                        </div>

                        {/* Metrics Pills for the Day */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                <span>Total Slots:</span>
                                <strong className="font-mono">{liveSlots.totalSlots || 0}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 size={12} />
                                <span>Available:</span>
                                <strong className="font-mono">{liveSlots.availableCount || 0}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                <Clock size={12} />
                                <span>Booked:</span>
                                <strong className="font-mono">{liveSlots.bookedCount || 0}</strong>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                <Ban size={12} />
                                <span>Blocked:</span>
                                <strong className="font-mono">{liveSlots.blockedCount || 0}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Filter Category & Status Sub-strip */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        {/* Session Tabs */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                            {['All', 'Morning', 'Afternoon', 'Evening'].map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategoryFilter(cat)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                        categoryFilter === cat
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                            {['All', 'Available', 'Booked', 'Blocked'].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setStatusFilter(st)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                        statusFilter === st
                                            ? 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                                    }`}
                                >
                                    {st}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Live Slots Grid */}
                    {loading ? (
                        <div className="p-14 text-center flex flex-col items-center justify-center">
                            <RefreshCw className="animate-spin text-indigo-600 mb-3" size={32} />
                            <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                                Generating Live Slots Schedule...
                            </span>
                        </div>
                    ) : liveSlots.isClosed ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center bg-rose-50/40 rounded-3xl border border-rose-200/80 space-y-3">
                            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center">
                                <CalendarOff size={24} />
                            </div>
                            <h3 className="text-sm font-black text-rose-950">OPD Closed for Selected Date</h3>
                            <p className="text-xs text-rose-700 font-medium max-w-sm">
                                {liveSlots.closedReason || "Doctor is marked off-duty or on leave for this schedule."}
                            </p>
                        </div>
                    ) : filteredSlots.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center justify-center bg-slate-50/50 rounded-3xl border border-slate-200/80 space-y-2">
                            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                                <Clock size={22} />
                            </div>
                            <h4 className="text-xs font-bold text-slate-700">No Matching Slots</h4>
                            <p className="text-[11px] text-slate-400">
                                No slots match category "{categoryFilter}" and status "{statusFilter}".
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2">
                            {filteredSlots.map((slot, index) => {
                                const isAvailable = slot.status === 'Available';
                                const isBooked = slot.status === 'Booked' || slot.status === 'Completed';
                                const isBlocked = slot.status === 'Blocked';

                                return (
                                    <div
                                        key={index}
                                        className={`relative p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                                            isAvailable
                                                ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300'
                                                : isBooked
                                                ? 'bg-indigo-50/50 border-indigo-200 hover:border-indigo-300'
                                                : isBlocked
                                                ? 'bg-rose-50/40 border-rose-200'
                                                : 'bg-slate-50 border-slate-200 opacity-70'
                                        }`}
                                    >
                                        {/* Top Header of Slot Card */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-1.5">
                                                {getCategoryIcon(slot.category)}
                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                    {slot.category}
                                                </span>
                                            </div>
                                            <span
                                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                    isAvailable
                                                        ? 'bg-emerald-100 text-emerald-800'
                                                        : isBooked
                                                        ? 'bg-indigo-100 text-indigo-800'
                                                        : isBlocked
                                                        ? 'bg-rose-100 text-rose-800'
                                                        : 'bg-slate-200 text-slate-700'
                                                }`}
                                            >
                                                {slot.status}
                                            </span>
                                        </div>

                                        {/* Time Display */}
                                        <div className="my-1">
                                            <span className="text-base font-black text-slate-900 font-mono tracking-tight block">
                                                {slot.time}
                                            </span>
                                            <span className="text-[11px] font-mono text-slate-500 block">
                                                {slot.displayTime}
                                            </span>
                                        </div>

                                        {/* Dynamic Body: Booking Details vs Available Fee vs Block Reason */}
                                        <div className="mt-3 pt-3 border-t border-slate-200/60">
                                            {isAvailable && (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-medium text-slate-500">Fee</span>
                                                    <span className="text-xs font-black font-mono text-emerald-800">
                                                        ₹{slot.totalFee || slot.baseClinicFee}
                                                    </span>
                                                </div>
                                            )}

                                            {isBooked && slot.bookingDetails && (
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center justify-between">
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-900 truncate">
                                                            <User size={12} className="text-indigo-600 shrink-0" />
                                                            <span className="truncate">{slot.bookingDetails.patientName}</span>
                                                        </span>
                                                        <span className="font-mono text-[10px] text-indigo-700 bg-white border border-indigo-100 px-1.5 py-0.2 rounded font-bold">
                                                            {slot.bookingDetails.bookingId}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleNavigateToAppointment(slot.bookingDetails.appointmentId)}
                                                        className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold transition cursor-pointer shadow-2xs"
                                                    >
                                                        <span>View Dossier</span>
                                                        <ArrowUpRight size={12} />
                                                    </button>
                                                </div>
                                            )}

                                            {isBlocked && (
                                                <div className="text-[11px] text-rose-700 font-medium leading-tight">
                                                    <span className="font-bold block text-[10px] uppercase text-rose-800">Reason</span>
                                                    <span>{slot.blockReason || "Marked unavailable by roster"}</span>
                                                </div>
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