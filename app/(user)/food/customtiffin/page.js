"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChefHat,
  Calendar,
  Clock,
  Utensils,
  Sun,
  SunMedium,
  Moon,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  HeartPulse,
  Leaf,
  Layers,
  Plus,
  Minus,
  FileText,
  Check
} from 'lucide-react';

// --- SINGLE FOOD LIST PER MEAL FROM BACKEND ---
const MEAL_CONFIG = {
  breakfast: {
    id: "breakfast",
    title: "Breakfast",
    subtitle: "Low-GI morning clinical meals",
    icon: Sun,
    accentBg: "bg-amber-50",
    accentText: "text-amber-600",
    borderAccent: "border-amber-100",
    deliverySlots: ["07:30 AM - 08:30 AM", "08:30 AM - 09:30 AM", "09:30 AM - 10:30 AM"],
    foodList: [
      { id: "bf_1", name: "Bajra & Methi Thepla with Fresh Low-Fat Curd", price: 120, cal: 260, gi: "Low" },
      { id: "bf_2", name: "Sprouted Moong & Paneer Chilla (2 pcs)", price: 130, cal: 240, gi: "Very Low" },
      { id: "bf_3", name: "Oats & Vegetable Steamed Idli with Sambar", price: 110, cal: 220, gi: "Low" },
      { id: "bf_4", name: "Ragi Dosa with Vegetable Korma Stew", price: 125, cal: 250, gi: "Low" },
      { id: "bf_5", name: "Egg White Scramble with 2 Multigrain Diabetic Toasts", price: 140, cal: 270, gi: "Low" }
    ]
  },
  lunch: {
    id: "lunch",
    title: "Lunch",
    subtitle: "Macro-balanced midday meals",
    icon: SunMedium,
    accentBg: "bg-red-50",
    accentText: "text-red-600",
    borderAccent: "border-red-100",
    deliverySlots: ["12:00 PM - 01:00 PM", "01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM"],
    foodList: [
      { id: "ln_1", name: "Multigrain Rotis (3 pcs) with Methi Palak Paneer & Yellow Moong Dal", price: 170, cal: 420, gi: "Low" },
      { id: "ln_2", name: "Jowar Rotis (2 pcs) with Lauki Chana Dal & Jeera Raita", price: 160, cal: 390, gi: "Very Low" },
      { id: "ln_3", name: "Brown Rice & Quinoa Bowl with High-Fiber Chana Masala", price: 150, cal: 380, gi: "Medium-Low" },
      { id: "ln_4", name: "Bajra Rotla with Bhindi Masala & Panchmel Dal", price: 165, cal: 410, gi: "Low" },
      { id: "ln_5", name: "DiabetesWala Full Clinical Thali (Low-Oil Paneer, Dal, 3 Rotis & Salad)", price: 190, cal: 450, gi: "Low" }
    ]
  },
  dinner: {
    id: "dinner",
    title: "Dinner",
    subtitle: "Light low insulin spike evening meals",
    icon: Moon,
    accentBg: "bg-indigo-50",
    accentText: "text-[#3d3f96]",
    borderAccent: "border-indigo-100",
    deliverySlots: ["07:00 PM - 08:00 PM", "08:00 PM - 09:00 PM", "09:00 PM - 10:00 PM"],
    foodList: [
      { id: "dn_1", name: "Ragi Phulkas (2 pcs) with Tofu Capsicum Curry & Dal Broth", price: 160, cal: 340, gi: "Low" },
      { id: "dn_2", name: "Oats & Barley Rotis (2 pcs) with Moong Dal Soup & Roasted Salad", price: 150, cal: 320, gi: "Very Low" },
      { id: "dn_3", name: "Moong Dal & Quinoa Khichdi Bowl with Digestive Buttermilk", price: 140, cal: 310, gi: "Low" },
      { id: "dn_4", name: "Low-GI Paneer Bhurji with 2 Jowar Phulkas & Clear Broth", price: 170, cal: 360, gi: "Low" },
      { id: "dn_5", name: "High-Fiber Vegetable Dalia with Warm Tomato Rasam", price: 130, cal: 280, gi: "Very Low" }
    ]
  }
};

const QUICK_INSTRUCTION_TAGS = [
  "Strictly No Potato / Root Veggies",
  "Low Sodium / Less Salt",
  "Zero Refined Sugar",
  "Extra Green Salad",
  "Mild Spices Only",
  "Lactose / Dairy Conscious"
];

export default function CustomTiffinPage() {
  const router = useRouter();

  // Helper date generator (starts tomorrow)
  const getTomorrowDate = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Helper: compute End Date
  const calculateEndDateString = (startDateStr, daysCount) => {
    if (!startDateStr) return "";
    const [year, month, day] = startDateStr.split("-").map(Number);
    const start = new Date(year, month - 1, day);
    const days = Math.max(1, parseInt(daysCount, 10) || 1);
    start.setDate(start.getDate() + (days - 1));
    const y = start.getFullYear();
    const m = String(start.getMonth() + 1).padStart(2, '0');
    const d = String(start.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: compute number of days between two dates
  const calculateDaysBetween = (startStr, endStr) => {
    if (!startStr || !endStr) return 1;
    const [sy, sm, sd] = startStr.split("-").map(Number);
    const [ey, em, ed] = endStr.split("-").map(Number);
    const start = new Date(sy, sm - 1, sd);
    const end = new Date(ey, em - 1, ed);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  };

  // --- STATE 1: Selected Meal Slots ---
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: true,
    lunch: true,
    dinner: false
  });

  // --- STATE 2: Start Date & Package Days ---
  const [startDate, setStartDate] = useState(getTomorrowDate());
  const [packageDays, setPackageDays] = useState(10);
  const [endDate, setEndDate] = useState(() => calculateEndDateString(getTomorrowDate(), 10));

  // --- STATE 3: Dietary Style & Spice Level ---
  const [dietaryType, setDietaryType] = useState('veg');
  const [spiceLevel, setSpiceLevel] = useState('mild');

  // --- STATE 4: Single Selected Food & Delivery Slot per Meal ---
  const [selectedFoods, setSelectedFoods] = useState({
    breakfast: MEAL_CONFIG.breakfast.foodList[0].id,
    lunch: MEAL_CONFIG.lunch.foodList[0].id,
    dinner: MEAL_CONFIG.dinner.foodList[0].id
  });

  const [deliverySlots, setDeliverySlots] = useState({
    breakfast: "08:30 AM - 09:30 AM",
    lunch: "12:00 PM - 01:00 PM",
    dinner: "07:00 PM - 08:00 PM"
  });

  // --- STATE 5: Single Common Clinical Note ---
  const [commonClinicalNotes, setCommonClinicalNotes] = useState("Keep salt and oil minimal, strictly no potato");

  // Toggle meal selection
  const handleMealToggle = (mealKey) => {
    setSelectedMeals(prev => {
      const updated = { ...prev, [mealKey]: !prev[mealKey] };
      const hasAtLeastOne = Object.values(updated).some(Boolean);
      if (!hasAtLeastOne) return prev;
      return updated;
    });
  };

  // Package days handlers
  const handlePackageDaysChange = (newDays) => {
    const validDays = Math.max(1, Math.min(180, parseInt(newDays, 10) || 1));
    setPackageDays(validDays);
    setEndDate(calculateEndDateString(startDate, validDays));
  };

  const handleStartDateChange = (newStart) => {
    setStartDate(newStart);
    setEndDate(calculateEndDateString(newStart, packageDays));
  };

  const handleEndDateChange = (newEnd) => {
    setEndDate(newEnd);
    const calculatedDays = calculateDaysBetween(startDate, newEnd);
    setPackageDays(calculatedDays);
  };

  // Select food item handler
  const handleSelectFood = (mealType, foodId) => {
    setSelectedFoods(prev => ({
      ...prev,
      [mealType]: foodId
    }));
  };

  // Select delivery slot handler
  const handleSlotChange = (mealType, slot) => {
    setDeliverySlots(prev => ({
      ...prev,
      [mealType]: slot
    }));
  };

  // Append Quick Tag to common note
  const handleAddQuickTag = (tag) => {
    if (commonClinicalNotes.includes(tag)) return;
    setCommonClinicalNotes(prev => prev ? `${prev}, ${tag}` : tag);
  };

  // --- Financial & Nutrition Calculations ---
  const priceCalculation = useMemo(() => {
    let dailyBase = 0;

    if (selectedMeals.breakfast) {
      const item = MEAL_CONFIG.breakfast.foodList.find(f => f.id === selectedFoods.breakfast);
      dailyBase += item ? item.price : 120;
    }
    if (selectedMeals.lunch) {
      const item = MEAL_CONFIG.lunch.foodList.find(f => f.id === selectedFoods.lunch);
      dailyBase += item ? item.price : 170;
    }
    if (selectedMeals.dinner) {
      const item = MEAL_CONFIG.dinner.foodList.find(f => f.id === selectedFoods.dinner);
      dailyBase += item ? item.price : 160;
    }

    const subtotal = dailyBase * packageDays;

    let discountPercent = 0;
    if (packageDays >= 30) discountPercent = 15;
    else if (packageDays >= 20) discountPercent = 10;
    else if (packageDays >= 10) discountPercent = 5;

    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const grandTotal = subtotal - discountAmount;

    return {
      dailyBase,
      subtotal,
      discountPercent,
      discountAmount,
      grandTotal
    };
  }, [selectedMeals, selectedFoods, packageDays]);

  // Order Submission
  const handleProceedOrder = () => {
    const payload = {
      selectedMeals,
      startDate,
      endDate,
      packageDays,
      dietaryType,
      spiceLevel,
      clinicalNotes: commonClinicalNotes,
      selectedFoods: {
        breakfast: selectedMeals.breakfast ? MEAL_CONFIG.breakfast.foodList.find(f => f.id === selectedFoods.breakfast) : null,
        lunch: selectedMeals.lunch ? MEAL_CONFIG.lunch.foodList.find(f => f.id === selectedFoods.lunch) : null,
        dinner: selectedMeals.dinner ? MEAL_CONFIG.dinner.foodList.find(f => f.id === selectedFoods.dinner) : null
      },
      deliverySlots,
      pricing: priceCalculation
    };

    if (typeof window !== "undefined") {
      localStorage.setItem("customTiffinOrder", JSON.stringify(payload));
    }

    router.push('/food/checkout');
  };

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-8 antialiased select-none text-left">
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/70">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-red-50/80 border border-red-100/60 text-red-600 flex items-center justify-center shadow-sm shrink-0">
            <ChefHat size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Build Your Custom Tiffin
              </h1>
              <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-200/60 hidden sm:inline-block">
                DiabetesWala™ Care
              </span>
            </div>
            <p className="text-xs text-slate-500 font-bold mt-0.5">
              Select your meal combination, set package duration, and choose one clinical food per meal.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-sm self-start md:self-auto">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Certified Glycemic Control Standard</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* --- LEFT MAIN BUILDER (8 COLUMNS) --- */}
        <div className="lg:col-span-8 space-y-8">

          {/* STEP 1: SELECT MEAL TYPES */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-red-50 text-red-600 font-black text-xs flex items-center justify-center border border-red-100">
                  1
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Select Meal Types
                </h2>
              </div>
              <span className="text-[11px] font-bold text-slate-400">Pick any combination</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.keys(MEAL_CONFIG).map((key) => {
                const meal = MEAL_CONFIG[key];
                const IconComponent = meal.icon;
                const isSelected = selectedMeals[key];

                return (
                  <div
                    key={key}
                    onClick={() => handleMealToggle(key)}
                    className={`cursor-pointer rounded-2xl p-5 border transition-all duration-300 relative flex flex-col justify-between ${
                      isSelected
                        ? `bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/10`
                        : `bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80 text-slate-800`
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isSelected ? 'bg-white/10 text-amber-300' : 'bg-white text-slate-700 shadow-sm'
                        }`}>
                          <IconComponent size={20} />
                        </div>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                          isSelected 
                            ? 'bg-red-600 border-red-500 text-white' 
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <CheckCircle2 size={14} />}
                        </div>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base leading-snug">
                        {meal.title}
                      </h3>
                      <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
                        isSelected ? 'text-slate-300' : 'text-slate-500'
                      }`}>
                        {meal.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/10 flex items-baseline justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-slate-400' : 'text-slate-500'
                      }`}>Options</span>
                      <span className="font-mono font-black text-xs">{meal.foodList.length} Dishes</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: CUSTOM PACKAGE DURATION & DATES */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-red-50 text-red-600 font-black text-xs flex items-center justify-center border border-red-100">
                  2
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Choose Your Custom Package
                </h2>
              </div>
              <span className="text-[11px] font-black text-red-600 bg-red-50 px-3 py-1 rounded-xl border border-red-100">
                {packageDays} Days Selected
              </span>
            </div>

            {/* PACKAGE DAYS COUNTER */}
            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">
                    How many days package do you want?
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Enter any custom duration (e.g. 10, 20, 25, 45 days).
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handlePackageDaysChange(packageDays - 1)}
                    disabled={packageDays <= 1}
                    className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>

                  <div className="flex items-center px-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={packageDays}
                      onChange={(e) => handlePackageDaysChange(e.target.value)}
                      className="w-14 text-center font-mono font-black text-base text-slate-900 focus:outline-none bg-transparent"
                    />
                    <span className="text-xs font-bold text-slate-400">Days</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handlePackageDaysChange(packageDays + 1)}
                    className="w-8 h-8 rounded-xl bg-[#3d3f96] hover:bg-[#2d2f75] text-white flex items-center justify-center transition-all cursor-pointer shadow-sm shadow-indigo-950/20"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mr-1">
                  Popular Packages:
                </span>
                {[5, 10, 15, 20, 25, 30, 45, 60].map((daysCount) => (
                  <button
                    key={daysCount}
                    type="button"
                    onClick={() => handlePackageDaysChange(daysCount)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      packageDays === daysCount
                        ? 'bg-[#3d3f96] text-white shadow-md shadow-indigo-950/15'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {daysCount} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#3d3f96]" /> Start Date:
                </label>
                <input
                  type="date"
                  min={getTomorrowDate()}
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/30 focus:border-[#3d3f96]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-red-600" /> End Date (Calculated):
                </label>
                <input
                  type="date"
                  min={startDate || getTomorrowDate()}
                  value={endDate}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
                />
              </div>
            </div>

            {/* Dietary Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Dietary Style:</label>
                <div className="flex gap-2">
                  {[
                    { id: 'veg', label: '100% Pure Veg' },
                    { id: 'egg', label: 'Eggitarian' },
                    { id: 'jain', label: 'Jain (No Root Veg)' }
                  ].map(style => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setDietaryType(style.id)}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                        dietaryType === style.id
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-extrabold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Spice & Oil Profile:</label>
                <div className="flex gap-2">
                  {[
                    { id: 'mild', label: 'Mild Clinical' },
                    { id: 'medium', label: 'Medium Spice' },
                    { id: 'low-sodium', label: 'Low Sodium' }
                  ].map(spice => (
                    <button
                      key={spice.id}
                      type="button"
                      onClick={() => setSpiceLevel(spice.id)}
                      className={`flex-1 py-2 text-[11px] font-bold rounded-xl border transition-all ${
                        spiceLevel === spice.id
                          ? 'bg-red-50 text-red-700 border-red-300 font-extrabold'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {spice.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: CHOOSE ONLY 1 FOOD FOR EACH MEAL */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-red-50 text-red-600 font-black text-xs flex items-center justify-center border border-red-100">
                  3
                </span>
                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                  Choose Your Food & Delivery Slots
                </h2>
              </div>
              <span className="text-xs font-bold text-slate-500">Pick 1 food item per meal slot</span>
            </div>

            {/* BREAKFAST FOOD SELECTION */}
            {selectedMeals.breakfast && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                      <Sun size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Select Breakfast Dish</h3>
                      <p className="text-xs text-slate-400 font-semibold">Choose 1 food item from available menu</p>
                    </div>
                  </div>

                  {/* Delivery Slot Dropdown */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <Clock size={14} className="text-amber-500 ml-1.5" />
                    <select
                      value={deliverySlots.breakfast}
                      onChange={(e) => handleSlotChange('breakfast', e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
                    >
                      {MEAL_CONFIG.breakfast.deliverySlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Single Food Options Radio Cards */}
                <div className="space-y-2.5">
                  {MEAL_CONFIG.breakfast.foodList.map((food) => {
                    const isPicked = selectedFoods.breakfast === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => handleSelectFood('breakfast', food.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                          isPicked
                            ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                            : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                            isPicked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isPicked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                              {food.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-500">{food.cal} kcal</span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                                GI: {food.gi}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-black text-xs sm:text-sm text-slate-900 shrink-0">
                          ₹{food.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* LUNCH FOOD SELECTION */}
            {selectedMeals.lunch && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100">
                      <SunMedium size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Select Lunch Dish</h3>
                      <p className="text-xs text-slate-400 font-semibold">Choose 1 food item from available menu</p>
                    </div>
                  </div>

                  {/* Delivery Slot Dropdown */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <Clock size={14} className="text-red-500 ml-1.5" />
                    <select
                      value={deliverySlots.lunch}
                      onChange={(e) => handleSlotChange('lunch', e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
                    >
                      {MEAL_CONFIG.lunch.deliverySlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Single Food Options Radio Cards */}
                <div className="space-y-2.5">
                  {MEAL_CONFIG.lunch.foodList.map((food) => {
                    const isPicked = selectedFoods.lunch === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => handleSelectFood('lunch', food.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                          isPicked
                            ? 'bg-red-500/10 border-red-500/40 shadow-sm'
                            : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                            isPicked ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isPicked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                              {food.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-500">{food.cal} kcal</span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200/60">
                                GI: {food.gi}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-black text-xs sm:text-sm text-slate-900 shrink-0">
                          ₹{food.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DINNER FOOD SELECTION */}
            {selectedMeals.dinner && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center border border-indigo-100">
                      <Moon size={20} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">Select Dinner Dish</h3>
                      <p className="text-xs text-slate-400 font-semibold">Choose 1 food item from available menu</p>
                    </div>
                  </div>

                  {/* Delivery Slot Dropdown */}
                  <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                    <Clock size={14} className="text-[#3d3f96] ml-1.5" />
                    <select
                      value={deliverySlots.dinner}
                      onChange={(e) => handleSlotChange('dinner', e.target.value)}
                      className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer pr-2"
                    >
                      {MEAL_CONFIG.dinner.deliverySlots.map(slot => (
                        <option key={slot} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Single Food Options Radio Cards */}
                <div className="space-y-2.5">
                  {MEAL_CONFIG.dinner.foodList.map((food) => {
                    const isPicked = selectedFoods.dinner === food.id;
                    return (
                      <div
                        key={food.id}
                        onClick={() => handleSelectFood('dinner', food.id)}
                        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between gap-4 ${
                          isPicked
                            ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                            : 'bg-slate-50/70 border-slate-200/70 hover:bg-slate-100/70'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                            isPicked ? 'bg-[#3d3f96] border-[#3d3f96] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {isPicked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                              {food.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-slate-500">{food.cal} kcal</span>
                              <span className="text-slate-300 text-[10px]">•</span>
                              <span className="text-[10px] font-black text-[#3d3f96] bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200/60">
                                GI: {food.gi}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="font-mono font-black text-xs sm:text-sm text-slate-900 shrink-0">
                          ₹{food.price}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: SINGLE COMMON CLINICAL INSTRUCTIONS */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-red-50 text-red-600 font-black text-xs flex items-center justify-center border border-red-100">
                  4
                </span>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <FileText size={18} className="text-[#3d3f96]" /> Common Clinical & Kitchen Notes
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    This note will apply to all your meals throughout your subscription package.
                  </p>
                </div>
              </div>

              {/* Textarea */}
              <div className="space-y-2 pt-1">
                <textarea
                  rows={3}
                  value={commonClinicalNotes}
                  onChange={(e) => setCommonClinicalNotes(e.target.value)}
                  placeholder="e.g. Strictly no potatoes or root vegetables, low salt, zero refined sugar, extra cucumber salad..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3d3f96]/30 focus:border-[#3d3f96] placeholder:text-slate-400"
                />
              </div>

              {/* Quick Instruction Chips */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                  Quick Suggestion Tags (Click to Add):
                </span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_INSTRUCTION_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleAddQuickTag(tag)}
                      className="text-[11px] font-bold bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer hover:border-slate-300"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* --- RIGHT COLUMN: LIVE SUMMARY & CHECKOUT (4 COLUMNS) --- */}
        <div className="lg:col-span-4 lg:sticky lg:top-8 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-xl shadow-slate-200/50 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-[#3d3f96]" />
                <h3 className="font-extrabold text-slate-900 text-base">Subscription Summary</h3>
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border border-emerald-200">
                Custom Package
              </span>
            </div>

            {/* Chosen Foods Overview */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                Selected Meal Dishes:
              </span>
              
              {selectedMeals.breakfast && (() => {
                const food = MEAL_CONFIG.breakfast.foodList.find(f => f.id === selectedFoods.breakfast);
                return (
                  <div className="bg-amber-50/60 border border-amber-200/60 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-black text-amber-900">
                      <span className="flex items-center gap-1"><Sun size={12} className="text-amber-600" /> Breakfast ({deliverySlots.breakfast})</span>
                      <span>₹{food?.price}</span>
                    </div>
                    <p className="text-[10px] font-bold text-amber-800 line-clamp-1">{food?.name}</p>
                  </div>
                );
              })()}

              {selectedMeals.lunch && (() => {
                const food = MEAL_CONFIG.lunch.foodList.find(f => f.id === selectedFoods.lunch);
                return (
                  <div className="bg-red-50/60 border border-red-200/60 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-black text-red-900">
                      <span className="flex items-center gap-1"><SunMedium size={12} className="text-red-600" /> Lunch ({deliverySlots.lunch})</span>
                      <span>₹{food?.price}</span>
                    </div>
                    <p className="text-[10px] font-bold text-red-800 line-clamp-1">{food?.name}</p>
                  </div>
                );
              })()}

              {selectedMeals.dinner && (() => {
                const food = MEAL_CONFIG.dinner.foodList.find(f => f.id === selectedFoods.dinner);
                return (
                  <div className="bg-indigo-50/60 border border-indigo-200/60 p-3 rounded-2xl space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-black text-[#3d3f96]">
                      <span className="flex items-center gap-1"><Moon size={12} className="text-[#3d3f96]" /> Dinner ({deliverySlots.dinner})</span>
                      <span>₹{food?.price}</span>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-900 line-clamp-1">{food?.name}</p>
                  </div>
                );
              })()}
            </div>

            {/* Duration Overview */}
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Package Length:</span>
                <strong className="text-[#3d3f96] font-black text-sm">{packageDays} Days</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">Start Date:</span>
                <strong className="text-slate-800">{startDate}</strong>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold">End Date:</span>
                <strong className="text-slate-800">{endDate}</strong>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Daily Meal Total</span>
                <span className="font-mono font-bold text-slate-800">₹{priceCalculation.dailyBase}/day</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Base Total ({packageDays} days)</span>
                <span className="font-mono font-bold text-slate-800">₹{priceCalculation.subtotal}</span>
              </div>
              
              {priceCalculation.discountAmount > 0 ? (
                <div className="flex justify-between items-center text-xs text-emerald-600 font-bold">
                  <span className="flex items-center gap-1">
                    <Sparkles size={13} /> {priceCalculation.discountPercent}% Package Discount
                  </span>
                  <span className="font-mono">-₹{priceCalculation.discountAmount}</span>
                </div>
              ) : (
                <div className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200 flex items-center gap-1.5">
                  <Sparkles size={12} className="shrink-0" />
                  <span>Choose 10+ days package for instant 5% to 15% discount!</span>
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Clinical Kitchen Packaging & Delivery</span>
                <span className="text-emerald-600 font-bold uppercase text-[10px]">Free Promo</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                    Estimated Subscription Total
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
                    ₹{priceCalculation.grandTotal}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-bold">All inclusive</span>
              </div>
            </div>

            {/* Action CTA Button */}
            <button
              type="button"
              onClick={handleProceedOrder}
              className="w-full py-4 px-6 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
            >
              <span>Confirm & Subscribe ({packageDays} Days)</span>
              <ArrowRight size={16} />
            </button>

            {/* Trust Pill */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-slate-400 text-center pt-1">
              <HeartPulse size={13} className="text-red-500 shrink-0" />
              <span>Pause or reschedule any meal slot anytime</span>
            </div>

          </div>

          {/* Clinical Guarantee Banner */}
          <div className="rounded-3xl bg-gradient-to-br from-[#1c1d2d] to-[#141624] p-6 text-white border border-red-500/15 space-y-3">
            <div className="flex items-center gap-2">
              <Leaf size={16} className="text-emerald-400" />
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-200">
                DiabetesWala Guarantee
              </h4>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Every custom tiffin is prepared in dedicated non-sugar, low-sodium clinical cookware using low glycemic flours (Bajra, Ragi, Jowar) & cold-pressed oils.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}