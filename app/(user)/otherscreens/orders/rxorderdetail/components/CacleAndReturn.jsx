"use client";

import React, { useState } from 'react';
import {
    Ban,
    RotateCcw,
    RefreshCw,
    X,
    UploadCloud,
    Loader2,
    Clock,
    AlertCircle
} from 'lucide-react';

export default function CacleAndReturn({
    targetOrderId,
    isCancelOpen,
    onCloseCancel,
    isReturnOpen,
    onCloseReturn,
    onSuccess,
    UserAPI,
    showNotification,
    returnDetails = null
}) {
    // --- Cancel Modal Local State ---
    const [cancelReason, setCancelReason] = useState("");
    const [cancelling, setCancelling] = useState(false);

    // --- Return Modal Local State ---
    const [returnRequestType, setReturnRequestType] = useState("Return"); // "Return" | "Replacement"
    const [returnReason, setReturnReason] = useState("");
    const [userComments, setUserComments] = useState("");
    const [proofFiles, setProofFiles] = useState([]);
    const [submittingReturn, setSubmittingReturn] = useState(false);

    // --- 1. Handle Cancel Submit ---
    const handleCancelSubmit = async (e) => {
        e.preventDefault();
        if (!targetOrderId) {
            showNotification?.("Order identifier missing.", "error");
            return;
        }

        setCancelling(true);
        try {
            const payload = {
                orderId: targetOrderId,
                reason: cancelReason || "Cancelled by customer before dispatch."
            };

            const res = await UserAPI.cancelUserPharmacyOrder(payload);

            if (res && res.success) {
                showNotification?.(res.message || "Order cancelled successfully.", "success");
                setCancelReason("");
                onCloseCancel();
                if (onSuccess) onSuccess();
            } else {
                showNotification?.(res?.message || "Failed to cancel order.", "error");
            }
        } catch (err) {
            console.error("Cancel Order Error:", err);
            const errMsg = err?.response?.data?.message || err?.message || "Failed to cancel order.";
            showNotification?.(errMsg, "error");
        } finally {
            setCancelling(false);
        }
    };

    // --- 2. Handle Proof File Uploads ---
    const handleProofFileChange = (e) => {
        const selected = Array.from(e.target.files || []);
        if (proofFiles.length + selected.length > 5) {
            showNotification?.("You can upload a maximum of 5 proof images.", "error");
            return;
        }

        const validImages = selected.filter(file => file.type.startsWith('image/'));
        if (validImages.length !== selected.length) {
            showNotification?.("Only image files (JPG, PNG, WEBP) are permitted.", "error");
        }

        setProofFiles(prev => [...prev, ...validImages].slice(0, 5));
    };

    const removeProofFile = (indexToRemove) => {
        setProofFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    // --- 3. Handle Return / Replacement Submit ---
    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        if (!returnReason.trim()) {
            showNotification?.("Please select or enter a primary reason for return/replacement.", "error");
            return;
        }

        if (!targetOrderId) {
            showNotification?.("Order identifier missing.", "error");
            return;
        }

        setSubmittingReturn(true);

        try {
            const formData = new FormData();
            formData.append("requestType", returnRequestType); // "Return" or "Replacement"
            formData.append("reason", returnReason);
            if (userComments.trim()) {
                formData.append("userComments", userComments.trim());
            }

            proofFiles.forEach((file) => {
                formData.append("proofImages", file);
            });

            const res = await UserAPI.requestPharmacyOrderReturn(targetOrderId, formData);

            if (res && res.success) {
                showNotification?.(res.message || "Return request submitted successfully!", "success");
                setReturnReason("");
                setUserComments("");
                setProofFiles([]);
                onCloseReturn();
                if (onSuccess) onSuccess();
            } else {
                showNotification?.(res?.message || "Could not submit return request.", "error");
            }
        } catch (err) {
            console.error("Return Request Error:", err);
            const errMsg = err?.response?.data?.message || err?.message || "Failed to submit return request.";
            showNotification?.(errMsg, "error");
        } finally {
            setSubmittingReturn(false);
        }
    };

    return (
        <>
            {/* ========================================================================= */}
            {/* 🛑 CANCEL ORDER MODAL                                                     */}
            {/* ========================================================================= */}
            {isCancelOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-rose-600">
                                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                                    <Ban size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Cancel Prescription Order</h3>
                                    <p className="text-[10px] text-slate-400 font-mono">Ref: {targetOrderId}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onCloseCancel}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <p className="text-xs text-slate-500 leading-relaxed">
                            Orders can only be cancelled before dispatch begins. Any reserved inventory stock will be restored to the chemist.
                        </p>

                        <form onSubmit={handleCancelSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                                    Reason for Cancellation
                                </label>
                                <textarea
                                    rows={3}
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    placeholder="e.g. Ordered wrong dosage by mistake or doctor modified prescription."
                                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 outline-hidden transition resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={onCloseCancel}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Dismiss
                                </button>
                                <button
                                    type="submit"
                                    disabled={cancelling}
                                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black uppercase shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {cancelling ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Cancelling...</span>
                                        </>
                                    ) : (
                                        <span>Confirm Cancel</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 🔄 RETURN / REPLACEMENT MODAL                                             */}
            {/* ========================================================================= */}
            {isReturnOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-indigo-900">
                                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[#3d3f96]">
                                    <RotateCcw size={16} />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900">Request Return or Replacement</h3>
                                    <p className="text-[10px] text-slate-400 font-mono">Order #{targetOrderId}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onCloseReturn}
                                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Optional Admin Return Window Badge info */}
                        {returnDetails?.returnWindowText && (
                            <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-indigo-800 text-xs">
                                <Clock size={14} className="shrink-0 text-[#3d3f96]" />
                                <span>{returnDetails.returnWindowText}</span>
                            </div>
                        )}

                        <form onSubmit={handleReturnSubmit} className="space-y-4">
                            {/* Request Type Choice */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1.5">
                                    Action Requested
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setReturnRequestType("Return")}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            returnRequestType === "Return"
                                                ? "border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96]"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <RotateCcw size={13} />
                                        <span>Return &amp; Refund</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReturnRequestType("Replacement")}
                                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                                            returnRequestType === "Replacement"
                                                ? "border-[#3d3f96] bg-indigo-50/50 text-[#3d3f96]"
                                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <RefreshCw size={13} />
                                        <span>Item Replacement</span>
                                    </button>
                                </div>
                            </div>

                            {/* Reason for Return */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                                    Primary Reason <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={returnReason}
                                    onChange={(e) => setReturnReason(e.target.value)}
                                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-[#3d3f96] outline-hidden bg-white cursor-pointer"
                                >
                                    <option value="">Select reason...</option>
                                    <option value="Damaged or Leaked Medicine">Damaged or Leaked Medicine</option>
                                    <option value="Expired Product Delivered">Expired Product Delivered</option>
                                    <option value="Incorrect Medicine / Dosage Sent">Incorrect Medicine / Dosage Sent</option>
                                    <option value="Seal Broken or Packaging Tampered">Seal Broken or Packaging Tampered</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            {/* Additional Comments */}
                            <div>
                                <label className="block text-[11px] font-black uppercase text-slate-500 tracking-wider mb-1">
                                    Customer Comments (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={userComments}
                                    onChange={(e) => setUserComments(e.target.value)}
                                    placeholder="Explain specifics (e.g. seal broken on syrup bottle)..."
                                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-[#3d3f96] outline-hidden transition resize-none"
                                />
                            </div>

                            {/* Proof Images Upload (Max 5) */}
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                                        Proof Images (Up to 5)
                                    </label>
                                    <span className="text-[10px] text-slate-400 font-bold">{proofFiles.length}/5 images</span>
                                </div>

                                <label className="border-2 border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50/50 hover:bg-indigo-50/20 transition">
                                    <UploadCloud size={22} className="text-[#3d3f96] mb-1" />
                                    <span className="text-xs font-bold text-slate-700">Click to upload photos</span>
                                    <span className="text-[10px] text-slate-400">Photos of batch, damage, or expiry date</span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={handleProofFileChange}
                                        disabled={proofFiles.length >= 5}
                                        className="hidden"
                                    />
                                </label>

                                {/* Image Previews */}
                                {proofFiles.length > 0 && (
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {proofFiles.map((file, idx) => (
                                            <div key={idx} className="relative group w-full aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt="proof"
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeProofFile(idx)}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-rose-600 text-white rounded-full flex items-center justify-center shadow-xs cursor-pointer hover:bg-rose-700"
                                                >
                                                    <X size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Modal Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onCloseReturn}
                                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingReturn}
                                    className="flex-1 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black uppercase shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    {submittingReturn ? (
                                        <>
                                            <Loader2 size={13} className="animate-spin" />
                                            <span>Submitting...</span>
                                        </>
                                    ) : (
                                        <span>Submit Ticket</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}