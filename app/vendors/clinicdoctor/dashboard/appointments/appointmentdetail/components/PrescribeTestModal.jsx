"use client";

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  FlaskConical,
  X,
  Search,
  Plus,
  Trash2,
  Send,
  Loader2,
  Building2,
  Package,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import ClinicDoctorAPI from '../../../../../../services/ClinicDoctorAPI';

export default function PrescribeTestModal({ appointmentId, isOpen, onClose, onSuccess }) {
  // Test Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [testsList, setTestsList] = useState([]);
  const [packagesList, setPackagesList] = useState([]);
  const [clinicLabInfo, setClinicLabInfo] = useState(null);
  const [searching, setSearching] = useState(false);
  const [activeTab, setActiveTab] = useState('tests'); // 'tests' | 'packages'

  // Selected Tests for Requisition State
  const [selectedItems, setSelectedItems] = useState([]);
  const [priority, setPriority] = useState('Routine'); // 'Routine' | 'Urgent' | 'Emergency'
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Manual Custom Test Input State
  const [customName, setCustomName] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');

  // Fetch Lab Tests and Packages from API
  const fetchLabTests = useCallback(async (search = '', category = '') => {
    setSearching(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category.trim()) params.category = category.trim();

      const response = await ClinicDoctorAPI.getDoctorPanelLabTests(params);
      if (response && response.success) {
        setTestsList(response.tests || []);
        setPackagesList(response.packages || []);
        if (response.clinicLab) setClinicLabInfo(response.clinicLab);
      } else {
        setTestsList([]);
        setPackagesList([]);
      }
    } catch (err) {
      console.error("Error fetching lab tests:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to load lab tests");
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const delayDebounce = setTimeout(() => {
      fetchLabTests(searchQuery, selectedCategory);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [isOpen, searchQuery, selectedCategory, fetchLabTests]);

  if (!isOpen) return null;

  // Add Lab Test
  const handleAddTest = (test) => {
    const isAlreadyAdded = selectedItems.some(
      (item) => item.testId === test._id || item.name.toLowerCase() === test.name.toLowerCase()
    );
    if (isAlreadyAdded) {
      toast.error(`${test.name} is already added.`);
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        testId: test._id,
        packageId: null,
        itemType: 'LabTest',
        name: test.name,
        category: test.category || 'Pathology',
        sampleType: test.sampleType || 'Blood',
        price: test.price || test.mrp || 0,
        instructions: test.precaution || '',
        inClinicLab: test.inClinicLab
      }
    ]);
  };

  // Add Lab Package
  const handleAddPackage = (pkg) => {
    const isAlreadyAdded = selectedItems.some(
      (item) => item.packageId === pkg._id || item.name.toLowerCase() === pkg.name.toLowerCase()
    );
    if (isAlreadyAdded) {
      toast.error(`${pkg.name} is already added.`);
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        testId: null,
        packageId: pkg._id,
        itemType: 'LabPackage',
        name: pkg.name,
        category: pkg.category || 'Package',
        sampleType: Array.isArray(pkg.sampleTypes) ? pkg.sampleTypes.join(', ') : 'Blood',
        price: pkg.price || pkg.mrp || 0,
        instructions: pkg.precaution || (pkg.isFastingRequired ? `Fasting required (${pkg.fastingDuration || '8-10 Hours'})` : ''),
        inClinicLab: pkg.inClinicLab
      }
    ]);
  };

  // Add Custom Manual Test
  const handleAddCustomTest = () => {
    if (!customName.trim()) {
      toast.error("Please enter a test name.");
      return;
    }

    const isAlreadyAdded = selectedItems.some(
      (item) => item.name.toLowerCase() === customName.trim().toLowerCase()
    );
    if (isAlreadyAdded) {
      toast.error(`${customName} is already added.`);
      return;
    }

    setSelectedItems([
      ...selectedItems,
      {
        testId: null,
        packageId: null,
        itemType: 'Manual',
        name: customName.trim(),
        category: 'Custom',
        sampleType: 'Standard',
        price: Number(customPrice) || 0,
        instructions: customInstructions.trim() || 'Manual test order',
        inClinicLab: false
      }
    ]);

    setCustomName('');
    setCustomPrice('');
    setCustomInstructions('');
  };

  // Update Instructions
  const handleUpdateItemInstructions = (index, value) => {
    const updated = [...selectedItems];
    updated[index].instructions = value;
    setSelectedItems(updated);
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    setSelectedItems(selectedItems.filter((_, idx) => idx !== index));
  };

  // Submit Referral to Clinic Lab
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      toast.error("Please select or add at least one test/package.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        priority,
        notes: notes.trim(),
        tests: selectedItems.map((item) => {
          const formatted = {
            name: item.name,
            price: item.price || 0,
            instructions: item.instructions || ''
          };
          if (item.testId) formatted.testId = item.testId;
          if (item.packageId) formatted.packageId = item.packageId;
          return formatted;
        })
      };

      const response = await ClinicDoctorAPI.sendLabReferralToClinicLab(appointmentId, payload);
      if (response && response.success) {
        toast.success(response.message || "Lab tests referred to Clinic Lab successfully!");
        if (onSuccess) onSuccess(response.data);
        onClose();
      } else {
        toast.error(response?.message || "Failed to refer lab tests");
      }
    } catch (err) {
      console.error("Error referring tests to lab:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to refer lab tests.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full shadow-2xl border border-slate-100 space-y-5 my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5 text-cyan-600">
            <FlaskConical size={22} />
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Prescribe Diagnostic &amp; Lab Tests
              </h3>
              {clinicLabInfo && (
                <p className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                  <Building2 size={11} className="text-cyan-600" />
                  Target: <strong className="text-slate-800">{clinicLabInfo.name}</strong> ({clinicLabInfo.address})
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Section 1: Catalog Search & Filter Strip */}
          <div className="p-4 bg-cyan-50/40 rounded-3xl border border-cyan-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Type Switcher */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-cyan-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('tests')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'tests'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Individual Tests ({testsList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('packages')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    activeTab === 'packages'
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Health Packages ({packagesList.length})
                </button>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 bg-white border border-cyan-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Pathology">Pathology</option>
                <option value="Diabetes">Diabetes</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Endocrine">Endocrine</option>
                <option value="Radiology">Radiology</option>
              </select>
            </div>

            {/* Live Search Input */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by test/package name, salt, or code (e.g. HbA1c, CBC, Lipid)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-cyan-200 rounded-2xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
              {searching && (
                <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin text-cyan-600" />
              )}
            </div>

            {/* Test Results List */}
            {activeTab === 'tests' && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {testsList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No tests found matching search.</p>
                ) : (
                  testsList.map((test) => {
                    const isAdded = selectedItems.some((i) => i.testId === test._id);
                    return (
                      <div
                        key={test._id}
                        onClick={() => !isAdded && handleAddTest(test)}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition cursor-pointer ${
                          isAdded
                            ? 'bg-cyan-50/70 border-cyan-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="text-slate-900 font-bold">{test.name}</strong>
                            {test.inClinicLab ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Clinic Lab
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">
                                Master DB
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Category: {test.category} • Sample: {test.sampleType || 'Blood'} • Turnaround: {test.reportTime || '24 hrs'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-slate-900">₹{test.price || test.mrp || 0}</span>
                          <button
                            type="button"
                            disabled={isAdded}
                            className={`p-1.5 rounded-xl transition ${
                              isAdded ? 'bg-slate-200 text-slate-400' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                            }`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* Packages Results List */}
            {activeTab === 'packages' && (
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {packagesList.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-4">No packages found matching search.</p>
                ) : (
                  packagesList.map((pkg) => {
                    const isAdded = selectedItems.some((i) => i.packageId === pkg._id);
                    return (
                      <div
                        key={pkg._id}
                        onClick={() => !isAdded && handleAddPackage(pkg)}
                        className={`p-2.5 rounded-2xl border flex items-center justify-between text-xs transition cursor-pointer ${
                          isAdded
                            ? 'bg-cyan-50/70 border-cyan-200 opacity-60 cursor-not-allowed'
                            : 'bg-white border-slate-200 hover:border-cyan-300 hover:shadow-2xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <Package size={13} className="text-cyan-600" />
                            <strong className="text-slate-900 font-bold">{pkg.name}</strong>
                            {pkg.inClinicLab ? (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Clinic Lab
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-500">
                                Master DB
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block mt-0.5">
                            Includes {pkg.totalTestsIncluded || 0} Tests • Fasting: {pkg.isFastingRequired ? 'Yes' : 'No'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-slate-900">₹{pkg.price || pkg.mrp || 0}</span>
                          <button
                            type="button"
                            disabled={isAdded}
                            className={`p-1.5 rounded-xl transition ${
                              isAdded ? 'bg-slate-200 text-slate-400' : 'bg-cyan-600 text-white hover:bg-cyan-700'
                            }`}
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Section 2: Manual Custom Test Entry */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
              Or Prescribe a Manual / Special Test
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
              <input
                type="text"
                placeholder="Custom test name (e.g. Vitamin D Total, 24hr Urinary Protein)..."
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="sm:col-span-5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="number"
                placeholder="Est. Price (₹)"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="sm:col-span-2 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-mono"
              />
              <input
                type="text"
                placeholder="Instructions (e.g. 12hr fasting)..."
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                className="sm:col-span-3 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomTest}
                className="sm:col-span-2 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Custom</span>
              </button>
            </div>
          </div>

          {/* Section 3: Selected Prescribed Items List */}
          <div className="space-y-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600 block">
              Tests Prescribed for Requisition ({selectedItems.length})
            </span>

            {selectedItems.length === 0 ? (
              <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-xs text-slate-400">
                No lab tests selected yet. Add tests from above to refer to Clinic Lab.
              </div>
            ) : (
              <div className="space-y-2">
                {selectedItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-white rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center text-xs shadow-2xs"
                  >
                    <div className="sm:col-span-5">
                      <strong className="text-slate-900 block truncate font-bold">{item.name}</strong>
                      <span className="text-[10px] text-cyan-700 font-bold uppercase">
                        {item.itemType} • {item.category}
                      </span>
                    </div>

                    <div className="sm:col-span-2 font-mono font-bold text-slate-800">
                      ₹{item.price || 0}
                    </div>

                    <div className="sm:col-span-4">
                      <input
                        type="text"
                        placeholder="Test specific instructions..."
                        value={item.instructions}
                        onChange={(e) => handleUpdateItemInstructions(idx, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-1 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Referral Priority & Instructions for Clinic Lab */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Order Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Notes for Clinic Lab Technician / Patient Prep
              </label>
              <input
                type="text"
                placeholder="e.g. Patient needs fasting sample collection tomorrow morning..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedItems.length === 0}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl transition shadow-md shadow-cyan-600/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              <span>Send Requisition to Clinic Lab</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}