"use client";

import React, { useState } from 'react';
import {
    X,
    ReceiptText,
    MapPin,
    Calendar,
    Percent,
    TicketCheck,
    Loader2,
    Lock,
    MessageSquareText,
    CheckCircle2,
    CreditCard,
    Banknote,
    Sparkles,
    Clock
} from 'lucide-react';

export default function CustomTiffinReviewModal({
    isOpen,
    onClose,
    packageDays,
    startDate,
    dietaryType,
    spiceLevel,
    clinicalNotes,
    selectedAddress,
    calculatedData,
    calculatingBill,
    appliedCoupon,
    onApplyCoupon,
    onRemoveCoupon,
    paymentMethod,
    setPaymentMethod,
    subscribing,
    onConfirmOrder,
    confirmedOrder,
    onViewOrderDetails,
    dailySchedule,
    getDayOfWeekName,
    loaderData
}) {
    const [couponInput, setCouponInput] = useState('');
    const [reviewDayNum, setReviewDayNum] = useState(1);

    if (!isOpen) return null;

    const pricing = calculatedData?.pricing || calculatedData?.billSummary || {};
    const assignedVendor = calculatedData?.assignedVendor;
    const universalDeliveryTimes = calculatedData?.universalDeliveryTimes || {};
    const isCodAvailable = calculatedData?.orderRestrictions?.isCodAvailable ?? false;

    const handleApply = () => {
        if (!couponInput.trim()) return;
        onApplyCoupon(couponInput.trim().toUpperCase());
    };

    const getDishObj = (slotKey, dishId) => {
        const list = loaderData?.[slotKey]?.foodList || [];
        return list.find((d) => (d.id || d._id) === dishId);
    };

    const daysArray = Array.from({ length: packageDays }, (_, i) => i + 1);
    const activeDaySchedule = dailySchedule[reviewDayNum] || {};

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] border border-slate-100 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-left">
                
                {/* Header */}
                <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#3d3f96]">
                            <ReceiptText size={17} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                                Review Custom Tiffin Plan
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                                Final breakdown &amp; checkout for {packageDays}-Day Package
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

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">

                    {/* Vendor & Duration Card */}
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black uppercase text-[#3d3f96] tracking-wider">
                                {packageDays}-Day Custom Clinical Tiffin
                            </span>
                            <h4 className="text-sm font-black text-slate-900">
                                {assignedVendor?.name || "Nearest Cloud Kitchen"}
                            </h4>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Proximity: {calculatedData?.distance || "Within 10 km"} • Dietary: {dietaryType.toUpperCase()} ({spiceLevel})
                            </p>
                        </div>

                        {calculatedData?.dates && (
                            <div className="bg-white px-3 py-2 rounded-xl border border-indigo-100 text-right space-y-0.5">
                                <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1 sm:justify-end">
                                    <Calendar size={11} className="text-[#3d3f96]" /> Schedule Duration
                                </span>
                                <span className="font-mono text-xs font-bold text-slate-800 block">
                                    {calculatedData.dates.startDate} to {calculatedData.dates.endDate}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Universal Delivery Times */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1.5">
                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                            <Clock size={12} className="text-[#3d3f96]" /> Daily Delivery Timings
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                            {universalDeliveryTimes.breakfastTime && (
                                <div className="bg-white p-2 rounded-xl border border-slate-100">
                                    <span className="text-[9px] text-slate-400 uppercase font-black block">Breakfast</span>
                                    <span className="font-mono font-bold text-slate-800">{universalDeliveryTimes.breakfastTime}</span>
                                </div>
                            )}
                            {universalDeliveryTimes.lunchTime && (
                                <div className="bg-white p-2 rounded-xl border border-slate-100">
                                    <span className="text-[9px] text-slate-400 uppercase font-black block">Lunch</span>
                                    <span className="font-mono font-bold text-slate-800">{universalDeliveryTimes.lunchTime}</span>
                                </div>
                            )}
                            {universalDeliveryTimes.dinnerTime && (
                                <div className="bg-white p-2 rounded-xl border border-slate-100">
                                    <span className="text-[9px] text-slate-400 uppercase font-black block">Dinner</span>
                                    <span className="font-mono font-bold text-slate-800">{universalDeliveryTimes.dinnerTime}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Day-by-Day Customized Dishes Breakdown */}
                    <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                Daily Configured Meals Breakdown
                            </span>
                        </div>

                        {/* Day Pills Carousel */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                            {daysArray.map((dayNum) => (
                                <button
                                    key={dayNum}
                                    type="button"
                                    onClick={() => setReviewDayNum(dayNum)}
                                    className={`px-3 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition-all cursor-pointer ${
                                        reviewDayNum === dayNum
                                            ? 'bg-[#3d3f96] text-white shadow-xs'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    Day {dayNum} ({getDayOfWeekName(dayNum).slice(0, 3)})
                                </button>
                            ))}
                        </div>

                        {/* Dishes for selected day in review */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                            {['breakfast', 'lunch', 'dinner'].map((slotKey) => {
                                const dishId = activeDaySchedule[slotKey];
                                const dish = getDishObj(slotKey, dishId);
                                if (!dish) return null;

                                return (
                                    <div key={slotKey} className="bg-white p-3 rounded-xl border border-slate-100 space-y-1">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[9px] font-black uppercase text-[#3d3f96]">{slotKey}</span>
                                            <span className="text-[10px] font-bold text-slate-400 font-mono">₹{dish.price}</span>
                                        </div>
                                        <strong className="text-xs font-black text-slate-800 block truncate" title={dish.name}>
                                            {dish.name}
                                        </strong>
                                        <span className="text-[10px] font-mono text-slate-400 font-bold block">
                                            {dish.cal || dish.calories || 0} Cal • {dish.dietType || "Veg"}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Clinical Notes */}
                    {clinicalNotes && (
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                            <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                                <MessageSquareText size={12} className="text-[#3d3f96]" /> Kitchen Instructions
                            </span>
                            <p className="text-xs text-slate-700 font-medium italic">
                                &ldquo;{clinicalNotes}&rdquo;
                            </p>
                        </div>
                    )}

                    {/* Delivery Address */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-1">
                        <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1">
                            <MapPin size={12} className="text-[#3d3f96]" /> Delivery Destination
                        </span>
                        {selectedAddress ? (
                            <p className="text-xs text-slate-700 font-medium leading-relaxed">
                                <strong className="font-bold text-slate-900">{selectedAddress.name} (+91 {selectedAddress.phone})</strong>: {[selectedAddress.houseNo, selectedAddress.sector, selectedAddress.city, selectedAddress.state, selectedAddress.pincode].filter(Boolean).join(', ')}
                            </p>
                        ) : (
                            <p className="text-xs text-rose-500 font-bold">No address selected</p>
                        )}
                    </div>

                    {/* Payment Method Toggle */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Payment Method
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('Online')}
                                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer ${
                                    paymentMethod === 'Online'
                                        ? 'bg-indigo-50/50 border-[#3d3f96] ring-1 ring-[#3d3f96]'
                                        : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <CreditCard size={18} className="text-[#3d3f96]" />
                                <div className="text-left">
                                    <strong className="text-xs font-black text-slate-800 block">Online Payment</strong>
                                    <span className="text-[10px] text-slate-400 font-medium">Instant Razorpay UPI/Card</span>
                                </div>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    if (isCodAvailable) setPaymentMethod('COD');
                                }}
                                disabled={!isCodAvailable}
                                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                                    !isCodAvailable
                                        ? 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
                                        : paymentMethod === 'COD'
                                            ? 'bg-indigo-50/50 border-[#3d3f96] ring-1 ring-[#3d3f96] cursor-pointer'
                                            : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                                }`}
                            >
                                <Banknote size={18} className={isCodAvailable ? "text-emerald-600" : "text-slate-400"} />
                                <div className="text-left">
                                    <strong className="text-xs font-black text-slate-800 block">Cash on Delivery</strong>
                                    <span className="text-[10px] text-slate-400 font-medium">
                                        {isCodAvailable ? "Pay daily at doorstep" : "Disabled by Policy"}
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Promo Coupon */}
                    {/* <div className="space-y-2 pt-2 border-t border-slate-100">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                            <Percent size={13} className="text-[#3d3f96]" /> Apply Coupon
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder="Enter promo code"
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
                                <TicketCheck size={14} /> Coupon <strong>{appliedCoupon}</strong> active!
                            </div>
                        )}
                    </div> */}

                    {/* Bill Breakdown Summary */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-2">
                        <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">Bill Summary</span>
                            {calculatingBill && (
                                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Loader2 size={12} className="animate-spin" /> Recalculating...
                                </span>
                            )}
                        </div>

                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Meal Subtotal ({packageDays} Days)</span>
                                <span className="font-mono font-bold text-slate-800">₹{pricing.itemTotal || pricing.subtotal || 0}</span>
                            </div>

                            {pricing.packageDiscountAmount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 font-bold">
                                    <span>Package Discount ({pricing.discountPercent || 5}%)</span>
                                    <span className="font-mono">-₹{pricing.packageDiscountAmount}</span>
                                </div>
                            )}

                            {pricing.peakOrderCharge > 0 && (
                                <div className="flex justify-between items-center text-amber-700 font-medium">
                                    <span className="flex items-center gap-1">
                                        <Sparkles size={12} /> Peak Surcharges
                                    </span>
                                    <span className="font-mono font-bold">₹{pricing.peakOrderCharge}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Packaging Fee</span>
                                <span className="font-mono font-bold text-slate-800">₹{pricing.packagingCharge || 0}</span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>Delivery Fee</span>
                                <span className="font-mono font-bold text-slate-800">
                                    {pricing.deliveryCharge === 0 ? <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span> : `₹${pricing.deliveryCharge}`}
                                </span>
                            </div>

                            <div className="flex justify-between items-center text-slate-600 font-medium">
                                <span>GST &amp; Taxes ({pricing.taxPercentage || 5}%)</span>
                                <span className="font-mono font-bold text-slate-800">₹{pricing.taxAmount || 0}</span>
                            </div>

                            {pricing.couponDiscount > 0 && (
                                <div className="flex justify-between items-center text-emerald-600 font-bold">
                                    <span>Coupon Discount</span>
                                    <span className="font-mono">-₹{pricing.couponDiscount}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-2.5 border-t border-slate-200 text-sm">
                                <span className="font-black text-slate-900 uppercase">Total Amount</span>
                                <span className="font-mono font-black text-lg text-slate-900">
                                    ₹{pricing.grandTotal || pricing.totalAmount || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer Action Button */}
                <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/60 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="py-3.5 px-5 rounded-2xl border border-slate-200 text-xs font-extrabold text-slate-600 hover:bg-slate-100 transition-colors uppercase cursor-pointer"
                    >
                        Modify
                    </button>

                    <button
                        type="button"
                        onClick={onConfirmOrder}
                        disabled={subscribing}
                        className="flex-1 py-3.5 px-5 rounded-2xl bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-black shadow-lg shadow-indigo-950/10 transition-all uppercase flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                        {subscribing ? (
                            <>
                                <Loader2 size={16} className="animate-spin text-white" />
                                <span>Placing Order...</span>
                            </>
                        ) : paymentMethod === 'Online' ? (
                            <>
                                <Lock size={15} />
                                <span>Pay ₹{pricing.grandTotal || pricing.totalAmount || 0} &amp; Subscribe</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={15} />
                                <span>Confirm COD Custom Tiffin</span>
                            </>
                        )}
                    </button>
                </div>

            </div>

            {/* Confirmed Order Card */}
            {confirmedOrder && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-slate-100 shadow-2xl p-6 sm:p-8 text-center space-y-5">
                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                            <CheckCircle2 size={36} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-xl font-black text-slate-900">Custom Tiffin Booked!</h3>
                            <p className="text-xs text-slate-500 font-medium">Your customized plan has been scheduled.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-left">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-bold text-slate-400 uppercase">Booking ID</span>
                                <span className="font-mono font-black text-slate-800">{confirmedOrder.bookingId}</span>
                            </div>
                            {confirmedOrder.deliveryOTP && (
                                <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                                    <span className="font-bold text-slate-400 uppercase">Daily Delivery OTP</span>
                                    <span className="font-mono font-black text-emerald-600 text-sm tracking-wider">{confirmedOrder.deliveryOTP}</span>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={onViewOrderDetails}
                            className="w-full bg-[#3d3f96] hover:bg-[#2F3175] text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer"
                        >
                            View Active Tiffins
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}