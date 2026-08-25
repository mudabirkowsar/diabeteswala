"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight, KeyRound, MapPin } from 'lucide-react';

export default function OrderSuccessModal({ isOpen, orderData, onClose }) {
  const router = useRouter();

  if (!isOpen || !orderData) return null;

  const bookingId = orderData.bookingId || orderData.data?.bookingId || orderData._id || "ORD-SUCCESS";
  const deliveryOTP = orderData.deliveryOTP || orderData.data?.deliveryOTP || "----";
  const totalAmount = orderData.billSummary?.totalAmount || orderData.data?.billSummary?.totalAmount || 0;
  const paymentMethod = orderData.paymentMethod || orderData.data?.paymentMethod || "Online";
  const address = orderData.address || orderData.data?.address || {};

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in antialiased select-none text-slate-800">
      <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-md w-full p-6 sm:p-8 shadow-2xl relative text-center space-y-6">
        
        {/* Success Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
          <CheckCircle2 size={36} />
        </div>

        {/* Header */}
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
            Order Confirmed
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight pt-1">
            Food Order Placed!
          </h2>
          <p className="text-xs text-slate-400 font-semibold">
            Your clinical meal is being prepared at the cloud kitchen.
          </p>
        </div>

        {/* Booking ID & Delivery OTP Box */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Booking ID</span>
            <span className="font-mono font-black text-slate-800">{bookingId}</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-dashed border-[#3d3f96]/30 flex items-center justify-between">
            <div className="flex items-center gap-2 text-left">
              <KeyRound size={16} className="text-[#3d3f96]" />
              <div>
                <span className="text-[9px] font-black uppercase text-slate-400 block">Delivery Verification OTP</span>
                <span className="text-xs text-slate-600 font-semibold">Share with driver upon arrival</span>
              </div>
            </div>
            <strong className="text-xl font-black font-mono text-[#3d3f96] tracking-widest">{deliveryOTP}</strong>
          </div>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200/50">
            <span className="text-slate-400 font-bold">Total Paid / Mode</span>
            <span className="font-bold text-slate-800">₹{totalAmount} ({paymentMethod})</span>
          </div>

          {address.city && (
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 pt-1 justify-center">
              <MapPin size={11} className="text-slate-400" />
              <span>Delivering to {address.city}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              router.push('/');
            }}
            className="w-full py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/10 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95"
          >
            <span>Explore More Dishes</span>
            <ArrowRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}