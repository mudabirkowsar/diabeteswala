'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  Check,
  Plus,
  Loader2,
  Search,
  CheckCircle2,
  X,
  Video,
  Home,
  Navigation,
  GraduationCap,
  Sparkles,
  Info
} from 'lucide-react';
import UserAPI from '../../../../../services/UserAPI';

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

export default function ChooseCoachAndSlot({
  includeCoachCharge,
  onToggleCoachCharge,
  selectedCoach,
  onCoachSelect,
  consultationMode,
  onConsultationModeChange,
  selectedSlot,
  onSlotSelect,
  userLocation,
  showNotification
}) {
  const [coaches, setCoaches] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [coachTypeFilter, setCoachTypeFilter] = useState('Both'); // 'Both' | 'Diabetes Educator' | 'Diabetes Coach'
  const [showCoachModal, setShowCoachModal] = useState(false);

  // Date and slot states
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [slotsData, setSlotsData] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Format image safely
  const getImageSrc = (imgPath) => {
    if (!imgPath) {
      return 'https://images.unsplash.com/photo-1594824813583-0599292c24ef?q=80&w=400&auto=format&fit=crop';
    }
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
      return imgPath;
    }
    return `${BASE_URL}${imgPath}`;
  };

  // Generate next 7 days for the date picker
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const isoDate = d.toISOString().split('T')[0];
      const dayLabel = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateDisplay = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ isoDate, dayLabel, dateDisplay });
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].isoDate);
    }
  }, []);

  // 1. Fetch Nearby Coaches with Online & Offline fees
  const fetchNearbyCoaches = useCallback(async () => {
    try {
      setLoadingCoaches(true);
      const payload = {
        coachType: coachTypeFilter,
        search: searchQuery
      };

      if (userLocation?.lat && userLocation?.lng) {
        payload.userLat = Number(userLocation.lat);
        payload.userLng = Number(userLocation.lng);
      }
      if (userLocation?.city) {
        payload.city = userLocation.city;
      }

      const res = await UserAPI.getNearbyDiabetesCoaches(payload);
      if (res && res.data && Array.isArray(res.data)) {
        setCoaches(res.data);
        if (!selectedCoach && res.data.length > 0) {
          onCoachSelect(res.data[0]);
        }
      } else {
        setCoaches([]);
      }
    } catch (err) {
      console.error('Error fetching nearby coaches:', err);
    } finally {
      setLoadingCoaches(false);
    }
  }, [coachTypeFilter, searchQuery, userLocation, selectedCoach, onCoachSelect]);

  useEffect(() => {
    if (includeCoachCharge) {
      fetchNearbyCoaches();
    }
  }, [includeCoachCharge, fetchNearbyCoaches]);

  // 2. Fetch coach slots for the selected date
  const fetchCoachSlots = useCallback(async () => {
    if (!selectedCoach?._id || !selectedDate) return;
    try {
      setLoadingSlots(true);
      const res = await UserAPI.getUserDiabetesCoachSlotsByDate(selectedCoach._id, {
        selectedDate
      });
      if (res && res.data && Array.isArray(res.data.slots)) {
        setSlotsData(res.data.slots);
      } else {
        setSlotsData([]);
      }
    } catch (err) {
      console.error('Error fetching coach slots:', err);
      setSlotsData([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [selectedCoach, selectedDate]);

  useEffect(() => {
    if (includeCoachCharge && selectedCoach?._id && selectedDate) {
      fetchCoachSlots();
    }
  }, [includeCoachCharge, selectedCoach, selectedDate, fetchCoachSlots]);

  // Handle Coach selection from modal
  const handleSelectCoach = (coach) => {
    onCoachSelect(coach);
    // If the coach does not support current consultation mode, fallback gracefully
    if (consultationMode === 'Offline' && !coach.consultationModes?.isOfflineAvailable) {
      onConsultationModeChange('Online');
    }
    onSlotSelect(null);
    setShowCoachModal(false);
  };

  // Compute Active Coach Fee based on consultation mode
  const currentCoachFee = useMemo(() => {
    if (!selectedCoach) return 299;
    if (consultationMode === 'Offline') {
      return (
        selectedCoach.pricing?.totalEstimatedOfflineFee ||
        selectedCoach.fees?.offline ||
        (selectedCoach.pricing?.offlineBaseFee || 599) + (selectedCoach.pricing?.extraDistanceFee || 0)
      );
    }
    return selectedCoach.pricing?.onlineFee || selectedCoach.fees?.online || selectedCoach.price || 299;
  }, [selectedCoach, consultationMode]);

  return (
    <div className="space-y-3">
      {/* ================= 1. MAIN TOGGLE CARD ================= */}
      <div
        className={`rounded-2xl sm:rounded-3xl p-3.5 sm:p-6 border transition-all ${
          includeCoachCharge
            ? 'border-[#3d3f96] bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/40 ring-1 ring-[#3d3f96] shadow-xs'
            : 'border-slate-200/80 bg-white shadow-xs'
        }`}
      >
        <div className="flex items-start justify-between gap-2.5 sm:gap-4">
          <div className="flex items-start gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-100 text-[#3d3f96] flex items-center justify-center shrink-0 mt-0.5">
              <UserCheck size={16} />
            </div>
            <div className="space-y-0.5 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-tight">
                  1-on-1 Certified Diabetes Coach Session
                </h4>
                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-[#3d3f96] bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded">
                  Recommended
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 leading-snug">
                Personalized guidance on applying CGM sensors, continuous glucose alarms, and reversal counseling.
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs sm:text-base font-black text-slate-900">
              +₹{currentCoachFee}
            </span>
            <button
              type="button"
              onClick={() => onToggleCoachCharge(!includeCoachCharge)}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                includeCoachCharge
                  ? 'bg-[#3d3f96] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {includeCoachCharge ? <Check size={12} /> : <Plus size={12} />}
              <span>{includeCoachCharge ? 'Added' : 'Add Coach'}</span>
            </button>
          </div>
        </div>

        {/* ================= 2. CONSULTATION MODE SELECTOR (ONLINE vs OFFLINE) ================= */}
        {includeCoachCharge && selectedCoach && (
          <div className="mt-3.5 pt-3.5 border-t border-slate-200/70 space-y-2.5">
            <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Choose Consultation Type
            </label>

            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              {/* Online Mode */}
              <button
                type="button"
                onClick={() => onConsultationModeChange('Online')}
                disabled={!selectedCoach.consultationModes?.isOnlineAvailable}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  consultationMode === 'Online'
                    ? 'border-[#3d3f96] bg-indigo-50/70 ring-1 ring-[#3d3f96]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Video size={13} className="text-[#3d3f96]" /> Online Video Call
                  </span>
                  {consultationMode === 'Online' && <CheckCircle2 size={14} className="text-[#3d3f96]" />}
                </div>
                <span className="text-[10px] text-slate-500">Live Video Consultation</span>
                <span className="text-xs font-black text-slate-900 mt-1">
                  ₹{selectedCoach.pricing?.onlineFee || selectedCoach.fees?.online || selectedCoach.price || 299}
                </span>
              </button>

              {/* Offline / Home Visit Mode */}
              <button
                type="button"
                onClick={() => onConsultationModeChange('Offline')}
                disabled={!selectedCoach.consultationModes?.isOfflineAvailable}
                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !selectedCoach.consultationModes?.isOfflineAvailable
                    ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-200'
                    : consultationMode === 'Offline'
                    ? 'border-[#3d3f96] bg-indigo-50/70 ring-1 ring-[#3d3f96]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <Home size={13} className="text-rose-600" /> Home Visit
                  </span>
                  {consultationMode === 'Offline' && <CheckCircle2 size={14} className="text-[#3d3f96]" />}
                </div>
                <span className="text-[10px] text-slate-500">
                  {selectedCoach.distanceDisplay ? `At doorstep (${selectedCoach.distanceDisplay})` : 'In-person doorstep visit'}
                </span>
                <span className="text-xs font-black text-slate-900 mt-1">
                  ₹{selectedCoach.pricing?.totalEstimatedOfflineFee || selectedCoach.fees?.offline || 599}
                </span>
              </button>
            </div>

            {/* Offline Distance Surcharge Explanatory Pill */}
            {consultationMode === 'Offline' && selectedCoach.pricing?.extraDistanceFee > 0 && (
              <div className="flex items-center gap-1.5 text-[10px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
                <Info size={12} className="text-[#3d3f96] shrink-0" />
                <span>
                  Includes <strong>₹{selectedCoach.pricing.offlineBaseFee}</strong> base visit fee +{' '}
                  <strong>₹{selectedCoach.pricing.extraDistanceFee}</strong> travel surcharge (for {selectedCoach.distanceDisplay}).
                </span>
              </div>
            )}
          </div>
        )}

        {/* ================= 3. SELECTED COACH PROFILE STRIP ================= */}
        {includeCoachCharge && selectedCoach && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/70">
            <div className="flex items-center justify-between p-2.5 sm:p-3 bg-white rounded-xl sm:rounded-2xl border border-indigo-100 gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={getImageSrc(selectedCoach.profileImage)}
                    alt={selectedCoach.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h5 className="text-[11px] sm:text-xs font-extrabold text-slate-900 truncate">
                      {selectedCoach.name}
                    </h5>
                    {selectedCoach.coachType && (
                      <span className="text-[8px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                        {selectedCoach.coachType}
                      </span>
                    )}
                  </div>

                  {selectedCoach.qualification && (
                    <p className="text-[9px] sm:text-[10px] text-slate-500 font-medium truncate flex items-center gap-1 mt-0.5">
                      <GraduationCap size={10} className="text-slate-400 shrink-0" />
                      <span>{selectedCoach.qualification}</span>
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                    {selectedCoach.distanceDisplay && (
                      <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                        <MapPin size={10} /> {selectedCoach.distanceDisplay}
                      </span>
                    )}
                    <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                      <Star size={10} className="fill-amber-400 text-amber-400" />
                      {selectedCoach.rating || 4.9}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCoachModal(true)}
                className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-[#3d3f96] hover:bg-indigo-50 border border-indigo-200 rounded-lg sm:rounded-xl transition-all cursor-pointer whitespace-nowrap"
              >
                Change Coach
              </button>
            </div>
          </div>
        )}

        {/* ================= 4. CALENDAR DATE PICKER & SLOTS ================= */}
        {includeCoachCharge && selectedCoach && (
          <div className="mt-3.5 pt-3 border-t border-slate-200/70 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                <Calendar size={13} className="text-[#3d3f96]" /> Select Consultation Date
              </label>
            </div>

            {/* Date Pills Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {availableDates.map((d) => {
                const isSelected = selectedDate === d.isoDate;
                return (
                  <button
                    key={d.isoDate}
                    type="button"
                    onClick={() => setSelectedDate(d.isoDate)}
                    className={`px-3 py-1.5 rounded-xl border text-center shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#3d3f96] bg-[#3d3f96] text-white shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-[9px] font-bold uppercase block opacity-80">{d.dayLabel}</span>
                    <span className="text-[11px] sm:text-xs font-black block">{d.dateDisplay}</span>
                  </button>
                );
              })}
            </div>

            {/* Time Slots Grid with Extra Fee Highlighting */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Clock size={13} className="text-[#3d3f96]" /> Available Time Slots
                </label>
                {selectedSlot && (
                  <span className="text-[9px] sm:text-[10px] font-bold text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded">
                    Selected: {selectedSlot.slotTime} {selectedSlot.extraFee > 0 ? `(+₹${selectedSlot.extraFee} Peak)` : ''}
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-xs">
                  <Loader2 size={14} className="animate-spin text-[#3d3f96]" />
                  <span>Loading available slots...</span>
                </div>
              ) : slotsData.length === 0 ? (
                <p className="text-[11px] text-slate-400 py-2">No available slots on this date. Please pick another date.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {slotsData.map((slot, index) => {
                    const isSelected = selectedSlot?.slotTime === slot.slotTime && selectedSlot?.date === selectedDate;
                    const isAvailable = slot.isAvailable;

                    return (
                      <button
                        key={index}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() =>
                          onSlotSelect({
                            ...slot,
                            date: selectedDate
                          })
                        }
                        className={`p-2 rounded-xl border text-center transition-all cursor-pointer relative ${
                          !isAvailable
                            ? 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed opacity-50'
                            : isSelected
                            ? 'border-[#3d3f96] bg-indigo-50/70 text-[#3d3f96] ring-1 ring-[#3d3f96]'
                            : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <span className="text-[10px] sm:text-[11px] font-bold block truncate">{slot.displayTime}</span>
                        {slot.extraFee > 0 && (
                          <span className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1 py-0.2 rounded mt-0.5 inline-block">
                            +₹{slot.extraFee} Peak Fee
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= 5. COACH SELECTION MODAL ================= */}
      {showCoachModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  Select Certified Diabetes Coach
                </h3>
                <p className="text-[10px] sm:text-xs text-slate-500">
                  Sorted nearest to your location
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCoachModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Coach Type Filter Tabs & Search */}
            <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
              <div className="flex items-center gap-1.5">
                {['Both', 'Diabetes Educator', 'Diabetes Coach'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCoachTypeFilter(type)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      coachTypeFilter === type
                        ? 'bg-[#3d3f96] text-white'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Coach name, qualification, or language..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
                />
              </div>
            </div>

            {/* Coach List Scroll Area */}
            <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1">
              {loadingCoaches ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-[#3d3f96]" />
                  <span>Finding nearest verified coaches...</span>
                </div>
              ) : coaches.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-10">No coaches found in your area.</p>
              ) : (
                coaches.map((c) => {
                  const isSelected = selectedCoach?._id === c._id;
                  const displayOnlineFee = c.pricing?.onlineFee || c.fees?.online || c.price || 299;
                  const displayOfflineFee = c.pricing?.totalEstimatedOfflineFee || c.fees?.offline || 599;

                  return (
                    <div
                      key={c._id}
                      onClick={() => handleSelectCoach(c)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-[#3d3f96] bg-indigo-50/40 ring-1 ring-[#3d3f96]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                          <img
                            src={getImageSrc(c.profileImage)}
                            alt={c.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                              {c.name}
                            </h4>
                            {c.coachType && (
                              <span className="text-[8px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-semibold">
                                {c.coachType}
                              </span>
                            )}
                          </div>

                          {c.qualification && (
                            <p className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                              {c.qualification}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-1 text-[9px] sm:text-[10px] text-slate-400">
                            {c.distanceDisplay && (
                              <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                                <MapPin size={10} /> {c.distanceDisplay}
                              </span>
                            )}
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star size={10} className="fill-amber-400 text-amber-400" />
                              {c.rating || 4.9}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 space-y-0.5">
                        <div className="text-[10px] text-slate-500">
                          Online: <strong className="text-slate-900">₹{displayOnlineFee}</strong>
                        </div>
                        {c.consultationModes?.isOfflineAvailable && (
                          <div className="text-[10px] text-slate-500">
                            Visit: <strong className="text-slate-900">₹{displayOfflineFee}</strong>
                          </div>
                        )}
                        {isSelected ? (
                          <span className="text-[10px] font-bold text-[#3d3f96] flex items-center gap-0.5 justify-end pt-0.5">
                            <CheckCircle2 size={12} /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 block pt-0.5">Select</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}