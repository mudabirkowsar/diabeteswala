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
        className={`w-5 h-5 border-2 rounded-md flex items-center justify-center p-[2px] shrink-0 bg-white shadow-sm ${isVeg ? 'border-emerald-500' : isEgg ? 'border-amber-500' : isNonVeg ? 'border-rose-500' : 'border-slate-300'
          }`}
        title={type}
      >
        <span
          className={`w-2 h-2 rounded-full ${isVeg ? 'bg-emerald-500' : isEgg ? 'bg-amber-500' : isNonVeg ? 'bg-rose-500' : 'bg-slate-400'
            }`}
        />
      </div>
    );
  };

  // Check if this combo package is already in the user's food cart [cite: custom_context]
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

  // Safely extract the first available child image to display as the main background banner [cite: custom_context]
  const bannerImage = meal.dishes?.find(d => d.foodServiceId?.imageUrl)?.foodServiceId?.imageUrl || null;
  const firstDish = meal.dishes?.[0]?.foodServiceId || {};
  const dietType = firstDish.dietType || "Veg";
  const vendor = meal.vendorId || {};

  const isAvailable = meal.isAvailable !== false && !meal.UnavailableCombo; // Validate availability state [cite: custom_context]

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

  // Aggregate tags and ingredients from children safely
  const aggregatedIngredients = Array.from(new Set(
    (meal.dishes || []).flatMap(d => d.foodServiceId?.ingredients || [])
  ));

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
              {/* Category Pill */}
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-3">
                <Bookmark size={10} className="fill-indigo-500 text-indigo-600" />
                Combo Bundle Offer
              </span>

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
                <span className="text-xs sm:text-sm font-black text-slate-700 block pt-0.5">
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

              {isAvailable && (
                isItemInCart ? (
                  // Item already exists in cart [cite: custom_context]
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
                  // Item is not in cart [cite: custom_context]
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
              )}

              {!isAvailable && (
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

        {/* --- SECTION 2: COMBOS NESTED DISHES CHECKLIST --- */}
        <div className="space-y-4 text-left">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Layers className="text-[#3d3f96]" size={16} /> Included Items in this Bundle
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(meal.dishes || []).map((item) => {
              const dishObj = item.foodServiceId || {};
              return (
                <div key={item._id} className="border border-slate-100 rounded-2xl p-4 flex gap-4 bg-white shadow-sm">
                  <div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200/50">
                    <img
                      src={getMediaUrl(dishObj.imageUrl) || PLACEHOLDER_IMAGE}
                      alt={dishObj.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                    />
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 justify-between">
                      <h4 className="text-xs sm:text-sm font-extrabold text-slate-800 truncate" title={dishObj.name}>
                        {dishObj.name}
                      </h4>
                      {renderDietBadge(dishObj.dietType)}
                    </div>
                    <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide">
                      Qty: <span className="text-[#3d3f96] font-black">{item.quantity}</span>
                    </p>
                    {dishObj.ingredients && dishObj.ingredients.length > 0 && (
                      <p className="text-[10px] text-slate-400 font-medium truncate">
                        Ingredients: {dishObj.ingredients.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- SECTION 3: AGGREGATED INGREDIENTS & SEARCH TAGS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">

          {/* Ingredients Breakdown */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Utensils className="text-[#3d3f96]" size={16} /> Combined Ingredients List
            </h3>

            {aggregatedIngredients.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aggregatedIngredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-50 text-slate-700 border border-slate-100 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 font-medium italic">Standard organic fresh farm ingredients.</p>
            )}
          </div>

          {/* Search & Dietary Tags */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Tag className="text-[#3d3f96]" size={16} /> Combined Dietary Tags & Health Filters
            </h3>

            {aggregatedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {aggregatedTags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-indigo-50 text-[#3d3f96] border border-indigo-100/60 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-xl"
                  >
                    {tag}
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