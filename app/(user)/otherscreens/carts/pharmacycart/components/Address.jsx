// components/Address.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, CheckCircle2, Loader2 } from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';

export default function Address({ isOpen, onClose, selectedAddressId, onSelectAddress }) {
  const [addressList, setAddressList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await UserAPI.getAddressList();
        if (res && res.success) {
          setAddressList(res.data || []);
        }
      } catch (err) {
        console.error("Failed to load address list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [isOpen]);

  if (!isOpen) return null;

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
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full relative z-10 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col text-left"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-black text-sm uppercase tracking-wider">
            <MapPin size={17} className="text-[#3d3f96]" /> Select Delivery Destination
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 flex items-center justify-center gap-2">
              <Loader2 size={16} className="animate-spin text-[#3d3f96]" />
              <span className="text-xs font-bold">Loading addresses...</span>
            </div>
          ) : addressList.length > 0 ? (
            addressList.map((addr) => {
              const isSelected = selectedAddressId === addr._id;
              return (
                <div
                  key={addr._id}
                  onClick={() => onSelectAddress(addr)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                    isSelected
                      ? "border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {addr.addressType || "Home"}
                      </span>
                      <h4 className="text-xs font-black text-slate-900">{addr.name}</h4>
                    </div>
                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                      {addr.houseNo}, {addr.sector && `${addr.sector}, `}{addr.landmark && `Near ${addr.landmark}, `}
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400">Phone: {addr.phone}</p>
                  </div>
                  {isSelected && <CheckCircle2 size={18} className="text-[#3d3f96] shrink-0" />}
                </div>
              );
            })
          ) : (
            <p className="text-xs font-bold text-slate-400 text-center py-8">No saved addresses found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}