// components/DeliveryModeCard.jsx
"use client";
import React from 'react';
import { Truck, Zap, CalendarClock, Clock, Loader2, AlertCircle } from 'lucide-react';

export default function DeliveryModeCard({
  deliveryMode,
  onSelectMode,
  deliveryCharges,
  availableSlots = [],
  selectedSlot,
  onSelectSlot,
  selectedDate,
  onDateChange,
  isSlotLoading,
  isSlotClosed
}) {
  const isRapidAvailable = deliveryCharges?.isRapidAvailable !== false;
  const standardFee = deliveryCharges?.fixedPrice ?? 40;
  const rapidExtra = deliveryCharges?.fastDeliveryExtra ?? deliveryCharges?.rapidCharge ?? 69;

  const calendarDates = [0, 1, 2, 3].map((offset) => {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return {
      iso: d.toISOString().split('T')[0],
      label: offset === 0 ? "Today" : offset === 1 ? "Tomorrow" : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    };
  });

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3 sm:space-y-4">
      <div className="pb-2.5 sm:pb-3 border-b border-slate-100">
        <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
          Delivery Mode
        </h3>
        <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">Choose your preferred shipping turnaround</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        {/* Standard Delivery */}
        <button
          type="button"
          onClick={() => onSelectMode('standard')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all ${
            deliveryMode === 'standard'
              ? 'border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
              <Truck size={15} />
            </div>
            <span className="text-xs font-black text-slate-800">₹{standardFee}</span>
          </div>
          <h4 className="text-xs font-black text-slate-900">Standard</h4>
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">24 - 48 Hours</p>
        </button>

        {/* Express Rapid Delivery */}
        <button
          type="button"
          disabled={!isRapidAvailable}
          onClick={() => onSelectMode('rapid')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all relative ${
            !isRapidAvailable
              ? 'opacity-40 cursor-not-allowed bg-slate-50 border-slate-200'
              : deliveryMode === 'rapid'
              ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <span className="absolute top-2 right-2 bg-amber-500 text-white text-[7.5px] font-black px-1.5 py-0.5 rounded uppercase">
            Fastest
          </span>
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600">
              <Zap size={15} />
            </div>
            <span className="text-xs font-black text-slate-800">+₹{rapidExtra}</span>
          </div>
          <h4 className="text-xs font-black text-slate-900">Express Rapid</h4>
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Within 60 Mins</p>
        </button>

        {/* Slot Delivery */}
        <button
          type="button"
          onClick={() => onSelectMode('slot')}
          className={`p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border text-left transition-all ${
            deliveryMode === 'slot'
              ? 'border-[#3d3f96] bg-[#3d3f96]/5 ring-2 ring-[#3d3f96]/20'
              : 'border-slate-200 hover:border-slate-300 bg-white'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-[#3d3f96]">
              <CalendarClock size={15} />
            </div>
            <span className="text-xs font-black text-slate-800">Slots</span>
          </div>
          <h4 className="text-xs font-black text-slate-900">Scheduled Slot</h4>
          <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium">Pick Time Window</p>
        </button>
      </div>

      {deliveryMode === 'slot' && (
        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div>
            <label className="text-[11px] sm:text-xs font-black text-slate-700 block mb-1.5">Delivery Date</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 sm:gap-2">
              {calendarDates.map((item) => (
                <button
                  key={item.iso}
                  type="button"
                  onClick={() => onDateChange(item.iso)}
                  className={`py-1.5 px-2.5 rounded-lg sm:rounded-xl border text-center transition-all text-[11px] sm:text-xs font-bold ${
                    selectedDate === item.iso
                      ? "border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] sm:text-xs font-black text-slate-700 block mb-1.5">Available Slots</label>
            {isSlotLoading ? (
              <div className="p-4 text-center text-slate-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#3d3f96]" />
                <span className="text-[11px] font-bold">Checking slots...</span>
              </div>
            ) : isSlotClosed ? (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-[11px] font-bold">
                <AlertCircle size={14} /> Store is closed for slot dispatch on this date.
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1.5 sm:gap-2">
                {availableSlots.map((slot, idx) => {
                  const isSelected = selectedSlot?.displayTime === slot.displayTime;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={slot.isFull}
                      onClick={() => onSelectSlot(slot)}
                      className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        slot.isFull
                          ? "opacity-40 cursor-not-allowed bg-slate-100 border-slate-200"
                          : isSelected
                          ? "border-[#3d3f96] bg-[#3d3f96]/10 text-[#3d3f96] font-black"
                          : "border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-700 font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} className={isSelected ? "text-[#3d3f96]" : "text-slate-400"} />
                        <span className="text-[11px]">{slot.displayTime}</span>
                      </div>
                      {slot.extraFee > 0 && (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1 py-0.5 rounded">
                          +₹{slot.extraFee}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 rounded-xl text-center text-slate-400 text-[11px] font-bold">
                No slots open for chosen date.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}