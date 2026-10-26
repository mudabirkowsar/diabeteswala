// components/OrderSuccessModal.jsx
"use client";
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, KeyRound, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function OrderSuccessModal({ isOpen, orderData, onClose }) {
  const router = useRouter();
  if (!isOpen || !orderData) return null;

  const handleFinish = () => {
    onClose();
    router.push('/pharmacy');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-left">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-md w-full relative z-10 text-center shadow-2xl border border-slate-100 space-y-5"
      >
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={38} />
        </div>

        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Order Placed Successfully!
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Your pharmacy order has been routed to our licensed chemist for packaging.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-left text-xs font-bold text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-400">Order ID:</span>
            <span className="text-slate-900 font-black">{orderData.orderId || orderData._id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Payment:</span>
            <span className="text-slate-900 font-black">
              {orderData.paymentMethod} ({orderData.paymentStatus || 'Pending'})
            </span>
          </div>
          {orderData.deliveryOTP && (
            <div className="flex justify-between items-center bg-amber-50 p-2.5 rounded-xl border border-amber-200">
              <span className="text-amber-800 flex items-center gap-1 font-black">
                <KeyRound size={14} /> Delivery OTP:
              </span>
              <span className="text-base font-black text-amber-900 tracking-wider">
                {orderData.deliveryOTP}
              </span>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleFinish}
          className="w-full bg-[#3d3f96] hover:bg-[#2d2f75] text-white py-3.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 transition-all cursor-pointer"
        >
          Return to Pharmacy <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );
}