'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, Video, MapPin, Calendar, Clock, ShieldCheck, 
  ArrowLeft, CheckCircle, AlertCircle, Loader2, Sparkles, Languages, Info
} from 'lucide-react';
import UserAPI from '../../../../services/UserAPI'; // Adjust your import path

// Date formatter helper: YYYY-MM-DD
const formatDateToISO = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CoachDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Date selection states
  const [dateList, setDateList] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMode, setSelectedMode] = useState('online'); // 'online' or 'offline'

  // Safe image helper
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1594824813579-42b71c26b911?q=80&w=400&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
    return `${baseUrl}${imgPath}`;
  };

  // Generate 7 upcoming dates
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      dates.push({
        fullDate: formatDateToISO(d),
        dayName: i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' }),
      });
    }
    setDateList(dates);
    setSelectedDate(dates[0].fullDate);
  }, []);

  // Fetch Coach details and Slots on mount or when selectedDate changes
  useEffect(() => {
    if (!id || !selectedDate) return;

    const fetchCoachData = async () => {
      try {
        if (!coach) {
          setLoading(true);
        } else {
          setSlotsLoading(true);
        }

        const res = await UserAPI.getNearbyDiabetesCoacheDetail(id, selectedDate);

        if (res && res.success && res.data) {
          setCoach(res.data);
          setSelectedSlot(null); // Reset selection on date change
        } else {
          setErrorMessage(res?.message || 'Failed to fetch coach profile');
        }
      } catch (err) {
        console.error('Error loading coach details:', err);
        setErrorMessage('Unable to load coach data. Please try again.');
      } finally {
        setLoading(false);
        setSlotsLoading(false);
      }
    };

    fetchCoachData();
  }, [id, selectedDate]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="animate-spin text-[#3d3f96]" size={40} />
        <p className="text-sm font-semibold text-slate-600">Loading Coach Profile & Live Schedule...</p>
      </div>
    );
  }

  if (errorMessage || !coach) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <AlertCircle size={48} className="text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-800">Profile Unavailable</h2>
        <p className="text-sm text-slate-500 mt-1">{errorMessage || 'Coach profile could not be found.'}</p>
        <button
          onClick={() => router.back()}
          className="mt-5 px-5 py-2.5 bg-[#3d3f96] text-white rounded-xl text-sm font-bold"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Group slots by category
  const slots = coach.availableSlotsPreview?.slots || [];
  const morningSlots = slots.filter((s) => s.category === 'Morning');
  const afternoonSlots = slots.filter((s) => s.category === 'Afternoon');
  const eveningSlots = slots.filter((s) => s.category === 'Evening');

  // Calculate pricing based on mode and premium slots
  const basePrice = selectedMode === 'online' 
    ? (coach.fees?.online || coach.price || 299) 
    : (coach.fees?.offline || 599);

  const extraFee = selectedSlot?.extraFee || 0;
  const finalPrice = basePrice + extraFee;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Coaches
          </button>
          <span className="text-xs font-bold text-[#3d3f96] uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-md">
            {coach.coachType}
          </span>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Coach Profile Overview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-5">
              
              {/* Profile Card Header */}
              <div className="flex gap-4 items-start">
                <img
                  src={getImageSrc(coach.profileImage)}
                  alt={coach.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-slate-100 shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1594824813579-42b71c26b911?q=80&w=400&auto=format&fit=crop';
                  }}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1 text-red-500 font-bold text-[10px] tracking-widest uppercase">
                    <ShieldCheck size={14} className="fill-red-50" /> Verified Educator
                  </div>
                  <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight mt-0.5">
                    {coach.name}
                  </h1>
                  <p className="text-xs font-semibold text-slate-500 mt-0.5">
                    {coach.qualification}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-xs font-bold border border-amber-100">
                      <Star size={12} fill="currentColor" className="text-amber-500" />
                      <span>{coach.rating || 5.0}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">({coach.totalReviews || 0} Patient Reviews)</span>
                  </div>
                </div>
              </div>

              {/* Languages & Location */}
              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                {coach.languages && (
                  <div className="flex items-center gap-2">
                    <Languages size={14} className="text-slate-400 shrink-0" />
                    <span>Speaks: <strong className="text-slate-800">{coach.languages.join(', ')}</strong></span>
                  </div>
                )}
                {coach.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span>
                      {coach.location.address ? `${coach.location.address}, ` : ''}
                      {coach.location.city}, {coach.location.state}
                    </span>
                  </div>
                )}
              </div>

              {/* About summary */}
              {coach.about && (
                <div className="pt-3 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">About Practitioner</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{coach.about}</p>
                </div>
              )}

              {/* Consultation Mode Selector */}
              <div className="pt-3 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-2">
                  Select Consultation Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {coach.consultationModes?.isOnlineAvailable && (
                    <button
                      onClick={() => setSelectedMode('online')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedMode === 'online'
                          ? 'border-[#3d3f96] bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <Video size={14} className="text-[#3d3f96]" /> Video Online
                      </div>
                      <div className="text-sm font-extrabold text-[#3d3f96] mt-1">
                        ₹{coach.fees?.online || coach.price || 299}
                      </div>
                    </button>
                  )}

                  {coach.consultationModes?.isOfflineAvailable && (
                    <button
                      onClick={() => setSelectedMode('offline')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        selectedMode === 'offline'
                          ? 'border-[#3d3f96] bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                        <MapPin size={14} className="text-emerald-600" /> In-Person / Home
                      </div>
                      <div className="text-sm font-extrabold text-emerald-700 mt-1">
                        ₹{coach.fees?.offline || 599}
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Slots Booking Engine */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">Select Date & Available Slot</h2>
                  <p className="text-xs text-slate-500">Live booking for CGM checkup, sensor guidance, or diet review</p>
                </div>
                <Clock size={20} className="text-[#3d3f96]" />
              </div>

              {/* Date Horizontal Carousel */}
              <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                {dateList.map((d) => {
                  const isSelected = selectedDate === d.fullDate;
                  return (
                    <button
                      key={d.fullDate}
                      onClick={() => setSelectedDate(d.fullDate)}
                      className={`flex flex-col items-center justify-center min-w-[70px] sm:min-w-[80px] py-2.5 px-2 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-md shadow-indigo-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {d.dayName}
                      </span>
                      <span className="text-base sm:text-lg font-extrabold leading-none my-0.5">
                        {d.dayNumber}
                      </span>
                      <span className={`text-[10px] font-medium ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                        {d.month}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Slots Section */}
              <div className="mt-6">
                {slotsLoading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 size={28} className="animate-spin text-[#3d3f96]" />
                    <span className="text-xs font-semibold">Checking slot availability for {selectedDate}...</span>
                  </div>
                ) : coach.availableSlotsPreview?.isClosed || slots.length === 0 ? (
                  <div className="py-12 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 px-4">
                    <Info size={28} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-bold text-slate-700">No Slots Available</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {coach.availableSlotsPreview?.reason || 'Coach is not taking appointments on this date. Please select another day.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Morning Slots */}
                    {morningSlots.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          Morning Slots
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {morningSlots.map((slot, idx) => (
                            <SlotButton
                              key={idx}
                              slot={slot}
                              isSelected={selectedSlot?.slotTime === slot.slotTime}
                              onSelect={() => setSelectedSlot(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Afternoon Slots */}
                    {afternoonSlots.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          Afternoon Slots
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {afternoonSlots.map((slot, idx) => (
                            <SlotButton
                              key={idx}
                              slot={slot}
                              isSelected={selectedSlot?.slotTime === slot.slotTime}
                              onSelect={() => setSelectedSlot(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Evening Slots */}
                    {eveningSlots.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                          Evening Slots
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {eveningSlots.map((slot, idx) => (
                            <SlotButton
                              key={idx}
                              slot={slot}
                              isSelected={selectedSlot?.slotTime === slot.slotTime}
                              onSelect={() => setSelectedSlot(slot)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Booking Checkout Summary Card */}
              {selectedSlot && (
                <div className="mt-8 pt-4 border-t border-slate-200 bg-slate-50 rounded-xl p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <Calendar size={13} className="text-[#3d3f96]" />
                        <span>{selectedDate}</span>
                        <span>•</span>
                        <span>{selectedSlot.displayTime}</span>
                      </div>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-lg font-extrabold text-[#3d3f96]">
                          ₹{finalPrice}
                        </span>
                        {selectedSlot.isPremium && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            Includes ₹{selectedSlot.extraFee} Prime Fee
                          </span>
                        )}
                        <span className="text-xs text-slate-400">({selectedMode === 'online' ? 'Online Video' : 'In-Person'})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        // Forward user to your payment / appointment confirmation flow
                        alert(`Proceeding with booking for ${selectedDate} at ${selectedSlot.displayTime} with Total: ₹${finalPrice}`);
                      }}
                      className="bg-[#3d3f96] hover:bg-slate-900 text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                    >
                      Proceed to Book
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// Subcomponent: Slot Button
function SlotButton({ slot, isSelected, onSelect }) {
  const isAvailable = slot.isAvailable;

  return (
    <button
      type="button"
      disabled={!isAvailable}
      onClick={onSelect}
      className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center relative cursor-pointer ${
        !isAvailable
          ? 'bg-slate-100/60 border-slate-200 text-slate-400 cursor-not-allowed opacity-60'
          : isSelected
          ? 'bg-[#3d3f96] border-[#3d3f96] text-white shadow-md'
          : 'bg-white border-slate-200/90 text-slate-700 hover:border-[#3d3f96]/50 hover:bg-indigo-50/20'
      }`}
    >
      <span className="text-xs font-bold">{slot.displayTime.split(' - ')[0]}</span>
      <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
        {slot.isPremium ? `₹${slot.totalPrice} (Prime)` : `₹${slot.basePrice}`}
      </span>

      {slot.isPremium && !isSelected && (
        <span className="absolute -top-1.5 -right-1 bg-amber-500 text-white text-[8px] font-extrabold px-1 rounded-sm shadow-xs">
          STAR
        </span>
      )}
    </button>
  );
}