'use client';

import React, { useState, useEffect } from 'react';
import AdminAPI from '../../../../services/AdminAPI';
import CreateCategory from './components/CreateCategory';
import CreatePlan from './components/CreatePlan';
import ViewCategories from './components/ViewCategories';
import PlanDetail from './components/PlanDetail';
import {
  PlusCircle,
  FolderPlus,
  Eye,
  Utensils,
  Search,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Calendar,
  Sparkles,
  Image as ImageIcon,
  Archive,
  AlertCircle,
  Users,
  UserCheck,
  ShieldCheck,
  Flame,
  Tag
} from 'lucide-react';

export default function HealthyPlansPage() {
  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Selected for Edit or Details
  const [selectedCategoryToEdit, setSelectedCategoryToEdit] = useState(null);
  const [selectedPlanToEdit, setSelectedPlanToEdit] = useState(null);
  const [selectedPlanIdForDetail, setSelectedPlanIdForDetail] = useState(null);

  // Plans List & Filters state
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // Search & Filter parameters
  const [filters, setFilters] = useState({
    search: '',
    mainCategory: '',
    subCategory: '',
    programType: '',
    daysCount: '',
  });

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
    fetchCategories();
    fetchPlans();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await AdminAPI.getAllHealthyCategories();
      setCategories(res?.data || []);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchPlans = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      const params = {};
      if (appliedFilters.search) params.search = appliedFilters.search;
      if (appliedFilters.mainCategory) params.mainCategory = appliedFilters.mainCategory;
      if (appliedFilters.subCategory) params.subCategory = appliedFilters.subCategory;
      if (appliedFilters.programType) params.programType = appliedFilters.programType;
      if (appliedFilters.daysCount) params.daysCount = appliedFilters.daysCount;

      const res = await AdminAPI.getAllHealthyPlans(params);
      setPlans(res?.data || []);
    } catch (err) {
      console.error('Failed to load healthy plans', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    const updated = { ...filters, [field]: value };
    if (field === 'mainCategory') updated.subCategory = '';
    setFilters(updated);
    fetchPlans(updated);
  };

  const handleToggleStatus = async (id, isDeleted) => {
    if (isDeleted) {
      alert('This plan is soft-deleted/archived and cannot be activated.');
      return;
    }

    try {
      await AdminAPI.toggleHealthyPlanStatus(id);
      fetchPlans();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  // Soft Delete Handler
  const handleDeletePlan = async (id, title, planId) => {
    const confirmArchival = window.confirm(
      `Soft Delete / Archive Healthy Plan:\n"${title}" (${planId || id})\n\n` +
      `• The plan will be disabled and auto-disabled from vendor menus.\n` +
      `• Active user subscribers will continue their plan uninterrupted.\n\n` +
      `Do you want to proceed with archiving this plan?`
    );
    if (!confirmArchival) return;

    try {
      const res = await AdminAPI.deleteHealthyPlan(id);
      if (res?.message) {
        alert(res.message);
      }
      fetchPlans();
    } catch (err) {
      console.error('Failed to delete/archive plan', err);
      alert(err.response?.data?.message || 'Failed to soft delete plan');
    }
  };

  const handleOpenPlanDetails = (planId) => {
    setSelectedPlanIdForDetail(planId);
    setIsDetailModalOpen(true);
  };

  const handleOpenEditPlan = async (plan) => {
    try {
      const res = await AdminAPI.getHealthyPlanById(plan._id);
      setSelectedPlanToEdit(res?.data || plan);
      setIsPlanModalOpen(true);
    } catch (err) {
      setSelectedPlanToEdit(plan);
      setIsPlanModalOpen(true);
    }
  };

  const selectedCategoryObj = categories.find((c) => c.mainCategory === filters.mainCategory);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Healthy Diet Plans</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage target categories, day-wise meal subscriptions, and live active subscribers
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsViewModalOpen(true)}
            className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition cursor-pointer"
          >
            <Eye size={18} className="text-[#3d3f96]" />
            <span>View Categories</span>
          </button>

          <button
            onClick={() => {
              setSelectedCategoryToEdit(null);
              setIsCategoryModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-white border border-[#3d3f96]/30 text-[#3d3f96] hover:bg-[#3d3f96]/5 px-4 py-2.5 rounded-xl font-bold text-sm shadow-xs transition cursor-pointer"
          >
            <FolderPlus size={18} />
            <span>Create Category</span>
          </button>

          <button
            onClick={() => {
              setSelectedPlanToEdit(null);
              setIsPlanModalOpen(true);
            }}
            className="inline-flex items-center gap-2 bg-[#3d3f96] hover:bg-[#343680] text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-[#3d3f96]/20 transition cursor-pointer"
          >
            <PlusCircle size={18} />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Filters Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search plans..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none"
              />
            </div>

            {/* Main Category */}
            <select
              value={filters.mainCategory}
              onChange={(e) => handleFilterChange('mainCategory', e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none bg-white font-medium cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.mainCategory}>
                  {cat.mainCategory}
                </option>
              ))}
            </select>

            {/* SubCategory */}
            <select
              value={filters.subCategory}
              disabled={!filters.mainCategory}
              onChange={(e) => handleFilterChange('subCategory', e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none bg-white disabled:bg-gray-100 font-medium cursor-pointer"
            >
              <option value="">All Subcategories</option>
              {selectedCategoryObj?.subCategories?.map((sub) => (
                <option key={sub._id || sub.name} value={sub.name}>
                  {sub.name}
                </option>
              ))}
            </select>

            {/* Program Type */}
            <select
              value={filters.programType}
              onChange={(e) => handleFilterChange('programType', e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none bg-white font-medium cursor-pointer"
            >
              <option value="">All Program Types</option>
              <option value="Full Program">Full Program</option>
              <option value="Breakfast & Lunch">Breakfast & Lunch</option>
              <option value="Lunches & Dinners">Lunches & Dinners</option>
            </select>

            {/* Days Filter */}
            <select
              value={filters.daysCount}
              onChange={(e) => handleFilterChange('daysCount', e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#3d3f96] outline-none bg-white font-medium cursor-pointer"
            >
              <option value="">All Durations</option>
              <option value="3">3 Days</option>
              <option value="5">5 Days</option>
              <option value="7">7 Days</option>
              <option value="14">14 Days</option>
              <option value="28">28 Days</option>
            </select>
          </div>
        </div>

        {/* Plans Grid */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="animate-spin text-[#3d3f96] mb-2" size={32} />
            <span className="text-sm font-bold">Loading healthy diet plans...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-xs">
            <Utensils size={36} className="text-gray-300 mx-auto mb-3" />
            <p className="text-base font-bold text-gray-800">No Healthy Plans Found</p>
            <p className="text-xs text-gray-400 mt-1">
              Click on &quot;Create Plan&quot; to configure your first day-wise plan.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const bannerSrc = getFullImageUrl(plan.bannerImage);
              const isSoftDeleted = !!plan.isDeleted;
              const activeSubs = plan.activeSubscribersCount ?? 0;
              const totalSubs = plan.totalSubscribersCount ?? 0;

              return (
                <div
                  key={plan._id}
                  className={`bg-white border rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group ${
                    isSoftDeleted
                      ? 'border-rose-200 bg-rose-50/20 opacity-80'
                      : 'border-gray-200 hover:border-[#3d3f96]/30'
                  }`}
                >
                  <div>
                    {/* Banner Image Preview */}
                    <div
                      onClick={() => handleOpenPlanDetails(plan._id)}
                      className="relative h-48 w-full bg-gray-900 overflow-hidden cursor-pointer"
                    >
                      {bannerSrc ? (
                        <img
                          src={bannerSrc}
                          alt={plan.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://placehold.co/600x400/e2e8f0/64748b?text=Plan+Banner';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 text-xs gap-1">
                          <ImageIcon size={24} />
                          <span>No Banner Image</span>
                        </div>
                      )}

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/30" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-[#3d3f96] text-white shadow-sm uppercase tracking-wider">
                          {plan.mainCategory} • {plan.subCategory}
                        </span>
                      </div>

                      {/* Top Right Badges: Popular / Recommended / Archived */}
                      <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
                        {isSoftDeleted ? (
                          <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-rose-600 text-white flex items-center gap-1 shadow-sm uppercase">
                            <Archive size={11} /> Archived
                          </span>
                        ) : (
                          <>
                            {plan.isPopular && (
                              <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-amber-500 text-white flex items-center gap-1 shadow-sm uppercase">
                                <Sparkles size={11} /> Popular
                              </span>
                            )}
                            {plan.isRecommended && (
                              <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-600 text-white flex items-center gap-1 shadow-sm uppercase">
                                <ShieldCheck size={11} /> Recommended
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Floating Bottom Subscriber Tag on Image */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg font-bold">
                          <Users size={13} className="text-[#3d3f96]" />
                          <span className="text-emerald-400">{activeSubs} Active</span>
                          <span className="text-slate-300 font-normal">({totalSubs} Total)</span>
                        </div>

                        {plan.nutritionalHighlights?.caloriesAvgPerDay && (
                          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-bold text-orange-400">
                            <Flame size={12} className="fill-orange-400" />
                            {plan.nutritionalHighlights.caloriesAvgPerDay} kcal
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body Info */}
                    <div className="p-5 space-y-3.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#3d3f96] bg-[#3d3f96]/10 px-2.5 py-0.5 rounded-md">
                          {plan.planId || 'HLP-Plan'}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1 font-bold">
                          <Calendar size={13} /> {plan.daysCount} Days ({plan.programType})
                        </span>
                      </div>

                      <div>
                        <h3
                          onClick={() => handleOpenPlanDetails(plan._id)}
                          className="font-black text-gray-900 text-base leading-snug line-clamp-1 cursor-pointer hover:text-[#3d3f96] transition"
                        >
                          {plan.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed font-medium">
                          {plan.tagline || plan.description}
                        </p>
                      </div>

                      {/* Subscriber Live Status Bar */}
                      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <span className="text-slate-600 font-bold flex items-center gap-1.5">
                          <UserCheck size={14} className="text-[#3d3f96]" /> Subscriptions
                        </span>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                            {activeSubs} Active
                          </span>
                          <span className="text-slate-400 font-medium text-[11px]">
                            / {totalSubs} Total
                          </span>
                        </div>
                      </div>

                      {/* Pricing Section */}
                      <div className="flex items-baseline justify-between pt-2 border-t border-gray-100">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-gray-400">Total Price</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-black text-gray-900">
                              ₹{plan.pricing?.discountTotalPrice || plan.pricing?.totalPrice}
                            </span>
                            {plan.pricing?.discountTotalPrice && plan.pricing?.totalPrice > plan.pricing?.discountTotalPrice && (
                              <span className="text-xs text-gray-400 line-through font-semibold">
                                ₹{plan.pricing?.totalPrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-gray-400">Per Meal</span>
                          <p className="text-xs font-black text-[#3d3f96]">
                            ₹{plan.pricing?.discountPricePerMeal || plan.pricing?.pricePerMeal}
                          </p>
                          {plan.pricing?.savingsAmount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              Save ₹{plan.pricing.savingsAmount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="px-5 py-3.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between">
                    {/* Status Toggle Button / Archived Label */}
                    {isSoftDeleted ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-100 text-rose-700 flex items-center gap-1">
                        <AlertCircle size={12} /> Archived
                      </span>
                    ) : (
                      <button
                        onClick={() => handleToggleStatus(plan._id, isSoftDeleted)}
                        className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-2xs ${
                          plan.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        {plan.isActive ? <CheckCircle size={13} /> : <XCircle size={13} />}
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </button>
                    )}

                    {/* Action Icons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenPlanDetails(plan._id)}
                        className="p-2 text-gray-500 hover:text-[#3d3f96] rounded-xl hover:bg-white transition cursor-pointer border border-transparent hover:border-gray-200 shadow-2xs"
                        title="View Full Details"
                      >
                        <Eye size={16} />
                      </button>

                      {!isSoftDeleted && (
                        <button
                          onClick={() => handleOpenEditPlan(plan)}
                          className="p-2 text-gray-500 hover:text-[#3d3f96] rounded-xl hover:bg-white transition cursor-pointer border border-transparent hover:border-gray-200 shadow-2xs"
                          title="Edit Plan"
                        >
                          <Edit size={16} />
                        </button>
                      )}

                      {!isSoftDeleted && (
                        <button
                          onClick={() => handleDeletePlan(plan._id, plan.title, plan.planId)}
                          className="p-2 text-gray-500 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition cursor-pointer border border-transparent hover:border-rose-200 shadow-2xs"
                          title="Soft Delete / Archive Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 1. View Categories Modal */}
      <ViewCategories
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        onEditCategory={(cat) => {
          setSelectedCategoryToEdit(cat);
          setIsCategoryModalOpen(true);
        }}
        onDataChange={() => {
          fetchCategories();
          fetchPlans();
        }}
      />

      {/* 2. Create / Edit Category Modal */}
      <CreateCategory
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCategoryToEdit(null);
        }}
        onSuccess={() => {
          fetchCategories();
          fetchPlans();
        }}
        editCategoryData={selectedCategoryToEdit}
      />

      {/* 3. Create / Edit Plan Modal */}
      <CreatePlan
        isOpen={isPlanModalOpen}
        onClose={() => {
          setIsPlanModalOpen(false);
          setSelectedPlanToEdit(null);
        }}
        onSuccess={() => {
          fetchPlans();
        }}
        editPlanData={selectedPlanToEdit}
      />

      {/* 4. Plan Full Details Pop-up Modal */}
      <PlanDetail
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedPlanIdForDetail(null);
        }}
        planId={selectedPlanIdForDetail}
      />
    </div>
  );
}