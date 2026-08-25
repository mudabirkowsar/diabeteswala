'use client';

import React, { useState } from 'react';

// Pre-approved food pool mapped by meal slot with high-resolution photography URLs
const foodPool = {
  breakfast: [
    { name: "Multi-Grain Methi Paratha Combo", calories: "290 Kcal", carbs: "22g", gi: 35, imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=150&auto=format&fit=crop&q=80" },
    { name: "High-Protein Egg White Scramble", calories: "190 Kcal", carbs: "3g", gi: 10, imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&auto=format&fit=crop&q=80" },
    { name: "Oat-Bran Porridge with Almonds", calories: "245 Kcal", carbs: "26g", gi: 40, imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&auto=format&fit=crop&q=80" },
    { name: "Steamed Moong Dal Idli Set", calories: "180 Kcal", carbs: "24g", gi: 30, imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=150&auto=format&fit=crop&q=80" },
    { name: "Ragi Millet Crepes (Set of 2)", calories: "210 Kcal", carbs: "20g", gi: 35, imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80" }
  ],
  lunch: [
    { name: "Tender Paneer & Brown Rice Bowl", calories: "420 Kcal", carbs: "30g", gi: 45, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&auto=format&fit=crop&q=80" },
    { name: "Low-GI Quinoa Khichdi", calories: "320 Kcal", carbs: "28g", gi: 38, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80" },
    { name: "Baked Mustard Fish Bowl", calories: "270 Kcal", carbs: "1.5g", gi: 0, imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=150&auto=format&fit=crop&q=80" },
    { name: "Sautéed Vegetable Barley Bowl", calories: "290 Kcal", carbs: "25g", gi: 32, imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80" },
    { name: "Low-Sodium Paneer & Bran Roti", calories: "380 Kcal", carbs: "28g", gi: 40, imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&auto=format&fit=crop&q=80" }
  ],
  dinner: [
    { name: "Grilled Chicken Breast & Broccoli", calories: "310 Kcal", carbs: "4g", gi: 5, imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=150&auto=format&fit=crop&q=80" },
    { name: "Baked Herb Paneer Salad", calories: "410 Kcal", carbs: "6g", gi: 15, imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80" },
    { name: "Wilted Spinach & Tofu Bowl", calories: "280 Kcal", carbs: "18g", gi: 25, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80" },
    { name: "Roasted Turkey Breast & Asparagus", calories: "260 Kcal", carbs: "3g", gi: 5, imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=150&auto=format&fit=crop&q=80" },
    { name: "Lentil Broth with Grilled Tofu", calories: "220 Kcal", carbs: "16g", gi: 20, imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=150&auto=format&fit=crop&q=80" }
  ]
};

const subscriptionPlans = [
  {
    id: 'one-meal',
    name: "1 Meal / Day Program",
    subtitle: "Flexible Single Slot",
    tagline: "Ideal for daily workspace dining",
    description: "Enjoy 1 clinical-grade meal daily. Perfect for matching customized lunches or dinners.",
    baseWeeklyPrice: 1100, 
    baseMonthlyPrice: 4200, 
    mealsPerDay: 1,
    savingsLabel: "Save 15%",
    featuredDish: "Multi-Grain Methi Paratha Combo",
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80",
    features: ["100% Low-GI Ingredients", "Flexible daily slot swapping", "Pausable delivery calendar"]
  },
  {
    id: 'two-meals',
    name: "2 Meals / Day Combo",
    subtitle: "Most Popular Choice",
    tagline: "Covers Lunch & Dinner routines",
    description: "Coordinate a combination of any 2 meals daily to cover your core insulin schedules.",
    baseWeeklyPrice: 2100, 
    baseMonthlyPrice: 7800, 
    mealsPerDay: 2,
    savingsLabel: "Save 18%",
    featuredDish: "Tender Paneer & Brown Rice Bowl",
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80",
    features: ["Perfect diabetic insulin syncing", "Select any 2 daily meal slots", "Zero refined sugars or oils", "Free tiffin delivery"],
    isPopular: true
  },
  {
    id: 'full-day',
    name: "Full Day Care (3 Meals)",
    subtitle: "Total Glycemic Control",
    tagline: "All-inclusive blood glucose care",
    description: "Complete glycemic management covering Breakfast, Lunch, and Dinner delivered fresh daily.",
    baseWeeklyPrice: 3000, 
    baseMonthlyPrice: 11000, 
    mealsPerDay: 3,
    savingsLabel: "Save 20%",
    featuredDish: "Full Day Curated Diabetic Menu",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80",
    features: ["All 3 daily meals + healthy soup", "Precision portion-controlled macros", "Personal nutrition counselor access"]
  }
];

export default function OurTiffin() {
  const [cycle, setCycle] = useState('monthly'); // 'weekly' or 'monthly'
  const [activePlan, setActivePlan] = useState(null); 
  const [viewStep, setViewStep] = useState('plans'); // 'plans' | 'customizer'
  
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [selectedDishes, setSelectedDishes] = useState({ breakfast: '', lunch: '', dinner: '' });
  const [deliveryTimes, setDeliveryTimes] = useState({ breakfast: '8:00 AM', lunch: '1:00 PM', dinner: '8:00 PM' });

  const handleOpenSetupModal = (plan) => {
    setActivePlan(plan);
    if (plan.mealsPerDay === 1) {
      setSelectedSlots(['lunch']);
    } else if (plan.mealsPerDay === 2) {
      setSelectedSlots(['lunch', 'dinner']);
    } else if (plan.mealsPerDay === 3) {
      setSelectedSlots(['breakfast', 'lunch', 'dinner']);
    }
    setSelectedDishes({
      breakfast: foodPool.breakfast[0].name,
      lunch: foodPool.lunch[0].name,
      dinner: foodPool.dinner[0].name
    });
    setViewStep('customizer');
  };

  const handleSlotToggle = (slot) => {
    if (activePlan.mealsPerDay === 3) return;

    if (activePlan.mealsPerDay === 1) {
      setSelectedSlots([slot]);
    } else if (activePlan.mealsPerDay === 2) {
      if (selectedSlots.includes(slot)) {
        if (selectedSlots.length > 1) {
          setSelectedSlots(selectedSlots.filter(s => s !== slot));
        }
      } else {
        if (selectedSlots.length < 2) {
          setSelectedSlots([...selectedSlots, slot]);
        } else {
          setSelectedSlots([selectedSlots[1], slot]);
        }
      }
    }
  };

  const handleTimeChange = (slot, time) => {
    setDeliveryTimes(prev => ({ ...prev, [slot]: time }));
  };

  const handleDishChange = (slot, dishName) => {
    setSelectedDishes(prev => ({ ...prev, [slot]: dishName }));
  };

  // Slider navigation scroll trigger
  const handleSwipe = (slotId, direction) => {
    const container = document.getElementById(`scroll-container-${slotId}`);
    if (container) {
      const { scrollLeft, clientWidth } = container;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      container.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const calculatedCost = activePlan
    ? cycle === 'weekly' ? activePlan.baseWeeklyPrice : activePlan.baseMonthlyPrice
    : 0;

  return (
    <div className="w-full flex flex-col justify-between">
      
      {viewStep === 'plans' ? (
        
        /* ----------------------------------------------------
           PLANS MATRIX SCREEN (VIEW 1 - BORDERLESS)
           ---------------------------------------------------- */
        <div className="animate-fade-in flex flex-col justify-between h-full w-full">
          <div>
            {/* SECTION HEADER */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 text-[#3D3F96] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  Precision Meal Programs
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight mt-3">
                  Subscription Programs
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-xl">
                  Choose a clinical tiffin program. Select any card to customize your daily menu pool, configure delivery slots, and select your schedule.
                </p>
              </div>

              {/* Toggle Switch */}
              <div className="mt-6 lg:mt-0 bg-gray-100 p-1 rounded-2xl flex items-center shrink-0 border border-gray-200">
                <button
                  onClick={() => setCycle('weekly')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                    cycle === 'weekly' ? 'bg-[#3D3F96] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setCycle('monthly')}
                  className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all duration-300 ${
                    cycle === 'monthly' ? 'bg-[#3D3F96] text-white shadow-md' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Monthly Plan <span className="text-[#00B574] text-[9px] ml-1.5 bg-emerald-50 border border-emerald-100/50 px-1.5 py-0.5 rounded-md font-bold">Save 20%</span>
                </button>
              </div>
            </div>

            {/* 3-COLUMN PREMIUM PRICING GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {subscriptionPlans.map((plan) => {
                const planPrice = cycle === 'weekly' ? plan.baseWeeklyPrice : plan.baseMonthlyPrice;

                return (
                  <div
                    key={plan.id}
                    onClick={() => handleOpenSetupModal(plan)}
                    className={`rounded-[32px] border transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between bg-white relative group ${
                      plan.isPopular 
                        ? 'border-[#3D3F96] ring-4 ring-indigo-50 shadow-2xl -translate-y-1.5' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-xl hover:-translate-y-1'
                    }`}
                  >
                    {/* Premium Top Accents */}
                    {plan.isPopular && (
                      <div className="absolute top-4 right-4 z-20 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                        Best Value
                      </div>
                    )}

                    <div>
                      {/* Photo Section with Gradient Overlay */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-50">
                        <img 
                          src={plan.imageUrl} 
                          alt={plan.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                        <span className="absolute bottom-4 left-4 text-white text-[9px] font-black uppercase tracking-wider bg-[#3D3F96]/90 backdrop-blur-md px-3 py-1.5 rounded-md shadow-sm">
                          {plan.featuredDish}
                        </span>
                      </div>

                      {/* Plan Content */}
                      <div className="p-6 md:p-7">
                        <div className="mb-4">
                          <span className="text-[9px] text-[#3D3F96] font-black tracking-widest uppercase block">
                            {plan.subtitle}
                          </span>
                          <h3 className="font-extrabold text-gray-900 text-lg mt-0.5 leading-tight group-hover:text-[#3D3F96] transition-colors">
                            {plan.name}
                          </h3>
                          <p className="text-[11px] text-gray-400 font-medium mt-0.5">{plan.tagline}</p>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed mb-6 font-medium">
                          {plan.description}
                        </p>

                        {/* Bulleted Checkmarks */}
                        <div className="space-y-2.5 mb-6 pt-5 border-t border-gray-100">
                          {plan.features.map((feat, i) => (
                            <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600 font-semibold">
                              <span className="w-4 h-4 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-[#00B574] shrink-0 font-bold text-[10px]">
                                ✓
                              </span>
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Pricing Callout Footer Container */}
                    <div className="px-6 md:px-7 pb-6 pt-1">
                      <div className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 flex items-center justify-between group-hover:bg-gray-50 transition-colors">
                        <div>
                          <span className="block text-[8px] text-gray-400 font-bold uppercase tracking-wide">Subscription Rate</span>
                          <span className="text-xl font-black text-gray-950">₹{planPrice}</span>
                          <span className="text-[10px] text-gray-400 ml-1">/ {cycle}</span>
                        </div>
                        <span className="bg-emerald-50 text-[#00B574] border border-emerald-100 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wide">
                          {plan.savingsLabel} Off
                        </span>
                      </div>
                      
                      {/* Premium Action trigger pill */}
                      <button className={`w-full mt-4 py-3.5 rounded-xl text-center text-xs font-black tracking-wide transition-all duration-300 ${
                        plan.isPopular 
                          ? 'bg-[#3D3F96] hover:bg-indigo-850 text-white shadow-md shadow-[#3D3F96]/10' 
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}>
                        Select Program
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      ) : (

        /* ----------------------------------------------------
           STANDALONE MENUS CUSTOMIZER SCREEN (VIEW 2)
           ---------------------------------------------------- */
        <div className="animate-fade-in flex-1 flex flex-col w-full">
          
          {/* Customizer Header */}
          <div className="pb-6 flex items-center gap-4">
            <button 
              onClick={() => {
                setViewStep('plans');
                setActivePlan(null);
              }}
              className="flex items-center gap-2 text-xs font-black text-[#3D3F96] bg-indigo-50 border border-indigo-100/50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl transition active:scale-95 focus:outline-none"
            >
              ← Back to Programs
            </button>
            <div>
              <span className="text-[9px] bg-indigo-50 text-[#3D3F96] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                Tiffin Customization Desk
              </span>
              <h3 className="text-xl font-black text-gray-950 mt-1">
                Configure Schedule: {activePlan.name}
              </h3>
            </div>
          </div>

          {/* Dual Column Workspace dashboard layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 w-full">
            
            {/* LEFT COLUMN: SELECTIONS INTERFACE (8 cols) */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Step 1: Active Slots Picker */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-3">1. Toggle Selected Slots ({selectedSlots.length} of {activePlan.mealsPerDay} Selected)</span>
                <div className="grid grid-cols-3 gap-4">
                  {['breakfast', 'lunch', 'dinner'].map((slot) => {
                    const isActive = selectedSlots.includes(slot);
                    const isLocked = activePlan.mealsPerDay === 3; 
                    
                    return (
                      <button
                        key={slot}
                        onClick={() => !isLocked && handleSlotToggle(slot)}
                        className={`border px-4 py-3.5 rounded-xl text-left transition flex items-center justify-between focus:outline-none ${
                          isActive 
                            ? 'border-[#3D3F96] bg-indigo-50/10 shadow-sm font-bold text-gray-900' 
                            : 'border-gray-200 text-gray-500 hover:border-gray-300'
                        } ${isLocked ? 'cursor-default' : ''}`}
                      >
                        <span className="capitalize text-xs">{slot}</span>
                        <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isActive ? 'bg-[#3D3F96] border-transparent' : 'border-gray-300'
                        }`}>
                          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Dish Selection & Delivery timings dropdowns */}
              {selectedSlots.length > 0 ? (
                <div className="space-y-8 pt-4">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">2. Select Your Specific Dishes & Timings</span>
                  
                  {selectedSlots.map((slot) => (
                    <div key={slot} className="bg-gray-50 p-6 rounded-3xl border border-gray-150 flex flex-col gap-5">
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                        <span className="text-[9px] bg-indigo-100 text-indigo-900 font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-md capitalize">
                          {slot} Program
                        </span>
                      </div>

                      {/* Carousel with navigation */}
                      <div className="relative group/slider">
                        
                        <button
                          type="button"
                          onClick={() => handleSwipe(slot, 'left')}
                          className="absolute -left-3 top-[38%] -translate-y-1/2 z-30 w-8.5 h-8.5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#3D3F96] hover:bg-gray-50 transition shadow-md focus:outline-none"
                          aria-label="Scroll Left"
                        >
                          ←
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSwipe(slot, 'right')}
                          className="absolute -right-3 top-[38%] -translate-y-1/2 z-30 w-8.5 h-8.5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:text-[#3D3F96] hover:bg-gray-50 transition shadow-md focus:outline-none"
                          aria-label="Scroll Right"
                        >
                          →
                        </button>

                        {/* Swipeable Horiz Recipe track */}
                        <div 
                          id={`scroll-container-${slot}`}
                          className="flex gap-5 overflow-x-auto pb-4 pt-2.5 scrollbar-none snap-x snap-mandatory scroll-smooth relative" 
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {foodPool[slot].map((food, idx) => {
                            const isSelected = selectedDishes[slot] === food.name;
                            return (
                              <div
                                key={idx}
                                onClick={() => handleDishChange(slot, food.name)}
                                className={`w-72 shrink-0 snap-start rounded-[24px] overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col justify-between bg-white border ${
                                  isSelected 
                                    ? 'border-[#3D3F96] ring-2 ring-indigo-50 shadow-md font-bold' 
                                    : 'border-gray-200 hover:border-gray-300'
                                  }`}
                              >
                                {/* Photo wrapper */}
                                <div className="relative h-28 w-full overflow-hidden bg-gray-50">
                                  <img src={food.imageUrl} alt={food.name} className="absolute inset-0 w-full h-full object-cover rounded-t-[24px]" />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                  
                                  {isSelected && (
                                    <span className="absolute top-3 right-3 bg-[#3D3F96] text-white p-0.5 rounded-full shadow-md z-20">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                      </svg>
                                    </span>
                                  )}
                                </div>
                                
                                {/* Recipe specifics */}
                                <div className="p-4">
                                  <h4 className="text-xs font-extrabold text-gray-900 leading-tight truncate">{food.name}</h4>
                                  <p className="text-[10px] text-gray-400 mt-1.5 font-bold leading-none">
                                    {food.calories} • Carbs: {food.carbs} • GI: {food.gi}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Pref Timing selection triggers */}
                      <div className="mt-2 pt-4 border-t border-gray-150/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                          3. Choose Preferred Delivery Drop-off
                        </span>
                        
                        <div className="flex gap-2">
                          {slot === 'breakfast' && ['7:30 AM', '8:00 AM', '8:30 AM'].map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeChange(slot, time)}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
                                deliveryTimes[slot] === time
                                  ? 'bg-[#3D3F96] border-transparent text-white shadow-md'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                          {slot === 'lunch' && ['12:30 PM', '1:00 PM', '1:30 PM'].map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeChange(slot, time)}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
                                deliveryTimes[slot] === time
                                  ? 'bg-[#3D3F96] border-transparent text-white shadow-md'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                          {slot === 'dinner' && ['7:30 PM', '8:00 PM', '8:30 PM'].map(time => (
                            <button
                              key={time}
                              type="button"
                              onClick={() => handleTimeChange(slot, time)}
                              className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all focus:outline-none ${
                                deliveryTimes[slot] === time
                                  ? 'bg-[#3D3F96] border-transparent text-white shadow-md'
                                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 text-slate-400 border border-slate-150 border-dashed rounded-[24px]">
                  Please toggle at least one meal slot above to configure.
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: PERSISTENT ORDER STICKY SUMMARY */}
            <div className="lg:col-span-4">
              <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-6 sticky top-24">
                
                <h4 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-3">
                  Scheduled Setup Details
                </h4>

                <div className="space-y-4">
                  {selectedSlots.map((slot) => (
                    <div key={slot} className="text-xs bg-white p-3 rounded-xl border border-slate-150/60 font-bold">
                      <div className="flex justify-between items-center text-[#3D3F96] uppercase text-[10px]">
                        <span>{slot} Meal</span>
                        <span>{deliveryTimes[slot]}</span>
                      </div>
                      <span className="text-slate-800 block mt-1 leading-tight truncate">{selectedDishes[slot]}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                    <span>Program Target:</span>
                    <span className="capitalize text-slate-800 font-black">{cycle}ly Plan</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase leading-none block">Total Payable Cost</span>
                      <span className="text-[9px] text-[#00B574] font-black uppercase mt-1 inline-block">Save 20% Applied</span>
                    </div>
                    <span className="text-2xl font-black text-slate-900">₹{calculatedCost}</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      alert(`Successfully subscribed to ${activePlan.name} for ${cycle} program!\nActive: [${selectedSlots.join(', ')}].\nMeals selected:\n- ${selectedSlots.map(s => `${s.toUpperCase()}: ${selectedDishes[s]} @ ${deliveryTimes[s]}`).join('\n- ')}`);
                      setViewStep('plans');
                      setActivePlan(null);
                    }}
                    className="w-full bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold py-4 rounded-2xl text-center transition active:scale-95 text-xs shadow-md shadow-[#3D3F96]/15"
                  >
                    Confirm & Start Subscription
                  </button>
                  <button
                    onClick={() => {
                      setViewStep('plans');
                      setActivePlan(null);
                    }}
                    className="w-full bg-white hover:bg-slate-50 text-slate-500 border border-slate-200 font-bold py-3 rounded-2xl text-center transition text-xs"
                  >
                    Cancel Selection
                  </button>
                </div>

              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}