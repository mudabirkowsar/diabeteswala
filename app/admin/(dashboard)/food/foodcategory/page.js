"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Search,
  Pencil,
  Trash2,
  Inbox,
  RefreshCw,
  Loader2,
  HeartPulse,
  Layers,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';
import AddFoodItem from './components/AddFoodItem';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  return `${BASE_SERVER_URL}/${cleanPath}`;
};

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=150";

export default function ManageFoodPage() {
  const [categories, setCategories] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

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

  // --- Fetch Onboarding Requirements (Categories & Therapy Focuses) ---
  const fetchRequirements = async () => {
    try {
      const response = await AdminAPI.getFoodCategories();
      if (response && response.success) {
        const allData = response.data || [];

        // Segment general categories
        const foodCats = allData.filter(item =>
          item.foodCategory !== null &&
          item.foodCategory !== undefined &&
          item.foodCategory !== ""
        );

        // Segment therapy focuses
        const effectCats = allData.filter(item =>
          item.foodEffectCategory !== null &&
          item.foodEffectCategory !== undefined &&
          item.foodEffectCategory !== ""
        );

        setCategories(foodCats);
        setDiseases(effectCats);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load global category indexes.");
    } finally {
      setLoading(false);
    }
  };

  // --- Fetch Food Listings (API queries) ---
  const fetchFoodsList = async () => {
    setLoadingFoods(true);
    try {
      const params = {
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
        ...(selectedDiseaseFilter !== 'All' && { foodEffectCategory: selectedDiseaseFilter })
      };
      const response = await AdminAPI.getAllFoodItems(params);
      if (response && response.success) {
        setFoods(response.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Error retrieving catalog listings.");
    } finally {
      setLoadingFoods(false);
    }
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  useEffect(() => {
    fetchFoodsList();
  }, [searchQuery, selectedDiseaseFilter]);

  // --- Toggle Food availability online state directly on table ---
  const toggleFoodAvailability = async (id) => {
    setTogglingId(id);
    try {
      const response = await AdminAPI.toggleFoodStatus(id);
      if (response && response.success) {
        toast.success(response.message || "Food status updated successfully.");
        
        // Resolve the new boolean state returned from the backend
        const newStatus = response.data?.isActive ?? response.isActive;

        // Update local state immediately for instant feedback
        setFoods(prev => prev.map(f => {
          if (f._id === id) {
            return {
              ...f,
              isActive: newStatus !== undefined ? newStatus : !f.isActive,
              isAvailable: newStatus !== undefined ? newStatus : !f.isAvailable
            };
          }
          return f;
        }));
      } else {
        toast.error("Failed to update item visibility status.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to modify availability state.");
    } finally {
      setTogglingId(null);
    }
  };

  // --- Delete Food Item ---
  const handleDeleteFoodItem = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this food item?")) return;
    try {
      const response = await AdminAPI.deleteFoodItem(id);
      if (response && response.success) {
        toast.success(response.message || "Food item permanently deleted.");
        fetchFoodsList();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove item.");
    }
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

  // Filter items based on local lifestyle toggles (Veg/Egg/Non-Veg)
  const displayFilteredFoods = foods.filter(food => {
    if (food.dietType === "Veg" && !isVegLive) return false;
    if (food.dietType === "Egg" && !isEggLive) return false;
    if (food.dietType === "Non Veg" && !isNonVegLive) return false;
    return true;
  });

  const uncategorizedFoods = displayFilteredFoods.filter(f => {
    const parentId = f.categoryId?._id || f.categoryId;
    return !categories.some(c => c._id === parentId);
  });

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

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none">
      <Toaster position="top-right" />

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
            <BookOpen className="w-7 h-7" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Menu Items</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">Configure global recipes, list clinical food items, and track nutritional values.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-6 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all"
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
            placeholder="Search by food name, ingredients, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" strokeWidth={2.2} />
        </div>

        <div className="flex items-center gap-3 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider whitespace-nowrap">Therapy Focus:</span>
          <select
            value={selectedDiseaseFilter}
            onChange={(e) => setSelectedDiseaseFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="All">🌐 All Profiles / General</option>
            {diseases.map(d => (
              <option key={d._id} value={d.foodEffectCategory}>{d.foodEffectCategory}</option>
            ))}
          </select>
        </div>

        {/* Dietary Switches */}
        <div className="flex flex-wrap gap-4 bg-white p-3 border border-slate-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 px-2">
            {renderTypeSymbol('Veg')}
            <span className="text-xs font-bold text-slate-700">Vegetarian</span>
            <button
              type="button"
              onClick={() => setIsVegLive(!isVegLive)}
              className="focus:outline-none transition-colors duration-200 cursor-pointer"
              title={isVegLive ? "Hide Veg Items" : "Show Veg Items"}
            >
              {isVegLive ? (
                <ToggleRight className="text-emerald-500" size={26} />
              ) : (
                <ToggleLeft className="text-slate-300" size={26} />
              )}
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3 px-2">
            {renderTypeSymbol('Egg')}
            <span className="text-xs font-bold text-slate-700">Eggitarian</span>
            <button
              type="button"
              onClick={() => setIsEggLive(!isEggLive)}
              className="focus:outline-none transition-colors duration-200 cursor-pointer"
              title={isEggLive ? "Hide Eggitarian Items" : "Show Eggitarian Items"}
            >
              {isEggLive ? (
                <ToggleRight className="text-amber-500" size={26} />
              ) : (
                <ToggleLeft className="text-slate-300" size={26} />
              )}
            </button>
          </div>

          <div className="w-px h-6 bg-slate-200" />

          <div className="flex items-center gap-3 px-2">
            {renderTypeSymbol('Non Veg')}
            <span className="text-xs font-bold text-slate-700">Non-Veg</span>
            <button
              type="button"
              onClick={() => setIsNonVegLive(!isNonVegLive)}
              className="focus:outline-none transition-colors duration-200 cursor-pointer"
              title={isNonVegLive ? "Hide Non-Veg Items" : "Show Non-Veg Items"}
            >
              {isNonVegLive ? (
                <ToggleRight className="text-rose-500" size={26} />
              ) : (
                <ToggleLeft className="text-slate-300" size={26} />
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Main Table Display */}
      {loadingFoods ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading dynamic food entries...</p>
        </div>
      ) : displayFilteredFoods.length > 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold bg-slate-50/70 tracking-wider">
                  <th className="py-5 px-6">Food Details</th>
                  <th className="py-5 px-6">Description</th>
                  <th className="py-5 px-6">Pricing</th>
                  <th className="py-5 px-6">Nutrition & Size</th>
                  <th className="py-5 px-6 text-center">Availability</th>
                  <th className="py-5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {categories.map((cat) => {
                  const categoryFoods = displayFilteredFoods.filter(f => {
                    const parentId = f.categoryId?._id || f.categoryId;
                    return parentId === cat._id;
                  });
                  if (categoryFoods.length === 0) return null;
                  return (
                    <React.Fragment key={cat._id}>
                      <tr className="bg-slate-50/80 border-y border-slate-100/60 pointer-events-none">
                        <td colSpan={8} className="py-5 px-6 text-base font-black text-[#3d3f96] tracking-tight border-l-4 border-l-[#3d3f96]">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Layers size={16} /> {cat.foodCategory}</span>
                            <span className="text-[10px] font-extrabold text-slate-400 bg-slate-200/50 px-3 py-1 rounded-full uppercase tracking-widest">
                              {categoryFoods.length} Items
                            </span>
                          </div>
                        </td>
                      </tr>

                      {categoryFoods.map((food) => {
                        const isFoodActive = food.isActive !== undefined ? food.isActive : (food.isAvailable ?? true);
                        return (
                          <tr
                            key={food._id}
                            onClick={() => openEditModal(food)}
                            className={`hover:bg-[#3d3f96]/5 cursor-pointer transition-all duration-150 group ${
                              !isFoodActive ? 'opacity-60 bg-slate-50/40' : ''
                            }`}
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                {renderTypeSymbol(food.dietType)}
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                    <img
                                      src={getMediaUrl(food.imageUrl) || PLACEHOLDER_IMAGE}
                                      alt={food.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                    />
                                  </div>
                                  <div>
                                    <p className="font-bold text-slate-800 text-[13px] leading-snug group-hover:underline">{food.name}</p>
                                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5">
                                      {food.categoryId?.foodCategory || "Healthy Meal"}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="py-5 px-6">
                              <p className="text-slate-500 font-medium leading-relaxed line-clamp-2 max-w-[200px]" title={food.description}>
                                {food.description}
                              </p>
                            </td>
                            <td className="py-5 px-6 font-semibold">
                              <div className="flex items-baseline gap-1.5">
                                <span className="text-slate-900 font-bold font-mono text-[13px]">₹{food.discountPrice || food.price}</span>
                                {food.discountPrice && food.price !== food.discountPrice && (
                                  <span className="text-[11px] text-slate-400 line-through font-mono">₹{food.price}</span>
                                )}
                              </div>
                            </td>
                            <td className="py-5 px-6 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="px-2 py-0.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded font-extrabold text-[10px]">{food.calories} Kcal</span>
                                <span className="text-[10px] text-slate-500 font-bold">Size: {food.servingSize}</span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[155px]" title={Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients}>
                                <strong className="text-slate-500">Ingredients:</strong> {Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients}
                              </p>
                            </td>

                            {/* Toggle Directory Status Button */}
                            <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  disabled={togglingId === food._id}
                                  onClick={() => toggleFoodAvailability(food._id)}
                                  className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                                  title={isFoodActive ? "Set Inactive" : "Set Active"}
                                >
                                  {isFoodActive ? (
                                    <ToggleRight className="text-[#3d3f96]" size={28} />
                                  ) : (
                                    <ToggleLeft className="text-slate-300" size={28} />
                                  )}
                                </button>
                              </div>
                            </td>

                            <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => openEditModal(food)}
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-lg transition-all cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4" strokeWidth={2} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFoodItem(food._id)}
                                  className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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
                      const isFoodActive = food.isActive !== undefined ? food.isActive : (food.isAvailable ?? true);
                      return (
                        <tr
                          key={food._id}
                          onClick={() => openEditModal(food)}
                          className={`hover:bg-[#3d3f96]/5 cursor-pointer transition-all duration-150 group ${
                            !isFoodActive ? 'opacity-60 bg-slate-50/40' : ''
                          }`}
                        >
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-3">
                              {renderTypeSymbol(food.dietType)}
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                                  <img
                                    src={getMediaUrl(food.imageUrl) || PLACEHOLDER_IMAGE}
                                    alt={food.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                  />
                                </div>
                                <div>
                                  <p className="font-bold text-slate-800 text-[13px] leading-snug group-hover:underline">{food.name}</p>
                                  <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mt-1.5">
                                    {food.categoryId?.foodCategory || "Uncategorized"}
                                  </p>
                                </div>
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
                              <span className="text-slate-900 font-bold font-mono text-[13px]">₹{food.discountPrice || food.price}</span>
                              {food.discountPrice && food.price !== food.discountPrice && (
                                <span className="text-[11px] text-slate-400 line-through font-mono">₹{food.price}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-5 px-6 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 bg-[#3d3f96]/5 text-[#3d3f96] rounded font-extrabold text-[10px]">{food.calories} Kcal</span>
                              <span className="text-[10px] text-slate-500 font-bold">Size: {food.servingSize}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-semibold truncate max-w-[155px]" title={Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients}>
                              <strong className="text-slate-500">Ingredients:</strong> {Array.isArray(food.ingredients) ? food.ingredients.join(', ') : food.ingredients}
                            </p>
                          </td>

                          {/* Toggle Directory Status Button */}
                          <td className="py-5 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-center">
                              <button
                                type="button"
                                disabled={togglingId === food._id}
                                onClick={() => toggleFoodAvailability(food._id)}
                                className="focus:outline-none transition-colors duration-200 cursor-pointer inline-flex items-center justify-center disabled:opacity-50"
                                title={isFoodActive ? "Set Inactive" : "Set Active"}
                              >
                                {isFoodActive ? (
                                  <ToggleRight className="text-[#3d3f96]" size={28} />
                                ) : (
                                  <ToggleLeft className="text-slate-300" size={28} />
                                )}
                              </button>
                            </div>
                          </td>

                          <td className="py-5 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(food)}
                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-[#3d3f96] hover:bg-[#3d3f96]/5 rounded-lg transition-all cursor-pointer"
                              >
                                <Pencil className="w-4 h-4" strokeWidth={2} />
                              </button>
                              <button
                                onClick={() => handleDeleteFoodItem(food._id)}
                                className="p-1.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
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
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-white rounded-3xl border border-slate-200">
          <Inbox className="w-12 h-12 text-slate-300 mb-3" />
          <p className="font-bold text-slate-700">No Food Items Found</p>
          <p className="text-xs text-slate-400 mt-1">There are no culinary dishes matching your active criteria.</p>
        </div>
      )}

      <AddFoodItem 
        isOpen={isFoodModalOpen}
        onClose={() => setIsFoodModalOpen(false)}
        mode={modalMode}
        editingFood={selectedFoodForEdit}
        categories={categories}
        diseases={diseases}
        onSubmit={fetchFoodsList}
      />

    </div>
  );
}