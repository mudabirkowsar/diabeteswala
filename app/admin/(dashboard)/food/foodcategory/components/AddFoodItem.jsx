"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, X, Image as ImageIcon, Loader2, Plus, Trash2, Flame } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../../services/AdminAPI';

export default function AddFoodItem({
  isOpen,
  onClose,
  mode,
  editingFood,
  categories = [],
  diseases = [],
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
  const [formServing, setFormServing] = useState('1 Person');
  const [formSpicy, setFormSpicy] = useState('Low (Mild)');
  const [formDisease, setFormDisease] = useState('');
  const [formTags, setFormTags] = useState('');
  
  // --- Ingredients List with structured objects [{ name, quantity, calories }] ---
  const [ingredientsList, setIngredientsList] = useState([
    { name: '', quantity: '', calories: '' }
  ]);

  // --- Upload Asset States ---
  const [selectedFile, setSelectedFile] = useState(null);
  const [foodImageName, setFoodImageName] = useState('No file chosen');
  const [actionLoading, setActionLoading] = useState(false);

  // Auto-calculated calories from ingredients
  const totalCalculatedCalories = ingredientsList.reduce(
    (sum, item) => sum + (Number(item.calories) || 0),
    0
  );

  // Synchronize form states when modal opens or targets change
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingFood) {
        setFormName(editingFood.name || '');
        setFormDesc(editingFood.description || '');

        const catId = editingFood.categoryId?._id || editingFood.categoryId || '';
        setFormCategory(catId);

        setFormPrice(editingFood.price !== undefined ? String(editingFood.price) : '');
        setFormDiscountPrice(editingFood.discountPrice !== undefined ? String(editingFood.discountPrice) : '');
        setFormType(editingFood.dietType || 'Veg');
        setFormPrepTime(editingFood.prepTime !== undefined ? String(editingFood.prepTime) : '');
        setFormServing(editingFood.servingSize || '1 Person');
        setFormSpicy(editingFood.spicyLevel || 'Low (Mild)');
        setFormDisease(editingFood.foodEffectCategory || (diseases[0]?.foodEffectCategory || ''));

        // Handle Tags (array or string)
        if (Array.isArray(editingFood.tags)) {
          setFormTags(editingFood.tags.join(', '));
        } else {
          setFormTags(editingFood.tags || '');
        }

        // Handle Ingredients (Parse Array of Objects or fallback)
        if (Array.isArray(editingFood.ingredients) && editingFood.ingredients.length > 0) {
          const parsed = editingFood.ingredients.map(item => {
            if (typeof item === 'object' && item !== null) {
              return {
                name: item.name || '',
                quantity: item.quantity || '',
                calories: item.calories !== undefined ? String(item.calories) : ''
              };
            }
            return { name: String(item), quantity: '', calories: '' };
          });
          setIngredientsList(parsed);
        } else {
          setIngredientsList([{ name: '', quantity: '', calories: '' }]);
        }

        setSelectedFile(null);
        setFoodImageName('No file chosen');
      } else {
        // Defaults for Create Mode
        setFormName('');
        setFormDesc('');
        setFormCategory(categories.length > 0 ? categories[0]._id : '');
        setFormPrice('');
        setFormDiscountPrice('');
        setFormType('Veg');
        setFormPrepTime('15');
        setFormServing('1 Person');
        setFormSpicy('Low (Mild)');
        setFormDisease(diseases.length > 0 ? diseases[0].foodEffectCategory : '');
        setFormTags('');
        setIngredientsList([{ name: '', quantity: '', calories: '' }]);
        setSelectedFile(null);
        setFoodImageName('No file chosen');
      }
    }
  }, [isOpen, mode, editingFood, categories, diseases]);

  // Ingredients management handlers
  const handleIngredientChange = (index, field, value) => {
    setIngredientsList(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddIngredientRow = () => {
    setIngredientsList(prev => [...prev, { name: '', quantity: '', calories: '' }]);
  };

  const handleRemoveIngredientRow = (index) => {
    if (ingredientsList.length <= 1) {
      toast.error("Dish must contain at least one ingredient.");
      return;
    }
    setIngredientsList(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFoodImageName(file.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Please enter a food item name.");
      return;
    }

    if (!formDesc.trim()) {
      toast.error("Please provide a description.");
      return;
    }

    if (!formPrice || Number(formPrice) <= 0) {
      toast.error("Please provide a valid price.");
      return;
    }

    if (formDiscountPrice && Number(formDiscountPrice) > Number(formPrice)) {
      toast.error("Discount price cannot exceed the original price.");
      return;
    }

    if (!formPrepTime) {
      toast.error("Please specify prep time in minutes.");
      return;
    }

    if (!formDisease) {
      toast.error("Please select a valid therapeutic focus.");
      return;
    }

    // Format & Validate Ingredients Breakdown
    const validIngredients = ingredientsList
      .filter(item => item.name.trim() !== '')
      .map(item => ({
        name: item.name.trim(),
        quantity: item.quantity.trim() || "1 serving",
        calories: Number(item.calories) || 0
      }));

    if (validIngredients.length === 0) {
      toast.error("Please add at least one ingredient with a name.");
      return;
    }

    setActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', formName.trim());
      formData.append('description', formDesc.trim());
      formData.append('price', Number(formPrice));

      if (formDiscountPrice) {
        formData.append('discountPrice', Number(formDiscountPrice));
      }

      formData.append('prepTime', Number(formPrepTime));
      formData.append('servingSize', formServing);
      formData.append('spicyLevel', formSpicy);
      formData.append('dietType', formType);
      formData.append('foodEffectCategory', formDisease);

      if (formCategory) {
        formData.append('categoryId', formCategory);
      }

      if (formTags.trim()) {
        formData.append('tags', formTags.trim());
      }

      // Ingredients sent as stringified JSON array as per API requirements
      formData.append('ingredients', JSON.stringify(validIngredients));

      if (selectedFile) {
        formData.append('imageUrl', selectedFile);
      }

      let response;
      if (mode === 'create') {
        response = await AdminAPI.addFoodItem(formData);
      } else {
        const isMultipart = !!selectedFile;
        if (!isMultipart) {
          // Send JSON payload if image is not replaced
          const jsonPayload = {
            name: formName.trim(),
            description: formDesc.trim(),
            price: Number(formPrice),
            discountPrice: formDiscountPrice ? Number(formDiscountPrice) : undefined,
            prepTime: Number(formPrepTime),
            servingSize: formServing,
            spicyLevel: formSpicy,
            dietType: formType,
            foodEffectCategory: formDisease,
            categoryId: formCategory || undefined,
            tags: formTags.trim(),
            ingredients: validIngredients
          };
          response = await AdminAPI.updateFoodItem(editingFood._id, jsonPayload, false);
        } else {
          response = await AdminAPI.updateFoodItem(editingFood._id, formData, true);
        }
      }

      if (response && response.success) {
        toast.success(response.message || "Food item saved successfully!");
        onSubmit();
        onClose();
      } else {
        toast.error(response?.message || "Failed to save food item.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting food item details.");
    } finally {
      setActionLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[92vh] shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/5">
              <BookOpen className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base">
                {mode === 'create' ? 'Create Master Food Item' : 'Update Master Food Item'}
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">
                Auto-calculates total calories from detailed ingredients.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={actionLoading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={2} />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">
          
          {/* Image Upload Banner */}
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 flex-shrink-0">
              <ImageIcon className="w-6 h-6" strokeWidth={1.8} />
            </div>
            <div className="space-y-1">
              <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">Dish Image</span>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3.5 py-1.5 bg-[#00B574] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm">
                  Choose Image
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                  />
                </label>
                <span className="text-xs text-slate-500 truncate max-w-[220px] font-semibold">{foodImageName}</span>
              </div>
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Dish Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Mediterranean Grilled Chicken Salad"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Food Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="">Select Category (Optional)</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.foodCategory}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Fresh garden greens, grilled chicken breast, olives, avocado, and light olive oil dressing."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] resize-none leading-relaxed"
            />
          </div>

          {/* Pricing, Prep Time & Serving */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                value={formPrice}
                onChange={(e) => setFormPrice(e.target.value)}
                placeholder="299"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Discount Price (₹)</label>
              <input
                type="number"
                min="0"
                value={formDiscountPrice}
                onChange={(e) => setFormDiscountPrice(e.target.value)}
                placeholder="249"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Prep Time (Mins) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                value={formPrepTime}
                onChange={(e) => setFormPrepTime(e.target.value)}
                placeholder="15"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Serving Size</label>
              <input
                type="text"
                value={formServing}
                onChange={(e) => setFormServing(e.target.value)}
                placeholder="1 Person"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          {/* Diet Type, Medical Focus, Spicy Level */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Diet Classification <span className="text-rose-500">*</span>
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="Veg">Veg (Vegetarian)</option>
                <option value="Egg">Egg (Eggitarian)</option>
                <option value="Non Veg">Non Veg (Non-Vegetarian)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Health / Medical Focus <span className="text-rose-500">*</span>
              </label>
              <select
                value={formDisease}
                onChange={(e) => setFormDisease(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="">Select Health Focus</option>
                {diseases.map(d => (
                  <option key={d._id || d.foodEffectCategory} value={d.foodEffectCategory}>{d.foodEffectCategory}</option>
                ))}
              </select>
            </div>
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
          </div>

          {/* Tags */}
          <div className="space-y-1 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
              Search Tags (Comma Separated)
            </label>
            <input
              type="text"
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="e.g. High Protein, Low GI, Fresh, Keto"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
            />
          </div>

          {/* Structured Ingredients Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Detailed Ingredients Breakdown <span className="text-rose-500">*</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Add quantities and individual calories.</p>
              </div>

              {/* Total calories badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold shadow-sm">
                <Flame size={14} className="text-amber-300" />
                <span>Total: {totalCalculatedCalories} Kcal</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {ingredientsList.map((ingredient, idx) => (
                <div key={idx} className="flex items-center gap-2 sm:gap-3 bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs">
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Ingredient Name (e.g. Grilled Chicken)"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="w-28 sm:w-32">
                    <input
                      type="text"
                      placeholder="Qty (e.g. 150g)"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="w-24 sm:w-28">
                    <input
                      type="number"
                      min="0"
                      placeholder="Kcal (e.g. 240)"
                      value={ingredient.calories}
                      onChange={(e) => handleIngredientChange(idx, 'calories', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIngredientRow(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
                    title="Remove ingredient"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddIngredientRow}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#3d3f96] hover:bg-[#3d3f96]/10 px-3 py-2 rounded-xl border border-dashed border-[#3d3f96]/30 transition-all cursor-pointer"
            >
              <Plus size={14} /> Add Another Ingredient
            </button>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
              className="px-6 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-8 py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-80"
            >
              {actionLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <span>{mode === 'create' ? 'Save & Create Food Item' : 'Save Changes'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}