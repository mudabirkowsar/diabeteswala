"use client";

import React, { useState } from 'react';
import {
    MapPin,
    Edit3,
    Percent,
    TicketCheck,
    ReceiptText,
    Loader2,
    Calendar,
    Lock,
    AlertCircle,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';

export default function BillSummaryAndCheckout({
    selectedAddress,
    onOpenAddressModal,
    planPrice,
    billSummary,
    calculatedDates,
    calculatingBill,
    appliedCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    isAvailable,
    subscribing,
    onSubscribeAndPay,
    confirmedOrder,
    onViewOrderConfirmation
}) {
    const [couponInput, setCouponInput] = useState('');

    const handleApply = () => {
        if (!couponInput.trim()) return;
        onApplyCoupon(couponInput.trim().toUpperCase());
    };

    return (
        <div className="space-y-6 pt-2 border-t border-slate-100 text-left">

            {/* Delivery Address Card */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                        Delivery Address
                    </span>
                    <button
                        type="button"
                        onClick={onOpenAddressModal}
                        className="text-[11px] font-black text-[#3d3f96] hover:text-[#2F3175] flex items-center gap-1 cursor-pointer"
                    >
                        <Edit3 size={12} />
                        {selectedAddress ? "Change Address" : "Select Address"}
                    </button>
                </div>

                <div
                    onClick={onOpenAddressModal}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        selectedAddress ? 'bg-slate-50/70 border-slate-200 hover:border-indigo-200' : 'bg-amber-50/50 border-amber-200'
                    }`}
                >
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 text-[#3d3f96]">
                        <MapPin size={17} />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                        {selectedAddress ? (
                            <>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                                        {selectedAddress.addressType || "Address"}
                                    </span>
                                    <strong className="text-xs font-black text-slate-800 truncate">{selectedAddress.name}</strong>
                                    <span className="text-[11px] text-slate-400 font-bold">• {selectedAddress.phone}</span>
                                </div>
                                <p className="text-xs text-slate-600 font-medium leading-snug pt-0.5">
                                    {[selectedAddress.houseNo, selectedAddress.sector, selectedAddress.city, selectedAddress.state, selectedAddress.pincode].filter(Boolean).join(', ')}
                                </p>
                            </>
                        ) : (
                            <div className="space-y-0.5">
                                <strong className="text-xs font-black text-amber-800">No Delivery Address Selected</strong>
                                <p className="text-[11px] text-amber-700 font-medium">Click here to choose your saved delivery address.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Promo Coupon */}
            {/* <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                    <Percent size={13} className="text-[#3d3f96]" /> Promo Coupon
                </label>
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="e.g. DIABETESFOOD20"
                        disabled={!!appliedCoupon}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold uppercase text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96]"
                    />
                    {appliedCoupon ? (
                        <button
                            type="button"
                            onClick={() => { onRemoveCoupon(); setCouponInput(''); }}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Remove
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleApply}
                            className="bg-[#3d3f96] hover:bg-[#2F3175] text-white px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                        >
                            Apply
                        </button>
                    )}
                </div>

                {appliedCoupon && (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
                        <TicketCheck size={14} /> Coupon <strong>{appliedCoupon}</strong> is active!
                    </div>
                )}
            </div> */}

            {/* Real-time Bill Breakdown */}
            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
                    <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ReceiptText size={15} className="text-[#3d3f96]" /> Bill Breakdown
                    </span>
                    {calculatingBill && (
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" /> Updating...
                        </span>
                    )}
                </div>

                {calculatedDates && (
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold bg-white p-2 rounded-xl border border-slate-100">
                        <span className="flex items-center gap-1"><Calendar size={12} /> Schedule Duration</span>
                        <span className="font-mono text-slate-700">{calculatedDates.startDate} to {calculatedDates.endDate}</span>
                    </div>
                )}

                <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Meal Package Base Price</span>
                        <span className="font-mono font-bold text-slate-800">₹{billSummary?.itemTotal ?? planPrice}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Packaging Charges</span>
                        <span className="font-mono font-bold text-slate-800">₹{billSummary?.packagingCharge ?? 0}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>Delivery Fee</span>
                        <span className="font-mono font-bold text-slate-800">
                            {billSummary?.deliveryCharge === 0 ? (
                                <span className="text-emerald-600 font-black uppercase text-[10px]">Free</span>
                            ) : (
                                `₹${billSummary?.deliveryCharge || 0}`
                            )}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-medium">
                        <span>GST / Taxes ({billSummary?.taxPercentage || 5}%)</span>
                        <span className="font-mono font-bold text-slate-800">₹{billSummary?.taxAmount ?? 0}</span>
                    </div>

                    {billSummary?.couponDiscount > 0 && (
                        <div className="flex justify-between items-center text-emerald-600 font-bold">
                            <span>Coupon Discount</span>
                            <span className="font-mono">-₹{billSummary.couponDiscount}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-sm">
                        <span className="font-black text-slate-900 uppercase">Total Amount</span>
                        <span className="font-mono font-black text-lg text-slate-900">
                            ₹{billSummary?.totalAmount ?? planPrice}
                        </span>
                    </div>
                </div>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
                {isAvailable ? (
                    <button
                        onClick={onSubscribeAndPay}
                        disabled={subscribing}
                        className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/10 cursor-pointer disabled:opacity-75"
                    >
                        {subscribing ? (
                            <>
                                <Loader2 size={18} className="animate-spin text-white" />
                                <span>Connecting Gateway...</span>
                            </>
                        ) : (
                            <>
                                <Lock size={16} />
                                <span>Pay ₹{billSummary?.totalAmount ?? planPrice} &amp; Start Subscription</span>
                            </>
                        )}
                    </button>
                ) : (
                    <button
                        disabled
                        className="w-full bg-slate-100 text-slate-400 py-4 rounded-2xl font-black text-sm uppercase tracking-wider border border-slate-200/60 flex items-center justify-center gap-2 cursor-not-allowed"
                    >
                        <AlertCircle size={18} />
                        Not Available in Your Area
                    </button>
                )}
            </div>

            {/* Hygiene Banner */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="text-emerald-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-0.5">
                    <span className="text-xs font-black uppercase text-emerald-800 tracking-wide block">Clinical Hygiene Protocols</span>
                    <span className="text-xs text-emerald-700/90 font-medium leading-relaxed block">
                        Prepared fresh in sanitized kitchens, sealed in food-grade boxes, and delivered contactless.
                    </span>
                </div>
            </div>

            {/* Order Confirmed Popup */}
            {confirmedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 sm:p-8 text-center space-y-5">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                            <CheckCircle2 size={36} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">Subscription Confirmed!</h3>
                            <p className="text-xs text-slate-500 font-medium">Your tiffin meal plan has been registered &amp; paid.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-left">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase">Booking ID</span>
                                <span className="font-mono font-black text-slate-800">{confirmedOrder.bookingId}</span>
                            </div>
                            {confirmedOrder.deliveryOTP && (
                                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                                    <span className="font-bold text-slate-400 uppercase">Delivery OTP</span>
                                    <span className="font-mono font-black text-emerald-600 text-sm tracking-wider">{confirmedOrder.deliveryOTP}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onViewOrderConfirmation}
                            className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
                        >
                            View Subscriptions
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}