"use client";

import React, { useState } from 'react';
import {
    X,
    ReceiptText,
    MapPin,
    Clock,
    Utensils,
    Calendar,
    Percent,
    TicketCheck,
    Loader2,
    Lock,
    MessageSquareText,
    CheckCircle2,
    ChevronRight,
    Flame
} from 'lucide-react';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SubscriptionReviewModal({
    isOpen,
    onClose,
    plan,
    isMonthly,
    selectedAddress,
    deliveryTimes,
    customizedSchedule,
    specialInstructions,
    billSummary,
    calculatedDates,
    calculatingBill,
    appliedCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    subscribing,
    onPayNow,
    confirmedOrder,
    onViewOrderConfirmation
}) {
    const [couponInput, setCouponInput] = useState('');
    const [activeTabWeek, setActiveTabWeek] = useState(1);

    if (!isOpen) return null;

    // Helper to find meal details from plan data
    const getDishDetails = (slotKey, dishId) => {
        const dishes = plan?.slotDishes?.[slotKey] || [];
        const found = dishes.find(
            (d) => (d.itemId?._id || d._id) === dishId
        );
        return found?.itemId || found || null;
    };

    const handleApply = () => {
        if (!couponInput.trim()) return;
        onApplyCoupon(couponInput.trim().toUpperCase());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            
            {/* Modal Container */}
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
                
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                            <ReceiptText size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                                Review Subscription &amp; Payment
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Check your chosen meal configuration before checkout
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700">

                    {/* Section 1: Plan & Duration Details */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-[#3d3f96] tracking-wider">
                                {plan?.planCycle || "Monthly Plan"}
                            </span>
                            <h4 className="text-sm font-black text-slate-900">{plan?.name}</h4>
                            <p className="text-[11px] text-slate-500 font-medium">{plan?.mealsPerDay || 1} Meal(s) / Day</p>
                        </div>

                        {calculatedDates && (
                            <div className="bg-white px-3 py-2 rounded-xl border border-indigo-100/80 text-right space-y-0.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 sm:justify-end">
                                    <Calendar size={11} className="text-[#3d3f96]" /> Subscription Period
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-800 block">
                                    {calculatedDates.startDate} to {calculatedDates.endDate}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Section 2: Delivery Address & Universal Slot Timings */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Address */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                <MapPin size={12} className="text-[#3d3f96]" /> Delivery Address
                            </span>
                            {selectedAddress ? (
                                <div>
                                    <strong className="text-xs font-black text-slate-800 block">
                                        {selectedAddress.name} ({selectedAddress.addressType || "Address"})
                                    </strong>
                                    <p className="text-[11px] text-slate-600 font-medium leading-snug">
                                        {[selectedAddress.houseNo, selectedAddress.sector, selectedAddress.city, selectedAddress.pincode].filter(Boolean).join(', ')}
                                    </p>
                                    <span className="text-[10px] text-slate-500 font-bold block pt-0.5">+91 {selectedAddress.phone}</span>
                                </div>
                            ) : (
                                <p className="text-xs text-rose-500 font-bold">No address selected</p>
                            )}
                        </div>

                        {/* Slot Timings */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1">
                                <Clock size={12} className="text-[#3d3f96]" /> Daily Delivery Timings
                            </span>
                            <div className="space-y-1">
                                {plan?.permittedSlots?.map((slot) => {
                                    const key = slot.toLowerCase();
                                    return (
                                        <div key={slot} className="flex justify-between items-center text-[11px]">
                                            <span className="font-bold text-slate-600">{slot}:</span>
                                            <span className="font-mono font-black text-[#3d3f96]">{deliveryTimes[key] || "—"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Chosen Daily Dishes Breakdown */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                Configured Meals by Day
                            </span>

                            {/* Week tabs for monthly plan */}
                            {isMonthly && (
                                <div className="flex items-center gap-1">
                                    {[1, 2, 3, 4].map((w) => (
                                        <button
                                            key={w}
                                            type="button"
                                            onClick={() => setActiveTabWeek(w)}
                                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition-colors ${
                                                activeTabWeek === w
                                                    ? 'bg-[#3d3f96] text-white'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                        >
                                            W{w}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 border border-slate-100 rounded-2xl p-3 bg-slate-50/40 max-h-56 overflow-y-auto">
                            {DAYS_OF_WEEK.map((day) => {
                                const daySchedule = customizedSchedule[activeTabWeek]?.[day] || {};
                                return (
                                    <div key={day} className="bg-white p-2.5 rounded-xl border border-slate-100 space-y-1">
                                        <span className="text-[10px] font-black uppercase text-slate-800 flex items-center gap-1">
                                            <ChevronRight size={11} className="text-[#3d3f96]" /> {day}
                                        </span>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-0.5">
                                            {plan?.permittedSlots?.map((slot) => {
                                                const slotKey = slot.toLowerCase();
                                                const dishId = daySchedule[slotKey];
                                                const dish = getDishDetails(slotKey, dishId);

                                                return (
                                                    <div key={slot} className="bg-slate-50/80 p-2 rounded-lg border border-slate-100 space-y-0.5">
                                                        <span className="text-[9px] font-black uppercase text-[#3d3f96] block">{slot}</span>
                                                        <strong className="text-[11px] font-black text-slate-800 truncate block">
                                                            {dish?.name || "No dish chosen"}
                                                        </strong>
                                                        {dish?.calories && (
                                                            <span className="text-[9px] font-mono text-slate-400 flex items-center gap-0.5">
                                                                <Flame size={9} className="text-amber-500" /> {dish.calories} Kcal
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Section 4: Special Instructions (if added) */}
                    {specialInstructions && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                <MessageSquareText size={12} className="text-[#3d3f96]" /> Kitchen Notes
                            </span>
                            <p className="text-xs text-slate-700 font-medium italic">
                                &ldquo;{specialInstructions}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Section 5: Promo Coupon */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <Percent size={13} className="text-[#3d3f96]" /> Apply Promo Coupon
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
                                <TicketCheck size={14} /> Coupon <strong>{appliedCoupon}</strong> applied!
                            </div>
                        )}
                    </div>

                    {/* Section 6: Bill Breakdown Summary */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Payment Breakdown</span>
                            {calculatingBill && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Recalculating...
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Meal Base Total</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary?.itemTotal ?? plan?.price}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Packaging Fee</span>
                                <span className="font-mono font-bold text-slate-800">₹{billSummary?.packagingCharge ?? 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Delivery Fee</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {billSummary?.deliveryCharge === 0 ? <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span> : `₹${billSummary?.deliveryCharge || 0}`}
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

                            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-sm">
                                <span className="font-black text-slate-900 uppercase">Total Payable</span>
                                <span className="font-mono font-black text-lg text-slate-900">
                                    ₹{billSummary?.totalAmount ?? plan?.price}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer / Pay Action */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3.5 px-5 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors uppercase cursor-pointer"
                    >
                        Modify Choices
                    </button>

                    <button
                        type="button"
                        onClick={onPayNow}
                        disabled={subscribing}
                        className="flex-1 py-3.5 px-5 rounded-2xl bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-black shadow-lg shadow-indigo-950/10 transition-all uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                        {subscribing ? (
                            <>
                                <Loader2 size={16} className="animate-spin text-white" />
                                <span>Processing Gateway...</span>
                            </>
                        ) : (
                            <>
                                <Lock size={15} />
                                <span>Pay ₹{billSummary?.totalAmount ?? plan?.price} &amp; Activate</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Confirmed Order Success Card (Overlaid upon successful payment verification) */}
            {confirmedOrder && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
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
                            View Active Subscriptions
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}