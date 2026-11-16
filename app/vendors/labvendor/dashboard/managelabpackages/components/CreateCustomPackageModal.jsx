"use client";
import React, { useState, useEffect, useMemo } from "react";
import { X, Search, Check, Loader2, Sparkles, IndianRupee, Percent, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import LabVendorAPI from "../../../../../services/LabVendorAPI";

export default function CreateCustomPackageModal({ isOpen, onClose, onSuccess }) {
  const [loadingTests, setLoadingTests] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [masterTests, setMasterTests] = useState([]);
  const [testSearch, setTestSearch] = useState("");

  // Form State
  const [selectedTestIds, setSelectedTestIds] = useState([]);
  const [formData, setFormData] = useState({
    packageName: "",
    mainCategory: "Clinical Pathology",
    category: "",
    mrp: "",
    discountPercent: 0,
    reportTime: "12 Hours",
    isFastingRequired: false,
    fastingDuration: "10-12 Hours",
    gender: "Both",
    ageGroup: "All",
    precaution: "",
    description: ""
  });

  // Fetch Master Tests on Open
  useEffect(() => {
    if (!isOpen) return;
    const fetchTests = async () => {
      setLoadingTests(true);
      try {
        const res = await LabVendorAPI.getMasterTestsForPackage();
        if (res && res.success) {
          setMasterTests(res.data || []);
        }
      } catch (err) {
        toast.error("Failed to load diagnostic tests.");
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, [isOpen]);

  // Real-time Offer Price Calculator
  const offerPrice = useMemo(() => {
    const mrp = Number(formData.mrp) || 0;
    const discount = Number(formData.discountPercent) || 0;
    if (mrp <= 0) return 0;
    return Math.max(0, Math.round(mrp - mrp * (discount / 100)));
  }, [formData.mrp, formData.discountPercent]);

  // Filter master tests by search
  const filteredTests = useMemo(() => {
    const q = testSearch.toLowerCase().trim();
    if (!q) return masterTests;
    return masterTests.filter(
      (t) =>
        t.testName?.toLowerCase().includes(q) ||
        t.sampleType?.toLowerCase().includes(q) ||
        t.mainCategory?.toLowerCase().includes(q)
    );
  }, [masterTests, testSearch]);

  const toggleTest = (id) => {
    setSelectedTestIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.packageName.trim()) {
      return toast.error("Please enter a package title.");
    }
    if (selectedTestIds.length === 0) {
      return toast.error("Please select at least one test to include.");
    }
    if (!formData.mrp || Number(formData.mrp) <= 0) {
      return toast.error("Please specify a valid MRP greater than 0.");
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        mrp: Number(formData.mrp),
        discountPercent: Number(formData.discountPercent) || 0,
        tests: selectedTestIds
      };

      const res = await LabVendorAPI.createCustomLabPackage(payload);
      if (res && res.success) {
        toast.success(res.message || "Custom package created successfully!");
        onSuccess();
      } else {
        toast.error(res?.message || "Failed to create package.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit package.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !submitting && onClose()} />

      <div className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-100 relative z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="text-[#3d3f96]" size={20} /> Build Custom Diagnostic Package
            </h2>
            <p className="text-slate-500 text-xs font-semibold mt-0.5">
              Select tests from the platform catalog, set your laboratory's MRP, and offer promotional discounts.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* 1. BASIC INFORMATION */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
              1. Package Profile & Category
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Package Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diabetic Kidney & Gut Health Combo"
                  value={formData.packageName}
                  onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Subcategory</label>
                <input
                  type="text"
                  placeholder="e.g. Diabetic Screening"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* 2. MULTI-SELECT MASTER TESTS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block">
                2. Select Included Diagnostic Tests ({selectedTestIds.length} Selected) *
              </span>
              {selectedTestIds.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTestIds([])}
                  className="text-[11px] font-bold text-rose-500 hover:underline"
                >
                  Clear Selection
                </button>
              )}
            </div>

            {/* Test Search Bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search tests by name, sample (e.g. Blood, Urine), or category..."
                value={testSearch}
                onChange={(e) => setTestSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
              />
            </div>

            {/* Test Selector Box */}
            <div className="border border-slate-200 rounded-2xl max-h-52 overflow-y-auto p-2 bg-slate-50/50 space-y-1.5">
              {loadingTests ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 size={20} className="animate-spin text-[#3d3f96] mb-1" />
                  <span className="text-xs font-semibold">Loading test catalog...</span>
                </div>
              ) : filteredTests.length > 0 ? (
                filteredTests.map((test) => {
                  const isChecked = selectedTestIds.includes(test._id);
                  return (
                    <div
                      key={test._id}
                      onClick={() => toggleTest(test._id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isChecked
                          ? "border-[#3d3f96] bg-indigo-50/60 ring-1 ring-indigo-500/20"
                          : "border-slate-200/80 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked ? "bg-[#3d3f96] border-[#3d3f96] text-white" : "border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check size={11} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 leading-tight">{test.testName}</p>
                          <span className="text-[10px] text-slate-400 font-semibold">
                            Sample: <strong className="text-slate-600">{test.sampleType || "Standard"}</strong> •{" "}
                            {test.mainCategory}
                          </span>
                        </div>
                      </div>

                      {test.standardMRP && (
                        <span className="text-xs font-extrabold text-slate-700">₹ {test.standardMRP}</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">No tests match your search.</p>
              )}
            </div>
          </div>

          {/* 3. PRICING & TURNAROUND */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
              3. Pricing & Turnaround Time
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Package MRP (₹) *</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="900"
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Discount Percent (%)</label>
                <div className="relative">
                  <Percent size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="20"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Turnaround Time</label>
                <div className="relative">
                  <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.reportTime}
                    onChange={(e) => setFormData({ ...formData, reportTime: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Offer Price Live Calculator Callout */}
            <div className="mt-3 p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Calculated Patient Offer Price</span>
                <span className="text-base font-black text-[#3d3f96]">₹ {offerPrice}</span>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-semibold">
                Formula: ₹{formData.mrp || 0} - {formData.discountPercent || 0}%
              </div>
            </div>
          </div>

          {/* 4. CLINICAL INSTRUCTIONS */}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 block mb-3">
              4. Patient Preparation & Demographics
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                >
                  <option value="Both">Both (Unisex)</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Target Age Group</label>
                <select
                  value={formData.ageGroup}
                  onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96]"
                >
                  <option value="All">All Ages</option>
                  <option value="Adults">Adults</option>
                  <option value="Senior Citizen">Senior Citizen</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="fastingCheck"
                  checked={formData.isFastingRequired}
                  onChange={(e) => setFormData({ ...formData, isFastingRequired: e.target.checked })}
                  className="w-4 h-4 accent-[#3d3f96] rounded cursor-pointer"
                />
                <label htmlFor="fastingCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Requires Fasting
                </label>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Patient Instructions</label>
              <input
                type="text"
                placeholder="e.g. First morning urine and fresh stool sample required in sterile containers."
                value={formData.precaution}
                onChange={(e) => setFormData({ ...formData, precaution: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-[#3d3f96] focus:bg-white"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="py-2.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="py-2.5 px-6 bg-[#3d3f96] hover:bg-[#2d2f75] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <span>Create & Publish Package</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}