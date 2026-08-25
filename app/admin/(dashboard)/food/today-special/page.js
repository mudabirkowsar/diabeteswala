"use client";

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Calendar,
  Search,
  Plus,
  Trash2,
  Check,
  X,
  Loader2,
  RefreshCw,
  Edit3,
  Utensils,
  Flame,
  Layers,
  HeartPulse
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=300";

const WEEKDAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export default function TiffinMenuPlanner() {
  const [activeTab, setActiveTab] = useState('today'); // 'today' or 'weekly'

  // --- Data States ---
  const [todaysSpecials, setTodaysSpecials] = useState([]);
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [masterCatalog, setMasterCatalog] = useState([]);

  // --- Loading States ---
  const [loadingToday, setLoadingToday] = useState(true);
  const [loadingWeekly, setLoadingWeekly] = useState(true);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Modal & Search States ---
  const [isTodaySelectorOpen, setIsTodaySelectorOpen] = useState(false);
  const [selectedTodayFoodIds, setSelectedTodayFoodIds] = useState([]);
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const [editingDay, setEditingDay] = useState(null); // 'monday', 'tuesday', etc.
  const [selectedDayFoodIds, setSelectedDayFoodIds] = useState([]);

  // --- 1. Fetch Today's Specials ---
  const fetchTodaySpecials = async () => {
    setLoadingToday(true);
    try {
      const response = await AdminAPI.getTodaysSpecials();
      if (response && response.success) {
        setTodaysSpecials(response.data || []);
      } else {
        toast.error("Failed to load today's specials.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error reading today's specials.");
    } finally {
      setLoadingToday(false);
    }
  };

  // --- 2. Fetch Weekly Menu Template ---
  const fetchWeeklyMenu = async () => {
    setLoadingWeekly(true);
    try {
      const response = await AdminAPI.getWeeklyMenuTemplate();
      if (response && response.success) {
        setWeeklyMenu(response.data || []);
      } else {
        toast.error("Failed to load weekly menu template.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error reading weekly menu.");
    } finally {
      setLoadingWeekly(false);
    }
  };

  // --- 3. Fetch Master Food Catalog ---
  const fetchMasterCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const response = await AdminAPI.getAllFoodItems();
      if (response && response.success) {
        setMasterCatalog(response.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load food inventory catalog.");
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchTodaySpecials();
    fetchWeeklyMenu();
    fetchMasterCatalog();
  }, []);

  // --- Open Today's Specials Selector Modal ---
  const openTodaySelector = () => {
    // Pre-select the food item IDs currently in today's specials
    const currentIds = todaysSpecials
      .map(item => item.foodItemId?._id || item.foodItemId)
      .filter(Boolean);
    setSelectedTodayFoodIds(currentIds);
    setModalSearchQuery('');
    setIsTodaySelectorOpen(true);
  };

  // Toggle selection for Today's Specials inside modal
  const handleToggleTodaySelection = (foodId) => {
    setSelectedTodayFoodIds(prev =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  };

  // --- Publish Today's Specials (Bulk Save) ---
  const handlePublishTodaySpecials = async () => {
    setActionLoading(true);
    try {
      const payload = {
        foodItemIds: selectedTodayFoodIds
      };
      const response = await AdminAPI.publishTodaysSpecials(payload);
      if (response && response.success) {
        toast.success(response.message || "Today's specials published successfully.");
        setIsTodaySelectorOpen(false);
        fetchTodaySpecials();
      } else {
        toast.error("Failed to publish specials.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error publishing today's specials.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Remove Single Today's Special ---
  const handleRemoveTodaySpecial = async (specialDocId) => {
    setActionLoading(true);
    try {
      const response = await AdminAPI.removeTodaysSpecial(specialDocId);
      if (response && response.success) {
        toast.success(response.message || "Item removed from today's specials.");
        // Optimistically update list
        setTodaysSpecials(prev => prev.filter(item => item._id !== specialDocId));
      } else {
        toast.error("Failed to remove special.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error removing special item.");
    } finally {
      setActionLoading(false);
    }
  };

  // --- Open Weekly Day Edit Modal ---
  const openDayEditModal = (dayKey) => {
    setEditingDay(dayKey);
    const existingDayPlan = weeklyMenu.find(
      d => d.dayOfWeek?.toLowerCase() === dayKey.toLowerCase()
    );
    const currentMeals = existingDayPlan?.meals || [];
    const currentIds = currentMeals.map(m => m._id || m).filter(Boolean);
    setSelectedDayFoodIds(currentIds);
    setModalSearchQuery('');
  };

  // Toggle selection for a specific weekday menu
  const handleToggleDaySelection = (foodId) => {
    setSelectedDayFoodIds(prev =>
      prev.includes(foodId) ? prev.filter(id => id !== foodId) : [...prev, foodId]
    );
  };

  // --- Save Day Menu Template ---
  const handleSaveDayMenu = async (e) => {
    e.preventDefault();
    if (!editingDay) return;

    setActionLoading(true);
    try {
      const payload = {
        foodItemIds: selectedDayFoodIds
      };
      const response = await AdminAPI.updateWeeklyDayMenu(editingDay.toLowerCase(), payload);
      if (response && response.success) {
        toast.success(response.message || `${editingDay.toUpperCase()} menu template updated.`);
        setEditingDay(null);
        fetchWeeklyMenu();
      } else {
        toast.error("Failed to update weekday menu.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving weekday schedule.");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter master catalog items inside modals
  const filteredCatalog = masterCatalog.filter(food => {
    const query = modalSearchQuery.toLowerCase();
    const nameMatch = food.name?.toLowerCase().includes(query);
    const catMatch = food.categoryId?.foodCategory?.toLowerCase().includes(query);
    const effectMatch = food.foodEffectCategory?.toLowerCase().includes(query);
    return nameMatch || catMatch || effectMatch;
  });

  const renderDietBadge = (type) => {
    const colors = {
      Veg: 'bg-emerald-500',
      'Non Veg': 'bg-rose-500',
      Egg: 'bg-amber-500'
    };
    return (
      <span className={`inline-flex items-center text-[10px] font-extrabold px-2 py-0.5 rounded-md text-white shadow-sm ${colors[type] || 'bg-slate-500'}`}>
        {type || 'Veg'}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto py-4 pb-12 antialiased select-none">
      <Toaster position="top-right" />

      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-[#3d3f96]" /> Daily & Weekly Menu Planner
          </h1>
          <p className="text-xs text-slate-500 font-bold mt-1">
            Configure repeating 7-day recurring tiffin cycles and publish today's live recommendations.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200/60 self-start sm:self-auto shadow-inner">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'today'
                ? 'bg-white text-[#3d3f96] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Sparkles size={14} /> Today's Specials Setup
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${activeTab === 'weekly'
                ? 'bg-white text-[#3d3f96] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Calendar size={14} /> Weekly Menu Planner
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: TODAY'S SPECIALS ACTIVE SETUP
          ========================================================================= */}
      {activeTab === 'today' ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="text-[#3d3f96]" size={18} /> Today's Featured Recommendations ({todaysSpecials.length})
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Dishes actively featured on the user mobile storefront under Today's Specials.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchTodaySpecials}
                disabled={loadingToday}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all cursor-pointer"
                title="Refresh specials"
              >
                <RefreshCw size={13} className={loadingToday ? "animate-spin" : ""} /> Refresh
              </button>
              <button
                onClick={openTodaySelector}
                className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={14} /> SELECT TODAY'S SPECIALS
              </button>
            </div>
          </div>

          {/* ACTIVE SPECIALS PHOTO CARDS GRID */}
          {loadingToday ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Today's specials...</p>
            </div>
          ) : todaysSpecials.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-100 rounded-3xl shadow-sm border-dashed">
              <Sparkles size={40} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">No active specials configured for today.</p>
              <p className="text-xs text-slate-400 mt-1">Click the button above to choose dishes from your catalog.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {todaysSpecials.map((special) => {
                const meal = special.foodItemId || {};
                return (
                  <div
                    key={special._id}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden relative group"
                  >
                    <div className="relative h-44 w-full overflow-hidden bg-slate-100">
                      <img
                        src={getMediaUrl(meal.imageUrl) || PLACEHOLDER_IMAGE}
                        alt={meal.name || "Dish"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3">{renderDietBadge(meal.dietType)}</div>
                      {meal.foodEffectCategory && (
                        <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[#3d3f96] px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider">
                          {meal.foodEffectCategory}
                        </span>
                      )}
                      <span className="absolute bottom-3 left-4 text-white text-lg font-black font-mono">
                        ₹{meal.discountPrice || meal.price || 0}
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1" title={meal.name}>
                          {meal.name || "Unnamed Dish"}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2" title={meal.description}>
                          {meal.description || "No recipe description provided."}
                        </p>
                      </div>

                      {/* Nutrition Badges */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl text-center text-[10px] border border-slate-100">
                        <div>
                          <span className="block text-slate-400 font-bold uppercase">Energy</span>
                          <strong className="text-slate-700 font-mono">{meal.calories || 0} Kcal</strong>
                        </div>
                        <div>
                          <span className="block text-slate-400 font-bold uppercase">Time</span>
                          <strong className="text-emerald-600 font-mono">{meal.prepTime || 0}</strong>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveTodaySpecial(special._id)}
                        disabled={actionLoading}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={13} /> Remove Special
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* =========================================================================
            TAB 2: WEEKLY RECURRING MENU CALENDAR GRID
            ========================================================================= */
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="text-[#3d3f96]" size={18} /> 7-Day Repeating Schedule Matrix
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Configure default repeating menus for subscription tiffin deliveries.
              </p>
            </div>

            <button
              onClick={fetchWeeklyMenu}
              disabled={loadingWeekly}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all cursor-pointer"
            >
              <RefreshCw size={13} className={loadingWeekly ? "animate-spin" : ""} /> Refresh Weekly Cycle
            </button>
          </div>

          {loadingWeekly ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-sm">
              <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={36} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading 7-day calendar matrix...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {WEEKDAYS.map((day) => {
                const dayData = weeklyMenu.find(
                  d => d.dayOfWeek?.toLowerCase() === day.key.toLowerCase()
                );
                const meals = dayData?.meals || [];

                return (
                  <div
                    key={day.key}
                    className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-200"
                  >
                    <div className="p-5 space-y-4 flex-1 text-left">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <h3 className="font-extrabold text-slate-900 text-base leading-none capitalize">
                          {day.label}
                        </h3>
                        <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {meals.length} Meals
                        </span>
                      </div>

                      {/* Day Meals Thumbnails List */}
                      {meals.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200/60">
                          <p className="text-xs text-slate-400 font-semibold italic">No dishes mapped for {day.label}</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden">
                          {meals.map((meal) => (
                            <div
                              key={meal._id}
                              className="flex gap-3 items-center p-2 rounded-2xl bg-slate-50/70 border border-slate-100/60"
                            >
                              <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                                <img
                                  src={getMediaUrl(meal.imageUrl) || PLACEHOLDER_IMAGE}
                                  alt={meal.name || "Dish"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                                />
                              </div>
                              <div className="truncate flex-1">
                                <p className="text-xs font-bold text-slate-800 leading-snug truncate" title={meal.name}>
                                  {meal.name}
                                </p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 font-mono">
                                  ₹{meal.price} • {meal.calories || 0} Kcal
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Edit Day Trigger */}
                    <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 text-right">
                      <button
                        onClick={() => openDayEditModal(day.key)}
                        className="px-4 py-2 text-xs font-bold text-[#3d3f96] hover:bg-[#3d3f96]/10 border border-[#3d3f96]/20 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full"
                      >
                        <Edit3 size={13} /> Edit {day.label} Menu
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          MODAL 1: TODAY'S SPECIALS SELECTION CONSOLE (Master Catalog Grid)
          ========================================================================= */}
      {isTodaySelectorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-5xl w-full max-h-[90vh] shadow-2xl relative p-6 sm:p-8 flex flex-col justify-between text-left">

            <button
              onClick={() => setIsTodaySelectorOpen(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <div className="mb-4 pb-4 border-b border-slate-100">
                <span className="text-[10px] bg-indigo-50 text-[#3d3f96] font-black uppercase px-2.5 py-1 rounded-md">
                  Inventory Console
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1.5">
                  Select Today's Active Specials ({selectedTodayFoodIds.length} Selected)
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Click dishes to toggle their inclusion in today's published storefront recommendations.
                </p>
              </div>

              {/* Search Inside Modal */}
              <div className="relative w-full mb-4">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog by name, category, or focus..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 max-h-[50vh] pb-4 [&::-webkit-scrollbar]:hidden">
              {loadingCatalog ? (
                <div className="col-span-full py-16 text-center">
                  <Loader2 className="animate-spin text-[#3d3f96] mx-auto mb-2" size={28} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading catalog dishes...</p>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold">
                  No dishes found matching your query.
                </div>
              ) : (
                filteredCatalog.map((food) => {
                  const isSelected = selectedTodayFoodIds.includes(food._id);
                  return (
                    <div
                      key={food._id}
                      onClick={() => handleToggleTodaySelection(food._id)}
                      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between bg-white relative group ${isSelected
                          ? 'border-[#3d3f96] ring-4 ring-indigo-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                        <img
                          src={getMediaUrl(food.imageUrl) || PLACEHOLDER_IMAGE}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-3 text-white text-xs font-black font-mono">
                          ₹{food.discountPrice || food.price}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 bg-[#3d3f96] text-white p-1 rounded-full shadow-md z-20">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1" title={food.name}>
                            {food.name}
                          </h4>
                          {renderDietBadge(food.dietType)}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-400">
                          <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono">{food.calories || 0} Kcal</span>
                          {food.foodEffectCategory && (
                            <span className="bg-indigo-50 text-[#3d3f96] px-2 py-0.5 rounded border border-indigo-100/40">
                              {food.foodEffectCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTodaySelectorOpen(false)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishTodaySpecials}
                disabled={actionLoading}
                className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                Publish Specials ({selectedTodayFoodIds.length})
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: WEEKLY DAY MENU EDITOR MODAL (7-Day Template Mapping)
          ========================================================================= */}
      {editingDay && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-5xl w-full max-h-[90vh] shadow-2xl relative p-6 sm:p-8 flex flex-col justify-between text-left">

            <button
              onClick={() => setEditingDay(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div>
              <div className="mb-4 pb-4 border-b border-slate-100">
                <span className="text-[10px] bg-indigo-50 text-[#3d3f96] font-black uppercase px-2.5 py-1 rounded-md">
                  Weekly Template Matrix
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-1.5 capitalize">
                  Configure Schedule: {editingDay} ({selectedDayFoodIds.length} Meals Selected)
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                  Select dishes to automatically recur on {editingDay.toUpperCase()} during subscription cycles.
                </p>
              </div>

              {/* Search Inside Modal */}
              <div className="relative w-full mb-4">
                <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search catalog dishes..."
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96]"
                />
              </div>
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1 max-h-[50vh] pb-4 [&::-webkit-scrollbar]:hidden">
              {loadingCatalog ? (
                <div className="col-span-full py-16 text-center">
                  <Loader2 className="animate-spin text-[#3d3f96] mx-auto mb-2" size={28} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading catalog...</p>
                </div>
              ) : filteredCatalog.length === 0 ? (
                <div className="col-span-full py-12 text-center text-slate-400 text-xs font-bold">
                  No dishes found matching your search.
                </div>
              ) : (
                filteredCatalog.map((food) => {
                  const isSelected = selectedDayFoodIds.includes(food._id);
                  return (
                    <div
                      key={food._id}
                      onClick={() => handleToggleDaySelection(food._id)}
                      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between bg-white relative group ${isSelected
                          ? 'border-[#3d3f96] ring-4 ring-indigo-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <div className="relative h-28 w-full overflow-hidden bg-slate-100">
                        <img
                          src={getMediaUrl(food.imageUrl) || PLACEHOLDER_IMAGE}
                          alt={food.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <span className="absolute bottom-2 left-3 text-white text-xs font-black font-mono">
                          ₹{food.discountPrice || food.price}
                        </span>
                        {isSelected && (
                          <span className="absolute top-2 right-2 bg-[#3d3f96] text-white p-1 rounded-full shadow-md z-20">
                            <Check size={14} strokeWidth={3} />
                          </span>
                        )}
                      </div>

                      <div className="p-3">
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="font-extrabold text-slate-900 text-xs line-clamp-1" title={food.name}>
                            {food.name}
                          </h4>
                          {renderDietBadge(food.dietType)}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-[9px] font-black text-slate-400">
                          <span className="bg-slate-50 px-2 py-0.5 rounded border border-slate-100 font-mono">{food.calories || 0} Kcal</span>
                          {food.foodEffectCategory && (
                            <span className="bg-indigo-50 text-[#3d3f96] px-2 py-0.5 rounded border border-indigo-100/40">
                              {food.foodEffectCategory}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Actions */}
            <form onSubmit={handleSaveDayMenu} className="border-t border-slate-100 pt-4 mt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingDay(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-6 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs transition shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50 capitalize"
              >
                {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Check size={14} />}
                Save {editingDay} Schedule
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}