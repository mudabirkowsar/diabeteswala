// components/CouponCard.jsx
"use client";
import React from 'react';
import { Tag, ChevronRight, X, CheckCircle2 } from 'lucide-react';

export default function CouponCard({ appliedCoupon, discountAmount = 0, onOpenCouponModal, onRemoveCoupon }) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Tag size={15} />
          </div>
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-slate-800">Pharmacy Offers</span>
        </div>

        <button
          type="button"
          onClick={onOpenCouponModal}
          className="text-xs font-black text-[#3d3f96] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          {appliedCoupon ? "Change Offer" : "View Coupons"} <ChevronRight size={13} />
        </button>
      </div>

      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200/80 rounded-xl p-2.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <div>
              <p className="text-[11px] sm:text-xs font-black text-emerald-800 uppercase tracking-wider">
                {appliedCoupon.couponName}
              </p>
              <p className="text-[9px] sm:text-[10px] font-bold text-emerald-600">
                Savings: ₹{discountAmount} applied to this order
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg cursor-pointer"
          >
            <X size={13} />
          </button>
        </div>
      ) : (
        <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 text-left">
          Apply eligible promo codes for store discounts and waiver perks.
        </p>
      )}
    </div>
  );
}