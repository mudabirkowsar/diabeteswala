// components/Coupons.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, X, AlertCircle, Loader2 } from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';

export default function Coupons({ isOpen, onClose, cartTotal, appliedCoupon, onApplyCoupon, onRemoveCoupon, pharmacyId }) {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customCode, setCustomCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const res = await UserAPI.getUserPharmacyAvailableCoupons();
        if (res && res.success) {
          setCoupons(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load available coupons:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualApply = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const code = customCode.trim().toUpperCase();
    if (!code) return;

    try {
      const res = await UserAPI.validateUserPharmacyCoupon({
        couponName: code,
        pharmacyId,
        totalAmount: cartTotal
      });
      if (res && res.success) {
        onApplyCoupon({ couponName: code, discount: res.discount });
        setCustomCode("");
        onClose();
      } else {
        setErrorMsg(res?.message || "Invalid coupon code");
      }
    } catch (err) {
      setErrorMsg("Failed to validate coupon");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full relative z-10 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col text-left"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
            <Tag size={17} className="text-[#3d3f96]" /> Available Pharmacy Coupons
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X size={18} />
          </button>
        </div>

        {/* Input */}
        <form onSubmit={handleManualApply} className="mt-4 mb-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="ENTER PROMO CODE"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 uppercase outline-none focus:border-[#3d3f96]"
            />
            <button
              type="submit"
              className="bg-[#3d3f96] hover:bg-[#2d2f75] text-white text-xs font-black px-4 py-2.5 rounded-xl transition-all cursor-pointer"
            >
              Apply
            </button>
          </div>
          {errorMsg && (
            <p className="text-[10px] font-bold text-rose-500 mt-1 flex items-center gap-1">
              <AlertCircle size={12} /> {errorMsg}
            </p>
          )}
        </form>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#3d3f96]" />
              <span className="text-xs font-bold">Scanning eligible offers...</span>
            </div>
          ) : coupons.length > 0 ? (
            coupons.map((c) => {
              const isCurrent = appliedCoupon?.couponName === c.couponName;
              return (
                <div
                  key={c._id || c.couponName}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isCurrent
                      ? "border-emerald-500 bg-emerald-50/50"
                      : c.isApplicable
                      ? "border-slate-200 bg-white hover:border-slate-300"
                      : "border-slate-100 bg-slate-50/60 opacity-60"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black bg-[#3d3f96]/10 text-[#3d3f96] px-2 py-0.5 rounded uppercase">
                        {c.couponName}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {c.discountPercentage}% OFF (Max ₹{c.maxDiscount})
                      </span>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600">{c.validationMessage}</p>
                    {c.amountShort > 0 && (
                      <p className="text-[10px] font-bold text-rose-500">
                        Add ₹{c.amountShort} more to unlock
                      </p>
                    )}
                  </div>

                  <div>
                    {isCurrent ? (
                      <button
                        onClick={onRemoveCoupon}
                        className="text-xs font-black text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-200 cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        disabled={!c.isApplicable}
                        onClick={() => {
                          onApplyCoupon(c);
                          onClose();
                        }}
                        className={`text-xs font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          c.isApplicable
                            ? "bg-[#3d3f96] text-white hover:bg-[#2d2f75]"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed"
                        }`}
                      >
                        Apply
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs font-bold text-slate-400 text-center py-6">No promotions currently available.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}