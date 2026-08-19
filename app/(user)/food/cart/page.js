'use client';

import React, { useState, useEffect } from 'react';

// Master lookup library to retrieve rich photography and macros dynamically
const menuDatabase = [
  {
    name: "Quinoa Khichdi with Broccoli",
    description: "Comfort food made using whole white quinoa grains and split yellow lentils. Slow carbs with high soluble dietary fiber.",
    calories: 320,
    prepTime: "20 min",
    servingSize: "350g",
    ingredients: ["Quinoa", "Yellow Moong Dal", "Broccoli", "Ginger", "Turmeric"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Low GI", "High Fiber"],
    netCarbs: "28g",
    glycemicIndex: 38,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Almond Crust Paneer Tikka",
    description: "Low-carb keto paneer chunks coated in cracked ground raw almond flour, baked roasted in tandoor.",
    calories: 410,
    prepTime: "25 min",
    servingSize: "250g",
    ingredients: ["Paneer", "Almond Flour", "Yogurt", "Kashmiri Chili", "Garam Masala"],
    dietType: "Veg",
    spicyLevel: 2,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "6g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "High-Protein Egg White Bhurji",
    description: "Three organic egg whites scrambled with fresh spring onions, bell peppers, tomatoes, and ground black pepper.",
    calories: 190,
    prepTime: "15 min",
    servingSize: "200g",
    ingredients: ["Egg Whites", "Bell Peppers", "Spring Onion", "Olive Oil", "Black Pepper"],
    dietType: "Egg",
    spicyLevel: 2,
    tags: ["Low GI", "Keto"],
    netCarbs: "3g",
    glycemicIndex: 10,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Baked Mustard Fish Fillet",
    description: "Lean high-protein fish fillets prepared with yellow mustard seed paste, lime juice, and dynamic fresh spices.",
    calories: 270,
    prepTime: "30 min",
    servingSize: "220g",
    ingredients: ["Basa Fillet", "Mustard Paste", "Lemon", "Green Chili", "Mustard Oil"],
    dietType: "Non Veg",
    spicyLevel: 3,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "1.5g",
    glycemicIndex: 0,
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Oat-Bran Multigrain Roti Combo",
    description: "Fiber-rich roti paired with light low-sodium green spinach saag and non-fat plain curd.",
    calories: 340,
    prepTime: "22 min",
    servingSize: "400g",
    ingredients: ["Oat Bran", "Whole Wheat", "Spinach", "Spices", "Skimmed Milk Curd"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Low GI", "High Fiber"],
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Keto Broccoli & Mushroom Stir-fry",
    description: "Crisp broccoli florets and white button mushrooms wok-tossed in garlic oil with low-sodium soy dressing.",
    calories: 145,
    prepTime: "12 min",
    servingSize: "250g",
    ingredients: ["Broccoli", "Mushrooms", "Garlic", "Cold-Pressed Sesame Oil", "Soy Sauce"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "5g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Spinach & Herb Egg White Omelette",
    description: "Folded egg whites stuffed with blanched green spinach leaves, fresh coriander, and micro-herbs.",
    calories: 175,
    prepTime: "15 min",
    servingSize: "180g",
    ingredients: ["Egg Whites", "Spinach", "Coriander", "Green Chilies", "Olive Oil"],
    dietType: "Egg",
    spicyLevel: 2,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "2g",
    glycemicIndex: 10,
    imageUrl: "https://images.unsplash.com/photo-1494597564530-871f2b93ac55?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Lemon Herb Grilled Chicken Salad",
    description: "Lean skinless chicken breast grilled with fresh oregano and lime juice, tossed with cucumber and cherry tomatoes.",
    calories: 310,
    prepTime: "25 min",
    servingSize: "300g Bowl",
    ingredients: ["Chicken Breast", "Lime Juice", "Cucumber", "Cherry Tomatoes", "Olive Oil"],
    dietType: "Non Veg",
    spicyLevel: 1,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "4g",
    glycemicIndex: 5,
    imageUrl: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Organic Ragi Malt Porridge Bowl",
    description: "Hot ragi malt simmered with skimmed milk and topped with raw unsalted organic almonds and chia seeds.",
    calories: 220,
    prepTime: "10 min",
    servingSize: "280g Bowl",
    ingredients: ["Ragi Flour", "Skimmed Milk", "Almonds", "Chia Seeds", "Stevia"],
    dietType: "Veg",
    spicyLevel: 0,
    tags: ["Low GI", "High Fiber"],
    netCarbs: "24g",
    glycemicIndex: 40,
    imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Tandoori Baked Tofu Platter",
    description: "Soya milk tofu blocks marinated in low-fat Greek yogurt and traditional Indian spices, baked golden in clay oven.",
    calories: 240,
    prepTime: "20 min",
    servingSize: "220g",
    ingredients: ["Tofu", "Greek Yogurt", "Spices", "Lemon Juice", "Mustard Oil"],
    dietType: "Veg",
    spicyLevel: 2,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "4g",
    glycemicIndex: 15,
    imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Baked Egg White Spinach Cups",
    description: "Six muffin-sized baked egg white cups stuffed with blanched green spinach leaves and fine pink rock salt.",
    calories: 140,
    prepTime: "15 min",
    servingSize: "6 Pieces",
    ingredients: ["Egg Whites", "Spinach", "Pink Salt", "Black Pepper"],
    dietType: "Egg",
    spicyLevel: 1,
    tags: ["Keto"],
    netCarbs: "1.5g",
    glycemicIndex: 10,
    imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Methi Thepla with Low-Fat Curd",
    description: "Three thin multi-grain flatbreads kneaded with fresh fenugreek leaves, paired with fat-free plain yogurt.",
    calories: 260,
    prepTime: "18 min",
    servingSize: "3 Theplas + 100g Curd",
    ingredients: ["Fenugreek Leaves", "Multi-grain Flour", "Spices", "Low-Fat Curd"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Low GI"],
    netCarbs: "28g",
    glycemicIndex: 35,
    imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Grilled Herb Garlic Prawns",
    description: "Plump coastal tiger prawns grilled in cold-pressed extra-virgin olive oil with minced garlic and oregano.",
    calories: 290,
    prepTime: "20 min",
    servingSize: "200g Plate",
    ingredients: ["Tiger Prawns", "Garlic", "Olive Oil", "Oregano", "Black Pepper"],
    dietType: "Non Veg",
    spicyLevel: 1,
    tags: ["Keto", "Gluten Free"],
    netCarbs: "1g",
    glycemicIndex: 0,
    imageUrl: "https://images.unsplash.com/photo-1559737607-2da76a757275?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "High-Fiber Sprouts Chaat Bowl",
    description: "Steamed mixed yellow moong and green gram sprouts tossed with fresh pomegranate kernels, cucumbers, and lime juice.",
    calories: 160,
    prepTime: "10 min",
    servingSize: "300g Bowl",
    ingredients: ["Moong Sprouts", "Bengal Gram", "Pomegranate", "Cucumber", "Lime Juice"],
    dietType: "Veg",
    spicyLevel: 1,
    tags: ["Low GI", "High Fiber"],
    netCarbs: "18g",
    glycemicIndex: 25,
    imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80"
  },
  {
    name: "Barley Vegetable Soup",
    description: "Hot fibrous broth cooked with pearled barley grains, diced carrots, green peas, and low-sodium vegetable stock.",
    calories: 180,
    prepTime: "22 min",
    servingSize: "350ml Bowl",
    ingredients: ["Barley Grains", "Carrots", "Green Peas", "Vegetable Stock", "Pink Salt"],
    dietType: "Veg",
    spicyLevel: 0,
    tags: ["Low GI", "High Fiber"],
    netCarbs: "22g",
    glycemicIndex: 25,
    imageUrl: "https://images.unsplash.com/photo-1547592180-85f173990554?w=150&auto=format&fit=crop&q=80"
  }
];

export default function CartModal({ 
  isOpen, 
  onClose, 
  cartItems = [], 
  onClearCart,
  onAddToCart,
  onRemoveFromCart
}) {
  const distance = 5.0; 
  const [activeFoodItem, setActiveFoodItem] = useState(null);

  // Address Selection Directory State
  const [previousAddresses, setPreviousAddresses] = useState([
    { id: 'addr-1', label: 'Home Address', address: "204, Royal Palms, 12th Main Rd, Indiranagar, Bangalore", icon: "🏠" },
    { id: 'addr-2', label: 'Office Desk', address: "3rd Floor, Block C, Sigma Tech Park, Whitefield, Bangalore", icon: "💼" }
  ]);
  const [selectedAddressId, setSelectedAddressId] = useState('addr-1');
  const [newAddressText, setNewAddressText] = useState('');
  const [newAddressLabel, setNewAddressLabel] = useState('Home');
  const [showAddressForm, setShowAddressForm] = useState(false);

  // Flow State: 'basket' | 'tracking'
  const [checkoutStep, setCheckoutStep] = useState('basket');
  const [activeTrackingIndex, setActiveTrackingIndex] = useState(0);
  const [orderReceipt, setOrderReceipt] = useState(null);

  // Simulated Live Order Progress Timeline
  const trackingStages = [
    { label: "Order Accepted", desc: "Kitchen hub has acknowledged and registered your order.", duration: "25 Mins", icon: "📋" },
    { label: "In The Kitchen", desc: "Our chef is preparing your glycemic-conscious meal.", duration: "18 Mins", icon: "🍳" },
    { label: "Out For Delivery", desc: "Our transit rider is en route to your location.", duration: "8 Mins", icon: "🚴" },
    { label: "Delivered", desc: "Your meal has arrived fresh. Bon appétit!", duration: "0 Mins", icon: "📍" }
  ];

  // Live countdown and index progression trigger
  useEffect(() => {
    let interval;
    if (checkoutStep === 'tracking' && activeTrackingIndex < trackingStages.length - 1) {
      interval = setInterval(() => {
        setActiveTrackingIndex(prev => prev + 1);
      }, 7000);
    }
    return () => clearInterval(interval);
  }, [checkoutStep, activeTrackingIndex, trackingStages.length]);

  if (!isOpen) return null;

  const getActiveAddress = () => {
    return previousAddresses.find(addr => addr.id === selectedAddressId) || previousAddresses[0];
  };

  const getItemDetails = (name) => {
    return menuDatabase.find(item => item.name === name) || {
      name,
      description: "Customized portion.",
      calories: "Calculated",
      netCarbs: "Custom",
      glycemicIndex: "Low",
      prepTime: "Custom",
      servingSize: "Custom",
      ingredients: ["Varies"],
      dietType: "Veg",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150"
    };
  };

  const groupedItems = cartItems.reduce((acc, currentItem) => {
    const existing = acc.find(item => item.name === currentItem.name);
    if (existing) {
      existing.quantity += 1;
      existing.price += currentItem.price;
    } else {
      acc.push({ ...currentItem, quantity: 1, basePrice: currentItem.price });
    }
    return acc;
  }, []);

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const totalItemsCount = cartItems.length;

  const baseDelivery = 40;
  const excessRatePerKm = 10;
  const baseDistanceThreshold = 5;
  const packagingFee = totalItemsCount > 0 ? 15 : 0;

  const excessDistance = Math.max(0, distance - baseDistanceThreshold);
  const deliveryCharge = totalItemsCount > 0 ? (baseDelivery + (excessDistance * excessRatePerKm)) : 0;
  
  const taxableSubtotal = cartSubtotal + deliveryCharge + packagingFee;
  const taxGST = Math.round(taxableSubtotal * 0.05);
  const grandTotal = taxableSubtotal + taxGST;

  const handleClearProductStack = (name) => {
    const productInstances = cartItems.filter(item => item.name === name);
    productInstances.forEach(() => {
      if (onRemoveFromCart) {
        onRemoveFromCart(name);
      }
    });
  };

  const handleAddNewAddress = (e) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;

    const newAddr = {
      id: `addr-${Date.now()}`,
      label: newAddressLabel === 'Home' ? 'Home Address' : newAddressLabel === 'Office' ? 'Office Desk' : 'Other Destination',
      address: newAddressText,
      icon: newAddressLabel === 'Home' ? '🏠' : newAddressLabel === 'Office' ? '💼' : '📍'
    };

    setPreviousAddresses(prev => [...prev, newAddr]);
    setSelectedAddressId(newAddr.id);
    setNewAddressText('');
    setShowAddressForm(false);
  };

  // Triggers Payment confirmation and mounts Tracking screen
  const handleProceedToPayment = () => {
    setOrderReceipt({
      id: `DW-${Math.floor(100000 + Math.random() * 900000)}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      address: getActiveAddress(),
      items: [...groupedItems],
      bill: grandTotal
    });
    setActiveTrackingIndex(0);
    setCheckoutStep('tracking');
  };

  // Closes tracking workspace and resets cart context
  const handleTerminateTracking = () => {
    onClearCart();
    setCheckoutStep('basket');
    setActiveTrackingIndex(0);
    setOrderReceipt(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto flex flex-col min-h-screen w-full animate-fade-in text-slate-800">
      
      {/* HEADER BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={checkoutStep === 'tracking' ? handleTerminateTracking : onClose}
            className="flex items-center gap-2 text-sm font-black text-[#3D3F96] hover:text-indigo-950 transition active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            <span>{checkoutStep === 'tracking' ? 'Return to Home' : 'Back to Menu'}</span>
          </button>
          
          <h1 className="text-sm font-black uppercase tracking-widest text-slate-800 hidden sm:block">
            {checkoutStep === 'tracking' ? 'Live Order Tracker' : 'Secured Checkout Desk'}
          </h1>

          {checkoutStep === 'basket' ? (
            <button
              onClick={() => {
                onClearCart();
                onClose();
              }}
              disabled={totalItemsCount === 0}
              className="text-xs text-rose-500 hover:text-rose-600 font-extrabold disabled:opacity-40"
            >
              Clear All
            </button>
          ) : (
            <div className="text-xs font-black text-[#3D3F96] uppercase bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-lg">
              Order ID: {orderReceipt?.id}
            </div>
          )}
        </div>
      </header>

      {/* CORE DISPLAY ROUTER */}
      {checkoutStep === 'basket' ? (
        
        /* ----------------------------------------------------
           BASKET & BILL CHECKOUT PANEL (STEP 1)
           ---------------------------------------------------- */
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: TRANSIT PREVIEW, ADDRESSES & MENU ITEMS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* MAPPED DELIVERY PROGRESS TRACKER (FROM KITCHEN TO YOU) */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-5">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                Transit Preview
              </h2>
              
              <div className="bg-[#3D3F96]/5 rounded-[24px] p-6 border border-[#3D3F96]/10 flex flex-col md:flex-row items-center justify-between gap-6">
                
                {/* Graphical Segment */}
                <div className="flex items-center gap-4 w-full md:w-auto min-w-0 flex-1">
                  {/* Node A: Origin Kitchen */}
                  <div className="text-center shrink-0">
                    <div className="w-12 h-12 rounded-full bg-[#3D3F96] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#3D3F96]/20">
                      🍳
                    </div>
                    <span className="text-[10px] font-black text-slate-700 block mt-1.5 uppercase tracking-wide">Kitchen</span>
                  </div>

                  {/* Dashed Route Path Connector */}
                  <div className="flex-1 h-1 border-t-2 border-dashed border-[#3D3F96]/30 relative flex items-center justify-center">
                    <span className="absolute -top-3.5 bg-indigo-100 text-[#3D3F96] text-[9px] font-black px-2.5 py-0.5 rounded-full border border-[#3D3F96]/15 animate-bounce whitespace-nowrap">
                      🚴 Delivery Route • 5.0 km
                    </span>
                  </div>

                  {/* Node B: Selected Address Destination */}
                  <div className="text-center shrink-0">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-emerald-500/20">
                      📍
                    </div>
                    <span className="text-[10px] font-black text-slate-700 block mt-1.5 uppercase tracking-wide">Customer</span>
                  </div>
                </div>

                {/* Transit Timing Details */}
                <div className="border-t md:border-t-0 md:border-l border-slate-200 pt-4 md:pt-0 md:pl-6 text-center md:text-left shrink-0 min-w-[150px]">
                  <span className="text-[9px] text-[#3D3F96] bg-indigo-50 font-black uppercase tracking-widest px-2.5 py-1 rounded">Estimated Delivery</span>
                  <div className="text-2xl font-black text-slate-900 mt-1.5 tracking-tight">25 - 30 Mins</div>
                  <span className="text-[10px] text-slate-400 block font-semibold mt-0.5">Freshly prepared & dispatched</span>
                </div>

              </div>
            </div>

            {/* PREVIOUS ADDRESS & ADD ADDRESS DIRECTORY */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-black text-slate-900 uppercase tracking-widest">
                  Delivery Address Directory
                </h2>
                <button 
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="text-xs text-[#3D3F96] font-bold hover:underline"
                >
                  {showAddressForm ? 'Cancel' : '+ Add Address'}
                </button>
              </div>

              {/* Input Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddNewAddress} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl space-y-4 animate-fade-in">
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewAddressLabel('Home')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${newAddressLabel === 'Home' ? 'bg-[#3D3F96] text-white border-transparent' : 'bg-white border-slate-200'}`}
                    >
                      🏠 Home
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewAddressLabel('Office')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${newAddressLabel === 'Office' ? 'bg-[#3D3F96] text-white border-transparent' : 'bg-white border-slate-200'}`}
                    >
                      💼 Office
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewAddressLabel('Other')}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${newAddressLabel === 'Other' ? 'bg-[#3D3F96] text-white border-transparent' : 'bg-white border-slate-200'}`}
                    >
                      📍 Other
                  </button>
                </div>

                <input 
                  type="text"
                  required
                  placeholder="Enter complete address, block number, floor, area..."
                  value={newAddressText}
                  onChange={(e) => setNewAddressText(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:border-[#3D3F96]"
                />

                <button 
                  type="submit"
                  className="bg-[#3D3F96] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
                >
                  Save and Use Address
                </button>
              </form>
            )}

            {/* Directory Selection List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {previousAddresses.map((addr) => {
                const isSelected = selectedAddressId === addr.id;
                return (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-[20px] border text-left cursor-pointer transition-all duration-200 ${
                      isSelected 
                        ? 'border-[#3D3F96] bg-indigo-50/10 ring-2 ring-[#3D3F96]/15' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{addr.icon}</span>
                      <strong className="text-xs font-black text-slate-800">{addr.label}</strong>
                      {isSelected && (
                        <span className="ml-auto w-4 h-4 rounded-full bg-[#3D3F96] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-2.5 line-clamp-2 leading-relaxed">
                      {addr.address}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ITEM LISTING */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2.5 border-b border-slate-100 pb-4 uppercase tracking-widest">
              <span>Itemized Menu Selections</span>
              <span className="text-xs font-bold bg-[#3D3F96]/10 text-[#3D3F96] px-2.5 py-1 rounded-full">
                {totalItemsCount} Total Items
              </span>
            </h2>

            {totalItemsCount === 0 ? (
              <div className="text-center py-24 text-slate-400">
                <svg className="w-12 h-12 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <p className="text-sm font-bold">Your checkout basket is empty.</p>
                <button 
                  onClick={onClose}
                  className="mt-4 px-6 py-2.5 bg-[#3D3F96] text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Browse Menu Directory
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {groupedItems.map((item, idx) => {
                  const details = getItemDetails(item.name);
                  return (
                    <div 
                      key={idx} 
                      className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-4 last:pb-0"
                    >
                      {/* Product Thumbnail & Details */}
                      <div 
                        onClick={() => setActiveFoodItem(details)}
                        className="flex items-center gap-4 cursor-pointer group min-w-0 flex-1"
                      >
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shrink-0">
                          <img src={details.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-slate-900 text-sm leading-tight truncate group-hover:text-[#3D3F96] transition-colors">
                            {item.name}
                          </h3>
                          <span className="text-slate-400 text-[11px] font-bold block mt-1">
                            Portion: {details.servingSize} • GI: {details.glycemicIndex}
                          </span>
                        </div>
                      </div>

                      {/* Quantity Modifier & Subtotal controls */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                        
                        {/* Interactive +/- Controller */}
                        <div className="flex items-center gap-2 bg-slate-50 text-[#3D3F96] rounded-xl p-1 border border-slate-150 font-black shadow-inner">
                          <button 
                            onClick={() => onRemoveFromCart(item.name)}
                            className="w-8 h-8 rounded-lg hover:bg-white text-indigo-950 flex items-center justify-center transition text-base font-black active:scale-90"
                            title="Decrease Quantity"
                          >
                            -
                          </button>
                          <span className="px-1 text-xs font-black min-w-[18px] text-center text-slate-800">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => onAddToCart(item.basePrice, item.name)}
                            className="w-8 h-8 rounded-lg hover:bg-white text-indigo-950 flex items-center justify-center transition text-base font-black active:scale-90"
                            title="Increase Quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Explicit Trash Can Option */}
                        <button
                          onClick={() => handleClearProductStack(item.name)}
                          className="w-10 h-10 rounded-xl bg-rose-50 hover:bg-rose-100/80 border border-rose-100 text-rose-600 flex items-center justify-center transition active:scale-95"
                          title="Remove completely"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        <span className="font-black text-slate-900 text-sm min-w-[70px] text-right">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: BILL SUMMARY & CHECKOUT */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 sticky top-24">
            
            {/* Active Delivery Destination Snapshot */}
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-3">
                Dispatched Destination
              </h2>
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-lg shrink-0 mt-0.5">{getActiveAddress().icon}</span>
                <div className="min-w-0">
                  <strong className="text-xs font-black text-slate-800 block">
                    {getActiveAddress().label}
                  </strong>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-semibold mt-1">
                    {getActiveAddress().address}
                  </p>
                </div>
              </div>
            </div>

            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Bill Breakdown
            </h2>

            <div className="space-y-3.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="text-slate-800">₹{cartSubtotal}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Logistics Delivery Fee ({distance.toFixed(1)} km):</span>
                <span className="text-slate-800">₹{deliveryCharge}</span>
              </div>

              <div className="flex justify-between">
                <span>Packaging Fee:</span>
                <span className="text-slate-800">₹{packagingFee}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxes & GST (5%):</span>
                <span className="text-slate-800">₹{taxGST}</span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-end">
                <div>
                  <span className="block text-[10px] text-slate-400 font-bold uppercase leading-none">Total Bill Payable</span>
                  <span className="text-[9px] text-slate-400 mt-1 block font-medium">Includes taxes & fulfillment costs</span>
                </div>
                <span className="text-2xl font-black text-slate-900">₹{grandTotal}</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleProceedToPayment}
                disabled={totalItemsCount === 0}
                className={`w-full text-white font-extrabold py-4 rounded-2xl text-center text-sm transition shadow-lg ${
                  totalItemsCount === 0 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-[#3D3F96] hover:bg-indigo-850 active:scale-95 shadow-[#3D3F96]/15'
                }`}
              >
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>

      </main>
      ) : (
        
        /* ----------------------------------------------------
           LIVE ORDER TRACKING & TRANSIT SCREEN (STEP 2)
           ---------------------------------------------------- */
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: VISUAL MAP PATHWAY AND STEPPER */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* LIVE DYNAMIC DELIVERY MAP CAROUSEL TRACKER */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                    Live Dispatch Connection
                  </span>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight mt-1.5 uppercase tracking-wide">
                    Live Route Progress Map
                  </h2>
                </div>
                
                {activeTrackingIndex === trackingStages.length - 1 ? (
                  <span className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl font-black">
                    Arrived Warm & Fresh
                  </span>
                ) : (
                  <span className="text-xs text-[#3D3F96] bg-indigo-50 border border-indigo-150 px-3 py-1.5 rounded-xl font-black animate-pulse">
                    ETA: {trackingStages[activeTrackingIndex].duration}
                  </span>
                )}
              </div>

              {/* Graphical Segment */}
              <div className="bg-slate-50/50 rounded-[28px] p-8 border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] pointer-events-none"></div>

                <div className="flex items-center gap-4 w-full md:w-auto min-w-0 flex-1 relative z-10">
                  {/* Node A: Origin Kitchen */}
                  <div className="text-center shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 ${
                      activeTrackingIndex === 1 ? 'bg-[#3D3F96] text-white scale-110 shadow-lg shadow-[#3D3F96]/20' : 'bg-slate-200 text-slate-500'
                    }`}>
                      🍳
                    </div>
                    <span className="text-[10px] font-black text-slate-700 block mt-2 uppercase tracking-wide">Kitchen</span>
                  </div>

                  {/* Dashed Progress Route Track */}
                  <div className="flex-1 h-1.5 bg-slate-200 rounded-full relative flex items-center justify-start overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 transition-all duration-700"
                      style={{ width: `${(activeTrackingIndex / (trackingStages.length - 1)) * 100}%` }}
                    />
                    
                    {/* Floating Moving Rider icon */}
                    <span 
                      className="absolute -top-4 bg-white text-base p-1.5 rounded-full shadow-md border border-slate-150 transition-all duration-700 transform -translate-x-1/2"
                      style={{ left: `${(activeTrackingIndex / (trackingStages.length - 1)) * 100}%` }}
                    >
                      {activeTrackingIndex === trackingStages.length - 1 ? '🏡' : '🚴'}
                    </span>
                  </div>

                  {/* Node B: Destination Address */}
                  <div className="text-center shrink-0">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl transition-all duration-300 ${
                      activeTrackingIndex === trackingStages.length - 1 
                        ? 'bg-emerald-500 text-white scale-110 shadow-lg shadow-emerald-500/20' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      📍
                    </div>
                    <span className="text-[10px] font-black text-slate-700 block mt-2 uppercase tracking-wide">You</span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE STEPPER STATUS TIMELINE CHECKLIST */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 border-b border-slate-100 pb-3">
                Preparation & Transit Timeline
              </h2>

              <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                {trackingStages.map((stage, idx) => {
                  const isPast = activeTrackingIndex > idx;
                  const isCurrent = activeTrackingIndex === idx;

                  return (
                    <div key={idx} className="flex gap-4 items-start relative z-10">
                      
                      {/* Step Indicator Dot */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs transition-all ${
                        isPast ? 'bg-[#3D3F96] text-white shadow-sm' :
                        isCurrent ? 'bg-indigo-50 border-2 border-[#3D3F96] text-[#3D3F96] shadow shadow-[#3D3F96]/10 font-bold scale-105' :
                        'bg-white border-2 border-slate-200 text-slate-400'
                      }`}>
                        {isPast ? '✓' : stage.icon}
                      </div>

                      {/* Stage metadata */}
                      <div className="flex-1 min-w-0 pt-1">
                        <div className="flex items-center justify-between gap-4">
                          <h4 className={`text-sm font-black leading-none ${isCurrent ? 'text-[#3D3F96]' : isPast ? 'text-slate-800' : 'text-slate-400'}`}>
                            {stage.label}
                          </h4>
                          {!isPast && (
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide shrink-0">
                              {stage.duration}
                            </span>
                          )}
                        </div>
                        <p className={`text-xs mt-1.5 leading-relaxed font-semibold ${isCurrent ? 'text-slate-700' : 'text-slate-400'}`}>
                          {stage.desc}
                        </p>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: TAX INVOICE RECEIPT SUMMARY */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-slate-100 p-6 md:p-8 shadow-sm space-y-6 sticky top-24">
              
              {/* Receipt Header */}
              <div className="border-b border-slate-100 pb-5">
                <span className="text-[9px] bg-slate-50 border border-slate-150 text-slate-500 font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                  Fulfillment Invoice Receipt
                </span>
                <h3 className="text-base font-black text-slate-900 mt-2.5">
                  Items Placed
                </h3>
              </div>

              {/* Order Items Stack */}
              <div className="max-h-64 overflow-y-auto space-y-3.5 pr-1 border-b border-slate-100 pb-5">
                {orderReceipt?.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <div className="min-w-0 flex-1 pr-4">
                      <span className="text-slate-900 font-extrabold block truncate">
                        {item.name}
                      </span>
                      <span className="text-slate-400 font-semibold block mt-0.5">
                        Qty: {item.quantity} x ₹{item.basePrice}
                      </span>
                    </div>
                    <span className="text-slate-900 font-black shrink-0">
                      ₹{item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* Delivery Destination Address Snapshot */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Dispatched Address
                </span>
                <div className="flex items-start gap-2.5 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs font-semibold">
                  <span className="text-base shrink-0 mt-0.5">{orderReceipt?.address.icon}</span>
                  <div className="min-w-0">
                    <strong className="text-slate-800 font-black block">{orderReceipt?.address.label}</strong>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1 font-semibold">
                      {orderReceipt?.address.address}
                    </p>
                  </div>
                </div>
              </div>

              {/* Billing totals */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                  <span>Grand Total Paid:</span>
                  <span className="text-lg font-black text-[#3D3F96]">₹{orderReceipt?.bill}</span>
                </div>
              </div>

              {/* Dismiss CTA */}
              <div className="pt-2">
                <button
                  onClick={handleTerminateTracking}
                  className="w-full bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold py-3.5 rounded-2xl text-center text-xs transition shadow-lg shadow-[#3D3F96]/15 active:scale-95"
                >
                  Confirm & Clear Basket
                </button>
              </div>

            </div>
          </div>

        </main>
      )}

      {/* NESTED DETAILS POPUP OVERLAY */}
      {activeFoodItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative border border-gray-150">
            
            <button 
              onClick={() => setActiveFoodItem(null)} 
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-full transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Photo Header */}
            <div className="relative h-40 w-full rounded-2xl overflow-hidden mb-5 bg-gray-50 border border-gray-100">
              <img src={activeFoodItem.imageUrl} alt={activeFoodItem.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
              <span className="absolute bottom-3 left-3 bg-[#3D3F96] text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
                Prep: {activeFoodItem.prepTime || '15 min'}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-4">
              <div>
                <h4 className="font-extrabold text-gray-900 text-base leading-snug">{activeFoodItem.name}</h4>
                <span className="text-[10px] text-gray-400 font-medium block mt-1">Portion: {activeFoodItem.servingSize}</span>
                <p className="text-xs text-gray-500 leading-relaxed mt-2">{activeFoodItem.description}</p>
              </div>

              {/* Ingredients */}
              {activeFoodItem.ingredients && (
                <div className="space-y-1.5 pt-3.5 border-t border-gray-100">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Ingredients Used</span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFoodItem.ingredients.map((ing, i) => (
                      <span key={i} className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-gray-500">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Macro panel */}
              <div className="grid grid-cols-3 gap-1 bg-gray-50 border border-gray-150 p-2.5 rounded-xl text-center text-[11px] font-bold">
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Energy</span>
                  <span className="text-gray-800">{activeFoodItem.calories} Kcal</span>
                </div>
                <div className="border-l border-r border-gray-200">
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">Net Carbs</span>
                  <span className="text-gray-800">{activeFoodItem.netCarbs}</span>
                </div>
                <div>
                  <span className="block text-[8px] text-gray-400 font-bold uppercase">GI Impact</span>
                  <span className="text-[#00B574] font-black">GI: {activeFoodItem.glycemicIndex}</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <div className="border-t border-gray-100 pt-4 mt-5 flex justify-end">
              <button 
                onClick={() => {
                  if (onAddToCart) onAddToCart(activeFoodItem.price || 180, activeFoodItem.name); // Using callback parameter
                  setActiveFoodItem(null);
                }}
                className="bg-[#3D3F96] hover:bg-indigo-850 text-white font-extrabold px-6 py-2.5 rounded-xl shadow-md text-xs transition"
              >
                Add to Basket
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}