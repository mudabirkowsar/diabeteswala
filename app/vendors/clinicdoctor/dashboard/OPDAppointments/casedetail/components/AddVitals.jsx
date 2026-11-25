"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Activity, X, HeartPulse, RefreshCw } from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function AddVitals({ isOpen, onClose, appointmentId, initialVitals = {}, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [vitals, setVitals] = useState({
        bp: '',
        pulse: '',
        temp: '',
        spo2: '',
        notes: ''
    });

    useEffect(() => {
        if (initialVitals) {
            setVitals({
                bp: initialVitals.bp || '',
                pulse: initialVitals.pulse || '',
                temp: initialVitals.temp || '',
                spo2: initialVitals.spo2 || '',
                notes: initialVitals.notes || ''
            });
        }
    }, [initialVitals]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await ClinicDoctorAPI.updateOpdPatientVitals(appointmentId, vitals);
            if (res && res.success) {
                toast.success(res.message || "Vitals recorded successfully!");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(res?.message || "Failed to record patient vitals");
            }
        } catch (err) {
            console.error("Error saving vitals:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to record vitals");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-lg rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-600">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Record Patient Vitals</h3>
                            <p className="text-xs text-slate-400 font-medium">Record objective patient physiological markers</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Blood Pressure (mmHg)
                            </label>
                            <input
                                type="text"
                                placeholder="120/80"
                                value={vitals.bp}
                                onChange={(e) => setVitals({ ...vitals, bp: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Pulse Rate (BPM)
                            </label>
                            <input
                                type="text"
                                placeholder="76"
                                value={vitals.pulse}
                                onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                Body Temperature
                            </label>
                            <input
                                type="text"
                                placeholder="98.6 F"
                                value={vitals.temp}
                                onChange={(e) => setVitals({ ...vitals, temp: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                                SpO2 Saturation (%)
                            </label>
                            <input
                                type="text"
                                placeholder="99%"
                                value={vitals.spo2}
                                onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Clinical Observation Notes
                        </label>
                        <textarea
                            rows={3}
                            placeholder="Patient alert, mild post-meal glucose spike, stable respiration..."
                            value={vitals.notes}
                            onChange={(e) => setVitals({ ...vitals, notes: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {loading && <RefreshCw size={13} className="animate-spin" />}
                            <span>{loading ? "Saving..." : "Save Vitals"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}