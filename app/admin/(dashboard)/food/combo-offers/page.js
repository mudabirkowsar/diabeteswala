"use client";

import React, { useState } from 'react';

// Master Dish Library for bundling with rich imagery
const MASTER_DISHES = [
  { name: "Diabetic Oats Porridge Set", price: 180, imageUrl: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=150&auto=format&fit=crop&q=80" },
  { name: "Low GI Quinoa Biryani", price: 290, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=150&auto=format&fit=crop&q=80" },
  { name: "Keto Garden Veg Salad Bowl", price: 220, imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=150&auto=format&fit=crop&q=80" },
  { name: "Sugar-Free Chia Seed Pudding", price: 120, imageUrl: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=150&auto=format&fit=crop&q=80" },
  { name: "Low-Carb Cauliflower Fried Rice", price: 210, imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=150&auto=format&fit=crop&q=80" },
  { name: "Gluten-Free Amaranth Roti Thali", price: 260, imageUrl: "https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=150&auto=format&fit=crop&q=80" }
];

const INITIAL_COMBOS = [
  {
    id: "CMB-801",
    name: "Diabetic Couple Combo 👩‍❤️‍👨",
    description: "A perfectly portioned date-night bundle containing our best-selling salad bowl and low-carb mains.",
    dishes: [
      { name: "Keto Garden Veg Salad Bowl", qty: 1, price: 220 },
      { name: "Low-Carb Cauliflower Fried Rice", qty: 1, price: 210 }
    ],
    basePrice: 430,
    comboPrice: 360,
    spicyLevel: "Medium",
    isPopular: true,
    isRecommended: true,
    isAvailable: true,
    bannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80"
  },
  {
    id: "CMB-802",
    name: "Healthy Family Feast 🏡",
    description: "Complete healthy dinner bundle for a family of four featuring high-protein mains and sugar-free desserts.",
    dishes: [
      { name: "Low GI Quinoa Biryani", qty: 2, price: 290 },
      { name: "Sugar-Free Chia Seed Pudding", qty: 2, price: 120 }
    ],
    basePrice: 820,
    comboPrice: 690,
    spicyLevel: "Medium",
    isPopular: false,
    isRecommended: true,
    isAvailable: true,
    bannerUrl: "https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=600&auto=format&fit=crop&q=80"
  }
];

export default function ComboOffersPage() {
  const [combos, setCombos] = useState(INITIAL_COMBOS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [editingId, setEditingId] = useState(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formComboPrice, setFormComboPrice] = useState('');
  const [formSpicy, setFormSpicy] = useState('Medium');
  const [formPopular, setFormPopular] = useState(false);
  const [formRecommended, setFormRecommended] = useState(false);
  const [selectedDishes, setSelectedDishes] = useState([]); 

  // Modal-specific search query to filter selectable master dishes list
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  // Toggle Combo availability
  const toggleComboAvailability = (id) => {
    setCombos(prev => prev.map(c => 
      c.id === id ? { ...c, isAvailable: !c.isAvailable } : c
    ));
  };

  // Handle dish select/deselect in visual card grid inside modal
  const handleDishToggle = (dish) => {
    const exists = selectedDishes.find(d => d.name === dish.name);
    if (exists) {
      setSelectedDishes(prev => prev.filter(d => d.name !== dish.name));
    } else {
      setSelectedDishes([...selectedDishes, { name: dish.name, price: dish.price, qty: 1 }]);
    }
  };

  // Modify quantity of a selected dish in the bundle
  const handleQtyChange = (dishName, newQty) => {
    if (newQty < 1) return;
    setSelectedDishes(prev => prev.map(d => 
      d.name === dishName ? { ...d, qty: newQty } : d
    ));
  };

  // Calculate base price dynamically based on selection
  const calculatedBasePrice = selectedDishes.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  // Calculate live margin discount percentage inside the form
  const getLiveDiscountPct = () => {
    const parsedPrice = parseFloat(formComboPrice);
    if (!calculatedBasePrice || !parsedPrice || parsedPrice >= calculatedBasePrice) return 0;
    return Math.round(((calculatedBasePrice - parsedPrice) / calculatedBasePrice) * 100);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setModalMode('create');
    resetForm();
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (combo) => {
    setModalMode('edit');
    setEditingId(combo.id);

    setFormName(combo.name);
    setFormDesc(combo.description);
    setFormComboPrice(combo.comboPrice.toString());
    setFormSpicy(combo.spicyLevel);
    setFormPopular(combo.isPopular);
    setFormRecommended(combo.isRecommended);
    setSelectedDishes(combo.dishes);

    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (selectedDishes.length < 2) {
      alert("A combo bundle must contain at least 2 dishes.");
      return;
    }

    if (modalMode === 'create') {
      const newCombo = {
        id: `CMB-${Date.now()}`,
        name: formName,
        description: formDesc,
        dishes: selectedDishes,
        basePrice: calculatedBasePrice,
        comboPrice: parseFloat(formComboPrice) || calculatedBasePrice * 0.9,
        spicyLevel: formSpicy,
        isPopular: formPopular,
        isRecommended: formRecommended,
        isAvailable: true,
        bannerUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80" // default fallback
      };
      setCombos([newCombo, ...combos]);
    } else {
      setCombos(prev => prev.map(c => 
        c.id === editingId 
          ? {
              ...c,
              name: formName,
              description: formDesc,
              dishes: selectedDishes,
              basePrice: calculatedBasePrice,
              comboPrice: parseFloat(formComboPrice) || calculatedBasePrice * 0.9,
              spicyLevel: formSpicy,
              isPopular: formPopular,
              isRecommended: formRecommended
            }
          : c
      ));
    }

    resetForm();
    setIsModalOpen(false);
  };

  const deleteCombo = (id) => {
    setCombos(prev => prev.filter(c => c.id !== id));
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormComboPrice('');
    setFormSpicy('Medium');
    setFormPopular(false);
    setFormRecommended(false);
    setSelectedDishes([]);
    setModalSearchQuery('');
    setEditingId(null);
  };

  // Filter master dishes based on search query inside the modal
  const filteredMasterDishes = MASTER_DISHES.filter(dish => 
    dish.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto animate-fade-in py-4 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Combo Bundles</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">Create high-value package offers by grouping multiple dishes at discount pricing.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2 self-start sm:self-auto"
        >
          <span>+</span>
          Create New Combo
        </button>
      </div>

      {/* Premium Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {combos.map((combo) => {
          const discountPct = Math.round(((combo.basePrice - combo.comboPrice) / combo.basePrice) * 100);
          return (
            <div 
              key={combo.id}
              className={`bg-white rounded-3xl border border-slate-200/80 flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${
                !combo.isAvailable ? 'opacity-65' : ''
              }`}
            >
              <div>
                {/* Visual Header Photo Container with overlays */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-50 border-b border-slate-100">
                  <img src={combo.bannerUrl} alt={combo.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Savings Overlay */}
                  <span className="absolute bottom-3 left-4 bg-[#00B574] text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm animate-pulse">
                    Save {discountPct}% Off
                  </span>
                  
                  {/* ID Tag */}
                  <span className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    ID: {combo.id}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{combo.name}</h3>
                    <p className="text-xs text-slate-400 font-semibold mt-0.5 uppercase tracking-wide">Ready for dispatch</p>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {combo.description}
                  </p>

                  {/* Connected Dot-Track for Bundle Items */}
                  <div className="space-y-3 py-2 border-t border-slate-100/60 mt-2">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Items included:</span>
                    <div className="relative pl-6 space-y-3.5">
                      <div className="absolute left-2 top-2 bottom-2 w-[1.5px] bg-slate-200" />
                      
                      {combo.dishes.map((dish) => (
                        <div key={dish.name} className="relative flex items-center justify-between text-xs font-semibold text-slate-700">
                          <span className="absolute -left-5 w-2 h-2 rounded-full bg-[#3D3F96] border border-white" />
                          <span>{dish.name} <strong className="text-slate-500">x{dish.qty}</strong></span>
                          <span className="text-slate-400">₹{dish.price * dish.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Details */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-50 text-xs font-bold items-center bg-slate-50/50 p-3 rounded-2xl">
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px]">Normal Price</span>
                      <span className="text-slate-400 text-sm line-through font-mono">₹{combo.basePrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block uppercase text-[10px]">Combo Price</span>
                      <span className="text-[#3D3F96] text-lg font-black font-mono">₹{combo.comboPrice}</span>
                    </div>
                  </div>

                  {/* Spicy level and promotions */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-extrabold">
                      Spicy: {combo.spicyLevel}
                    </span>
                    {combo.isPopular && (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-lg text-[10px] font-bold uppercase">
                        Popular
                      </span>
                    )}
                    {combo.isRecommended && (
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[10px] font-bold uppercase">
                        Recommended
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer row */}
              <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(combo)}
                    className="p-2 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-xl transition-all"
                    title="Edit Bundle Details"
                  >
                    <EditIcon className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    onClick={() => deleteCombo(combo.id)}
                    className="p-2 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                    title="Delete Offer"
                  >
                    <TrashIcon className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>

                {/* Availability Switch */}
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Available</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={combo.isAvailable} 
                      onChange={() => toggleComboAvailability(combo.id)}
                      className="sr-only peer" 
                    />
                    <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]" />
                  </label>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* CREATE & EDIT COMBO OFFER MODAL - REDESIGNED FOR HIGH USER-FRIENDLINESS */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10">
                  <SparklesIcon className="w-5 h-5 stroke-[2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg uppercase tracking-tight">
                    {modalMode === 'create' ? 'Assemble Combo Offer' : 'Update Combo Parameters'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Bundle your best recipes together for discounted sales</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
              >
                <CloseIcon className="w-5 h-5 stroke-[2]" />
              </button>
            </div>

            {/* Split Dual-Column Layout Workspace */}
            <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-y-auto">
              
              {/* LEFT COLUMN: Core Combo Specifications */}
              <div className="space-y-5">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">1. Bundle Information</span>
                
                {/* Combo Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Combo Package Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Diabetic Couple Combo"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 shadow-sm"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Bundle Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Detail the campaign focus of this package bundle..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 resize-none leading-relaxed shadow-sm"
                  />
                </div>

                {/* Pricing Fields & Dynamic Savings Percentage Output */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Sum Base Price (Calculated)</label>
                    <input
                      type="text"
                      readOnly
                      value={`₹${calculatedBasePrice}`}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-transparent rounded-xl text-xs sm:text-sm font-extrabold text-slate-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-baseline mb-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase">Combo Discount Price (₹)</label>
                      {getLiveDiscountPct() > 0 && (
                        <span className="text-[10px] text-emerald-600 font-extrabold animate-pulse">({getLiveDiscountPct()}% Off)</span>
                      )}
                    </div>
                    <input
                      type="number"
                      required
                      value={formComboPrice}
                      onChange={(e) => setFormComboPrice(e.target.value)}
                      placeholder="e.g. 360"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 shadow-sm"
                    />
                  </div>
                </div>

                {/* Spiciness & Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Spicy Level</label>
                    <select
                      value={formSpicy}
                      onChange={(e) => setFormSpicy(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer shadow-sm"
                    >
                      <option value="Low">Low (Mild)</option>
                      <option value="Medium">Medium (Regular)</option>
                      <option value="High">High (Hot)</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-2">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formPopular} 
                          onChange={() => setFormPopular(!formPopular)}
                          className="rounded border-slate-200 text-[#3D3F96] focus:ring-[#3D3F96]" 
                        />
                        <span>Popular Bundle</span>
                      </label>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formRecommended} 
                          onChange={() => setFormRecommended(!formRecommended)}
                          className="rounded border-slate-200 text-[#3D3F96] focus:ring-[#3D3F96]" 
                        />
                        <span>Recommended</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons (Left Column Bottom) */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
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
                    {modalMode === 'create' ? 'Create Combo' : 'Save Changes'}
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Dish Selector & Quantities Setup */}
              <div className="space-y-6">
                <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">2. Bundle Ingredients Panel</span>
                
                {/* Dynamic Search bar inside Modal */}
                <div className="relative w-full">
                  <input
                    type="text"
                    placeholder="Search menu items..."
                    value={modalSearchQuery}
                    onChange={(e) => setModalSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#3D3F96] text-slate-700 transition-all shadow-inner"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
                  </svg>
                </div>

                {/* Food List card grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-1">
                  {filteredMasterDishes.map((dish) => {
                    const isChecked = selectedDishes.some(d => d.name === dish.name);
                    return (
                      <div
                        key={dish.name}
                        onClick={() => handleDishToggle(dish)}
                        className={`rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 relative flex flex-col justify-between bg-white ${
                          isChecked 
                            ? 'border-[#3D3F96] ring-2 ring-indigo-50 shadow-sm scale-101 font-bold' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {/* Dish Photo frame */}
                        <div className="relative h-16 w-full">
                          <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          <span className="absolute bottom-1.5 left-3 text-white text-[10px] font-black">₹{dish.price}</span>
                          
                          {/* Checked indicator */}
                          {isChecked && (
                            <span className="absolute top-2 right-2 bg-[#3D3F96] text-white p-0.5 rounded-full shadow-md z-20">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
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

                {/* Dynamic Quantity Controllers */}
                {selectedDishes.length > 0 && (
                  <div className="space-y-2.5 pt-4 border-t border-slate-100">
                    <span className="block text-[10px] text-gray-400 font-bold uppercase tracking-wider">Configure Quantities</span>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                      {selectedDishes.map((dish) => (
                        <div key={dish.name} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl text-xs font-bold shadow-sm">
                          <span className="text-slate-800 truncate max-w-[180px]">{dish.name}</span>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleQtyChange(dish.name, dish.qty - 1)}
                              className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              -
                            </button>
                            <span className="text-slate-800 font-black">{dish.qty}</span>
                            <button
                              type="button"
                              onClick={() => handleQtyChange(dish.name, dish.qty + 1)}
                              className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-slate-600 hover:bg-slate-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Icons

function SparklesIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l-.813-5.096a.4.4 0 00-.332-.331L2.76 14.76a.4.4 0 000 .753l5.096.813a.4.4 0 01.331.332L9 21.76a.4.4 0 00.753 0l.813-5.096a.4.4 0 01.332-.331l5.096-.813a.4.4 0 000-.753l-5.096-.813a.4.4 0 01-.331-.332L9.813 15.904z" />
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