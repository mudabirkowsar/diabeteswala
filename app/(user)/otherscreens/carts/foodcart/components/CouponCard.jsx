"use client";

import React from 'react';
import { Tag, Percent, X, Sparkles } from 'lucide-react';

export default function CouponCard({
  appliedCoupon,
  discountAmount = 0,
  onOpenCouponModal,
  onRemoveCoupon
}) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3 text-left">
      <div className="flex items-center justify-between border-b border-slate-50 pb-2">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
          <Tag size={12} className="text-[#3d3f96]" /> Offers & Coupons
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
        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
              <Percent size={14} strokeWidth={3} />
            </span>
            <div className="min-w-0 space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-emerald-900 font-mono tracking-wider truncate">
                  {appliedCoupon.couponName}
                </span>
                <span className="text-[9px] font-black uppercase text-emerald-700 bg-white/80 px-2 py-0.5 rounded border border-emerald-200">
                  {appliedCoupon.discountPercentage}% Off
                </span>
              </div>
              <p className="text-[10px] font-bold text-emerald-700">
                ₹{discountAmount} savings applied on this order
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onRemoveCoupon}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            title="Remove coupon"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onOpenCouponModal}
          className="w-full p-3.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-[#3d3f96] bg-slate-50/50 hover:bg-indigo-50/10 flex items-center justify-between text-xs font-bold text-slate-700 transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
              <Sparkles size={13} />
            </span>
            <span>Apply Coupon or Promo Code</span>
          </div>
          <span className="text-xs font-extrabold text-[#3d3f96] group-hover:translate-x-0.5 transition-transform">
            View Offers
          </span>
        </button>
      )}
    </div>
  );
}