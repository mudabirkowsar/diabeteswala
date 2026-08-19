'use client';

import React from 'react';

export default function DiagnosticSidebar({
  durationMode,
  setDurationMode,
  customDaysCount,
  setCustomDaysCount,
  dailyCalories,
  dailyCarbs,
  dailyProtein,
  selectedSlots,
  customMeals,
  getIngredient,
  discountRate,
  savingsAmount,
  daysMultiplier,
  finalCalculatedCost,
  onCancel,
  onConfirm
}) {
  return (
    <div className="border border-gray-100 rounded-2xl p-5 bg-gray-50/50 flex flex-col justify-between shadow-inner h-full">
      <div>
        
        {/* Step E: Program Cycles selection */}
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">Program Cycles</span>
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-xl border border-gray-200">
            {['weekly', 'monthly', 'custom'].map((mode) => (
              <button
                key={mode}
                onClick={() => setDurationMode(mode)}
                className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition-colors ${
                  durationMode === mode 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {durationMode === 'custom' && (
            <div className="bg-white p-3 rounded-xl border border-gray-150">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-600 mb-1.5">
                <span>DAYS DIRECTORY:</span>
                <span className="text-[#3D3F96] bg-indigo-50 px-2 py-0.5 rounded">{customDaysCount} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={customDaysCount}
                onChange={(e) => setCustomDaysCount(parseInt(e.target.value))}
                className="w-full accent-[#3D3F96]"
              />
            </div>
          )}
        </div>

        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">Plate Diagnostics</span>
        
        {/* Real-time cumulative indicators */}
        <div className="space-y-2 mb-6">
          <div className="bg-white p-2.5 rounded-xl border border-gray-150 flex justify-between items-center shadow-sm text-xs">
            <span className="text-[9px] text-gray-400 font-bold uppercase">Energy</span>
            <strong className="text-gray-800">{dailyCalories} Kcal</strong>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-150 flex justify-between items-center shadow-sm text-xs">
            <span className="text-[9px] text-gray-400 font-bold uppercase">Net Carbs</span>
            <strong className={`text-xs ${dailyCarbs > 70 ? 'text-rose-500 font-black' : 'text-[#00B574]'}`}>
              {dailyCarbs}g
            </strong>
          </div>
          <div className="bg-white p-2.5 rounded-xl border border-gray-150 flex justify-between items-center shadow-sm text-xs">
            <span className="text-[9px] text-gray-400 font-bold uppercase">Protein</span>
            <strong className="text-gray-800">{dailyProtein}g</strong>
          </div>
        </div>

        {dailyCarbs > 70 && (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-3 rounded-xl leading-relaxed">
            <strong>⚠️ Elevated Carbs:</strong> Your selections contain over 70g carbs daily. Swap to Cauliflower rice or Tofu to lower glycemic load.
          </div>
        )}

        {/* Selected Plate summary review */}
        <div className="space-y-2 text-[10px] pt-4 border-t border-gray-200/60 mt-4 text-gray-500">
          <span className="block font-bold uppercase text-gray-400">Selected Meals</span>
          {['breakfast', 'lunch', 'dinner'].map((slot) => {
            const isActive = selectedSlots.includes(slot);
            const meal = customMeals[slot];
            return (
              <div key={slot} className="flex justify-between">
                <span className="capitalize">{slot}:</span>
                <span className="text-gray-800 truncate font-semibold max-w-[120px]">
                  {isActive ? `${getIngredient('bases', meal.base).name}` : 'Not Selected'}
                </span>
              </div>
            );
          })}
        </div>

      </div>

      {/* Checkout pricing panel */}
      <div className="border-t border-gray-200 pt-5 mt-6">
        {discountRate > 0 && (
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span>Term Savings ({Math.round(discountRate * 100)}%):</span>
            <span className="text-emerald-600 font-bold">-₹{savingsAmount}</span>
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block leading-none">Final Payable Rate</span>
            <span className="text-[10px] text-gray-400 mt-1 block">for {daysMultiplier} days total program</span>
          </div>
          <span className="text-2xl font-black text-gray-950">₹{finalCalculatedCost}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-200 rounded-xl text-center text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold py-3 rounded-xl text-center text-xs transition shadow-md active:scale-95"
          >
            Add Custom
          </button>
        </div>
      </div>

    </div>
  );
}