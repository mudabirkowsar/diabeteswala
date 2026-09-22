"use client";

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Search,
  Flame,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Layers,
  X,
  Utensils,
  Eye,
  Tag,
  ShieldCheck,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import FoodAPI from '../../../../services/FoodVendorAPI';

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

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800";

export default function HealthyPlansInventoryPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Tracking local selection checklist
  const [localSelections, setLocalSelections] = useState({});

  // Deep Details Modal
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeDayTab, setActiveDayTab] = useState(1);

  useEffect(() => {
    fetchMasterPlans();
  }, [selectedMainCategory, selectedSubCategory]);

  // 1. Fetch Master Healthy Plans Checklist (GET /master-healthy-plans)
  const fetchMasterPlans = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (selectedMainCategory !== 'All') params.mainCategory = selectedMainCategory;
      if (selectedSubCategory !== 'All') params.subCategory = selectedSubCategory;

      const response = await FoodAPI.getMasterHealthyPlans(params);
      if (response && response.success && Array.isArray(response.data)) {
        setPlans(response.data);

        // Synchronize local checklist states with isAvailable property (forcing false if deleted by admin)
        const initialSelections = {};
        response.data.forEach((item) => {
          initialSelections[item._id] = item.isDeletedByAdmin ? false : !!item.isAvailable;
        });
        setLocalSelections(initialSelections);
      } else {
        setError('Unexpected data format received from the master plans checklist.');
      }
    } catch (err) {
      console.error("Error loading master healthy plans:", err);
      setError(err?.response?.data?.message || err?.message || 'Failed to fetch healthy plans.');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
    }, 4000);
  };

  // 2. Sync / Multi-Select Healthy Plans (POST /sync-healthy-plans)
  const handleBulkSync = async () => {
    setActionLoading(true);
    setError(null);

    const selectedPlanIds = Object.keys(localSelections).filter((id) => {
      const planItem = plans.find((p) => p._id === id);
      return localSelections[id] === true && !planItem?.isDeletedByAdmin;
    });

    try {
      const payload = { selectedPlanIds };
      const response = await FoodAPI.syncHealthyPlans(payload);
      if (response && response.success) {
        showNotification(response.message || 'Healthy plans synchronized successfully!');
        await fetchMasterPlans();
      }
    } catch (err) {
      console.error("Error synchronizing plans:", err);
      setError(err?.response?.data?.message || err?.message || 'Failed to synchronize healthy plans.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Instant Single Plan Availability Switch (PATCH /toggle-healthy-plan/:healthyPlanId)
  const handleToggleSinglePlan = async (planId, e) => {
    e?.stopPropagation();
    const targetPlan = plans.find((p) => p._id === planId);
    if (targetPlan?.isDeletedByAdmin) {
      setError("This plan has been disabled by Admin and cannot be activated.");
      return;
    }

    setTogglingId(planId);
    setError(null);

    try {
      const response = await FoodAPI.toggleHealthyPlanAvailability(planId);
      if (response && response.success) {
        showNotification(response.message || 'Plan status updated successfully.');
        const updatedStatus = response.isAvailable ?? response.data?.isAvailable;

        setLocalSelections((prev) => ({
          ...prev,
          [planId]: updatedStatus !== undefined ? updatedStatus : !prev[planId]
        }));

        setPlans((prev) =>
          prev.map((p) => {
            if (p._id === planId) {
              return {
                ...p,
                isAvailable: updatedStatus !== undefined ? updatedStatus : !p.isAvailable
              };
            }
            return p;
          })
        );
      }
    } catch (err) {
      console.error("Error toggling plan status:", err);
      setError(err?.response?.data?.message || err?.message || 'Failed to toggle plan availability.');
    } finally {
      setTogglingId(null);
    }
  };

  // Checkbox toggle for local multi-select
  const handleCheckboxChange = (planId, e) => {
    e.stopPropagation();
    const targetPlan = plans.find((p) => p._id === planId);
    if (targetPlan?.isDeletedByAdmin) return;

    setLocalSelections((prev) => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  // 5. Get Single Vendor Healthy Plan Full Details (GET /healthy-plans/:id)
  const handleOpenPlanDetails = async (planId) => {
    const localFallback = plans.find((p) => p._id === planId);
    setSelectedPlan(localFallback || { _id: planId, title: "Loading plan..." });
    setModalLoading(true);
    setActiveDayTab(1);

    try {
      const response = await FoodAPI.getSingleVendorHealthyPlan(planId);
      if (response && response.success && response.data) {
        setSelectedPlan(response.data);
      } else if (localFallback) {
        setSelectedPlan(localFallback);
      }
    } catch (err) {
      console.warn("Falling back to local plan data:", err);
      if (localFallback) setSelectedPlan(localFallback);
    } finally {
      setModalLoading(false);
    }
  };

  // Check if vendor has modified selections compared to saved database states
  const hasPendingChanges = () => {
    return plans.some((plan) => {
      if (plan.isDeletedByAdmin) return false;
      const dbVal = !!plan.isAvailable;
      const localVal = !!localSelections[plan._id];
      return dbVal !== localVal;
    });
  };

  const subCategoryOptions = ['All', ...new Set(plans.map((p) => p.subCategory).filter(Boolean))];

  const filteredPlans = plans.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.planId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subCategory?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Active' && localSelections[item._id] && !item.isDeletedByAdmin) ||
      (selectedStatusFilter === 'Inactive' && (!localSelections[item._id] || item.isDeletedByAdmin));

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8 text-slate-800 antialiased select-none">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200/80 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/15">
                <Calendar className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  Healthy Diet Plans Inventory
                </h1>
                <p className="text-xs text-slate-500 font-bold mt-1">
                  Manage master clinical diet packages, toggle kitchen fulfillment, and view day-wise meal formulations.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkSync}
              disabled={actionLoading || !hasPendingChanges()}
              className={`px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 shadow-lg flex items-center gap-2 cursor-pointer ${hasPendingChanges() && !actionLoading
                ? 'bg-[#3D3F96] hover:bg-[#2F3175] text-white shadow-indigo-950/15 active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                }`}
            >
              {actionLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Synchronizing...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  <span>Save & Publish Menu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification Banners */}
        {error && (
          <div className="rounded-2xl bg-rose-50 p-4 border border-rose-200 flex items-center gap-3 animate-fade-in shadow-xs">
            <AlertCircle className="text-rose-600 shrink-0" size={20} />
            <p className="text-xs font-bold text-rose-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-200 flex items-center gap-3 animate-fade-in shadow-xs">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
            <p className="text-xs font-bold text-emerald-800">{successMessage}</p>
          </div>
        )}

        {/* Filter Controls Panel */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

            {/* Search Input */}
            <div className="md:col-span-5 relative">
              <input
                type="text"
                placeholder="Search by plan name, Plan ID, or subcategory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#3D3F96] transition"
              />
              <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" strokeWidth={2.2} />
            </div>

            {/* Target Category Switches (Men / Women) */}
            <div className="md:col-span-4 flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider whitespace-nowrap">Target:</span>
              <div className="inline-flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 w-full">
                {['All', 'Men', 'Women'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedMainCategory(cat)}
                    className={`flex-1 py-1.5 text-xs font-extrabold rounded-lg transition cursor-pointer ${selectedMainCategory === cat
                      ? 'bg-[#3D3F96] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-white'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sub Category Dropdown */}
            <div className="md:col-span-3">
              <select
                value={selectedSubCategory}
                onChange={(e) => setSelectedSubCategory(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                {subCategoryOptions.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub === 'All' ? '🌐 All Subcategories' : sub}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Master Plans Inventory Table */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <Loader2 className="animate-spin text-[#3D3F96] mb-3" size={38} />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Healthy Diet Plans...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-xs">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-black text-slate-700 text-sm">No Healthy Plans Found</p>
            <p className="text-xs text-slate-400 mt-1">There are no diet programs matching your active filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-100">
                    <th className="py-4 px-5 text-center w-14">Select</th>
                    <th className="py-4 px-5">Plan Monograph</th>
                    <th className="py-4 px-5 text-center">Category Focus</th>
                    <th className="py-4 px-5 text-center">Program Duration</th>
                    <th className="py-4 px-5 text-center">Availability Status</th>
                    <th className="py-4 px-5 text-right">Schedule & Recipes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPlans.map((plan) => {
                    const isChecked = !!localSelections[plan._id] && !plan.isDeletedByAdmin;
                    const isTogglingThis = togglingId === plan._id;
                    const isDeleted = !!plan.isDeletedByAdmin;

                    return (
                      <tr
                        key={plan._id}
                        onClick={() => handleOpenPlanDetails(plan._id)}
                        className={`hover:bg-[#3D3F96]/5 transition-colors cursor-pointer group ${isDeleted
                          ? 'bg-rose-50/30 opacity-75'
                          : !isChecked
                            ? 'opacity-65 bg-slate-50/30'
                            : ''
                          }`}
                      >
                        {/* Checkbox Selector for Multi-select */}
                        <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            disabled={isDeleted}
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(plan._id, e)}
                            className={`h-4.5 w-4.5 rounded text-[#3D3F96] focus:ring-[#3D3F96] border-slate-300 ${isDeleted ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                              }`}
                          />
                        </td>

                        {/* Title & Plan Identifier */}
                        <td className="py-4 px-5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-black uppercase text-[#3D3F96] bg-[#3D3F96]/10 px-2 py-0.5 rounded">
                                {plan.planId || 'HLP-100'}
                              </span>
                              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                                {plan.mainCategory || 'General'}
                              </span>
                              {isDeleted && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                                  <AlertCircle size={10} />
                                  {plan.adminStatusText || 'Deleted by Admin'}
                                </span>
                              )}
                            </div>
                            <p className="font-extrabold text-slate-900 text-[13px] group-hover:underline leading-snug">
                              {plan.title}
                            </p>
                          </div>
                        </td>

                        {/* Category Focus */}
                        <td className="py-4 px-5 text-center">
                          {plan.subCategory ? (
                            <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                              {plan.subCategory}
                            </span>
                          ) : (
                            <span className="text-slate-400 font-medium text-[11px]">General Wellness</span>
                          )}
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-5 text-center">
                          <span className="inline-block px-3 py-1 bg-indigo-50 text-[#3D3F96] font-black rounded-xl text-xs">
                            {plan.daysCount || 5} Days Cycle
                          </span>
                        </td>

                        {/* Instant Single Toggle Switch */}
                        <td className="py-4 px-5 text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={isDeleted || isTogglingThis}
                            onClick={(e) => handleToggleSinglePlan(plan._id, e)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isDeleted
                              ? 'bg-slate-200 opacity-50 cursor-not-allowed'
                              : isChecked
                                ? 'bg-[#3D3F96] cursor-pointer'
                                : 'bg-slate-200 cursor-pointer'
                              }`}
                            title={
                              isDeleted
                                ? "Disabled by Admin"
                                : isChecked
                                  ? "Set Inactive"
                                  : "Set Active"
                            }
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${!isDeleted && isChecked ? 'translate-x-5' : 'translate-x-0'
                                }`}
                            />
                          </button>
                        </td>

                        {/* View Schedule Button */}
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleOpenPlanDetails(plan._id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-[#3D3F96] hover:bg-[#3D3F96]/10 rounded-xl transition-all font-bold text-xs cursor-pointer"
                          >
                            <Eye size={14} />
                            <span>View Formulation</span>
                          </button>
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

      {/* PLAN FULL DETAILS MODAL (DAY-WISE SCHEDULE & INGREDIENTS TABLE) */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4 overflow-y-auto animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedPlan(null)} />

          <div className="bg-white rounded-3xl border border-slate-200 max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl relative z-10 flex flex-col">

            {/* Modal Header */}
            <div className="bg-slate-50 px-6 py-5 border-b border-slate-200/80 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#3D3F96]/10 text-[#3D3F96] flex items-center justify-center border border-[#3D3F96]/10">
                  <Calendar className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase text-[#3D3F96] bg-[#3D3F96]/10 px-2 py-0.5 rounded">
                      {selectedPlan.planId || 'HLP-100'}
                    </span>
                    <span className="text-xs font-black text-slate-800">{selectedPlan.title}</span>
                    {selectedPlan.isDeletedByAdmin && (
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                        {selectedPlan.adminStatusText || 'Disabled by Admin'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold mt-0.5">
                    {selectedPlan.mainCategory} • {selectedPlan.subCategory || "Clinical Diet"} • {selectedPlan.daysCount || 5} Days Program
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              {modalLoading ? (
                <div className="flex flex-col items-center justify-center py-16 space-y-3">
                  <Loader2 className="animate-spin text-[#3D3F96]" size={36} />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Retrieving day-wise formulation & ingredients...
                  </p>
                </div>
              ) : (
                <>
                  {/* Banner & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                    <div className="md:col-span-5 h-44 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                      <img
                        src={getMediaUrl(selectedPlan.bannerImage) || PLACEHOLDER_IMAGE}
                        alt={selectedPlan.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE; }}
                      />
                    </div>

                    <div className="md:col-span-7 space-y-3">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Clinical Description</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1">
                          {selectedPlan.description || selectedPlan.tagline || "Dietitian-designed low-GI high-protein clinical meal package."}
                        </p>
                      </div>

                      {/* Nutritional Highlights */}
                      {selectedPlan.nutritionalHighlights && (
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Daily Avg</span>
                            <span className="text-xs font-black text-slate-800 font-mono">
                              {selectedPlan.nutritionalHighlights.caloriesAvgPerDay || 450} Kcal
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Max Sodium</span>
                            <span className="text-xs font-black text-slate-800 font-mono">
                              {selectedPlan.nutritionalHighlights.maxSodium || "< 500mg"}
                            </span>
                          </div>
                          <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Sat. Fat</span>
                            <span className="text-xs font-black text-slate-800 font-mono">
                              {selectedPlan.nutritionalHighlights.maxSaturatedFat || "< 3g"}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing Matrix */}
                  {selectedPlan.pricing && (
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
                      <div>
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Package Price</span>
                        <p className="font-mono font-black text-slate-900 text-sm mt-0.5">
                          ₹{selectedPlan.pricing.discountTotalPrice || selectedPlan.pricing.totalPrice}
                          {selectedPlan.pricing.discountTotalPrice && (
                            <span className="text-xs text-slate-400 line-through font-normal ml-1.5 font-mono">
                              ₹{selectedPlan.pricing.totalPrice}
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Price / Meal</span>
                        <p className="font-mono font-black text-slate-900 text-sm mt-0.5">
                          ₹{selectedPlan.pricing.discountPricePerMeal || selectedPlan.pricing.pricePerMeal}
                        </p>
                      </div>

                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Customer Savings</span>
                        <p className="font-mono font-black text-emerald-700 text-sm mt-0.5">
                          ₹{selectedPlan.pricing.savingsAmount || 0}
                        </p>
                      </div>

                      <div className="border-l border-slate-200 pl-4">
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Live Status</span>
                        <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md mt-0.5 ${selectedPlan.isDeletedByAdmin
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : selectedPlan.isAvailable
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                          }`}>
                          {selectedPlan.isDeletedByAdmin
                            ? (selectedPlan.adminStatusText || 'Deleted by Admin')
                            : selectedPlan.isAvailable
                              ? 'Active on Menu'
                              : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Day-Wise Schedule Navigation Tabs */}
                  {Array.isArray(selectedPlan.dayWiseSchedule) && selectedPlan.dayWiseSchedule.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                          <Layers size={15} className="text-[#3D3F96]" /> Day-Wise Meal Schedule
                        </span>
                        <div className="flex items-center gap-1 overflow-x-auto max-w-[360px]">
                          {selectedPlan.dayWiseSchedule.map((day) => (
                            <button
                              key={day.dayNumber}
                              type="button"
                              onClick={() => setActiveDayTab(day.dayNumber)}
                              className={`px-3 py-1 text-xs font-extrabold rounded-lg transition cursor-pointer ${activeDayTab === day.dayNumber
                                ? 'bg-[#3D3F96] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                              {day.dayName || `Day ${day.dayNumber}`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Active Day Formulation */}
                      {(() => {
                        const currentDay = selectedPlan.dayWiseSchedule.find((d) => d.dayNumber === activeDayTab) || selectedPlan.dayWiseSchedule[0];
                        if (!currentDay) return null;

                        const mealSections = [
                          { title: "Breakfast", items: currentDay.breakfast || [] },
                          { title: "Lunch", items: currentDay.lunch || [] },
                          { title: "Dinner", items: currentDay.dinner || [] }
                        ];

                        return (
                          <div className="space-y-6">
                            {mealSections.map((section, sIdx) => (
                              <div key={sIdx} className="space-y-3">
                                <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
                                  <Utensils size={13} className="text-[#3D3F96]" /> {section.title}
                                </h4>

                                {section.items.length === 0 ? (
                                  <p className="text-xs text-slate-400 font-medium italic pl-2">No meal items assigned for this slot.</p>
                                ) : (
                                  <div className="space-y-3">
                                    {section.items.map((dish, dIdx) => (
                                      <div key={dIdx} className="border border-slate-200/80 rounded-2xl p-4 bg-slate-50/50 space-y-3">
                                        <div className="flex items-center justify-between">
                                          <div>
                                            <span className="font-extrabold text-slate-900 text-xs sm:text-sm">{dish.name}</span>
                                            <span className="text-[10px] font-bold text-slate-400 block mt-0.5">
                                              Diet: {dish.dietType || "Veg"} • Focus: {dish.foodEffectCategory || "General"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-slate-600 font-mono">₹{dish.price}</span>
                                            {dish.calories && (
                                              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                {dish.calories} Kcal
                                              </span>
                                            )}
                                          </div>
                                        </div>

                                        {/* Structured Ingredients Breakdown Table */}
                                        {Array.isArray(dish.ingredients) && dish.ingredients.length > 0 && (
                                          <div className="overflow-hidden border border-slate-200/70 rounded-xl bg-white shadow-2xs">
                                            <table className="w-full text-left text-xs border-collapse">
                                              <thead>
                                                <tr className="bg-slate-50/80 text-slate-400 font-extrabold uppercase text-[9px] tracking-wider border-b border-slate-100">
                                                  <th className="py-2 px-3">Ingredient Name</th>
                                                  <th className="py-2 px-3 text-center">Portion / Quantity</th>
                                                  <th className="py-2 px-3 text-right">Calories</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 text-slate-700">
                                                {dish.ingredients.map((ing, iIdx) => {
                                                  const isObject = typeof ing === 'object' && ing !== null;
                                                  const ingName = isObject ? ing.name : ing;
                                                  const ingQty = isObject ? (ing.quantity || '—') : '—';
                                                  const ingCal = isObject ? (ing.calories !== undefined ? `${ing.calories} Kcal` : '—') : '—';

                                                  return (
                                                    <tr key={iIdx} className="hover:bg-slate-50/50">
                                                      <td className="py-2 px-3 font-semibold text-slate-800">{ingName}</td>
                                                      <td className="py-2 px-3 text-center font-medium text-slate-500">
                                                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-600">
                                                          {ingQty}
                                                        </span>
                                                      </td>
                                                      <td className="py-2 px-3 text-right font-mono font-bold text-amber-600 text-[11px]">
                                                        {ingCal}
                                                      </td>
                                                    </tr>
                                                  );
                                                })}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Sticky Footer */}
            <div className="border-t border-slate-200/80 p-5 bg-white flex items-center justify-between flex-shrink-0">
              <span className="text-xs text-slate-400 font-bold">
                {selectedPlan.isRepeatAfter7Days ? "Repeats weekly after 7 days" : "Fixed cycle program"}
              </span>
              <button
                onClick={() => setSelectedPlan(null)}
                className="px-6 py-2.5 bg-[#3D3F96] hover:bg-[#2F3175] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close Monograph
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}