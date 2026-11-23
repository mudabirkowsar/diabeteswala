"use client";

import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Activity, X, Loader2, Save } from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function PatientVitalsModal({ appointmentId, currentVitals = {}, isOpen, onClose, onSuccess }) {
  const [vitalsData, setVitalsData] = useState({
    bp: currentVitals?.bp || '',
    pulse: currentVitals?.pulse || '',
    temp: currentVitals?.temp || '',
    spo2: currentVitals?.spo2 || '',
    notes: currentVitals?.notes || ''
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await ClinicDoctorAPI.recordPatientVitals(appointmentId, vitalsData);
      if (response && response.success) {
        toast.success(response.message || "Vitals recorded successfully!");
        onSuccess(response.vitals || vitalsData);
        onClose();
      } else {
        toast.error(response?.message || "Failed to save vitals");
      }
    } catch (err) {
      console.error("Error saving vitals:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to record vitals");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5 text-rose-600">
            <Activity size={20} />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Record Patient Vitals
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Blood Pressure (BP)
              </label>
              <input
                type="text"
                placeholder="e.g. 120/80"
                value={vitalsData.bp}
                onChange={(e) => setVitalsData({ ...vitalsData, bp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Pulse Rate (BPM)
              </label>
              <input
                type="text"
                placeholder="e.g. 76"
                value={vitalsData.pulse}
                onChange={(e) => setVitalsData({ ...vitalsData, pulse: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Body Temperature
              </label>
              <input
                type="text"
                placeholder="e.g. 98.6 F"
                value={vitalsData.temp}
                onChange={(e) => setVitalsData({ ...vitalsData, temp: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                SpO2 Saturation
              </label>
              <input
                type="text"
                placeholder="e.g. 99%"
                value={vitalsData.spo2}
                onChange={(e) => setVitalsData({ ...vitalsData, spo2: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
              Triage Remarks &amp; Observations
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Patient conscious and alert, complains of mild dizziness..."
              value={vitalsData.notes}
              onChange={(e) => setVitalsData({ ...vitalsData, notes: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-md shadow-rose-600/20 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span>Save Vitals</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}