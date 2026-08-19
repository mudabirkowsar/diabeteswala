"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Search, Pencil, Trash2, Inbox } from 'lucide-react';
import AddFoodItem from './components/AddFoodItem';

const INITIAL_DISEASES = [
  { id: 'diabetes', name: 'Diabetes Care', icon: '🩸' },
  { id: 'hypertension', name: 'Hypertension', icon: '🫀' },
  { id: 'celiac', name: 'Celiac', icon: '🌾' },
  { id: 'kidney', name: 'Kidney Care', icon: '🧼' },
  { id: 'pcos', name: 'PCOS / Insulin', icon: '🥑' },
  { id: 'thyroid', name: 'Thyroid Balance', icon: '🦋' }
];

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Oats & Porridge' },
  { id: 'cat-2', name: 'Soups & Salads' },
  { id: 'cat-3', name: 'Low GI Rice Bowls' },
  { id: 'cat-4', name: 'High-Protein Snacks' }
];

const INITIAL_FOODS = [
  {
    id: "FD-101",
    name: "Keto Garden Veg Salad Bowl",
    description: "Crisp organic greens, broccoli, avocados, olives, and pumpkin seeds tossed in a light flaxseed olive oil dressing.",
    category: "Soups & Salads",
    price: 220,
    discountPrice: 180,
    type: "Veg", 
    prepTime: 15, 
    calories: 245,
    ingredients: "Broccoli, Avocado, Spinach, Pumpkin Seeds, Olive Oil",
    tags: "Low GI, Keto, High Fiber",
    isAvailable: true,
    isPopular: true,
    isRecommended: true,
    spicyLevel: "Low",
    servingSize: "1 Person",
    disease: "pcos" 
  },
  {
    id: "FD-102",
    name: "Gluten-Free Quinoa Biryani Set",
    description: "Layered high-protein organic quinoa prepared with garden vegetables, mild spices, and served with sugar-free cucumber raita.",
    category: "Low GI Rice Bowls",
    price: 290,
    discountPrice: 250,
    type: "Egg",
    prepTime: 20,
    calories: 310,
    ingredients: "Quinoa, Green Peas, Beans, Egg White, Spices",
    tags: "Gluten Free, High Protein",
    isAvailable: true,
    isPopular: false,
    isRecommended: true,
    spicyLevel: "Medium",
    servingSize: "1 Person",
    disease: "celiac" 
  }
];

export default function ManageFoodPage() {
  const [categories] = useState(INITIAL_CATEGORIES);
  const [diseases] = useState(INITIAL_DISEASES); 
  const [foods, setFoods] = useState(INITIAL_FOODS);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('All'); 

  // Global Diet Group Toggles
  const [isVegLive, setIsVegLive] = useState(true);
  const [isEggLive, setIsEggLive] = useState(true);
  const [isNonVegLive, setIsNonVegLive] = useState(true);
  
  // Modal configurations
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [selectedFoodForEdit, setSelectedFoodForEdit] = useState(null);

  const router = useRouter();

  // Toggle Food availability online state directly on table
  const toggleFoodAvailability = (id) => {
    setFoods(prev => prev.map(f => 
      f.id === id ? { ...f, isAvailable: !f.isAvailable } : f
    ));
  };

  // Open modal for creation
  const openCreateModal = () => {
    setModalMode('create');
    setSelectedFoodForEdit(null);
    setIsFoodModalOpen(true);
  };

  // Open modal for editing
  const openEditModal = (food) => {
    setModalMode('edit');
    setSelectedFoodForEdit(food);
    setIsFoodModalOpen(true);
  };

  // Handle addition or updates from sub-component submission
  const handleSaveFoodItem = (foodData) => {
    if (modalMode === 'create') {
      const newFood = {
        ...foodData,
        id: `FD-${Date.now()}`
      };
      setFoods([newFood, ...foods]);
    } else {
      setFoods(prev => prev.map(f => 
        f.id === selectedFoodForEdit.id 
          ? { ...f, ...foodData }
          : f
      ));
    }
    setIsFoodModalOpen(false);
  };

  const deleteFoodItem = (id) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  // Search filter matching
  const filteredFoods = foods.filter(food => {
    const matchesSearch = 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      food.ingredients.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDisease = selectedDiseaseFilter === 'All' || food.disease === selectedDiseaseFilter;

    return matchesSearch && matchesDisease;
  });

  const uncategorizedFoods = filteredFoods.filter(f => !categories.some(c => c.name === f.category));

  // Type symbol visual indicators
  const renderTypeSymbol = (type) => {
    const colors = {
      Veg: 'border-emerald-500 text-emerald-500',
      'Non Veg': 'border-rose-500 text-rose-500',
      Egg: 'border-amber-500 text-amber-500'
    };
    const fillColors = {
      Veg: 'bg-emerald-500',
      'Non Veg': 'bg-rose-500',
      Egg: 'bg-amber-500'
    };

    return (
      <div className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] flex-shrink-0 ${colors[type] || 'border-slate-300'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${fillColors[type] || 'bg-slate-300'}`} />
      </div>
    );
  };

  const isTypeEnabled = (type) => {
    if (type === "Veg") return isVegLive;
    if (type === "Egg") return isEggLive;
    if (type === "Non Veg") return isNonVegLive;
    return true;
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-fade-in py-4 pb-12">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10 flex-shrink-0">
            <BookOpen className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Menu Items</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Configure kitchen configurations, list new food items, and track nutrition profiles.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-sm rounded-xl shadow-lg shadow-[#3D3F96]/10 flex items-center gap-2"
          >
            <span>+</span>
            ADD NEW FOOD ITEM
          </button>
        </div>
      </div>

      {/* Quick Filters Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by food name, category, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/15 text-slate-700 transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" strokeWidth={2.2} />
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Therapy Focus:</span>
          <select
            value={selectedDiseaseFilter}
            onChange={(e) => setSelectedDiseaseFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D3F96] cursor-pointer"
          >
            <option value="All">🌐 All Profiles / General</option>
            {diseases.map(d => (
              <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
            ))}
          </select>
        </div>

        {/* Dietary Switches */}
        <div className="flex flex-wrap gap-4 bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 px-2">
            {renderTypeSymbol('Veg')}
            <span className="text-xs font-bold text-slate-700">Vegetarian</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isVegLive} 
                onChange={() => setIsVegLive(!isVegLive)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500" />
            </label>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3 px-2">
            {renderTypeSymbol('Egg')}
            <span className="text-xs font-bold text-slate-700">Eggitarian</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isEggLive} 
                onChange={() => setIsEggLive(!isEggLive)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
            </label>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3 px-2">
            {renderTypeSymbol('Non Veg')}
            <span className="text-xs font-bold text-slate-700">Non-Veg</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={isNonVegLive} 
                onChange={() => setIsNonVegLive(!isNonVegLive)}
                className="sr-only peer" 
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
            </label>
          </div>
        </div>

      </div>

      {/* Main Table Display */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredFoods.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                  <th className="py-5 px-6">Food Details</th>
                  <th className="py-5 px-6">Description</th>
                  <th className="py-5 px-6">Pricing</th>
                  <th className="py-5 px-6">Nutrition & Size</th>
                  <th className="py-5 px-6">Availability</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((cat) => {
                  const categoryFoods = filteredFoods.filter(f => f.category === cat.name);
                  if (categoryFoods.length === 0) return null; 
                  return (
                    <React.Fragment key={cat.id}>
                      <tr className="bg-slate-50/80 border-y border-slate-100/60 pointer-events-none">
                        <td colSpan={8} className="py-5 px-6 text-lg font-black text-[#3D3F96] tracking-tight border-l-4 border-l-[#3D3F96]">
                          <div className="flex items-center justify-between">
                            <span>{cat.name}</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-widest font-sans">
                              {categoryFoods.length} Items
                            </span>
                          </div>
                        </td>
                      </tr>

                      {categoryFoods.map((food) => {
                        const enabled = isTypeEnabled(food.type);
                        const effectiveAvailability = food.isAvailable && enabled;

                        return (
                          <tr 
                            key={food.id} 
                            onClick={() => openEditModal(food)}
                            className={`hover:bg-[#3D3F96]/5 cursor-pointer transition-all duration-150 group ${
                              !effectiveAvailability ? 'opacity-60 bg-slate-50/40' : ''
                            }`}
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                {renderTypeSymbol(food.type)}
                                <div>
                                  <p className="font-bold text-slate-800 text-[13px] leading-snug group-hover:underline">{food.name}</p>
                                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                                    {food.category}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-[200px]">
                                {food.description}
                              </p>
                            </td>
                            <td className="py-5 px-6 font-semibold">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-slate-900 font-bold font-mono text-[13px]">₹{food.discountPrice}</span>
                                {food.price !== food.discountPrice && (
                                  <span className="text-[11px] text-slate-400 line-through font-mono">₹{food.price}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 px-6 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-[#3D3F96]/5 text-[#3D3F96] rounded font-extrabold text-[10px]">{food.calories} Kcal</span>
                                <span className="text-[10px] text-slate-500 font-bold">Size: {food.servingSize}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[155px]"><strong className="text-slate-500">Ingredients:</strong> {food.ingredients}</p>
                            </td>
                            <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                              <div className="pt-0.5 flex items-center gap-2">
                                <label className={`relative inline-flex items-center ${enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                  <input 
                                    type="checkbox" 
                                    disabled={!enabled}
                                    checked={effectiveAvailability} 
                                    onChange={() => toggleFoodAvailability(food.id)}
                                    className="sr-only peer" 
                                  />
                                  <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]" />
                                </label>
                                {!enabled && (
                                  <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider whitespace-nowrap">Type Paused</span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => openEditModal(food)}
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-lg transition-all"
                                >
                                  <Pencil className="w-4 h-4" strokeWidth={2} />
                                </button>
                                <button 
                                  onClick={() => deleteFoodItem(food.id)}
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <Trash2 className="w-4 h-4" strokeWidth={2} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* Uncategorized Section */}
                {uncategorizedFoods.length > 0 && (
                  <React.Fragment>
                    <tr className="bg-slate-100/60 border-y border-slate-100 pointer-events-none">
                      <td colSpan={8} className="py-4 px-6 text-sm font-extrabold text-slate-500 tracking-wider uppercase border-l-4 border-l-slate-400">
                        Uncategorized ({uncategorizedFoods.length} Items)
                      </td>
                    </tr>
                    {uncategorizedFoods.map((food) => {
                      const enabled = isTypeEnabled(food.type);
                      const effectiveAvailability = food.isAvailable && enabled;

                      return (
                        <tr 
                          key={food.id} 
                          onClick={() => openEditModal(food)}
                          className={`hover:bg-[#3D3F96]/5 cursor-pointer transition-all duration-150 group ${
                            !effectiveAvailability ? 'opacity-60 bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              {renderTypeSymbol(food.type)}
                              <div>
                                <p className="font-bold text-slate-800 text-[13px] leading-snug group-hover:underline">{food.name}</p>
                                <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1">
                                  {food.category}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-[200px]">
                              {food.description}
                            </p>
                          </td>
                          <td className="py-5 px-6 font-semibold">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-slate-900 font-bold font-mono text-[13px]">₹{food.discountPrice}</span>
                              {food.price !== food.discountPrice && (
                                <span className="text-[11px] text-slate-400 line-through font-mono">₹{food.price}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-6 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-[#3D3F96]/5 text-[#3D3F96] rounded font-extrabold text-[10px]">{food.calories} Kcal</span>
                              <span className="text-[10px] text-slate-500 font-bold">Size: {food.servingSize}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[155px]"><strong className="text-slate-500">Ingredients:</strong> {food.ingredients}</p>
                          </td>
                          <td className="py-5 px-6 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded font-bold text-[10px]">{food.prepTime} Mins</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Spicy: {food.spicyLevel}</span>
                            </div>
                            <div className="flex flex-wrap gap-1 max-w-[180px]">
                              {food.tags.split(',').map(tag => (
                                <span key={tag} className="px-1.5 py-0.5 bg-slate-50 text-slate-400 border border-slate-100 rounded text-[9px] font-bold">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-5 px-6" onClick={(e) => e.stopPropagation()}>
                            <div className="pt-0.5 flex items-center gap-2">
                              <label className={`relative inline-flex items-center ${enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                                <input 
                                  type="checkbox" 
                                  disabled={!enabled}
                                  checked={effectiveAvailability} 
                                  onChange={() => toggleFoodAvailability(food.id)}
                                  className="sr-only peer" 
                                />
                                <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#3D3F96]" />
                              </label>
                              {!enabled && (
                                <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wider whitespace-nowrap">Type Paused</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-6">
                            <div className="flex flex-col gap-1 items-start">
                              {food.disease && food.disease !== 'All' && (
                                <span className="px-2 py-0.5 bg-[#3D3F96]/10 text-[#3D3F96] rounded text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                                  <span>{diseases.find(d => d.id === food.disease)?.icon || '🌐'}</span>
                                  <span>{diseases.find(d => d.id === food.disease)?.name || 'General'}</span>
                                </span>
                              )}
                              {food.isPopular && (
                                  <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 rounded text-[9px] font-extrabold uppercase">
                                    Popular
                                  </span>
                                )}
                                {food.isRecommended && (
                                  <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded text-[9px] font-extrabold uppercase">
                                    Recommended
                                  </span>
                                )}
                                {!food.isPopular && !food.isRecommended && !food.disease && (
                                  <span className="text-xs text-slate-400 font-medium italic">-</span>
                                )}
                            </div>
                          </td>
                          <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => openEditModal(food)}
                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3D3F96] hover:bg-[#3D3F96]/5 rounded-lg transition-all"
                              >
                                <Pencil className="w-4 h-4" strokeWidth={2} />
                              </button>
                              <button 
                                onClick={() => deleteFoodItem(food.id)}
                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <Trash2 className="w-4 h-4" strokeWidth={2} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-200">
            <Inbox className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No Food Items Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no dishes matching your search query.</p>
          </div>
        )}
      </div>

      {/* RENDER DYNAMIC FORM COMPONENT */}
      <AddFoodItem 
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        mode={modalMode}
        editingFood={selectedFoodForEdit}
        categories={categories}
        diseases={diseases}
        onSubmit={handleSaveFoodItem}
      />

    </div>
  );
}