"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Users,
    UserPlus,
    CheckCircle2,
    Circle,
    Phone,
    Calendar,
    ShieldCheck,
    Loader2,
    Check,
    AlertCircle
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const cleanPath = path.startsWith("/") ? path.substring(1) : path;
    return `${BASE_SERVER_URL}/${cleanPath}`;
};

const USER_PLACEHOLDER = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop";

export default function ChoosePatient({ isOpen, onClose, selectedPatient, onSelectPatient }) {
    const [familyMembers, setFamilyMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    // 'existing' | 'manual'
    const [patientMode, setPatientMode] = useState('existing');

    // Selected profile tracking
    const [tempSelected, setTempSelected] = useState(selectedPatient);

    // Manual Form State
    const [manualForm, setManualForm] = useState({
        memberName: '',
        relation: 'OTHER',
        gender: 'Male',
        dob: '',
        phone: '',
        height: '',
        weight: '',
        hasInsurance: false,
        insuranceNo: ''
    });

    const [formError, setFormError] = useState('');

    // Fetch family members on open
    useEffect(() => {
        if (!isOpen) return;

        const fetchMembers = async () => {
            setLoading(true);
            try {
                const response = await UserAPI.getFamilyMembers();
                if (response && response.success) {
                    setFamilyMembers(response.data || []);
                } else {
                    setFamilyMembers([]);
                }
            } catch (err) {
                console.error("Error fetching family members:", err);
                setFamilyMembers([]);
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [isOpen]);

    useEffect(() => {
        setTempSelected(selectedPatient);
        if (selectedPatient?.isManual) {
            setPatientMode('manual');
            setManualForm({ ...selectedPatient });
        }
    }, [selectedPatient]);

    // Lock body scroll on modal open
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

    const handleManualSubmit = () => {
        if (!manualForm.memberName.trim()) {
            setFormError('Patient full name is required');
            return;
        }
        if (!manualForm.phone.trim()) {
            setFormError('Contact phone number is required');
            return;
        }

        setFormError('');
        const manualPatientObj = {
            ...manualForm,
            _id: `manual-${Date.now()}`,
            isManual: true
        };
        onSelectPatient(manualPatientObj);
        onClose();
    };

    const handleConfirmExisting = () => {
        if (tempSelected) {
            onSelectPatient(tempSelected);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-5000 flex justify-end select-none antialiased">
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Right Slide-over Panel */}
            <div className="relative w-full max-w-lg bg-white shadow-2xl z-10 flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-slate-100">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                                <Users size={16} />
                            </div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Who is this Appointment For?
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Select an existing family member or fill patient details manually
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors flex items-center justify-center cursor-pointer border border-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Mode Selector Tabs (Saved Profiles vs Manual Fill) */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-100 flex gap-2">
                    <button
                        type="button"
                        onClick={() => {
                            setPatientMode('existing');
                            setFormError('');
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${patientMode === 'existing'
                                ? 'bg-white text-[#3d3f96] shadow-sm border border-slate-200/80'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        <User size={14} />
                        <span>Saved Profiles ({familyMembers.length + 1})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setPatientMode('manual');
                            setFormError('');
                        }}
                        className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${patientMode === 'manual'
                                ? 'bg-white text-red-600 shadow-sm border border-slate-200/80'
                                : 'text-slate-500 hover:text-slate-900'
                            }`}
                    >
                        <UserPlus size={14} />
                        <span>Enter Manually</span>
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 overflow-y-auto space-y-4 [&::-webkit-scrollbar]:hidden">
                    {patientMode === 'existing' ? (
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={32} />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                    Loading patient profiles...
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                    Select Patient
                                </span>

                                {/* Option 1: Primary Account Holder (Myself) */}
                                <div
                                    onClick={() =>
                                        setTempSelected({
                                            _id: 'self-primary',
                                            memberName: 'Myself (Primary Account)',
                                            relation: 'SELF',
                                            isSelf: true
                                        })
                                    }
                                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-center gap-3.5 ${tempSelected?._id === 'self-primary' || tempSelected?.isSelf
                                            ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96] shadow-sm'
                                            : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                        }`}
                                >
                                    <div className="shrink-0">
                                        {tempSelected?._id === 'self-primary' || tempSelected?.isSelf ? (
                                            <CheckCircle2 size={19} className="text-[#3d3f96] fill-indigo-100" />
                                        ) : (
                                            <Circle size={19} className="text-slate-300" />
                                        )}
                                    </div>

                                    <div className="w-11 h-11 rounded-xl bg-indigo-100/70 border border-indigo-200/60 flex items-center justify-center text-[#3d3f96] font-black text-sm shrink-0">
                                        <User size={20} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <strong className="text-xs font-black text-slate-900 truncate">
                                                Myself
                                            </strong>
                                            <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-[#3d3f96] border border-indigo-100">
                                                Primary
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                                            Book appointment for personal medical profile
                                        </p>
                                    </div>
                                </div>

                                {/* Option 2: Family Members List from API */}
                                {familyMembers.map((member) => {
                                    const isSelected = tempSelected?._id === member._id && !tempSelected?.isSelf;
                                    const photo = getMediaUrl(member.profilePic) || USER_PLACEHOLDER;

                                    return (
                                        <div
                                            key={member._id}
                                            onClick={() => setTempSelected(member)}
                                            className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex items-start gap-3.5 ${isSelected
                                                    ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96] shadow-sm'
                                                    : 'border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                                                }`}
                                        >
                                            <div className="pt-2 shrink-0">
                                                {isSelected ? (
                                                    <CheckCircle2 size={19} className="text-[#3d3f96] fill-indigo-100" />
                                                ) : (
                                                    <Circle size={19} className="text-slate-300" />
                                                )}
                                            </div>

                                            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 mt-0.5">
                                                <img
                                                    src={photo}
                                                    alt={member.memberName}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = USER_PLACEHOLDER; }}
                                                />
                                            </div>

                                            <div className="flex-1 min-w-0 space-y-1">
                                                <div className="flex items-center justify-between gap-2">
                                                    <strong className="text-xs font-black text-slate-900 truncate">
                                                        {member.memberName}
                                                    </strong>
                                                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200/60">
                                                        {member.relation}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                                                    {member.gender && <span>{member.gender}</span>}
                                                    {member.dob && (
                                                        <span className="flex items-center gap-1 font-mono text-[10px]">
                                                            <Calendar size={10} className="text-slate-400" /> {member.dob}
                                                        </span>
                                                    )}
                                                </div>

                                                {member.phone && (
                                                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                                                        <Phone size={11} className="text-slate-400" />
                                                        <span>{member.phone}</span>
                                                    </div>
                                                )}

                                                {member.hasInsurance && (
                                                    <div className="pt-1 flex items-center gap-1 text-[10px] font-black text-emerald-700">
                                                        <ShieldCheck size={12} className="text-emerald-500" />
                                                        <span>Insurance Linked ({member.insuranceNo || 'Active'})</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    ) : (
                        /* Manual Patient Entry Form */
                        <div className="space-y-4 text-left">
                            {formError && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
                                    <AlertCircle size={15} />
                                    <span>{formError}</span>
                                </div>
                            )}

                            {/* Full Name */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    Patient Full Name *
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={manualForm.memberName}
                                    onChange={(e) => setManualForm({ ...manualForm, memberName: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                />
                            </div>

                            {/* Relation & Gender */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        Relationship
                                    </label>
                                    <select
                                        value={manualForm.relation}
                                        onChange={(e) => setManualForm({ ...manualForm, relation: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    >
                                        <option value="SPOUSE">Spouse</option>
                                        <option value="CHILD">Child</option>
                                        <option value="PARENT">Parent</option>
                                        <option value="SIBLING">Sibling</option>
                                        <option value="OTHER">Other / Friend</option>
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        Gender
                                    </label>
                                    <select
                                        value={manualForm.gender}
                                        onChange={(e) => setManualForm({ ...manualForm, gender: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* Date of Birth & Phone */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        value={manualForm.dob}
                                        onChange={(e) => setManualForm({ ...manualForm, dob: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        Contact Phone *
                                    </label>
                                    <input
                                        type="tel"
                                        placeholder="10-digit Mobile"
                                        value={manualForm.phone}
                                        onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    />
                                </div>
                            </div>

                            {/* Height & Weight */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        Height (ft / cm)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 5.8 ft"
                                        value={manualForm.height}
                                        onChange={(e) => setManualForm({ ...manualForm, height: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                                        Weight (kg)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. 68 kg"
                                        value={manualForm.weight}
                                        onChange={(e) => setManualForm({ ...manualForm, weight: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    />
                                </div>
                            </div>

                            {/* Insurance Info */}
                            <div className="pt-2 border-t border-slate-100 space-y-2">
                                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={manualForm.hasInsurance}
                                        onChange={(e) => setManualForm({ ...manualForm, hasInsurance: e.target.checked })}
                                        className="rounded border-slate-300 text-[#3d3f96] focus:ring-[#3d3f96]"
                                    />
                                    <span>Patient has active health insurance</span>
                                </label>

                                {manualForm.hasInsurance && (
                                    <input
                                        type="text"
                                        placeholder="Enter Insurance Policy / TPA Number"
                                        value={manualForm.insuranceNo}
                                        onChange={(e) => setManualForm({ ...manualForm, insuranceNo: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-bold text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action Buttons */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-1/3 py-3 px-4 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200/70 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>

                    {patientMode === 'existing' ? (
                        <button
                            type="button"
                            disabled={!tempSelected}
                            onClick={handleConfirmExisting}
                            className={`w-2/3 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-md ${tempSelected
                                    ? 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-indigo-950/15 cursor-pointer'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                                }`}
                        >
                            <span>Confirm Patient</span>
                            <Check size={14} />
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleManualSubmit}
                            className="w-2/3 py-3 px-5 rounded-xl font-black text-xs uppercase tracking-wider bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            <span>Save &amp; Continue</span>
                            <Check size={14} />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}