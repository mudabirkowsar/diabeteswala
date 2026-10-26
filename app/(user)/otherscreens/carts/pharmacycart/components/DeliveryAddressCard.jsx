// components/DeliveryAddressCard.jsx
"use client";
import React from 'react';
import { MapPin, ChevronRight, Loader2 } from 'lucide-react';

export default function DeliveryAddressCard({
  selectedAddress,
  loadingAddress,
  onOpenAddressModal
}) {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-4 border border-slate-100 shadow-sm space-y-2.5">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center shrink-0">
            <MapPin size={15} />
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">Delivery Address</h4>
            <p className="text-[11px] sm:text-xs font-black text-slate-800">
              {selectedAddress?.addressType ? `${selectedAddress.addressType} Destination` : "Recipient Location"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenAddressModal}
          className="text-xs font-black text-[#3d3f96] hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          {selectedAddress ? "Change" : "Add"} <ChevronRight size={13} />
        </button>
      </div>

      {loadingAddress ? (
        <div className="flex items-center gap-2 text-slate-400 text-[11px] font-bold py-1">
          <Loader2 size={13} className="animate-spin" /> Fetching delivery destination...
        </div>
      ) : selectedAddress ? (
        <div className="text-left text-[11px] sm:text-xs space-y-0.5">
          <p className="font-black text-slate-900">{selectedAddress.name}</p>
          <p className="text-slate-600 leading-relaxed font-medium">
            {selectedAddress.houseNo}, {selectedAddress.sector && `${selectedAddress.sector}, `}
            {selectedAddress.landmark && `Near ${selectedAddress.landmark}, `}
            {selectedAddress.city}, {selectedAddress.state} - {selectedAddress.pincode}
          </p>
          <p className="text-slate-400 font-bold text-[10px] pt-0.5">
            Phone: <span className="text-slate-700">{selectedAddress.phone}</span>
          </p>
        </div>
      ) : (
        <div className="text-[11px] text-rose-500 font-bold py-1">
          No delivery address selected. Please select an address.
        </div>
      )}
    </div>
  );
}