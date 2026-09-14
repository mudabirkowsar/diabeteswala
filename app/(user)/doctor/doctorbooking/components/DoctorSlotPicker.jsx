'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Sparkles, AlertCircle, Loader2, ChevronRight, CheckCircle2 } from 'lucide-react';
import UserAPI from '../../../../services/UserAPI';

/**
 * Format 24hr "HH:mm" string to 12hr "hh:mm A" string (e.g., "09:00" -> "09:00 AM", "16:30" -> "04:30 PM")
 */
function formatTime12h(timeStr) {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

export default function DoctorSlotPicker({ doctorId, onSlotSelect, selectedSlot }) {
  // Generate next 10 selectable dates starting today
  const nextDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 10; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ isoDate, dayName, monthDay });
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState(nextDates[0]?.isoDate || '');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch available slots on date or doctorId change
  useEffect(() => {
    if (!doctorId || !selectedDate) return;

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setErrorMessage(null);

        const res = await UserAPI.getDoctorAvailableSlots(doctorId, { date: selectedDate });

        if (res && res.success) {
          if (res.slots && res.slots.length > 0) {
            setSlots(res.slots);
          } else {
            setSlots([]);
            setErrorMessage(res.message || 'No slots available on this date.');
          }
        } else {
          setSlots([]);
          setErrorMessage(res?.message || 'Unable to fetch slots.');
        }
      } catch (err) {
        console.error('Error fetching doctor slots:', err);
        setSlots([]);
        setErrorMessage(err?.response?.data?.message || 'Failed to load slots for this date.');
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [doctorId, selectedDate]);

  const handleSelectSlot = (slotItem) => {
    if (!slotItem.available || slotItem.isBooked || slotItem.isBlocked) return;
    if (onSlotSelect) {
      onSlotSelect({
        ...slotItem,
        date: selectedDate,
        formattedTime: formatTime12h(slotItem.time)
      });
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-7 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-[#3d3f96] text-white text-xs font-bold flex items-center justify-center">2</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Select Date & Time Slot</h3>
            <p className="text-xs text-slate-400">Choose your preferred consultation window</p>
          </div>
        </div>
      </div>

      {/* Date Horizontal Picker Strip */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
          <CalendarIcon size={14} className="text-[#3d3f96]" />
          <span>Available Dates</span>
        </label>
        
        <div className="flex gap-2.5 overflow-x-auto pb-2 scroll-smooth [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }}>
          {nextDates.map((item) => {
            const isSelected = selectedDate === item.isoDate;
            return (
              <button
                key={item.isoDate}
                type="button"
                onClick={() => setSelectedDate(item.isoDate)}
                className={`shrink-0 px-4 py-3 rounded-2xl border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md shadow-indigo-100'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <p className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {item.dayName}
                </p>
                <p className="text-xs font-extrabold mt-0.5 whitespace-nowrap">
                  {item.monthDay}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Slots Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Clock size={14} className="text-[#3d3f96]" />
            <span>Available Slots ({selectedDate})</span>
          </label>
          {selectedSlot && (
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
              <CheckCircle2 size={12} />
              {selectedSlot.formattedTime || formatTime12h(selectedSlot.time)} Selected
            </span>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 bg-slate-50/50 rounded-2xl border border-slate-100 gap-2">
            <Loader2 size={24} className="animate-spin text-[#3d3f96]" />
            <p className="text-xs font-semibold text-slate-500">Checking slot availability...</p>
          </div>
        ) : errorMessage || slots.length === 0 ? (
          <div className="text-center py-8 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-4">
            <AlertCircle size={22} className="mx-auto text-amber-500 mb-1.5" />
            <p className="text-xs font-bold text-slate-700">{errorMessage || 'Doctor is unavailable on this date'}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Please pick another date from the strip above.</p>
          </div>
        ) : (
          /* Slots Grid */
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {slots.map((slotItem, index) => {
              const isSelected = selectedSlot?.time === slotItem.time && selectedSlot?.date === selectedDate;
              const isUnavailable = !slotItem.available || slotItem.isBooked || slotItem.isBlocked;
              const hasPremium = slotItem.premiumFee > 0;

              return (
                <button
                  key={`${slotItem.time}-${index}`}
                  type="button"
                  disabled={isUnavailable}
                  onClick={() => handleSelectSlot(slotItem)}
                  className={`relative p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                    isUnavailable
                      ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-50 cursor-not-allowed line-through'
                      : isSelected
                      ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md ring-2 ring-[#3d3f96]/30'
                      : 'bg-white border-slate-200 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer'
                  }`}
                >
                  <span className="text-xs font-extrabold tracking-tight">
                    {formatTime12h(slotItem.time)}
                  </span>

                  {/* Premium Fee Tag */}
                  {hasPremium && !isUnavailable && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md flex items-center gap-0.5 mt-0.5 ${
                      isSelected ? 'bg-indigo-400/40 text-amber-300' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <Sparkles size={8} />
                      +₹{slotItem.premiumFee}
                    </span>
                  )}

                  {/* Status Indicator */}
                  {slotItem.isBooked && (
                    <span className="text-[9px] font-bold text-rose-500 uppercase">Booked</span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}