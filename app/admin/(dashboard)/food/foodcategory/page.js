"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [diseases, setDiseases] = useState(INITIAL_DISEASES); // Dynamic disease State
  const [foods, setFoods] = useState(INITIAL_FOODS);
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiseaseFilter, setSelectedDiseaseFilter] = useState('All'); 

  // Global Diet Group Toggles
  const [isVegLive, setIsVegLive] = useState(true);
  const [isEggLive, setIsEggLive] = useState(true);
  const [isNonVegLive, setIsNonVegLive] = useState(true);
  
  // Modal Configurations
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); 
  const [modalTab, setModalTab] = useState('food'); 
  const [editingId, setEditingId] = useState(null);

  // Quick Category Form States
  const [newCategoryName, setNewCategoryName] = useState('');
  const [inlineEditingCatId, setInlineEditingCatId] = useState(null);
  const [inlineEditingCatName, setInlineEditingCatName] = useState('');

  // Quick Disease Form States (Tab 2 additions)
  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [newDiseaseIcon, setNewDiseaseIcon] = useState('🌐');
  const [inlineEditingDiseaseId, setInlineEditingDiseaseId] = useState(null);
  const [inlineEditingDiseaseName, setInlineEditingDiseaseName] = useState('');
  const [inlineEditingDiseaseIcon, setInlineEditingDiseaseIcon] = useState('');

  // Food Form Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState(INITIAL_CATEGORIES[0]?.name || '');
  const [formPrice, setFormPrice] = useState('');
  const [formDiscountPrice, setFormDiscountPrice] = useState('');
  const [formType, setFormType] = useState('Veg');
  const [formPrepTime, setFormPrepTime] = useState('');
  const [formCalories, setFormCalories] = useState('');
  const [formIngredients, setFormIngredients] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formAvailability, setFormAvailability] = useState(true);
  const [formPopular, setFormPopular] = useState(false);
  const [formRecommended, setFormRecommended] = useState(false);
  const [formSpicy, setFormSpicy] = useState('Low');
  const [formServing, setFormServing] = useState('1 Person');
  const [formDisease, setFormDisease] = useState('All'); 
  const [foodImageName, setFoodImageName] = useState('No file chosen');

  const router = useRouter();

  // Add Category inline in Modal Tab 2
  const handleAddCategory = (e) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    if (categories.some(c => c.name.toLowerCase() === cleanName.toLowerCase())) {
      alert("Category already exists.");
      return;
    }

    const newCat = {
      id: `cat-${Date.now()}`,
      name: cleanName
    };

    setCategories([...categories, newCat]);
    setNewCategoryName('');
  };

  // Inline Rename Category
  const handleRenameCategory = (id) => {
    const cleanName = inlineEditingCatName.trim();
    if (!cleanName) return;

    const oldCategory = categories.find(c => c.id === id);
    if (!oldCategory) return;

    setCategories(prev => prev.map(c => c.id === id ? { ...c, name: cleanName } : c));
    
    // Cascade update to food items
    setFoods(prev => prev.map(f => 
      f.category === oldCategory.name ? { ...f, category: cleanName } : f
    ));

    setInlineEditingCatId(null);
    setInlineEditingCatName('');
  };

  // Delete Category
  const handleDeleteCategory = (id, name) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setFoods(prev => prev.map(f => 
      f.category === name ? { ...f, category: 'Uncategorized' } : f
    ));
  };

  // Add Disease Profile inline in Modal Tab 2
  const handleAddDisease = (e) => {
    e.preventDefault();
    const cleanName = newDiseaseName.trim();
    if (!cleanName) return;

    if (diseases.some(d => d.name.toLowerCase() === cleanName.toLowerCase())) {
      alert("Therapy focus already exists.");
      return;
    }

    const newDisease = {
      id: `dis-${Date.now()}`,
      name: cleanName,
      icon: newDiseaseIcon
    };

    setDiseases([...diseases, newDisease]);
    setNewDiseaseName('');
    setNewDiseaseIcon('🌐');
  };

  // Inline Rename Disease
  const handleRenameDisease = (id) => {
    const cleanName = inlineEditingDiseaseName.trim();
    if (!cleanName) return;

    setDiseases(prev => prev.map(d => d.id === id ? { ...d, name: cleanName, icon: inlineEditingDiseaseIcon } : d));
    setInlineEditingDiseaseId(null);
    setInlineEditingDiseaseName('');
    setInlineEditingDiseaseIcon('🌐');
  };

  // Delete Disease Profile
  const handleDeleteDisease = (id) => {
    setDiseases(prev => prev.filter(d => d.id !== id));
    // Re-route foods mapped to deleted disease back to 'All / General'
    setFoods(prev => prev.map(f => f.disease === id ? { ...f, disease: 'All' } : f));
  };

  // Toggle Food availability online state directly on table
  const toggleFoodAvailability = (id) => {
    setFoods(prev => prev.map(f => 
      f.id === id ? { ...f, isAvailable: !f.isAvailable } : f
    ));
  };

  // Open creation modal
  const openCreateModal = () => {
    setModalMode('create');
    setModalTab('food');
    resetForm();
    setIsFoodModalOpen(true);
  };

  // Open edit modal pre-filled
  const openEditModal = (food) => {
    setModalMode('edit');
    setModalTab('food');
    setEditingId(food.id);

    setFormName(food.name);
    setFormDesc(food.description);
    setFormCategory(food.category);
    setFormPrice(food.price.toString());
    setFormDiscountPrice(food.discountPrice.toString());
    setFormType(food.type);
    setFormPrepTime(food.prepTime.toString());
    setFormCalories(food.calories.toString());
    setFormIngredients(food.ingredients);
    setFormTags(food.tags);
    setFormAvailability(food.isAvailable);
    setFormPopular(food.isPopular);
    setFormRecommended(food.isRecommended);
    setFormSpicy(food.spicyLevel);
    setFormServing(food.servingSize);
    setFormDisease(food.disease || 'All'); 
    setFoodImageName('No file chosen');

    setIsFoodModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (modalMode === 'create') {
      const newFood = {
        id: `FD-${Date.now()}`,
        name: formName,
        description: formDesc,
        category: formCategory || 'Uncategorized',
        price: parseFloat(formPrice) || 0,
        discountPrice: parseFloat(formDiscountPrice) || 0,
        type: formType,
        prepTime: parseInt(formPrepTime) || 15,
        calories: parseInt(formCalories) || 200,
        ingredients: formIngredients,
        tags: formTags,
        isAvailable: formAvailability,
        isPopular: formPopular,
        isRecommended: formRecommended,
        spicyLevel: formSpicy,
        servingSize: formServing,
        disease: formDisease 
      };
      setFoods([newFood, ...foods]);
    } else {
      setFoods(prev => prev.map(f => 
        f.id === editingId 
          ? {
              ...f,
              name: formName,
              description: formDesc,
              category: formCategory,
              price: parseFloat(formPrice) || 0,
              discountPrice: parseFloat(formDiscountPrice) || 0,
              type: formType,
              prepTime: parseInt(formPrepTime) || 15,
              calories: parseInt(formCalories) || 200,
              ingredients: formIngredients,
              tags: formTags,
              isAvailable: formAvailability,
              isPopular: formPopular,
              isRecommended: formRecommended,
              spicyLevel: formSpicy,
              servingSize: formServing,
              disease: formDisease 
            }
          : f
      ));
    }

    resetForm();
    setIsFoodModalOpen(false);
  };

  const deleteFoodItem = (id) => {
    setFoods(prev => prev.filter(f => f.id !== id));
  };

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormCategory(categories[0]?.name || 'Uncategorized');
    setFormPrice('');
    setFormDiscountPrice('');
    setFormType('Veg');
    setFormPrepTime('');
    setFormCalories('');
    setFormIngredients('');
    setFormTags('');
    setFormAvailability(true);
    setFormPopular(false);
    setFormRecommended(false);
    setFormSpicy('Low');
    setFormServing('1 Person');
    setFormDisease('All'); 
    setFoodImageName('No file chosen');
    setEditingId(null);
  };

  // Filter Logic: Search Input + Disease targets
  const filteredFoods = foods.filter(food => {
    const matchesSearch = 
      food.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      food.ingredients.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.tags.toLowerCase().includes(searchQuery.toLowerCase()) ||
      food.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDisease = selectedDiseaseFilter === 'All' || food.disease === selectedDiseaseFilter;

    return matchesSearch && matchesDisease;
  });

  // Check if there are uncategorized foods
  const uncategorizedFoods = filteredFoods.filter(f => !categories.some(c => c.name === f.category));

  // Food type badge helper
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
            <MenuBookIcon className="w-7 h-7 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Menu Items</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Configure categories, list new food items, and track kitchen prep times.</p>
          </div>
        </div>

        {/* Action Buttons Panel */}
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

      {/* Quick Filters: Search Bar & Global Category Status Toggles */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        
        {/* Search Input Bar */}
        <div className="relative w-full max-w-md">
          <input
            type="text"
            placeholder="Search by food name, category, or ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/15 text-slate-700 transition-all shadow-sm"
          />
          <SearchIcon className="absolute left-4 top-3.5 w-4 h-4 text-slate-400 stroke-[2.2]" />
        </div>

        {/* Dynamic Disease Target Filter Dropdown */}
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

        {/* Global Diet Category Switches */}
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

      {/* Full-Width Table Container Card */}
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
                  <th className="py-5 px-6">Prep & Tags</th>
                  <th className="py-5 px-6">Availability</th>
                  <th className="py-5 px-6">Flags & Profile</th> 
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
                              <div className="flex flex-col gap-1.5 items-start">
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
                                  <EditIcon className="w-4 h-4 stroke-[2]" />
                                </button>
                                <button 
                                  onClick={() => deleteFoodItem(food.id)}
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                  <TrashIcon className="w-4 h-4 stroke-[2]" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

                {/* 2. Uncategorized Section */}
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
                                <EditIcon className="w-4 h-4 stroke-[2]" />
                              </button>
                              <button 
                                onClick={() => deleteFoodItem(food.id)}
                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                              >
                                <TrashIcon className="w-4 h-4 stroke-[2]" />
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
            <EmptyBoxIcon className="w-12 h-12 text-slate-300 mb-3" />
            <p className="font-bold text-slate-700">No Food Items Found</p>
            <p className="text-sm text-slate-400 mt-1">There are no dishes matching your search query.</p>
          </div>
        )}
      </div>

      {/* CREATE & EDIT FOOD ITEM OVERLAY MODAL */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up flex flex-col">
            
            {/* Modal Navigation Tabs */}
            <div className="bg-slate-50 px-6 pt-6 border-b border-slate-100 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/5">
                    <MenuBookIcon className="w-4.5 h-4.5 stroke-[2]" />
                  </div>
                  <span className="font-bold text-slate-800 text-base">Menu Operations</span>
                </div>
                <button
                  onClick={() => setIsFoodModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
                >
                  <CloseIcon className="w-5 h-5 stroke-[2]" />
                </button>
              </div>

              {/* Tab selectors */}
              <div className="flex gap-2 text-xs font-bold">
                <button
                  onClick={() => setModalTab('food')}
                  className={`px-4 py-2 border-b-2 font-bold transition-all duration-150 ${
                    modalTab === 'food'
                      ? 'border-[#3D3F96] text-[#3D3F96]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Food Details Form
                </button>
                <button
                  onClick={() => setModalTab('category')}
                  className={`px-4 py-2 border-b-2 font-bold transition-all duration-150 ${
                    modalTab === 'category'
                      ? 'border-[#3D3F96] text-[#3D3F96]'
                      : 'border-transparent text-slate-400 hover:text-slate-600'
                  }`}
                >
                  Manage Categories &amp; Therapy Focus
                </button>
              </div>
            </div>

            {/* TAB 1: FOOD DETAILS INPUT FORM */}
            {modalTab === 'food' ? (
              <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto">
                
                {/* Image Upload simulation */}
                <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Food Image</span>
                    <div className="flex items-center gap-3">
                      <label className="cursor-pointer px-3.5 py-1.5 bg-[#00B574] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10">
                        Choose Image
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => setFoodImageName(e.target.files[0]?.name || 'No file chosen')}
                        />
                      </label>
                      <span className="text-xs text-slate-500 truncate max-w-[150px]">{foodImageName}</span>
                    </div>
                  </div>
                </div>

                {/* Food Name & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Food Name</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Quinoa Salad"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                  <textarea
                    rows={2}
                    required
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Detail the ingredients, glycemic focus and diet targets of the recipe..."
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 resize-none leading-relaxed"
                  />
                </div>

                {/* Prices & Serving Size */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Discount Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={formDiscountPrice}
                      onChange={(e) => setFormDiscountPrice(e.target.value)}
                      placeholder="e.g. 220"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Serving Size</label>
                    <input
                      type="text"
                      required
                      value={formServing}
                      onChange={(e) => setFormServing(e.target.value)}
                      placeholder="e.g. 1 Person"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                </div>

                {/* Food Type, Prep Time, Calories & Disease support Target */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Food Type</label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer"
                    >
                      <option value="Veg">Vegetarian</option>
                      <option value="Non Veg">Non-Vegetarian</option>
                      <option value="Egg">Eggitarian</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Prep Time (Mins)</label>
                    <input
                      type="number"
                      required
                      value={formPrepTime}
                      onChange={(e) => setFormPrepTime(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Calories (Kcal)</label>
                    <input
                      type="number"
                      required
                      value={formCalories}
                      onChange={(e) => setFormCalories(e.target.value)}
                      placeholder="e.g. 245"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Medical Focus</label>
                    <select
                      value={formDisease}
                      onChange={(e) => setFormDisease(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer"
                    >
                      {diseases.map(d => (
                        <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Ingredients & Tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Ingredients</label>
                    <input
                      type="text"
                      required
                      value={formIngredients}
                      onChange={(e) => setFormIngredients(e.target.value)}
                      placeholder="e.g. Quinoa, Peas, Spices"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Tags (Comma Separated)</label>
                    <input
                      type="text"
                      required
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="e.g. Keto, Low GI, High Fiber"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5"
                    />
                  </div>
                </div>

                {/* Spicy level & Highlight Flags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Spicy Level</label>
                    <select
                      value={formSpicy}
                      onChange={(e) => setFormSpicy(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3D3F96] focus:ring-4 focus:ring-[#3D3F96]/5 cursor-pointer"
                    >
                      <option value="Low">Low (Mild)</option>
                      <option value="Medium">Medium (Regular)</option>
                      <option value="High">High (Hot)</option>
                    </select>
                  </div>
                  <div className="flex flex-col justify-end pb-1.5 space-y-3">
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formPopular} 
                          onChange={() => setFormPopular(!formPopular)}
                          className="rounded border-slate-200 text-[#3D3F96] focus:ring-[#3D3F96]" 
                        />
                        <span>Popular</span>
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

                {/* Action buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFoodModalOpen(false)}
                    className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                  >
                    CANCEL
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10"
                  >
                    {modalMode === 'create' ? 'Add Food Item' : 'Save Changes'}
                  </button>
                </div>

              </form>
            ) : (
              /* TAB 2: MANAGE CATEGORIES & DISEASES (Split Grid Workspace) */
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-2 gap-10 flex-1 overflow-y-auto">
                
                {/* COLUMN A: CATEGORIES MANAGEMENT */}
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Food Category Directory</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Add, rename, and clear general food section divisions.</p>
                  </div>

                  <form onSubmit={handleAddCategory} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">New Category Name</label>
                      <input
                        type="text"
                        required
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="e.g. Sugar-free Shakes"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D3F96]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#3D3F96] hover:bg-indigo-900 text-white font-bold text-xs h-[38px] rounded-xl"
                    >
                      Add
                    </button>
                  </form>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {categories.map((cat) => {
                      const isEditingThis = inlineEditingCatId === cat.id;
                      return (
                        <div key={cat.id} className="p-3 flex items-center justify-between gap-4 text-xs font-bold text-slate-700 bg-white">
                          {isEditingThis ? (
                            <div className="flex-1 flex gap-2">
                              <input
                                type="text"
                                value={inlineEditingCatName}
                                onChange={(e) => setInlineEditingCatName(e.target.value)}
                                className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                              />
                              <button
                                onClick={() => handleRenameCategory(cat.id)}
                                className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[11px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setInlineEditingCatId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <span>{cat.name}</span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineEditingCatId(cat.id);
                                    setInlineEditingCatName(cat.name);
                                  }}
                                  className="p-1.5 border border-slate-100 text-slate-400 hover:text-[#3D3F96] rounded-lg"
                                >
                                  <EditIcon className="w-3.5 h-3.5 stroke-[2]" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                  className="p-1.5 border border-slate-100 text-slate-400 hover:text-rose-600 rounded-lg"
                                >
                                  <TrashIcon className="w-3.5 h-3.5 stroke-[2]" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* COLUMN B: THERAPEUTIC / DISEASE OPTIONS MANAGEMENT */}
                <div className="space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Therapy Profile Directory</h3>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage target therapeutic profiles and medical configurations.</p>
                  </div>

                  <form onSubmit={handleAddDisease} className="flex gap-2 items-end">
                    <div className="w-16">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Icon</label>
                      <select
                        value={newDiseaseIcon}
                        onChange={(e) => setNewDiseaseIcon(e.target.value)}
                        className="w-full px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
                      >
                        <option value="🌐">🌐</option>
                        <option value="🩸">🩸</option>
                        <option value="🫀">🫀</option>
                        <option value="🌾">🌾</option>
                        <option value="🧼">🧼</option>
                        <option value="🥑">🥑</option>
                        <option value="🦋">🦋</option>
                        <option value="🥗">🥗</option>
                        <option value="🥩">🥩</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Therapy Focus Name</label>
                      <input
                        type="text"
                        required
                        value={newDiseaseName}
                        onChange={(e) => setNewDiseaseName(e.target.value)}
                        placeholder="e.g. Heart Care"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3D3F96]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#3D3F96] hover:bg-indigo-900 text-white font-bold text-xs h-[38px] rounded-xl"
                    >
                      Add
                    </button>
                  </form>

                  <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                    {diseases.map((dis) => {
                      const isEditingThis = inlineEditingDiseaseId === dis.id;
                      return (
                        <div key={dis.id} className="p-3 flex items-center justify-between gap-4 text-xs font-bold text-slate-700 bg-white">
                          {isEditingThis ? (
                            <div className="flex-1 flex gap-2">
                              <select
                                value={inlineEditingDiseaseIcon}
                                onChange={(e) => setInlineEditingDiseaseIcon(e.target.value)}
                                className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                              >
                                <option value="🌐">🌐</option>
                                <option value="🩸">🩸</option>
                                <option value="🫀">🫀</option>
                                <option value="🌾">🌾</option>
                                <option value="🧼">🧼</option>
                                <option value="🥑">🥑</option>
                                <option value="🦋">🦋</option>
                                <option value="🥗">🥗</option>
                              </select>
                              <input
                                type="text"
                                value={inlineEditingDiseaseName}
                                onChange={(e) => setInlineEditingDiseaseName(e.target.value)}
                                className="flex-1 px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                              />
                              <button
                                onClick={() => handleRenameDisease(dis.id)}
                                className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[11px]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setInlineEditingDiseaseId(null)}
                                className="px-2 py-1 bg-slate-100 text-slate-500 rounded-lg text-[11px]"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2">
                                <span>{dis.icon}</span>
                                <span>{dis.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInlineEditingDiseaseId(dis.id);
                                    setInlineEditingDiseaseName(dis.name);
                                    setInlineEditingDiseaseIcon(dis.icon);
                                  }}
                                  className="p-1.5 border border-slate-100 text-slate-400 hover:text-[#3D3F96] rounded-lg"
                                >
                                  <EditIcon className="w-3.5 h-3.5 stroke-[2]" />
                                </button>
                                <button
                                  type="button"
                                  disabled={dis.id === 'All'}
                                  onClick={() => handleDeleteDisease(dis.id)}
                                  className="p-1.5 border border-slate-100 text-slate-400 hover:text-rose-600 rounded-lg disabled:opacity-30 disabled:pointer-events-none"
                                >
                                  <TrashIcon className="w-3.5 h-3.5 stroke-[2]" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}

// Custom simple path-icon configurations

function MenuBookIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.967 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.967 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.967 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ImageIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.9 2.9m-18 1.5V19.5a2.25 2.25 0 002.25 2.25h15a2.25 2.25 0 002.25-2.25V14a2.25 2.25 0 00-2.25-2.25H4.5A2.25 2.25 0 002.25 14v4.75zm10.5-6h.008v.008h-.008V11.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
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

function SearchIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z" />
    </svg>
  );
}

function EmptyBoxIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125 1.125-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}