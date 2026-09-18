"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Flame,
  Utensils,
  Tag,
  ShoppingBag,
  AlertCircle,
  Loader2,
  Bookmark,
  Layers,
  Trash2,
  Star,
  MapPin,
  Sparkles,
} from 'lucide-react';

// Import your API service functions, Notification Context & Cart Context
import UserAPI from '../../../../services/UserAPI';
import { useNotification } from '../../../../context/NotificationContext';
import { useCart } from '../../../../context/CartContext';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";
const KITCHEN_PLACEHOLDER = "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=200";

export default function SingleMealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { showNotification } = useNotification();
  const { foodCart, addToFoodCart, removeFoodCartItem } = useCart();

  const mealId = params?.id;

  // --- Data States ---
  const [meal, setMeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  // --- Fetch Meal Details by ID ---
  useEffect(() => {
    if (!mealId) return;

    const loadMealDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await UserAPI.getSinglComboDetailsById(mealId);
        if (response && response.success) {
          setMeal(response.data || null);
        } else {
          setError("Unable to find matching meal details.");
        }
      } catch (err) {
        console.error("Error fetching single meal detail:", err);
        setError("Failed to retrieve meal monograph.");
        if (showNotification) {
          showNotification(err.response?.data?.message || "Unable to fetch meal details.", "error");
        }
      } finally {
        setLoading(false);
      }
    };

    loadMealDetails();
  }, [mealId, showNotification]);

  // --- Helper: Render Diet Badge ---
  const renderDietBadge = (type) => {
    const isVeg = type === 'Veg';
    const isEgg = type === 'Egg';
    const isNonVeg = type === 'Non Veg';

    return (
      <div
        className={`w-4 h-4 border-2 rounded-md flex items-center justify-center p-[2px] shrink-0 bg-white shadow-xs ${
          isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
        }`}
        title={type}
      >
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
          }`}
        />
      </div>
    );
  };

  // Check if this combo package is already in the user's food cart
  const cartItem = foodCart?.items?.find(item => (item.itemId?._id || item.itemId) === mealId);
  const isItemInCart = !!cartItem;

  // --- Remove Specific Item ---
  const handleRemoveItem = async () => {
    if (!meal) return;
    setAddingToCart(true);
    try {
      const response = await removeFoodCartItem(meal._id);
      if (response && response.success) {
        if (showNotification) {
          showNotification("Combo deal removed from your tray.", "success");
        }
      }
    } catch (err) {
      console.error("Error removing item:", err);
      if (showNotification) {
        showNotification("Failed to remove combo deal.", "error");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // --- Add to Cart / Order Action ---
  const handleAddToCart = async () => {
    if (!meal) return;
    setAddingToCart(true);
    try {
      const payload = {
        foodId: meal.vendorId?._id || meal.vendorId,
        itemId: meal._id,
        quantity: quantity
      };
      const response = await addToFoodCart(payload);
      if (response && response.success) {
        if (showNotification) {
          showNotification(response.message || `${meal.name} added to tray successfully!`, "success");
        }
        // Redirect user to food cart on success
        router.push('/otherscreens/carts/foodcart');
      }
    } catch (err) {
      console.error("Error adding combo to cart:", err);
      if (showNotification) {
        showNotification(err.response?.data?.message || "Failed to update food cart.", "error");
      }
    } finally {
      setAddingToCart(false);
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 antialiased">
        <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={40} />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
          Assembling culinary monograph...
        </p>
      </div>
    );
  }

  // --- Error / Not Found State ---
  if (error || !meal) {
    return (
      <div className="min-h-screen bg-[#f8fbff] flex flex-col items-center justify-center p-6 text-center antialiased">
        <AlertCircle className="text-rose-500 mb-4" size={48} />
        <h1 className="text-xl font-black text-slate-800">Dish Monograph Unavailable</h1>
        <p className="text-slate-500 text-xs font-medium mt-1 max-w-sm">
          {error || "The food item ID was not recognized or is no longer listed."}
        </p>
        <button
          onClick={() => router.back()}
          className="mt-6 inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#2d2f75] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-indigo-950/10"
        >
          <ArrowLeft size={14} /> Back to Food Discovery
        </button>
      </div>
    );
  }

  // Safely extract banner image from the first child item with a valid image
  const bannerImage = meal.dishes?.find(d => d.foodServiceId?.imageUrl)?.foodServiceId?.imageUrl || null;
  const firstDish = meal.dishes?.[0]?.foodServiceId || {};
  const dietType = firstDish.dietType || "Veg";
  const vendor = meal.vendorId || {};

  const isAvailable = meal.isAvailable !== false && !meal.UnavailableCombo;

  const discountPct = meal.basePrice && meal.comboPrice && meal.basePrice > meal.comboPrice
    ? Math.round(((meal.basePrice - meal.comboPrice) / meal.basePrice) * 100)
    : 0;

  // Aggregate total calories dynamically from child items
  const totalCalories = (meal.dishes || []).reduce(
    (acc, curr) => acc + ((curr.foodServiceId?.calories || 0) * (curr.quantity || 1)),
    0
  );

  const totalDishUnits = (meal.dishes || []).reduce(
    (acc, curr) => acc + (curr.quantity || 1),
    0
  );

  // Helper to format individual ingredients safely (handles both Object and String formats)
  const formatSingleIngredient = (ing) => {
    if (typeof ing === 'object' && ing !== null) {
      return {
        name: ing.name || '',
        quantity: ing.quantity || '',
        calories: ing.calories !== undefined ? ing.calories : null
      };
    }
    return { name: String(ing), quantity: '', calories: null };
  };

  // Aggregate all ingredients safely across dishes and remove duplicate names
  const rawIngredients = (meal.dishes || []).flatMap(d => d.foodServiceId?.ingredients || []);
  const aggregatedIngredientsMap = new Map();
  rawIngredients.forEach(item => {
    const formatted = formatSingleIngredient(item);
    if (formatted.name && !aggregatedIngredientsMap.has(formatted.name.toLowerCase())) {
      aggregatedIngredientsMap.set(formatted.name.toLowerCase(), formatted);
    }
  });
  const aggregatedIngredients = Array.from(aggregatedIngredientsMap.values());

  // Aggregate tags safely
  const aggregatedTags = Array.from(new Set(
    (meal.dishes || []).flatMap(d => d.foodServiceId?.tags || [])
  ));

  return (
    <main className="min-h-screen bg-[#f8fbff] py-8 sm:py-12 antialiased select-none text-slate-800">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-10 space-y-8">

        {/* --- TOP BACK BAR --- */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-[#3d3f96] hover:text-[#2d2f75] font-black text-xs uppercase tracking-wider transition-colors cursor-pointer bg-white px-4 py-2 rounded-2xl border border-slate-100 shadow-sm"
          >
            <ArrowLeft size={14} className="stroke-[2.5]" />
            Back to Menu
          </button>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl">
              Combo Offer ID: {meal.comboId || "CMB"}
            </span>
          </div>
        </div>

        {/* --- SECTION 1: PRIMARY DETAILS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start text-left">

          {/* Left Column: Media Presentation */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-3 sm:p-4 shadow-sm relative overflow-hidden">
              <div className="relative h-80 sm:h-96 rounded-[2rem] overflow-hidden bg-slate-100 flex items-center justify-center">
                <img
                  src={getMediaUrl(bannerImage) || PLACEHOLDER_IMAGE}
                  alt={meal.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                />

                {/* Diet Type Badge Overlay */}
                <div className="absolute top-4 left-4 z-20">
                  {renderDietBadge(dietType)}
                </div>

                {/* Proximity Availability Block */}
                {!isAvailable && (
                  <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[1.5px] flex items-center justify-center z-10">
                    <span className="bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl shadow-lg border border-rose-500/50">
                      Not Available Near You
                    </span>
                  </div>
                )}

                {/* Savings Tag */}
                {discountPct > 0 && (
                  <div className="absolute bottom-4 left-4 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl shadow-md z-20">
                    Save {discountPct}% Off
                  </div>
                )}
              </div>
            </div>

            {/* Partner Cloud Kitchen Details */}
            {vendor.name && (
              <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-slate-50 border border-slate-200/60 overflow-hidden shrink-0">
                    <img
                      src={getMediaUrl(vendor.profileImage) || KITCHEN_PLACEHOLDER}
                      alt={vendor.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = KITCHEN_PLACEHOLDER; }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-wide">Prepared By</p>
                    <p className="text-xs font-black text-slate-800">{vendor.name}</p>
                    {vendor.address && (
                      <p className="text-[10px] text-slate-400 font-medium truncate max-w-[180px]">{vendor.address}</p>
                    )}
                  </div>
                </div>
                {vendor.rating !== undefined && (
                  <span className="flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-xl text-xs font-extrabold">
                    <Star size={13} className="fill-amber-500 text-amber-500" /> {vendor.rating || '0.0'}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Attributes & Action Panel */}
          <div className="lg:col-span-7 space-y-6">

            <div>
              {/* Category & Status Pills */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full text-[10px] font-black text-indigo-700 uppercase tracking-widest">
                  <Bookmark size={10} className="fill-indigo-500 text-indigo-600" />
                  Combo Bundle Offer
                </span>

                {meal.isPopular && (
                  <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                    <Sparkles size={11} className="text-amber-500" /> Popular
                  </span>
                )}

                {meal.isRecommended && (
                  <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide">
                    Recommended
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {meal.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-slate-900 font-mono">
                    ₹{meal.comboPrice || meal.basePrice}
                  </span>
                  {meal.comboPrice && meal.basePrice !== meal.comboPrice && (
                    <span className="text-base text-slate-400 line-through font-mono font-bold">
                      ₹{meal.basePrice}
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold text-slate-400">• Taxes & Packing Included</span>

                {meal.distanceText && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-bold bg-white border border-slate-200/80 px-2.5 py-1 rounded-xl shadow-xs">
                    <MapPin size={12} className="text-[#3d3f96]" /> {meal.distanceText}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {meal.description && (
              <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-1.5">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Nutritional Combo Monograph
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {meal.description}
                </p>
              </div>
            )}

            {/* Core Metrics Bar */}
            <div className="grid grid-cols-3 gap-3 bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-center">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Total Energy</span>
                <span className="text-sm sm:text-base font-black text-slate-800 font-mono flex items-center justify-center gap-1">
                  <Flame size={14} className="text-amber-500" /> {totalCalories || 0} Kcal
                </span>
              </div>
              <div className="space-y-0.5 border-l border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Spicy Level</span>
                <span className="text-xs sm:text-sm font-black text-slate-700 block pt-0.5 truncate px-1">
                  {meal.spicyLevel || "Medium"}
                </span>
              </div>
              <div className="space-y-0.5 border-l border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Total Items</span>
                <span className="text-sm sm:text-base font-black text-slate-800 font-mono block">
                  {totalDishUnits} Dishes
                </span>
              </div>
            </div>

            {/* Interactive Cart Action Controller */}
            <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">

              {isAvailable ? (
                isItemInCart ? (
                  <div className="flex items-center justify-between gap-4 w-full">
                    <button
                      type="button"
                      disabled={addingToCart}
                      onClick={handleRemoveItem}
                      className="px-6 py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-75"
                    >
                      <Trash2 size={15} />
                      <span>Remove Combo</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4 w-full">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 py-3.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-indigo-950/15 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 disabled:opacity-75"
                    >
                      {addingToCart ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <ShoppingBag size={15} />
                      )}
                      <span>Add to Tray • ₹{(meal.comboPrice || meal.basePrice) * quantity}</span>
                    </button>
                  </div>
                )
              ) : (
                <button
                  disabled
                  className="w-full py-3.5 bg-slate-100 text-slate-400 font-black text-xs uppercase tracking-wider rounded-2xl border border-slate-200 flex items-center justify-center gap-2 cursor-not-allowed"
                >
                  <AlertCircle size={15} />
                  <span>Not Available Near You</span>
                </button>
              )}

            </div>

          </div>
        </div>

        {/* --- SECTION 2: INCLUDED ITEMS IN THIS BUNDLE (TABLE FORMAT) --- */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="text-[#3d3f96]" size={16} /> Included Items in this Bundle ({meal.dishes?.length || 0})
            </h3>
            <span className="text-[10px] font-extrabold text-slate-400 bg-white border border-slate-200/80 px-2.5 py-1 rounded-lg">
              Total Units: {totalDishUnits}
            </span>
          </div>

          <div className="overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">Dish Details</th>
                    <th className="py-3 px-4">Key Ingredients</th>
                    <th className="py-3 px-4 text-center">Bundle Qty</th>
                    <th className="py-3 px-4 text-right">Calories</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {(meal.dishes || []).map((item) => {
                    const dishObj = item.foodServiceId || {};
                    const dishIngredients = (dishObj.ingredients || [])
                      .map(ing => typeof ing === 'object' && ing !== null ? `${ing.name}${ing.quantity ? ` (${ing.quantity})` : ''}` : ing)
                      .join(', ');

                    return (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200/70 overflow-hidden shrink-0">
                              <img
                                src={getMediaUrl(dishObj.imageUrl) || PLACEHOLDER_IMAGE}
                                alt={dishObj.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                              />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{dishObj.name}</span>
                                {renderDietBadge(dishObj.dietType)}
                              </div>
                              {dishObj.dietType && (
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-0.5">
                                  {dishObj.dietType} Dish
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 max-w-[260px]">
                          <p className="text-xs text-slate-500 font-medium truncate" title={dishIngredients || "Standard preparation"}>
                            {dishIngredients || "Standard wholesome recipe"}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2.5 py-1 bg-slate-100 text-[#3d3f96] font-black rounded-lg text-xs">
                            {item.quantity}x
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 text-xs">
                          {dishObj.calories ? `${dishObj.calories * (item.quantity || 1)} Kcal` : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* --- SECTION 3: COMBINED INGREDIENTS TABLE & TAGS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left items-start">

          {/* Combined Ingredients Table */}
          <div className="lg:col-span-8 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Utensils className="text-[#3d3f96]" size={16} /> Combined Ingredients Breakdown ({aggregatedIngredients.length})
              </h3>
              {totalCalories > 0 && (
                <span className="text-[10px] font-extrabold text-[#3d3f96] bg-[#3d3f96]/10 px-2.5 py-1 rounded-lg border border-[#3d3f96]/20 flex items-center gap-1">
                  <Flame size={12} className="text-amber-500" />
                  {totalCalories} Kcal Combined
                </span>
              )}
            </div>

            {aggregatedIngredients.length > 0 ? (
              <div className="overflow-hidden border border-slate-200/80 rounded-2xl bg-white shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-100">
                        <th className="py-2.5 px-4">Ingredient Name</th>
                        <th className="py-2.5 px-4 text-center">Portion / Qty</th>
                        <th className="py-2.5 px-4 text-right">Calories</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {aggregatedIngredients.map((ing, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {ing.name}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-500">
                            <span className="bg-slate-100/80 px-2 py-0.5 rounded-md text-[11px] font-semibold text-slate-600">
                              {ing.quantity || "—"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-amber-600 text-xs">
                            {ing.calories !== null ? `${ing.calories} Kcal` : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200/80 text-slate-800">
                        <td className="py-3 px-4 text-[11px] uppercase tracking-wider text-slate-500">
                          Total Bundle Energy
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 text-[11px]">
                          —
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-xs text-[#3d3f96]">
                          {totalCalories} Kcal
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 border border-slate-200/80 text-center">
                <p className="text-xs text-slate-400 font-medium italic">Standard organic farm ingredients.</p>
              </div>
            )}
          </div>

          {/* Combined Search & Dietary Tags */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Tag className="text-[#3d3f96]" size={16} /> Dietary Tags & Focus
            </h3>

            {aggregatedTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {aggregatedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-[#3d3f96] border border-indigo-100/60 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">General Wellness & Nutritional Tagging.</p>
            )}
          </div>

        </div>

      </div>
    </main>
  );
}