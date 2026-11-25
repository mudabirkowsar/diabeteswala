"use client";

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FlaskConical, X, Search, Plus, Trash2, Building2, Send, RefreshCw } from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function AddTests({ isOpen, onClose, appointmentId, onSuccess }) {
    const [submitting, setSubmitting] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [testsList, setTestsList] = useState([]);
    const [packagesList, setPackagesList] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Selected Orders
    const [selectedItems, setSelectedItems] = useState([]);
    const [priority, setPriority] = useState('Urgent'); // 'Routine' | 'Urgent'
    const [notes, setNotes] = useState('Collect fasting blood sample tomorrow morning');

    // Fetch Tests and Packages Catalog
    useEffect(() => {
        const fetchCatalog = async () => {
            setSearchLoading(true);
            try {
                const res = await ClinicDoctorAPI.getOpdLabTestsCatalog({ search: searchQuery.trim() });
                if (res && res.success) {
                    setTestsList(res.tests || []);
                    setPackagesList(res.packages || []);
                }
            } catch (err) {
                console.error("Error loading lab tests catalog:", err);
            } finally {
                setSearchLoading(false);
            }
        };

        const timer = setTimeout(fetchCatalog, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    if (!isOpen) return null;

    const handleSelectTest = (test) => {
        if (selectedItems.some((i) => i.testId === test._id)) {
            toast.error("Test is already in referral list");
            return;
        }
        setSelectedItems([
            ...selectedItems,
            {
                testId: test._id,
                packageId: null,
                name: test.name,
                price: test.price || test.mrp || 0,
                instructions: test.precaution || "Standard sample collection"
            }
        ]);
    };

    const handleSelectPackage = (pkg) => {
        if (selectedItems.some((i) => i.packageId === pkg._id)) {
            toast.error("Package is already in referral list");
            return;
        }
        setSelectedItems([
            ...selectedItems,
            {
                testId: null,
                packageId: pkg._id,
                name: pkg.name,
                price: pkg.price || pkg.mrp || 0,
                instructions: pkg.precaution || (pkg.isFastingRequired ? `Fasting ${pkg.fastingDuration}` : "No fasting")
            }
        ]);
    };

    const handleRemoveItem = (index) => {
        setSelectedItems(selectedItems.filter((_, i) => i !== index));
    };

    const handleSendToLab = async (e) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            toast.error("Please add at least one diagnostic test or package");
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                priority,
                notes: notes.trim(),
                tests: selectedItems
            };

            const res = await ClinicDoctorAPI.sendOpdReferralToLab(appointmentId, payload);
            if (res && res.success) {
                toast.success(res.message || "Tests dispatched to Clinic Lab successfully!");
                if (onSuccess) onSuccess();
                onClose();
            } else {
                toast.error(res?.message || "Failed to order lab tests");
            }
        } catch (err) {
            console.error("Error referring to lab:", err);
            toast.error(err?.response?.data?.message || err.message || "Failed to dispatch lab tests");
        } finally {
            setSubmitting(false);
        }
    };

    const totalEstimate = selectedItems.reduce((acc, curr) => acc + (curr.price || 0), 0);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-100 shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-purple-50 border border-purple-100 text-purple-600">
                            <FlaskConical size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900">Order Lab Tests &amp; Diagnostics</h3>
                            <p className="text-xs text-slate-400 font-medium">Select diagnostic tests and dispatch orders directly to the Clinic Lab</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                {/* Form Body */}
                <form onSubmit={handleSendToLab} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Catalog Search & Priority */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                        <div className="sm:col-span-8 relative">
                            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search lab tests (e.g. HbA1c, CBC) or diagnostic packages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition"
                            />
                            {searchLoading && (
                                <RefreshCw size={14} className="animate-spin text-purple-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                            )}
                        </div>

                        <div className="sm:col-span-4 flex items-center justify-end gap-2">
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Priority:</span>
                            {['Routine', 'Urgent'].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setPriority(p)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                                        priority === p
                                            ? p === 'Urgent'
                                                ? 'bg-rose-600 text-white shadow-xs'
                                                : 'bg-indigo-600 text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Catalog Split Display */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-56 overflow-y-auto p-1">
                        {/* Individual Tests */}
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                Diagnostic Tests ({testsList.length})
                            </span>
                            {testsList.map((test) => (
                                <div
                                    key={test._id}
                                    onClick={() => handleSelectTest(test)}
                                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200/80 transition cursor-pointer flex items-center justify-between text-xs"
                                >
                                    <div>
                                        <strong className="text-slate-900 block font-bold">{test.name}</strong>
                                        <span className="text-[10px] text-slate-500">Sample: {test.sampleType} • {test.reportTime}</span>
                                    </div>
                                    <span className="font-mono font-black text-purple-900">₹{test.price || test.mrp}</span>
                                </div>
                            ))}
                        </div>

                        {/* Health Packages */}
                        <div className="space-y-1.5">
                            <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                                Health Packages ({packagesList.length})
                            </span>
                            {packagesList.map((pkg) => (
                                <div
                                    key={pkg._id}
                                    onClick={() => handleSelectPackage(pkg)}
                                    className="p-2.5 rounded-xl bg-slate-50 hover:bg-purple-50/70 border border-slate-200/80 transition cursor-pointer flex items-center justify-between text-xs"
                                >
                                    <div>
                                        <strong className="text-slate-900 block font-bold">{pkg.name}</strong>
                                        <span className="text-[10px] text-slate-500">{pkg.totalTestsIncluded} Tests Included • Fasting: {pkg.fastingDuration || 'No'}</span>
                                    </div>
                                    <span className="font-mono font-black text-purple-900">₹{pkg.price || pkg.mrp}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Tests List */}
                    <div className="space-y-3 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                                Selected Orders ({selectedItems.length})
                            </span>
                            <span className="text-xs font-mono font-black text-slate-900">
                                Estimated Total: ₹{totalEstimate}
                            </span>
                        </div>

                        {selectedItems.length === 0 ? (
                            <p className="text-xs text-slate-400 italic p-4 text-center bg-slate-50 rounded-2xl">
                                Click on any test or health package above to append to the clinic lab referral order.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {selectedItems.map((item, idx) => (
                                    <div key={idx} className="p-3 bg-purple-50/50 border border-purple-200/70 rounded-2xl flex items-center justify-between text-xs">
                                        <div className="space-y-0.5">
                                            <strong className="text-slate-900 block font-bold">{item.name}</strong>
                                            <span className="text-[11px] text-slate-500 italic">{item.instructions}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono font-black text-purple-900">₹{item.price}</span>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveItem(idx)}
                                                className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Lab Notes */}
                    <div>
                        <label className="block text-[11px] font-black uppercase tracking-wider text-slate-500 mb-1">
                            Technician Notes &amp; Sample Instructions
                        </label>
                        <textarea
                            rows={2}
                            placeholder="Collect fasting blood sample tomorrow morning..."
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 resize-none"
                        />
                    </div>

                    {/* Footer Actions */}
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
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-xs cursor-pointer disabled:opacity-50"
                        >
                            {submitting && <RefreshCw size={13} className="animate-spin" />}
                            <span>{submitting ? "Sending..." : "Dispatch to Clinic Lab"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}