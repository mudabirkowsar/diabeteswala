"use client";

import React from 'react';
import {
  ArrowRight,
  Loader2,
  MapPin,
  Zap,
  CreditCard,
  Banknote,
  AlertCircle
} from 'lucide-react';

export default function CostSummaryCard({
  billSummary = null,
  orderRestrictions = { isCodAvailable: true, isRapidAvailable: true },
  distanceText = "Calculating...",
  appliedLocation = null,
  isRapid = false,
  onToggleRapid,
  paymentMethod = 'Online',
  onChangePaymentMethod,
  onProceedCheckout,
  checkingOut = false,
  calculating = false,
  fallbackSubtotal = 0,
  accessoriesTotal = 0
}) {
  const itemTotal = billSummary?.itemTotal ?? fallbackSubtotal;
  const deliveryCharge = billSummary?.deliveryCharge ?? 0;
  const packagingCharge = billSummary?.packagingCharge ?? 0;
  const taxAmount = billSummary?.taxAmount ?? 0;
  const taxPercentage = billSummary?.taxPercentage || 5;
  const couponDiscount = billSummary?.couponDiscount ?? 0;
  const rapidCharge = billSummary?.rapidCharge || billSummary?.fastDeliveryCharge || 0;

  // Single Source of Truth: Use exact totalAmount from backend billSummary
  const totalAmount = billSummary?.totalAmount ?? Math.max(
    0,
    itemTotal + deliveryCharge + packagingCharge + rapidCharge + taxAmount - couponDiscount + accessoriesTotal
  );

  const isCodAllowed = orderRestrictions?.isCodAvailable !== false;
  const isRapidAllowed = orderRestrictions?.isRapidAvailable !== false;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 text-left">
      
      {/* 1. Rapid Express Delivery Option */}
      {isRapidAllowed ? (
        <div 
          onClick={onToggleRapid}
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
            isRapid 
              ? 'bg-amber-50/80 border-amber-200 ring-2 ring-amber-500/20 shadow-sm' 
              : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isRapid ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
              <Zap size={15} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-xs font-black text-slate-800">Rapid Express Dispatch</h4>
                <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-100/60 px-1.5 py-0.2 rounded">Fast</span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold">Priority 25-30 min door delivery</p>
            </div>
          </div>
          <input 
            type="checkbox" 
            checked={isRapid} 
            onChange={() => {}} 
            className="accent-amber-500 w-4 h-4 cursor-pointer" 
          />
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-slate-400 text-xs font-medium">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-slate-300" />
            <span className="text-[11px]">Express delivery unavailable for this kitchen</span>
          </div>
          <span className="text-[10px] font-bold uppercase">Standard Only</span>
        </div>
      )}

      {/* 2. Payment Method Selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
          Select Payment Method
        </span>
        
        <div className={`grid ${isCodAllowed ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
          <button
            type="button"
            onClick={() => onChangePaymentMethod('Online')}
            className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
              paymentMethod === 'Online'
                ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm'
                : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
            }`}
          >
            <CreditCard size={14} />
            <span>Online / UPI / Card</span>
          </button>
          
          {isCodAllowed && (
            <button
              type="button"
              onClick={() => onChangePaymentMethod('COD')}
              className={`p-3 rounded-2xl border flex items-center justify-center gap-2 text-xs font-bold transition cursor-pointer ${
                paymentMethod === 'COD'
                  ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm'
                  : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
              }`}
            >
              <Banknote size={14} />
              <span>Cash on Delivery</span>
            </button>
          )}
        </div>

        {!isCodAllowed && (
          <p className="text-[10px] text-amber-600 font-semibold flex items-center gap-1 pt-0.5">
            <AlertCircle size={11} /> COD is disabled by kitchen. Prepaid orders accepted.
          </p>
        )}
      </div>

      {/* 3. Real-time Backend Calculated Bill Breakdown */}
      <div className="space-y-3 text-xs font-bold text-slate-600 border-t border-b border-slate-50 py-4">
        
        {/* Distance & Location */}
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> Distance ({appliedLocation?.city || "Local"})
          </span>
          <span className="font-mono text-slate-700 font-bold">{distanceText}</span>
        </div>

        {/* Items Base Total */}
        <div className="flex items-center justify-between">
          <span>Items Base Total</span>
          <span className="font-mono text-slate-800 text-sm">₹{itemTotal}</span>
        </div>

        {/* Add-ons line item (if selected) */}
        {accessoriesTotal > 0 && (
          <div className="flex items-center justify-between text-[#3d3f96]">
            <span>Dining Add-ons & Cutlery</span>
            <span className="font-mono font-bold text-sm">+₹{accessoriesTotal}</span>
          </div>
        )}

        {/* Packaging Fee */}
        <div className="flex items-center justify-between">
          <span>Eco Packaging & Container Fee</span>
          {packagingCharge === 0 ? (
            <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Free</span>
          ) : (
            <span className="font-mono text-slate-800">₹{packagingCharge}</span>
          )}
        </div>

        {/* Delivery Charge */}
        <div className="flex items-center justify-between">
          <span>Delivery Partner Fee</span>
          {deliveryCharge === 0 ? (
            <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Free Delivery</span>
          ) : (
            <span className="font-mono text-slate-800">₹{deliveryCharge}</span>
          )}
        </div>

        {/* Express Rapid Surcharge (if applied by server) */}
        {isRapid && rapidCharge > 0 && (
          <div className="flex items-center justify-between text-amber-700">
            <span>Express Rapid Surcharge</span>
            <span className="font-mono font-bold">+₹{rapidCharge}</span>
          </div>
        )}

        {/* Coupon Discount */}
        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Promo Coupon Discount</span>
            <span className="font-mono font-black text-sm">-₹{couponDiscount}</span>
          </div>
        )}

        {/* GST Taxes */}
        <div className="flex items-center justify-between">
          <span>GST Taxes ({taxPercentage}%)</span>
          <span className="font-mono text-slate-800">₹{taxAmount}</span>
        </div>
      </div>

      {/* 4. Total Payable & Checkout Button (Synchronized with Backend & Razorpay) */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Total Amount</span>
          <strong className="text-2xl font-black text-slate-900 font-mono tracking-tight block mt-1">
            ₹{totalAmount}
          </strong>
        </div>

        <button
          type="button"
          onClick={onProceedCheckout}
          disabled={checkingOut || calculating}
          className="bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-bold px-6 py-4 rounded-2xl shadow-lg shadow-indigo-950/15 cursor-pointer flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-70"
        >
          {checkingOut || calculating ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{paymentMethod === 'COD' ? `Place COD Order (₹${totalAmount})` : `Pay & Confirm (₹${totalAmount})`}</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}