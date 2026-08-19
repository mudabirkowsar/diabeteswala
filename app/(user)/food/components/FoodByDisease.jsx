'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Specialized disease dietary matrix
const DISEASE_MEALS = {
  diabetes: {
    id: "diabetes",
    name: "Diabetes Care",
    tagline: "Ultra-low Glycemic Index (GI) meals designed to maintain flat blood glucose metrics.",
    icon: "🩸",
    meals: [
      { name: "Sautéed Cauliflower Rice & Baked Tofu", calories: "210 Kcal", carbs: "5g Net Carbs", spec: "GI: 15 (Ultra Low)", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80", price: 180 },
      { name: "Cinnamon Oats & Chia seed Porridge", calories: "245 Kcal", carbs: "22g Net Carbs", spec: "High Fiber (8g)", imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400&auto=format&fit=crop&q=80", price: 140 },
      { name: "Avocado & Wilted Spinach Salad Bowl", calories: "290 Kcal", carbs: "4g Net Carbs", spec: "Healthy Fats (Mono)", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80", price: 210 }
    ]
  },
  hypertension: {
    id: "hypertension",
    name: "Hypertension (Heart)",
    tagline: "Low-sodium, high-potassium meals focused on blood pressure management and arterial elasticity.",
    icon: "🫀",
    meals: [
      { name: "Garlic Steamed Asparagus & Barley Bowl", calories: "280 Kcal", carbs: "25g Net Carbs", spec: "Sodium: <120mg", imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&auto=format&fit=crop&q=80", price: 190 },
      { name: "Low-Salt Vegetable Lentil Broth", calories: "180 Kcal", carbs: "18g Net Carbs", spec: "Sodium: <90mg", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80", price: 130 },
      { name: "Baked Herb Salmon with Broccoli", calories: "320 Kcal", carbs: "2g Net Carbs", spec: "Omega-3 Rich (DHA)", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80", price: 280 }
    ]
  },
  celiac: {
    id: "celiac",
    name: "Celiac (Gluten-Free)",
    tagline: "100% naturally gluten-free grains prepared in isolated, cross-contamination safe kitchens.",
    icon: "🌾",
    meals: [
      { name: "Organic Pearled Quinoa Veg Khichdi", calories: "310 Kcal", carbs: "28g Net Carbs", spec: "Certified Gluten-Free", imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&auto=format&fit=crop&q=80", price: 160 },
      { name: "Steamed Moong Dal Idli Set", calories: "180 Kcal", carbs: "24g Net Carbs", spec: "Lactose & Gluten Free", imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&auto=format&fit=crop&q=80", price: 110 },
      { name: "Ragi Millet Crepes (Set of 2)", calories: "215 Kcal", carbs: "20g Net Carbs", spec: "Mineral-rich pseudograin", imageUrl: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&auto=format&fit=crop&q=80", price: 130 }
    ]
  },
  kidney: {
    id: "kidney",
    name: "Kidney Support",
    tagline: "Controlled-potassium, low-phosphorus dishes tailored for renal health and filtration ease.",
    icon: "🧼",
    meals: [
      { name: "Renal-Safe Cauliflower Fried Rice", calories: "195 Kcal", carbs: "6g Net Carbs", spec: "Low Potassium/Phos", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80", price: 170 },
      { name: "Egg White Herb Scramble", calories: "160 Kcal", carbs: "2g Net Carbs", spec: "High-biological protein", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80", price: 120 },
      { name: "Baked Herb Chicken with Asparagus", calories: "260 Kcal", carbs: "3g Net Carbs", spec: "Renal portioned protein", imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400&auto=format&fit=crop&q=80", price: 230 }
    ]
  },
  pcos: {
    id: "pcos",
    name: "PCOS / Insulin",
    tagline: "Insulin-sensitizing configurations rich in essential fatty acids and complex, slow-absorbing carbs.",
    icon: "🥑",
    meals: [
      { name: "Grilled Almond Chicken Salad", calories: "340 Kcal", carbs: "4g Net Carbs", spec: "Inositol & Zinc Rich", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80", price: 240 },
      { name: "Sautéed Tofu Barley Grain Bowl", calories: "270 Kcal", carbs: "21g Net Carbs", spec: "High Magnesium / Low GI", imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80", price: 180 },
      { name: "Sugar-free Flaxseed Chia Pudding", calories: "150 Kcal", carbs: "3g Net Carbs", spec: "Omega-3 (ALA) Booster", imageUrl: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&auto=format&fit=crop&q=80", price: 110 }
    ]
  },
  thyroid: {
    id: "thyroid",
    name: "Thyroid Balance",
    tagline: "Selenium and iodine supportive nutrient models, strictly avoiding unfermented goitrogen elements.",
    icon: "🦋",
    meals: [
      { name: "Baked Mustard Fish Bowl with Greens", calories: "290 Kcal", carbs: "2g Net Carbs", spec: "Selenium & Iodine Rich", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80", price: 260 },
      { name: "Roasted Turkey Salad & Asparagus", calories: "250 Kcal", carbs: "3g Net Carbs", spec: "Tyrosine Amino Acid source", imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&auto=format&fit=crop&q=80", price: 220 },
      { name: "Sautéed Tofu with Wild Mushrooms", calories: "210 Kcal", carbs: "12g Net Carbs", spec: "Zinc & Vitamin D supportive", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80", price: 160 }
    ]
  }
};

export default function FoodByDisease({ onAddToCart }) {
  const [activeCondition, setActiveCondition] = useState('diabetes');

  const currentCondition = DISEASE_MEALS[activeCondition];

  return (
    <div className="w-full">
      
      {/* SECTION HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 text-[#3D3F96] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
            Dietary Therapeutics
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight mt-3">
            Meal Curations By Medical Profile
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-xl">
            Select your specific health or metabolic profile below to explore nutritionist-engineered meals focused on your therapeutic goals.
          </p>
        </div>
      </div>

      {/* DISEASES TABS */}
      <div className="flex gap-3 overflow-x-auto scrollbar-none pb-6">
        {Object.values(DISEASE_MEALS).map((condition) => {
          const isSelected = activeCondition === condition.id;
          return (
            <button
              key={condition.id}
              onClick={() => setActiveCondition(condition.id)}
              className={`flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs font-black transition-all duration-200 focus:outline-none whitespace-nowrap ${
                isSelected
                  ? 'bg-[#3D3F96] text-white shadow-md'
                  : 'bg-white border border-slate-200 text-gray-600 hover:border-slate-300'
              }`}
            >
              <span className="text-sm">{condition.icon}</span>
              <span>{condition.name}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE DISEASE DESCRIPTION CARD */}
      <div className="bg-indigo-50/40 border border-indigo-100/35 rounded-3xl p-6 md:p-8 mb-8 animate-fade-in flex items-center gap-5">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm shrink-0 border border-indigo-50">
          {currentCondition.icon}
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 text-sm sm:text-base leading-none">
            {currentCondition.name} Therapy Model
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 leading-relaxed">
            {currentCondition.tagline}
          </p>
        </div>
      </div>

      {/* MEAL CARD GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentCondition.meals.map((meal, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 border border-slate-100"
          >
            <div>
              {/* Photo Area */}
              <div 
                className="relative h-44 w-full overflow-hidden bg-gray-50"
                style={{ transform: 'translateZ(0)' }}
              >
                <img
                  src={meal.imageUrl}
                  alt={meal.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                <span className="absolute bottom-3 left-4 text-white text-[10px] font-black uppercase tracking-wider bg-[#3D3F96]/90 backdrop-blur-md px-2.5 py-1.5 rounded-md shadow-sm">
                  {meal.spec}
                </span>
              </div>

              {/* Description Body */}
              <div className="p-6">
                <h4 className="font-extrabold text-gray-950 text-sm leading-snug min-h-[40px] line-clamp-2">
                  {meal.name}
                </h4>
                <div className="flex gap-2 mt-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-extrabold leading-none">
                    {meal.calories}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-extrabold leading-none">
                    {meal.carbs}
                  </span>
                </div>
              </div>
            </div>

            {/* Pricing & checkout button footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <span className="block text-[8px] text-gray-400 font-bold uppercase leading-none">Price per serving</span>
                <strong className="text-base font-black text-gray-950 mt-1 block leading-none">₹{meal.price}</strong>
              </div>
              <button
                onClick={() => {
                  if (onAddToCart) onAddToCart(meal.price, meal.name, `${currentCondition.name} Therapy`);
                }}
                className="bg-[#3D3F96] hover:bg-indigo-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition active:scale-95"
              >
                Add Meal
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* VIEW MORE CTA BUTTON (Redirects to Directory pre-filtered by selected condition) */}
      <div className="flex justify-center mt-12">
        <Link 
          href={`/user/food/directory?disease=${activeCondition}`} // Redirects to Directory page
          className="inline-flex items-center gap-2.5 border-2 border-[#3D3F96] text-[#3D3F96] hover:bg-indigo-50/50 font-black px-8 py-4 rounded-2xl text-xs sm:text-sm shadow-sm transition active:scale-95 uppercase tracking-wider"
        >
          <span>Explore More Disease Menus</span>
          <span className="text-sm font-bold">→</span>
        </Link>
      </div>

    </div>
  );
}