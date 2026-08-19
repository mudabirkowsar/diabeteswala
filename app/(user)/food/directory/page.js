"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import CartModal from '../cart/page'; // Imported standard Cart modal

// Unified food dataset mapped by categories and disease safety profiles
const MASTER_FOOD_LIST = [
  { id: 1, name: "Multi-Grain Methi Paratha Combo", category: "High Fiber", disease: "diabetes", price: 130, calories: 290, carbs: "22g", gi: 35, spec: "Organic Whole Wheat", imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&auto=format&fit=crop&q=80" },
  { id: 2, name: "Tender Paneer Brown Rice Bowl", category: "Low GI", disease: "diabetes", price: 210, calories: 420, carbs: "30g", gi: 45, spec: "Organic Brown Basmati", imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&auto=format&fit=crop&q=80" },
  { id: 3, name: "Sautéed Chicken Breast & Broccoli", category: "Keto", disease: "pcos", price: 280, calories: 310, carbs: "4g", gi: 5, spec: "High Lean Protein", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80" },
  { id: 4, name: "Garlic Steamed Asparagus & Barley Bowl", category: "Low GI", disease: "hypertension", price: 190, calories: 280, carbs: "25g", gi: 32, spec: "Sodium: <120mg", imageUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=400&auto=format&fit=crop&q=80" },
  { id: 5, name: "Low-Salt Vegetable Lentil Broth", category: "Gluten Free", disease: "hypertension", price: 130, calories: 180, carbs: "18g", gi: 15, spec: "Sodium: <90mg", imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=400&auto=format&fit=crop&q=80" },
  { id: 6, name: "Organic Pearled Quinoa Veg Khichdi", category: "Gluten Free", disease: "celiac", price: 160, calories: 310, carbs: "28g", gi: 43, spec: "Cross-Contamination Safe", imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&auto=format&fit=crop&q=80" },
  { id: 7, name: "Renal-Safe Cauliflower Fried Rice", category: "Keto", disease: "kidney", price: 170, calories: 195, carbs: "6g", gi: 15, spec: "Low Potassium/Phos", imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80" },
  { id: 8, name: "Egg White Herb Scramble", category: "Keto", disease: "kidney", price: 120, calories: 160, carbs: "2g", gi: 10, spec: "High Biological Protein", imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&auto=format&fit=crop&q=80" },
  { id: 9, name: "Grilled Almond Chicken Salad", category: "High Fiber", disease: "pcos", price: 240, calories: 340, carbs: "4g", gi: 15, spec: "Inositol & Zinc Rich", imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&auto=format&fit=crop&q=80" },
  { id: 10, name: "Baked Mustard Fish Bowl with Greens", category: "Low GI", disease: "thyroid", price: 260, calories: 290, carbs: "2g", gi: 5, spec: "Selenium & Iodine Rich", imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&auto=format&fit=crop&q=80" }
];

const CATEGORIES = ["All", "Low GI", "Keto", "High Fiber", "Gluten Free"];
const DISEASES = [
  { id: "All", name: "All Conditions" },
  { id: "diabetes", name: "Diabetes" },
  { id: "hypertension", name: "Hypertension" },
  { id: "celiac", name: "Celiac" },
  { id: "kidney", name: "Kidney Care" },
  { id: "pcos", name: "PCOS" },
  { id: "thyroid", name: "Thyroid" }
];

function DirectoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // References for horizontal scrolling containers
  const diseaseScrollRef = useRef(null);
  const categoryScrollRef = useRef(null);

  // Initialize filters based on query parameters passed from main page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDisease, setSelectedDisease] = useState('All');

  // Checkout cart states
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const catParam = searchParams.get('category');
    const diseaseParam = searchParams.get('disease');
    if (catParam) setSelectedCategory(catParam);
    if (diseaseParam) setSelectedDisease(diseaseParam);
  }, [searchParams]);

  // Unified Filter logic
  const filteredFoods = MASTER_FOOD_LIST.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || food.category === selectedCategory;
    const matchesDisease = selectedDisease === "All" || food.disease === selectedDisease;
    return matchesSearch && matchesCategory && matchesDisease;
  });

  // Dynamic cart modifier and toast alert callbacks
  const addToCart = (price, name, details = 'Clinically Checked') => {
    setCartItems((prev) => [...prev, { name, price, details }]);
    const toast = document.getElementById('directory-toast');
    if (toast) {
      toast.innerText = `Added ${name} to checkout basket`;
      toast.classList.remove('opacity-0', 'translate-y-4');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
      }, 2000);
    }
  };

  const removeFromCart = (name) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(item => item.name === name);
      if (idx > -1) {
        const text = [...prev];
        text.splice(idx, 1);
        return text;
      }
      return prev;
    });
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  // Reusable dynamic horizontal smooth-scrolling handler
  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth / 2 
        : scrollLeft + clientWidth / 2;
      
      ref.current.scrollTo({
        left: scrollTo,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-gray-800 pb-24 relative">
      
      {/* PERSISTENT FLOATING TOAST ALERTS */}
      <div 
        id="directory-toast" 
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-5 py-3.5 rounded-full shadow-lg transition-all duration-300 transform opacity-0 translate-y-4 z-50 pointer-events-none"
      >
        Added item to basket
      </div>

      {/* HEADER HERO */}
      <div className="bg-gradient-to-r from-[#1E1B4B] to-[#3D3F96] text-white py-16 px-6 sm:px-12 lg:px-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col justify-between items-start gap-4 relative z-10">
          
          {/* STYLED BACK BUTTON */}
          <button
            onClick={() => router.push('/user/food')}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-indigo-100 hover:text-white px-4 py-2.5 rounded-2xl text-xs font-black transition-all backdrop-blur-md border border-white/10 active:scale-95 focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>Return to Dashboard</span>
          </button>

          <div className="mt-2">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none">Therapeutic Directory</h1>
            <p className="text-xs sm:text-sm text-indigo-150 mt-3 max-w-2xl leading-relaxed font-medium">
              Search, segment, and select meal options crafted specifically around your personal disease guidelines and target blood sugars.
            </p>
          </div>
        </div>
        
        {/* Decorative backdrop elements */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/15 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />
      </div>

      {/* TOP SECTION: OVERLAPPING FILTER & SEARCH CONTROL BOARD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.04)] space-y-6 border border-slate-100/60">
          
          {/* SEARCH BOX */}
          <div className="max-w-3xl mx-auto w-full">
            <div className="relative">
              <input
                type="text"
                placeholder="Search low-GI ingredients, dishes (e.g., Quinoa, Paneer)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/10 text-sm font-semibold transition-all shadow-inner bg-slate-50/45 text-slate-700"
              />
              <span className="absolute left-4.5 top-[38%] text-gray-400 text-lg">🔍</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
            
            {/* MEDICAL PROFILE ROW (With Left/Right Scroll Chevrons) */}
            <div className="space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Filter by Medical Profile</span>
                
                {/* Scroll Control Arrows */}
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => scrollContainer(diseaseScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-gray-100 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-600 transition shadow-sm focus:outline-none text-[10px] font-black"
                  >
                    ←
                  </button>
                  <button 
                    onClick={() => scrollContainer(diseaseScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-gray-100 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-600 transition shadow-sm focus:outline-none text-[10px] font-black"
                  >
                    →
                  </button>
                </div>
              </div>

              <div 
                ref={diseaseScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
              >
                {DISEASES.map((disease) => (
                  <button
                    key={disease.id}
                    onClick={() => setSelectedDisease(disease.id)}
                    className={`px-5 py-3 rounded-xl text-xs font-black transition-all duration-200 focus:outline-none whitespace-nowrap shrink-0 ${
                      selectedDisease === disease.id
                        ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/15"
                        : "bg-slate-50 border border-slate-100 text-gray-600 hover:bg-slate-100"
                    }`}
                  >
                    {disease.name}
                  </button>
                ))}
              </div>
            </div>

            {/* DIETARY TARGETS ROW (With Left/Right Scroll Chevrons) */}
            <div className="space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Filter by Dietary Target</span>
                
                {/* Scroll Control Arrows */}
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => scrollContainer(categoryScrollRef, 'left')}
                    className="w-8 h-8 rounded-full border border-gray-100 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-600 transition shadow-sm focus:outline-none text-[10px] font-black"
                  >
                    ←
                  </button>
                  <button 
                    onClick={() => scrollContainer(categoryScrollRef, 'right')}
                    className="w-8 h-8 rounded-full border border-gray-100 bg-white hover:bg-slate-50 flex items-center justify-center text-gray-600 transition shadow-sm focus:outline-none text-[10px] font-black"
                  >
                    →
                  </button>
                </div>
              </div>

              <div 
                ref={categoryScrollRef}
                className="flex gap-2 overflow-x-auto scrollbar-none pb-2 scroll-smooth"
              >
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-3 rounded-xl text-xs font-black transition-all duration-200 focus:outline-none whitespace-nowrap shrink-0 ${
                      selectedCategory === cat
                        ? "bg-[#3D3F96] text-white shadow-md shadow-[#3D3F96]/15"
                        : "bg-slate-50 border border-slate-100 text-gray-600 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* BOTTOM SECTION: SEARCH RESULTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        <div className="flex items-center justify-between border-b border-gray-200/60 pb-4 mb-8">
          <span className="text-xs font-bold text-gray-400">
            Showing <strong className="text-gray-900">{filteredFoods.length}</strong> matching meals
          </span>
          {(selectedCategory !== "All" || selectedDisease !== "All" || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedDisease('All');
              }}
              className="text-xs text-[#3D3F96] hover:underline font-bold"
            >
              Clear all filters
            </button>
          )}
        </div>

        {filteredFoods.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredFoods.map((meal) => (
              <div
                key={meal.id}
                className="bg-white rounded-3xl overflow-hidden flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgba(61,63,150,0.08)] hover:-translate-y-1 transition-all duration-300 border border-slate-100/40"
              >
                <div>
                  {/* Visual Photo Area */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-4 text-white text-[10px] font-black uppercase tracking-wider bg-[#3D3F96]/90 backdrop-blur-md px-3 py-1.5 rounded-md shadow-sm">
                      {meal.spec}
                    </span>
                  </div>

                  {/* Description Body */}
                  <div className="p-6">
                    <h4 className="font-extrabold text-gray-950 text-base leading-snug min-h-[44px] line-clamp-2">
                      {meal.name}
                    </h4>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-extrabold leading-none">
                        {meal.calories} Kcal
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-extrabold leading-none">
                        {meal.carbs} Carbs
                      </span>
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-extrabold leading-none">
                        GI: {meal.gi}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Pricing & Checkout Button */}
                <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center shrink-0">
                  <div>
                    <span className="block text-[8px] text-gray-400 font-bold uppercase leading-none">Price per serving</span>
                    <strong className="text-base font-black text-gray-950 mt-1.5 block leading-none">₹{meal.price}</strong>
                  </div>
                  <button
                    onClick={() => addToCart(meal.price, meal.name, 'Therapeutic Directory')}
                    className="bg-[#3D3F96] hover:bg-indigo-900 text-white text-xs font-bold px-4.5 py-2.5 rounded-xl shadow-sm transition active:scale-95"
                  >
                    Add Meal
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border border-gray-100 rounded-3xl space-y-4 max-w-xl mx-auto shadow-sm">
            <span className="text-4xl block">🥗</span>
            <h3 className="font-black text-gray-900 text-lg">No matching meals found</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">Try adjusting your filters or search keywords to explore alternative meal combinations.</p>
          </div>
        )}

      </div>

      {/* PERSISTENT FLOATING QUICK CHECKOUT BASKET */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-short">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className="flex items-center gap-3 bg-[#3D3F96] hover:bg-indigo-850 text-white font-bold px-5 py-4 rounded-full shadow-2xl transition hover:scale-105 active:scale-95"
          >
            <div className="relative">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="absolute -top-2 -right-2 bg-rose-500 text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black">
                {cartItems.length}
              </span>
            </div>
            <div className="text-left border-l border-white/20 pl-3">
              <span className="block text-[9px] text-indigo-200 uppercase tracking-wider font-semibold leading-none">Checkout Basket</span>
              <span className="text-sm font-extrabold">₹{cartTotal}</span>
            </div>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* STANDALONE SECURED CHECKOUT PAGE */}
      <CartModal 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onClearCart={handleClearCart}
        onAddToCart={addToCart}
        onRemoveFromCart={removeFromCart}
      />

    </div>
  );
}

export default function DirectoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm font-bold text-gray-500">Loading Directory...</div>}>
      <DirectoryContent />
    </Suspense>
  );
}