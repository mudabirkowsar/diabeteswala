'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../../../services/AdminAPI';
import {
  X,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Calendar,
  Utensils,
  DollarSign,
  Info,
} from 'lucide-react';

export default function CreatePlan({ isOpen, onClose, onSuccess, editPlanData = null }) {
  // Category & Foods state
  const [categories, setCategories] = useState([]);
  const [allFoods, setAllFoods] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tagline: '',
    mainCategory: '',
    subCategory: '',
    programType: 'Full Program',
    daysCount: 5,
    isRepeatAfter7Days: false,
    pricePerMeal: '',
    discountPricePerMeal: '',
    totalPrice: '',
    discountTotalPrice: '',
    maxSodium: '',
    maxSaturatedFat: '',
    caloriesAvgPerDay: '',
    isPopular: false,
    isRecommended: false,
  });

  // Files
  const [bannerImage, setBannerImage] = useState(null);
  const [showcaseImages, setShowcaseImages] = useState([]);

  // Schedule: array of { dayNumber, dayName, breakfast: [], lunch: [], dinner: [] }
  const [schedule, setSchedule] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Determine which meal slots to show according to programType
  const getVisibleMealSlots = (programType) => {
    if (programType === 'Breakfast & Lunch') {
      return ['breakfast', 'lunch'];
    }
    if (programType === 'Lunches & Dinners') {
      return ['lunch', 'dinner'];
    }
    return ['breakfast', 'lunch', 'dinner']; // Full Program
  };

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [catRes, foodsRes] = await Promise.all([
        AdminAPI.getAllHealthyCategories(),
        AdminAPI.getAllFoodItems(),
      ]);
      setCategories(catRes?.data || []);
      setAllFoods(foodsRes?.data || []);

      if (editPlanData) {
        // If editing, load complete details
        populateEditData(editPlanData);
      } else {
        resetForm();
        initializeDays(5);
      }
    } catch (err) {
      console.error('Failed to load dependency data', err);
      setError('Failed to fetch categories or food items');
    } finally {
      setLoadingInitial(false);
    }
  };

  const populateEditData = (p) => {
    setFormData({
      title: p.title || '',
      description: p.description || '',
      tagline: p.tagline || '',
      mainCategory: p.mainCategory || '',
      subCategory: p.subCategory || '',
      programType: p.programType || 'Full Program',
      daysCount: p.daysCount || 5,
      isRepeatAfter7Days: Boolean(p.isRepeatAfter7Days),
      pricePerMeal: p.pricing?.pricePerMeal || '',
      discountPricePerMeal: p.pricing?.discountPricePerMeal || '',
      totalPrice: p.pricing?.totalPrice || '',
      discountTotalPrice: p.pricing?.discountTotalPrice || '',
      maxSodium: p.nutritionalHighlights?.maxSodium || '',
      maxSaturatedFat: p.nutritionalHighlights?.maxSaturatedFat || '',
      caloriesAvgPerDay: p.nutritionalHighlights?.caloriesAvgPerDay || '',
      isPopular: Boolean(p.isPopular),
      isRecommended: Boolean(p.isRecommended),
    });

    if (p.dayWiseSchedule && p.dayWiseSchedule.length > 0) {
      setSchedule(
        p.dayWiseSchedule.map((d) => ({
          dayNumber: d.dayNumber,
          dayName: d.dayName || `Day ${d.dayNumber}`,
          breakfast: (d.breakfast || []).map((b) => (typeof b === 'object' ? b._id : b)),
          lunch: (d.lunch || []).map((l) => (typeof l === 'object' ? l._id : l)),
          dinner: (d.dinner || []).map((dn) => (typeof dn === 'object' ? dn._id : dn)),
        }))
      );
    } else {
      initializeDays(p.daysCount || 5);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      tagline: '',
      mainCategory: '',
      subCategory: '',
      programType: 'Full Program',
      daysCount: 5,
      isRepeatAfter7Days: false,
      pricePerMeal: '',
      discountPricePerMeal: '',
      totalPrice: '',
      discountTotalPrice: '',
      maxSodium: '',
      maxSaturatedFat: '',
      caloriesAvgPerDay: '',
      isPopular: false,
      isRecommended: false,
    });
    setBannerImage(null);
    setShowcaseImages([]);
    setError('');
    setSuccessMsg('');
  };

  const initializeDays = (count) => {
    const days = [];
    for (let i = 1; i <= count; i++) {
      days.push({
        dayNumber: i,
        dayName: `Day ${i}`,
        breakfast: [],
        lunch: [],
        dinner: [],
      });
    }
    setSchedule(days);
  };

  const handleDaysCountChange = (e) => {
    const count = parseInt(e.target.value, 10) || 1;
    setFormData((prev) => ({ ...prev, daysCount: count }));

    setSchedule((prevSchedule) => {
      const newSchedule = [];
      for (let i = 1; i <= count; i++) {
        if (prevSchedule[i - 1]) {
          newSchedule.push({ ...prevSchedule[i - 1], dayNumber: i, dayName: `Day ${i}` });
        } else {
          newSchedule.push({
            dayNumber: i,
            dayName: `Day ${i}`,
            breakfast: [],
            lunch: [],
            dinner: [],
          });
        }
      }
      return newSchedule;
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === 'mainCategory') {
      setFormData((prev) => ({ ...prev, mainCategory: value, subCategory: '' }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleMealDishChange = (dayIndex, mealType, foodId) => {
    if (!foodId) return;
    const updated = [...schedule];
    if (!updated[dayIndex][mealType].includes(foodId)) {
      updated[dayIndex][mealType] = [...updated[dayIndex][mealType], foodId];
      setSchedule(updated);
    }
  };

  const handleRemoveMealDish = (dayIndex, mealType, foodId) => {
    const updated = [...schedule];
    updated[dayIndex][mealType] = updated[dayIndex][mealType].filter((id) => id !== foodId);
    setSchedule(updated);
  };

  const handleBannerChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setBannerImage(e.target.files[0]);
    }
  };

  const handleShowcaseImagesChange = (e) => {
    if (e.target.files) {
      setShowcaseImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!editPlanData && !bannerImage) {
      setError('Banner image is required.');
      return;
    }
    if (!editPlanData && showcaseImages.length === 0) {
      setError('Please upload at least 1 showcase image.');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('tagline', formData.tagline);
      data.append('mainCategory', formData.mainCategory);
      data.append('subCategory', formData.subCategory);
      data.append('programType', formData.programType);
      data.append('daysCount', Number(formData.daysCount));
      data.append('isRepeatAfter7Days', formData.isRepeatAfter7Days);
      data.append('pricePerMeal', Number(formData.pricePerMeal));
      if (formData.discountPricePerMeal) {
        data.append('discountPricePerMeal', Number(formData.discountPricePerMeal));
      }
      data.append('totalPrice', Number(formData.totalPrice));
      if (formData.discountTotalPrice) {
        data.append('discountTotalPrice', Number(formData.discountTotalPrice));
      }
      if (formData.maxSodium) data.append('maxSodium', formData.maxSodium);
      if (formData.maxSaturatedFat) data.append('maxSaturatedFat', formData.maxSaturatedFat);
      if (formData.caloriesAvgPerDay) {
        data.append('caloriesAvgPerDay', Number(formData.caloriesAvgPerDay));
      }
      data.append('isPopular', formData.isPopular);
      data.append('isRecommended', formData.isRecommended);

      // JSON stringified dayWiseSchedule
      data.append('dayWiseSchedule', JSON.stringify(schedule));

      if (bannerImage) data.append('bannerImage', bannerImage);
      if (showcaseImages.length > 0) {
        showcaseImages.forEach((img) => {
          data.append('images', img);
        });
      }

      let res;
      if (editPlanData?._id) {
        res = await AdminAPI.updateHealthyPlan(editPlanData._id, data);
      } else {
        res = await AdminAPI.createHealthyPlan(data);
      }

      setSuccessMsg(res?.message || 'Healthy Diet Plan saved successfully!');
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedCategoryObj = categories.find((c) => c.mainCategory === formData.mainCategory);
  const visibleMealSlots = getVisibleMealSlots(formData.programType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {editPlanData ? 'Update Healthy Diet Plan' : 'Create Healthy Diet Plan'}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Set up full day-wise meal schedules and pricing
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Basic Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#3d3f96] uppercase tracking-wider flex items-center gap-2">
              <Info size={16} /> 1. Plan Overview
            </h3>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Plan Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Men's Keto Flex 5-Day Custom Day-Wise Plan"
                className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] focus:border-[#3d3f96] text-sm outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Tagline</label>
                <input
                  type="text"
                  name="tagline"
                  value={formData.tagline}
                  onChange={handleInputChange}
                  placeholder="e.g. Different curated healthy meals for Day 1, Day 2..."
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Program Format <span className="text-red-500">*</span>
                </label>
                <select
                  name="programType"
                  value={formData.programType}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none text-sm bg-white"
                >
                  <option value="Full Program">Full Program (Breakfast + Lunch + Dinner)</option>
                  <option value="Breakfast & Lunch">Breakfast & Lunch</option>
                  <option value="Lunches & Dinners">Lunches & Dinners</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                required
                rows={2}
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Dietitian-designed high-protein, low-carb meals..."
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none text-sm"
              />
            </div>

            {/* Dynamic Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Main Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="mainCategory"
                  required
                  value={formData.mainCategory}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none text-sm bg-white"
                >
                  <option value="">Select Main Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.mainCategory}>
                      {cat.mainCategory}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subcategory / Program <span className="text-red-500">*</span>
                </label>
                <select
                  name="subCategory"
                  required
                  disabled={!formData.mainCategory}
                  value={formData.subCategory}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none text-sm bg-white disabled:bg-gray-100"
                >
                  <option value="">Select Subcategory</option>
                  {selectedCategoryObj?.subCategories?.map((sub) => (
                    <option key={sub._id || sub.name} value={sub.name}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Days Count <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="daysCount"
                  min="1"
                  max="60"
                  required
                  value={formData.daysCount}
                  onChange={handleDaysCountChange}
                  className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {/* 2. Pricing & Highlights */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-[#3d3f96] uppercase tracking-wider flex items-center gap-2">
              <DollarSign size={16} /> 2. Pricing & Nutrition Highlights
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price / Meal (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="pricePerMeal"
                  required
                  value={formData.pricePerMeal}
                  onChange={handleInputChange}
                  placeholder="199"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Disc. Price / Meal (₹)
                </label>
                <input
                  type="number"
                  name="discountPricePerMeal"
                  value={formData.discountPricePerMeal}
                  onChange={handleInputChange}
                  placeholder="149"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Plan Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalPrice"
                  required
                  value={formData.totalPrice}
                  onChange={handleInputChange}
                  placeholder="2985"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Disc. Total Price (₹)
                </label>
                <input
                  type="number"
                  name="discountTotalPrice"
                  value={formData.discountTotalPrice}
                  onChange={handleInputChange}
                  placeholder="2235"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] text-sm outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Max Sodium</label>
                <input
                  type="text"
                  name="maxSodium"
                  value={formData.maxSodium}
                  onChange={handleInputChange}
                  placeholder="< 500mg"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Max Saturated Fat
                </label>
                <input
                  type="text"
                  name="maxSaturatedFat"
                  value={formData.maxSaturatedFat}
                  onChange={handleInputChange}
                  placeholder="< 3.0g"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Avg Calories / Day
                </label>
                <input
                  type="number"
                  name="caloriesAvgPerDay"
                  value={formData.caloriesAvgPerDay}
                  onChange={handleInputChange}
                  placeholder="450"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRepeatAfter7Days"
                  checked={formData.isRepeatAfter7Days}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#3d3f96] rounded"
                />
                Auto-Repeat Cycle after 7 Days
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isPopular"
                  checked={formData.isPopular}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#3d3f96] rounded"
                />
                Popular Plan
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  name="isRecommended"
                  checked={formData.isRecommended}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#3d3f96] rounded"
                />
                Recommended Plan
              </label>
            </div>
          </div>

          {/* 3. Media Uploads */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-[#3d3f96] uppercase tracking-wider flex items-center gap-2">
              <ImageIcon size={16} /> 3. Images & Media
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Image {editPlanData ? '(Optional: Replace)' : '(Required)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#3d3f96] file:text-white hover:file:opacity-90 cursor-pointer"
                />
              </div>

              <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Showcase Images {editPlanData ? '(Optional: Append/Replace)' : '(Required)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleShowcaseImagesChange}
                  className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#3d3f96] file:text-white hover:file:opacity-90 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 4. Day-Wise Schedule Builder (Dynamically filtered by Program Type) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#3d3f96] uppercase tracking-wider flex items-center gap-2">
                <Calendar size={16} /> 4. Day-Wise Schedule ({schedule.length} Days) —{' '}
                <span className="text-gray-500 lowercase">showing: {visibleMealSlots.join(', ')}</span>
              </h3>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
              {schedule.map((day, dIdx) => (
                <div key={day.dayNumber} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="text-sm font-bold text-gray-800">{day.dayName}</span>
                  </div>

                  {/* Meals grid adjusted according to visible meal slots */}
                  <div className={`grid grid-cols-1 md:grid-cols-${visibleMealSlots.length} gap-3`}>
                    {visibleMealSlots.map((meal) => (
                      <div key={meal} className="bg-white p-3 rounded-lg border border-gray-200 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-gray-600">{meal}</span>
                          <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">
                            {day[meal]?.length || 0} Dishes
                          </span>
                        </div>

                        {/* Dish Selector Dropdown */}
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            handleMealDishChange(dIdx, meal, e.target.value);
                            e.target.value = '';
                          }}
                          className="w-full text-xs p-1.5 rounded border border-gray-200 outline-none bg-gray-50"
                        >
                          <option value="">+ Add Dish</option>
                          {allFoods.map((food) => (
                            <option key={food._id} value={food._id}>
                              {food.name} ({food.dietType} - ₹{food.discountPrice || food.price})
                            </option>
                          ))}
                        </select>

                        {/* Selected Dish Pills */}
                        <div className="space-y-1 mt-1">
                          {day[meal]?.map((dishId) => {
                            const dishObj = allFoods.find((f) => f._id === dishId);
                            return (
                              <div
                                key={dishId}
                                className="flex items-center justify-between text-[11px] bg-gray-50 border border-gray-200 px-2 py-1 rounded"
                              >
                                <span className="truncate pr-1 font-medium text-gray-700">
                                  {dishObj ? dishObj.name : dishId}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMealDish(dIdx, meal, dishId)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || loadingInitial}
              className="px-6 py-2.5 rounded-lg bg-[#3d3f96] hover:bg-[#343680] text-white text-sm font-medium transition flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {editPlanData ? 'Update Plan' : 'Publish Plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}