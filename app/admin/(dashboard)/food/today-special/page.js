"use client";

import React, { useState } from 'react';

// Master Food Database featuring 17-field attributes and high-resolution food photography URLs
const masterFoodsDatabase = [
  {
    id: "FD-101",
    name: "Quinoa Khichdi with Broccoli",
    description: "Comfort food made using whole white quinoa grains and split yellow lentils. Slow carbs with high soluble dietary fiber.",
    price: 180,
    discountPrice: 155,
    calories: 320,
    type: "Veg",
    netCarbs: "28g",
    glycemicIndex: 38,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "FD-102",
    name: "Almond Crust Paneer Tikka",
    description: "Low-carb keto paneer chunks coated in cracked ground raw almond flour, baked roasted in tandoor.",
    price: 240,
    discountPrice: 220,
    calories: 410,
    type: "Veg",
    netCarbs: "6g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "FD-103",
    name: "High-Protein Egg White Bhurji",
    description: "Three organic egg whites scrambled with fresh spring onions, bell peppers, tomatoes, and ground black pepper.",
    price: 160,
    discountPrice: 140,
    calories: 190,
    type: "Egg",
    netCarbs: "3g",
    glycemicIndex: 10,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "FD-104",
    name: "Baked Mustard Fish Fillet",
    description: "Lean high-protein fish fillets prepared with yellow mustard seed paste, lime juice, and dynamic fresh spices.",
    price: 320,
    discountPrice: 290,
    calories: 270,
    type: "Non Veg",
    netCarbs: "1.5g",
    glycemicIndex: 0,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=500&auto=format&fit=crop&q=80"
  },
  {
    id: "FD-105",
    name: "Oat-Bran Multigrain Roti Combo",
    description: "Fiber-rich roti paired with light low-sodium green spinach saag and non-fat plain curd.",
    price: 200,
    discountPrice: 175,
    calories: 340,
    type: "Veg",
    netCarbs: "32g",
    glycemicIndex: 42,
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=500&auto=format&fit=crop&q=80"
  }
];

// Initial Weekly recurring menu structure (Configured as dynamic arrays of food objects)
const INITIAL_WEEKLY_MENU = [
  { day: "Monday", meals: [masterFoodsDatabase[0], masterFoodsDatabase[4]] },
  { day: "Tuesday", meals: [masterFoodsDatabase[1], masterFoodsDatabase[2]] },
  { day: "Wednesday", meals: [masterFoodsDatabase[0], masterFoodsDatabase[3]] },
  { day: "Thursday", meals: [masterFoodsDatabase[2], masterFoodsDatabase[4]] },
  { day: "Friday", breakfast: "Diabetic Oats", meals: [masterFoodsDatabase[1], masterFoodsDatabase[3]] },
  { day: "Saturday", meals: [masterFoodsDatabase[0], masterFoodsDatabase[2], masterFoodsDatabase[4]] },
  { day: "Sunday", meals: [masterFoodsDatabase[1], masterFoodsDatabase[3]] }
];

export default function TiffinMenuPlanner() {
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'weekly'
  const [weeklyMenu, setWeeklyMenu] = useState(INITIAL_WEEKLY_MENU);
  
  // Dynamic, unlimited array of Today's Specials
  const [todaysSpecials, setTodaysSpecials] = useState([
    masterFoodsDatabase[0],
    masterFoodsDatabase[1],
    masterFoodsDatabase[2]
  ]);

  // Modal states
  const [isTodaySelectorOpen, setIsTodaySelectorOpen] = useState(false);
  const [editingDayName, setEditingDayName] = useState(null); // Tracks active day being edited, e.g. 'Monday'
  const [selectedDayMeals, setSelectedDayMeals] = useState([]); // Temporary holder for day edits

  // Add/Remove Today's Specials
  const handleToggleTodaySpecial = (food) => {
    if (todaysSpecials.some(item => item.id === food.id)) {
      setTodaysSpecials(prev => prev.filter(item => item.id !== food.id));
    } else {
      setTodaysSpecials([...todaysSpecials, food]);
    }
  };

  // Open Edit Modal for a specific day’s menu
  const openDayEditModal = (dayPlan) => {
    setEditingDayName(dayPlan.day);
    setSelectedDayMeals(dayPlan.meals);
  };

  // Toggle active meal selections for a specific day inside the modal
  const handleToggleDayMeal = (food) => {
    if (selectedDayMeals.some(item => item.id === food.id)) {
      setSelectedDayMeals(prev => prev.filter(item => item.id !== food.id));
    } else {
      setSelectedDayMeals([...selectedDayMeals, food]);
    }
  };

  // Save changes to the weekly planner
  const handleSaveDayMenu = (e) => {
    e.preventDefault();
    setWeeklyMenu(prev => prev.map(item => 
      item.day === editingDayName 
        ? { ...item, meals: selectedDayMeals } 
        : item
    ));
    setEditingDayName(null);
  };

  const renderTypeSymbol = (type) => {
    const fillColors = { Veg: 'bg-emerald-500', 'Non Veg': 'bg-rose-500', Egg: 'bg-amber-500' };
    return (
      <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${fillColors[type] || 'bg-slate-400'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in py-4">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Daily & Weekly Menu</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Configure repeating weekly tiffin templates and manage today's active menu.</p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 ${
              activeTab === 'today'
                ? 'bg-white text-[#3D3F96] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Today's Specials Setup
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-150 ${
              activeTab === 'weekly'
                ? 'bg-white text-[#3D3F96] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Weekly Menu Planner
          </button>
        </div>
      </div>

      {activeTab === 'today' ? (
        /* TODAY'S ACTIVE CONFIGURATION DESK */
        <div className="space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">Today's Specials Setup ({todaysSpecials.length})</h2>
              <p className="text-xs text-slate-400 mt-1">Select and publish any number of dishes to act as today's live recommendations.</p>
            </div>
            
            <button
              onClick={() => setIsTodaySelectorOpen(true)}
              className="px-5 py-3 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all"
            >
              <span>+</span>
              SELECT TODAY'S SPECIALS
            </button>
          </div>

          {/* ACTIVE SPECIALS PHOTO CARDS GRID */}
          {todaysSpecials.length === 0 ? (
            <div className="text-center py-16 bg-white border rounded-3xl border-slate-200 border-dashed">
              <p className="text-sm text-slate-400">No active specials listed for today. Click the button above to add dishes.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {todaysSpecials.map((meal) => (
                <div 
                  key={meal.id} 
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
                >
                  <div className="relative h-44 w-full overflow-hidden bg-slate-50">
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    <div className="absolute top-3 left-3">{renderTypeSymbol(meal.type)}</div>
                    <span className="absolute bottom-3 left-4 text-white text-base font-black">₹{meal.discountPrice}</span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1">{meal.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">{meal.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-center text-[10px] border border-slate-100">
                      <div>
                        <span className="block text-slate-400 font-bold uppercase">Energy</span>
                        <strong className="text-slate-700">{meal.calories} Kcal</strong>
                      </div>
                      <div>
                        <span className="block text-slate-400 font-bold uppercase">Net Carbs</span>
                        <strong className="text-slate-700">{meal.netCarbs}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleTodaySpecial(meal)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all"
                    >
                      Remove Special
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* WEEKLY RECURRING MENU CALENDAR GRID (PHOTO-RICH REDESIGN) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {weeklyMenu.map((dayPlan) => (
            <div 
              key={dayPlan.day} 
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200"
            >
              <div className="p-5 space-y-4 flex-1">
                <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <h3 className="font-extrabold text-slate-900 text-lg leading-none">{dayPlan.day}</h3>
                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    {dayPlan.meals.length} Meals
                  </span>
                </div>

                {/* Day Meals list with visual photo thumbnails */}
                {dayPlan.meals.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 italic text-center">No meals configured for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {dayPlan.meals.map((meal) => (
                      <div key={meal.id} className="flex gap-3 items-center border-b border-slate-50 pb-2 last:border-b-0 last:pb-0">
                        {/* Thumbnail */}
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                          <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 leading-snug truncate">{meal.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">₹{meal.discountPrice} • {meal.calories} Kcal</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Edit Day Menu */}
              <div className="px-5 py-3.5 bg-slate-50/50 border-t border-slate-100 text-right">
                <button
                  onClick={() => openDayEditModal(dayPlan)}
                  className="px-3.5 py-1.5 text-xs font-bold text-[#3D3F96] hover:bg-[#3D3F96]/5 border border-transparent hover:border-[#3D3F96]/10 rounded-xl transition-all"
                >
                  Edit Day Menu
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TODAY'S SPECIALS SELECTOR MODAL (Full Food Cards with Photos) */}
      {isTodaySelectorOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 flex flex-col justify-between">
            <button onClick={() => setIsTodaySelectorOpen(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-full transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6 pb-4 border-b border-slate-150">
              <span className="text-[10px] bg-indigo-50 text-[#3D3F96] font-bold uppercase px-2.5 py-1 rounded-md">Species selection console</span>
              <h3 className="text-xl font-black text-gray-950 mt-1.5">Select Today's Active Specials</h3>
              <p className="text-xs text-gray-500 mt-0.5">Toggle any of the food cards below to feature them as live recommendations on the storefront.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-1 max-h-[50vh] pb-4">
              {masterFoodsDatabase.map((food) => {
                const isSelected = todaysSpecials.some(item => item.id === food.id);
                return (
                  <div
                    key={food.id}
                    onClick={() => handleToggleTodaySpecial(food)}
                    className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between bg-white relative group ${
                      isSelected 
                        ? 'border-[#3D3F96] ring-4 ring-indigo-50/80 shadow-md scale-[1.01]' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-gray-50">
                      <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <span className="absolute bottom-2 left-3 text-white text-xs font-extrabold">₹{food.discountPrice}</span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-1 rounded-full shadow-md z-20">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-extrabold text-gray-900 text-xs line-clamp-1">{food.name}</h4>
                        {renderTypeSymbol(food.type)}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{food.description}</p>
                      <div className="flex gap-2 mt-3 text-[9px] font-bold text-gray-400">
                        <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{food.calories} Kcal</span>
                        <span className="bg-emerald-50 text-[#00B574] px-2 py-0.5 rounded border border-emerald-100/30">GI: {food.glycemicIndex}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-150 pt-5 mt-6 flex justify-end gap-2">
              <button
                onClick={() => setIsTodaySelectorOpen(false)}
                className="px-6 py-3 bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold rounded-xl transition shadow-md text-xs"
              >
                Close & Publish Specials
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WEEKLY PLAN DAY MENU EDITOR MODAL (Full Food Cards with Photos) */}
      {editingDayName && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative p-6 sm:p-8 flex flex-col justify-between">
            
            <button onClick={() => setEditingDayName(null)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-full transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="mb-6 pb-4 border-b border-slate-150">
              <span className="text-[10px] bg-indigo-50 text-[#3D3F96] font-bold uppercase px-2.5 py-1 rounded-md">
                Weekly Template Desk
              </span>
              <h3 className="text-xl font-black text-gray-950 mt-1.5">
                Configure Repeating Menu: {editingDayName}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Toggle any of the food cards below to feature them as the default specials for {editingDayName}.</p>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-1 max-h-[50vh] pb-4">
              {masterFoodsDatabase.map((food) => {
                const isSelected = selectedDayMeals.some(item => item.id === food.id);
                return (
                  <div
                    key={food.id}
                    onClick={() => handleToggleDayMeal(food)}
                    className={`rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between bg-white relative group ${
                      isSelected 
                        ? 'border-[#3D3F96] ring-4 ring-indigo-50/80 shadow-md scale-[1.01]' 
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="relative h-32 w-full overflow-hidden bg-gray-50">
                      <img src={food.imageUrl} alt={food.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <span className="absolute bottom-2 left-3 text-white text-xs font-extrabold">₹{food.discountPrice}</span>
                      {isSelected && (
                        <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-1 rounded-full shadow-md z-20">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </span>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="font-extrabold text-gray-900 text-xs line-clamp-1">{food.name}</h4>
                        {renderTypeSymbol(food.type)}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">{food.description}</p>
                      <div className="flex gap-2 mt-3 text-[9px] font-bold text-gray-400">
                        <span className="bg-gray-50 px-2 py-0.5 rounded border border-gray-100">{food.calories} Kcal</span>
                        <span className="bg-emerald-50 text-[#00B574] px-2 py-0.5 rounded border border-emerald-100/30">GI: {food.glycemicIndex}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Actions */}
            <form onSubmit={handleSaveDayMenu} className="border-t border-slate-150 pt-5 mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingDayName(null)}
                className="px-5 py-3 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold rounded-xl transition shadow-md text-xs"
              >
                Save {editingDayName} Schedule
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}