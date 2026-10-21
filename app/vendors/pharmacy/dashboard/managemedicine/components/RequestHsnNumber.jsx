"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, RefreshCw, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';
import PharmacyVendorAPI from '../../../../../services/PharmacyVendorAPI';

export default function RequestHsnNumber({ onNotify }) {
    const [hsnCode, setHsnCode] = useState('');
    const [description, setDescription] = useState('');
    const [suggestedTaxPercent, setSuggestedTaxPercent] = useState(12);
    const [reason, setReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // History state
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    const fetchHistory = async () => {
        try {
            setLoadingHistory(true);
            const res = await PharmacyVendorAPI.getMyHsnRequestsHistory();
            if (res && res.success) {
                setHistory(Array.isArray(res.data) ? res.data : []);
            }
        } catch (err) {
            console.error('HSN history fetch error:', err);
            onNotify?.('error', err?.response?.data?.message || 'Failed to load HSN requests history.');
        } finally {
            setLoadingHistory(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!hsnCode.trim() || !description.trim()) {
            onNotify?.('error', 'HSN Code and Description are required.');
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                hsnCode: hsnCode.trim(),
                description: description.trim(),
                suggestedTaxPercent: Number(suggestedTaxPercent),
                reason: reason.trim() || undefined
            };

            const res = await PharmacyVendorAPI.requestNewHsnCode(payload);
            if (res && res.success) {
                onNotify?.('success', res.message || 'HSN Request submitted successfully!');
                setHsnCode('');
                setDescription('');
                setReason('');
                setSuggestedTaxPercent(12);
                fetchHistory();
            }
        } catch (err) {
            console.error('Submit HSN request error:', err);
            onNotify?.('error', err?.response?.data?.message || 'Failed to submit HSN request.');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            return new Date(dateStr).toLocaleDateString('en-IN', {
                day: '2-digit', month: 'short', year: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="space-y-6">
            {/* Submit HSN Form */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                    <ShieldCheck size={20} className="text-[#3d3f96]" />
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900">Request New GST HSN Code Addition</h3>
                        <p className="text-xs text-slate-400">Request Admin to approve a new pharmaceutical HSN Code with GST rate</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                                HSN Code (6-8 Digits) <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. 30049080"
                                value={hsnCode}
                                onChange={(e) => setHsnCode(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                                Suggested Tax % (GST) <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={suggestedTaxPercent}
                                onChange={(e) => setSuggestedTaxPercent(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            >
                                <option value={0}>0% GST</option>
                                <option value={5}>5% GST</option>
                                <option value={12}>12% GST (Medicines)</option>
                                <option value={18}>18% GST</option>
                                <option value={28}>28% GST</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">
                                Commodity / Molecule Description <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Antidiabetic herbal formulation"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Reason for Request</label>
                        <textarea
                            rows={2}
                            placeholder="e.g. New Ayurvedic diabetes management syrup batch arrived from supplier."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                        />
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            <Plus size={14} />
                            <span>{submitting ? 'Submitting...' : 'Submit HSN Request'}</span>
                        </button>
                    </div>
                </form>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FileText size={18} className="text-[#3d3f96]" />
                        <h4 className="text-xs sm:text-sm font-black text-slate-800">My Submitted HSN Requests History</h4>
                    </div>
                    <button
                        onClick={fetchHistory}
                        disabled={loadingHistory}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
                        title="Refresh History"
                    >
                        <RefreshCw size={14} className={loadingHistory ? 'animate-spin text-[#3d3f96]' : ''} />
                    </button>
                </div>

                {loadingHistory ? (
                    <div className="p-12 text-center text-xs font-bold text-slate-400">Loading request history...</div>
                ) : history.length === 0 ? (
                    <div className="p-12 text-center text-xs font-bold text-slate-400">No HSN requests submitted yet.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                    <th className="py-3 px-4">HSN Code</th>
                                    <th className="py-3 px-4">Description</th>
                                    <th className="py-3 px-4">Tax %</th>
                                    <th className="py-3 px-4">Reason</th>
                                    <th className="py-3 px-4">Status</th>
                                    <th className="py-3 px-4">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs font-bold text-slate-700">
                                {history.map((item) => (
                                    <tr key={item._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3 px-4 font-mono font-black text-slate-900">{item.hsnCode}</td>
                                        <td className="py-3 px-4 max-w-[200px] truncate">{item.description}</td>
                                        <td className="py-3 px-4 font-black">{item.suggestedTaxPercent}% GST</td>
                                        <td className="py-3 px-4 max-w-[200px] text-slate-500 truncate">{item.reason || '—'}</td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            {item.status === 'Approved' ? (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                    <CheckCircle2 size={11} /> Approved
                                                </span>
                                            ) : item.status === 'Rejected' ? (
                                                <div>
                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                                                        <XCircle size={11} /> Rejected
                                                    </span>
                                                    {item.rejectionReason && (
                                                        <p className="text-[10px] text-rose-600 font-normal mt-0.5 max-w-[220px]">
                                                            {item.rejectionReason}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                                    <Clock size={11} /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-[11px] text-slate-500">{formatDate(item.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}