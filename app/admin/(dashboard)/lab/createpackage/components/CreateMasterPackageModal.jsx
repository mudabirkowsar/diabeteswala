"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  Loader2,
  PackagePlus,
  Check,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

const SAMPLE_TYPE_OPTIONS = ["Blood", "Urine", "Stool", "Saliva", "Serum", "Swab"];

export default function CreateMasterPackageModal({ isOpen, onClose, onSuccess }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [testSearchQuery, setTestSearchQuery] = useState("");
  const [testCategoryFilter, setTestCategoryFilter] = useState("All");

  const [formData, setFormData] = useState({
    packageName: '',
    mainCategory: '',
    category: '',
    standardMRP: '',
    reportTime: '24 Hours',
    sampleTypes: ['Blood'],
    gender: 'Both',
    ageGroup: 'All',
    isFastingRequired: false,
    fastingDuration: '10-12 Hours',
    tests: [],
    isActive: true
  });

  // Fetch Master Tests on Open
  useEffect(() => {
    if (!isOpen) return;

    const loadMasterTests = async () => {
      setTestsLoading(true);
      try {
        // Fallbacks if getMasterTests is named differently in AdminAPI
        const fetcher = AdminAPI.getMasterTestsCatalog;
        if (typeof fetcher === 'function') {
          const res = await fetcher();
          if (res && res.success) {
            setAvailableTests(res.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to load master tests:", err);
      } finally {
        setTestsLoading(false);
      }
    };

    loadMasterTests();
  }, [isOpen]);

  // Extract unique categories from available tests
  const dynamicCategories = useMemo(() => {
    if (!availableTests || availableTests.length === 0) return [];
    return Array.from(new Set(availableTests.map((t) => t.mainCategory?.trim()).filter(Boolean)));
  }, [availableTests]);

  // Auto-set initial category
  useEffect(() => {
    if (dynamicCategories.length > 0 && !formData.mainCategory) {
      setFormData((prev) => ({ ...prev, mainCategory: dynamicCategories[0] }));
    }
  }, [dynamicCategories, formData.mainCategory]);

  // Reset form on close
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        packageName: '',
        mainCategory: '',
        category: '',
        standardMRP: '',
        reportTime: '24 Hours',
        sampleTypes: ['Blood'],
        gender: 'Both',
        ageGroup: 'All',
        isFastingRequired: false,
        fastingDuration: '10-12 Hours',
        tests: [],
        isActive: true
      });
      setTestSearchQuery("");
      setTestCategoryFilter("All");
    }
  }, [isOpen]);

  // Master tests filtering
  const filteredAvailableTests = useMemo(() => {
    return availableTests.filter((t) => {
      const matchesCat =
        testCategoryFilter === "All" ||
        t.mainCategory?.trim().toLowerCase() === testCategoryFilter.trim().toLowerCase();
      const q = testSearchQuery.toLowerCase().trim();
      const matchesQ =
        !q ||
        t.testName?.toLowerCase().includes(q) ||
        t.sampleType?.toLowerCase().includes(q);
      return matchesCat && matchesQ;
    });
  }, [availableTests, testCategoryFilter, testSearchQuery]);

  if (!isOpen) return null;

  const handleToggleTest = (testId) => {
    setFormData((prev) => {
      const exists = prev.tests.includes(testId);
      return {
        ...prev,
        tests: exists ? prev.tests.filter((id) => id !== testId) : [...prev.tests, testId]
      };
    });
  };

  const handleToggleSampleType = (sample) => {
    setFormData((prev) => {
      const exists = prev.sampleTypes.includes(sample);
      return {
        ...prev,
        sampleTypes: exists
          ? prev.sampleTypes.filter((s) => s !== sample)
          : [...prev.sampleTypes, sample]
      };
    });
  };

  // Benchmark sum from selected tests
  const benchmarkMRP = availableTests
    .filter((t) => formData.tests.includes(t._id))
    .reduce((acc, t) => acc + Number(t.standardMRP || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.packageName.trim()) {
      toast.error("Package name is required.");
      return;
    }
    if (formData.tests.length === 0) {
      toast.error("Please bundle at least 1 test in this package.");
      return;
    }
    if (!formData.standardMRP || Number(formData.standardMRP) <= 0) {
      toast.error("Please enter a valid Standard MRP.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        packageName: formData.packageName.trim(),
        mainCategory: formData.mainCategory.trim() || "Pathology",
        category: formData.category.trim() || "General",
        standardMRP: Number(formData.standardMRP),
        reportTime: formData.reportTime,
        sampleTypes: formData.sampleTypes,
        isFastingRequired: Boolean(formData.isFastingRequired),
        fastingDuration: formData.isFastingRequired ? formData.fastingDuration : undefined,
        gender: formData.gender,
        ageGroup: formData.ageGroup,
        tests: formData.tests,
        isActive: Boolean(formData.isActive)
      };

      const response = await AdminAPI.adminCreateMasterPackage({
        type: "package",
        payload
      });

      if (response && response.success) {
        toast.success(response.message || "Master package created successfully!");
        onSuccess();
      } else {
        toast.error(response?.message || "Failed to create package.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while creating master package.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-[#3d3f96] flex items-center justify-center">
            <PackagePlus size={20} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Admin Platform Suite</span>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Create Master Health Package</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {/* Title & Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package Name *</label>
              <input
                type="text"
                required
                value={formData.packageName}
                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                placeholder="e.g. Comprehensive Full Body Checkup"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Category *</label>
              <input
                type="text"
                required
                value={formData.mainCategory}
                onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                placeholder="e.g. Pathology"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Subcategory / Concern</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                placeholder="e.g. Full Body, Cardiac, Diabetic"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Standard Benchmark MRP (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.standardMRP}
                onChange={(e) => setFormData({ ...formData, standardMRP: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                placeholder="1999"
              />
            </div>
          </div>

          {/* Master Test Picker */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#3d3f96]" /> Bundle Master Tests ({formData.tests.length} Selected) *
              </label>
              {benchmarkMRP > 0 && (
                <span className="text-[10px] font-bold text-slate-500">
                  Tests Combined MRP: <strong className="text-slate-800">₹{benchmarkMRP}</strong>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <div className="md:col-span-2 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  type="text"
                  placeholder="Search master tests..."
                  value={testSearchQuery}
                  onChange={(e) => setTestSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                />
              </div>

              <select
                value={testCategoryFilter}
                onChange={(e) => setTestCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="All">All Categories</option>
                {dynamicCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="max-h-44 overflow-y-auto border border-slate-100 rounded-2xl p-2 bg-slate-50/50 space-y-1.5 [&::-webkit-scrollbar]:hidden">
              {testsLoading ? (
                <div className="py-6 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                  <Loader2 size={14} className="animate-spin text-[#3d3f96]" /> Loading Directory...
                </div>
              ) : filteredAvailableTests.length > 0 ? (
                filteredAvailableTests.map((t) => {
                  const isSelected = formData.tests.includes(t._id);
                  return (
                    <div
                      key={t._id}
                      onClick={() => handleToggleTest(t._id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-indigo-50/80 border-[#3d3f96]/30 text-[#3d3f96]'
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border text-white ${isSelected ? 'bg-[#3d3f96] border-[#3d3f96]' : 'border-slate-300 bg-white'}`}>
                          {isSelected && <Check size={12} />}
                        </div>
                        <span className="text-xs font-bold">{t.testName}</span>
                      </div>
                      <span className="text-xs font-black text-slate-600">₹{t.standardMRP || 0}</span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 text-center py-4">No master tests found.</p>
              )}
            </div>
          </div>

          {/* Sample Types Multi-Select */}
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Specimen Types Included</label>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TYPE_OPTIONS.map((sample) => {
                const selected = formData.sampleTypes.includes(sample);
                return (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => handleToggleSampleType(sample)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      selected
                        ? 'bg-[#3d3f96] text-white border-[#3d3f96]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sample}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Demographics & Operational */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Time</label>
              <input
                type="text"
                value={formData.reportTime}
                onChange={(e) => setFormData({ ...formData, reportTime: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                placeholder="24 Hours"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="Both">Both</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Age Bracket</label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-none focus:border-[#3d3f96] cursor-pointer"
              >
                <option value="All">All Ages</option>
                <option value="Adults">Adults</option>
                <option value="Senior Citizen">Senior Citizen</option>
              </select>
            </div>
          </div>

          {/* Fasting Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="adminFastingReq"
                checked={formData.isFastingRequired}
                onChange={(e) => setFormData({ ...formData, isFastingRequired: e.target.checked })}
                className="w-4 h-4 rounded text-[#3d3f96] cursor-pointer"
              />
              <label htmlFor="adminFastingReq" className="text-xs font-bold text-slate-700 cursor-pointer">
                Fasting Required
              </label>
            </div>

            {formData.isFastingRequired && (
              <div className="space-y-1">
                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Fasting Duration</label>
                <input
                  type="text"
                  value={formData.fastingDuration}
                  onChange={(e) => setFormData({ ...formData, fastingDuration: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                  placeholder="10-12 Hours"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="py-3 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-[10px] uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <span>Publish Master Package</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}