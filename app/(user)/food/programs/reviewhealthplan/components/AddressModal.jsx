"use client";

import React from "react";
import { 
  X, 
  MapPin, 
  Home, 
  Briefcase, 
  Plus, 
  Check, 
  Phone, 
  CheckCircle2 
} from "lucide-react";

export default function AddressModal({
  isOpen,
  onClose,
  addresses = [],
  selectedAddress,
  onSelectAddress
}) {
  if (!isOpen) return null;

  const getAddressIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "home":
        return <Home className="w-4 h-4 text-[#3d3f96]" />;
      case "work":
      case "office":
        return <Briefcase className="w-4 h-4 text-emerald-600" />;
      default:
        return <MapPin className="w-4 h-4 text-amber-600" />;
    }
  };

  const formatFullAddress = (addr) => {
    if (!addr) return "";
    const parts = [
      addr.houseNo,
      addr.sector,
      addr.landmark && `Near ${addr.landmark}`,
      addr.city,
      addr.state,
      addr.pincode
    ].filter(Boolean);
    return parts.join(", ");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">Select Delivery Address</h3>
              <p className="text-xs text-slate-500 font-medium">Choose where you want your meals delivered</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Address List */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {addresses.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center justify-center text-slate-400">
              <MapPin className="w-12 h-12 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">No saved addresses found</p>
              <p className="text-xs text-slate-400 mt-0.5">Please add a delivery address to continue.</p>
            </div>
          ) : (
            addresses.map((addr) => {
              const isSelected = selectedAddress?._id === addr._id;

              return (
                <div
                  key={addr._id}
                  onClick={() => onSelectAddress(addr)}
                  className={`relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? "border-[#3d3f96] bg-[#3d3f96]/5 shadow-sm ring-2 ring-[#3d3f96]/20"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60"
                  }`}
                >
                  {/* Selection Radio Circle */}
                  <div className="mt-1">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                      isSelected
                        ? "border-[#3d3f96] bg-[#3d3f96] text-white"
                        : "border-slate-300 bg-white"
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Address Content */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-white border border-slate-200 text-[11px] font-black rounded-lg text-slate-800 uppercase shadow-2xs">
                        {getAddressIcon(addr.addressType)}
                        {addr.addressType || "Address"}
                      </span>

                      <span className="text-xs font-black text-slate-900">
                        {addr.name}
                      </span>

                      {addr.isDefault && (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                          Default
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {formatFullAddress(addr)}
                    </p>

                    {addr.phone && (
                      <p className="text-[11px] font-bold text-slate-500 flex items-center gap-1 pt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {addr.phone}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-600 hover:bg-slate-200 transition cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#32347d] text-white rounded-xl text-xs font-black shadow-md shadow-[#3d3f96]/20 transition cursor-pointer"
          >
            Confirm Address
          </button>
        </div>

      </div>
    </div>
  );
}