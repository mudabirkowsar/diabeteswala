"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Plus,
    Edit3,
    Trash2,
    Check,
    X,
    Loader2,
    RefreshCw,
    Info,
    Activity,
    Layers
} from 'lucide-react';
import { toast, Toaster } from 'react-hot-toast';

// Import your API service functions
import AdminAPI from '../../../../services/AdminAPI';

export default function ManageCategoryPage() {
  // --- Core States ---
  const [foodCategories, setFoodCategories] = useState([]);
  const [effectCategories, setEffectCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // --- Category Form States (Left Column) ---
  const [newCategoryName, setNewCategoryName] = useState('');
  const [inlineEditingCatId, setInlineEditingCatId] = useState(null);
  const [inlineEditingCatName, setInlineEditingCatName] = useState('');

  // --- Therapy Focus Form States (Right Column) ---
  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [inlineEditingDiseaseId, setInlineEditingDiseaseId] = useState(null);
  const [inlineEditingDiseaseName, setInlineEditingDiseaseName] = useState('');

  // --- Fetch and Segment Data ---
  const fetchAllCategories = async () => {
    setLoading(true);
    try {
      const response = await AdminAPI.getFoodCategories();
      if (response && response.success) {
        const allData = response.data || [];
        
        // Filter out items where only the foodCategory string is populated (is not null/undefined)
        const foodCats = allData.filter(item => 
          item.foodCategory !== null && 
          item.foodCategory !== undefined && 
          item.foodCategory !== ""
        );
        
        // Filter out items where only the foodEffectCategory string is populated (is not null/undefined)
        const effectCats = allData.filter(item => 
          item.foodEffectCategory !== null && 
          item.foodEffectCategory !== undefined && 
          item.foodEffectCategory !== ""
        );
        
        setFoodCategories(foodCats);
        setEffectCategories(effectCats);
      } else {
        toast.error("Failed to retrieve category configuration.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error reading category list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCategories();
  }, []);


  // =========================================================================
  // LEFT COLUMN: FOOD CATEGORIES OPERATIONS
  // =========================================================================

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const cleanName = newCategoryName.trim();
    if (!cleanName) return;

    // Check for duplicates
    const exists = foodCategories.some(
      c => c.foodCategory?.toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) {
      toast.error("This Food Category already exists.");
      return;
    }

    setActionLoading(true);
    try {
      // Send only foodCategory to allow foodEffectCategory to default to null
      const payload = {
        foodCategory: cleanName
      };
      const response = await AdminAPI.addFoodCategory(payload);
      if (response && response.success) {
        toast.success(response.message || "Food Category added successfully.");
        setNewCategoryName('');
        fetchAllCategories();
      } else {
        toast.error("Failed to register Food Category.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding Food Category.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (id) => {
    const cleanName = inlineEditingCatName.trim();
    if (!cleanName) return;

    setActionLoading(true);
    try {
      const payload = {
        foodCategory: cleanName
      };
      const response = await AdminAPI.updateFoodCategory(id, payload);
      if (response && response.success) {
        toast.success(response.message || "Food Category updated.");
        setInlineEditingCatId(null);
        fetchAllCategories();
      } else {
        toast.error("Failed to update Category.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error saving Category update.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    setActionLoading(true);
    try {
      const response = await AdminAPI.deleteFoodCategory(id);
      if (response && response.success) {
        toast.success(response.message || "Category deleted.");
        fetchAllCategories();
      } else {
        toast.error("Failed to delete Category.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting Category.");
    } finally {
      setActionLoading(false);
    }
  };


  // =========================================================================
  // RIGHT COLUMN: THERAPY FOCUS OPERATIONS
  // =========================================================================

  const handleAddDisease = async (e) => {
    e.preventDefault();
    const cleanName = newDiseaseName.trim();
    if (!cleanName) return;

    const exists = effectCategories.some(
      d => d.foodEffectCategory?.toLowerCase() === cleanName.toLowerCase()
    );
    if (exists) {
      toast.error("This Therapy Focus already exists.");
      return;
    }

    setActionLoading(true);
    try {
      // Send only foodEffectCategory to allow foodCategory to default to null
      const payload = {
        foodEffectCategory: cleanName
      };
      const response = await AdminAPI.addFoodCategory(payload);
      if (response && response.success) {
        toast.success(response.message || "Therapy Focus added.");
        setNewDiseaseName('');
        fetchAllCategories();
      } else {
        toast.error("Failed to register Focus.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error adding Focus.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateDisease = async (id) => {
    const cleanName = inlineEditingDiseaseName.trim();
    if (!cleanName) return;

    setActionLoading(true);
    try {
      const payload = {
        foodEffectCategory: cleanName
      };
      const response = await AdminAPI.updateFoodCategory(id, payload);
      if (response && response.success) {
        toast.success(response.message || "Therapy Focus updated.");
        setInlineEditingDiseaseId(null);
        fetchAllCategories();
      } else {
        toast.error("Failed to update Focus.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating Focus.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDisease = async (id) => {
    setActionLoading(true);
    try {
      const response = await AdminAPI.deleteFoodCategory(id);
      if (response && response.success) {
        toast.success(response.message || "Therapy Focus deleted.");
        fetchAllCategories();
      } else {
        toast.error("Failed to delete Focus.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error deleting Focus.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 py-4 pb-12 antialiased select-none">
      <Toaster position="top-right" />
      
      {/* --- PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-[#3d3f96]/10 text-[#3d3f96] flex items-center justify-center border border-[#3d3f96]/10 flex-shrink-0 shadow-sm">
            <Settings className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Configuration Directory</h1>
            <p className="text-xs text-slate-500 font-bold mt-1">Manage global system directories separately for food divisions and therapeutic focus areas.</p>
          </div>
        </div>
        <button
          onClick={fetchAllCategories}
          disabled={loading}
          className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm text-xs font-bold transition-all disabled:opacity-50 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh System Directories
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* =========================================================================
            COLUMN A: FOOD CATEGORIES DIRECTORY
            ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Layers className="text-[#3d3f96]" size={18} /> Food Category Directory
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Add, update, or remove live category sections stored in the database.</p>
          </div>

          {/* Insertion Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex-1 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">New Category Name</label>
              <input
                type="text"
                required
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Oats & Porridge"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-[10px] uppercase tracking-wider h-[38px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
            </button>
          </form>

          {/* List Table Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/40 rounded-2xl border border-slate-100 border-dashed">
              <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={28} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading food categories...</p>
            </div>
          ) : foodCategories.length > 0 ? (
            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {foodCategories.map((cat) => {
                const isEditingThis = inlineEditingCatId === cat._id;
                return (
                  <div key={cat._id} className="p-4 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50/50 transition-all">
                    {isEditingThis ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={inlineEditingCatName}
                          onChange={(e) => setInlineEditingCatName(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                        <button
                          onClick={() => handleUpdateCategory(cat._id)}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
                          title="Save updates"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setInlineEditingCatId(null)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          title="Discard updates"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#3d3f96]/60"></span>
                          <span className="text-slate-800 text-sm font-black tracking-tight leading-tight">{cat.foodCategory}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setInlineEditingCatId(cat._id);
                              setInlineEditingCatName(cat.foodCategory);
                            }}
                            className="p-2 border border-slate-100 text-slate-400 hover:text-[#3d3f96] hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer"
                            title="Rename Category"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-2 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50/40 border border-slate-100 rounded-2xl border-dashed">
              <Info size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-bold px-4 text-xs">No configuration categories registered yet.</p>
            </div>
          )}
        </div>

        {/* =========================================================================
            COLUMN B: THERAPY FOCUS AREAS DIRECTORY
            ========================================================================= */}
        <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Activity className="text-[#3d3f96]" size={18} /> Therapy Focus Directory
            </h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Add, update, or remove target therapeutic profiles in the database.</p>
          </div>

          {/* Insertion Form */}
          <form onSubmit={handleAddDisease} className="flex gap-2 items-end bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex-1 space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">New Therapy Focus Name</label>
              <input
                type="text"
                required
                value={newDiseaseName}
                onChange={(e) => setNewDiseaseName(e.target.value)}
                placeholder="e.g. Hypertension (Low Sodium)"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:border-[#3d3f96] transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-black text-[10px] uppercase tracking-wider h-[38px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />} Add
            </button>
          </form>

          {/* List Table Container */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-slate-50/40 rounded-2xl border border-slate-100 border-dashed">
              <Loader2 className="animate-spin text-[#3d3f96] mb-3" size={28} />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading therapy focuses...</p>
            </div>
          ) : effectCategories.length > 0 ? (
            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 max-h-[480px] overflow-y-auto [&::-webkit-scrollbar]:hidden">
              {effectCategories.map((dis) => {
                const isEditingThis = inlineEditingDiseaseId === dis._id;
                return (
                  <div key={dis._id} className="p-4 flex items-center justify-between gap-4 text-xs sm:text-sm font-bold text-slate-700 bg-white hover:bg-slate-50/50 transition-all">
                    {isEditingThis ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={inlineEditingDiseaseName}
                          onChange={(e) => setInlineEditingDiseaseName(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        />
                        <button
                          onClick={() => handleUpdateDisease(dis._id)}
                          className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors cursor-pointer"
                          title="Save updates"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => setInlineEditingDiseaseId(null)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          title="Discard updates"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#3d3f96]/60"></span>
                          <span className="text-slate-800 text-sm font-black tracking-tight leading-tight">{dis.foodEffectCategory}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setInlineEditingDiseaseId(dis._id);
                              setInlineEditingDiseaseName(dis.foodEffectCategory);
                            }}
                            className="p-2 border border-slate-100 text-slate-400 hover:text-[#3d3f96] hover:bg-slate-50/50 rounded-xl transition-all cursor-pointer"
                            title="Rename Focus"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteDisease(dis._id)}
                            className="p-2 border border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Focus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50/40 border border-slate-100 rounded-2xl border-dashed">
              <Info size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-500 font-bold px-4 text-xs">No configuration focus areas registered yet.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}