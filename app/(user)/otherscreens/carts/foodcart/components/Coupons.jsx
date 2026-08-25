"use client";

import React, { useState, useEffect } from 'react';
import {
    Tag,
    X,
    Loader2,
    RefreshCw,
    Calendar
} from 'lucide-react';

import UserAPI from '../../../../../services/UserAPI';
import { useNotification } from '../../../../../context/NotificationContext';

export default function Coupons({
    isOpen,
    onClose,
    cartTotal = 0,
    appliedCoupon = null,
    onApplyCoupon,
    onRemoveCoupon
}) {
    const { showNotification } = useNotification();

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [manualCode, setManualCode] = useState('');
    const [applyingCode, setApplyingCode] = useState(false);

    const fetchCouponsList = async () => {
        setLoading(true);
        try {
            const response = await UserAPI.getFoodCoupons();
            if (response && response.success) {
                setCoupons(response.data || []);
            } else {
                if (showNotification) {
                    showNotification("Unable to load coupons list.", "error");
                }
            }
        } catch (err) {
            console.error("Error loading coupons:", err);
            if (showNotification) {
                showNotification(err.response?.data?.message || "Failed to retrieve coupons.", "error");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCouponsList();
            setManualCode('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatExpiryDate = (isoDate) => {
        if (!isoDate) return '--';
        try {
            const d = new Date(isoDate);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        } catch {
            return isoDate;
        }
    };

    const handleApplyManualCode = (e) => {
        e.preventDefault();
        const cleanCode = manualCode.trim().toUpperCase();
        if (!cleanCode) return;

        setApplyingCode(true);

        const matchedCoupon = coupons.find(
            (c) => c.couponName?.toUpperCase() === cleanCode
        );

        if (!matchedCoupon) {
            if (showNotification) {
                showNotification("Invalid coupon code.", "error");
            }
            setApplyingCode(false);
            return;
        }

        if (cartTotal < (matchedCoupon.minOrderAmount || 0)) {
            const needed = (matchedCoupon.minOrderAmount || 0) - cartTotal;
            if (showNotification) {
                showNotification(`Add ₹${needed} more to your cart to use this coupon.`, "error");
            }
            setApplyingCode(false);
            return;
        }

        onApplyCoupon(matchedCoupon);
        setApplyingCode(false);
        onClose();
    };

    const handleSelectCoupon = (coupon) => {
        if (cartTotal < (coupon.minOrderAmount || 0)) {
            const needed = (coupon.minOrderAmount || 0) - cartTotal;
            if (showNotification) {
                showNotification(`Add ₹${needed} more to your cart to unlock ${coupon.couponName}.`, "error");
            }
            return;
        }

        onApplyCoupon(coupon);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in antialiased select-none text-slate-800">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left flex flex-col justify-between">

                {/* Modal Header */}
                <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
                                <Tag size={20} />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Apply Promo Coupon</h3>
                                <p className="text-xs text-slate-400 font-semibold mt-0.5">Select a coupon ticket or enter a code</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={fetchCouponsList}
                                disabled={loading}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
                                title="Refresh coupons"
                            >
                                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Manual Code Input Form */}
                    <form onSubmit={handleApplyManualCode} className="mb-6">
                        <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:border-[#3d3f96] focus-within:bg-white transition-all">
                            <Tag size={16} className="text-slate-400 ml-3 shrink-0" />
                            <input
                                type="text"
                                placeholder="ENTER COUPON CODE..."
                                value={manualCode}
                                onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                                className="w-full bg-transparent px-3 py-2 text-xs font-black uppercase text-slate-800 placeholder-slate-400 outline-none font-mono tracking-wider"
                            />
                            <button
                                type="submit"
                                disabled={!manualCode.trim() || applyingCode}
                                className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-[11px] font-bold uppercase rounded-xl transition cursor-pointer disabled:opacity-40 shrink-0"
                            >
                                {applyingCode ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                            </button>
                        </div>
                    </form>

                    {/* Active Coupons List */}
                    {loading ? (
                        <div className="py-16 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading active offers...</p>
                        </div>
                    ) : coupons.length === 0 ? (
                        <div className="py-12 text-center text-slate-400 text-xs font-semibold space-y-2">
                            <Tag size={32} className="mx-auto text-slate-300 mb-2" />
                            <p className="font-bold text-slate-700">No promo coupons available right now.</p>
                            <p className="text-xs text-slate-400">Check back later for seasonal discounts and offers.</p>
                        </div>
                    ) : (
                        <div className="space-y-3.5 max-h-[46vh] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                            {coupons.map((coupon) => {
                                const isApplied = appliedCoupon?._id === coupon._id;
                                const isEligible = cartTotal >= (coupon.minOrderAmount || 0);
                                const savings = Math.min(
                                    (cartTotal * (coupon.discountPercentage || 0)) / 100,
                                    coupon.maxDiscount || Infinity
                                );

                                return (
                                    <div
                                        key={coupon._id}
                                        className={`rounded-2xl border transition-all overflow-hidden flex flex-col justify-between ${isApplied
                                            ? 'border-[#3d3f96] bg-indigo-50/20 ring-2 ring-[#3d3f96]/20'
                                            : isEligible
                                                ? 'border-slate-200 bg-white hover:border-[#3d3f96]/40 hover:shadow-sm'
                                                : 'border-slate-200/70 bg-slate-50/60 opacity-75'
                                            }`}
                                    >
                                        <div className="p-4 sm:p-5 flex items-start justify-between gap-3">
                                            <div className="space-y-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-mono text-sm font-black text-slate-900 tracking-wider bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                                                        {coupon.couponName}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                                                        {coupon.discountPercentage}% Off
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-600 font-semibold pt-1">
                                                    Save up to <strong className="font-mono text-slate-800 font-bold">₹{coupon.maxDiscount}</strong> on orders above ₹{coupon.minOrderAmount || 0}
                                                </p>
                                            </div>

                                            <div className="shrink-0">
                                                {isApplied ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => onRemoveCoupon && onRemoveCoupon()}
                                                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        disabled={!isEligible}
                                                        onClick={() => handleSelectCoupon(coupon)}
                                                        className={`px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer ${isEligible
                                                            ? 'bg-[#3d3f96] hover:bg-[#2d2f75] text-white shadow-sm'
                                                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                                            }`}
                                                    >
                                                        Apply
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="px-4 sm:px-5 py-2.5 bg-slate-50 border-t border-dashed border-slate-200 flex flex-wrap items-center justify-between text-[10px] font-bold text-slate-400 gap-2">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={11} /> Valid till {formatExpiryDate(coupon.expiryDate)}
                                            </span>

                                            {!isEligible && (
                                                <span className="text-amber-600 font-extrabold">
                                                    Add ₹{(coupon.minOrderAmount || 0) - cartTotal} more to unlock
                                                </span>
                                            )}

                                            {isEligible && !isApplied && savings > 0 && (
                                                <span className="text-emerald-600 font-extrabold">
                                                    Saves ₹{Math.round(savings)} on this order
                                                </span>
                                            )}
                                        </div>

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs uppercase tracking-wider transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>

            </div>
        </div>
    );
}