"use client";

import React, { useState, useEffect } from 'react';
import MainPage from './components/MainPage';          
import Categories from './components/Categories';       
import Outlets from './components/Outlets';             
import FoodList from './components/FoodList';          
import TodaysSpecial from './components/TodaySpecial'; 
import Combos from './components/Combos';               
import OurTiffin from './components/OurTiffin';        
import YourTiffin from './your-tiffin/page';      
import Presence from './components/Presence';           
import CartModal from './cart/page';              
import AdvantagesModal from './components/AdvantagesModal'; 
import FoodByDisease from './components/FoodByDisease'; 

export default function FoodStorefront() {
  const [selectedTag, setSelectedTag] = useState('All'); 
  const [selectedOutlet, setSelectedOutlet] = useState(null);

  // Tracks the active tab in the main food hub ('menu' | 'specials' | 'combos')
  const [activeMenuTab, setActiveMenuTab] = useState('menu');

  // Intercepts scroll actions from layout.js to switch tabs dynamically
  useEffect(() => {
    const handleGlobalTabSwitch = (e) => {
      const tabMap = {
        specials: 'specials',
        combos: 'combos',
        catalog: 'menu'
      };
      if (tabMap[e.detail]) {
        setActiveMenuTab(tabMap[e.detail]);
      }
    };
    window.addEventListener('switch-menu-tab', handleGlobalTabSwitch);
    return () => window.removeEventListener('switch-menu-tab', handleGlobalTabSwitch);
  }, []);

  // Checkout cart states
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false); 

  const handleTagSelect = (tag) => {
    setSelectedTag(tag);
  };

  // Live cart calculation handler appending rich objects
  const addToCart = (price, name, details = 'Clinically Checked') => {
    setCartItems((prev) => [...prev, { name, price, details }]);
    const toast = document.getElementById('cart-toast');
    if (toast) {
      toast.innerText = `Added ${name} to checkout basket`;
      toast.classList.remove('opacity-0', 'translate-y-4');
      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
      }, 2000);
    }
  };

  // Live cart reduction handler to support checkout +/- selectors
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-24 relative space-y-12 md:space-y-16 animate-fade-in">
      
      {/* PERSISTENT FLOATING TOAST ALERTS */}
      <div 
        id="cart-toast" 
        className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-bold px-4 py-3 rounded-full shadow-lg transition-all duration-300 transform opacity-0 translate-y-4 z-50 pointer-events-none"
      >
        Added item to basket
      </div>

      {/* PART 1: Hero Banner & Glycemic Standards Foreground */}
      <MainPage />

      {/* PART 2: ACTIVE TRANSIT PATHWAY & STORE DISPATCH DASHBOARD */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 md:mt-16">
        <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Visual Route Grid Segment */}
          <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto flex-1 min-w-0">
            
            {/* Node 1: Selected Kitchen Hub */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 md:flex-none md:max-w-xs">
              <div className="w-12 h-12 rounded-2xl bg-[#3D3F96] text-white flex items-center justify-center text-xl shadow-md shadow-[#3D3F96]/10 shrink-0">
                🍳
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-[#3D3F96] bg-indigo-50 font-black uppercase tracking-widest px-2.5 py-0.5 rounded block w-max leading-none">
                  Active Fulfillment Kitchen
                </span>
                <strong className="text-slate-800 text-xs mt-2 block leading-tight truncate">
                  {selectedOutlet ? selectedOutlet.name : "Select Nearest Kitchen Below"}
                </strong>
                <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
                  {selectedOutlet ? selectedOutlet.prepTime : "Fulfillment Hub"}
                </span>
              </div>
            </div>

            {/* Dotted Delivery Progress Path Connector */}
            <div className="hidden md:flex flex-1 h-1 border-t-2 border-dashed border-[#3D3F96]/20 relative items-center justify-center min-w-[120px]">
              <span className="absolute -top-3 bg-indigo-50 border border-indigo-150 text-[#3D3F96] text-[9px] font-black px-2.5 py-0.5 rounded-full whitespace-nowrap">
                🚴 {selectedOutlet ? selectedOutlet.distance : "5.0 km"} Transit Route
              </span>
            </div>

            {/* Node 2: Selected Customer Delivery Location */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 md:flex-none md:max-w-xs">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-xl shadow-md shadow-emerald-500/10 shrink-0">
                📍
              </div>
              <div className="min-w-0">
                <span className="text-[9px] text-emerald-600 bg-emerald-50 font-black uppercase tracking-widest px-2.5 py-0.5 rounded block w-max leading-none">
                  Assigned Patient Destination
                </span>
                <strong className="text-slate-900 text-xs mt-2 block leading-tight truncate">
                  Indiranagar, Bangalore
                </strong>
                <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">
                  25 - 30 Mins Dispatch
                </span>
              </div>
            </div>

          </div>

          {/* Change Location Action Column */}
          <div className="flex items-center justify-between lg:justify-end gap-5 w-full lg:w-auto border-t lg:border-t-0 border-slate-100 pt-4 lg:pt-0 shrink-0">
            <div className="text-left lg:text-right">
              <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">Fulfillment Network Status</span>
              <span className="text-xs font-black text-emerald-600 flex items-center gap-1.5 mt-2 leading-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Fastest Dispatch Active
              </span>
            </div>
            <button 
              onClick={() => {
                const element = document.getElementById('outlets');
                if (element) element.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-[#3D3F96] hover:bg-indigo-850 text-white text-xs font-extrabold px-4.5 py-3 rounded-2xl shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              Change Kitchen Hub
            </button>
          </div>

        </div>
      </div>

      {/* PART 3: QUICK DIETARY CATEGORIZATION CAROUSEL */}
      <div className="my-12 md:my-16">
        <Categories 
          selectedTag={selectedTag}
          onTagSelect={handleTagSelect}
        />
      </div>

      {/* PART 4: THERAPEUTIC MENU SWITCH HUB */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 md:my-16">
        
        <section id="menu-hub" className="scroll-mt-24 space-y-8 w-full">
          
          {/* Custom Tab Swapper Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5">
            <div>
              <span className="text-[9px] bg-indigo-50 text-[#3D3F96] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                Diabeteswala Kitchen Hub
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 mt-1.5 capitalize leading-none tracking-tight">
                {activeMenuTab === 'menu' && "Therapeutic Diet Directory"}
                {activeMenuTab === 'specials' && "Nutritionist Chef Specials"}
                {activeMenuTab === 'combos' && "Balanced Multi-Meal Bundles"}
              </h2>
            </div>

            {/* Tab Swappers */}
            <div className="flex bg-gray-100 p-1 rounded-2xl border border-gray-200 shadow-inner overflow-x-auto scrollbar-none self-start sm:self-auto">
              <button
                onClick={() => setActiveMenuTab('menu')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeMenuTab === 'menu' ? 'bg-white text-[#3D3F96] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Full Menu
              </button>
              <button
                onClick={() => setActiveMenuTab('specials')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeMenuTab === 'specials' ? 'bg-white text-[#3D3F96] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Today's Specials
              </button>
              <button
                onClick={() => setActiveMenuTab('combos')}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeMenuTab === 'combos' ? 'bg-white text-[#3D3F96] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Combo Offers
              </button>
            </div>
          </div>

          {/* DYNAMIC COMPONENT INJECTION BASED ON ACTIVE TAB */}
          <div className="animate-fade-in w-full">
            {activeMenuTab === 'specials' && (
              <div className="space-y-6">
                {selectedOutlet && (
                  <span className="text-xs text-gray-400 font-bold">Specials at: <strong className="text-[#3D3F96]">{selectedOutlet.name}</strong></span>
                )}
                <TodaysSpecial onAddToCart={(price, name) => addToCart(price, name)} />
              </div>
            )}

            {activeMenuTab === 'combos' && (
              <div className="space-y-6">
                {selectedOutlet && (
                  <span className="text-xs text-gray-400 font-bold">Combo offers at: <strong className="text-[#3D3F96]">{selectedOutlet.name}</strong></span>
                )}
                <Combos onAddToCart={(price, name) => addToCart(price, name)} />
              </div>
            )}

            {activeMenuTab === 'menu' && (
              <div className="space-y-6">
                {/* Responsive Status Indicator Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-gray-400 pb-3 w-full overflow-hidden">
                  <div className="flex flex-wrap gap-2">
                    <span>Category Tag: <strong className="text-[#3D3F96]">{selectedTag}</strong></span>
                  </div>
                  {selectedOutlet && (
                    <span className="truncate">Dispatched from: <strong className="text-[#3D3F96]">{selectedOutlet.name}</strong></span>
                  )}
                </div>
                <FoodList 
                  selectedTag={selectedTag}
                  onAddToCart={addToCart}
                  onRemoveFromCart={removeFromCart}
                  cartItems={cartItems}
                />
              </div>
            )}
          </div>

        </section>

      </div>

      {/* PART 5: THE SEAMLESS CLINICAL CARE & REVERSAL STANDARDS ADVANTAGES */}
      <div className="my-12 md:my-16">
        <AdvantagesModal />
      </div>

      {/* PART 6: PRESCRIPTION PLATES BY MEDICAL CONDITION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 md:my-16">
        <FoodByDisease onAddToCart={addToCart} />
      </div>

      {/* PART 7: REGIONAL KITCHEN HUB LOCATOR */}
      <section id="outlets" className="scroll-mt-24 my-12 md:my-16">
        <Outlets 
          onSelectOutlet={setSelectedOutlet}
          selectedOutlet={selectedOutlet}
        />
      </section>

      {/* COMPACT INTERACTIVE SUBSCRIPTION & PROFILE CUSTOMIZERS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-28 md:space-y-36 my-12 md:my-16">
        
        {/* Our Glycemic-Control subscription plans */}
        <section id="tiffin-service" className="scroll-mt-20">
          <OurTiffin />
        </section>

        {/* Our custom carbohydrate plate builder */}
        <section id="custom-tiffin" className="scroll-mt-20">
          <YourTiffin onAddToCart={addToCart} />
        </section>

      </div>

      {/* PART 8: NATIONAL COHORT MAP & REACH */}
      <section id="presence" className="scroll-mt-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12 md:my-16">
        <Presence />
      </section>

      {/* PERSISTENT FLOATING QUICK CUSTOM TIFFIN BUILDER OVERLAY */}
      <div className="fixed bottom-28 right-6 z-40 animate-bounce-short">
        <button 
          onClick={() => {
            const el = document.getElementById('custom-tiffin');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
            window.dispatchEvent(new CustomEvent('open-custom-tiffin'));
          }} 
          className="flex items-center gap-3 bg-white hover:bg-indigo-50/50 text-[#3D3F96] font-bold px-5 py-4 rounded-full shadow-2xl border-2 border-[#3D3F96] transition hover:scale-105 active:scale-95"
        >
          <span className="text-xl">🍱</span>
          <div className="text-left border-l border-[#3D3F96]/20 pl-3">
            <span className="block text-[9px] text-[#3D3F96]/70 uppercase tracking-wider font-semibold leading-none">Dietary Ratios</span>
            <span className="text-xs sm:text-sm font-extrabold">Build Custom Tiffin</span>
          </div>
        </button>
      </div>

      {/* PERSISTENT FLOATING SECURED BASKET TRIGGER */}
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

      {/* STANDALONE SECURED CHECKOUT OVERLAY */}
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