"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { 
  Search, 
  MapPin, 
  Star, 
  Flame, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Utensils, 
  ShieldCheck,
  Tag,
  Loader2
} from "lucide-react";
import UserAPI from "../../../../services/UserAPI";

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

export default function AllHealthPlan() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState("");
  const [mainCategory, setMainCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");
  const [daysCount, setDaysCount] = useState("");
  const [programType, setProgramType] = useState("");

  // Retrieve Stored Coords
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

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const coords = getInitialCoords();
      const filters = {};
      if (mainCategory) filters.mainCategory = mainCategory;
      if (subCategory) filters.subCategory = subCategory;
      if (daysCount) filters.daysCount = Number(daysCount);
      if (programType) filters.programType = programType;
      if (search.trim()) filters.search = search.trim();

      // API Call via UserAPI Default Export
      const response = await UserAPI.getNearestHealthyPlans(coords, filters);
      
      if (response?.success) {
        setPlans(response.data || []);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Failed to load healthy plans:", err);
      setError(err?.response?.data?.message || "Failed to load diet plans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [mainCategory, subCategory, daysCount, programType, search]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPlans();
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-[#3d3f96]/10 text-[#3d3f96] uppercase tracking-wider">
                Dietitian-Designed
              </span>
              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#3d3f96]" /> Serviceable within 10 km
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Healthy & Personalized Diet Plans
            </h1>
            <p className="text-slate-600 mt-1.5 text-sm md:text-base max-w-2xl">
              Fresh, calorie-counted daily meal programs tailored for weight loss, hormonal health, and balanced living.
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Keto, PCOD, High Protein..."
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3d3f96] focus:border-transparent shadow-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </form>
        </div>

        {/* Filters Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Category Switcher */}
            <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl">
              {[
                { label: "All Plans", value: "" },
                { label: "Men's Health", value: "Men" },
                { label: "Women's Health", value: "Women" },
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setMainCategory(tab.value)}
                  className={`px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all ${
                    mainCategory === tab.value
                      ? "bg-[#3d3f96] text-white shadow"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dropdowns */}
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={programType}
                onChange={(e) => setProgramType(e.target.value)}
                className="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
              >
                <option value="">All Program Types</option>
                <option value="Full Program">Full Program</option>
                <option value="Breakfast & Lunch">Breakfast & Lunch</option>
              </select>

              <select
                value={daysCount}
                onChange={(e) => setDaysCount(e.target.value)}
                className="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
              >
                <option value="">Any Duration</option>
                <option value="5">5 Days</option>
                <option value="7">7 Days</option>
                <option value="14">14 Days</option>
              </select>

              <select
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                className="text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#3d3f96]"
              >
                <option value="">All Diet Goals</option>
                <option value="Keto Flex">Keto Flex</option>
                <option value="PCOD / PCOS Care">PCOD / PCOS Care</option>
                <option value="Weight Loss">Weight Loss</option>
                <option value="High Protein">High Protein</option>
              </select>

              {(mainCategory || subCategory || daysCount || programType || search) && (
                <button
                  onClick={() => {
                    setMainCategory("");
                    setSubCategory("");
                    setDaysCount("");
                    setProgramType("");
                    setSearch("");
                  }}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-2 py-1"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 animate-spin text-[#3d3f96]" />
            <p className="mt-4 text-slate-600 font-bold text-sm">Searching nearby cloud kitchens for diet plans...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 p-8 rounded-3xl text-center max-w-md mx-auto my-12">
            <p className="text-rose-600 text-sm font-semibold">{error}</p>
            <button
              onClick={fetchPlans}
              className="mt-4 px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition"
            >
              Try Again
            </button>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto my-12 shadow-sm">
            <div className="w-16 h-16 bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center rounded-2xl mx-auto mb-4">
              <Utensils className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No Diet Plans in Your Area</h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              We couldn't find any active plans matching your search filters in your 10 km service radius.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {plans.map((plan) => {
              const planIdOrSlug = plan._id || plan.planId;
              const rawBanner = plan.bannerImage || (plan.images && plan.images[0]);
              const banner = getMediaUrl(rawBanner) || "/placeholder-plan.jpg";

              return (
                <div
                  key={plan._id}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group relative"
                >
                  {/* Card Banner */}
                  <div className="relative h-56 w-full bg-slate-900 overflow-hidden">
                    <img
                      src={banner}
                      alt={plan.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {plan.isPopular && (
                          <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider">
                            <Sparkles className="w-3 h-3" /> Popular
                          </span>
                        )}
                        {plan.isRecommended && (
                          <span className="px-2.5 py-1 bg-emerald-600 text-white text-[10px] font-extrabold rounded-lg flex items-center gap-1 shadow-md uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" /> Recommended
                          </span>
                        )}
                      </div>
                      <span className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold rounded-lg shadow-sm">
                        {plan.daysCount} Days
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                      <span className="bg-[#3d3f96] px-3 py-1 rounded-lg font-bold shadow-md">
                        {plan.subCategory}
                      </span>
                      {plan.distanceText && (
                        <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg font-medium">
                          <MapPin className="w-3 h-3 text-[#3d3f96]" /> {plan.distanceText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {plan.vendorId && (
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 pb-2 border-b border-slate-100">
                          <span className="font-semibold text-slate-700 truncate">
                            {plan.vendorId.name}
                          </span>
                          {plan.vendorId.rating && (
                            <span className="flex items-center gap-1 text-amber-500 font-black">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              {plan.vendorId.rating}
                            </span>
                          )}
                        </div>
                      )}

                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#3d3f96] transition-colors line-clamp-1">
                        {plan.title}
                      </h3>
                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed font-medium">
                        {plan.tagline || plan.description}
                      </p>

                      {plan.nutritionalHighlights && (
                        <div className="grid grid-cols-3 gap-2 mt-4 py-2.5 px-3 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Calories</div>
                            <div className="text-xs font-black text-slate-800 flex items-center justify-center gap-0.5 mt-0.5">
                              <Flame className="w-3 h-3 text-orange-500" />
                              {plan.nutritionalHighlights.caloriesAvgPerDay || "450"} kcal
                            </div>
                          </div>
                          <div className="border-x border-slate-200">
                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sodium</div>
                            <div className="text-xs font-black text-slate-800 mt-0.5">
                              {plan.nutritionalHighlights.maxSodium || "< 500mg"}
                            </div>
                          </div>
                          <div>
                            <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sat. Fat</div>
                            <div className="text-xs font-black text-slate-800 mt-0.5">
                              {plan.nutritionalHighlights.maxSaturatedFat || "< 3.0g"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-[#3d3f96]">
                            ₹{plan.pricing?.discountPricePerMeal || plan.pricing?.pricePerMeal}
                          </span>
                          <span className="text-[11px] text-slate-400 font-bold">/ meal</span>
                          {plan.pricing?.discountPricePerMeal && plan.pricing?.pricePerMeal > plan.pricing.discountPricePerMeal && (
                            <span className="text-xs line-through text-slate-400 ml-1 font-semibold">
                              ₹{plan.pricing.pricePerMeal}
                            </span>
                          )}
                        </div>
                        {plan.pricing?.savingsAmount > 0 && (
                          <div className="text-[11px] font-extrabold text-emerald-600">
                            Save ₹{plan.pricing.savingsAmount} on plan
                          </div>
                        )}
                      </div>

                      <Link
                        href={`/food/programs/plandetail/${planIdOrSlug}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#3d3f96] hover:bg-[#32347d] text-white text-xs font-extrabold shadow-md shadow-[#3d3f96]/20 transition-all group-hover:translate-x-0.5"
                      >
                        Inspect <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}