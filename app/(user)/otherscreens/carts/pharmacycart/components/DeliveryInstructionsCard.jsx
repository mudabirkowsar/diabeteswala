// components/DeliveryInstructionsCard.jsx
"use client";
import React from 'react';
import { MessageSquareText } from 'lucide-react';

const QUICK_INSTRUCTIONS = [
  "Leave at door / security",
  "Call upon arrival",
  "Do not ring doorbell",
  "Deliver to patient directly"
];

export default function DeliveryInstructionsCard({ instructions, setInstructions }) {
  const handleChipClick = (chip) => {
    if (!instructions) {
      setInstructions(chip);
    } else if (instructions.includes(chip)) {
      setInstructions(
        instructions
          .replace(chip, "")
          .replace(/,\s*,/g, ",")
          .replace(/^,\s*|,\s*$/g, "")
          .trim()
      );
    } else {
      setInstructions(`${instructions.trim()}, ${chip}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3">
      <div className="flex items-center gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center shrink-0">
          <MessageSquareText size={16} />
        </div>
        <div>
          <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
            Delivery Instructions
          </h3>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-400">
            Note for delivery rider (e.g. gate code, drop-off note)
          </p>
        </div>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {QUICK_INSTRUCTIONS.map((chip, idx) => {
          const isSelected = instructions?.includes(chip);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(chip)}
              className={`text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#3d3f96] text-white border-[#3d3f96]"
                  : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {isSelected ? "✓ " : "+ "}{chip}
            </button>
          );
        })}
      </div>

      {/* Custom Textarea */}
      <textarea
        rows={2}
        placeholder="Type any specific landmark, gate details, or instructions..."
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        maxLength={250}
        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#3d3f96] focus:bg-white transition-all resize-none"
      />
      <div className="flex justify-end text-[9px] font-bold text-slate-400">
        {instructions.length}/250 characters
      </div>
    </div>
  );
}