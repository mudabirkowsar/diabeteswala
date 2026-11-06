"use client";
import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Loader2,
  Check,
  Search,
  Sparkles
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import AdminAPI from '../../../../../services/AdminAPI';

export default function EditMasterPackageModal({ isOpen, pkgData, onClose, onSuccess }) {
  const [actionLoading, setActionLoading] = useState(false);
  const [availableTests, setAvailableTests] = useState([]);
  const [testSearchQuery, setTestSearchQuery] = useState("");

  const [formValues, setFormValues] = useState({
    packageName: '',
    mainCategory: '',
    category: '',
    standardMRP: '',
    reportTime: '24 Hours',
    gender: 'Both',
    ageGroup: 'All',
    isFastingRequired: false,
    fastingDuration: '10-12 Hours',
    tests: []
  });

  // Fetch tests for selection
  useEffect(() => {
    if (!isOpen) return;

    const loadMasterTests = async () => {
      try {
        const fetcher = AdminAPI.getMasterTests || AdminAPI.adminGetMasterTests;
        if (typeof fetcher === 'function') {
          const res = await fetcher();
          if (res && res.success) {
            setAvailableTests(res.data || []);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    loadMasterTests();
  }, [isOpen]);

  // Pre-fill fields from pkgData
  useEffect(() => {
    if (!isOpen || !pkgData) return;

    const initialTestIds = Array.isArray(pkgData.tests)
      ? pkgData.tests.map((t) => (typeof t === 'object' && t !== null ? t._id : t))
      : [];

    setFormValues({
      packageName: pkgData.packageName || '',
      mainCategory: pkgData.mainCategory || 'Pathology',
      category: pkgData.category || '',
      standardMRP: pkgData.standardMRP !== undefined ? pkgData.standardMRP : '',
      reportTime: pkgData.reportTime || '24 Hours',
      gender: pkgData.gender || 'Both',
      ageGroup: pkgData.ageGroup || 'All',
      isFastingRequired: Boolean(pkgData.isFastingRequired),
      fastingDuration: pkgData.fastingDuration || '10-12 Hours',
      tests: initialTestIds
    });
  }, [isOpen, pkgData]);

  if (!isOpen || !pkgData) return null;

  const handleToggleTest = (testId) => {
    setFormValues((prev) => {
      const exists = prev.tests.includes(testId);
      return {
        ...prev,
        tests: exists ? prev.tests.filter((id) => id !== testId) : [...prev.tests, testId]
      };
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    if (!formValues.packageName.trim()) {
      toast.error("Package name is required.");
      return;
    }
    if (formValues.tests.length === 0) {
      toast.error("Package must include at least 1 test.");
      return;
    }
    if (!formValues.standardMRP || Number(formValues.standardMRP) <= 0) {
      toast.error("Please enter a valid Standard MRP.");
      return;
    }

    setActionLoading(true);
    try {
      const payload = {
        packageName: formValues.packageName.trim(),
        mainCategory: formValues.mainCategory.trim(),
        category: formValues.category.trim(),
        standardMRP: Number(formValues.standardMRP),
        reportTime: formValues.reportTime,
        gender: formValues.gender,
        ageGroup: formValues.ageGroup,
        isFastingRequired: Boolean(formValues.isFastingRequired),
        fastingDuration: formValues.isFastingRequired ? formValues.fastingDuration : undefined,
        tests: formValues.tests
      };

      const response = await AdminAPI.adminEditMasterPackage(pkgData._id, payload);
      if (response && response.success) {
        toast.success(response.message || "Master package updated successfully!");
        onSuccess();
      } else {
        toast.error(response?.message || "Failed to update package.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "An error occurred while updating the package.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTests = availableTests.filter((t) => {
    if (!testSearchQuery.trim()) return true;
    const q = testSearchQuery.toLowerCase();
    return t.testName?.toLowerCase().includes(q) || t.sampleType?.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="bg-white rounded-[2.5rem] max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[88vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-full transition-all cursor-pointer"
        >
          <X size={18} />
        </button>

        <h2 className="text-xl font-black text-slate-800 tracking-tight mb-6 flex items-center gap-2">
          <Edit3 className="text-[#3d3f96]" size={20} /> Edit Master Health Package
        </h2>

        <form onSubmit={handleUpdateSubmit} className="space-y-4 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package Name *</label>
              <input
                type="text"
                required
                value={formValues.packageName}
                onChange={(e) => setFormValues({ ...formValues, packageName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Standard MRP (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={formValues.standardMRP}
                onChange={(e) => setFormValues({ ...formValues, standardMRP: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Category</label>
              <input
                type="text"
                value={formValues.mainCategory}
                onChange={(e) => setFormValues({ ...formValues, mainCategory: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Subcategory</label>
              <input
                type="text"
                value={formValues.category}
                onChange={(e) => setFormValues({ ...formValues, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
              />
            </div>
          </div>

          {/* Test Selector */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
              <Sparkles size={12} className="text-[#3d3f96]" /> Bundled Diagnostic Tests ({formValues.tests.length} Selected)
            </label>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search tests to include/exclude..."
                value={testSearchQuery}
                onChange={(e) => setTestSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
              />
            </div>

            <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-2xl p-2 bg-slate-50/50 space-y-1.5 [&::-webkit-scrollbar]:hidden">
              {filteredTests.map((test) => {
                const isSelected = formValues.tests.includes(test._id);
                return (
                  <div
                    key={test._id}
                    onClick={() => handleToggleTest(test._id)}
                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer text-xs font-bold border transition-all ${
                      isSelected ? 'bg-indigo-50/80 border-[#3d3f96]/30 text-[#3d3f96]' : 'bg-white border-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-white ${isSelected ? 'bg-[#3d3f96] border-[#3d3f96]' : 'border-slate-300'}`}>
                        {isSelected && <Check size={10} />}
                      </div>
                      <span>{test.testName}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">₹{test.standardMRP || 0}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Report TAT</label>
              <input
                type="text"
                value={formValues.reportTime}
                onChange={(e) => setFormValues({ ...formValues, reportTime: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="editAdminFasting"
                checked={formValues.isFastingRequired}
                onChange={(e) => setFormValues({ ...formValues, isFastingRequired: e.target.checked })}
                className="w-4 h-4 rounded text-[#3d3f96] cursor-pointer"
              />
              <label htmlFor="editAdminFasting" className="text-xs font-bold text-slate-700 cursor-pointer">
                Fasting Required
              </label>
            </div>
          </div>

          {/* Action buttons */}
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
              {actionLoading ? <Loader2 size={12} className="animate-spin" /> : <span>Save Updates</span>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}