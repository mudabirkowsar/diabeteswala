"use client";

import React from 'react';
import { ArrowRight, Loader2, Tag, Percent, X } from 'lucide-react';

export default function CostSummaryCard({
  total = 0,
  discountAmount = 0,
  finalTotal = 0,
  appliedCoupon = null,
  onOpenCouponModal,
  onRemoveCoupon,
  onProceedCheckout,
  checkingOut = false
}) {
  return (
    <div className="space-y-4 text-left">
      
      {/* --- COUPONS / PROMO BAR CARD --- */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Tag size={12} className="text-[#3d3f96]" /> Offers & Promotions
          </span>
          <button
            type="button"
            onClick={onOpenCouponModal}
            className="text-xs font-extrabold text-[#3d3f96] hover:text-[#2d2f75] uppercase tracking-wider transition cursor-pointer"
          >
            {appliedCoupon ? "Change" : "View Offers"}
          </button>
        </div>

        {appliedCoupon ? (
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Percent size={13} strokeWidth={3} />
              </span>
              <div className="min-w-0">
                <p className="text-xs font-black text-emerald-900 font-mono tracking-wider truncate">
                  {appliedCoupon.couponName}
                </p>
                <p className="text-[10px] font-bold text-emerald-700">
                  ₹{discountAmount} savings applied to cart
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onRemoveCoupon}
              className="p-1.5 text-slate-400 hover:text-rose-600 transition cursor-pointer"
              title="Remove coupon"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <div
            onClick={onOpenCouponModal}
            className="p-3 bg-slate-50 hover:bg-indigo-50/20 border border-dashed border-slate-200 hover:border-[#3d3f96] rounded-2xl flex items-center justify-between cursor-pointer transition"
          >
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-[#3d3f96]" />
              <span className="text-xs font-bold text-slate-700">Apply Food Promo Coupon</span>
            </div>
            <span className="text-xs font-extrabold text-[#3d3f96]">Apply</span>
          </div>
        )}
      </div>

      {/* --- PAYMENT COST SUMMARY SHEET --- */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
          Payment Cost Summary
        </span>

        <div className="space-y-3 text-xs font-bold text-slate-600 border-b border-slate-50 pb-4">
          <div className="flex items-center justify-between">
            <span>Subtotal price</span>
            <span className="font-mono text-slate-800 text-sm">₹{total}</span>
          </div>

          {appliedCoupon && discountAmount > 0 && (
            <div className="flex items-center justify-between text-emerald-600">
              <span className="flex items-center gap-1">
                Coupon Discount ({appliedCoupon.couponName})
              </span>
              <span className="font-mono font-black text-sm">-₹{discountAmount}</span>
            </div>
          )}

          <div className="flex items-center justify-between">
            <span>Eco Packaging charges</span>
            <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Free</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Clinical Dietitian fee</span>
            <span className="text-emerald-600 font-extrabold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Free</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-400 block leading-none">Total Payable</span>
            <strong className="text-2xl font-black text-slate-900 font-mono tracking-tight block mt-1">₹{finalTotal}</strong>
          </div>

          <button
            type="button"
            onClick={onProceedCheckout}
            disabled={checkingOut}
            className="bg-[#3d3f96] hover:bg-[#2F3175] text-white text-xs font-bold px-6 py-4 rounded-xl shadow-md shadow-indigo-950/10 cursor-pointer flex items-center gap-2 transition active:scale-[0.98] disabled:opacity-70"
          >
            {checkingOut ? <Loader2 size={14} className="animate-spin" /> : null}
            <span>Proceed to Checkout</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}