"use client";

import React from 'react';
import {
    Utensils,
    Clock,
    Flame,
    CheckCircle2,
    Circle,
    Sparkles,
    AlertCircle,
    Sun,
    Coffee,
    Moon,
    Copy,
    RefreshCw,
    Filter
} from 'lucide-react';

const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";

const getMediaUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    return `${BASE_SERVER_URL}/${path.startsWith("/") ? path.substring(1) : path}`;
};

export default function CustomTiffinSlotsPicker({
    loaderData,
    selectedMeals,
    onToggleMealSlot,
    packageDays,
    selectedDayNumber,
    setSelectedDayNumber,
    dailySchedule,
    onSelectDayDish,
    onSyncWeekOneToAll,
    onSyncCurrentDayToAll,
    getDayOfWeekName,
    universalDeliveryTimes,
    onDeliveryTimeChange,
    dietaryType // Filter based on Step 3
}) {
    const slots = ['breakfast', 'lunch', 'dinner'];
    const activeSlotsList = slots.filter((s) => selectedMeals[s]);

    const getSlotIcon = (slotKey) => {
        if (slotKey === 'breakfast') return <Coffee size={17} />;
        if (slotKey === 'lunch') return <Sun size={17} />;
        return <Moon size={17} />;
    };

    const renderDietBadge = (type) => {
        const isVeg = type === 'Veg';
        const isNonVeg = type === 'Non Veg';
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border bg-white ${
                isVeg ? 'text-emerald-600 border-emerald-100' : isNonVeg ? 'text-rose-600 border-rose-100' : 'text-amber-600 border-amber-100'
            }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : isNonVeg ? 'bg-rose-500' : 'bg-amber-500'}`} />
                {type}
            </span>
        );
    };

    // Filter food list based on Step 3 Dietary Selection
    const filterDishesByDiet = (dishes = []) => {
        if (!dietaryType) return dishes;
        const currentDiet = dietaryType.toLowerCase().trim();

        return dishes.filter((dish) => {
            const dishDiet = (dish.dietType || "").toLowerCase().trim();
            if (currentDiet === 'veg') {
                return dishDiet === 'veg' || dishDiet === 'jain';
            }
            if (currentDiet === 'egg') {
                return dishDiet === 'egg' || dishDiet === 'veg' || dishDiet === 'jain';
            }
            if (currentDiet === 'jain') {
                return dishDiet === 'jain' || dishDiet === 'veg';
            }
            return true;
        });
    };

    // Days array: [1, 2, 3, ... packageDays]
    const daysArray = Array.from({ length: packageDays }, (_, i) => i + 1);
    const currentDayOfWeek = getDayOfWeekName(selectedDayNumber);

    return (
        <div className="space-y-6 text-left">

            {/* 1. ACTIVE MEAL SLOTS TOGGLES (BREAKFAST, LUNCH, DINNER) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                            Step 3 • Active Meal Slots
                        </span>
                        <p className="text-xs text-slate-500 font-medium">
                            Choose which daily meal slots to include in your package
                        </p>
                    </div>
                    <span className="text-[10px] font-bold text-[#3d3f96] bg-indigo-50 px-2.5 py-1 rounded-lg">
                        {activeSlotsList.length} Slot(s) Active
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {slots.map((slotKey) => {
                        const isSelected = !!selectedMeals[slotKey];
                        const allDishes = loaderData?.[slotKey]?.foodList || [];
                        const filteredCount = filterDishesByDiet(allDishes).length;

                        return (
                            <div
                                key={slotKey}
                                onClick={() => onToggleMealSlot(slotKey)}
                                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                                    isSelected
                                        ? 'bg-indigo-50/50 border-[#3d3f96] shadow-sm'
                                        : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                                        isSelected ? 'bg-[#3d3f96] text-white shadow-xs' : 'bg-white text-slate-400 border border-slate-200'
                                    }`}>
                                        {getSlotIcon(slotKey)}
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                                            {slotKey}
                                        </h4>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {filteredCount} Items Available
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    {isSelected ? (
                                        <CheckCircle2 size={22} className="text-[#3d3f96] fill-indigo-100" />
                                    ) : (
                                        <Circle size={22} className="text-slate-300" />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 2. UNIVERSAL DELIVERY TIME WINDOWS FOR ACTIVE SLOTS */}
            {activeSlotsList.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                        Universal Delivery Time Windows
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {activeSlotsList.map((slotKey) => {
                            const timeSlots = loaderData?.[slotKey]?.deliverySlots || ['08:00 AM - 09:00 AM', '01:00 PM - 02:00 PM', '08:00 PM - 09:00 PM'];
                            const paramKey = `${slotKey}Time`;

                            return (
                                <div key={slotKey} className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-1.5">
                                    <span className="text-[10px] font-extrabold text-slate-700 uppercase flex items-center gap-1">
                                        <Clock size={12} className="text-[#3d3f96]" /> {slotKey} Time
                                    </span>
                                    <select
                                        value={universalDeliveryTimes[paramKey] || timeSlots[0]}
                                        onChange={(e) => onDeliveryTimeChange(paramKey, e.target.value)}
                                        className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-xl px-2.5 py-2 outline-none focus:border-[#3d3f96] cursor-pointer"
                                    >
                                        {timeSlots.map((timeOpt) => (
                                            <option key={timeOpt} value={timeOpt}>
                                                {timeOpt}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 3. N-DAY DISH CUSTOMIZATION FILTERED BY DIETARY SELECTION */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">
                                Step 4 • Customize Daily Meals
                            </span>
                            <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1 uppercase">
                                <Filter size={9} /> Showing {dietaryType} Items Only
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium pt-0.5">
                            Pick dishes for each day individually, or sync across all {packageDays} days.
                        </p>
                    </div>

                    {/* Action Sync Controls */}
                    <div className="flex items-center gap-2 flex-wrap">
                        {packageDays > 7 && (
                            <button
                                type="button"
                                onClick={onSyncWeekOneToAll}
                                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 text-[#3d3f96] hover:bg-indigo-100 transition-all cursor-pointer shrink-0"
                            >
                                <RefreshCw size={13} />
                                <span>Sync Week 1 Cycle to All</span>
                            </button>
                        )}

                        <button
                            type="button"
                            onClick={onSyncCurrentDayToAll}
                            className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shrink-0"
                        >
                            <Copy size={13} />
                            <span>Copy Day {selectedDayNumber} to All</span>
                        </button>
                    </div>
                </div>

                {/* Day Buttons Carousel (Day 1..N) */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                    {daysArray.map((dayNum) => {
                        const isSelected = selectedDayNumber === dayNum;
                        const dayWeekName = getDayOfWeekName(dayNum);
                        const dayConfig = dailySchedule[dayNum] || {};
                        const isConfigured = activeSlotsList.every((slot) => !!dayConfig[slot]);

                        return (
                            <button
                                key={dayNum}
                                type="button"
                                onClick={() => setSelectedDayNumber(dayNum)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border flex flex-col items-center min-w-[72px] ${
                                    isSelected
                                        ? 'bg-[#3d3f96] text-white border-[#3d3f96] font-black shadow-sm'
                                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                }`}
                            >
                                <span className="text-[11px] font-black">Day {dayNum}</span>
                                <span className={`text-[9px] uppercase tracking-wider font-semibold ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {dayWeekName.slice(0, 3)}
                                </span>
                                {isConfigured && (
                                    <span className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Slot-wise Filtered Dish Cards (Scrollable: 6 items visible) */}
                {activeSlotsList.length > 0 ? (
                    <div className="space-y-4">
                        {activeSlotsList.map((slotKey) => {
                            const slotData = loaderData?.[slotKey] || { foodList: [] };
                            const rawDishes = slotData.foodList || [];
                            const availableDishes = filterDishesByDiet(rawDishes);
                            const currentSelectedDishId = dailySchedule[selectedDayNumber]?.[slotKey];

                            return (
                                <div key={slotKey} className="border border-slate-200/80 rounded-2xl overflow-hidden bg-slate-50/30">
                                    <div className="bg-slate-100/70 px-4 py-3 border-b border-slate-200/80 flex items-center justify-between">
                                        <h4 className="text-xs font-black text-[#3d3f96] uppercase tracking-wider flex items-center gap-1.5">
                                            {getSlotIcon(slotKey)} {slotKey} Slot
                                            <span className="text-[10px] text-slate-500 font-normal">
                                                (Day {selectedDayNumber} • {currentDayOfWeek})
                                            </span>
                                        </h4>
                                        <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md">
                                            Pick 1 Dish
                                        </span>
                                    </div>

                                    {/* Scrollable Container (Shows 6 dishes, scrolls smoothly for more) */}
                                    <div className="p-3.5">
                                        {availableDishes.length === 0 ? (
                                            <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                                <AlertCircle size={14} className="text-amber-500" />
                                                No {dietaryType.toUpperCase()} dishes available in {slotKey}.
                                            </div>
                                        ) : (
                                            <div className="max-h-[300px] overflow-y-auto pr-1.5 space-y-2.5 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-2.5 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-slate-100">
                                                {availableDishes.map((dish) => {
                                                    const dishId = dish.id || dish._id;
                                                    const isSelected = currentSelectedDishId === dishId;

                                                    return (
                                                        <div
                                                            key={dishId}
                                                            onClick={() => onSelectDayDish(selectedDayNumber, slotKey, dishId)}
                                                            className={`p-3 rounded-2xl border transition-all flex items-start gap-3 cursor-pointer ${
                                                                isSelected
                                                                    ? 'bg-white border-[#3d3f96] ring-1 ring-[#3d3f96] shadow-xs'
                                                                    : 'bg-white/80 border-slate-200 hover:border-slate-300'
                                                            }`}
                                                        >
                                                            <div className="pt-0.5 shrink-0">
                                                                {isSelected ? (
                                                                    <CheckCircle2 size={18} className="text-[#3d3f96] fill-indigo-50" />
                                                                ) : (
                                                                    <Circle size={18} className="text-slate-300" />
                                                                )}
                                                            </div>

                                                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                                                <img
                                                                    src={getMediaUrl(dish.imageUrl) || PLACEHOLDER_IMAGE}
                                                                    alt={dish.name}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                                                />
                                                            </div>

                                                            <div className="flex-1 min-w-0 space-y-0.5">
                                                                <div className="flex items-center justify-between gap-1">
                                                                    <strong className="text-xs font-black text-slate-800 truncate" title={dish.name}>
                                                                        {dish.name}
                                                                    </strong>
                                                                    {renderDietBadge(dish.dietType)}
                                                                </div>

                                                                {dish.foodEffectCategory && (
                                                                    <span className="inline-flex items-center gap-1 text-[9px] font-black text-red-600 uppercase bg-red-50 px-1.5 py-0.5 rounded">
                                                                        <Sparkles size={9} /> {dish.foodEffectCategory}
                                                                    </span>
                                                                )}

                                                                <div className="flex items-center justify-between pt-0.5">
                                                                    <span className="text-xs font-black text-slate-900 font-mono">₹{dish.price}</span>
                                                                    <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                                                                        <Flame size={10} className="text-amber-500" /> {dish.cal || dish.calories || 0} Cal
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="py-6 text-center text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl font-bold">
                        Please activate at least one meal slot (Breakfast, Lunch, or Dinner) above.
                    </div>
                )}
            </div>

        </div>
    );
}