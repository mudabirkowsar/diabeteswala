"use client";

import React, { useState, useEffect } from 'react';
import {
  GlassWater,
  X,
  Image as ImageIcon,
  Loader2,
  Plus,
  Trash2,
  Flame,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

const DRINK_TYPES = [
  "Smoothie",
  "Cold Pressed Juice",
  "Detox Drink",
  "Protein Shake",
  "Immunity Booster"
];

const DIET_TYPES = ["Vegan", "Veg", "Non Veg"];

export default function AddSmoothie({
  isOpen,
  onClose,
  mode = 'create',
  editingDrink = null,
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
  const [formDrinkType, setFormDrinkType] = useState('Smoothie');
  const [formDietType, setFormDietType] = useState('Vegan');
  const [formPrepTime, setFormPrepTime] = useState('10');
  const [formServing, setFormServing] = useState('350ml');
  const [formSugar, setFormSugar] = useState('');
  const [formDisease, setFormDisease] = useState('');
  const [formTags, setFormTags] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isRecommended, setIsRecommended] = useState(false);

  // --- Dynamic Ingredients [{ name, quantity, calories }] ---
  const [ingredientsList, setIngredientsList] = useState([
    { name: '', quantity: '', calories: '' }
  ]);

  // --- Multi-Image Upload State ---
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Live Auto-Calculated Total Calories
  const totalCalculatedCalories = ingredientsList.reduce(
    (sum, item) => sum + (Number(item.calories) || 0),
    0
  );

  // Reset or Populate Form Data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && editingDrink) {
        setFormName(editingDrink.name || '');
        setFormDesc(editingDrink.description || '');

        const catId = editingDrink.categoryId?._id || editingDrink.categoryId || '';
        setFormCategory(catId);

        setFormPrice(editingDrink.price !== undefined ? String(editingDrink.price) : '');
        setFormDiscountPrice(
          editingDrink.discountPrice !== undefined && editingDrink.discountPrice !== null
            ? String(editingDrink.discountPrice)
            : ''
        );
        setFormDrinkType(editingDrink.drinkType || 'Smoothie');
        setFormDietType(editingDrink.dietType || 'Vegan');
        setFormPrepTime(editingDrink.prepTime !== undefined ? String(editingDrink.prepTime) : '10');
        setFormServing(editingDrink.servingSize || '350ml');
        setFormSugar(editingDrink.sugar !== undefined ? String(editingDrink.sugar) : '');
        setFormDisease(editingDrink.foodEffectCategory || (diseases[0]?.foodEffectCategory || ''));

        // Handle Tags
        if (Array.isArray(editingDrink.tags)) {
          setFormTags(editingDrink.tags.join(', '));
        } else {
          setFormTags(editingDrink.tags || '');
        }

        // Feature flags
        setIsPopular(Boolean(editingDrink.isPopular));
        setIsRecommended(Boolean(editingDrink.isRecommended));

        // Ingredients
        if (Array.isArray(editingDrink.ingredients) && editingDrink.ingredients.length > 0) {
          const parsed = editingDrink.ingredients.map(item => ({
            name: item.name || '',
            quantity: item.quantity || '',
            calories: item.calories !== undefined ? String(item.calories) : ''
          }));
          setIngredientsList(parsed);
        } else {
          setIngredientsList([{ name: '', quantity: '', calories: '' }]);
        }

        setExistingImages(Array.isArray(editingDrink.images) ? editingDrink.images : []);
        setSelectedFiles([]);
      } else {
        // Defaults for Create Mode
        setFormName('');
        setFormDesc('');
        setFormCategory(categories.length > 0 ? categories[0]._id : '');
        setFormPrice('');
        setFormDiscountPrice('');
        setFormDrinkType('Smoothie');
        setFormDietType('Vegan');
        setFormPrepTime('10');
        setFormServing('350ml');
        setFormSugar('');
        setFormDisease(diseases.length > 0 ? diseases[0].foodEffectCategory : '');
        setFormTags('');
        setIsPopular(false);
        setIsRecommended(false);
        setIngredientsList([{ name: '', quantity: '', calories: '' }]);
        setExistingImages([]);
        setSelectedFiles([]);
      }
    }
  }, [isOpen, mode, editingDrink, categories, diseases]);

  // Ingredients Handlers
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
      toast.error("Drink must contain at least one ingredient.");
      return;
    }
    setIngredientsList(prev => prev.filter((_, i) => i !== index));
  };

  // Multiple Files Selector (Max 10 files)
  const handleFilesChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      if (filesArr.length > 10) {
        toast.error("You can upload a maximum of 10 images.");
        return;
      }
      setSelectedFiles(filesArr);
    }
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formName.trim()) {
      toast.error("Please enter a drink name.");
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

    if (!formPrepTime || Number(formPrepTime) <= 0) {
      toast.error("Please specify prep/blending time.");
      return;
    }

    if (!formDisease) {
      toast.error("Please select a valid therapeutic focus.");
      return;
    }

    if (mode === 'create' && selectedFiles.length === 0) {
      toast.error("Please upload at least one drink image.");
      return;
    }

    // Format & Validate Ingredients
    const validIngredients = ingredientsList
      .filter(item => item.name.trim() !== '')
      .map(item => ({
        name: item.name.trim(),
        quantity: item.quantity.trim() || "1 serving",
        calories: Number(item.calories) || 0
      }));

    if (validIngredients.length === 0) {
      toast.error("Please provide at least one ingredient with a name.");
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
      formData.append('servingSize', formServing.trim() || "350ml");
      formData.append('drinkType', formDrinkType);
      formData.append('dietType', formDietType);
      formData.append('foodEffectCategory', formDisease);

      if (formSugar !== '') {
        formData.append('sugar', Number(formSugar));
      }

      if (formCategory) {
        formData.append('categoryId', formCategory);
      }

      if (formTags.trim()) {
        formData.append('tags', formTags.trim());
      }

      formData.append('isPopular', isPopular);
      formData.append('isRecommended', isRecommended);

      // Stringified array of ingredient objects
      formData.append('ingredients', JSON.stringify(validIngredients));

      // Append multi-image files
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
      }

      let response;
      if (mode === 'create') {
        response = await AdminAPI.addDrink(formData);
      } else {
        response = await AdminAPI.updateDrink(editingDrink._id, formData);
      }

      if (response && response.success) {
        toast.success(response.message || "Drink saved successfully!");
        onSubmit();
        onClose();
      } else {
        toast.error(response?.message || "Failed to process request.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error submitting smoothie/drink details.");
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
              <GlassWater className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="font-black text-slate-800 text-base">
                {mode === 'create' ? 'Add Smoothie / Health Drink' : 'Update Smoothie / Drink'}
              </h2>
              <p className="text-[11px] text-slate-400 font-semibold">
                Upload up to 10 images, specify clinical specs & auto-calculate calories.
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 flex-1 overflow-y-auto">

          {/* Multiple Images Upload Field */}
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <ImageIcon className="w-6 h-6" strokeWidth={1.8} />
              </div>
              <div className="space-y-1">
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  Drink Gallery (Up to 10 Images) {mode === 'create' && <span className="text-rose-500">*</span>}
                </span>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer px-3.5 py-1.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl transition-all shadow-sm">
                    Select Images
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleFilesChange}
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                    />
                  </label>
                  <span className="text-xs text-slate-500 font-semibold truncate max-w-[240px]">
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length} file(s) chosen`
                      : (existingImages.length > 0 ? `${existingImages.length} existing image(s)` : 'No files chosen')}
                  </span>
                </div>
              </div>
            </div>

            {selectedFiles.length > 0 && (
              <div className="flex gap-2 overflow-x-auto max-w-full pb-1">
                {selectedFiles.map((file, i) => (
                  <span key={i} className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-1 rounded-lg">
                    {file.name.slice(0, 12)}...
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Name & Drink Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Drink Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Avocado Spinach Detox Green Smoothie"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Menu Category</label>
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
              Drink Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Cold-pressed blend of fresh organic spinach, creamy avocado, cucumber, chia seeds, and unsweetened almond milk."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] resize-none leading-relaxed"
            />
          </div>

          {/* Pricing, Prep Time & Serving Size */}
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
                placeholder="199"
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
                placeholder="169"
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
                placeholder="10"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Serving Size</label>
              <input
                type="text"
                value={formServing}
                onChange={(e) => setFormServing(e.target.value)}
                placeholder="350ml / 1 Bottle"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          {/* Drink Type, Diet Type, Health Focus & Sugar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Drink Type</label>
              <select
                value={formDrinkType}
                onChange={(e) => setFormDrinkType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                {DRINK_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Diet Type <span className="text-rose-500">*</span>
              </label>
              <select
                value={formDietType}
                onChange={(e) => setFormDietType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                {DIET_TYPES.map(diet => (
                  <option key={diet} value={diet}>{diet}</option>
                ))}
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
                <option value="">Select Focus</option>
                {diseases.map(d => (
                  <option key={d._id || d.foodEffectCategory} value={d.foodEffectCategory}>{d.foodEffectCategory}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Sugar (grams)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formSugar}
                onChange={(e) => setFormSugar(e.target.value)}
                placeholder="2.5"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          {/* Tags & Flags (Popular / Recommended) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left items-end">
            <div className="sm:col-span-2 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">
                Search Tags (Comma Separated)
              </label>
              <input
                type="text"
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder="e.g. Sugar-Free, Cold-Pressed, High Fiber, Keto, Detox"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#3d3f96]"
              />
            </div>

            <div className="flex items-center gap-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPopular}
                  onChange={(e) => setIsPopular(e.target.checked)}
                  className="rounded text-[#3d3f96] focus:ring-[#3d3f96] h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles size={13} className="text-amber-500" /> Popular
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRecommended}
                  onChange={(e) => setIsRecommended(e.target.checked)}
                  className="rounded text-[#3d3f96] focus:ring-[#3d3f96] h-4 w-4"
                />
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Award size={13} className="text-[#3d3f96]" /> Recommended
                </span>
              </label>
            </div>
          </div>

          {/* Ingredients Breakdown */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Ingredients & Calorie Breakdown <span className="text-rose-500">*</span>
                </h3>
                <p className="text-[11px] text-slate-400 font-medium">Auto-calculates total calories for clinical consistency.</p>
              </div>

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
                      placeholder="Ingredient Name (e.g. Baby Spinach)"
                      value={ingredient.name}
                      onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="w-28 sm:w-32">
                    <input
                      type="text"
                      placeholder="Qty (e.g. 80g / 200ml)"
                      value={ingredient.quantity}
                      onChange={(e) => handleIngredientChange(idx, 'quantity', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg focus:outline-none focus:border-[#3d3f96]"
                    />
                  </div>
                  <div className="w-24 sm:w-28">
                    <input
                      type="number"
                      min="0"
                      placeholder="Kcal (e.g. 18)"
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

          {/* Form Actions */}
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
                <span>{mode === 'create' ? 'Save & Create Drink' : 'Save Changes'}</span>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}