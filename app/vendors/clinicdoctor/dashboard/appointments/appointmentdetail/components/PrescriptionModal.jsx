"use client";

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  X,
  Search,
  Plus,
  Trash2,
  Send,
  Loader2,
  Building2,
  Pill
} from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function PrescriptionModal({ appointmentId, isOpen, onClose, onSuccess }) {
  // Prescription Form State (Updated as per Step 3 documentation)
  const [chiefComplaints, setChiefComplaints] = useState('');
  const [diagnosisInput, setDiagnosisInput] = useState('');
  const [prescribedMedicines, setPrescribedMedicines] = useState([]);
  const [adviceGiven, setAdviceGiven] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [nextAppointment, setNextAppointment] = useState('');
  const [sendToPharmacyImmediately, setSendToPharmacyImmediately] = useState(true);
  const [pharmacyNotes, setPharmacyNotes] = useState('');

  // Medicine Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [clinicOnly, setClinicOnly] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Search Medicines from API
  const handleSearchMedicines = useCallback(async (query, onlyClinic) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const response = await ClinicDoctorAPI.getOPDMedicines({
        search: query.trim(),
        clinicOnly: onlyClinic ? 'true' : 'false',
        limit: 10
      });
      if (response && response.success) {
        setSearchResults(response.data || []);
      }
    } catch (err) {
      console.error("Error searching medicines:", err);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      handleSearchMedicines(searchQuery, clinicOnly);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery, clinicOnly, handleSearchMedicines]);

  if (!isOpen) return null;

  // Add Medicine to Prescribed List
  const handleAddMedicine = (med) => {
    const alreadyAdded = prescribedMedicines.some((m) => m.medicineId === med._id);
    if (alreadyAdded) {
      toast.error(`${med.name} is already in the prescription.`);
      return;
    }

    setPrescribedMedicines([
      ...prescribedMedicines,
      {
        medicineId: med._id,
        name: med.name,
        dose: '1-0-1',
        time: 'Morning - Night',
        frequency: 'Twice Daily',
        duration: '30 Days',
        quantity: 1,
        instructions: 'After food',
        inClinicPharmacy: med.inClinicPharmacy
      }
    ]);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Update Medicine Field
  const handleUpdateMedicine = (index, field, value) => {
    const updated = [...prescribedMedicines];
    updated[index][field] = value;
    setPrescribedMedicines(updated);
  };

  // Remove Medicine
  const handleRemoveMedicine = (index) => {
    setPrescribedMedicines(prescribedMedicines.filter((_, idx) => idx !== index));
  };

  // Save Prescription and Optionally Send to Clinic Pharmacy
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (prescribedMedicines.length === 0 && !chiefComplaints.trim()) {
      toast.error("Please add complaints or at least one prescribed medicine.");
      return;
    }

    setSubmitting(true);
    try {
      // Updated Prescription Payload (without advisedInvestigations & dietPlanPdf)
      const prescriptionData = {
        chiefComplaints: chiefComplaints.trim(),
        diagnosis: diagnosisInput ? diagnosisInput.split(',').map((d) => d.trim()).filter(Boolean) : [],
        medicines: prescribedMedicines.map((m) => ({
          name: m.name,
          dose: m.dose,
          time: m.time || 'Morning',
          duration: m.duration,
          instructions: m.instructions
        })),
        adviceGiven: adviceGiven.trim(),
        specialInstructions: specialInstructions.trim(),
        nextAppointment: nextAppointment || null,
        markCompleted: false
      };

      const resPrescription = await ClinicDoctorAPI.prescribePatient(appointmentId, prescriptionData);

      if (!resPrescription || !resPrescription.success) {
        toast.error(resPrescription?.message || "Failed to save prescription.");
        setSubmitting(false);
        return;
      }

      const prescriptionId = resPrescription.prescriptionId || resPrescription.data?.prescription?._id;
      toast.success("Prescription generated successfully!");

      // Dispatch to Clinic Pharmacy if Selected
      if (sendToPharmacyImmediately && prescribedMedicines.length > 0) {
        try {
          const pharmacyPayload = {
            prescriptionId,
            notes: pharmacyNotes || "Dispense as prescribed",
            medicines: prescribedMedicines.map((m) => ({
              medicineId: m.medicineId,
              name: m.name,
              dose: m.dose,
              frequency: m.frequency,
              duration: m.duration,
              quantity: Number(m.quantity) || 1,
              instructions: m.instructions
            }))
          };
          await ClinicDoctorAPI.sendPrescriptionToPharmacy(appointmentId, pharmacyPayload);
          toast.success("Order dispatched to Clinic Pharmacy successfully!");
        } catch (pharmErr) {
          console.warn("Pharmacy routing warning:", pharmErr);
          toast.error("Prescription saved, but pharmacy routing failed.");
        }
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Prescription submission error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to prescribe.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-slate-100 space-y-6 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5 text-indigo-600">
            <Pill size={22} />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                OPD Clinical Prescription &amp; Pharmacy Dispense
              </h3>
              <p className="text-[11px] text-slate-400">Record diagnosis, medications, and advice</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Chief Complaints & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Chief Complaints
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Mild chest tightness and elevated fasting sugar..."
                value={chiefComplaints}
                onChange={(e) => setChiefComplaints(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Clinical Diagnosis (Comma Separated)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Type 2 Diabetes Mellitus, Mild Hypertension"
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Section 2: Medicine Search & Prescribe */}
          <div className="space-y-3 p-4 bg-indigo-50/40 rounded-3xl border border-indigo-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Search size={14} /> Search Medicines (Inventory &amp; Master)
              </span>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-indigo-800">
                <input
                  type="checkbox"
                  checked={clinicOnly}
                  onChange={(e) => setClinicOnly(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Clinic Pharmacy Stock Only</span>
              </label>
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Type medicine name, composition (e.g. Glycomet, Telma, Metformin)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-indigo-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {searching && (
                <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-indigo-600" />
              )}
            </div>

            {/* Dropdown Results */}
            {searchResults.length > 0 && (
              <div className="max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-lg">
                {searchResults.map((med) => (
                  <div
                    key={med._id}
                    onClick={() => handleAddMedicine(med)}
                    className="p-3 hover:bg-indigo-50 flex items-center justify-between cursor-pointer transition text-xs"
                  >
                    <div>
                      <strong className="text-slate-900 font-bold block">{med.name}</strong>
                      <span className="text-[11px] text-slate-500">
                        {med.saltComposition} • {med.packaging || 'Strip'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {med.inClinicPharmacy ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <Building2 size={10} /> In Stock ({med.stockQuantity})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-slate-100 text-slate-600">
                          Catalog
                        </span>
                      )}
                      <button
                        type="button"
                        className="p-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Prescribed Items Table */}
            {prescribedMedicines.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
                  Prescription Rx Items ({prescribedMedicines.length})
                </span>

                <div className="space-y-2">
                  {prescribedMedicines.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs">
                      <div className="sm:col-span-3">
                        <strong className="text-slate-900 block truncate font-bold">{item.name}</strong>
                        {item.inClinicPharmacy && (
                          <span className="text-[9px] font-bold text-emerald-600">● Clinic Stock</span>
                        )}
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Dose (1-0-1)"
                          value={item.dose}
                          onChange={(e) => handleUpdateMedicine(idx, 'dose', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Duration (30 Days)"
                          value={item.duration}
                          onChange={(e) => handleUpdateMedicine(idx, 'duration', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <input
                          type="text"
                          placeholder="Instructions (After food)"
                          value={item.instructions}
                          onChange={(e) => handleUpdateMedicine(idx, 'instructions', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]"
                        />
                      </div>

                      <div className="sm:col-span-1">
                        <input
                          type="number"
                          min={1}
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleUpdateMedicine(idx, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-mono"
                          title="Pharmacy Dispense Quantity"
                        />
                      </div>

                      <div className="sm:col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveMedicine(idx)}
                          className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Advice, Special Precautions & Next Appointment */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Doctor Advice Given
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Low sodium diabetic diet and 30 min daily walk..."
                value={adviceGiven}
                onChange={(e) => setAdviceGiven(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Special Precautions / Instructions
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Monitor BP twice daily, report if fasting sugar exceeds 180..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-700 uppercase block mb-1">
                Next Follow-Up Appointment Date
              </label>
              <input
                type="date"
                value={nextAppointment}
                onChange={(e) => setNextAppointment(e.target.value)}
                className="w-full sm:w-1/2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 4: Pharmacy Forwarding Option */}
          <div className="p-4 bg-emerald-50/60 rounded-3xl border border-emerald-200 space-y-2.5">
            <label className="inline-flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={sendToPharmacyImmediately}
                onChange={(e) => setSendToPharmacyImmediately(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <span className="text-xs font-black text-emerald-900">
                Forward prescribed items directly to Clinic Pharmacy for dispensing
              </span>
            </label>

            {sendToPharmacyImmediately && (
              <input
                type="text"
                placeholder="Instructions for Clinic Pharmacist (e.g. Dispense full 30-day diabetes course)..."
                value={pharmacyNotes}
                onChange={(e) => setPharmacyNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Save &amp; Generate Prescription</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}