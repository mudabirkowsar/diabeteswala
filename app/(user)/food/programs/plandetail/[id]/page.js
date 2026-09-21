"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Star,
  Flame,
  Calendar,
  CheckCircle2,
  Utensils,
  Loader2,
  Tag,
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Scale,
  Egg,
  ShieldCheck,
  Zap,
  Clock,
  HeartPulse,
  Award,
  Trophy,
  ArrowRight
} from "lucide-react";
import UserAPI from "../../../../../services/UserAPI";

// --- BASE MEDIA HELPER ---
const BASE_SERVER_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://192.168.1.3:5002";

const getMediaUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanBackendUrl = BASE_SERVER_URL.endsWith('/') ? BASE_SERVER_URL.slice(0, -1) : BASE_SERVER_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBackendUrl}${cleanPath}`;
};

export default function PlanDetailPage({ params }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const planId = resolvedParams?.id;

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(1);
  const [selectedMealType, setSelectedMealType] = useState("breakfast"); // Active Meal Tab State

  const getInitialCoords = () => {
    let lat;
    let lng;
    if (typeof window !== "undefined") {
      const savedCoords = localStorage.getItem("userCoords");
      if (savedCoords) {
        try {
          const parsed = JSON.parse(savedCoords);
          if (parsed.lat !== undefined && parsed.lng !== undefined) {
            lat = Number(parsed.lat);
            lng = Number(parsed.lng);
          }
        } catch (e) {
          console.error("Error reading stored user coordinates:", e);
        }
      }
    }
    return { lat, lng };
  };

  useEffect(() => {
    const fetchPlanDetail = async () => {
      if (!planId) return;
      setLoading(true);
      setError(null);
      try {
        const coords = getInitialCoords();
        const response = await UserAPI.getSingleHealthyPlanDetails(planId, coords);

        if (response?.success && response?.data) {
          setPlan(response.data);
          if (response.data.dayWiseSchedule?.length > 0) {
            setSelectedDayNumber(response.data.dayWiseSchedule[0].dayNumber);
          }
        } else {
          setError("Plan details not found.");
        }
      } catch (err) {
        console.error("Failed to fetch plan detail:", err);
        setError(err?.response?.data?.message || "Failed to load plan details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanDetail();
  }, [planId]);

  // Navigate to review health plan page
  const handleProceedToReview = () => {
    if (!planId) return;
    router.push(`/food/programs/reviewhealthplan/${planId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 animate-spin text-[#3d3f96]" />
        <p className="mt-4 text-slate-700 font-bold text-sm tracking-wide">
          Loading detailed diet plan schedule...
        </p>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 max-w-md w-full text-center shadow-lg">
          <h2 className="text-xl font-black text-slate-800">Plan Not Available</h2>
          <p className="text-slate-500 text-xs mt-2">{error || "Unable to fetch the requested plan."}</p>
          <Link
            href="/food/programs"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-[#3d3f96] text-white rounded-xl text-xs font-bold hover:bg-[#32347d] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to All Plans
          </Link>
        </div>
      </div>
    );
  }

  // Safe pricing calculations
  const pricing = plan.pricing || {};
  const pricePerMeal = pricing.pricePerMeal ?? 0;
  const discountPricePerMeal = pricing.discountPricePerMeal ?? pricePerMeal;
  const totalPrice = pricing.totalPrice ?? 0;
  const discountTotalPrice = pricing.discountTotalPrice ?? totalPrice;
  const savingsAmount = pricing.savingsAmount ?? (totalPrice > discountTotalPrice ? totalPrice - discountTotalPrice : 0);

  const rawHeroBanner = plan.bannerImage || (plan.images && plan.images[0]);
  const heroBannerUrl = getMediaUrl(rawHeroBanner);

  const activeDaySchedule = plan.dayWiseSchedule?.find(
    (d) => d.dayNumber === selectedDayNumber
  ) || plan.dayWiseSchedule?.[0];

  // Diet badge renderer (Veg / Non Veg / Egg)
  const renderDietBadge = (dietType) => {
    if (dietType === "Non Veg") {
      return (
        <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-xl shadow-xs">
          <span className="w-3.5 h-3.5 rounded-sm border-2 border-rose-600 flex items-center justify-center p-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          </span>
          <span className="text-[11px] font-black text-rose-800">Non-Veg</span>
        </div>
      );
    }
    if (dietType === "Egg") {
      return (
        <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl shadow-xs">
          <span className="w-3.5 h-3.5 rounded-sm border-2 border-amber-500 flex items-center justify-center p-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </span>
          <span className="text-[11px] font-black text-amber-800 flex items-center gap-0.5">
            <Egg className="w-3 h-3 text-amber-600" /> Egg
          </span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl shadow-xs">
        <span className="w-3.5 h-3.5 rounded-sm border-2 border-emerald-600 flex items-center justify-center p-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
        </span>
        <span className="text-[11px] font-black text-emerald-800">Pure Veg</span>
      </div>
    );
  };

  // Meal Section Configuration
  const mealConfig = {
    breakfast: {
      id: "breakfast",
      title: "Breakfast",
      icon: Sun,
      headerBg: "bg-amber-50 border-amber-200 text-amber-950",
      badgeBg: "bg-amber-500 text-white",
      accentBorder: "hover:border-amber-400",
      activeTab: "bg-amber-500 text-white shadow-md shadow-amber-500/20 border-amber-500",
      inactiveTab: "bg-white text-slate-700 hover:bg-amber-50/50 border-slate-200",
      activePill: "bg-white/20 text-white",
      inactivePill: "bg-slate-100 text-slate-600"
    },
    lunch: {
      id: "lunch",
      title: "Lunch",
      icon: Sunset,
      headerBg: "bg-emerald-50 border-emerald-200 text-emerald-950",
      badgeBg: "bg-emerald-600 text-white",
      accentBorder: "hover:border-emerald-400",
      activeTab: "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 border-emerald-600",
      inactiveTab: "bg-white text-slate-700 hover:bg-emerald-50/50 border-slate-200",
      activePill: "bg-white/20 text-white",
      inactivePill: "bg-slate-100 text-slate-600"
    },
    dinner: {
      id: "dinner",
      title: "Dinner",
      icon: Moon,
      headerBg: "bg-indigo-50 border-indigo-200 text-indigo-950",
      badgeBg: "bg-[#3d3f96] text-white",
      accentBorder: "hover:border-[#3d3f96]",
      activeTab: "bg-[#3d3f96] text-white shadow-md shadow-[#3d3f96]/25 border-[#3d3f96]",
      inactiveTab: "bg-white text-slate-700 hover:bg-indigo-50/50 border-slate-200",
      activePill: "bg-white/20 text-white",
      inactivePill: "bg-slate-100 text-slate-600"
    }
  };

  // Color themes for Macro Ingredients Table
  const ingredientThemes = [
    {
      rowHover: "hover:bg-emerald-50/50",
      dot: "bg-emerald-500",
      pill: "bg-emerald-50 text-emerald-800 border-emerald-200",
      calBadge: "bg-emerald-50 text-emerald-700 border-emerald-200/60"
    },
    {
      rowHover: "hover:bg-sky-50/50",
      dot: "bg-sky-500",
      pill: "bg-sky-50 text-sky-800 border-sky-200",
      calBadge: "bg-sky-50 text-sky-700 border-sky-200/60"
    },
    {
      rowHover: "hover:bg-amber-50/50",
      dot: "bg-amber-500",
      pill: "bg-amber-50 text-amber-800 border-amber-200",
      calBadge: "bg-amber-50 text-amber-700 border-amber-200/60"
    },
    {
      rowHover: "hover:bg-violet-50/50",
      dot: "bg-violet-500",
      pill: "bg-violet-50 text-violet-800 border-violet-200",
      calBadge: "bg-violet-50 text-violet-700 border-violet-200/60"
    },
    {
      rowHover: "hover:bg-rose-50/50",
      dot: "bg-rose-500",
      pill: "bg-rose-50 text-rose-800 border-rose-200",
      calBadge: "bg-rose-50 text-rose-700 border-rose-200/60"
    },
    {
      rowHover: "hover:bg-teal-50/50",
      dot: "bg-teal-500",
      pill: "bg-teal-50 text-teal-800 border-teal-200",
      calBadge: "bg-teal-50 text-teal-700 border-teal-200/60"
    }
  ];

  // Render Horizontal Dish Card (Image Left, Details Right)
  const renderMealSection = (mealType, dishes) => {
    const config = mealConfig[mealType] || mealConfig.breakfast;
    const MealIcon = config.icon;

    if (!dishes || dishes.length === 0) {
      return (
        <div className="bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-slate-200/60 flex items-center justify-center text-slate-400 mb-3">
            <MealIcon className="w-6 h-6" />
          </div>
          <h4 className="text-base font-black text-slate-700">No {config.title} Dishes Scheduled</h4>
          <p className="text-xs text-slate-400 mt-1 font-medium">There are no menu items planned for this meal on Day {selectedDayNumber}.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Meal Category Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 rounded-2xl border ${config.headerBg} shadow-xs`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${config.badgeBg} flex items-center justify-center shadow-xs`}>
              <MealIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-base font-black tracking-tight">{config.title}</h4>
              <p className="text-[11px] text-slate-500 font-semibold">Planned menu for {config.title.toLowerCase()}</p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-xl bg-white shadow-xs text-slate-800 border border-slate-200/80">
            {dishes.length} {dishes.length > 1 ? "Dishes" : "Dish"}
          </span>
        </div>

        {/* Side-by-Side Horizontal Dish Cards */}
        <div className="space-y-4">
          {dishes.map((dish, idx) => {
            const dishImg = getMediaUrl(dish.imageUrl);

            return (
              <div
                key={dish._id || idx}
                className={`bg-white rounded-3xl border border-slate-200/90 ${config.accentBorder} overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row group`}
              >
                {/* 1. LEFT SIDE: Cover Image & Floating Badges */}
                <div className="relative w-full md:w-64 lg:w-72 h-56 md:h-auto min-h-[220px] bg-slate-900 overflow-hidden flex-shrink-0">
                  {dishImg ? (
                    <img
                      src={dishImg}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-900/90 via-[#3d3f96]/80 to-slate-900 flex flex-col items-center justify-center text-white p-5 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-2 border border-white/20">
                        <Utensils className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-xs font-black tracking-wide text-white/90 line-clamp-1">
                        {dish.name}
                      </span>
                      <span className="text-[10px] text-white/60 mt-0.5 font-medium">
                        Fresh Kitchen Preparation
                      </span>
                    </div>
                  )}

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    {renderDietBadge(dish.dietType)}

                    {dish.calories && (
                      <div className="bg-orange-500 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 fill-white" />
                        {dish.calories} kcal
                      </div>
                    )}
                  </div>

                  {/* Bottom Food Effect Category */}
                  {dish.foodEffectCategory && (
                    <div className="absolute bottom-3 left-3">
                      <span className="bg-[#3d3f96] text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-md uppercase tracking-wider border border-white/20">
                        {dish.foodEffectCategory}
                      </span>
                    </div>
                  )}
                </div>

                {/* 2. RIGHT SIDE: Title, Description, Tags & Colorful Macro Ingredients Table */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Header with Title and Price */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <h5 className="text-lg font-black text-slate-900 leading-snug group-hover:text-[#3d3f96] transition-colors">
                          {dish.name}
                        </h5>
                        {dish.description && (
                          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed font-medium">
                            {dish.description}
                          </p>
                        )}
                      </div>

                      <div className="text-left sm:text-right flex-shrink-0">
                        <span className="text-xl font-black text-[#3d3f96]">
                          ₹{dish.discountPrice || dish.price}
                        </span>
                        {dish.discountPrice && dish.price > dish.discountPrice && (
                          <span className="block text-xs line-through text-slate-400 font-bold">
                            ₹{dish.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Dish Tags */}
                    {dish.tags && dish.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {dish.tags.map((tag, tIdx) => (
                          <span
                            key={tIdx}
                            className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Macro Ingredients Table with Colorful Distinct Rows */}
                  {dish.ingredients && dish.ingredients.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      <div className="flex items-center justify-between text-[11px] font-black text-slate-500 uppercase tracking-wider">
                        <span className="flex items-center gap-1.5 text-[#3d3f96]">
                          <Scale className="w-3.5 h-3.5" /> Macro Ingredients Breakdown
                        </span>
                        <span className="text-slate-400 font-bold">
                          {dish.ingredients.length} items
                        </span>
                      </div>

                      {/* Colorful Ingredients Table */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 shadow-2xs">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/90 text-slate-600 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                              <th className="py-2.5 px-3.5 w-10 text-center">#</th>
                              <th className="py-2.5 px-3.5 font-extrabold">Ingredient</th>
                              <th className="py-2.5 px-3.5 font-extrabold">Quantity</th>
                              <th className="py-2.5 px-3.5 font-extrabold text-right">Calories</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {dish.ingredients.map((ing, iIdx) => {
                              const theme = ingredientThemes[iIdx % ingredientThemes.length];

                              return (
                                <tr
                                  key={ing._id || iIdx}
                                  className={`transition-colors ${theme.rowHover}`}
                                >
                                  <td className="py-2.5 px-3.5 text-center text-[11px] text-slate-400 font-bold">
                                    {iIdx + 1}
                                  </td>
                                  <td className="py-2.5 px-3.5 font-bold text-slate-800">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${theme.dot} flex-shrink-0`} />
                                      <span className="truncate max-w-[150px] sm:max-w-[200px]">{ing.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3.5">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold border ${theme.pill}`}>
                                      {ing.quantity}{/^\d+$/.test(String(ing.quantity)) && Number(ing.quantity) > 10 ? 'g' : ''}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-3.5 text-right">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-bold border ${theme.calBadge}`}>
                                      <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                      {ing.calories} kcal
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">

      {/* 1. FULL TOP HERO BANNER */}
      <div className="relative w-full h-80 sm:h-[420px] md:h-[480px] lg:h-[520px] bg-slate-950 overflow-hidden">
        {heroBannerUrl ? (
          <img
            src={heroBannerUrl}
            alt={plan.title}
            className="w-full h-full object-cover object-top opacity-90 transition-opacity duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-950 via-[#3d3f96]/50 to-slate-900" />
        )}

        {/* Soft bottom gradient to keep banner graphics clear while ensuring white text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-black/20" />

        {/* Floating Back Button */}
        <div className="absolute top-6 left-4 sm:left-8 max-w-7xl">
          <Link
            href="/food/programs"
            className="inline-flex items-center gap-2 text-xs font-bold text-white bg-black/60 hover:bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-xl transition border border-white/20 shadow-xl cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Diet Plans
          </Link>
        </div>

        {/* Hero Details (Bottom Overlay) */}
        <div className="absolute bottom-8 left-4 right-4 sm:left-8 sm:right-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {plan.subCategory && (
              <span className="px-3 py-1 bg-[#3d3f96] text-white text-xs font-extrabold rounded-lg shadow-md uppercase tracking-wider">
                {plan.subCategory}
              </span>
            )}
            {plan.mainCategory && (
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/20">
                {plan.mainCategory}'s Diet
              </span>
            )}
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-lg border border-white/20 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> {plan.daysCount} Days Schedule
            </span>
            {plan.isRepeatAfter7Days && (
              <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md">
                Repeats Every 7 Days
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
            {plan.title}
          </h1>

          <p className="text-slate-200 text-xs sm:text-sm md:text-base mt-2 max-w-3xl line-clamp-2 leading-relaxed font-medium drop-shadow-sm">
            {plan.tagline}
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Left 2 Columns: Overview, Motivational Grid & Kitchen Partner */}
          <div className="lg:col-span-2 space-y-6">

            {/* Description & Overview */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-lg font-black text-slate-900">Program Overview</h3>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium">
                {plan.description}
              </div>

              {/* Nutritional Highlights */}
              {plan.nutritionalHighlights && (
                <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Target Calories</div>
                    <div className="text-base sm:text-lg font-black text-slate-900 flex items-center justify-center gap-1 mt-1">
                      <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                      {plan.nutritionalHighlights.caloriesAvgPerDay || "Balanced"} kcal/day
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Max Sodium</div>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {plan.nutritionalHighlights.maxSodium || "< 500mg"}
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Max Sat. Fat</div>
                    <div className="text-base sm:text-lg font-black text-slate-900 mt-1">
                      {plan.nutritionalHighlights.maxSaturatedFat || "< 3.0g"}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* --- MOTIVATIONAL TRANSFORMATION SECTION --- */}
            <div className="bg-gradient-to-br from-[#3d3f96] via-[#2f3175] to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" /> Transform Your Routine
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black tracking-tight mt-2">
                Why thousands choose this healthy diet program
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl font-medium">
                No strict starvation, no meal prep stress. Just delicious, nutritionist-backed fuel designed for real, sustainable results.
              </p>

              {/* 4 Pillars of Motivation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3 hover:bg-white/15 transition">
                  <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Consistent Daily Energy</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                      Balanced glycemic indices prevent afternoon energy crashes and food slumps.
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3 hover:bg-white/15 transition">
                  <div className="w-9 h-9 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Save 12+ Hours Every Week</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                      Zero grocery runs, zero kitchen prep, zero dishwashing hassle.
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3 hover:bg-white/15 transition">
                  <div className="w-9 h-9 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">100% Macro Precision</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                      Every dish is weighed and calculated to keep your health goals right on track.
                    </p>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md border border-white/15 p-4 rounded-2xl flex items-start gap-3 hover:bg-white/15 transition">
                  <div className="w-9 h-9 rounded-xl bg-sky-400/20 text-sky-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-white">Certified Kitchen Standard</h5>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed font-medium">
                      Prepared in FSSAI-compliant hygienic hubs using farm-fresh organic produce.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloud Kitchen Partner Card */}
            {plan.vendorId && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {plan.vendorId.profileImage ? (
                    <img
                      src={getMediaUrl(plan.vendorId.profileImage)}
                      alt={plan.vendorId.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center font-bold text-lg flex-shrink-0">
                      <Utensils className="w-6 h-6" />
                    </div>
                  )}

                  <div>
                    <span className="text-[10px] font-extrabold text-[#3d3f96] uppercase tracking-wider block">
                      Certified Cloud Kitchen Partner
                    </span>
                    <h4 className="text-base font-extrabold text-slate-900">{plan.vendorId.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#3d3f96] flex-shrink-0" />
                      {plan.vendorId.address || "Certified Kitchen Hub"}
                      {plan.distanceText && ` • (${plan.distanceText})`}
                    </p>
                  </div>
                </div>

                {plan.vendorId.rating > 0 && (
                  <div className="bg-amber-50 border border-amber-200 px-3.5 py-2 rounded-2xl text-center flex-shrink-0">
                    <div className="flex items-center gap-1 text-amber-600 font-black text-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {plan.vendorId.rating}
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">Rating</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right 1 Column: Complete Pricing & Action Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl sticky top-6 space-y-6">

              {/* Motivational Urgency Micro-Banner */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 font-bold">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-emerald-900 leading-tight">
                  94% of members achieve their fitness targets with this curated meal program.
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Total Plan Price
                  </span>
                  {savingsAmount > 0 && (
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg uppercase flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Save ₹{savingsAmount}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2.5 mt-2">
                  <span className="text-3xl font-black text-[#3d3f96]">
                    ₹{discountTotalPrice}
                  </span>
                  {totalPrice > discountTotalPrice && (
                    <span className="text-lg line-through text-slate-400 font-bold">
                      ₹{totalPrice}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1 font-semibold">
                  For {plan.daysCount} Days Full Schedule ({plan.programType || "Full Program"})
                </p>
              </div>

              {/* Breakdown */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Price Per Meal</span>
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <span className="text-sm text-[#3d3f96] font-extrabold">₹{discountPricePerMeal}</span>
                    {pricePerMeal > discountPricePerMeal && (
                      <span className="text-xs line-through text-slate-400 font-normal">₹{pricePerMeal}</span>
                    )}
                    <span className="text-[10px] text-slate-400 font-normal">/meal</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Standard Total</span>
                  <span className="font-semibold text-slate-500 line-through">₹{totalPrice}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Discounted Package</span>
                  <span className="font-bold text-slate-800">₹{discountTotalPrice}</span>
                </div>

                {savingsAmount > 0 && (
                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/60 font-bold text-emerald-600">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Direct Savings
                    </span>
                    <span>- ₹{savingsAmount}</span>
                  </div>
                )}
              </div>

              <ul className="space-y-2.5 text-xs text-slate-600 border-y border-slate-100 py-4 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Custom Day 1 to Day {plan.daysCount} curated menu</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Fresh daily cloud kitchen preparation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Free contactless doorstep delivery</span>
                </li>
              </ul>

              <button
                onClick={handleProceedToReview}
                disabled={plan.UnavailablePlan || !plan.isAvailable}
                className="w-full py-4 bg-[#3d3f96] hover:bg-[#32347d] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#3d3f96]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{plan.isAvailable ? "Start Your Healthy Journey" : "Currently Out of Service"}</span>
                {plan.isAvailable && <ArrowRight className="w-4 h-4" />}
              </button>

              <div className="text-center">
                <span className="text-[11px] font-bold text-slate-400 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Easy pause or reschedule anytime
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. DAY-WISE SCHEDULE WITH LEFT SIDE MEAL TABS */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">

          {/* Day Tabs Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-black text-slate-900">Day-Wise Menu Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Select a day and meal time to explore dishes and macro ingredients
              </p>
            </div>

            {/* Horizontal Day Selector */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              {plan.dayWiseSchedule?.map((day) => (
                <button
                  key={day.dayNumber}
                  onClick={() => setSelectedDayNumber(day.dayNumber)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                    selectedDayNumber === day.dayNumber
                      ? "bg-[#3d3f96] text-white shadow-md shadow-[#3d3f96]/25 scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {day.dayName || `Day ${day.dayNumber}`}
                </button>
              ))}
            </div>
          </div>

          {/* Left Vertical Meal NavTabs + Right Content */}
          {activeDaySchedule ? (
            <div className="flex flex-col md:flex-row gap-6 items-start pt-2">

              {/* LEFT SIDE: Vertical Meal Navigation Tabs */}
              <div className="w-full md:w-60 lg:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
                {Object.keys(mealConfig).map((key) => {
                  const item = mealConfig[key];
                  const Icon = item.icon;
                  const isSelected = selectedMealType === key;
                  const dishesCount = activeDaySchedule[key]?.length || 0;

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedMealType(key)}
                      className={`flex-1 md:flex-none flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                        isSelected
                          ? item.activeTab
                          : item.inactiveTab
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-white/20' : 'bg-slate-100'}`}>
                          <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                        </div>
                        <div>
                          <div className="text-sm font-black tracking-tight">{item.title}</div>
                          <div className={`text-[10px] font-semibold ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {key === 'breakfast' ? 'Morning' : key === 'lunch' ? 'Afternoon' : 'Night'}
                          </div>
                        </div>
                      </div>

                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        isSelected ? item.activePill : item.inactivePill
                      }`}>
                        {dishesCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* RIGHT SIDE: Active Meal Dishes Display */}
              <div className="flex-1 w-full min-w-0">
                {renderMealSection(selectedMealType, activeDaySchedule[selectedMealType])}
              </div>

            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 font-bold text-sm">
              No schedule found for Day {selectedDayNumber}.
            </div>
          )}

        </div>

        {/* 4. BOTTOM MOTIVATIONAL CALL-TO-ACTION BANNER */}
        <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-emerald-600">Fresh Slots Available Today</span>
            </div>
            <h4 className="text-lg sm:text-xl font-black text-slate-900">
              Ready to feel fitter, healthier, and more energized?
            </h4>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Start your {plan.daysCount}-day diet plan now with fresh doorstep kitchen deliveries.
            </p>
          </div>

          <div className="flex-shrink-0 w-full sm:w-auto">
            <button
              onClick={handleProceedToReview}
              disabled={plan.UnavailablePlan || !plan.isAvailable}
              className="w-full sm:w-auto px-8 py-4 bg-[#3d3f96] hover:bg-[#32347d] text-white rounded-2xl text-sm font-black shadow-lg shadow-[#3d3f96]/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Subscribe Now — ₹{discountTotalPrice}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}