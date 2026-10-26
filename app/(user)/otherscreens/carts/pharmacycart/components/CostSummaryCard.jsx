// components/CostSummaryCard.jsx
"use client";
import React from 'react';
import { CreditCard, Loader2, ShieldCheck, Truck, ChevronRight } from 'lucide-react';

export default function CostSummaryCard({
  billSummary,
  orderRestrictions,
  deliveryMode,
  paymentMethod,
  onChangePaymentMethod,
  onProceedCheckout,
  checkingOut,
  calculating,
  fallbackSubtotal
}) {
  const isCodAvailable = orderRestrictions?.isCodAvailable !== false;
  const itemTotal = billSummary?.itemTotal ?? fallbackSubtotal;
  const couponDiscount = billSummary?.couponDiscount ?? 0;
  const deliveryCharge = billSummary?.deliveryCharge ?? (deliveryMode === 'rapid' ? 0 : 40);
  const rapidDeliveryCharge = billSummary?.rapidDeliveryCharge ?? (deliveryMode === 'rapid' ? 69 : 0);
  const slotCharge = billSummary?.slotCharge ?? 0;
  const finalTotal = billSummary?.totalAmount ?? Math.max(0, itemTotal - couponDiscount + deliveryCharge + rapidDeliveryCharge + slotCharge);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-6 border border-slate-100 shadow-xl shadow-indigo-100/40 space-y-4 text-left">
      <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-slate-100">
        <h2 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
          Payment Breakdown
        </h2>
        <CreditCard size={16} className="text-slate-400" />
      </div>

      {calculating && (
        <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1.5">
          <Loader2 size={11} className="animate-spin" /> Live calculation in progress...
        </div>
      )}

      {/* Bill Breakdown rows */}
      <div className="space-y-2 text-[11px] sm:text-xs font-bold text-slate-600">
        <div className="flex justify-between">
          <span>Items Subtotal</span>
          <span className="text-slate-900 font-black">₹{itemTotal}</span>
        </div>

        {couponDiscount > 0 && (
          <div className="flex justify-between text-emerald-600">
            <span>Coupon Discount</span>
            <span className="font-black">-₹{couponDiscount}</span>
          </div>
        )}

        {deliveryMode === 'rapid' ? (
          <div className="flex justify-between">
            <span>Express Rapid Charge</span>
            <span className="text-slate-900 font-black">₹{rapidDeliveryCharge}</span>
          </div>
        ) : (
          <div className="flex justify-between">
            <span>Standard Shipping</span>
            <span className={deliveryCharge === 0 ? "text-emerald-600 font-black" : "text-slate-900 font-black"}>
              {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
            </span>
          </div>
        )}

        {deliveryMode === 'slot' && slotCharge > 0 && (
          <div className="flex justify-between">
            <span>Slot Convenience Fee</span>
            <span className="text-slate-900 font-black">₹{slotCharge}</span>
          </div>
        )}

        <div className="pt-2.5 border-t border-slate-100 flex justify-between items-baseline">
          <div>
            <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
              Total Payable
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">Inclusive of all duties & taxes</span>
          </div>
          <span className="text-xl sm:text-2xl font-black text-[#3d3f96]">
            ₹{finalTotal}
          </span>
        </div>
      </div>

      {/* Payment Mode Selector */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400 block">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!isCodAvailable}
            onClick={() => onChangePaymentMethod('COD')}
            className={`py-2.5 px-2 rounded-xl sm:rounded-2xl border text-center transition-all text-[11px] sm:text-xs font-black cursor-pointer ${
              !isCodAvailable
                ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
                : paymentMethod === 'COD'
                ? 'border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cash on Delivery
          </button>
          <button
            type="button"
            onClick={() => onChangePaymentMethod('Online')}
            className={`py-2.5 px-2 rounded-xl sm:rounded-2xl border text-center transition-all text-[11px] sm:text-xs font-black cursor-pointer ${
              paymentMethod === 'Online'
                ? 'border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs'
                : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Online Payment
          </button>
        </div>
      </div>

      {/* Place Order Button */}
      <button
        type="button"
        disabled={checkingOut || calculating}
        onClick={onProceedCheckout}
        className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
      >
        {checkingOut ? (
          <>
            <Loader2 size={15} className="animate-spin" />
            <span>PROCESSING ORDER...</span>
          </>
        ) : (
          <>
            <span>PLACE ORDER (₹{finalTotal})</span>
            <ChevronRight size={16} />
          </>
        )}
      </button>

      {/* Trust Badges */}
      <div className="pt-2 border-t border-slate-50 space-y-1 text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-emerald-500 shrink-0" />
          <span>Encrypted Gateway & Verified Drugs</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Truck size={13} className="text-blue-500 shrink-0" />
          <span>Cold-Chain Maintained Delivery</span>
        </div>
      </div>
    </div>
  );
}