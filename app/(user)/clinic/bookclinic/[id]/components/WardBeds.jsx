"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Bed,
    Check,
    Calendar,
    AlertCircle,
    Clock,
    Flame,
    ArrowRight
} from 'lucide-react';

export default function WardBeds({ isOpen, onClose, ward, selectedBed, onSelectBed }) {
    // Helper to format Date to YYYY-MM-DD
    const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const todayStr = useMemo(() => formatDate(new Date()), []);
    const tomorrowStr = useMemo(() => {
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        return formatDate(tmrw);
    }, []);

    // Date Range States
    const [startDate, setStartDate] = useState(selectedBed?.startDate || todayStr);
    const [endDate, setEndDate] = useState(selectedBed?.endDate || tomorrowStr);
    const [tempSelectedBed, setTempSelectedBed] = useState(selectedBed);
    const [dateError, setDateError] = useState('');

    // Sync state on open / prop change
    useEffect(() => {
        if (selectedBed) {
            setTempSelectedBed(selectedBed);
            if (selectedBed.startDate) setStartDate(selectedBed.startDate);
            if (selectedBed.endDate) setEndDate(selectedBed.endDate);
        } else {
            setStartDate(todayStr);
            setEndDate(tomorrowStr);
        }
    }, [selectedBed, todayStr, tomorrowStr, isOpen]);

    // Calculate dynamic duration in days
    const totalDays = useMemo(() => {
        if (!startDate || !endDate) return 1;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = end.getTime() - start.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }, [startDate, endDate]);

    // Calculate total bed cost dynamically
    const unitPrice = tempSelectedBed?.pricePerDay || ward?.pricePerDay || 0;
    const totalBedPrice = totalDays * unitPrice;

    // Handle Start Date Change
    const handleStartDateChange = (e) => {
        const val = e.target.value;
        setStartDate(val);
        if (new Date(val) >= new Date(endDate)) {
            // Push end date to at least 1 day after start date
            const nextDay = new Date(val);
            nextDay.setDate(nextDay.getDate() + 1);
            setEndDate(formatDate(nextDay));
            setDateError('');
        }
    };

    // Handle End Date Change
    const handleEndDateChange = (e) => {
        const val = e.target.value;
        if (new Date(val) <= new Date(startDate)) {
            setDateError('Discharge date must be at least 1 day after admission date.');
        } else {
            setDateError('');
        }
        setEndDate(val);
    };

    // Escape listener and body scroll lock
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.body.style.overflow = "hidden";
            window.addEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !ward) return null;

    const handleConfirm = () => {
        if (!tempSelectedBed) return;
        if (totalDays <= 0) {
            setDateError('Please choose a valid admission and discharge date.');
            return;
        }

        // Pass back fully calculated bed booking object
        onSelectBed({
            ...tempSelectedBed,
            startDate,
            endDate,
            totalDays,
            pricePerDay: unitPrice,
            totalBedPrice
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none antialiased">
            {/* Dark Backdrop */}
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose} 
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">
                
                {/* Header */}
                <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">
                                {ward.wardName}
                            </h3>
                            <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg bg-indigo-50 text-[#3d3f96] border border-indigo-100/60">
                                {ward.wardType}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Available: <strong className="text-emerald-600 font-bold">{ward.availableBeds}</strong> of {ward.totalBeds} Beds • Rate: <strong className="text-slate-900 font-mono font-bold">₹{ward.pricePerDay}</strong>/day
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer border border-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* --- ADMISSION DURATION SELECTOR (START & END DATES) --- */}
                <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-100 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <Calendar size={13} className="text-[#3d3f96]" /> Select Stay Duration
                        </span>
                        {totalDays > 0 && (
                            <span className="text-[10px] font-black uppercase text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                                {totalDays} {totalDays === 1 ? 'Day Stay' : 'Days Stay'}
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                                Admission Date (Start)
                            </label>
                            <input
                                type="date"
                                min={todayStr}
                                value={startDate}
                                onChange={handleStartDateChange}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                                Discharge Date (End)
                            </label>
                            <input
                                type="date"
                                min={startDate || todayStr}
                                value={endDate}
                                onChange={handleEndDateChange}
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                            />
                        </div>
                    </div>

                    {dateError && (
                        <p className="text-[11px] font-bold text-red-600 flex items-center gap-1">
                            <AlertCircle size={12} /> {dateError}
                        </p>
                    )}
                </div>

                {/* Sub-header Legend */}
                <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-bold text-[11px]">Choose an available bed</span>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-slate-700 font-black text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400 font-medium text-[11px]">
                            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Occupied
                        </span>
                    </div>
                </div>

                {/* Bed Cards Grid */}
                <div className="p-6 overflow-y-auto max-h-[46vh] [&::-webkit-scrollbar]:hidden">
                    {ward.beds && ward.beds.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {ward.beds.map((bed) => {
                                const isAvailable = bed.status === "Available";
                                const isSelected = tempSelectedBed?.bedId === bed.bedId;

                                return (
                                    <div
                                        key={bed.bedId}
                                        onClick={() => {
                                            if (isAvailable) setTempSelectedBed(bed);
                                        }}
                                        className={`p-4 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between cursor-pointer relative group ${
                                            isSelected
                                                ? 'border-emerald-600 bg-emerald-50/90 ring-2 ring-emerald-500/20 shadow-md scale-[1.02]'
                                                : isAvailable
                                                    ? 'border-slate-100 bg-white hover:border-[#3d3f96] hover:shadow-md'
                                                    : 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                                        }`}
                                    >
                                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2.5 transition-colors ${
                                            isSelected 
                                                ? 'bg-emerald-600 text-white' 
                                                : isAvailable 
                                                ? 'bg-indigo-50 text-[#3d3f96] group-hover:bg-[#3d3f96] group-hover:text-white' 
                                                : 'bg-slate-200 text-slate-400'
                                        }`}>
                                            <Bed size={20} />
                                        </div>
                                        
                                        <div className="space-y-0.5">
                                            <span className="text-xs font-black font-mono text-slate-900 block">
                                                {bed.bedNumber}
                                            </span>
                                            <span className="text-[10px] font-mono font-bold text-slate-500 block">
                                                ₹{bed.pricePerDay || ward.pricePerDay}/day
                                            </span>
                                        </div>

                                        <span className={`text-[9px] font-black uppercase mt-2.5 px-2 py-0.5 rounded-md ${
                                            isAvailable
                                                ? 'bg-emerald-100 text-emerald-800'
                                                : 'bg-slate-200 text-slate-500'
                                        }`}>
                                            {bed.status}
                                        </span>

                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                                                <Check size={10} strokeWidth={3} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-slate-400 text-xs font-bold">
                            No individual bed records listed under this ward.
                        </div>
                    )}
                </div>

                {/* Footer Live Cost Summary */}
                <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-4">
                    <div className="text-xs">
                        {tempSelectedBed ? (
                            <div className="space-y-0.5">
                                <span className="text-slate-500 font-bold block">
                                    Bed {tempSelectedBed.bedNumber} • <strong className="text-slate-800">{totalDays} Days</strong> ({startDate} to {endDate})
                                </span>
                                <span className="text-sm font-black font-mono text-emerald-700 block">
                                    Total Bed Cost: ₹{totalBedPrice} <span className="text-[10px] font-sans text-slate-400 font-normal">(₹{unitPrice}/day × {totalDays})</span>
                                </span>
                            </div>
                        ) : (
                            <span className="text-slate-400 font-medium">Please select an available bed</span>
                        )}
                    </div>

                    <button
                        type="button"
                        disabled={!tempSelectedBed || totalDays <= 0}
                        onClick={handleConfirm}
                        className={`text-xs font-black uppercase tracking-wider px-6 py-3 rounded-2xl transition-all flex items-center gap-1.5 shadow-md ${
                            tempSelectedBed && totalDays > 0
                                ? 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/15 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <span>Confirm Bed &amp; Dates</span>
                        <Check size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}