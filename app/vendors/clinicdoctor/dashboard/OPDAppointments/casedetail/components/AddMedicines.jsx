"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Pill, X, Search, Plus, Trash2, Building2, Send, RefreshCw } from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function AddMedicines({ isOpen, onClose, appointmentId, initialPrescription = null, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Prescription Summary State
    const [chiefComplaints, setChiefComplaints] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [doctorSuggestions, setDoctorSuggestions] = useState('');
    const [advisedInvestigations, setAdvisedInvestigations] = useState('');
    const [adviceGiven, setAdviceGiven] = useState('');
    const [specialInstructions, setSpecialInstructions] = useState('');
    const [nextAppointment, setNextAppointment] = useState('');
    const [sendToPharmacyImmediately, setSendToPharmacyImmediately] = useState(true);

    // Selected Medicines Array
    const [prescribedMedicines, setPrescribedMedicines] = useState([]);

    useEffect(() => {
        if (initialPrescription) {
            setChiefComplaints(initialPrescription.chiefComplaints || '');
            setDiagnosis(Array.isArray(initialPrescription.diagnosis) ? initialPrescription.diagnosis.join(', ') : (initialPrescription.diagnosis || ''));
            setDoctorSuggestions(initialPrescription.doctorSuggestions || '');
            setAdvisedInvestigations(initialPrescription.advisedInvestigations || '');
            setAdviceGiven(initialPrescription.adviceGiven || '');
            setSpecialInstructions(initialPrescription.specialInstructions || '');
            setNextAppointment(initialPrescription.nextAppointment || '');
            if (initialPrescription.medicines?.length) {
                setPrescribedMedicines(initialPrescription.medicines);
            }
        }
    }, [initialPrescription]);

    // Live Catalog Search
    useEffect(() => {
        if (!searchQuery.trim() || searchQuery.length < 2) {
            setSearchResults([]);
            return;
        }

        const delayDebounceFn = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await ClinicDoctorAPI.getOpdMedicinesCatalog({ search: searchQuery.trim(), limit: 10 });
                if (res && res.success) {
                    setSearchResults(res.data || []);
                }
            } catch (err) {
                console.error("Error fetching medicine catalog:", err);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    if (!isOpen) return null;

    // Add medicine from catalog to prescription queue
    const handleAddMedicineFromCatalog = (item) => {
        const newMed = {
            medicineId: item._id,
            name: item.name,
            genericComposition: item.saltComposition || '',
            strength: item.strength || '',
            frequency: 'b.d. (Twice a day)',
            doseInterval: '1-0-1',
            duration: '30 Days',
            dispenseQuantity: '60 Tablets',
            administrationTiming: 'p.c. (After meals)',
            timeSchedule: {
                morning: true,
                afternoon: false,
                evening: false,
                night: true,
                mealRelation: 'After Meal',
                customTimes: ['08:30 AM', '09:00 PM']
            }
        };
        setPrescribedMedicines([...prescribedMedicines, newMed]);
        setSearchQuery('');
        setSearchResults([]);
    };

    // Add empty custom generic entry
    const handleAddCustomMedicine = () => {
        const newMed = {
            medicineId: null,
            name: '',
            isCustomGeneric: true,
            genericComposition: '',
            strength: '',
            frequency: 'b.d. (Twice a day)',
            doseInterval: '1-0-1',
            duration: '7 Days',
            dispenseQuantity: '14 Tablets',
            administrationTiming: 'After meals',
            timeSchedule: {
                morning: true,
                afternoon: false,
                evening: false,
                night: true,
                mealRelation: 'After Meal',
                customTimes: []
            }
        };
        setPrescribedMedicines([...prescribedMedicines, newMed]);
    };

    const handleUpdateMedicineField = (index, field, value) => {
        const updated = [...prescribedMedicines];
        updated[index][field] = value;
        setPrescribedMedicines(updated);
    };

    const handleToggleSchedule = (index, slot) => {
        const updated = [...prescribedMedicines];
        const currentSched = updated[index].timeSchedule || {};
        updated[index].timeSchedule = {
            ...currentSched,
            [slot]: !currentSched[slot]
        };
        setPrescribedMedicines(updated);
    };

    const handleRemoveMedicine = (index) => {
        setPrescribedMedicines(prescribedMedicines.filter((_, i) => i !== index));
    };

    // Form Submission
    const handleSaveAndPrescribe = async (e) => {
        e.preventDefault();
        if (prescribedMedicines.length === 0) {
            toast.error("Please add at least one medication to prescribe");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                chiefComplaints: chiefComplaints.trim(),
                diagnosis: diagnosis.split(',').map((s) => s.trim()).filter(Boolean),
                doctorSuggestions: doctorSuggestions.trim(),
                advisedInvestigations: advisedInvestigations.trim(),
                adviceGiven: adviceGiven.trim(),
                specialInstructions: specialInstructions.trim(),
                nextAppointment: nextAppointment.trim(),
                markCompleted: false,
                medicines: prescribedMedicines
            };

            const rxRes = await ClinicDoctorAPI.saveOpdPrescription(appointmentId, payload);

            if (rxRes && rxRes.success) {
                toast.success(rxRes.message || "Prescription saved successfully!");

                const createdPrescriptionId = rxRes.prescriptionId || rxRes.data?.prescription?._id;

                // Send to clinic pharmacy if toggled
                if (sendToPharmacyImmediately && createdPrescriptionId) {
                    try {
                        const pharmacyPayload = {
                            prescriptionId: createdPrescriptionId,
                            notes: doctorSuggestions || "Dispense prescribed medications",
                            medicines: prescribedMedicines.map((m) => ({
                                medicineId: m.medicineId,
                                name: m.name,
                                strength: m.strength,
                                doseInterval: m.doseInterval,
                                frequency: m.frequency,
                                duration: m.duration,
                                quantity: 1,
                                dispenseQuantity: m.dispenseQuantity,
                                administrationTiming: m.administrationTiming,
                                timeSchedule: m.timeSchedule
                            }))
                        };
                        const pRes = await ClinicDoctorAPI.sendOpdPrescriptionToPharmacy(appointmentId, pharmacyPayload);
                        if (pRes && pRes.success) {
                            toast.success("Rx forwarded to Clinic Pharmacy!");
                        }
                    } catch (pErr) {
                        console.error("Pharmacy forward failed:", pErr);
                        toast.error("Prescription saved, but pharmacy forwarding had an issue.");
                    }
                }

                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(rxRes?.message || "Failed to save prescription");
            }
        } catch (err) {
            console.error("Error creating prescription:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to prescribe");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <Pill size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Rx Clinical Prescription &amp; Posology</h3>
                            <p className="text-xs text-slate-400 font-medium">Formulate medicines, schedule timings &amp; dispatch to Pharmacy</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <form onSubmit={handleSaveAndPrescribe} className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Clinical Overview Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Chief Complaints
                            </label>
                            <input
                                type="text"
                                placeholder="e.g., Elevated fasting blood sugar and mild fatigue"
                                value={chiefComplaints}
                                onChange={(e) => setChiefComplaints(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Clinical Diagnosis (Comma separated)
                            </label>
                            <input
                                type="text"
                                placeholder="Type 2 Diabetes Mellitus, Essential Hypertension"
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                        </div>
                    </div>

                    {/* Medicine Catalog Search Strip */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                Search Medicine Database Catalog
                            </label>
                            <button
                                type="button"
                                onClick={handleAddCustomMedicine}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer"
                            >
                                <Plus size={13} /> Add Custom / Generic
                            </button>
                        </div>

                        <div className="relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search by brand name, salt (e.g., Metformin), or manufacturer..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
                            />
                            {searchLoading && (
                                <RefreshCw size={14} className="animate-spin text-indigo-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            )}
                        </div>

                        {/* Search Suggestions Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-2 max-h-52 overflow-y-auto space-y-1">
                                {searchResults.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleAddMedicineFromCatalog(item)}
                                        className="p-2.5 rounded-xl hover:bg-indigo-50/60 transition cursor-pointer flex items-center justify-between text-xs"
                                    >
                                        <div>
                                            <strong className="text-slate-900 block font-bold">{item.name}</strong>
                                            <span className="text-[11px] text-slate-500 block">{item.saltComposition} • {item.packaging}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {item.inClinicPharmacy && (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                                                    <Building2 size={10} /> In Clinic Stock
                                                </span>
                                            )}
                                            <span className="font-mono font-bold text-slate-800 text-xs">₹{item.sellingPrice || item.mrp}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Prescribed Items Queue */}
                    <div className="space-y-3">
                        <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
                            Prescription Queue ({prescribedMedicines.length})
                        </span>

                        {prescribedMedicines.length === 0 ? (
                            <div className="p-8 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                                No medicines added yet. Search the database catalog above or click "Add Custom / Generic".
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {prescribedMedicines.map((med, idx) => (
                                    <div key={idx} className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200 space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <input
                                                type="text"
                                                placeholder="Medicine Name"
                                                value={med.name}
                                                onChange={(e) => handleUpdateMedicineField(idx, 'name', e.target.value)}
                                                className="w-1/2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Strength (500mg)"
                                                value={med.strength}
                                                onChange={(e) => handleUpdateMedicineField(idx, 'strength', e.target.value)}
                                                className="w-1/4 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 font-mono"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMedicine(idx)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>

                                        {/* Timing & Posology Grid */}
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Dose Interval</span>
                                                <input
                                                    type="text"
                                                    value={med.doseInterval}
                                                    placeholder="1-0-1"
                                                    onChange={(e) => handleUpdateMedicineField(idx, 'doseInterval', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-700"
                                                />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Frequency</span>
                                                <input
                                                    type="text"
                                                    value={med.frequency}
                                                    placeholder="Twice a day"
                                                    onChange={(e) => handleUpdateMedicineField(idx, 'frequency', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                                                <input
                                                    type="text"
                                                    value={med.duration}
                                                    placeholder="30 Days"
                                                    onChange={(e) => handleUpdateMedicineField(idx, 'duration', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                                                />
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-slate-400 uppercase">Admin Timing</span>
                                                <input
                                                    type="text"
                                                    value={med.administrationTiming}
                                                    placeholder="After meals"
                                                    onChange={(e) => handleUpdateMedicineField(idx, 'administrationTiming', e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700"
                                                />
                                            </div>
                                        </div>

                                        {/* Daily Time Schedule Checkboxes */}
                                        <div className="flex items-center gap-2 text-xs">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Time of Day:</span>
                                            {['morning', 'afternoon', 'evening', 'night'].map((slot) => {
                                                const isChecked = !!med.timeSchedule?.[slot];
                                                return (
                                                    <button
                                                        key={slot}
                                                        type="button"
                                                        onClick={() => handleToggleSchedule(idx, slot)}
                                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition cursor-pointer border ${
                                                            isChecked
                                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                                : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        {slot}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Suggestions & Lifestyle Instructions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Doctor Suggestions &amp; Recommendations
                            </label>
                            <textarea
                                rows={2}
                                placeholder="Repeat HbA1c after 3 months, avoid refined sugars, 30 min daily brisk walk..."
                                value={doctorSuggestions}
                                onChange={(e) => setDoctorSuggestions(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Advised Investigations
                            </label>
                            <textarea
                                rows={2}
                                placeholder="HbA1c, Fasting Blood Sugar, Lipid Profile..."
                                value={advisedInvestigations}
                                onChange={(e) => setAdvisedInvestigations(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 resize-none"
                            />
                        </div>
                    </div>

                    {/* Direct Forward to Pharmacy Checkbox */}
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Building2 size={16} className="text-emerald-700" />
                            <span className="text-xs font-bold text-emerald-950">
                                Send directly to Clinic Pharmacy for immediate dispensing
                            </span>
                        </div>
                        <input
                            type="checkbox"
                            checked={sendToPharmacyImmediately}
                            onChange={(e) => setSendToPharmacyImmediately(e.target.checked)}
                            className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                        />
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {submitting && <RefreshCw size={13} className="animate-spin" />}
                            <span>{submitting ? "Prescribing..." : "Save & Complete Prescription"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}