"use client";

import React, { useState } from 'react';
import { Send, X, RefreshCw, Check } from 'lucide-react';
import PharmacyVendorAPI from '../../../../../services/PharmacyVendorAPI';

export default function RequestNewMedicine({ isOpen, onClose, onNotify }) {
    const [formData, setFormData] = useState({
        name: '',
        manufacturers: '',
        salt_composition: '',
        packaging: '',
        mrp: '',
        best_price: '',
        prescription_required: 'No',
        description: '',
        image_url: ''
    });
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            onNotify?.('error', 'Medicine Trade Name is required.');
            return;
        }

        try {
            setSubmitting(true);
            const imagesArray = formData.image_url
                ? formData.image_url.split(',').map((u) => u.trim()).filter(Boolean)
                : [];

            const payload = {
                name: formData.name.trim(),
                manufacturers: formData.manufacturers.trim() || undefined,
                salt_composition: formData.salt_composition.trim() || undefined,
                packaging: formData.packaging.trim() || undefined,
                mrp: formData.mrp || undefined,
                best_price: formData.best_price || undefined,
                description: formData.description.trim() || undefined,
                prescription_required: formData.prescription_required || 'No',
                image_url: imagesArray.length > 0 ? imagesArray : undefined
            };

            const res = await PharmacyVendorAPI.requestNewMedicineToMaster(payload);
            if (res && res.success) {
                onNotify?.('success', res.message || 'Medicine request submitted to Admin!');
                onClose();
            }
        } catch (err) {
            console.error('Request medicine error:', err);
            onNotify?.('error', err?.response?.data?.message || 'Failed to submit request.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-4">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                    <X size={18} />
                </button>

                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                        <Send size={18} />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900">Request New Medicine to Catalog</h3>
                        <p className="text-xs text-slate-400 font-bold">Admin will review and verify this medicine formulation</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                            Medicine Trade Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. Crocin 650 Advance Tablet"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Manufacturer</label>
                            <input
                                type="text"
                                placeholder="GlaxoSmithKline"
                                value={formData.manufacturers}
                                onChange={(e) => setFormData({ ...formData, manufacturers: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Packaging</label>
                            <input
                                type="text"
                                placeholder="strip of 15 tablets"
                                value={formData.packaging}
                                onChange={(e) => setFormData({ ...formData, packaging: e.target.value })}
                                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Salt / Chemical Composition</label>
                        <input
                            type="text"
                            placeholder="Paracetamol (650mg)"
                            value={formData.salt_composition}
                            onChange={(e) => setFormData({ ...formData, salt_composition: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">MRP (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="35.00"
                                value={formData.mrp}
                                onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Estimated Selling (₹)</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="31.50"
                                value={formData.best_price}
                                onChange={(e) => setFormData({ ...formData, best_price: e.target.value })}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Rx Required</label>
                            <select
                                value={formData.prescription_required}
                                onChange={(e) => setFormData({ ...formData, prescription_required: e.target.value })}
                                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            >
                                <option value="No">No (OTC)</option>
                                <option value="Yes">Yes (Rx)</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Description / Primary Use</label>
                        <textarea
                            rows={2}
                            placeholder="Used to relieve pain and reduce fever..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Photo URL(s)</label>
                        <input
                            type="text"
                            placeholder="https://example.com/crocin.jpg"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                            {submitting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                            <span>Submit Request</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}