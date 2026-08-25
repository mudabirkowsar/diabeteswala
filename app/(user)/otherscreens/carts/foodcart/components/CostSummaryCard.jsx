"use client";

import React from 'react';
import { ArrowRight, Loader2, MapPin, Zap, CreditCard, Banknote } from 'lucide-react';

export default function CostSummaryCard({
  billSummary = null,
  distanceText = "Calculating...",
  isRapid = false,
  onToggleRapid,
  paymentMethod = 'Online',
  onChangePaymentMethod,
  onProceedCheckout,
  checkingOut = false,
  calculating = false
}) {
  const itemTotal = billSummary?.itemTotal || 0;
  const deliveryCharge = billSummary?.deliveryCharge ?? 0;
  const taxAmount = billSummary?.taxAmount || 0;
  const couponDiscount = billSummary?.couponDiscount || 0;
  const totalAmount = billSummary?.totalAmount || itemTotal;

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 text-left">
      
      {/* Express / Rapid Delivery Surcharge Toggle */}
      <div 
        onClick={onToggleRapid}
        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between select-none ${
          isRapid 
            ? 'bg-amber-50/70 border-amber-200 ring-2 ring-amber-500/20' 
            : 'bg-slate-50/70 border-slate-100 hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${isRapid ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
            <Zap size={14} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800">Rapid Express Dispatch</h4>
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

      {/* Payment Method Selector (Online vs COD) */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
          Select Payment Method
        </span>
        <div className="grid grid-cols-2 gap-2">
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
            <span>Online / UPI</span>
          </button>
          
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
        </div>
      </div>

      {/* Real-time Bill Breakdown Sheet */}
      <div className="space-y-3 text-xs font-bold text-slate-600 border-t border-b border-slate-50 py-4">
        
        {/* Distance Indicator */}
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin size={11} /> Delivery Distance
          </span>
          <span className="font-mono text-slate-600">{distanceText}</span>
        </div>

        <div className="flex items-center justify-between">
          <span>Items Subtotal</span>
          <span className="font-mono text-slate-800 text-sm">₹{itemTotal}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span>Coupon Discount</span>
            <span className="font-mono font-black text-sm">-₹{couponDiscount}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span>Delivery Charge</span>
          {deliveryCharge === 0 ? (
            <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md uppercase">Free</span>
          ) : (
            <span className="font-mono text-slate-800">₹{deliveryCharge}</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span>GST Tax (5%)</span>
          <span className="font-mono text-slate-800">₹{taxAmount}</span>
        </div>
      </div>

      {/* Total & Checkout Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Total Payable</span>
          <strong className="text-2xl font-black text-slate-900 font-mono tracking-tight block mt-1">
            ₹{totalAmount}
          </strong>
        </div>

        <button
          type="button"
          onClick={onProceedCheckout}
          disabled={checkingOut || calculating}
          className="bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-bold px-6 py-4 rounded-xl shadow-md shadow-indigo-950/10 cursor-pointer flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-70"
        >
          {checkingOut || calculating ? <Loader2 size={14} className="animate-spin" /> : null}
          <span>{paymentMethod === 'COD' ? 'Place COD Order' : 'Pay & Confirm'}</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
}