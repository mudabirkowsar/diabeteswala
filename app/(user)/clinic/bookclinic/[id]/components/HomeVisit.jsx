"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    Home,
    Calendar,
    Clock,
    Activity,
    FileText,
    UploadCloud,
    Check,
    AlertCircle,
    MapPin,
    Stethoscope,
    ChevronRight,
    Sparkles
} from 'lucide-react';

export default function HomeVisit({
    isOpen,
    onClose,
    doctor,
    selectedAddress,
    onOpenAddressModal,
    homeVisitData,
    onSaveHomeVisit
}) {
    // Today's date string for min date (YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];

    // Form state
    const [visitDate, setVisitDate] = useState(homeVisitData?.visitDate || todayStr);
    const [preferredTime, setPreferredTime] = useState(homeVisitData?.preferredTime || "Morning (09:00 AM - 12:00 PM)");
    const [reason, setReason] = useState(homeVisitData?.reason || "");
    const [patientCondition, setPatientCondition] = useState(homeVisitData?.patientCondition || "Stable (Routine In-Home Checkup)");
    const [prescription, setPrescription] = useState(homeVisitData?.prescription || "");
    const [prescriptionFileName, setPrescriptionFileName] = useState(homeVisitData?.prescriptionFileName || "");
    const [formError, setFormError] = useState("");

    // Sync on open / prop change
    useEffect(() => {
        if (homeVisitData) {
            setVisitDate(homeVisitData.visitDate || todayStr);
            setPreferredTime(homeVisitData.preferredTime || "Morning (09:00 AM - 12:00 PM)");
            setReason(homeVisitData.reason || "");
            setPatientCondition(homeVisitData.patientCondition || "Stable (Routine In-Home Checkup)");
            setPrescription(homeVisitData.prescription || "");
            setPrescriptionFileName(homeVisitData.prescriptionFileName || "");
        } else {
            setVisitDate(todayStr);
            setPreferredTime("Morning (09:00 AM - 12:00 PM)");
            setReason("");
            setPatientCondition("Stable (Routine In-Home Checkup)");
            setPrescription("");
            setPrescriptionFileName("");
        }
        setFormError("");
    }, [homeVisitData, isOpen, todayStr]);

    // Body scroll lock & Escape listener
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

    // Handle file upload for optional prescription
    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setPrescriptionFileName(file.name);
            setPrescription(`Prescription Document: ${file.name}`);
        }
    };

    const handleSave = () => {
        if (!visitDate.trim()) {
            setFormError("Please select a valid visit date.");
            return;
        }
        if (!preferredTime.trim()) {
            setFormError("Please choose a preferred time slot.");
            return;
        }
        if (!reason.trim()) {
            setFormError("Please provide the primary reason for the doctor home visit.");
            return;
        }
        if (!patientCondition.trim()) {
            setFormError("Please select the patient's current physical condition.");
            return;
        }

        setFormError("");
        onSaveHomeVisit({
            visitDate,
            preferredTime,
            reason: reason.trim(),
            patientCondition: patientCondition.trim(),
            prescription: prescription.trim() || null,
            prescriptionFileName: prescriptionFileName || null
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-start select-none antialiased">
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Left Slide-over Panel */}
            <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-left duration-300 border-r border-slate-200 text-left">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                                <Home size={18} />
                            </div>
                            <div>
                                <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    Doctor Home Visit Schedule
                                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                                        Required
                                    </span>
                                </h3>
                                <p className="text-xs text-slate-500 font-medium">
                                    {doctor ? `Consultation with ${doctor.name}` : "Fill patient home consultation details"}
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
                <div className="p-6 overflow-y-auto flex-1 space-y-5 [&::-webkit-scrollbar]:hidden">

                    {/* Address verification banner */}
                    <div
                        onClick={onOpenAddressModal}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            selectedAddress
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                                : 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                        }`}
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <MapPin size={16} className={selectedAddress ? "text-emerald-600 shrink-0" : "text-rose-600 shrink-0"} />
                            <div className="min-w-0">
                                <span className="text-[10px] font-black uppercase tracking-wider block">
                                    {selectedAddress ? 'Destination Address' : 'Address Required *'}
                                </span>
                                <p className="text-xs font-bold truncate">
                                    {selectedAddress
                                        ? `${selectedAddress.houseNo ? selectedAddress.houseNo + ', ' : ''}${selectedAddress.city} (${selectedAddress.pincode})`
                                        : 'Click to select patient home address'}
                                </p>
                            </div>
                        </div>

                        <span className="text-[10px] font-black uppercase underline shrink-0">
                            {selectedAddress ? 'Change' : 'Choose'}
                        </span>
                    </div>

                    {/* Validation Error Notice */}
                    {formError && (
                        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-bold flex items-center gap-2">
                            <AlertCircle size={15} className="shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    {/* Date & Time Slot Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Visit Date */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Calendar size={12} className="text-[#3d3f96]" /> Visit Date *
                            </label>
                            <input
                                type="date"
                                min={todayStr}
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                            />
                        </div>

                        {/* Preferred Time Slot */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Clock size={12} className="text-[#3d3f96]" /> Preferred Time Slot *
                            </label>
                            <select
                                value={preferredTime}
                                onChange={(e) => setPreferredTime(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                            >
                                <option value="Morning (09:00 AM - 12:00 PM)">Morning (09:00 AM - 12:00 PM)</option>
                                <option value="Afternoon (12:00 PM - 04:00 PM)">Afternoon (12:00 PM - 04:00 PM)</option>
                                <option value="Evening (04:00 PM - 08:00 PM)">Evening (04:00 PM - 08:00 PM)</option>
                                <option value="Immediate / Earliest Available">Immediate / Earliest Available</option>
                            </select>
                        </div>
                    </div>

                    {/* Patient Condition */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <Activity size={12} className="text-[#3d3f96]" /> Patient's Current Condition *
                        </label>
                        <select
                            value={patientCondition}
                            onChange={(e) => setPatientCondition(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all"
                        >
                            <option value="Stable (Routine In-Home Checkup)">Stable (Routine In-Home Checkup)</option>
                            <option value="Bedridden / Mobility Impairment">Bedridden / Mobility Impairment</option>
                            <option value="Post-Surgery / Wound Dressing">Post-Surgery / Wound Dressing</option>
                            <option value="High Fever / Severe Infection">High Fever / Severe Infection</option>
                            <option value="Elderly Patient Requiring Home Assessment">Elderly Patient Requiring Home Assessment</option>
                            <option value="Chronic Condition Monitoring (Diabetes / Hypertension)">Chronic Condition Monitoring</option>
                            <option value="Other Medical Requirement">Other Medical Requirement</option>
                        </select>
                    </div>

                    {/* Reason for Home Visit */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                            <FileText size={12} className="text-[#3d3f96]" /> Primary Medical Reason *
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Describe primary symptoms, pain areas, or why an in-clinic visit is not possible..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] transition-all resize-none leading-relaxed"
                        />
                    </div>

                    {/* Optional Prescription Upload / Details */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                                <Sparkles size={12} className="text-amber-500" /> Existing Prescription / Previous Rx Notes
                            </label>
                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                                Optional
                            </span>
                        </div>

                        {/* File Upload Box */}
                        <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50/70 hover:bg-white rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all text-center group">
                            <UploadCloud size={22} className="text-slate-400 group-hover:text-[#3d3f96] mb-1" />
                            <span className="text-xs font-bold text-slate-700">
                                {prescriptionFileName ? prescriptionFileName : "Upload Prescription File (PDF / Image)"}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                                Optional attachment for visiting doctor review
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
                            placeholder="Or type current medications / prescription notes..."
                            value={prescription}
                            onChange={(e) => setPrescription(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                        />
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-1/3 py-3.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer text-center"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="w-2/3 py-3.5 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-950/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                        <span>Save Home Visit Details</span>
                        <Check size={14} />
                    </button>
                </div>

            </div>
        </div>
    );
}