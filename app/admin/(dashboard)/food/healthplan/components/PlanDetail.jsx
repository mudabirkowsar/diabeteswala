'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../../../services/AdminAPI';
import {
  X,
  Loader2,
  Calendar,
  Sparkles,
  Utensils,
  CheckCircle,
  XCircle,
  Activity,
  Flame,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

export default function PlanDetail({ isOpen, onClose, planId }) {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeDayTab, setActiveDayTab] = useState(1);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://192.168.1.5:5002';

  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${BACKEND_URL}${cleanPath}`;
  };

  useEffect(() => {
    if (isOpen && planId) {
      fetchDetails();
    } else {
      setPlan(null);
      setActiveDayTab(1);
    }
  }, [isOpen, planId]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await AdminAPI.getHealthyPlanById(planId);
      setPlan(res?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const currentDaySchedule = plan?.dayWiseSchedule?.find((d) => d.dayNumber === activeDayTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#3d3f96] bg-[#3d3f96]/10 px-3 py-1 rounded-full">
              {plan?.planId || 'Plan Detail'}
            </span>
            <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
              {plan?.title || 'Healthy Diet Plan'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center text-gray-400">
              <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={32} />
              <span className="text-sm font-medium">Fetching deep plan schedule...</span>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          ) : plan ? (
            <>
              {/* Top Banner & Highlights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Banner & Showcase */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="h-52 w-full rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={getFullImageUrl(plan.bannerImage)}
                      alt={plan.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/600x400/e2e8f0/64748b?text=Banner';
                      }}
                    />
                  </div>

                  {plan.images && plan.images.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {plan.images.map((img, i) => (
                        <img
                          key={i}
                          src={getFullImageUrl(img)}
                          alt="Showcase"
                          className="h-14 w-14 rounded-lg object-cover border border-gray-200 flex-shrink-0"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://placehold.co/100x100/e2e8f0/64748b?text=Img';
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Plan Metadata */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#3d3f96] text-white">
                      {plan.mainCategory} • {plan.subCategory}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700">
                      {plan.programType}
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded-lg bg-gray-100 text-gray-700 flex items-center gap-1">
                      <Calendar size={13} /> {plan.daysCount} Days
                    </span>
                    {plan.isPopular && (
                      <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 text-amber-800 flex items-center gap-1">
                        <Sparkles size={12} /> Popular
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 ${
                        plan.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {plan.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                      {plan.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{plan.title}</h1>
                    {plan.tagline && (
                      <p className="text-xs font-medium text-[#3d3f96] mt-0.5">{plan.tagline}</p>
                    )}
                    <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  {/* Pricing Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-100">
                    <div>
                      <span className="text-[11px] text-gray-400">Total Price</span>
                      <p className="text-base font-bold text-gray-900">
                        ₹{plan.pricing?.discountTotalPrice || plan.pricing?.totalPrice}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400">Per Meal</span>
                      <p className="text-base font-bold text-emerald-600">
                        ₹{plan.pricing?.discountPricePerMeal || plan.pricing?.pricePerMeal}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400">Sodium Limit</span>
                      <p className="text-xs font-bold text-gray-700 mt-1">
                        {plan.nutritionalHighlights?.maxSodium || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400">Avg Calories</span>
                      <p className="text-xs font-bold text-gray-700 mt-1 flex items-center gap-1">
                        <Flame size={12} className="text-orange-500" />
                        {plan.nutritionalHighlights?.caloriesAvgPerDay
                          ? `${plan.nutritionalHighlights.caloriesAvgPerDay} kcal`
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Day-Wise Schedule Tabs */}
              <div className="border-t border-gray-100 pt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                    <Utensils size={16} className="text-[#3d3f96]" />
                    Day-Wise Curated Menu ({plan.dayWiseSchedule?.length || 0} Days)
                  </h3>
                </div>

                {/* Day Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 border-b border-gray-100">
                  {plan.dayWiseSchedule?.map((day) => (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDayTab(day.dayNumber)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition flex-shrink-0 ${
                        activeDayTab === day.dayNumber
                          ? 'bg-[#3d3f96] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day.dayName || `Day ${day.dayNumber}`}
                    </button>
                  ))}
                </div>

                {/* Selected Day Meals Grid */}
                {currentDaySchedule ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                      const dishes = currentDaySchedule[mealType] || [];
                      if (
                        (plan.programType === 'Breakfast & Lunch' && mealType === 'dinner') ||
                        (plan.programType === 'Lunches & Dinners' && mealType === 'breakfast')
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={mealType}
                          className="border border-gray-200 rounded-xl p-4 bg-gray-50/40 space-y-3"
                        >
                          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                            <span className="text-xs font-bold uppercase text-[#3d3f96]">
                              {mealType}
                            </span>
                            <span className="text-[10px] bg-white border border-gray-200 px-2 py-0.5 rounded-full text-gray-500 font-medium">
                              {dishes.length} Items
                            </span>
                          </div>

                          <div className="space-y-2.5">
                            {dishes.length === 0 ? (
                              <p className="text-xs text-gray-400 italic py-2">No dishes mapped.</p>
                            ) : (
                              dishes.map((dish, dIdx) => (
                                <div
                                  key={dish._id || dIdx}
                                  className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3"
                                >
                                  {dish.imageUrl && (
                                    <img
                                      src={getFullImageUrl(dish.imageUrl)}
                                      alt={dish.name}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-100 flex-shrink-0"
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src =
                                          'https://placehold.co/100x100/e2e8f0/64748b?text=Dish';
                                      }}
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className="text-xs font-bold text-gray-800 truncate">
                                        {dish.name}
                                      </p>
                                      <span
                                        className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                                          dish.dietType === 'Veg'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}
                                      >
                                        {dish.dietType}
                                      </span>
                                    </div>

                                    {dish.description && (
                                      <p className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                                        {dish.description}
                                      </p>
                                    )}

                                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-50 text-[10px]">
                                      <span className="text-gray-400 font-medium">
                                        {dish.calories ? `${dish.calories} Cal` : ''}
                                      </span>
                                      <span className="font-bold text-emerald-600">
                                        ₹{dish.discountPrice || dish.price}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-4">No schedule data available.</p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}