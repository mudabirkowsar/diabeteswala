"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    ShieldAlert,
    Phone,
    MapPin,
    Star,
    Check,
    CheckCircle2,
    Circle,
    Car,
    HeartPulse,
    AlertCircle,
    Loader2,
    Plus,
    Clock,
    UserCheck,
    ArrowRight
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';

export default function ViewAllAmbulances({
    isOpen,
    onClose,
    clinicId,
    selectedAmbulance,
    onSelectAmbulance
}) {
    const [ambulances, setAmbulances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAmbulanceAvailable, setIsAmbulanceAvailable] = useState(true);
    const [unavailableMessage, setUnavailableMessage] = useState("");

    // Selected Ambulance ID state
    const [tempSelectedId, setTempSelectedId] = useState(selectedAmbulance?.ambulanceId || null);

    // Ride Type & Support Staff Addons
    const [rideType, setRideType] = useState(selectedAmbulance?.rideType || 'single'); // 'single' | 'round'
    const [withNurse, setWithNurse] = useState(selectedAmbulance?.supportStaff?.nurse?.selected || false);
    const [withDoctor, setWithDoctor] = useState(selectedAmbulance?.supportStaff?.doctor?.selected || false);

    // Sync state on open / props change
    useEffect(() => {
        if (selectedAmbulance) {
            setTempSelectedId(selectedAmbulance.ambulanceId);
            setRideType(selectedAmbulance.rideType || 'single');
            setWithNurse(Boolean(selectedAmbulance.supportStaff?.nurse?.selected));
            setWithDoctor(Boolean(selectedAmbulance.supportStaff?.doctor?.selected));
        } else {
            setTempSelectedId(null);
            setRideType('single');
            setWithNurse(false);
            setWithDoctor(false);
        }
    }, [selectedAmbulance, isOpen]);

    // Fetch Clinic Ambulances API
    useEffect(() => {
        if (!isOpen || !clinicId) return;

        let isMounted = true;

        const fetchAmbulances = async () => {
            setLoading(true);
            try {
                // Attempt to get user GPS coordinates if available (optional)
                let gpsParams = {};
                if (typeof window !== "undefined" && "geolocation" in navigator) {
                    try {
                        const position = await new Promise((resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
                        });
                        if (position?.coords) {
                            gpsParams = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                            };
                        }
                    } catch {
                        // Location permission denied or timed out; proceed with default
                    }
                }

                const response = await UserAPI.getUserClinicAmbulances(clinicId, gpsParams);

                if (isMounted) {
                    if (response && response.success) {
                        setIsAmbulanceAvailable(response.isAmbulanceAvailable !== false);
                        setUnavailableMessage(response.message || "Ambulance facility is currently not offered by this clinic.");
                        const fleet = response.data || [];
                        setAmbulances(fleet);

                        // If user hasn't selected yet, preselect first available ambulance
                        if (!selectedAmbulance && fleet.length > 0) {
                            setTempSelectedId(fleet[0]._id);
                        }
                    } else {
                        setIsAmbulanceAvailable(false);
                        setAmbulances([]);
                        setUnavailableMessage(response?.message || "Ambulance facility is currently not offered by this clinic.");
                    }
                }
            } catch (err) {
                console.error("Error fetching clinic ambulances:", err);
                if (isMounted) {
                    setIsAmbulanceAvailable(false);
                    setAmbulances([]);
                    setUnavailableMessage("Unable to load emergency fleet right now.");
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchAmbulances();

        return () => {
            isMounted = false;
        };
    }, [isOpen, clinicId]);

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

    // Active Selected Ambulance Record
    const activeAmbulance = useMemo(() => {
        return ambulances.find((a) => a._id === tempSelectedId) || null;
    }, [ambulances, tempSelectedId]);

    // Dynamic Price Calculation
    const calculatedAmbulanceTotal = useMemo(() => {
        if (!activeAmbulance) return 0;

        const baseRideCost = rideType === 'round'
            ? (activeAmbulance.pricing?.doubleRidePrice || 0)
            : (activeAmbulance.pricing?.singleRidePrice || 0);

        const nurseCost = withNurse && activeAmbulance.supportStaff?.nurse?.available
            ? (activeAmbulance.supportStaff?.nurse?.price || 0)
            : 0;

        const doctorCost = withDoctor && activeAmbulance.supportStaff?.doctor?.available
            ? (activeAmbulance.supportStaff?.doctor?.price || 0)
            : 0;

        return baseRideCost + nurseCost + doctorCost;
    }, [activeAmbulance, rideType, withNurse, withDoctor]);

    if (!isOpen) return null;

    // Confirm & Attach Ambulance
    const handleConfirmAmbulance = () => {
        if (!activeAmbulance) return;

        const payload = {
            ambulanceId: activeAmbulance._id,
            vehicleNumber: activeAmbulance.vehicleNumber,
            vehicleType: activeAmbulance.vehicleType,
            driverName: activeAmbulance.driverName,
            phone: activeAmbulance.phone,
            rating: activeAmbulance.rating,
            distanceText: activeAmbulance.distanceText,
            rideType,
            ridePrice: rideType === 'round'
                ? activeAmbulance.pricing?.doubleRidePrice || 0
                : activeAmbulance.pricing?.singleRidePrice || 0,
            supportStaff: {
                nurse: {
                    selected: withNurse && Boolean(activeAmbulance.supportStaff?.nurse?.available),
                    price: activeAmbulance.supportStaff?.nurse?.price || 0
                },
                doctor: {
                    selected: withDoctor && Boolean(activeAmbulance.supportStaff?.doctor?.available),
                    price: activeAmbulance.supportStaff?.doctor?.price || 0
                }
            },
            totalAmbulancePrice: calculatedAmbulanceTotal
        };

        onSelectAmbulance(payload);
        onClose();
    };

    // Remove / Skip Ambulance (since optional)
    const handleRemoveAmbulance = () => {
        onSelectAmbulance(null);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none antialiased">
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/65 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Box */}
            <div className="relative w-full max-w-2xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden z-10 flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-left">

                {/* Header */}
                <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                                <Car size={18} />
                            </div>
                            <div>
                                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    Emergency Ambulance Dispatch
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                                        Optional
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Select verified hospital fleet with optional on-board paramedic support
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer border border-slate-100 shrink-0"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Body */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6 [&::-webkit-scrollbar]:hidden">

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="animate-spin text-rose-600 mb-3" size={32} />
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Locating Emergency Fleet...
                            </p>
                        </div>
                    ) : !isAmbulanceAvailable || ambulances.length === 0 ? (
                        <div className="p-8 text-center bg-rose-50/60 rounded-3xl border border-rose-100 space-y-3">
                            <AlertCircle size={36} className="text-rose-500 mx-auto" />
                            <h4 className="text-sm font-black text-slate-900">Ambulance Not Available</h4>
                            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                                {unavailableMessage}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                                You can still proceed with your casualty doctor and emergency triage bed booking.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Notice Banner */}
                            <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-between text-xs text-slate-600">
                                <span className="font-medium flex items-center gap-1.5">
                                    <ShieldAlert size={14} className="text-rose-600" />
                                    Ambulance service is completely optional for emergency triage admission.
                                </span>
                            </div>

                            {/* Ambulances List */}
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                                    Available Fleet ({ambulances.length})
                                </span>

                                {ambulances.map((amb) => {
                                    const isSelected = tempSelectedId === amb._id;

                                    return (
                                        <div
                                            key={amb._id}
                                            onClick={() => setTempSelectedId(amb._id)}
                                            className={`p-5 rounded-2xl sm:rounded-3xl border transition-all cursor-pointer relative flex flex-col gap-4 ${isSelected
                                                    ? 'border-rose-500 bg-rose-50/40 ring-2 ring-rose-500/15 shadow-md'
                                                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                                                }`}
                                        >
                                            {/* Top info */}
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start gap-3.5">
                                                    <div className="pt-0.5 shrink-0">
                                                        {isSelected ? (
                                                            <CheckCircle2 size={20} className="text-rose-600 fill-rose-100" />
                                                        ) : (
                                                            <Circle size={20} className="text-slate-300" />
                                                        )}
                                                    </div>

                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <h4 className="text-sm font-black text-slate-900 tracking-tight">
                                                                {amb.vehicleType}
                                                            </h4>
                                                            <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                                                {amb.vehicleNumber}
                                                            </span>
                                                            {amb.isOnline && (
                                                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                                    Live Online
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-0.5">
                                                            <span>Driver: <strong className="text-slate-800">{amb.driverName}</strong></span>
                                                            {amb.phone && (
                                                                <span className="flex items-center gap-1 text-slate-500">
                                                                    <Phone size={11} className="text-slate-400" /> {amb.phone}
                                                                </span>
                                                            )}
                                                            {amb.distanceText && (
                                                                <span className="flex items-center gap-1 text-rose-600 font-bold">
                                                                    <MapPin size={11} /> {amb.distanceText}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {amb.rating && (
                                                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-xl text-xs font-black shrink-0">
                                                        <Star size={12} className="fill-amber-400 text-amber-400" />
                                                        <span>{amb.rating}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* If Selected: Ride Type and Staff Options */}
                                            {isSelected && (
                                                <div className="pt-4 border-t border-rose-100/80 space-y-4 animate-in fade-in duration-200" onClick={(e) => e.stopPropagation()}>

                                                    {/* Ride Type Selection */}
                                                    <div className="space-y-1.5">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                                                            Select Ride Type
                                                        </span>
                                                        <div className="grid grid-cols-2 gap-2.5">
                                                            <button
                                                                type="button"
                                                                onClick={() => setRideType('single')}
                                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${rideType === 'single'
                                                                        ? 'border-rose-600 bg-white shadow-xs ring-1 ring-rose-500'
                                                                        : 'border-slate-200 bg-white/70 hover:bg-white'
                                                                    }`}
                                                            >
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                                    One-Way Ride
                                                                </span>
                                                                <span className="text-sm font-mono font-black text-slate-900 mt-0.5">
                                                                    ₹{amb.pricing?.singleRidePrice || 0}
                                                                </span>
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => setRideType('round')}
                                                                className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${rideType === 'round'
                                                                        ? 'border-rose-600 bg-white shadow-xs ring-1 ring-rose-500'
                                                                        : 'border-slate-200 bg-white/70 hover:bg-white'
                                                                    }`}
                                                            >
                                                                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                                                                    Round-Trip
                                                                </span>
                                                                <span className="text-sm font-mono font-black text-slate-900 mt-0.5">
                                                                    ₹{amb.pricing?.doubleRidePrice || 0}
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Optional Paramedic Staff Addons */}
                                                    <div className="space-y-1.5">
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                                                            On-Board Medical Staff (Optional Addon)
                                                        </span>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {/* Nurse Addon */}
                                                            {amb.supportStaff?.nurse?.available && (
                                                                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${withNurse
                                                                        ? 'border-rose-500 bg-white shadow-xs'
                                                                        : 'border-slate-200 bg-white/70 hover:bg-white'
                                                                    }`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={withNurse}
                                                                            onChange={(e) => setWithNurse(e.target.checked)}
                                                                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                                                        />
                                                                        <span className="text-xs font-bold text-slate-800">
                                                                            On-Board Nurse
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-mono font-bold text-rose-600">
                                                                        +₹{amb.supportStaff.nurse.price}
                                                                    </span>
                                                                </label>
                                                            )}

                                                            {/* Doctor Addon */}
                                                            {amb.supportStaff?.doctor?.available && (
                                                                <label className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${withDoctor
                                                                        ? 'border-rose-500 bg-white shadow-xs'
                                                                        : 'border-slate-200 bg-white/70 hover:bg-white'
                                                                    }`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={withDoctor}
                                                                            onChange={(e) => setWithDoctor(e.target.checked)}
                                                                            className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                                                                        />
                                                                        <span className="text-xs font-bold text-slate-800">
                                                                            Emergency Doctor
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-mono font-bold text-rose-600">
                                                                        +₹{amb.supportStaff.doctor.price}
                                                                    </span>
                                                                </label>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="w-full sm:w-auto text-left">
                        {activeAmbulance ? (
                            <div className="space-y-0.5">
                                <span className="text-[11px] font-bold text-slate-500 block">
                                    Selected: <strong>{activeAmbulance.vehicleType}</strong> ({rideType === 'round' ? 'Round-Trip' : 'One-Way'})
                                </span>
                                <span className="text-base font-black font-mono text-rose-600 block">
                                    Ambulance Total: ₹{calculatedAmbulanceTotal}
                                </span>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-400 font-medium">
                                No ambulance attached (Optional)
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={handleRemoveAmbulance}
                            className="flex-1 sm:flex-none py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/80 transition-colors cursor-pointer text-center"
                        >
                            Skip / No Ambulance
                        </button>

                        <button
                            type="button"
                            disabled={!activeAmbulance}
                            onClick={handleConfirmAmbulance}
                            className={`flex-1 sm:flex-none py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${activeAmbulance
                                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-950/15 cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <span>Confirm Ambulance</span>
                            <Check size={14} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}