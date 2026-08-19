"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Image } from 'lucide-react';

export default function AddFoodItem({
  isOpen,
  onClose,
  mode,
  editingFood,
  categories,
  diseases,
  onSubmit
}) {
  // Local Form State Fields
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('');
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

  // Synchronize form states when modal opens or targets change
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingFood) {
        setFormName(editingFood.name || '');
        setFormDesc(editingFood.description || '');
        setFormCategory(editingFood.category || (categories[0]?.name || ''));
        setFormPrice(editingFood.price?.toString() || '');
        setFormDiscountPrice(editingFood.discountPrice?.toString() || '');
        setFormType(editingFood.type || 'Veg');
        setFormPrepTime(editingFood.prepTime?.toString() || '');
        setFormCalories(editingFood.calories?.toString() || '');
        setFormIngredients(editingFood.ingredients || '');
        setFormTags(editingFood.tags || '');
        setFormAvailability(editingFood.isAvailable ?? true);
        setFormPopular(!!editingFood.isPopular);
        setFormRecommended(!!editingFood.isRecommended);
        setFormSpicy(editingFood.spicyLevel || 'Low');
        setFormServing(editingFood.servingSize || '1 Person');
        setFormDisease(editingFood.disease || 'All');
        setFoodImageName('No file chosen');
      } else {
        // Reset to initial defaults for creation
        setFormName('');
        setFormDesc('');
        setFormCategory(categories[0]?.name || '');
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
      }
    }
  }, [isOpen, mode, editingFood, categories]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
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
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative animate-scale-up flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/5">
                <BookOpen className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="font-bold text-slate-800 text-base">
                {mode === 'create' ? 'Add New Food Item' : 'Edit Food Item Details'}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto">
          
          {/* Image Upload simulation */}
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
              <Image className="w-5 h-5" strokeWidth={1.8} />
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

          {/* Food Type, Prep Time, Calories & Therapy target */}
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
                <option value="All">🌐 All Profiles / General</option>
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

          {/* Spicy level & Flag Tags */}
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
              onClick={onClose}
              className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-8 py-3.5 bg-[#3D3F96] hover:bg-[#3D3F96]/95 text-white font-bold text-xs rounded-xl shadow-lg shadow-[#3D3F96]/10"
            >
              {mode === 'create' ? 'Add Food Item' : 'Save Changes'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}