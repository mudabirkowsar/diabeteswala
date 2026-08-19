'use client';

import React, { useState } from 'react';
import IngredientCard from './IngredientCard';
import DiagnosticSidebar from './DiagnosticSidebar';

const daysOfWeek = [
  { id: 'monday', label: 'Mon', fullLabel: 'Monday' },
  { id: 'tuesday', label: 'Tue', fullLabel: 'Tuesday' },
  { id: 'wednesday', label: 'Wed', fullLabel: 'Wednesday' },
  { id: 'thursday', label: 'Thu', fullLabel: 'Thursday' },
  { id: 'friday', label: 'Fri', fullLabel: 'Friday' },
  { id: 'saturday', label: 'Sat', fullLabel: 'Saturday' },
  { id: 'sunday', label: 'Sun', fullLabel: 'Sunday' }
];

export default function TiffinModal({
  onClose,
  mealsPerDayLimit,
  setMealsPerDayLimit,
  selectedSlots,
  handleSlotToggle,
  activeSlotTab,
  setActiveSlotTab,
  activeDayTab,
  setActiveDayTab,
  weeklyCustomMeals,
  getIngredient,
  handleIngredientChange,
  deliveryTimes,
  handleTimeChange,
  durationMode,
  setDurationMode,
  customDaysCount,
  setCustomDaysCount,
  dailyCalories,
  dailyCarbs,
  dailyProtein,
  discountRate,
  savingsAmount,
  daysMultiplier,
  finalCalculatedCost,
  builderIngredients,
  onAddToCart
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [activeIngredientCategory, setActiveIngredientCategory] = useState('bases');

  const activeCategoryList = builderIngredients[activeIngredientCategory];
  const filteredIngredients = activeCategoryList.filter((item) => 
    item.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  const isSlotSelectionValid = selectedSlots.length === mealsPerDayLimit;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      
      {/* EXPANDED WORKSPACE MODAL FRAME */}
      <div className="bg-white rounded-3xl max-w-6xl w-full p-6 md:p-10 shadow-2xl relative max-h-[95vh] overflow-y-auto flex flex-col justify-between border border-gray-150">
        
        {/* Close button */}
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-50 rounded-full transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-150">
          <span className="text-[9px] bg-indigo-50 text-[#3D3F96] font-bold uppercase px-2.5 py-1 rounded-md">Interactive Food Lab</span>
          <h3 className="text-xl font-black text-gray-950 mt-1.5">Customize Daily Plate Ratios</h3>
        </div>

        {/* STEPPER NAVIGATION TIMELINE */}
        <div className="flex items-center justify-center gap-3 md:gap-6 mb-8 max-w-2xl mx-auto w-full text-[10px] md:text-xs font-black uppercase tracking-wider text-center">
          <button onClick={() => setCurrentStep(1)} className={`flex items-center gap-1.5 pb-1 border-b-2 transition ${currentStep === 1 ? 'border-[#3D3F96] text-[#3D3F96]' : 'border-transparent text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 1 ? 'bg-[#3D3F96] text-white font-bold' : 'bg-gray-150 text-gray-400'}`}>1</span>
            <span>Plan & Slots</span>
          </button>
          <span className="h-0.5 w-8 md:w-16 bg-gray-200"></span>
          <button onClick={() => isSlotSelectionValid && setCurrentStep(2)} disabled={!isSlotSelectionValid} className={`flex items-center gap-1.5 pb-1 border-b-2 transition ${currentStep === 2 ? 'border-[#3D3F96] text-[#3D3F96]' : 'border-transparent text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 2 ? 'bg-[#3D3F96] text-white font-bold' : 'bg-gray-150 text-gray-400'}`}>2</span>
            <span>Design Meals</span>
          </button>
          <span className="h-0.5 w-8 md:w-16 bg-gray-200"></span>
          <button onClick={() => isSlotSelectionValid && setCurrentStep(3)} disabled={!isSlotSelectionValid} className={`flex items-center gap-1.5 pb-1 border-b-2 transition ${currentStep === 3 ? 'border-[#3D3F96] text-[#3D3F96]' : 'border-transparent text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${currentStep >= 3 ? 'bg-[#3D3F96] text-white font-bold' : 'bg-gray-150 text-gray-400'}`}>3</span>
            <span>Term & Timings</span>
          </button>
        </div>

        {/* Split Columns Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Active Workstation Step */}
          <div className="lg:col-span-2 space-y-6 bg-white min-h-[400px]">
            
            {/* STEP 1: CHOOSE DAILY ALLOWANCE & SLOTS */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <span className="text-[10px] text-[#3D3F96] font-black uppercase tracking-wider block mb-2.5">1. Choose Daily Allowance</span>
                  <div className="grid grid-cols-3 gap-3 bg-gray-50 p-1.5 rounded-2xl border border-gray-200/60 shadow-inner">
                    {[1, 2, 3].map((num) => (
                      <button key={num} onClick={() => setMealsPerDayLimit(num)} className={`py-2.5 rounded-xl text-xs font-bold transition-all ${mealsPerDayLimit === num ? 'bg-[#3D3F96] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}>
                        {num === 1 && "1 Meal / Day"}{num === 2 && "2 Meals / Day"}{num === 3 && "Full Day (3 Meals)"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2.5">2. Toggle Specific Meal Slots</span>
                  <div className="grid grid-cols-3 gap-3">
                    {['breakfast', 'lunch', 'dinner'].map((slot) => {
                      const isActive = selectedSlots.includes(slot);
                      const isLocked = mealsPerDayLimit === 3;
                      return (
                        <button key={slot} onClick={() => !isLocked && handleSlotToggle(slot)} className={`border p-4 rounded-2xl text-left transition flex items-center justify-between ${isActive ? 'border-[#3D3F96] bg-indigo-50/10 font-bold text-gray-900' : 'border-gray-200 text-gray-500 hover:border-gray-300'} ${isLocked ? 'cursor-default opacity-85' : ''}`}>
                          <span className="capitalize text-xs">{slot}</span>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isActive ? 'bg-[#3D3F96] border-transparent' : 'border-gray-300'}`}>{isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-end">
                  <button disabled={!isSlotSelectionValid} onClick={() => setCurrentStep(2)} className={`inline-flex items-center gap-2 bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition ${!isSlotSelectionValid ? 'opacity-55 cursor-not-allowed' : 'active:scale-95'}`}>
                    <span>Proceed to Plating →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PLATE PLATING (WITH DAY-WISE MONDAY-SUNDAY AGENDAS) */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 7-DAY CALENDAR WEEK TIMELINE SHORTCUTS */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">1. Select Day of the Week</span>
                  <div className="flex gap-2 bg-gray-50 p-1 rounded-2xl border border-gray-150 shadow-inner overflow-x-auto scrollbar-none">
                    {daysOfWeek.map((day) => {
                      const isDayActive = activeDayTab === day.id;
                      return (
                        <button
                          key={day.id}
                          onClick={() => setActiveDayTab(day.id)}
                          className={`flex-1 min-w-[50px] py-2 rounded-xl text-xs font-bold transition-all capitalize ${
                            isDayActive 
                              ? 'bg-[#3D3F96] text-white shadow-md' 
                              : 'text-gray-500 hover:text-gray-900'
                          }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-Header Slot Desk Tabs for active Day */}
                <div className="flex justify-between items-center border-b border-gray-150 pb-2">
                  <div className="flex gap-2">
                    {selectedSlots.map((slot) => (
                      <button key={slot} onClick={() => setActiveSlotTab(slot)} className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${activeSlotTab === slot ? 'bg-gray-900 text-white shadow-sm' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>{slot} Desk</button>
                    ))}
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Plating: <strong className="text-gray-800 capitalize">{activeDayTab} ({activeSlotTab})</strong>
                  </span>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="w-full md:max-w-xs relative bg-gray-50 rounded-xl p-2 flex items-center border border-gray-200">
                      <input type="text" value={modalSearchQuery} onChange={(e) => setModalSearchQuery(e.target.value)} placeholder="Search ingredients..." className="w-full pr-2 text-xs font-semibold focus:outline-none bg-transparent" />
                    </div>

                    <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-200 shadow-inner w-full md:w-auto">
                      {['bases', 'proteins', 'fibers'].map((cat) => (
                        <button key={cat} onClick={() => { setActiveIngredientCategory(cat); setModalSearchQuery(''); }} className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold capitalize transition-all ${activeIngredientCategory === cat ? 'bg-[#3D3F96] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                          {cat === 'bases' && "Bases / Carbs"}{cat === 'proteins' && "Clean Proteins"}{cat === 'fibers' && "Green Fibers"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-[230px] overflow-y-auto pr-1">
                    {filteredIngredients.length === 0 ? (
                      <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-150 border-dashed"><p className="text-xs text-gray-400">No ingredients match your search.</p></div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {filteredIngredients.map((item) => {
                          let isSelected = false;
                          const currentPlate = weeklyCustomMeals[activeDayTab][activeSlotTab];
                          if (activeIngredientCategory === 'bases') isSelected = currentPlate.base === item.id;
                          if (activeIngredientCategory === 'proteins') isSelected = currentPlate.protein === item.id;
                          if (activeIngredientCategory === 'fibers') isSelected = currentPlate.fiber === item.id;

                          const handleSelect = () => {
                            let key = 'base';
                            if (activeIngredientCategory === 'proteins') key = 'protein';
                            if (activeIngredientCategory === 'fibers') key = 'fiber';
                            handleIngredientChange(activeDayTab, activeSlotTab, key, item.id);
                          };

                          return (
                            <IngredientCard key={item.id} item={item} isSelected={isSelected} activeCategory={activeIngredientCategory} onSelect={handleSelect} />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100 flex justify-between">
                  <button onClick={() => setCurrentStep(1)} className="px-5 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition">Back</button>
                  <button onClick={() => setCurrentStep(3)} className="inline-flex items-center gap-2 bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-black px-6 py-3 rounded-xl shadow-md transition active:scale-95">
                    <span>Proceed to Schedule →</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: DYNAMIC TIMINGS + COMPREHENSIVE WEEKLY MENU RECEIPT */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                
                {/* 1. Drop-off Timings */}
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2.5">1. Adjust Timing Preferences</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {selectedSlots.map((slot) => (
                      <div key={slot} className="bg-gray-50 p-3 rounded-xl border border-gray-150">
                        <label className="block text-[10px] text-[#3D3F96] font-bold uppercase mb-1 capitalize">{slot} Drop-off</label>
                        <select value={deliveryTimes[slot]} onChange={(e) => handleTimeChange(slot, e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg p-2 text-xs font-semibold text-gray-700">
                          {slot === 'breakfast' && <><option value="7:30 AM">7:30 AM</option><option value="8:00 AM">8:00 AM</option><option value="8:30 AM">8:30 AM</option></>}
                          {slot === 'lunch' && <><option value="12:30 PM">12:30 PM</option><option value="1:00 PM">1:00 PM</option><option value="1:30 PM">1:30 PM</option></>}
                          {slot === 'dinner' && <><option value="7:30 PM">7:30 PM</option><option value="8:00 PM">8:00 PM</option><option value="8:30 PM">8:30 PM</option></>}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. COMPREHENSIVE DAY-WISE SELECTION SUMMARY RECEIPT */}
                <div className="border-t border-gray-100 pt-5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">2. Review Your Weekly Custom Menu</span>
                  
                  {/* Scrollable Receipt Panel */}
                  <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                    {daysOfWeek.map((day) => (
                      <div key={day.id} className="text-xs pb-2 border-b border-gray-150 last:border-b-0 last:pb-0">
                        {/* Day Header */}
                        <strong className="text-gray-900 font-bold block mb-1 text-[11px]">{day.fullLabel} Menu:</strong>
                        
                        {/* List only selected slots for this day */}
                        <div className="space-y-1 pl-3 text-gray-600">
                          {selectedSlots.map((slot) => {
                            const meal = weeklyCustomMeals[day.id][slot];
                            const base = getIngredient('bases', meal.base);
                            const protein = getIngredient('proteins', meal.protein);
                            const fiber = getIngredient('fibers', meal.fiber);

                            return (
                              <div key={slot} className="flex flex-wrap items-center gap-1">
                                <span className="capitalize font-semibold text-[#3D3F96]">{slot}:</span>
                                <span>{base.name} + {protein.name} + {fiber.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Wizard Action Footer */}
                <div className="pt-6 border-t border-gray-100 flex justify-between">
                  <button onClick={() => setCurrentStep(2)} className="px-5 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition">Back to Plating</button>
                  <button onClick={() => { onAddToCart(finalCalculatedCost, `Custom Program (${daysMultiplier} Days)`); onClose(); }} className="bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold px-8 py-3.5 rounded-xl shadow-md transition active:scale-95 text-xs">Confirm & Add Program</button>
                </div>
              </div>
            )}

          </div>

          {/* Persistent Sidebar calculator with FULL DAYS SYSTEM INTACT */}
          <DiagnosticSidebar
            durationMode={durationMode}
            setDurationMode={setDurationMode}
            customDaysCount={customDaysCount}
            setCustomDaysCount={setCustomDaysCount}
            dailyCalories={dailyCalories}
            dailyCarbs={dailyCarbs}
            dailyProtein={dailyProtein}
            selectedSlots={selectedSlots}
            customMeals={weeklyCustomMeals[activeDayTab]} 
            getIngredient={getIngredient}
            discountRate={discountRate}
            savingsAmount={savingsAmount}
            daysMultiplier={daysMultiplier}
            finalCalculatedCost={finalCalculatedCost}
            onCancel={onClose}
            onConfirm={() => { onAddToCart(finalCalculatedCost, `Custom Program (${daysMultiplier} Days)`); onClose(); }}
            activeDayLabel={activeDayTab} 
          />

        </div>

      </div>
    </div>
  );
}