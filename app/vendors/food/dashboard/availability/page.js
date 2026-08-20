"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const INITIAL_SCHEDULE = [
  { day: 'Monday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '22:00' },
  { day: 'Friday', isOpen: true, openTime: '09:00', closeTime: '23:00' },
  { day: 'Saturday', isOpen: true, openTime: '10:00', closeTime: '23:00' },
  { day: 'Sunday', isOpen: false, openTime: '10:00', closeTime: '22:00' }
];

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState(INITIAL_SCHEDULE);
  const [isKitchenLive, setIsKitchenLive] = useState(true);
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [holidayStart, setHolidayStartDate] = useState('');
  const [holidayEnd, setHolidayEndDate] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  
  // Interactive Live confirmation modal state
  const [showLiveConfirmModal, setShowLiveConfirmModal] = useState(false);
  
  const router = useRouter();

  // Toggle single day open/closed state
  const handleDayToggle = (dayName) => {
    setSchedule(prev => prev.map(item => 
      item.day === dayName ? { ...item, isOpen: !item.isOpen } : item
    ));
  };

  // Modify opening/closing times
  const handleTimeChange = (dayName, field, value) => {
    setSchedule(prev => prev.map(item => 
      item.day === dayName ? { ...item, [field]: value } : item
    ));
  };

  // Handle live toggle click
  const handleLiveToggleClick = () => {
    if (!isKitchenLive) {
      // Opening the kitchen requires menu confirmation
      setShowLiveConfirmModal(true);
    } else {
      // Turning off requires no modal
      setIsKitchenLive(false);
    }
  };

  const handleContinueWithPrevious = () => {
    setIsKitchenLive(true);
    setShowLiveConfirmModal(false);
  };

  const handleSelectMenuRedirect = () => {
    setShowLiveConfirmModal(false);
    router.push('/vendors/food/managefood');
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in py-4">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
            <ClockIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Kitchen Availability</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Configure your weekly operating hours, holidays, and live kitchen states.</p>
          </div>
        </div>

        {/* Global Save Button */}
        <button
          onClick={handleSave}
          className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <SaveIcon className="w-4 h-4 stroke-[2.5]" />
          {isSaved ? 'Schedule Saved!' : 'Save Configuration'}
        </button>
      </div>

      {/* Main Split Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Weekly Schedule Card (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">Weekly Operational Hours</h2>
            <p className="text-xs text-slate-400 mt-1">Set opening and closing ranges for each operational day.</p>
          </div>

          <div className="divide-y divide-slate-100">
            {schedule.map((item) => (
              <div 
                key={item.day} 
                className={`py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 ${
                  !item.isOpen ? 'opacity-50' : 'opacity-100'
                }`}
              >
                {/* Day Identifier & Checkbox */}
                <div className="flex items-center gap-4 w-40 flex-shrink-0">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.isOpen} 
                      onChange={() => handleDayToggle(item.day)}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]" />
                  </label>
                  <span className="font-bold text-slate-800 text-sm">{item.day}</span>
                </div>

                {/* Time Range Selectors */}
                <div className="flex items-center gap-3 flex-1 max-w-md">
                  <div className="flex-1">
                    <input 
                      type="time" 
                      disabled={!item.isOpen}
                      value={item.openTime}
                      onChange={(e) => handleTimeChange(item.day, 'openTime', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent transition-all"
                    />
                  </div>
                  <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">to</span>
                  <div className="flex-1">
                    <input 
                      type="time" 
                      disabled={!item.isOpen}
                      value={item.closeTime}
                      onChange={(e) => handleTimeChange(item.day, 'closeTime', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Operational Status badge */}
                <div className="text-right w-24 flex-shrink-0">
                  <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase border ${
                    item.isOpen 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-transparent'
                  }`}>
                    {item.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>

              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Status Switchers & Holiday Mode (1/3 width) */}
        <div className="space-y-6 lg:sticky lg:top-8">
          
          {/* Live Kitchen Status Console Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Active Live State</h3>
              <span className={`flex h-2.5 w-2.5 relative ${isKitchenLive ? 'opacity-100' : 'opacity-0'}`}>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* Quick Switch Panel */}
            <div className={`p-4 rounded-2xl border transition-all duration-300 ${
              isKitchenLive 
                ? 'bg-emerald-50/50 border-emerald-100' 
                : 'bg-rose-50/50 border-rose-100'
            }`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className={`text-xs font-extrabold uppercase tracking-wider ${
                    isKitchenLive ? 'text-emerald-700' : 'text-rose-700'
                  }`}>
                    {isKitchenLive ? 'Kitchen is Open' : 'Kitchen is Paused'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 font-medium">
                    {isKitchenLive ? 'Currently accepting live orders' : 'Refusing incoming checkout requests'}
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  {/* Changed standard input state check to trigger selection flow modal */}
                  <input 
                    type="checkbox" 
                    checked={isKitchenLive} 
                    onChange={handleLiveToggleClick}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                </label>
              </div>
            </div>
          </div>

          {/* Holiday / Vacation Mode Card */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-slate-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-tight">Holiday Mode</h3>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={isHolidayMode} 
                  onChange={() => setIsHolidayMode(!isHolidayMode)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]" />
              </label>
            </div>

            {/* Holiday Input Fields */}
            {isHolidayMode ? (
              <div className="space-y-4 animate-fade-in">
                <p className="text-xs text-amber-700 bg-amber-50 p-3.5 border border-amber-100 rounded-xl leading-relaxed font-semibold">
                  Vacation Mode locks your shop state as closed for the chosen dates. Payouts and ordering cycles pause.
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Start Date</label>
                    <input 
                      type="date"
                      value={holidayStart}
                      onChange={(e) => setHolidayStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#3D3F96]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">End Date</label>
                    <input 
                      type="date"
                      value={holidayEnd}
                      onChange={(e) => setHolidayEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-[#3D3F96]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                Turn on holiday mode to specify upcoming vacation ranges during which your kitchen should stay completely offline.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* TODAY'S MENU SELECTION ACTION FLOW MODAL */}
      {showLiveConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-scale-up">
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center mx-auto">
                <MenuBookIcon className="w-6 h-6 stroke-[2]" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">Select your menu for today</h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2">
                  Configure today's active menu options on your catalogue, or confirm turning the kitchen live with your previous setup.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col gap-2.5">
                <button
                  onClick={handleSelectMenuRedirect}
                  className="w-full py-3 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10 transition-all uppercase tracking-wider"
                >
                  Select Menu
                </button>
                <button
                  onClick={handleContinueWithPrevious}
                  className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs rounded-xl transition-all uppercase tracking-wider"
                >
                  Continue with Previous
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// Icons

function ClockIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function SaveIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h8l5 5v11a2 2 0 01-2 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-8H7v8M7 3v5h8" />
    </svg>
  );
}

function CalendarIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008z" />
    </svg>
  );
}

function MenuBookIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}