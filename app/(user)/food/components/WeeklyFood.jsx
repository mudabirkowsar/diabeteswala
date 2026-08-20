"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Clock,
  Flame,
  X,
  RefreshCw,
  Loader2,
  Utensils,
  Layers,
  Sparkles,
  ShoppingBag,
  Check
} from 'lucide-react';

// Import your API service functions & Notification Context
import UserAPI from '../../../services/UserAPI';
import { useNotification } from '../../../context/NotificationContext';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400";

const WEEKDAYS = [
  { key: 'monday', label: 'Monday', short: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', short: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', short: 'Wed' },
  { key: 'thursday', label: 'Thursday', short: 'Thu' },
  { key: 'friday', label: 'Friday', short: 'Fri' },
  { key: 'saturday', label: 'Saturday', short: 'Sat' },
  { key: 'sunday', label: 'Sunday', short: 'Sun' }
];

export default function WeeklyFood() {
  const { showNotification } = useNotification();

  // --- Data States ---
  const [weeklyMenu, setWeeklyMenu] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Filter States ---
  const [selectedWeeklyDay, setSelectedWeeklyDay] = useState('monday');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietType, setSelectedDietType] = useState('All'); // 'All', 'Veg', 'Egg', 'Non Veg'

  // --- Modal State --- 
  const [selectedMeal, setSelectedMeal] = useState(null);

  // --- Fetch Weekly Menu ---
  const fetchWeeklyContent = async () => {
    setLoading(true);
    try {
      const response = await UserAPI.getUserFoodPageWeeklyMenu();
      if (response && response.success) {
        setWeeklyMenu(response.data || []);
      } else {
        if (showNotification) {
          showNotification("Could not load weekly tiffin plan.", "error");
        }
      }
    } catch (err) {
      console.error("Error fetching weekly menu planner:", err);
      if (showNotification) {
        showNotification(err.message || "Unable to load weekly schedule.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyContent();
  }, []);

  // --- Helper: Render Diet Badge ---
  const renderDietBadge = (type) => {
    const isVeg = type === 'Veg';
    const isEgg = type === 'Egg';
    const isNonVeg = type === 'Non Veg';

    return (
      <div
        className={`w-4 h-4 border-2 rounded flex items-center justify-center p-[2px] shrink-0 bg-white/95 shadow-sm ${isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
          }`}
        title={type}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
            }`}
        />
      </div>
    );
  };

  // Find active meals for the selected weekday
  const currentDayData = weeklyMenu.find(
    d => d.dayOfWeek?.toLowerCase() === selectedWeeklyDay.toLowerCase()
  );

  const activeMeals = (currentDayData?.meals || []).filter(meal => {
    const nameMatch = meal.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = searchQuery.trim() === '' || nameMatch;
    const matchesDiet = selectedDietType === 'All' || meal.dietType === selectedDietType;
    return matchesSearch && matchesDiet;
  });

  return (
    <div className="min-h-screen bg-[#f8fbff] py-8 px-4 sm:px-6 lg:px-10 max-w-[1600px] mx-auto space-y-10 antialiased">

      {/* --- FILTERS & WEEKDAY SELECTOR --- */}
      <div className="space-y-4">

        {/* Search & Diet Type Row */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_25px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder={`Search ${selectedWeeklyDay.toUpperCase()} dishes...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] focus:bg-white transition-all shadow-inner"
            />
          </div>

          <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-100">
            {['All', 'Veg', 'Egg', 'Non Veg'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedDietType(type)}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${selectedDietType === type
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60 font-black'
                    : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Weekday Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
          {WEEKDAYS.map((day) => {
            const dayData = weeklyMenu.find(d => d.dayOfWeek?.toLowerCase() === day.key);
            const count = dayData?.meals?.length || 0;
            const isSelected = selectedWeeklyDay === day.key;

            return (
              <button
                key={day.key}
                onClick={() => setSelectedWeeklyDay(day.key)}
                className={`flex-1 min-w-[110px] sm:min-w-[140px] p-4 rounded-3xl border transition-all cursor-pointer text-center ${isSelected
                    ? 'bg-[#3d3f96] text-white border-[#3d3f96] shadow-lg shadow-indigo-900/15 scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50 hover:border-slate-200'
                  }`}
              >
                <span className="block text-xs sm:text-sm font-black uppercase tracking-wider">{day.label}</span>
                <span className={`text-[10px] font-bold mt-1 block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {count} {count === 1 ? 'Meal' : 'Meals'}
                </span>
              </button>
            );
          })}
        </div>

      </div>

      {/* --- WEEKDAY DISHES GRID --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading weekly tiffin cycle...</p>
        </div>
      ) : activeMeals.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm border-dashed">
          <Utensils size={44} className="mx-auto text-slate-200 mb-3" />
          <p className="text-base font-bold text-slate-700">No dishes scheduled for {selectedWeeklyDay.toUpperCase()}.</p>
          <p className="text-xs text-slate-400 mt-1">Select another day or adjust your active diet filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-left">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight capitalize">
                {selectedWeeklyDay} Tiffin Menu ({activeMeals.length})
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Standard recurring meal deliveries scheduled for every {selectedWeeklyDay}.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeMeals.map((meal) => (
              <div
                key={meal._id}
                onClick={() => setSelectedMeal(meal)}
                className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between group cursor-pointer"
              >
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={getMediaUrl(meal.imageUrl) || PLACEHOLDER_IMAGE}
                    alt={meal.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3.5 left-3.5">{renderDietBadge(meal.dietType)}</div>
                  <span className="absolute bottom-3.5 left-4 text-white text-lg font-black font-mono">
                    ₹{meal.price}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-left">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-1 group-hover:text-[#3d3f96] transition-colors">
                      {meal.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                      Recurring {selectedWeeklyDay.toUpperCase()} subscription course
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <span className="flex items-center gap-1.5 font-mono">
                      <Flame size={13} className="text-amber-500" /> {meal.calories || 0} Kcal
                    </span>
                    <span className="text-[#3d3f96] font-black">Standard Tiffin</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL: MEAL DETAIL INSPECTION OVERLAY --- */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden text-left">
            <button
              onClick={() => setSelectedMeal(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="space-y-6">
              <div className="relative h-60 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                <img
                  src={getMediaUrl(selectedMeal.imageUrl) || PLACEHOLDER_IMAGE}
                  alt={selectedMeal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />
                <div className="absolute top-4 left-4">{renderDietBadge(selectedMeal.dietType)}</div>
              </div>

              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedMeal.name}</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase mt-0.5">
                    Scheduled for every {selectedWeeklyDay}
                  </p>
                </div>
                <span className="text-2xl font-black text-slate-900 font-mono">
                  ₹{selectedMeal.price}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Estimated Energy</span>
                  <strong className="text-sm text-slate-800 font-mono">{selectedMeal.calories || 0} Kcal</strong>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Portion Size</span>
                  <strong className="text-sm text-slate-800 font-mono">1 Person</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}