"use client";

import React, { useState } from 'react';
import {
    Clock,
    Utensils,
    Flame,
    CheckCircle2,
    Circle,
    Copy,
    Check,
    HelpCircle,
    ChevronDown,
    MessageSquareText
} from 'lucide-react';

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DEFAULT_TIME_SLOTS = {
    breakfast: ['07:00 AM - 08:00 AM', '08:00 AM - 09:00 AM', '09:00 AM - 10:00 AM'],
    lunch: ['12:00 PM - 01:00 PM', '01:00 PM - 02:00 PM', '02:00 PM - 03:00 PM'],
    dinner: ['07:00 PM - 08:00 PM', '08:00 PM - 09:00 PM', '09:00 PM - 10:00 PM']
};

export default function ScheduleCustomizer({
    plan,
    isMonthly,
    selectedWeek,
    setSelectedWeek,
    selectedDay,
    setSelectedDay,
    applyToAllWeeks,
    setApplyToAllWeeks,
    customizedSchedule,
    onSelectDish,
    onReplicateWeekToAll,
    deliveryTimes,
    onDeliveryTimeChange,
    specialInstructions,
    setSpecialInstructions,
    aggregatedTags
}) {
    const [showInstructions, setShowInstructions] = useState(false);

    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isEgg = type === 'Egg';
        const isNonVeg = type === 'Non Veg';

        return (
            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-white ${
                isVeg ? 'text-emerald-600 border-emerald-100' :
                isEgg ? 'text-amber-600 border-amber-100' :
                isNonVeg ? 'text-rose-600 border-rose-100' : 'text-slate-500 border-slate-100'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                    isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
                }`} />
                {type}
            </span>
        );
    };

    return (
        <div className="space-y-6 text-left">
            {/* Guide Accordion */}
            <div className="border border-indigo-100 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-50/70 via-slate-50/60 to-red-50/40">
                <button
                    type="button"
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="w-full p-4 flex items-center justify-between text-left hover:bg-white/50 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2.5 text-[#3d3f96]">
                        <div className="w-7 h-7 rounded-lg bg-indigo-100/80 flex items-center justify-center shrink-0">
                            <HelpCircle size={16} className="text-[#3d3f96]" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                How Subscription Customization Works
                            </h3>
                            <p className="text-[10px] text-slate-500 font-medium">
                                {showInstructions ? "Click to collapse instructions" : "Click to view simple booking steps"}
                            </p>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full bg-white border border-indigo-100 flex items-center justify-center transition-transform duration-300 ${
                        showInstructions ? 'rotate-180 bg-indigo-50 text-[#3d3f96]' : 'text-slate-400'
                    }`}>
                        <ChevronDown size={14} />
                    </div>
                </button>

                {showInstructions && (
                    <div className="p-4 pt-1 border-t border-indigo-50/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left animate-in fade-in duration-200">
                        <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 space-y-1">
                            <span className="inline-flex items-center gap-1 bg-indigo-100/70 text-[#3d3f96] text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Step 1 • Timings</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-snug">Set preferred daily delivery window for each slot.</p>
                        </div>
                        <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 space-y-1">
                            <span className="inline-flex items-center gap-1 bg-red-100/70 text-red-700 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Step 2 • 1 Dish / Slot</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-snug">Choose strictly 1 dish per active slot each day.</p>
                        </div>
                        <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 space-y-1">
                            <span className="inline-flex items-center gap-1 bg-amber-100/70 text-amber-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Step 3 • Sync Weeks</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-snug">Sync Week 1 to all 4 weeks or customize separately.</p>
                        </div>
                        <div className="bg-white/95 p-3 rounded-xl border border-indigo-50 space-y-1">
                            <span className="inline-flex items-center gap-1 bg-emerald-100/70 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">Step 4 • Pay &amp; Start</span>
                            <p className="text-[11px] text-slate-600 font-medium leading-snug">Choose address, complete online payment, and enjoy.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Delivery Time Selectors */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                    Universal Delivery Time Preferences
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {plan?.permittedSlots?.map((slot) => {
                        const slotKey = slot.toLowerCase();
                        const options = DEFAULT_TIME_SLOTS[slotKey] || ['08:00 AM - 09:00 AM', '01:00 PM - 02:00 PM', '08:00 PM - 09:00 PM'];
                        return (
                            <div key={slot} className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-1.5">
                                <span className="text-[10px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                                    <Clock size={12} className="text-[#3d3f96]" /> {slot} Time
                                </span>
                                <select
                                    value={deliveryTimes[slotKey] || options[0]}
                                    onChange={(e) => onDeliveryTimeChange(slotKey, e.target.value)}
                                    className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-[#3d3f96] cursor-pointer"
                                >
                                    {options.map((timeOpt) => (
                                        <option key={timeOpt} value={timeOpt}>{timeOpt}</option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Week & Day Tabs */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Customize Daily Meal Schedule
                        </span>
                        <p className="text-xs text-slate-500 font-medium">Select 1 dish per slot for each day.</p>
                    </div>

                    {isMonthly && (
                        <button
                            type="button"
                            onClick={() => {
                                setApplyToAllWeeks(!applyToAllWeeks);
                                if (!applyToAllWeeks) onReplicateWeekToAll();
                            }}
                            className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                                applyToAllWeeks ? 'bg-indigo-50 border-indigo-200 text-[#3d3f96]' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}
                        >
                            {applyToAllWeeks ? <Check size={14} className="text-[#3d3f96]" /> : <Copy size={13} />}
                            <span>Sync across all 4 weeks</span>
                        </button>
                    )}
                </div>

                {isMonthly && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
                        {[1, 2, 3, 4].map((weekNum) => (
                            <button
                                key={weekNum}
                                type="button"
                                onClick={() => setSelectedWeek(weekNum)}
                                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                                    selectedWeek === weekNum ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-100'
                                }`}
                            >
                                Week {weekNum}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                    {DAYS_OF_WEEK.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => setSelectedDay(day)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                                selectedDay === day ? 'bg-red-50 text-red-600 border-red-200 font-black shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-100'
                            }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            {/* Slot Dish Radios */}
            <div className="space-y-4">
                {plan?.permittedSlots?.map((slot) => {
                    const slotKey = slot.toLowerCase();
                    const dishes = plan?.slotDishes?.[slotKey] || [];
                    if (dishes.length === 0) return null;

                    const currentSelectedDishId = customizedSchedule[selectedWeek]?.[selectedDay]?.[slotKey];

                    return (
                        <div key={slot} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/30">
                            <div className="bg-slate-100/60 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                                <h4 className="text-xs font-black text-[#3d3f96] uppercase tracking-wider flex items-center gap-1.5">
                                    <Utensils size={14} /> {slot} Slot
                                    <span className="text-[10px] text-slate-400 font-normal">({selectedDay} • W{selectedWeek})</span>
                                </h4>
                                <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">Pick 1 Dish</span>
                            </div>

                            <div className="p-3.5 space-y-2.5">
                                {dishes.map((dishItem) => {
                                    const dishObj = dishItem.itemId || {};
                                    const dishId = dishObj._id || dishItem._id;
                                    const isSelected = currentSelectedDishId === dishId;

                                    return (
                                        <div
                                            key={dishItem._id || dishId}
                                            onClick={() => onSelectDish(slotKey, dishId)}
                                            className={`p-3 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer ${
                                                isSelected ? 'bg-white border-[#3d3f96] shadow-sm ring-1 ring-[#3d3f96]' : 'bg-white/80 border-slate-100 hover:border-slate-300'
                                            }`}
                                        >
                                            <div className="shrink-0">
                                                {isSelected ? <CheckCircle2 size={20} className="text-[#3d3f96] fill-indigo-50" /> : <Circle size={20} className="text-slate-300" />}
                                            </div>
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                <img
                                                    src={dishObj.imageUrl?.startsWith("http") ? dishObj.imageUrl : `${BASE_SERVER_URL}/${dishObj.imageUrl?.replace(/^\//, '')}` || PLACEHOLDER_IMAGE}
                                                    alt={dishObj.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                <div className="flex items-center gap-2 justify-between">
                                                    <strong className="text-xs font-black text-slate-800 truncate">{dishObj.name}</strong>
                                                    {renderDietBadge(dishObj.dietType)}
                                                </div>
                                                <div className="flex items-center justify-between pt-0.5">
                                                    <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                                                        <Flame size={11} className="text-amber-500" /> {dishObj.calories || 0} Kcal
                                                    </span>
                                                    {dishObj.foodEffectCategory && (
                                                        <span className="text-[9px] font-black text-red-600 uppercase">{dishObj.foodEffectCategory}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Health Tags */}
            {aggregatedTags?.length > 0 && (
                <div className="space-y-3 pt-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Health Filters Applied</span>
                    <div className="flex flex-wrap gap-1.5">
                        {aggregatedTags.map((tag) => (
                            <span key={tag} className="px-2.5 py-1 bg-indigo-50/50 text-[#3d3f96] text-[10px] font-bold rounded-lg uppercase">#{tag}</span>
                        ))}
                    </div>
                </div>
            )}

            {/* Special Instructions Note */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-1.5">
                        <MessageSquareText size={13} className="text-[#3d3f96]" /> Special Instructions / Notes
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">Optional</span>
                </div>
                <div className="relative">
                    <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="e.g. Less spicy, avoid extra salt, ring bell..."
                        rows={3}
                        maxLength={300}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-800 outline-none focus:bg-white focus:border-[#3d3f96] resize-none"
                    />
                    <div className="absolute bottom-2.5 right-3 text-[9px] font-bold text-slate-400">{specialInstructions.length}/300</div>
                </div>
            </div>
        </div>
    );
}