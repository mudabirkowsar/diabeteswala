"use client";

import React, { useState } from 'react';

// Pre-defined Food Pool Catalog featuring premium food photography URLs
const FOOD_CATALOG = [
  { name: "Diabetic Oats Porridge Set", imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&auto=format&fit=crop&q=80" },
  { name: "Low GI Quinoa Biryani", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80" },
  { name: "Keto Garden Veg Salad Bowl", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80" },
  { name: "Sugar-Free Chia Seed Pudding", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&auto=format&fit=crop&q=80" },
  { name: "Low-Carb Cauliflower Fried Rice", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80" },
  { name: "Gluten-Free Amaranth Roti Thali", imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=150&auto=format&fit=crop&q=80" },
  { name: "High-Protein Almond Flour Cookies", imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80" }
];

const INITIAL_PLANS = [
  {
    id: "PLN-101",
    name: "1 Meal Anytime Plan",
    duration: "Monthly", 
    price: 1800,
    mealsPerDay: 1, 
    allowedMeals: ["Breakfast", "Lunch", "Dinner"], 
    description: "Ultra-flexible plan allowing subscribers to choose any 1 meal (Breakfast, Lunch, or Dinner) daily from the diet pool.",
    foodPool: ["Diabetic Oats Porridge Set", "Keto Garden Veg Salad Bowl", "Low-Carb Cauliflower Fried Rice"],
    status: "Active",
    subscribersCount: 142,
    bannerUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "PLN-102",
    name: "2 Meals Daily Combo",
    duration: "Monthly",
    price: 3400,
    mealsPerDay: 2,
    allowedMeals: ["Breakfast", "Lunch", "Dinner"], 
    description: "Subscribers select any combo of 2 meals daily (e.g., Breakfast + Lunch, or Lunch + Dinner) from the premium keto catalogue.",
    foodPool: ["Low GI Quinoa Biryani", "Keto Garden Veg Salad Bowl", "Gluten-Free Amaranth Roti Thali", "Sugar-Free Chia Seed Pudding"],
    status: "Active",
    subscribersCount: 84,
    bannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "PLN-103",
    name: "Full Day Diet Plan",
    duration: "Monthly",
    price: 4900,
    mealsPerDay: 3,
    allowedMeals: ["Breakfast", "Lunch", "Dinner"], 
    description: "Comprehensive 3-meals-a-day pack covering complete diabetic nutrition: Breakfast, Lunch, and Dinner.",
    foodPool: ["Diabetic Oats Porridge Set", "Low GI Quinoa Biryani", "Keto Garden Veg Salad Bowl", "Sugar-Free Chia Seed Pudding", "Low-Carb Cauliflower Fried Rice"],
    status: "Active",
    subscribersCount: 52,
    bannerUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
  }
];

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [editingId, setEditingId] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formDuration, setFormDuration] = useState('Monthly');
  const [formPrice, setFormPrice] = useState('');
  const [formMealsPerDay, setFormMealsPerDay] = useState(1);
  const [formAllowedMeals, setFormAllowedMeals] = useState(["Breakfast", "Lunch", "Dinner"]);
  const [formFoodPool, setFormFoodPool] = useState([]);
  const [formDesc, setFormDesc] = useState('');

  // Handle Allowed Meal Checkbox changes
  const handleMealCheckboxChange = (meal) => {
    if (formAllowedMeals.includes(meal)) {
      setFormAllowedMeals(prev => prev.filter(m => m !== meal));
    } else {
      setFormAllowedMeals([...formAllowedMeals, meal]);
    }
  };

  // Handle Food Pool Selection
  const handleFoodPoolCheckboxChange = (dishName) => {
    if (formFoodPool.includes(dishName)) {
      setFormFoodPool(prev => prev.filter(d => d !== dishName));
    } else {
      setFormFoodPool([...formFoodPool, dishName]);
    }
  };

  // Toggle Plan Status
  const togglePlanStatus = (id) => {
    setPlans(prev => prev.map(p => 
      p.id === id ? { ...p, status: p.status === 'Active' ? 'Paused' : 'Active' } : p
    ));
  };

  // Open Edit Modal
  const openEditModal = (plan) => {
    setModalMode('edit');
    setEditingId(plan.id);

    setFormName(plan.name);
    setFormDuration(plan.duration);
    setFormPrice(plan.price.toString());
    setFormMealsPerDay(plan.mealsPerDay);
    setFormAllowedMeals(plan.allowedMeals);
    setFormFoodPool(plan.foodPool);
    setFormDesc(plan.description);

    setIsModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const newPlan = {
        id: `PLN-${Date.now()}`,
        name: formName,
        duration: formDuration,
        price: parseFloat(formPrice) || 0,
        mealsPerDay: parseInt(formMealsPerDay) || 1,
        allowedMeals: formAllowedMeals,
        foodPool: formFoodPool,
        description: formDesc,
        status: "Active",
        subscribersCount: 0,
        bannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80" // default fallback
      };
      setPlans([newPlan, ...plans]);
    } else {
      setPlans(prev => prev.map(p => 
        p.id === editingId 
          ? {
              ...p,
              name: formName,
              duration: formDuration,
              price: parseFloat(formPrice) || 0,
              mealsPerDay: parseInt(formMealsPerDay) || 1,
              allowedMeals: formAllowedMeals,
              foodPool: formFoodPool,
              description: formDesc
            }
          : p
      ));
    }

    resetForm();
    setIsModalOpen(false);
  };

  const deletePlan = (id) => {
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const resetForm = () => {
    setFormName('');
    setFormDuration('Monthly');
    setFormPrice('');
    setFormMealsPerDay(1);
    setFormAllowedMeals(["Breakfast", "Lunch", "Dinner"]);
    setFormFoodPool([]);
    setFormDesc('');
    setEditingId(null);
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in py-4">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Configure customizable lunch, breakfast, and dinner tiffin tiers.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          Create Custom Tier
        </button>
      </div>

      {/* Premium Plans Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`bg-white rounded-3xl border border-slate-200/80 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
              plan.status === 'Paused' ? 'opacity-65' : ''
            }`}
          >
            <div>
              {/* Photo Section with Gradient Overlay */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-50 border-b border-slate-100">
                <img src={plan.bannerUrl} alt={plan.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-4 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                  {plan.mealsPerDay} {plan.mealsPerDay === 1 ? 'Meal' : 'Meals'} / Day
                </span>
                
                {/* ID Tag */}
                <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  ID: {plan.id}
                </span>
              </div>

              {/* Inner Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug">{plan.name}</h3>
                  <span className="inline-block text-[10px] font-extrabold text-[#00B574] uppercase tracking-widest leading-none">
                    {plan.duration} Cycle
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {plan.description}
                </p>

                {/* Allowed Meals badge row */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Customer Selections allowed:</span>
                  <div className="flex gap-1.5 flex-wrap">
                    {["Breakfast", "Lunch", "Dinner"].map(meal => {
                      const isAllowed = plan.allowedMeals.includes(meal);
                      return (
                        <span key={meal} className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                          isAllowed 
                            ? 'bg-indigo-50 border-indigo-100 text-[#3D3F96]' 
                            : 'bg-slate-100 border-slate-100 text-slate-400 line-through'
                        }`}>
                          {meal}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Stats and pricing details */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 text-xs font-bold bg-slate-50/50 p-3 rounded-2xl">
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px]">Price</span>
                    <span className="text-slate-800 text-base font-black">₹{plan.price}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block uppercase text-[10px]">Active Subscribers</span>
                    <span className="text-[#3D3F96] text-base font-black">{plan.subscribersCount} Subs</span>
                  </div>
                </div>

                {/* Food Selection Pool indicator */}
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Diet Selection Pool:</span>
                  <p className="text-xs font-semibold text-slate-600 truncate">
                    {plan.foodPool.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Footer row */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(plan)}
                  className="p-2 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-xl transition-all"
                  title="Edit Plan"
                >
                  <EditIcon className="w-4 h-4 stroke-[2]" />
                </button>
                <button
                  onClick={() => deletePlan(plan.id)}
                  className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Delete Plan"
                >
                  <TrashIcon className="w-4 h-4 stroke-[2]" />
                </button>
              </div>

              {/* Status Switcher */}
              <button
                onClick={() => togglePlanStatus(plan.id)}
                className={`flex items-center gap-1.5 text-[10px] font-bold border px-3 py-1 rounded-full transition-all duration-300 ${
                  plan.status === "Active"
                    ? "text-emerald-600 border-emerald-100 bg-emerald-50 hover:bg-emerald-100"
                    : "text-slate-500 border-slate-200 bg-slate-100 hover:bg-slate-200"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${plan.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                {plan.status}
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE & EDIT SUBSCRIPTION PLAN MODAL - EXPANDED TO max-w-4xl */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10">
                  <PlansIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Create Subscription' : 'Update Plan Details'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define custom daily meal allowance counts and options</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto">
              
              {/* Plan Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. 1 Meal Custom Daily Choice"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 shadow-sm"
                />
              </div>

              {/* Cycle & Meals Per Day Count */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Plan Cycle</label>
                  <select
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer shadow-sm"
                  >
                    <option value="Monthly">Monthly Cycle</option>
                    <option value="Weekly">Weekly Cycle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Meals Count / Day</label>
                  <select
                    value={formMealsPerDay}
                    onChange={(e) => setFormMealsPerDay(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer shadow-sm"
                  >
                    <option value={1}>1 Meal / Day (Anytime)</option>
                    <option value={2}>2 Meals / Day</option>
                    <option value={3}>3 Meals / Day (Full Day Pack)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Subscription Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. 1800"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 shadow-sm"
                  />
                </div>
              </div>

              {/* Allowed Selection Times (Checkboxes) */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Permitted Meal Slots</label>
                <div className="flex gap-4">
                  {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                    <label key={meal} className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={formAllowedMeals.includes(meal)}
                        onChange={() => handleMealCheckboxChange(meal)}
                        className="rounded border-slate-200 text-[#3D3F96] focus:ring-[#3D3F96]"
                      />
                      <span>{meal}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Diet Selection Pool (REDESIGNED: Interactive Cards Grid with Photos) */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Select Dish Selection Pool</label>
                <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">Toggle any of the food cards below to feature them inside this subscription plan's dietary selection catalog.</p>
                
                {/* Scrollable grid of dishes inside modal */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {FOOD_CATALOG.map((dish) => {
                    const isChecked = formFoodPool.includes(dish.name);
                    return (
                      <div
                        key={dish.name}
                        onClick={() => handleFoodPoolCheckboxChange(dish.name)}
                        className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col justify-between bg-white ${
                          isChecked 
                            ? 'border-[#3D3F96] ring-2 ring-indigo-50 shadow-sm scale-102 font-bold' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Dish Photo frame */}
                        <div className="relative h-16 w-full">
                          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          
                          {/* Checked indicator */}
                          {isChecked && (
                            <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-0.5 rounded-full shadow-md z-20">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          )}
                        </div>
                        <div className="p-2.5">
                          <h4 className="text-[11px] font-bold text-gray-900 truncate leading-tight">{dish.name}</h4>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Plan Description</label>
                <textarea
                  rows={2}
                  required
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Detail the portion sizes, calorie splits and recipe strategies of this subscription model..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 resize-none leading-relaxed shadow-sm"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10"
                >
                  {modalMode === 'create' ? 'Create Plan' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Icons

function PlansIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.8.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.03 0 1.9.693 2.166 1.638m-7.377 0A49.79 49.79 0 0112 3.75c.612.01 1.221.05 1.826.118" />
    </svg>
  );
}

function EditIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function TrashIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
  );
}

function CloseIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}