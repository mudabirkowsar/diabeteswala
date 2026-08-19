'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; // Added for routing redirect

// Master menu database containing 15 premium glycemic-conscious dishes
const menuDatabase = [
  {
    id: 1,
    name: "Quinoa Khichdi with Broccoli",
    description: "Comfort food made using whole white quinoa grains and split yellow lentils. Slow carbs with high soluble dietary fiber.",
    price: 180,
    discountPrice: 155,
    calories: 320,
    prepTime: "20 min",
    servingSize: "350g",
    ingredients: ["Quinoa", "Yellow Moong Dal", "Broccoli", "Ginger", "Turmeric"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Low GI", "High Fiber"],
    stock: 15,
    netCarbs: "28g",
    glycemicIndex: 38,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 2,
    name: "Almond Crust Paneer Tikka",
    description: "Low-carb keto paneer chunks coated in cracked ground raw almond flour, baked roasted in tandoor.",
    price: 240,
    discountPrice: 220,
    calories: 410,
    prepTime: "25 min",
    servingSize: "250g",
    ingredients: ["Paneer", "Almond Flour", "Yogurt", "Kashmiri Chili", "Garam Masala"],
    dietType: "Veg",
    spicyLevel: 2,
    tags: ["Keto", "Gluten Free"],
    stock: 8,
    netCarbs: "6g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 3,
    name: "High-Protein Egg White Bhurji",
    description: "Three organic egg whites scrambled with fresh spring onions, bell peppers, tomatoes, and ground black pepper.",
    price: 160,
    discountPrice: 140,
    calories: 190,
    prepTime: "15 min",
    servingSize: "200g",
    ingredients: ["Egg Whites", "Bell Peppers", "Spring Onion", "Olive Oil", "Black Pepper"],
    dietType: "Egg",
    spicyLevel: 2,
    tags: ["Low GI", "Keto"],
    stock: 20,
    netCarbs: "3g",
    glycemicIndex: 10,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 4,
    name: "Baked Mustard Fish Fillet",
    description: "Lean high-protein fish fillets prepared with yellow mustard seed paste, lime juice, and dynamic fresh spices.",
    price: 320,
    discountPrice: 290,
    calories: 270,
    prepTime: "30 min",
    servingSize: "220g",
    ingredients: ["Basa Fillet", "Mustard Paste", "Lemon", "Green Chili", "Mustard Oil"],
    dietType: "Non Veg",
    spicyLevel: 3,
    tags: ["Keto", "Gluten Free"],
    stock: 12,
    netCarbs: "1.5g",
    glycemicIndex: 0,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 5,
    name: "Oat-Bran Multigrain Roti Combo",
    description: "Fiber-rich roti paired with light low-sodium green spinach saag and non-fat plain curd.",
    price: 200,
    discountPrice: 175,
    calories: 340,
    prepTime: "22 min",
    servingSize: "400g",
    ingredients: ["Oat Bran", "Whole Wheat", "Spinach", "Spices", "Skimmed Milk Curd"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Low GI", "High Fiber"],
    stock: 18,
    netCarbs: "32g",
    glycemicIndex: 42,
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 6,
    name: "Keto Broccoli & Mushroom Stir-fry",
    description: "Crisp broccoli florets and white button mushrooms wok-tossed in garlic oil with low-sodium soy dressing.",
    price: 210,
    discountPrice: 180,
    calories: 145,
    prepTime: "12 min",
    servingSize: "250g",
    ingredients: ["Broccoli", "Mushrooms", "Garlic", "Cold-Pressed Sesame Oil", "Soy Sauce"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Keto", "Gluten Free"],
    stock: 14,
    netCarbs: "5g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 7,
    name: "Spinach & Herb Egg White Omelette",
    description: "Folded egg whites stuffed with blanched green spinach leaves, fresh coriander, and micro-herbs.",
    price: 170,
    discountPrice: 150,
    calories: 175,
    prepTime: "15 min",
    servingSize: "180g",
    ingredients: ["Egg Whites", "Spinach", "Coriander", "Green Chilies", "Olive Oil"],
    dietType: "Egg",
    spicyLevel: 2,
    tags: ["Keto", "Gluten Free"],
    stock: 22,
    netCarbs: "2g",
    glycemicIndex: 10,
    imageUrl: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 8,
    name: "Lemon Herb Grilled Chicken Salad",
    description: "Lean skinless chicken breast grilled with fresh oregano and lime juice, tossed with cucumber and cherry tomatoes.",
    price: 290,
    discountPrice: 260,
    calories: 310,
    prepTime: "25 min",
    servingSize: "300g Bowl",
    ingredients: ["Chicken Breast", "Lime Juice", "Cucumber", "Cherry Tomatoes", "Olive Oil"],
    dietType: "Non Veg",
    spicyLevel: 1,
    tags: ["Keto", "Gluten Free"],
    stock: 16,
    netCarbs: "4g",
    glycemicIndex: 5,
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 9,
    name: "Organic Ragi Malt Porridge Bowl",
    description: "Hot ragi malt simmered with skimmed milk and topped with raw unsalted organic almonds and chia seeds.",
    price: 150,
    discountPrice: 130,
    calories: 220,
    prepTime: "10 min",
    servingSize: "280g Bowl",
    ingredients: ["Ragi Flour", "Skimmed Milk", "Almonds", "Chia Seeds", "Stevia"],
    dietType: "Veg",
    spicyLevel: 0,
    tags: ["Low GI", "High Fiber"],
    stock: 10,
    netCarbs: "24g",
    glycemicIndex: 40,
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: 10,
    name: "Tandoori Baked Tofu Platter",
    description: "Soya milk tofu blocks marinated in low-fat Greek yogurt and traditional Indian spices, baked golden in clay oven.",
    price: 220,
    discountPrice: 195,
    calories: 240,
    prepTime: "20 min",
    servingSize: "220g",
    ingredients: ["Tofu", "Greek Yogurt", "Spices", "Lemon Juice", "Mustard Oil"],
    dietType: "Veg",
    spicyLevel: 2,
    tags: ["Keto", "Gluten Free"],
    stock: 15,
    netCarbs: "4g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  }
];

export default function FoodList({ 
  selectedTag, 
  onAddToCart, 
  onRemoveFromCart = () => {}, 
  cartItems = [],              
  searchQuery: initialSearchQuery = '', 
  selectedDiet: initialSelectedDiet = ''
}) {
  const router = useRouter(); // Initialize router
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedDiet, setSelectedDiet] = useState(initialSelectedDiet);
  const [localQuantities, setLocalQuantities] = useState({});
  const [activeFoodItem, setActiveFoodItem] = useState(null);

  const getItemCount = (name) => {
    if (cartItems && cartItems.length > 0) {
      return cartItems.filter(item => item.name === name).length;
    }
    return localQuantities[name] || 0;
  };

  const handleAddQty = (price, name) => {
    setLocalQuantities(prev => ({
      ...prev,
      [name]: (prev[name] || 0) + 1
    }));
    if (onAddToCart) {
      onAddToCart(price, name);
    }
  };

  const handleSubtractQty = (name) => {
    setLocalQuantities(prev => {
      const current = prev[name] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[name];
        return next;
      }
      return { ...prev, [name]: current - 1 };
    });
    if (onRemoveFromCart) {
      onRemoveFromCart(name);
    }
  };

  const handleDeleteItem = (name) => {
    setLocalQuantities(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });

    const currentCount = getItemCount(name);
    for (let i = 0; i < currentCount; i++) {
      if (onRemoveFromCart) {
        onRemoveFromCart(name);
      }
    }
  };

  const filteredItems = menuDatabase.filter((item) => {
    const matchesSearch = 
      item.name.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      item.description.toLowerCase().includes((searchQuery || '').toLowerCase()) ||
      item.ingredients.some(ing => ing.toLowerCase().includes((searchQuery || '').toLowerCase()));

    const matchesDiet = selectedDiet === '' || item.dietType === selectedDiet;
    const matchesTag = selectedTag === 'All' || item.tags.includes(selectedTag);

    return matchesSearch && matchesDiet && matchesTag;
  });

  const limitedItems = filteredItems.slice(0, 8); // FIXED: Limits display to exactly 8 items (2 lines of 4 cards)

  const renderDietBadge = (dietType) => {
    switch (dietType) {
      case 'Veg':
        return (
          <span className="inline-flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            Veg Only
          </span>
        );
      case 'Egg':
        return (
          <span className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            Eggitarian
          </span>
        );
      case 'Non Veg':
        return (
          <span className="inline-flex items-center gap-1.5 bg-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            Non-Veg
          </span>
        );
      default:
        return null;
    }
  };

  const renderSpicyLevel = (level) => {
    return (
      <span className="text-rose-500 text-xs">
        {Array.from({ length: level }).map((_, i) => (
          <span key={i} className="inline-block">🌶️</span>
        ))}
      </span>
    );
  };

  const handleDietToggle = (dietType) => {
    setSelectedDiet(prev => (prev === dietType ? '' : dietType));
  };

  const QuantitySelector = ({ item }) => {
    const count = getItemCount(item.name);

    if (count > 0) {
      return (
        <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
          <div className="flex items-center gap-2 bg-indigo-50 text-[#3D3F96] rounded-xl p-1 border border-[#3D3F96]/15 font-black shadow-sm">
            <button 
              onClick={() => handleSubtractQty(item.name)}
              className="w-8 h-8 rounded-lg hover:bg-white text-indigo-950 flex items-center justify-center transition text-base font-black active:scale-90"
            >
              -
            </button>
            <span className="px-1 text-xs font-black min-w-[18px] text-center text-slate-800">
              {count}
            </span>
            <button 
              onClick={() => handleAddQty(item.discountPrice, item.name)}
              className="w-8 h-8 rounded-lg hover:bg-white text-indigo-950 flex items-center justify-center transition text-base font-black active:scale-90"
            >
              +
            </button>
          </div>

          <button
            onClick={() => handleDeleteItem(item.name)}
            className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 hover:bg-rose-100/80 flex items-center justify-center transition text-rose-600 active:scale-90"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      );
    }

    return item.stock > 0 ? (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleAddQty(item.discountPrice, item.name);
        }}
        className="bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition active:scale-95"
      >
        Add to Basket
      </button>
    ) : (
      <span className="text-xs font-bold text-gray-400 bg-gray-150 px-3 py-2 rounded-lg">
        Sold Out
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* INTEGRATED SEARCH & DIET SELECTION PANEL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl shadow-sm">
        <div className="relative flex-1 max-w-md bg-white border border-slate-200 rounded-xl px-4 py-3.5 flex items-center text-gray-800 transition-all focus-within:border-[#3D3F96] focus-within:ring-4 focus-within:ring-[#3D3F96]/10">
          <div className="mr-3 text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search low-GI ingredients, dishes (e.g., Quinoa, Paneer)..."
            className="w-full text-xs font-semibold focus:outline-none bg-transparent text-slate-700"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-400 font-extrabold uppercase tracking-widest text-[10px] mr-1">Diet Mode</span>
          <button
            onClick={() => handleDietToggle('Veg')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold transition-all duration-200 ${
              selectedDiet === 'Veg' ? 'bg-emerald-500 border-transparent text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedDiet === 'Veg' ? 'bg-white' : 'bg-emerald-500'}`}></span>
            Veg Only
          </button>
          <button
            onClick={() => handleDietToggle('Egg')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold transition-all duration-200 ${
              selectedDiet === 'Egg' ? 'bg-amber-500 border-transparent text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedDiet === 'Egg' ? 'bg-white' : 'bg-amber-500'}`}></span>
            Eggitarian
          </button>
          <button
            onClick={() => handleDietToggle('Non Veg')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border font-bold transition-all duration-200 ${
              selectedDiet === 'Non Veg' ? 'bg-rose-500 border-transparent text-white shadow-md' : 'bg-white border-slate-200 text-slate-600'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${selectedDiet === 'Non Veg' ? 'bg-white' : 'bg-rose-500'}`}></span>
            Non-Veg
          </button>
        </div>
      </div>

      {limitedItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm max-w-xl mx-auto">
          <p className="text-gray-400 text-sm">No items match your selected parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {limitedItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => setActiveFoodItem(item)} 
              className="bg-white rounded-[24px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-[#3D3F96]/5 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-50">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                  {renderDietBadge(item.dietType)}
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {item.prepTime}
                  </span>
                </div>
                <div className="absolute bottom-4 left-4">
                  <span className="bg-[#3D3F96] text-white text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded shadow-sm">
                    {item.tags[0]}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between min-w-0 w-full">
                <div>
                  <div className="flex items-center justify-between mb-1 min-w-0 w-full">
                    <h3 className="font-extrabold text-slate-800 text-base group-hover:text-[#3D3F96] transition-colors truncate leading-snug w-full" title={item.name}>
                      {item.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block mb-2">{item.servingSize}</span>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
                    {item.description}
                  </p>
                  
                  <div className="grid grid-cols-3 gap-1 bg-slate-50/50 p-2.5 rounded-2xl text-center text-xs mb-4 border border-slate-100">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Calories</span>
                      <strong className="text-slate-700 text-xs font-bold">{item.calories} Kcal</strong>
                    </div>
                    <div className="border-l border-r border-gray-200/60">
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Net Carbs</span>
                      <strong className="text-slate-700 text-xs font-bold">{item.netCarbs}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Est. GI</span>
                      <strong className={`text-xs ${item.glycemicIndex <= 55 ? 'text-[#00B574] font-extrabold' : 'text-amber-600 font-extrabold'}`}>
                        GI: {item.glycemicIndex}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 line-through font-bold">₹{item.price}</span>
                    <span className="text-lg font-black text-slate-900">₹{item.discountPrice}</span>
                  </div>
                  <QuantitySelector item={item} />
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* VIEW MORE CTA BUTTON (Centered below the food cards grid) */}
      <div className="flex justify-center mt-12">
        <button
          onClick={() => router.push('/user/food/directory')} // Redirects to Directory page
          className="inline-flex items-center gap-2.5 border-2 border-[#3D3F96] text-[#3D3F96] hover:bg-indigo-50/50 font-black px-8 py-4 rounded-2xl text-xs sm:text-sm shadow-sm transition active:scale-95 uppercase tracking-wider"
        >
          <span>Explore Full Food Directory</span>
          <span className="text-sm font-bold">→</span>
        </button>
      </div>

      {/* DETAILED SPECIFICATIONS MODAL OVERLAY */}
      {activeFoodItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-10 shadow-2xl relative border border-gray-150 flex flex-col justify-between">
            <button 
              onClick={() => setActiveFoodItem(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition z-20"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-5 bg-gray-50 border border-gray-100 flex-shrink-0">
              <img src={activeFoodItem.imageUrl} alt={activeFoodItem.name} className="w-full h-full object-cover animate-fade-in" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                {renderDietBadge(activeFoodItem.dietType)}
              </div>
              <div className="absolute top-4 right-4">
                <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                  Prep: {activeFoodItem.prepTime}
                </span>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="bg-[#3D3F96] text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded shadow-sm">
                  {activeFoodItem.tags[0]}
                </span>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-extrabold text-gray-900 text-lg leading-snug">
                    {activeFoodItem.name}
                  </h3>
                  <div className="shrink-0">{renderSpicyLevel(activeFoodItem.spicyLevel)}</div>
                </div>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">{activeFoodItem.servingSize} • Cooked Fresh</span>
                <p className="text-xs text-gray-500 leading-relaxed mt-2.5">{activeFoodItem.description}</p>
              </div>

              {activeFoodItem.ingredients && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ingredients Used</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFoodItem.ingredients.map((ing, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-100 rounded-lg text-xs font-semibold text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1 bg-gray-50 p-3 rounded-xl text-center text-xs border border-gray-150/70">
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Calories</span>
                  <strong className="text-gray-800 text-xs">{activeFoodItem.calories} Kcal</strong>
                </div>
                <div className="border-l border-r border-gray-200/60">
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Net Carbs</span>
                  <strong className="text-gray-800 text-xs">{activeFoodItem.netCarbs}</strong>
                </div>
                <div>
                  <span className="block text-[9px] text-gray-400 font-bold uppercase">Glycemic Index</span>
                  <strong className={`text-xs ${activeFoodItem.glycemicIndex <= 55 ? 'text-[#00B574] font-extrabold' : 'text-amber-600 font-extrabold'}`}>
                    GI: {activeFoodItem.glycemicIndex} (Low)
                  </strong>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-150 pt-5 mt-6 flex items-center justify-between">
              <div>
                <span className="block text-[10px] text-gray-400 line-through">₹{activeFoodItem.price}</span>
                <span className="text-lg font-black text-gray-950">₹{activeFoodItem.discountPrice}</span>
              </div>
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setActiveFoodItem(null)}
                  className="px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <QuantitySelector item={activeFoodItem} />
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}