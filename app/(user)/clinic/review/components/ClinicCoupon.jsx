"use client";

import React, { useState, useEffect } from 'react';
import {
    X,
    Tag,
    Percent,
    Ticket,
    Check,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Sparkles,
    Calendar,
    ArrowRight
} from 'lucide-react';

import UserAPI from '../../../../services/UserAPI';

export default function ClinicCoupon({
    isOpen,
    onClose,
    clinicId,
    bookingTotal = 0,
    appliedCoupon = null,
    onApplyCoupon,
    onRemoveCoupon
}) {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [couponInput, setCouponInput] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Fetch applicable clinic & platform coupons on modal open
    useEffect(() => {
        if (!isOpen || !clinicId) return;

        const fetchCoupons = async () => {
            setLoading(true);
            setErrorMsg("");
            try {
                const response = await UserAPI.getUserClinicCoupons(clinicId);
                if (response && response.success) {
                    setCoupons(response.data || []);
                } else {
                    setCoupons([]);
                }
            } catch (err) {
                console.error("Error fetching clinic coupons:", err);
                setCoupons([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCoupons();
    }, [isOpen, clinicId]);

    // Handle Escape key & scroll lock
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

    // Helper: calculate discount amount for a coupon
    const calculateDiscount = (coupon) => {
        if (!coupon || !bookingTotal) return 0;
        const rawDiscount = Math.round((bookingTotal * coupon.discountPercentage) / 100);
        if (coupon.maxDiscount && coupon.maxDiscount > 0) {
            return Math.min(rawDiscount, coupon.maxDiscount);
        }
        return rawDiscount;
    };

    // Apply Coupon Action
    const handleApply = (couponObj) => {
        setErrorMsg("");

        // Validate Minimum Order Amount
        if (couponObj.minOrderAmount && bookingTotal < couponObj.minOrderAmount) {
            setErrorMsg(`Minimum order of ₹${couponObj.minOrderAmount} required for coupon "${couponObj.couponName}"`);
            return;
        }

        const calculatedSavings = calculateDiscount(couponObj);
        onApplyCoupon({
            ...couponObj,
            discountAmount: calculatedSavings
        });
        onClose();
    };

    // Manual Input Promo Code Submit
    const handleManualSubmit = (e) => {
        e.preventDefault();
        setErrorMsg("");
        const query = couponInput.trim().toUpperCase();

        if (!query) {
            setErrorMsg("Please enter a coupon code");
            return;
        }

        const match = coupons.find(
            (c) => c.couponName?.trim().toUpperCase() === query
        );

        if (!match) {
            setErrorMsg(`Coupon code "${query}" is not applicable for this clinic.`);
            return;
        }

        handleApply(match);
    };

    return (
        <div
            className="fixed inset-0 flex justify-end select-none antialiased"
            style={{ zIndex: 5000 }}
        >
            {/* Backdrop Blur Overlay */}
            <div
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
                style={{ zIndex: 5000 }}
            />

            {/* Right Slide-over Drawer */}
            <div
                className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 border-l border-slate-100"
                style={{ zIndex: 5001 }}
            >

                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                                <Tag size={16} />
                            </div>
                            <h3 className="text-base font-black text-slate-900 tracking-tight">
                                Apply Clinic Coupon
                            </h3>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            Enter code or choose from applicable clinic &amp; platform offers
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

                {/* Manual Code Input Bar */}
                <div className="p-5 bg-slate-50/80 border-b border-slate-100 space-y-2">
                    <form onSubmit={handleManualSubmit} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter promo code (e.g. CLINIC20)"
                            value={couponInput}
                            onChange={(e) => {
                                setCouponInput(e.target.value);
                                setErrorMsg("");
                            }}
                            className="w-full uppercase font-mono text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#3d3f96] focus:ring-1 focus:ring-[#3d3f96] text-slate-800 outline-none transition-all"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#3d3f96] hover:bg-[#2d2f75] text-white transition-all cursor-pointer shrink-0 shadow-xs"
                        >
                            Apply
                        </button>
                    </form>

                    {errorMsg && (
                        <p className="text-[11px] font-bold text-red-600 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} /> {errorMsg}
                        </p>
                    )}
                </div>

                {/* Active Applied Banner */}
                {appliedCoupon && (
                    <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <Check size={12} strokeWidth={3} />
                            </div>
                            <div>
                                <span className="font-mono font-black text-emerald-900 block leading-tight">
                                    '{appliedCoupon.couponName}' Active
                                </span>
                                <span className="text-[11px] text-emerald-700 font-medium">
                                    Saving ₹{appliedCoupon.discountAmount} on this appointment
                                </span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                onRemoveCoupon();
                                onClose();
                            }}
                            className="text-[10px] font-bold uppercase text-slate-400 hover:text-slate-700 underline cursor-pointer"
                        >
                            Remove
                        </button>
                    </div>
                )}

                {/* Available Coupons List */}
                <div className="p-6 flex-1 overflow-y-auto space-y-3.5 [&::-webkit-scrollbar]:hidden">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                        Available Offers ({coupons.length})
                    </span>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={32} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                Loading clinic coupons...
                            </p>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-3xl border border-slate-200/60 border-dashed space-y-2 my-auto">
                            <Ticket size={36} className="text-slate-300 mx-auto" />
                            <h4 className="text-sm font-bold text-slate-700">No Active Coupons</h4>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto">
                                There are no promotional offers running for this clinic currently.
                            </p>
                        </div>
                    ) : (
                        coupons.map((c) => {
                            const isSelected = appliedCoupon?._id === c._id;
                            const meetsCriteria = !c.minOrderAmount || (bookingTotal >= c.minOrderAmount);
                            const discountEst = calculateDiscount(c);

                            return (
                                <div
                                    key={c._id}
                                    className={`p-4 rounded-2xl border transition-all space-y-3 ${isSelected
                                        ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500'
                                        : meetsCriteria
                                            ? 'border-slate-200 bg-white hover:border-[#3d3f96] hover:shadow-xs'
                                            : 'border-slate-100 bg-slate-50/50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 tracking-wider">
                                                    {c.couponName}
                                                </span>
                                                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                                    {c.discountPercentage}% OFF
                                                </span>
                                                {c.isAdminCreated && (
                                                    <span className="text-[8px] font-bold uppercase text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                                        Global
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-xs text-slate-600 font-medium pt-0.5">
                                                Save up to <strong className="text-slate-900">₹{c.maxDiscount || 'Unlimited'}</strong> on this booking
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (isSelected) {
                                                    onRemoveCoupon();
                                                } else {
                                                    handleApply(c);
                                                }
                                            }}
                                            className={`py-1.5 px-4 rounded-xl text-xs font-black uppercase transition-all shrink-0 cursor-pointer ${isSelected
                                                ? 'bg-emerald-600 text-white shadow-xs'
                                                : 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-xs'
                                                }`}
                                        >
                                            {isSelected ? 'Applied' : 'Apply'}
                                        </button>
                                    </div>

                                    {/* Coupon Terms Footer */}
                                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                        <span>
                                            {c.minOrderAmount ? `Min. Booking: ₹${c.minOrderAmount}` : 'No minimum amount'}
                                        </span>
                                        {c.expiryDate && (
                                            <span className="flex items-center gap-1 font-mono">
                                                <Calendar size={10} /> Valid till {new Date(c.expiryDate).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-medium">
                        Booking Subtotal: <strong className="text-slate-900 font-mono">₹{bookingTotal}</strong>
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-2.5 px-5 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}