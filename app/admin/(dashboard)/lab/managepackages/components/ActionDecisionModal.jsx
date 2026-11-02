"use client";
import React, { useState, useEffect } from 'react';
import {
    X,
    CheckCircle2,
    XCircle,
    Loader2,
    AlertTriangle,
    MessageSquare
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

export default function ActionDecisionModal({ isOpen, request, initialDecision, onClose, onSuccess }) {
    const [decision, setDecision] = useState(initialDecision || 'Approved');
    const [adminComment, setAdminComment] = useState("");
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!isOpen || !request) return;

        setDecision(initialDecision || 'Approved');
        if (initialDecision === 'Approved') {
            setAdminComment("Approved. Added to the platform master catalog.");
        } else {
            setAdminComment("");
        }
    }, [isOpen, request, initialDecision]);

    if (!isOpen || !request) return null;

    const isApprove = decision === 'Approved';
    const isTest = request.requestType === 'Test';
    const title = isTest ? request.data?.testName : request.data?.packageName;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!isApprove && !adminComment.trim()) {
            toast.error("Please enter a rejection reason for the vendor.");
            return;
        }

        setActionLoading(true);
        try {
            let response;
            if (isApprove) {
                response = await AdminAPI.approveLabPackageRequest(
                    request._id,
                    adminComment.trim() || "Approved and added to master catalog."
                );
            } else {
                response = await AdminAPI.rejectLabPackageRequest(
                    request._id,
                    adminComment.trim()
                );
            }

            if (response && response.success) {
                toast.success(
                    isApprove
                        ? "Request approved! Copied to Master catalog."
                        : "Request rejected successfully."
                );
                onSuccess();
            } else {
                toast.error(response?.message || "Failed to submit decision.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while submitting decision.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2rem] max-w-md w-full p-6 shadow-2xl relative z-10 border border-slate-100 text-left">
                <button
                    onClick={onClose}
                    className="absolute top-5 right-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
                >
                    <X size={16} />
                </button>

                {/* Decision Switcher Tabs */}
                <div className="flex items-center gap-2 mb-4">
                    <button
                        type="button"
                        onClick={() => {
                            setDecision('Approved');
                            setAdminComment("Approved. Added to the platform master catalog.");
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            isApprove
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <CheckCircle2 size={14} /> Approve
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setDecision('Rejected');
                            setAdminComment("");
                        }}
                        className={`flex-1 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            !isApprove
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        <XCircle size={14} /> Reject
                    </button>
                </div>

                <div className="mb-4">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        {isApprove ? "Publishing to Platform Master" : "Declining Vendor Proposal"}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-0.5">{title}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                        Requested by <strong className="text-slate-700">{request.vendorId?.name || "Lab Vendor"}</strong>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 flex items-center gap-1">
                            <MessageSquare size={12} />
                            {isApprove ? "Admin Approval Feedback" : "Rejection Reason (Visible to Lab) *"}
                        </label>
                        <textarea
                            rows={3}
                            required={!isApprove}
                            value={adminComment}
                            onChange={(e) => setAdminComment(e.target.value)}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white resize-none"
                            placeholder={
                                isApprove
                                    ? "Add a positive note or confirmation comment..."
                                    : "e.g. This test already exists under 'Homocysteine Blood Test'."
                            }
                        />
                    </div>

                    {/* Pre-canned Quick Reasons for Rejection */}
                    {!isApprove && (
                        <div className="space-y-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase">Quick Rejection Suggestions:</span>
                            <div className="flex flex-wrap gap-1">
                                {[
                                    "Already exists in master catalog",
                                    "Incomplete parameter list",
                                    "Invalid proposed MRP"
                                ].map((phrase, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setAdminComment(`Rejected: ${phrase}.`)}
                                        className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
                                    >
                                        {phrase}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={actionLoading}
                            className={`py-3 text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                isApprove
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                            {actionLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <span>{isApprove ? "Confirm Approval" : "Confirm Rejection"}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}