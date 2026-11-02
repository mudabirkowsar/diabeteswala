"use client";
import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Search,
    Loader2,
    PackagePlus,
    Check,
    Sparkles,
    TestTube2,
    Layers,
    Filter
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import LabVendorAPI from '../../../../../services/LabVendorAPI';

export default function CreateCustomPackageModal({ isOpen, onClose, onSuccess }) {
    // 1-7. State Hooks
    const [actionLoading, setActionLoading] = useState(false);
    const [availableTests, setAvailableTests] = useState([]);
    const [testsLoading, setTestsLoading] = useState(false);
    const [testSearchQuery, setTestSearchQuery] = useState("");
    const [testCategoryFilter, setTestCategoryFilter] = useState("All");
    const [photoFile, setPhotoFile] = useState(null);
    const [formData, setFormData] = useState({
        packageName: '',
        mainCategory: '',
        category: '',
        mrp: '',
        discountPercent: 0,
        reportTime: '12 Hours',
        gender: 'Both',
        ageGroup: 'All',
        isFastingRequired: false,
        fastingDuration: '10-12 Hours',
        precaution: '',
        description: '',
        tests: []
    });

    // 8. Effect: Fetch Master Tests on Modal Open
    useEffect(() => {
        if (!isOpen) return;

        const loadTests = async () => {
            setTestsLoading(true);
            try {
                const response = await LabVendorAPI.getMasterTests();
                if (response && response.success) {
                    setAvailableTests(response.data || []);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load platform master tests.");
            } finally {
                setTestsLoading(false);
            }
        };

        loadTests();
    }, [isOpen]);

    // 9. Memo: Dynamically Extract Unique Main Categories from Fetched Tests
    const dynamicTestCategories = useMemo(() => {
        if (!availableTests || availableTests.length === 0) return [];
        return Array.from(
            new Set(
                availableTests
                    .map((t) => t.mainCategory?.trim())
                    .filter((cat) => Boolean(cat))
            )
        );
    }, [availableTests]);

    // 10. Effect: Auto-select First Category when loaded
    useEffect(() => {
        if (dynamicTestCategories.length > 0 && !formData.mainCategory) {
            setFormData((prev) => ({ ...prev, mainCategory: dynamicTestCategories[0] }));
        }
    }, [dynamicTestCategories, formData.mainCategory]);

    // 11. Effect: Reset state when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                packageName: '',
                mainCategory: '',
                category: '',
                mrp: '',
                discountPercent: 0,
                reportTime: '12 Hours',
                gender: 'Both',
                ageGroup: 'All',
                isFastingRequired: false,
                fastingDuration: '10-12 Hours',
                precaution: '',
                description: '',
                tests: []
            });
            setPhotoFile(null);
            setTestSearchQuery("");
            setTestCategoryFilter("All");
        }
    }, [isOpen]);

    // 12. Memo: Filter master tests by search query & selected dynamic category
    // (MOVED ABOVE `if (!isOpen) return null;` TO GUARANTEE CONSTANT HOOK ORDER)
    const filteredAvailableTests = useMemo(() => {
        return availableTests.filter((t) => {
            const matchesCategory =
                testCategoryFilter === "All" ||
                t.mainCategory?.trim().toLowerCase() === testCategoryFilter.trim().toLowerCase();

            const q = testSearchQuery.toLowerCase().trim();
            const matchesQuery =
                !q ||
                t.testName?.toLowerCase().includes(q) ||
                t.sampleType?.toLowerCase().includes(q) ||
                t.testCode?.toLowerCase().includes(q);

            return matchesCategory && matchesQuery;
        });
    }, [availableTests, testCategoryFilter, testSearchQuery]);

    // -------------------------------------------------------------
    // EARLY RETURN IS NOW SAFELY AFTER ALL HOOKS
    // -------------------------------------------------------------
    if (!isOpen) return null;

    // Toggle test selection
    const handleToggleTest = (testId) => {
        setFormData((prev) => {
            const exists = prev.tests.includes(testId);
            return {
                ...prev,
                tests: exists ? prev.tests.filter((id) => id !== testId) : [...prev.tests, testId]
            };
        });
    };

    // Calculate benchmark sum of selected tests
    const selectedTestsData = availableTests.filter((t) => formData.tests.includes(t._id));
    const benchmarkMRP = selectedTestsData.reduce((acc, t) => acc + Number(t.standardMRP || 0), 0);

    // Live calculated offerPrice & totalSavings
    const numMRP = Number(formData.mrp) || 0;
    const numDiscount = Number(formData.discountPercent) || 0;
    const finalPayable = Math.max(0, Math.round(numMRP - (numMRP * (numDiscount / 100))));
    const totalSavings = numMRP > finalPayable ? numMRP - finalPayable : 0;

    // Handle Form Submit
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!formData.packageName.trim()) {
            toast.error("Package name is required.");
            return;
        }

        if (formData.tests.length === 0) {
            toast.error("Please select at least 1 test to bundle inside this package.");
            return;
        }

        if (!numMRP || numMRP <= 0) {
            toast.error("Please enter a valid package MRP.");
            return;
        }

        if (numDiscount < 0 || numDiscount > 100) {
            toast.error("Discount percentage must be between 0% and 100%.");
            return;
        }

        setActionLoading(true);
        try {
            let payload;

            if (photoFile) {
                payload = new FormData();
                payload.append('packageName', formData.packageName.trim());
                payload.append('mainCategory', formData.mainCategory.trim());
                payload.append('category', formData.category.trim());
                payload.append('mrp', String(numMRP));
                payload.append('discountPercent', String(numDiscount));
                payload.append('reportTime', formData.reportTime);
                payload.append('isFastingRequired', String(formData.isFastingRequired));
                if (formData.isFastingRequired) {
                    payload.append('fastingDuration', formData.fastingDuration);
                }
                payload.append('gender', formData.gender);
                payload.append('ageGroup', formData.ageGroup);
                payload.append('precaution', formData.precaution);
                payload.append('description', formData.description);
                formData.tests.forEach((tId) => payload.append('tests[]', tId));
                payload.append('photos', photoFile);
            } else {
                payload = {
                    packageName: formData.packageName.trim(),
                    mainCategory: formData.mainCategory.trim(),
                    category: formData.category.trim(),
                    mrp: numMRP,
                    discountPercent: numDiscount,
                    reportTime: formData.reportTime,
                    isFastingRequired: Boolean(formData.isFastingRequired),
                    fastingDuration: formData.isFastingRequired ? formData.fastingDuration : undefined,
                    gender: formData.gender,
                    ageGroup: formData.ageGroup,
                    precaution: formData.precaution,
                    description: formData.description,
                    tests: formData.tests
                };
            }

            const response = await LabVendorAPI.saveLabPackage(payload);
            if (response && response.success) {
                toast.success(response.message || "Custom package created successfully!");
                onSuccess();
            } else {
                toast.error(response?.message || "Failed to create package.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "An error occurred while saving the package.");
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

            <div className="bg-white rounded-[2.5rem] max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative z-10 border border-slate-100 max-h-[88vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Diagnostic Suite Builder</span>
                        <h2 className="text-xl font-black text-slate-800 tracking-tight">Create Custom Health Package</h2>
                    </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-5 text-left">
                    
                    {/* Package Title & Category Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package Title *</label>
                            <input
                                type="text"
                                required
                                value={formData.packageName}
                                onChange={(e) => setFormData({ ...formData, packageName: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                placeholder="e.g. Diabetic Kidney & Gut Health Combo"
                            />
                        </div>

                        {/* MAPPED DYNAMIC MAIN CATEGORY DROPDOWN */}
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Main Category *</label>
                            <div className="relative">
                                <select
                                    required
                                    value={formData.mainCategory}
                                    onChange={(e) => setFormData({ ...formData, mainCategory: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer appearance-none"
                                >
                                    {dynamicTestCategories.length > 0 ? (
                                        dynamicTestCategories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No categories available</option>
                                    )}
                                </select>
                                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Subcategory / Health Concern</label>
                        <input
                            type="text"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                            placeholder="e.g. Diabetic Screening, Full Body, Preventive"
                        />
                    </div>

                    {/* --- MULTI-SELECT TEST PICKER WITH DYNAMIC CATEGORY FILTER --- */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-1.5">
                                <Sparkles size={12} className="text-[#3d3f96]" /> Select Tests to Bundle ({formData.tests.length} Selected) *
                            </label>
                            {benchmarkMRP > 0 && (
                                <span className="text-[10px] font-bold text-slate-500">
                                    Sum of Tests MRP: <strong className="text-slate-800">₹ {benchmarkMRP}</strong>
                                </span>
                            )}
                        </div>

                        {/* Search & Dynamic Category Filter Row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                <input
                                    type="text"
                                    placeholder="Filter by test name or specimen..."
                                    value={testSearchQuery}
                                    onChange={(e) => setTestSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                />
                            </div>

                            {/* Dynamic Category Filter for Master Tests */}
                            <div className="relative">
                                <select
                                    value={testCategoryFilter}
                                    onChange={(e) => setTestCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96] cursor-pointer appearance-none"
                                >
                                    <option value="All">All Categories</option>
                                    {dynamicTestCategories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[10px]">
                                    ▼
                                </div>
                            </div>
                        </div>

                        {/* Test Selection Checkbox Box */}
                        <div className="max-h-48 overflow-y-auto border border-slate-100 rounded-2xl p-2 bg-slate-50/50 space-y-1.5 [&::-webkit-scrollbar]:hidden">
                            {testsLoading ? (
                                <div className="py-6 text-center text-xs text-slate-400 font-bold flex items-center justify-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-[#3d3f96]" /> Loading Master Test Directory...
                                </div>
                            ) : filteredAvailableTests.length > 0 ? (
                                filteredAvailableTests.map((test) => {
                                    const isSelected = formData.tests.includes(test._id);
                                    return (
                                        <div
                                            key={test._id}
                                            onClick={() => handleToggleTest(test._id)}
                                            className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
                                                isSelected
                                                    ? 'bg-indigo-50/80 border-[#3d3f96]/30 text-[#3d3f96]'
                                                    : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-4 h-4 rounded flex items-center justify-center border text-white transition-all ${isSelected ? 'bg-[#3d3f96] border-[#3d3f96]' : 'border-slate-300 bg-white'}`}>
                                                    {isSelected && <Check size={12} />}
                                                </div>
                                                <span className="text-xs font-bold">{test.testName}</span>
                                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-bold">
                                                    {test.sampleType || "Blood"}
                                                </span>
                                            </div>
                                            <span className="text-xs font-black text-slate-600">
                                                ₹ {test.standardMRP || 0}
                                            </span>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-4">No master tests match this category filter.</p>
                            )}
                        </div>
                    </div>

                    {/* --- PRICING & OFFER CALCULATOR --- */}
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                        <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                            Pricing & Patient Offer Calculator
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package MRP (₹) *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.mrp}
                                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                    placeholder="900"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Discount (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.discountPercent}
                                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                    placeholder="20"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Calculated Offer Price</label>
                                <div className="w-full px-3 py-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl text-xs font-black text-[#3d3f96] flex items-center justify-between">
                                    <span>₹ {finalPayable}</span>
                                    {totalSavings > 0 && (
                                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
                                            Save ₹{totalSavings}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Operational Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Report Turnaround Time</label>
                            <input
                                type="text"
                                value={formData.reportTime}
                                onChange={(e) => setFormData({ ...formData, reportTime: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                                placeholder="12 Hours"
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

                    {/* Fasting Flags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="fastingRequiredCheck"
                                checked={formData.isFastingRequired}
                                onChange={(e) => setFormData({ ...formData, isFastingRequired: e.target.checked })}
                                className="w-4 h-4 rounded text-[#3d3f96] cursor-pointer"
                            />
                            <label htmlFor="fastingRequiredCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
                                Overnight Fasting Required
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

                    {/* Patient Precaution */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Preparation Instructions</label>
                        <input
                            type="text"
                            value={formData.precaution}
                            onChange={(e) => setFormData({ ...formData, precaution: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-[#3d3f96]"
                            placeholder="e.g. First morning urine and fresh stool sample required in sterile containers."
                        />
                    </div>

                    {/* Detailed Clinical Description */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package Clinical Summary</label>
                        <textarea
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-700 outline-none focus:border-[#3d3f96] resize-none"
                            placeholder="Comprehensive early diabetic nephropathy and GI bleeding evaluation package..."
                        />
                    </div>

                    {/* Optional Image */}
                    <div className="space-y-1">
                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Package Showcase Banner (Optional)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setPhotoFile(e.target.files[0]);
                                }
                            }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                        />
                    </div>

                    {/* Submit Actions */}
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
                            {actionLoading ? (
                                <Loader2 size={12} className="animate-spin" />
                            ) : (
                                <span>Save & Publish Package</span>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}