"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    MapPin,
    Home,
    Check,
    CheckCircle2,
    Circle,
    Loader2,
    Phone,
    AlertCircle,
    Calendar,
    Clock,
    Activity,
    FileText,
    UploadCloud,
    Sparkles
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';

export default function AddressModel({
    isOpen,
    onClose,
    selectedAddress,
    homeVisitDetails,
    onSelectAddress
}) {
    // Today's date string for min date (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];

    // --- Address States ---
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tempSelected, setTempSelected] = useState(selectedAddress);

    // --- Home Visit Schedule & Condition States ---
    const [visitDate, setVisitDate] = useState(homeVisitDetails?.visitDate || todayStr);
    const [preferredTime, setPreferredTime] = useState(homeVisitDetails?.preferredTime || "Morning (09:00 AM - 12:00 PM)");
    const [reason, setReason] = useState(homeVisitDetails?.reason || "");
    const [patientCondition, setPatientCondition] = useState(homeVisitDetails?.patientCondition || "Stable (Routine In-Home Checkup)");
    const [prescription, setPrescription] = useState(homeVisitDetails?.prescription || "");
    const [prescriptionFileName, setPrescriptionFileName] = useState(homeVisitDetails?.prescriptionFileName || "");

    // Validation error message
    const [formError, setFormError] = useState("");

    // Sync state when props change
    useEffect(() => {
        setTempSelected(selectedAddress);
        if (homeVisitDetails) {
            setVisitDate(homeVisitDetails.visitDate || todayStr);
            setPreferredTime(homeVisitDetails.preferredTime || "Morning (09:00 AM - 12:00 PM)");
            setReason(homeVisitDetails.reason || "");
            setPatientCondition(homeVisitDetails.patientCondition || "Stable (Routine In-Home Checkup)");
            setPrescription(homeVisitDetails.prescription || "");
            setPrescriptionFileName(homeVisitDetails.prescriptionFileName || "");
        } else {
            setVisitDate(todayStr);
            setPreferredTime("Morning (09:00 AM - 12:00 PM)");
            setReason("");
            setPatientCondition("Stable (Routine In-Home Checkup)");
            setPrescription("");
            setPrescriptionFileName("");
        }
        setFormError("");
    }, [selectedAddress, homeVisitDetails, isOpen, todayStr]);

    // Fetch user addresses on open
    useEffect(() => {
        if (!isOpen) return;

        const fetchAddresses = async () => {
            setLoading(true);
            try {
                const response = await UserAPI.getAddressList();
                if (response && response.success) {
                    const addrList = response.data || [];
                    setAddresses(addrList);

                    // If no address is currently selected, pre-select default
                    if (!selectedAddress && addrList.length > 0) {
                        const defaultAddr = addrList.find(a => a.isDefault) || addrList[0];
                        setTempSelected(defaultAddr);
                    }
                } else {
                    setAddresses([]);
                }
            } catch (err) {
                console.error("Error fetching addresses:", err);
                setAddresses([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAddresses();
    }, [isOpen, selectedAddress]);

    // Lock body scroll and handle Escape key
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

    if (!isOpen) return null;

    // Handle optional prescription file upload
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPrescriptionFileName(file.name);
            setPrescription(`Prescription File: ${file.name}`);
        }
    };

    // Confirm both Address & Home Visit details
    const handleConfirm = () => {
        if (!tempSelected) {
            setFormError("Please select a destination address.");
            return;
        }
        if (!visitDate.trim()) {
            setFormError("Please select a visit date.");
            return;
        }
        if (!preferredTime.trim()) {
            setFormError("Please select a preferred time slot.");
            return;
        }
        if (!reason.trim()) {
            setFormError("Please enter the primary reason for the doctor home visit.");
            return;
        }
        if (!patientCondition.trim()) {
            setFormError("Please specify the patient's current condition.");
            return;
        }

        setFormError("");

        const visitDetailsPayload = {
            visitDate,
            preferredTime,
            reason: reason.trim(),
            patientCondition: patientCondition.trim(),
            prescription: prescription.trim() || null,
            prescriptionFileName: prescriptionFileName || null
        };

        // Passes both the chosen address and the schedule/condition payload
        onSelectAddress(tempSelected, visitDetailsPayload);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-5000 flex justify-end select-none antialiased">
            {/* Backdrop Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Right Slide-over Panel */}
            <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-slate-100 text-left">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Home size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight">
                                    Home Visit Address &amp; Schedule
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    Choose visit destination, schedule slot &amp; patient condition
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer border border-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden">

                    {/* Validation Error Banner */}
                    {formError && (
                        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl flex items-center gap-2">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    {/* ========================================================================= */}
                    {/* SECTION 1: ADDRESS SELECTION */}
                    {/* ========================================================================= */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1">
                                <MapPin size={12} className="text-[#3d3f96]" /> Step 1: Destination Address *
                            </span>
                            {addresses.length > 0 && (
                                <span className="text-[10px] font-bold text-slate-400">
                                    {addresses.length} Saved Locations
                                </span>
                            )}
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center">
                                <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={28} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Loading saved addresses...
                                </p>
                            </div>
                        ) : addresses.length === 0 ? (
                            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-200/70 border-dashed space-y-2">
                                <AlertCircle size={28} className="text-slate-300 mx-auto" />
                                <h4 className="text-xs font-bold text-slate-700">No Saved Addresses Found</h4>
                                <p className="text-[11px] text-slate-400">
                                    Please add a residential address to your profile to request doctor home visits.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                {addresses.map((addr) => {
                                    const isSelected = tempSelected?._id === addr._id;
                                    const isHome = addr.addressType?.toLowerCase() === 'home';

                                    return (
                                        <div
                                            key={addr._id}
                                            onClick={() => {
                                                setTempSelected(addr);
                                                setFormError("");
                                            }}
                                            className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3 ${
                                                isSelected
                                                    ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96] shadow-xs'
                                                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                            }`}
                                        >
                                            <div className="pt-0.5 shrink-0">
                                                {isSelected ? (
                                                    <CheckCircle2 size={18} className="text-[#3d3f96] fill-indigo-100" />
                                                ) : (
                                                    <Circle size={18} className="text-slate-300" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1.5 truncate">
                                                        <strong className="text-xs font-black text-slate-900 truncate">
                                                            {addr.name}
                                                        </strong>
                                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                                                            isHome 
                                                                ? 'bg-rose-50 text-rose-600 border-rose-200/60' 
                                                                : 'bg-slate-100 text-slate-600 border-slate-200'
                                                        }`}>
                                                            {addr.addressType || 'Home'}
                                                        </span>
                                                    </div>

                                                    {addr.isDefault && (
                                                        <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>

                                                <p className="text-xs text-slate-600 font-medium leading-snug">
                                                    {addr.houseNo ? `${addr.houseNo}, ` : ''}
                                                    {addr.sector ? `${addr.sector}, ` : ''}
                                                    {addr.landmark ? `Near ${addr.landmark}, ` : ''}
                                                    {addr.city}, {addr.state} - <span className="font-mono font-bold text-slate-900">{addr.pincode}</span>
                                                </p>

                                                {addr.phone && (
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 pt-0.5">
                                                        <Phone size={10} className="text-slate-400" />
                                                        <span>{addr.phone}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* ========================================================================= */}
                    {/* SECTION 2: SCHEDULE & MEDICAL DETAILS */}
                    {/* ========================================================================= */}
                    <div className="space-y-4 pt-4 border-t border-slate-100">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1 block">
                            <Calendar size={12} className="text-[#3d3f96]" /> Step 2: Schedule Slot &amp; Medical Details *
                        </span>

                        {/* Date & Time Slot Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {/* Visit Date */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <Calendar size={11} className="text-[#3d3f96]" /> Visit Date *
                                </label>
                                <input
                                    type="date"
                                    min={todayStr}
                                    value={visitDate}
                                    onChange={(e) => {
                                        setVisitDate(e.target.value);
                                        setFormError("");
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                />
                            </div>

                            {/* Preferred Time Slot */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <Clock size={11} className="text-[#3d3f96]" /> Time Slot *
                                </label>
                                <select
                                    value={preferredTime}
                                    onChange={(e) => {
                                        setPreferredTime(e.target.value);
                                        setFormError("");
                                    }}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                >
                                    <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                                    <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                                    <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                                    <option value="Immediate / Earliest Available">Immediate / Earliest Available</option>
                                </select>
                            </div>
                        </div>

                        {/* Patient Condition */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Activity size={11} className="text-[#3d3f96]" /> Patient's Current Condition *
                            </label>
                            <select
                                value={patientCondition}
                                onChange={(e) => {
                                    setPatientCondition(e.target.value);
                                    setFormError("");
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                            >
                                <option value="Stable (Routine In-Home Checkup)">Stable (Routine In-Home Checkup)</option>
                                <option value="Bedridden / Mobility Impairment">Bedridden / Mobility Impairment</option>
                                <option value="Post-Surgery / Wound Dressing">Post-Surgery / Wound Dressing</option>
                                <option value="High Fever / Severe Infection">High Fever / Severe Infection</option>
                                <option value="Elderly Patient Requiring Home Assessment">Elderly Patient Requiring Home Assessment</option>
                                <option value="Chronic Condition Monitoring (Diabetes / BP)">Chronic Condition Monitoring</option>
                                <option value="Other Medical Requirement">Other Medical Requirement</option>
                            </select>
                        </div>

                        {/* Reason for Home Visit */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <FileText size={11} className="text-[#3d3f96]" /> Primary Medical Reason *
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Describe pain, symptoms, or why an in-clinic visit is not possible..."
                                value={reason}
                                onChange={(e) => {
                                    setReason(e.target.value);
                                    setFormError("");
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] resize-none leading-relaxed"
                            />
                        </div>

                        {/* Optional Prescription Upload / Details */}
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                    <Sparkles size={11} className="text-amber-500" /> Existing Prescription / Rx Notes
                                </label>
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                    Optional
                                </span>
                            </div>

                            {/* File Upload Box */}
                            <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50/70 hover:bg-white rounded-xl p-3 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                                <UploadCloud size={18} className="text-slate-400 group-hover:text-[#3d3f96] mb-0.5" />
                                <span className="text-[11px] font-bold text-slate-700">
                                    {prescriptionFileName ? prescriptionFileName : "Upload Prescription (PDF / Image)"}
                                </span>
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>

                            {/* Or Type details */}
                            <input
                                type="text"
                                placeholder="Or enter medication details / prescription notes..."
                                value={prescription}
                                onChange={(e) => setPrescription(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                            />
                        </div>
                    </div>

                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-1/3 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer text-center"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        disabled={!tempSelected}
                        onClick={handleConfirm}
                        className={`w-2/3 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${
                            tempSelected
                                ? 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/15 cursor-pointer'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                        }`}
                    >
                        <span>Confirm Home Visit</span>
                        <Check size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}