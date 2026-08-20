"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../../services/AdminAPI';

export default function AddFoodItem({
  isOpen,
  onClose,
  mode,
  editingFood,
  categories,
  diseases,
  onSubmit
}) {
  // --- Form States ---
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
  const [formSpicy, setFormSpicy] = useState('Low (Mild)');
  const [formServing, setFormServing] = useState('1 Person');
  const [formDisease, setFormDisease] = useState(''); 
  
  // --- Upload Asset States ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [foodImageName, setFoodImageName] = useState('No file chosen');
  const [actionLoading, setActionLoading] = useState(false);

  // Synchronize form states when modal opens or targets change
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingFood) {
        setFormName(editingFood.name || '');
        setFormDesc(editingFood.description || '');
        
        // Resolve categoryId if populated as object or raw ObjectId
        const catId = editingFood.categoryId?._id || editingFood.categoryId || '';
        setFormCategory(catId);
        
        setFormPrice(editingFood.price?.toString() || '');
        setFormDiscountPrice(editingFood.discountPrice?.toString() || '');
        setFormType(editingFood.dietType || 'Veg');
        setFormPrepTime(editingFood.prepTime?.toString() || '');
        setFormCalories(editingFood.calories?.toString() || '');
        
        // Convert array types to comma-separated strings for easy input manipulation
        setFormIngredients(Array.isArray(editingFood.ingredients) ? editingFood.ingredients.join(', ') : editingFood.ingredients || '');
        setFormTags(Array.isArray(editingFood.tags) ? editingFood.tags.join(', ') : editingFood.tags || '');
        
        setFormAvailability(editingFood.isAvailable ?? true);
        setFormPopular(!!editingFood.isPopular);
        setFormRecommended(!!editingFood.isRecommended);
        setFormSpicy(editingFood.spicyLevel || 'Low (Mild)');
        setFormServing(editingFood.servingSize || '1 Person');
        setFormDisease(editingFood.foodEffectCategory || '');
        setSelectedFile(null);
        setFoodImageName('No file chosen');
      } else {
        // Reset to initial defaults for creation
        setFormName('');
        setFormDesc('');
        setFormCategory(categories.length > 0 ? categories[0]._id : '');
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
        setFormSpicy('Low (Mild)');
        setFormServing('1 Person');
        setFormDisease(diseases.length > 0 ? diseases[0].foodEffectCategory : '');
        setSelectedFile(null);
        setFoodImageName('No file chosen');
      }
    }
  }, [isOpen, mode, editingFood, categories, diseases]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFoodImageName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formCategory) {
      toast.error("Please assign a valid food category.");
      return;
    }

    if (!formDisease) {
      toast.error("Please assign a therapeutic medical focus.");
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', formName.trim());
      formData.append('categoryId', formCategory);
      formData.append('description', formDesc.trim());
      formData.append('price', Number(formPrice));
      
      if (formDiscountPrice) {
        formData.append('discountPrice', Number(formDiscountPrice));
      }
      
      formData.append('servingSize', formServing);
      formData.append('dietType', formType);
      formData.append('prepTime', Number(formPrepTime));
      formData.append('calories', Number(formCalories));
      formData.append('foodEffectCategory', formDisease);
      formData.append('ingredients', formIngredients.trim());
      formData.append('tags', formTags.trim());
      formData.append('spicyLevel', formSpicy);
      formData.append('isPopular', formPopular);
      formData.append('isRecommended', formRecommended);

      if (selectedFile) {
        formData.append('imageUrl', selectedFile);
      }

      let response;
      if (mode === 'create') {
        response = await AdminAPI.addFoodItem(formData);
      } else {
        const isMultipart = !!selectedFile;
        if (!isMultipart) {
          // Send plain JSON payloads if not updating binary images to simplify middleware parsing
          const jsonPayload = {
            name: formName.trim(),
            categoryId: formCategory,
            description: formDesc.trim(),
            price: Number(formPrice),
            discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
            servingSize: formServing,
            dietType: formType,
            prepTime: Number(formPrepTime),
            calories: Number(formCalories),
            foodEffectCategory: formDisease,
            ingredients: formIngredients.trim(),
            tags: formTags.trim(),
            spicyLevel: formSpicy,
            isPopular: formPopular,
            isRecommended: formRecommended
          };
          response = await AdminAPI.updateFoodItem(editingFood._id, jsonPayload, false);
        } else {
          response = await AdminAPI.updateFoodItem(editingFood._id, formData, true);
        }
      }

      if (response && response.success) {
        toast.success(response.message || "Dish properties updated successfully.");
        onSubmit(); // Refresh listing in main panel
        onClose();
      } else {
        toast.error("Failed to complete catalog operation.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting catalog configuration.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative flex flex-col [&::-webkit-scrollbar]:hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-6 border-b border-slate-100 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/5">
                <BookOpen className="w-4.5 h-4.5" strokeWidth={2} />
              </div>
              <span className="font-bold text-slate-800 text-base">
                {mode === 'create' ? 'Add New Food Item' : 'Edit Food Item Details'}
              </span>
            </div>
            <button
              onClick={onClose}
              disabled={actionLoading}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 flex-1 overflow-y-auto">
          
          {/* Image Upload Row */}
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Food Image</span>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3.5 py-1.5 bg-[#00B574] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-500/10">
                  Choose Image
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[150px] font-semibold">{foodImageName}</span>
              </div>
            </div>
          </div>

          {/* Food Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Food Name</label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Keto Garden Veg Salad Bowl"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                {categories.length > 0 ? (
                  categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.foodCategory}</option>
                  ))
                ) : (
                  <option value="">No Active Categories</option>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Description</label>
            <textarea
              rows={2}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Detail the ingredients, glycemic focus and diet targets of the recipe..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] resize-none leading-relaxed"
            />
          </div>

          {/* Prices & Serving Size */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Price (₹)</label>
              <input
                type="number"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="e.g. 220"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Discount Price (₹)</label>
              <input
                type="number"
                value={formDiscountPrice}
                onChange={(e) => setFormDiscountPrice(e.target.value)}
                placeholder="e.g. 180"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Serving Size</label>
              <input
                type="text"
                required
                value={formServing}
                onChange={(e) => setFormServing(e.target.value)}
                placeholder="e.g. 1 Person"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          {/* Food Type, Prep Time, Calories & Therapy target */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Food Type</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="Veg">Vegetarian</option>
                <option value="Non Veg">Non-Vegetarian</option>
                <option value="Egg">Eggitarian</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Prep Time (Mins)</label>
              <input
                type="number"
                required
                value={formPrepTime}
                onChange={(e) => setFormPrepTime(e.target.value)}
                placeholder="e.g. 15"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Calories (Kcal)</label>
              <input
                type="number"
                required
                value={formCalories}
                onChange={(e) => setFormCalories(e.target.value)}
                placeholder="e.g. 256"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Medical Focus</label>
              <select
                value={formDisease}
                onChange={(e) => setFormDisease(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                {diseases.length > 0 ? (
                  diseases.map(d => (
                    <option key={d._id} value={d.foodEffectCategory}>{d.foodEffectCategory}</option>
                  ))
                ) : (
                  <option value="">No Active Focus Profiles</option>
                )}
              </select>
            </div>
          </div>

          {/* Ingredients & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Ingredients (Comma Separated)</label>
              <input
                type="text"
                required
                value={formIngredients}
                onChange={(e) => setFormIngredients(e.target.value)}
                placeholder="e.g. Broccoli, Avocado, Spinach"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Tags (Comma Separated)</label>
              <input
                type="text"
                required
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g. Low GI, Keto, High Fiber"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          {/* Spicy level & Flag Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Spicy Level</label>
              <select
                value={formSpicy}
                onChange={(e) => setFormSpicy(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="Low (Mild)">Low (Mild)</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div className="flex flex-col justify-end pb-1.5 space-y-3">
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={formPopular} 
                    onChange={() => setFormPopular(!formPopular)}
                    className="rounded border-slate-200 text-[#3d3f96] focus:ring-[#3d3f96]" 
                  />
                  <span>Popular Item</span>
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={formRecommended} 
                    onChange={() => setFormRecommended(!formRecommended)}
                    className="rounded border-slate-200 text-[#3d3f96] focus:ring-[#3d3f96]" 
                  />
                  <span>Recommended Item</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="px-6 py-3.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-8 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-80"
            >
              {actionLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <span>{mode === 'create' ? 'Add Food Item' : 'Save Changes'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}